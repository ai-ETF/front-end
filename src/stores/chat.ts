import { defineStore } from 'pinia'

export interface ChatMessage {
  id: string
  text: string
  createdAt: number
  isuser?: boolean
}

export interface ChatItem {
  id: number // id 和路由有关，改为number类型与数据库保持一致
  title: string // 聊天标题
  messages: ChatMessage[]  // 消息列表
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [] as ChatItem[],
  }),
  actions: {
    // 添加新的聊天
    addChat(chat: ChatItem) {
      // 确保消息数组存在
      if (!chat.messages) {
        chat.messages = []
      }
      this.chats.push(chat)
    },

    // 向指定聊天添加消息
    addMessage(chatId: number, message: string | ChatMessage, isuser?: boolean) { // 修改参数类型为number
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

    // 获取指定聊天
    getChat(chatId: number) {
      return this.chats.find((c) => c.id === chatId)
    },
    clearChat(chatId: number) { // 修改参数类型为number
      const chat = this.chats.find((c) => c.id === chatId)
      if (chat) {
        chat.messages = []
      }
    },
    deleteChat(chatId: number) { // 修改参数类型为number
      const index = this.chats.findIndex((c) => c.id === chatId)
      if (index !== -1) {
        this.chats.splice(index, 1)
      }
    }
  }
})