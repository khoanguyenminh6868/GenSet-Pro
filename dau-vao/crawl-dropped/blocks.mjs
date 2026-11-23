// Gom dòng đã phân loại theo KHỐI (NCC + n + dòng mở khối): in loại, số dòng máy, 2 dòng đầu khối và 1 dòng máy mẫu.
//   node blocks.mjs <gốc repo> <classify.json> [loại] [id]
import fs from "node:fs";
import path from "node:path";
const [root, file, cat, id] = process.argv.slice(2);
const all = JSON.parse(fs.readFileSync(file, "utf8")).filter((x) => (!cat || x.cat === cat) && (!id || x.sid === id));
const g = new Map();
for (const x of all) { const k = `${x.sid}|${x.n}|${x.blockStart}`; if (!g.has(k)) g.set(k, []); g.get(k).push(x); }
console.log(`khối: ${g.size}, dòng: ${all.length}`);
let lastSid = "";
for (const [k, l] of g) {
  const [sid, n, start] = k.split("|");
  const lines = fs.readFileSync(path.join(root, "suppliers", "sources", sid, `${n}.md`), "utf8").split(/\r?\n/);
  if (sid !== lastSid) { console.log(`\n##### ${sid} (${all.filter((x) => x.sid === sid).length} dòng) — ${lines[0]}`); lastSid = sid; }
  console.log(`[${l[0].cat}] n${n} L${start} khối ${l[0].blockLen} dòng, ${l.length} dòng máy ngoài bảng | tên trang: ${l[0].title.slice(0, 70)}`);
  for (const h of lines.slice(+start - 1, +start + 1)) console.log(`     H: ${h.slice(0, 210)}`);
  console.log(`     M: ${l[0].text.slice(0, 210)}`);
}
