<template>
  <div class="page">
    <ChatInput @send="onSend">
      <!-- 左边插槽 -->
      <template #prefix>
        <span>＋</span>
      </template>

      <!-- 右边插槽 -->
      <template #suffix>
        <img :src="sentSvg"></img>
      </template>
    </ChatInput>
  </div>
</template>

<script setup lang="ts">
import ChatInput from '@/components/chatInput/chatInput.vue'
import sentSvg from '@/assets/svg/send.svg'
const onSend = (msg: string) => {
  console.log('发送消息：', msg)
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: calc(100-64);
  justify-content: flex-end;
}


</style>
