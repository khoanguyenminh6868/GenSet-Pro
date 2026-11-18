// node sync-hist.mjs <worktree> <bp-main.js> <bidhist.json>: SYNC_TAG of every past lot (the text Gợi ý giá's
// candidates() gives profileOf: lot / bid name, HSMT config text, won goods), main ↔ the worktree's bidprice.js.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [wt, bpMain, hist] = process.argv.slice(2);
await import(pathToFileURL(path.join(wt, "web", "conversions.js")).href);
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
await import(pathToFileURL(bpMain).href + "?main");
const A = globalThis.GenbidBidprice;
await import(pathToFileURL(path.join(wt, "web", "bidprice.js")).href + "?draft");
const B = globalThis.GenbidBidprice;
if (A.profileOf === B.profileOf) throw new Error("same module");
const docs = JSON.parse(fs.readFileSync(hist, "utf8")).docs;
let lots = 0, withTag = 0;
const diff = [];
for (const [id, x] of Object.entries(docs)) {
  const d = x.d || x, multi = (d.lots || []).length > 1;
  for (const lot of d.lots || [{}]) {
    lots++;
    const goods = (d.lots ? B.lotGoods(lot) : []).filter((g) => g.name || g.code || g.maker || g.label);
    const t = [(multi && lot.lotName) || d.bidName, d.config?.text, ...goods.map((g) => [g.name, g.maker, g.code, g.origin, g.desc].join(" "))].join("\n");
    const a = A.profileOf(t).tags.includes(A.SYNC_TAG), b = B.profileOf(t).tags.includes(B.SYNC_TAG);
    if (a) withTag++;
    if (a !== b) diff.push(`${id}${multi ? ` lô ${lot.lotNo || lot.lotName}` : ""}: main ${a ? "có" : "không"} → nhánh ${b ? "có" : "không"}; câu: ${(A.brandSyncOf(t) || B.brandSyncOf(t))?.text?.slice(0, 220)}`);
  }
}
console.log(`gói lịch sử: ${Object.keys(docs).length}, lô: ${lots}, lô có nhãn "đồng bộ thương hiệu" ở main: ${withTag}, đổi: ${diff.length}`);
console.log(diff.join("\n"));
