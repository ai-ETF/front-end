  <script setup lang="ts">
/** 组件介绍
 * Sidebar.vue - 侧边栏组件
 * 侧边栏组件，用于显示导航菜单
 */

import { ref, withDefaults, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import { useChatStore } from '@/stores/chat'

// 从 Ant Design Vue 导入图标组件 主要是：UserOutlined - 用户图标、UploadOutlined - 上传图标
// TODO：未来要考虑修改
import { UploadOutlined, UserOutlined } from '@ant-design/icons-vue'

// 定义菜单项的接口类型：描述每个菜单项应该具有的属性
interface MenuItem {
  key: string      // 菜单项的唯一标识符
  icon?: any       // 菜单项的图标组件（可选）
  label: string    // 菜单项的显示文本
  path?: string    // 菜单项对应的路由路径（可选）
}

// 定义组件接收的属性（props）类型
interface Props {
  menuItems?: MenuItem[]
  collapsed?: boolean
  width?: number
}

// 定义组件的属性默认值
const props = withDefaults(defineProps<Props>(), {
  // 如果没有传入 menuItems，则使用默认的菜单项
  menuItems: () => [
    {
      key: '1',              // 第一个菜单项的唯一标识
      icon: UserOutlined,    // 使用 UserOutlined 图标组件
      label: 'AI对话',       // 显示文本
      path: '/chat'          // 对应的路由路径
    },
    {
      key: '2',              // 第二个菜单项的唯一标识
      icon: UploadOutlined,  // 使用 UploadOutlined 图标组件
      label: '文档库',       // 显示文本
      path: '/files'         // 对应的路由路径
    }
  ],
  // 默认不传入 collapsed 值
  collapsed: undefined,
  
  // 默认宽度为260px
  width: 260
})

// 依旧是定义接口
interface Emits {
  // 当侧边栏折叠状态改变时触发的事件
  // 参数：value - 折叠状态的值，update:c
  (e: 'update:collapsed', value: boolean): void
  
  // 当菜单项被点击时触发的事件
  (e: 'menuClick', item: MenuItem): void
}

// 定义组件可以触发的事件
// 是不是只要是被定义为defineEmits 的事件，都可以被父组件接收到？
const emit = defineEmits<Emits>()
const router = useRouter()
const chatStore = useChatStore()

/* 
 * 响应式状态（reactive state）
 * 使用 ref 创建响应式数据，当数据变化时会自动更新视图
 */
// 初始化一个名为selectedKeys 的响应数据，类型为字符串数组，默认值为 ['1']
const selectedKeys = ref<string[]>(['1'])

// 处理菜单项点击事件
const handleMenuClick = (item: MenuItem) => {
  // 更新选中的菜单项
  // 将当前点击的菜单项的 key 设置为选中状态
  selectedKeys.value = [item.key]
  
  // 触发 menuClick 事件，通知父组件菜单项被点击
  emit('menuClick', item)
  
  // 如果菜单项有路径，则跳转到对应页面
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<template>
  <!-- 侧边栏容器 -->
  <div class="sidebar-container" :style="{ width: props.width + 'px' }">
    <!-- 
      使用 Logo 组件
      :collapsed - 将当前折叠状态传递给 Logo 组件
      @toggle - 监听 Logo 组件发出的切换事件
    -->
    <Logo 
      :collapsed="props.collapsed" 
      @toggle="() => emit('update:collapsed', !props.collapsed)"
    />

    <!-- 自定义菜单区域 -->
    <div class="custom-menu">
      <!-- 
        遍历菜单项数组，为每个菜单项创建一个菜单项元素
        v-for - Vue 的列表渲染指令
        :key - Vue 列表渲染时的唯一标识
      -->
      <div
        v-for="item in props.menuItems"
        :key="item.key"
        class="menu-item"
        :class="{
          // 当前菜单项是否被选中
          active: selectedKeys.includes(item.key),
          
          // 当前菜单项是否在折叠状态
          collapsed: props.collapsed
        }"
        @click="() => handleMenuClick(item)"
      >
        <!-- 菜单项图标部分 -->
        <div class="menu-icon">
          <!-- 
            如果菜单项有图标，则渲染图标组件
            component 是 Vue 的动态组件，:is 指定要渲染的组件
          -->
          <component :is="item.icon" v-if="item.icon" />
        </div>

        <!-- 菜单项文本部分 -->
        <!-- 
          使用 transition 组件实现折叠时的淡入淡出动画
          name="fade" 对应 CSS 中的 .fade-enter-active 等类名
        -->
        <transition name="fade">
          <!-- 当侧边栏未折叠时显示菜单项文本 -->
          <div v-if="!props.collapsed" class="menu-label">
            {{ item.label }}
          </div>
        </transition>
      </div>
      <!-- 动态聊天列表 -->
      <div class="chat-list" v-if="chatStore.chats.length">
        <div class="chat-list-title">我的会话</div>
        <div
          v-for="c in chatStore.chats"
          :key="c.id"
          class="menu-item chat-item"
          @click="() => router.push(`/chat/${c.id}`)"
        >
          <div class="menu-icon">
            <!-- 可以放一个小点或图标 -->
            <span style="width:12px;height:12px;background:#1890ff;border-radius:50%;display:inline-block"></span>
          </div>
          <div class="menu-label">{{ c.title || '新建会话' }}</div>
        </div>
      </div>
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
   */
  box-sizing: border-box;
}

