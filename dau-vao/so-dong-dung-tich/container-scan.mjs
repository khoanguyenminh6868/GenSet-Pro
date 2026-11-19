// node container-scan.mjs <worktree>: mọi ô kích thước (ba số) trong specTables của suppliers/cn có chiều dài 5900–6200 hoặc
// 11900–12300 mm (cỡ container 20 / 40 ft) hoặc rộng 2400–2460 mm, đếm số NCC, để chọn danh sách container chuẩn cho C5.
import fs from "node:fs";
import path from "node:path";
const [WT] = process.argv.slice(2);
const dir = path.join(WT, "suppliers", "cn");
const by = new Map();
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const t of s.specTables || []) for (const line of t.rows || []) for (const c of String(line).split("|")) {
    const k = c.toLowerCase().replace(/\s+/g, "").replace(/[×x]/g, "*").replace(/mm$/, "");
    const m = k.match(/^(\d{3,5}(?:\.\d+)?)\*(\d{3,5}(?:\.\d+)?)\*(\d{3,5}(?:\.\d+)?)$/);
    if (!m) continue;
    const [L, W] = [Number(m[1]), Number(m[2])];
    if (!((L >= 5900 && L <= 6200) || (L >= 11900 && L <= 12300) || (W >= 2400 && W <= 2460))) continue;
    const e = by.get(k) || { sids: new Set(), n: 0 };
    e.sids.add(s.id); e.n++; by.set(k, e);
  }
}
for (const [k, e] of [...by].sort((a, b) => b[1].sids.size - a[1].sids.size || a[0].localeCompare(b[0]))) console.log(`${k}\t${e.sids.size} NCC\t${e.n} ô\t${[...e.sids].sort().join(",")}`);
