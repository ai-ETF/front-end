// /supabase/functions/risk/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  handleCalculateProfile,
  handleGetQuestionnaire,
  handleGetStatus,
  handlePostAnswers,
} from "./handlers.ts";

// 主处理函数
const handler = async (req: Request): Promise<Response> => {
  console.log(`📨 收到请求: ${req.method} ${req.url}`);

  // 设置响应头
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-api-key, x-internal-call",
  });

  // 处理预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // 解析URL
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`📍 请求路径: ${path}`);

    // 路由分发
    if (path.endsWith("/risk/questionnaire") && req.method === "GET") {
      return await handleGetQuestionnaire();
    }

    if (path.endsWith("/risk/answers") && req.method === "POST") {
      const body = await req.json();
      return await handlePostAnswers(body);
    }

    if (path.endsWith("/risk/profile/calculate") && req.method === "POST") {
      const body = await req.json();
      const isInternalCall = req.headers.get("x-internal-call") === "true";
      return await handleCalculateProfile(body, isInternalCall);
    }

    if (path.endsWith("/risk/status") && req.method === "GET") {
      const userId = url.searchParams.get("user_id");
      if (!userId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "缺少user_id参数",
              timestamp: new Date().toISOString(),
            },
          }),
          { status: 400, headers },
        );
      }
      return await handleGetStatus(userId);
    }

    // 如果都没有匹配，返回404
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "接口不存在",
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 404, headers },
    );
  } catch (error: any) {
    // 处理JSON解析错误
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "请求体不是有效的JSON格式",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers },
      );
    }

    // 其他未处理的错误
    console.error("🔥 未处理的错误:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "服务器内部错误",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 500, headers },
    );
  }
};

// 启动服务
console.log("🚀 风险画像系统 Edge Function 已启动");
serve(handler);
