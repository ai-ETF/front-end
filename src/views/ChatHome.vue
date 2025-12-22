<!-- 注释：这是一个 Vue 单文件组件，用于聊天主页 -->
<template>
  <!-- 页面根容器 -->
  <div class="page">
    <!-- 页面顶部标题 -->
    <h1 class="page-title">需要什么帮助吗？</h1>

    <!-- 聊天输入组件，带前后图标插槽 -->
    <ChatInput ref="chatInputRef" @send="onSend">
      <!-- 左边插槽 -->
      <template #prefix>
        <PlusLogo />
      </template>

      <!-- 右边插槽 -->
      <template #suffix>
        <img :src="sentSvg" alt="发送按钮" @click="handleSendClick"/>
      </template>
    </ChatInput>
  </div>
</template>

<script setup lang="ts">
/* 导入 Vue 的 ref、onMounted、computed 等 API */
import { ref, onMounted, onUnmounted, computed } from 'vue'
/* 导入 Vue Router 的 useRouter 和 useRoute 用于路由管理 */
import { useRouter, useRoute } from 'vue-router'
/* 导入聊天状态管理 store */
import { useChatStore } from '@/stores/chat'
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
  if (chatInputRef.value && chatInputRef.value.message.trim()) {
    /* 调用发送消息函数 */
    onSend(chatInputRef.value.message)
    /* 清空输入框内容 */
    chatInputRef.value.message = ''
  }
}

// 当前 chat id（如果有）
/* 计算属性：获取当前聊天 ID */
const chatId = computed(() => route.params.id as string | undefined)

// 发送消息：如果没有 chatId 则创建新聊天并跳转；如果已有 chatId 则添加消息
/* 发送消息处理函数 */
const onSend = async (msg: string) => {
  // 调试：函数被调用，打印原始输入和当前 chatId
  console.log('[ChatHome] onSend called, msg:', msg, 'chatId:', chatId.value)

  /* 检查消息是否为空或仅包含空白字符 */
  if (!msg || !msg.trim()) {
    // 可能误触了
    console.log('[ChatHome] empty or whitespace-only message, ignoring.')
    return // 如果消息为空或仅包含空白字符则直接返回
  }

  /* 检查用户是否已认证（已登录） */
  if (!isAuthenticated.value) {
    // 用户未登录，跳转到登录页面
    console.log('[ChatHome] user not authenticated, redirecting to login')
    router.push('/login')
    return
  }else{
    console.log('[ChatHome] user is authenticated')
  }

  /* 去除消息首尾空白字符 */
  const text = msg.trim() // 去除首尾空白并保存为 text
  console.log('[ChatHome] trimmed text:', text)

  /* 检查当前是否没有选中的聊天（需要新建会话） */
  if (!chatId.value) { // 如果当前没有选中的聊天（需要新建会话）
    /* 使用 useChatMessages 创建新聊天会话 */
    const newChat = await createChat(text)
    
    if (newChat) {
      console.log('[ChatHome] created new chat with id:', newChat.id)
      
      // 同时在本地 store 中创建聊天记录
      chatStore.addChat({
        id: newChat.id,
        title: text,
        messages: [{ id: Date.now().toString(), text, createdAt: Date.now(), isuser: true }]
      })
      
      // 发送用户消息到 Supabase
      await sendMessage(newChat.id, text, 'user')
      
      // 跳转到新会话
      try {
        console.log('[ChatHome] navigating to /chat/' + newChat.id)
        console.log(`[ChatHome] isAuthenticated: ${isAuthenticated.value}`)
        
      // 检查用户是否已登录 
        await router.push(`/chat/${newChat.id}`) // 跳转到新创建的聊天路由
        console.log('[ChatHome] navigation success to /chat/' + newChat.id)
      } catch (err) {
        console.error('[ChatHome] navigation failed:', err)
      }

      // 模拟 AI 回复（实际应用中这里会调用 AI 服务）
      setTimeout(async () => { // 延迟执行以模拟异步回复
        console.log('[ChatHome] adding simulated reply to new chat:', newChat.id)
        const reply:string = `[ChatHome]收到：${msg}（这是模拟回复）`
        // 向 Supabase 发送 AI 回复
        await sendMessage(newChat.id,reply , 'assistant')
        // 同时在本地 store 中添加回复
        chatStore.addMessage(newChat.id, reply, false)
      }, 800) // 延迟 800 毫秒
    } else {
      console.error('[ChatHome] failed to create new chat')
    }
  } else {

    console.log('[ChatHome] chatId exists, adding message to existing chat:', chatId.value)
    // 已在聊天中，直接添加消息
    // console.log('[ChatHome] adding message to existing chat:', chatId.value)
    
    // // 将消息发送到 Supabase
    // const chatIdNum = parseInt(chatId.value)
    // await sendMessage(chatIdNum, text, 'user')
    
    // // 同时在本地 store 中添加消息
    // chatStore.addMessage(chatId.value, text, true)

    // // 模拟 AI 回复（实际应用中这里会调用 AI 服务）
    // setTimeout(async () => { // 延迟执行以模拟异步回复
    //   console.log('[ChatHome] adding simulated reply to existing chat:', chatId.value)
    //   // 向 Supabase 发送 AI 回复
    //   await sendMessage(chatIdNum, `收到：${text}（这是模拟回复）`, 'assistant')
    //   // 同时在本地 store 中添加回复
    //   chatStore.addMessage(chatId.value!, `收到：${text}（这是模拟回复）`, false)
    // }, 800) // 延迟 800 毫秒
  }
}

/* 组件挂载时的生命周期钩子 */
onMounted(() => {
  console.log('[ChatHome] component mounted')
})

// 组件卸载时清理定时器
onUnmounted(() => {})

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
</style>