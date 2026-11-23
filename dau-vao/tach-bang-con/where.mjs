// Một mã xuất hiện ở đâu trong tệp nguồn, tiêu đề gần nhất phía trên trên trang, và bảng nào của tablesOf (mới) chứa nó.
//   node where.mjs <gốc repo> <id> <chuỗi>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, id, needle] = process.argv.slice(2);
const N = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const dir = path.join(root, "suppliers", "sources", id);
const cut = (s, k = 118) => s.slice(0, k);
for (const f of fs.readdirSync(dir).sort((a, b) => parseInt(a) - parseInt(b))) {
  const m = /^(\d+)\.md$/.exec(f);
  if (!m || +m[1] < 101 || +m[1] > 999) continue;
  const text = fs.readFileSync(path.join(dir, f), "utf8"), lines = text.split(/\r?\n/);
  lines.forEach((l, i) => {
    if (!l.startsWith("|") || !l.includes(needle)) return;
    console.log(`n${m[1]} L${i + 1}: ${cut(l, 90)}`);
    let h = i - 1, shown = 0; const up = [];
    while (h >= 0 && shown < 4 && lines[h].startsWith("|")) { if (!N.isMachineRow(lines[h]) && !/^\|[\s|]*\d/.test(lines[h])) { up.unshift(`   nguồn L${h + 1}: ${cut(lines[h])}`); shown++; } else if (shown) break; h--; }
    console.log(up.join("\n"));
    const ts = N.tablesOf(text).filter((t) => t.rows.includes(l));
    for (const t of ts) console.log(`   bảng: ${t.rows.length} dòng; tiêu đề: ${t.header.map((x) => cut(x, 95)).join(" // ")}`);
    if (!ts.length) console.log("   bảng: KHÔNG");
  });
}
