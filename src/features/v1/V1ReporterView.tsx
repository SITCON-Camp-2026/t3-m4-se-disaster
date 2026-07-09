import React, { useState } from "react";

interface V1ReporterViewProps {
  onAddReport: (
    rawText: string,
    eyewitnessType: "first_hand" | "second_hand",
    phone: string,
  ) => void;
  onBack: () => void;
}

export function V1ReporterView({ onAddReport, onBack }: V1ReporterViewProps) {
  const [rawText, setRawText] = useState("");
  const [eyewitnessType, setEyewitnessType] = useState<
    "first_hand" | "second_hand"
  >("first_hand");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Simple heuristic for checking if the location is vague
  const hasSpecificLocation =
    rawText.includes("路") ||
    rawText.includes("街") ||
    rawText.includes("巷") ||
    rawText.includes("弄") ||
    rawText.includes("號") ||
    rawText.includes("樓") ||
    rawText.includes("旁") ||
    rawText.includes("前") ||
    rawText.includes("門") ||
    rawText.includes("橋") ||
    rawText.includes("中心") ||
    rawText.includes("學校");

  const showVagueWarning = rawText.trim().length > 0 && !hasSpecificLocation;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) {
      alert("請輸入回報內容！");
      return;
    }
    onAddReport(rawText, eyewitnessType, phone);
    setSubmitted(true);
  }

  function handleReset() {
    setRawText("");
    setPhone("");
    setEyewitnessType("first_hand");
    setSubmitted(false);
  }

  return (
    <div className="v1-reporter-view">
      <div className="v1-view-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← 返回首頁
        </button>
        <h3>📢 快速通報管道 (回報者端)</h3>
        <p className="v1-view-sub">
          在此快速回報現場第一手或聽聞的片段線索，供後台查核與整理。
        </p>
      </div>

      {submitted ? (
        <div
          className="v1-reporter-form success-card"
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            padding: "48px 32px",
            animation: "scaleUp 0.3s ease-out",
          }}
        >
          <div style={{ fontSize: "4.5rem" }}>🎉</div>
          <h4
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#065f46",
              margin: 0,
            }}
          >
            通報已成功提交！
          </h4>
          <p
            style={{
              color: "#475569",
              fontSize: "0.98rem",
              lineHeight: 1.6,
              maxWidth: "500px",
              margin: 0,
            }}
          >
            感謝您的無私回報。本通報已即時傳送至後台應變中心。整理人員將針對可信度、衝突、隱私等進行人工核實核對，以確保前線行動安全。
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "12px",
              width: "100%",
              justifyItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                flex: "1",
                maxWidth: "200px",
              }}
            >
              ➕ 繼續通報下一筆
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                flex: "1",
                maxWidth: "200px",
              }}
            >
              🏠 返回
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="v1-reporter-form">
          <div className="form-group">
            <label htmlFor="rawText">
              現場狀況 / 求助與物資線索 <span className="req">*</span>
            </label>
            <textarea
              id="rawText"
              rows={5}
              placeholder="請描述您看到或聽到的災情線索（例如：聽鄰居說大進路口往溪邊第二排有位阿嬤被水淹出不去，急需沙發搬運與沙包）"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
            />
          </div>

          {showVagueWarning && (
            <div className="vague-warning-banner">
              💡 <strong>溫馨提示：</strong>
              您的描述中似乎缺乏具體的地標或路名描述（例如路、街、巷、門等），整理人員可能較難定位，但您仍可以直接送出通報。
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label>資訊來源類型</label>
              <div className="radio-group-horizontal">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="eyewitnessType"
                    value="first_hand"
                    checked={eyewitnessType === "first_hand"}
                    onChange={() => setEyewitnessType("first_hand")}
                  />
                  👀 我在現場親眼目睹 (第一手)
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="eyewitnessType"
                    value="second_hand"
                    checked={eyewitnessType === "second_hand"}
                    onChange={() => setEyewitnessType("second_hand")}
                  />
                  💬 聽人轉述 / 群組流言 (第二手)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">您的聯絡電話 (選填，查證用)</label>
              <input
                id="phone"
                type="tel"
                placeholder="例如：0912-345-678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit-report">
            🚀 立即送出通報
          </button>
        </form>
      )}
    </div>
  );
}
