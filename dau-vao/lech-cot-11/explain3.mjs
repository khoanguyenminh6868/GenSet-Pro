import fs from "node:fs";
const A = JSON.parse(fs.readFileSync("gop-main.json", "utf8")), B = JSON.parse(fs.readFileSync("gop-lech-cot-11.json", "utf8"));
const R = JSON.parse(fs.readFileSync("cmp30.json", "utf8")).filter((r) => r.orderDiff);
const changed = new Set(JSON.parse(fs.readFileSync("facts-changed.json", "utf8")));
const L = fs.readFileSync("gop-so.txt", "utf8");
let ok = 0, no = [];
const out = [];
for (const r of R) {
  const a = A[r.k], b = B[r.k];
  const sa = new Map(a.top.map((x, i) => [x, a.topScore[i]])), sb = new Map(b.top.map((x, i) => [x, b.topScore[i]]));
  const moved = b.top.map((x, i) => [x, a.top.indexOf(x), i]).filter(([, p, q]) => p !== q);
  const why = [];
  for (const [x, p, q] of moved) { const [sup, eng, alt] = x.split("|"); const d = sb.get(x) - sa.get(x); const fc = changed.has("engine:" + eng) || changed.has("alternator:" + alt); why.push(`${sup}|${eng}${alt ? "|" + alt : ""} hạng ${p + 1}→${q + 1} điểm ${sa.get(x)}→${sb.get(x)}${d ? " Δ" + d : ""}${fc ? " (dữ kiện " + eng + " đổi)" : ""}`); }
  const tied = moved.every(([x]) => sa.get(x) === sb.get(x)); // đổi thứ tự mà điểm KHÔNG đổi: do dòng khác trong top đổi điểm / hoà điểm
  const reason = moved.some(([x]) => sa.get(x) !== sb.get(x)) ? "điểm đổi" : "hoà điểm / điểm của dòng kế bên đổi";
  out.push(`${r.k}: ${reason}\n   ${why.join("\n   ")}`);
  if (reason === "điểm đổi") ok++; else no.push(r.k);
}
fs.writeFileSync("order-explain.txt", out.join("\n"));
console.log("lượt chỉ đổi thứ tự:", R.length, "| có dòng đổi điểm:", ok, "| không:", no.length, no.join(" "));
