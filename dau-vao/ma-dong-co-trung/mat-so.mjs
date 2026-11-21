// node mat-so.mjs (CHỈ ĐỌC): so mat-goc.json với mat-nhanh.json. Dòng có trong all gốc mà không có trong all nhánh → gom theo luật và động cơ.
// Ra: mat-so.txt (tóm tắt), mat-nhom.tsv (mỗi động cơ + luật một dòng), mat-dong.tsv (mỗi lượt + dòng mất).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const J = (f) => JSON.parse(fs.readFileSync(path.join(HERE, f), "utf8"));
const A = J("mat-goc.json"), B = J("mat-nhanh.json");
const key = (s) => String(s || "").toUpperCase().replace(/[\s\-_.·–—]/g, "");
const inc = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const byRule = new Map(), byMake = new Map(), groups = new Map(), rows = [];
let lost = 0, gained = 0, fewer = 0, more = 0, same = 0, err = 0, renamedLost = 0;
const lostRuns = new Set();
for (const run of Object.keys(A)) {
  const a = A[run], b = B[run];
  if (!b || a.error || b.error) { err++; continue; }
  const bIds = new Set(b.all.map((r) => r[0])), aIds = new Set(a.all.map((r) => r[0]));
  if (bIds.size < aIds.size) fewer++; else if (bIds.size > aIds.size) more++; else same++;
  for (const id of bIds) if (!aIds.has(id)) gained++;
  const seen = new Set();
  for (const [id, model, make] of a.all) {
    if (bIds.has(id) || seen.has(id)) continue;
    seen.add(id); lost++; lostRuns.add(run);
    // Dòng trong `dropped` không mang `a` (đầu phát) nên id của nó có khoá đầu phát rỗng: tra theo NCC + băm chữ dòng.
    const parts = id.split("|"), bare = `${parts[0]}||${parts[parts.length - 1]}`;
    const d = b.drop[id] || b.drop[bare];
    const stillIn = !d && b.all.some((r) => { const p = r[0].split("|"); return p[0] === parts[0] && p[p.length - 1] === parts[parts.length - 1]; });
    const rule = d ? [...d[2]].sort().join(",") : stillIn ? "CON_TRONG_ALL_DOI_DAU_PHAT" : "KHONG_TRONG_DROPPED";
    const bModel = d ? d[0] : "";
    if (d && key(bModel) !== key(model)) renamedLost++;
    inc(byRule, rule); inc(byMake, make || "?");
    const gk = `${bModel || model}\t${make}\t${rule}`;
    if (!groups.has(gk)) groups.set(gk, { n: 0, runs: new Set(), sup: new Set(), from: new Set() });
    const g = groups.get(gk); g.n++; g.runs.add(run); g.sup.add(id.split("|")[0]); g.from.add(model);
    rows.push([run, id.split("|")[0], model, bModel, make, rule, d ? JSON.stringify(d[3]).slice(0, 200) : ""].join("\t"));
  }
}
const top = (m) => [...m].sort((x, y) => y[1] - x[1]).map(([k, v]) => `  ${k}: ${v}`).join("\n");
const out = [
  `lượt: ${Object.keys(A).length}, lỗi ${err}; nhánh ít dòng hơn ${fewer}, nhiều hơn ${more}, bằng ${same}`,
  `dòng mất khỏi all: ${lost} (trong ${lostRuns.size} lượt); dòng mới có: ${gained}; dòng mất mà model đổi khoá: ${renamedLost}`,
  `số động cơ + luật: ${groups.size}`,
  "theo luật:", top(byRule), "theo hãng:", top(byMake),
].join("\n");
fs.writeFileSync(path.join(HERE, "mat-so.txt"), out + "\n");
fs.writeFileSync(path.join(HERE, "mat-nhom.tsv"), "model\thãng\tluật\tdòng\tlượt\tsố NCC\tNCC\tmodel ở gốc\n" + [...groups].sort((x, y) => y[1].n - x[1].n).map(([k, g]) => [k, g.n, g.runs.size, g.sup.size, [...g.sup].join(","), [...g.from].join(" ; ")].join("\t")).join("\n") + "\n");
fs.writeFileSync(path.join(HERE, "mat-dong.tsv"), "lượt\tNCC\tmodel gốc\tmodel nhánh\thãng\tluật\tsrc\n" + rows.join("\n") + "\n");
console.log(out);
