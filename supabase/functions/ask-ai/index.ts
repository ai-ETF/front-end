// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "@std/http"

// ========= 调试辅助工具 =========
const log = (step: string, data?: unknown) => {
  console.log(
    `[ask-ai] ${step}`,
    data !== undefined ? JSON.stringify(data, null, 2) : ''
  )
}

// ========= CORS =========
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  log('REQUEST_START', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
  })

  // ---------- OPTIONS ----------
  if (req.method === 'OPTIONS') {
    log('CORS_PREFLIGHT')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ---------- Body 解析 ----------
    let rawBody = ''
    let body: Array<any> | null = null

    try {
      rawBody = await req.text()
      log('RAW_BODY', rawBody)

      body = rawBody ? JSON.parse(rawBody) : null
    } catch (e) {
      log('BODY_PARSE_ERROR', { error: String(e) })
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!body) {
      throw new Error('请求体为空')
    }

    const { message, threadId } = body
    log('PARSED_BODY', { message, threadId })

    if (!message) {
      throw new Error('请提供您的问题 message')
    }

    // ---------- 环境变量 ----------
    const TEST_API_KEY = Deno.env.get('TEST_API_KEY')
    log('ENV_CHECK', { TEST_API_KEY_PRESENT: !!TEST_API_KEY })

    if (!TEST_API_KEY) {
      throw new Error('TEST_API_KEY 环境变量未配置')
    }

    // ---------- 调用智谱 AI ----------
    log('AI_REQUEST_START')

    const aiRequestPayload = {
      model: 'glm-4.6',
      messages: [{ role: 'user', content: message }],
      stream: false,
      temperature: 0.7,
      max_tokens: 1024,
    }

    log('AI_REQUEST_PAYLOAD', aiRequestPayload)

    const aiResponse = await fetch(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TEST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiRequestPayload),
      }
    )

    log('AI_RESPONSE_META', {
      ok: aiResponse.ok,
      status: aiResponse.status,
      statusText: aiResponse.statusText,
    })

    const aiRawText = await aiResponse.text()
    log('AI_RESPONSE_RAW', aiRawText)

    if (!aiResponse.ok) {
      throw new Error(
        `AI服务错误 ${aiResponse.status}: ${aiResponse.statusText}`
      )
    }

    let aiData
    try {
      aiData = JSON.parse(aiRawText)
    } catch (e) {
      throw new Error('AI 返回不是合法 JSON')
    }

    const aiMessage = aiData?.choices?.[0]?.message?.content
    log('AI_PARSED_MESSAGE', aiMessage)

    if (!aiMessage) {
      throw new Error('AI 返回内容为空')
    }

    // ---------- 正常返回 ----------
    const result = {
      message: aiMessage,
      threadId: threadId || Date.now().toString(),
    }

    log('RESPONSE_SUCCESS', result)

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // ---------- 错误出口 ----------
    log('FUNCTION_ERROR', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    })

    return new Response(
      JSON.stringify({
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
