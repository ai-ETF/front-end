<template>
  <div class="breadcrumbs">
    <span
      v-for="(item, index) in items"
      :key="index"
      class="breadcrumb-item"
      :class="{ active: index === items.length - 1 }"
      @click="navigateTo(item, index)"
    >
      {{ item.name }}
      <span v-if="index < items.length - 1" class="separator">/</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BreadcrumbItem {
  id: string | null
  name: string
  path?: string
}

interface Props {
  items: BreadcrumbItem[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'navigate', item: BreadcrumbItem, index: number): void
}

const emit = defineEmits<Emits>()

const navigateTo = (item: BreadcrumbItem, index: number) => {
  // 不对最后一个项目执行导航
  if (index === props.items.length - 1) return
  
  emit('navigate', item, index)
}
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  cursor: pointer;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.breadcrumb-item:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #666;
  cursor: default;
}

.breadcrumb-item.active:hover {
  text-decoration: none;
}

.separator {
  margin: 0 8px;
  color: #ccc;
  cursor: default;
}
</style>