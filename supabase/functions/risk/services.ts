// /supabase/functions/risk/services.ts

import { getEnvConfig } from "./db.ts";
import {
  CalculateProfileRequest,
  CalculateProfileResponse,
  RiskProfile,
  SubmitAnswersRequest,
} from "./types.ts";

// 验证服务
export const validationService = {
  /**
   * 验证提交答案的请求
   */
  validateSubmitAnswersRequest(
    data: any,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.user_id) errors.push("user_id 是必填字段");
    if (!data.questionnaire_id) errors.push("questionnaire_id 是必填字段");
    if (!data.answers) errors.push("answers 是必填字段");

    if (
      data.answers &&
      (typeof data.answers !== "object" || Array.isArray(data.answers))
    ) {
      errors.push("answers 必须是 JSON 对象");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * 验证计算画像的请求
   */
  validateCalculateProfileRequest(
    data: any,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.user_id) errors.push("user_id 是必填字段");
    if (!data.answer_id) errors.push("answer_id 是必填字段");

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * 验证 AI 服务返回的数据
   */
  validateAiServiceResponse(data: any): boolean {
    if (!data || typeof data !== "object") return false;

    const requiredFields = [
      "risk_level",
      "total_score",
      "dimension_scores",
      "ai_summary",
    ];

    return requiredFields.every((field) => data[field] !== undefined);
  },
};

// AI 服务调用
export const aiService = {
  /**
   * 调用外部 AI 服务计算风险画像
   */
  async calculateRiskProfile(
    request: CalculateProfileRequest,
    answerData: any,
  ): Promise<any> {
    const config = getEnvConfig();

    if (!config.AI_SERVICE_URL) {
      throw new Error("AI_SERVICE_URL 未配置");
    }

    // 准备 AI 服务请求数据
    const aiRequestData = {
      user_id: request.user_id,
      answer_id: request.answer_id,
      answers: answerData.answers,
      questionnaire: answerData.questionnaire,
      timestamp: new Date().toISOString(),
    };

    console.log("调用 AI 服务，数据:", JSON.stringify(aiRequestData));

    // 调用 AI 服务
    const response = await fetch(config.AI_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.AI_SERVICE_API_KEY || ""}`,
      },
      body: JSON.stringify(aiRequestData),
    });

    if (!response.ok) {
      throw new Error(
        `AI 服务调用失败: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        `AI 服务返回错误: ${result.error?.message || "未知错误"}`,
      );
    }

    // 验证返回数据
    if (!validationService.validateAiServiceResponse(result.data)) {
      throw new Error("AI 服务返回数据格式不正确");
    }

    return result.data;
  },
};

// 风险画像服务
export const profileService = {
  /**
   * 异步触发风险画像计算（不阻塞主线程）
   */
  triggerProfileCalculation(userId: string, answerId: string): void {
    console.log("触发风险画像计算:", { userId, answerId });

    const config = getEnvConfig();

    // 异步调用，不等待结果
    fetch(`${config.SUPABASE_URL}/functions/v1/risk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.INTERNAL_API_KEY || "internal-key",
        "x-internal-call": "true",
      },
      body: JSON.stringify({
        action: "calculate_profile",
        user_id: userId,
        answer_id: answerId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error(
            "触发画像计算失败:",
            response.status,
            response.statusText,
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          console.log("风险画像计算成功:", data.data.profile_id);
        } else {
          console.error("风险画像计算失败:", data.error);
        }
      })
      .catch((error) => {
        console.error("触发画像计算时发生错误:", error);
      });
  },

  /**
   * 准备风险画像数据
   */
  prepareProfileData(
    aiResult: any,
    userId: string,
    answerId: string,
  ): Omit<RiskProfile, "user_id" | "created_at"> {
    return {
      answer_id: answerId,
      risk_level: aiResult.risk_level,
      total_score: aiResult.total_score,
      confidence_score: aiResult.confidence_score || 0.85,
      dimension_scores: aiResult.dimension_scores,
      weighted_scores: aiResult.weighted_scores || {},
      ai_summary: aiResult.ai_summary,
      source: "questionnaire",
      model_version: aiResult.model_version || "v1.0",
      is_active: true,
      metadata: {
        calculated_at: new Date().toISOString(),
        ai_service_version: aiResult.metadata?.version || "unknown",
      },
    };
  },
};
