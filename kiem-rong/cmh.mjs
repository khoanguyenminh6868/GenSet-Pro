// cmh: configmatch hạng 1-3: hints (theo cỡ) của main và wt-mins-head có khác ở lượt nào của gói configmatch không
import { pathToFileURL } from "node:url";
import * as L from "./lib.mjs";
const N = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-mins-head/suppliers/config-bot.mjs").href + "?n");
const C = L.corpus(), CMR = L.configmatch(), K = ["minDisp", "maxDisp", "minCyl", "minPrime", "maxFuel", "maxFuel75", "maxFuel50"];
let runs = 0, changed = 0, cfgs = 0, cfgChanged = 0;
for (const key of Object.keys(CMR)) {
  const e = C.get(key); if (!e) { console.log("thiếu HSMT", key); continue; }
  const { found, runs: rs } = L.sizesOfEntry(e), r0 = CMR[key];
  for (const run of rs) {
    runs++;
    const sz = found.length > 1 ? { size: run.size, sizes: found } : undefined;
    const a = L.B.hintsOf(e.text, "", sz), b = N.hintsOf(e.text, "", sz);
    const n = (r0.sizes ? r0.sizes.find((x) => x.cap?.value === run.cap.value)?.result : r0)?.configs?.filter((c) => c.rank <= 3).length || 0;
    cfgs += n;
    const d = K.filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    if (d.length) { changed++; cfgChanged += n; console.log("ĐỔI", key, run.cap.value + run.cap.unit, d.map((k) => `${k}:${JSON.stringify(a[k])}->${JSON.stringify(b[k])}`).join(" "), "cấu hình hạng<=3:", n); }
  }
}
console.log("gói", Object.keys(CMR).length, "lượt", runs, "cấu hình hạng1-3", cfgs, "| lượt đổi ngưỡng", changed, "cấu hình bị ảnh hưởng", cfgChanged);
process.exit(0);
