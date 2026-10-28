// Requests from the web page to the Windows worker: Phân tích (analysisreq/<TBMT>), Tải hồ sơ (hsmtreq/<TBMT>)
// Sync (syncreq/current), Tạo bản tiếng Anh (translationreq/<TBMT>), Tạo HSDT tham khảo (hsdtreq/<TBMT>), Đối chiếu (comparereq/<TBMT>, with the HSDT
// files the page uploaded to the private "scratch" bucket under hsdt/<TBMT>/, and the pasted text) and Đối chiếu TLKT
// (tlktreq/<TBMT>, a supplier's technical proposal uploaded under tlkt/<TBMT>/) and Gợi ý nhà cung cấp (supplierreq/<TBMT>). Written server-side for a signed-in member, so they never depend on the
// browser's direct database write. POST { coll, items: [{ key, notifyNo?, bidName?, sourceUrl?, auto?, cancel? }] }.
import { SB_URL, memberFrom } from "./_supabase.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COLLS = new Set(["analysisreq", "hsmtreq", "syncreq", "translationreq", "comparereq", "hsdtreq", "tlktreq", "supplierreq"]);
const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
const sbHeaders = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const str = (v, n) => (v == null ? undefined : String(v).slice(0, n));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const member = await memberFrom(req);
  if (!member) return res.status(401).json({ error: "Chưa đăng nhập hoặc chưa được cấp quyền." });
  const coll = req.body?.coll;
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!COLLS.has(coll)) return res.status(400).json({ error: "Loại yêu cầu không hợp lệ." });
  if (!items.length || items.length > 200 || items.some((i) => !ID_RE.test(i?.key || "") || (coll === "syncreq" && i.key !== "current"))) return res.status(400).json({ error: "Mã gói thầu không hợp lệ." });
  const at = new Date().toISOString();
  // Cancelling keeps the request's fields and marks it done.
  const cur = new Map();
  if (items.some((i) => i.cancel)) {
    const ids = items.filter((i) => i.cancel).map((i) => `"${i.key}"`).join(",");
    const q = await fetch(`${SB_URL}/rest/v1/docs?select=id,data&coll=eq.${coll}&id=in.(${encodeURIComponent(ids)})`, { headers: sbHeaders });
    if (!q.ok) return res.status(502).json({ error: `Đọc thất bại (HTTP ${q.status})` });
    for (const d of await q.json()) cur.set(d.id, d.data);
  }
  const rows = items.map((i) => {
    const data = i.cancel ? { ...(cur.get(i.key) || {}), doneAt: at, error: "" } : JSON.parse(JSON.stringify({
      notifyNo: coll === "syncreq" ? undefined : str(i.notifyNo || i.key, 200), bidName: str(i.bidName, 1000), sourceUrl: str(i.sourceUrl, 1000),
      auto: i.auto ? true : undefined, mode: coll === "syncreq" && i.mode === "new" ? "new" : undefined, requestedAt: at, by: member.email, from: "web",
      ...(coll === "comparereq" ? compareFields(i, "hsdt") : coll === "tlktreq" ? compareFields(i, "tlkt") : {}),
    }));
    return { coll, id: i.key, data, updated_at: at };
  });
  // x-actor: the activity log's trigger records the member, not the service role, as the one who did it.
  const w = await fetch(`${SB_URL}/rest/v1/docs`, { method: "POST", headers: { ...sbHeaders, "x-actor": member.email, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
  if (!w.ok) return res.status(502).json({ error: `Lưu thất bại (HTTP ${w.status}): ${(await w.text()).slice(0, 200)}` });
  res.json({ saved: rows.map((r) => ({ key: r.id, data: r.data })) });
}

// The HSDT of a comparison (or the technical proposal of a TLKT one): files already uploaded under <dir>/<TBMT>/ in the
// scratch bucket, and pasted text. A TLKT one may also carry a shortened YCKT (reqFiles, reqText) that replaces the HSMT.
function compareFields(i, dir) {
  const list = (arr) => (Array.isArray(arr) ? arr : []).slice(0, 50)
    .filter((f) => typeof f?.path === "string" && f.path.startsWith(`${dir}/${i.key}/`) && !f.path.includes(".."))
    .map((f) => ({ path: f.path.slice(0, 600), name: str(f.name, 300), size: Number(f.size) || undefined }));
  if (dir !== "tlkt") return { files: list(i.files), text: str(i.text, 200000) || "" };
  // Tải PDF: translate the stored result into English, nothing else to carry.
  if (i.translate) return { translate: true };
  // A file the browser could not upload travels as its text, so it gets more room.
  return { files: list(i.files), text: str(i.text, 800000) || "", reqFiles: list(i.reqFiles), reqText: str(i.reqText, 400000) || "", uploadError: str(i.uploadError, 500) || "" };
}
