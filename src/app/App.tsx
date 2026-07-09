import { useState, useEffect } from "react";
import messyReports from "../fixtures/phase-0/messy-reports.json";
import { EmptyState } from "../components/EmptyState";
import { Phase0RawInfoPanel } from "../features/phase-0/Phase0RawInfoPanel";
import { Phase0Workbench } from "../features/phase-0/Phase0Workbench";
import type {
  Phase0MessyRecord,
  Phase0JudgementDraft,
} from "../features/phase-0/phase0-types";
import { initialDrafts } from "../features/phase-0/phase0-initial-drafts";
import { analyzeReportWithAI } from "../features/phase-0/phase0-ai";
import { Phase0Dashboard } from "../features/phase-0/Phase0Dashboard";

type TabKey = "dashboard" | "raw" | "workbench";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "dashboard", label: "數據儀表板" },
  { key: "raw", label: "原始資訊" },
  { key: "workbench", label: "整理工作台" },
];

const phase0Records = messyReports satisfies Phase0MessyRecord[];

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [selectedRecordId, setSelectedRecordId] = useState(
    phase0Records[0]?.id ?? "",
  );

  // Persistence Memory for drafts
  const [drafts, setDrafts] = useState<Record<string, Phase0JudgementDraft>>(
    () => {
      if (
        typeof window !== "undefined" &&
        typeof localStorage !== "undefined"
      ) {
        const saved = localStorage.getItem("sitcon_camp_drafts");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse saved drafts", e);
          }
        }
      }
      return initialDrafts;
    },
  );

  // Persistence Memory for API Credentials
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("sitcon_camp_api_key");
      if (saved) return saved;
    }
    return (import.meta.env.VITE_AI_API_KEY as string) || "";
  });

  const [baseUrl, setBaseUrl] = useState(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("sitcon_camp_base_url");
      if (saved) return saved;
    }
    return (
      (import.meta.env.VITE_AI_BASE_URL as string) ||
      "https://ai.tfdst.xyz/v1/chat/completions"
    );
  });

  const [showSettings, setShowSettings] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem("sitcon_camp_drafts", JSON.stringify(drafts));
    }
  }, [drafts]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem("sitcon_camp_api_key", apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem("sitcon_camp_base_url", baseUrl);
    }
  }, [baseUrl]);

  // AI Loading & Progress states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState("");

  function selectForWorkbench(recordId: string) {
    setSelectedRecordId(recordId);
    setActiveTab("workbench");
  }

  function handleSaveDraft(recordId: string, draft: Phase0JudgementDraft) {
    setDrafts((prev) => ({ ...prev, [recordId]: draft }));
  }

  function handleDeleteDraft(recordId: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[recordId];
      return next;
    });
  }

  function handleResetDraft(recordId: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[recordId];
      return next;
    });
  }

  // Single-item AI analysis
  async function handleSingleAIAnalysis(recordId: string, rawText: string) {
    if (!apiKey) {
      alert(
        "請點擊右上方『⚙️ 設定 API 金鑰』輸入你的 API Key 以進行 AI 分析！",
      );
      setShowSettings(true);
      return;
    }
    setIsAiLoading(true);
    setAiProgress(`正在對 ${recordId} 進行 AI 智慧分析...`);
    try {
      const result = await analyzeReportWithAI(rawText, apiKey, baseUrl);
      setDrafts((prev) => ({
        ...prev,
        [recordId]: {
          messyRecordId: recordId,
          ...result,
        },
      }));
    } catch (err) {
      console.error(`AI analysis failed for ${recordId}:`, err);
      alert("AI 分析失敗，請確認你的 API 金鑰是否正確並重試。");
    } finally {
      setIsAiLoading(false);
      setAiProgress("");
    }
  }

  // Batch AI analysis for all unorganized reports
  async function handleBatchAIAnalysis() {
    if (!apiKey) {
      alert(
        "請點擊右上方『⚙️ 設定 API 金鑰』輸入你的 API Key 以進行 AI 分析！",
      );
      setShowSettings(true);
      return;
    }
    setIsAiLoading(true);
    setAiProgress("準備進行批次 AI 分析...");
    const nextDrafts = { ...drafts };
    let count = 0;

    const targetRecords = phase0Records.filter((r) => !drafts[r.id]);

    if (targetRecords.length === 0) {
      alert("所有通報都已經建立整理草稿囉！");
      setIsAiLoading(false);
      return;
    }

    for (const record of targetRecords) {
      count++;
      setAiProgress(
        `AI 正在處理 ${record.id} (${count}/${targetRecords.length})...`,
      );
      try {
        const result = await analyzeReportWithAI(
          record.rawText,
          apiKey,
          baseUrl,
        );
        nextDrafts[record.id] = {
          messyRecordId: record.id,
          ...result,
        };
      } catch (err) {
        console.error(`AI analysis failed for ${record.id}:`, err);
      }
    }

    setDrafts(nextDrafts);
    setIsAiLoading(false);
    setAiProgress("");
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <h1>🌋 災害應變中心</h1>
          <span>SITCON Camp 2026</span>
        </div>

        <nav className="sidebar-nav" aria-label="系統導覽">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`sidebar-nav-btn ${activeTab === tab.key ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.key === "dashboard" && "📊"}
              {tab.key === "raw" && "📥"}
              {tab.key === "workbench" && "⚡"}
              <span style={{ marginLeft: "8px" }}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: apiKey ? "#10b981" : "#ef4444",
                display: "inline-block",
              }}
            ></span>
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              {apiKey ? "Gemini 2.5 Flash 已連結" : "AI 金鑰未設定"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings
                ? "rgba(255,255,255,0.08)"
                : "transparent",
              color: "#f8fafc",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "10px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              fontSize: "0.85rem",
            }}
          >
            ⚙️ {apiKey ? "變更 API 設定" : "設定 API 金鑰"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Page Header */}
        <header className="page-header">
          <div className="page-header-title">
            {activeTab === "dashboard" && (
              <>
                <h2>📊 數據儀表板</h2>
                <p>即時追蹤災害通報整理進度、分類及所需志工技能與決策瓶頸。</p>
              </>
            )}
            {activeTab === "raw" && (
              <>
                <h2>📥 原始通報資訊</h2>
                <p>檢視來自各社群管道與現場傳言的原始通報內容與驗證狀態。</p>
              </>
            )}
            {activeTab === "workbench" && (
              <>
                <h2>⚡ 災害整理工作台</h2>
                <p>使用安全邊界與 AI 智慧分析整理草稿，評估行動可行性。</p>
              </>
            )}
          </div>
        </header>

        {/* Dynamic API Configuration Panel */}
        {showSettings && (
          <div
            style={{
              marginBottom: "24px",
              padding: "20px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "0.95rem",
                color: "#0f172a",
              }}
            >
              🤖 AI 服務配置（Gemini 2.5 Flash）
            </h4>
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="請輸入 sk-c66e2e..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  API Endpoint (Base URL)
                </label>
                <input
                  type="text"
                  placeholder="https://ai.tfdst.xyz/v1/chat/completions"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false);
                    alert("API 設定已儲存於瀏覽器記憶中！");
                  }}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  儲存設定
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "您確定要清除所有已整理的草稿記憶，並恢復預設狀態嗎？",
                      )
                    ) {
                      setDrafts(initialDrafts);
                      localStorage.removeItem("sitcon_camp_drafts");
                      alert("記憶已成功清除並重設！");
                    }
                  }}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  🧹 清除記憶 (重設草稿)
                </button>
              </div>
            </div>
          </div>
        )}

        <section
          className="panel"
          style={{
            border: activeTab === "dashboard" ? "none" : undefined,
            padding: activeTab === "dashboard" ? 0 : undefined,
            background: activeTab === "dashboard" ? "transparent" : undefined,
            boxShadow: activeTab === "dashboard" ? "none" : undefined,
            marginTop: "12px",
          }}
        >
          {phase0Records.length === 0 ? (
            <EmptyState message="目前沒有資料" />
          ) : activeTab === "dashboard" ? (
            <Phase0Dashboard records={phase0Records} drafts={drafts} />
          ) : activeTab === "raw" ? (
            <Phase0RawInfoPanel
              records={phase0Records}
              selectedRecordId={selectedRecordId}
              onSelect={selectForWorkbench}
            />
          ) : (
            <Phase0Workbench
              records={phase0Records}
              selectedRecordId={selectedRecordId}
              onSelect={setSelectedRecordId}
              drafts={drafts}
              onSaveDraft={handleSaveDraft}
              onDeleteDraft={handleDeleteDraft}
              onResetDraft={handleResetDraft}
              onSingleAI={handleSingleAIAnalysis}
              onBatchAI={handleBatchAIAnalysis}
            />
          )}
        </section>
      </main>

      {/* Global AI Loading Spinner Overlay */}
      {isAiLoading && (
        <div className="ai-loader-overlay">
          <div className="ai-loader-card">
            <div className="ai-spinner"></div>
            <p>{aiProgress}</p>
          </div>
        </div>
      )}
    </div>
  );
}
