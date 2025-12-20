---
date: 2025-12-10
tags:
  - front-end
  - component
content: 消息显示组件，支持Markdown渲染和代码高亮
---

## <Message.vue>（消息组件）

Message.vue 是一个消息显示组件，用于展示聊天消息。它支持根据消息来源（用户或AI）显示不同的样式，并能渲染Markdown格式的内容，包括代码高亮功能。

## Template

### 主要结构

-   .message：消息容器，根据isUser属性应用不同样式
-   .user-message：用户消息样式类
-   .ai-message：AI消息样式类
-   .message-content：消息内容容器，用于显示文本内容

### 布局/渲染逻辑

-   使用:class绑定根据isUser属性动态切换样式类
-   通过v-html指令将处理后的内容插入DOM
-   用户消息右对齐，AI消息左对齐

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - text：消息文本内容
    - isUser：布尔值，标识是否为用户发送的消息
    - timestamp：可选的时间戳，默认为当前时间
-   emits: 
    - 无
-   expose: 
    - 无
-   state: 
    - md：MarkdownIt实例，用于Markdown渲染
    - renderedContent：计算属性，处理后的消息内容
    - sanitizedContent：计算属性，经过净化的消息内容

### 关键方法

1. Markdown渲染：使用MarkdownIt库将AI消息渲染为HTML
2. HTML转义：对用户消息进行HTML特殊字符转义
3. 代码高亮：使用highlight.js对代码块进行语法高亮
4. 内容净化：使用DOMPurify净化渲染后的内容，防止XSS攻击

### 事件逻辑

-   无特殊事件逻辑

## 状态与 UI 映射

-   isUser 控制消息的对齐方式和样式
-   text 作为消息内容显示
-   timestamp 用于消息时间标记（当前未在UI中显示）

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   父组件通过props传递消息内容和类型
-   作为消息列表的一部分使用

## 总结

Message.vue 是一个功能丰富的消息显示组件，能够区分用户和AI消息，支持Markdown渲染和代码高亮，并具备安全防护措施。它是聊天界面中核心的展示组件。