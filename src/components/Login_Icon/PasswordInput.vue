<template>
  <div class="input-frame">
    <!-- 左侧密码图标 -->
    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    
    <!-- 密码输入框 -->
    <input 
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      v-model="modelValue"
      class="input-field"
    >
    
    <!-- 右侧眼睛图标 -->
    <div @click="togglePassword" class="icon-container">
      <svg v-if="!showPassword" class="input-icon right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94a10 10 0 0 1-14.14 0l-.71-.71a10 10 0 0 1 0-14.14l.71-.71a10 10 0 0 1 14.14 0l.71.71a10 10 0 0 1 0 14.14l-.71.71z"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
      
      <svg v-else class="input-icon right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordInput',
  props: {
    placeholder: {
      type: String,
      default: '请输入密码'
    },
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showPassword: false
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    }
  },
  watch: {
    modelValue(newVal) {
      this.$emit('update:modelValue', newVal)
    }
  }
}
</script>

<style scoped>
.input-frame {
  display: flex;
  align-items: center;
  border: 2px solid #000000;
  border-radius: 8px;
  height: 56px;
  padding: 0 15px;
}

.input-icon {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  color: #000000;
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

.icon-container {
  cursor: pointer;
}
</style>