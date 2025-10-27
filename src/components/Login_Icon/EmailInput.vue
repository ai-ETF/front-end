<template>
  <div class="input-frame">
    <!-- 左侧邮箱图标 -->
    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
    
    <!-- 邮箱输入框 -->
    <input 
      type="email"
      :placeholder="placeholder"
      v-model="modelValue"
      class="input-field"
    >
  </div>
</template>

<script>
export default {
  name: 'EmailInput',
  props: {
    placeholder: {
      type: String,
      default: '请输入电子邮件地址'
    },
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
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

.input-field {
  flex: 1;
  border: none;
  outline: none;
  height: 100%;
  font-size: 16px;
  font-family: sans-serif;
  background: transparent;
}
</style>