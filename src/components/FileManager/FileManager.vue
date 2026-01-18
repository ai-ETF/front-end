<template>
  <div class="file-manager">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="left-section">
        <!-- 返回按钮 -->
        <button 
          v-if="breadcrumbs.length > 1"
          @click="goUp"
          class="btn-back"
          title="返回上一级"
        >
          <span class="icon">←</span>
          <image :src="arrowLeft" alt="Back" />
        </button>
        
        <!-- 面包屑导航 -->
        <Breadcrumbs 
          :items="breadcrumbs"
          @navigate="navigateTo"
        />
      </div>
      
      <div class="right-section">
        <!-- 搜索框 -->
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索文件或文件夹..."
            @input="handleSearch"
            @keyup.enter="performSearch"
          />
          <button @click="performSearch" class="btn-search">
            <!-- <span class="icon">🔍</span> -->
            <img :src="search" alt="Search" class="icon" />
          </button>
        </div>
        
        <!-- 视图切换 -->
        <div class="view-toggle">
          <button
            @click="viewMode = 'grid'"
            :class="{ active: viewMode === 'grid' }"
            title="网格视图"
          >
            <!-- <span class="icon">⏹</span> -->
            <img :src="viewGrid" alt="Grid View" class="icon" />
          </button>
          <button
            @click="viewMode = 'list'"
            :class="{ active: viewMode === 'list' }"
            title="列表视图"
          >
            <!-- <span class="icon">≡</span> -->
            <img :src="list" alt="List View" class="icon" />
          </button>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="showNewFolderModal = true" class="btn-new-folder">
            <!-- <span class="icon">📁</span> -->
            <image :src="folderPlus" alt="New Folder" class="icon" />
            新建文件夹
          </button>
          <button @click="showUploadModal = true" class="btn-upload">
            <!-- <span class="icon">📤</span> -->
            <img :src="upload" alt="Upload" class="icon" />
            上传文件
          </button>
        </div>
      </div>
    </div>
    
    <!-- 批量操作栏 -->
    <div v-if="selectedCount > 0" class="batch-toolbar">
      <div class="batch-info">
        已选择 {{ selectedCount }} 个项目
      </div>
      <div class="batch-actions">
        <button @click="downloadSelected" title="下载">
          <!-- <span class="icon">⬇</span> -->
          <img :src="download" alt="Download" class="icon" />
        </button>
        <button @click="moveSelected" title="移动">
          <!-- <span class="icon">⇄</span> -->
          <img :src="move" alt="Move" class="icon" />
        </button>
        <button @click="deleteSelected" title="删除" class="danger">
          <!-- <span class="icon">🗑</span> -->
          <img :src="deleteIcon" alt="Delete" class="icon" />
        </button>
        <button @click="clearSelection" title="取消选择">
          <!-- <span class="icon">×</span> -->
          <img :src="xmark" alt="Clear Selection" class="icon" />
        </button>
      </div>
    </div>
    
    <!-- 文件列表区域 -->
    <div class="file-list-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠</div>
        <p>{{ error }}</p>
        <button @click="refresh" class="btn-retry">重试</button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="filteredFiles.length === 0" class="empty-state">
        <!-- <div class="empty-icon">📄</div> -->
        <img :src="fileSVG" alt="No Files" class="empty-icon" />
        <p v-if="searchQuery">没有找到匹配的文件</p>
        <p v-else>这个文件夹是空的</p>
        <button v-if="!searchQuery" @click="showUploadModal = true" class="btn-upload-first">
          上传第一个文件
        </button>
      </div>
      
      <!-- 文件列表 -->
      <template v-else>
        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="file-list list-view">
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>名称</th>
                <th style="width: 100px;">大小</th>
                <th style="width: 150px;">修改日期</th>
                <th style="width: 100px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <FileListItem
                v-for="file in filteredFiles"
                :key="file.id"
                :file="file"
                :is-selected="selectedFiles.has(file.id)"
                @select="toggleFileSelection(file.id)"
                @enter="enterFolder(file)"
                @rename="showRenameModal(file)"
                @move="showMoveModal(file)"
                @delete="confirmDelete(file)"
                @download="downloadFile(file)"
                @contextmenu="showContextMenu($event, file)"
              />
            </tbody>
          </table>
        </div>
        
        <!-- 网格视图 -->
        <div v-else class="file-list grid-view">
          <FileGridItem
            v-for="file in filteredFiles"
            :key="file.id"
            :file="file"
            :is-selected="selectedFiles.has(file.id)"
            @select="toggleFileSelection(file.id)"
            @enter="enterFolder(file)"
            @rename="showRenameModal(file)"
            @move="showMoveModal(file)"
            @delete="confirmDelete(file)"
            @download="downloadFile(file)"
            @contextmenu="showContextMenu($event, file)"
          />
        </div>
      </template>
    </div>
    
    <!-- 各种模态框 -->
    <Teleport to="body">
      <!-- 新建文件夹模态框 -->
      <div v-if="showNewFolderModal" class="modal-overlay" @click="showNewFolderModal = false">
        <div class="modal-content" @click.stop>
          <h3>新建文件夹</h3>
          <input 
            v-model="newFolderName" 
            type="text" 
            placeholder="输入文件夹名称"
            @keyup.enter="createNewFolder"
            ref="newFolderInputRef"
          />
          <div class="modal-actions">
            <button @click="showNewFolderModal = false" class="btn-cancel">取消</button>
            <button @click="createNewFolder" class="btn-confirm">创建</button>
          </div>
        </div>
      </div>
      
      <!-- 上传文件模态框 -->
      <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
        <div class="modal-content" @click.stop>
          <h3>上传文件</h3>
          <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
            <input
              ref="fileInputRef"
              type="file"
              multiple
              @change="handleFileChange"
              style="display: none;"
            />
            <div v-if="!isDragging" class="upload-prompt" @click="triggerFileInput">
              <!-- <span class="icon">📤</span> -->
              <img :src="upload" alt="Upload" class="upload-icon" />
              <p>点击选择文件或拖拽文件到此处</p>
              <small>支持PDF、文档等格式</small>
            </div>
            <div v-else class="upload-dragging">
              <p>释放鼠标以上传文件</p>
            </div>
          </div>
          <div v-if="uploadQueue.length > 0" class="upload-queue">
            <h4>待上传文件 ({{ uploadQueue.length }})</h4>
            <ul>
              <li v-for="(file, index) in uploadQueue" :key="index">
                <span class="filename">{{ file.name }}</span>
                <span class="filesize">{{ formatFileSize(file.size) }}</span>
                <!-- <button @click="removeFromQueue(index)" class="btn-remove">×</button> -->
                <img :src="xmark" alt="Remove" class="btn-remove" @click="removeFromQueue(index)" />
              </li>
            </ul>
          </div>
          <div class="modal-actions">
            <button @click="closeUploadModal" class="btn-cancel">取消</button>
            <button @click="startUpload" :disabled="uploadQueue.length === 0 || isUploading" class="btn-confirm">
              {{ isUploading ? `上传中 (${uploadedCount}/${uploadQueue.length})` : `开始上传 (${uploadQueue.length})` }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 重命名模态框 -->
      <div v-if="renameFile" class="modal-overlay" @click="renameFile = null">
        <div class="modal-content" @click.stop>
          <h3>重命名</h3>
          <input 
            v-model="renameName" 
            type="text" 
            :placeholder="renameFile?.name"
            @keyup.enter="performRename"
          />
          <div class="modal-actions">
            <button @click="renameFile = null" class="btn-cancel">取消</button>
            <button @click="performRename" class="btn-confirm">确定</button>
          </div>
        </div>
      </div>
      
      <!-- 移动模态框 -->
      <div v-if="moveFile" class="modal-overlay" @click="moveFile = null">
        <div class="modal-content" @click.stop>
          <h3>移动到</h3>
          <p>选择目标文件夹</p>
          <div class="folder-selector">
            <!-- 这里可以实现文件夹选择逻辑 -->
          </div>
          <div class="modal-actions">
            <button @click="moveFile = null" class="btn-cancel">取消</button>
            <button @click="performMove" class="btn-confirm">移动</button>
          </div>
        </div>
      </div>
      
      <!-- 删除确认模态框 -->
      <div v-if="deleteFileItem" class="modal-overlay" @click="deleteFileItem = null">
        <div class="modal-content" @click.stop>
          <h3>确认删除</h3>
          <p>确定要删除 "{{ deleteFileItem?.name }}" 吗？</p>
          <div class="modal-actions">
            <button @click="deleteFileItem = null" class="btn-cancel">取消</button>
            <button @click="performDelete" class="btn-confirm danger">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useFileStore } from '@/stores/file'
