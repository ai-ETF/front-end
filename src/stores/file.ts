import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { BreadcrumbItem, FileItem, UploadOptions } from "@/types/file";
import {
  batchOperation,
  deleteFile,
  fetchFilesByParentId,
  getFileInfo,
  getRecentFiles,
  moveFile,
  renameFile,
  searchFiles,
  uploadFile,
} from "@/services/fileService";
import {
  validateFileName,
  validateFileSize,
  validateFileType,
} from "@/utils/fileValidator";

interface FileState {
  files: FileItem[];
  currentFolderId: string | null;
  folderContentCache: Map<string, FileItem[]>; // 文件夹内容缓存
  folderMetaCache: Map<string, FileItem>; // 文件夹元数据缓存
  breadcrumbs: BreadcrumbItem[];
  selectedFiles: Set<string>; // 选中的文件ID
  loading: boolean;
  error: string | null;
}

export const useFileStore = defineStore("file", {
  state: (): FileState => ({
    files: [],
    currentFolderId: null,
    folderContentCache: new Map(),
    folderMetaCache: new Map(),
    breadcrumbs: [],
    selectedFiles: new Set(),
    loading: false,
    error: null,
  }),

  getters: {
    // 获取当前目录下的文件和文件夹
    currentFiles: (state) => state.files,

    // 获取选中的文件
    selectedFileList: (state) => {
      return state.files.filter((file) => state.selectedFiles.has(file.id));
    },

    // 是否所有文件都被选中
    isAllSelected: (state) => {
      return state.files.length > 0 &&
        state.selectedFiles.size === state.files.length;
    },

    // 获取文件夹路径（用于面包屑）
    folderPath: (state) => {
      return state.breadcrumbs.map((b) => b.name).join("/");
    },
  },

  actions: {
    /**
     * 获取指定文件夹下的文件列表
     */
    async fetchFiles(folderId: string | null = null) {
      try {
        this.loading = true;
        this.error = null;

        // 检查缓存
        const cacheKey = folderId || "root";
        const cached = this.folderContentCache.get(cacheKey);

        if (cached) {
          this.files = cached;
          this.currentFolderId = folderId;
          await this.buildBreadcrumbs(folderId);
          return;
        }

        // 从服务层获取数据
        const files = await fetchFilesByParentId(folderId);

        // 数据验证
        if (!Array.isArray(files)) {
          throw new Error("Invalid response format from server");
        }

        // 验证每个文件项
        files.forEach((file) => {
          if (!file.id || !file.name || !file.type) {
            console.warn("Invalid file item:", file);
          }
        });

        // 更新状态
        this.files = files;
        this.currentFolderId = folderId;

        // 更新缓存
        this.folderContentCache.set(cacheKey, files);

        // 构建面包屑
        await this.buildBreadcrumbs(folderId);
      } catch (error) {
        this.error = error instanceof Error
          ? error.message
          : "Failed to fetch files";
        console.error("Error fetching files:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 构建面包屑导航
     */
    async buildBreadcrumbs(folderId: string | null) {
      const breadcrumbs: BreadcrumbItem[] = [];

      // 添加根目录
      breadcrumbs.push({ id: null, name: "Home", path: "/" });

      if (folderId) {
        // 递归获取父目录信息
        let currentId = folderId;
        const pathSegments: BreadcrumbItem[] = [];

        while (currentId) {
          let folder = this.folderMetaCache.get(currentId);

          if (!folder) {
            // 从API获取文件夹信息
            folder = await getFileInfo(currentId);
            if (folder) {
              this.folderMetaCache.set(currentId, folder);
            }
          }

          if (folder) {
            pathSegments.unshift({
              id: folder.id,
              name: folder.name,
              path: `/files/${folder.id}`,
            });
            currentId = folder.parent_id;
          } else {
            break;
          }
        }

        breadcrumbs.push(...pathSegments);
      }

      this.breadcrumbs = breadcrumbs;
    },

    /**
     * 上传文件（带验证）
     */
    async uploadFile(
      file: File,
      parentId: string | null = null,
      options: UploadOptions = {},
    ) {
      try {
        // 验证文件类型
        if (
          !validateFileType(file, [
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ])
        ) {
          throw new Error("Unsupported file type");
        }

        // 验证文件大小（例如限制为100MB）
        if (!validateFileSize(file, 100 * 1024 * 1024)) {
          throw new Error("File size exceeds 100MB limit");
        }

        // 验证文件名
        if (!validateFileName(file.name)) {
          throw new Error("Invalid file name");
        }

        // 调用服务层上传
        const uploadedFile = await uploadFile(file, parentId, options);

        // 如果是当前目录，更新文件列表
        if (parentId === this.currentFolderId) {
          this.files.push(uploadedFile);
          // 更新缓存
          const cacheKey = parentId || "root";
          const cached = this.folderContentCache.get(cacheKey) || [];
          this.folderContentCache.set(cacheKey, [...cached, uploadedFile]);
        }

        return uploadedFile;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Upload failed";
        console.error("Error uploading file:", error);
        throw error;
      }
    },

    /**
     * 重命名文件/文件夹
     */
    async renameFile(fileId: string, newName: string) {
      try {
        // 验证新文件名
        if (!validateFileName(newName)) {
          throw new Error("Invalid file name");
        }

        const renamedFile = await renameFile(fileId, newName);

        // 更新本地状态
        const index = this.files.findIndex((f) => f.id === fileId);
        if (index !== -1) {
          this.files[index] = { ...this.files[index], ...renamedFile };
        }

        // 清除相关缓存
        this.clearFileCache(fileId);

        return renamedFile;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Rename failed";
        console.error("Error renaming file:", error);
        throw error;
      }
    },

    /**
     * 移动文件/文件夹
     */
    async moveFile(fileId: string, newParentId: string | null) {
      try {
        const movedFile = await moveFile(fileId, newParentId);

        // 从原位置移除
        this.files = this.files.filter((f) => f.id !== fileId);

        // 清除相关缓存
        this.clearFileCache(fileId);
        this.folderContentCache.delete(this.currentFolderId || "root");

        return movedFile;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Move failed";
        console.error("Error moving file:", error);
        throw error;
      }
    },

    /**
     * 删除文件/文件夹
     */
    async deleteFile(fileId: string) {
      try {
        // 确认删除（可在UI层实现确认对话框）
        const fileToDelete = this.files.find((f) => f.id === fileId);
        if (!fileToDelete) {
          throw new Error("File not found");
        }

        await deleteFile(fileId);

        // 更新本地状态
        this.files = this.files.filter((f) => f.id !== fileId);
        this.selectedFiles.delete(fileId);

        // 清除相关缓存
        this.clearFileCache(fileId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Delete failed";
        console.error("Error deleting file:", error);
        throw error;
      }
    },

    /**
     * 批量删除选中文件
     */
    async deleteSelectedFiles() {
      try {
        const selectedFileIds = Array.from(this.selectedFiles);
        const results = await batchOperation("delete", selectedFileIds);

        // 更新本地状态，移除成功删除的文件
        const successfullyDeleted = results
          .filter((result) => result.success)
          .map((result) => result.fileId);

        this.files = this.files.filter((f) =>
          !successfullyDeleted.includes(f.id)
        );
        this.selectedFiles.clear();

        // 清除相关缓存
        successfullyDeleted.forEach((id) => this.clearFileCache(id));

        return results;
      } catch (error) {
        console.error("Error deleting selected files:", error);
        throw error;
      }
    },

    /**
     * 批量移动选中文件
     */
    async moveSelectedFiles(targetFolderId: string | null) {
      try {
        const selectedFileIds = Array.from(this.selectedFiles);
        const results = await batchOperation(
          "move",
          selectedFileIds,
          targetFolderId,
        );

        // 清除相关缓存
        results.forEach((result) => {
          if (result.success) {
            this.clearFileCache(result.fileId);
          }
        });

        // 重新加载当前目录
        await this.fetchFiles(this.currentFolderId);

        return results;
      } catch (error) {
        console.error("Error moving selected files:", error);
        throw error;
      }
    },

    /**
     * 选择/取消选择文件
     */
    toggleFileSelection(fileId: string) {
      if (this.selectedFiles.has(fileId)) {
        this.selectedFiles.delete(fileId);
      } else {
        this.selectedFiles.add(fileId);
      }
    },

    /**
     * 全选/取消全选
     */
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedFiles.clear();
      } else {
        this.files.forEach((file) => {
          this.selectedFiles.add(file.id);
        });
      }
    },

    /**
     * 清除选中
     */
    clearSelection() {
      this.selectedFiles.clear();
    },

    /**
     * 进入文件夹
     */
    async enterFolder(folderId: string) {
      await this.fetchFiles(folderId);
    },

    /**
     * 返回上一级
     */
    async goUp() {
      if (this.breadcrumbs.length > 1) {
        const parentCrumb = this.breadcrumbs[this.breadcrumbs.length - 2];
        await this.fetchFiles(parentCrumb.id);
      }
    },

    /**
     * 清除文件相关缓存
     */
    clearFileCache(fileId: string) {
      // 从元数据缓存中移除
      this.folderMetaCache.delete(fileId);

      // 清除所有包含该文件的文件夹内容缓存
      for (const [key, files] of this.folderContentCache.entries()) {
        if (files.some((f) => f.id === fileId)) {
          this.folderContentCache.delete(key);
        }
      }
    },

    /**
     * 重置状态
     */
    reset() {
      this.files = [];
      this.currentFolderId = null;
      this.breadcrumbs = [];
      this.selectedFiles.clear();
      this.error = null;
      this.loading = false;
    },

    /**
     * 预加载父文件夹信息（用于快速构建面包屑）
     */
    async prefetchFolderAncestors(folderId: string) {
      try {
        const ancestors: string[] = [];
        let currentId: string | null = folderId;

        while (currentId) {
          // 如果已缓存，跳过
          if (!this.folderMetaCache.has(currentId)) {
            ancestors.push(currentId);
          }

          const folder = this.folderMetaCache.get(currentId);
          currentId = folder?.parent_id || null;
        }

        // 批量获取未缓存的文件夹信息
        const fetchPromises = ancestors.map((id) => getFileInfo(id));
        const folders = await Promise.all(fetchPromises);

        // 缓存获取到的文件夹信息
        folders.forEach((folder) => {
          if (folder) {
            this.folderMetaCache.set(folder.id, folder);
          }
        });
      } catch (error) {
        console.warn("Failed to prefetch folder ancestors:", error);
      }
    },

    /**
     * 搜索文件
     */
    async searchFiles(query: string) {
      try {
        this.loading = true;
        this.error = null;

        const results = await searchFiles(query);

        // 更新状态为搜索结果
        this.files = results;
        this.currentFolderId = null;
        this.breadcrumbs = [{ id: null, name: "Search Results", path: "/" }];

        return results;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Search failed";
        console.error("Error searching files:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取最近文件
     */
    async getRecentFiles(limit: number = 20) {
      try {
        this.loading = true;
        this.error = null;

        const results = await getRecentFiles(limit);

        // 更新状态为最近文件
        this.files = results;
        this.currentFolderId = null;
        this.breadcrumbs = [{ id: null, name: "Recent Files", path: "/" }];

        return results;
      } catch (error) {
        this.error = error instanceof Error
          ? error.message
          : "Failed to get recent files";
        console.error("Error getting recent files:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
