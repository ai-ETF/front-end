<template>
  <!-- 重命名对话框 -->
  <div
    v-if="showRenameModal"
    class="modal-overlay"
    @click="closeRenameModal"
  >
    <div class="modal-content" @click.stop>
      <h3>重命名会话</h3>
      <input
        v-model="renameInputValue"
        class="modal-input"
        @keyup.enter="confirmRename"
      />
      <div class="modal-actions">
        <button class="modal-button cancel" @click="closeRenameModal">
          取消
        </button>
        <button class="modal-button confirm" @click="confirmRename">
          确认
        </button>
      </div>
    </div>
  </div>

  <!-- 删除确认对话框 -->
  <div
    v-if="showDeleteModal"
    class="modal-overlay"
    @click="closeDeleteModal"
  >
    <div class="modal-content" @click.stop>
      <h3>确认删除</h3>
      <p>
        确定要删除会话 "{{ deleteChatItem?.title || '未命名会话' }}" 吗？
        此操作不可撤销。
      </p>
      <div class="modal-actions">
        <button class="modal-button cancel" @click="closeDeleteModal">
          取消
        </button>
        <button class="modal-button confirm" @click="confirmDelete">
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ====================
// Props
// ====================
const props = defineProps<{
  showRenameModal: boolean
  showDeleteModal: boolean
  renameInputValue: string
  deleteChatItem: any
}>()

// ====================
// Emits
// ====================
const emit = defineEmits<{
  (e: 'update:showRenameModal', value: boolean): void
  (e: 'update:showDeleteModal', value: boolean): void
  (e: 'update:renameInputValue', value: string): void
  (e: 'confirm-rename'): void
  (e: 'confirm-delete'): void
}>()

// ====================
// computed v-model 映射
// ====================

// 重命名弹窗开关
const showRenameModal = computed({
  get: () => props.showRenameModal,
  set: (val: boolean) => {
    emit('update:showRenameModal', val)
  }
})

// 删除弹窗开关
const showDeleteModal = computed({
  get: () => props.showDeleteModal,
  set: (val: boolean) => {
    emit('update:showDeleteModal', val)
  }
})

// 重命名输入框（核心）
const renameInputValue = computed({
  get: () => props.renameInputValue,
  set: (val: string) => {
    emit('update:renameInputValue', val)
  }
})

// ====================
// 行为函数
// ====================
const closeRenameModal = () => {
  showRenameModal.value = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const confirmRename = () => {
  emit('confirm-rename')
}

const confirmDelete = () => {
  emit('confirm-delete')
}
</script>



<style scoped>
/* 模态框遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 模态框内容 */
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-content p {
  margin: 15px 0;
}

/* 模态框输入框 */
.modal-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

/* 模态框操作按钮容器 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 模态框按钮 */
.modal-button {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.modal-button.cancel {
  background-color: #f5f5f5;
  color: #333;
}

.modal-button.cancel:hover {
  background-color: #e0e0e0;
}

.modal-button.confirm {
  background-color: #1890ff;
  color: white;
}

.modal-button.confirm:hover {
  background-color: #40a9ff;
}
</style>