// node mm.mjs : 5 lượt chạy lại cục bộ lệch cloud: lệch ở đâu (gốc / nhánh, top / all)
import fs from "node:fs"; import zlib from "node:zlib";
const rd = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL(f, import.meta.url))));
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
const CA = rd("gop-goc.json.gz"), CB = rd("gop-nhanh.json.gz"), LA = J("r-goc.json"), LB = J("r-nhanh.json");
for (const id of "IB2200052056#0 IB2300133361#0 IB2300133361#1 IB2400457172#0 IB2500416364#0".split(" ")) for (const [n, L, C] of [["gốc", LA, CA], ["nhánh", LB, CB]]) {
  const l = L[id], c = C[id];
  const la = new Map(l.all.map(([k, s]) => [k + "@" + s, 1])), ca = new Set(c.all.map(([k, s]) => k + "@" + s));
  const onlyL = [...la.keys()].filter((x) => !ca.has(x)), onlyC = [...ca].filter((x) => !la.has(x));
  console.log(id, n, "top giống:", l.top.join() === c.top.join(), "all", l.all.length, c.all.length, "chỉ cục bộ:", onlyL.map((x) => x.slice(0, 50)).join(" ; "), "| chỉ cloud:", onlyC.map((x) => x.slice(0, 50)).join(" ; "));
  if (l.top.join() !== c.top.join()) { const st = new Set(c.top); console.log("   top cục bộ thiếu/khác thứ tự; khác tập:", l.top.filter((k) => !st.has(k)).map((x) => x.slice(0, 50)).join(" ; ")); }
}
