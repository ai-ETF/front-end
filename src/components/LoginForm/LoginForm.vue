<template>
  <div class="page-container">
    <!-- 品牌标识移到左上角 -->
    <div class="logo">
      <!-- 创建了一个新的独立组件 PigLogo.vue，它只包含小猪鼻子图标及其样式和动画效果，去除了原 Logo 组件中的其他元素（如折叠/展开按钮等）。 -->
      <!-- 在登录表单中使用了这个新创建的 PigLogo 组件，替换了原来的 Logo 组件。 -->
      <PigLogo />
      <!-- Logo.vue文件里面的小猪鼻子logo进行单独的提出，形成一个新的组件在这里展示 -->
      <span class="logo-text">小E助手</span>
    </div>
    
    <!-- 标题区域 -->
    <h1 class="title">登录或注册</h1>
    <p class="subtitle">你将获得更智能的体验</p>
    
    <!-- 输入框区域 -->
    <div class="input-container">
      <div class="input-group">
        <div class="input-frame">
          <!-- 用户名图标 -->
          <svg class="input-icon" id="Logo-Keybase--Streamline-Carbon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" height="24" width="24">
            <desc>
              Logo Keybase Streamline Icon: https://streamlinehq.com
            </desc>
            <defs></defs>
            <path id="_Path_" d="M14.1233 26.9328a1.1122 1.1122 0 1 1-1.1121-1.1122 1.112 1.112 0 0 1 1.1121 1.1122" fill="#000000"></path>
            <path id="_Path_2" d="M21.0257 26.9328a1.1122 1.1122 0 1 1-1.1122-1.1122 1.1121 1.1121 0 0 1 1.1122 1.1122" fill="#000000"></path>
            <path transform="rotate(-86.462 10.486 6.284)" d="M9.9988 5.7973h.9741v.9743h-.9741Z" fill="#000000"></path>
            <path d="m26.4275 16.3825-.0013.001a13.0868 13.0868 0 0 0-5.1431-4.1825c-.3754-.1667-.7543-.3142-1.1354-.4454.0128-.0314.0277-.0615.04-.0933a4.83 4.83 0 0 0-2.9861-6.319 5.9368 5.9368 0 0 0-1.9962-.3558c-.0366-.1253-.1165-.6743.58-2.1571L14.3742 2q-.17.236-.3368.4661c-.384.5309-.7549 1.0444-1.1029 1.55a2.1657 2.1657 0 0 0-1.4486-.6771l-1.6316-.1013H9.852l-.0025 0c-.0429-.0025-.0864-.0039-.1293-.0039A2.1877 2.1877 0 0 0 7.54 5.2825l-.1012 1.6344 0 .003 0 .0028A2.1882 2.1882 0 0 0 9.4854 9.23l1.1673.0723a5.1711 5.1711 0 0 0 .47 2.688 13.1954 13.1954 0 0 0-4.2637 2.9C3 18.7883 3 23.06 3 26.4916v2.0706l1.524-1.6163A12.3293 12.3293 0 0 0 5.8548 30h1.9819a10.7091 10.7091 0 0 1-1.9587-4.49l2.2353-2.3708L6.963 26.745l2.03-1.4774c3.5858-2.61 7.8678-3.2093 12.7263-1.7826a4.6276 4.6276 0 0 0 5.2189-1.468c.0441-.0628.0828-.128.1228-.1926a9.6141 9.6141 0 0 1 .1638 1.7454 12.4214 12.4214 0 0 1-1.61 6.43h1.877A14.4022 14.4022 0 0 0 28.87 23.57a12.2666 12.2666 0 0 0-2.4425-7.1875ZM13.8455 5.9257a1.5872 1.5872 0 0 0 1.3983.7068 4.2111 4.2111 0 0 1 1.44.2719 3.17 3.17 0 0 1 1.0279 5.4638l-.4752-.5849-.0032-.004a1.7048 1.7048 0 0 0-3.0235.9865 3.2143 3.2143 0 0 1-1.899-3.5412 8.4815 8.4815 0 0 1 1.4374-3.466 1.642 1.642 0 0 0 .0973.1671Zm3.49 9.2589-.6072.4962a.2675.2675 0 0 1-.376-.038l-.1264-.1549a.2791.2791 0 0 1 .0394-.3927l.6-.49-1.235-1.5158a.362.362 0 1 1 .5611-.4575l3.4546 4.2517a.3619.3619 0 0 1-.1988.5815.3566.3566 0 0 1-.0816.0094.3609.3609 0 0 1-.2806-.1332l-.3441-.4239-1.2215.9971a.2815.2815 0 0 1-.3965-.04l-.5532-.6775a.2786.2786 0 0 1 .04-.3919l1.2275-1.002ZM9.08 7.0184l.1014-1.6342a.5394.5394 0 0 1 .5386-.5061l.0326.001 1.6335.1013a.5387.5387 0 0 1 .5046.5716l-.0073.1182a10.6739 10.6739 0 0 0-.9028 2.0046l-1.3947-.0862a.5407.5407 0 0 1-.5059-.5702ZM25.5944 21.07a2.9883 2.9883 0 0 1-3.4112.8373c-4.5313-1.3305-8.6289-1.0534-12.2124.82l1.9069-5.978-7.203 7.6393a11.67 11.67 0 0 1 3.3532-8.3419 11.4953 11.4953 0 0 1 4.1073-2.6908 5.42 5.42 0 0 0 2.2411 1.2214 4.714 4.714 0 0 0 .5627.12 1.6258 1.6258 0 0 0 .2449 1.6416l.0847.1038a1.6247 1.6247 0 0 0 .2594 1.605l.5532.6777a1.6276 1.6276 0 0 0 2.29.2314l.3314-.2705a1.7079 1.7079 0 0 0 1.9867-2.6535l-1.9427-2.3911a4.88 4.88 0 0 0 .4863-.456 12.449 12.449 0 0 1 1.3829.5181 11.419 11.419 0 0 1 4.5085 3.6838c.9744 1.3402 1.1502 2.7167.4701 3.6824Z" fill="#000000"></path>
            <path id="_Transparent_Rectangle" d="M0 0h32v32H0Z" fill="none"></path>
          </svg>
          <input v-model="email" type="email" placeholder="邮箱" class="input-field" />
        </div>
      </div>
      
      <div class="input-group">
        <div class="input-frame">
          <!-- 密码图标 -->
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" id="Key--Streamline-Solar-Ar" height="24" width="24">
            <desc>
              Key Streamline Icon: https://streamlinehq.com
            </desc>
            <path d="M15.6807 14.5869c3.4901 0 6.3193 -2.8177 6.3193 -6.29346C22 4.81767 19.1708 2 15.6807 2c-3.49 0 -6.3192 2.81767 -6.3192 6.29344 1.60994 1.60994 2.78086 0.7348 2.78086 0.7348l-7.64189 7.6106c-0.34291 0.3415 -0.82298 1.2294 0 2.049l0.88175 0.8782c0.34289 0.2927 1.20503 0.7025 1.91044 0l1.02871 -1.0245c1.02872 1.0245 2.20439 0.4391 2.64527 -0.1464 0.7348 -1.0245 -0.14696 -2.049 -0.14696 -2.049l0.29392 -0.2927c1.41076 1.405 2.64526 0.5854 3.08616 0 0.7348 -1.0245 0 -2.049 0 -2.049 -0.2939 -0.5855 -0.8817 -0.5855 -0.147 -1.3172l0.8818 -0.8782c0.7054 0.5854 2.1554 0.7318 2.7922 0.7318Z" stroke="#000000" stroke-linejoin="round" stroke-width="1.5"></path>
            <path d="M17.8851 8.29353c0 1.21248 -0.9869 2.19537 -2.2044 2.19537 -1.2174 0 -2.2044 -0.98289 -2.2044 -2.19537s0.987 -2.19539 2.2044 -2.19539c1.2175 0 2.2044 0.98291 2.2044 2.19539Z" stroke="#000000" stroke-width="1.5"></path>
          </svg>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="密码" class="input-field" />
          <!-- 眼睛图标 - 密码可见性切换 -->
          <div class="eye-icon" @click="togglePasswordVisibility">
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- 错误消息显示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <!-- 继续按钮 -->
      <button @click="handleLogin" :disabled="loading" class="continue-btn">
        {{ loading ? '登录中...' : '继续' }}
      </button>
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
import { useRouter } from 'vue-router'
import { useSupabaseAuth } from '@/composables/useSupabaseAuth'
import PigLogo from '@/components/PigLogo.vue'


const router = useRouter()
const { login, loading } = useSupabaseAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)

const handleLogin = async () => {
  try {
    if (!email.value || !password.value) {
      errorMessage.value = '请填写邮箱和密码'
      return
    }
    
    const { user, error } = await login(email.value, password.value)
    
    if (error) {
      errorMessage.value = error
      return
    }
    
    if (user) {
      router.push('/chat')
    }
  } catch (error: any) {
    errorMessage.value = error.message || '登录过程中发生错误'
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
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
  font-size: 24px;
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

.input-icon {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  color: #000000;
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

.eye-icon {
  margin-left: auto;
  cursor: pointer;
}

/* 错误消息 */
.error-message {
  color: #e53e3e;
  background-color: #fef2f2;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #fed7d7;
  width: 100%;
  text-align: center;
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

.continue-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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