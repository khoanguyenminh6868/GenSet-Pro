// Bot GenBid dự phòng trong Vercel Sandbox (Khoa, 2026-11-17): chỉ chạy khi web có yêu cầu mà không máy Windows nào mở.
// run() (cuối tệp) đọc trạng thái từ web rồi bật (ensure), dừng, hoặc để yên. Gọi từ .github/workflows/sandbox-ensure.yml:
// web chạy workflow ngay khi có yêu cầu lúc bot tắt (web/api/_wake.js), cron 5 phút là lưới an toàn. ensure() idempotent:
//   1. lấy sandbox tên GENBID_SANDBOX_NAME (mặc định "genbid-bot"), chưa có thì tạo (persistent, vùng sin1, 4 vCPU);
//   2. sandbox đang dừng thì tự nối lại từ snapshot (lệnh đầu tiên nối lại phiên; bot, Chrome profile, tệp trạng thái còn nguyên);
//   3. lần đầu: chạy bot/sandbox/setup-sandbox.sh (Wine + VNeGP Agent, Chrome, pwsh, Claude CLI, tessdata...);
//   4. bot không chạy (phiên mới, hoặc chết): chạy start-bot.sh nền, truyền bí mật qua biến môi trường của lệnh đó;
//   5. phiên sắp hết hạn: gia hạn (tối đa theo gói; hết trần thì phiên dừng, lần sau nối lại, khoảng hở ≤ 1 chu kỳ).
// Bí mật (biến môi trường của job): VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID, GENBID_INGEST_TOKEN và
// CLAUDE_CODE_OAUTH_TOKEN và/hoặc ANTHROPIC_API_KEY, GH_TOKEN, (tuỳ chọn) FIRECRAWL_KEY. Không in ra log, không ghi vào git.
import { fileURLToPath } from "node:url";

const MIN = 60e3;
export const DEFAULTS = {
  name: "genbid-bot",
  region: "sin1", // Singapore: gần muasamcong, reCAPTCHA không hiện CAPTCHA (thử 2026-11-17)
  failoverRegions: ["hkg1"],
  vcpus: 4,
  timeoutMs: 300 * MIN, // 5 giờ, trần của gói Pro; Hobby chỉ 45 phút (create thử lại với 45 phút)
  extendBelowMs: 25 * MIN,
  extendByMs: 120 * MIN,
  branch: "main",
};
const SETUP_MARK = "$HOME/genset-pro/.sandbox-setup-done";
// [G] để pgrep không khớp chính dòng lệnh của nó.
export const BOT_UP_CMD = "pgrep -f '[G]enBid-Bot.ps1' >/dev/null && echo UP || echo DOWN";
export const rawUrl = (branch, file) => `https://raw.githubusercontent.com/khoanguyenminh6868/GenSet-Pro/${branch}/${file}`;
const SECRET_KEYS = ["GENBID_INGEST_TOKEN", "CLAUDE_CODE_OAUTH_TOKEN", "ANTHROPIC_API_KEY", "GH_TOKEN", "FIRECRAWL_KEY"];

const isNotFound = (e) => e?.response?.status === 404 || e?.status === 404 || /not.?found|\b404\b/i.test(String(e?.message || ""));

// Môi trường truyền cho start-bot.sh: chỉ các bí mật có giá trị.
export function secretsEnv(env) {
  const out = {};
  for (const k of SECRET_KEYS) if (env[k]) out[k] = env[k];
  return out;
}
export function checkSecrets(env) {
  const missing = [];
  if (!env.GENBID_INGEST_TOKEN) missing.push("GENBID_INGEST_TOKEN");
  if (!env.CLAUDE_CODE_OAUTH_TOKEN && !env.ANTHROPIC_API_KEY) missing.push("CLAUDE_CODE_OAUTH_TOKEN hoặc ANTHROPIC_API_KEY");
  if (!env.GH_TOKEN) missing.push("GH_TOKEN");
  return missing;
}

async function sh(sandbox, script, opts = {}) {
  const r = await sandbox.runCommand({ cmd: "bash", args: ["-lc", script], ...opts });
  const out = typeof r.stdout === "function" ? await r.stdout() : "";
  return { code: r.exitCode, out: String(out || "") };
}

