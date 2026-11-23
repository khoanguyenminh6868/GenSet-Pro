// Bản ghi "mất" của rec-diff: dòng nguồn của nó còn ra bản ghi nào sau khi tách không, và đổi thế nào.
//   node lost-why.mjs <gốc catalog> <hồ sơ trước> <hồ sơ sau> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, fa, fb, out] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const recs = (f) => C.fromSupplier(JSON.parse(fs.readFileSync(f, "utf8")), []);
const A = recs(fa), B = recs(fb);
const key = (r) => [r.n, r.kind, r.model, r.genset ?? "", r.line ?? ""].join(" ¦ ");
const count = (l) => { const m = new Map(); for (const r of l) m.set(key(r), (m.get(key(r)) || 0) + 1); return m; };
const ca = count(A), cb = count(B);
const lost = [], left = new Map(cb);
for (const r of A) { const k = key(r), c = left.get(k) || 0; if (c) left.set(k, c - 1); else lost.push(r); }
const byLine = new Map();
for (const r of B) { const k = `${r.n}¦${r.line ?? ""}`; if (!byLine.has(k)) byLine.set(k, []); byLine.get(k).push(r); }
const tally = {}, detail = [];
for (const r of lost) {
  const after = byLine.get(`${r.n}¦${r.line ?? ""}`) || [];
  const same = after.filter((x) => x.kind === r.kind);
  let why;
  const elsewhere = B.filter((x) => (x.line ?? "") === (r.line ?? "") && x.kind === r.kind && x.model === r.model);
  const inRows = JSON.parse(fs.readFileSync(fb, "utf8")).specTables.filter((t) => t.rows.includes(r.line));
  if (!after.length && elsewhere.length) why = `doi-sang-trang-khac(n${elsewhere[0].n})`;
  else if (!after.length && inRows.length) why = `con-trong-bang-nhung-khong-ra-ban-ghi(n${inRows[0].n})`;
  else if (!after.length) why = "dong-khong-con-trong-bang-nao";
  else if (same.some((x) => x.model === r.model)) why = "cung-model-doi-to-may";
  else if (after.some((x) => x.model === r.model)) why = "cung-model-doi-vai";
  else if (same.length) why = "cung-vai-doi-model";
  else why = "dong-con-ban-ghi-vai-khac";
  tally[why] = (tally[why] || 0) + 1;
  detail.push(`${why}\tn${r.n}\t${r.kind}\t${r.model}\t→ ${after.map((x) => `${x.kind}:${x.model}`).join(", ") || "—"}\t${(r.line || "").slice(0, 120)}`);
}
fs.writeFileSync(out, detail.join("\n") + "\n", "utf8");
console.log(`${path.basename(fa)}: mất ${lost.length}`, JSON.stringify(tally));
