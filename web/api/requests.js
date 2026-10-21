// Pending "Lấy lại tệp" requests for the Windows HSMT worker, read straight from Supabase so the
// worker does not depend on GitHub's cron (which can skip runs). Same token as /api/ingest.
import { SB_URL } from "./_supabase.js";
import { authorized } from "./ingest.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  const r = await fetch(`${SB_URL}/rest/v1/docs?coll=eq.hsmtreq&select=id,data`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
  if (!r.ok) return res.status(502).json({ error: `read ${r.status}` });
  const pending = (await r.json())
    .filter((d) => d.data?.requestedAt && (d.data.doneAt || "") < d.data.requestedAt)
    .map((d) => ({ notifyNo: d.data.notifyNo || d.id, key: d.id, sourceUrl: d.data.sourceUrl, bidName: d.data.bidName, requestedAt: d.data.requestedAt }))
    .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
  res.setHeader("Cache-Control", "no-store");
  res.json(pending);
}