// sandbox: lớp SDK (Sandbox.get / Sandbox.create), creds: {token, teamId, projectId}.
export async function ensure({ Sandbox, creds, env, log = console.log, now = Date.now }) {
  const cfg = {
    ...DEFAULTS,
    name: env.GENBID_SANDBOX_NAME || DEFAULTS.name,
    branch: env.GENBID_BRANCH || DEFAULTS.branch,
    vcpus: Number(env.GENBID_SANDBOX_VCPUS) || DEFAULTS.vcpus,
  };
  const missing = checkSecrets(env);
  if (missing.length) throw new Error(`Thiếu bí mật: ${missing.join(", ")}`);

  let sb;
  try { sb = await Sandbox.get({ name: cfg.name, ...creds }); log(`Sandbox ${cfg.name}: có sẵn`); }
  catch (e) {
    if (!isNotFound(e)) throw e;
    const base = {
      name: cfg.name, ...creds, persistent: true, runtime: "node22", region: cfg.region, resources: { vcpus: cfg.vcpus },
      snapshotExpiration: 30 * 24 * 60 * MIN, keepLastSnapshots: { count: 1, deleteEvicted: true },
    };
    try { sb = await Sandbox.create({ ...base, failoverRegions: cfg.failoverRegions, timeout: cfg.timeoutMs }); }
    catch (e2) {
      // Hobby: không có failoverRegions, phiên tối đa 45 phút.
      log(`Tạo sandbox lần đầu không được (${String(e2.message).slice(0, 120)}), thử cấu hình Hobby`);
      sb = await Sandbox.create({ ...base, timeout: 45 * MIN });
    }
    log(`Sandbox ${cfg.name}: đã tạo (${cfg.region})`);
  }

  // Lệnh đầu tiên nối lại phiên nếu sandbox đang dừng.
  let up = (await sh(sb, BOT_UP_CMD)).out.trim();

  const setup = await sh(sb, `test -f ${SETUP_MARK} && echo DONE || echo TODO`);
  if (setup.out.trim() !== "DONE") {
    log("Cài đặt lần đầu (setup-sandbox.sh)...");
    const r = await sh(sb,
      `curl -fsSL ${rawUrl(cfg.branch, "bot/sandbox/setup-sandbox.sh")} -o /tmp/setup-sandbox.sh && bash /tmp/setup-sandbox.sh ${cfg.branch} > $HOME/setup.log 2>&1 && touch ${SETUP_MARK}`,
      { timeoutMs: 20 * MIN });
    if (r.code !== 0) { const t = await sh(sb, "tail -15 $HOME/setup.log"); throw new Error(`setup-sandbox.sh lỗi (mã ${r.code}):\n${t.out}`); }
  }

  if (up !== "UP") {
    log("Bot không chạy: khởi chạy start-bot.sh");
    const start = [
      "mkdir -p $HOME/genset-pro/genbid-bot-logs",
      "cd $HOME",
      "setsid nohup bash $HOME/genset-pro/GenSet-Pro/bot/sandbox/start-bot.sh >> $HOME/genset-pro/genbid-bot-logs/sandbox.out 2>&1 < /dev/null &",
      "sleep 8",
      BOT_UP_CMD,
    ].join("; ");
    const r = await sh(sb, start, { env: { ...secretsEnv(env), GENBID_BRANCH: cfg.branch } });
    up = r.out.trim().split(/\r?\n/).pop();
    if (up !== "UP") { const t = await sh(sb, "tail -15 $HOME/genset-pro/genbid-bot-logs/sandbox.out"); throw new Error(`Bot không khởi động được:\n${t.out}`); }
    log("Bot đã chạy.");
  } else log("Bot đang chạy.");

  // Gia hạn phiên khi sắp hết (nếu SDK cho biết giờ hết hạn).
  const exp = sb.expiresAt != null ? Number(sb.expiresAt) : null;
  if (exp && exp - now() < cfg.extendBelowMs) {
    try { await sb.extendTimeout(cfg.extendByMs); log(`Gia hạn phiên thêm ${cfg.extendByMs / MIN} phút`); }
    catch (e) { log(`Không gia hạn được (đã chạm trần gói?): ${String(e.message).slice(0, 120)}`); }
  }
  return { name: cfg.name, botUp: true };
}

