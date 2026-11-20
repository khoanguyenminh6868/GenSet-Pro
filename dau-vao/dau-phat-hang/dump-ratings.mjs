// Chụp đầu ra của ratings.mjs trên MỌI tệp sources/*/*.md (mọi NCC): ratingsOf, altSheetAttrs, và lsSheetAttrs nếu có.
// node dump-ratings.mjs <gốc repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]), out = process.argv[3];
const R = await import(pathToFileURL(path.join(root, "suppliers", "ratings.mjs")).href);
const src = path.join(root, "suppliers", "sources"), res = {};
for (const id of fs.readdirSync(src)) {
  const d = path.join(src, id);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".md"))) {
    const t = fs.readFileSync(path.join(d, f), "utf8");
    const r = R.ratingsOf(t).map(({ lines, ...x }) => x);
    const a = R.altSheetAttrs(t).map(({ lines, ...x }) => x);
    const l = R.lsSheetAttrs ? R.lsSheetAttrs(t).map(({ lines, ...x }) => x) : [];
    if (r.length || a.length || l.length) res[`${id}/${f}`] = { r, a, l };
  }
}
fs.writeFileSync(out, JSON.stringify(res));
console.log(`${Object.keys(res).length} tệp có kết quả`);
