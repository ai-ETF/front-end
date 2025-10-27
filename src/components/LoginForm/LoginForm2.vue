<template>
  <div class="auth-container">
    <div class="card">
      <div class="logo">
        <span class="dot red"></span>
        <span class="dot red"></span>
        <span class="logo-text">小E助手</span>
      </div>
      <h1 class="title">登录或注册</h1>
      <p class="subtitle">你将获得更智能的体验</p>
      
      <div class="input-group">
        <div class="input-frame">
          <div class="input-checkbox"></div>
          <input type="text" placeholder=" " class="input-field" />
        </div>
      </div>
      
      <div class="input-group">
        <div class="input-frame">
          <div class="input-checkbox"></div>
          <input type="password" placeholder=" " class="input-field" />
          <div class="input-checkbox right"></div>
        </div>
      </div>
      
      <div class="link-text">忘记密码</div>
      
      <div class="button-container">
        <div class="button-frame">
          <span class="button-arrow">→</span>
        </div>
      </div>
      
      <div class="bottom-text">
        还没有账户？ 
        <router-link to="/register" class="link-register">注册</router-link>
      </div>
    </div>
  </div>
</template>

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
  border-radius: 8px;
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

.link-text {
  text-align: center;
  margin: 10px 0 25px;
  font-family: sans-serif;
  cursor: pointer;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 25px;
}

.button-frame {
  width: 60px;
  height: 40px;
  border: 2px solid #000000;
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