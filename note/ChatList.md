---
date: 2025-12-10
tags:
  - front-end
  - component
content: 聊天历史列表组件，展示用户的历史聊天记录
---

## <ChatList.vue>（聊天历史列表组件）

ChatList.vue 是一个聊天历史列表组件，用于展示用户的历史聊天记录。它支持创建新聊天、选择聊天会话，并显示加载和错误状态。

## Template

### 主要结构

-   .chat-list：聊天列表容器
-   .header：头部区域，包含标题和新建聊天按钮
-   .create-chat-btn：新建聊天按钮
-   .loading：加载状态提示
-   .error：错误状态提示
-   .no-chats：无聊天记录提示
-   .chats：聊天列表容器
-   .chat-item：单个聊天项
-   .chat-title：聊天标题
-   .chat-date：聊天日期

### 布局/渲染逻辑

-   根据loading、error和聊天数据状态显示不同内容
-   使用v-for循环渲染聊天列表
-   根据activeChatId属性高亮当前选中的聊天项

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - activeChatId：当前激活的聊天ID
-   emits: 
    - chat-selected：当选中聊天时触发
-   expose: 
    - 无
-   state: 
    - chats：聊天列表数据
    - loading：加载状态
    - error：错误信息
    - creatingChat：创建聊天状态
    - isAuthenticated：用户认证状态

### 关键方法

1. formatDate：格式化日期显示
2. selectChat：选中聊天并跳转到对应路由
3. handleCreateChat：处理创建新聊天
4. fetchChats：获取聊天列表
5. watch(isAuthenticated)：监听认证状态变化并获取聊天列表

### 事件逻辑

-   点击聊天项：选中聊天并触发chat-selected事件
-   点击新建聊天按钮：创建新聊天
-   认证状态变化：自动获取聊天列表

## 状态与 UI 映射

-   loading 控制显示加载提示
-   error 控制显示错误信息
-   chats 控制聊天列表渲染
-   activeChatId 控制聊天项的激活状态
-   creatingChat 控制新建聊天按钮状态

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   使用useChatMessages composable获取聊天数据
-   使用useSupabaseAuth composable获取认证状态
-   通过props接收activeChatId
-   通过emit触发chat-selected事件

## 总结

ChatList.vue 是一个功能完整的聊天历史管理组件，能够展示聊天列表、创建新聊天、选中聊天会话，并处理各种状态显示。它与认证状态和聊天数据紧密集成，为用户提供良好的聊天历史浏览体验。