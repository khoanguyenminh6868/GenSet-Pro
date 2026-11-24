import fs from "node:fs";
const L = fs.readFileSync("truong-chat.tsv", "utf8").split("\n").slice(1).map((l) => l.split("\t"));
const [fs_, n, ex] = [process.argv[2].split(","), +process.argv[3] || 6, +process.argv[4] || 2];
for (const f of fs_) {
  console.log("## " + f);
  for (const r of L.filter((r) => r[0] === f).slice(0, n)) {
    console.log(`- [${r[1].slice(0, 4)}${r[2] ? ":" + r[2] : ""}] "${r[3]}" (${r[4]}) tb${r[5]}/m${r[6]}/n${r[7]} alt${r[8]}/eng${r[9]}/gen${r[10]} src${r[11]}/n${r[12]}`);
    for (let i = 0; i < ex; i++) if (r[13 + i]) console.log("    " + r[13 + i].slice(0, 190));
  }
}
