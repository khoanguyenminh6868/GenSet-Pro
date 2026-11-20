// In lsSheetAttrs của mọi tệp nguồn có khối "General characteristics" (mọi NCC), kèm dòng nguyên văn, để soát tay.
// node ls-attrs.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const R = await import(pathToFileURL(path.join(root, "suppliers", "ratings.mjs")).href);
const src = path.join(root, "suppliers", "sources");
let files = 0;
for (const id of fs.readdirSync(src)) {
  const d = path.join(src, id);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".md"))) {
    const t = fs.readFileSync(path.join(d, f), "utf8");
    if (!/^General characteristics/im.test(t)) continue;
    files++;
    const a = R.lsSheetAttrs(t);
    console.log(`\n# ${id}/${f} (${(t.split("\n")[3] || "").slice(0, 50)})`);
    for (const x of a) console.log(`  ${x.key} = ${JSON.stringify(x.value)}   ⇐ ${x.lines.map((l) => l.trim()).join(" ⏎ ")}`);
    if (!a.length) console.log("  (không đọc được mục nào)");
  }
}
console.log(`\n${files} tệp có khối General characteristics`);
