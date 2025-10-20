<script setup lang="ts">
import { ref} from 'vue'
import { Layout, Menu } from 'ant-design-vue'
import { UploadOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
// TODO:现在我想要把logoImage改为新图标，新图标是🐽我该怎么做？
// import logoImage from '@/assets/image.png'
import sider_collapsed from '@/assets/svg/sidebar-collapse.svg'
import sider_expand from '@/assets/svg/sidebar-expand.svg'

const router = useRouter()

const { Header, Sider, Content } = Layout

const collapsed = ref(false)
const selectedKeys = ref<string[]>(['1'])

// 添加h函数用于渲染图标
import { h } from 'vue'

const menuItems = [
  {
    key: '1',
    icon: () => h(UserOutlined),
    label: 'AI对话',
    path: '/chat'
  },
  {
    key: '2',
    icon: () => h(UploadOutlined),
    label: '文档库',
    path: '/files'
  }
]

const handleMenuClick = (info: { key: string | number }) => {
  const item = menuItems.find(item => item.key === info.key.toString())
  if (item && item.path) {
    router.push(item.path)
  }
}
</script>

<template>
  <Layout has-sider class="layout-container">
    <Sider
      class="sider-style"
      :width="260"
      v-model:collapsed="collapsed"
      collapsible
      :trigger="null"
    >
      <div class="logo">
      <div v-if="!collapsed" class="logo-expanded">
        <div class="logo-left">
          <span class="logo-emoji">🐽</span>
          <span class="logo-text"></span>
        </div>
        <div class="logo-right">
          <img 
            :src="sider_collapsed" 
            alt="Navigation" 
            class="collapse-icon" 
            @click="() => (collapsed = !collapsed)"
          />
        </div>
      </div>

      <div v-else class="logo-collapsed">
        <img 
          :src="sider_expand" 
          alt="Navigation" 
          class="collapse-icon" 
          @click="() => (collapsed = !collapsed)"
        />
      </div>
      </div>


    <!-- TODO: 在sider从收缩状态变为伸展状态的时候，过渡不自然 -->
      <Menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        @click="handleMenuClick"
      />
    </Sider>

    <Layout class="layout-main">
      <Header class="site-layout-header">
        <span class="header-title">小E你的ETF智能助手</span>
      </Header>
      <Content class="site-layout-content">
        <router-view />
      </Content>
    </Layout>
  </Layout>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
.custom-menu{
  background: #f9f9f9;

}
.sider-style {
  height: 100vh;
  width: 260px;
  background: #f9f9f9;
  transition: all 0.3s ease;
  min-width: 260px;
}

.layout-container {
  height: 100vh;
  width: 100vw;
  background: #fff;
}

.layout-main {
  height: 100vh;
  width: 100vw;
  background: #fff;
}

.site-layout-header {
  background: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(160, 233, 211, 0.08);
  height: 64px;
  box-sizing: border-box;
}

.site-layout-content {
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  overflow: auto;
  height: calc(100vh - 64px - 48px);
  box-sizing: border-box;
}

/* 非折叠状态下的样式 */
.logo {
  width: 260px;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  justify-content: space-between;
}

.logo-expanded {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
}

.logo-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  height: 52px;
}

.logo-image {
  width: 24px;
  height: 24px;
  box-sizing: border-box;
}

.logo-left {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  width:36px;
  box-sizing: border-box;
}

.logo-right {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  width:36px;
  box-sizing: border-box;
}

.collapse-icon {
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
}

.collapse-icon:hover {
  background-color: #e6f7ff;
  transform: scale(1.1);
}

.logo-text {
  color: #1890ff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.header-title {
  color: #333;
  font-size: 18px;
  font-weight: bold;
  box-sizing: border-box;
}

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

.logo-emoji {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: radial-gradient(circle at 30% 30%, #ffe8ec, #ffc2cc);
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.8),
              0 2px 4px rgba(0, 0, 0, 0.1),
              0 0 6px rgba(255, 182, 193, 0.4);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  animation: piggy-pop 0.6s ease-out; 
}

/* Hover 态 */
.logo-emoji:hover {
  transform: rotate(8deg) scale(1.08);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.9),
              0 3px 6px rgba(255, 182, 193, 0.6),
              0 0 8px rgba(255, 182, 193, 0.6);
  background: radial-gradient(circle at 25% 25%, #ffdbe2, #ffa9b8);
}

/* Active 态 */
.logo-emoji:active {
  transform: rotate(0deg) scale(0.96);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}



/* 菜单整体 */
:deep(.ant-menu) {
  width: 260px;
  border-right: none;
  background: #f9f9f9;
  margin: 8px 0 0;
  padding: 8px 0;
  box-sizing: border-box;
}

/* 普通菜单项 */
:deep(.ant-menu-item) {
  width: 248px;
  height: 38px;
  margin: 4px 6px; /* ✅ 增加上下间距 */
  padding: 6px 10px !important; /* ✅ 增加内部留白 */
  border-radius: 8px;
  line-height: 36px;
  display: flex;
  align-items: center;
  transition: all 0.25s ease; /* ✅ 平滑过渡动画 */
  box-sizing: border-box;
  color: #333;
  font-weight: 500;
}

/* ✅ 悬停状态：柔和灰色 + 平滑过渡 */
:deep(.ant-menu-item:hover) {
  background-color: #f2f2f2;
  transform: translateX(2px); /* ✅ 微动画反馈 */
  color: #1890ff;
}

/* ✅ 选中状态：更统一的灰白背景 + 蓝色字体 */
:deep(.ant-menu-item-selected) {
  background-color: #efefef !important;
  color: #1890ff;
  font-weight: 600;
  box-shadow: inset 2px 0 0 #1890ff; /* ✅ 左侧蓝色高光条 */
  transform: translateX(2px);
}

/* 图标和文字 */
:deep(.ant-menu-item .anticon) {
  font-size: 18px;
  margin-right: 12px;
  transition: color 0.25s ease;
}

/* hover 或选中时图标颜色变化 */
:deep(.ant-menu-item:hover .anticon),
:deep(.ant-menu-item-selected .anticon) {
  color: #1890ff;
}

:deep(.ant-menu-item .ant-menu-title-content) {
  flex: 1;
  box-sizing: border-box;
}

/* 移除默认右边框 */
:deep(.ant-menu-inline) {
  border-right: none;
}



.sider-style.ant-layout-sider-collapsed :deep(.ant-menu-item) {
  margin: 8px 12px; 
  height: 40px;
}



/* 折叠状态下的样式 */
.sider-style.ant-layout-sider-collapsed {
  width: 80px;
  min-width: 80px;
}

.sider-style.ant-layout-sider-collapsed .logo {
  width: 80px;
  padding: 0;
  justify-content: center;
}

.sider-style.ant-layout-sider-collapsed .logo-text {
  display: none;
}

.sider-style.ant-layout-sider-collapsed :deep(.ant-menu) {
  width: 80px;
  text-align: center;
}

.sider-style.ant-layout-sider-collapsed :deep(.ant-menu-item) {
  padding: 0 !important;
  justify-content: center;
  margin: 4px 12px;
  width: auto;
  height: 36px;
}

.sider-style.ant-layout-sider-collapsed :deep(.ant-menu-item .anticon) {
  margin-right: 0;
  font-size: 16px;
}

.sider-style.ant-layout-sider-collapsed :deep(.ant-menu-item .ant-menu-title-content) {
  display: none;
  opacity: 0;
}
</style>