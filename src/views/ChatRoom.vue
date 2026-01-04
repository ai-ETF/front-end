<template>
  <div class="page">
    <!-- 消息显示区域 -->
    <MessagesContainer :messages="messages" />

    <!-- 聊天输入组件，带前后图标插槽 -->
    <ChatInput ref="chatInputRef" @send="onSend" :disabled="isWaitingForAI">
      <!-- 左边插槽 -->
      <template #prefix>
        <PlusLogo />
      </template>

      <!-- 右边插槽 -->
      <template #suffix>
        <img 
          :src="sentSvg" 
          alt="发送按钮" 
          @click="handleSendClick"
          :class="{ disabled: isWaitingForAI }"
        />
      </template>
    </ChatInput>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch,onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore, type ChatMessage, type ChatItem } from '@/stores/chat'
import ChatInput from '@/components/ChatInput/ChatInput.vue'
import MessagesContainer from '@/components/Message/MessagesContainer.vue'
import PlusLogo from '@/components/PlusLogo/PlusLogo.vue'
import sentSvg from '@/assets/svg/send.svg'
import { useChatMessages } from '@/composables/useChatMessages'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { syncChatDetailsToLocal, syncMessageToRemote } from '@/utils/chatSync'
import { streamFromAIEdge } from '@/services/aiService'

// 控制是否正在等待AI响应
const isWaitingForAI = ref(false)

// 用于取消正在进行的AI请求
const abortController = ref<AbortController | null>(null)

const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)
const { fetchMessages, sendMessage } = useChatMessages()
const { isAuthenticated } = useSupabaseAuth()

// local fallback messages when no chat selected
const localMessages = ref([
  { 
    id: '1',
    text: `您好！我是AI助手，有什么可以帮助您的吗？
    
支持的格式包括：
1. **加粗文本**
2. *斜体文本*
3. \`行内代码\`
4. 代码块:
\`\`\`javascript
console.log('Hello, World!');
\`\`\`
5. [链接](https://example.com)
6. 列表项
`,
    isUser: false, 
    timestamp: new Date()
  }
])

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()

// 当前 chat id（如果有），统一转换为数字类型
const chatId = computed((): number | undefined => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id.length > 0 ? Number(id[0]) : undefined
  }
  return id ? Number(id) : undefined
})

// 当前显示的消息：如果选中聊天则显示 store 中的消息，否则显示本地默认信息
const messages = computed(() => {
  if (chatId.value) {
    const c = chatStore.getChat(chatId.value)
    return c ? c.messages.map((m: ChatMessage) => ({
      id: m.id,
      text: m.text,
      isUser: m.isuser,  // 直接使用m.isuser，因为现在是必需字段
      timestamp: m.timestamp  // 直接使用timestamp，因为现在是必需字段
    })) : []
  }
  return localMessages.value
})
     
// 加载聊天历史消息
const loadChatHistory = async () => {
  if (chatId.value && isAuthenticated.value) {
    // 确保聊天在 store 中存在
    let chat = chatStore.getChat(chatId.value)
    
    // 如果聊天不存在于 store 中，则初始化一个
    if (!chat) {
      // 先尝试从服务器获取聊天信息
      try {
        const { fetchChats } = useChatMessages()
        const remoteChats = await fetchChats()
        const remoteChat = remoteChats.find(c => c.id === chatId.value)
        
        if (remoteChat) {
          // 使用从服务器获取的信息初始化本地聊天对象
          const newChat: ChatItem = { id: remoteChat.id, title: remoteChat.title as string, messages: [] }
          chatStore.addChat(newChat)
          chat = chatStore.getChat(remoteChat.id)
          console.log(`[ChatRoom] 成功初始化聊天 ${chatId.value} 到本地 store`)
        } else {
          // TODO：应该要抛出一个错误提示
          console.warn(`[ChatRoom] 服务器上找不到聊天 ${chatId.value},请检查聊天ID是否正确`)
        }
      } catch (error) {
        console.error('[ChatRoom] 获取聊天信息失败:', error)
        // 出错时仍然创建一个默认聊天
        const newChat: ChatItem = { id: chatId.value, title: '错误聊天', messages: [] }
        chatStore.addChat(newChat)
        chat = chatStore.getChat(chatId.value)
      }
    }

    // 如果聊天存在并且消息数组为空，则从服务器加载消息
    if (chat && chat.messages.length === 0) {
      try {
        // 使用同步函数加载消息到本地 store
        await syncChatDetailsToLocal(chatId.value, fetchMessages)
        console.log(`[ChatRoom] 聊天 ${chatId.value} 的历史消息已加载到本地 store。`)
      } catch (error) {
        console.error('[ChatRoom] 加载聊天历史失败:', error)
      }
    } else if (chat && chat.messages.length > 0) {
      console.log(`[ChatRoom] 聊天 ${chatId.value} 已有本地消息，无需加载。`)
    }
  }
}

