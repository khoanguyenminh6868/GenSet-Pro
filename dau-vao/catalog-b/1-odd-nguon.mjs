// node 1-odd-nguon.mjs <worktree> > odd-nguon.txt
// Với mỗi khoá động cơ có ký tự lạ mà khoá sạch tồn tại riêng: mọi dòng dùng (NCC, n, bảng, dòng nguồn) và
// mọi dòng trong tệp nguồn có ký tự đó nhưng không phải dòng bảng (chú thích cuối bảng). Chỉ đọc.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), byKey = new Map(cat.engines.map((e) => [e.key, e]));
const BAD = /[^A-Z0-9.\-/()]/gu;
for (const e of cat.engines) {
  const chars = [...new Set(e.key.match(BAD) || [])];
  if (!chars.length) continue;
  const clean = e.key.replace(BAD, "");
  if (!byKey.has(clean)) continue;
  const c = byKey.get(clean);
  console.log(`\n### ${e.key} (${e.uses.length} dòng) → ${clean} (${c.uses.length} dòng, ${c.suppliers.length} NCC)`);
  const seen = new Set();
  for (const u of e.uses) {
    console.log(`  dùng: ${u.supplierId} n${u.n} b${u.table} r${u.row} | ${String(u.line || "").slice(0, 160)}`);
    const k = `${u.supplierId}/${u.n}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const f = path.join(WT, "suppliers", "sources", u.supplierId, `${u.n}.md`);
    if (!fs.existsSync(f)) { console.log(`  (không có ${f})`); continue; }
    const lines = fs.readFileSync(f, "utf8").split(/\r?\n/);
    for (const [i, l] of lines.entries()) {
      if (!chars.some((ch) => l.includes(ch))) continue;
      if (/^\s*\|/.test(l)) continue; // dòng bảng
      console.log(`  chú thích? ${u.supplierId}/${u.n}.md:${i + 1}: ${l.slice(0, 300)}`);
    }
  }
}
