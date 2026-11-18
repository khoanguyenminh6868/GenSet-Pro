import fs from "node:fs";
const runs = JSON.parse(fs.readFileSync("explain.json", "utf8")); const R = new Map(JSON.parse(fs.readFileSync("cmp30.json", "utf8")).map((r) => [r.k, r]));
const changed = new Set(JSON.parse(fs.readFileSync("facts-changed.json", "utf8")));
const sup = (k) => k.split("|")[0];
let n = 0, bad = [];
for (const r of runs) {
  if (r.kind === "chỉ đổi all / dropped") continue;
  if (r.items.some((i) => !i.c.startsWith("bị chen"))) continue;
  const c = R.get(r.k); n++;
  const sc = c.allScore.map(([k, a, b]) => sup(k)).reduce((m, s) => (m[s] = (m[s] || 0) + 1, m), {});
  const ins = c.allIn.map(sup).reduce((m, s) => (m[s] = (m[s] || 0) + 1, m), {}), outs = c.allOut.map(sup).reduce((m, s) => (m[s] = (m[s] || 0) + 1, m), {});
  const rf = (c.rfA || []).filter((x) => !(c.rfB || []).includes(x)).map(sup).reduce((m, s) => (m[s] = (m[s] || 0) + 1, m), {});
  const topScoreRows = []; // dòng trong top có điểm đổi
  console.log(r.k, `[${r.kind}]`, "allScore", JSON.stringify(sc), "allIn", JSON.stringify(ins), "allOut", JSON.stringify(outs), "rowflagBỏ", JSON.stringify(rf));
  if (!Object.keys(sc).length && !Object.keys(ins).length && !Object.keys(outs).length && !Object.keys(rf).length) bad.push(r.k);
}
console.log("\nlượt chỉ-chen:", n, "không tìm thấy thay đổi nào ở all/điểm/rowflag:", bad.length, bad.join(" "));
