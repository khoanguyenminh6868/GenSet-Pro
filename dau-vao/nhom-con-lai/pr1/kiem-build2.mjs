// PR 1: khoá động cơ / đầu phát đổi: ngoài `uses` của eastern-lion, còn gì đổi? Đầu phát EL: khoảng kW / kVA cũ → mới.
// node kiem-build2.mjs <catalog cũ.js> <catalog mới.js> <cn> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [OLD, NEW, CN, OUT] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const A = load(OLD), B = load(NEW);
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8")));
const ba = A.build(sups), bb = B.build(sups);
const J = (x) => JSON.stringify(x, (k, v) => (v instanceof Set ? [...v].sort() : v));
const EL = "eastern-lion-fuan";
const out = ["vai\tkhoa\ttruong-doi-ngoai-uses\tuses-NCC-khac-doi\tuses-EL-cu\tuses-EL-moi\tchi-tiet"];
for (const kind of ["engines", "alternators"]) {
  const ka = new Map(ba[kind].map((e) => [e.key, e])), kb = new Map(bb[kind].map((e) => [e.key, e]));
  let n = 0, bad = 0;
  for (const [k, b] of kb) {
    const a = ka.get(k);
    if (!a || J(a) === J(b)) continue;
    n++;
    const fields = Object.keys({ ...a, ...b }).filter((x) => x !== "uses" && J(a[x]) !== J(b[x]));
    const foreign = J(a.uses.filter((u) => u.supplierId !== EL)) !== J(b.uses.filter((u) => u.supplierId !== EL));
    if (foreign) bad++;
    const det = fields.map((x) => `${x}: ${J(a[x]).slice(0, 160)} → ${J(b[x]).slice(0, 160)}`).join(" || ");
    out.push([kind, k, fields.join(","), foreign ? "CÓ" : "không", a.uses.filter((u) => u.supplierId === EL).length, b.uses.filter((u) => u.supplierId === EL).length, det].join("\t"));
  }
  const fcount = {};
  for (const r of out.slice(1)) if (r.startsWith(kind)) for (const f of r.split("\t")[2].split(",").filter(Boolean)) fcount[f] = (fcount[f] || 0) + 1;
  console.log(`${kind}: khoá đổi ${n}, uses NCC khác đổi ${bad}, trường ngoài uses đổi:`, JSON.stringify(fcount));
}
fs.writeFileSync(OUT, out.join("\n") + "\n");
