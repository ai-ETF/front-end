<!-- 注释：这是一个 Vue 单文件组件，用于聊天主页 -->
<template>
  <!-- 页面根容器 -->
  <div class="page">
    <!-- 页面顶部标题 -->
    <h1 class="page-title">需要什么帮助吗？</h1>

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
/* 导入 Vue 的 ref、onMounted、computed 等 API */
import { ref, onMounted, onUnmounted, computed, watch, ref as Ref } from 'vue'
/* 导入 Vue Router 的 useRouter 和 useRoute 用于路由管理 */
import { useRouter, useRoute } from 'vue-router'
/* 导入聊天状态管理 store */
import { useChatStore, type ChatMessage } from '@/stores/chat'
/* 导入聊天输入组件 */
import ChatInput from '@/components/ChatInput/ChatInput.vue'
/* 导入加号 Logo 组件 */
import PlusLogo from '@/components/PlusLogo/PlusLogo.vue'
/* 导入发送按钮 SVG 图标 */
import sentSvg from '@/assets/svg/send.svg'
/* 导入 useChatMessages 组合式函数，用于与 Supabase 进行数据交互 */
import { useChatMessages } from '@/composables/useChatMessages'
/* 导入 useSupabaseAuth 组合式函数，用于检查用户认证状态 */
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { message } from 'ant-design-vue'
/* 导入流式AI服务和同步工具 */
import { streamFromAI } from '@/services/aiService'
import { syncMessageToRemote } from '@/utils/chatSync'

/* 控制是否正在等待AI响应 */
const isWaitingForAI = ref(false)

/* 用于取消正在进行的AI请求 */
const abortController = ref<AbortController | null>(null)

/* 创建对 ChatInput 组件实例的引用，用于直接访问组件内部属性和方法 */
const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)

/* 获取路由实例，用于编程式导航 */
const router = useRouter()
/* 获取当前路由信息 */
const route = useRoute()
/* 获取聊天状态管理实例 */
const chatStore = useChatStore()
/* 获取聊天消息管理实例，用于与 Supabase 交互 */
const { createChat, sendMessage } = useChatMessages()
/* 获取认证状态管理实例，用于检查用户是否已登录 */
const { isAuthenticated } = useSupabaseAuth()
/* 处理发送按钮点击事件 */
const handleSendClick = () => {
  /* 检查输入框引用是否存在且有内容 */
  if (chatInputRef.value && chatInputRef.value.message.trim() && !isWaitingForAI.value) {
    /* 调用发送消息函数 */
    onSend(chatInputRef.value.message)
    /* 清空输入框内容 */
    chatInputRef.value.message = ''
  }
}


// 当前 chat id（如果有），统一转换为数字类型
const chatId = computed((): number | undefined => {
  const id = route.params.id
  if (Array.isArray(id)) {
    return id.length > 0 ? Number(id[0]) : undefined
  }
  return id ? Number(id) : undefined
})

// 发送消息：如果没有 chatId 则创建新聊天并跳转；如果已有 chatId 则添加消息
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
    const newChat = await createChat(text)

    if(!newChat) {
      message.error('创建新聊天失败，请稍后重试。')
      console.error('[ChatRoom] Failed to create new chat.')
      return
    } 
    // 创建聊天并把用户消息作为首条消息
    const userMessageId = `user-${Date.now()}`;
    chatStore.addChat({
      id: newChat.id,
      title: text.length > 20 ? text.substring(0, 20) + '...' : text,
      messages: [{ 
        id: userMessageId, 
        text, 
        createdAt: Date.now(), 
        isuser: true,
        timestamp: new Date()  // 添加必需的timestamp属性
      }]
    })
    console.log('[ChatRoom] added new chat to store:', newChat.id)

    // 跳转到新会话
    try {
      console.log('[ChatRoom] navigating to /chat/' + newChat.id)
      await router.push(`/chat/${newChat.id}`) // 跳转到新创建的聊天路由
      console.log('[ChatRoom] navigation success to /chat/' + newChat.id)
    } catch (err) {
      console.error('[ChatRoom] navigation failed:', err)
    }

    // 发送用户消息并获取AI回复
    if (newChat.id) {
      // 同步用户消息到云端
      await syncMessageToRemote(
        newChat.id,
        text,
        'user',
        sendMessage
      );
      await sendToAIAndReceiveResponse(newChat.id, text);
    }
  } else {
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
    
    const result = await streamFromAI(
      chatStore.getChat(chatIdValue)?.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.createdAt)
      })) || [],
      (chunk: string) => {
        // ✅ 直接更新响应式变量，watch会监听到并更新store
        aiMessageContent.value += chunk;
        
        // ✅ 同时也可以直接更新store（双重保障）
        // 但要注意：如果store更新不够快，这里可能会有延迟
        // 所以我们主要依赖watch
      },
      abortController.value.signal,
      chatIdValue
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
/* 组件挂载时的生命周期钩子 */
onMounted(() => {
  console.log('[ChatHome] component mounted')
})

// 组件卸载时清理定时器
onUnmounted(() => {
  // 取消未完成的请求
  if (abortController.value) {
    abortController.value.abort();
  }

  if (chatId.value) {
    const chat = chatStore.getChat(Number(chatId.value))
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
.chat-input {
  width: 100%;                 /* 占满页面宽度 */
  max-width: 800px;            /* 增加最大宽度 */
  min-width: 500px;            /* 设置最小宽度 */
}

/* ===== 发送按钮禁用样式 ===== */
img.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>