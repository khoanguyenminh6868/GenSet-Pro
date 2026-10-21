// Small Supabase REST helpers for the serverless functions (no npm dependencies).
// Accepts the project URL (https://<ref>.supabase.co) or, by mistake, the dashboard link
// (https://supabase.com/dashboard/project/<ref>) or a URL with a path such as /rest/v1.
export function projectUrl(raw = process.env.SUPABASE_URL || "") {
  const v = raw.trim();
  const dash = v.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dash) return `https://${dash[1].toLowerCase()}.supabase.co`;
  try { return new URL(v).origin; } catch { return ""; }
}
export const SB_URL = projectUrl();
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Returns the signed-in member ({ email, role }) for the request's bearer token, or null.
export async function memberFrom(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token || !SB_URL) return null;
  const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!u.ok) return null;
  const email = ((await u.json()).email || "").toLowerCase();
  if (!email) return null;
  const m = await fetch(`${SB_URL}/rest/v1/members?select=email,role&email=eq.${encodeURIComponent(email)}`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
  const rows = m.ok ? await m.json() : [];
  return rows[0] || null;
}

export async function downloadScratch(path) {
  const r = await fetch(`${SB_URL}/storage/v1/object/scratch/${path}`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
  if (!r.ok) throw new Error(`scratch ${path}: HTTP ${r.status}`);
  return { type: r.headers.get("content-type") || "image/jpeg", data: Buffer.from(await r.arrayBuffer()).toString("base64") };
}

export async function removeScratch(paths) {
  if (!paths.length) return;
  await fetch(`${SB_URL}/storage/v1/object/scratch`, { method: "DELETE", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: paths }) }).catch(() => {});
}
