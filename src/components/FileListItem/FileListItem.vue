<template>
  <tr 
    class="file-list-item"
    :class="{ selected: isSelected }"
    @click="handleSelect"
    @dblclick="handleDoubleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <td>
      <input
        type="checkbox"
        :checked="isSelected"
        @click.stop="toggleSelection"
      />
    </td>
    <td class="file-name">
      <div class="file-icon">
        {{ file.type === 'folder' ? '📁' : '📄' }}
      </div>
      <span class="file-text">{{ file.name }}</span>
    </td>
    <td>{{ formatFileSize(file.size) }}</td>
    <td>{{ formatDate(file.updated_at) }}</td>
    <td class="actions">
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
    </td>
  </tr>
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

const toggleSelection = () => {
  handleSelect()
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
.file-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-list-item:hover {
  background-color: #f5f5f5;
}

.file-list-item.selected {
  background-color: #e6f7ff;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 16px;
}

.file-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  font-size: 14px;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

.action-btn.danger:hover {
  background-color: #ffccc7;
  color: #ff4d4f;
}
</style>