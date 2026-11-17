// Firecrawl (api.firecrawl.dev) as the fallback reader of a public page this PC cannot read itself (Khoa, 2026-11-17:
// credits back, "dự phòng khi bị chặn"): the agents' save command (config-bot.mjs save) and discover.mjs save --firecrawl.
// The key is read from a file and never printed. The free plan has 1,000 credits a month (1 page = 1 credit), so it is
// only used after the direct download failed: HTTP 401 / 403 / 429 / 5xx, a network error, or a page built with
// JavaScript (almost no text). Pages behind a login or a CAPTCHA are still not used (the callers check the text).
import fs from "node:fs";
import path from "node:path";

// The key file: GENBID_FIRECRAWL_KEY_FILE, else the bot kit of GENBID_ROOT (Vercel Sandbox), else the Windows bot's kit.
export function keyFile(env = process.env) {
  if (env.GENBID_FIRECRAWL_KEY_FILE) return env.GENBID_FIRECRAWL_KEY_FILE;
  if (env.GENBID_ROOT) return path.join(env.GENBID_ROOT, "genbid-hsmt", ".firecrawl-key");
  return "C:/Projects/GenSet Pro/genbid-hsmt/.firecrawl-key";
}
export function hasKey(env = process.env) {
  try { return fs.readFileSync(keyFile(env), "utf8").trim().length > 0; } catch { return false; }
}

// When the direct download's outcome calls for Firecrawl: status (number, or null for a network error) and, for a page
// that was read, the length of its text. A missing domain (ENOTFOUND) or a 404 is not retried: Firecrawl cannot help.
export function shouldRetry({ status = null, error = "", textLength = null } = {}) {
  if (/ENOTFOUND|EAI_AGAIN|Invalid URL/i.test(String(error))) return false;
  if (status == null) return !!error || (textLength != null && textLength < 600);
  if (status === 401 || status === 403 || status === 429 || status >= 500) return true;
  return status >= 200 && status < 300 && textLength != null && textLength < 600;
}

// Scrape one URL; resolves { url, markdown } or throws an Error whose message says why (credits out: HTTP 402).
// fetchImpl: tests pass a fake.
export async function scrape(url, { env = process.env, fetchImpl = fetch, timeout = 120000 } = {}) {
  const key = fs.readFileSync(keyFile(env), "utf8").trim();
  const r = await fetchImpl("https://api.firecrawl.dev/v2/scrape", {
    method: "POST", signal: AbortSignal.timeout(timeout),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 402) throw new Error("firecrawl HTTP 402 (hết credit tháng này)");
  if (!r.ok || !j.data?.markdown) throw new Error(`firecrawl HTTP ${r.status} ${String(j.error || "").slice(0, 160)}`.trim());
  return { url: j.data.metadata?.sourceURL || url, markdown: j.data.markdown };
}
