import { createRouter, createWebHistory } from 'vue-router'
import ChatHome from '@/views/ChatHome.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import FilesView from '@/views/FilesView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatLayout from '@/layouts/ChatLayout.vue'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录注册路由（视图组件）
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    // 默认布局路由
    {
      path: '/',
      component: DefaultLayout,
      redirect: '/chat',
      children: [
        {
          path: 'files',
          name: 'files',
          component: FilesView,
          meta: { requiresAuth: true },
        },
      ],
    },
    // 聊天布局路由
    {
      path: '/chat',
      component: ChatLayout,          
      children: [
        {
          path: '',
          name: 'chat-home',
          component: ChatHome,
        },
        {
          path: ':id',
          name: 'chat-room',
          component: ChatRoom,
          meta: { requiresAuth: true },
        },
      ],
    },
  ]
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useSupabaseAuth()
  
  // 检查目标路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果路由需要认证但用户未认证，则重定向到登录页
    if (!isAuthenticated.value) {
      console.log(`111111111111111111111111111111111111`)
      next('/login')
    } else {
      // 用户已认证，允许访问
      next()
    }
  } else {
    // 路由不需要认证，直接访问
    next()
  }
})

export default router