/* 
 * ======================================================
 * 侧边栏（Sider）整体样式
 * ======================================================
 * 控制：侧栏尺寸、背景、过渡动画（折叠时会用到）
 */
.sidebar-container {
  /* 占据父容器的全部高度 */
  /* height: 104px; */
  height:auto;
  
  /* 浅灰背景色 */
  background: #f9f9f9;
  
  /* 所有属性变化时的过渡动画 */
  transition: all 0.3s ease;
  
  /* 盒模型设置 */
  box-sizing: border-box;
  
  /* 右侧边框 */
  border-right: 1px solid #e8e8e8;
}

/* 
 * ======================================================
 * 自定义菜单区域样式
 * ======================================================
 */
.custom-menu {
  /* 菜单区域的外边距 */
  margin: 8px 0 0;
  
  /* 菜单区域的内边距 */
  padding: 8px 0;
}

/* 
 * ======================================================
 * 菜单项样式
 * ======================================================
 */
.menu-item {
  /* 
   * 使用 flex 布局，使图标和文本水平排列
   */
  display: flex;
  
  /* 垂直居中内容 */
  align-items: center;
  
  /* 菜单项的高度 */
  height: 38px;
  
  /* 菜单项的外边距 */
  margin: 4px 6px;
  
  /* 菜单项的内边距 */
  padding: 6px 10px 6px 42px;
  
  /* 菜单项的圆角 */
  border-radius: 8px;
  
  /* 菜单项的光标样式 */
  cursor: pointer;
  
  /* 菜单项的过渡动画 */
  transition: all 0.3s;
  
  /* 菜单项的位置相对定位 */
  position: relative;
}

/* 
 * 菜单项悬停样式
 */
.menu-item:hover {
  /* 背景色变化 */
  background-color: #e6f7ff;
}

/* 
 * 菜单项选中样式
 */
.menu-item.active {
  /* 背景色 */
  background-color: #efefefef;
  
  /* 字体颜色 */
  color: black;
}

/* 
 * ======================================================
 * 菜单项图标样式
 * ======================================================
 */
.menu-icon {
  /* 图标的绝对定位 */
  position: absolute;
  
  /* 图标左边距 */
  left: 16px;
  
  /* 图标的宽度 */
  width: 16px;
  
  /* 图标的高度 */
  height: 16px;
  
  /* 图标内元素居中 */
  /* display: flex;
  align-items: center;
  justify-content: center; */
}

/* 
 * ======================================================
 * 菜单项文本样式
 * ======================================================
 */
.menu-label {
  /* 文本不换行 */
  white-space: nowrap;
  
  /* 超出部分隐藏 */
  overflow: hidden;
  
  /* 超出部分显示省略号 */
  text-overflow: ellipsis;
}

/* 
 * ======================================================
 * 折叠状态下的菜单项样式
 * ======================================================
 */
.menu-item.collapsed {
  /* 折叠状态下居中图标 */
  justify-content: center;
  width: 40px;
  
  /* 重置内边距 */
  padding: 6px 10px !important;
  margin: 0px 6px !important;
}

/* 
 * ======================================================
 * 淡入淡出动画样式
 * ======================================================
 */
.fade-enter-active,
.fade-leave-active {
  /* 进入和离开的过渡效果 */
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  /* 进入前和离开后的透明度 */
  opacity: 0;
}
</style>