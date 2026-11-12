// Hạn mức API key (Khoa, 2026-11-12): API key được 100 USD/tháng, làm mới ngày 2. GenBid-Bot.ps1 đặt
// GENBID_API_SPEND_FILE khi lượt trả bằng API key; mỗi lần gọi Claude ghi chi phí (total_cost_usd) vào tệp đó để bot
// đổi sang gói tháng khi tiêu tới ngưỡng. API báo hết tiền / chạm hạn mức thì ghi "exhausted", bỏ ANTHROPIC_API_KEY
// khỏi tiến trình này (các lần gọi sau dùng gói tháng) và gọi lại.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const API_OUT = /credit balance is too low|reached your specified api usage limits/i;

export const viaApi = () => !!process.env.ANTHROPIC_API_KEY;

function append(rec) {
  const f = process.env.GENBID_API_SPEND_FILE;
  if (!f) return;
  try { fs.appendFileSync(f, JSON.stringify({ t: new Date().toISOString(), ...rec }) + "\n"); } catch {}
}

// usd: total_cost_usd of one claude -p run; api: whether that run was started with the API key.
export function noteApiSpend(usd, src, api) {
  if (api && Number(usd) > 0) append({ usd: Math.round(Number(usd) * 1e4) / 1e4, src });
}

// The total_cost_usd of a --output-format json / stream-json run ({"type":"result",...} line), or null.
// The CLI's key order is not fixed (2026-11-12: a newer one writes {"duration_api_ms":...,"type":"result",...}), so the
// line is found by parsing it, not by what it starts with; config-bot prefixes each line with "[Ns] ". The last result wins.
export function costOf(stdout) {
  const s = String(stdout || "");
  for (const l of s.split(/\r?\n/).reverse()) {
    if (!l.includes('"type":"result"')) continue;
    const i = l.indexOf("{");
    try { const j = JSON.parse(l.slice(i)); if (j?.type === "result" && Number.isFinite(Number(j.total_cost_usd))) return Number(j.total_cost_usd); } catch {}
  }
  try { return JSON.parse(s).total_cost_usd ?? null; } catch { return null; }
}

// True when the run failed because the API money ran out and later runs now go on the monthly plan.
export function switchToPlan(text, src) {
  if (!process.env.ANTHROPIC_API_KEY || !API_OUT.test(String(text || ""))) return false;
  append({ usd: 0, exhausted: true, src });
  delete process.env.ANTHROPIC_API_KEY;
  const tok = process.env.GENBID_CLAUDE_TOKEN_FILE;
  if (!fs.existsSync(path.join(os.homedir(), ".claude", ".credentials.json")) && tok) {
    try { process.env.CLAUDE_CODE_OAUTH_TOKEN = fs.readFileSync(tok, "utf8").trim().split(/\r?\n/)[0]; } catch {}
  }
  console.log(`Hạn mức API key đã hết (${src}); chuyển sang gói tháng.`);
  return true;
}
