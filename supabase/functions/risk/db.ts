// /supabase/functions/risk/db.ts

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.38.4";
import {
  EnvConfig,
  Questionnaire,
  RiskProfile,
  RiskProfileWithId,
  UserAnswer,
} from "./types.ts";

// 数据库客户端单例
let supabaseClient: SupabaseClient | null = null;

/**
 * 获取数据库客户端
 * @param useServiceRole 是否使用服务角色密钥（默认false，使用匿名密钥）
 */
export function getSupabaseClient(useServiceRole = false): SupabaseClient {
  if (!supabaseClient) {
    const config = getEnvConfig();
    const key = useServiceRole
      ? config.SUPABASE_SERVICE_ROLE_KEY
      : config.SUPABASE_ANON_KEY;
    supabaseClient = createClient(config.SUPABASE_URL, key);
  }
  return supabaseClient;
}

/**
 * 获取环境配置
 */
export function getEnvConfig(): EnvConfig {
  return {
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
    SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY") || "",
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    INTERNAL_API_KEY: Deno.env.get("INTERNAL_API_KEY"),
    AI_SERVICE_URL: Deno.env.get("AI_SERVICE_URL"),
    AI_SERVICE_API_KEY: Deno.env.get("AI_SERVICE_API_KEY"),
    ENVIRONMENT: Deno.env.get("ENVIRONMENT") || "development",
  };
}

// 问卷相关操作
export const questionnaireDb = {
  /**
   * 获取当前活跃问卷
   */
  async getActiveQuestionnaire(): Promise<Questionnaire | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("risk_questionnaires")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("获取活跃问卷失败:", error);
      throw error;
    }

    return data;
  },

  /**
   * 根据ID获取问卷
   */
  async getQuestionnaireById(id: string): Promise<Questionnaire | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("risk_questionnaires")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("获取问卷失败:", error);
      throw error;
    }

    return data;
  },
};

// 用户答案相关操作
export const answersDb = {
  /**
   * 保存用户答案
   */
  async saveUserAnswer(
    answerData: Omit<UserAnswer, "created_at">,
  ): Promise<any> {
    const supabase = getSupabaseClient(true); // 使用服务角色密钥（需要写权限）

    const { data, error } = await supabase
      .from("user_risk_answers")
      .insert({
        ...answerData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("保存用户答案失败:", error);
      throw error;
    }

    return data;
  },

  /**
   * 检查用户是否已提交过问卷
   */
  async hasUserSubmittedQuestionnaire(
    userId: string,
    questionnaireId: string,
  ): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("user_risk_answers")
      .select("id")
      .eq("user_id", userId)
      .eq("questionnaire_id", questionnaireId)
      .eq("is_completed", true)
      .limit(1);

    if (error) {
      console.error("检查用户提交状态失败:", error);
      return false;
    }

    return data && data.length > 0;
  },

  /**
   * 获取用户答案
   */
  async getUserAnswer(answerId: string): Promise<any> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("user_risk_answers")
      .select(`
        *,
        questionnaire:risk_questionnaires(*)
      `)
      .eq("id", answerId)
      .single();

    if (error) {
      console.error("获取用户答案失败:", error);
      throw error;
    }

    return data;
  },

  /**
   * 获取用户最新的答案
   */
  async getUserLatestAnswer(userId: string): Promise<any> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("user_risk_answers")
      .select(`
        *,
        questionnaire:risk_questionnaires(version)
      `)
      .eq("user_id", userId)
      .eq("is_completed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // 如果没有找到记录，返回null而不是抛出错误
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  },
};

// 风险画像相关操作
export const profilesDb = {
  /**
   * 创建风险画像
   */
  async createRiskProfile(
    profileData: Omit<RiskProfile, "created_at">,
  ): Promise<RiskProfileWithId> {
    const supabase = getSupabaseClient(true); // 使用服务角色密钥

    const { data, error } = await supabase
      .from("user_risk_profiles")
      .insert({
        ...profileData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("创建风险画像失败:", error);
      throw error;
    }

    return data;
  },

  /**
   * 获取用户当前活跃的风险画像
   */
  async getActiveUserProfile(
    userId: string,
  ): Promise<RiskProfileWithId | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("user_risk_profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // 如果没有找到记录，返回null
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  },

  /**
   * 停用用户的所有风险画像
   */
  async deactivateUserProfiles(userId: string): Promise<void> {
    const supabase = getSupabaseClient(true);

    const { error } = await supabase
      .from("user_risk_profiles")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      console.error("停用用户画像失败:", error);
      throw error;
    }
  },

  /**
   * 原子性地激活新的风险画像（停用旧的，创建新的）
   */
  async activateNewProfile(
    userId: string,
    profileData: Omit<RiskProfile, "user_id" | "created_at">,
  ): Promise<RiskProfileWithId> {
    const supabase = getSupabaseClient(true);

    // 使用事务确保原子性
    const { data, error } = await supabase.rpc("activate_user_profile", {
      p_user_id: userId,
      p_profile_data: profileData,
    });

    if (error) {
      console.error("激活风险画像失败:", error);
      throw error;
    }

    return data;
  },
};
