// In ngữ cảnh tệp nguồn quanh một dòng: node ctx.mjs <gốc repo> <id> <n> <dòng> [trước=10] [sau=3]
import fs from "node:fs";
import path from "node:path";
const [root, ...rest] = process.argv.slice(2);
for (let a = 0; a + 2 < rest.length + 1 && rest[a]; a += 5) {
  const [id, n, at, before = 10, after = 3] = rest.slice(a, a + 5);
  const lines = fs.readFileSync(path.join(root, "suppliers", "sources", id, `${n}.md`), "utf8").split(/\r?\n/);
  console.log(`\n=== ${id} n${n} quanh L${at}`);
  for (let i = Math.max(0, +at - 1 - +before); i < Math.min(lines.length, +at - 1 + +after); i++) console.log(`${String(i + 1).padStart(4)}${i + 1 === +at ? ">" : " "} ${lines[i].slice(0, 230)}`);
}
