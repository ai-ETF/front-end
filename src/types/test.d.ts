// 为测试文件提供类型定义
import type { MockedFunction } from 'vitest';

declare global {
  const vi: typeof import('vitest').vi;
}

export type { MockedFunction };