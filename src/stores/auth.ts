import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  username: string
  email: string
  user_id: string
  created_at?: string
  updated_at?: string
}

export interface AuthState {
  user: User | null
  users: User[] // 存储所有注册用户（主要用于向后兼容）
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const users = ref<User[]>([])    
  // 计算属性：检查用户是否已认证
  const isAuthenticated = computed(() => !!user.value)
  
  // 用户注册（本地存储版本，用于向后兼容）
  const register = (username: string, password: string, email: string) => {
    // 检查用户名是否已存在
    const existingUser = users.value.find(user => user.username === username)
    if (existingUser) {
      throw new Error('用户名已存在')
    }
    // 创建新用户
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      user_id: Date.now().toString()
    }
    
    // 添加到用户列表
    users.value.push(newUser)
    
    // 自动登录
    user.value = newUser
    
    return newUser
  }
  
  // 用户登录（本地存储版本，用于向后兼容）
  const login = (username: string, password: string) => {
    // 查找用户
    const foundUser = users.value.find(user => user.username === username)
    
    if (!foundUser) {
      throw new Error('用户不存在')
    }
    
    // 设置当前用户
    user.value = foundUser
    
    return foundUser
  }
  
  // 用户登出
  const logout = () => {
    user.value = null
  }
  
  // 从Supabase设置用户（用于初始化时恢复状态或从Supabase同步）
  const setUserFromSupabase = (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      user.value = {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || supabaseUser.id,
        email: supabaseUser.email || '',
        user_id: supabaseUser.id,
        created_at: supabaseUser.created_at,
        updated_at: supabaseUser.updated_at
      }
    } else {
      user.value = null
    }
  }
  
  // 设置用户列表（用于初始化时恢复状态）
  const setUsers = (usersData: User[]) => {
    users.value = usersData
  }
  
  return {
    user,
    users,
    isAuthenticated,
    register,
    login,
    logout,
    setUserFromSupabase,
    setUsers
  }
}, {
  persist: {
    key: 'auth-storage',
    storage: localStorage,
    pick: ['user', 'users']
  }
})