// So tablesOf CŨ ↔ MỚI trên mọi tệp nguồn crawl sources/<id>/<n>.md (n 101–999).
//   node measure.mjs <gốc cũ> <gốc mới> <out.json> [id]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [oldRoot, newRoot, outFile, only] = process.argv.slice(2);
const load = async (r) => (await import(pathToFileURL(path.join(r, "suppliers", "crawl-specs.mjs")).href));
const O = await load(oldRoot), N = await load(newRoot);
const src = path.join(newRoot, "suppliers", "sources");
const key = (t) => t.header.join("\n") + "\n##\n" + t.rows.join("\n");
const res = [];
let files = 0, err = 0;
for (const id of fs.readdirSync(src).sort()) {
  if (only && id !== only) continue;
  const dir = path.join(src, id);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    const m = /^(\d+)\.md$/.exec(f); if (!m || +m[1] < 101 || +m[1] > 999) continue;
    files++;
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    let a, b;
    try { a = O.tablesOf(text); b = N.tablesOf(text); } catch (e) { err++; console.log(`LỖI ${id} n${m[1]}: ${e.message}`); continue; }
    const ka = new Set(a.map(key)), kb = new Set(b.map(key));
    const same = a.filter((t) => kb.has(key(t))).length;
    const goneT = a.filter((t) => !kb.has(key(t))), newT = b.filter((t) => !ka.has(key(t)));
    if (!goneT.length && !newT.length) continue;
    const la = new Set(a.flatMap((t) => t.rows)), lb = new Set(b.flatMap((t) => t.rows));
    const ha = new Set(a.flatMap((t) => t.header)), hb = new Set(b.flatMap((t) => t.header));
    const rowsAdded = [...lb].filter((l) => !la.has(l)), rowsLost = [...la].filter((l) => !lb.has(l));
    res.push({ id, n: +m[1], same, gone: goneT, added: newT, rowsAdded, rowsLost, rowsLostToHeader: rowsLost.filter((l) => hb.has(l)), rowsFromHeader: rowsAdded.filter((l) => ha.has(l)),
      machineAdded: rowsAdded.filter(N.isMachineRow).length });
  }
}
fs.writeFileSync(outFile, JSON.stringify(res, null, 1), "utf8");
console.log(`tệp: ${files}, lỗi: ${err}, tệp có khác: ${res.length}`);
const by = new Map();
for (const r of res) { const x = by.get(r.id) || { files: 0, gone: 0, added: 0, rowsAdded: 0, rowsLost: 0, mach: 0 }; x.files++; x.gone += r.gone.length; x.added += r.added.length; x.rowsAdded += r.rowsAdded.length; x.rowsLost += r.rowsLost.length; x.mach += r.machineAdded; by.set(r.id, x); }
console.log("NCC".padEnd(28), "tệp  bảng cũ đổi/mất  bảng mới/đổi  dòng thêm (dòng máy)  dòng mất");
for (const [id, x] of [...by].sort((a, b) => b[1].rowsAdded - a[1].rowsAdded)) console.log(id.padEnd(28), String(x.files).padStart(3), String(x.gone).padStart(8), String(x.added).padStart(14), String(x.rowsAdded).padStart(10), `(${x.mach})`.padStart(7), String(x.rowsLost).padStart(10));
const tot = [...by.values()].reduce((s, x) => ({ g: s.g + x.gone, a: s.a + x.added, ra: s.ra + x.rowsAdded, rl: s.rl + x.rowsLost, m: s.m + x.mach }), { g: 0, a: 0, ra: 0, rl: 0, m: 0 });
console.log(`TỔNG: ${by.size} NCC; bảng cũ đổi/mất ${tot.g}; bảng mới/đổi ${tot.a}; dòng thêm ${tot.ra} (dòng máy ${tot.m}); dòng mất ${tot.rl}`);
