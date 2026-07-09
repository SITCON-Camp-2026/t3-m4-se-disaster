import { useState } from "react";
import type {
  Phase0JudgementDraft,
  Phase0PossibleKind,
  Phase0Confidence,
  Phase0SuggestedNextStep,
} from "./phase0-types";

const kindLabels: Record<Phase0PossibleKind, string> = {
  help_request_candidate: "求助候選",
  site_status_candidate: "地點狀態候選",
  task_candidate: "任務候選",
  assignment_candidate: "人員指派候選",
  announcement_candidate: "公告候選",
  unknown: "候選類型待判斷",
};

const confidenceLabels: Record<Phase0Confidence, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const nextStepLabels: Record<Phase0SuggestedNextStep, string> = {
  keep_raw: "先保留原始資訊",
  ask_for_more_info: "補問來源或現場資訊",
  send_to_human_review: "交給人工確認",
  create_candidate_report: "建立候選通報",
  create_site_update_suggestion: "建立地點更新建議",
  do_not_use_yet: "暫時不要使用",
};

export function Phase0DraftEditor({
  draft,
  onSave,
  onDelete,
  onReset,
  onReAnalyze,
}: {
  draft: Phase0JudgementDraft;
  onSave: (draft: Phase0JudgementDraft) => void;
  onDelete: () => void;
  onReset: () => void;
  onReAnalyze?: () => void;
}) {
  const [possibleKind, setPossibleKind] = useState<Phase0PossibleKind>(
    draft.possibleKind,
  );
  const [confidence, setConfidence] = useState<Phase0Confidence>(
    draft.confidence,
  );
  const [suggestedNextStep, setSuggestedNextStep] =
    useState<Phase0SuggestedNextStep>(draft.suggestedNextStep);
  const [unsafeToActDirectly, setUnsafeToActDirectly] = useState<boolean>(
    draft.unsafeToActDirectly,
  );
  const [humanReviewNote, setHumanReviewNote] = useState<string>(
    draft.humanReviewNote ?? "",
  );
  const [evidence, setEvidence] = useState<string[]>(draft.evidence);
  const [blockers, setBlockers] = useState<string[]>(draft.blockers);

  // New extended analysis states
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    draft.requiredSkills ?? [],
  );
  const [locationArea, setLocationArea] = useState<string>(
    draft.locationArea ?? "",
  );
  const [detailedCategory, setDetailedCategory] = useState<string>(
    draft.detailedCategory ?? "",
  );

  const [newEvidence, setNewEvidence] = useState("");
  const [newBlocker, setNewBlocker] = useState("");
  const [newSkill, setNewSkill] = useState("");

  function handleSave() {
    onSave({
      messyRecordId: draft.messyRecordId,
      possibleKind,
      confidence,
      evidence,
      blockers,
      suggestedNextStep,
      unsafeToActDirectly,
      humanReviewNote,
      requiredSkills,
      locationArea,
      detailedCategory,
    });
  }

  function addEvidence() {
    if (newEvidence.trim()) {
      setEvidence((prev) => [...prev, newEvidence.trim()]);
      setNewEvidence("");
    }
  }

  function addBlocker() {
    if (newBlocker.trim()) {
      setBlockers((prev) => [...prev, newBlocker.trim()]);
      setNewBlocker("");
    }
  }

  function addSkill() {
    if (newSkill.trim()) {
      setRequiredSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  }

  function removeSkill(index: number) {
    setRequiredSkills((prev) => prev.filter((_, i) => i !== index));
  }

  function removeEvidence(index: number) {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
  }

  function removeBlocker(index: number) {
    setBlockers((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div
      className="judgement-card editor-mode"
      style={{ borderLeft: "4px solid #116b37" }}
    >
      <div className="judgement-card__header" style={{ marginBottom: "12px" }}>
        <div>
          <p className="eyebrow" style={{ color: "#116b37" }}>
            Draft Editor
          </p>
          <h3>編輯整理草稿 ({draft.messyRecordId})</h3>
        </div>
        <span
          className="status-badge"
          style={{ backgroundColor: "#dff7e8", color: "#116b37" }}
        >
          草稿中
        </span>
      </div>

      {/* Premium Analysis Meta Badges */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "16px",
          padding: "10px 14px",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          📍 <b>區域：</b> {locationArea || "未指定"}
        </span>
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginLeft: "12px",
          }}
        >
          🏷️ <b>分類：</b> {detailedCategory || "未指定"}
        </span>
        {requiredSkills.length > 0 && (
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginLeft: "12px",
            }}
          >
            🛠️ <b>職能：</b> {requiredSkills.join("、")}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gap: "16px", marginTop: "12px" }}>
        {/* Form Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "4px",
              }}
            >
              候選類型
            </label>
            <select
              value={possibleKind}
              onChange={(e) =>
                setPossibleKind(e.target.value as Phase0PossibleKind)
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cfd8e3",
                background: "white",
              }}
            >
              {Object.entries(kindLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "4px",
              }}
            >
              信心程度
            </label>
            <select
              value={confidence}
              onChange={(e) =>
                setConfidence(e.target.value as Phase0Confidence)
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cfd8e3",
                background: "white",
              }}
            >
              {Object.entries(confidenceLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "4px",
              }}
            >
              區域 (Location Area)
            </label>
            <input
              type="text"
              placeholder="例如：光復車站後方..."
              value={locationArea}
              onChange={(e) => setLocationArea(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cfd8e3",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "4px",
              }}
            >
              詳細分類 (Detailed Category)
            </label>
            <input
              type="text"
              placeholder="例如：人力需求、道路受阻..."
              value={detailedCategory}
              onChange={(e) => setDetailedCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cfd8e3",
              }}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "4px",
            }}
          >
            職能需求 (Required Skills)
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="例如：清泥、水電、物資搬運..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cfd8e3",
              }}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <button
              type="button"
              onClick={addSkill}
              style={{
                border: "1px solid #2563eb",
                color: "#2563eb",
                background: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              新增
            </button>
          </div>
          {requiredSkills.length === 0 ? (
            <p
              style={{ fontSize: "0.85rem", color: "#5f6b7a", margin: "4px 0" }}
            >
              無特定職能需求限制
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                margin: "4px 0",
              }}
            >
              {requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid rgba(37, 99, 235, 0.15)",
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#9f1f17",
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "4px",
            }}
          >
            下一步處理建議
          </label>
          <select
            value={suggestedNextStep}
            onChange={(e) =>
              setSuggestedNextStep(e.target.value as Phase0SuggestedNextStep)
            }
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #cfd8e3",
              background: "white",
            }}
          >
            {Object.entries(nextStepLabels).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 0",
          }}
        >
          <input
            id="unsafe-checkbox"
            type="checkbox"
            checked={unsafeToActDirectly}
            onChange={(e) => setUnsafeToActDirectly(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <label
            htmlFor="unsafe-checkbox"
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              color: unsafeToActDirectly ? "#9f1f17" : "#5f6b7a",
            }}
          >
            🚨 不可直接行動（安全警告）
          </label>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "4px",
            }}
          >
            判斷依據 (Evidence)
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="例如：貼文有明確的時間與地點說明..."
              value={newEvidence}
              onChange={(e) => setNewEvidence(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cfd8e3",
              }}
              onKeyDown={(e) => e.key === "Enter" && addEvidence()}
            />
            <button
              type="button"
              onClick={addEvidence}
              style={{
                border: "1px solid #116b37",
                color: "#116b37",
                background: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              新增
            </button>
          </div>
          {evidence.length === 0 ? (
            <p
              style={{ fontSize: "0.85rem", color: "#5f6b7a", margin: "4px 0" }}
            >
              暫無依據，請從原文中新增
            </p>
          ) : (
            <ul style={{ paddingLeft: "20px", margin: "4px 0" }}>
              {evidence.map((item, idx) => (
                <li
                  key={idx}
                  style={{ fontSize: "0.9rem", marginBottom: "4px" }}
                >
                  <span style={{ marginRight: "8px" }}>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeEvidence(idx)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#9f1f17",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    [移除]
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "4px",
            }}
          >
            阻礙點 (Blockers)
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="例如：地點模糊、非當事人回報、尚未證實..."
              value={newBlocker}
              onChange={(e) => setNewBlocker(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cfd8e3",
              }}
              onKeyDown={(e) => e.key === "Enter" && addBlocker()}
            />
            <button
              type="button"
              onClick={addBlocker}
              style={{
                border: "1px solid #116b37",
                color: "#116b37",
                background: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              新增
            </button>
          </div>
          {blockers.length === 0 ? (
            <p
              style={{ fontSize: "0.85rem", color: "#116b37", margin: "4px 0" }}
            >
              無阻礙點，可以直接進行下一步
            </p>
          ) : (
            <ul style={{ paddingLeft: "20px", margin: "4px 0" }}>
              {blockers.map((item, idx) => (
                <li
                  key={idx}
                  style={{ fontSize: "0.9rem", marginBottom: "4px" }}
                >
                  <span style={{ marginRight: "8px" }}>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeBlocker(idx)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#9f1f17",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    [移除]
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "4px",
            }}
          >
            人工審查與修正備註 (Human Review Note)
          </label>
          <textarea
            placeholder="請記錄你對此資訊的判斷、質疑，或是針對 AI 建議的修正說明..."
            value={humanReviewNote}
            onChange={(e) => setHumanReviewNote(e.target.value)}
            style={{
              width: "100%",
              minHeight: "60px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #cfd8e3",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          {onReAnalyze && (
            <button
              type="button"
              onClick={onReAnalyze}
              style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                border: "1px solid var(--primary)",
                padding: "10px 14px",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="使用 AI 重新智慧分析此原始資料"
            >
              🤖 AI 重新分析
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              backgroundColor: "#116b37",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            儲存草稿
          </button>
          <button
            type="button"
            onClick={onReset}
            style={{
              backgroundColor: "#e9eef5",
              color: "#344054",
              border: "1px solid #cfd8e3",
              padding: "10px 14px",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
            title="重設為 Starter 安全預設"
          >
            重置
          </button>
          <button
            type="button"
            onClick={onDelete}
            style={{
              backgroundColor: "#fde2e1",
              color: "#9f1f17",
              border: "1px solid #fde2e1",
              padding: "10px 14px",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
            title="刪除草稿，恢復安全預設"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  );
}