import { debounce, formatFileSize } from '@/utils/fileUtils'
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.vue'
import FileListItem from '@/components/FileListItem/FileListItem.vue'
import FileGridItem from '@/components/FileGridItem/FileGridItem.vue'
import type { FileItem } from '@/types/file'
import { 
  fetchFilesByParentId, 
  createFolder, 
  renameFile as renameFileService, 
  moveFile as moveFileService, 
  deleteFile as deleteFileService, 
  downloadFile as downloadFileService, 
  searchFiles, 
  getRecentFiles, 
  uploadFile,
  prepareDownloadForBackend,
  triggerDocumentProcessing
} from '@/services/fileService' // 导入文件服务函数

// SVG 图标导入
import arrowLeft from '@/assets/svg/arrow-left.svg'
import search from '@/assets/svg/search.svg'
import viewGrid from '@/assets/svg/view-grid.svg'
import list from '@/assets/svg/list.svg'
import folderPlus from '@/assets/svg/folder.svg'
import upload from '@/assets/svg/upload-square.svg'
import download from '@/assets/svg/download-square.svg'
import move from '@/assets/svg/move.svg'
import deleteIcon from '@/assets/svg/delete.svg'
import xmark from '@/assets/svg/xmark.svg'
import fileSVG from '@/assets/svg/txt.svg'

