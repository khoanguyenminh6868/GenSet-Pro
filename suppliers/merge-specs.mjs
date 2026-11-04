// Adds the tables found by crawl-specs.mjs and crawl-datasheets.mjs to the records: node suppliers/merge-specs.mjs [id ...]
// Each saved page becomes a source n (101+ product pages, 1001+ datasheets; tier A, its first table line as the
// quote) and each table a specTables entry { n, title, header, rows } with the lines exactly as saved. Repeated
// tables (same rows) are kept once.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const FOREIGN = /[Ѐ-ӿ֐-ۿऀ-෿฀-๿ᄀ-ᇿ぀-ヿ가-힯]/;
const OTHER = /(motor|transformer|pump|compressor|excavator|light(ing)? tower|weld|tractor|truck|vehicle|forklift|load bank|energy storage|bess|solar|inverter|cable|switchgear|fog cannon|agv|mower|washer)/i;
const GEN = /(generat|genset|gen-set|alternator|power station|发电)/i;
let total = 0, recs = 0;
const listed = (d) => (fs.existsSync(path.join(ROOT, d)) ? fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith(".json")) : []);
for (const f of [...new Set([...listed("specs"), ...listed("datasheets")])]) {
  const id = f.slice(0, -5);
  if (only.length && !only.includes(id)) continue;
  const file = path.join(ROOT, "cn", f);
  if (!fs.existsSync(file)) continue;
  const rec = JSON.parse(fs.readFileSync(file, "utf8"));
  const read = (d) => (fs.existsSync(path.join(ROOT, d, f)) ? JSON.parse(fs.readFileSync(path.join(ROOT, d, f), "utf8")) : []);
  const found = [...read("specs"), ...read("datasheets")];
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
  // Pages of internet finds (2001–2999, config-bot.mjs) and controller pages (3001+) are not the crawl's: kept, with their tables.
  const kept = (rec.specTables || []).filter((t) => t.n >= 2000);
  // Quotes written by hand for a crawled page (a power range a product line cites) stay when its URL is the same
  // (2026-11-04: a merge of every record dropped them and verify failed).
  const before = new Map(rec.sources.map((s) => [s.n, s]));
  rec.sources = rec.sources.filter((s) => s.n < 101 || s.n >= 2000);
  for (const n of used) {
    const src = path.join("sources", id, `${n}.md`), head = fs.readFileSync(path.join(ROOT, src), "utf8").split("\n", 2);
    const first = tables.find((t) => t.n === n), url = head[0].replace(/^URL:\s*/, "").trim(), old = before.get(n);
    const quote = [...new Set([first.header[0] || first.rows[0], ...(old?.url === url ? old.quote || [] : [])])];
    rec.sources.push({ n, url, accessedAt: head[1].replace(/^Accessed:\s*/, "").trim(), tier: "A", quote, file: src.replace(/\\/g, "/") });
  }
  // Pages saved by the crawl that no table uses are removed.
  const dir = path.join(ROOT, "sources", id);
  // A page newer than specs/<id>.json belongs to a crawl still running: left alone.
  const specTime = fs.existsSync(path.join(ROOT, "specs", f)) ? fs.statSync(path.join(ROOT, "specs", f)).mtimeMs : 0;
  for (const p of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (/^\d{3}\.md$/.test(p) && !used.includes(Number(p.slice(0, 3))) && fs.statSync(path.join(dir, p)).mtimeMs <= specTime) fs.rmSync(path.join(dir, p));
  if (tables.length || kept.length) rec.specTables = [...tables, ...kept]; else delete rec.specTables;
  fs.writeFileSync(file, JSON.stringify(rec, null, 2) + "\n", "utf8");
  const rows = tables.reduce((a, t) => a + t.rows.length, 0);
  if (rows) { recs++; total += rows; }
}
console.log(`${recs} nhà cung cấp có bảng cấu hình, ${total} dòng model`);
