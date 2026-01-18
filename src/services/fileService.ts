import { supabase } from "@/lib/supabaseClient";
import { BUCKET_NAME } from "@/lib/constants";
import type { FileItem, UploadOptions } from "@/types/file";

/**
 * 根据父目录ID获取文件列表
 */
export async function fetchFilesByParentId(
  parentId: string | null = null,
): Promise<FileItem[]> {
  try {
    const query = supabase
      .from("files")
      .select("*")
      .order("type", { ascending: false }) // 文件夹在前
      .order("name", { ascending: true });

    if (parentId === null) {
      query.is("parent_id", null);
    } else {
      query.eq("parent_id", parentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 类型转换和验证
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type === "folder" ? "folder" : "file",
      mime_type: item.mime_type,
      size: item.size,
      parent_id: item.parent_id,
      storage_path: item.storage_path,
      user_id: item.user_id,
      created_at: item.created_at ?? "",
      updated_at: item.updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    }));
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
}

/**
 * 获取文件/文件夹详细信息
 */
export async function getFileInfo(fileId: string): Promise<FileItem | null> {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // 未找到
      }
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type === "folder" ? "folder" : "file",
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: (data as any).created_at ?? "",
      updated_at: (data as any).updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    };
  } catch (error) {
    console.error("Error getting file info:", error);
    throw error;
  }
}

/**
 * 上传文件服务函数 - 重构版
 * 
 * 遵循端到端路径：
 * 1. 前端直传文件到 Storage
 * 2. 前端写 files 表（文件系统注册）
 * 3. 前端调用 Edge Function 申请"后端可下载凭证"
 * 4. 前端将 Edge 返回的信息传给后端
 *
 * @param file - 要上传的 File 对象（来自 input[type=file] 或拖拽）
 * @param parentId - 父文件夹ID，null表示上传到根目录
 * @param options - 上传选项，包括是否需要向量化、标签、描述等元数据
 * @returns 返回包含完整文件信息的 FileItem 对象
 * @throws 当用户未认证或上传过程中发生错误时抛出异常
 */
export async function uploadFile(
  file: File,
  parentId: string | null = null,
  options: UploadOptions = {},
): Promise<FileItem> {
  // 获取当前认证用户信息
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("获取用户信息失败:", userError);
    throw new Error("User not authenticated");
  }

  console.debug("当前用户ID:", user.id);

  let fileName: string | undefined = undefined;
  let filePath: string | undefined = undefined;

  try {
    // 第一步：前端直传文件到 Storage
    // 生成唯一文件名：用户ID + 时间戳 + UUID + 原始扩展名
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
    fileName = `${user.id}-${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    
    // 构建存储路径：用户ID/ uploads / 唯一文件名
    filePath = `${user.id}/uploads/${fileName}`;

    console.log("开始上传文件到Storage，路径:", filePath);

    // 执行文件上传到 Supabase 的存储桶
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // 不允许覆盖同名文件
      });

    // 如果上传失败，抛出错误
    if (uploadError) {
      console.error("文件上传到存储失败:", uploadError);
      throw uploadError;
    }

    console.log("文件上传成功，开始注册到files表");

    // 第二步：前端写 files 表（文件系统注册）
    // 将文件元数据插入 files 表
    const { data, error } = await supabase
      .from("files")
      .insert({
        name: file.name, // 原始文件名
        type: "file", // 文件类型标记
        mime_type: file.type, // MIME类型，如 'application/pdf'
        size: file.size, // 文件大小（字节）
        parent_id: parentId, // 父文件夹ID
        storage_path: filePath, // 文件在存储桶中的路径
        user_id: user.id, // 上传用户ID
        created_at: new Date().toISOString(), // 创建时间
        updated_at: new Date().toISOString(), // 更新时间
      })
      .select() // 返回插入后的完整记录
      .single(); // 确保只返回单个记录

    // 如果数据库操作失败，抛出错误
    if (error) {
      console.error("数据库插入失败:", error);
      console.error("错误详情:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      // 清理已上传的文件（如果数据库插入失败）
      console.log("清理已上传的文件...");
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
        
      throw error;
    }

    console.log("文件注册成功，ID:", data.id);

    // 返回标准化的 FileItem 对象给调用方
    return {
      id: data.id,
      name: data.name,
      type: data.type === "folder" ? "folder" : "file",
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: (data as any).created_at ?? "",
      updated_at: (data as any).updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    };
  } catch (error) {
    console.error("Error uploading file:", error);

    // 清理已上传的文件（如果数据库插入失败）
    // 这是为了保证数据一致性：有数据库记录才有实际文件
    try {
      if (filePath) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);
      }
    } catch (cleanupError) {
      console.error("Failed to cleanup uploaded file:", cleanupError);
    }

    throw error;
  }
}

/**
 * 调用 Edge Function 为后端处理准备下载凭证
 * 
 * 遵循端到端路径：
 * 1. 前端调用 Edge Function 申请"后端可下载凭证"
 * 2. Edge Function 校验 file_id 是否属于当前用户
 * 3. Edge Function 返回签名的下载 URL
 * 4. 前端将此 URL 传递给后端进行处理
 * 
 * @param fileId 文件在 files 表中的 ID
 * @param storagePath 文件在 Storage 中的路径（用于辅助校验）
 * @returns 包含签名下载 URL 的响应对象
 */
export async function prepareDownloadForBackend(
  fileId: string,
  storagePath: string,
) {
  try {
    // 获取当前用户的 JWT token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      console.error("无法获取用户认证 token");
      throw new Error("无法获取用户认证 token");
    }

    // 准备请求体
    const requestBody = {
      file_id: fileId,
      storage_path: storagePath,
    };

    // 发送请求到 Supabase Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/files/prepare-download`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const result = await response.json();
    console.log("下载凭证准备成功:", result);
    return result; // 返回包含签名 URL 的结果
  } catch (error) {
    console.error("调用下载凭证准备函数失败:", error);
    throw error; // 抛出错误，让调用方处理
  }
}

