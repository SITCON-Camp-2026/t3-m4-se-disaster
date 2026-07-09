import React, { useState, useEffect } from "react";
import type {
  Phase0MessyRecord,
  Phase0JudgementDraft,
} from "../phase-0/phase0-types";
import type { V1JudgementDraft, V1Status } from "./v1-types";

interface V1OrganizerViewProps {
  records: Phase0MessyRecord[];
  drafts: Record<string, V1JudgementDraft>;
  selectedRecordId: string;
  onSelectRecordId: (id: string) => void;
  onSaveDraft: (recordId: string, draft: V1JudgementDraft) => void;
  onSingleAI: (
    recordId: string,
    rawText: string,
  ) => Promise<Omit<Phase0JudgementDraft, "messyRecordId"> | undefined>;
  onBack: () => void;
  isAiLoading: boolean;
}

type FilterStatus = "all" | V1Status;

export function V1OrganizerView({
  records,
  drafts,
  selectedRecordId,
  onSelectRecordId,
  onSaveDraft,
  onSingleAI,
  onBack,
  isAiLoading,
}: V1OrganizerViewProps) {
  // Staff authentication state
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);
  const [staffPassword, setStaffPassword] = useState("");

  // Filter tabs state
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle staff login
  function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    if (staffPassword.toUpperCase() === "STAFF2026") {
      setIsStaffAuthenticated(true);
      setStaffPassword("");
      alert("🔓 整理人員身分驗證成功！工作台已解鎖。");
    } else {
      alert("❌ 密碼錯誤！請輸入應變中心核可整理員金鑰 (STAFF2026)。");
    }
  }

  // Filter records based on selected tab filter and search query
  const filteredRecords = records.filter((r) => {
    const draft = drafts[r.id];
    const status = draft?.status ?? "unorganized";
    const matchesStatus = filter === "all" ? true : status === filter;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (draft?.locationArea &&
            draft.locationArea
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (draft?.detailedCategory &&
            draft.detailedCategory
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Find current record from filtered list, fallback to first in filtered
  const currentRecord =
    filteredRecords.find((r) => r.id === selectedRecordId) ||
    filteredRecords[0];

  function getListHeader() {
    switch (filter) {
      case "all":
        return `📋 全部通報清單 (${filteredRecords.length})`;
      case "unorganized":
        return `📥 未整理原始通報 (${filteredRecords.length})`;
      case "organizing":
        return `⚡ 整理中通報清單 (${filteredRecords.length})`;
      case "unverified_draft":
        return `⏳ 待核查草稿清單 (${filteredRecords.length})`;
      case "verified_actionable":
        return `✅ 已發布安全任務 (${filteredRecords.length})`;
      case "rejected":
        return `❌ 已拒絕/流言存檔 (${filteredRecords.length})`;
      case "archived_expired":
        return `👵 已過期結案通報 (${filteredRecords.length})`;
      default:
        return `📋 通報清單 (${filteredRecords.length})`;
    }
  }

  function getStatusBadge(status: V1Status) {
    switch (status) {
      case "unorganized":
        return <span className="badge badge-unorganized">📥 未整理</span>;
      case "organizing":
        return <span className="badge badge-organizing">⚡ 整理中</span>;
      case "unverified_draft":
        return <span className="badge badge-draft">⏳ 待核查草稿</span>;
      case "verified_actionable":
        return <span className="badge badge-actionable">✅ 已發布任務</span>;
      case "rejected":
        return <span className="badge badge-rejected">❌ 已拒絕/無效</span>;
      case "archived_expired":
        return <span className="badge badge-expired">👵 已過期/結案</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  }

  // Render Authentication overlay if not logged in
  if (!isStaffAuthenticated) {
    return (
      <div
        className="v1-organizer-view"
        style={{ maxWidth: "500px", margin: "40px auto" }}
      >
        <div className="v1-view-header" style={{ textAlign: "center" }}>
          <button type="button" className="btn-back" onClick={onBack}>
            ← 返回首頁
          </button>
          <h3>🔒 資訊整理工作台（限核可人員）</h3>
          <p className="v1-view-sub">
            本工作台涉及原始災情核實、衝突協商與敏感個資管理，請輸入金鑰登入。
          </p>
        </div>

        <form
          onSubmit={handleStaffLogin}
          className="v1-reporter-form"
          style={{ marginTop: "24px" }}
        >
          <div className="form-group">
            <label htmlFor="staffPassword">應變中心整理員金鑰</label>
            <input
              id="staffPassword"
              type="password"
              placeholder="請輸入核可口令 (例如：STAFF2026)"
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="btn-submit-report"
            style={{ background: "#10b981" }}
          >
            🔑 解鎖工作台
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="v1-organizer-view">
      <div
        className="v1-view-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <button type="button" className="btn-back" onClick={onBack}>
            ← 返回首頁
          </button>
          <h3>📥 災害資訊整理工作台 (整理者端)</h3>
          <p className="v1-view-sub">
            在此審核原始資訊、過濾 AI 建議、添加人工備註並保護隱私。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsStaffAuthenticated(false)}
          style={{
            background: "#475569",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "0.82rem",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "12px",
          }}
        >
          🔒 鎖定工作台
        </button>
      </div>

      {/* Filter tabs */}
      <div
        className="v1-filter-tabs"
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        {(
          [
            "all",
            "unorganized",
            "organizing",
            "unverified_draft",
            "verified_actionable",
            "rejected",
            "archived_expired",
          ] as FilterStatus[]
        ).map((tabKey) => {
          const count = records.filter((r) => {
            const status = drafts[r.id]?.status ?? "unorganized";
            return tabKey === "all" ? true : status === tabKey;
          }).length;

          let label = "全部";
          if (tabKey === "unorganized") label = "📥 未整理";
          if (tabKey === "organizing") label = "⚡ 整理中";
          if (tabKey === "unverified_draft") label = "⏳ 待核查";
          if (tabKey === "verified_actionable") label = "✅ 已發布";
          if (tabKey === "rejected") label = "❌ 已拒絕";
          if (tabKey === "archived_expired") label = "👵 已過期";

          const isActive = filter === tabKey;

          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setFilter(tabKey)}
              style={{
                background: isActive ? "#3b82f6" : "white",
                color: isActive ? "white" : "#475569",
                border: "1px solid var(--border)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="v1-organizer-layout">
        {/* Left Column: Messy Reports List */}
        <div className="v1-sidebar-list">
          <h4>{getListHeader()}</h4>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="🔍 搜尋編號、地址或關鍵字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {filteredRecords.length === 0 ? (
            <div
              className="v1-no-tasks"
              style={{ padding: "20px 10px", fontSize: "0.88rem" }}
            >
              ☕ 該篩選條件下無符合的資料通報。
            </div>
          ) : (
            <div className="v1-list-container">
              {filteredRecords.map((r) => {
                const draft = drafts[r.id];
                const status = draft?.status ?? "unorganized";
                const isSelected = r.id === (currentRecord?.id ?? "");
                const eyewitness =
                  draft?.eyewitnessType === "second_hand"
                    ? "💬 轉述"
                    : "👀 第一手";
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`v1-list-card ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelectRecordId(r.id)}
                  >
                    <div className="card-header-row">
                      <span className="card-id">{r.id}</span>
                      {getStatusBadge(status)}
                    </div>
                    <p className="card-raw-snippet">
                      {r.rawText.substring(0, 45)}...
                    </p>
                    <div className="card-footer-row">
                      <span className="card-source">
                        來源：{r.sourceType} ({eyewitness})
                      </span>
                      <span className="card-time">{r.updatedAt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Editor Panel with unique key to force remount on selection change */}
        {currentRecord ? (
          <V1OrganizerEditor
            key={currentRecord.id}
            record={currentRecord}
            records={records}
            drafts={drafts}
            onSaveDraft={onSaveDraft}
            onSingleAI={onSingleAI}
            isAiLoading={isAiLoading}
            getStatusBadge={getStatusBadge}
          />
        ) : (
          <div className="v1-editor-empty">請點選左側通報以進行審核整理</div>
        )}
      </div>
    </div>
  );
}

// Inner Editor component to leverage key-remount state reset
interface V1OrganizerEditorProps {
  record: Phase0MessyRecord;
  records: Phase0MessyRecord[];
  drafts: Record<string, V1JudgementDraft>;
  onSaveDraft: (recordId: string, draft: V1JudgementDraft) => void;
  onSingleAI: (
    recordId: string,
    rawText: string,
  ) => Promise<Omit<Phase0JudgementDraft, "messyRecordId"> | undefined>;
  isAiLoading: boolean;
  getStatusBadge: (status: V1Status) => React.ReactNode;
}

function V1OrganizerEditor({
  record,
  records,
  drafts,
  onSaveDraft,
  onSingleAI,
  isAiLoading,
  getStatusBadge,
}: V1OrganizerEditorProps) {
  const currentDraft = drafts[record.id] || {
    messyRecordId: record.id,
    status: "unorganized" as V1Status,
    possibleKind: "unknown",
    confidence: "low",
    evidence: [],
    blockers: [],
    suggestedNextStep: "keep_raw",
    unsafeToActDirectly: true,
    humanReviewNote: "",
    confirmedFields: [],
    isPrivacySensitive: false,
  };

  // Local form states (initially matches currentDraft)
  const [possibleKind, setPossibleKind] = useState(currentDraft.possibleKind);
  const [confidence, setConfidence] = useState(currentDraft.confidence);
  const [humanReviewNote, setHumanReviewNote] = useState(
    currentDraft.humanReviewNote ?? "",
  );
  const [locationArea, setLocationArea] = useState(
    currentDraft.locationArea ?? "",
  );
  const [detailedCategory, setDetailedCategory] = useState(
    currentDraft.detailedCategory ?? "",
  );
  const [isPrivacySensitive, setIsPrivacySensitive] = useState(
    !!currentDraft.isPrivacySensitive,
  );
  const [confirmedFields, setConfirmedFields] = useState<string[]>(
    currentDraft.confirmedFields ?? [],
  );

  // Safe checks & conflict authorization
  const [isConflictChecked, setIsConflictChecked] = useState(false);

  // Check if current task is archived/expired
  const isExpiredArchive = currentDraft.status === "archived_expired";

  // Sync draft status to organizing on mount if it was unorganized
  useEffect(() => {
    if (currentDraft.status === "unorganized") {
      onSaveDraft(record.id, {
        ...currentDraft,
        status: "organizing",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id]);

  // Derived state: Intelligent Conflict Detection
  const text = record.rawText;
  const microLocations = [
    "側門",
    "老街",
    "活動中心",
    "大進路",
    "溪畔",
    "操場",
    "後門",
    "門口",
  ];
  const conflictPairs = [
    ["淹水", "退水"],
    ["淹水", "水退"],
    ["淹水", "退了"],
    ["積水", "退了"],
    ["積水", "乾了"],
    ["封路", "開通"],
    ["封路", "搶通"],
    ["封路", "通行"],
    ["封鎖", "開放"],
    ["缺", "送達"],
    ["缺", "收到"],
    ["缺", "不缺"],
    ["需要", "有餘"],
  ];

  // Find micro locations in current text
  const currentLocations = microLocations.filter((loc) => text.includes(loc));

  // Find truly conflicting records
  const conflictingRecords =
    currentLocations.length > 0
      ? records.filter((r) => {
          if (r.id === record.id) return false;

          // 1. Must share at least one micro location
          const hasSharedLocation = currentLocations.some((loc) =>
            r.rawText.includes(loc),
          );
          if (!hasSharedLocation) return false;

          // 2. Must contain contradictory state pairs
          const hasContradiction = conflictPairs.some(([stateA, stateB]) => {
            return (
              (text.includes(stateA) && r.rawText.includes(stateB)) ||
              (text.includes(stateB) && r.rawText.includes(stateA))
            );
          });

          return hasContradiction;
        })
      : [];

  const conflictAlert =
    conflictingRecords.length > 0
      ? `⚠️ 衝突偵測：發現與相關通報 ${conflictingRecords.map((r) => r.id).join(", ")} 存在相同地點但【描述狀態矛盾】（地標：${currentLocations.join("、")}）。請整理人員務必人工核對，禁止盲目發布！`
      : "";

  // Handle manual field confirmation
  function toggleConfirmField(fieldName: string) {
    setConfirmedFields((prev) =>
      prev.includes(fieldName)
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName],
    );
  }

  // Safe field changes
  function handleFieldChange<T>(
    fieldName: string,
    value: T,
    setter: (val: T) => void,
  ) {
    if (isExpiredArchive) return; // Prevent edits if expired read-only
    setter(value);
    if (!confirmedFields.includes(fieldName)) {
      setConfirmedFields((prev) => [...prev, fieldName]);
    }
  }

  // Handle AI analysis
  async function triggerAIAnalysis() {
    const result = await onSingleAI(record.id, record.rawText);
    if (result) {
      setPossibleKind(result.possibleKind);
      setConfidence(result.confidence);
      setHumanReviewNote(result.humanReviewNote ?? "");
      setLocationArea(result.locationArea ?? "");
      setDetailedCategory(result.detailedCategory ?? "");
      setIsPrivacySensitive(
        !!(result as Record<string, unknown>).isPrivacySensitive,
      );
      setConfirmedFields([]);
    } else {
      setConfirmedFields([]);
    }
  }

  // Handle unlock for expired drafts
  function handleUnlockExpired() {
    const updated: V1JudgementDraft = {
      ...currentDraft,
      status: "organizing",
      expiredFeedback: currentDraft.expiredFeedback, // Retain original expired feedback for record auditing
    };
    onSaveDraft(record.id, updated);
    alert(
      "🔓 任務唯讀鎖定已解除！該任務已重置為「整理中」，您可以重新編輯並發布。",
    );
  }

  // Handle Save draft (unverified)
  function handleSave(status: V1Status) {
    if (status === "verified_actionable" && !humanReviewNote.trim()) {
      alert(
        "⚠️ 請先輸入『人工審查備註/判斷理由』，以保證發布的任務具備人工把關紀錄！",
      );
      return;
    }

    if (
      status === "verified_actionable" &&
      conflictingRecords.length > 0 &&
      !isConflictChecked
    ) {
      alert(
        "⚠️ 本通報地區存在潛在衝突，請先在下方勾選「我已人工聯絡核實衝突，確認非重複或衝突事件」後，方可發布！",
      );
      return;
    }

    // Force confirm check if AI was called to prevent unverified brain-farts from publishing
    if (status === "verified_actionable" && currentDraft.hasAiSuggestions) {
      const unconfirmed = [];
      if (!confirmedFields.includes("possibleKind"))
        unconfirmed.push("可能任務類型");
      if (!confirmedFields.includes("confidence"))
        unconfirmed.push("資訊可信度評估");
      if (!confirmedFields.includes("locationArea"))
        unconfirmed.push("可能受災區域");
      if (!confirmedFields.includes("detailedCategory"))
        unconfirmed.push("細部分類");

      if (unconfirmed.length > 0) {
        alert(
          `⚠️ 為了防止 AI 腦補資訊被盲目發布，請先核實並點擊採納（或修改）以下 AI 建議欄位（黃色虛線框提示）：\n- ${unconfirmed.join(
            "\n- ",
          )}`,
        );
        return;
      }
    }

    const updated: V1JudgementDraft = {
      ...currentDraft,
      possibleKind,
      confidence,
      suggestedNextStep: currentDraft.suggestedNextStep,
      unsafeToActDirectly: currentDraft.unsafeToActDirectly,
      humanReviewNote,
      locationArea,
      detailedCategory,
      isPrivacySensitive,
      confirmedFields,
      status,
    };
    onSaveDraft(record.id, updated);
    alert(
      status === "verified_actionable"
        ? `🎉 任務已成功發布！狀態變更為「已查實任務」，已顯示在前線行動者看板中。`
        : status === "rejected"
          ? `已將該通報拒絕並歸檔。`
          : `草稿已儲存為待核查狀態。`,
    );
  }

  return (
    <div className="v1-editor-panel">
      {isExpiredArchive && (
        <div
          style={{
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            padding: "16px",
            borderRadius: "12px",
            color: "#374151",
            fontSize: "0.92rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            👵{" "}
            <strong>本通報任務已由前線志工標記為過期/已失效而結案下架。</strong>
            草稿已鎖定為唯讀狀態。
          </span>
          <button
            type="button"
            onClick={handleUnlockExpired}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔓 解鎖重新整理
          </button>
        </div>
      )}

      {conflictAlert && (
        <div
          className="conflict-alert-banner"
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <div>{conflictAlert}</div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "4px",
              flexWrap: "wrap",
            }}
          >
            {conflictingRecords.map((cr) => {
              const crDraft = drafts[cr.id];
              return (
                <div
                  key={cr.id}
                  style={{
                    flex: "1",
                    minWidth: "260px",
                    background: "white",
                    border: "1px solid #fee2e2",
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "0.82rem",
                    color: "#7f1d1d",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <strong>📄 相關通報 {cr.id}</strong>
                  <p
                    style={{
                      margin: "6px 0",
                      color: "#475569",
                      lineHeight: 1.4,
                    }}
                  >
                    {cr.rawText}
                  </p>
                  {crDraft?.humanReviewNote && (
                    <div
                      style={{
                        borderTop: "1px dashed #fee2e2",
                        paddingTop: "6px",
                        marginTop: "6px",
                      }}
                    >
                      <strong>🕵️ 整理員備註：</strong>
                      <span style={{ color: "#0f172a" }}>
                        {crDraft.humanReviewNote}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="editor-section raw-info-section">
        <h4>💬 原始通報內容</h4>
        <div className="raw-text-box">
          <p>{record.rawText}</p>
          <div className="raw-meta-tags">
            <span>
              <strong>來源管道：</strong>
              {record.sourceType}
            </span>
            <span>
              <strong>目擊類型：</strong>
              {currentDraft.eyewitnessType === "second_hand"
                ? "💬 聽人轉述 / 網路流言"
                : "👀 第一手親眼目睹"}
            </span>
            {currentDraft.reporterPhone && (
              <span>
                <strong>聯絡電話：</strong>
                {currentDraft.reporterPhone}
              </span>
            )}
            <span>
              <strong>時效狀態：</strong>
              {getStatusBadge(currentDraft.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="editor-section ai-control-section">
        <div className="ai-trigger-header">
          <h4>🤖 AI 智慧輔助標記</h4>
          <button
            type="button"
            className="btn-ai-trigger"
            onClick={triggerAIAnalysis}
            disabled={isAiLoading || isExpiredArchive}
          >
            {isAiLoading ? "⏳ 正在智慧分析..." : "⚡ 呼叫 AI 生成建議欄位"}
          </button>
        </div>
        <p className="ai-notice-sub">
          請注意：AI 的分析僅供參考（會有腦補與誤判風險）。AI
          填入的欄位將以黃色虛線框警示，您必須逐一進行確認。
        </p>
      </div>

      <div className="editor-section form-fields-section">
        <h4>🛠️ 草稿整理與人工核實</h4>

        <div className="form-grid">
          {/* possibleKind with AI Confirm */}
          <div
            className={`form-group field-wrap ${
              !confirmedFields.includes("possibleKind")
                ? "ai-suggested-pulse"
                : ""
            }`}
          >
            <label htmlFor="possibleKind">
              可能任務類型{" "}
              {!confirmedFields.includes("possibleKind") && (
                <span className="ai-tag">🤖 AI 推估</span>
              )}
            </label>
            <div className="input-confirm-row">
              <select
                id="possibleKind"
                value={possibleKind}
                disabled={isExpiredArchive}
                onChange={(e) =>
                  handleFieldChange(
                    "possibleKind",
                    e.target.value as typeof possibleKind,
                    setPossibleKind,
                  )
                }
              >
                <option value="unknown">未知 / 需進一步查證</option>
                <option value="help_request_candidate">
                  求助候選 (有明確受災對象)
                </option>
                <option value="site_status_candidate">
                  地點狀態候選 (積水、路封、物資點)
                </option>
                <option value="task_candidate">
                  任務候選 (需志工前往現場)
                </option>
                <option value="announcement_candidate">官方公告候選</option>
              </select>
              {!confirmedFields.includes("possibleKind") &&
                !isExpiredArchive && (
                  <button
                    type="button"
                    className="btn-confirm-field"
                    onClick={() => toggleConfirmField("possibleKind")}
                  >
                    ✔️ 採納
                  </button>
                )}
            </div>
          </div>

          {/* confidence with AI Confirm */}
          <div
            className={`form-group field-wrap ${
              !confirmedFields.includes("confidence")
                ? "ai-suggested-pulse"
                : ""
            }`}
          >
            <label htmlFor="confidence">
              資訊可信度評估{" "}
              {!confirmedFields.includes("confidence") && (
                <span className="ai-tag">🤖 AI 推估</span>
              )}
            </label>
            <div className="input-confirm-row">
              <select
                id="confidence"
                value={confidence}
                disabled={isExpiredArchive}
                onChange={(e) =>
                  handleFieldChange(
                    "confidence",
                    e.target.value as typeof confidence,
                    setConfidence,
                  )
                }
              >
                <option value="low">低 (流言/無時戳/代轉述且模糊)</option>
                <option value="medium">中 (有具體人名/電話，或半信半疑)</option>
                <option value="high">高 (第一手現場確認且明確時戳)</option>
              </select>
              {!confirmedFields.includes("confidence") && !isExpiredArchive && (
                <button
                  type="button"
                  className="btn-confirm-field"
                  onClick={() => toggleConfirmField("confidence")}
                >
                  ✔️ 採納
                </button>
              )}
            </div>
          </div>

          {/* locationArea with AI Confirm */}
          <div
            className={`form-group field-wrap ${
              !confirmedFields.includes("locationArea")
                ? "ai-suggested-pulse"
                : ""
            }`}
          >
            <label htmlFor="locationArea">
              可能受災區域 / 概略地址{" "}
              {!confirmedFields.includes("locationArea") && (
                <span className="ai-tag">🤖 AI 推估</span>
              )}
            </label>
            <div className="input-confirm-row">
              <input
                id="locationArea"
                type="text"
                disabled={isExpiredArchive}
                placeholder="例如：大進路二段附近"
                value={locationArea}
                onChange={(e) =>
                  handleFieldChange(
                    "locationArea",
                    e.target.value,
                    setLocationArea,
                  )
                }
              />
              {!confirmedFields.includes("locationArea") &&
                !isExpiredArchive && (
                  <button
                    type="button"
                    className="btn-confirm-field"
                    onClick={() => toggleConfirmField("locationArea")}
                  >
                    ✔️ 採納
                  </button>
                )}
            </div>
          </div>

          {/* detailedCategory with AI Confirm */}
          <div
            className={`form-group field-wrap ${
              !confirmedFields.includes("detailedCategory")
                ? "ai-suggested-pulse"
                : ""
            }`}
          >
            <label htmlFor="detailedCategory">
              細部分類 / 所需技能{" "}
              {!confirmedFields.includes("detailedCategory") && (
                <span className="ai-tag">🤖 AI 推估</span>
              )}
            </label>
            <div className="input-confirm-row">
              <input
                id="detailedCategory"
                type="text"
                disabled={isExpiredArchive}
                placeholder="例如：重物搬運、清淤、物資分配"
                value={detailedCategory}
                onChange={(e) =>
                  handleFieldChange(
                    "detailedCategory",
                    e.target.value,
                    setDetailedCategory,
                  )
                }
              />
              {!confirmedFields.includes("detailedCategory") &&
                !isExpiredArchive && (
                  <button
                    type="button"
                    className="btn-confirm-field"
                    onClick={() => toggleConfirmField("detailedCategory")}
                  >
                    ✔️ 採納
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* isPrivacySensitive Checkbox */}
        <div className="form-group checkbox-group-wrap">
          <label className="checkbox-label-v1">
            <input
              type="checkbox"
              disabled={isExpiredArchive}
              checked={isPrivacySensitive}
              onChange={(e) => setIsPrivacySensitive(e.target.checked)}
            />
            🔒 <strong>啟用敏感個資模糊化保護</strong>{" "}
            (當原文中含有非當事人同意公開之精確地址或電話號碼時，請務必勾選此項。系統將在前線行動端自動遮蔽精確位置與電話，避免隱私外洩風險。)
          </label>
        </div>

        {/* humanReviewNote (Human Input) */}
        <div className="form-group">
          <label htmlFor="humanReviewNote">
            人工審查備註 / 判斷理由 <span className="req">*</span>
          </label>
          <textarea
            id="humanReviewNote"
            rows={3}
            disabled={isExpiredArchive}
            placeholder="請在此輸入您打電話查實的過程，或者為何做此決策的判斷理由（例如：14:20 電聯當事人阿嬤的家屬，確認水已退但長輩行動不便，側門淹水已退。家屬同意發布求助，開啟隱私遮蔽保護。）"
            value={humanReviewNote}
            onChange={(e) =>
              handleFieldChange(
                "humanReviewNote",
                e.target.value,
                setHumanReviewNote,
              )
            }
            required
          />
        </div>
      </div>

      {/* Expired Feedbacks Archive section */}
      {currentDraft.expiredFeedback && (
        <div className="editor-section expired-feedback-section">
          <h4>👵 現場回報之失效說明 (過期存檔)</h4>
          <div className="expired-feedback-box">
            <p>
              <strong>前線行動志工反饋：</strong>
              {currentDraft.expiredFeedback}
            </p>
          </div>
        </div>
      )}

      {/* Conflict commitment checkbox to unlock publish button */}
      {conflictAlert && !isExpiredArchive && (
        <div
          className="form-group checkbox-group-wrap"
          style={{ background: "#fff5f5", border: "1px solid #feb2b2" }}
        >
          <label className="checkbox-label-v1" style={{ color: "#991b1b" }}>
            <input
              type="checkbox"
              checked={isConflictChecked}
              onChange={(e) => setIsConflictChecked(e.target.checked)}
            />
            ⚠️ <strong>我確認已進行人工排查衝突</strong>
            （我已核對相關通報，確認此為獨立事件而非重複回報，並已在「人工審查備註」中記錄判斷理由。解鎖發布按鈕。）
          </label>
        </div>
      )}

      {/* Action buttons */}
      <div className="editor-actions">
        <button
          type="button"
          className="btn-action btn-save-draft"
          disabled={isExpiredArchive}
          onClick={() => handleSave("unverified_draft")}
        >
          💾 儲存為待核查草稿
        </button>
        <button
          type="button"
          className="btn-action btn-reject-report"
          disabled={isExpiredArchive}
          onClick={() => handleSave("rejected")}
        >
          ❌ 標記為流言 / 拒絕通報
        </button>
        <button
          type="button"
          className="btn-action btn-publish-task"
          disabled={
            isExpiredArchive ||
            (conflictingRecords.length > 0 && !isConflictChecked)
          }
          onClick={() => handleSave("verified_actionable")}
          style={{
            opacity:
              isExpiredArchive ||
              (conflictingRecords.length > 0 && !isConflictChecked)
                ? 0.5
                : 1,
            cursor:
              isExpiredArchive ||
              (conflictingRecords.length > 0 && !isConflictChecked)
                ? "not-allowed"
                : "pointer",
          }}
        >
          🚀 核查無誤 - 發布為行動任務
        </button>
      </div>
    </div>
  );
}
