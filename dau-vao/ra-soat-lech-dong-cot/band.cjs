const A = require("./audA.json"), B = require("./audB.json");
const band = (n) => (n < 100 ? "1-99 trang chính" : n < 1001 ? "101+ cào trang" : n < 2001 ? "1001+ datasheet" : n < 3001 ? "2001+ Tìm NCC" : n < 4001 ? "3001+" : n < 5001 ? "4001+ OCR" : n < 6001 ? "5001+ catalog PDF" : "6001+");
const m = new Map(); for (const f of A) { const k = band(f.n); m.set(k, (m.get(k) || 0) + 1); } console.log("audA theo loại nguồn:", [...m]);
const hi = A.filter((f) => f.n >= 4001); const by = new Map(); for (const f of hi) { const k = f.sup + " n" + f.n + " " + f.code.slice(0, 4); by.set(k, (by.get(k) || 0) + 1); }
console.log([...by].sort((a, b) => b[1] - a[1]).slice(0, 30).map((x) => x.join(" ×")).join("\n"));
for (const f of hi.filter((x) => /^P(1|2|10)/.test(x.code)).slice(0, 14)) console.log(`\n[${f.sup} n${f.n}] ${f.code} → ${f.detail}\n  R: ${f.line.slice(0, 200)}`);
// tổng số bản ghi khác nhau dính lỗi đọc (B*) và số NCC
const key = (f) => [f.sup, f.n, f.row, f.kind, f.model, f.genset].join("|"); const all = new Set(), sups = new Set();
for (const [c, l] of Object.entries(B)) if (/^B(1|2|4 |6|8)/.test(c)) for (const f of l) { all.add(key(f)); sups.add(f.sup); }
console.log("\nbản ghi dính ít nhất một lỗi đọc B1/B2/B4/B6/B8:", all.size, "ở", sups.size, "NCC");