/**
 * 触发后端文档处理流程
 * 
 * 将 Edge Function 生成的下载凭证传递给后端进行文档处理
 * 
 * @param fileId 文件在 files 表中的 ID
 * @param signedUrl 从 Edge Function 获取的签名下载 URL
 * @returns 后端处理结果
 */
export async function triggerDocumentProcessing(
  fileId: string,
  signedUrl: string,
) {
  try {
    // 获取当前用户的认证 token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      console.error("无法获取用户认证 token");
      throw new Error("无法获取用户认证 token");
    }

    // 准备请求体
    const requestBody = {
      file_id: fileId,
      signed_url: signedUrl,
    };

    // 发送请求到后端处理服务
    const response = await fetch(
      "https://wiynpkkfsiiqnofhifhs.supabase.co/functions/v1/ingest-document-ts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const result = await response.json();
    console.log("文档处理触发成功:", result);
    return result;
  } catch (error) {
    console.error("触发文档处理失败:", error);
    throw error;
  }
}

/**
 * 完整的文件上传与后端处理流程
 * 
 * 按照端到端路径顺序执行：
 * 1. 前端直传文件到 Storage
 * 2. 前端写 files 表（文件系统注册）
 * 3. 前端调用 Edge Function 申请"后端可下载凭证"
 * 4. 前端将凭证传递给后端进行文档处理
 * 
 * @param file 要上传的文件
 * @param parentId 父文件夹ID
 * @param options 上传选项
 * @returns 处理结果
 */
export async function uploadAndProcessFile(
  file: File,
  parentId: string | null = null,
  options: UploadOptions = {},
) {
  console.log("开始执行完整的文件上传与处理流程");

  // 步骤 1 & 2: 上传文件并注册到 files 表
  const fileRecord = await uploadFile(file, parentId, options);
  console.log("文件上传与注册成功，ID:", fileRecord.id);

  // 步骤 3: 调用 Edge Function 获取下载凭证
  if (!fileRecord.storage_path) {
    throw new Error(`文件 ${fileRecord.id} 缺少 storage_path，无法继续处理`);
  }
  
  const downloadCredentials = await prepareDownloadForBackend(
    fileRecord.id,
    fileRecord.storage_path
  );
  console.log("获取下载凭证成功");

  // 步骤 4: 将凭证传递给后端进行处理
  const processingResult = await triggerDocumentProcessing(
    fileRecord.id,
    downloadCredentials.signed_url
  );
  console.log("后端处理触发成功");

  return {
    fileRecord,
    downloadCredentials,
    processingResult
  };
}

