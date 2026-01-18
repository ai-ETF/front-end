import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFile } from '../fileService';
import { supabase } from '../../lib/supabaseClient';
import { BUCKET_NAME } from '../../lib/constants';

// Mock 依赖项
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
    })),
  },
}));

vi.mock('../../lib/constants', () => ({
  BUCKET_NAME: 'test-bucket',
}));

// 创建一个模拟的 File 对象用于测试
const createMockFile = (name = 'test.txt', size = 1024, type = 'text/plain') => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('fileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      // 设置 mock 返回值
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockUploadData = { path: 'user-123/uploads/test-file.txt' };
      const mockStoragePath = `${mockUser.id}/uploads/test-file-${Date.now()}.txt`;
      (supabase.storage.from as ReturnType<typeof vi.fn>).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: mockUploadData, error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFileData = {
        id: 'file-123',
        name: 'test.txt',
        type: 'file',
        mime_type: 'text/plain',
        size: 1024,
        parent_id: null,
        storage_path: mockStoragePath,
        user_id: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockFileData, error: null }),
          }),
        }),
      });

      // 执行测试
      const file = createMockFile();
      const result = await uploadFile(file, null, {});

      // 断言结果
      expect(result).toBeDefined();
      expect(result.id).toBe(mockFileData.id);
      expect(result.name).toBe(mockFileData.name);

      // 验证调用了正确的函数
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.storage.from).toHaveBeenCalledWith(BUCKET_NAME);
      expect(supabase.from).toHaveBeenCalledWith('files');
    });

    it('should successfully upload a file with options', async () => {
      // 设置 mock 返回值
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockUploadData = { path: 'user-123/uploads/test-file.txt' };
      const mockStoragePath = `${mockUser.id}/uploads/test-file-${Date.now()}.txt`;
      (supabase.storage.from as ReturnType<typeof vi.fn>).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: mockUploadData, error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFileData = {
        id: 'file-123',
        name: 'test.txt',
        type: 'file',
        mime_type: 'text/plain',
        size: 1024,
        parent_id: null,
        storage_path: mockStoragePath,
        user_id: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockFileData, error: null }),
          }),
        }),
      });

      // 执行测试 - 指定一些选项
      const file = createMockFile();
      const result = await uploadFile(file, null, { tags: ['test'], description: 'A test file' });

      // 断言结果
      expect(result).toBeDefined();
      expect(result.id).toBe(mockFileData.id);
      expect(result.name).toBe(mockFileData.name);

      // 验证调用了正确的函数
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.storage.from).toHaveBeenCalledWith(BUCKET_NAME);
      expect(supabase.from).toHaveBeenCalledWith('files');
    });

    it('should handle authentication error', async () => {
      // 设置 mock 返回认证错误
      (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null },
        error: { message: 'Authentication failed' },
      });

      // 执行测试并期待抛出错误
      const file = createMockFile();
      await expect(uploadFile(file)).rejects.toThrow('User not authenticated');

      // 验证只调用了认证方法
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });
  });
});