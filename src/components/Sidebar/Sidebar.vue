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

    </div>
    
    <!-- 动态聊天列表 -->
    <div v-if="!props.collapsed && chatStore.chats.length" class="chat-list">
      <div class="chat-list-title" @click="toggleChatList">
        <span class="toggle-icon">{{ chatCollapsed ? '▶' : '▼' }}</span>
        我的会话
      </div>
      
      <div v-if="!chatCollapsed">
        <div
          v-for="c in chatStore.chats"
          :key="c.id"
          class="chat-list-item chat-item"
          :class="{ active: routeId === c.id }"
          @click="() => router.push(`/chat/${c.id}`)"
        >
          <!-- 聊天项左侧内容 -->
          <div class="menu-label chat-label">{{ c.title || '新建会话' }}</div>
          
          <!-- 聊天项右侧操作按钮 -->
          <div class="chat-actions" v-if="routeId === c.id">
            <img
              class="action-icon"
              @click.stop="handleRenameChat(c)"
              src="@/assets/svg/edit-rename.svg"
              alt="重命名"
              width="14"
              height="14"
            />
            <img
              class="action-icon"
              @click.stop="handleDeleteChat(c)"
              src="@/assets/svg/delete.svg"
              alt="删除"
              width="14"
              height="14"
            />
          </div>
        </div>
      </div>
    
    </div>

    <!-- 登出按钮 -->
    <LogoutButton :collapsed="props.collapsed" />
  </div>
  
  <ChatActionsModal
    v-model:showRenameModal="modalState.showRenameModal"
    v-model:showDeleteModal="modalState.showDeleteModal"
    v-model:renameInputValue="modalState.renameInputValue"
    :delete-chat-item="modalState.deleteChatItem"
    @confirm-rename="confirmRename"
    @confirm-delete="confirmDelete"
  />

</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import { useChatStore } from '@/stores/chat'
import LogoutButton from '@/components/Sidebar/LogoutButton.vue'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { useChatMessages } from '@/composables/useChatMessages'
// 引入我们新创建的聊天数据同步工具
import { syncChatsToLocal, syncChatDetailsToLocal } from '@/utils/chatSync'
import ChatActionsModal from './ChatActionsModal.vue'

const { isAuthenticated, mount } = useSupabaseAuth()
const { fetchChats, fetchMessages, deleteChat, updateChatTitle } = useChatMessages()
const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()

// 计算属性：将路由参数转换为数字类型
const routeId = computed((): number | undefined => {
  const id = route.params.id
  if (Array.isArray(id)) {
                  return id.length > 0 ? parseInt(id[0] as string, 10) : undefined
  }
  return id ? parseInt(id, 10) : undefined
})

// 模态框状态管理
const modalState = reactive({
  showRenameModal: false,
  showDeleteModal: false,
  renameInputValue: '',
  deleteChatItem: null as any
})

// 重命名聊天项引用
const renameChatItem = ref<any>(null)

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
      label: '新建对话',       // 显示文本
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

/* 
 * 响应式状态（reactive state）
 * 使用 ref 创建响应式数据，当数据变化时会自动更新视图
 */
// 初始化一个名为selectedKeys 的响应数据，类型为字符串数组，默认值为 ['1']
const selectedKeys = ref<string[]>(['1'])

// 控制动态聊天栏内部折叠状态
const chatCollapsed = ref(false)


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

// 切换动态聊天栏的折叠状态
const toggleChatList = () => {
  chatCollapsed.value = !chatCollapsed.value
}

// 处理重命名聊天
const handleRenameChat = (chat: any) => {
  renameChatItem.value = chat
  modalState.renameInputValue = chat.title || ''
  modalState.showRenameModal = true
}

// 确认重命名
const confirmRename = async () => {
  const newTitle = modalState.renameInputValue.trim()
  if (newTitle && newTitle !== renameChatItem.value.title) {
    try {
      // 调用更新标题函数
      await updateChatTitle(renameChatItem.value.id, newTitle)
      
      // 更新本地 store
      const localChat = chatStore.getChat(renameChatItem.value.id)
      if (localChat) {
        localChat.title = newTitle
      }
      
      console.log('聊天已重命名:', renameChatItem.value.id, newTitle)
    } catch (error) {
      console.error('重命名聊天失败:', error)
    }
  }

  modalState.showRenameModal = false
}

