// 聊天消息接口
export interface ChatMessage {
  id: string;
  text: string;
  isuser: boolean;
  timestamp: Date;
}

// 线程ID管理
const threadStore = new Map<number, string>();

function getThreadIdForChat(chatId: number): string {
  if (!threadStore.has(chatId)) {
    threadStore.set(chatId, `thread_${chatId}_${Date.now()}`);
  }
  return threadStore.get(chatId)!;
}

// 流式调用函数
export async function streamFromAI(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  chatId?: number,
): Promise<{ success: boolean; error?: string }> {
  // 找出最后一条用户消息
  const userMessages = messages.filter((m) => m.isuser);
  const lastUserMessage = userMessages[userMessages.length - 1];

  if (!lastUserMessage) {
    return { success: false, error: "没有找到用户消息" };
  }

  // 获取或创建线程ID
  let threadId: string;
  if (chatId !== undefined) {
    threadId = getThreadIdForChat(chatId);
  } else {
    threadId = `thread_temp_${Date.now()}`;
  }

  // Edge Function URL
  const EDGE_FUNCTION_URL =
    "https://wiynpkkfsiiqnofhifhs.supabase.co/functions/v1/ask-ai";

  console.log("🔵 开始流式请求", {
    message: lastUserMessage.text.substring(0, 50) +
      (lastUserMessage.text.length > 50 ? "..." : ""),
    messageLength: lastUserMessage.text.length,
    threadId,
    chatId,
  });

  try {
    // 发送请求
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        message: lastUserMessage.text,
        threadId: threadId,
      }),
      signal,
    });

    // ⚠️ 注意：Response对象不能直接JSON.stringify，这只会打印空对象
    console.log("🔵 响应状态:", response.status, response.statusText);
    console.log("🔵 响应OK:", response.ok);
    console.log("🔵 响应类型:", response.type);

    // 打印所有响应头
    console.log("🔵 响应头:");
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });

    // 处理HTTP错误
    if (!response.ok) {
      console.error("❌ HTTP错误:", response.status, response.statusText);

      // 尝试读取错误信息
      try {
        const errorText = await response.text();
        console.error("❌ 错误响应内容:", errorText);
        return {
          success: false,
          error: `服务器错误 (${response.status}): ${
            errorText.substring(0, 100)
          }`,
        };
      } catch (e) {
        return {
          success: false,
          error: `请求失败: ${response.status} ${response.statusText}`,
        };
      }
    }

    // 检查响应体
    if (!response.body) {
      console.error("❌ 错误: response.body 为空");
      return { success: false, error: "服务器返回了空的响应体" };
    }

    console.log("✅ 响应体存在，开始读取流数据...");

    // 获取流读取器
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullResponse = "";
    let chunkCount = 0;
    let receivedData = false; // 标记是否收到了实际数据

    try {
      while (true) {
        const { done, value } = await reader.read();
        chunkCount++;

        console.log(`📦 数据块 ${chunkCount}:`, {
          done,
          hasValue: !!value,
          valueLength: value ? value.length : 0,
        });

        if (done) {
          console.log("🏁 流传输完成");
          console.log("📊 统计: 总共收到", chunkCount - 1, "个数据块");
          console.log("📝 完整回复长度:", fullResponse.length);
          console.log("📝 完整回复内容:", fullResponse);
          break;
        }

        if (!value || value.length === 0) {
          console.log("⚠️  收到空数据块，跳过");
          continue;
        }

        receivedData = true;

        // 解码数据
        const chunkText = decoder.decode(value, { stream: true });
        console.log(
          `📄 原始数据 (${chunkText.length}字符):`,
          chunkText.length > 100
            ? chunkText.substring(0, 100) + "..."
            : chunkText,
        );

        // 添加到缓冲区
        buffer += chunkText;

        // 按行处理（SSE格式每行以\n结尾）
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 最后一行可能不完整，留到下次处理

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (!trimmedLine) continue; // 跳过空行
          if (trimmedLine.startsWith(":")) continue; // 跳过注释行

          console.log(
            `📋 处理行: ${trimmedLine.substring(0, 80)}${
              trimmedLine.length > 80 ? "..." : ""
            }`,
          );

          // 检查是否是SSE格式: data: {...}
          if (trimmedLine.startsWith("data: ")) {
            const dataContent = trimmedLine.substring(6).trim();

            if (dataContent === "[DONE]") {
              console.log("✅ 收到流结束标记 [DONE]");
              continue;
            }

            try {
              // 解析JSON数据
              const data = JSON.parse(dataContent);
              console.log("✅ 解析成功:", Object.keys(data));

              // 🎯 关键：根据你的Edge Function返回的实际格式提取内容
              // 你需要根据Edge Function的实际返回调整这里的逻辑

              // 可能性1：如果你的Edge Function直接转发智谱AI的响应
              // 智谱AI格式: {"choices":[{"delta":{"content":"你好"}}]}
              const aiContent = data.choices?.[0]?.delta?.content;

              // 可能性2：如果你的Edge Function包装了响应
              // 包装格式: {"type":"chunk","content":"你好"}
              const wrappedContent = data.content;

              // 可能性3：其他可能的字段
              const messageContent = data.message;

              // 选择第一个有效的content
              const content = aiContent || wrappedContent || messageContent;

              if (content && typeof content === "string") {
                console.log(`✅ 提取到内容: "${content}"`);
                fullResponse += content;
                onChunk(content); // 实时回调更新UI
              } else {
                // 如果是空内容或其他元数据，只记录不处理
                console.log("ℹ️  无内容的数据块:", data);
              }
            } catch (parseError) {
              console.warn(
                "⚠️  解析JSON失败:",
                parseError,
                "原始数据:",
                dataContent.substring(0, 100),
              );

              // 如果不是JSON，可能是纯文本，直接作为内容处理
              if (dataContent && dataContent !== "[DONE]") {
                console.log(
                  `✅ 将非JSON数据作为内容: "${
                    dataContent.substring(0, 50)
                  }..."`,
                );
                fullResponse += dataContent;
                onChunk(dataContent);
              }
            }
          } else {
            // 如果不是data:开头的行，尝试直接作为JSON解析
            try {
              const data = JSON.parse(trimmedLine);
              console.log("✅ 直接解析JSON:", Object.keys(data));

              // 同样的内容提取逻辑
              const content = data.choices?.[0]?.delta?.content ||
                data.content || data.message;
              if (content && typeof content === "string") {
                console.log(`✅ 提取到内容: "${content}"`);
                fullResponse += content;
                onChunk(content);
              }
            } catch {
              console.warn("⚠️  无法解析的行:", trimmedLine.substring(0, 100));
            }
          }
        }
      }

      // 检查是否真的收到了数据
      if (!receivedData) {
        console.error("❌ 警告: 流已结束但未收到任何有效数据");
        return { success: false, error: "服务器返回了空的数据流" };
      }

      if (fullResponse.length === 0) {
        console.error("❌ 警告: 流已结束但提取到的内容为空");
        return { success: false, error: "未能从数据流中提取到有效内容" };
      }

      console.log("🎉 流式处理成功完成");
      return { success: true };
    } catch (streamError) {
      console.error("❌ 流处理错误:", streamError);
      return {
        success: false,
        error: `流处理异常: ${
          streamError instanceof Error ? streamError.message : "未知错误"
        }`,
      };
    } finally {
      reader.releaseLock();
      console.log("🔒 已释放读取器锁");
    }
  } catch (error) {
    // 处理网络错误、中止错误等
    if (signal?.aborted) {
      console.log("⏹️  请求被用户取消");
      return { success: false, error: "请求已取消" };
    }

    if (
      error instanceof TypeError && error.message.includes("Failed to fetch")
    ) {
      console.error("❌ 网络错误:", error);
      return {
        success: false,
        error: "网络连接失败，请检查网络设置和URL是否正确",
      };
    }

    console.error("❌ 未知错误:", error);
    return {
      success: false,
      error: `请求异常: ${error instanceof Error ? error.message : "未知错误"}`,
    };
  }
}

