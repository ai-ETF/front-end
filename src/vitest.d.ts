// 为 vitest 提供类型声明
import { vi } from 'vitest';

declare global {
  const vi: typeof import('vitest').vi;
}