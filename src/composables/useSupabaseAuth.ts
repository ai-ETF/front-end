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
  // 用户 ID，为字符串类型（UUID）
  id: string | null
  // 用户邮箱
  email: string
  // 用户名，可选属性
  username?: string | null
  // 用户创建时间
  created_at?: string
  // 用户更新时间
  updated_at?: string
}

// 导出认证组合式函数
export const useSupabaseAuth = () => {
  // 获取认证状态管理的 store 实例
  const authStore = useAuthStore()
  
  // 创建响应式引用，存储扩展的用户信息（自定义 UserInfo 类型）
  const userInfo = ref<UserInfo | null>(null)
  // 创建响应式引用，表示当前是否正在加载
  const loading = ref<boolean>(false)
  // 创建响应式引用，存储错误信息
  const error = ref<string | null>(null)
  
  // 计算属性：检查用户是否已认证（如果 user 存在则返回 true）
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  
  // 计算属性：获取当前用户信息
  const user = computed(() => {
    if (!authStore.user) return null
    
    // 将 store 中的用户信息转换为 Supabase User 格式
    return {
      id: authStore.user.id,
      email: authStore.user.email || '',
      created_at: authStore.user.created_at,
      updated_at: authStore.user.updated_at
    } as User
  })
  
  // 获取当前用户信息的异步函数
  const getCurrentUser = async () => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 调用 Supabase API 获取当前用户信息
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      // 如果获取用户时出现错误，则抛出异常
      if (userError) {
        // 如果是会话丢失错误，这是预期的行为，不视为错误
        if (userError.message === 'Auth session missing!') {
          console.debug('用户未登录或会话已过期，这是正常情况')
        } else {
          throw userError
        }
      }
      
      // 更新本地认证状态存储，保存用户基本信息
      authStore.setUserFromSupabase(currentUser)
      
      // 如果成功获取到用户信息
      if (currentUser) {
        // 获取用户附加信息（如果有的话）
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.id)
        .maybeSingle()    // 期望只返回一条记录
        
        // 处理用户资料信息
        if (!profileError && profile) {
          // 如果成功获取到用户资料，使用 profiles 表中的用户名
          userInfo.value = {
            id: profile.user_id,
            email: currentUser.email || '',
            username: profile.username,
            created_at: currentUser.created_at,
            updated_at: currentUser.updated_at
          }
        } else {
          // 如果没有获取到用户资料，使用邮箱作为用户名
          userInfo.value = {
            id: currentUser.id,
            email: currentUser.email || '',
            username: currentUser.email?.split('@')[0] || currentUser.email || '',
            created_at: currentUser.created_at,
            updated_at: currentUser.updated_at
          }
        }
      }
      
      // 返回当前用户和用户信息
      return { user: currentUser, userInfo: userInfo.value }
    } catch (err) {
      // 捕获并处理错误
      error.value = (err as Error).message // 将错误信息存储到响应式引用中
      console.error('获取当前用户信息失败:', err) // 在控制台输出错误信息
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
        email,
        password
      })
      
      // 如果登录时出现错误，则抛出异常
      if (loginError) throw loginError
      
      // 更新本地认证状态存储
      authStore.setUserFromSupabase(data.user)
      
      // 返回登录成功的用户信息
      return { user: data.user, error: null }
    } catch (err) {
      // 捕获并处理错误
      error.value = (err as Error).message // 将错误信息存储到响应式引用中
      console.error('登录失败:', err) // 在控制台输出错误信息
      return { user: null, error: error.value } // 返回错误信息
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
      const { data, error: registerError } = await supabase.auth.signUp({
        email,
        password
      })
      
      // 如果注册时出现错误，则抛出异常
      if (registerError) throw registerError
      
      // 如果注册成功并且返回了用户信息
      if (data?.user) {
        // 创建用户资料记录
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,  // 用户 ID
              username: username || email, // 用户名（如果未提供则使用邮箱）
              email: data.user.email || '', // 用户邮箱
              updated_at: new Date().toISOString() // 更新时间
            }
          ])
          
        // 如果创建用户资料时出现错误，仅在控制台输出警告
        if (insertError) {
          console.warn('创建用户资料失败:', insertError)
        }
        
        // 设置用户信息
        userInfo.value = {
          id: data.user.id,
          email: data.user.email || '',
          username: username || email,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at
        }
        
        // 更新本地认证状态存储
        authStore.setUserFromSupabase(data.user)
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
      
      // 清除用户详细信息
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
          if (session?.user) {
            authStore.setUserFromSupabase(session.user)
          }
        } 
        // 当用户登出时
        else if (event === 'SIGNED_OUT') {
          userInfo.value = null // 清空用户详细信息
          authStore.logout() // 清除本地存储
        }
      })
      
      // 获取当前用户
      await getCurrentUser()
    } catch (err) {
      // 捕获并处理初始化错误
      // 仅在非会话丢失错误时记录错误
      if (!(err instanceof Error) || err.message !== 'Auth session missing!') {
        console.error('初始化认证状态失败:', err)
      } else {
        console.debug('初始化认证状态时发现用户未登录，这是正常情况')
      }
    }
  }
  
  // 在组件挂载时初始化认证状态
  // 注意：这里不能直接在 async setup() 中调用 onMounted
  // 需要在返回的对象中提供一个方法供组件在适当的时候调用
  const mount = () => {
    initAuth()
  }
  
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
    initAuth, // 初始化认证状态方法
    mount // 挂载方法，用于在组件中正确初始化认证状态
  }
}