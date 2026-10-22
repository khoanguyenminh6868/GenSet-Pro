// Claude for the page: stands in for the claude.ai `sample` capability, using the Anthropic API key.
import { memberFrom, downloadScratch, removeScratch } from "./_supabase.js";

const MODELS = {
  quick: process.env.MODEL_QUICK || "claude-haiku-5-5",
  default: process.env.MODEL_DEFAULT || "claude-sonnet-5-5",
  complex: process.env.MODEL_COMPLEX || "claude-opus-5-5",
};
const JSON_RULE = "\n\nTrả lời DUY NHẤT bằng một giá trị JSON hợp lệ, không kèm chữ nào khác, không bọc trong ```.";

function parseJson(text) {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(t); } catch {}
  const i = Math.min(...["{", "["].map((c) => (t.indexOf(c) < 0 ? Infinity : t.indexOf(c))));
  const j = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (i < Infinity && j > i) return JSON.parse(t.slice(i, j + 1));
  throw new Error("AI không trả về JSON hợp lệ.");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ code: "not_granted", message: "Chưa cấu hình khoá API cho AI." });
  const member = await memberFrom(req);
  if (!member) return res.status(401).json({ code: "not_granted", message: "Chưa đăng nhập hoặc chưa được cấp quyền." });

  const { input, json = false, modelTier = "default", images = [] } = req.body || {};
  const msgs = typeof input === "string" ? [{ role: "user", content: input }] : (input || []).map((m) => ({ role: m.role, content: m.content }));
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return res.status(400).json({ code: "bad_request", message: "Thiếu nội dung." });
  try {
    const last = msgs[msgs.length - 1];
    const blocks = [];
    for (const p of images) { const img = await downloadScratch(p); blocks.push({ type: "image", source: { type: "base64", media_type: img.type, data: img.data } }); }
    blocks.push({ type: "text", text: String(last.content) + (json ? JSON_RULE : "") });
    last.content = blocks;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODELS[modelTier] || MODELS.default, max_tokens: 16000, messages: msgs }),
    });
    const body = await r.json();
    if (!r.ok) {
      const code = r.status === 429 ? "rate_limited" : "error";
      return res.status(r.status === 429 ? 429 : 502).json({ code, message: body?.error?.message || `HTTP ${r.status}` });
    }
    const text = (body.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const out = { text, truncated: body.stop_reason === "max_tokens", model: body.model };
    if (json) out.value = parseJson(text);
    res.json(out);
  } catch (e) {
    res.status(500).json({ code: "error", message: String(e?.message || e) });
  } finally {
    removeScratch(images);
  }
}
