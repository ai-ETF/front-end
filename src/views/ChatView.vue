<template>
  <div class="page">
    <!-- 页面顶部标题 -->
    <h1 class="page-title">需要什么帮助吗？</h1>

    <!-- 消息显示区域 -->
    <!-- <MessagesContainer :messages="messages" /> -->

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
import { ref, onMounted } from 'vue'
import ChatInput from '@/components/chatInput/chatInput.vue'
import MessagesContainer from '@/components/MessagesContainer.vue'
import sentSvg from '@/assets/svg/send.svg'

// 定义消息类型
interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

// 消息列表状态
const messages = ref<Message[]>([
  {
    text: '您好！我是AI助手，有什么可以帮助您的吗？',
    isUser: false,
    timestamp: new Date()
  }
])

// 发送消息事件处理函数
const onSend = async (msg: string) => {
  console.log('发送消息：', msg)
  
  // 添加用户消息到列表
  messages.value.push({
    text: msg,
    isUser: true,
    timestamp: new Date()
  })
  
  // 模拟AI回复（实际项目中这里会调用后端API）
  setTimeout(() => {
    messages.value.push({
      text: `我收到了您的消息: "${msg}"。这是一个模拟回复，实际应用中这里会是AI生成的回复内容。`,
      isUser: false,
      timestamp: new Date()
    })
  }, 1000)
}

// 组件挂载时的初始化逻辑
onMounted(() => {
  // 可以在这里添加初始化逻辑
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
ChatInput {
  width: 100%;                 /* 占满页面宽度 */
  max-width: 6800px;            /* 最大宽度限制 */
}
</style>