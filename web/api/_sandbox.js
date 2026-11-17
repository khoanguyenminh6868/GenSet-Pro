// Bot GenBid dự phòng trong Vercel Sandbox, theo nhu cầu (Khoa, 2026-11-17). Chạy ngay trong hàm Vercel (xác thực
// Sandbox bằng OIDC của project, không cần token), không dùng GitHub Actions (repo private, Actions bị chặn / hết phút):
// - up(): web có yêu cầu mà không bot nào có tim 3 phút (api/_wake.js) → nối lại / tạo sandbox "genbid-bot" (sin1,
//   persistent), lần đầu cài (bot/sandbox/setup-sandbox.sh), rồi chạy bot/sandbox/start-bot.sh nền (lệnh detached).
// - tick(): mỗi nhịp tim của bot sandbox (api/requests.js ?host=sandbox, ~1 phút) → dừng khi máy Windows bật lại hoặc
//   rảnh 20 phút, gia hạn phiên khi còn việc. Bot treo không có tim thì phiên tự hết sau SESSION_MS.
// Bật bằng biến Vercel SANDBOX_WAKE=1. Bí mật cho bot lấy từ biến của project: INGEST_TOKEN, ANTHROPIC_API_KEY,
// CLAUDE_CODE_OAUTH_TOKEN (nếu có), GH_BOT_TOKEN hoặc GITHUB_TOKEN, FIRECRAWL_KEY (nếu có).
const MIN = 60e3;
export const NAME = "genbid-bot";
export const PC_SILENT_MS = 3 * MIN; // như trang web: im 3 phút = máy tắt
export const IDLE_STOP_MS = 20 * MIN;
export const SESSION_MS = 60 * MIN;
const HOBBY_SESSION_MS = 45 * MIN;
export const EXTEND_BELOW_MS = 20 * MIN;
export const EXTEND_BY_MS = 60 * MIN;
const SETUP_MARK = "$HOME/genset-pro/.sandbox-setup-done";
export const BOT_UP_CMD = "pgrep -f '[G]enBid-Bot.ps1' >/dev/null && echo UP || echo DOWN"; // [G]: không khớp chính nó
const RAW = (file) => `https://raw.githubusercontent.com/${process.env.GITHUB_REPO || "khoanguyenminh6868/GenSet-Pro"}/main/${file}`;
const LIVE = new Set(["pending", "running"]);

export const sandboxOn = () => process.env.SANDBOX_WAKE === "1";

let impl = null;
export function _setSandbox(x) { impl = x; } // test
async function sdk() { return impl || (await import("@vercel/sandbox")).Sandbox; }

// Chạy p sau khi trả lời (waitUntil của Vercel); ngoài Vercel (test) thì p tự chạy tiếp. Không chờ p, không ném lỗi.
// lastBackground: để test chờ p xong.
export let lastBackground = Promise.resolve();
export async function background(p) {
  const safe = Promise.resolve(p).catch((e) => console.warn(`sandbox: ${e?.message || e}`));
  lastBackground = safe;
  try { (await import("@vercel/functions")).waitUntil(safe); } catch { /* không có gói: để chạy tiếp */ }
}

const isNotFound = (e) => e?.response?.status === 404 || e?.status === 404 || /not.?found|\b404\b/i.test(String(e?.message || ""));
const ms = (v) => (v == null ? 0 : new Date(v).getTime() || 0);

// st: { pending, pc: {lastPollAt}, sandbox: {lastPollAt, running}, sandboxBusyAt }; box: { status, statusUpdatedAt } hoặc null.
// "up" | "stop" | "none".
export function decide(st, box, now = Date.now()) {
  const pcOn = now - ms(st?.pc?.lastPollAt) < PC_SILENT_MS;
  const live = !!box && LIVE.has(box.status);
  if (!live) return st?.pending && !pcOn ? "up" : "none";
  // Đang làm dở một việc: để làm xong.
  if (st?.sandbox?.running && now - ms(st.sandbox.lastPollAt) < PC_SILENT_MS) return "up";
  // Máy Windows đã bật: nó nhận việc khi sandbox im 2 phút (api/requests.js).
  if (pcOn) return "stop";
  const lastBusy = Math.max(ms(st?.sandboxBusyAt), ms(box.statusUpdatedAt));
  if (!st?.pending && now - lastBusy >= IDLE_STOP_MS) return "stop";
  return "up";
}

