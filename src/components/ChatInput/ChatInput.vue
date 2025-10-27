<template>
  <div class="chat-input">
    
    <div class="input-wrapper">
      <!-- 前缀插槽（左侧图标） -->
      <div class="coin prefix">
        <slot name="prefix"></slot>
      </div>

      <!-- 输入框 -->
      <textarea
        ref="textareaRef"
        v-model="message"
        class="input-field"
        placeholder="输入消息..."
        @keydown.enter="handleSend"
        @input="handleInput"
      ></textarea>

      <!-- 后缀插槽（右侧图标） -->
      <div class="coin suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, nextTick, defineExpose } from 'vue'

// 向父组件发出事件
const emit = defineEmits(['send'])
const message = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 暴露message变量给父组件访问
defineExpose({
  message
})

// 发送逻辑（点击或回车）
const handleSend = (event: KeyboardEvent) => {
  // 只有在按下 Enter 键且没有按下 Shift 键时发送消息
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!message.value.trim()) return
    emit('send', message.value)
    message.value = ''
    // 发送消息后重置高度
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
      }
    })
  }
}

// 处理输入事件，自动调整高度
const handleInput = () => {
  if (textareaRef.value) {
    // 重置高度以获取正确的滚动高度
    textareaRef.value.style.height = 'auto'
    
    // 获取单行高度
    const singleLineHeight = parseInt(window.getComputedStyle(textareaRef.value).lineHeight);
    // 计算12行的高度
    const maxHeight = singleLineHeight * 12;
    // 获取内容实际需要的高度
    const scrollHeight = textareaRef.value.scrollHeight;
    
    // 如果内容高度超过12行，则启用滚动，否则调整高度适应内容
    if (scrollHeight > maxHeight) {
      textareaRef.value.style.height = `${maxHeight}px`;
      textareaRef.value.style.overflowY = 'auto';
    } else {
      textareaRef.value.style.height = `${scrollHeight}px`;
      textareaRef.value.style.overflowY = 'hidden';
    }
  }
}
</script>

<style scoped>
/* ===== 全局盒模型 ===== */
* {
  box-sizing: border-box; /* 统一所有元素的盒模型，padding/border 会算在宽高内 */
}

/* ===== 聊天输入组件整体容器 ===== */
.chat-input {
  width: 100%;               /* 宽度占满父容器 */
  display: flex;             /* 使用 flex 布局方便水平居中 */
  justify-content: center;   /* 水平居中 */
  /* margin-top: 300px;         向下移动组件，可以根据需要调整 */
  padding: 12px;             /* 内边距，保持左右空间 */
}

/* ===== 输入框外层容器 ===== */
.input-wrapper {
  width: 770px;              /* 固定宽度，可根据需求调整 */
  min-width: 300px;           /* 最小宽度，避免窗口过小时太窄 */
  display: flex;             /* 使用 flex 布局，让子元素水平排列 */
  align-items: flex-end;     /* 垂直方向贴底部（图标和输入框底对齐） */
  background: #fff;          /* 背景白色 */
  border: 1px solid #ddd;    /* 边框颜色为淡灰色 */
  border-radius: 40px;       /* 圆角大小，可根据喜好调节 */
  padding: 4px 12px;         /* 内边距：上下4px，左右12px */
  min-height: 20px;          /* 最小高度，保证输入框不会塌陷 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 微小阴影，增加立体感 */
}

/* ===== 输入框本体 ===== */
.input-field {
  flex: 1;                   /* 占满剩余空间 */
  resize: none;              /* 禁止用户手动拖动调整大小 */
  border: none;              /* 去掉默认边框 */
  outline: none;             /* 去掉点击时的蓝色边框 */
  min-height: 32px;          /* 最小高度，可根据需要调节 */
  line-height: 1.4;          /* 每行文字高度，影响输入框行距 */
  padding: 4px;              /* 内边距，控制文字和边框的间距 */
  background: transparent;   /* 背景透明，显示父容器背景 */
  font-family: inherit;      /* 继承父元素字体 */
  font-size: 15px;           /* 字号，可调整文字大小 */
  overflow-y: hidden;        /* 默认隐藏垂直滚动，超过内容时通过 JS 控制 */
}

/* ===== 图标容器统一样式（coin） ===== */
.coin {
  display: flex;             /* 使用 flex 居中图标 */
  align-items: center;       /* 垂直居中 */
  justify-content: center;   /* 水平居中 */
  width: 28px;               /* 容器宽度，可调整图标大小 */
  height: 28px;              /* 容器高度，可调整图标大小 */
  border-radius: 50%;        /* 圆形容器 */
  cursor: pointer;           /* 鼠标悬停显示手型 */
  transition: background 0.2s; /* 背景变化过渡动画 */
}

/* 鼠标悬停效果 */
.coin:hover {
  background: #f2f2f2;       /* 悬停时淡灰色背景，可调整 */
}

/* svg 图标大小和颜色 */
.coin svg {
  width: 18px;               /* 图标宽度 */
  height: 18px;              /* 图标高度 */
  color: #555;               /* 图标颜色，可根据主题调整 */
}

/* ===== 左右间距控制 ===== */
.prefix {
  margin-right: 6px;         /* 前缀图标与输入框之间的间距 */
}

.suffix {
  margin-left: 6px;          /* 后缀图标与输入框之间的间距 */
}

</style>