// Tender files (public HSMT documents from muasamcong) live on the GitHub Releases "hsmt-<TBMT>" of the
// repo; the worker lists them as /_gh/<asset id>. This streams the file through, because the
// signed GitHub download link has no CORS headers and the page reads PDFs with fetch().
// Suppliers' quotes are not here: they are in Supabase (api/quote.js), as the repo is public.
import { Readable } from "node:stream";

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || "khoanguyenminh6868/GenSet-Pro";
const API = `https://api.github.com/repos/${REPO}/releases/assets/`;

export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^\d{1,15}$/.test(id)) return res.status(400).end();
  if (!TOKEN) return res.status(503).json({ error: "GITHUB_TOKEN chưa được cấu hình" });
  const gh = { Authorization: `Bearer ${TOKEN}`, "X-GitHub-Api-Version": "2022-11-28" };
  const meta = await fetch(API + id, { headers: { ...gh, Accept: "application/vnd.github+json" } });
  if (!meta.ok) return res.status(meta.status === 404 ? 404 : 502).end();
  const a = await meta.json();
  // Only tender files: nothing else of the repo is served here.
  if (!/\/releases\/download\/hsmt-[A-Z]{2}\d{6,}\//.test(a.browser_download_url || "")) return res.status(404).end();
  const link = await fetch(API + id, { headers: { ...gh, Accept: "application/octet-stream" }, redirect: "manual" });
  const to = link.headers.get("location");
  if (!to) return res.status(502).end();
  const range = req.headers.range;
  const r = await fetch(to, { headers: range ? { Range: range } : {} });
  if (!r.ok) return res.status(r.status).end();
  res.status(r.status);
  res.setHeader("Content-Type", a.content_type || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(a.label || a.name)}`);
  res.setHeader("Cache-Control", "private, max-age=86400");
  res.setHeader("Accept-Ranges", "bytes");
  for (const h of ["content-length", "content-range"]) if (r.headers.get(h)) res.setHeader(h, r.headers.get(h));
  Readable.fromWeb(r.body).pipe(res);
}
