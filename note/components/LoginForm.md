---
date: 2025-12-10
tags:
  - front-end
  - component
content: 登录表单组件，提供用户登录功能
---

## <LoginForm.vue>（登录表单组件）

LoginForm.vue 是一个登录表单组件，提供用户登录功能。它包含邮箱和密码输入框、密码可见性切换、错误提示和登录按钮等功能。

## Template

### 主要结构

-   .page-container：页面容器
-   .logo：品牌标识区域，包含PigLogo组件和应用名称
-   .title：标题
-   .subtitle：副标题
-   .input-container：输入框容器
-   .input-group：输入框组
-   .input-frame：输入框框架
-   .input-icon：输入框图标
-   .input-field：输入框
-   .eye-icon：眼睛图标，用于切换密码可见性
-   .error-message：错误消息显示
-   .continue-btn：登录按钮
-   .link-text：忘记密码链接
-   .bottom-text：底部注册链接

### 布局/渲染逻辑

-   使用flex布局实现页面居中
-   包含邮箱和密码两个输入框
-   密码输入框支持可见性切换
-   根据loading状态切换登录按钮文本
-   显示错误消息

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - 无
-   emits: 
    - 无
-   expose: 
    - 无
-   state: 
    - email：邮箱输入值
    - password：密码输入值
    - showPassword：密码可见性状态
    - errorMessage：错误消息
    - loading：登录加载状态

### 关键方法

1. handleLogin：处理登录逻辑
2. togglePasswordVisibility：切换密码可见性
3. login：调用认证服务登录方法
4. router.push：路由跳转

### 事件逻辑

-   点击登录按钮：执行登录逻辑
-   点击眼睛图标：切换密码可见性

## 状态与 UI 映射

-   email/password 控制输入框值
-   showPassword 控制密码输入框类型和眼睛图标显示
-   errorMessage 控制错误消息显示
-   loading 控制登录按钮状态和文本

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   使用useSupabaseAuth composable处理认证逻辑
-   使用PigLogo组件显示品牌标识
-   使用router进行页面跳转

## 总结

LoginForm.vue 是一个完整的登录表单组件，提供了用户登录所需的所有功能，包括输入验证、错误处理、密码可见性切换和加载状态显示。它与认证服务紧密集成，为用户提供流畅的登录体验。