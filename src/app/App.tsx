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
    <main className="layout">
      <header className="hero">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p className="eyebrow">SITCON Camp 2026</p>
            <h1>災害資訊整理工作台</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings
                ? "var(--primary-light)"
                : "var(--surface)",
              color: showSettings ? "var(--primary)" : "#475569",
              border: "1px solid var(--border)",
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ⚙️ {apiKey ? "變更 API 設定" : "設定 API 金鑰"}
          </button>
        </div>
        <p style={{ marginTop: "12px" }}>
          第一階段先用 coding agent
          做出可展示的前端原型，再從成果中看見資料品質、角色、狀態與來源的限制。
          現已支援 <b>Gemini 2.5 Flash</b> 智慧分析功能。
        </p>

        {/* Dynamic API Configuration Panel */}
        {showSettings && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#f8fafc",
              borderRadius: "14px",
              border: "1px solid var(--border)",
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
      </header>

      <nav className="tabs" aria-label="第一階段工作區">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="panel">
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

      {/* Global AI Loading Spinner Overlay */}
      {isAiLoading && (
        <div className="ai-loader-overlay">
          <div className="ai-loader-card">
            <div className="ai-spinner"></div>
            <p>{aiProgress}</p>
          </div>
        </div>
      )}
    </main>
  );
}
