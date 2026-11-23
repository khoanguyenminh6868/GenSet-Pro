// Gom MỌI bản ghi đổi theo kiểu đổi: hãng (trước → sau), công suất (từng ca), specs theo khoá (thêm / bỏ / đổi giá trị + mẫu).
//   node explain.mjs <gốc catalog> <gốc trước> <gốc sau> <id,id,...> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, before, after, idArg, outFile] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const recs = (r, id) => C.fromSupplier(JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8")), []);
const key = (r) => [r.kind, r.model, r.genset ?? "", r.line ?? ""].join(" ¦ ");
const group = (l) => { const m = new Map(); for (const r of l) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; };
const mk = (r) => (r.makes || []).map((x) => `${x.name}(${x.via})`).join("+") || "—";
const out = [];
for (const id of idArg.split(",")) {
  const ga = group(recs(before, id)), gb = group(recs(after, id));
  const makes = {}, spec = {}, power = [], other = {};
  for (const [k, ra] of ga) {
    const rb = gb.get(k) || [];
    ra.slice(0, rb.length).forEach((x, i) => {
      const y = rb[i];
      if (mk(x) !== mk(y)) { const t = `${mk(x)} → ${mk(y)}`; makes[t] = (makes[t] || 0) + 1; }
      if (JSON.stringify(x.power) !== JSON.stringify(y.power)) power.push(`${x.kind} ${x.model}: ${JSON.stringify(x.power)} → ${JSON.stringify(y.power)} | ${(x.line || "").slice(0, 70)}`);
      for (const f of ["freq", "emission", "phase", "voltage", "rpm"]) if (JSON.stringify(x[f]) !== JSON.stringify(y[f])) { const t = `${f}: ${JSON.stringify(x[f])} → ${JSON.stringify(y[f])}`; other[t] = (other[t] || 0) + 1; }
      const sa = new Map((x.specs || []).map((s) => [s.key + "¦" + s.label, s.value])), sb = new Map((y.specs || []).map((s) => [s.key + "¦" + s.label, s.value]));
      const ka = new Map((x.specs || []).map((s) => [s.key, s])), kb = new Map((y.specs || []).map((s) => [s.key, s]));
      for (const q of new Set([...ka.keys(), ...kb.keys()])) {
        const p = ka.get(q), r = kb.get(q);
        const type = !p ? "thêm" : !r ? "bỏ" : p.value !== r.value ? "đổi giá trị" : p.label !== r.label ? "chỉ đổi nhãn" : null;
        if (!type) continue;
        const t = `${q} ${type}`; spec[t] = spec[t] || { c: 0, eg: `${x.model}: ${p ? `${p.label}=${p.value}` : "—"} → ${r ? `${r.label}=${r.value}` : "—"}` }; spec[t].c++;
      }
      void sa; void sb;
    });
  }
  out.push(`=== ${id}`);
  out.push("hãng: " + JSON.stringify(makes));
  out.push("khác: " + JSON.stringify(other));
  for (const [t, v] of Object.entries(spec)) out.push(`specs ${t}: ${v.c} (vd ${v.eg})`);
  out.push(`công suất đổi: ${power.length}`); out.push(...power);
}
fs.writeFileSync(outFile, out.join("\n") + "\n", "utf8");
console.log(out.filter((l) => !/^(engine|alternator|genset) /.test(l)).map((l) => l.slice(0, 210)).join("\n"));
