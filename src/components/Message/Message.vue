<template>
  <div :class="['message', { 'user-message': isUser, 'ai-message': !isUser }]">
    <div class="message-content">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
  isUser: boolean
  timestamp?: Date
}

withDefaults(defineProps<Props>(), {
  timestamp: () => new Date()
})
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 16px;
  max-width: 80%;
  align-items: flex-end;
}

.user-message {
  margin-left: auto;
  justify-content: flex-end;
}

.ai-message {
  margin-right: auto;
  justify-content: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.user-message .message-content {
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-content {
  background-color: #f1f1f1;
  color: #333;
  border-bottom-left-radius: 4px;
}
</style>