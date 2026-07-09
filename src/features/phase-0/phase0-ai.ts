import type { Phase0JudgementDraft } from "./phase0-types";

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function analyzeReportWithAI(
  rawText: string,
  customApiKey?: string,
  customBaseUrl?: string,
): Promise<Omit<Phase0JudgementDraft, "messyRecordId">> {
  const apiKey = customApiKey || import.meta.env.VITE_AI_API_KEY || "";
  const baseUrl =
    customBaseUrl ||
    import.meta.env.VITE_AI_BASE_URL ||
    "https://ai.tfdst.xyz/v1/chat/completions";

  if (!apiKey) {
    throw new Error(
      "AI API Key is missing. Please set it in settings or .env file.",
    );
  }

  const systemPrompt = `You are an expert disaster relief operations coordinator. Analyze the raw text and extract structured judgment draft.
Output MUST be a single, valid JSON object with NO other text or markdown block formatting.

The JSON schema must match exactly:
{
  "possibleKind": "help_request_candidate" | "site_status_candidate" | "announcement_candidate" | "do_not_use",
  "confidence": "low" | "medium" | "high",
  "evidence": string[],
  "blockers": string[],
  "suggestedNextStep": "keep_raw" | "ask_for_more_info" | "send_to_human_review" | "create_candidate_report" | "create_site_update_suggestion" | "do_not_use_yet",
  "unsafeToActDirectly": boolean,
  "humanReviewNote": string
}

Rules:
- possibleKind: "help_request_candidate" (demands, requests, workers needed), "site_status_candidate" (status update of a site like warehouse, school, shelter), "announcement_candidate" (official announcement), "do_not_use" (spam, irrelevant, outdated).
- confidence: "low", "medium", "high".
- evidence: strings from raw text supporting possibleKind.
- blockers: potential issues like "地址模糊且無定位", "時效過期", "非當事人通報且涉及隱私".
- unsafeToActDirectly: set to true if blockers exist or if it needs verification, false only if highly verified.
- humanReviewNote: detailed reasoning explaining why it is safe or unsafe and what steps to take next (in Traditional Chinese 繁體中文).`;

  const payload = {
    model: "gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this raw report: "${rawText}"` },
    ],
    temperature: 0.1,
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `AI API failed with status ${response.status}: ${await response.text()}`,
    );
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content || "";
  const jsonString = cleanJson(rawContent);

  try {
    const parsed = JSON.parse(jsonString);
    return {
      possibleKind: parsed.possibleKind ?? "help_request_candidate",
      confidence: parsed.confidence ?? "low",
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
      suggestedNextStep: parsed.suggestedNextStep ?? "send_to_human_review",
      unsafeToActDirectly: !!parsed.unsafeToActDirectly,
      humanReviewNote: parsed.humanReviewNote ?? "",
    };
  } catch (err) {
    console.error("Failed to parse AI JSON response:", rawContent, err);
    throw new Error("AI returned invalid JSON format.", { cause: err });
  }
}
