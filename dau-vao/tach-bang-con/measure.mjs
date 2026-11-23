// tablesOf cũ ↔ mới trên MỌI tệp nguồn crawl (101–999), theo từng NCC. Không ghi gì vào repo.
//   node measure.mjs <gốc cũ> <gốc mới> <thư mục ra>
// Ra: per-supplier.tsv (mỗi NCC một dòng), changed.json (mọi tệp có bảng đổi), lost.txt (từng dòng máy mất), suspect.txt.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [oldRoot, newRoot, outDir] = process.argv.slice(2);
const load = (r) => import(pathToFileURL(path.join(r, "suppliers", "crawl-specs.mjs")).href);
const O = await load(oldRoot), N = await load(newRoot);
const src = path.join(newRoot, "suppliers", "sources");
const sig = (t) => JSON.stringify([t.header, t.rows]);
const per = new Map(), changed = [], lost = [], suspect = [];
const bump = (id, k, v = 1) => { if (!per.has(id)) per.set(id, { files: 0, oldT: 0, newT: 0, changedOld: 0, addedRows: 0, lostRows: 0, movedToHeader: 0 }); per.get(id)[k] += v; };
let files = 0;
for (const id of fs.readdirSync(src).sort()) {
  const dir = path.join(src, id);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    const m = /^(\d+)\.md$/.exec(f);
    if (!m || +m[1] < 101 || +m[1] > 999) continue;
    files++;
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    const a = O.tablesOf(text), b = N.tablesOf(text);
    bump(id, "oldT", a.length); bump(id, "newT", b.length);
    const sb = new Set(b.map(sig)), sa = new Set(a.map(sig));
    const gone = a.filter((t) => !sb.has(sig(t))), fresh = b.filter((t) => !sa.has(sig(t)));
    if (!gone.length && !fresh.length) continue;
    bump(id, "files"); bump(id, "changedOld", gone.length);
    const rowsB = new Set(b.flatMap((t) => t.rows)), headB = new Set(b.flatMap((t) => t.header)), rowsA = new Set(a.flatMap((t) => t.rows));
    for (const t of gone) for (const r of t.rows) if (!rowsB.has(r)) {
      if (headB.has(r) && !O.isMachineRow(r)) bump(id, "movedToHeader");
      else { bump(id, "lostRows"); lost.push(`${id} n${m[1]} ${headB.has(r) ? "[vào tiêu đề] " : ""}${r.slice(0, 160)}`); }
    }
    const added = [...rowsB].filter((r) => !rowsA.has(r));
    bump(id, "addedRows", added.length);
    for (const t of fresh) if (t.rows.length < 2 || !t.header.length) suspect.push(`${id} n${m[1]} ${t.rows.length} dòng, ${t.header.length} tiêu đề: ${(t.header[0] || t.rows[0] || "").slice(0, 120)}`);
    changed.push({ id, n: +m[1], gone: gone.length, fresh: fresh.length, added: added.length });
  }
}
fs.mkdirSync(outDir, { recursive: true });
const head = "id\tfiles\toldT\tnewT\tchangedOld\taddedRows\tlostRows\tmovedToHeader";
const body = [...per].filter(([, v]) => v.files).map(([id, v]) => [id, v.files, v.oldT, v.newT, v.changedOld, v.addedRows, v.lostRows, v.movedToHeader].join("\t"));
fs.writeFileSync(path.join(outDir, "per-supplier.tsv"), [head, ...body].join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "changed.json"), JSON.stringify(changed), "utf8");
fs.writeFileSync(path.join(outDir, "lost.txt"), lost.join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "suspect.txt"), suspect.join("\n") + "\n", "utf8");
const t = (k) => [...per.values()].reduce((s, v) => s + v[k], 0);
console.log(`tệp nguồn ${files}; NCC đổi ${body.length}; tệp đổi ${changed.length}; bảng cũ đổi ${t("changedOld")}; bảng ${t("oldT")} → ${t("newT")}; dòng thêm ${t("addedRows")}; dòng máy mất ${t("lostRows")}; dòng tiêu đề rời khỏi rows ${t("movedToHeader")}; bảng đáng ngờ ${suspect.length}`);
for (const id of ["baifa-power", "taihai-taizhou", "hnd-henan", "acepow-fuan", "rcg-power", "mecc-alte", "tecgen-fujian"]) { const v = per.get(id); console.log(id, v ? `đổi ${v.changedOld} bảng, thêm ${v.addedRows}, mất ${v.lostRows}, tiêu đề ${v.movedToHeader}` : "không đổi"); }
