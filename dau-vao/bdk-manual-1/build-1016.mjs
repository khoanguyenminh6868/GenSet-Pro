// Dựng nguồn 1016 (operator manual 057-253 ISSUE 8) từ chữ pdftotext -layout: chỉ các đoạn dòng liệt kê dưới đây, từng dòng
// nguyên văn (bỏ khoảng trắng đầu / cuối, 2+ dấu cách thành " | "). node build-1016.mjs <worktree> <om.txt>
import fs from "node:fs";
import path from "node:path";
const [root, om] = process.argv.slice(2);
const L = fs.readFileSync(om, "utf8").split(/\r?\n/);
const URL_ = "https://www.deepseaelectronics.com/genset/manual-auto-start-control-modules/dse7310-mkii/downloads/operators-manual/855";
const NOISE = /^(Continued over page|Protections$|Fault \| Description|Example:|Description \| Specification|Specification$|Description of Controls)/;
const clean = (i) => L[i - 1].trim().replace(/\s{2,}/g, " | ");
const take = (ranges) => ranges.flatMap(([a, b]) => { const o = []; for (let i = a; i <= b; i++) { const s = clean(i); if (s && /[a-z]{2}/i.test(s) && s.length <= 220 && !NOISE.test(s)) o.push(s); } return o; });

// Có sẵn: manual ghi là chức năng của bộ điều khiển, không kèm điều kiện mô-đun mở rộng / ECU / "only available".
const AVAIL = [
  ["2.7.3 Analogue inputs (default configuration)", [[963, 964], [966, 967], [1021, 1022], [1024, 1025], [1045, 1046], [1048, 1049]]],
  ["2.9 Communication ports", [[1271, 1293], [1297, 1309]]],
  ["2.12 Accumulated instrumentation", [[1982, 1996]]],
  ["4.4.2 Engine instruments (items without *)", [[3704, 3705], [3711, 3716]]],
  ["4.4.3 Generator instruments", [[3902, 3903], [3913, 3929]]],
  ["4.4.6 Alarms", [[4114, 4116], [4128, 4136]]],
  ["4.4.7 Event log", [[4208, 4213], [4227, 4229]]],
  ["7.3 Warning alarms", [[6167, 6169], [6361, 6363], [6408, 6416], [6455, 6464], [6513, 6518], [6535, 6549], [6558, 6560], [6572, 6574], [6576, 6588], [6595, 6597], [6686, 6692]]],
  ["7.4 Electrical trip alarms", [[6713, 6713], [6720, 6724], [6866, 6868], [6949, 6954], [6966, 6977], [6979, 6984], [6999, 7001], [7082, 7084]]],
  ["7.5 Shutdown alarms", [[7105, 7105], [7112, 7115], [7262, 7264], [7297, 7305], [7354, 7368], [7386, 7388], [7423, 7430], [7453, 7494], [7585, 7600]]],
];
// Tuỳ chọn / phụ thuộc cấu hình: mục có dấu * (đọc từ ECU), hiệu chỉnh tần số ở Running Editor, bảo vệ dòng lưới cần CT ở tải.
const OPTION = [
  ["4.4.2 Engine instruments marked * (see NOTE*)", [[3701, 3702], [3717, 3747], [3758, 3814]]],
  ["7.3 Mains current protection", [[6613, 6616]]],
  ["8 Front panel configuration: values that may not be available", [[8150, 8152]]],
  ["8.2.5 Running editor parameters", [[8526, 8535]]],
];
const uniq = (a) => [...new Set(a)];
const availRows = uniq(AVAIL.flatMap(([, r]) => take(r))), optRows = uniq(OPTION.flatMap(([, r]) => take(r))).filter((l) => !availRows.includes(l));
while (availRows[0].length < 8) availRows.shift();
const body = [
  `URL: ${URL_}`, "Accessed: 2026-11-21", "",
  "[Ghi chú lưu nguồn: DSE7310 MKII & DSE7320 MKII Operator Manual, 057-253 ISSUE 8. Khoa tải tay 21/11/2026 vì trang trả 403 cho truy cập tự động. Chỉ lưu các mục liệt kê dưới đây, từng dòng nguyên văn.]", "",
  ...[...AVAIL, ...OPTION].flatMap(([h, r]) => [`## ${h}`, ...take(r), ""]),
].join("\n");
fs.writeFileSync(path.join(root, "suppliers", "sources", "deep-sea-electronics", "1016.md"), body, "utf8");
const file = path.join(root, "suppliers", "datasheets", "deep-sea-electronics.json");
const list = JSON.parse(fs.readFileSync(file, "utf8")).filter((t) => t.n !== 1016);
list.push({ n: 1016, url: URL_, title: "Datasheet: DSE7310 MKII & DSE7320 MKII Operator Manual 057-253 ISSUE 8", from: URL_, header: [], rows: availRows });
list.push({ n: 1016, url: URL_, title: "Options and configuration-dependent lines: Operator Manual 057-253 ISSUE 8", from: URL_, header: [], rows: optRows });
fs.writeFileSync(file, JSON.stringify(list, null, 1) + "\n", "utf8");
console.log("có sẵn", availRows.length, "dòng; tuỳ chọn", optRows.length, "dòng; nguồn", body.length, "ký tự");
