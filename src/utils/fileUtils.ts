import type { FileItem } from '@/types/file'

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class FileCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 100 // 最大缓存项数
  
  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    // 清理过期缓存
    this.cleanup()
    
    // 限制缓存大小
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    })
  }
  
  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }
  
  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiresIn) {
        this.cache.delete(key)
      }
    }
  }
}

// 创建缓存实例
export const fileCache = new FileCache()

/**
 * 获取文件图标
 */
export function getFileIcon(file: FileItem): string {
  if (file.type === 'folder') {
    return 'folder'
  }
  
  if (file.mime_type === 'application/pdf') {
    return 'picture_as_pdf'
  }
  
  // 可以根据其他MIME类型返回不同图标
  return 'insert_drive_file'
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天 ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '昨天 ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * 生成面包屑路径
 */
export function generateBreadcrumbs(
  files: FileItem[], 
  currentFolderId: string | null,
  getFileInfo: (id: string) => Promise<FileItem | null>
): Promise<Array<{ id: string | null; name: string }>> {
  return new Promise(async (resolve) => {
    const breadcrumbs: Array<{ id: string | null; name: string }> = []
    
    // 添加根目录
    breadcrumbs.push({ id: null, name: '全部文件' })
    
    if (currentFolderId) {
      const path: Array<{ id: string; name: string }> = []
      let currentId: string | null = currentFolderId
      
      while (currentId) {
        const folder = await getFileInfo(currentId)
        if (folder) {
          path.unshift({ id: folder.id, name: folder.name })
          currentId = folder.parent_id
        } else {
          break
        }
      }
      
      breadcrumbs.push(...path)
    }
    
    resolve(breadcrumbs)
  })
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * 解析文件名和扩展名
 */
export function parseFileName(filename: string): { name: string; extension: string } {
  const lastDotIndex = filename.lastIndexOf('.')
  
  if (lastDotIndex === -1) {
    return { name: filename, extension: '' }
  }
  
  return {
    name: filename.substring(0, lastDotIndex),
    extension: filename.substring(lastDotIndex + 1)
  }
}

/**
 * 检查是否为图片文件
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * 检查是否为PDF文件
 */
export function isPDFFile(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

/**
 * 获取文件预览URL
 */
export function getPreviewUrl(file: FileItem): string | null {
  if (!file.storage_path) return null
  
  if (isPDFFile(file.mime_type || '')) {
    // PDF预览使用Google Docs Viewer
    const downloadUrl = generateDownloadUrl(file.storage_path)
    return `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`
  }
  
  if (isImageFile(file.mime_type || '')) {
    return generateDownloadUrl(file.storage_path)
  }
  
  return null
}

/**
 * 生成文件下载URL
 */
export function generateDownloadUrl(storagePath: string): string {
  return `/storage/v1/object/public/user-documents/${storagePath}`
}

/**
 * 计算文件哈希（用于去重）
 */
export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}