---
date: 2025-12-18
tags:
- front-end
- utils
- chat
content: 说明 chatSync 工具的功能和使用方式
---

## Chat Sync 工具

### 主要功能

Chat Sync 工具是一个专门用于同步远程聊天数据到本地状态管理的工具集。它负责将 `useChatMessages.ts` 中获取的远程数据转换并同步到 `chat.ts` 的本地状态管理中，实现了数据访问层与状态管理层的解耦。

### 核心方法

#### syncChatsToStore(remoteChats: ChatSession[])
将远程聊天会话列表同步到本地 store 中。会先清空现有聊天会话，然后转换并添加每个聊天会话。

#### syncMessagesToStore(chatId: string, remoteMessages: RemoteChatMessage[])
将远程消息列表同步到指定的本地聊天会话中。会先清空该聊天会话中的现有消息，然后转换并添加每个消息。

#### updateChatTitleInStore(chatId: string, title: string)
更新本地聊天会话的标题。

#### removeChatFromStore(chatId: string)
从本地 store 中删除指定的聊天会话。

#### clearAllChatsFromStore()
清空本地所有聊天数据。

### 使用示例

```typescript
import { useChatMessages } from '@/composables/useChatMessages'
import { 
  syncChatsToStore, 
  syncMessagesToStore 
} from '@/utils/chatSync'

// 在组件中使用
const { fetchChats, fetchMessages } = useChatMessages()

// 获取远程聊天会话并同步到本地
const remoteChats = await fetchChats()
syncChatsToStore(remoteChats)

// 获取远程消息并同步到本地
const chatId = '1'
const remoteMessages = await fetchMessages(Number(chatId))
syncMessagesToStore(chatId, remoteMessages)
```

### 设计理念

Chat Sync 工具遵循以下设计原则：

1. **数据同步**：专注于远程数据与本地状态的同步，不处理数据获取逻辑
2. **类型安全**：确保远程数据类型与本地状态类型的正确转换
3. **解耦合**：将数据获取逻辑与状态管理逻辑分离，提高代码可维护性
4. **易于使用**：提供简洁明了的 API，方便组件使用