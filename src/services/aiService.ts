import type { ChatMessage } from '@/stores/chat';

/**
 * 向AI发送消息并接收流式响应
 * @param messages 消息历史记录
 * @param onChunk 接收每个数据块的回调函数
 * @param signal 用于取消请求的AbortSignal
 */
export async function streamFromAI(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  // 检查环境变量
  const apiUrl = import.meta.env.VITE_AI_CHAT_API_URL || 'http://localhost:3001/api/chat';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`AI服务错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 模拟流式响应，逐字输出
    const responseText = data.response || '';
    let index = 0;
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (index < responseText.length) {
          onChunk(responseText.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 20); // 每20毫秒输出一个字符，模拟打字效果
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('请求已被取消');
      return;
    }
    throw error;
  }
}

/**
 * 向AI发送消息并接收完整响应（非流式）
 * @param messages 消息历史记录
 * @param signal 用于取消请求的AbortSignal
 * @returns AI的完整回复
 */
export async function sendToAI(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  // 检查环境变量
  const apiUrl = import.meta.env.VITE_AI_CHAT_API_URL || 'http://localhost:3001/api/chat';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`AI服务错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('请求已被取消');
      return '';
    }
    throw error;
  }
}