// Dòng nào của AGC-4 Mk II (deif 1004) khớp UNIT của ctlKinds, ở phần cũ (1–700) hay phần mới: node do-agc4.mjs <worktree>
import fs from "node:fs";
import path from "node:path";

const [wt] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
const src = fs.readFileSync(path.join(SUP, "ctl-module.mjs"), "utf8");
const unitText = src.slice(src.indexOf("const UNIT = "), src.indexOf("// \"HGM6110N/6110NC"));
const UNIT = new Function(`${unitText}; return UNIT;`)();
const rec = JSON.parse(fs.readFileSync(path.join(SUP, "cn", "deif.json"), "utf8"));
for (const t of rec.specTables.filter((x) => /AGC.?4|AGC.?200/i.test(x.title))) {
  console.log(`\n${t.n} ${t.title} (${t.rows.length} dòng)`);
  t.rows.forEach((l, i) => { for (const [k, re] of UNIT) if (re.test(l)) console.log(`  dòng ${i + 1} ${i < 700 ? "cũ" : "MỚI"} [${k}] ${l.slice(0, 170)}`); });
}
