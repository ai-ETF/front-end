<script setup lang="ts">
/**
 * DefaultLayout.vue - 应用程序的默认布局组件
 * 
 * 这个组件定义了应用程序的整体布局结构，包括：
 * 1. 侧边栏（包含导航菜单）
 * 2. 顶部标题栏
 * 3. 主内容区域
 * 
 * 使用了 Ant Design Vue 的 Layout 组件系统
 */

import { storeToRefs } from 'pinia'
import { useSidebarStore } from '@/stores/sidebar'
import { Layout } from 'ant-design-vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

// 解构 Layout 组件的子组件，方便在模板中直接使用
// Header: 顶部区域
// Sider: 侧边栏区域
// Content: 内容区域
const { Header, Sider, Content } = Layout

// 使用 Pinia store 管理侧边栏状态
const sidebarStore = useSidebarStore()
// 将其从一个store 中解构出来，用于在模板中直接使用
const { collapsed } = storeToRefs(sidebarStore)

// 处理侧边栏折叠状态变化的函数
// 当 Sidebar 组件触发 update:collapsed 事件时调用
const onCollapsedChange = (value: boolean) => {
  // 更新 store 中的折叠状态
  sidebarStore.setCollapsed(value)
}

// 定义侧边栏宽度常量
const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 52
</script>

<template>
  <!-- 
    Layout 容器组件，使用 has-sider 属性表明包含侧边栏
    class="layout-container" 用于应用自定义样式
  -->
  <Layout has-sider class="layout-container">
    <!-- 
      Sider 侧边栏组件
      :width="SIDEBAR_WIDTH" - 设置侧边栏展开时的宽度
      :collapsed-width="SIDEBAR_COLLAPSED_WIDTH" - 设置侧边栏折叠时的宽度
      v-model:collapsed - 双向绑定折叠状态到 collapsed 变量
      collapsible - 允许侧边栏折叠
      :trigger="null" - 不显示默认的折叠触发器
      class="sider-style" - 应用自定义样式类
    -->
    <Sider
      class="sider-style"
      :width="SIDEBAR_WIDTH"
      :collapsed-width="SIDEBAR_COLLAPSED_WIDTH"
      v-model:collapsed="collapsed"
      collapsible
      :trigger="null"
    >
      <!-- 
        使用自定义的 Sidebar 组件
        :collapsed - 将当前折叠状态传递给 Sidebar 组件
        :width - 将当前宽度传递给 Sidebar 组件
        @update:collapsed - 监听 Sidebar 组件发出的折叠状态更新事件
      -->
      <Sidebar 
        :collapsed="collapsed"
        :width="collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH"
        @update:collapsed="onCollapsedChange"
      />
      <!---->
    </Sider>

    <!-- 
      主布局容器，包含顶部标题栏和内容区域
      class="layout-main" - 应用自定义样式类
    -->
    <Layout class="layout-main">
      <!-- 
        Header 顶部标题栏
        class="site-layout-header" - 应用自定义样式类
      -->
      <!-- <Header class="site-layout-header"> -->
        <!-- 
          标题文本
          class="header-title" - 应用自定义样式类
        -->
        <!-- <span class="header-title">小E你的ETF智能助手</span> -->
      <!-- </Header> -->
      
      <!-- 
        Content 内容区域，用于显示路由对应的页面组件
        class="site-layout-content" - 应用自定义样式类
      -->
      <Content class="site-layout-content">
        <!-- 
          router-view 是 Vue Router 的路由出口
          所有匹配的路由组件都会在这里渲染
        -->
        <router-view />
      </Content>
    </Layout>
  </Layout>
</template>

<style scoped>
/**
 * scoped 样式说明：
 * 使用 scoped 可以确保这些样式只应用于当前组件，
 * 不会影响其他组件的样式
 */

/* 
 * ======================================================
 * 全局盒模型设置
 * ======================================================
 * 目的：确保所有元素在计算宽高时包括内边距和边框
 * box-sizing: border-box：
 *   - width/height 包括 padding 和 border（更容易布局）
 */
