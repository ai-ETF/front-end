<template>
  <div class="chat-list">
    <div class="header">
      <h2>聊天历史</h2>
      <button @click="handleCreateChat" :disabled="creatingChat" class="create-chat-btn">
        {{ creatingChat ? '创建中...' : '新建聊天' }}
      </button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">错误: {{ error }}</div>
    <div v-else-if="chats.length === 0" class="no-chats">暂无聊天记录</div>
    <ul v-else class="chats">
      <li 
        v-for="chat in chats" 
        :key="chat.id" 
        :class="['chat-item', { active: activeChatId === chat.id }]"
        @click="selectChat(chat.id)"
      >
        <div class="chat-title">{{ chat.title || '未命名聊天' }}</div>
        <div class="chat-date">{{ formatDate(chat.updated_at || chat.created_at) }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatMessages } from '@/composables/useChatMessages'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { useRouter } from 'vue-router'

const { isAuthenticated } = useSupabaseAuth()

const emit = defineEmits(['chat-selected'])
const props = defineProps<{
  activeChatId: number | null
}>()

const { chats, loading, error, fetchChats, createChat } = useChatMessages()
const router = useRouter()
const creatingChat = ref(false)

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const selectChat = (chatId: number) => {
  router.push(`/chat/${chatId}`)
  emit('chat-selected', chatId)
}

const handleCreateChat = async () => {
  creatingChat.value = true
  try {
    const newChat = await createChat('新聊天')
    if (newChat) {
      selectChat(newChat.id)
    }
  } finally {
    creatingChat.value = false
  }
}

onMounted(() => {
  // 只有在用户已登录的情况下才获取聊天列表
  if (isAuthenticated.value) {
    fetchChats()
  }
})
</script>

<style scoped>
.chat-list {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.create-chat-btn {
  padding: 6px 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.create-chat-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.create-chat-btn:disabled {
  background-color: #bfbfbf;
  cursor: not-allowed;
}

.loading, .error, .no-chats {
  text-align: center;
  padding: 16px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error {
  color: #ff4d4f;
}

.chats {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.chat-item.active {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.chat-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-date {
  font-size: 12px;
  color: #888;
}
</style>