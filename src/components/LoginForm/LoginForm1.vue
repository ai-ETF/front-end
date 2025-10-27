<template>
  <div class="login-container">
    <!-- 品牌标识 -->
    <div class="brand">ChatGPT</div>
    
    <!-- 标题区域 -->
    <h1 class="title">登录或注册</h1>
    <p class="subtitle">您将获得更加智能的回复并能上传文件、图片等内容。</p>
    
    <!-- 第三方登录按钮 -->
    <div class="auth-buttons">
      <button class="auth-btn">
        <span class="icon">G</span> 继续使用Google登录
      </button>
      <button class="auth-btn">
        <span class="icon">A</span> 继续使用Apple登录
      </button>
      <button class="auth-btn">
        <span class="icon">M</span> 继续使用Microsoft登录
      </button>
    </div>
    
    <!-- 分隔线 -->
    <div class="divider">
      <span class="line"></span>
      <span class="text">或</span>
      <span class="line"></span>
    </div>
    
    <!-- 电子邮件输入框 -->
    <div class="input-container">
      <input 
        type="email" 
        placeholder="电子邮件地址" 
        class="email-input"
      >
    </div>
    
    <!-- 继续按钮 -->
    <button class="continue-btn">继续</button>
    
    <!-- 底部链接 -->
    <div class="bottom-text">
        还没有账户？ 
        <router-link to="/register" class="link-register">注册</router-link>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.brand {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  color: #000000;
}

.title {
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
  color: #000000;
}

.subtitle {
  font-size: 14px;
  text-align: center;
  color: #666666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s;
}

.auth-btn:hover {
  border-color: #cccccc;
}

.icon {
  margin-right: 10px;
  font-weight: bold;
  font-size: 18px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.line {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
}

.text {
  padding: 0 15px;
  font-size: 14px;
  color: #666666;
}

.input-container {
  margin-bottom: 20px;
}

.email-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.email-input:focus {
  outline: none;
  border-color: #007bff;
}

.continue-btn {
  width: 100%;
  padding: 14px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
}

.bottom-link {
  text-align: center;
}

.phone-link {
  font-size: 14px;
  color: #000000;
  text-decoration: none;
}

.phone-link:hover {
  text-decoration: underline;
}
</style>