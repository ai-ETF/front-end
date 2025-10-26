<template>
  <div class="page">
    <!-- 页面顶部标题 -->
    <h1 class="page-title">需要什么帮助吗？</h1>

  <!-- 消息显示区域 -->
  <MessagesContainer :messages="messages" />

    <!-- 聊天输入组件，带前后图标插槽 -->
    <ChatInput @send="onSend">
      <!-- 左边插槽 -->
      <template #prefix>
        <span>＋</span>
      </template>

      <!-- 右边插槽 -->
      <template #suffix>
        <img :src="sentSvg" alt="发送按钮" />
      </template>
    </ChatInput>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import ChatInput from '@/components/ChatInput/ChatInput.vue'
import MessagesContainer from '@/components/Message/MessagesContainer.vue'
import sentSvg from '@/assets/svg/send.svg'

// local fallback messages when no chat selected
const localMessages = ref([
  { text: '您好！我是AI助手，有什么可以帮助您的吗？', isUser: false, timestamp: new Date() }
])

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()

// 当前 chat id（如果有）
const chatId = computed(() => route.params.id as string | undefined)

// 当前显示的消息：如果选中聊天则显示 store 中的消息，否则显示本地默认信息
const messages = computed(() => {
  if (chatId.value) {
    const c = chatStore.getChat(chatId.value)
    return c ? c.messages.map(m => ({ text: m.text, isUser: true, timestamp: new Date(m.createdAt) })) : []
  }
  return localMessages.value
})

// 发送消息：如果没有 chatId 则创建新聊天并跳转；如果已有 chatId 则添加消息
const onSend = async (msg: string) => {
  if (!msg || !msg.trim()) return
  const text = msg.trim()
  if (!chatId.value) {
    const id = Date.now().toString()
    // 创建聊天并把用户消息作为首条消息
    chatStore.addChat({ id, title: text, messages: [{ id: Date.now().toString(), text, createdAt: Date.now() }] })
    // 跳转到新会话
    await router.push(`/chat/${id}`)
    // 模拟 AI 回复
    setTimeout(() => {
      chatStore.addMessage(id, `收到：${text}（这是模拟回复）`)
    }, 800)
  } else {
    // 已在聊天中，直接添加消息
    chatStore.addMessage(chatId.value, text)
    // 模拟 AI 回复
    setTimeout(() => {
      chatStore.addMessage(chatId.value!, `收到：${text}（这是模拟回复）`)
    }, 800)
  }
}

onMounted(() => {})
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
ChatInput {
  width: 100%;                 /* 占满页面宽度 */
  max-width: 6800px;            /* 最大宽度限制 */
}
</style>