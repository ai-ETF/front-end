<template>
  <div class="chat-input">
    <div class="input-wrapper" :class="{ 'multi-line': isMultiLine }">
      <!-- 前缀插槽（左侧图标） -->
      <!-- 修改前缀插槽，添加条件渲染 -->
      <div v-if="!isMultiLine" class="coin prefix">
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
      <!-- 修改后缀插槽，添加条件渲染 -->
      <div v-if="!isMultiLine" class="coin suffix">
        <slot name="suffix"></slot>
      </div>
      <!-- 多行模式下的底部按钮容器 -->
      <div v-if="isMultiLine" class="bottom-buttons">
        <div class="coin prefix-bottom">
          <slot name="prefix"></slot>
        </div>
        <div class="coin suffix-bottom">
          <slot name="suffix"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue'

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
// 添加一个ref来存储是否进入过多行模式的状态
const isMultiLineState = ref(false)

// 监听message变化，更新多行模式状态
watch(message, (newMessage) => {
  if (!textareaRef.value) return;
  
  // 如果内容为空，重置状态
  if (!newMessage.trim()) {
    isMultiLineState.value = false;
    // 重置高度以获取正确的滚动高度
    textareaRef.value.style.height = 'auto';
    return;
  }
  
  // 计算行数
  const lineCount = (newMessage.match(/\n/g) || []).length + 1;
  const lineHeight = parseInt(window.getComputedStyle(textareaRef.value).lineHeight);
  const scrollHeight = textareaRef.value.scrollHeight;
  const heightLineCount = Math.floor(scrollHeight / lineHeight);
  
  // 使用两种方法中较大的值判断是否超过1行（即输入到第二行）
  const isOverOneLine = Math.max(lineCount, heightLineCount) > 1;
  
  // 只有在超过一行时才更新状态为多行模式，避免反复横跳
  if (isOverOneLine) {
    isMultiLineState.value = true;
  }
})

// 计算是否为多行输入
const isMultiLine = computed(() => {
  return isMultiLineState.value;
});

// 监听isMultiLine的变化，触发底部按钮容器的动画
watch(isMultiLine, (newVal) => {
  nextTick(() => {
    // 触发重新渲染，确保动画生效
  });
});

// 发送逻辑（点击或回车）
const handleSend = (event: KeyboardEvent) => {
  // 只有在按下 Enter 键且没有按下 Shift 键时发送消息
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendInternal()
  }
}

// 内部发送逻辑，供外部调用
const sendInternal = () => {
  if (!message.value.trim() || props.disabled) return
  emit('send', message.value)
  message.value = ''
  // 发送消息后重置多行模式状态
  isMultiLineState.value = false;
  // 发送消息后重置高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.overflowY = 'hidden'
      // 重置包装器高度
      const wrapper = textareaRef.value.parentElement
      if (wrapper) {
        wrapper.style.height = 'auto'
      }
    }
  })
}

// 暴露message变量和handleSend方法给父组件访问
defineExpose({
  message,
  handleSend,
  send: sendInternal  // 添加一个可以直接发送的方法
})

// 处理输入事件，自动调整高度
const handleInput = () => {
  if (textareaRef.value) {
    // 保存当前滚动位置
    const scrollTop = textareaRef.value.scrollTop;
    
    // 重置高度以获取正确的滚动高度
    textareaRef.value.style.height = `${Math.max(textareaRef.value.scrollHeight - 24, 0)}px`;
    
    // 获取单行高度
    const singleLineHeight = parseInt(window.getComputedStyle(textareaRef.value).lineHeight);
    
    // 计算实际需要的高度
    const scrollHeight = textareaRef.value.scrollHeight;
    
    // 设置最小高度为单行高度
    const minHeight = singleLineHeight;
    
    // 计算最大高度（例如6行的高度）
    const maxHeight = singleLineHeight * 12;
    
    // 根据内容设置合适的高度
    let newHeight = Math.max(scrollHeight, minHeight);
    
    // 如果内容高度超过最大高度，则启用滚动
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      textareaRef.value.style.overflowY = 'auto';
    } else {
      textareaRef.value.style.overflowY = 'hidden';
    }
    
    // 应用新高度
    textareaRef.value.style.height = `${newHeight}px`;
    
    // 恢复滚动位置
    textareaRef.value.scrollTop = scrollTop;
    
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
</style>

<style scoped>
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
  min-height: 48px;         /* 最小高度，允许增长 */
  display: flex;            /* 使用 flex 布局，让子元素水平排列 */
  align-items: center;      /* 垂直居中 */
  background: #fff;         /* 背景白色 */
  border: 1px solid #ddd;   /* 边框颜色为淡灰色 */
  border-radius: 40px;      /* 圆角大小，可根据喜好调节 */
  padding: 8px 16px;        /* 调整内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 微小阴影，增加立体感 */ 
  position: relative;       /* 为内部元素定位做准备 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

/* 修改多行输入时的样式，确保底部按钮有足够空间 */
.input-wrapper.multi-line {
  flex-direction: column;
  align-items: stretch;
  border-radius: 18px;
  padding: 12px 12px 56px 12px; /* 增加底部内边距 */
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

/* 多行输入时文本区域 */
.input-wrapper.multi-line .textarea-wrapper {
  width: 100%;
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
  font-size: 20px; /* 字体大小 */
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
  font-size: 19px; /* 稍微小一点的字体 */
  letter-spacing: 0.2px; /* 轻微字间距 */
  transition: color 0.3s ease;
  line-height: 1.3;         /* 与输入框行高一致 */
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
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1); /* 更流畅的过渡动画 */
  opacity: 1;
  transform: translateX(0);
}

/* 确保多行模式下默认图标完全隐藏且不占空间 */
.input-wrapper.multi-line .prefix,
.input-wrapper.multi-line .suffix {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  pointer-events: none;
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
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

/* ===== 左右间距控制 ===== */
.prefix {
  margin-right: 8px;         /* 增大前缀图标与输入框之间的间距 */
}

.suffix {
  margin-left: 8px;          /* 增大后缀图标与输入框之间的间距 */
}

/* 多行输入时底部按钮容器 */
.bottom-buttons {
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  padding: 0 8px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1); /* 统一过渡效果 */
  opacity: 0; /* 默认隐藏 */
  transform: translateY(10px) scale(0.95); /* 初始位置向下偏移并缩小 */
  pointer-events: none; /* 默认禁用交互 */
}

/* 确保底部按钮容器正确显示 */
.input-wrapper.multi-line .bottom-buttons {
  opacity: 1; /* 显示底部按钮 */
  transform: translateY(0) scale(1); /* 恢复正常位置和大小 */
  pointer-events: auto; /* 启用交互 */
}

/* 多行输入时底部图标 */
.prefix-bottom,
.suffix-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.input-wrapper.multi-line .prefix-bottom,
.input-wrapper.multi-line .suffix-bottom {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.prefix-bottom:hover,
.suffix-bottom:hover {
  background: #f2f2f2;
}

/* 动画效果 */
.prefix,
.suffix,
.prefix-bottom,
.suffix-bottom {
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
</style>
