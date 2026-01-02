<script setup lang="ts">
/**
 * Logo.vue - Logo 组件
 * 
 * 这个组件负责显示应用程序的 Logo，包括：
 * 1. Logo 图标（小猪表情符号）
 * 2. 应用名称（当前为空）
 * 3. 折叠/展开按钮
 * 
 * 使用了 Vue 3 的 Composition API 和 TypeScript
 */

// 导入侧边栏折叠和展开的 SVG 图标
import sider_collapsed from '@/assets/svg/sidebar-collapse.svg'
import sider_expand from '@/assets/svg/sidebar-expand.svg'

// 定义组件接收的属性（props）类型
interface Props {
  // 侧边栏是否折叠的状态（可选）
  collapsed?: boolean
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  // 默认不传入 collapsed 值
  collapsed: undefined
})

// 定义组件可以触发的事件类型
interface Emits {
  // 当用户点击折叠/展开按钮时触发的事件
  (e: 'toggle'): void
}

// 定义组件可以触发的事件
const emit = defineEmits<Emits>()

// 处理切换事件
const handleToggle = () => {
  // 触发 toggle 事件，通知父组件切换侧边栏状态
  emit('toggle')
}
</script>

<template>
  <!-- Logo 区域 -->
  <div class="logo">
    <!-- 当侧边栏未折叠时显示的内容 -->
    <div v-if="!props.collapsed" class="logo-expanded">
      <div class="logo-left">
        <!-- 
          Logo 图标（小猪表情）
          class="logo-emoji" - 应用自定义样式
        -->
        <span class="logo-emoji">🐽</span>
        
        <!-- Logo 文本（当前为空） -->
        <span class="logo-text"></span>
      </div>
      
      <div class="logo-right">
        <!-- 
          折叠图标，点击可切换侧边栏折叠状态
          :src - 绑定图片源
          alt - 图片的替代文本
          class - 应用自定义样式
          @click - 点击事件处理
        -->
        <img
          :src="sider_collapsed"
          alt="Navigation"
          class="collapse-icon"
          @click="handleToggle"
        />
      </div>
    </div>

    <!-- 当侧边栏折叠时显示的内容 -->
    <div
      v-else
      class="logo-collapsed"
      @mouseenter="(e) => {
        // 鼠标悬停时的处理逻辑
        // 查找猪鼻子图标和展开图标元素
        const pig = (e.currentTarget as HTMLElement).querySelector('.logo-emoji');
        const img = (e.currentTarget as HTMLElement).querySelector('.expand-img');
        // 隐藏猪鼻子图标，显示展开图标
        if (pig) (pig as HTMLElement).style.display = 'none';
        if (img) (img as HTMLElement).style.display = 'block';
      }"
      @mouseleave="(e) => {
        // 鼠标离开时的处理逻辑
        // 查找猪鼻子图标和展开图标元素
        const pig = (e.currentTarget as HTMLElement).querySelector('.logo-emoji');
        const img = (e.currentTarget as HTMLElement).querySelector('.expand-img');
        // 显示猪鼻子图标，隐藏展开图标
        if (pig) (pig as HTMLElement).style.display = 'flex';
        if (img) (img as HTMLElement).style.display = 'none';
      }"
    >
      <!-- 折叠时默认显示猪鼻子 -->
      <span class="logo-emoji" style="display:flex" @click="handleToggle">🐽</span>

      <!-- 鼠标悬停时显示的展开图标（默认隐藏） -->
      <img
        :src="sider_expand"
        alt="Expand"
        class="collapse-icon expand-img"
        style="display:none"
        @click="handleToggle"
      />
    </div>
  </div>
</template>

<style scoped>
/**
 * scoped 样式说明：
 * 使用 scoped 可以确保这些样式只应用于当前组件，
 * 不会影响其他组件的样式
 */

/* 
 * ======================================================
 * LOGO 区域（侧边栏顶部）
 * ======================================================
 * - 非折叠状态（宽 260）
 * - 折叠状态（宽 80）
 * 这个区域包含 .logo-expanded 和 .logo-collapsed 两种子状态
 */

