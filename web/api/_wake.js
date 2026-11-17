// Wake the sandbox bot (Khoa, 2026-11-17): a request from the web while no bot is on (no heartbeat in botstatus/current
// for 3 minutes, the page's "Agent chưa nhận yêu cầu") resumes the Vercel Sandbox and starts the bot there
// (api/_sandbox.js up(), after the answer is sent). At most one try every 5 minutes (botstatus/wake). Off until the
// Vercel variable SANDBOX_WAKE=1. Never fails the request it follows.
import { SB_URL } from "./_supabase.js";
import { sandboxOn, up, background } from "./_sandbox.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const BOT_SILENT_MS = 3 * 60e3;
export const WAKE_EVERY_MS = 5 * 60e3;
const fresh = (iso, ms, now) => !!iso && now - new Date(iso).getTime() < ms;

// Pure decision: { current, wake } are botstatus/current and botstatus/wake (data or undefined).
export function shouldWake({ current, wake }, now = Date.now()) {
  if (fresh(current?.lastPollAt, BOT_SILENT_MS, now)) return "bot-on";
  if (fresh(wake?.at, WAKE_EVERY_MS, now)) return "waking";
  return "wake";
}

// Returns "off" | "bot-on" | "waking" | "sent" | "error"; the sandbox itself starts in the background.
export async function wakeSandbox({ now = Date.now() } = {}) {
  if (!sandboxOn()) return "off";
  const sb = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
  try {
    const r = await fetch(`${SB_URL}/rest/v1/docs?coll=eq.botstatus&id=in.(current,wake)&select=id,data&order=id`, { headers: sb, signal: AbortSignal.timeout(4000) });
    if (!r.ok) return "error";
    const by = Object.fromEntries((await r.json()).map((d) => [d.id, d.data]));
    const why = shouldWake(by, now);
    if (why !== "wake") return why;
    const at = new Date(now).toISOString();
    // Mark first, so two requests in the same second do not both start it.
    await fetch(`${SB_URL}/rest/v1/docs`, {
      method: "POST", signal: AbortSignal.timeout(4000),
      headers: { ...sb, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ coll: "botstatus", id: "wake", data: { at }, updated_at: at }]),
    });
    await background(up());
    return "sent";
  } catch (e) { console.warn(`wake: ${e.message}`); return "error"; }
}
