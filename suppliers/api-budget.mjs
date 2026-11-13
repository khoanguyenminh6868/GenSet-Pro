// Hạn mức API key (Khoa, 2026-11-12): API key được 100 USD/tháng, làm mới ngày 2. GenBid-Bot.ps1 đặt
// GENBID_API_SPEND_FILE khi lượt trả bằng API key; mỗi lần gọi Claude ghi chi phí (total_cost_usd) vào tệp đó để bot
// đổi sang gói tháng khi tiêu tới ngưỡng. API báo hết tiền / chạm hạn mức thì ghi "exhausted", bỏ ANTHROPIC_API_KEY
// khỏi tiến trình này (các lần gọi sau dùng gói tháng) và gọi lại.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const { spendMeter } = createRequire(import.meta.url)("../bot/genbid-hsmt/sync-pure.js");

export const API_OUT = /credit balance is too low|reached your specified api usage limits/i;

export const viaApi = () => !!process.env.ANTHROPIC_API_KEY;

// Cấu hình hệ thống trên web (settings/ai, Khoa 2026-11-13): GenBid-Bot.ps1 copies it to GENBID_AI_SETTINGS_FILE.
// "plan" when it puts `task` (config, bidprice) on the monthly plan; else "api" (the API key while the budget allows).
export function aiUse(task, text) {
  if (text === undefined) { try { text = fs.readFileSync(process.env.GENBID_AI_SETTINGS_FILE || "", "utf8"); } catch { text = ""; } }
  try { return JSON.parse(String(text).replace(/^﻿/, ""))?.use?.[task] === "plan" ? "plan" : "api"; } catch { return "api"; }
}
// The environment for one claude -p run of `task`: without the API key (and with the monthly plan's token when this PC
// has no /login) when Cấu hình hệ thống says the monthly plan; else this process's own.
export function taskEnv(task) {
  if (!process.env.ANTHROPIC_API_KEY || aiUse(task) !== "plan") return process.env;
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  const tok = process.env.GENBID_CLAUDE_TOKEN_FILE;
  if (!fs.existsSync(path.join(os.homedir(), ".claude", ".credentials.json")) && tok) {
    try { env.CLAUDE_CODE_OAUTH_TOKEN = fs.readFileSync(tok, "utf8").trim().split(/\r?\n/)[0]; } catch {}
  }
  return env;
}

function append(rec) {
  const f = process.env.GENBID_API_SPEND_FILE;
  if (!f) return;
  try { fs.appendFileSync(f, JSON.stringify({ t: new Date().toISOString(), ...rec }) + "\n"); } catch {}
}

// usd: total_cost_usd of one claude -p run; api: whether that run was started with the API key; t0 (ms, optional): when
// it started, so a spend corrected by hand in the middle of a run counts only the part after (apiBudgetOf).
export function noteApiSpend(usd, src, api, t0) {
  if (api && Number(usd) > 0) append({ usd: Math.round(Number(usd) * 1e4) / 1e4, src, ...(t0 ? { t0: new Date(t0).toISOString() } : {}) });
}

// The spend book while a stream-json run goes (spendMeter in sync-pure.js): feed it stdout with .data(), call .finish()
// once the run ends (killed or not). Writes nothing when the run is not on the API key. start (Date): when the run began,
// when the meter is made after it (bidprice-bot's spawnSync).
export function apiMeter(src, api, { file = process.env.GENBID_API_SPEND_FILE, start } = {}) {
  return spendMeter((rec, t) => {
    if (!api || !file) return;
    try { fs.appendFileSync(file, JSON.stringify({ t: t.toISOString(), usd: rec.usd, src, t0: rec.t0 }) + "\n"); } catch {}
  }, start ? { start } : {});
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

// The spend of a whole stream-json log so far: total_cost_usd when the run has ended, else the token estimate.
export function logUsd(text) {
  return spendMeter(() => {}, { step: Infinity }).finish(String(text || "")).usd;
}

// GenBid-Bot.ps1 Invoke-Agent (its claude -p writes a log file, not a pipe), every minute while the run goes and once at
// the end with --final:
//   node suppliers/api-budget.mjs meter --log <log> --state <tệp trạng thái> --src agent --start <ISO lúc bắt đầu> [--final]
// The state file keeps what was written {usd, at}; a new line is written once the log is 0.05 USD above it (any
// difference with --final), so the book follows the run. Writes to GENBID_API_SPEND_FILE (unset: not on the API key).
export function meterLog({ log, state, src = "agent", final = false, start = null, file = process.env.GENBID_API_SPEND_FILE, now = new Date() }) {
  let st = { usd: 0, at: start };
  try { st = { ...st, ...JSON.parse(fs.readFileSync(state, "utf8")) }; } catch {}
  let text = ""; try { text = fs.readFileSync(log, "utf8"); } catch {}
  const usd = logUsd(text), d = Math.round((usd - st.usd) * 1e4) / 1e4;
  if (!file || !(final ? Math.abs(d) >= 1e-4 : d >= 0.05)) return 0;
  try { fs.appendFileSync(file, JSON.stringify({ t: now.toISOString(), usd: d, src, ...(st.at ? { t0: st.at } : {}) }) + "\n"); } catch { return 0; }
  fs.writeFileSync(state, JSON.stringify({ usd: st.usd + d, at: now.toISOString() }));
  return d;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv[2] === "meter") {
  const a = process.argv.slice(3), arg = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
  const d = meterLog({ log: arg("--log"), state: arg("--state"), src: arg("--src") || "agent", start: arg("--start") || null, final: a.includes("--final") });
  if (d) console.log(`ghi sổ chi API ${d} USD`);
}
