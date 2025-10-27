<template>
  <div class="messages-container" ref="containerRef">
    <Message
      v-for="(message, index) in formattedMessages"
      :key="index"
      :text="message.text"
      :is-user="message.isUser"
      :timestamp="message.timestamp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, computed } from 'vue'
import Message from './Message.vue'

interface Message {
  text: string
  isUser: boolean
  timestamp?: Date
}

interface Props {
  messages: Message[]
}

const props = defineProps<Props>()

// 添加调试日志
console.log('MessagesContainer received messages:', props.messages);

const containerRef = ref<HTMLElement | null>(null)

const formattedMessages = computed(() => {
  const formatted = props.messages.map(msg => ({
    text: msg.text,
    isUser: msg.isUser,
    timestamp: msg.timestamp || new Date()
  }));
  
  // 添加调试日志
  console.log('Formatted messages:', formatted);
  return formatted;
})

const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
}

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
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
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