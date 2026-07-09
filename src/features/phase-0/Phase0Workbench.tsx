import { RecordCard } from "../../components/RecordCard";
import { StatusBadge } from "../../components/StatusBadge";
import { Phase0JudgementCard } from "./Phase0JudgementCard";
import { Phase0DraftEditor } from "./Phase0DraftEditor";
import { createPhase0Judgement } from "./phase0-heuristics";
import type { Phase0MessyRecord, Phase0JudgementDraft } from "./phase0-types";

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
  drafts,
  onSaveDraft,
  onDeleteDraft,
  onResetDraft,
  onSingleAI,
  onBatchAI,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
  drafts: Record<string, Phase0JudgementDraft>;
  onSaveDraft: (recordId: string, draft: Phase0JudgementDraft) => void;
  onDeleteDraft: (recordId: string) => void;
  onResetDraft: (recordId: string) => void;
  onSingleAI: (recordId: string, rawText: string) => void;
  onBatchAI: () => void;
}) {
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];
  const currentDraft = drafts[selectedRecord.id];
  const safetyBoundary = createPhase0Judgement(selectedRecord);

  function handleCreateDraft() {
    onSaveDraft(selectedRecord.id, safetyBoundary);
  }

  // Count drafts that have been edited/tried
  const draftCount = Object.keys(drafts).length;

  return (
    <div className="workbench">
      <div className="workbench__intro">
        <p className="eyebrow">整理工作台</p>
        <h2>第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。</h2>
        <p>
          這裡提供安全邊界與草稿編輯器。真正的候選判斷已由小組和 coding agent
          建立並可隨時進行編輯；這不是 runtime LLM 分析，也不是正式資料模型。
        </p>
      </div>

      <div className="workbench__layout">
        <aside className="workbench__queue" aria-label="選擇原始資訊">
          <button
            type="button"
            onClick={onBatchAI}
            style={{
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 4px 12px var(--primary-glow)",
              marginBottom: "8px",
              width: "100%",
            }}
            title="自動使用 AI 智慧整理所有尚未分析的原始回報"
          >
            ⚡ 批次 AI 自動分析
          </button>
          {records.map((record) => {
            const hasDraft = !!drafts[record.id];
            return (
              <button
                className={record.id === selectedRecord.id ? "active" : ""}
                key={record.id}
                type="button"
                onClick={() => onSelect(record.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    gap: "8px",
                  }}
                >
                  <span>{record.id}</span>
                  {hasDraft && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        backgroundColor: "#dff7e8",
                        color: "#116b37",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      已整理
                    </span>
                  )}
                </div>
                <StatusBadge status={record.verificationStatus} />
              </button>
            );
          })}
        </aside>

        <div className="workbench__main">
          <RecordCard record={selectedRecord} />

          {currentDraft ? (
            <Phase0DraftEditor
              key={currentDraft.messyRecordId}
              draft={currentDraft}
              onSave={(d) => onSaveDraft(selectedRecord.id, d)}
              onDelete={() => onDeleteDraft(selectedRecord.id)}
              onReset={() => onResetDraft(selectedRecord.id)}
              onReAnalyze={() =>
                onSingleAI(selectedRecord.id, selectedRecord.rawText)
              }
            />
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                  gap: "10px",
                }}
              >
                <span style={{ color: "#8a5a00", fontWeight: "bold" }}>
                  ⚠️ 本筆資料尚未建立整理草稿
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() =>
                      onSingleAI(selectedRecord.id, selectedRecord.rawText)
                    }
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ✨ AI 智慧分析
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateDraft}
                    style={{
                      backgroundColor: "#116b37",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    建立整理草稿
                  </button>
                </div>
              </div>
              <Phase0JudgementCard
                judgement={safetyBoundary}
                record={selectedRecord}
              />
            </div>
          )}
        </div>

        <aside className="workbench__checklist">
          <h3>第一階段完成檢查</h3>
          <ul style={{ paddingLeft: "16px", margin: "8px 0" }}>
            <li
              style={{
                color: "#116b37",
                fontWeight: "bold",
                listStyleType: "none",
                marginBottom: "6px",
              }}
            >
              ✓ Starter 已載入 {records.length} 筆原始資訊
            </li>
            <li
              style={{
                color: "#116b37",
                fontWeight: "bold",
                listStyleType: "none",
                marginBottom: "6px",
              }}
            >
              ✓ 支援草稿建立、編輯、刪除與重設
            </li>
            <li
              style={{
                color: draftCount >= 6 ? "#116b37" : "inherit",
                fontWeight: draftCount >= 6 ? "bold" : "normal",
                listStyleType: "none",
                marginBottom: "6px",
              }}
            >
              {draftCount >= 6 ? "✓" : "☐"} 已嘗試整理 {draftCount} 筆草稿 (目標
              6 筆)
            </li>
            <li
              style={{
                color: "#116b37",
                fontWeight: "bold",
                listStyleType: "none",
                marginBottom: "6px",
              }}
            >
              ✓ 至少 1 筆高品質候選 (M-010)
            </li>
            <li
              style={{
                color: "#116b37",
                fontWeight: "bold",
                listStyleType: "none",
                marginBottom: "6px",
              }}
            >
              ✓ 至少 1 筆非當事人需人工確認 (M-011)
            </li>
            <li
              style={{
                color: "#116b37",
                fontWeight: "bold",
                listStyleType: "none",
                marginBottom: "6px",
              }}
            >
              ✓ 至少 3 筆不能轉任務的資料 (M-002, M-003, M-012)
            </li>
            <li
              style={{
                color: "#116b37",
                fontWeight: "bold",
                listStyleType: "none",
                marginBottom: "6px",
              }}
            >
              ✓ 至少 2 筆人類質疑 Agent 修正 (M-004, M-005)
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
