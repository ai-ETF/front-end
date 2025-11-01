<template>
  <div class="logout-button" @click="handleLogout">
    <div class="menu-item" :class="{ collapsed: collapsed }">
      <div class="menu-icon">
        <LogoutOutlined />
      </div>
      <transition name="fade">
        <div v-if="!collapsed" class="menu-label">
          登出
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LogoutOutlined } from '@ant-design/icons-vue'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import { useRouter } from 'vue-router'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const { logout } = useSupabaseAuth()
const router = useRouter()

const handleLogout = async () => {
  try {
    const result = await logout()
    if (result.success) {
      // router.push('/login')
    } else {
      console.error('登出失败:', result.error)
    }
  } catch (error) {
    console.error('登出时发生错误:', error)
  }
}
</script>

<style scoped>
.logout-button {
  cursor: pointer;
  margin-top: auto;
  padding: 10px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  margin: 0px 8px;
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  color: #5f6368;
}

.menu-item:hover {
  background-color: #f1f3f4;
  color: #202124;
}

.menu-item.collapsed {
  justify-content: center;
  width: 40px;
  padding: 6px 10px !important;
  margin: 0px 6px !important;
}

.menu-icon {
  position: absolute;
  left: 16px;
  width: 16px;
  height: 16px;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 40px;
}

.menu-item.collapsed .menu-label {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>