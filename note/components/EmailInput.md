---
date: 2025-12-10
tags:
  - front-end
  - component
content: 一个带有邮箱图标的输入组件，用于输入电子邮件地址
---

## <EmailInput.vue>（邮箱输入组件）

EmailInput.vue 是一个带有邮箱图标的输入组件，用于在登录界面输入电子邮件地址。该组件采用了简单的结构，包含一个SVG邮箱图标和一个输入框，整体设计简洁明了。

## Template

### 主要结构

-   .input-frame：主容器，使用flex布局包含图标和输入框
-   svg.input-icon：左侧邮箱图标
-   input.input-field：邮件地址输入框

### 布局/渲染逻辑

-   使用flex布局实现图标和输入框的水平排列
-   图标固定在左侧，输入框占据剩余空间
-   无条件渲染逻辑，所有元素始终显示

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - placeholder：输入框占位符，默认值为"请输入电子邮件地址"
    - modelValue：输入框的值，使用v-model绑定，必填项
-   emits: 
    - update:modelValue：当输入框值发生变化时触发
-   expose: 
    - 无
-   state: 
    - 无内部状态，完全受控于父组件

### 关键方法

1. watch.modelValue（modelValue变化时触发）：监听modelValue变化并向父组件发送更新事件

### 事件逻辑

-   输入监听逻辑：通过v-model自动处理输入事件并更新值
-   无特殊键盘事件处理

## 状态与 UI 映射

-   modelValue 控制输入框显示的值
-   placeholder 控制输入框占位符文本

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   父组件通过 v-model 绑定值到 modelValue prop 并监听 update:modelValue 事件
-   无对外暴露接口

## 总结

EmailInput.vue 是一个简单的受控输入组件，主要用于收集用户的电子邮件地址。它通过 v-model 实现双向数据绑定，结构简单，易于使用和维护。