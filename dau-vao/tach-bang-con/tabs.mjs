// In gọn các bảng tablesOf của một trang: số dòng, tiêu đề (cắt ngắn), dòng đầu / cuối.
//   node tabs.mjs <gốc repo> <id> <n>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, id, n] = process.argv.slice(2);
const N = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const text = fs.readFileSync(path.join(root, "suppliers", "sources", id, `${n}.md`), "utf8");
N.tablesOf(text).forEach((t, i) => {
  console.log(`#${i} ${t.rows.length} dòng; tiêu đề ${t.header.length}`);
  for (const h of t.header) console.log(`   H ${h.slice(0, 60)}`);
  console.log(`   R ${t.rows[0].slice(0, 50)}`);
  console.log(`   R ${t.rows[t.rows.length - 1].slice(0, 50)}`);
});
