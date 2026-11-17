// node kvaTol.cjs <sync-pure.js mới> [tệp ra.json]: gói bidhist mà config.kvas chứa SỐ DUNG SAI (số sau "±" / "+/-" đứng trước
// kVA / kW trong config.text). Sửa đề xuất: bỏ số dung sai (khi số đó không còn xuất hiện như một công suất thật trong text),
// thêm số gốc đứng trước dấu "±" của chính dòng đó nếu chưa có. In từng gói để soát tay; ghi [{id, kvas}] ra tệp.
const fs = require("fs");
const P = require(require("path").resolve(process.argv[2]));
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const fmt = (k) => (k || []).map((x) => x.v + " " + x.u).join(", ") || "∅";
const unit = (u) => (u.toLowerCase() === "mva" ? "MVA" : u.toLowerCase() === "kw" ? "kW" : "kVA");
const TOL = /(\d+(?:[.,]\d+)?)?\s*(?:±|\+\s*\/\s*-)\s*(\d+(?:[.,]\d+)?)\s*(kva|kw|mva)\b/gi;
const out = []; let all = 0;
for (const [id, { d }] of Object.entries(J)) {
  const c = d.config; if (!c || !(c.kvas || []).length) continue; all++;
  const text = String(c.text || ""), real = P.histPower(text);
  const has = (list, p) => list.some((q) => q.v === p.v && q.u === p.u);
  const tol = [...text.matchAll(TOL)].map((m) => ({ base: m[1] ? P.histNum(m[1]) : null, v: P.histNum(m[2]), u: unit(m[3]), line: text.slice(Math.max(0, text.lastIndexOf("\n", m.index) + 1), (text.indexOf("\n", m.index) + 1 || text.length + 1) - 1) }));
  const bad = tol.filter((t) => has(c.kvas, t) && !has(real, t));
  const small = c.kvas.filter((x) => x.v < 1 && x.u !== "MVA" && !bad.some((t) => t.v === x.v && t.u === x.u));
  if (!bad.length && !small.length) continue;
  let kvas = c.kvas.filter((x) => !has(bad, x));
  // Ba gói soát tay (dung sai viết "+0.5 KVA" hoặc "sai số ± 0,5" không kèm đơn vị):
  if (id === "IB2300305247") kvas = c.kvas.filter((x) => x.v !== 0.5); // "12.5kVA +0.5 KVA"
  if (id === "IB2400121273") kvas = [{ u: "kVA", v: 8.5 }, { u: "kVA", v: 85 }]; // "8,5 ± 0,5 kVA"; 85 là chữ bản scan, chờ Khoa
  if (id === "IB2500177469") kvas = real.filter((p, i, a) => a.findIndex((q) => q.v === p.v && q.u === p.u) === i).slice(0, 20); // đọc lại text
  for (const t of bad) if (t.base > 0 && !has(kvas, { v: t.base, u: t.u })) { const i = c.kvas.findIndex((x) => x.v === t.v && x.u === t.u); kvas.splice(Math.min(i, kvas.length), 0, { v: t.base, u: t.u }); }
  out.push({ id, kvas, was: c.kvas });
  console.log(`\n${id} | ${String(d.bidName).slice(0, 100)}\n   lưu: ${fmt(c.kvas)}\n   sửa: ${fmt(kvas)}${small.length ? `   (!) còn số < 1 không phải dung sai: ${fmt(small)}` : ""}`);
  for (const l of [...new Set(bad.map((t) => t.line))].slice(0, 4)) console.log("      " + l.slice(0, 220));
}
console.log(`\n${out.length} gói có số dung sai trong config.kvas / ${all} gói có công suất`);
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
