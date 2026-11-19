// Bước 1 (catalog-bang-r1): với MỖI bảng R1 của bang-chua-doc, chạy thật fromSupplier của <worktree>/web/catalog.js
// (bản sao có gắn vết, không sửa repo) và ghi vì sao bảng không cho bản ghi nào.
// Dùng: node 1-chan-doan.mjs <worktree> <tệp ra .json> [--grp R1]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const [WT, OUT] = process.argv.slice(2);
const GRP = process.argv.includes("--grp") ? process.argv[process.argv.indexOf("--grp") + 1] : "R1";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PL = JSON.parse(fs.readFileSync(path.join(HERE, "..", "bang-chua-doc", "phan-loai.json"), "utf8"));

let src = fs.readFileSync(path.join(WT, "web", "catalog.js"), "utf8");
const hooks = [
  ["if (!codes.length) return;", 'if (!codes.length) { __T(t, ti, ri, "R:không ô mã", cells); return; }'],
  ["const stop = ei >= 0 ? ei : ai >= 0 ? ai : cells.length;",
    'if (ei < 0 && ai < 0) __T(t, ti, ri, "R:có mã, không ra động cơ / đầu phát", { codes: codes.map((i) => cells[i]), gi, hasEngineCol, hasAltCol, engineTable }); else __T(t, ti, ri, "R:ra bản ghi", { gi, ei, ai });\n        const stop = ei >= 0 ? ei : ai >= 0 ? ai : cells.length;'],
  ["if (sec || isLabelTable(t)) {", 'if (sec || isLabelTable(t)) { __T(t, ti, null, sec ? "L:sectionSheet" : (!t.header?.length ? "L:bảng nhãn (không tiêu đề)" : "L:bảng nhãn (tiêu đề model ngang)"), null);'],
];
for (const [a, b] of hooks) { if (!src.includes(a)) throw new Error("không thấy chỗ gắn vết: " + a); src = src.replace(a, b); }
let cur = null;
const traces = [];
const box = { console, __T: (t, ti, ri, reason, d) => traces.push({ sup: cur, ti, ri, reason, d }) };
box.globalThis = box; box.window = box;
vm.runInNewContext(src, box);
const C = box.GenbidCatalog;

const dir = path.join(WT, "suppliers", "cn");
const bySup = new Map();
for (const x of Object.values(PL).filter((x) => x.grp === GRP)) { if (!bySup.has(x.sup)) bySup.set(x.sup, []); bySup.get(x.sup).push(x); }
const out = [];
for (const [sid, list] of bySup) {
  const f = path.join(dir, sid + ".json");
  if (!fs.existsSync(f)) { for (const x of list) out.push({ sup: sid, n: x.n, ti: x.ti, gone: "không còn hồ sơ" }); continue; }
  const s = JSON.parse(fs.readFileSync(f, "utf8"));
  cur = sid; traces.length = 0;
  const notes = [];
  const recs = C.fromSupplier(s, notes);
  const used = new Set();
  for (const o of recs) { used.add(o.table); for (const a of o.also || []) used.add(a.table); }
  for (const x of list) {
    const t = (s.specTables || [])[x.ti];
    if (!t || t.n !== x.n) { out.push({ sup: sid, n: x.n, ti: x.ti, gone: "bảng đổi vị trí / không còn" }); continue; }
    const tr = traces.filter((y) => y.ti === x.ti), nt = notes.filter((y) => y.table === x.ti);
    const hc = (t.header || []).map((h) => C.cellsOf(h).length);
    const rc = t.rows.map((r) => C.cellsOf(r).length);
    const med = [...rc].sort((a, b) => a - b)[rc.length >> 1];
    const rowReasons = {};
    for (const y of tr) if (y.ri != null) rowReasons[y.reason] = (rowReasons[y.reason] || 0) + 1;
    for (const y of nt) if (y.row != null) rowReasons["N:" + y.reason] = (rowReasons["N:" + y.reason] || 0) + 1;
    out.push({ sup: sid, n: x.n, ti: x.ti, used: used.has(x.ti), title: t.title, header: t.header || [], rows: t.rows, headerCells: hc, medRowCells: med,
      tableReason: tr.find((y) => y.ri == null)?.reason || null, rowReasons, tableNotes: nt.filter((y) => y.row == null).map((y) => y.reason + ": " + y.detail),
      sample: tr.filter((y) => y.ri != null).slice(0, 3).map((y) => ({ ri: y.ri, reason: y.reason, d: y.d })) });
  }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`${out.length} bảng ${GRP}, ${out.filter((x) => x.used).length} nay đã có bản ghi, ${out.filter((x) => x.gone).length} không còn`);
