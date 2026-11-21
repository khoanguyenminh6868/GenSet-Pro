// Machine-to-machine writes from the Windows HSMT worker: analyses (also the answers to the page's
// "Phân tích" requests, analysisreq/<TBMT> marked done), errors for unanswered hsmtreq, translations, comparisons, the
// muasamcong sync (feed/current, notice/<TBMT>, syncreq/current marked done), HSMT files and bidders.
// The worker posts { rows: [{ coll, id, data }] } with "Authorization: Bearer <INGEST_TOKEN>".
import { timingSafeEqual } from "node:crypto";
import { SB_URL } from "./_supabase.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
// hsmt + hsmttext: the file list and text the worker reads from the files itself (the hsmt-inbox Action writes the same).
// bidders + portalids: bidders and prices the worker reads from the bid-opening minutes and results on muasamcong.
// translationreq + comparereq + hsdtreq (+ hsdt): the answers to the page's "Tạo bản tiếng Anh", "Đối chiếu" and
// "Tạo HSDT tham khảo" requests; tlktreq + tlkt: "Đối chiếu TLKT" (a supplier's technical proposal).
// supplier: the supplier database (suppliers/upload.mjs); supplierreq + suppliermatch: "Gợi ý top 3 nhà cung cấp";
// configreq + configmatch: "Gợi ý" in the Cấu hình gợi ý tab (suppliers/config-bot.mjs); findreq + findmatch: its "Tìm NCC".
// bidhist: every "máy phát điện" tender on muasamcong with its bidders, prices and won goods (genbid-sync.js history), for
// the Nhà thầu screen and Gợi ý giá đấu; bidpricereq + bidprice: "Gợi ý giá đấu" (suppliers/bidprice-bot.mjs).
// synclog: the last scheduled Sync (always posted, so the activity log shows each one ran).
const COLLS = new Set(["analysis", "translation", "compare", "feed", "notice", "syncreq", "synclog", "analysisreq", "hsmtreq", "hsmt", "hsmttext", "bidders", "portalids", "translationreq", "comparereq", "hsdtreq", "hsdt", "tlktreq", "tlkt", "supplier", "supplierreq", "suppliermatch", "configreq", "configmatch", "findreq", "findmatch", "bidhist", "bidpricereq", "bidprice", "specreq", "specmatch", "gaps", "bcdg"]);
const REQS = new Set(["analysisreq", "hsmtreq", "translationreq", "comparereq", "hsdtreq", "tlktreq", "supplierreq", "configreq", "findreq", "bidpricereq", "specreq"]);
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
    if ((r.coll === "feed" || r.coll === "syncreq" || r.coll === "synclog") && r.id !== "current") return res.status(400).json({ error: `bad row ${r.coll}/${r.id}` });
  }
  // A Sync pressed after the worker read the request stays pending: the worker's "done" never overwrites a newer request.
  const sync = rows.find((r) => r.coll === "syncreq");
  let newerSync = false;
  if (sync) {
    const q = await fetch(`${SB_URL}/rest/v1/docs?select=data&coll=eq.syncreq&id=eq.current`, { headers: sbHeaders });
    if (!q.ok) return res.status(502).json({ error: `read ${q.status}` });
    const cur = (await q.json())[0]?.data;
    newerSync = (cur?.requestedAt || "") > (sync.data.requestedAt || "");
  }
  // Same for a "Phân tích" or "Lấy lại tệp" pressed again while the worker was busy (the bot also posts
  // hsmtreq/analysisreq with an error when a round left a request unanswered).
  const newerReq = new Set();
  for (const coll of REQS) {
    const areq = rows.filter((r) => r.coll === coll);
    if (!areq.length) continue;
    const ids = areq.map((r) => `"${r.id}"`).join(",");
    const q = await fetch(`${SB_URL}/rest/v1/docs?select=id,data&coll=eq.${coll}&id=in.(${encodeURIComponent(ids)})`, { headers: sbHeaders });
    if (!q.ok) return res.status(502).json({ error: `read ${q.status}` });
    const cur = new Map((await q.json()).map((d) => [d.id, d.data]));
    for (const r of areq) if ((cur.get(r.id)?.requestedAt || "") > (r.data.requestedAt || "")) newerReq.add(coll + "/" + r.id);
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
  // The first scheduled Sync of the day (Vietnam time) clears activity log rows older than one day (Khoa 09/11:
  // keep at most one day). Checked before this synclog is written, so its own log row does not count.
  if (rows.some((r) => r.coll === "synclog")) await pruneLog().catch((e) => console.error("prune activity_log:", e.message));
  const keep = rows.filter((r) => {
    if (r.coll === "syncreq") return !newerSync;
    if (REQS.has(r.coll)) return !newerReq.has(r.coll + "/" + r.id);
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
  const joined = await markJoined(keep.filter((r) => r.coll === "bidders")).catch(() => []);
  const reopened = await reopenAmended(keep.find((r) => r.coll === "feed")).catch(() => []);
  // A comparison or a Tạo HSDT tham khảo answered: its uploaded files (HSDT, technical proposal, template HSDT, supplier
  // configuration) are no longer needed in the scratch bucket (Khoa, 2026-11-05: also after Tạo HSDT tham khảo).
  const SCRATCH_DIR = { comparereq: "hsdt", hsdtreq: "hsdt", tlktreq: "tlkt" };
  await Promise.all(keep.filter((r) => SCRATCH_DIR[r.coll] && r.data.doneAt).map((r) => dropScratch(SCRATCH_DIR[r.coll], r.id, r.coll).catch(() => {})));
  res.json({ written: keep.length, skipped: rows.length - keep.length, ...(joined.length ? { joined } : {}), ...(reopened.length ? { reopened } : {}) });
}

// Khoa's company (CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN). A tender whose bidders include it was bid on:
// one still in an early stage (Mới, Đang xem, Chuẩn bị HSDT, also shown as Đã đóng) moves to Đã nộp, with our
// price when none was entered. Once the result is out (final), it moves on to Trúng thầu or Không trúng, also from
// Đã nộp (Khoa, 2026-10-27). Bỏ qua and a result already set stay as the user set them. Returns the ids moved.
const OUR_TAX = "4101623015";
async function markJoined(rows) {
  const moved = [];
  for (const r of rows) {
    const mine = (r.data.list || []).filter((x) => String(x.taxCode || "").replace(/\D/g, "") === OUR_TAX);
    const us = mine.find((x) => x.won) || mine[0];
    if (!us) continue;
    const stage = !r.data.final ? "submitted" : mine.some((x) => x.won) ? "won" : "lost";
    const get = async (coll, id) => {
      const q = await fetch(`${SB_URL}/rest/v1/docs?select=data&coll=eq.${coll}&id=eq.${encodeURIComponent(id)}`, { headers: sbHeaders });
      return q.ok ? (await q.json())[0]?.data : undefined;
    };
    const cur = (await get("tracked", r.id)) || {};
    if (cur.stage && !["new", "reviewing", "preparing", ...(stage === "submitted" ? [] : ["submitted"])].includes(cur.stage)) continue;
    const tender = cur.tender || (await get("seen", r.id)) || (await get("manual", r.id)) || ((await get("feed", "current"))?.tenders || []).find((t) => t.notifyNo === r.id);
    if (!tender) continue;
    const price = us.priceAfterDiscount ?? us.bidPrice;
    const now = new Date().toISOString();
    // wonAt: the web announces the win under the banner until Khoa closes it (wonSeenAt).
    const data = { ...cur, stage, prevStage: cur.stage || "new", tender, note: cur.note || "", updatedAt: now, ...(stage === "won" ? { wonAt: now } : {}),
      ...(cur.bidPrice || !price ? {} : { bidPrice: price, bidPriceSrc: r.data.final ? "KQLCNT" : "biên bản mở thầu" }) };
    const w = await fetch(`${SB_URL}/rest/v1/docs`, { method: "POST", headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ coll: "tracked", id: r.id, data, updated_at: now }]) });
    if (w.ok) moved.push(r.id);
  }
  return moved;
}

