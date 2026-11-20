// Ghép báo cáo: head + body1..5, thay {{…}} bằng danh sách sinh từ bang-day-du.tsv. node ghep.mjs <out.md>
import fs from "node:fs";
const R = (f) => fs.readFileSync(f, "utf8");
const lists = R("lists.md").trim().split(/\n\s*\n/);
const pick = (pre) => lists.filter((x) => x.startsWith("**" + pre)).map((x) => "- " + x.trim()).join("\n");
const g24 = R("g24block.md").split(/\n(?=- \*\*)/);
const g2a = g24.filter((x) => !x.includes("huatai")).join("\n");
const g4 = g24.filter((x) => x.includes("huatai")).join("\n");
let md = [R("head.md"), R("body1.md"), R("body2.md"), R("body3.md"), R("body4.md"), R("body5.md")].join("\n");
md = md.replace("{{LIST1}}", "\n\n" + pick("1-") + "\n").replace("{{LIST2B}}", pick("2b-")).replace("{{G2A}}", g2a).replace("{{G3}}", R("g3block.md")).replace("{{G4}}", g4);
if (/\{\{/.test(md)) throw new Error("còn chỗ trống");
fs.writeFileSync(process.argv[2], md);
console.log(md.length, "ký tự");
