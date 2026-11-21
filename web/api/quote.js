// Báo giá của Nhà Cung Cấp (tab Giá gợi ý): suppliers' quotes for a tender live in the private Supabase bucket
// "quote" (<TBMT>/<time>-<nn>-<name>), not on GitHub: the repo is public (Khoa, 2026-11-05). The page uploads each
// file to the private "scratch" bucket (quote/<TBMT>/...) first, because a Vercel function takes at most 4.5 MB of
// body; this moves it to "quote" and removes it from scratch. The list of suppliers and files is the page's own
// quote/<TBMT> document.
// POST { action: "upload", key, path, name } -> { id, name, size, url } | { action: "delete", key, id } -> { ok }.
// GET ?id=<TBMT>/<file> streams one file to a signed-in member (the url the upload returned).
// POST { action: "migrate" } with the ingest token moves the files of the old GitHub Releases "ncc-<TBMT>" here.
import { Readable } from "node:stream";
import { SB_URL, memberFrom, logActivity, removeScratch } from "./_supabase.js";
import { authorized } from "./ingest.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "quote";
const KEY_RE = /^[A-Za-z0-9_.-]{1,100}$/;
const sb = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");
const fileUrl = (id) => "/api/quote?id=" + encodeURIComponent(id);
// A file of this tender only: <TBMT>/<one plain name>, no "." or ".." that would leave the bucket.
const okId = (key, id) => KEY_RE.test(key || "") && id.startsWith(key + "/") && /^[A-Za-z0-9._-]{1,200}$/.test(id.slice(key.length + 1))
  && !id.split("/").some((s) => /^\.+$/.test(s));

export default async function handler(req, res) {
  if (req.method === "GET") return download(req, res);
  if (req.method !== "POST") return res.status(405).end();
  const { action, key } = req.body || {};
  try {
    if (action === "migrate") {
      if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
      return res.json(await migrate());
    }
    const member = await memberFrom(req);
    if (!member) return res.status(401).json({ error: "Chưa đăng nhập hoặc chưa được cấp quyền." });
    if (!KEY_RE.test(key || "")) return res.status(400).json({ error: "Mã gói thầu không hợp lệ." });
    if (action === "upload") return res.json(await upload(key, req.body, member));
    if (action === "delete") return res.json(await remove(key, String(req.body.id || "")));
    res.status(400).json({ error: "Thao tác không hợp lệ." });
  } catch (e) { res.status(502).json({ error: e.message || "Lỗi không rõ" }); }
}

// The bucket is made on first use, so nothing has to be set up by hand.
async function put(id, data, type) {
  const send = () => fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${enc(id)}`, {
    method: "POST", headers: { ...sb, "Content-Type": type || "application/octet-stream", "x-upsert": "true" }, body: data,
  });
  let r = await send();
  if (!r.ok && /bucket not found/i.test(await r.clone().text())) {
    await fetch(`${SB_URL}/storage/v1/bucket`, { method: "POST", headers: { ...sb, "Content-Type": "application/json" }, body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }) });
    r = await send();
  }
  if (!r.ok) throw new Error(`Không lưu được tệp (HTTP ${r.status}) ${(await r.text()).slice(0, 200)}`);
}

async function upload(key, b, member) {
  const path = String(b.path || ""), name = String(b.name || "").slice(0, 300);
  if (!path.startsWith(`quote/${key}/`) || path.includes("..") || !name) throw new Error("Tệp không hợp lệ.");
  const f = await fetch(`${SB_URL}/storage/v1/object/scratch/${enc(path)}`, { headers: sb });
  if (!f.ok) throw new Error(`Không đọc được tệp vừa tải lên (HTTP ${f.status}).`);
  const data = Buffer.from(await f.arrayBuffer());
  // The plain-letters name of the scratch path (quote/<TBMT>/<time>/<nn>-<name>) is unique; the real name stays in the list.
  const id = `${key}/${path.split("/").slice(-2).join("-")}`;
  await put(id, data, f.headers.get("content-type"));
  await removeScratch([path]);
  await logActivity({ actor: member.email, action: "upload", detail: { key, files: [name], to: `${BUCKET}/${id}` } });
  return { id, name, size: data.length, url: fileUrl(id) };
}

async function remove(key, id) {
  if (!okId(key, id)) return { ok: true };
  const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}`, { method: "DELETE", headers: { ...sb, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [id] }) });
  if (!r.ok && r.status !== 404) throw new Error(`Không xoá được tệp (HTTP ${r.status}).`);
  return { ok: true };
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

// One-off: files of the GitHub Releases "ncc-<TBMT>" (drafts included) go to the bucket, quote/<TBMT> points at
// them, then the release and its tag are deleted.
async function migrate() {
  const TOKEN = process.env.GITHUB_TOKEN, REPO = process.env.GITHUB_REPO || "khoanguyenminh6868/GenSet-Pro";
  const gh = { Authorization: `Bearer ${TOKEN}`, "X-GitHub-Api-Version": "2022-11-28", Accept: "application/vnd.github+json" };
  const out = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, { headers: gh });
    if (!r.ok) throw new Error(`GitHub releases: HTTP ${r.status}`);
    const list = await r.json();
    for (const rel of list.filter((x) => /^ncc-[A-Za-z0-9_.-]+$/.test(x.tag_name || ""))) {
      const key = rel.tag_name.slice(4), moved = {};
      for (const a of rel.assets) {
        const d = await fetch(a.url, { headers: { ...gh, Accept: "application/octet-stream" } });
        if (!d.ok) throw new Error(`${a.name}: HTTP ${d.status}`);
        const id = `${key}/${a.name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(-200)}`;
        await put(id, Buffer.from(await d.arrayBuffer()), a.content_type);
        moved[String(a.id)] = id;
      }
      const q = await fetch(`${SB_URL}/rest/v1/docs?select=data&coll=eq.quote&id=eq.${encodeURIComponent(key)}`, { headers: sb });
      const doc = q.ok ? (await q.json())[0]?.data : null;
      if (doc?.rows) {
        doc.rows = doc.rows.map((row) => ({ ...row, files: (row.files || []).map((f) => (moved[f.id] ? { ...f, id: moved[f.id], url: fileUrl(moved[f.id]) } : f)) }));
        const w = await fetch(`${SB_URL}/rest/v1/docs?coll=eq.quote&id=eq.${encodeURIComponent(key)}`, {
          method: "PATCH", headers: { ...sb, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ data: doc, updated_at: new Date().toISOString() }),
        });
        if (!w.ok) throw new Error(`quote/${key}: HTTP ${w.status}`);
      }
      await fetch(`https://api.github.com/repos/${REPO}/releases/${rel.id}`, { method: "DELETE", headers: gh });
      await fetch(`https://api.github.com/repos/${REPO}/git/refs/tags/${rel.tag_name}`, { method: "DELETE", headers: gh });
      out.push({ key, files: Object.keys(moved).length, doc: !!doc?.rows });
    }
    if (list.length < 100) break;
  }
  return { moved: out };
}
