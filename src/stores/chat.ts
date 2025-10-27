import { defineStore } from 'pinia'

export interface ChatMessage {
  id: string
  text: string
  createdAt: number
  isuser: boolean
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
    addMessage(chatId: string, text: string, isuser: boolean) {
      const chat = this.chats.find((c) => c.id === chatId)
      const msg = { id: Date.now().toString(), text, createdAt: Date.now(), isuser }
      if (chat) {
        chat.messages.push(msg)
        // 按创建时间排序
        chat.messages.sort((a, b) => a.createdAt - b.createdAt)
      }
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