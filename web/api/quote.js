// Báo giá của Nhà Cung Cấp (tab Tổng quan): suppliers' quotes for a tender live on the GitHub Release "ncc-<TBMT>"
// of the private repo, like the HSMT on "hsmt-<TBMT>". The page uploads each file to the private "scratch" bucket
// (quote/<TBMT>/...) first, because a Vercel function takes at most 4.5 MB of body; this moves it to the release and
// removes it from scratch. The list of suppliers and files is the page's own quote/<TBMT> document.
// POST { action: "upload", key, path, name } -> { id, name, size, url } | { action: "delete", key, id } -> { ok }.
// GITHUB_TOKEN needs Contents: Read and write on the repo.
import { SB_URL, memberFrom, logActivity, removeScratch } from "./_supabase.js";

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || "khoanguyenminh6868/GenSet-Pro";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEY_RE = /^[A-Za-z0-9_.-]{1,100}$/;
const gh = { Authorization: `Bearer ${TOKEN}`, "X-GitHub-Api-Version": "2022-11-28", Accept: "application/vnd.github+json" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const member = await memberFrom(req);
  if (!member) return res.status(401).json({ error: "Chưa đăng nhập hoặc chưa được cấp quyền." });
  if (!TOKEN) return res.status(503).json({ error: "GITHUB_TOKEN chưa được cấu hình" });
  const { action, key } = req.body || {};
  if (!KEY_RE.test(key || "")) return res.status(400).json({ error: "Mã gói thầu không hợp lệ." });
  try {
    if (action === "upload") return res.json(await upload(key, req.body, member));
    if (action === "delete") return res.json(await remove(key, String(req.body.id || "")));
    res.status(400).json({ error: "Thao tác không hợp lệ." });
  } catch (e) { res.status(502).json({ error: e.message || "Lỗi không rõ" }); }
}

async function ghFail(r, what) {
  const body = (await r.text()).slice(0, 200);
  if (r.status === 403 || r.status === 401) return new Error(`GitHub từ chối ${what} (HTTP ${r.status}). GITHUB_TOKEN trên Vercel cần quyền Contents: Read and write.`);
  return new Error(`GitHub: không ${what} được (HTTP ${r.status}) ${body}`);
}

async function release(key, create) {
  const tag = "ncc-" + key;
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${tag}`, { headers: gh });
  if (r.ok) return r.json();
  if (r.status !== 404) throw await ghFail(r, "đọc release");
  if (!create) return null;
  // On the hsmt-inbox branch like the HSMT releases, so no tag points into main.
  const c = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
    method: "POST", headers: { ...gh, "Content-Type": "application/json" },
    body: JSON.stringify({ tag_name: tag, target_commitish: "hsmt-inbox", name: `Báo giá NCC ${key}`, body: "Báo giá của nhà cung cấp, tải lên từ tab Tổng quan." }),
  });
  if (!c.ok) throw await ghFail(c, "tạo release");
  return c.json();
}

async function upload(key, b, member) {
  const path = String(b.path || ""), name = String(b.name || "").slice(0, 300);
  if (!path.startsWith(`quote/${key}/`) || path.includes("..") || !name) throw new Error("Tệp không hợp lệ.");
  const f = await fetch(`${SB_URL}/storage/v1/object/scratch/${path.split("/").map(encodeURIComponent).join("/")}`, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
  if (!f.ok) throw new Error(`Không đọc được tệp vừa tải lên (HTTP ${f.status}).`);
  const data = Buffer.from(await f.arrayBuffer());
  const rel = await release(key, true);
  // Asset names take ASCII only and must be unique in the release: the upload time and the plain-letters name of
  // the scratch path (quote/<TBMT>/<time>/<nn>-<name>). The real name is the label.
  const plain = path.split("/").slice(-2).join("-");
  const u = await fetch(`https://uploads.github.com/repos/${REPO}/releases/${rel.id}/assets?name=${encodeURIComponent(plain)}&label=${encodeURIComponent(name)}`, {
    method: "POST", headers: { ...gh, "Content-Type": f.headers.get("content-type") || "application/octet-stream", "Content-Length": String(data.length) }, body: data,
  });
  if (!u.ok) throw await ghFail(u, "tải tệp lên");
  const a = await u.json();
  await removeScratch([path]);
  await logActivity({ actor: member.email, action: "upload", detail: { key, files: [name], to: "github ncc-" + key } });
  return { id: String(a.id), name, size: a.size, url: "/_gh/" + a.id };
}

async function remove(key, id) {
  if (!/^\d{1,15}$/.test(id)) throw new Error("Mã tệp không hợp lệ.");
  const rel = await release(key, false);
  // Only an asset of this tender's quote release.
  if (!rel?.assets?.some((a) => String(a.id) === id)) return { ok: true };
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${id}`, { method: "DELETE", headers: gh });
  if (!r.ok && r.status !== 404) throw await ghFail(r, "xoá tệp");
  return { ok: true };
}