// A tender set to Bỏ qua whose notice was then amended on muasamcong (a higher notifyVersion in feed/current, e.g. a
// new closing date) goes back to Mới, with the new notice; its note stays (Khoa, 2026-10-29). A bid dropped from Đã nộp
// stays dropped. Returns the ids moved.
// A cancelled notice (Đã hủy TBMT, which also raises notifyVersion) is not an amendment: it never goes back to Mới, and
// its status is written into tracked/<TBMT>.tender and seen/<TBMT> so it stays cancelled once Sync drops it from the
// feed (Khoa, 2026-11-04).
async function reopenAmended(feed) {
  const tenders = feed?.data?.tenders || [];
  if (!tenders.length) return [];
  const ids = encodeURIComponent(tenders.map((t) => t.notifyNo).join(","));
  const q = await fetch(`${SB_URL}/rest/v1/docs?select=coll,id,data&coll=in.(tracked,seen)&id=in.(${ids})`, { headers: sbHeaders });
  if (!q.ok) return [];
  const docs = await q.json();
  const cur = new Map(docs.filter((d) => d.coll === "tracked").map((d) => [d.id, d.data]));
  const seen = new Map(docs.filter((d) => d.coll === "seen").map((d) => [d.id, d.data]));
  const now = new Date().toISOString(), out = [], marks = [];
  for (const t of tenders) {
    const c = cur.get(t.notifyNo);
    if (t.status === "cancelled") {
      if (c && c.tender?.status !== "cancelled") marks.push({ coll: "tracked", id: t.notifyNo, updated_at: now, data: { ...c, tender: { ...c.tender, ...t } } });
      const s = seen.get(t.notifyNo);
      if (s && s.status !== "cancelled") marks.push({ coll: "seen", id: t.notifyNo, updated_at: now, data: { ...s, status: "cancelled" } });
      continue;
    }
    if (c?.stage !== "dropped" || c.prevStage === "submitted" || !(Number(t.notifyVersion) > Number(c.tender?.notifyVersion))) continue;
    out.push({ coll: "tracked", id: t.notifyNo, updated_at: now,
      data: { ...c, stage: "new", prevStage: "dropped", tender: t, note: c.note || "", updatedAt: now, reopenedAt: now, reopenedVersion: t.notifyVersion } });
  }
  if (!out.length && !marks.length) return [];
  const w = await fetch(`${SB_URL}/rest/v1/docs`, { method: "POST", headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify([...out, ...marks]) });
  return w.ok ? out.map((r) => r.id) : [];
}

