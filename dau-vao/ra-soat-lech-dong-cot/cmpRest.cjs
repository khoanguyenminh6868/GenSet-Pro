// node cmpRest.cjs <repo cũ> <repo mới>: bản ghi khác ngoài công suất (tần số, other, thông số, hãng)
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [A, B] = process.argv.slice(2);
const read = (repo) => { const { C, S } = load(repo); const m = new Map(); for (const s of S) { if (s.status === "incomplete") continue; const seen = new Map(); for (const o of C.fromSupplier(s)) { let k = [o.supplierId, o.n, o.table, o.row ?? "L", o.kind, o.model, o.genset ?? ""].join("|"); const c = seen.get(k) || 0; seen.set(k, c + 1); if (c) k += "#" + c; m.set(k, o); } } return m; };
const a = read(A), b = read(B);
const parts = (x) => ({ freq: x.freq, other: x.other, makes: (x.makes || []).map((m) => m.name).join(","), specs: Object.fromEntries((x.specs || []).map((s) => [s.key, s.value])) });
let n = 0;
for (const [k, o] of a) {
  const p = b.get(k); if (!p) continue;
  const x = parts(o), y = parts(p), d = [];
  for (const f of ["freq", "other", "makes"]) if (x[f] !== y[f]) d.push(`${f}: ${x[f]} → ${y[f]}`);
  for (const s of new Set([...Object.keys(x.specs), ...Object.keys(y.specs)])) if (x.specs[s] !== y.specs[s]) d.push(`${s}: ${x.specs[s]} → ${y.specs[s]}`);
  if (d.length && n++ < 60) console.log(k, "|", d.join("; "), "|", String(o.line).slice(0, 110));
}
console.log("tổng", n);
