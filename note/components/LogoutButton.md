---
date: 2025-12-10
tags:
  - front-end
  - component
content: 登出按钮组件，提供用户登出功能
---

## <LogoutButton.vue>（登出按钮组件）

LogoutButton.vue 是一个登出按钮组件，提供用户登出功能。它根据侧边栏状态显示不同的布局，并与认证服务集成执行登出操作。

## Template

### 主要结构

-   .logout-button：登出按钮容器
-   .menu-item：菜单项容器
-   .menu-icon：菜单图标容器
-   LogoutOutlined：登出图标组件
-   .menu-label：菜单文本标签
-   transition：折叠动画容器

### 布局/渲染逻辑

-   根据props.collapsed状态切换显示布局
-   展开状态：显示图标和文本标签
-   折叠状态：仅显示图标，文本标签通过动画隐藏
-   使用transition组件实现折叠时的淡入淡出动画

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - collapsed：布尔值，表示侧边栏是否折叠
-   emits: 
    - 无
-   expose: 
    - 无
-   state: 
    - 无内部状态

### 关键方法

1. handleLogout：处理登出逻辑
2. logout：调用认证服务登出方法
3. router.push：路由跳转（当前被注释）

### 事件逻辑

-   点击登出按钮：执行登出逻辑

## 状态与 UI 映射

-   collapsed 控制显示展开布局还是折叠布局
-   登出操作成功后可跳转到登录页面

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   使用useSupabaseAuth composable处理认证逻辑
-   使用LogoutOutlined图标组件
-   通过props接收折叠状态

## 总结

LogoutButton.vue 是一个简洁的登出按钮组件，与侧边栏状态集成良好。它能够根据侧边栏的折叠状态自动调整显示布局，并提供流畅的动画效果。该组件与认证服务紧密集成，为用户提供便捷的登出功能。