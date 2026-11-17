// Soát lịch sử thầu (bidhist): hàng hoá, nhà thầu, giá, ngày, công suất.
const fs = require("fs"), path = require("path");
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const out = {}; const add = (code, id, detail) => (out[code] = out[code] || []).push({ id, detail });
const vnd = (n) => (n == null ? "null" : Math.round(n).toLocaleString("en-US"));
let nDoc = 0, nLot = 0, nGoods = 0, nBid = 0, lotsGoods = 0, lotsBid = 0;
const stat = { sumOk: 0, sumChecked: 0 };
for (const [id, { d }] of Object.entries(J)) {
  nDoc++;
  const lots = d.lots || [];
  // ngày
  const t = (x) => (x ? Date.parse(x) : null), ds = [["publicDate", t(d.publicDate)], ["bidCloseDate", t(d.bidCloseDate)], ["resultAt", t(d.resultAt)]].filter((x) => x[1]);
  for (let i = 1; i < ds.length; i++) if (ds[i][1] < ds[i - 1][1] - 864e5) add("H10 ngày ngược thứ tự", id, `${ds[i - 1][0]} ${new Date(ds[i - 1][1]).toISOString().slice(0, 10)} > ${ds[i][0]} ${new Date(ds[i][1]).toISOString().slice(0, 10)}`);
  if (d.winningPrice && d.packagePrice && d.winningPrice > d.packagePrice * 1.001) add("H7a giá trúng > giá gói", id, `${vnd(d.winningPrice)} > ${vnd(d.packagePrice)}`);
  if (d.winningPrice && d.packagePrice && d.winningPrice < d.packagePrice * 0.4) add("H7b giá trúng < 40% giá gói", id, `${vnd(d.winningPrice)} / ${vnd(d.packagePrice)}`);
  let sumWin = 0, allWin = true;
  for (const l of lots) {
    nLot++;
    const goods = l.goods || [], bidders = l.bidders || [];
    if (goods.length) lotsGoods++; if (bidders.length) lotsBid++;
    const won = bidders.filter((b) => b.won);
    if (bidders.length && !d.cancelled && l.status === 1 && won.length !== 1 && !won.every((b) => b.venture)) add("H7c lô có kết quả mà số nhà thầu trúng ≠ 1", id, `${l.lotNo}: ${won.length} trúng / ${bidders.length} nhà thầu`);
    const w = won[0];
    if (w?.winPrice) sumWin += w.winPrice; else allWin = false;
    if (w && d.winnerTax?.length && lots.length === 1 && !d.winnerTax.includes(w.taxCode) && !won.some((b) => d.winnerTax.includes(b.taxCode))) add("H7d MST trúng thầu của gói ≠ MST nhà thầu trúng trong lô", id, `${d.winnerTax} ↔ ${w.taxCode}`);
    for (const b of bidders) {
      nBid++;
      if (!(b.bidPrice > 0)) { add("H6a nhà thầu không có giá dự thầu", id, `${b.name} (${b.taxCode})`); continue; }
      if (b.finalPrice && b.finalPrice > b.bidPrice * 1.001) add("H6b giá sau giảm > giá dự thầu", id, `${b.name}: ${vnd(b.finalPrice)} > ${vnd(b.bidPrice)}`);
      const ref = l.price || (lots.length === 1 ? d.packagePrice : null);
      if (ref) { const r = b.bidPrice / ref; if (r < 0.25 || r > 2) add("H6c giá dự thầu / giá lô ngoài 0,25–2 (nghi lệch chữ số hoặc lệch lô)", id, `${b.name}: ${vnd(b.bidPrice)} / ${vnd(ref)} = ${r.toFixed(2)}`); }
      if (b.won && b.winPrice && b.finalPrice && Math.abs(b.winPrice - b.finalPrice) > 1 && Math.abs(b.winPrice / b.finalPrice - 1) > 0.2) add("H6d giá trúng lệch > 20% so với giá sau giảm của chính nhà thầu", id, `${b.name}: trúng ${vnd(b.winPrice)}, sau giảm ${vnd(b.finalPrice)}`);
      if (b.taxCode && !/^(vn)?\d{10}(-?\d{3})?$/i.test(String(b.taxCode).trim())) add("H6e MST nhà thầu sai dạng", id, `${b.name}: "${b.taxCode}"`);
    }
    // thứ hạng ↔ giá
    const ranked = bidders.filter((b) => b.rank != null && b.finalPrice > 0).sort((a, b) => a.rank - b.rank);
    for (let i = 1; i < ranked.length; i++) if (ranked[i].finalPrice < ranked[i - 1].finalPrice * 0.999 && ranked[i].rank !== ranked[i - 1].rank) { add("H8 thứ hạng ngược với giá", id, `hạng ${ranked[i - 1].rank} ${vnd(ranked[i - 1].finalPrice)} > hạng ${ranked[i].rank} ${vnd(ranked[i].finalPrice)}`); break; }
    if (lots.length === 1 && d.numBidderJoin != null && bidders.length && d.numBidderJoin !== bidders.length) add("H9 số nhà thầu tham dự ≠ số dòng nhà thầu", id, `${d.numBidderJoin} ↔ ${bidders.length}`);
    // hàng hoá
    let sum = 0, okSum = goods.length > 0;
    for (const g of goods) {
      nGoods++;
      const nm = String(g.name || "").slice(0, 60);
      if (!(g.qty > 0)) { add("H1a hàng hoá không có số lượng", id, nm); okSum = false; }
      else if (g.qty > 100000) add("H1b số lượng > 100.000", id, `${nm}: ${g.qty} ${g.unit}`);
      else if (!Number.isInteger(g.qty) && /máy|tổ|bộ|cái|chiếc|tủ|hệ thống|ht|gói/i.test(g.unit || "")) add("H1c số lượng lẻ với đơn vị đếm", id, `${nm}: ${g.qty} ${g.unit}`);
      if (!(g.unitPrice > 0)) { add("H2a hàng hoá không có đơn giá", id, nm); okSum = false; }
      else if (g.unitPrice < 1000) add("H2b đơn giá < 1.000 đ", id, `${nm}: ${g.unitPrice}`);
      if (g.qty > 0 && g.unitPrice > 0) { sum += g.qty * g.unitPrice; if (g.qty === g.unitPrice || (g.qty > g.unitPrice && g.qty > 1000)) add("H5 nghi đảo số lượng ↔ đơn giá", id, `${nm}: SL ${g.qty}, đơn giá ${g.unitPrice}`); }
      if (g.year && !/(19|20)\d\d/.test(g.year)) add("H4a năm sản xuất không có năm", id, `${nm}: "${String(g.year).slice(0, 50)}"`);
      if (g.unit && (/\d{3,}/.test(g.unit) || g.unit.length > 25)) add("H4b đơn vị tính lạ (có số / quá dài)", id, `${nm}: "${String(g.unit).slice(0, 50)}"`);
      if (g.origin && /^\d+$|\d{5,}/.test(g.origin)) add("H4c xuất xứ là số", id, `${nm}: "${String(g.origin).slice(0, 50)}"`);
      if (g.maker && /^\d[\d.,\s]*$/.test(g.maker)) add("H4d hãng là số", id, `${nm}: "${g.maker}"`);
      if (g.year && /(19|20)\d\d/.test(String(g.origin || "")) && !/(19|20)\d\d/.test(String(g.year))) add("H4e nghi đảo năm ↔ xuất xứ", id, `${nm}: năm "${g.year}", xuất xứ "${g.origin}"`);
    }
    if (okSum && w && (w.winPrice || w.finalPrice)) {
      stat.sumChecked++;
      const ref = w.winPrice || w.finalPrice, r = sum / ref;
      if (Math.abs(r - 1) <= 0.005) stat.sumOk++;
      else if (r > 0.86 && r < 0.94 || Math.abs(r - 1 / 1.08) < 0.006 || Math.abs(r - 1 / 1.1) < 0.006) add("H3a Σ SL×đơn giá thấp hơn giá trúng ~8–10% (đơn giá chưa VAT?)", id, `${vnd(sum)} / ${vnd(ref)} = ${r.toFixed(3)}`);
      else if (r < 0.5 || r > 1.5) add("H3c Σ SL×đơn giá lệch XA giá trúng (<0,5 hoặc >1,5)", id, `${goods.length} dòng: ${vnd(sum)} / ${vnd(ref)} = ${r.toFixed(3)}`);
      else add("H3b Σ SL×đơn giá lệch giá trúng 0,5–50%", id, `${goods.length} dòng: ${vnd(sum)} / ${vnd(ref)} = ${r.toFixed(3)}`);
    }
  }
  if (allWin && lots.length && d.winningPrice && Math.abs(sumWin / d.winningPrice - 1) > 0.005) add("H7e Σ giá trúng các lô ≠ giá trúng của gói", id, `${vnd(sumWin)} ↔ ${vnd(d.winningPrice)} (${lots.length} lô)`);
  // công suất đọc ra ↔ tên gói
  const kv = (d.config?.kvas || []).map((x) => x.v), nameK = [...String(d.bidName || "").replace(/(\d)[.,](\d{3})(?!\d)/g, "$1$2").matchAll(/(\d+(?:[.,]\d+)?)\s*kva/gi)].map((m) => +m[1].replace(",", "."));
  if (kv.length && nameK.length && !nameK.some((n) => kv.some((v) => Math.abs(v - n) < 0.01 * n + 0.01))) add("H11 công suất đọc từ Chương V không có số nào trùng tên gói", id, `tên: ${nameK.join(", ")} kVA ↔ đọc: ${(d.config.kvas || []).map((x) => x.v + " " + x.u).join(", ")} | ${String(d.bidName).slice(0, 80)}`);
  for (const x of d.config?.kvas || []) if (!(x.v > 0) || x.v > 5000 || (x.u === "kVA" && x.v < 1)) add("H12 công suất đọc ra ngoài dải", id, `${x.v} ${x.u}`);
}
console.log(`gói ${nDoc} | lô ${nLot} (có hàng hoá ${lotsGoods}, có nhà thầu ${lotsBid}) | dòng hàng hoá ${nGoods} | dòng nhà thầu ${nBid}`);
console.log(`Σ SL×đơn giá so giá trúng: kiểm ${stat.sumChecked} lô, khớp ±0,5%: ${stat.sumOk}`);
for (const [code, list] of Object.entries(out).sort()) {
  console.log(`\n### ${code}: ${list.length} (${new Set(list.map((x) => x.id)).size} gói)`);
  for (const f of list.filter((_, i) => i % Math.max(1, Math.floor(list.length / 5)) === 0).slice(0, 5)) console.log(`  ${f.id}: ${String(f.detail).slice(0, 230)}`);
}
fs.writeFileSync(path.join(__dirname, "audH.json"), JSON.stringify(out));
