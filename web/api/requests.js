// Pending "Lấy lại tệp" requests for the Windows HSMT worker, read straight from Supabase so the
// worker does not depend on GitHub's cron (which can skip runs). Same token as /api/ingest.
// ?kind=sync answers whether a Sync is waiting for the worker instead, ?kind=analysis lists the
// "Phân tích" requests from the page, ?kind=all returns all three for the local bot, and
// ?kind=docs&coll=<c> returns the documents the worker reads.
import { SB_URL } from "./_supabase.js";
import { authorized } from "./ingest.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
// tracked travels without notes and bid prices: those stay on the web.
const READABLE = new Set(["feed", "seen", "manual", "tracked", "deleted", "analysis", "hsmt", "hsmttext", "notice", "analysisreq", "hsmtreq", "bidders", "portalids", "translationreq", "comparereq", "translation", "compare", "hsdtreq", "hsdt", "tlktreq", "tlkt", "supplier", "supplierreq", "suppliermatch", "configreq", "configmatch", "findreq", "findmatch"]);

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
      let rows = await docs(coll, req.query.id ? String(req.query.id) : "");
      // A supplier deleted on the web (supdeleted/<id>) is skipped by every bot too (Khoa, 2026-11-02).
      if (coll === "supplier") { const gone = new Set((await docs("supdeleted")).map((d) => d.id)); rows = rows.filter((d) => !gone.has(d.id)); }
      return res.json(coll === "tracked" ? rows.map((d) => ({ id: d.id, data: Object.fromEntries(Object.entries(d.data || {}).filter(([k]) => !["note", "bidPrice"].includes(k))) })) : rows);
    } catch (e) { return res.status(502).json({ error: e.message }); }
  }
  try {
    // ?kind=all: everything the local bot polls for, in one call (files, analysis, sync).
    if (req.query?.kind === "all") {
      const [files, analysis, sync, translation, compare, hsdt, tlkt, supplier, config, , find] = await Promise.all([fileReqs(), analysisReqs(), syncReq(), reqsOf("translationreq"), reqsOf("comparereq"), reqsOf("hsdtreq"), reqsOf("tlktreq"), reqsOf("supplierreq"), reqsOf("configreq"), heartbeat(req.query.running), reqsOf("findreq")]);
      return res.json({ files, analysis, sync, translation, compare, hsdt, tlkt, supplier, config, find });
    }
    // ?kind=analysis: tenders whose "Phân tích" button was pressed on the web (analysisreq/<key>).
    if (req.query?.kind === "analysis") return res.json(await analysisReqs());
    // ?kind=translation / ?kind=compare: "Tạo bản tiếng Anh" and "Đối chiếu" pressed on the web.
    if (req.query?.kind === "translation") return res.json(await reqsOf("translationreq"));
    if (req.query?.kind === "compare") return res.json(await reqsOf("comparereq"));
    if (req.query?.kind === "hsdt") return res.json(await reqsOf("hsdtreq"));
    if (req.query?.kind === "tlkt") return res.json(await reqsOf("tlktreq"));
    if (req.query?.kind === "supplier") return res.json(await reqsOf("supplierreq"));
    if (req.query?.kind === "config") return res.json(await reqsOf("configreq"));
    if (req.query?.kind === "find") return res.json(await reqsOf("findreq"));
    // ?kind=sync: the page's Sync button asked the worker to search muasamcong (syncreq/current).
    if (req.query?.kind === "sync") return res.json(await syncReq());
    res.json(await fileReqs());
  } catch (e) { res.status(502).json({ error: e.message }); }
}

// The bot's poll doubles as a heartbeat (botstatus/current), so the page can tell when the Windows PC is off.
async function heartbeat(running) {
  const data = { lastPollAt: new Date().toISOString(), running: running === "1" };
  await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{ coll: "botstatus", id: "current", data, updated_at: data.lastPollAt }]),
  }).catch(() => {});
}
const pendingOf = (d) => d.data?.requestedAt && (d.data.doneAt || "") < d.data.requestedAt;
const byRequested = (a, b) => a.requestedAt.localeCompare(b.requestedAt);
async function fileReqs() {
  return (await docs("hsmtreq")).filter(pendingOf)
    .map((d) => ({ notifyNo: d.data.notifyNo || d.id, key: d.id, sourceUrl: d.data.sourceUrl, bidName: d.data.bidName, requestedAt: d.data.requestedAt }))
    .sort(byRequested);
}
async function analysisReqs() {
  return (await docs("analysisreq")).filter(pendingOf)
    .map((d) => ({ key: d.id, notifyNo: d.data.notifyNo || d.id, requestedAt: d.data.requestedAt }))
    .sort(byRequested);
}
// Translation and comparison requests: [{ key, notifyNo, requestedAt, ...request fields }] (comparereq carries
// the uploaded HSDT files as scratch paths, and the pasted text).
async function reqsOf(coll) {
  return (await docs(coll)).filter(pendingOf).map((d) => ({ ...d.data, key: d.id, notifyNo: d.data.notifyNo || d.id })).sort(byRequested);
}
async function syncReq() {
  const d = (await docs("syncreq", "current"))[0]?.data || {};
  return { pending: !!d.requestedAt && (d.doneAt || "") < d.requestedAt, requestedAt: d.requestedAt || null, mode: d.mode || "" };
}