// ---- Chạy theo nhu cầu (Khoa, 2026-11-17): chỉ bật sandbox khi web có yêu cầu mà không máy Windows nào đang mở. ----
// Trạng thái đọc từ /api/requests?kind=bots: { pending, pc: {lastPollAt, running}, sandbox: {lastPollAt, running}, sandboxBusyAt }.
// Web gọi workflow ngay khi có yêu cầu lúc không bot nào chạy (web/api/_wake.js); cron 5 phút là lưới an toàn và lo việc dừng.
export const PC_SILENT_MS = 3 * 60e3; // như trang web: im 3 phút = máy tắt
export const IDLE_STOP_MS = 20 * MIN; // sandbox rảnh chừng này thì dừng (bộ nhớ tính tiền theo giờ chạy)
const LIVE = new Set(["pending", "running"]);
const ms = (v) => (v == null ? 0 : new Date(v).getTime() || 0);

// st: trạng thái từ web; box: { status, statusUpdatedAt } của sandbox, null khi chưa tạo. Trả "up" | "stop" | "none".
export function decide(st, box, now = Date.now()) {
  const pcOn = now - ms(st?.pc?.lastPollAt) < PC_SILENT_MS;
  const live = !!box && LIVE.has(box.status);
  if (!live) return st?.pending && !pcOn ? "up" : "none";
  // Đang làm dở một việc: để làm xong (tim của sandbox còn mới và báo running).
  if (st?.sandbox?.running && now - ms(st.sandbox.lastPollAt) < PC_SILENT_MS) return "up";
  // Máy Windows đã bật: nó nhận việc ngay khi sandbox im (web/api/requests.js cho máy nhường sandbox 2 phút).
  if (pcOn) return "stop";
  const lastBusy = Math.max(ms(st?.sandboxBusyAt), ms(box.statusUpdatedAt));
  if (!st?.pending && now - lastBusy >= IDLE_STOP_MS) return "stop";
  return "up";
}

export async function fetchState(env, fetchImpl = fetch) {
  const base = env.GENBID_WEB || "https://genset-pro-web.vercel.app";
  const r = await fetchImpl(`${base}/api/requests?kind=bots`, { headers: { Authorization: `Bearer ${env.GENBID_INGEST_TOKEN}` } });
  if (!r.ok) throw new Error(`Đọc trạng thái bot từ web lỗi HTTP ${r.status}`);
  return r.json();
}

export async function run({ Sandbox, creds, env, getState = () => fetchState(env), log = console.log, now = Date.now }) {
  if (!env.GENBID_INGEST_TOKEN) throw new Error("Thiếu bí mật: GENBID_INGEST_TOKEN");
  const name = env.GENBID_SANDBOX_NAME || DEFAULTS.name;
  const st = await getState();
  let sb = null;
  try { sb = await Sandbox.get({ name, ...creds }); } // không nối lại phiên (resume mặc định false)
  catch (e) { if (!isNotFound(e)) throw e; }
  const action = decide(st, sb && { status: sb.status, statusUpdatedAt: sb.statusUpdatedAt }, now());
  log(`Yêu cầu chờ: ${st.pending ? "có" : "không"}; máy Windows: ${st.pc?.lastPollAt || "chưa từng"}; sandbox: ${sb ? sb.status : "chưa tạo"} → ${action}`);
  if (action === "up") return { action, ...(await ensure({ Sandbox, creds, env, log, now })) };
  if (action === "stop") { await sb.stop(); log(`Đã dừng sandbox ${name} (giữ snapshot, lần sau nối lại).`); }
  return { action };
}

// Chạy trực tiếp: node ensure.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { Sandbox } = await import("@vercel/sandbox");
  const creds = { token: process.env.VERCEL_TOKEN, teamId: process.env.VERCEL_TEAM_ID, projectId: process.env.VERCEL_PROJECT_ID };
  if (!creds.token || !creds.teamId || !creds.projectId) { console.error("Thiếu VERCEL_TOKEN / VERCEL_TEAM_ID / VERCEL_PROJECT_ID"); process.exit(2); }
  try { await run({ Sandbox, creds, env: process.env }); }
  catch (e) { console.error(`LỖI: ${e.message}`); process.exit(1); }
}
