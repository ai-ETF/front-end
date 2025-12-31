export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mime_type: string | null
  size: number | null
  parent_id: string | null
  storage_path: string | null
  user_id: string
  created_at: string
  updated_at: string
  // 前端扩展字段
  isSelected?: boolean
  isUploading?: boolean
  uploadProgress?: number
}

export interface BreadcrumbItem {
  id: string | null
  name: string
  path: string
}

export interface UploadOptions {
  shouldSaveToLibrary?: boolean
  shouldVectorize?: boolean
  tags?: string[]
  description?: string
}

export interface FileOperationResult {
  success: boolean
  data?: FileItem
  error?: string
}