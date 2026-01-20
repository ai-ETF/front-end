/*
 * 本地到远程数据同步工具
 * 负责将本地数据更改同步到远程服务器
 */

import { useChatStore } from '@/stores/chat'
import type { ChatMessage as RemoteChatMessage } from '@/composables/useChatMessages'

/**
 * 发送消息并同步到云端
 * @param chatId 聊天会话 ID
 * @param message 消息内容
 * @param role 消息发送者角色 ('user' 或 'assistant')
 * @param sendMessage 发送消息到云端的函数
 */
export const syncMessageToRemote = async (
  chatId: number | string,
  message: string,
  role: 'user' | 'assistant',
  sendMessage: (
    chatId: number | string,
    content: string,
    role: 'user' | 'assistant'
  ) => Promise<RemoteChatMessage | null>,
) => {
  try {
    const remoteMessage = await sendMessage(chatId, message, role)

    if (!remoteMessage) {
      console.warn('[syncMessageToRemote] remoteMessage is null')
      return null
    }

    console.log(
      `[syncMessageToRemote] synced ${role} message to remote`,
      remoteMessage
    )

    // ⚠️ 注意：这里【不再 addMessage】
    // 如果未来要做 ID 对齐，可以在这里 update 本地 message

    return remoteMessage
  } catch (error) {
    console.error(
      `[syncMessageToRemote] failed to sync ${role} message`,
      error
    )
    return null
  }
}


/**
 * 删除聊天会话并同步到远程
 * @param chatId 聊天会话 ID
 * @param deleteChat 删除聊天会话的远程函数
 */
export const syncDeleteChatToRemote = async (
  chatId: number | string,
  deleteChat: (chatId: number | string) => Promise<boolean>
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
  chatId: number | string,
  title: string,
  updateChatTitle: (chatId: number | string, title: string) => Promise<RemoteChatMessage | null>
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