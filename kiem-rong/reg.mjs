// Mục 6: hồi quy trên configmatch (cấu hình đang hiển thị). node reg.mjs -> out/reg.json
import fs from "node:fs";
import * as L from "./lib.mjs";
const C = L.corpus(), sups = L.loadSuppliers(), env = new L.Env(sups), CMR = L.configmatch();
const out = [];
for (const key of Object.keys(CMR)) {
  const e = C.get(key); if (!e) { console.log("thiếu HSMT", key); continue; }
  const prev = CMR[key], { runs } = L.sizesOfEntry(e);
  for (const run of runs) {
    const cap = run.cap, pr = prev.sizes ? prev.sizes.find((x) => x.cap?.value === cap.value)?.result : prev;
    if (!pr?.configs) continue;
    const keep = L.B.keepOf(pr);
    const R = env.prep(e, cap, { keep }), O = env.prep(e, cap, { keep, mod: L.OLD });
    const full = env.full;
    const pk = (x) => `${x.u.supplierId}\n${x.e.key}`;
    const stat = (P) => {
      const top = new Set(P.top.map(pk)), rows = new Set(P.all.map(pk)), dr = new Map(P.dropped.map((x) => [pk(x), x]));
      return { top, rows, dr };
    };
    const S = stat(R), So = stat(O);
    for (const c of pr.configs) {
      const ek = c.engine?.model && L.CAT.keyOf(c.engine.model);
      const sids = [...new Set([...(c.suppliers || []).map((s) => s.supplierId), c.engine?.src?.supplierId].filter(Boolean))];
      const pairs = sids.map((s) => `${s}\n${ek}`);
      const cls = (S2, P) => {
        if (pairs.some((p) => S2.top.has(p))) return { st: "top" };
        if (pairs.some((p) => S2.rows.has(p))) return { st: "cut" };
        const dp = pairs.find((p) => S2.dr.has(p));
        if (dp) return { st: "dropped", ruled: [...new Set(pairs.flatMap((p) => S2.dr.get(p)?.ruled || []))], ev: pairs.filter((p) => S2.dr.has(p)).slice(0, 2).map((p) => L.evidence(S2.dr.get(p), P.hints, P.opts.facts || env.catFor(P.origin, P.sync, P.partsOnly, P.brand).facts, cap)) };
        const eng = full.engines.find((x) => x.key === ek);
        const uses = (eng?.uses || []).filter((u) => sids.includes(u.supplierId));
        if (!eng) return { st: "noEngine" };
        if (!uses.length) return { st: "noRow" };
        return { st: "outOfBand", ratios: uses.map((u) => L.ratioOf(u, cap).map((v) => +v.toFixed(3))), sups: uses.map((u) => u.supplierId) };
      };
      out.push({ key, cap, rank: c.rank, engine: c.engine?.model, make: c.engine?.make, sids, fromFind: !!c.fromFind, now: cls(S, R), old: cls(So, O), mins: R.hints, hints1: { minDisp: R.hints.minDisp, maxDisp: R.hints.maxDisp, minCyl: R.hints.minCyl, minPrime: R.hints.minPrime } });
    }
  }
}
fs.writeFileSync(L.HERE + "/out/reg.json", JSON.stringify(out, null, 1));
const t = {}; for (const r of out) { const k = r.now.st + (r.now.ruled ? ":" + r.now.ruled.join("+") : ""); t[k] = (t[k] || 0) + 1; }
console.log("cấu hình", out.length, t);
const t2 = {}; for (const r of out) { const k = r.old.st; t2[k] = (t2[k] || 0) + 1; } console.log("dải cũ", t2);
process.exit(0);
