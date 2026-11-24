// node xem.mjs out.json  → in dòng gọn theo nguồn, để soát
import fs from "node:fs";
const { rows } = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const g = new Map();
for (const r of rows) { const k = `${r.nguon}|${r.line}`; const e = g.get(k) || { ...r, models: [], moi: new Set() }; e.models.push(r.model); e.moi.add(r.moi); g.set(k, e); }
console.log("dòng khác nhau:", g.size);
for (const e of [...g.values()].sort((a, b) => a.nguon.localeCompare(b.nguon, "en", { numeric: true }))) {
  console.log(`${e.nguon} [${[...e.moi].join("")}] gắn:${e.models.join(",")} | nêu:${e.nameds} | ${e.line.slice(0, 170)}`);
}
