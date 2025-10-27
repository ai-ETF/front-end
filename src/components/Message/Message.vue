<!-- 注释：这是一个 Vue 单文件组件，下面逐行解释每一行的作用，便于新手理解 -->
<!-- 定义模板区域，包含组件的 HTML 结构 -->
<template>
  <!-- 根容器：使用 Vue 的 class 绑定，根据 isUser 的值来决定额外的类 -->
  <div :class="['message', { 'user-message': isUser, 'ai-message': !isUser }]">
    <!-- 消息内容容器：用于包裹要显示的文本 -->
    <div 
      class="message-content"
      v-html="sanitizedContent"
    ></div>
  </div>
</template>

<!-- 使用 <script setup> 是 Vue 3 的简写写法，lang="ts" 表示使用 TypeScript -->
<script setup lang="ts">
/* 导入 Vue 的 computed，用来创建基于 props 的计算属性 */
import { computed } from 'vue';
/* 导入 MarkdownIt，用于把 Markdown 文本渲染成 HTML */
import MarkdownIt from 'markdown-it'
/* 导入 highlight.js，用于代码高亮 */
import hljs from 'highlight.js'
/* 导入 DOMPurify，用来净化渲染后的 HTML，防止 XSS 攻击 */
import DOMPurify from 'dompurify'
/* 导入一个 highlight.js 的样式（这里是 GitHub 风格），可以被后续的 CSS 覆盖 */
import 'highlight.js/styles/github.css'

/* 定义组件接收的 props 类型：text 是消息文本，isUser 表示是否是用户消息，timestamp 可选 */
interface Props {
  /* 要显示的文本内容（必填） */
  text: string
  /* 是否是用户发送的消息（必填） */
  isUser: boolean
  /* 时间戳，可选，默认为当前时间 */
  timestamp?: Date
}

/* withDefaults + defineProps 用来在 <script setup> 中声明 props 并提供默认值 */
const props = withDefaults(defineProps<Props>(), {
  /* 如果没有传 timestamp，就使用当前时间 */
  timestamp: () => new Date()
})

/* 创建一个 MarkdownIt 实例，并配置选项 */
const md = new MarkdownIt({
  html: true,        // 允许在 Markdown 中使用 HTML 标签
  linkify: true,     // 自动把文本中的 URL 转换成链接
  typographer: true, // 启用更好的引号、连字符等排版替换
  /* highlight 函数用于代码块高亮：highlight.js 提供具体颜色与标记 */
  highlight: function (str: string, lang: string) {
    // 如果提供了语言并且 highlight.js 支持该语言，则使用其高亮
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch (__) {}
    }

    /* 如果没有语言或高亮失败，安全地转义 HTML 并包裹在 pre/code 中 */
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

/* renderedContent：把 props.text 转成要插入到页面的 HTML 字符串 */
const renderedContent = computed(() => {
  // 用户消息不进行 Markdown 渲染（通常用户输入是纯文本）
  if (props.isUser) {
    // 转义 HTML 特殊字符
    const escapedText = props.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
    // 把换行符替换成 <br/>，保留用户的换行格式
    return escapedText.replace(/\n/g, '<br/>')
  }
  // AI 消息（或非用户）使用 Markdown 渲染成 HTML
  return md.render(props.text)
})

/* sanitizedContent：使用 DOMPurify 净化上面渲染出来的 HTML，避免 XSS 注入 */
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(renderedContent.value)
})
</script>

<style scoped>
/* 根容器样式：使用 flex 布局，保证气泡能很好地左右对齐 */
.message {
  display: flex;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* === 用户消息（右对齐）=== */
/* 用户消息时把容器推到右边 */
.user-message {
  justify-content: flex-end;
}

/* === AI 消息（居中）=== */
/* AI 消息居中显示 */
.ai-message {
  justify-content: center;
}

/* === 公共气泡样式 === */
/* 气泡的基本样式：内边距、圆角、字体大小、换行规则等 */
.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  transition: all 0.3s ease;
}

/* === 默认宽度（浏览器宽度中等时）=== */
/* AI 气泡的默认颜色、居中、宽度设置 */
.ai-message .message-content {

  color: #333;
  margin: 0 auto;
  width: 70%;
  border-bottom-left-radius: 4px;
}

/* 用户气泡的样式：背景、颜色、宽度、阴影等 */
.user-message .message-content {
  background-color: #f5f5f5;
  color: rgb(0, 0, 0);
  border-bottom-right-radius: 4px;
  width: 50%;
  margin-right: calc((100% - 70%) / 2);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

/* === 响应式：当窗口变窄时调整宽度 === */
@media (max-width: 1200px) {
  .ai-message .message-content {
    width: 75%;
  }
  .user-message .message-content {
    width: 55%;
    margin-right: calc((100% - 75%) / 2);
  }
}

@media (max-width: 1000px) {
  .ai-message .message-content {
    width: 80%;
  }
  .user-message .message-content {
    width: 60%;
    margin-right: calc((100% - 80%) / 2);
  }
}

@media (max-width: 800px) {
  .ai-message .message-content {
    width: 85%;
  }
  .user-message .message-content {
    width: 65%;
    margin-right: calc((100% - 85%) / 2);
  }
}

@media (max-width: 600px) {
  .ai-message .message-content {
    width: 90%;
  }
  .user-message .message-content {
    width: 70%;
    margin-right: calc((100% - 90%) / 2);
  }
}

/* ========== Markdown 内容样式（使用 :deep 以穿透 scoped） ========== */
/* 链接样式：默认蓝色，无下划线 */
.message-content :deep(a) {
  color: #1890ff;
  text-decoration: none;
}

/* 链接悬停时显示下划线 */
.message-content :deep(a:hover) {
  text-decoration: underline;
}

/* 标题样式：间距与加粗 */
.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3) {
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.message-content :deep(h1) {
  font-size: 24px;
}

.message-content :deep(h2) {
  font-size: 20px;
}

.message-content :deep(h3) {
  font-size: 18px;
}

/* 段落、列表、表格、引用等的基础间距和样式 */
.message-content :deep(p) {
  margin: 8px 0;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.message-content :deep(li) {
  margin: 4px 0;
}

.message-content :deep(blockquote) {
  margin: 8px 0;
  padding: 8px 16px;
  border-left: 4px solid #ddd;
  background-color: #f9f9f9;
  color: #666;
}

/* inline code 的样式（行内代码） */
.message-content :deep(code) {
  padding: 2px 4px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
}

/* 代码块（pre）的基础样式：内边距、圆角和横向滚动 */
.message-content :deep(pre) {
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
  background-color: #f9f9f9;
}

/* pre 内的 code 不需要额外内边距（高亮样式在 .hljs 上） */
.message-content :deep(pre code) {
  padding: 0;
  background: none;
  font-size: 14px;
}

/* 表格样式，边框和间距 */
.message-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.message-content :deep(th),
.message-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.message-content :deep(th) {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>