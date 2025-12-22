---
date: 2025-12-18
tags:
- front-end
- composable
- issue
content: 记录并解决 useSupabaseAuth 中 onMounted 调用问题
---

## useSupabaseAuth 中的 onMounted 问题

### 问题描述

在项目中出现了如下警告信息：

```
useSupabaseAuth.ts:295  [Vue warn]: onMounted is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.
```

### 问题原因

该问题出现在 [useSupabaseAuth.ts](file:///home/sing/smartAnalysisOfETF/front-end/src/composables/useSupabaseAuth.ts) 文件中，具体原因是：

1. 在组合式函数中直接调用了 `onMounted` 生命周期钩子
2. 当在组件的 `async setup()` 中使用组合式函数时，如果在第一个 `await` 语句之后调用 `onMounted`，就会出现此警告

### 解决方案

我们采用了以下解决方案：

1. 在 [useSupabaseAuth.ts](file:///home/sing/smartAnalysisOfETF/front-end/src/composables/useSupabaseAuth.ts) 中移除了直接的 `onMounted` 调用，改为提供一个 `mount` 方法供组件在合适的时机调用

2. 在 [Sidebar.vue](file:///home/sing/smartAnalysisOfETF/front-end/src/components/Sidebar/Sidebar.vue) 中，通过 `onMounted` 正确调用 `mount` 方法来初始化认证状态

### 修改要点

#### useSupabaseAuth.ts 中的修改：

```typescript
// 原来的代码（有问题）
onMounted(() => {
  initAuth()
})

// 修改后的代码（解决问题）
const mount = () => {
  initAuth()
}
```

#### Sidebar.vue 中的修改：

```typescript
// 获取 useSupabaseAuth 中的 mount 方法
const { isAuthenticated, mount } = useSupabaseAuth()

// 在 onMounted 中正确调用
onMounted(() => {
  console.log('Sidebar 组件已挂载，当前折叠状态：', props.collapsed)
  
  // 初始化认证状态
  mount()
  
  // 加载聊天记录
  loadChatsToStore().then(() => {
    console.log('聊天页面加载执行完成。')
  })
})
```

### 最佳实践总结

为了避免类似问题，我们应该遵循以下最佳实践：

1. 在组合式函数中不要直接调用生命周期钩子，而是提供方法供组件调用
2. 在组件中使用 `onMounted` 等生命周期钩子时，确保在同步执行的代码中调用
3. 如果需要在组件挂载时执行某些操作，应该在组件中显式地使用 `onMounted` 并调用组合式函数提供的方法