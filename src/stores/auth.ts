import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  password: string // 存储加密后的密码
}

export interface AuthState {
  user: User | null
  users: User[] // 存储所有注册用户
}

// 简单的密码加密函数（仅用于演示，实际项目中应使用更安全的方法）
function encryptPassword(password: string): string {
  return btoa(password) // 使用 base64 编码作为简单示例
}

// 简单的密码解密函数
function decryptPassword(encryptedPassword: string): string {
  return atob(encryptedPassword)
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const users = ref<User[]>([])
  
  // 计算属性：检查用户是否已认证
  const isAuthenticated = computed(() => !!user.value)
  
  // 用户注册（本地存储版本，用于向后兼容）
  const register = (username: string, password: string) => {
    // 检查用户名是否已存在
    const existingUser = users.value.find(user => user.username === username)
    if (existingUser) {
      throw new Error('用户名已存在')
    }
    
    // 创建新用户
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password: encryptPassword(password) // 加密存储密码
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
    
    // 验证密码
    if (decryptPassword(foundUser.password) !== password) {
      throw new Error('密码错误')
    }
    
    // 设置当前用户
    user.value = foundUser
    
    return foundUser
  }
  
  // 用户登出
  const logout = () => {
    user.value = null
  }
  
  // 设置用户（用于初始化时恢复状态或从Supabase同步）
  const setUser = (userData: User | null) => {
    user.value = userData
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
    setUser,
    setUsers
  }
}, {
  persist: {
    key: 'auth-storage',
    storage: localStorage,
    pick: ['user', 'users']
  }
})