// Pending "Lấy lại tệp" requests for the Windows HSMT worker, read straight from Supabase so the
// worker does not depend on GitHub's cron (which can skip runs). Same token as /api/ingest.
// ?kind=sync answers whether a Sync is waiting for the worker instead, ?kind=analysis lists the
// "Phân tích" requests from the page, ?kind=all returns all three for the local bot, and
// ?kind=docs&coll=<c> returns the documents the worker reads.
import { SB_URL } from "./_supabase.js";
import { authorized } from "./ingest.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
// tracked travels without notes and bid prices: those stay on the web.
const READABLE = new Set(["feed", "seen", "manual", "tracked", "deleted", "analysis", "hsmt", "hsmttext", "notice", "analysisreq", "hsmtreq", "bidders", "portalids", "translationreq", "comparereq", "translation", "compare", "hsdtreq", "hsdt", "tlktreq", "tlkt", "supplier", "supexcl", "supdeleted", "supplierreq", "suppliermatch", "configreq", "configmatch", "findreq", "findmatch", "specreq", "specmatch", "bidhist", "bidpricereq", "bidprice", "bcdg"]);

// ids: only these documents (a list of at most ~100, for a bot that keeps its own copy); cols: e.g. "id,updated_at".
async function docs(coll, id, { ids, cols = "id,data" } = {}) {
  const out = [];
  const only = ids ? `&id=in.(${encodeURIComponent(ids.map((x) => `"${x.replace(/["\\]/g, "\\$&")}"`).join(","))})` : "";
  for (let from = 0; ; from += 1000) {
    const q = `${SB_URL}/rest/v1/docs?coll=eq.${coll}${id ? `&id=eq.${encodeURIComponent(id)}` : ""}${only}&select=${cols}&order=id`;
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
  // ?kind=stamps&coll=<c>: [{ id, updated_at }] of every document, so a bot that keeps a copy on disk
  // (suppliers/doc-cache.mjs) reads only the new or changed ones with ?kind=docs&coll=<c>&ids=a,b (Supabase egress).
  if (req.query?.kind === "docs" || req.query?.kind === "stamps") {
    const coll = String(req.query.coll || "");
    if (!READABLE.has(coll)) return res.status(400).json({ error: "coll" });
    const ids = req.query.ids ? String(req.query.ids).split(",").filter(Boolean) : null;
    if (ids && (!ids.length || ids.length > 100)) return res.status(400).json({ error: "ids" });
    try {
      let rows = req.query.kind === "stamps" ? await docs(coll, "", { cols: "id,updated_at" }) : await docs(coll, req.query.id ? String(req.query.id) : "", { ids });
      // A supplier deleted on the web (supdeleted/<id>) is skipped by every bot too (Khoa, 2026-11-02).
      // A supplier excluded on the web (supexcl/<id> {on:true}) is skipped by every bot too (Khoa, 2026-11-11).
      if (coll === "supplier") {
        const [del, exc] = await Promise.all([docs("supdeleted", "", { cols: "id" }), docs("supexcl", "", { cols: "id,data" })]);
        const gone = new Set([...del.map((d) => d.id), ...exc.filter((d) => d.data?.on === true).map((d) => d.id)]);
        rows = rows.filter((d) => !gone.has(d.id));
      }
      return res.json(coll === "tracked" && req.query.kind === "docs" ? rows.map((d) => ({ id: d.id, data: Object.fromEntries(Object.entries(d.data || {}).filter(([k]) => !["note", "bidPrice"].includes(k))) })) : rows);
    } catch (e) { return res.status(502).json({ error: e.message }); }
  }
  try {
    // ?kind=all: everything the local bot polls for, in one call (files, analysis, sync).
    // The dates of every request type are read in one Supabase request (each request is a line of Supabase's log
    // ingestion, and this runs every 15 s); only the pending rows are then read whole.
    if (req.query?.kind === "all") {
      // beat=0: the bot (GenBid-Bot.ps1) wrote the heartbeat less than a minute ago; the page waits 3 minutes before
      // saying the PC is off. Without beat (an older bot) the heartbeat is written every poll, as before.
      const [marks] = await Promise.all([pendingMarks(), req.query.beat === "0" ? null : heartbeat(req.query.running)]);
      const [files, analysis, sync, translation, compare, hsdt, tlkt, supplier, config, find, bidprice, spec] = await Promise.all([fileReqs(marks), analysisReqs(marks), syncReq(marks), reqsOf("translationreq", marks), reqsOf("comparereq", marks), reqsOf("hsdtreq", marks), reqsOf("tlktreq", marks), reqsOf("supplierreq", marks), reqsOf("configreq", marks), reqsOf("findreq", marks), reqsOf("bidpricereq", marks), reqsOf("specreq", marks)]);
      return res.json({ files, analysis, sync, translation, compare, hsdt, tlkt, supplier, config, find, bidprice, spec });
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
    // ?kind=spec: Tìm Thông Số of a supplier (specreq/<supplier id>, run by config-bot.mjs run).
    if (req.query?.kind === "spec") return res.json(await reqsOf("specreq"));
    // ?kind=bidprice: "Gợi ý giá đấu" (suppliers/bidprice-bot.mjs, run by config-bot.mjs run).
    if (req.query?.kind === "bidprice") return res.json(await reqsOf("bidpricereq"));
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
// The pending requests of a collection, whole. The bot polls every 15 s and nearly every row is already done, so
// list only the two dates first and read the whole rows of the pending ones (Supabase egress: ~20 KB a poll before).
const ALL_REQ = ["hsmtreq", "analysisreq", "syncreq", "translationreq", "comparereq", "hsdtreq", "tlktreq", "supplierreq", "configreq", "findreq", "bidpricereq", "specreq"];
// { coll: [{ id, requestedAt, doneAt, mode }] } for these collections, in as few requests as the rows allow (1000 a page).
async function marksOf(colls) {
  const out = Object.fromEntries(colls.map((c) => [c, []]));
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SB_URL}/rest/v1/docs?coll=in.(${colls.join(",")})&select=coll,id,requestedAt:data->>requestedAt,doneAt:data->>doneAt,mode:data->>mode&order=coll,id`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error(`read ${r.status}`);
    const page = await r.json();
    for (const { coll, ...m } of page) out[coll]?.push(m);
    if (page.length < 1000) return out;
  }
}
// The bot's poll (every 15 s) needs only the pending requests, but listing the dates of every request row was ~13 KB
// (2 KB gzipped) a poll, growing with the tenders: up to ~2.2 GB a month of Supabase egress. The view
// public.pending_requests (web/supabase/pending-requests.sql, run once in the SQL editor) returns only the pending rows,
// and syncreq/current always, in the shape marksOf() gives. Until it exists (PostgREST answers 404), the poll lists every
// row as before. Anything else than a list from the view (missing, no right, an error, a network failure) must not stop
// the bot either: the poll lists every row, and the view is left alone for 10 minutes so a poll stays one request.
let viewSkipUntil = 0;
async function pendingMarks() {
  if (Date.now() >= viewSkipUntil) {
    let why;
    try {
      const r = await fetch(`${SB_URL}/rest/v1/pending_requests?select=coll,id,requestedAt,doneAt,mode&order=coll,id`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
      const rows = r.ok ? await r.json() : null;
      if (Array.isArray(rows) && rows.every((m) => m && typeof m.coll === "string" && typeof m.id === "string")) {
        const out = Object.fromEntries(ALL_REQ.map((c) => [c, []]));
        for (const { coll, ...m } of rows) out[coll]?.push(m);
        return out;
      }
      why = r.ok ? "not a list" : `HTTP ${r.status}`;
    } catch (e) { why = e.message; }
    viewSkipUntil = Date.now() + 10 * 60e3;
    console.warn(`pending_requests: ${why}; listing every request for 10 minutes`);
  }
  return marksOf(ALL_REQ);
}
// all: marksOf() already read for several collections (?kind=all); otherwise this collection's are read here.
async function pendingDocs(coll, all) {
  const sb = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
  const marks = (all || await marksOf([coll]))[coll] || [];
  const ids = marks.filter((m) => pendingOf({ data: m })).map((m) => m.id);
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const list = ids.slice(i, i + 50).map((id) => `"${id.replace(/["\\]/g, "\\$&")}"`).join(",");
    const r = await fetch(`${SB_URL}/rest/v1/docs?coll=eq.${coll}&id=in.(${encodeURIComponent(list)})&select=id,data&order=id`, { headers: sb });
    if (!r.ok) throw new Error(`read ${r.status}`);
    out.push(...await r.json());
  }
  return out.filter(pendingOf);
}
const byRequested = (a, b) => a.requestedAt.localeCompare(b.requestedAt);
async function fileReqs(marks) {
  return (await pendingDocs("hsmtreq", marks))
    .map((d) => ({ notifyNo: d.data.notifyNo || d.id, key: d.id, sourceUrl: d.data.sourceUrl, bidName: d.data.bidName, requestedAt: d.data.requestedAt }))
    .sort(byRequested);
}
async function analysisReqs(marks) {
  return (await pendingDocs("analysisreq", marks))
    .map((d) => ({ key: d.id, notifyNo: d.data.notifyNo || d.id, requestedAt: d.data.requestedAt }))
    .sort(byRequested);
}
// Translation and comparison requests: [{ key, notifyNo, requestedAt, ...request fields }] (comparereq carries
// the uploaded HSDT files as scratch paths, and the pasted text).
async function reqsOf(coll, marks) {
  return (await pendingDocs(coll, marks)).map((d) => ({ ...d.data, key: d.id, notifyNo: d.data.notifyNo || d.id })).sort(byRequested);
}
async function syncReq(marks) {
  const d = marks ? marks.syncreq?.find((m) => m.id === "current") || {} : (await docs("syncreq", "current"))[0]?.data || {};
  return { pending: !!d.requestedAt && (d.doneAt || "") < d.requestedAt, requestedAt: d.requestedAt || null, mode: d.mode || "" };
}
