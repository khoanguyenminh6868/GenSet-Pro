// Tạo phụ lục A (mục 4: ngưỡng) và B (mục 5: dòng bị loại) cho báo cáo. node mkapp.mjs
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync("out/thr.json", "utf8"));
// --- chọn lại đúng 78 ca như thrsel.mjs (cùng thuật toán) ---
const kva = (c) => (c.unit === "kVA" ? c.value : c.value / 0.8);
const has = (r) => r.th1.minDisp != null || r.th1.maxDisp != null || r.th1.minCyl != null || r.th1.minPrime;
const pool = T.filter(has);
const odd = (r) => { let s = 0; const k = kva(r.cap); if (r.th1.minDisp != null) { const x = r.th1.minDisp / k; if (x > 0.06 || x < 0.006) s += 2; } if (r.th1.minCyl != null) { if (k > 300 && r.th1.minCyl < 6) s += 2; if (k < 100 && r.th1.minCyl > 4) s += 2; } if (r.th1.maxDisp != null) s += 2; if (r.th1.minPrime) { const p = r.th1.minPrime.kVA ?? r.th1.minPrime.kW / 0.8; const x = p / k; if (x < 0.8 || x > 1.15) s += 2; } if (r.nSizes > 1) s += 3; return s; };
const sorted = [...pool].sort((a, b) => odd(b) - odd(a) || a.key.localeCompare(b.key)); const sel = [], used = new Set();
for (const r of sorted) { if (sel.length >= 30) break; sel.push(r); used.add(r.key + r.i); }
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (const k of ["minDisp", "minCyl", "minPrime", "maxDisp"]) { const cand = pool.filter((r) => (k === "minPrime" ? r.th1.minPrime : r.th1[k] != null) && !used.has(r.key + r.i)); for (let n = 0; n < 12 && cand.length; n++) { const r = cand.splice(Math.floor(rnd() * cand.length), 1)[0]; sel.push(r); used.add(r.key + r.i); } }
const note = {
  1: ["U", "13 L là của cỡ 550 kVA, ≤ 60,2 L của cỡ 2500 kVA; mỗi cỡ nhận cả hai ngưỡng (may mà vô hại: 13 L quá thấp cho 2500 kVA, 60,2 L quá cao cho 550 kVA)"],
  11: ["S", "'4 xi lanh' là số thứ tự dòng của bảng đánh giá (cột 'Thông tin xi lanh'), không phải 'tối thiểu 4 xi lanh'; vô hại vì 4 thấp"],
  12: ["S", "như #11"],
  19: ["S", "'< 20 lít' nghĩa là TỐI ĐA 20 L, mã đọc thành TỐI THIỂU 20 L: loại 1.167 dòng (66% dải) của cỡ 500 kVA"],
  20: ["S", "như #19 ('< 20 lít' đọc thành tối thiểu); cỡ 2000 kVA vô hại vì 20 L thấp so với cỡ đó"],
  22: ["S", "'> 1.758 lit' là của hạng mục 1 (15 kVA); cỡ 5 kW của hạng mục 2 nhận luôn (gói không có ngưỡng khác để mâu thuẫn): loại 13 dòng"],
  24: ["U", "tên gói / mục Công suất ghi 50KVA, nhưng một dòng ghi 'công suất liên tục: 60kva (48kw)': minPrime 60 loại 527 dòng có prime 50–59 kVA; không biết HSMT muốn 50 hay 60"],
  30: ["S", "maxDisp 1,826 L là của máy 12 kVA; cỡ 30 kVA (cần ≥ 3,3 L) cũng nhận: 490 dòng bị loại, top toàn động cơ ≤ 1,8 L"],
  33: ["U", "'Dung tích xi lanh 60,2 lít' không dấu so sánh: theo quy tắc của Khoa (con số trần = tối thiểu) thành tối thiểu 60,2 L; HSMT viết quanh một động cơ"],
  37: ["S", "'Tổng dung tích làm mát: ≥ 22L' là thể tích nước làm mát, không phải dung tích xi lanh (HSMT có dòng 'Dung tích xy lanh: ≥ 9,7 L' nhưng ở dạng Unicode NFD nên regex bỏ sót): loại 1.233 dòng"],
  38: ["U", "'Dung tích xi lanh 5.9 lít' không dấu: quy tắc con số trần = tối thiểu; HSMT viết quanh động cơ 6BT5.9"],
  42: ["U", "'Dung tích xi lanh: 7.01 lít' không dấu: như #38"],
  50: ["U", "'Số xylanh 06 xylanh' không dấu: như #38"],
  52: ["S", "'Dung tích ≥ 2.000 lít' là BỒN NHIÊN LIỆU; '4 xi lanh' là số thứ tự dòng; vô hại (thấp)"],
  61: ["U", "'Dung tích xi lanh: 21.927 L' không dấu: như #38"],
  62: ["S", "'Công suất liên tục ≥ 42kVA' nằm dưới 'Loại đầu phát' (đầu phát 42 kVA cho máy 40 kVA): không có số của tổ máy nên mã lấy số của đầu phát làm minPrime; loại 3 dòng prime 40 kVA (đúng cỡ HSMT)"],
  64: ["U", "tên gói 'từ 750+800kVA': cỡ đọc 800 nhưng prime ≥ 750 kVA; dải bắt đầu ở 796 kVA nên dòng 750–795 kVA không vào"],
  66: ["S", "'Số xy lanh/dung tích xy lanh ≥ 4/3318cm3' thuộc XE NÂNG (gói MS-02 mua cả máy phát, cầu trục, xe nâng), không phải tổ máy; maxDisp 5,9 L ở chỗ khác mới đúng"],
  73: ["U", "như #1"],
};
const lines = ["# Phụ lục A: ngưỡng đọc từ HSMT, 78 ca (mục 4)", "", "Nguồn: `out/thr.json` (chạy `thr.mjs`); chọn ca bằng `thrsel.mjs`: 30 ca bất thường (nhiều cỡ, ngưỡng lệch cỡ) + 48 ca ngẫu nhiên cố định (12 mỗi loại). 'Nguyên văn' là ô/dòng HSMT mà `engineMins` thật sự đã dùng (bản đo `old/config-bot-instr.mjs` chỉ thêm ghi nguồn; kết quả giống `hintsOf` thật: 0 khác biệt trên mọi lượt). minPrime: dòng liệt kê là dòng HSMT có đúng con số đó cạnh chữ prime/liên tục (tìm bằng regex ngoài mã, soát bằng mắt; không phải dòng mã đã ghi lại).", "", "Quy ước: **Đ** = đúng (đúng cỡ, đúng đơn vị, đúng nghĩa tối thiểu/tối đa), **S** = sai, **?** = không chắc.", "", "| # | gói | nguồn | cỡ | ngưỡng sau plausible | nguyên văn HSMT | kết luận | ghi chú |", "|---|---|---|---|---|---|---|---|"];
const cnt = { D: 0, S: 0, U: 0 };
sel.forEach((r, n) => {
  const no = n + 1, [v, nt] = note[no] || ["D", ""]; cnt[v]++;
  const th = Object.entries(r.th1).filter(([, x]) => x != null).map(([k, x]) => `${k}=${typeof x === "object" ? Object.entries(x).map(([a, b]) => b + a).join("/") : x}`).join(", ");
  const q = []; for (const k of ["minDisp", "maxDisp", "minCyl"]) if (r.th1[k] != null && r.cells[k].length) q.push(`${k}: «${r.cells[k][0].replace(/[\r\n]+/g, " ⏎ ").trim().slice(0, 110)}»`);
  if (r.th1.minPrime && r.primeLines?.length) q.push(`minPrime: «${(r.primeLines[0].prev ? r.primeLines[0].prev.slice(0, 40) + " ⏎ " : "") + r.primeLines[0].line.replace(/[\r\n]+/g, " ").trim().slice(0, 110)}»`);
  lines.push(`| ${no} | ${r.key} | ${r.src} | ${r.cap.value} ${r.cap.unit}${r.nSizes > 1 ? ` (cỡ ${r.i + 1}/${r.nSizes})` : ""} | ${th} | ${q.join("<br>").replace(/\|/g, "¦")} | ${{ D: "Đ", S: "S", U: "?" }[v]} | ${nt.replace(/\|/g, "¦")} |`);
});
lines.push("", `**Tổng: ${sel.length} ca: đúng ${cnt.D}, sai ${cnt.S}, không chắc ${cnt.U}.**`);
fs.writeFileSync("out/phu-luc-A.md", lines.join("\n")); console.log("A", sel.length, cnt);
// --- phụ lục B ---
const S = JSON.parse(fs.readFileSync("out/sample-frozen.json", "utf8"));
const v5 = {
  O: { 19: "5 kW nhận minDisp 1,758 L của hạng mục 15 kVA (động cơ 0,418 L đúng cỡ 5 kW bị loại)", 20: "'< 20 lít' đọc thành tối thiểu 20 L; Deutz 15,87 L đúng HSMT (≤ 20 L) bị loại", 21: "(1) minDisp 2 L là bồn nhiên liệu; (2) 105,56 L bị mã đọc thành 0,10556 L (n > 100 → chia 1000 như cc)", 35: "chỉ một nguồn (waeta-fujian) ghi số xi lanh '4 L' cho CA6DL1-24D (thực tế 6 xi lanh 7,7 L); mã tin nguồn duy nhất", 88: "5 kW nhận minDisp 1,758 L của hạng mục 15 kVA", 89: "như 88" },
  U: { 8: "'Dung tích xi lanh 5.9 lít' không dấu so sánh (quy tắc con số trần = tối thiểu): Baudouin 4,087 L bị loại", 10: "'Tổng dung tích xylanh 11,945 lít' không dấu; 220 kVA nhưng HSMT viết quanh một động cơ 12 L", 12: "như 8 (21,927 L không dấu)" },
  note: { 3: "dòng nguồn sai: 2050 và 2725 là KHỐI LƯỢNG (kg) bị đọc thành kW/kVA; loại đúng, nhưng thực ra dòng này không phải tổ máy 2500 kVA", 5: "cột công suất đọc lệch (rated 13 kVA/11 kW lấy từ hai cặp khác nhau); không ảnh hưởng quyết định loại (dung tích)", 24: "dòng bảng lệch cột (WP2.1D18E2 là động cơ 2,1 L 15–18 kVA); dòng rác, loại đúng", 36: "như M24", 75: "ngưỡng minPrime 180 kVA SAI: HSMT ghi '163 kVA Prime/180 kVA Standby', mã lấy 180 (Standby); dòng này vẫn loại đúng vì prime 150 < 163", 78: "như M75 (prime 160 < 163 vẫn bị loại đúng)" },
};
const B = ["# Phụ lục B: 90 dòng bị loại (`dropped`) lấy mẫu (mục 5)", "", "Nguồn: `out/sample-frozen.json` (chạy `sample.mjs` trên kết quả `runall`; mỗi lượt giữ tối đa 5 dòng mỗi loại `ruled`, mẫu ngẫu nhiên cố định, tối đa 2 mẫu mỗi gói mỗi nhóm). 'Số liệu nguồn' là nguyên dòng bảng / datasheet kèm supplierId#n (n = số nguồn trong bản ghi NCC), đúng dữ liệu `candidates()` đã so với ngưỡng.", "", "Quy ước kết luận: **Đ** = loại đúng, **OAN** = loại oan, **?** = không chắc.", "", "| # | nhóm mẫu | gói / cỡ | ngưỡng HSMT | NCC · động cơ | lý do | số liệu nguồn | kết luận | ghi chú |", "|---|---|---|---|---|---|---|---|---|"];
const c5 = { D: 0, O: 0, U: 0 }, byKind = {};
S.forEach((x, n) => {
  const s = x.s, no = n + 1, v = v5.O[no] ? "O" : v5.U[no] ? "U" : "D"; c5[v]++;
  for (const k of s.ruled) { byKind[k] = byKind[k] || { D: 0, O: 0, U: 0, n: 0 }; byKind[k][v]++; byKind[k].n++; }
  const ms = Object.entries(s.min).filter(([, q]) => q != null).map(([k, q]) => `${k}=${typeof q === "object" ? Object.entries(q).map(([a, b]) => b + a).join("/") : q}`).join(", ");
  const ev = []; ev.push(`dòng: «${s.line.replace(/[\r\n|]+/g, " ").slice(0, 110)}»`);
  if (s.ruled.includes("prime")) ev.push(`công suất đọc ${JSON.stringify(s.power)}; đầu bảng «${s.header.replace(/[\r\n|]+/g, " ").slice(0, 90)}»`);
  if (s.ruled.some((k) => k === "disp" || k === "maxDisp")) ev.push("dung tích: " + (s.disp.length ? s.disp.slice(0, 2).map((d) => `${d.v} → ${d.litres} L (${d.sid}#${d.n})`).join("; ") : "(không có / tính từ bore×stroke)"));
  if (s.ruled.includes("cyl")) ev.push("xi lanh: " + s.cyl.slice(0, 2).map((d) => `${d.v} (${d.sid}#${d.n})`).join("; "));
  const nt = v5.O[no] || v5.U[no] || v5.note[no] || "";
  B.push(`| M${no} | ${x.why} | ${x.key} ${x.cap.value}${x.cap.unit}${x.nSizes > 1 ? " (nhiều cỡ)" : ""} | ${ms} | ${s.sup} · ${s.engine} (${s.make || "?"}) | ${s.ruled.join("+")} | ${ev.join("<br>").replace(/\|/g, "¦")} | ${{ D: "Đ", O: "OAN", U: "?" }[v]} | ${nt.replace(/\|/g, "¦")} |`);
});
B.push("", `**Tổng: ${S.length} dòng ở ${new Set(S.map((x) => x.key)).size} gói: đúng ${c5.D}, oan ${c5.O}, không chắc ${c5.U}.** Theo loại lý do (một dòng có thể có hai lý do): ${JSON.stringify(byKind)}`);
fs.writeFileSync("out/phu-luc-B.md", B.join("\n")); console.log("B", S.length, c5, byKind);
