// 导入 Vue 的响应式引用、计算属性和生命周期钩子
import { ref, computed, onMounted } from 'vue'
// 导入配置好的 Supabase 客户端实例
import { supabase } from '@/lib/supabaseClient'
// 导入 Supabase 的 User 类型用于类型检查
import type { User } from '@supabase/supabase-js'
// 导入本地认证状态管理的 store
import { useAuthStore } from '@/stores/auth'

// 定义用户信息类型接口，用于 TypeScript 类型检查
interface UserInfo {
  // 用户 ID，为数字类型
  id: number
  // 用户邮箱
  email: string
  // 用户名，可选属性，可以是字符串或 null
  username?: string | null
}

// 导出认证组合式函数
export const useSupabaseAuth = () => {
  // 创建响应式引用，存储当前用户信息（Supabase User 类型）
  const user = ref<User | null>(null)
  // 创建响应式引用，存储扩展的用户信息（自定义 UserInfo 类型）
  const userInfo = ref<UserInfo | null>(null)
  // 创建响应式引用，表示当前是否正在加载
  const loading = ref<boolean>(true)
  // 创建响应式引用，存储错误信息
  const error = ref<string | null>(null)
  
  // 获取认证状态管理的 store 实例
  const authStore = useAuthStore()
  
  // 计算属性：检查用户是否已认证（如果 user.value 存在则返回 true）
  const isAuthenticated = computed(() => !!user.value)
  
  // 获取当前用户信息的异步函数
  const getCurrentUser = async () => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 调用 Supabase API 获取当前用户信息
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      // 如果获取用户时出现错误，则抛出异常
      if (userError) throw userError
      
      // 将获取到的用户信息存储到响应式引用中
      user.value = currentUser
      
      // 如果成功获取到用户信息
      if (currentUser) {
        // 获取用户附加信息（如果有的话）
        const { data: profile, error: profileError } = await supabase
          .from('profiles') // 从 profiles 表中查询
          .select('*') // 选择所有字段
          .eq('id', parseInt(currentUser.id, 10)) // 根据用户 ID 查询，将字符串 ID 转换为数字
          .single() // 期望只返回单条记录
        
        // 如果成功获取到用户资料且没有错误
        if (!profileError && profile) {
          // 设置用户信息，包括从 profiles 表获取的用户名
          userInfo.value = {
            id: profile.id, // 使用 profile 表中的 ID
            email: currentUser.email || '', // 使用认证用户的邮箱
            username: profile.username // 使用 profile 表中的用户名
          }
        } else {
          // 如果没有获取到用户资料，则只使用基本的认证用户信息
          userInfo.value = {
            id: parseInt(currentUser.id, 10), // 将字符串 ID 转换为数字
            email: currentUser.email || '' // 使用认证用户的邮箱
          }
        }
        
        // 更新本地认证状态存储，保存用户基本信息
        authStore.setUser({
          id: currentUser.id, // 用户 ID（字符串）
          username: currentUser.email || '', // 使用邮箱作为用户名
          password: '' // 不存储真实密码，仅占位符
        })
      }
      
      // 返回当前用户和用户信息
      return { user: currentUser, userInfo: userInfo.value }
    } catch (err) {
      // 捕获并处理错误
      error.value = (err as Error).message // 将错误信息存储到响应式引用中
      console.error('获取用户信息失败:', err) // 在控制台输出错误信息
      return { user: null, userInfo: null, error: error.value } // 返回错误信息
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }
  
  // 用户登录功能的异步函数
  const login = async (email: string, password: string) => {
    try {
      // 清空之前的错误信息
      error.value = null
      // 设置加载状态为 true
      loading.value = true
      
      // 调用 Supabase API 进行用户登录
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email, // 用户邮箱
        password // 用户密码
      })
      
      // 如果登录时出现错误，则抛出异常
      if (loginError) throw loginError
      
      // 将登录成功的用户信息存储到响应式引用中
      user.value = data.user
      
      // 获取用户附加信息
      const { data: profile, error: profileError } = await supabase
        .from('profiles') // 从 profiles 表中查询
        .select('*') // 选择所有字段
        .eq('id', parseInt(data.user.id, 10)) // 根据用户 ID 查询
        .single() // 期望只返回单条记录
      
      // 如果成功获取到用户资料且没有错误
      if (!profileError && profile) {
        // 设置完整的用户信息
        userInfo.value = {
          id: parseInt(data.user.id, 10), // 将字符串 ID 转换为数字
          email: data.user.email || '', // 使用认证用户的邮箱
          username: profile.username // 使用 profile 表中的用户名
        }
      } else {
        // 如果没有获取到用户资料，则只使用基本的认证用户信息
        userInfo.value = {
          id: parseInt(data.user.id, 10), // 将字符串 ID 转换为数字
          email: data.user.email || '' // 使用认证用户的邮箱
        }
      }
      
      // 更新本地认证状态存储
      authStore.setUser({
        id: data.user.id, // 用户 ID（字符串）
        username: data.user.email || '', // 使用邮箱作为用户名
        password: '' // 不存储真实密码，仅占位符
      })
      
      // 返回登录成功的用户信息
      return { user: data.user, userInfo: userInfo.value }
    } catch (err) {
      // 捕获并处理错误
      error.value = (err as Error).message // 将错误信息存储到响应式引用中
      console.error('登录失败:', err) // 在控制台输出错误信息
      return { user: null, userInfo: null, error: error.value } // 返回错误信息
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }
  
  // 用户注册功能的异步函数
  const register = async (email: string, password: string, username?: string) => {
    try {
      // 清空之前的错误信息
      error.value = null
      // 设置加载状态为 true
      loading.value = true
      
      // 调用 Supabase API 进行用户注册
      const { data, error: signupError } = await supabase.auth.signUp({
        email, // 用户邮箱
        password // 用户密码
      })
      
      // 如果注册时出现错误，则抛出异常
      if (signupError) throw signupError
      
      // 将注册成功的用户信息存储到响应式引用中
      user.value = data.user
      
      // 如果用户成功创建
      if (data.user) {
        // 创建对应的用户资料记录
        const { error: insertError } = await supabase
          .from('profiles') // 在 profiles 表中插入
          .insert([
            {
              id: parseInt(data.user.id, 10), // 将字符串 ID 转换为数字
              username: username || email, // 使用提供的用户名或邮箱
              email: email, // 用户邮箱
              updated_at: new Date().toISOString() // 更新时间
            }
          ])
          
        // 如果创建用户资料时出现错误，仅在控制台输出警告
        if (insertError) {
          console.warn('创建用户资料失败:', insertError)
        }
        
        // 设置用户信息
        userInfo.value = {
          id: parseInt(data.user.id, 10), // 将字符串 ID 转换为数字
          email: data.user.email || '', // 使用认证用户的邮箱
          username: username || email // 使用提供的用户名或邮箱
        }
        
        // 更新本地认证状态存储
        authStore.setUser({
          id: data.user.id, // 用户 ID（字符串）
          username: data.user.email || '', // 使用邮箱作为用户名
          password: '' // 不存储真实密码，仅占位符
        })
      }
      
      // 返回注册成功的用户信息
      return { user: data.user, userInfo: userInfo.value }
    } catch (err) {
      // 捕获并处理错误
      error.value = (err as Error).message // 将错误信息存储到响应式引用中
      console.error('注册失败:', err) // 在控制台输出错误信息
      return { user: null, userInfo: null, error: error.value } // 返回错误信息
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }
  
  // 用户登出功能的异步函数
  const logout = async () => {
    try {
      // 清空之前的错误信息
      error.value = null
      // 设置加载状态为 true
      loading.value = true
      
      // 调用 Supabase API 进行用户登出
      const { error: signoutError } = await supabase.auth.signOut()
      
      // 如果登出时出现错误，则抛出异常
      if (signoutError) throw signoutError
      
      // 清空用户信息
      user.value = null
      userInfo.value = null
      
      // 清除本地认证状态存储
      authStore.logout()
      
      // 返回登出成功信息
      return { success: true }
    } catch (err) {
      // 捕获并处理错误
      error.value = (err as Error).message // 将错误信息存储到响应式引用中
      console.error('登出失败:', err) // 在控制台输出错误信息
      return { success: false, error: error.value } // 返回错误信息
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }
  
  // 初始化认证状态的异步函数
  const initAuth = async () => {
    try {
      // 监听认证状态变化
      supabase.auth.onAuthStateChange((event, session) => {
        // 当用户登录时
        if (event === 'SIGNED_IN') {
          user.value = session?.user || null // 更新用户信息
        } 
        // 当用户登出时
        else if (event === 'SIGNED_OUT') {
          user.value = null // 清空用户信息
          userInfo.value = null // 清空用户详细信息
        }
      })
      
      // 获取当前用户
      await getCurrentUser()
    } catch (err) {
      // 捕获并处理初始化错误
      console.error('初始化认证状态失败:', err)
    }
  }
  
  // 在组件挂载时初始化认证状态
  onMounted(() => {
    initAuth()
  })
  
  // 返回所有需要的属性和方法，供组件使用
  return {
    user, // 当前用户信息
    userInfo, // 用户详细信息
    loading, // 加载状态
    error, // 错误信息
    isAuthenticated, // 是否已认证的计算属性
    login, // 登录方法
    register, // 注册方法
    logout, // 登出方法
    getCurrentUser, // 获取当前用户方法
    initAuth // 初始化认证状态方法
  }
}