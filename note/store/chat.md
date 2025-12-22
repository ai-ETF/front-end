---
date: 2025-12-18
tags:
- front-end
- store
- chat
content: 说明 chat store 的功能和使用方式
---

## Chat Store

### 主要功能

Chat Store 是一个基于 Pinia 的状态管理模块，专门用于管理聊天相关的本地状态。它负责存储聊天会话列表、消息以及提供操作这些数据的方法。

### 核心数据结构

#### ChatMessage
- `id`: string - 消息唯一标识符
- `text`: string - 消息内容
- `createdAt`: number - 消息创建时间戳
- `isuser`: boolean (可选) - 是否为用户发送的消息

#### ChatItem
- `id`: string - 聊天会话唯一标识符
- `title`: string - 聊天会话标题
- `messages`: ChatMessage[] - 消息列表

### 核心方法

#### addChat(chat: ChatItem)
添加一个新的聊天会话到 store 中。如果聊天会话没有消息数组，会自动创建一个空数组。

#### addMessage(chatId: string, message: string | ChatMessage, isuser?: boolean)
向指定的聊天会话中添加一条消息。支持传入字符串或完整的 ChatMessage 对象。

#### getChat(chatId: string)
根据聊天会话 ID 获取对应的聊天会话对象。

#### clearChat(chatId: string)
清空指定聊天会话中的所有消息。

#### deleteChat(chatId: string)
从 store 中删除指定的聊天会话。

### 使用示例

```typescript
import { useChatStore } from '@/stores/chat'

// 在组件中使用
const chatStore = useChatStore()

// 添加聊天会话
chatStore.addChat({
  id: '1',
  title: '新聊天',
  messages: []
})

// 添加消息
chatStore.addMessage('1', '你好世界！', true)

// 获取聊天会话
const chat = chatStore.getChat('1')

// 删除聊天会话
chatStore.deleteChat('1')
```

### 设计理念

Chat Store 遵循以下设计原则：

1. **本地状态管理**：专注于本地状态的管理，不直接处理远程数据获取
2. **数据一致性**：提供统一的 API 来操作聊天数据，确保数据的一致性
3. **易于使用**：提供简洁明了的 API，方便组件使用
4. **可预测性**：所有状态变更都通过定义好的 actions 进行，便于调试和维护