<template>
  <div class="page">
    <!-- 消息显示区域 -->
    <MessagesContainer :messages="messages" />

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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore, type ChatMessage } from '@/stores/chat'
import ChatInput from '@/components/ChatInput/ChatInput.vue'
import MessagesContainer from '@/components/Message/MessagesContainer.vue'
import PlusLogo from '@/components/PlusLogo/PlusLogo.vue'
import sentSvg from '@/assets/svg/send.svg'

const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)

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

// 当前 chat id（如果有）
const chatId = computed(() => route.params.id as string | undefined)

// 当前显示的消息：如果选中聊天则显示 store 中的消息，否则显示本地默认信息
const messages = computed(() => {
  if (chatId.value) {
    const c = chatStore.getChat(chatId.value)
    return c ? c.messages.map((m: ChatMessage) => ({
      id: m.id,
      text: m.text,
      isUser: m.isuser !== undefined ? m.isuser: false,
      timestamp: new Date(m.createdAt)
    })) : []
  }
  return localMessages.value
})

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
    const id = Date.now().toString() // 使用时间戳字符串作为新会话 id
    console.log('[ChatRoom] creating new chat with id:', id)

    // 创建聊天并把用户消息作为首条消息
    chatStore.addChat({
      id,
      title: text.length > 20 ? text.substring(0, 20) + '...' : text,
      messages: [{ id: Date.now().toString(), text, createdAt: Date.now(), isuser: true }]
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

    // 模拟 AI 回复（包含Markdown格式）
    setTimeout(() => { // 延迟执行以模拟异步回复
      console.log('[ChatRoom] adding simulated reply to new chat:', id)
      chatStore.addMessage(id, {
        id: `ai-${Date.now()}`,
        text: `收到：${text}（这是模拟回复）

这是带有**Markdown**格式的回复示例：

## 标题示例

这是一个段落，其中包含*斜体*和**粗体**文本。

### 代码示例

\`\`\`python
def hello_world():
    print("Hello, World!")
    return True
\`\`\`

### 列表示例

1. 第一项
2. 第二项
3. 第三项

- 无序列表项1
- 无序列表项2

### 链接示例

访问 [GitHub](https://github.com) 获取更多信息。

### 引用示例

> 这是一个引用块
> 可以跨越多行

### 表格示例

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |
`,
        createdAt: Date.now(),
        isuser: false
      }) // 向新会话添加模拟回复消息
    }, 800) // 延迟 800 毫秒
  } else {
    // 已在聊天中，直接添加消息
    console.log('[ChatRoom] adding message to existing chat:', chatId.value)
    
    // 添加用户消息
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      createdAt: Date.now(),
      isuser: true
    }
    chatStore.addMessage(chatId.value, userMessage)

    // 模拟 AI 回复（包含Markdown格式）
    setTimeout(() => { // 延迟执行以模拟异步回复
      console.log('[ChatRoom] adding simulated reply to existing chat:', chatId.value)
      if (chatId.value) {
        chatStore.addMessage(chatId.value, {
          id: `ai-${Date.now()}`,
          text: `收到：${text}（这是模拟回复）

这是带有**Markdown**格式的回复示例：

## 标题示例

这是一个段落，其中包含*斜体*和**粗体**文本。

### 代码示例

\`\`\`python
def hello_world():
    print("Hello, World!")
    return True
\`\`\`

### 列表示例

1. 第一项
2. 第二项
3. 第三项

- 无序列表项1
- 无序列表项2

### 链接示例

访问 [GitHub](https://github.com) 获取更多信息。

### 引用示例

> 这是一个引用块
> 可以跨越多行

### 表格示例

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |
`,
          createdAt: Date.now(),
          isuser: false
        })
      }
    }, 800) // 延迟 800 毫秒
  }
}

// 添加发送按钮点击处理函数
const handleSendClick = () => {
  if (chatInputRef.value && chatInputRef.value.message.trim()) {
    onSend(chatInputRef.value.message)
    chatInputRef.value.message = ''
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