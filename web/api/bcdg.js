// Báo cáo đánh giá E-HSDT (BCĐG) of tenders we bid on (Khoa, 2026-11-12): the files live in the private Supabase bucket
// "bcdg" (<TBMT>/<name>), not on GitHub: the repo is public. The list is the worker's own bcdg/<TBMT> document.
// POST { action: "sign", key, name } with the ingest token -> { path, url }: a signed upload URL (the worker PUTs the file to
//   it straight, so the 4.5 MB body limit of a Vercel function does not apply and no file passes through Vercel).
// GET ?id=<TBMT>/<file> streams one file to a signed-in member.
import { Readable } from "node:stream";
import { SB_URL, memberFrom } from "./_supabase.js";
import { authorized } from "./ingest.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "bcdg";
const KEY_RE = /^[A-Za-z0-9_.-]{1,100}$/;
const sb = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");
// A file of this tender only: <TBMT>/<one plain name>, no "." or ".." that would leave the bucket.
const okId = (key, id) => KEY_RE.test(key || "") && id.startsWith(key + "/") && /^[A-Za-z0-9._-]{1,200}$/.test(id.slice(key.length + 1))
  && !id.split("/").some((s) => /^\.+$/.test(s));
let bucketReady = false;

export default async function handler(req, res) {
  if (req.method === "GET") return download(req, res);
  if (req.method !== "POST") return res.status(405).end();
  try {
    if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
    const { action, key, name } = req.body || {};
    if (action !== "sign") return res.status(400).json({ error: "Thao tác không hợp lệ." });
    if (!KEY_RE.test(key || "")) return res.status(400).json({ error: "Mã gói thầu không hợp lệ." });
    const plain = String(name || "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+/, "_").slice(-120);
    const path = `${key}/${plain}`;
    if (!plain || !okId(key, path)) return res.status(400).json({ error: "Tên tệp không hợp lệ." });
    await ensureBucket();
    const r = await fetch(`${SB_URL}/storage/v1/object/upload/sign/${BUCKET}/${enc(path)}`, { method: "POST", headers: { ...sb, "x-upsert": "true", "Content-Type": "application/json" }, body: "{}" });
    if (!r.ok) return res.status(502).json({ error: `Không cấp được liên kết tải lên (HTTP ${r.status}) ${(await r.text()).slice(0, 200)}` });
    const j = await r.json();
    const rel = String(j.url || "");
    if (!rel.startsWith("/object/upload/sign/")) return res.status(502).json({ error: "Liên kết tải lên không đúng dạng." });
    res.setHeader("Cache-Control", "no-store");
    res.json({ path, url: `${SB_URL}/storage/v1${rel}` });
  } catch (e) { res.status(502).json({ error: e.message || "Lỗi không rõ" }); }
}

// The bucket is made on first use, so nothing has to be set up by hand.
async function ensureBucket() {
  if (bucketReady) return;
  const r = await fetch(`${SB_URL}/storage/v1/bucket`, { method: "POST", headers: { ...sb, "Content-Type": "application/json" }, body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }) });
  if (r.ok || r.status === 409 || /already exists|Duplicate/i.test(await r.text().catch(() => ""))) bucketReady = true;
}

async function download(req, res) {
  const id = String(req.query.id || ""), key = id.split("/")[0];
  if (!okId(key, id)) return res.status(400).end();
  if (!(await memberFrom(req))) return res.status(401).end();
  const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${enc(id)}`, { headers: sb });
  if (!r.ok) return res.status(r.status === 400 || r.status === 404 ? 404 : 502).end();
  res.setHeader("Content-Type", r.headers.get("content-type") || "application/octet-stream");
  res.setHeader("Cache-Control", "private, no-store");
  if (r.headers.get("content-length")) res.setHeader("Content-Length", r.headers.get("content-length"));
  Readable.fromWeb(r.body).pipe(res);
}
