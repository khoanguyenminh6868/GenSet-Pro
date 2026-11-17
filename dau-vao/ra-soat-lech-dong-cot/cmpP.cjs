// So công suất từng bản ghi giữa hai bản catalog.js: node cmpP.cjs <repo cũ> <repo mới> [tệp ra]
// In MỌI bản ghi đổi, gom theo bảng, kèm tiêu đề và các ô trước ô động cơ, để soát từng dòng.
const fs = require("fs"), path = require("path");
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [A, B, outFile = path.join(__dirname, "cmpP.txt")] = process.argv.slice(2);
const fmt = (p) => { if (!p) return "∅"; const one = (x) => (x ? `${x.kVA ?? "·"}/${x.kW ?? "·"}` : null); return ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k[0].toUpperCase()} ${one(p[k])}`).join("  ") || "∅"; };
const read = (repo) => { const { C, S } = load(repo); const m = new Map(); for (const s of S) { if (s.status === "incomplete") continue; const seen = new Map(); for (const o of C.fromSupplier(s)) { let k = [o.supplierId, o.n, o.table, o.row ?? "L", o.kind, o.model, o.genset ?? ""].join("|"); const c = seen.get(k) || 0; seen.set(k, c + 1); if (c) k += "#" + c; m.set(k, o); } } return { m, C }; };
const a = read(A), b = read(B);
const tabs = new Map(); let same = 0, changed = 0, lost = 0, gained = 0, onlyA = 0, onlyB = 0, other = 0;
for (const [k, o] of a.m) {
  const n = b.m.get(k); if (!n) { onlyA++; continue; }
  const pa = fmt(o.power), pb = fmt(n.power);
  // khác ngoài công suất (model, thông số, hãng, tần số)
  const rest = (x) => JSON.stringify([x.freq, x.other, (x.specs || []).map((s) => [s.key, s.value]), (x.makes || []).map((m) => m.name)]);
  if (rest(o) !== rest(n)) other++;
  if (pa === pb) { same++; continue; }
  changed++; if (pb === "∅") lost++; if (pa === "∅") gained++;
  const tk = `${o.supplierId} n${o.n} bảng ${o.table}`; if (!tabs.has(tk)) tabs.set(tk, { header: o.header || o.lines?.header || [], rows: [] });
  const cells = o.line ? b.C.cellsOf(o.line) : []; const ei = cells.findIndex((c) => b.C.keyOf(c) === b.C.keyOf(o.model) || c === o.other);
  tabs.get(tk).rows.push({ row: o.row, zone: (ei > 0 ? cells.slice(0, ei + 1) : cells.slice(0, 9)).map((c) => String(c).slice(0, 18)).join(" | "), pa, pb, kind: o.kind });
}
for (const k of b.m.keys()) if (!a.m.has(k)) onlyB++;
const out = [`bản ghi cũ ${a.m.size}, mới ${b.m.size} | chỉ cũ ${onlyA}, chỉ mới ${onlyB} | công suất giữ nguyên ${same}, đổi ${changed} (mất ${lost}, thêm ${gained}) | khác ngoài công suất ${other} | bảng có đổi ${tabs.size}`];
const cut = (h) => b.C.cellsOf(h).map((x) => String(x).slice(0, 26)).join(" | ").slice(0, 420);
for (const [tk, t] of [...tabs].sort()) {
  out.push(`\n[${tk}] ×${t.rows.length}`); for (const h of t.header.slice(0, 3)) out.push("  H: " + cut(h));
  const seen = new Set();
  for (const r of t.rows.sort((x, y) => (x.row ?? 0) - (y.row ?? 0))) { const s = `  ${String(r.row).padStart(3)} ${r.zone}  ⇒  ${r.pa}  →  ${r.pb}`; const d = s.slice(6); if (seen.has(d)) continue; seen.add(d); out.push(s); }
}
fs.writeFileSync(outFile, out.join("\n"), "utf8"); console.log(out[0]); console.log("dòng in:", out.length, "→", outFile);
const bySup = new Map(); for (const [tk, t] of tabs) { const s = tk.split(" ")[0]; bySup.set(s, (bySup.get(s) || 0) + t.rows.length); }
console.log([...bySup].sort((x, y) => y[1] - x[1]).slice(0, 40).map((x) => x.join("×")).join(", "));