// 处理删除聊天
const handleDeleteChat = (chat: any) => {
  modalState.deleteChatItem = chat
  modalState.showDeleteModal = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    // 添加空值检查
    if (!modalState.deleteChatItem) {
      console.error('删除的聊天项不存在')
      modalState.showDeleteModal = false
      return
    }
    
    // 使用syncDeleteChatToRemote来确保正确同步删除操作到远程和本地
    const { syncDeleteChatToRemote } = await import('@/utils/syncToRemote')
    const success = await syncDeleteChatToRemote(modalState.deleteChatItem.id, deleteChat)
    
    if (!success) {
      console.error('删除聊天失败')
      return
    }
    
    // 如果当前正在查看这个聊天，导航到主页
    if (routeId.value === modalState.deleteChatItem.id) {
      router.push('/chat')
    }
    
    console.log('聊天已删除:', modalState.deleteChatItem.id)
  } catch (error) {
    console.error('删除聊天失败:', error)
  }
  
  modalState.showDeleteModal = false
}

// 获取聊天记录并同步到本地store
const loadChatsToStore = async () => {
  if (isAuthenticated.value) {
    try {
      const remoteChats = await fetchChats()
      
      syncChatsToLocal(remoteChats)
      
      console.log('获取到的聊天记录：', remoteChats)
    } catch (err) {
      console.error('同步聊天记录失败:', err)
    }
  } else {
    console.log('用户未认证，无法加载聊天记录。')
  }
}

onMounted(() => {
  console.log('Sidebar 组件已挂载，当前折叠状态：', props.collapsed)
  
  // 初始化认证状态
  mount()
  
  // 加载聊天记录
  loadChatsToStore().then(() => {
    console.log('聊天页面加载执行完成。')
  })
})

// 从 Ant Design Vue 导入图标组件 主要是：UserOutlined - 用户图标、UploadOutlined - 上传图标
// TODO：未来要考虑修改
import { UploadOutlined, UserOutlined } from '@ant-design/icons-vue'
</script>


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

  /* 添加底部边框 */
  /* border-bottom: 1px solid #e8e8e8; */
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
  /* background-color: #efefefef; */
  
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

/* 
 * ======================================================
 * 动态聊天列表样式
 * ======================================================
 */

/* 动态聊天列表容器 */
.chat-list {
  margin-top: 8px;
  padding: 0 8px 8px; /* 内边距留出边距 */
  /* border-top: 1px solid #e8e8e8; 与菜单区分 */
  border-top: 1px solid #f0f0f0; /* 分隔线 */
}

/* 标题栏：可折叠区域 */
.chat-list-title {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 16px; /* 左右对齐菜单项内边距 */
  cursor: pointer;
  font-weight: 500;
  user-select: none;
  color: #333;

}

/* 折叠/展开图标 */
.toggle-icon {
  margin-right: 8px;
  font-size: 12px;
}

/* 会话条目容器 */
.chat-list-item {
  display: flex;
  align-items: center;
  height: 38px; /* 与菜单项高度一致 */
  padding: 0 16px; /* 左右与菜单对齐 */
  /* padding: 6 10px; 左右与菜单对齐 */
  margin: 0px 6px;
  border-radius: 6px; /* 圆角视觉柔和 */
  cursor: pointer;
  transition: all 0.2s;
}

/* 条目文本 */
.chat-label {
  flex: 1; /* 占满剩余空间 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 0px; /* 与菜单图标对齐 */
}

/* 鼠标悬停高亮 */
.chat-item:hover {
  background-color: #f0f0f0; /* 浅灰色背景 */
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.05); /* 内阴影增加层次感 */
  transition: all 0.2s ease;
}

/* 选中状态 */
.chat-item.active {
  background-color: #eaeaea; /* 中灰色突出选中 */
  color: #000;
  font-weight: 500; /* 加粗文字，提高视觉识别度 */
  /* box-shadow: inset 2px 0 0 #8c8c8c; 左侧深灰色条，高亮选中 */
  border-radius: 6px; /* 保持圆角一致 */
  transition: all 0.2s ease;
}

/* 聊天操作按钮容器 */
.chat-actions {
  display: flex;
  gap: 8px;
}

/* 操作图标样式 */
.action-icon {
  width: 14px;
  height: 14px;
  color: #666;
  transition: all 0.2s;
  cursor: pointer;
}

.action-icon:hover {
  color: #333;
  transform: scale(1.1);
}

/* 登出按钮容器 */
.logout-button-container {
  margin-top: auto;
  padding: 8px;
}

</style>


