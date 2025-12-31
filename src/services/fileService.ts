import { supabase } from '@/lib/supabaseClient'
import type { FileItem, UploadOptions } from '@/types/file'

/**
 * 获取指定文件夹下的文件和文件夹列表
 */
export async function fetchFilesByParentId(parentId: string | null = null): Promise<FileItem[]> {
  try {
    const query = supabase
      .from('files')
      .select('*')
      .order('type', { ascending: false }) // 文件夹在前
      .order('name', { ascending: true })
    
    if (parentId === null) {
      query.is('parent_id', null)
    } else {
      query.eq('parent_id', parentId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // 类型转换和验证
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type === 'folder' ? 'folder' : 'file',
      mime_type: item.mime_type,
      size: item.size,
      parent_id: item.parent_id,
      storage_path: item.storage_path,
      user_id: item.user_id,
      created_at: item.created_at ?? '',
      updated_at: item.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }))
  } catch (error) {
    console.error('Error fetching files:', error)
    throw error
  }
}

/**
 * 获取文件/文件夹详细信息
 */
export async function getFileInfo(fileId: string): Promise<FileItem | null> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // 未找到
      }
      throw error
    }
    
    return {
      id: data.id,
      name: data.name,
      type: data.type === 'folder' ? 'folder' : 'file',
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }
  } catch (error) {
    console.error('Error getting file info:', error)
    throw error
  }
}

/**
 * 上传文件
 */
export async function uploadFile(
  file: File, 
  parentId: string | null = null,
  options: UploadOptions = {}
): Promise<FileItem> {
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }
  
  let fileName: string | undefined = undefined
  
  try {
    // 1. 上传文件到存储桶
    const fileExt = file.name.split('.').pop()
    fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `${user.id}/uploads/${fileName}`
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('user-documents')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // 2. 在数据库中创建记录
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: file.name,
        type: 'file',
        mime_type: file.type,
        size: file.size,
        parent_id: parentId,
        storage_path: filePath,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          should_vectorize: options.shouldVectorize || false,
          tags: options.tags || [],
          description: options.description || ''
        }
      })
      .select()
      .single()
    
    if (error) throw error
    
    // 3. 如果设置了需要向量化，触发向量化处理
    if (options.shouldVectorize) {
      await triggerVectorization(data.id, filePath)
    }
    
    return {
      id: data.id,
      name: data.name,
      type: data.type === 'folder' ? 'folder' : 'file',
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    
    // 清理已上传的文件（如果数据库插入失败）
    try {
      if (fileName) {
        await supabase.storage
          .from('user-documents')
          .remove([`${user.id}/uploads/${fileName}`])
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup uploaded file:', cleanupError)
    }
    
    throw error
  }
}

/**
 * 创建文件夹
 */
export async function createFolder(name: string, parentId: string | null = null): Promise<FileItem> {
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }
  
  try {
    // 验证文件夹名称
    if (!name.trim()) {
      throw new Error('Folder name cannot be empty')
    }
    
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: name.trim(),
        type: 'folder',
        parent_id: parentId,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      type: data.type === 'folder' ? 'folder' : 'file',
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    throw error
  }
}

/**
 * 重命名文件/文件夹
 */
