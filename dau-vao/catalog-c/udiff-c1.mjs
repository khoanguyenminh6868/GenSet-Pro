// node udiff.mjs u-base.json u-new.json : note unread thêm / bớt (đa tập)
import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const cnt = (xs) => { const m = new Map(); for (const x of xs) m.set(x, (m.get(x) || 0) + 1); return m; };
const a = cnt(A), b = cnt(B), gone = [], add = [];
for (const [k, v] of a) for (let i = (b.get(k) || 0); i < v; i++) gone.push(k);
for (const [k, v] of b) for (let i = (a.get(k) || 0); i < v; i++) add.push(k);
const by = (xs) => { const m = {}; for (const x of xs) { const r = x.split(" | ")[4]; m[r] = (m[r] || 0) + 1; } return m; };
console.log("bớt:", gone.length, JSON.stringify(by(gone)));
console.log("thêm:", add.length, JSON.stringify(by(add)));
const bad = gone.filter((x) => x.split(" | ")[4] !== "bảng không cho bản ghi nào");
if (bad.length) console.log("BỚT KHÁC LOẠI:", bad);
console.log("bảng bớt:", gone.map((x) => x.split(" | ").slice(0, 3).join("|")).sort().join(", "));
