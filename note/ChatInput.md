---
date: 2025-12-09
tags:
  - front-end
  - component
content: 一个具有自适应功能的聊天输入框组件
---

## ChatInput.vue（智能聊天输入组件）

ChatInput.vue 是一个智能聊天输入组件，支持自适应高度、智能布局切换（单行/多行模式）、Enter发送、Shift+Enter换行，并通过 `@send` 事件传递输入内容，适用于聊天界面的消息输入场景。

## Template

### 主要结构

-   .input-wrapper：主容器，根据是否多行显示不同的布局
-   .prefix/.suffix：单行模式下左右图标区
-   textarea：文本输入区
-   .prefix-bottom/.suffix-bottom：多行模式下底部图标区

### 布局/渲染逻辑

-   使用 `v-if` 控制单行/多行模式下图标的显示位置
-   单行模式：图标显示在输入框两侧
-   多行模式：图标移至底部按钮区域
-   布局切换通过 .input-wrapper 的 multi-line CSS类控制

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - `disabled`：控制输入框是否禁用
-   emits: 
    - `send`：当用户发送消息时触发，传递消息内容
-   expose: 
    - `message`：暴露输入内容给父组件访问
-   state: 
    - `message`：存储输入内容，与textarea通过v-model双向绑定
    - `isMultiLineState`：跟踪多行模式状态

### 关键方法

1. handleSend（Enter键按下时触发）：处理消息发送逻辑，区分Enter和Shift+Enter
2. handleInput（用户输入时触发）：监听输入事件，动态调整文本框高度

### 事件逻辑

-   回车发送逻辑：按下Enter键发送消息，按下Shift+Enter换行
-   输入监听逻辑：监听用户输入，计算内容高度并调整文本框大小

## 状态与 UI 映射

-   isMultiLineState 控制布局切换，决定图标显示位置（两侧 vs 底部）
-   disabled prop 控制输入框禁用状态和样式

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   父组件通过 `@send` 事件接收用户输入的消息内容
-   父组件可以通过ref访问组件的 `message` 属性获取当前输入内容
-   通过插槽（prefix/suffix）接收父组件传入的图标元素

## 总结

ChatInput组件是一个功能丰富的聊天输入框，核心特性包括自适应高度和智能布局切换。关键实现点在于准确计算文本高度以调整输入框大小，以及在单行和多行模式之间平滑切换布局。未来需要注意维护高度计算逻辑的准确性，确保在不同设备和字体大小下都能正常工作。