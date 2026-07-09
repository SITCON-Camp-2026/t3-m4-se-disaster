import type { Phase0MessyRecord, Phase0JudgementDraft } from "./phase0-types";

export function Phase0Dashboard({
  records,
  drafts,
}: {
  records: Phase0MessyRecord[];
  drafts: Record<string, Phase0JudgementDraft>;
}) {
  const total = records.length;
  const processedCount = Object.keys(drafts).length;
  const pendingCount = total - processedCount;
  const completionRate =
    total > 0 ? Math.round((processedCount / total) * 100) : 0;

  // Direct action status
  const draftsList = Object.values(drafts);
  const safeCount = draftsList.filter((d) => !d.unsafeToActDirectly).length;
  const unsafeCount = total - safeCount; // Unhandled ones are unsafe by default

  // possibleKind distribution
  const kindCounts: Record<string, number> = {
    help_request_candidate: 0,
    site_status_candidate: 0,
    task_candidate: 0,
    assignment_candidate: 0,
    announcement_candidate: 0,
    unknown: 0,
  };
  draftsList.forEach((d) => {
    if (d.possibleKind in kindCounts) {
      kindCounts[d.possibleKind]++;
    } else {
      kindCounts.unknown++;
    }
  });

  const kindLabels: Record<string, string> = {
    help_request_candidate: "求助候選",
    site_status_candidate: "地點狀態候選",
    task_candidate: "任務候選",
    assignment_candidate: "人員指派候選",
    announcement_candidate: "公告候選",
    unknown: "待分類/其他",
  };

  // Location Area distribution
  const locationCounts: Record<string, number> = {};
  draftsList.forEach((d) => {
    const loc = d.locationArea?.trim();
    if (loc) {
      locationCounts[loc] = (locationCounts[loc] ?? 0) + 1;
    }
  });
  const sortedLocations = Object.entries(locationCounts).sort(
    (a, b) => b[1] - a[1],
  );

  // Detailed Category distribution
  const categoryCounts: Record<string, number> = {};
  draftsList.forEach((d) => {
    const cat = d.detailedCategory?.trim();
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
    }
  });
  const sortedCategories = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  );

  // Skills required distribution
  const skillCounts: Record<string, number> = {};
  draftsList.forEach((d) => {
    d.requiredSkills?.forEach((skill) => {
      const s = skill.trim();
      if (s) {
        skillCounts[s] = (skillCounts[s] ?? 0) + 1;
      }
    });
  });
  const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);

  // Top Blockers list
  const activeBlockers: Array<{ id: string; blocker: string }> = [];
  records.forEach((r) => {
    const d = drafts[r.id];
    if (d && d.blockers && d.blockers.length > 0) {
      d.blockers.forEach((b) => {
        activeBlockers.push({ id: r.id, blocker: b });
      });
    }
  });

  return (
    <div className="dashboard-view" style={{ display: "grid", gap: "24px" }}>
      {/* Progress Card */}
      <div
        className="dashboard-header-card"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          padding: "28px",
          borderRadius: "20px",
          boxShadow: "var(--shadow-md)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div style={{ flex: 1, minWidth: "260px" }}>
          <p
            className="eyebrow"
            style={{ color: "var(--primary-light)", margin: 0 }}
          >
            Real-time Disaster Response Insights
          </p>
          <h2
            style={{
              fontSize: "1.6rem",
              margin: "8px 0 12px 0",
              color: "white",
            }}
          >
            災害整理進度：{completionRate}%
          </h2>
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${completionRate}%`,
                height: "100%",
                background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
                borderRadius: "5px",
                transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            ></div>
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              marginTop: "8px",
              margin: 0,
            }}
          >
            {processedCount} 筆已建立整理草稿，{pendingCount} 筆待處理。 藉由 AI
            智慧分析，您可快速將所有未整理回報一鍵自動化整理。
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              padding: "16px 24px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              可直接行動
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#10b981",
                marginTop: "4px",
              }}
            >
              {safeCount}{" "}
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: "normal",
                  color: "#94a3b8",
                }}
              >
                筆
              </span>
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              padding: "16px 24px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              待查證/阻礙中
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#f59e0b",
                marginTop: "4px",
              }}
            >
              {unsafeCount}{" "}
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: "normal",
                  color: "#94a3b8",
                }}
              >
                筆
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          className="dashboard-stat-card"
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <span style={{ fontSize: "1.8rem" }}>📥</span>
          <h4
            style={{
              margin: "10px 0 4px",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            總原始回報數
          </h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{total}</div>
        </div>

        <div
          className="dashboard-stat-card"
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            borderLeft: "4px solid #10b981",
          }}
        >
          <span style={{ fontSize: "1.8rem" }}>✨</span>
          <h4
            style={{
              margin: "10px 0 4px",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            已整理草稿數
          </h4>
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}
          >
            {processedCount}
          </div>
        </div>

        <div
          className="dashboard-stat-card"
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            borderLeft: "4px solid #ef4444",
          }}
        >
          <span style={{ fontSize: "1.8rem" }}>⏳</span>
          <h4
            style={{
              margin: "10px 0 4px",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            待處理回報數
          </h4>
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#ef4444" }}
          >
            {pendingCount}
          </div>
        </div>

        <div
          className="dashboard-stat-card"
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <span style={{ fontSize: "1.8rem" }}>🩺</span>
          <h4
            style={{
              margin: "10px 0 4px",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            安全行動率
          </h4>
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}
          >
            {total > 0 ? Math.round((safeCount / total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Detail Analytics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Category distribution */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>
            📋 候選類型分佈
          </h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {Object.entries(kindCounts).map(([key, count]) => {
              const percentage =
                processedCount > 0
                  ? Math.round((count / processedCount) * 100)
                  : 0;
              return (
                <div key={key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      marginBottom: "4px",
                    }}
                  >
                    <span>{kindLabels[key]}</span>
                    <span style={{ fontWeight: "bold" }}>
                      {count} 筆 ({percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#f1f5f9",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "var(--primary)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Category distribution */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>
            🏷️ 詳細需求分類
          </h3>
          {sortedCategories.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              暫無詳細分類數據
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {sortedCategories.slice(0, 5).map(([cat, count]) => {
                const percentage =
                  processedCount > 0
                    ? Math.round((count / processedCount) * 100)
                    : 0;
                return (
                  <div key={cat}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{cat}</span>
                      <span style={{ fontWeight: "bold" }}>{count} 筆</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "#f1f5f9",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: "#8b5cf6",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Region Hotspots */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>
            📍 區域需求熱區
          </h3>
          {sortedLocations.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              暫無區域數據
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {sortedLocations.slice(0, 5).map(([loc, count]) => {
                const percentage =
                  processedCount > 0
                    ? Math.round((count / processedCount) * 100)
                    : 0;
                return (
                  <div key={loc}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{loc}</span>
                      <span style={{ fontWeight: "bold" }}>{count} 筆</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "#f1f5f9",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: "#06b6d4",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skills Required */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>
            🛠️ 志工職能需求
          </h3>
          {sortedSkills.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              暫無特定職能需求
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {sortedSkills.map(([skill, count]) => (
                <div
                  key={skill}
                  style={{
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    border: "1px solid rgba(37, 99, 235, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{skill}</span>
                  <span
                    style={{
                      background: "var(--primary)",
                      color: "white",
                      fontSize: "0.75rem",
                      padding: "2px 6px",
                      borderRadius: "50%",
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Blockers & Coordination bottlenecks */}
      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid var(--border)",
        }}
      >
        <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem" }}>
          ⚠️ 待確認阻礙點與決策瓶頸
        </h3>
        {activeBlockers.length === 0 ? (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            目前無待查證的阻礙點！所有已整理草稿均無阻礙行動之問題。
          </p>
        ) : (
          <div
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              display: "grid",
              gap: "8px",
              paddingRight: "6px",
            }}
          >
            {activeBlockers.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "#fffbeb",
                  borderRadius: "8px",
                  border: "1px solid #fef3c7",
                  fontSize: "0.88rem",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ color: "#d97706", fontWeight: "bold" }}>
                  {item.id}
                </span>
                <div style={{ color: "#92400e" }}>{item.blocker}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
