// Independent check of web/spec-norm.js: every unit / condition it states must be backed by text of the source.
const fs = require("fs"), path = require("path");
const REPO = process.argv[2];
for (const f of ["web/conversions.js", "web/spec-norm.js"]) new Function(fs.readFileSync(path.join(REPO, f), "utf8"))();
const { C, S } = require("./load.cjs")(REPO);
const SN = globalThis.GenbidSpecNorm;
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 20) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
let seed = 987654321; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const EVID = {
  "L/h": /l\s*\/\s*h|lph|lit(re|er)s?\s*\/\s*h|l\/hr|升\/(小)?时|lít\/gi/i, "g/kWh": /g\s*\/\s*\(?\s*kw|g\/kwh|克/i, "m³/h": /m\s*[3³]\s*\/\s*h|立方/i, "gal/h": /gal/i, "kg/h": /kg\s*\/\s*h/i,
  "dB(A)": /db/i, mm: /mm|毫米/i, cm: /cm/i, m: /\bm\b|米/i, kg: /kg|公斤|千克/i, t: /\bt\b|ton|吨/i, L: /\bl\b|\(l\)|ltr|lit(re|er)|升|\dl\b|l$/i, cc: /cc|cm3|ml/i, "in³": /in3|cu|cubic/i,
  rpm: /rpm|r\s*\/\s*min|转|min-1|v\/p/i, V: /v\b|伏|volt|电压/i, kW: /kw|千瓦/i, hp: /hp/i, PS: /ps|马力/i, gal: /gal/i, h: /h\b|hour|小时/i,
};
const noEvid = new Map(), ex = new Map(), units = new Map(), conds = new Map(), pool = { load: [], distance_m: [], enclosure: [], basis: [], headerUnit: [], scale: [], conv: [], rating: [] };
let total = 0, withUnit = 0;
for (const s of S) {
  if (s.status === "incomplete") continue;
  for (const o of C.fromSupplier(s)) {
    const norm = SN.normalizeRecord(o) || [];
    const list = Array.isArray(norm) ? norm : norm.specs || [];
    for (const r of list) {
      total++;
      const hdr = (o.header || []).join(" "), text = `${r.raw.label} ${r.raw.value} ${hdr} ${o.title || ""}`;
      cnt(units, `${r.key}:${r.unit}`);
      if (r.unit && !r.missing.includes("unit")) {
        withUnit++;
        const re = EVID[r.unit];
        if (!re || !re.test(text)) { cnt(noEvid, `${r.key}:${r.unit}`); const k = `${r.key}:${r.unit}`; if (!ex.has(k)) ex.set(k, []); if (ex.get(k).length < 4) ex.get(k).push(`[${s.id} n${o.n}] "${r.raw.label}" = "${r.raw.value}" | hdr: ${hdr.slice(0, 120)}`); }
      }
      for (const [ck, cv] of Object.entries(r.cond || {})) { cnt(conds, `${r.key}.${ck}`); if (pool[ck] && rnd() < 0.02) pool[ck].push({ s: s.id, n: o.n, r, hdr, title: o.title }); }
      if (r.enum) for (const e of r.enum) if (e.scale && rnd() < 0.02) pool.scale.push({ s: s.id, n: o.n, r, hdr, title: o.title });
      if (r.conv && rnd() < 0.2) pool.conv.push({ s: s.id, n: o.n, r, hdr, title: o.title });
    }
  }
}
console.log("gia tri chuan hoa:", total, "| co don vi:", withUnit);
console.log("DON VI KHONG TIM THAY CHU LAM BANG CHUNG (nhan + o + tieu de + ten bang):", [...noEvid.values()].reduce((a, b) => a + b, 0), top(noEvid).map((x) => x.join("=")).join(", "));
for (const [k, l] of ex) { console.log("  ", k); for (const e of l) console.log("      ", e.slice(0, 330)); }
console.log("\ndieu kien da doc:", top(conds, 60).map((x) => x.join("=")).join(", "));
const show = (name, n = 6) => { const p = pool[name]; console.log(`\n-- mau ${name} (${p.length} trong ro) --`); for (let i = 0; i < n && p.length; i++) { const x = p.splice(Math.floor(rnd() * p.length), 1)[0]; const { raw, key, ...rest } = x.r; console.log(`  [${x.s} n${x.n}] ${key} "${raw.label}" = "${raw.value}"\n      -> ${JSON.stringify(rest).slice(0, 300)}\n      ten bang: ${String(x.title).slice(0, 90)} | tieu de: ${x.hdr.slice(0, 200)}`); } };
for (const k of ["load", "distance_m", "enclosure", "basis", "headerUnit", "scale", "conv"]) show(k, k === "enclosure" || k === "headerUnit" ? 8 : 5);
