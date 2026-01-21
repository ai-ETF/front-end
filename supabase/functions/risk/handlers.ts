// /supabase/functions/risk/handlers.ts

import { answersDb, profilesDb, questionnaireDb } from "./db.ts";
import { aiService, profileService, validationService } from "./services.ts";
import {
  ApiResponse,
  CalculateProfileRequest,
  CalculateProfileResponse,
  GetQuestionnaireResponse,
  GetStatusRequest,
  GetStatusResponse,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
} from "./types.ts";

/**
 * 处理获取问卷请求
 */
export async function handleGetQuestionnaire(): Promise<Response> {
  try {
    const questionnaire = await questionnaireDb.getActiveQuestionnaire();

    if (!questionnaire) {
      return createErrorResponse(404, "NO_QUESTIONNAIRE", "没有可用的问卷");
    }

    const response: GetQuestionnaireResponse = {
      questionnaire_id: questionnaire.id,
      version: questionnaire.version,
      questions: questionnaire.questions,
      metadata: {
        created_at: questionnaire.created_at,
        updated_at: questionnaire.updated_at,
        question_count: questionnaire.questions?.length || 0,
      },
    };

    return createSuccessResponse(response);
  } catch (error: any) {
    console.error("获取问卷处理错误:", error);
    return createErrorResponse(
      500,
      "DATABASE_ERROR",
      "获取问卷失败",
      error.message,
    );
  }
}

/**
 * 处理提交答案请求
 */
export async function handlePostAnswers(body: any): Promise<Response> {
  try {
    // 验证请求数据
    const validation = validationService.validateSubmitAnswersRequest(body);
    if (!validation.isValid) {
      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "请求数据验证失败",
        validation.errors,
      );
    }

    const request = body as SubmitAnswersRequest;

    // 检查问卷是否存在
    const questionnaire = await questionnaireDb.getQuestionnaireById(
      request.questionnaire_id,
    );
    if (!questionnaire || !questionnaire.is_active) {
      return createErrorResponse(
        404,
        "QUESTIONNAIRE_NOT_FOUND",
        "问卷不存在或已失效",
      );
    }

    // 检查是否已提交过
    const hasSubmitted = await answersDb.hasUserSubmittedQuestionnaire(
      request.user_id,
      request.questionnaire_id,
    );

    if (hasSubmitted) {
      return createErrorResponse(
        409,
        "DUPLICATE_ANSWER",
        "您已经提交过这份问卷",
      );
    }

    // 保存答案
    const answer = await answersDb.saveUserAnswer({
      user_id: request.user_id,
      questionnaire_id: request.questionnaire_id,
      answers: request.answers,
      session_id: request.session_id,
      is_completed: true,
    });

    // 异步触发风险画像计算
    profileService.triggerProfileCalculation(request.user_id, answer.id);

    const response: SubmitAnswersResponse = {
      answer_id: answer.id,
      user_id: answer.user_id,
      questionnaire_id: answer.questionnaire_id,
      is_completed: answer.is_completed,
      created_at: answer.created_at,
    };

    return createSuccessResponse(response, 201);
  } catch (error: any) {
    console.error("提交答案处理错误:", error);
    return createErrorResponse(
      500,
      "INTERNAL_ERROR",
      "提交答案失败",
      error.message,
    );
  }
}

/**
 * 处理计算风险画像请求
 */
export async function handleCalculateProfile(
  body: any,
  isInternalCall = false,
): Promise<Response> {
  try {
    // 如果是外部调用，验证 API 密钥
    if (!isInternalCall) {
      const config = Deno.env.get("INTERNAL_API_KEY");
      const apiKey = body.api_key ||
        (body.headers && body.headers["x-api-key"]);

      if (!config || apiKey !== config) {
        return createErrorResponse(401, "UNAUTHORIZED", "未授权访问");
      }
    }

    // 验证请求数据
    const validation = validationService.validateCalculateProfileRequest(body);
    if (!validation.isValid) {
      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "请求数据验证失败",
        validation.errors,
      );
    }

    const request = body as CalculateProfileRequest;

    // 获取用户答案和问卷
    const answerData = await answersDb.getUserAnswer(request.answer_id);
    if (!answerData || answerData.user_id !== request.user_id) {
      return createErrorResponse(
        404,
        "ANSWER_NOT_FOUND",
        "未找到有效的答案记录",
      );
    }

    // 调用 AI 服务计算风险画像
    const aiResult = await aiService.calculateRiskProfile(request, answerData);

    // 准备画像数据并激活
    const profileData = profileService.prepareProfileData(
      aiResult,
      request.user_id,
      request.answer_id,
    );

    // 停用旧画像，激活新画像
    await profilesDb.deactivateUserProfiles(request.user_id);
    const profile = await profilesDb.createRiskProfile({
      user_id: request.user_id,
      ...profileData,
    });

    const response: CalculateProfileResponse = {
      profile_id: profile.id,
      risk_level: profile.risk_level,
      total_score: profile.total_score,
      confidence_score: profile.confidence_score,
      created_at: profile.created_at,
    };

    return createSuccessResponse(response);
  } catch (error: any) {
    console.error("计算风险画像处理错误:", error);

    // 根据错误类型返回不同的状态码
    if (error.message.includes("AI 服务")) {
      return createErrorResponse(
        502,
        "AI_SERVICE_ERROR",
        "AI服务调用失败",
        error.message,
      );
    }

    return createErrorResponse(
      500,
      "INTERNAL_ERROR",
      "计算风险画像失败",
      error.message,
    );
  }
}

/**
 * 处理获取用户状态请求
 */
export async function handleGetStatus(userId: string): Promise<Response> {
  try {
    if (!userId) {
      return createErrorResponse(400, "VALIDATION_ERROR", "缺少user_id参数");
    }

    // 并行查询用户状态
    const [activeProfile, latestAnswer] = await Promise.all([
      profilesDb.getActiveUserProfile(userId),
      answersDb.getUserLatestAnswer(userId),
    ]);

    const response: GetStatusResponse = {
      has_completed_questionnaire: !!latestAnswer,
      has_active_profile: !!activeProfile,
      risk_level: activeProfile?.risk_level || "moderate",
      source: activeProfile?.source || "default",
      profile_details: activeProfile
        ? {
          profile_id: activeProfile.id,
          total_score: activeProfile.total_score,
          confidence_score: activeProfile.confidence_score,
          created_at: activeProfile.created_at,
        }
        : undefined,
      questionnaire_details: latestAnswer
        ? {
          questionnaire_id: latestAnswer.questionnaire_id,
          version: latestAnswer.questionnaire?.version || "unknown",
          completed_at: latestAnswer.created_at,
        }
        : undefined,
    };

    return createSuccessResponse(response);
  } catch (error: any) {
    console.error("获取用户状态处理错误:", error);
    return createErrorResponse(
      500,
      "INTERNAL_ERROR",
      "获取用户状态失败",
      error.message,
    );
  }
}

/**
 * 创建成功响应
 */
function createSuccessResponse(data: any, status = 200): Response {
  const response: ApiResponse = {
    success: true,
    data,
  };

  return new Response(
    JSON.stringify(response),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

/**
 * 创建错误响应
 */
function createErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: any,
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(
    JSON.stringify(response),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
