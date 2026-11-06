// Posts the supplier records to the web as supplier/<id>: node suppliers/upload.mjs [--dry]
// Runs verify.mjs first and stops on any error. Records with status "incomplete" stay local. The saved source pages
// (sources/) never leave git. The ingest token is read from the file and never printed.
// With SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set (the GitHub workflow supplier-publish.yml), the rows go straight
// to the docs table instead, the way /api/ingest writes them.
import fs from "node:fs";
import path from "node:path";
import { checkRecord, loadAll } from "./verify.mjs";

const WEB = process.env.GENBID_WEB || "https://genset-pro-web.vercel.app";
const TOKEN_FILE = process.env.GENBID_INGEST_TOKEN_FILE || "C:/Projects/GenSet Pro/.genbid-ingest-token";
const dry = process.argv.includes("--dry");

const all = loadAll();
const bad = all.filter(({ rec, file, parseError }) => parseError || checkRecord(rec, file).errors.length);
if (bad.length) {
  console.error(`Dừng: ${bad.length} bản ghi có lỗi (${bad.map((b) => path.basename(b.file)).join(", ")}). Chạy node suppliers/verify.mjs để xem.`);
  process.exit(1);
}
// --only a.json,b.json: post just these files (the workflow passes the ones the push changed). Re-posting an unchanged
// record still bumps its updated_at, which makes every open page read the whole supplier set again (Supabase egress).
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > 0 ? new Set((process.argv[onlyArg + 1] || "").split(",").map((f) => path.basename(f.trim())).filter(Boolean)) : null;
const chosen = only ? all.filter(({ file }) => only.has(path.basename(file))) : all;
const rows = chosen.map(({ rec }) => rec).filter((r) => r.status !== "incomplete").map((r) => ({ coll: "supplier", id: r.id, data: r }));
console.log(`${rows.length} bản ghi sẽ đăng (${chosen.length - rows.length} incomplete giữ lại${only ? `, chỉ ${only.size} tệp đã đổi` : ""}).`);
if (!rows.length) process.exit(0);
if (dry) process.exit(0);

const SB = process.env.SUPABASE_URL, SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const token = SB && SERVICE ? null : fs.readFileSync(TOKEN_FILE, "utf8").trim();
// Batches of at most 200 rows and about 2 MB (Vercel takes 4.5 MB per request; spec tables make records large).
const batches = [];
for (const row of rows) {
  const last = batches[batches.length - 1], size = JSON.stringify(row).length;
  if (!last || last.rows.length >= 200 || last.size + size > 2e6) batches.push({ rows: [row], size });
  else { last.rows.push(row); last.size += size; }
}
for (const b of batches) {
  const now = new Date().toISOString();
  const r = token
    ? await fetch(`${WEB}/api/ingest`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ rows: b.rows }) })
    : await fetch(`${SB}/rest/v1/docs`, {
      method: "POST",
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(b.rows.map((x) => ({ coll: x.coll, id: x.id, data: x.data, updated_at: now }))),
    });
  const body = await r.text();
  if (!r.ok) { console.error(`HTTP ${r.status}: ${body.slice(0, 300)}`); process.exit(1); }
  console.log(body || `${b.rows.length} bản ghi đã đăng`);
}