* {
  /* 
   * 推荐：统一盒模型，避免计算混乱
   * 这样设置后，元素的宽高就包含了 padding 和 border
   * 例如：width: 100px; padding: 10px; border: 5px;
   * 实际占用空间仍然是 100px，而不是 130px
   */
  box-sizing: border-box;
}

/* 
 * ======================================================
 * 侧边栏（Sider）整体样式
 * ======================================================
 * 控制：侧栏尺寸、背景、过渡动画（折叠时会用到）
 */
.sider-style {
  /* 占据整个视口高度 */
  height: 100vh;
  
  /* 默认宽度（折叠前） */
  width: 260px;
  
  /* 浅灰背景 */
  background: #f9f9f9;
  
  /* 平滑变化（宽度、padding 等变化时） */
  transition: all 0.3s ease;
  
  /* 最小宽度，防止被压瘪 */
  min-width: 260px;
  
  /* 盒模型设置 */
  box-sizing: border-box;
  
  /* 添加浅灰色右边框，符合 Ant Design 设计规范 */
  border-right: 1px solid #e8e8e8;
}

/* 
 * ======================================================
 * 布局容器
 * ======================================================
 * 控制：外部主容器和内部主布局的背景与尺寸
 */
.layout-container {
  /* 高度占满整个视口 */
  height: 100vh;
  
  /* 宽度占满整个视口 */
  width: 100vw;
  
  /* 背景颜色 */
  background: #fff;
}

.layout-main {
  /* 高度占满整个视口 */
  height: 100vh;
  
  /* 宽度占满整个视口 */
  width: 100vw;
  
  /* 背景颜色 */
  background: #fff;
}

/* 
 * ======================================================
 * 头部 Header 样式
 * ======================================================
 * 控制：高度、对齐、阴影、内边距
 * 说明：box-shadow 用于产生细微分层感
 */
.site-layout-header {
  /* 背景颜色 */
  background: #fff;
  
  /* 左右内边距 */
  padding: 0 16px;
  
  /* 使用 flex 布局 */
  display: flex;
  
  /* 垂直居中内容 */
  align-items: center;
  
  /* 轻微阴影，产生分层效果 */
  box-shadow: 0 1px 4px rgba(160, 233, 211, 0.08);
  
  /* 固定头部高度 */
  height: 64px;
  
  /* 盒模型设置 */
  box-sizing: border-box;
  border-bottom: 1px solid #e8e8e8;
}

/* 
 * Header 内标题样式（字体颜色/大小/粗细）
 */
.header-title {
  /* 字体颜色 */
  color: #333;
  
  /* 字体大小 */
  font-size: 18px;
  
  /* 字体粗细 */
  font-weight: bold;
  
  /* 盒模型设置 */
  box-sizing: border-box;
}

/* 
 * ======================================================
 * 内容区 Content 样式
 * ======================================================
 * 控制：外边距、内边距、滚动、可视高度
 * 说明：height 计算用到了头部和外层 margin（减去这些值）
 */
.site-layout-content {
  /* 背景颜色 */
  background: #fff;
  
  /* 内容过多时出现滚动条 */
  overflow: auto;
  
  /* 
   * 计算剩余高度（头部 64px）
   * 使用 calc() 函数进行计算
   */
  height: calc(100vh - 64px);
  
  /* 盒模型设置 */
  box-sizing: border-box;
}

/* 
 * ======================================================
 * 折叠状态下的特殊调整（侧栏宽变为 52px）
 * ======================================================
 * 这些规则通过 .ant-layout-sider-collapsed class 生效（由 ant-layout 添加）
 */

/* 
 * ❗折叠后侧栏整体宽度调整（穿透 ant-design 样式）
 * :deep() 是 Vue 的深度选择器，用于修改子组件的样式
 */
:deep(.sider-style.ant-layout-sider-collapsed) {
  /* 折叠时的宽度 */
  width: 52px !important;
  
  /* 折叠时的最小宽度 */
  min-width: 52px !important;
}

</style>