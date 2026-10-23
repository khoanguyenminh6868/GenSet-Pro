// A short-lived download link for a file the page uploaded to the private "scratch" bucket (the HSDT files of a
// "Đối chiếu" request), for the Windows worker. GET ?path=<path> with the ingest token -> { url } (valid 10 minutes).
import { SB_URL } from "./_supabase.js";
import { authorized } from "./ingest.js";

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PATH_RE = /^hsdt\/[A-Za-z0-9_\-.~:@+]{1,200}\/[^\\]{1,400}$/;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  const path = String(req.query?.path || "");
  if (!PATH_RE.test(path) || path.includes("..")) return res.status(400).json({ error: "path" });
  const r = await fetch(`${SB_URL}/storage/v1/object/sign/scratch/${path.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 600 }),
  });
  if (!r.ok) return res.status(r.status === 400 || r.status === 404 ? 404 : 502).json({ error: `sign ${r.status}` });
  const { signedURL } = await r.json();
  res.setHeader("Cache-Control", "no-store");
  res.json({ url: SB_URL + "/storage/v1" + signedURL });
}
