import { createRouter, createWebHistory } from 'vue-router'
import ChatHome from '@/views/ChatHome.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import FilesView from '@/views/FilesView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatLayout from '@/layouts/ChatLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录注册路由（视图组件）
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      // meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      // meta: { requiresAuth: false }
    },
    // 默认布局路由
    {
      path: '/',
      component: DefaultLayout,
      redirect: '/chat',
      // meta: { requiresAuth: false },
      children: [
        {
          path: 'files',
          name: 'files',
          component: FilesView
        },
      ],
    },
    // 聊天布局路由
    {
      path: '/chat',
      component: ChatLayout,
      // meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'chat-home',
          component: ChatHome
        },
        {
          path: ':id',
          name: 'chat-room',
          component: ChatRoom
        },
      ],
    },
  ]
})

export default router