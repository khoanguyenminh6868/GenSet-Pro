// node tab.cjs <repo> <id NCC> <chỉ số bảng> [số dòng]: in tiêu đề đầy đủ + các dòng đầu của một bảng (theo chỉ số trong specTables).
const fs = require("fs"), path = require("path");
const [repo, id, ti, max = 4] = process.argv.slice(2);
const s = JSON.parse(fs.readFileSync(path.join(repo, "suppliers", "cn", id + ".json"), "utf8")), t = s.specTables[+ti];
console.log(`[${id} n${t.n} bảng ${ti}] ${t.title || ""} | ${t.rows.length} dòng`);
for (const h of t.header || []) console.log("  H:", h);
for (const r of t.rows.slice(0, +max)) console.log("  R:", r);
