// In thuộc tính lsSheetAttrs của một tờ Leroy-Somer. node attrs.mjs <gốc repo> <n>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, n] = process.argv.slice(2);
const R = await import(pathToFileURL(path.resolve(root, "suppliers", "ratings.mjs")).href);
const text = fs.readFileSync(path.resolve(root, "suppliers", "sources", "leroy-somer-fuzhou", `${n}.md`), "utf8");
for (const a of R.lsSheetAttrs(text)) console.log(a.key, JSON.stringify(a.value), "|", (a.lines || [])[0]);
