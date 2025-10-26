import { defineStore } from 'pinia'

export interface ChatMessage {
  id: string
  text: string
  createdAt: number
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
      this.chats.push(chat)
    },
    addMessage(chatId: string, text: string) {
      const chat = this.chats.find((c) => c.id === chatId)
      const msg = { id: Date.now().toString(), text, createdAt: Date.now() }
      if (chat) {
        chat.messages.push(msg)
      }
    },
    getChat(chatId: string) {
      return this.chats.find((c) => c.id === chatId)
    }
  }
})
