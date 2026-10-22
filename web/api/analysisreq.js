// "Phân tích" on the web: records analysisreq/<TBMT> for the Windows worker, written server-side so a
// signed-in member's request never depends on the browser's direct database write.
// POST { items: [{ key, notifyNo, bidName }] } with the member's Supabase access token.
import { SB_URL, memberFrom } from "./_supabase.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const member = await memberFrom(req);
  if (!member) return res.status(401).json({ error: "Chưa đăng nhập hoặc chưa được cấp quyền." });
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length || items.length > 200 || items.some((i) => !ID_RE.test(i?.key || ""))) return res.status(400).json({ error: "Mã gói thầu không hợp lệ." });
  const at = new Date().toISOString();
  const rows = items.map((i) => ({
    coll: "analysisreq", id: i.key, updated_at: at,
    data: { notifyNo: String(i.notifyNo || i.key).slice(0, 200), bidName: String(i.bidName || "").slice(0, 1000), requestedAt: at, by: member.email },
  }));
  const w = await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!w.ok) return res.status(502).json({ error: `Lưu thất bại (HTTP ${w.status}): ${(await w.text()).slice(0, 200)}` });
  res.json({ saved: rows.map((r) => ({ key: r.id, data: r.data })) });
}
