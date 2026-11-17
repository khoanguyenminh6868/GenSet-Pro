import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const JUNK = /KW\)?$|KWH|G\/KW|CYLINDER|PHASE|≤|%|CONTAINER|HZ|\/MIN|GAL|CST|QTY|KG\/H|\d W$|^\d+W$|M3\/S|INLINE|^400V/i;
const ALTLIKE = /^(LTP|BW)/i;
let n = 0, expl = 0, unexpl = [], outJunk = 0, outAll = 0;
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k]; if (!b || a.error || b.error) continue;
  if (JSON.stringify(a.top) === JSON.stringify(b.top)) continue;
  n++;
  const out = a.top.filter((x) => !b.top.includes(x));
  const bad = out.filter((r) => { const [, e, al] = r.split("|"); return JUNK.test(e) || JUNK.test(al) || ALTLIKE.test(e); });
  outAll += out.length; outJunk += bad.length;
  if (bad.length) expl++; else unexpl.push({ k, out: out.length, in: b.top.filter((x) => !a.top.includes(x)).length });
}
console.log({ gói_đổi: n, có_dòng_ra_do_model_rác: expl, không_giải_thích_được: unexpl.length, dòng_ra: outAll, dòng_ra_có_model_rác: outJunk });
console.log(JSON.stringify(unexpl.slice(0, 15)));
