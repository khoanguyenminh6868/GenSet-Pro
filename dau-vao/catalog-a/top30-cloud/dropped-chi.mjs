// Lượt chỉ dropped đổi (cmp-top30.md mục "Lượt chỉ dropped / rowflag đổi"): khoá dropped vào / ra theo NCC × lý do.
import fs from "node:fs";
const cg = JSON.parse(fs.readFileSync("ct-goc.json", "utf8")), ch = JSON.parse(fs.readFileSync("ct-nhanh.json", "utf8"));
const ids = [...fs.readFileSync("cmp-top30.md", "utf8").split("## Lượt chỉ dropped")[1].matchAll(/^- (IB\S+)/gm)].map((m) => m[1]);
const ms = (r) => new Map(r.dropped.map(([k, w]) => [`${k}\t${w}`, 1]));
const tally = {}, out = ["luot\tvao/ra\tkhoa\tly-do"];
for (const id of ids) {
  const g = ms(cg[id]), h = ms(ch[id]);
  for (const k of h.keys()) if (!g.has(k)) { const [key, w] = k.split("\t"); out.push([id, "vào", key, w].join("\t")); const t = `vào ${key.split("|")[0]} ${w}`; tally[t] = (tally[t] || 0) + 1; }
  for (const k of g.keys()) if (!h.has(k)) { const [key, w] = k.split("\t"); out.push([id, "ra", key, w].join("\t")); const t = `ra ${key.split("|")[0]} ${w}`; tally[t] = (tally[t] || 0) + 1; }
}
fs.writeFileSync("dropped-chi.tsv", out.join("\n") + "\n");
console.log(ids.length, "lượt");
for (const [k, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(n, k);
