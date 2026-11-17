// node applyKva.mjs <kvaFix.json> [--write]: ghi config.kvas đã sửa (kvaTol.cjs, đã soát tay từng gói) vào bidhist trên web.
// Đọc bản MỚI NHẤT của từng gói (allDocs), chỉ đổi config.kvas, mọi trường khác giữ nguyên. Không --write: chỉ in.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/config-bot.mjs").href);
const fix = JSON.parse(fs.readFileSync(process.argv[2], "utf8")), write = process.argv.includes("--write");
const docs = new Map((await B.allDocs("bidhist")).map((x) => [x.id, x.data]));
const fmt = (k) => (k || []).map((x) => x.v + " " + x.u).join(", ") || "∅";
const rows = [];
for (const { id, kvas, was } of fix) {
  const d = docs.get(id);
  if (!d?.config) { console.log(id, "KHÔNG CÓ config, bỏ qua"); continue; }
  if (was && fmt(d.config.kvas) !== fmt(was)) { console.log(id, "config.kvas đã đổi từ lúc soát:", fmt(d.config.kvas), "≠", fmt(was), "→ bỏ qua"); continue; }
  if (fmt(d.config.kvas) === fmt(kvas)) { console.log(id, "đã đúng"); continue; }
  console.log(id, fmt(d.config.kvas), "→", fmt(kvas));
  rows.push({ coll: "bidhist", id, data: { ...d, config: { ...d.config, kvas } } });
}
console.log(`${rows.length} gói sẽ ghi${write ? "" : " (chưa ghi, thêm --write)"}`);
if (write) for (let i = 0; i < rows.length; i += 20) { await B.post(rows.slice(i, i + 20)); console.log("đã ghi", Math.min(i + 20, rows.length)); }
