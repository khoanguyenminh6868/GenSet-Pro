// mins-head: so minsForSize của main (lib.B) với bản worktree wt-mins-head, mọi cỡ của mọi gói. node mh.mjs [full]
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import * as L from "./lib.mjs";
const N = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-mins-head/suppliers/config-bot.mjs").href + "?n");
const C = L.corpus(), KEYS = ["minDisp", "maxDisp", "minCyl", "minPrime", "maxFuel", "maxFuel75", "maxFuel50"];
const val = (v) => (v == null ? null : typeof v === "object" ? (v.kVA ?? v.kW) + (v.kVA != null ? "kVA" : "kW") : v);
const out = [], single = [];
let pk = 0, nsz = 0;
for (const [key, e] of C) {
  const { found, runs } = L.sizesOfEntry(e);
  if (found.length < 2) continue;
  pk++;
  const sizes = found; // như prep: sizes của sizesOf
  const text = N.technicalPart ? N.technicalPart(e.text) : e.text;
  for (const s of sizes.slice(0, N.MAX_SIZES)) {
    nsz++;
    const a = L.B.minsForSize(L.B.technicalPart(e.text), s, sizes), b = N.minsForSize(N.technicalPart(e.text), s, sizes);
    for (const k of KEYS) {
      const x = val(a.mins[k]), y = val(b.mins[k]);
      if (x !== y) out.push({ key, size: `${s.cap.value} ${s.cap.unit}`, k, old: x, now: y, howOld: a.how[k], howNow: b.how[k] });
    }
  }
}
// gói một cỡ: hintsOf không đổi
let singleDiff = 0, singles = 0;
for (const [key, e] of C) {
  const { found } = L.sizesOfEntry(e); if (found.length > 1) continue;
  singles++;
  if (JSON.stringify(L.B.hintsOf(e.text, "")) !== JSON.stringify(N.hintsOf(e.text, ""))) singleDiff++;
}
fs.writeFileSync(L.HERE + "/out/mh.json", JSON.stringify(out, null, 1));
const pkgs = [...new Set(out.map((r) => r.key))];
console.log("gói nhiều cỡ", pk, "cỡ", nsz, "| ngưỡng đổi", out.length, "| gói đổi", pkgs.length, pkgs.join(" "));
console.log("gói một cỡ", singles, "hintsOf khác:", singleDiff);
const t = {}; for (const r of out) { const g = (r.old == null ? "được" : r.now == null ? "bỏ" : "đổi"); t[g] = (t[g] || 0) + 1; } console.log(t);
for (const r of out) console.log(r.key, "|", r.size, "|", r.k, "|", r.old, "->", r.now, "|", r.howOld, "->", r.howNow);
process.exit(0);
