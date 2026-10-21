// Machine-to-machine import of results made in the claude.ai artifact (analysis, translations, comparisons).
// The Windows HSMT worker posts { rows: [{ coll, id, data }] } with "Authorization: Bearer <INGEST_TOKEN>".
import { timingSafeEqual } from "node:crypto";
import { SB_URL } from "./_supabase.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COLLS = new Set(["analysis", "translation", "compare"]);
const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
const sbHeaders = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export function authorized(req) {
  const want = process.env.INGEST_TOKEN || "";
  const got = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (want.length < 32 || got.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;
  if (!rows?.length || rows.length > 200) return res.status(400).json({ error: "rows: 1-200 items" });
  for (const r of rows) {
    if (!COLLS.has(r?.coll) || !ID_RE.test(r?.id || "") || !r.data || typeof r.data !== "object") return res.status(400).json({ error: `bad row ${r?.coll}/${r?.id}` });
  }
  // Only finished analyses travel, and never over a newer one already on the web.
  const ana = rows.filter((r) => r.coll === "analysis");
  const have = new Map();
  if (ana.length) {
    const ids = ana.map((r) => `"${r.id}"`).join(",");
    const q = await fetch(`${SB_URL}/rest/v1/docs?select=id,data&coll=eq.analysis&id=in.(${encodeURIComponent(ids)})`, { headers: sbHeaders });
    if (!q.ok) return res.status(502).json({ error: `read ${q.status}` });
    for (const d of await q.json()) have.set(d.id, d.data);
  }
  const keep = rows.filter((r) => {
    if (r.coll !== "analysis") return true;
    if (r.data.status !== "done") return false;
    const cur = have.get(r.id);
    return !(cur?.status === "done" && (cur.analyzedAt || "") >= (r.data.analyzedAt || ""));
  });
  if (keep.length) {
    const now = new Date().toISOString();
    const w = await fetch(`${SB_URL}/rest/v1/docs`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(keep.map((r) => ({ coll: r.coll, id: r.id, data: r.data, updated_at: now }))),
    });
    if (!w.ok) return res.status(502).json({ error: `write ${w.status}: ${(await w.text()).slice(0, 200)}` });
  }
  res.json({ written: keep.length, skipped: rows.length - keep.length });
}