// Deletes every file the page uploaded for a tender under <dir>/<TBMT>/<time>/<file> in the scratch bucket: the HSDT of
// a Đối chiếu or the template / supplier configuration of a Tạo HSDT tham khảo (dir "hsdt"), the technical proposal of
// a Đối chiếu TLKT (dir "tlkt"). Only called once the latest request of `coll` was answered. Đối chiếu and Tạo HSDT
// tham khảo share hsdt/<TBMT>/, so the files the other one still waits for are kept.
const SHARED_REQ = { comparereq: "hsdtreq", hsdtreq: "comparereq" };
async function dropScratch(dir0, key, coll) {
  const st = `${SB_URL}/storage/v1/object`;
  const busy = new Set();
  if (SHARED_REQ[coll]) {
    const q = await fetch(`${SB_URL}/rest/v1/docs?select=data&coll=eq.${SHARED_REQ[coll]}&id=eq.${encodeURIComponent(key)}`, { headers: sbHeaders });
    if (!q.ok) return 0; // unsure what the other request needs: delete nothing now, the next answer cleans up
    const other = (await q.json())[0]?.data;
    if (other?.requestedAt && !(other.doneAt && other.doneAt >= other.requestedAt))
      for (const f of [...(other.files || []), ...(other.templateFiles || []), ...(other.configFiles || [])]) if (f?.path) busy.add(f.path);
  }
  const list = async (prefix) => {
    const r = await fetch(`${st}/list/scratch`, { method: "POST", headers: sbHeaders, body: JSON.stringify({ prefix, limit: 1000 }) });
    return r.ok ? await r.json() : [];
  };
  const paths = [];
  for (const dir of await list(`${dir0}/${key}`)) {
    if (dir.id) { paths.push(`${dir0}/${key}/${dir.name}`); continue; }
    for (const f of await list(`${dir0}/${key}/${dir.name}`)) if (f.id) paths.push(`${dir0}/${key}/${dir.name}/${f.name}`);
  }
  const drop = paths.filter((p) => !busy.has(p));
  if (drop.length) await fetch(`${st}/scratch`, { method: "DELETE", headers: sbHeaders, body: JSON.stringify({ prefixes: drop }) });
  return drop.length;
}

async function pruneLog() {
  const vnDay = new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
  const dayStart = new Date(`${vnDay}T00:00:00+07:00`).toISOString();
  const q = await fetch(`${SB_URL}/rest/v1/activity_log?select=id&coll=eq.synclog&at=gte.${encodeURIComponent(dayStart)}&limit=1`, { headers: sbHeaders });
  if (!q.ok) throw new Error(`read ${q.status}`);
  if ((await q.json()).length) return;
  const cut = new Date(Date.now() - 864e5).toISOString();
  const d = await fetch(`${SB_URL}/rest/v1/activity_log?at=lt.${encodeURIComponent(cut)}`, { method: "DELETE", headers: { ...sbHeaders, Prefer: "return=minimal" } });
  if (!d.ok) throw new Error(`delete ${d.status}`);
}
