<template>
  <div class="messages-container" ref="containerRef">
    <Message
      v-for="(message, index) in formattedMessages"
      :key="message.id || index"
      :text="message.text"
      :is-user="message.isUser"
      :timestamp="message.timestamp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, computed, nextTick, watch } from 'vue'
import Message from './Message.vue'

interface Message {
  id?: string
  text: string
  isUser: boolean
  timestamp?: Date
}

interface Props {
  messages: Message[]
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement | null>(null)

const formattedMessages = computed(() => {
  const formatted = props.messages.map((msg, index) => ({
    id: msg.id || `msg-${index}`,
    text: msg.text,
    isUser: msg.isUser,
    timestamp: msg.timestamp || new Date()
  }));
  
  return formatted;
})

const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
}

// 监听格式化后的消息，确保在消息更新后滚动到底部
watch(formattedMessages, () => {
  scrollToBottom()
}, { deep: true })

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
</style>