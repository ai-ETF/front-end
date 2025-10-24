<template>
  <div class="chat-input">
    <div class="input-wrapper">
      <!-- 前缀插槽（左侧图标） -->
      <div class="coin prefix">
        <slot name="prefix"></slot>
      </div>

      <!-- 输入框 -->
      <textarea
        v-model="message"
        class="input-field"
        placeholder="输入消息..."
        @keydown.enter="handleSend"
      ></textarea>

      <!-- 后缀插槽（右侧图标） -->
      <div class="coin suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

// 向父组件发出事件
const emit = defineEmits(['send'])
const message = ref('')

// 发送逻辑（点击或回车）
const handleSend = (event: KeyboardEvent) => {
  // 只有在按下 Enter 键且没有按下 Shift 键时发送消息
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!message.value.trim()) return
    emit('send', message.value)
    message.value = ''
  }
}
</script>

<style scoped>
/* ===== 布局容器 ===== */
.chat-input {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 300px; /* 调整位置：向下移动 */
  padding: 12px;
}

/* ===== 输入框外层容器 ===== */
.input-wrapper {
  width: 640px;
  min-width: 300px;
  min-height: 56px;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 50px;
  padding: 6px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ===== 输入框本体 ===== */
.input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  padding: 6px;
  resize: none; /* 禁止用户调整大小 */
  min-height: 24px; /* 最小高度 */
  max-height: 200px; /* 最大高度 */
  overflow-y: auto; /* 垂直滚动 */
  font-family: inherit; /* 使用与页面相同的字体 */
}

/* ===== 统一的图标容器（coin） ===== */
.coin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.coin:hover {
  background: #f2f2f2;
}

.coin svg {
  width: 18px;
  height: 18px;
  color: #555;
}

/* ===== 左右间距控制 ===== */
.prefix {
  margin-right: 6px;
}

.suffix {
  margin-left: 6px;
}
</style>