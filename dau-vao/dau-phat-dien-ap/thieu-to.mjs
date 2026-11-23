// node thieu-to.mjs hien-trang.json → model đầu phát 3 hãng không có tờ hãng nào, xếp theo số NCC chào
import fs from "node:fs";
const j = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const MK = /stamford|leroy|mecc|marathon/i;
const miss = j.catalog.rows.filter((r) => MK.test(r.make) && !r.ratingRows && !r.attrKeys.length && !r.makerSup.length);
for (const mk of ["Stamford", "Leroy-Somer", "Mecc Alte", "Marathon"]) {
  const x = miss.filter((r) => r.make === mk).sort((a, b) => b.nSup - a.nSup);
  console.log(`\n${mk}: ${x.length} model thiếu tờ; có ≥2 NCC chào: ${x.filter((r) => r.nSup >= 2).length}; ≥5 NCC: ${x.filter((r) => r.nSup >= 5).length}`);
  console.log(x.slice(0, 25).map((r) => `${r.model}(${r.nSup})`).join(", "));
}
fs.writeFileSync("thieu-to.json", JSON.stringify(miss.map(({ model, make, nSup }) => ({ model, make, nSup })), null, 1));
