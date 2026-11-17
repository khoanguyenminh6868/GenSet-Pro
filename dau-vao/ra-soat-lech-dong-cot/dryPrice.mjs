import fs from "node:fs";
import "C:/Projects/GenSet Pro/wt-lech-cot-10/suppliers/config-bot.mjs";
const BP = globalThis.GenbidBidprice;
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
let docs = 0, lots = 0, bidders = 0, lines = 0, bchg = [], gchg = [];
for (const [k, v] of Object.entries(J)) {
  const d = v.d ?? v; docs++;
  for (const l of d.lots || []) {
    lots++;
    for (const b of l.bidders || []) { bidders++; const old = b.finalPrice ?? b.bidPrice; if (BP.bdPrice(b) !== old || BP.afterDiscount(b) !== (b.finalPrice ?? null)) bchg.push([k, l.lotNo, b.name, b.won, b.bidPrice, b.finalPrice, b.winPrice, "→ bdPrice", BP.bdPrice(b)]); }
    const g2 = BP.lotGoods(l);
    (l.goods || []).forEach((g, i) => { lines++; if (g2[i].unitPrice !== g.unitPrice) gchg.push([k, l.lotNo, g.name.slice(0, 50), g.qty, g.unitPrice, "→", g2[i].unitPrice]); });
  }
}
console.log({ docs, lots, bidders, lines, bidderChanges: bchg.length, lineChanges: gchg.length });
for (const r of bchg) console.log("B", r.join("\t"));
for (const r of gchg) console.log("G", r.join("\t"));
