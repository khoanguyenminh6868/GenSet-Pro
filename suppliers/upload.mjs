// Posts the supplier records to the web as supplier/<id>: node suppliers/upload.mjs [--dry]
// Runs verify.mjs first and stops on any error. Records with status "incomplete" stay local. The saved source pages
// (sources/) never leave git. The ingest token is read from the file and never printed.
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
const rows = all.map(({ rec }) => rec).filter((r) => r.status !== "incomplete").map((r) => ({ coll: "supplier", id: r.id, data: r }));
console.log(`${rows.length} bản ghi sẽ đăng (${all.length - rows.length} incomplete giữ lại).`);
if (dry) process.exit(0);

const token = fs.readFileSync(TOKEN_FILE, "utf8").trim();
for (let i = 0; i < rows.length; i += 200) {
  const r = await fetch(`${WEB}/api/ingest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ rows: rows.slice(i, i + 200) }),
  });
  const body = await r.text();
  if (!r.ok) { console.error(`HTTP ${r.status}: ${body.slice(0, 300)}`); process.exit(1); }
  console.log(body);
}
