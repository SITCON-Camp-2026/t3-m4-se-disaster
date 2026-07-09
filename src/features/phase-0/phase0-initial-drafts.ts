import type { Phase0JudgementDraft } from "./phase0-types";

export const initialDrafts: Record<string, Phase0JudgementDraft> = {
  "M-002": {
    messyRecordId: "M-002",
    possibleKind: "site_status_candidate",
    confidence: "low",
    evidence: ["志工回報早上溪畔活動中心還有雨鞋。"],
    blockers: ["資訊具時效性（早上），不確定下午是否還有剩餘雨鞋。"],
    suggestedNextStep: "ask_for_more_info",
    unsafeToActDirectly: true,
    humanReviewNote:
      "【無法直接轉任務】現場物資消耗快速，早上資訊無法直接作為下午決策依據。需派員更新或由現場回報更新。",
    locationArea: "溪畔活動中心",
    detailedCategory: "物資庫存",
    requiredSkills: ["物資盤點"],
  },
  "M-003": {
    messyRecordId: "M-003",
    possibleKind: "help_request_candidate",
    confidence: "medium",
    evidence: ["現場回報老街口不缺鏟子，需要水電。"],
    blockers: ["需要與先前發佈的鏟子任務單進行對齊並更新其狀態。"],
    suggestedNextStep: "send_to_human_review",
    unsafeToActDirectly: true,
    humanReviewNote:
      "【無法直接轉任務】此回報與原有任務單狀態衝突。在更新原本任務單狀態前，不應直接派工。",
    locationArea: "老街口",
    detailedCategory: "設施修復",
    requiredSkills: ["水電工"],
  },
  "M-004": {
    messyRecordId: "M-004",
    possibleKind: "site_status_candidate",
    confidence: "low",
    evidence: ["群組傳言溪畔活動中心還有很多雨鞋，叫大家去拿。"],
    blockers: [
      "未經現場人員查核的社群群組傳言。",
      "可能與現場實況有極大落差，若盲目跟從可能造成志工空跑或搶奪。",
    ],
    suggestedNextStep: "send_to_human_review",
    unsafeToActDirectly: true,
    humanReviewNote:
      "【人類質疑修正】Agent原先建議將群組傳言直接列為 verified 任務。人類修正其信心程度為 low，並列入待確認，因為傳言極具風險，應先對齊現場志工盤點（如 M-010 僅剩 12 雙）。",
    locationArea: "溪畔活動中心",
    detailedCategory: "物資狀態",
    requiredSkills: ["現場查證"],
  },
  "M-005": {
    messyRecordId: "M-005",
    possibleKind: "announcement_candidate",
    confidence: "low",
    evidence: ["群組內流傳『中午前道路封閉』的螢幕截圖。"],
    blockers: [
      "截圖缺乏明確日期（不確定是哪一天）。",
      "來源無法證實是否為官方發佈管道。",
    ],
    suggestedNextStep: "do_not_use_yet",
    unsafeToActDirectly: true,
    humanReviewNote:
      "【人類質疑修正】Agent原先直接建議將其當成官方公告發佈。人類予以駁回並修正，因截圖毫無時間戳記，不能當成事實發布，已列為暫不使用。",
    locationArea: "未知道路",
    detailedCategory: "交通狀況",
    requiredSkills: ["路況查證"],
  },
  "M-010": {
    messyRecordId: "M-010",
    possibleKind: "site_status_candidate",
    confidence: "high",
    evidence: [
      "值守志工現場於 14:35 回報剩餘雨鞋數量、不缺飲水、拒收二手衣物。",
    ],
    blockers: [],
    suggestedNextStep: "create_site_update_suggestion",
    unsafeToActDirectly: false,
    humanReviewNote:
      "【高品質資訊】此筆資訊來自現場值守志工，內容精確且包含時效期限（下一次盤點 16:30），品質非常高，可以採信。",
    locationArea: "溪畔活動中心",
    detailedCategory: "物資盤點",
    requiredSkills: ["庫存管理"],
  },
  "M-011": {
    messyRecordId: "M-011",
    possibleKind: "help_request_candidate",
    confidence: "medium",
    evidence: ["志工代轉述不方便使用手機的長者需要協助搬家具。"],
    blockers: [
      "操作者非當事人（志工代轉述）。",
      "住址僅有大進路口往溪邊第二排，未確認長者是否同意公開地址。",
    ],
    suggestedNextStep: "send_to_human_review",
    unsafeToActDirectly: true,
    humanReviewNote:
      "【操作非當事人，需人工確認】需要人工取得長者同意方能公開地址與聯絡電話，不可直接外流或派單。",
    locationArea: "大進路口",
    detailedCategory: "人力求助",
    requiredSkills: ["搬運工", "重體力活"],
  },
  "M-012": {
    messyRecordId: "M-012",
    possibleKind: "help_request_candidate",
    confidence: "low",
    evidence: ["外地家屬來電指稱親友可能需要藥品。"],
    blockers: [
      "家屬不在現場，無法聯絡到親友本人確認情況。",
      "親友確切位置不明。",
    ],
    suggestedNextStep: "ask_for_more_info",
    unsafeToActDirectly: true,
    humanReviewNote:
      "【無法直接轉任務】非當事人描述，資訊極為片面。不可直接當作救災任務，下一步需補充更確切之聯絡人電話與位置。",
    locationArea: "大進路附近",
    detailedCategory: "醫療物資需求",
    requiredSkills: ["送藥志工"],
  },
};
