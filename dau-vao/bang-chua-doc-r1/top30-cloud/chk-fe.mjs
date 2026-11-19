import fs from "node:fs";
const G = JSON.parse(fs.readFileSync("gop-goc.json")), H = JSON.parse(fs.readFileSync("gop-nhanh.json"));
const rows = fs.readFileSync("cmp-dong.tsv", "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const out = { F: { tie: 0, pushed: 0 }, E: { tie: 0, pulled: 0 } }, list = [];
for (const [id, sec, key, a, b, c] of rows) {
  if (!/^[EF] /.test(c)) continue;
  const g = G[id], h = H[id], L = c[0];
  const s = L === "F" ? +a : +b;
  // F: row left; tie if nhánh's last top score equals its score. E: row entered; tie if gốc's last score equals its score.
  const last = L === "F" ? h.topScore[h.topScore.length - 1] : g.topScore[g.topScore.length - 1];
  const tie = last === s;
  out[L][tie ? "tie" : L === "F" ? "pushed" : "pulled"]++;
  list.push([id, L, tie ? "hoà-điểm-biên" : "thật", s, last, key.slice(0, 100)].join("\t"));
}
fs.writeFileSync("cmp-ef.tsv", "luot\tlop\tkieu\tdiem\tdiem-bien\tkhoa\n" + list.join("\n") + "\n");
console.log(out);
