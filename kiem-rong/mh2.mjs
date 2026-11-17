// mh2: bản mới có / không luật agreed
import { pathToFileURL } from "node:url";
import * as L from "./lib.mjs";
const N = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-mins-head/suppliers/config-bot.mjs").href + "?n");
const C = L.corpus(), KEYS = ["minDisp", "maxDisp", "minCyl"];
const ids = process.argv.slice(2);
for (const [key, e] of C) {
  if (ids.length && !ids.includes(key)) continue;
  const { found } = L.sizesOfEntry(e); if (found.length < 2) continue;
  const tp = N.technicalPart(e.text);
  for (const s of found.slice(0, N.MAX_SIZES)) {
    delete process.env.NO_AGREED; const a = N.minsForSize(tp, s, found);
    process.env.NO_AGREED = "1"; const b = N.minsForSize(tp, s, found); delete process.env.NO_AGREED;
    for (const k of KEYS) if (a.mins[k] !== b.mins[k]) console.log(key, s.cap.value + s.cap.unit, k, "co agreed:", a.mins[k], "| bo:", b.mins[k], a.how[k]);
  }
}
process.exit(0);
