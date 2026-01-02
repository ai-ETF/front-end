/*
 * 远程到本地数据同步工具
 * 负责将远程数据获取并同步到本地 store
 */

import { useChatStore } from '@/stores/chat'
import type { ChatSession, ChatMessage as RemoteChatMessage } from '@/composables/useChatMessages'
import type { ChatItem, ChatMessage } from '@/stores/chat'

/**
 * 同步远程聊天会话到本地 store
 * @param remoteChats 远程聊天会话列表
 */
export const syncChatsToLocal = (remoteChats: ChatSession[]): void => {
  const chatStore = useChatStore()
  
  // 清空现有聊天会话
  chatStore.chats = []
  
  // 转换并添加每个聊天会话
  remoteChats.forEach(remoteChat => {
    const localChat: ChatItem = {
      id: remoteChat.id, // 现在直接使用数字类型的 id
      title: remoteChat.title || '未命名聊天',
      messages: [] // 消息将在单独的同步过程中添加
    }
    
    chatStore.addChat(localChat)
  })
}

/**
 * 同步远程消息到本地 store
 * @param chatId 聊天会话 ID
 * @param remoteMessages 远程消息列表
 */
export const syncMessagesToLocal = (chatId: number, remoteMessages: RemoteChatMessage[]): void => {
  const chatStore = useChatStore()
  
  // 获取对应的本地聊天会话
  const localChat = chatStore.getChat(chatId)
  if (!localChat) {
    console.warn(`未找到 ID 为 ${chatId} 的本地聊天会话`)
    return
  }
  
  // 清空现有消息
  localChat.messages = []
  
  // 转换并添加每个消息
  remoteMessages.forEach(remoteMessage => {
    const localMessage: ChatMessage = {
      id: String(remoteMessage.id),
      text: remoteMessage.content || '',
      createdAt: new Date(remoteMessage.created_at as string).getTime(),
      timestamp: new Date(remoteMessage.created_at as string), // 添加缺失的 timestamp 属性
      isuser: remoteMessage.role === 'user'
    }
    
    chatStore.addMessage(chatId, localMessage)
  })
}

/**
 * 获取并同步特定聊天会话的详细内容
 * @param chatId 聊天会话 ID
 * @param fetchMessages 从远程获取消息的函数
 */
export const syncChatDetailsToLocal = async (chatId: number, fetchMessages: (chatId: number) => Promise<RemoteChatMessage[]>) => {
  try {
    const chatStore = useChatStore();
    
    // 检查聊天是否已存在于 store 中
    const existingChat = chatStore.getChat(chatId);
    if (!existingChat) {
      console.warn(`未找到 ID 为 ${chatId} 的本地聊天会话`);
      return;
    }
    
    // 如果聊天已经有消息，可能是已经加载过了，可以选择跳过或者重新加载
    // 这里我们选择重新加载以确保数据是最新的
    console.log(`正在同步聊天 ${chatId} 的详细内容...`);
    
    // 从远程获取消息
    const remoteMessages = await fetchMessages(chatId);
    
    // 同步消息到 store
    syncMessagesToLocal(chatId, remoteMessages);
    
    console.log(`聊天 ${chatId} 的详细内容同步完成，共 ${remoteMessages.length} 条消息`);
  } catch (error) {
    console.error(`同步聊天 ${chatId} 的详细内容时出错:`, error);
  }
}

/**
 * 更新本地聊天会话标题
 * @param chatId 聊天会话 ID
 * @param title 新标题
 */
export const updateChatTitleInLocal = (chatId: number, title: string): void => {
  const chatStore = useChatStore()
  const localChat = chatStore.getChat(chatId)
  
  if (localChat) {
    localChat.title = title
  }
}

/**
 * 从本地 store 中删除聊天会话
 * @param chatId 要删除的聊天会话 ID
 */
export const removeChatFromLocal = (chatId: number): void => {
  const chatStore = useChatStore()
  chatStore.deleteChat(chatId)
}

/**
 * 清空本地所有聊天数据
 */
export const clearAllChatsFromLocal = (): void => {
  const chatStore = useChatStore()
  
  // 获取所有聊天会话 ID
  const chatIds = chatStore.chats.map(chat => chat.id)
  
  // 逐个删除聊天会话
  chatIds.forEach(chatId => {
    chatStore.deleteChat(chatId)
  })
}