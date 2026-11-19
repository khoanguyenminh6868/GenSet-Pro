// Phân loại MỌI bảng R1 còn chưa đọc sau nhánh (chan-doan-nhanh.json) theo luật ghi dưới, rồi in bảng tổng + danh sách đủ.
// node 3-phan-loai-con-lai.mjs chan-doan-nhanh.json > con-lai.md ; ghi con-lai.tsv
import fs from "node:fs";
const [F] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(F, "utf8"));
const cells = (l) => { const s = String(l).trim(); return s.startsWith("|") ? s.split("|").slice(1).map((c) => c.trim()) : [s]; };
const first = (x) => (cells(x.header[0] || "").find((c) => c) || "");
const hdr = (x) => x.header.join(" ");
const codesOf = (x) => x.sample.find((s) => s.reason.startsWith("R:có mã"))?.d?.codes || [];
// Nhà sản xuất đầu phát (hồ sơ / bảng toàn đầu phát): bảng của họ là đầu phát rời.
const ALT_SUP = new Set(["faraday-wuxi", "xingguang-jiangsu", "sincro-soga", "excel-power-ningde"]);
const ENG_FIRST = /^(engine\s*(model|type)|发动机\s*型号|发动机型|柴油机型号|系列$)|^(engine model)$/i;
const ALT_FIRST = /^(alternator\s*model|alternator)$/i;
const GEN_TITLE = /genset|generating\s*set|generator\s*set|机组|model|型号|modello|\bmod\b/i;
const rules = [
  ["K", "bản dịch máy (nhiều thứ tiếng) của bảng tiếng Anh cùng NCC đã đọc", (x) => x.sup === "kente-power"],
  ["L", "không tiêu đề cột, không phải kiểu tiêu đề dính dòng đầu (bảng nhãn / mảnh bảng)", (x) => !!x.tableReason],
  ["A", "bảng ĐẦU PHÁT rời (hãng đầu phát, hoặc tiêu đề đầu là đầu phát)", (x) => ALT_SUP.has(x.sup) || ALT_FIRST.test(first(x)) || /励磁|AVR|winding|绕组/i.test(hdr(x)) && !/engine|发动机/i.test(hdr(x))],
  ["E", "bảng ĐỘNG CƠ rời (tiêu đề đầu là động cơ / dòng động cơ, không có cột model tổ máy)", (x) => (ENG_FIRST.test(first(x)) || /engine\s*type/i.test(first(x)) && !/机组/.test(first(x))) || x.sup === "power-hf" || x.sup === "kofo"],
  ["G", "chỉ có model TỔ MÁY (mỗi dòng một mã; động cơ chỉ ghi hãng hoặc không có): catalog chưa có loại bản ghi tổ máy không động cơ", (x) => codesOf(x).length === 1],
  ["U", "≥ 2 mã nhưng tiêu đề không nêu cột nào là động cơ / đầu phát (dòng tiêu đề chỉ còn đơn vị, hoặc 'Model' trơ hai lần, hoặc tiêu đề khác nghĩa)", (x) => codesOf(x).length >= 2],
  ["N", "không có ô mã ở dòng nào", (x) => Object.keys(x.rowReasons).every((k) => k === "R:không ô mã")],
];
const out = [], tsv = ["ncc\tn\tbang\tloai\tso-dong\ttieu-de-cot"];
for (const x of A.filter((x) => !x.used)) {
  const r = rules.find(([, , f]) => f(x)) || ["Z", "khác", null];
  out.push({ ...x, cat: r[0], catText: r[1] });
  tsv.push([x.sup, x.n, x.ti, r[0], x.rows.length, hdr(x).replace(/\t/g, " ").slice(0, 300)].join("\t"));
}
fs.writeFileSync(F.replace(/\.json$/, "") + "-con-lai.tsv", tsv.join("\n") + "\n");
console.log(`# Bảng R1 còn chưa đọc: ${out.length}\n\n| loại | ý nghĩa | bảng | NCC | dòng |\n|---|---|--:|--:|--:|`);
for (const [c, t] of [...rules.map(([c, t]) => [c, t]), ["Z", "khác"]]) {
  const v = out.filter((x) => x.cat === c); if (!v.length) continue;
  console.log(`| ${c} | ${t} | ${v.length} | ${new Set(v.map((x) => x.sup)).size} | ${v.reduce((a, x) => a + x.rows.length, 0)} |`);
}
for (const [c, t] of [...rules.map(([c, t]) => [c, t]), ["Z", "khác"]]) {
  const v = out.filter((x) => x.cat === c); if (!v.length) continue;
  console.log(`\n## ${c}: ${t} (${v.length} bảng)\n`);
  for (const x of v) {
    console.log(`- ${x.sup} n${x.n} b${x.ti} (${x.rows.length} dòng) — mã: ${JSON.stringify(codesOf(x).slice(0, 3))}`);
    console.log("  ```\n" + x.header.map((h) => "  H " + h.slice(0, 220)).join("\n") + "\n" + x.rows.slice(0, 2).map((r) => "  R " + r.slice(0, 220)).join("\n") + "\n  ```");
  }
}
