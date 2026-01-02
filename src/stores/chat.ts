import { defineStore } from "pinia";

export interface ChatMessage {
  id: string;
  text: string;
  createdAt: number;
  timestamp: Date; // 修改为必需属性，与aiService.ts一致
  isuser: boolean; // 修改为必需属性，与aiService.ts一致
}

export interface ChatItem {
  id: number; // id 和路由有关，改为number类型与数据库保持一致
  title: string; // 聊天标题
  messages: ChatMessage[]; // 消息列表
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    chats: [] as ChatItem[],
  }),
  actions: {
    // 添加新的聊天
    addChat(chat: ChatItem) {
      // 确保消息数组存在
      if (!chat.messages) {
        chat.messages = [];
      }

      // 检查是否已存在相同ID的聊天，避免重复添加
      const existingIndex = this.chats.findIndex((c) => c.id === chat.id);
      if (existingIndex !== -1) {
        // 如果存在相同ID的聊天，更新它而不是添加新项
        this.chats[existingIndex] = { ...this.chats[existingIndex], ...chat };
        console.debug(`[ChatStore] 更新已存在的聊天 ${chat.id}`);
      } else {
        // 如果不存在相同ID的聊天，添加新项
        this.chats.push(chat);
        console.debug(`[ChatStore] 添加新聊天 ${chat.id}`);
      }
    },

    // 向指定聊天添加消息
    addMessage(
      chatId: number,
      message: string | ChatMessage,
      isuser?: boolean,
    ) { // 修改参数类型为number
      const chat = this.chats.find((c) => c.id === chatId);
      if (!chat) return;

      let newMessage: ChatMessage;

      if (typeof message === "string") {
        // 保持向后兼容性
        newMessage = {
          id: Date.now().toString(),
          text: message.trim(),
          createdAt: Date.now(),
          isuser: isuser || false, // 确保isuser为boolean类型
          timestamp: new Date(), // 添加必需的timestamp属性
        };
      } else {
        // 如果传入的是对象，则直接使用
        newMessage = message;
      }

      chat.messages.push(newMessage);
      // 按创建时间升序排序（从旧到新）
      chat.messages.sort((a, b) => a.createdAt - b.createdAt);
    },

    // 获取指定聊天
    getChat(chatId: number) {
      return this.chats.find((c) => c.id === chatId);
    },

    // 从指定聊天中移除消息
    removeMessage(chatId: number, messageId: string) {
      const chat = this.chats.find((c) => c.id === chatId);
      if (!chat) return false;

      const messageIndex = chat.messages.findIndex((m) => m.id === messageId);
      if (messageIndex !== -1) {
        chat.messages.splice(messageIndex, 1);
        return true;
      }
      return false;
    },

    // 更新消息内容
    updateMessage(chatId: number, messageId: string, newText: string) {
      const chat = this.chats.find((c) => c.id === chatId);
      console.log("[Updating message]:", { chatId, messageId, newText });

      if (!chat) return false;

      const message = chat.messages.find((m) => m.id === messageId);
      if (message) {
        message.text = newText;
        console.log(`[Message updated]: message.text = ${message.text}`);
        return true;
      }
      return false;
    },

    clearChat(chatId: number) { // 修改参数类型为number
      const chat = this.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.messages = [];
      }
    },
    deleteChat(chatId: number) { // 修改参数类型为number
      const index = this.chats.findIndex((c) => c.id === chatId);
      if (index !== -1) {
        this.chats.splice(index, 1);
      }
    },
  },
});
