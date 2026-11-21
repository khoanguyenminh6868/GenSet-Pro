// node dump.mjs <code dir> <tsv> [sid filter]
// In từng bảng chứa ô cc chưa thành bản ghi: tiêu đề, dòng, bản ghi fromSupplier của bảng, note.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [WT, TSV, ONLY] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const CN = path.join(WT, "suppliers", "cn");
const want = new Map();
for (const l of fs.readFileSync(TSV, "utf8").split("\n").slice(1)) {
  if (!l.trim()) continue;
  const [sid, n, ti] = l.split("\t");
  if (ONLY && sid !== ONLY) continue;
  (want.get(sid) || want.set(sid, new Set()).get(sid)).add(+ti);
}
for (const [sid, tis] of want) {
  const s = JSON.parse(fs.readFileSync(path.join(CN, sid + ".json"), "utf8"));
  const notes = [];
  const recs = C.fromSupplier(s, notes);
  for (const ti of [...tis].sort((a, b) => a - b)) {
    const t = s.specTables[ti];
    console.log(`\n===== ${sid} ti=${ti} n=${t.n} :: ${t.title}`);
    for (const h of t.header || []) console.log("H:", h.slice(0, 400));
    (t.rows || []).forEach((r, i) => console.log(`R${i}:`, r.slice(0, 400)));
    const rs = recs.filter((r) => r.table === ti);
    console.log(`-- bản ghi: ${rs.length}`);
    for (const r of rs) console.log(`  ${r.kind} model=${r.model} genset=${r.genset} other=${r.other} sheet=${r.sheet || ""} disp=${JSON.stringify((r.specs || []).filter((p) => p.key === "disp"))} power=${JSON.stringify(r.power || r.powers || null)}`);
    for (const x of notes.filter((x) => x.table === ti)) console.log(`  NOTE r${x.row}: ${x.reason} :: ${x.detail || ""}`);
  }
}
