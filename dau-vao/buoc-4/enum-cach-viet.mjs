// Buoc 4 kiem ke, phan 3: moi cach viet cua cac truong enum trong ban chuan (std-out = spec-standard.mjs --out), dem so lan / so model / so NCC,
// va trang thai theo values + same cua spec-fields.json (enumOf). Chay: node enum-cach-viet.mjs → enum-cach-viet.tsv
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const SS = await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/spec-standard.mjs").href);
const FIELDS = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/spec-fields.json", "utf8"));
const dir = path.join(OUT, "std-out");
const want = [["genset", "fuel"], ["genset", "iso8528_class"], ["engine", "cyl_layout"], ["engine", "aspiration"], ["engine", "governor"], ["alternator", "insulation"], ["alternator", "excitation"], ["controller", "kind"]];
const fdef = Object.fromEntries(want.map(([p, id]) => [`${p}.${id}`, FIELDS.parts[p].find((f) => f.id === id)]));
const agg = Object.fromEntries(want.map(([p, id]) => [`${p}.${id}`, new Map()]));
const NFKC = (s) => String(s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
let nDocs = 0;
for (const f of fs.readdirSync(dir)) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  nDocs++;
  // tai lieu tong may: models la object theo model; moi model co fields; NCC = d.supplierId
  const items = d.models && !Array.isArray(d.models) ? Object.entries(d.models).map(([mk, m]) => ({ id: `${d.part}:${d.supplierId}:${mk}`, part: d.part, suppliers: [d.supplierId], fields: m.fields })) : [d];
  for (const dd of items) for (const [id, arr] of Object.entries(dd.fields || {})) {
    const d = dd;
    const k = `${d.part}.${id}`;
    if (!agg[k]) continue;
    for (const e of arr) {
      const raw = NFKC(e.raw ?? (typeof e.value === "string" ? e.value : JSON.stringify(e.value)));
      const m = agg[k];
      const g = m.get(raw) || { n: 0, models: new Set(), ncc: new Set(), val: new Map(), missing: new Set() };
      g.n++; g.models.add(d.id); for (const s of d.suppliers || []) g.ncc.add(s); // NCC cua model (d.suppliers la danh sach); e.suppliers la so
      const vs = typeof e.value === "string" ? e.value : JSON.stringify(e.value);
      g.val.set(vs, (g.val.get(vs) || 0) + 1);
      for (const x of e.missing || []) g.missing.add(x);
      m.set(raw, g);
    }
  }
}
console.error("docs", nDocs);
const t = ["truong\tcach_viet_nguon\tlan\tmodel\tncc\tgia_tri_ban_chuan_hien_tai\tenumOf(values/same)\tghi_chu"];
for (const [k, m] of Object.entries(agg)) {
  const f = fdef[k];
  const rows = [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  for (const [raw, g] of rows) {
    const eo = SS.enumOf(f, raw);
    const cur = [...g.val.entries()].sort((a, b) => b[1] - a[1])[0][0];
    t.push([k, raw.replace(/\t/g, " "), g.n, g.models.size, g.ncc.size, cur.slice(0, 80), eo ? eo.value : "(ngoai danh sach)", [...g.missing].join("+")].join("\t"));
  }
  console.error(k, "so cach viet khac nhau:", rows.length, "tong lan:", rows.reduce((a, [, g]) => a + g.n, 0));
}
fs.writeFileSync(path.join(OUT, "enum-cach-viet.tsv"), t.join("\n"));
