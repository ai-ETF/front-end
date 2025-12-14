---
date: 2025-12-10
tags:
  - front-end
  - component
content: 应用程序Logo组件，包含小猪图标和侧边栏折叠/展开功能
---

## <Logo.vue>（Logo组件）

Logo.vue 是应用程序的Logo组件，显示小猪表情符号作为品牌标识，并提供侧边栏折叠/展开功能。该组件根据侧边栏状态显示不同的界面元素，并具有动画效果。

## Template

### 主要结构

-   .logo：Logo容器
-   .logo-expanded：侧边栏展开时的Logo布局
-   .logo-left：Logo左侧区域，包含小猪图标
-   .logo-emoji：小猪表情图标
-   .logo-text：Logo文本（当前为空）
-   .logo-right：Logo右侧区域，包含折叠按钮
-   .collapse-icon：折叠/展开图标
-   .logo-collapsed：侧边栏折叠时的Logo布局
-   .expand-img：展开图标（鼠标悬停时显示）

### 布局/渲染逻辑

-   根据props.collapsed状态切换显示展开布局或折叠布局
-   展开布局：显示小猪图标和折叠按钮
-   折叠布局：仅显示小猪图标，鼠标悬停时显示展开按钮
-   使用mouseenter/mouseleave事件处理折叠状态下的图标切换

## Script（逻辑部分）

### 数据（输入 / 输出 / 状态）

-   props: 
    - collapsed：布尔值，表示侧边栏是否折叠
-   emits: 
    - toggle：当用户点击折叠/展开按钮时触发
-   expose: 
    - 无
-   state: 
    - 无内部状态

### 关键方法

1. handleToggle（点击折叠/展开图标时触发）：触发toggle事件通知父组件切换侧边栏状态

### 事件逻辑

-   点击折叠图标：触发侧边栏折叠
-   鼠标悬停/离开折叠状态Logo：切换显示小猪图标和展开图标

## 状态与 UI 映射

-   collapsed 控制显示展开布局还是折叠布局
-   鼠标悬停状态控制折叠布局下图标显示

## CSS

（此处不需要有任何内容）

## 组件之间的联系

-   父组件通过collapsed prop传递侧边栏状态
-   父组件监听toggle事件以响应折叠/展开操作

## 总结

Logo.vue 是一个品牌标识组件，集成了侧边栏控制功能。它根据侧边栏状态动态调整显示内容，并提供良好的用户交互体验，包括悬停效果和动画。