// Bí mật truyền cho start-bot.sh (chỉ biến có giá trị). Token Vercel / Supabase không vào sandbox.
export function botEnv(env = process.env) {
  const out = {
    GENBID_INGEST_TOKEN: env.INGEST_TOKEN, ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY, CLAUDE_CODE_OAUTH_TOKEN: env.CLAUDE_CODE_OAUTH_TOKEN,
    GH_TOKEN: env.GH_BOT_TOKEN || env.GITHUB_TOKEN, FIRECRAWL_KEY: env.FIRECRAWL_KEY,
  };
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v));
}

async function sh(sb, script) {
  const r = await sb.runCommand({ cmd: "bash", args: ["-lc", script] });
  return String((typeof r.stdout === "function" ? await r.stdout() : "") || "").trim();
}

// Nối lại / tạo sandbox và chạy bot. "running" | "started" | "installing".
export async function up({ env = process.env, log = console.log } = {}) {
  const Sandbox = await sdk();
  const secrets = botEnv(env);
  if (!secrets.GENBID_INGEST_TOKEN || !(secrets.ANTHROPIC_API_KEY || secrets.CLAUDE_CODE_OAUTH_TOKEN)) throw new Error("thiếu INGEST_TOKEN hoặc khoá Claude trong biến Vercel");
  let sb;
  try { sb = await Sandbox.get({ name: NAME }); }
  catch (e) {
    if (!isNotFound(e)) throw e;
    const base = { name: NAME, persistent: true, runtime: "node22", region: "sin1", resources: { vcpus: 4 }, snapshotExpiration: 30 * 24 * 60 * MIN, keepLastSnapshots: { count: 1, deleteEvicted: true } };
    try { sb = await Sandbox.create({ ...base, timeout: SESSION_MS }); }
    catch (e2) { log(`sandbox: tạo phiên 60 phút không được (${String(e2.message).slice(0, 100)}), thử 45 phút (Hobby)`); sb = await Sandbox.create({ ...base, timeout: HOBBY_SESSION_MS }); }
    log("sandbox: đã tạo");
  }
  // Lệnh đầu tiên nối lại phiên nếu sandbox đang dừng.
  if ((await sh(sb, BOT_UP_CMD)) === "UP") return "running";
  const installed = (await sh(sb, `test -f ${SETUP_MARK} && echo DONE || echo TODO`)) === "DONE";
  const steps = [
    installed ? null : `curl -fsSL ${RAW("bot/sandbox/setup-sandbox.sh")} -o /tmp/setup-sandbox.sh && bash /tmp/setup-sandbox.sh main > $HOME/setup.log 2>&1 && touch ${SETUP_MARK}`,
    "mkdir -p $HOME/genset-pro/genbid-bot-logs",
    "exec bash $HOME/genset-pro/GenSet-Pro/bot/sandbox/start-bot.sh >> $HOME/genset-pro/genbid-bot-logs/sandbox.out 2>&1 < /dev/null",
  ].filter(Boolean);
  await sb.runCommand({ cmd: "bash", args: ["-lc", steps.join(" && ")], env: secrets, detached: true });
  log(`sandbox: ${installed ? "đã chạy bot" : "đang cài lần đầu rồi chạy bot"}`);
  return installed ? "started" : "installing";
}

// Theo nhịp tim của bot sandbox: "stop" | "up" | "none" (sandbox không chạy / chưa tạo).
export async function tick(st, { now = Date.now(), log = console.log } = {}) {
  const Sandbox = await sdk();
  let sb;
  try { sb = await Sandbox.get({ name: NAME }); } // không nối lại phiên
  catch (e) { if (isNotFound(e)) return "none"; throw e; }
  const action = decide(st, { status: sb.status, statusUpdatedAt: sb.statusUpdatedAt }, now);
  if (action === "stop") { await sb.stop(); log("sandbox: đã dừng (giữ snapshot)"); return "stop"; }
  if (action === "up" && LIVE.has(sb.status) && sb.expiresAt && ms(sb.expiresAt) - now < EXTEND_BELOW_MS) {
    try { await sb.extendTimeout(EXTEND_BY_MS); } catch (e) { log(`sandbox: không gia hạn được (${String(e.message).slice(0, 100)})`); }
  }
  return LIVE.has(sb.status) ? action : "none";
}
