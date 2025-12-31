<template>
  <div class="files-container">
    <FileManager />
  </div>
</template>

<script setup lang="ts">
import FileManager from '@/components/FileManager.vue'
</script>

<style scoped>
.files-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>