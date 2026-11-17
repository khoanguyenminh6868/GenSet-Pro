import { pathToFileURL } from "node:url";
import * as L from "./lib.mjs";
const N = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-mins-head/suppliers/config-bot.mjs").href + "?n");
const C = L.corpus();
for (const id of process.argv.slice(2)) { const e = C.get(id), { found } = L.sizesOfEntry(e), tp = N.technicalPart(e.text);
  for (const s of found) { const r = N.minsForSize(tp, s, found); console.log(id, s.cap.value + s.cap.unit, ["minDisp","minCyl","minPrime","maxFuel"].map((k) => k + "=" + JSON.stringify(r.mins[k]?.kVA ?? r.mins[k]) + "(" + r.how[k] + ")").join(" ")); } }
process.exit(0);
