// Pending "Lấy lại tệp" requests for the Windows HSMT worker, read straight from Supabase so the
// worker does not depend on GitHub's cron (which can skip runs). Same token as /api/ingest.
// ?kind=sync answers whether a Sync is waiting for the worker instead, ?kind=analysis lists the
// "Phân tích" requests from the page, and ?kind=docs&coll=<c> returns the documents the worker reads.
import { SB_URL } from "./_supabase.js";
import { authorized } from "./ingest.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
// tracked only travels as ids: notes and bid prices stay on the web.
const READABLE = new Set(["feed", "seen", "manual", "tracked", "deleted", "analysis", "hsmt", "hsmttext", "notice", "analysisreq"]);

async function docs(coll, id) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const q = `${SB_URL}/rest/v1/docs?coll=eq.${coll}${id ? `&id=eq.${encodeURIComponent(id)}` : ""}&select=id,data&order=id`;
    const r = await fetch(q, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error(`read ${r.status}`);
    const page = await r.json();
    out.push(...page);
    if (page.length < 1000) return out;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  res.setHeader("Cache-Control", "no-store");
  if (req.query?.kind === "docs") {
    const coll = String(req.query.coll || "");
    if (!READABLE.has(coll)) return res.status(400).json({ error: "coll" });
    try {
      const rows = await docs(coll, req.query.id ? String(req.query.id) : "");
      return res.json(coll === "tracked" ? rows.map((d) => ({ id: d.id, data: {} })) : rows);
    } catch (e) { return res.status(502).json({ error: e.message }); }
  }
  // ?kind=analysis: tenders whose "Phân tích" button was pressed on the web (analysisreq/<key>).
  if (req.query?.kind === "analysis") {
    try {
      const pending = (await docs("analysisreq"))
        .filter((d) => d.data?.requestedAt && (d.data.doneAt || "") < d.data.requestedAt)
        .map((d) => ({ key: d.id, notifyNo: d.data.notifyNo || d.id, requestedAt: d.data.requestedAt }))
        .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
      return res.json(pending);
    } catch (e) { return res.status(502).json({ error: e.message }); }
  }
  // ?kind=sync: the page's Sync button asked the worker to search muasamcong (syncreq/current).
  if (req.query?.kind === "sync") {
    const s = await fetch(`${SB_URL}/rest/v1/docs?coll=eq.syncreq&id=eq.current&select=data`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
    if (!s.ok) return res.status(502).json({ error: `read ${s.status}` });
    const d = (await s.json())[0]?.data || {};
    return res.json({ pending: !!d.requestedAt && (d.doneAt || "") < d.requestedAt, requestedAt: d.requestedAt || null });
  }
  const r = await fetch(`${SB_URL}/rest/v1/docs?coll=eq.hsmtreq&select=id,data`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
  if (!r.ok) return res.status(502).json({ error: `read ${r.status}` });
  const pending = (await r.json())
    .filter((d) => d.data?.requestedAt && (d.data.doneAt || "") < d.data.requestedAt)
    .map((d) => ({ notifyNo: d.data.notifyNo || d.id, key: d.id, sourceUrl: d.data.sourceUrl, bidName: d.data.bidName, requestedAt: d.data.requestedAt }))
    .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
  res.json(pending);
}
