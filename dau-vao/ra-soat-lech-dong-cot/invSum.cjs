// node invSum.cjs: gom revP-inv.txt theo NCC + loại, mỗi nhóm 2 dòng mẫu
const fs = require("fs"), path = require("path");
const L = fs.readFileSync(path.join(__dirname, "revP-inv.txt"), "utf8").split("\n").filter(Boolean);
const g = new Map();
for (const l of L) { const m = l.match(/^(\w+) \[(\S+) n(\d+)/); const k = m[1] + " " + m[2] + " n" + m[3]; if (!g.has(k)) g.set(k, []); g.get(k).push(l); }
for (const [k, v] of [...g].sort((a, b) => b[1].length - a[1].length)) { console.log(`\n${k} ×${v.length}`); for (const l of v.slice(0, 2)) console.log("  " + l.replace(/^\w+ \[\S+ n\d+ /, "[").slice(0, 230)); }