// 手动刷新聊天历史
const refreshChatHistory = async () => {
  if (chatId.value) {
    // 清空当前聊天消息
    const chat = chatStore.getChat(chatId.value)
    if (chat) {
      chat.messages = []
    }
    // 重新加载
    await loadChatHistory()
  }
}

// 监听聊天ID和认证状态变化，加载对应的历史消息
watch([chatId, isAuthenticated], ([newChatId, newIsAuth]) => {
  if (newChatId && newIsAuth) {
    loadChatHistory()
  }
}, { immediate: true })

// 发送消息：如果没有 chatId 则创建新聊天并跳转；如果已有 chatId 则添加消息
const onSend = async (msg: string) => {
  // 调试：函数被调用，打印原始输入和当前 chatId
  console.log('[ChatRoom] onSend called, msg:', msg, 'chatId:', chatId.value)

  if (!msg || !msg.trim()) {
    // 可能误触了
    console.log('[ChatRoom] empty or whitespace-only message, ignoring.')
    return // 如果消息为空或仅包含空白字符则直接返回
  }

  const text = msg.trim() // 去除首尾空白并保存为 text
  console.log('[ChatRoom] trimmed text:', text)

  if (!chatId.value) { // 如果当前没有选中的聊天（需要新建会话）
    // 使用时间戳作为新会话 id（数字类型）
    const id = Date.now();
    console.log('[ChatRoom] creating new chat with id:', id)

    // 检查用户认证状态
    if (!isAuthenticated.value) {
      console.log('[ChatRoom] 检测到未认证用户，跳转到登录页面');
      router.push('/login');
      return;
    }

    // 创建聊天并把用户消息作为首条消息
    const userMessageId = `user-${Date.now()}`;
    chatStore.addChat({
      id,
      title: text.length > 20 ? text.substring(0, 20) + '...' : text,
      messages: [{ 
        id: userMessageId, 
        text, 
        createdAt: Date.now(), 
        isuser: true,
        timestamp: new Date()  // 添加必需的timestamp属性
      }]
    })
    console.log('[ChatRoom] added new chat to store:', id)

    // 跳转到新会话
    try {
      console.log('[ChatRoom] navigating to /chat/' + id)
      await router.push(`/chat/${id}`) // 跳转到新创建的聊天路由
      console.log('[ChatRoom] navigation success to /chat/' + id)
    } catch (err) {
      console.error('[ChatRoom] navigation failed:', err)
    }

    // 发送用户消息并获取AI回复
    if (id) {
      // 同步用户消息到云端
      await syncMessageToRemote(
        id,
        text,
        'user',
        sendMessage
      );
      await sendToAIAndReceiveResponse(id, text);
    }
  } else {
    // 检查用户认证状态
    if (!isAuthenticated.value) {
      console.log('[ChatRoom] 检测到未认证用户，跳转到登录页面');
      router.push('/login');
      return;
    }
    
    // 已在聊天中，直接添加消息
    console.log('[ChatRoom] adding message to existing chat:', chatId.value)
    
    // 本地只添加一次消息
    const userMessageId = `user-${Date.now()}`;
    chatStore.addMessage(chatId.value, {
      id: userMessageId,
      text,
      createdAt: Date.now(),
      isuser: true,
      timestamp: new Date()  // 添加必需的timestamp属性
    });
    
    // 同步用户消息到云端
    await syncMessageToRemote(
      chatId.value,
      text,
      'user',
      sendMessage
    );

    // 发送用户消息并获取AI回复
    if (chatId.value) {
      await sendToAIAndReceiveResponse(chatId.value, text);
    }
  }
}