/* 外层容器：固定高度，左右内边距，水平两端对齐 */
.logo {
  /* 占据父容器的全部宽度 */
  width: 100%;
  
  /* 固定高度 */
  height: 52px;
  
  /* 使用弹性布局 */
  display: flex;
  
  /* 垂直居中内容 */
  align-items: center;
  
  /* 左右内边距 */
  padding: 0 16px;
  
  /* 折叠时平滑过渡 */
  transition: all 0.3s ease;
  
  /* 盒模型设置 */
  box-sizing: border-box;
  
  /* 左右两端对齐 */
  justify-content: space-between;
}

/* 非折叠时的内部布局：左右两部分 */
.logo-expanded {
  /* 使用弹性布局 */
  display: flex;
  
  /* 垂直居中 */
  align-items: center;
  
  /* 占据全部宽度 */
  width: 100%;
  
  /* 盒模型设置 */
  box-sizing: border-box;
  
  /* 左右两端对齐 */
  justify-content: space-between;
}

/* 折叠时的布局：内容居中 */
.logo-collapsed {
  /* 使用弹性布局 */
  display: flex;
  
  /* 垂直居中 */
  align-items: center;
  
  /* 水平居中 */
  justify-content: center;
  
  /* 占据全部宽度 */
  width: 100%;
  
  /* 盒模型设置 */
  box-sizing: border-box;
  
  /* 固定高度 */
  height: 52px;
}

/* logo 小图标（用于图片或 emoji） */
.logo-image {
  /* 宽度 */
  width: 24px;
  
  /* 高度 */
  height: 24px;
  
  /* 盒模型设置 */
  box-sizing: border-box;
}

/* logo 左侧容器（放 emoji 或图片） */
.logo-left {
  /* 使用弹性布局 */
  display: flex;
  
  /* 水平居中 */
  justify-content: center;
  
  /* 垂直居中 */
  align-items: center;
  
  /* 高度 */
  height: 36px;
  
  /* 宽度 */
  width: 36px;
  
  /* 盒模型设置 */
  box-sizing: border-box;
}

.logo-right {
  /* 使用弹性布局 */
  display: flex;
  
  /* 水平居中 */
  justify-content: center;
  
  /* 垂直居中 */
  align-items: center;
  
  /* 高度 */
  height: 36px;
  
  /* 宽度 */
  width: 36px;
  
  /* 盒模型设置 */
  box-sizing: border-box;
}

/* 折叠/展开图标样式（图片或 SVG） */
.collapse-icon {
  /* 宽度 */
  width: 24px;
  
  /* 高度 */
  height: 24px;
  
  /* 盒模型设置 */
  box-sizing: border-box;
  
  /* 鼠标悬停显示手型，表示可点击 */
  cursor: pointer;
  
  /* 平滑动画 */
  transition: all 0.3s;
  
  /* 轻微圆角 */
  border-radius: 4px;
}

/* hover 时的视觉反馈（背景 + 放大） */
.collapse-icon:hover {
  /* 浅蓝背景提示可操作 */
  background-color: #e6f7ff;
  
  /* 放大一点点 */
  transform: scale(1.2);
}

/* logo 文字（侧栏展开时显示的应用名称） */
.logo-text {
  /* Ant Design 蓝色 */
  color: #1890ff;
  
  /* 字体大小 */
  font-size: 18px;
  
  /* 字体粗细 */
  font-weight: 600;
  
  /* 不换行 */
  white-space: nowrap;
  
  /* 超出隐藏 */
  overflow: hidden;
  
  /* 超出显示省略号 */
  text-overflow: ellipsis;
  
  /* 盒模型设置 */
  box-sizing: border-box;
}

/* 
 * ======================================================
 * 小猪表情（emoji）样式与动画（关键部分）
 * ======================================================
 */

