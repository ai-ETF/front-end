<template>
  <div class="auth-container">
    <div class="card">
      <div class="logo">
        <span class="dot red"></span>
        <span class="dot red"></span>
        <span class="logo-text">小E助手</span>
      </div>
      <h1 class="title">创建账户</h1>
      <p class="subtitle">设置小E的密码以继续</p>
      
      <div class="input-group">
        <div class="input-frame">
          <div class="input-checkbox"></div>
          <input v-model="username" type="text" placeholder="用户名" class="input-field" />
        </div>
      </div>
      
      <div class="input-group">
        <div class="input-frame">
          <div class="input-checkbox"></div>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="密码" class="input-field" />
          <div class="input-checkbox right" @click="togglePasswordVisibility">
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="terms-text">
        <router-link to="/terms" class="link-terms">使用条款</router-link> | 
        <router-link to="/privacy" class="link-terms">隐私协议</router-link>
      </div>
      <!-- 继续按钮 -->
      <button @click="handleRegister" class="continue-btn">继续</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

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
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 20px;
}

.card {
  width: 100%;
  max-width: 500px;
  border: 2px solid #000000;
  border-radius: 20px;
  padding: 40px;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff0000;
  margin-right: 6px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
  font-family: sans-serif;
}

.title {
  font-size: 28px;
  text-align: center;
  margin-bottom: 10px;
  font-family: sans-serif;
  font-weight: bold;
}

.subtitle {
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
  color: #666666;
  font-family: sans-serif;
}

.input-group {
  margin-bottom: 20px;
}

.input-frame {
  display: flex;
  align-items: center;
  border: 2px solid #000000;
  border-radius: 25px;
  height: 50px;
  padding: 0 15px;
}

.input-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #000000;
  border-radius: 4px;
  margin-right: 15px;
}

.right {
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
  padding: 14px; 
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