// 发送消息给AI并接收回复
const sendToAIAndReceiveResponse = async (chatIdValue: number, userMessage: string) => {
  if (isWaitingForAI.value) {
    console.log('[ChatRoom] AI response already in progress, ignoring new request.');
    return;
  }

  isWaitingForAI.value = true;
  abortController.value = new AbortController();

  const aiMessageId = `assistant-${Date.now()}`;
  
  // ✅ 方法1：先添加空消息，然后逐块更新（确保响应式）
  const initialAiMessage: ChatMessage = {
    id: aiMessageId,
    text: '', // 开始时空的
    isuser: false,
    createdAt: Date.now(),
    timestamp: new Date()
  };

  // 添加空的AI消息到本地store
  chatStore.addMessage(chatIdValue, initialAiMessage);
  
  // ✅ 创建一个响应式变量来跟踪AI消息内容⭐没有创建一个响应式的变量来存储AI消息内容
  const aiMessageContent = ref('');
  
  // 使用watch来监听内容变化并更新store
  watch(aiMessageContent, (newContent) => {
    console.log('[ChatRoom] AI内容更新:', newContent.length, '字符');
    
    // ✅ 使用store的更新方法
    chatStore.updateMessage(chatIdValue, aiMessageId, newContent);
    
    // ✅ 额外的保险：强制触发UI更新
    // 这可以通过修改一个无关的响应式变量来实现
    // 但更好的方式是确保store的更新是响应式的
  }, { immediate: true });

  try {
    console.log('[ChatRoom] Sending messages to AI');
    
    // 获取聊天消息
    const chat = chatStore.getChat(chatIdValue)
    if (!chat) {
      throw new Error('聊天不存在')
    }
    
    // 获取最后一条用户消息作为问题
    const lastUserMessage = chat.messages
      .filter(msg => msg.isuser)
      .slice(-1)[0];
    
    if (!lastUserMessage) {
      throw new Error('没有找到用户消息')
    }
    
    const result = await streamFromAIEdge(
      lastUserMessage.text,
      (chunk: string) => {
        // ✅ 直接更新响应式变量，watch会监听到并更新store
        aiMessageContent.value += chunk;
        
        // ✅ 同时也可以直接更新store（双重保障）
        // 但要注意：如果store更新不够快，这里可能会有延迟
        // 所以我们主要依赖watch
      },
      undefined, // doc_id 参数，暂时不使用
      abortController.value.signal
    );

    if (!result.success) {
      throw new Error(result.error || 'AI回复失败');
    }

    console.log(`[ChatRoom] AI response completed: ${aiMessageContent.value.length} characters`);
    
    // ✅ 确保最终内容同步到store
    if (aiMessageContent.value) {
      chatStore.updateMessage(chatIdValue, aiMessageId, aiMessageContent.value);
    }

    // 同步AI回复到云端
    await syncMessageToRemote(
      chatIdValue,
      aiMessageContent.value,
      'assistant',
      sendMessage
    );
    
  } catch (error) {
    console.error('AI回复错误:', error);
    
    // 出错时，设置错误消息
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const finalErrorMessage = `抱歉，AI回复时出现错误：${errorMessage}`;
    
    // 更新store中的消息
    chatStore.updateMessage(chatIdValue, aiMessageId, finalErrorMessage);
    
    // 如果已经同步了一部分内容，也同步错误信息
    if (aiMessageContent.value) {
      await syncMessageToRemote(
        chatIdValue,
        finalErrorMessage,
        'assistant',
        sendMessage
      );
    }
  } finally {
    isWaitingForAI.value = false;
    abortController.value = null;
  }
};
// 添加发送按钮点击处理函数
const handleSendClick = () => {
  if (chatInputRef.value && chatInputRef.value.message.trim() && !isWaitingForAI.value) {
    onSend(chatInputRef.value.message)
    chatInputRef.value.message = ''
  }
}

onMounted(async() => {
  // 组件挂载时加载聊天历史
  console.log('[ChatRoom] component mounted, loading chat history if needed.')
  await loadChatHistory()
  console.log('[ChatRoom] chat history load attempt finished.')
})

onUnmounted(() => {
  // 取消未完成的请求··
  if (abortController.value) {
    abortController.value.abort();
  }

  if (chatId.value) {
    const chat = chatStore.getChat(chatId.value)
    if (chat) {
      // 清空消息而不是设置为空数组，保持对象引用
      chat.messages.splice(0, chat.messages.length)
    }
  }
})
</script>

<style scoped>
/* ===== 全局盒模型 ===== */
* {
  box-sizing: border-box; /* 保证 padding 和 border 不影响元素宽高计算 */
  margin: 0;
  padding: 0;
}

/* ===== 页面整体容器 ===== */
.page {
  display: flex;               /* 使用 flex 布局 */
  flex-direction: column;      /* 垂直排列子元素（标题在上，输入框在下） */
  /* justify-content: flex-end;   子元素靠底部对齐，输入框贴底 */
  align-items: center;         /* 水平居中子元素 */
  height: calc(100vh - 64px);  /* 页面高度 = 视口高度 - 64px（如果有顶部导航栏留空） */
  padding: 16px;               /* 页面边距 */
  background-color: #ffffff;   /* 页面背景色，可自定义 */
  gap: 16px;                   /* 子元素间间距 */
  width:100%
}

/* ===== 页面标题 ===== */
.page-title {
  font-size: 30px;             /* 字体大小 */
  font-weight: 400;            /* 加粗 */
  text-align: center;          
  margin-top: 300px;
  color: #000;                 /* 字体颜色 */
  /* 标题和输入框间距 */
  /* margin-bottom: 8px; */
}

/* ===== ChatInput 容器宽度限制 ===== */
ChatInput {
  width: 100%;                 /* 占满页面宽度 */
  max-width: 6800px;            /* 最大宽度限制 */
}
</style>