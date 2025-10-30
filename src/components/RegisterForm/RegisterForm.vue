<template>
  <div class="auth-container">
    <!-- 品牌标识移到左上角 -->
    <div class="logo">
      <!-- 创建了一个新的独立组件 PigLogo.vue，它只包含小猪鼻子图标及其样式和动画效果，去除了原 Logo 组件中的其他元素（如折叠/展开按钮等）。 -->
      <!-- 在登录表单中使用了这个新创建的 PigLogo 组件，替换了原来的 Logo 组件。 -->
      <PigLogo />
      <span class="logo-text">小E助手</span>
    </div>
    
    <div class="content">
      <h1 class="title">创建账户</h1>
      <p class="subtitle">设置小E的密码以继续</p>
      
      <div class="input-container">
        <div class="input-group">
          <div class="input-frame">
            <!-- 用户名图标 -->
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input v-model="username" type="text" placeholder="用户名" class="input-field" />
          </div>
        </div>
        
        <div class="input-group">
          <div class="input-frame">
            <!-- 密码图标 -->
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="密码" class="input-field" />
            <div class="eye-icon" @click="togglePasswordVisibility">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 继续按钮 -->
        <button @click="handleRegister" class="continue-btn">继续</button>
      </div>
      
      <div class="terms-text">
        <router-link to="/terms" class="link-terms">使用条款</router-link> | 
        <router-link to="/privacy" class="link-terms">隐私协议</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import PigLogo from '@/components/PigLogo.vue'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleRegister = async () => {
  try {
    if (!username.value || !password.value) {
      alert('请填写用户名和密码')
      return
    }
    
    await authStore.register(username.value, password.value)
    router.push('/chat')
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 20px;
  position: relative;
}

/* 品牌标识定位到左上角 */
.logo {
  display: flex;
  align-items: center;
  position: absolute;
  top: 20px;
  left: 20px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff0000;
  margin-right: 6px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  margin-left: 10px;
  font-family: sans-serif;
}

.content {
  display: flex;
  flex-direction: column; 
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.title {
  font-size: 36px;
  text-align: center;
  margin-bottom: 10px;
  font-family: sans-serif;
  font-weight: bold;
}

.subtitle {
  font-size: 20px;
  text-align: center;
  margin-bottom: 30px;
  color: #666666;
  font-family: sans-serif;
}

.input-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-group {
  width: 100%;
  margin-bottom: 20px;
}

.input-frame {
  display: flex;
  align-items: center;
  border: 2px solid #000000;
  border-radius: 25px;
  height: 60px;
  padding: 0 20px;
  width: 100%;
}

.input-icon {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  color: #000000;
}

.eye-icon {
  margin-left: auto;
  margin-right: 0;
  cursor: pointer;
}

.input-field {
  flex: 1;
  border: none;
  outline: none;
  height: 100%;
  font-size: 16px;
  font-family: sans-serif;
  background: transparent;
}

.continue-btn {
  width: 100%;  
  height: 60px;
  background-color: #000000; 
  color: #ffffff; 
  border: none; 
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
}

.terms-text { 
  text-align: center;
  margin: 10px 0 25px;
  font-family: sans-serif;
  font-size: 14px;
}

.link-terms {
  color: #000000;
  text-decoration: none;
}

.button-container {
  display: flex;
  margin-bottom: 25px;
  width: 100%;
}

.button-frame {
  width: 200px;
  height: 40px;
  border: 20px solid #000000;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.button-arrow {
  font-size: 20px;
  font-weight: bold;
}
</style>