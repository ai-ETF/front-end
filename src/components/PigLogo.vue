<script setup lang="ts">
// PigLogo.vue - 小猪图标组件
// 这个组件只包含小猪鼻子图标，用于在登录表单等地方展示
</script>

<template>
  <!-- 小猪表情图标 -->
  <span class="pig-logo">🐽</span>
</template>

<style scoped>
/**
 * 小猪图标样式
 */
.pig-logo {
  font-size: 24px;
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

  /* 入场动画 */
  animation: piggy-pop 0.6s ease-out;
}

/* 入场动画关键帧 */
@keyframes piggy-pop {
  0% {
    transform: scale(0.8) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.08) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Hover（鼠标悬停）时的效果 */
.pig-logo:hover {
  transform: rotate(8deg) scale(1.08);
  box-shadow:
   inset 0 1px 2px rgba(255, 255, 255, 0.9),
   0 3px 6px rgba(255, 182, 193, 0.6),
   0 0 8px rgba(255, 182, 193, 0.6);
  background: radial-gradient(circle at 25% 25%, #ffdbe2, #ffa9b8);
}

/* Active（按下 / 点击）时的效果 */
.pig-logo:active {
  transform: rotate(0deg) scale(0.96);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}
</style>