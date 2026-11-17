// Wake the sandbox bot (Khoa, 2026-11-17): a request from the web while no bot is on (no heartbeat in botstatus/current
// for 3 minutes, the page's "Agent chưa nhận yêu cầu") runs the GitHub workflow sandbox-ensure.yml, whose
// bot/sandbox/ensure.mjs resumes the Vercel Sandbox and starts the bot there. At most one run every 5 minutes
// (botstatus/wake). Off until GH_DISPATCH_TOKEN is set in Vercel (fine-grained token, this repo only, Actions: write);
// the workflow itself also needs the repo variable GENBID_SANDBOX_ENABLED=true. Never fails the request it follows.
import { SB_URL } from "./_supabase.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REPO = () => process.env.GITHUB_REPO || "khoanguyenminh6868/GenSet-Pro";
export const WORKFLOW = "sandbox-ensure.yml";
export const BOT_SILENT_MS = 3 * 60e3;
export const WAKE_EVERY_MS = 5 * 60e3;
const fresh = (iso, ms, now) => !!iso && now - new Date(iso).getTime() < ms;

// Pure decision: { current, wake } are botstatus/current and botstatus/wake (data or undefined).
export function shouldWake({ current, wake }, now = Date.now()) {
  if (fresh(current?.lastPollAt, BOT_SILENT_MS, now)) return "bot-on";
  if (fresh(wake?.at, WAKE_EVERY_MS, now)) return "waking";
  return "wake";
}

// Returns "off" | "bot-on" | "waking" | "sent" | "error".
export async function wakeSandbox({ now = Date.now(), token = process.env.GH_DISPATCH_TOKEN } = {}) {
  if (!token) return "off";
  const sb = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
  try {
    const r = await fetch(`${SB_URL}/rest/v1/docs?coll=eq.botstatus&id=in.(current,wake)&select=id,data&order=id`, { headers: sb, signal: AbortSignal.timeout(4000) });
    if (!r.ok) return "error";
    const by = Object.fromEntries((await r.json()).map((d) => [d.id, d.data]));
    const why = shouldWake(by, now);
    if (why !== "wake") return why;
    const at = new Date(now).toISOString();
    // Mark first, so two requests in the same second do not both run the workflow.
    await fetch(`${SB_URL}/rest/v1/docs`, {
      method: "POST", signal: AbortSignal.timeout(4000),
      headers: { ...sb, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ coll: "botstatus", id: "wake", data: { at }, updated_at: at }]),
    });
    const g = await fetch(`https://api.github.com/repos/${REPO()}/actions/workflows/${WORKFLOW}/dispatches`, {
      method: "POST", signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "genbid-web", "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main" }),
    });
    if (!g.ok) { console.warn(`wake: GitHub ${g.status}`); return "error"; }
    return "sent";
  } catch (e) { console.warn(`wake: ${e.message}`); return "error"; }
}
