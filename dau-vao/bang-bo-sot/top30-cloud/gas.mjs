// node gas.mjs : 19 dòng khí của 4 bảng (green n126 OC16…, lees LSMU…NGE3) trong top / all của MỌI lượt cloud nhánh; và dòng 4 bảng nói chung
import fs from "node:fs"; import zlib from "node:zlib";
const B = JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL("gop-nhanh.json.gz", import.meta.url))));
const gas = (k) => /^green-power-generators\|OC16071A028/.test(k) || /^lees-power\|[^|]*\|[^|]*\|\|LSMU/.test(k);
const four = (k) => k.startsWith("green-power-generators|") || /^lees-power\|[^|]*\|[^|]*\|\|LSMU/.test(k);
let ga = 0, gt = 0, fa = 0, ft = 0, runsF = new Set(), runsT = new Set();
for (const [id, r] of Object.entries(B)) {
  for (const [k] of r.all || []) { if (gas(k)) ga++; if (four(k)) { fa++; runsF.add(id); } }
  for (const k of r.top || []) { if (gas(k)) gt++; if (four(k)) { ft++; runsT.add(id); } }
}
console.log(`lượt ${Object.keys(B).length}; dòng khí trong all ${ga}, top ${gt}; dòng green-power (mọi bảng) / lees LSMU trong all ${fa} (${runsF.size} lượt), top ${ft} (${runsT.size} lượt)`);
