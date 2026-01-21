-- 在 Supabase SQL Editor 中运行
INSERT INTO risk_questionnaires (version, questions, is_active) 
VALUES ('v1.0', 
'[
  {
    "id": "q1",
    "category": "investment_horizon",
    "question": "你通常计划持有一只 ETF 多长时间？",
    "options": [
      {"value": "A", "text": "少于 1 年，偏向短期配置", "risk_score": 1, "risk_label": "conservative"},
      {"value": "B", "text": "1–3 年，视情况调整", "risk_score": 2, "risk_label": "moderate"},
      {"value": "C", "text": "3 年以上，长期持有", "risk_score": 3, "risk_label": "aggressive"}
    ],
    "weight": 0.2,
    "description": "投资期限维度，反映时间维度风险"
  },
  {
    "id": "q2",
    "category": "drawdown_tolerance",
    "question": "如果你持有的 ETF 在短期内下跌约 20%，你更可能会？",
    "options": [
      {"value": "A", "text": "感到不安，考虑止损或减少仓位", "risk_score": 1, "risk_label": "conservative"},
      {"value": "B", "text": "观望一段时间，再决定是否调整", "risk_score": 2, "risk_label": "moderate"},
      {"value": "C", "text": "认为是正常波动，甚至考虑加仓", "risk_score": 3, "risk_label": "aggressive"}
    ],
    "weight": 0.3,
    "description": "回撤容忍度，反映心理风险承受"
  },
  {
    "id": "q3",
    "category": "investment_experience",
    "question": "你是否经历过较明显的市场波动（如快速下跌或大幅震荡）？",
    "options": [
      {"value": "A", "text": "几乎没有，投资经验较少", "risk_score": 1, "risk_label": "conservative"},
      {"value": "B", "text": "经历过，但次数不多", "risk_score": 2, "risk_label": "moderate"},
      {"value": "C", "text": "经历过多次，对波动较为熟悉", "risk_score": 3, "risk_label": "aggressive"}
    ],
    "weight": 0.15,
    "description": "投资经验，反映行为稳定性"
  },
  {
    "id": "q4",
    "category": "goal_orientation",
    "question": "在 ETF 投资中，你更看重的是？",
    "options": [
      {"value": "A", "text": "稳定性，尽量避免大幅波动", "risk_score": 1, "risk_label": "conservative"},
      {"value": "B", "text": "风险与收益的相对平衡", "risk_score": 2, "risk_label": "moderate"},
      {"value": "C", "text": "长期收益潜力，愿意承担波动", "risk_score": 3, "risk_label": "aggressive"}
    ],
    "weight": 0.25,
    "description": "目标导向，反映主观风险偏好"
  },
  {
    "id": "q5",
    "category": "knowledge_level",
    "question": "你对 ETF 相关概念（如跟踪误差、成分股、行业配置）的理解程度是？",
    "options": [
      {"value": "A", "text": "基本不了解，需要通俗解释", "risk_score": 1, "risk_label": "conservative"},
      {"value": "B", "text": "有一定了解，能理解常见术语", "risk_score": 2, "risk_label": "moderate"},
      {"value": "C", "text": "比较熟悉，能看懂专业分析", "risk_score": 3, "risk_label": "aggressive"}
    ],
    "weight": 0.1,
    "description": "认知水平，反映信息吸收能力"
  }
]', 
true);