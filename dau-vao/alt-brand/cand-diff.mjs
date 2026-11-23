// node cand-diff.mjs <cand-old.json> <cand-new.json>: bảng trước / sau cho từng dòng có cờ.
import fs from "node:fs";
const [fa, fb] = process.argv.slice(2), A = JSON.parse(fs.readFileSync(fa, "utf8")), B = JSON.parse(fs.readFileSync(fb, "utf8"));
const k = (x) => [x.supplierId, x.n, x.table, x.row, x.engine].join("|"), ma = new Map(A.map((x) => [k(x), x]));
console.log("| NCC | n | bảng / dòng | tổ máy | động cơ | đầu phát | công suất hỏi | hãng khoá trước → sau | điểm trước → sau | lý do đầu phát trước | lý do đầu phát sau |\n|---|---|---|---|---|---|---|---|---|---|---|");
let n = 0, d80 = 0, same = 0, none = 0;
for (const b of B) {
  const a = ma.get(k(b)) || {};
  n++;
  if (!b.found) { none++; console.log(`| ${b.supplierId} | ${b.n} | b${b.table} r${b.row} | ${b.genset ?? "—"} | ${b.engine ?? "—"} | ${b.alt} | ${b.cap ?? "—"} | ${a.altMake ?? "—"} → ${b.altMake ?? "—"} | — | ${b.note || "không vào ứng viên"} | ${b.note || "không vào ứng viên"} |`); continue; }
  const ds = (b.score ?? 0) - (a.score ?? 0);
  if (ds === -80) d80++; else if (ds === 0) same++;
  console.log(`| ${b.supplierId} | ${b.n} | b${b.table} r${b.row} | ${b.genset ?? "—"} | ${b.engine} | ${b.alt} | ${b.cap} | ${a.altMake ?? "—"} → ${b.altMake ?? "—"} | ${a.score} → ${b.score} (${ds >= 0 ? "+" : ""}${ds}) | ${(a.why || []).join("; ") || "—"} | ${(b.why || []).join("; ") || "—"} |`);
}
console.log(`\nTổng ${n} dòng kết quả; không vào ứng viên ${none}; điểm −80: ${d80}; điểm không đổi: ${same}; khác: ${n - none - d80 - same}`);
