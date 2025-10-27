import { defineStore } from 'pinia'

export interface ChatMessage {
  id: string
  text: string
  createdAt: number
  isuser?: boolean
}

export interface ChatItem {
  id: string // id 和路由有关
  title: string // 聊天标题
  messages: ChatMessage[]  // 消息列表
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [] as ChatItem[],
  }),
  actions: {
    addChat(chat: ChatItem) {
      // 确保消息数组存在
      if (!chat.messages) {
        chat.messages = []
      }
      this.chats.push(chat)
    },
    addMessage(chatId: string, message: string | ChatMessage, isuser?: boolean) {
      const chat = this.chats.find((c) => c.id === chatId)
      if (!chat) return
      
      let newMessage: ChatMessage
      
      if (typeof message === 'string') {
        // 保持向后兼容性
        newMessage = {
          id: Date.now().toString(),
          text: message.trim(),
          createdAt: Date.now(),
          isuser: isuser
        }
      } else {
        // 如果传入的是对象，则直接使用
        newMessage = message
      }
      
      chat.messages.push(newMessage)
      // 按创建时间升序排序（从旧到新）
      chat.messages.sort((a, b) => a.createdAt - b.createdAt)
    },
    getChat(chatId: string) {
      return this.chats.find((c) => c.id === chatId)
    },
    clearChat(chatId: string) {
      const chat = this.chats.find((c) => c.id === chatId)
      if (chat) {
        chat.messages = []
      }
    },
    deleteChat(chatId: string) {
      const index = this.chats.findIndex((c) => c.id === chatId)
      if (index !== -1) {
        this.chats.splice(index, 1)
      }
    }
  }
})