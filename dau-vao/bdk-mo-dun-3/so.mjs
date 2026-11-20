// so goc.json ↔ nhanh.json của ds40.mjs
import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("goc.json")), b = JSON.parse(fs.readFileSync("nhanh.json"));
console.log("NCC", a.sups, "→", b.sups);
const ka = Object.keys(a.keys), kb = Object.keys(b.keys);
console.log("khoá controller", ka.length, "→", kb.length);
for (const k of kb.filter((k) => !a.keys[k])) console.log("  + ", k, b.keys[k].lines, "dòng", b.keys[k].sups.join(","));
for (const k of ka.filter((k) => !b.keys[k])) console.log("  - ", k);
for (const k of ka.filter((k) => b.keys[k] && b.keys[k].lines !== a.keys[k].lines)) console.log("  ~ ", k, a.keys[k].lines, "→", b.keys[k].lines);
const sum = (o) => Object.values(o.keys).reduce((s, v) => s + v.lines, 0);
console.log("dòng datasheet controller", sum(a), "→", sum(b));
const all = new Set([...Object.keys(a.rows), ...Object.keys(b.rows)]);
let d = 0; for (const k of all) if ((a.rows[k] ?? "∅") !== (b.rows[k] ?? "∅")) { d++; if (d <= 20) console.log("  dòng đổi", k, JSON.stringify(a.rows[k]), "→", JSON.stringify(b.rows[k])); }
console.log("dòng ứng viên đổi +40:", d, "/", all.size);
let flip = 0; for (const k of all) if (!!a.rows[k] !== !!b.rows[k]) flip++;
console.log("dòng đổi trạng thái +40 (không ↔ có):", flip);
const newM = {}; for (const k of all) { const x = new Set((a.rows[k] || "").split(",")); for (const m of (b.rows[k] || "").split(",").filter(Boolean)) if (!x.has(m)) newM[m] = (newM[m] || 0) + 1; }
console.log("model mới gắn được datasheet trên dòng ứng viên:", JSON.stringify(newM));
