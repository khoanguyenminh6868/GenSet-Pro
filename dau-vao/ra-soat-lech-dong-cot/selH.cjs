// node selH.cjs [tệp ra]: các gói bidhist cần đọc lại dòng thô (đơn giá nghi là thành tiền, dòng hàng lặp, cắt 100 dòng,
// nhà thầu lặp, giá sau giảm lệch lô). In lý do từng gói, ghi [{id, url, why}] ra tệp.
const fs = require("fs");
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const res = new Map(); const add = (id, d, why) => { if (!res.has(id)) res.set(id, { id, url: d.url, why: [] }); if (!res.get(id).why.includes(why)) res.get(id).why.push(why); };
const cnt = {};
for (const [id, { d }] of Object.entries(J)) for (const l of d.lots || []) {
  const goods = l.goods || [], bidders = l.bidders || [], won = bidders.filter((b) => b.won), w = won[0];
  const ref = w && (w.winPrice || w.finalPrice);
  const keys = goods.map((g) => JSON.stringify(g)), dup = keys.length - new Set(keys).size;
  if (dup) add(id, d, "dup");
  if (goods.length === 100) add(id, d, "cut100");
  const bk = bidders.map((b) => JSON.stringify(b));
  if (bk.length !== new Set(bk).size || new Set(bidders.map((b) => b.taxCode + "|" + b.venture)).size !== bidders.length) add(id, d, "bidderDup");
  for (const b of bidders) if (b.bidPrice > 0 && b.finalPrice > b.bidPrice * 1.001) add(id, d, "finalGtBid");
  if (ref && goods.length && goods.every((g) => g.qty > 0 && g.unitPrice > 0)) {
    const sum = goods.reduce((a, g) => a + g.qty * g.unitPrice, 0), r = sum / ref;
    const flat = goods.reduce((a, g) => a + g.unitPrice, 0) / ref;
    if (r > 1.5) add(id, d, "sum>1.5" + (Math.abs(flat - 1) <= 0.005 ? " (Σ đơn giá = giá trúng)" : ""));
  }
  // từng dòng: SL × đơn giá vượt giá trúng của lô
  if (ref) for (const g of goods) if (g.qty > 1 && g.unitPrice > 0 && g.qty * g.unitPrice > ref * 1.005) { add(id, d, "row>win"); break; }
}
for (const x of res.values()) for (const w of x.why) cnt[w.split(" ")[0]] = (cnt[w.split(" ")[0]] || 0) + 1;
console.log(res.size, "gói", JSON.stringify(cnt));
for (const x of res.values()) console.log(x.id, x.why.join(", "), x.url ? "" : "KHÔNG URL");
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify([...res.values()], null, 1));
