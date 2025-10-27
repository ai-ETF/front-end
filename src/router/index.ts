import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatHome from '@/views/ChatHome.vue'     // 初始页
import ChatRoom from '@/views/ChatRoom.vue'     // 聊天详情页
import FilesView from '@/views/FilesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      redirect: '/chat',
      children: [
        {
          path: 'chat',              // /chat
          name: 'chat-home',
          component: ChatHome,
        },
        {
          path: 'chat/:id',          // /chat/123
          name: 'chat-room',
          component: ChatRoom,
        },
        {
          path: 'files',             // /files
          name: 'files',
          component: FilesView,
        },
      ],
    },
  ],
})

export default router
