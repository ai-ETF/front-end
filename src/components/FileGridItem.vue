<template>
  <div 
    class="file-grid-item"
    :class="{ selected: isSelected }"
    @click="handleSelect"
    @dblclick="handleDoubleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <div class="file-icon">
      {{ file.type === 'folder' ? '📁' : '📄' }}
    </div>
    <div class="file-info">
      <div class="file-name">{{ file.name }}</div>
      <div class="file-meta">
        <span v-if="file.type === 'file'">{{ formatFileSize(file.size) }}</span>
        <span>{{ formatDate(file.updated_at) }}</span>
      </div>
    </div>
    <div class="actions">
      <button @click.stop="handleRename" title="重命名" class="action-btn">
        ✏️
      </button>
      <button @click.stop="handleMove" title="移动" class="action-btn">
        🔄
      </button>
      <button @click.stop="handleDelete" title="删除" class="action-btn danger">
        🗑️
      </button>
      <button 
        v-if="file.type === 'file'" 
        @click.stop="handleDownload" 
        title="下载" 
        class="action-btn"
      >
        ⬇️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '@/types/file'
import { formatFileSize, formatDate } from '@/utils/fileUtils'

interface Props {
  file: FileItem
  isSelected: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'select'): void
  (e: 'enter'): void
  (e: 'rename'): void
  (e: 'move'): void
  (e: 'delete'): void
  (e: 'download'): void
  (e: 'contextmenu', event: MouseEvent): void
}

const emit = defineEmits<Emits>()

const handleSelect = () => {
  emit('select')
}

const handleDoubleClick = () => {
  if (props.file.type === 'folder') {
    emit('enter')
  } else {
    emit('download')
  }
}

const handleRename = () => {
  emit('rename')
}

const handleMove = () => {
  emit('move')
}

const handleDelete = () => {
  emit('delete')
}

const handleDownload = () => {
  emit('download')
}

const handleContextMenu = (event: MouseEvent) => {
  emit('contextmenu', event)
}
</script>

<style scoped>
.file-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  text-align: center;
  border: 1px solid #eee;
}

.file-grid-item:hover {
  background-color: #f5f5f5;
  border-color: #1890ff;
}

.file-grid-item.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.file-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.file-info {
  width: 100%;
  margin-bottom: 8px;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  gap: 8px;
}

.actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
}

.file-grid-item:hover .actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  font-size: 14px;
}

.action-btn:hover {
  background: white;
}

.action-btn.danger:hover {
  color: #ff4d4f;
}
</style>