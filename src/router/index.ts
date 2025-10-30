import { createRouter, createWebHistory } from 'vue-router'
import ChatHome from '@/views/ChatHome.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import FilesView from '@/views/FilesView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录注册路由（视图组件）
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    // 原有嵌套路由（需要布局）
    {
      path: '/',
      component: DefaultLayout,
      redirect: '/chat',
      meta: { requiresAuth: false }, // 需要登录
      children: [
        {
          path: 'chat',
          name: 'chat-home',
          component: ChatHome
        },
        {
          path: 'chat/:id',
          name: 'chat-room',
          component: ChatRoom
        },
        {
          path: 'files',
          name: 'files',
          component: FilesView
        },
      ],
    },
  ]
})

export default router