/**
 * 新的AI服务流式调用函数，用于调用ask-agent Edge Function
 * @param question 用户提出的问题
 * @param onChunk 回调函数，用于处理流式响应的每个数据块
 * @param doc_id 可选，限定在某个文档范围内检索
 * @returns Promise对象，包含成功或错误信息
 */
export async function streamFromAIEdge(
  question: string,
  onChunk: (chunk: string) => void,
  doc_id?: string,
  signal?: AbortSignal,
): Promise<{ success: boolean; error?: string }> {
  // Edge Function URL
  const EDGE_FUNCTION_URL =
    "https://wiynpkkfsiiqnofhifhs.supabase.co/functions/v1/ask-agent";

  console.log("🔵 开始调用ask-agent Edge Function", {
    question: question.substring(0, 50) + (question.length > 50 ? "..." : ""),
    questionLength: question.length,
    doc_id,
  });

  try {
    // 获取Supabase认证token
    const { data: { session } } = await fetchUserSession();
    if (!session?.access_token) {
      throw new Error("用户未认证，无法获取访问令牌");
    }

    // 发送请求
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        question: question,
        doc_id: doc_id, // 可选参数
      }),
      signal,
    });

    // 记录响应信息
    console.log("🔵 响应状态:", response.status, response.statusText);
    console.log("🔵 响应OK:", response.ok);
    console.log("🔵 响应类型:", response.type);

    // 处理HTTP错误
    if (!response.ok) {
      console.error("❌ HTTP错误:", response.status, response.statusText);

      // 尝试读取错误信息
      try {
        const errorText = await response.text();
        console.error("❌ 错误响应内容:", errorText);
        return {
          success: false,
          error: `服务器错误 (${response.status}): ${errorText.substring(0, 100)}`,
        };
      } catch (e) {
        return {
          success: false,
          error: `请求失败: ${response.status} ${response.statusText}`,
        };
      }
    }

    // 检查响应体
    if (!response.body) {
      console.error("❌ 错误: response.body 为空");
      return { success: false, error: "服务器返回了空的响应体" };
    }

    console.log("✅ 响应体存在，开始读取流数据...");

    // 获取流读取器
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullResponse = "";
    let chunkCount = 0;
    let receivedData = false; // 标记是否收到了实际数据

    try {
      while (true) {
        const { done, value } = await reader.read();
        chunkCount++;

        console.log(`📦 数据块 ${chunkCount}:`, {
          done,
          hasValue: !!value,
          valueLength: value ? value.length : 0,
        });

        if (done) {
          console.log("🏁 流传输完成");
          console.log("📊 统计: 总共收到", chunkCount - 1, "个数据块");
          console.log("📝 完整回复长度:", fullResponse.length);
          console.log("📝 完整回复内容:", fullResponse);
          break;
        }

        if (!value || value.length === 0) {
          console.log("⚠️  收到空数据块，跳过");
          continue;
        }

        receivedData = true;

        // 解码数据
        const chunkText = decoder.decode(value, { stream: true });
        console.log(
          `📄 原始数据 (${chunkText.length}字符):`,
          chunkText.length > 100
            ? chunkText.substring(0, 100) + "..."
            : chunkText,
        );

        // 添加到缓冲区
        buffer += chunkText;

        // 按行处理（SSE格式每行以\n结尾）
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 最后一行可能不完整，留到下次处理

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (!trimmedLine) continue; // 跳过空行
          if (trimmedLine.startsWith(":")) continue; // 跳过注释行

          console.log(
            `📋 处理行: ${trimmedLine.substring(0, 80)}${
              trimmedLine.length > 80 ? "..." : ""
            }`,
          );

          // 检查是否是SSE格式: data: {...}
          if (trimmedLine.startsWith("data: ")) {
            const dataContent = trimmedLine.substring(6).trim();

            if (dataContent === "[DONE]") {
              console.log("✅ 收到流结束标记 [DONE]");
              continue;
            }

            try {
              // 解析JSON数据
              const data = JSON.parse(dataContent);
              console.log("✅ 解析成功:", Object.keys(data));

              // 检查是否是错误响应
              if (data.error) {
                console.error("❌ Edge Function返回错误:", data);
                return {
                  success: false,
                  error: `API错误: ${data.error}, 详情: ${data.details || '无详细信息'}`
                };
              }

              // 根据Edge Function返回的实际格式提取内容
              // 可能性1：直接返回的内容
              const aiContent = data.choices?.[0]?.delta?.content;
              const directContent = data.content || data.text || data.message;

              // 选择第一个有效的content
              const content = aiContent || directContent;

              if (content && typeof content === "string") {
                console.log(`✅ 提取到内容: "${content}"`);
                fullResponse += content;
                onChunk(content); // 实时回调更新UI
              } else {
                // 如果是空内容或其他元数据，只记录不处理
                console.log("ℹ️  无内容的数据块:", data);
              }
            } catch (parseError) {
              console.warn(
                "⚠️  解析JSON失败:",
                parseError,
                "原始数据:",
                dataContent.substring(0, 100),
              );

              // 如果不是JSON，可能是纯文本，直接作为内容处理
              if (dataContent && dataContent !== "[DONE]") {
                console.log(
                  `✅ 将非JSON数据作为内容: "${
                    dataContent.substring(0, 50)
                  }..."`,
                );
                fullResponse += dataContent;
                onChunk(dataContent);
              }
            }
          } else {
            // 如果不是data:开头的行，尝试直接作为JSON解析
            try {
              const data = JSON.parse(trimmedLine);
              console.log("✅ 直接解析JSON:", Object.keys(data));

              // 检查是否是错误响应
              if (data.error) {
                console.error("❌ Edge Function返回错误:", data);
                return {
                  success: false,
                  error: `API错误: ${data.error}, 详情: ${data.details || '无详细信息'}`
                };
              }

              // 同样的内容提取逻辑
              const content = data.choices?.[0]?.delta?.content ||
                data.content || data.text || data.message;
              if (content && typeof content === "string") {
                console.log(`✅ 提取到内容: "${content}"`);
                fullResponse += content;
                onChunk(content);
              }
            } catch {
              console.warn("⚠️  无法解析的行:", trimmedLine.substring(0, 100));
            }
          }
        }
      }

      // 检查是否真的收到了数据
      if (!receivedData) {
        console.error("❌ 警告: 流已结束但未收到任何有效数据");
        return { success: false, error: "服务器返回了空的数据流" };
      }

      if (fullResponse.length === 0) {
        console.error("❌ 警告: 流已结束但提取到的内容为空");
        return { success: false, error: "未能从数据流中提取到有效内容" };
      }

      console.log("🎉 ask-agent Edge Function调用成功完成");
      return { success: true };
    } catch (streamError) {
      console.error("❌ 流处理错误:", streamError);
      return {
        success: false,
        error: `流处理异常: ${
          streamError instanceof Error ? streamError.message : "未知错误"
        }`,
      };
    } finally {
      reader.releaseLock();
      console.log("🔒 已释放读取器锁");
    }
  } catch (error) {
    // 处理网络错误、中止错误等
    if (signal?.aborted) {
      console.log("⏹️  请求被用户取消");
      return { success: false, error: "请求已取消" };
    }

    if (
      error instanceof TypeError && error.message.includes("Failed to fetch")
    ) {
      console.error("❌ 网络错误:", error);
      return {
        success: false,
        error: "网络连接失败，请检查网络设置和URL是否正确",
      };
    }

    console.error("❌ 未知错误:", error);
    return {
      success: false,
      error: `请求异常: ${error instanceof Error ? error.message : "未知错误"}`,
    };
  }
}

/**
 * 获取当前用户会话的辅助函数
 */
async function fetchUserSession() {
  // 这里需要引入Supabase客户端
  const { supabase } = await import('@/lib/supabaseClient');
  return await supabase.auth.getSession();
}