/* 基础样式 */
.logo-emoji {
  /* 字体大小 */
  font-size: 24px;
  
  /* 光标样式 */
  cursor: pointer;
  
  /* 过渡动画 */
  transition: all 0.3s ease;
  
  /* 内边距 */
  padding: 6px;
  
  /* 圆角 */
  border-radius: 50%;
  
  /* 相对定位 */
  position: relative;
  
  /* 显示方式 */
  display: flex;
  
  /* 居中对齐 */
  align-items: center;
  justify-content: center;
  
  /* 阴影效果 */
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.1);
  
  /* 背景渐变 */
  background: radial-gradient(circle at 30% 30%, #ffb6c1, #ff69b4);
}

/* 入场动画关键帧 */
@keyframes piggy-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ======================================================
  小猪表情（emoji）样式与动画（关键部分）
  - 这个是你关注动画效果的主要目标：.logo-emoji
  - 包括鼠标 hover、active、以及入场动画
  ====================================================== */

/* 1) 定义入场动画 keyframes：piggy-pop
  动画解释（百分比）：
  - 0%：开始时缩小并带一点旋转，几乎透明
  - 60%：过冲（稍微放大并有小角度旋转），变为不透明
  - 100%：回到正常大小和角度
  这会产生一种“弹出”的动态效果，常用来提高视觉活力。
*/
@keyframes piggy-pop {
  0% {
   transform: scale(0.8) rotate(-10deg);
   opacity: 0; /* 从透明开始出现 */
  }
  60% {
   transform: scale(1.08) rotate(5deg); /* 过冲效果（稍微放大） */
   opacity: 1;
  }
  100% {
   transform: scale(1) rotate(0deg); /* 最终恢复正常大小与角度 */
   opacity: 1;
  }
}

/* 2) .logo-emoji 的样式与交互（关键规则）
  解释每一项属性的作用，便于初学者理解：
  - font-size：决定 emoji 的视觉大小
  - display / align-items / justify-content：使其成为一个圆形容器并居中内容
  - width / height：定义圆盘尺寸
  - background：径向渐变，制造漂亮的高光色彩
  - border-radius:50%：变为圆形
  - box-shadow：内外阴影让图标更“立体”
  - transition：鼠标 hover 时平滑过渡
  - cursor / user-select：提示可交互并禁止选择（避免拖选 emoji）
  - animation：入场播放我们上面定义的 keyframes（0.6s）
*/
.logo-emoji {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  /* 渐变背景（从浅到深），看起来像高光 */
  background: radial-gradient(circle at 30% 30%, #ffe8ec, #ffc2cc);

  border-radius: 50%; /* 圆形 */
  /* 阴影：inset 是内阴影，后面是外阴影（更有层次） */
  box-shadow:
   inset 0 1px 2px rgba(255, 255, 255, 0.8),
   0 2px 4px rgba(0, 0, 0, 0.1),
   0 0 6px rgba(255, 182, 193, 0.4);

  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); /* 过渡曲线，常见的缓动函数 */
  cursor: pointer;     /* 提示可点 */
  user-select: none;   /* 禁止选中文本，防止拖选动画乱动 */

  animation: piggy-pop 0.6s ease-out; /* 入口动画，播放一次 */
}

/* Hover（鼠标悬停）时的效果：
  - 轻微旋转和放大（更活泼）
  - 更强的投影和更暖的背景
*/
.logo-emoji:hover {
  transform: rotate(8deg) scale(1.08);
  box-shadow:
   inset 0 1px 2px rgba(255, 255, 255, 0.9),
   0 3px 6px rgba(255, 182, 193, 0.6),
   0 0 8px rgba(255, 182, 193, 0.6);
  background: radial-gradient(circle at 25% 25%, #ffdbe2, #ffa9b8);
}

/* Active（按下 / 点击）时的效果：
  - 稍微缩小，制造按压感
  - 更深的内阴影（像被按下去了）
*/
.logo-emoji:active {
  transform: rotate(0deg) scale(0.96);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}


</style>