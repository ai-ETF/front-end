<template>
  <div class="messages-container" ref="containerRef">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">错误: {{ error }}</div>
    <template v-else>
      <Message
        v-for="(message, index) in formattedMessages"
        :key="message.id || index"
        :text="message.text"
        :is-user="message.isUser"
        :timestamp="message.timestamp"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, computed, nextTick, watch, onUnmounted } from 'vue'
import Message from './Message.vue'
import { useChatMessages } from '@/composables/useChatMessages'

interface Message {
  id?: string
  text: string
  isUser: boolean
  timestamp?: Date
}

interface Props {
  chatId?: number | null
  messages?: Message[]
}

const props = defineProps<Props>()

const { messages: fetchedMessages, loading, error, fetchMessages } = useChatMessages()

const containerRef = ref<HTMLElement | null>(null)

const formattedMessages = computed(() => {
  // 如果传入了外部消息，则使用外部消息
  if (props.messages && props.messages.length > 0) {
    return props.messages.map(msg => ({
      id: msg.id || Date.now().toString() + Math.random(),
      text: msg.text,
      isUser: msg.isUser,
      timestamp: msg.timestamp || new Date()
    }))
  }
  
  // 否则使用从服务器获取的消息
  return fetchedMessages.value.map((msg) => ({
    id: msg.id.toString(),
    text: msg.content || '',
    isUser: msg.role === 'user',
    timestamp: msg.created_at ? new Date(msg.created_at) : new Date()
  }))
})

const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
}

// 监听消息，确保在消息更新后滚动到底部
watch(formattedMessages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 当聊天ID改变时，获取对应的消息
watch(() => props.chatId, async (newChatId) => {
  if (typeof newChatId === 'number') {
    await fetchMessages(newChatId)
  }
}, { immediate: true })

onMounted(() => {
  scrollToBottom()
})

onUpdated(() => {
  scrollToBottom()
})
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto; /* 允许竖向滚动，关键点：有滚动条才能通过 scrollTop/scrollHeight 控制滚动 */
  padding: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
  /*max-width: 900px;*/
  margin: 0 auto;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #888;
}

.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
}

.error {
  color: #ff4d4f;
}
</style>