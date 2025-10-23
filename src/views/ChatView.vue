<script setup lang="ts">
import { ref } from 'vue'
import { Input } from 'ant-design-vue'
</script>


<template>
  <div class="center-shell">
    <h1 class="title">有什么需要帮助的吗？</h1>
    <Input class="input-style" placeholder="询问任何问题" />
  </div>
</template>


<style scoped>
/* 使用 Flex 布局来近似原来的 Grid 定位，并逐行注释 */
* { box-sizing: border-box; } /* 统一盒模型 */
.center-shell {
  height: calc(100vh - 64px); /* 容器高度 */
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 垂直堆叠子元素 */
  align-items: center; /* 子元素水平居中 */
  justify-content: center; /* 子元素垂直居中 */
  gap: 16px; /* 元素间距 */
  padding: 16px; /* 内边距 */
  /* 渐变背景 */
  /* background: linear-gradient(180deg,#041021 0%, #081426 100%); */
}

/* 为了模拟 grid 的 grid-column:3/7 跨度，我们限制标题最大宽度为容器的约 33% 到 58% 之间 */
.title {
  margin: 0; /* 重置外边距 */
  font-size: 28px; /* 字号 */
  color: #000000; /* 文字颜色 */
  text-align: center; /* 文字居中 */
  width: 40%; /* 近似占据 3/7 的视觉宽度（可调整） */
  max-width: 58%; /* 不超过 58% */
  min-width: 33%; /* 最小约 33% */
}

.input-style {
  width: 560px; /* 固定宽度以匹配桌面布局 */
  max-width: 90%; /* 响应式上限 */
}

.input-style .ant-input {
  border-radius: 8px; /* 圆角 */
  padding: 10px 12px; /* 内边距 */
  background: rgba(255,255,255,0.02); /* 背景色 */
  color: #e6eef8; /* 文本颜色 */
  border: 1px solid rgba(255,255,255,0.04); /* 边框 */
}

@media (max-width: 768px) {
  .title { width: 80%; min-width: auto; max-width: 90%; font-size: 22px } /* 中等屏：标题扩展以适配 */
  .input-style { width: 100% } /* 中等屏：输入占满宽度 */
}

@media (max-width: 420px) {
  .title { font-size: 18px } /* 小屏：更小字体 */
}
</style>