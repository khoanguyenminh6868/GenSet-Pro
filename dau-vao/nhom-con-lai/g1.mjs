// Nhóm 1: eastern-lion "EL xxx" / "RUIFEN6120". node g1.mjs all.json
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const EL = /(^|\|)\s*EL\s?\d{3}[A-Z]{0,2}\s*(\||$)/, RF = /RUIFEN/i;
// 1) mọi bảng (mọi NCC) có ô "EL xxx" hoặc RUIFEN
const hit = Object.values(T).filter((t) => t.rows.some((r) => EL.test(r) || RF.test(r)) || t.header.some((h) => RF.test(h)));
console.log("bảng có EL/RUIFEN:", hit.length, "NCC:", [...new Set(hit.map((t) => t.sid))].join(","));
const out = [];
for (const t of hit) {
  const nEL = t.rows.filter((r) => EL.test(r)).length, nRF = t.rows.filter((r) => RF.test(r)).length;
  const kinds = {}; for (const r of t.recs) kinds[r.kind] = (kinds[r.kind] || 0) + 1;
  const elRec = t.recs.filter((r) => /^EL\s?\d/i.test(r.model || "")).length, rfRec = t.recs.filter((r) => RF.test(r.model || "")).length;
  const reasons = {}; for (const x of t.notes) reasons[x.reason] = (reasons[x.reason] || 0) + 1;
  out.push({ sid: t.sid, n: t.n, ti: t.ti, title: t.title, nrows: t.nrows, nEL, nRF, kinds, elRec, rfRec, reasons, header: t.header, ex: t.rows.slice(0, 2) });
}
out.sort((a, b) => a.n - b.n || a.ti - b.ti);
for (const o of out) console.log(JSON.stringify(o));
// 2) mọi cột của các bảng: model EL ở cột nào (tiêu đề)
const recsEL = Object.values(T).flatMap((t) => t.recs.filter((r) => /^EL\s?\d/i.test(r.model || "") || RF.test(r.model || "")).map((r) => t.sid + " n" + t.n + " " + r.kind + " " + r.model));
console.log("bản ghi model EL/RUIFEN (mọi NCC):", recsEL.length, recsEL.slice(0, 10));
