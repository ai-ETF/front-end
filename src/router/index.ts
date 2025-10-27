import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatHome from '@/views/ChatHome.vue'     // 初始页
import ChatRoom from '@/views/ChatRoom.vue'     // 聊天详情页
import FilesView from '@/views/FilesView.vue'
// 导入视图组件（原页面组件）
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

// 创建路由实例
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

// 添加路由守卫
// router.beforeEach((to, from, next) => {
//   // 获取认证状态
//   const isAuthenticated = localStorage.getItem('auth-storage') && 
//     JSON.parse(localStorage.getItem('auth-storage')).user

//   // 检查目标路由是否需要认证
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     // 如果需要认证但未认证，重定向到登录页
//     next('/login')
//   } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
//     // 如果已认证但尝试访问登录或注册页，重定向到主页
//     next('/')
//   } else {
//     // 其他情况允许访问
//     next()
//   }
// })

export default router