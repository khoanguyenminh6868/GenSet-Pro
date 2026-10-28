// Adds the tables found by crawl-specs.mjs to the records: node suppliers/merge-specs.mjs [id ...]
// Each saved page becomes a source n (101+, tier A, its first table line as the quote) and each table a specTables
// entry { n, title, header, rows } with the lines exactly as saved. Repeated tables (same rows) are kept once.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const FOREIGN = /[Ѐ-ӿ֐-ۿऀ-෿฀-๿ᄀ-ᇿ぀-ヿ가-힯]/;
const OTHER = /(motor|transformer|pump|compressor|excavator|light(ing)? tower|weld|tractor|truck|vehicle|forklift|load bank|energy storage|bess|solar|inverter|cable|switchgear|fog cannon|agv|mower|washer)/i;
const GEN = /(generat|genset|gen-set|alternator|power station|发电)/i;
let total = 0, recs = 0;
for (const f of fs.readdirSync(path.join(ROOT, "specs")).filter((f) => f.endsWith(".json"))) {
  const id = f.slice(0, -5);
  if (only.length && !only.includes(id)) continue;
  const file = path.join(ROOT, "cn", f);
  if (!fs.existsSync(file)) continue;
  const rec = JSON.parse(fs.readFileSync(file, "utf8"));
  const found = JSON.parse(fs.readFileSync(path.join(ROOT, "specs", f), "utf8"));
  const seen = new Set(), tables = [];
  for (const t of found) {
    // Only gensets and alternators, in English or Chinese: pages in other languages (other scripts) and tables of
    // other products (motors, transformers, pumps...) are left out.
    const all = [t.title, ...t.header, ...t.rows].join(" ");
    if (FOREIGN.test(all) || (OTHER.test(t.title) && !GEN.test(t.title))) continue;
    const key = t.rows.join("\n");
    if (seen.has(key)) continue;
    seen.add(key);
    tables.push({ n: t.n, title: t.title, header: t.header, rows: t.rows });
  }
  const used = [...new Set(tables.map((t) => t.n))];
  rec.sources = rec.sources.filter((s) => s.n < 101);
  for (const n of used) {
    const src = path.join("sources", id, `${n}.md`), head = fs.readFileSync(path.join(ROOT, src), "utf8").split("\n", 2);
    const first = tables.find((t) => t.n === n);
    rec.sources.push({ n, url: head[0].replace(/^URL:\s*/, "").trim(), accessedAt: head[1].replace(/^Accessed:\s*/, "").trim(), tier: "A", quote: [first.header[0] || first.rows[0]], file: src.replace(/\\/g, "/") });
  }
  // Pages saved by the crawl that no table uses are removed.
  const dir = path.join(ROOT, "sources", id);
  // A page newer than specs/<id>.json belongs to a crawl still running: left alone.
  const specTime = fs.statSync(path.join(ROOT, "specs", f)).mtimeMs;
  for (const p of fs.readdirSync(dir)) if (/^\d{3}\.md$/.test(p) && !used.includes(Number(p.slice(0, 3))) && fs.statSync(path.join(dir, p)).mtimeMs <= specTime) fs.rmSync(path.join(dir, p));
  if (tables.length) rec.specTables = tables; else delete rec.specTables;
  fs.writeFileSync(file, JSON.stringify(rec, null, 2) + "\n", "utf8");
  const rows = tables.reduce((a, t) => a + t.rows.length, 0);
  if (rows) { recs++; total += rows; }
}
console.log(`${recs} nhà cung cấp có bảng cấu hình, ${total} dòng model`);
