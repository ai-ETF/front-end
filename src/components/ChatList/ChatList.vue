<template>
  <div class="chat-list">
    <div class="header">
      <h2>聊天历史</h2>
      <div class="header-actions">
        <button @click="refreshChats" :disabled="loading" class="refresh-btn">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
        <button @click="handleCreateChat" :disabled="creatingChat" class="create-chat-btn">
          {{ creatingChat ? '创建中...' : '新建聊天' }}
        </button>
      </div>
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
import { ref, onMounted, watch } from 'vue'
import { useChatMessages } from '@/composables/useChatMessages'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const { isAuthenticated } = useSupabaseAuth()
const chatStore = useChatStore()

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

// 手动刷新聊天列表
const refreshChats = async () => {
  await loadChatsToStore()
}

// 获取聊天记录并同步到本地store
const loadChatsToStore = async () => {
  if (isAuthenticated.value) {
    const fetchedChats = await fetchChats()
    console.log(`获取到 ${fetchedChats.length} 条聊天记录。`)
    // 将远程聊天记录同步到本地store
    fetchedChats.forEach(chat => {
      // 检查是否已经存在于本地store中
      const existingChat = chatStore.getChat(chat.id.toString())
      if (!existingChat) {
        // 如果不存在，则添加到本地store
        chatStore.addChat({
          id: chat.id.toString(),
          title: chat.title || '未命名聊天',
          messages: [] // 消息将在进入具体聊天时加载
        })
      }
    })
    console.log('聊天记录已同步到本地store。')
  }else{
    console.log('用户未认证，无法加载聊天记录。')
  }
}

// 监听认证状态变化，当用户登录时自动获取聊天列表
watch(isAuthenticated, (newVal) => {
  if (newVal) {
    loadChatsToStore()
  }
}, { immediate: true })

// 组件挂载时检查认证状态
onMounted(async() => {
  // 只有在用户已登录的情况下才获取聊天列表
  console.log('ChatList 组件挂载，检查用户认证状态...')
  if (isAuthenticated.value) {
    await loadChatsToStore()
    console.log('聊天页面加载执行完成。')
  }
})

// onMounted(() => {
//   console.log('111111111111111111111')
// })

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
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn,
.create-chat-btn {
  padding: 6px 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover:not(:disabled),
.create-chat-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.refresh-btn:disabled,
.create-chat-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .error, .no-chats {
  text-align: center;
  padding: 20px;
  color: #666;
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
  cursor: pointer;
  margin-bottom: 8px;
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
  color: #999;
}
</style>