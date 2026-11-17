// node cmpSpec.cjs <repo cũ> <repo mới> [tệp ra]: MỌI bản ghi khác nhau (công suất, tần số, other, hãng, model, thông số) giữa hai bản
// catalog.js, gom theo bảng, in tiêu đề + từng dòng + từng thay đổi để soát bằng mắt. Cả bản ghi chỉ có ở một bên.
const fs = require("fs"), path = require("path");
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [A, B, outFile = path.join(__dirname, "cmpSpec.txt")] = process.argv.slice(2);
const read = (repo) => { const { C, S } = load(repo); const m = new Map(); for (const s of S) { if (s.status === "incomplete") continue; const seen = new Map(); for (const o of C.fromSupplier(s)) { let k = [o.supplierId, o.n, o.table, o.row ?? "L", o.kind].join("|"); const c = seen.get(k) || 0; seen.set(k, c + 1); k += "#" + c; m.set(k, o); } } return m; };
const a = read(A), b = read(B);
const pw = (p) => (p ? ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k[0].toUpperCase()} ${p[k].kVA ?? "·"}/${p[k].kW ?? "·"}`).join(" ") : "∅");
const parts = (x) => ({ model: x.model, genset: x.genset ?? "", power: pw(x.power), freq: x.freq, other: x.other, makes: (x.makes || []).map((m) => m.name).join(","), specs: Object.fromEntries((x.specs || []).map((s, i, l) => [s.key + (l.slice(0, i).filter((t) => t.key === s.key).length || ""), `${s.value}`])) });
const tabs = new Map(), kinds = {}; let n = 0, onlyA = 0, onlyB = 0;
const push = (o, txt) => { const tk = `${o.supplierId} n${o.n} bảng ${o.table}`; if (!tabs.has(tk)) tabs.set(tk, { header: o.header || o.lines?.header || [], rows: [] }); tabs.get(tk).rows.push({ row: o.row, line: String(o.line || "(bảng nhãn)").slice(0, 190), txt }); };
for (const [k, o] of a) {
  const p = b.get(k); if (!p) { onlyA++; push(o, `MẤT bản ghi ${o.kind} ${o.model}`); continue; }
  const x = parts(o), y = parts(p), d = [];
  for (const f of ["model", "genset", "power", "freq", "other", "makes"]) if (x[f] !== y[f]) { d.push(`${f}: ${x[f]} → ${y[f]}`); kinds[f] = (kinds[f] || 0) + 1; }
  for (const s of new Set([...Object.keys(x.specs), ...Object.keys(y.specs)])) if (x.specs[s] !== y.specs[s]) { d.push(`${s}: ${x.specs[s] ?? "∅"} → ${y.specs[s] ?? "∅"}`); const kk = `${s.replace(/\d+$/, "")} ${x.specs[s] == null ? "thêm" : y.specs[s] == null ? "bỏ" : "đổi"}`; kinds[kk] = (kinds[kk] || 0) + 1; }
  if (d.length) { n++; push(o, d.join("; ")); }
}
for (const [k, o] of b) if (!a.has(k)) { onlyB++; push(o, `THÊM bản ghi ${o.kind} ${o.model}`); }
const out = [`bản ghi cũ ${a.size}, mới ${b.size} | khác ${n} | chỉ cũ ${onlyA}, chỉ mới ${onlyB} | bảng có đổi ${tabs.size}`, JSON.stringify(kinds)];
for (const [tk, t] of [...tabs].sort()) {
  out.push(`\n[${tk}] ×${t.rows.length}`); for (const h of t.header.slice(0, 3)) out.push("  H: " + String(h).slice(0, 330));
  for (const r of t.rows.sort((x, y) => (x.row ?? 0) - (y.row ?? 0))) out.push(`  ${String(r.row).padStart(3)} ${r.line}\n        ⇒ ${r.txt}`);
}
fs.writeFileSync(outFile, out.join("\n"), "utf8"); console.log(out[0]); console.log(out[1]); console.log("→", outFile);
const bySup = new Map(); for (const [tk, t] of tabs) { const s = tk.split(" ")[0]; bySup.set(s, (bySup.get(s) || 0) + t.rows.length); }
console.log([...bySup].sort((x, y) => y[1] - x[1]).map((x) => x.join("×")).join(", "));