const fileStore = useFileStore()

// 响应式数据
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const showNewFolderModal = ref(false)
const showUploadModal = ref(false)
const newFolderName = ref('')
const newFolderInputRef = ref<HTMLInputElement | null>(null)
const renameFile = ref<FileItem | null>(null)
const renameName = ref('')
const moveFile = ref<FileItem | null>(null)
const deleteFileItem = ref<FileItem | null>(null)

// 上传相关
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadQueue = ref<File[]>([])
const isUploading = ref(false)
const uploadedCount = ref(0)
const isDragging = ref(false)

// 计算属性
const loading = computed(() => fileStore.loading)
const error = computed(() => fileStore.error)
const files = computed(() => fileStore.currentFiles)
const breadcrumbs = computed(() => fileStore.breadcrumbs)
const currentFolderId = computed(() => fileStore.currentFolderId)
const selectedFiles = computed(() => fileStore.selectedFiles)
const selectedCount = computed(() => selectedFiles.value.size)
const isAllSelected = computed(() => fileStore.isAllSelected)

// 过滤文件（搜索功能）
const filteredFiles = computed(() => {
  if (!searchQuery.value.trim()) {
    return files.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return files.value.filter(file => 
    file.name.toLowerCase().includes(query)
  )
})

// 生命周期
onMounted(() => {
  loadFolder()
})

// 方法
async function loadFolder() {
  try {
    await fileStore.fetchFiles(currentFolderId.value || null)
  } catch (error) {
    console.error('Failed to load folder:', error)
  }
}

function navigateTo(item: any, index?: number) {
  // 在实际应用中，这里会触发路由变化
  const folderId =
    typeof item === 'string'
      ? item
      : item && (item as any).id
      ? (item as any).id
      : null
  fileStore.fetchFiles(folderId)
}

function goUp() {
  fileStore.goUp()
}

function enterFolder(file: FileItem) {
  if (file.type === 'folder') {
    navigateTo(file.id)
  } else {
    downloadFile(file)
  }
}

function toggleFileSelection(fileId: string) {
  fileStore.toggleFileSelection(fileId)
}

function toggleSelectAll() {
  fileStore.toggleSelectAll()
}

function clearSelection() {
  fileStore.clearSelection()
}

// 搜索相关
const handleSearch = debounce(() => {
  // 搜索逻辑将在输入停止后执行
}, 500)

function performSearch() {
  if (searchQuery.value.trim()) {
    // 在实际应用中，这里会触发搜索
    fileStore.searchFiles(searchQuery.value)
  }
}

// 文件操作
async function createNewFolder() {
  if (!newFolderName.value.trim()) return
  
  try {
    await (fileStore as any).createFolder(newFolderName.value.trim(), currentFolderId.value)
    newFolderName.value = ''
    showNewFolderModal.value = false
  } catch (error) {
    console.error('Failed to create folder:', error)
  }
}

function showRenameModal(file: FileItem) {
  renameFile.value = file
  renameName.value = file.name
  nextTick(() => {
    const input = document.querySelector('input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

async function performRename() {
  if (!renameFile.value || !renameName.value.trim()) return
  
  try {
    await fileStore.renameFile(renameFile.value.id, renameName.value.trim())
    renameFile.value = null
  } catch (error) {
    console.error('Failed to rename file:', error)
  }
}

function showMoveModal(file: FileItem) {
  moveFile.value = file
}

async function performMove() {
  // 实现移动逻辑
  console.log('Moving file:', moveFile.value)
  moveFile.value = null
}

function confirmDelete(file: FileItem) {
  deleteFileItem.value = file
}

async function performDelete() {
  if (!deleteFileItem.value) return
  
  try {
    await fileStore.deleteFile(deleteFileItem.value.id)
    deleteFileItem.value = null
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}

async function downloadFile(file: FileItem) {
  try {
    await fileStore.downloadFile(file.id)
  } catch (error) {
    console.error('Failed to download file:', error)
  }
}

// 批量操作
async function downloadSelected() {
  const selected = Array.from(selectedFiles.value)
  for (const fileId of selected) {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      await downloadFile(file)
    }
  }
}

async function moveSelected() {
  // 这里实现批量移动逻辑
  console.log('批量移动')
}

async function deleteSelected() {
  if (confirm(`确定要删除选中的 ${selectedCount.value} 个项目吗？`)) {
    await fileStore.deleteSelectedFiles()
  }
}

function showContextMenu(event: MouseEvent, file: FileItem) {
  // 实现右键菜单逻辑
  console.log('Context menu for:', file)
}

function refresh() {
  loadFolder()
}

// 上传功能
function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    addFilesToQueue(files)
  }
}

function handleDrop(event: DragEvent) {
  const files = event.dataTransfer?.files
  if (files) {
    const fileArray = Array.from(files)
    addFilesToQueue(fileArray)
  }
  isDragging.value = false
}

function addFilesToQueue(files: File[]) {
  // 过滤重复文件
  const validFiles = files.filter(file => 
    !uploadQueue.value.some(f => f.name === file.name && f.size === file.size)
  )
  
  // 添加到队列
  uploadQueue.value.push(...validFiles)
}

function removeFromQueue(index: number) {
  uploadQueue.value.splice(index, 1)
}

function closeUploadModal() {
  showUploadModal.value = false
  uploadQueue.value = []
  isUploading.value = false
  uploadedCount.value = 0
}

async function startUpload() {
  if (uploadQueue.value.length === 0 || isUploading.value) return
  
  isUploading.value = true
  uploadedCount.value = 0
  
  try {
    // 逐个上传文件
    for (const file of uploadQueue.value) {
      try {
        // 调用store的上传方法，获取上传后的文件信息
        const uploadedFile = await fileStore.uploadFile(file, currentFolderId.value)
        uploadedCount.value++
        
        // 上传成功后，调用 Supabase 的文档处理函数
        if (uploadedFile && uploadedFile.storage_path) {
          // 获取下载凭证
          const downloadCredentials = await prepareDownloadForBackend(uploadedFile.id, uploadedFile.storage_path);
          
          // 触发文档处理
          await triggerDocumentProcessing(uploadedFile.id, downloadCredentials.signed_url);
        }
      } catch (error) {
        console.error('上传单个文件失败:', file.name, error)
        // 继续上传下一个文件
      }
    }
    
    // 关闭模态框
    closeUploadModal()
  } catch (error) {
    console.error('上传过程中出错:', error)
  } finally {
    isUploading.value = false
  }
}

// 拖拽事件处理
function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  // 防止快速进出时的问题
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

function onDrop(event: DragEvent) {
  const files = event.dataTransfer?.files
  if (files) {
    const fileArray = Array.from(files)
    addFilesToQueue(fileArray)
  }
  isDragging.value = false
}
</script>

<style scoped>
.file-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background: #f5f5f5;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 0.25rem;
}

.search-box input {
  border: none;
  background: none;
  padding: 0.5rem;
  outline: none;
  min-width: 200px;
}

.btn-search {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.view-toggle button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle button.active {
  background: #e0e0e0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-new-folder,
.btn-upload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-new-folder:hover,
.btn-upload:hover {
  background: #0056b3;
}

.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #e3f2fd;
  border-bottom: 1px solid #bbdefb;
  flex-shrink: 0;
}

.batch-info {
  font-weight: 500;
  color: #1976d2;
}

.batch-actions {
  display: flex;
  gap: 0.5rem;
}

.batch-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.batch-actions button:hover {
  background: rgba(25, 118, 210, 0.1);
}

.batch-actions button.danger:hover {
  background: rgba(220, 53, 69, 0.1);
}

.file-list-container {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon,
.upload-icon {
  width: 48px;
  height: 48px;
  color: #6c757d;
  opacity: 0.5;
}

.error-icon {
  color: #dc3545;
}

.empty-icon {
  color: #6c757d;
}

.btn-retry,
.btn-upload-first {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.file-list.list-view table {
  width: 100%;
  border-collapse: collapse;
}

.file-list.list-view th,
.file-list.list-view td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.file-list.list-view th {
  font-weight: 600;
  background: #f8f9fa;
  position: sticky;
  top: 0;
}

.file-list.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.modal-content input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background: #f8f9fa;
  color: #6c757d;
}

.btn-confirm {
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-confirm.danger {
  background: #dc3545;
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #007bff;
}

.upload-dragging {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.05);
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-queue {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.upload-queue h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.upload-queue ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.upload-queue li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.filename {
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.filesize {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0 0.5rem;
}

.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #dc3545;
  padding: 0.25rem;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.spinning-icon {
  animation: spin 1s linear infinite;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>