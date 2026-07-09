import React, { useState } from "react";
import type { Phase0MessyRecord } from "../phase-0/phase0-types";
import type { V1JudgementDraft } from "./v1-types";

interface V1ActorViewProps {
  records: Phase0MessyRecord[];
  drafts: Record<string, V1JudgementDraft>;
  onSaveDraft: (recordId: string, draft: V1JudgementDraft) => void;
  onBack: () => void;
}

export function V1ActorView({
  records,
  drafts,
  onSaveDraft,
  onBack,
}: V1ActorViewProps) {
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredReason, setExpiredReason] = useState("");

  // Volunteer authorization state (prefixed to decisions.md rule)
  const [isAuthorizedVolunteer, setIsAuthorizedVolunteer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState("");

  // Individual card data unmasking confirmation states
  const [unmaskedRecords, setUnmaskedRecords] = useState<
    Record<string, boolean>
  >({});
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [recordToUnmask, setRecordToUnmask] = useState("");

  // Filter tasks that are verified and actionable
  const actionableTasks = records.filter((r) => {
    const draft = drafts[r.id];
    return draft && draft.status === "verified_actionable";
  });

  const selectedRecord = records.find((r) => r.id === selectedRecordId);
  const selectedDraft = selectedRecord ? drafts[selectedRecord.id] : null;

  // Masking utilities
  function maskPhone(phone?: string) {
    if (!phone) return "";
    const cleaned = phone.replace(/[-\s]/g, "");
    if (cleaned.length >= 8) {
      return `${phone.substring(0, 4)}-***-${phone.substring(phone.length - 3)}`;
    }
    return "****-****";
  }

  function maskLocation(location?: string) {
    if (!location) return "現場附近 (精確位置已模糊保護)";
    if (location.length > 5) {
      return `${location.substring(0, 4)}... 附近 (精確位置已模糊保護)`;
    }
    return `${location} 附近 (精確位置已模糊保護)`;
  }

  // Handle volunteer login
  function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    if (authPassword.toUpperCase() === "VOLUNTEER") {
      setIsAuthorizedVolunteer(true);
      setShowAuthModal(false);
      setAuthPassword("");
      alert(
        "🔓 志工身分驗證成功！您現在已具備查看精確個資與現場過期下架任務的權限。",
      );
    } else {
      alert("❌ 密碼錯誤！請輸入 decisions 決策約定口令 (VOLUNTEER)。");
    }
  }

  // Handle individual unmask confirm
  function confirmUnmask() {
    if (recordToUnmask) {
      setUnmaskedRecords((prev) => ({ ...prev, [recordToUnmask]: true }));
      setShowUnmaskModal(false);
      setRecordToUnmask("");
    }
  }

  // Handle report expired
  function handleReportExpired(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRecord || !selectedDraft) return;
    if (!expiredReason.trim()) {
      alert("請輸入現場實況原因！");
      return;
    }

    const updated: V1JudgementDraft = {
      ...selectedDraft,
      status: "archived_expired",
      expiredFeedback: expiredReason,
    };
    onSaveDraft(selectedRecord.id, updated);
    setShowExpiredModal(false);
    setExpiredReason("");
    setSelectedRecordId("");
    alert("⚠️ 感謝您的回報！該任務已成功宣告過期下架，防止其他志工重置白跑。");
  }

  // Utility to determine card border and background color based on type
  function getCardStyle(possibleKind?: string, isSelected?: boolean) {
    const baseStyle = {
      borderLeft: "6px solid #cbd5e1",
      background: isSelected ? "#f1f5f9" : "#f8fafc",
    };

    if (possibleKind === "help_request_candidate") {
      baseStyle.borderLeft = "6px solid #ef4444"; // Red for Help requests
      baseStyle.background = isSelected ? "#fee2e2" : "#fff5f5";
    } else if (possibleKind === "site_status_candidate") {
      baseStyle.borderLeft = "6px solid #3b82f6"; // Blue for site status
      baseStyle.background = isSelected ? "#dbeafe" : "#eff6ff";
    } else if (possibleKind === "task_candidate") {
      baseStyle.borderLeft = "6px solid #10b981"; // Green for volunteer tasks
      baseStyle.background = isSelected ? "#d1fae5" : "#ecfdf5";
    }

    return baseStyle;
  }

  return (
    <div className="v1-actor-view">
      {/* Volunteer Status Bar Header */}
      <div
        className="v1-volunteer-auth-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: isAuthorizedVolunteer ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${isAuthorizedVolunteer ? "#a7f3d0" : "#fecaca"}`,
          borderRadius: "12px",
          padding: "12px 20px",
          marginBottom: "20px",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: isAuthorizedVolunteer ? "#065f46" : "#991b1b",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <span>
          {isAuthorizedVolunteer
            ? "🔓 志工授權模式（已解鎖現場實況回報與敏感資料查詢權限）"
            : "🔒 訪客唯讀模式（敏感個資已遮蔽，無法執行現場過期下架）"}
        </span>
        <button
          type="button"
          onClick={
            isAuthorizedVolunteer
              ? () => setIsAuthorizedVolunteer(false)
              : () => setShowAuthModal(true)
          }
          style={{
            background: isAuthorizedVolunteer ? "#059669" : "#dc2626",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "0.82rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {isAuthorizedVolunteer ? "🔒 登出志工身分" : "🔑 驗證志工身分"}
        </button>
      </div>

      <div className="v1-view-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← 返回首頁
        </button>
        <h3>🏃 前線行動看板 (行動者端)</h3>
        <p className="v1-view-sub">
          在此查看經人工核實的最新安全任務，並可在現場回報過期資訊以進行即時下架。
        </p>
      </div>

      <div className="v1-actor-layout">
        {/* Left Column: Actionable Tasks List */}
        <div className="v1-actor-list">
          <h4>✅ 可行動救災任務清單 ({actionableTasks.length})</h4>
          {actionableTasks.length === 0 ? (
            <div className="v1-no-tasks">
              ☕
              目前暫無已核實的安全任務。資訊整理人員正在核實原始通報中，請稍後查看！
            </div>
          ) : (
            <div className="v1-list-container">
              {actionableTasks.map((r) => {
                const draft = drafts[r.id]!;
                const isSelected = r.id === selectedRecordId;
                const isSensitive = !!draft.isPrivacySensitive;
                const showReal =
                  isAuthorizedVolunteer && !!unmaskedRecords[r.id];

                const locationStr =
                  isSensitive && !showReal
                    ? maskLocation(draft.locationArea)
                    : draft.locationArea || "未指定區域";

                const isHelp = draft.possibleKind === "help_request_candidate";
                const isStatus = draft.possibleKind === "site_status_candidate";
                const isTask = draft.possibleKind === "task_candidate";

                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`v1-list-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedRecordId(r.id)}
                    style={getCardStyle(draft.possibleKind, isSelected)}
                  >
                    <div className="card-header-row">
                      <span className="card-id" style={{ fontWeight: 800 }}>
                        {r.id}
                      </span>
                      {isHelp && (
                        <span
                          className="badge"
                          style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            borderColor: "#fecaca",
                          }}
                        >
                          🚨 求助
                        </span>
                      )}
                      {isStatus && (
                        <span
                          className="badge"
                          style={{
                            background: "#dbeafe",
                            color: "#1e40af",
                            borderColor: "#bfdbfe",
                          }}
                        >
                          📍 狀態
                        </span>
                      )}
                      {isTask && (
                        <span
                          className="badge"
                          style={{
                            background: "#d1fae5",
                            color: "#065f46",
                            borderColor: "#a7f3d0",
                          }}
                        >
                          🛠️ 志工
                        </span>
                      )}
                    </div>

                    {/* Hide rawText preview entirely for unauthenticated guests if privacy sensitive */}
                    {isSensitive && !isAuthorizedVolunteer ? (
                      <p
                        className="card-raw-snippet"
                        style={{ color: "#94a3b8", fontStyle: "italic" }}
                      >
                        🔒 原始描述含有隱私個資，已自動隱藏遮蔽。
                      </p>
                    ) : (
                      <p className="card-raw-snippet">
                        {r.rawText.substring(0, 45)}...
                      </p>
                    )}

                    <div className="card-footer-row">
                      <span className="card-location">📍 {locationStr}</span>
                      <span className="card-time">{r.updatedAt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Read-only Task details */}
        <div className="v1-actor-detail">
          {selectedRecord && selectedDraft ? (
            <div className="v1-detail-panel">
              <div className="detail-section">
                <h4>📍 任務狀態與來源</h4>
                <div className="detail-meta-grid">
                  <div className="meta-item">
                    <strong>通報編號：</strong>
                    {selectedRecord.id}
                  </div>
                  <div className="meta-item">
                    <strong>審查狀態：</strong>
                    <span className="badge badge-actionable">
                      ✅ 人工已核實安全
                    </span>
                  </div>
                  <div className="meta-item">
                    <strong>任務類型：</strong>
                    {selectedDraft.possibleKind === "help_request_candidate"
                      ? "🚨 求助任務 (有具體受災對象)"
                      : selectedDraft.possibleKind === "site_status_candidate"
                        ? "📍 地點狀態 (積水/路障/物資)"
                        : "🛠️ 志工任務"}
                  </div>
                  <div className="meta-item">
                    <strong>可信程度：</strong>
                    {selectedDraft.confidence === "high"
                      ? "🔥 高 (第一手現場確認)"
                      : selectedDraft.confidence === "medium"
                        ? "⚠️ 中 (有待核實資料)"
                        : "🔍 低"}
                  </div>
                </div>
              </div>

              <div className="detail-section detail-raw-content">
                <h4>💬 原始通報文字</h4>
                <div className="raw-text-box">
                  {selectedDraft.isPrivacySensitive &&
                  !isAuthorizedVolunteer ? (
                    <p
                      style={{
                        color: "#64748b",
                        fontStyle: "italic",
                        textAlign: "center",
                        padding: "12px 0",
                      }}
                    >
                      🔒
                      原文含有敏感隱私住址/電話。請於上方驗證志工身分以解鎖檢視。
                    </p>
                  ) : (
                    <p>{selectedRecord.rawText}</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>🧭 行動參考資訊</h4>
                <div className="detail-info-box">
                  <div>
                    <strong>📍 概略行動區域：</strong>
                    {selectedDraft.isPrivacySensitive &&
                    !unmaskedRecords[selectedRecord.id] ? (
                      <span
                        style={{
                          display: "inline-flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span>{maskLocation(selectedDraft.locationArea)}</span>
                        {isAuthorizedVolunteer && (
                          <button
                            type="button"
                            onClick={() => {
                              setRecordToUnmask(selectedRecord.id);
                              setShowUnmaskModal(true);
                            }}
                            style={{
                              background: "#fffbeb",
                              color: "#b45309",
                              border: "1px solid #fde68a",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            👁️ 顯示真實位置
                          </button>
                        )}
                      </span>
                    ) : (
                      <span>{selectedDraft.locationArea || "未指定區域"}</span>
                    )}
                  </div>

                  <p style={{ marginTop: "12px" }}>
                    <strong>🛠️ 職能技能需求：</strong>
                    <span
                      className="badge"
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        borderColor: "#cbd5e1",
                        marginLeft: "4px",
                      }}
                    >
                      {selectedDraft.detailedCategory || "無特殊技能要求"}
                    </span>
                  </p>

                  {selectedDraft.reporterPhone && (
                    <div style={{ marginTop: "12px" }}>
                      <strong>📞 聯絡電話：</strong>
                      {selectedDraft.isPrivacySensitive &&
                      !unmaskedRecords[selectedRecord.id] ? (
                        <span
                          style={{
                            display: "inline-flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span>{maskPhone(selectedDraft.reporterPhone)}</span>
                          {isAuthorizedVolunteer && (
                            <button
                              type="button"
                              onClick={() => {
                                setRecordToUnmask(selectedRecord.id);
                                setShowUnmaskModal(true);
                              }}
                              style={{
                                background: "#fffbeb",
                                color: "#b45309",
                                border: "1px solid #fde68a",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "0.72rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              👁️ 顯示電話
                            </button>
                          )}
                        </span>
                      ) : (
                        <span>{selectedDraft.reporterPhone}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section memo-section">
                <h4>🕵️ 整理人員審查理由與備註</h4>
                <div className="memo-box">
                  <p>{selectedDraft.humanReviewNote || "無備註"}</p>
                </div>
              </div>

              {/* Reverse Feedback Button (conditional on auth) */}
              <div className="actor-feedback-actions">
                {isAuthorizedVolunteer ? (
                  <button
                    type="button"
                    className="btn-report-expired"
                    onClick={() => setShowExpiredModal(true)}
                  >
                    ⚠️ 現場情況不符 / 任務已過期已完成
                  </button>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      padding: "10px",
                      background: "#f1f5f9",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      color: "#64748b",
                      textAlign: "center",
                      border: "1px dashed var(--border)",
                    }}
                  >
                    ℹ️
                    現場實況不符？請先於上方「驗證志工身分」登入，方可現場回報下架。
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="v1-editor-empty">
              請點選左側任務以查看唯讀行動參考
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Authentication Modal */}
      {showAuthModal && (
        <div className="v1-modal-overlay">
          <div className="v1-modal-card" style={{ maxWidth: "380px" }}>
            <h4>🔑 驗證前線志工身分</h4>
            <p className="modal-sub">
              請輸入決策協議 (decisions.md) 的志工驗證口令來解鎖現場行動權限。
            </p>
            <form onSubmit={handleAuthenticate}>
              <div className="form-group">
                <label htmlFor="authPassword">志工授權密碼</label>
                <input
                  id="authPassword"
                  type="password"
                  placeholder="請輸入志工驗證金鑰（請洽應變中心）"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthPassword("");
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-modal-confirm"
                  style={{ background: "#059669" }}
                >
                  驗證並解鎖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Unmasking Commitment Confirmation Modal */}
      {showUnmaskModal && (
        <div className="v1-modal-overlay">
          <div className="v1-modal-card" style={{ maxWidth: "420px" }}>
            <h4 style={{ color: "#b45309" }}>🔒 個人隱私安全承諾</h4>
            <p
              className="modal-sub"
              style={{ fontSize: "0.9rem", color: "#334155" }}
            >
              您即將解鎖該通報的 **精確地址或聯絡電話**。
              <br />
              <br />
              請確認解鎖個資僅用於救災現場合作聯絡，且保證不對外傳播、截圖或散佈任何受災居民隱私。
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => {
                  setShowUnmaskModal(false);
                  setRecordToUnmask("");
                }}
              >
                取消
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={confirmUnmask}
                style={{ background: "#d97706" }}
              >
                我同意並承諾保護居民個資
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expired Reason Feedback Modal */}
      {showExpiredModal && (
        <div className="v1-modal-overlay">
          <div className="v1-modal-card">
            <h4>⚠️ 宣告任務過期/已失效</h4>
            <p className="modal-sub">
              如果您已抵達現場發現狀況已排除、物資發完或通報有誤，請輸入現場情況原因。此操作會將任務立即下架。
            </p>
            <form onSubmit={handleReportExpired}>
              <div className="form-group">
                <label htmlFor="expiredReason">
                  現場實況說明 <span className="req">*</span>
                </label>
                <textarea
                  id="expiredReason"
                  rows={4}
                  placeholder="例如：溪畔活動中心現場雨鞋已經發完，請下架任務。"
                  value={expiredReason}
                  onChange={(e) => setExpiredReason(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => {
                    setShowExpiredModal(false);
                    setExpiredReason("");
                  }}
                >
                  取消
                </button>
                <button type="submit" className="btn-modal-confirm">
                  ✔️ 確定下架任務
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
