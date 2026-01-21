// /supabase/functions/risk/types.ts

// 问卷相关类型
export interface Questionnaire {
  id: string;
  version: string;
  questions: Question[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  options: QuestionOption[];
  weight: number;
  description: string;
}

export interface QuestionOption {
  value: string;
  text: string;
  risk_score: number;
  risk_label: string;
  explanation: string;
}

// 答案相关类型
export interface UserAnswer {
  user_id: string;
  questionnaire_id: string;
  answers: Record<string, string>; // {q1: "A", q2: "B", ...}
  session_id?: string;
  is_completed: boolean;
  created_at: string;
}

export interface UserAnswerWithId extends UserAnswer {
  id: string;
}

// 风险画像相关类型
export type RiskLevel = "conservative" | "moderate" | "aggressive";
export type ProfileSource =
  | "questionnaire"
  | "default"
  | "manual"
  | "system_inferred";

export interface RiskProfile {
  user_id: string;
  answer_id?: string;
  risk_level: RiskLevel;
  total_score: number;
  confidence_score: number;
  dimension_scores: Record<string, number>;
  weighted_scores: Record<string, number>;
  ai_summary: string | Record<string, any>;
  source: ProfileSource;
  model_version: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface RiskProfileWithId extends RiskProfile {
  id: string;
}

// 请求/响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

export interface GetQuestionnaireResponse {
  questionnaire_id: string;
  version: string;
  questions: Question[];
  metadata: {
    created_at: string;
    updated_at: string;
    question_count: number;
  };
}

export interface SubmitAnswersRequest {
  user_id: string;
  questionnaire_id: string;
  answers: Record<string, string>;
  session_id?: string;
}

export interface SubmitAnswersResponse {
  answer_id: string;
  user_id: string;
  questionnaire_id: string;
  is_completed: boolean;
  created_at: string;
}

export interface CalculateProfileRequest {
  user_id: string;
  answer_id: string;
}

export interface CalculateProfileResponse {
  profile_id: string;
  risk_level: RiskLevel;
  total_score: number;
  confidence_score: number;
  created_at: string;
}

export interface GetStatusRequest {
  user_id: string;
}

export interface GetStatusResponse {
  has_completed_questionnaire: boolean;
  has_active_profile: boolean;
  risk_level: RiskLevel;
  source: ProfileSource;
  profile_details?: {
    profile_id: string;
    total_score: number;
    confidence_score: number;
    created_at: string;
  };
  questionnaire_details?: {
    questionnaire_id: string;
    version: string;
    completed_at: string;
  };
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 环境变量类型
export interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  INTERNAL_API_KEY?: string;
  AI_SERVICE_URL?: string;
  AI_SERVICE_API_KEY?: string;
  ENVIRONMENT?: string;
}
