<template>
  <div class="page-container">
    <!-- 品牌标识移到左上角 -->
    <div class="logo">
      <span class="dot red"></span>
      <span class="dot red"></span>
      <span class="logo-text">小E助手</span>
    </div>
    
    <!-- 标题区域 -->
    <h1 class="title">登录或注册</h1>
    <p class="subtitle">你将获得更智能的体验</p>
    
    <!-- 输入框区域 -->
    <div class="input-container">
      <div class="input-group">
        <div class="input-frame">
          <input v-model="username" type="text" placeholder="用户名" class="input-field" />
        </div>
      </div>
      
      <div class="input-group">
        <div class="input-frame">
          <input v-model="password" type="password" placeholder="密码" class="input-field" />
        </div>
      </div>
      
      <!-- 继续按钮 -->
      <button @click="handleLogin" class="continue-btn">继续</button>
    </div>
    
    <!-- 链接区域 -->
    <div class="link-text">忘记密码</div>
    
    <!-- 底部链接 -->
    <div class="bottom-text">
      还没有账户？ 
      <router-link to="/register" class="link-register">注册</router-link>
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

const handleLogin = async () => {
  try {
    if (!username.value || !password.value) {
      alert('请填写用户名和密码')
      return
    }
    
    await authStore.login(username.value, password.value)
    router.push('/chat')
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<style scoped>
/* 页面容器 - 确保全屏居中 */
.page-container {
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
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
  font-family: sans-serif;
}

.title {
  font-size: 35px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.input-group {
  width: 100%;
  margin-bottom: 20px;
}

/* 输入框 */
.input-frame {
  display: flex;
  align-items: center;
  border: 2px solid #000000;
  border-radius: 25px;
  height: 60px;
  padding: 0 20px;
  width: 100%;
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

/* 底部按钮 */
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
  height: 60px;
}

.link-text {
  text-align: center;
  margin: 10px 0 25px;
  font-family: sans-serif;
  cursor: pointer;
}

.bottom-text {
  text-align: center;
  font-family: sans-serif;
  font-size: 14px;
}

.link-register {
  color: #000000;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
}
</style>