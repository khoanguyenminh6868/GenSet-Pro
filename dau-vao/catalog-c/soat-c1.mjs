// Soát MỌI bản ghi gensetsOf cạnh dòng nguồn. node soat.mjs <repo> <t-rows.json> <out.tsv>
// In: bảng dùng (so 46 bảng soát tay), số bản ghi, mọi ca lệch: kW/kVA ngoài 0,75–0,86 (≠ 1), prime > standby,
// số không có trong chữ dòng, dòng T cũ không thành bản ghi (kèm lý do note), so với số đọc cũ (t-rows).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [REPO, TROWS, OUT] = process.argv.slice(2);
await import(pathToFileURL(path.join(REPO, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(REPO, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const T = JSON.parse(fs.readFileSync(TROWS, "utf8"));
const EXPECT = { "acepow-fuan": [6, 8, 9, 10, 14, 24, 47, 50, 51, 53, 57, 59, 61], "frs-shenyang": [6, 7, 8], googol: [0, 2, 8, 9, 10, 11, 12, 13, 14],
  "green-power-generators": [31], "interpower-international": [1], "kangwo-xiamen": [3], "superwatt-swt": [1, 23], teksan: [0, 1, 3, 5],
  "vpower-hk": [0, 1], westinpower: [19], "yingtai-jiangsu": [0, 7, 9, 13, 17, 22, 29], "zc-power": [11, 12] };
const recs = [], notes = [];
for (const s of sups) { if (s.status === "incomplete") continue; recs.push(...C.gensetsOf(s, notes)); }
const used = [...new Set(recs.map((r) => `${r.supplierId}|${r.table}`))].sort();
const exp = Object.entries(EXPECT).flatMap(([s, tis]) => tis.map((ti) => `${s}|${ti}`)).sort();
console.log("bảng dùng:", used.length, "khớp 46 bảng soát tay:", JSON.stringify(used) === JSON.stringify(exp));
for (const k of exp) if (!used.includes(k)) console.log("  THIẾU", k);
for (const k of used) if (!exp.includes(k)) console.log("  THỪA", k);
console.log("bản ghi:", recs.length, "NCC:", new Set(recs.map((r) => r.supplierId)).size, "model (NCC|key):", new Set(recs.map((r) => r.supplierId + "|" + C.keyOf(r.model))).size);
const nums = (s) => (String(s).match(/\d+(?:[.,]\d+)?/g) || []).map((x) => Number(x.replace(",", ".")));
const issues = [];
const lev = {};
for (const r of recs) {
  const P = r.power || {};
  lev[Object.keys(P).sort().join("+") || "(không)"] = (lev[Object.keys(P).sort().join("+") || "(không)"] || 0) + 1;
  const inLine = new Set(nums(r.line));
  for (const [k, p] of Object.entries(P)) {
    if (p.kW && p.kVA) { const q = p.kW / p.kVA; if (!(q >= 0.75 && q <= 0.86) && q !== 1) issues.push(["tỉ số kW/kVA", r, `${k} ${p.kW}/${p.kVA} = ${q.toFixed(3)}`]); }
    for (const v of [p.kW, p.kVA]) if (v != null && !inLine.has(v)) issues.push(["số không có trong dòng", r, `${k} ${v}`]);
  }
  for (const lv of ["prime", "rated"]) if (P[lv] && P.standby && ((P[lv].kW || 0) > (P.standby.kW ?? 1e9) || (P[lv].kVA || 0) > (P.standby.kVA ?? 1e9))) issues.push([`${lv} > standby`, r, JSON.stringify(P)]);
  if (r.freq && !inLine.has(r.freq)) issues.push(["tần số không có trong dòng", r, r.freq]);
  for (const sp of r.specs) if (!r.line.includes(sp.value)) issues.push(["thông số không nguyên văn trong dòng", r, `${sp.key}=${sp.value}`]);
  if (!r.line.includes(r.model)) issues.push(["model không có trong dòng", r, r.model]);
}
console.log("mức công suất:", JSON.stringify(lev));
const cnt = (f) => recs.filter(f).length;
console.log("có kVA:", cnt((r) => Object.values(r.power || {}).some((p) => p.kVA)), "có kW:", cnt((r) => Object.values(r.power || {}).some((p) => p.kW)), "có tần số:", cnt((r) => r.freq), "(50:", cnt((r) => r.freq === 50), "60:", cnt((r) => r.freq === 60), ") có hãng:", cnt((r) => r.makes.length));
const keys = {}; for (const r of recs) for (const k of new Set(r.specs.map((x) => x.key))) keys[k] = (keys[k] || 0) + 1;
console.log("thông số:", JSON.stringify(keys));
const by = {}; for (const r of recs) by[r.supplierId] = (by[r.supplierId] || 0) + 1;
console.log("theo NCC:", JSON.stringify(by));
console.log("\nCA LỆCH:", issues.length);
for (const [w, r, d] of issues) console.log(`  [${w}] ${r.supplierId} n${r.n} r${r.row} ${r.model}: ${d} | ${r.line.slice(0, 140)}`);
// Dòng T cũ (1.753) không thành bản ghi: kèm note.
const have = new Set(recs.map((r) => `${r.supplierId}|${r.table}|${r.row}`));
const lost = T.filter((h) => !have.has(`${h.sup}|${h.ti}|${h.ri}`));
console.log("\nDÒNG T KHÔNG THÀNH BẢN GHI:", lost.length);
const nk = (h) => notes.filter((x) => x.supplierId === h.sup && x.table === h.ti && x.row === h.ri).map((x) => x.reason).join("; ");
const lostBy = {}; for (const h of lost) { const k = `${h.sup} n${h.n} | ${nk(h)}`; lostBy[k] = (lostBy[k] || 0) + 1; }
for (const [k, v] of Object.entries(lostBy)) console.log(`  ${v} × ${k}`);
const extra = recs.filter((r) => !T.some((h) => h.sup === r.supplierId && h.ti === r.table && h.ri === r.row));
console.log("bản ghi KHÔNG thuộc 1.753 dòng T cũ:", extra.length, extra.slice(0, 5).map((r) => `${r.supplierId} ${r.table}/${r.row} ${r.line}`));
// Note của gensetsOf theo lý do (kể cả dòng không thành bản ghi).
const nr = {}; for (const x of notes) nr[x.reason] = (nr[x.reason] || 0) + 1;
console.log("\nnote gensetsOf:", JSON.stringify(nr, null, 1));
for (const x of notes.filter((x) => !/bố cục cột/.test(x.reason))) console.log(`  ${x.supplierId} n${x.n} r${x.row}: ${x.reason} — ${x.detail}`);
// So số đọc cũ ↔ mới theo dòng.
const old = new Map(T.map((h) => [`${h.sup}|${h.ti}|${h.ri}`, h]));
const diff = {};
for (const r of recs) {
  const h = old.get(`${r.supplierId}|${r.table}|${r.row}`); if (!h) continue;
  const a = JSON.stringify(h.power || null), b = JSON.stringify(r.power), sameP = JSON.stringify(sortP(h.power)) === JSON.stringify(sortP(r.power));
  const mk = (x) => (x.makes || []).map((m) => `${m.name}/${m.via}`).join(",");
  if (mk(h) !== mk(r)) console.log(`  HÃNG ĐỔI ${r.supplierId} n${r.n} r${r.row}: ${mk(h)} → ${mk(r)} | ${r.line.slice(0, 120)}`);
  const k = `${r.supplierId}: công suất ${sameP ? "giữ" : "ĐỔI"}, tần số ${h.freq === r.freq ? "giữ" : `${h.freq}→${r.freq}`}`;
  diff[k] = (diff[k] || 0) + 1;
}
function sortP(p) { if (!p) return null; return Object.fromEntries(Object.keys(p).sort().map((k) => [k, Object.fromEntries(Object.keys(p[k]).sort().map((u) => [u, p[k][u]]))])); }
console.log("\nso với số đọc cũ (theo NCC):"); for (const [k, v] of Object.entries(diff).sort()) console.log(`  ${v} × ${k}`);
// Bảng đầy đủ để soát tay.
const tsv = ["ncc\tn\tti\tri\tmodel\tpower\tfreq\thãng\tthông số\tcũ: power\tcũ: freq\tdòng"];
for (const r of recs) { const h = old.get(`${r.supplierId}|${r.table}|${r.row}`); tsv.push([r.supplierId, r.n, r.table, r.row, r.model, JSON.stringify(r.power), r.freq ?? "", r.makes.map((m) => `${m.name}/${m.via}`).join(","), r.specs.map((x) => `${x.key}=${x.value}`).join("; "), JSON.stringify(h?.power ?? null), h?.freq ?? "", r.line].join("\t")); }
fs.writeFileSync(OUT, tsv.join("\n"));