export async function renameFile(fileId: string, newName: string): Promise<FileItem> {
  try {
    // 检查名称是否已存在
    const file = await getFileInfo(fileId)
    if (!file) throw new Error('File not found')
    
    const query = supabase
      .from('files')
      .select('id')
      .eq('name', newName)
      .neq('id', fileId)
    
    if (file.parent_id === null) {
      query.is('parent_id', null)
    } else {
      query.eq('parent_id', file.parent_id)
    }
    
    const { data: existing } = await query.single()
    
    if (existing) {
      throw new Error('A file with this name already exists in this folder')
    }
    
    const { data, error } = await supabase
      .from('files')
      .update({
        name: newName.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      type: data.type === 'folder' ? 'folder' : 'file',
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }
  } catch (error) {
    console.error('Error renaming file:', error)
    throw error
  }
}

/**
 * 移动文件/文件夹
 */
export async function moveFile(fileId: string, newParentId: string | null): Promise<FileItem> {
  try {
    // 检查是否移动到自身
    if (fileId === newParentId) {
      throw new Error('Cannot move folder into itself')
    }
    
    // 检查是否移动到子文件夹
    if (newParentId) {
      const isCircular = await checkCircularReference(fileId, newParentId)
      if (isCircular) {
        throw new Error('Cannot move folder into its own subfolder')
      }
    }
    
    // 检查目标文件夹是否已存在同名文件
    const file = await getFileInfo(fileId)
    if (!file) throw new Error('File not found')
    
    const query = supabase
      .from('files')
      .select('id')
      .eq('name', file.name)
      .neq('id', fileId)
    
    if (newParentId === null) {
      query.is('parent_id', null)
    } else {
      query.eq('parent_id', newParentId)
    }
    
    const { data: existing } = await query.single()
    
    if (existing) {
      throw new Error('A file with this name already exists in the destination folder')
    }
    
    const { data, error } = await supabase
      .from('files')
      .update({
        parent_id: newParentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      type: data.type === 'folder' ? 'folder' : 'file',
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }
  } catch (error) {
    console.error('Error moving file:', error)
    throw error
  }
}

/**
 * 删除文件/文件夹
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const file = await getFileInfo(fileId)
    if (!file) throw new Error('File not found')
    
    // 如果是文件夹，递归删除子项
    if (file.type === 'folder') {
      const subItems = await fetchFilesByParentId(fileId)
      
      // 递归删除所有子项
      for (const item of subItems) {
        await deleteFile(item.id)
      }
    }
    
    // 删除数据库记录
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
    
    if (dbError) throw dbError
    
    // 如果是文件，同时删除存储中的文件
    if (file.type === 'file' && file.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([file.storage_path])
      
      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError)
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * 下载文件
 */
export async function downloadFile(fileId: string): Promise<void> {
  try {
    const file = await getFileInfo(fileId)
    if (!file || file.type !== 'file' || !file.storage_path) {
      throw new Error('File not found or not downloadable')
    }
    
    const { data, error } = await supabase.storage
      .from('user-documents')
      .download(file.storage_path)
    
    if (error) throw error
    
    // 创建下载链接
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

/**
 * 批量操作接口
 */
export async function batchOperation(operation: 'move' | 'delete', fileIds: string[], targetFolderId?: string | null): Promise<Array<{ fileId: string; success: boolean; data?: FileItem; error?: string }>> {
  try {
    const results = []
    
    for (const fileId of fileIds) {
      try {
        if (operation === 'move' && targetFolderId !== undefined) {
          const result = await moveFile(fileId, targetFolderId)
          results.push({ fileId, success: true, data: result })
        } else if (operation === 'delete') {
          await deleteFile(fileId)
          results.push({ fileId, success: true })
        }
      } catch (error) {
        results.push({ 
          fileId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Operation failed' 
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('Error in batch operation:', error)
    throw error
  }
}

/**
 * 搜索文件
 */
export async function searchFiles(query: string, limit: number = 50): Promise<FileItem[]> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit)
    
    if (error) throw error
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type === 'folder' ? 'folder' : 'file',
      mime_type: item.mime_type,
      size: item.size,
      parent_id: item.parent_id,
      storage_path: item.storage_path,
      user_id: item.user_id,
      created_at: item.created_at ?? '',
      updated_at: item.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }))
  } catch (error) {
    console.error('Error searching files:', error)
    throw error
  }
}

/**
 * 获取最近访问的文件
 */
export async function getRecentFiles(limit: number = 20): Promise<FileItem[]> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('type', 'file')
      .order('updated_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type === 'folder' ? 'folder' : 'file',
      mime_type: item.mime_type,
      size: item.size,
      parent_id: item.parent_id,
      storage_path: item.storage_path,
      user_id: item.user_id,
      created_at: item.created_at ?? '',
      updated_at: item.updated_at ?? '',
      isSelected: false,
      isUploading: false,
      uploadProgress: 0
    }))
  } catch (error) {
    console.error('Error fetching recent files:', error)
    throw error
  }
}

/**
 * 辅助函数：检查循环引用
 */
async function checkCircularReference(sourceId: string, targetId: string): Promise<boolean> {
  try {
    let currentId: string | null = targetId
    
    while (currentId) {
      if (currentId === sourceId) {
        return true
      }
      
      const folder = await getFileInfo(currentId)
      currentId = folder?.parent_id || null
    }
    
    return false
  } catch (error) {
    console.error('Error checking circular reference:', error)
    throw error
  }
}

/**
 * 触发向量化处理
 */
async function triggerVectorization(fileId: string, filePath: string): Promise<void> {
  try {
    // 这里调用你的向量化API
    const response = await fetch('/api/vectorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, filePath })
    })
    
    if (!response.ok) {
      throw new Error('Failed to trigger vectorization')
    }
    
    console.log('Vectorization triggered for file:', fileId)
  } catch (error) {
    console.error('Error triggering vectorization:', error)
    // 这里可以选择记录错误但不抛出，避免影响主流程
  }
}