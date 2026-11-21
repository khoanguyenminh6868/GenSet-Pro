// Soát MỌI fact Baudouin mới (bảng dòng máy): (1) xi lanh × bore × hành trình ↔ dung tích theo từng model + nguồn;
// (2) so với giá trị NCC khác đã ghi cho model đó (facts-goc.tsv). node soat-dong-may.mjs
import fs from "node:fs";
const read = (f) => fs.readFileSync(new URL(f, import.meta.url), "utf8").trim().split("\n").map((l) => l.split("\t"));
const them = read("./facts-them.tsv").filter((r) => r[1] === "baudouin" && ["cyl", "disp", "bore"].includes(r[3])), goc = read("./facts-goc.tsv");
const num = (k, v) => (k === "bore" ? (String(v).match(/\d+(?:\.\d+)?/g) || []).slice(0, 2).map(Number).join("x") : String((String(v).match(/\d+(?:\.\d+)?/) || [])[0]));
const by = new Map();
for (const [m, , n, k, , v] of them) { const id = `${m}|${n}`; by.set(id, { ...(by.get(id) || {}), [k]: v }); }
let ok = 0, thieu = 0; const bad = [];
for (const [id, x] of by) {
  if (!x.cyl || !x.bore || !x.disp) { thieu++; continue; }
  const [b, s] = num("bore", x.bore).split("x").map(Number), calc = Math.PI / 4 * b * b * s * parseInt(x.cyl) / 1e6, L = parseFloat(x.disp);
  if (Math.abs(calc - L) / L > 0.05) bad.push(`${id} ${x.cyl} × ${x.bore} = ${calc.toFixed(2)} L, ghi ${x.disp}`); else ok++;
}
const lech = [], tally = { khop: 0, "khong-NCC-khac": 0, lech: 0 };
for (const [m, , n, k, , v] of them) {
  const o = goc.filter((r) => r[0] === m && r[3] === k && r[1] !== "baudouin");
  if (!o.length) { tally["khong-NCC-khac"]++; continue; }
  const close = (a, b) => (k === "disp" ? Math.abs(a - b) / b <= 0.01 : a === b);
  const vals = o.map((r) => num(k, r[5]));
  if (vals.some((y) => (k === "disp" ? close(+num(k, v), +y) : y === num(k, v)))) tally.khop++;
  else { tally.lech++; lech.push(`${m} [${n}] ${k}: Baudouin ${v} ↔ ${[...new Set(o.map((r) => `${r[1]}=${r[5]}`))].slice(0, 4).join(", ")}`); }
}
fs.writeFileSync(new URL("./soat-dong-may.txt", import.meta.url), [...bad.map((x) => `HÌNH HỌC ${x}`), ...lech].join("\n") + "\n");
console.log(`model × nguồn ${by.size}: hình học khớp ${ok}, lệch ${bad.length}, thiếu số ${thieu} | so NCC khác`, JSON.stringify(tally));
console.log(bad.slice(0, 15).join("\n")); console.log(lech.slice(0, 40).join("\n"));
