import { pathToFileURL } from "node:url";
import * as L from "./lib.mjs";
const N = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-mins-head/suppliers/config-bot.mjs").href + "?n");
const C = L.corpus(), [id, ...r] = process.argv.slice(2);
const t = N.technicalPart(C.get(id).text).split("\n");
for (let i = 0; i < r.length; i += 2) for (let j = +r[i]; j <= +r[i + 1]; j++) console.log(j, t[j - 1]?.trim().slice(0, 120));
process.exit(0);
