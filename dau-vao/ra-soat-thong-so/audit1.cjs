// Audit 1: container conformance, header vocabulary, row yield. Read-only.
const fs = require("fs"), path = require("path");
const REPO = process.argv[2];
const { C, S } = require("./load.cjs")(REPO);
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 25) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");

// --- 1. records
const role = new Map(), country = new Map(), status = new Map();
let withTables = 0, tables = 0, rows = 0;
const tblKeys = new Map(), srcBand = new Map(), rowsByBand = new Map();
const band = (n) => (n < 100 ? "1-99 trang chính" : n < 1001 ? "101+ crawl" : n < 2001 ? "1001+ datasheet" : n < 3001 ? "2001+ Tìm NCC" : n < 4001 ? "3001+ BĐK" : n < 5001 ? "4001+ OCR" : "5001+ catalog PDF");
let noHeader = 0, multiHeader = 0, labelTables = 0, pipeRows = 0, plainRows = 0, hdrMismatch = 0, rowTables = 0, rowTableRows = 0, hdrMismatchRows = 0;
const titles = new Map(), mapped = new Map(), unmapped = new Map();
let titleCells = 0, titleMapped = 0, titleModelLike = 0, titlePower = 0;
const lang = { zh: 0, en: 0, other: 0 };
for (const s of S) {
  cnt(role, s.role); cnt(country, s.country); cnt(status, s.status);
  if (s.specTables?.length) withTables++;
  for (const t of s.specTables || []) {
    tables++; rows += t.rows.length;
    for (const k of Object.keys(t)) cnt(tblKeys, k);
    cnt(srcBand, band(t.n)); cnt(rowsByBand, band(t.n), t.rows.length);
    if (!t.header?.length) noHeader++; else if (t.header.length > 1) multiHeader++;
    for (const r of t.rows) (String(r).trim().startsWith("|") ? pipeRows++ : plainRows++);
    const hasHdr = t.header?.length;
    const h0 = hasHdr ? C.cellsOf(t.header[0]) : [];
    const isLabel = !hasHdr || (h0.length >= 2 && /model|型号/i.test(h0[0]) && h0.slice(1).every((x) => C.isCode(x)) && t.rows.every((r) => !C.isCode(C.cellsOf(r)[0])));
    if (isLabel) labelTables++;
    else {
      rowTables++; rowTableRows += t.rows.length;
      let mm = 0;
      for (const r of t.rows) { const n = C.cellsOf(r).length; if (n !== h0.length && n !== h0.length + 1) mm++; }
      hdrMismatchRows += mm; if (mm > t.rows.length / 2) hdrMismatch++;
      for (const line of t.header) for (const c of C.cellsOf(line)) {
        if (!c) continue;
        titleCells++;
        const L = c.trim();
        cnt(titles, L.toLowerCase());
        if (/[一-鿿]/.test(L)) lang.zh++; else if (/[a-z]/i.test(L)) lang.en++; else lang.other++;
        const k = C.specKey(L);
        if (k) { titleMapped++; cnt(mapped, k); }
        else if (/\bmodel\b|型号|brand|make|品牌|厂家|engine|alternator|genset|发动机|发电机|机组/i.test(L)) titleModelLike++;
        else if (/power|output|capacity|rating|功率|kva|kw/i.test(L)) titlePower++;
        else cnt(unmapped, L.toLowerCase());
      }
    }
  }
}
console.log("== HỒ SƠ ==");
console.log("NCC:", S.length, "| có specTables:", withTables, "| bảng:", tables, "| dòng:", rows);
console.log("role:", top(role).map((x) => x.join("=")).join(", "));
console.log("status:", top(status).map((x) => x.join("=")).join(", "));
console.log("country:", top(country, 40).map((x) => x.join("=")).join(", "));
console.log("khoá trong 1 bảng:", top(tblKeys).map((x) => x.join("=")).join(", "));
console.log("bảng theo dải nguồn:", top(srcBand).map((x) => x.join("=")).join(" | "));
console.log("dòng theo dải nguồn:", top(rowsByBand).map((x) => x.join("=")).join(" | "));
console.log("\n== DẠNG BẢNG ==");
console.log("bảng không tiêu đề:", noHeader, pct(noHeader, tables), "| tiêu đề nhiều dòng:", multiHeader, pct(multiHeader, tables));
console.log("bảng nhãn-giá trị (dọc):", labelTables, pct(labelTables, tables), "| bảng ngang (mỗi dòng 1 model):", rowTables, "dòng:", rowTableRows);
console.log("dòng bắt đầu '|':", pipeRows, "| dòng chữ thường:", plainRows, pct(plainRows, rows));
console.log("bảng ngang mà >50% dòng lệch số cột so tiêu đề:", hdrMismatch, pct(hdrMismatch, rowTables), "| dòng lệch:", hdrMismatchRows, pct(hdrMismatchRows, rowTableRows));
console.log("\n== TỪ VỰNG TIÊU ĐỀ CỘT (bảng ngang) ==");
console.log("ô tiêu đề:", titleCells, "| khác nhau:", titles.size, "| ngôn ngữ:", JSON.stringify(lang));
console.log("gán được mã thông số:", titleMapped, pct(titleMapped, titleCells), "| cột model/hãng:", titleModelLike, pct(titleModelLike, titleCells), "| cột công suất:", titlePower, pct(titlePower, titleCells), "| KHÔNG nhận ra:", titleCells - titleMapped - titleModelLike - titlePower, pct(titleCells - titleMapped - titleModelLike - titlePower, titleCells));
console.log("theo mã:", top(mapped, 40).map((x) => x.join("=")).join(", "));
console.log("tiêu đề không nhận ra, hay gặp nhất:");
for (const [k, v] of top(unmapped, 70)) console.log("  ", v, k);
// distinct spellings per key
const spell = new Map();
for (const [t, n] of titles) { const k = C.specKey(t); if (k) { if (!spell.has(k)) spell.set(k, new Map()); spell.get(k).set(t, n); } }
console.log("\nSố cách viết tiêu đề cho cùng một thông số:");
for (const [k, m] of [...spell].sort((a, b) => b[1].size - a[1].size)) console.log("  ", k, m.size, "cách; vd:", top(m, 5).map((x) => `"${x[0]}"×${x[1]}`).join(", "));
