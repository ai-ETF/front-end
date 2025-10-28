<script setup lang="ts">
// PlusLogo.vue - 加号图标组件
// 这个组件显示一个加号图标，具有悬停效果
</script>

<template>
  <!-- 加号图标 -->
  <span class="plus-logo"></span>
</template>

<style scoped>
/**
 * 加号图标样式
 */
.plus-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  position: relative;
}

/* 创建一个更大更粗的加号 */
.plus-logo::before,
.plus-logo::after {
  content: '';
  position: absolute;
  background-color: #000;
}

/* 水平线 */
.plus-logo::before {
  width: 20px;
  height: 4px;
  border-radius: 2px;
}

/* 垂直线 */
.plus-logo::after {
  width: 4px;
  height: 20px;
  border-radius: 2px;
}

/* 悬停时显示灰色背景 */
.plus-logo:hover {
  background-color: #f2f2f2;
}

/* 悬停时加号变粗一点 */
.plus-logo:hover::before {
  height: 5px;
}

.plus-logo:hover::after {
  width: 5px;
}
</style>