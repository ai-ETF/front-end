<template>
  <div class="chat-input">
    
    <div class="input-wrapper">
      <!-- 前缀插槽（左侧图标） -->
      <div class="coin prefix">
        <slot name="prefix"></slot>
      </div>

      <!-- 输入框包装器，用于实现垂直居中 -->
      <div class="textarea-wrapper">
        <textarea
          ref="textareaRef"
          v-model="message"
          class="input-field"
          :disabled="disabled"
          placeholder="输入消息..."
          @keydown.enter="handleSend"
          @input="handleInput"
        ></textarea>
      </div>

      <!-- 后缀插槽（右侧图标） -->
      <div class="coin suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, nextTick, defineExpose } from 'vue'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

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
    if (!message.value.trim() || props.disabled) return
    emit('send', message.value)
    message.value = ''
    // 发送消息后重置高度
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
        // 高度减去24px
        const currentHeight = parseInt(textareaRef.value.style.height) || 0;
        textareaRef.value.style.height = `${Math.max(currentHeight - 24, 0)}px`;
        // 重置包装器高度
        const wrapper = textareaRef.value.parentElement
        if (wrapper) {
          wrapper.style.height = 'auto'
        }
      }
    })
  }
}

// 处理输入事件，自动调整高度
const handleInput = () => {
  if (textareaRef.value) {
    // 重置高度以获取正确的滚动高度并减去24px
    textareaRef.value.style.height = `${Math.max(textareaRef.value.scrollHeight - 24, 0)}px`;
    // 获取单行高度
    const singleLineHeight = parseInt(window.getComputedStyle(textareaRef.value).lineHeight);
    // 计算最大高度（例如6行的高度）
    const maxHeight = singleLineHeight * 6;
    // 获取内容实际需要的高度
    const scrollHeight = textareaRef.value.scrollHeight;
    
    // 如果内容高度超过最大高度，则启用滚动，否则调整高度适应内容
    if (scrollHeight > maxHeight) {
      textareaRef.value.style.height = `${maxHeight}px`;
      textareaRef.value.style.overflowY = 'auto';
    } else {
      textareaRef.value.style.height = `${scrollHeight}px`;
      textareaRef.value.style.overflowY = 'hidden';
    }
    // 同时调整包装器高度
    const wrapper = textareaRef.value.parentElement
    if (wrapper) {
      wrapper.style.height = textareaRef.value.style.height
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
  width: 100%;              /* 改为100%宽度以充分利用可用空间 */
  min-width: 500px;         /* 设置更大的最小宽度 */
  max-width: 800px;         /* 设置最大宽度 */
  min-height: 48px;      /* 最小高度，允许增长 */
  display: flex;            /* 使用 flex 布局，让子元素水平排列 */
  align-items: center;      /* 垂直居中 */
  justify-content: center;  /* 添加这个：水平居中 */
  background: #fff;         /* 背景白色 */
  border: 1px solid #ddd;   /* 边框颜色为淡灰色 */
  border-radius: 40px;      /* 圆角大小，可根据喜好调节 */
  padding: 8px 16px;        /* 调整内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 微小阴影，增加立体感 */ 
  display: flex; 
  margin: 0 auto;           /* 水平居中 */
  position: relative;       /* 为内部元素定位做准备 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

/* 聚焦时的效果 */
.input-wrapper:focus-within {
  border-color: #faede9;    /* 聚焦时边框颜色变化 */
  box-shadow: 0 2px 15px rgba(75, 108, 183, 0.2); /* 增强阴影 */
  transform: translateY(-1px); /* 轻微上浮效果 */
}

/* ===== 输入框包装器 ===== */
.textarea-wrapper {
  flex: 1;
  display: flex;
  align-items: center; /* 垂直居中 */
  min-height: 24px;
  position: relative;
}

/* ===== 输入框本体 ===== */
.input-field {
  flex: 1;                 /* 占满剩余空间 */
  resize: none; /* 禁止用户手动调整大小 */
  border: none;   /* 移除默认边框 */
  outline: none; /* 移除默认边框 */
  /* 关键设置：让内容区域高度与文本高度匹配 */
  min-height: 24px; /* 设置最小高度 */
  height: 24px; /* 初始高度，与字体大小匹配 */
  padding: 0; /* 移除所有padding，使用line-height控制垂直间距 */
  background: transparent; /* 背景透明 */
  font-family: inherit; /* 继承父元素字体 */
  font-size: 17px; /* 字体大小 */
  line-height: 24px; /* 行高等于容器高度，确保单行文本垂直居中 */
  overflow-y: auto; /* 超出时显示滚动条 */
  text-align: left;    /* 文本左对齐 */
  box-sizing: border-box; /* 确保内边距和边框不改变容器大小 */
  /* 确保文本垂直居中 */
  display: block;
}

/* 输入框禁用状态样式 */
.input-field:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

/* 输入框placeholder样式 */
.input-field::placeholder {
  color: #999;
  text-align: left;       /* placeholder也居中 */
  font-size: 17px; /* 稍微小一点的字体 */
  letter-spacing: 0.2px; /* 轻微字间距 */
  transition: color 0.3s ease;
  line-height: 1.5;         /* 与输入框行高一致 */
}

/* 聚焦时placeholder变淡 */
.input-field:focus::placeholder {
  color: #ccc;
}

/* 单行输入时的特殊处理 */
.input-field.single-line {
  white-space: nowrap;      /* 防止换行 */
  overflow: hidden;         /* 隐藏溢出 */
  text-overflow: ellipsis;  /* 文本溢出显示省略号 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-wrapper {
    min-width: 300px;       /* 移动端减小最小宽度 */
    max-width: 100%;        /* 移动端可以占满宽度 */
    padding: 8px 16px;      /* 调整内边距 */
  }
  
  .input-field {
    font-size: 14px;        /* 移动端稍小字号 */
  }
}

/* 如果要在整个页面中居中显示输入框容器 */
.input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
}

/* ===== 图标容器统一样式（coin） ===== */
.coin {
  display: flex;             /* 使用 flex 居中图标 */
  align-items: center;       /* 垂直居中 */
  justify-content: center;   /* 水平居中 */
  width: 40px;               /* 增大容器宽度 */
  height: 40px;              /* 增大容器高度 */
  border-radius: 50%;        /* 圆形容器 */
  cursor: pointer;           /* 鼠标悬停显示手型 */
  transition: background 0.2s; /* 背景变化过渡动画 */
}

/* 鼠标悬停效果 */
.coin:hover {
  background: #f2f2f2;       /* 悬停时淡灰色背景，可调整 */
}

/* 禁用状态下的图标 */
.coin:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* svg 图标大小和颜色 */
.coin svg {
  width: 24px;               /* 增大图标宽度 */
  height: 24px;              /* 增大图标高度 */
  color: #555;               /* 图标颜色，可根据主题调整 */
}

/* ===== 左右间距控制 ===== */
.prefix {
  margin-right: 8px;         /* 增大前缀图标与输入框之间的间距 */
}

.suffix {
  margin-left: 8px;          /* 增大后缀图标与输入框之间的间距 */
}
</style>