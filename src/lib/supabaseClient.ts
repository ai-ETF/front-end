// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // 导入生成的类型

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 关键：将 Database 类型作为泛型参数传递给 createClient
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);