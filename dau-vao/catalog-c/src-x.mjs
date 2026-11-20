// node src-x.mjs <repo> : mỗi dòng của 4 bảng X có nguyên văn trong suppliers/sources/<id>/<n>.md không
import fs from "node:fs";
import path from "node:path";
const REPO = process.argv[2];
const X = { "green-power-generators": [16, 18, 27], "lees-power": [31] };
for (const [id, tis] of Object.entries(X)) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, "suppliers", "cn", id + ".json"), "utf8"));
  for (const ti of tis) {
    const t = s.specTables[ti], src = fs.readFileSync(path.join(REPO, "suppliers", "sources", id, `${t.n}.md`), "utf8");
    const miss = t.rows.filter((r) => !src.includes(r.trim()));
    console.log(`${id} n${t.n}: ${t.rows.length} dòng, có nguyên văn ${t.rows.length - miss.length}, URL ${src.match(/^URL: (.*)$/m)?.[1]}, Accessed ${src.match(/^Accessed: (.*)$/m)?.[1]}`);
    for (const m of miss) console.log("   THIẾU", m);
  }
}
