// Với MỌI bản ghi thêm của các NCC: mỗi số công suất của bản ghi có nằm trong dòng nguồn không (nguyên số, hoặc trong ô dạng "a/b").
// Và previa: 36 bản ghi đổi trang n108 → n128 có cùng dòng + cùng tiêu đề không.
//   node added-power.mjs <gốc sau> <gốc trước> <thư mục audit> <id,id,...> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before, dir, ids, outFile] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const load = (r, id) => JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8"));
const out = [];
let all = 0, ok = 0, noPower = 0, off = 0;
for (const id of ids.split(",")) {
  const recs = C.fromSupplier(load(after, id), []);
  for (const l of fs.readFileSync(path.join(dir, `${id}.tsv`), "utf8").split("\n").filter((x) => x.startsWith("THÊM"))) {
    const [, nn, kind, model, genset] = l.split("\t");
    const r = recs.find((x) => `n${x.n}` === nn && x.kind === kind && x.model === model && (x.genset ?? "") === genset);
    all++;
    if (!r) { off++; out.push(`KHÔNG TÌM LẠI\t${id}\t${nn}\t${model}`); continue; }
    const nums = Object.values(r.power || {}).flatMap((p) => [p?.kW, p?.kVA]).filter((v) => v != null);
    if (!nums.length) { noPower++; continue; }
    const inLine = new Set((r.line.match(/\d+(?:\.\d+)?/g) || []).map(Number));
    const miss = nums.filter((v) => !inLine.has(Number(v)));
    if (miss.length) { off++; out.push(`SỐ KHÔNG Ở DÒNG\t${id}\t${nn}\t${r.genset ?? ""}\t${model}\t${JSON.stringify(r.power)}\tthiếu ${miss.join(",")}\t${r.line.slice(0, 110)}`); } else ok++;
  }
}
const a = load(before, "previa-ningde"), b = load(after, "previa-ningde");
const t8 = a.specTables.filter((t) => t.n === 108), t28 = b.specTables.filter((t) => t.n === 128);
let same = 0, sameHead = 0, total = 0;
for (const t of t8) for (const r of t.rows) { total++; const q = t28.find((x) => x.rows.includes(r)); if (q) { same++; if (q.header.join("\n") === t.header.join("\n")) sameHead++; } }
const after108 = b.specTables.filter((t) => t.n === 108).flatMap((t) => t.rows).length;
const line = `bản ghi thêm ${all}: số công suất đều ở dòng ${ok}; không có công suất ${noPower}; cần xem ${off}\nprevia n108 cũ ${total} dòng: có ở n128 mới ${same}, cùng tiêu đề ${sameHead}; n108 mới còn ${after108} dòng`;
fs.writeFileSync(outFile, [line, ...out].join("\n") + "\n", "utf8");
console.log(line);
