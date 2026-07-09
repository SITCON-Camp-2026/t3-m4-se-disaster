import type { Phase0JudgementDraft } from "../phase-0/phase0-types";

export type V1Status =
  | "unorganized"
  | "organizing"
  | "rejected"
  | "unverified_draft"
  | "verified_actionable"
  | "archived_expired";

export interface V1JudgementDraft extends Phase0JudgementDraft {
  status: V1Status;
  isPrivacySensitive?: boolean;
  confirmedFields?: string[]; // AI 欄位人工確認紀錄
  expiredFeedback?: string; // 現場志工過期回饋說明
  eyewitnessType?: "first_hand" | "second_hand"; // 第一手目擊 / 聽人轉述
  reporterPhone?: string; // 聯絡電話
  hasAiSuggestions?: boolean; // 標記是否調用過 AI 分析
}
