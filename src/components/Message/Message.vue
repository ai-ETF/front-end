<!-- 定义模板区域，包含组件的 HTML 结构 -->
<template>
  <!-- 根容器：使用 Vue 的 class 绑定，根据 isUser 的值来决定额外的类 -->
  <div :class="['message', { 'user-message': isUser, 'ai-message': !isUser }]">
    <!-- 消息内容容器：用于包裹要显示的文本 -->
    <div class="message-content">
      <!-- 在模板中插入从父组件传入的 text 属性（双大括号插值） -->
      {{ text }}
    </div>
  </div>
</template>

<!-- 使用 <script setup> 是 Vue 3 的简写写法，lang="ts" 表示使用 TypeScript -->
<script setup lang="ts">
import { onMounted } from 'vue';

/* 定义组件接收的 props 类型 */
interface Props {
  /* 要显示的文本内容（必填） */
  text: string
  /* 是否是用户发送的消息（必填） */
  isUser: boolean
  /* 时间戳，可选，默认为当前时间 */
  timestamp?: Date
}

const props = withDefaults(defineProps<Props>(), {
  timestamp: () => new Date()
})

// 添加调试日志
onMounted(() => {
  console.log('Message component mounted with props:', props);
  console.log('isUser value:', props.isUser);
  console.log('Computed classes should be:', props.isUser ? 'user-message' : 'ai-message');
})
</script>

<!-- scoped 样式只作用于当前组件，避免样式污染其他组件 -->
<style scoped>
/* .message 是消息的外层容器样式 */
.message {
  display: flex;
  margin-bottom: 16px;
  max-width: 80%;
  align-items: flex-end;
}

/* .user-message 是当 isUser 为 true 时加的类，负责将消息靠右显示 */
.user-message {
  margin-left: auto;
  justify-content: flex-end;
}

/* .ai-message 是当 isUser 为 false 时加的类，负责将消息靠左显示 */
.ai-message {
  margin-right: auto;
  justify-content: flex-start;
}

/* .message-content 是实际显示文本的气泡样式 */
.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  /* box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); */
}

/* 用户消息的气泡颜色和圆角调整 */
.user-message .message-content {
  background-color: #1890ff;
  color: white;
  border-bottom-right-radius: 4px;
}

/* AI（非用户）消息的气泡颜色和圆角调整 */
.ai-message .message-content {
  background-color: #f5f5f5;
  color: #333;
  border-bottom-left-radius: 4px;
}
</style>