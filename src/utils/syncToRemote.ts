/*
 * 本地到远程数据同步工具
 * 负责将本地数据更改同步到远程服务器
 */

import { useChatStore } from '@/stores/chat'
import type { ChatMessage as RemoteChatMessage } from '@/composables/useChatMessages'
import type { ChatMessage } from '@/stores/chat'

/**
 * 发送消息并同步到云端和本地 store
 * @param chatId 聊天会话 ID
 * @param message 消息内容
 * @param role 消息发送者角色 ('user' 或 'assistant')
 * @param sendMessage 发送消息到云端的函数
 * @param isLocalOnly 是否仅本地存储（用于模拟回复等场景）
 */
export const syncMessageToRemote = async (
  chatId: number,
  message: string,
  role: 'user' | 'assistant',
  sendMessage: (chatId: number, content: string, role: 'user' | 'assistant') => Promise<RemoteChatMessage | null>,
  isLocalOnly: boolean = false
) => {
  const chatStore = useChatStore();
  
  // 创建本地消息对象
  const localMessage: ChatMessage = {
    id: `${role}-${Date.now()}`,
    text: message,
    createdAt: Date.now(),
    isuser: role === 'user'
  };

  // 先添加到本地 store（乐观更新）
  chatStore.addMessage(chatId, localMessage);

  // 如果仅本地存储，直接返回
  if (isLocalOnly) {
    return localMessage;
  }

  try {
    // 发送到云端
    const remoteMessage = await sendMessage(chatId, message, role);
    
    if (remoteMessage) {
      // 如果需要，可以用云端返回的ID更新本地消息
      // 这里暂不更新，保持本地ID不变
      console.log(`消息已同步到云端: ${role}`, message);
    }
    
    return localMessage;
  } catch (error) {
    console.error(`发送消息到云端失败: ${role}`, message, error);
    // 即使云端同步失败，也保留本地消息
    return localMessage;
  }
}

/**
 * 删除聊天会话并同步到远程
 * @param chatId 聊天会话 ID
 * @param deleteChat 删除聊天会话的远程函数
 */
export const syncDeleteChatToRemote = async (
  chatId: number,
  deleteChat: (chatId: number) => Promise<boolean>
) => {
  try {
    // 先从远程删除
    const result = await deleteChat(chatId);
    
    if (result) {
      // 如果远程删除成功，再删除本地数据
      const chatStore = useChatStore();
      chatStore.deleteChat(chatId);
      console.log(`聊天会话 ${chatId} 已从远程和本地删除`);
      return true;
    } else {
      console.warn(`聊天会话 ${chatId} 远程删除失败`);
      return false;
    }
  } catch (error) {
    console.error(`删除聊天会话 ${chatId} 时出错:`, error);
    return false;
  }
}

/**
 * 更新聊天会话标题并同步到远程
 * @param chatId 聊天会话 ID
 * @param title 新标题
 * @param updateChatTitle 更新聊天标题的远程函数
 */
export const syncUpdateChatTitleToRemote = async (
  chatId: number,
  title: string,
  updateChatTitle: (chatId: number, title: string) => Promise<RemoteChatMessage | null>
) => {
  try {
    // 先更新远程
    const result = await updateChatTitle(chatId, title);
    
    if (result) {
      // 如果远程更新成功，再更新本地数据
      const chatStore = useChatStore();
      const localChat = chatStore.getChat(chatId);
      if (localChat) {
        localChat.title = title;
      }
      console.log(`聊天会话 ${chatId} 标题已更新到远程和本地`);
      return true;
    } else {
      console.warn(`聊天会话 ${chatId} 标题远程更新失败`);
      return false;
    }
  } catch (error) {
    console.error(`更新聊天会话 ${chatId} 标题时出错:`, error);
    return false;
  }
}

/**
 * 清空所有聊天并同步到远程
 * @param clearAllChats 清空所有聊天的远程函数
 */
export const syncClearAllChatsToRemote = async (
  clearAllChats: () => Promise<boolean>
) => {
  try {
    // 先清空远程
    const result = await clearAllChats();
    
    if (result) {
      // 如果远程清空成功，再清空本地数据
      const chatStore = useChatStore();
      chatStore.chats = [];
      console.log(`所有聊天已从远程和本地清空`);
      return true;
    } else {
      console.warn(`聊天远程清空失败`);
      return false;
    }
  } catch (error) {
    console.error(`清空所有聊天时出错:`, error);
    return false;
  }
}