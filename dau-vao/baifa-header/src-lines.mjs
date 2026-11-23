// Dòng bảng ("| …") của tệp nguồn sources/<id>/<n>.md mà KHÔNG nằm trong bảng nào của hồ sơ (cùng n), theo khối liền nhau.
//   node src-lines.mjs <gốc repo> <id>
import fs from "node:fs";
import path from "node:path";
const [root, id] = process.argv.slice(2);
const s = JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${id}.json`), "utf8"));
const ns = [...new Set(s.specTables.map((t) => t.n))];
for (const n of ns) {
  const text = fs.readFileSync(path.join(root, "suppliers", "sources", id, `${n}.md`), "utf8").split(/\r?\n/);
  const have = new Set(s.specTables.filter((t) => t.n === n).flatMap((t) => [...t.header, ...t.rows]));
  const pipe = text.map((l, i) => [i + 1, l]).filter(([, l]) => l.startsWith("|"));
  const miss = pipe.filter(([, l]) => !have.has(l));
  console.log(`\nn${n}: dòng "|" trong nguồn ${pipe.length}, trong bảng (khác nhau) ${have.size}, không vào bảng nào ${miss.length}`);
  for (const [i, l] of miss) console.log(`   L${i} ${l}`);
}
