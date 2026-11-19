import fs from "node:fs";
const g = JSON.parse(fs.readFileSync("ct-goc.json")), h = JSON.parse(fs.readFileSync("ct-nhanh.json"));
for (const id of process.argv.slice(2)) {
  const a = g[id], b = h[id];
  if (JSON.stringify(a.top) !== JSON.stringify(b.top) || JSON.stringify(a.topScore) !== JSON.stringify(b.topScore)) {
    console.log(id, "top khác");
    a.top.forEach((k, i) => { if (b.top[i] !== k || b.topScore[i] !== a.topScore[i]) console.log(i, a.topScore[i], k.slice(0, 80), "|", b.topScore[i], (b.top[i] || "").slice(0, 80)); });
  }
}