/**
 * 创建文件夹
 */
export async function createFolder(
  name: string,
  parentId: string | null = null,
): Promise<FileItem> {
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  try {
    // 验证文件夹名称
    if (!name.trim()) {
      throw new Error("Folder name cannot be empty");
    }

    const { data, error } = await supabase
      .from("files")
      .insert({
        name: name.trim(),
        type: "folder",
        parent_id: parentId,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type === "folder" ? "folder" : "file",
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
}

/**
 * 重命名文件/文件夹
 */
export async function renameFile(
  fileId: string,
  newName: string,
): Promise<FileItem> {
  try {
    // 检查名称是否已存在
    const file = await getFileInfo(fileId);
    if (!file) throw new Error("File not found");

    const query = supabase
      .from("files")
      .select("id")
      .eq("name", newName)
      .neq("id", fileId);

    if (file.parent_id === null) {
      query.is("parent_id", null);
    } else {
      query.eq("parent_id", file.parent_id);
    }

    const { data: existing } = await query.single();

    if (existing) {
      throw new Error("A file with this name already exists in this folder");
    }

    const { data, error } = await supabase
      .from("files")
      .update({
        name: newName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type === "folder" ? "folder" : "file",
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    };
  } catch (error) {
    console.error("Error renaming file:", error);
    throw error;
  }
}

/**
 * 移动文件/文件夹
 */
export async function moveFile(
  fileId: string,
  newParentId: string | null,
): Promise<FileItem> {
  try {
    // 检查是否移动到自身
    if (fileId === newParentId) {
      throw new Error("Cannot move folder into itself");
    }

    // 检查是否移动到子文件夹
    if (newParentId) {
      const isCircular = await checkCircularReference(fileId, newParentId);
      if (isCircular) {
        throw new Error("Cannot move folder into its own subfolder");
      }
    }

    // 检查目标文件夹是否已存在同名文件
    const file = await getFileInfo(fileId);
    if (!file) throw new Error("File not found");

    const query = supabase
      .from("files")
      .select("id")
      .eq("name", file.name)
      .neq("id", fileId);

    if (newParentId === null) {
      query.is("parent_id", null);
    } else {
      query.eq("parent_id", newParentId);
    }

    const { data: existing } = await query.single();

    if (existing) {
      throw new Error(
        "A file with this name already exists in the destination folder",
      );
    }

    const { data, error } = await supabase
      .from("files")
      .update({
        parent_id: newParentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type === "folder" ? "folder" : "file",
      mime_type: data.mime_type,
      size: data.size,
      parent_id: data.parent_id,
      storage_path: data.storage_path,
      user_id: data.user_id,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    };
  } catch (error) {
    console.error("Error moving file:", error);
    throw error;
  }
}

/**
 * 删除文件/文件夹
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const file = await getFileInfo(fileId);
    if (!file) throw new Error("File not found");

    // 如果是文件夹，递归删除子项
    if (file.type === "folder") {
      const subItems = await fetchFilesByParentId(fileId);

      // 递归删除所有子项
      for (const item of subItems) {
        await deleteFile(item.id);
      }
    }

    // 删除数据库记录
    const { error: dbError } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId);

    if (dbError) throw dbError;

    // 如果是文件，同时删除存储中的文件
    if (file.type === "file" && file.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([file.storage_path]);

      if (storageError) {
        console.warn("Failed to delete file from storage:", storageError);
      }
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * 下载文件
 */
export async function downloadFile(fileId: string): Promise<void> {
  try {
    const file = await getFileInfo(fileId);
    if (!file || file.type !== "file" || !file.storage_path) {
      throw new Error("File not found or not downloadable");
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(file.storage_path);

    if (error) throw error;

    // 创建下载链接
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    console.error("错误详情:", {
      message: (error as Error).message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code,
    });
    throw error;
  }
}

/**
 * 批量操作接口
 */
export async function batchOperation(
  operation: "move" | "delete",
  fileIds: string[],
  targetFolderId?: string | null,
): Promise<
  Array<{ fileId: string; success: boolean; data?: FileItem; error?: string }>
> {
  try {
    const results = [];

    for (const fileId of fileIds) {
      try {
        if (operation === "move" && targetFolderId !== undefined) {
          const result = await moveFile(fileId, targetFolderId);
          results.push({ fileId, success: true, data: result });
        } else if (operation === "delete") {
          await deleteFile(fileId);
          results.push({ fileId, success: true });
        }
      } catch (error) {
        results.push({
          fileId,
          success: false,
          error: error instanceof Error ? error.message : "Operation failed",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in batch operation:", error);
    throw error;
  }
}

/**
 * 搜索文件
 */
export async function searchFiles(
  query: string,
  limit: number = 50,
): Promise<FileItem[]> {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type === "folder" ? "folder" : "file",
      mime_type: item.mime_type,
      size: item.size,
      parent_id: item.parent_id,
      storage_path: item.storage_path,
      user_id: item.user_id,
      created_at: item.created_at ?? "",
      updated_at: item.updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    }));
  } catch (error) {
    console.error("Error searching files:", error);
    throw error;
  }
}

/**
 * 获取最近访问的文件
 */
export async function getRecentFiles(limit: number = 20): Promise<FileItem[]> {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("type", "file")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type === "folder" ? "folder" : "file",
      mime_type: item.mime_type,
      size: item.size,
      parent_id: item.parent_id,
      storage_path: item.storage_path,
      user_id: item.user_id,
      created_at: item.created_at ?? "",
      updated_at: item.updated_at ?? "",
      isSelected: false,
      isUploading: false,
      uploadProgress: 0,
    }));
  } catch (error) {
    console.error("Error fetching recent files:", error);
    throw error;
  }
}

/**
 * 辅助函数：检查循环引用
 */
async function checkCircularReference(
  sourceId: string,
  targetId: string,
): Promise<boolean> {
  try {
    let currentId: string | null = targetId;

    while (currentId) {
      if (currentId === sourceId) {
        return true;
      }

      const folder = await getFileInfo(currentId);
      currentId = folder?.parent_id || null;
    }

    return false;
  } catch (error) {
    console.error("Error checking circular reference:", error);
    throw error;
  }
}

/**
 * 调用文档处理函数 - 为调试页面提供的便捷函数
 * 
 * @param storagePath 文件在 Storage 中的路径
 * @param fileName 文件名
 * @returns 处理结果
 */
export async function callIngestDocumentFunction(
  storagePath: string,
  fileName: string,
) {
  try {
    // 在实际实现中，我们需要通过某种方式获取文件的 ID
    // 但现在，我们先假定这是通过 storagePath 查找的
    // 注意：这是一个简化实现，实际应用中可能需要更复杂的逻辑来根据存储路径查找文件 ID
    
    // 由于我们不能仅凭存储路径直接查询文件 ID，我们创建一个包装函数
    // 这里需要前端先通过其他方式获取文件 ID，或者后端提供基于路径的接口
    
    console.warn("警告: 通过存储路径直接调用文档处理功能需要特殊处理");
    
    // 这里我们不能直接实现，因为我们无法仅通过 storagePath 找到数据库中的文件 ID
    // 通常在真实场景中，我们应该已经拥有文件 ID，因为它是从前端上传流程中获得的
    throw new Error("此函数需要文件 ID 而不仅仅是存储路径。请先通过其他方式获取文件 ID。");
  } catch (error) {
    console.error("调用文档处理函数失败:", error);
    throw error;
  }
}

// 添加一个可以直接通过路径触发处理的函数（适用于调试场景）
/**
 * 通过存储路径直接触发文档处理
 * 
 * 注意：这仅适用于调试场景，因为在真实应用中我们通常是通过文件 ID 来处理的
 * 
 * @param fileId 文件在 files 表中的 ID
 * @param storagePath 文件在 Storage 中的路径
 * @returns 处理结果
 */
export async function callIngestDocumentFunctionById(
  fileId: string,
  storagePath: string,
) {
  try {
    // 获取下载凭证
    const downloadCredentials = await prepareDownloadForBackend(fileId, storagePath);
    
    // 触发文档处理
    const result = await triggerDocumentProcessing(fileId, downloadCredentials.signed_url);
    
    console.log("文档处理触发成功:", result);
    return result;
  } catch (error) {
    console.error("触发文档处理失败:", error);
    throw error;
  }
}
