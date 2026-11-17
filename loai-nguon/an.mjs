// node an.mjs [prefix]  -> tổng hợp out/<prefix>-*.jsonl
import fs from "node:fs";
const HERE = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/loai-nguon/out", P = process.argv[2] || "m";
const recs = fs.readdirSync(HERE).filter((f) => f.startsWith(P + "-") && f.endsWith(".jsonl")).flatMap((f) => fs.readFileSync(`${HERE}/${f}`, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)));
const ok = recs.filter((r) => !r.error), err = recs.filter((r) => r.error);
const keys = new Set(ok.map((r) => r.key));
const sum = (f) => ok.reduce((a, r) => a + (f(r) || 0), 0);
const byReason = {}; for (const r of ok) for (const [k, m] of Object.entries(r.byReason)) for (const [p, c] of Object.entries(m)) { byReason[k] = byReason[k] || {}; byReason[k][p] = (byReason[k][p] || 0) + c; }
const rowClass = {}, rowClassP = {}; for (const r of ok) { for (const [k, c] of Object.entries(r.rowClass)) rowClass[k] = (rowClass[k] || 0) + c; for (const [k, c] of Object.entries(r.rowClassP)) rowClassP[k] = (rowClassP[k] || 0) + c; }
const pk = (f) => new Set(ok.filter(f).map((r) => r.key)).size;
const out = {
  runs: ok.length, packages: keys.size, errors: err.length,
  rowsBefore: sum((r) => r.nRowsBefore), dropped: sum((r) => r.nDropped), rowsAfter: sum((r) => r.nRowsAfter), rowsPrime: sum((r) => r.nRowsPrime),
  bandRows: sum((r) => r.nRowsBefore + r.nDropped),
  byReason, rowClass, rowClassP,
  runsWithDrop: ok.filter((r) => r.nDropped).length, runsRescued: ok.filter((r) => r.nRowsAfter > r.nRowsBefore).length, pkgRescued: pk((r) => r.nRowsAfter > r.nRowsBefore),
  top3Changed: ok.filter((r) => r.top3Changed).length, top3SetChanged: ok.filter((r) => r.top3SetChanged).length, pkgTop3: pk((r) => r.top3Changed), pkgTop3Set: pk((r) => r.top3SetChanged),
  top3ChangedP: ok.filter((r) => r.top3ChangedP).length, top3SetChangedP: ok.filter((r) => r.top3SetChangedP).length, pkgTop3P: pk((r) => r.top3ChangedP), pkgTop3SetP: pk((r) => r.top3SetChangedP),
  runsTop30New: ok.filter((r) => r.top30New).length, top30New: sum((r) => r.top30New), runsTop30NewP: ok.filter((r) => r.top30NewP).length, top30NewP: sum((r) => r.top30NewP),
  weakTop: sum((r) => r.weakTop), weakTopP: sum((r) => r.weakTopP), weakTop3: sum((r) => r.weakTop3), weakTop3P: sum((r) => r.weakTop3P),
  topNup: ok.filter((r) => r.topN[1] > r.topN[0]).length, topNupP: ok.filter((r) => r.topN[2] > r.topN[0]).length,
};
console.log(JSON.stringify(out, null, 1));
console.log("top3 đổi (luật mới):"); for (const r of ok.filter((r) => r.top3Changed)) console.log(" ", r.key, r.i, r.cap.value + r.cap.unit, "rows", r.nRowsBefore, "->", r.nRowsAfter, "\n    trước", r.top3.before.join(" ; "), "\n    sau  ", r.top3.after.join(" ; "));
if (err.length) console.log("lỗi:", err.slice(0, 3));
