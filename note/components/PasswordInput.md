---
date: 2025-12-10
tags:
  - front-end
  - component
content: 一个带有密码图标和可见性切换功能的输入组件，用于输入密码
---

## <PasswordInput.vue>（密码输入组件）

PasswordInput.vue 是一个带有密码图标和可见性切换功能的输入组件，用于在登录和注册界面输入密码。该组件包含一个密码图标、一个密码输入框和一个眼睛图标用于切换密码可见性。

## Template

### 主要结构

-   .input-frame：主容器，使用flex布局包含图标和输入框
-   svg.input-icon：左侧密码锁图标
-   input.input-field：密码输入框
-   .icon-container：右侧眼睛图标容器
-   svg.input-icon.right：右侧眼睛图标，用于切换密码可见性

### 布局/渲染逻辑

-   使用flex布局实现图标和输入框的水平排列
-   密码图标固定在左侧，眼睛图标固定在右侧
-   根据showPassword状态切换眼睛图标的显示内容（睁开眼/闭眼）
-   根据showPassword状态切换输入框的type属性（password/text）

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - placeholder：输入框占位符，默认值为"请输入密码"
    - modelValue：输入框的值，使用v-model绑定，必填项
-   emits: 
    - update:modelValue：当输入框值发生变化时触发
-   expose: 
    - 无
-   state: 
    - showPassword：布尔值，控制密码是否可见

### 关键方法

1. togglePassword（点击眼睛图标时触发）：切换showPassword状态
2. watch.modelValue（modelValue变化时触发）：监听modelValue变化并向父组件发送更新事件

### 事件逻辑

-   输入监听逻辑：通过v-model自动处理输入事件并更新值
-   点击眼睛图标：切换密码可见性

## 状态与 UI 映射

-   modelValue 控制输入框显示的值
-   showPassword 控制输入框类型（password/text）和眼睛图标显示状态
-   placeholder 控制输入框占位符文本

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   父组件通过 v-model 绑定值到 modelValue prop 并监听 update:modelValue 事件
-   无对外暴露接口

## 总结

PasswordInput.vue 是一个功能丰富的密码输入组件，支持密码可见性切换功能。它通过 v-model 实现双向数据绑定，并通过内置状态管理密码可见性。