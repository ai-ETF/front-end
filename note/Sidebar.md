---
date: 2025-12-10
tags:
  - front-end
  - component
content: 侧边栏组件，提供应用程序的主要导航功能
---

## <Sidebar.vue>（侧边栏组件）

Sidebar.vue 是一个侧边栏组件，提供应用程序的主要导航功能。它包含Logo、自定义菜单、动态聊天列表和登出按钮，并支持折叠状态。

## Template

### 主要结构

-   .sidebar-container：侧边栏容器
-   Logo组件：显示应用程序Logo和折叠控制
-   .custom-menu：自定义菜单区域
-   .menu-item：菜单项容器
-   .menu-icon：菜单图标容器
-   .menu-label：菜单文本标签
-   .chat-list：动态聊天列表区域
-   .chat-list-title：聊天列表标题
-   .chat-list-item：聊天列表项
-   LogoutButton组件：登出按钮

### 布局/渲染逻辑

-   根据props.collapsed状态切换显示布局
-   菜单项支持选中状态高亮
-   聊天列表支持内部折叠
-   使用transition组件实现折叠时的淡入淡出动画

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - menuItems：菜单项数组，默认包含新建对话和文档库
    - collapsed：布尔值，表示侧边栏是否折叠
    - width：侧边栏宽度，默认260px
-   emits: 
    - update:collapsed：当侧边栏折叠状态改变时触发
    - menuClick：当菜单项被点击时触发
-   expose: 
    - 无
-   state: 
    - selectedKeys：选中的菜单项key数组
    - chatCollapsed：聊天列表内部折叠状态
    - chatStore：聊天状态存储

### 关键方法

1. handleMenuClick：处理菜单项点击
2. toggleChatList：切换聊天列表折叠状态
3. router.push：路由跳转

### 事件逻辑

-   点击菜单项：更新选中状态并跳转路由
-   点击聊天列表标题：切换聊天列表折叠状态
-   点击聊天项：跳转到对应聊天页面

## 状态与 UI 映射

-   collapsed 控制侧边栏整体折叠状态
-   selectedKeys 控制菜单项选中状态
-   chatCollapsed 控制聊天列表内部折叠状态
-   chatStore.chats 控制聊天列表显示

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   使用Logo组件显示品牌标识和折叠控制
-   使用LogoutButton组件提供登出功能
-   使用chatStore管理聊天状态
-   通过props接收配置参数
-   通过emit触发事件通知父组件

## 总结

Sidebar.vue 是一个功能丰富的侧边栏组件，集成了应用程序的主要导航元素。它支持折叠状态、菜单选中高亮、动态聊天列表和登出功能，为用户提供完整的导航体验。组件具有良好的扩展性，可以通过props自定义菜单项。