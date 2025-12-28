<template>
  <div class="chat-layout">
    <Sidebar>

    </Sidebar>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

const route = useRoute()
const activeChatId = ref<number | null>(null)

const handleChatSelected = (chatId: number) => {
  activeChatId.value = chatId
}

// 监听路由变化以更新活动聊天ID
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      activeChatId.value = parseInt(newId as string)
    } else {
      activeChatId.value = null
    }
  },
  { immediate: true }
)

onMounted(() => {
  console.log('ChatLayout 组件已挂载，当前活动聊天ID：', activeChatId.value)
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>