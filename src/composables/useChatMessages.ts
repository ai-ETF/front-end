import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'
import { useSupabaseAuth } from './useSupabaseAuth'

// 定义消息类型，使用 Supabase 数据库中的消息表结构
export type ChatMessage = Database['public']['Tables']['messages']['Row']

// 定义聊天会话类型，使用 Supabase 数据库中的聊天会话表结构
export type ChatSession = Database['public']['Tables']['chats']['Row']

// 导出 useChatMessages 组合式函数
export const useChatMessages = () => {
  // 获取当前认证用户信息
  const { user, isAuthenticated } = useSupabaseAuth()
  // 获取路由实例用于页面跳转
  const router = useRouter()
  // 存储聊天消息的响应式引用
  const messages = ref<ChatMessage[]>([])
  // 存储聊天会话的响应式引用
  const chats = ref<ChatSession[]>([])
  // 存储加载状态的响应式引用
  const loading = ref<boolean>(false)
  // 存储错误信息的响应式引用
  const error = ref<string | null>(null)

  /**
   * 获取用户的所有聊天会话
   * @returns 聊天会话列表或空数组
   */
  const fetchChats = async () => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 清空之前的错误信息
      error.value = null

      console.log(`[useChatMessages] 当前用户的详细信息:`, user.value)
      console.log('[useChatMessages] isAuthenticated:', isAuthenticated.value)
      
      // 从 Supabase 获取用户的聊天会话，按更新时间倒序排列
      // 通过 user_id 查询条件确保只有当前用户的数据被访问
      const { data, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.value!.id)
        .order('updated_at', { ascending: false })

      // 如果获取过程中出现错误，则抛出异常
      if (fetchError) throw fetchError

      // 更新本地聊天会话列表
      chats.value = data || []

      const jsonString = `[useChatMessage] 获取到的chat.value的详细信息是: ${JSON.stringify(chats.value)}`;
      console.log(jsonString);


      // 返回聊天会话列表
      return chats.value
    } catch (err) {
      // 捕获并设置错误信息
      const errorMessage = err as Error
      error.value = errorMessage.message
      
      // 只有当明确是认证相关错误时才跳转到登录页
      // 网络错误、数据不存在等其他错误不应导致跳转
      if (errorMessage.message === '用户未登录' || 
          (errorMessage.message && errorMessage.message.includes('42501'))) { 
        // 42501 是 PostgreSQL 的权限拒绝错误码
        router.push('/login')
      }
      // 在控制台输出错误信息
      console.error('获取聊天会话失败:', err)
      // 返回空数组
      return []
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }

  /**
   * 创建新的聊天会话
   * @param title 聊天会话标题
   * @returns 创建的聊天会话或 null
   */
  const createChat = async (title: string) => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 清空之前的错误信息
      error.value = null
      
      // 向 Supabase 插入新的聊天会话
      // 通过 user_id 字段确保聊天会话与当前用户关联
      const { data, error: insertError } = await supabase
        .from('chats')
        .insert([
          {
            user_id: user.value!.id,           // 关联用户 ID
            title: title,                     // 聊天标题
            updated_at: new Date().toISOString(), // 更新时间
            created_at: new Date().toISOString()  // 创建时间
          }
        ])
        .select()    // 返回插入的数据
        .maybeSingle()    // 期望只返回一条记录

      // 如果插入过程中出现错误，则抛出异常
      if (insertError) throw insertError

      // 更新本地聊天会话列表
      if (data) {
        chats.value.unshift(data) // 将新会话添加到列表开头
      }

      // 返回创建的聊天会话
      return data
    } catch (err) {
      // 检查是否因为未登录导致的错误
      if (err instanceof Error && err.message === '用户未登录') {
        // 跳转到登录页面
        router.push('/login')
      }
      
      // 捕获并设置错误信息
      error.value = (err as Error).message
      // 在控制台输出错误信息
      console.error('创建聊天会话失败:', err)
      // 返回 null
      return null
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }

  /**
   * 获取特定聊天会话的消息
   * @param chatId 聊天会话 ID
   * @returns 聊天消息列表或空数组
   */
  const fetchMessages = async (chatId: number) => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 清空之前的错误信息
      error.value = null
      
      console.log('Fetching messages for chat ID:', chatId)
      console.log(`[useChatMessahes] isAuthenticated: ${isAuthenticated.value}`)
      console.log(`[useChatMessahes] user:`, user.value)

      // 检查用户是否已登录 
      // 使用更可靠的检查方式：检查user.value是否存在
      if (!user.value) {
        throw new Error('用户未登录')
      }

      // 从 Supabase 获取特定聊天会话的消息，按创建时间正序排列
      // 通过 chat_id 和 user_id 双重条件确保数据安全访问
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)        // 匹配聊天 ID
        .eq('user_id', user.value!.id) // 确保是当前用户的消息
        .order('created_at', { ascending: true }) // 按创建时间排序

      // 如果获取过程中出现错误，则抛出异常
      if (fetchError) throw fetchError

      // 更新本地消息列表
      messages.value = data || []
      // 返回消息列表
      return messages.value
    } catch (err) {
      // 检查是否因为未登录导致的错误
      if (err instanceof Error && err.message === '用户未登录') {
        // 跳转到登录页面
        // router.push('/login')
      }
      
      // 捕获并设置错误信息
      error.value = (err as Error).message
      // 在控制台输出错误信息
      console.error('获取聊天消息失败:', err)
      // 返回空数组
      return []
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }

  /**
   * 发送并保存新消息
   * @param chatId 聊天会话 ID
   * @param content 消息内容
   * @param role 消息发送者角色 ('user' 或 'assistant')
   * @returns 保存的消息或 null
   */
  const sendMessage = async (chatId: number, content: string, role: 'user' | 'assistant') => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 清空之前的错误信息
      error.value = null
      
      // 将消息保存到 Supabase 数据库
      // 通过 user_id 字段确保消息与当前用户关联
      const { data, error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,              // 关联聊天 ID
            content: content,             // 消息内容
            role: role,                   // 发送者角色
            user_id: user.value!.id,       // 关联用户 ID
            created_at: new Date().toISOString() // 创建时间
          }
        ])
        .select()   // 返回插入的数据
        .maybeSingle()    // 期望只返回一条记录

      // 如果插入过程中出现错误，则抛出异常
      if (insertError) throw insertError

      console.log(`[useChatMessages] Message sent to chat ${chatId}: success!`)

      // 更新聊天会话的更新时间
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() }) // 更新时间戳
        .eq('id', chatId) // 匹配聊天 ID

      // 更新本地消息列表
      if (data) {
        messages.value.push(data) // 将新消息添加到列表末尾
      }

      // 返回保存的消息
      return data
    } catch (err) {
      // 检查是否因为未登录导致的错误

      console.log(`[useChatMessages] Message sent to chat ${chatId}: failed!`)

      if (err instanceof Error && err.message === '用户未登录') {
        // 跳转到登录页面
        router.push('/login')
      }
      
      // 捕获并设置错误信息
      error.value = (err as Error).message
      // 在控制台输出错误信息
      console.error('发送消息失败:', err)
      // 返回 null
      return null
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }

  /**
   * 删除聊天记录
   * @param chatId 要删除的聊天会话 ID
   * @returns 删除操作是否成功
   */
  const deleteChat = async (chatId: number) => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 清空之前的错误信息
      error.value = null
      
      // 删除聊天会话相关的所有消息
      // 通过 user_id 条件确保只删除当前用户的数据
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)        // 匹配聊天 ID
        .eq('user_id', user.value!.id) // 确保是当前用户的消息

      // 如果删除消息过程中出现错误，则抛出异常
      if (messagesError) throw messagesError

      // 删除聊天会话本身
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)             // 匹配聊天 ID
        .eq('user_id', user.value!.id) // 确保是当前用户的聊天会话

      // 如果删除聊天会话过程中出现错误，则抛出异常
      if (chatError) throw chatError

      // 更新本地聊天会话列表，移除已删除的会话
      chats.value = chats.value.filter(chat => chat.id !== chatId)

      // 返回删除成功
      return true
    } catch (err) {
      // 检查是否因为未登录导致的错误
      if (err instanceof Error && err.message === '用户未登录') {
        // 跳转到登录页面
        router.push('/login')
      }
      
      // 捕获并设置错误信息
      error.value = (err as Error).message
      // 在控制台输出错误信息
      console.error('删除聊天失败:', err)
      // 返回删除失败
      return false
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }

  /**
   * 清空所有聊天记录
   * @returns 清空操作是否成功
   */
  const clearAllChats = async () => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 清空之前的错误信息
      error.value = null
      
      // 删除当前用户的所有消息
      // 通过 user_id 条件确保只删除当前用户的数据
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', user.value!.id) // 匹配当前用户 ID

      // 如果删除消息过程中出现错误，则抛出异常
      if (messagesError) throw messagesError

      // 删除当前用户的所有聊天会话
      const { error: chatsError } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', user.value!.id) // 匹配当前用户 ID

      // 如果删除聊天会话过程中出现错误，则抛出异常
      if (chatsError) throw chatsError

      // 清空本地列表
      chats.value = []
      messages.value = []

      // 返回清空成功
      return true
    } catch (err) {
      // 检查是否因为未登录导致的错误
      if (err instanceof Error && err.message === '用户未登录') {
        // 跳转到登录页面
        router.push('/login')
      }
      
      // 捕获并设置错误信息
      error.value = (err as Error).message
      // 在控制台输出错误信息
      console.error('清空聊天记录失败:', err)
      // 返回清空失败
      return false
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }

  /**
   * 更新聊天会话标题
   * @param chatId 聊天会话 ID
   * @param title 新的聊天标题
   * @returns 更新后的聊天会话或 null
   */
  const updateChatTitle = async (chatId: number, title: string) => {
    try {
      // 设置加载状态为 true
      loading.value = true
      // 清空之前的错误信息
      error.value = null
      
      // 更新 Supabase 中的聊天会话标题
      // 通过 user_id 条件确保只更新当前用户的数据
      const { data, error: updateError } = await supabase
        .from('chats')
        .update({ 
          title,                              // 新的标题
          updated_at: new Date().toISOString() // 更新时间戳
        })
        .eq('id', chatId)                     // 匹配聊天 ID
        .eq('user_id', user.value!.id)         // 确保是当前用户的聊天会话
        .select()                             // 返回更新后的数据
        .maybeSingle()    // 期望只返回一条记录

      // 如果更新过程中出现错误，则抛出异常
      if (updateError) throw updateError

      // 更新本地聊天会话列表
      const index = chats.value.findIndex(chat => chat.id === chatId)
      if (index !== -1 && data) {
        chats.value[index] = data // 更新对应索引的聊天会话
      }

      // 返回更新后的聊天会话
      return data
    } catch (err) {
      // 检查是否因为未登录导致的错误
      if (err instanceof Error && err.message === '用户未登录') {
        // 跳转到登录页面
        router.push('/login')
      }
      
      // 捕获并设置错误信息
      error.value = (err as Error).message
      // 在控制台输出错误信息
      console.error('更新聊天标题失败:', err)
      // 返回 null
      return null
    } finally {
      // 无论成功或失败，都将加载状态设置为 false
      loading.value = false
    }
  }

  // 返回所有需要的属性和方法，供组件使用
  return {
    messages,         // 聊天消息列表
    chats,            // 聊天会话列表
    loading,          // 加载状态
    error,            // 错误信息
    fetchChats,       // 获取聊天会话列表的方法
    createChat,       // 创建聊天会话的方法
    fetchMessages,    // 获取聊天消息的方法
    sendMessage,      // 发送消息的方法
    deleteChat,       // 删除聊天会话的方法
    clearAllChats,    // 清空所有聊天记录的方法
    updateChatTitle   // 更新聊天标题的方法
  }
}