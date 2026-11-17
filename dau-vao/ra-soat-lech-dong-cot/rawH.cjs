// node rawH.cjs <thư mục rawH> [id...]: cấu trúc bảng hàng hoá THÔ của từng gói (dumpH.cjs): mấy bảng, của nhà thầu nào,
// bao nhiêu dòng, các trường giá của dòng (priceUnit, bidPrice, unitPrice, amount, intoMoney, …) so với giá trúng.
const fs = require("fs"), path = require("path");
const [dir, ...ids] = process.argv.slice(2);
const parse = (v) => { try { return typeof v === "string" ? JSON.parse(v || "[]") : v || []; } catch { return null; } };
const PRICE = ["priceUnit", "bidPrice", "unitPrice", "amount", "intoMoney", "bidAmount", "amountTotal", "amountBeforeTax", "priceIncludeTax", "priceExcludeTax", "exwUnitPrice", "exwPrice", "cost", "lotPrice", "lotWiningPrice"];
const n = (v) => (v == null || v === "" || isNaN(Number(v)) ? null : Number(v));
const vnd = (x) => (x == null ? "·" : Math.round(x).toLocaleString("en-US"));
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const id = f.replace(".json", ""); if (ids.length && !ids.includes(id)) continue;
  const kq = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  console.log(`\n=== ${id} | ${(kq.lotResultDTO || []).length} lô | mở thầu ${(kq.lotOpenDetails || []).length} dòng`);
  for (const lot of kq.lotResultDTO || []) {
    const cl = lot.contractorList || [], win = cl.filter((c) => c.bidResult === 1);
    console.log(`  lô ${lot.lotNo || "-"} giá ${vnd(n(lot.lotPrice))} | nhà thầu ${cl.length}: ${cl.map((c) => `${c.orgCode}${c.bidResult === 1 ? "*" : ""}${c.ventureName ? "(LD)" : ""} mở ${vnd(n(c.lotOpenPrice))} cuối ${vnd(n(c.lotFinalPrice))} trúng ${vnd(n(c.bidWiningPrice))}`).join("; ").slice(0, 600)}`);
    const g = parse(lot.goodsList);
    if (g == null) { console.log("    goodsList không đọc được"); continue; }
    const show = (rows, tag) => {
      const keys = rows.map((r) => JSON.stringify(r)), dup = keys.length - new Set(keys).size;
      const ks = new Set(); for (const r of rows) for (const k of PRICE) if (n(r[k])) ks.add(k);
      const q = (r) => n(r.quantity) || n(r.qty);
      const sums = [...ks].map((k) => `Σ${k}=${vnd(rows.reduce((a, r) => a + (n(r[k]) || 0), 0))} ΣSL×${k}=${vnd(rows.reduce((a, r) => a + (n(r[k]) || 0) * (q(r) || 0), 0))}`);
      console.log(`    ${tag}: ${rows.length} dòng, lặp y hệt ${dup} | ${sums.join(" | ")}`);
      for (const r of rows.filter((r) => q(r) > 1).slice(0, 3).concat(rows.slice(0, 1))) console.log(`       SL ${q(r)} ${[...ks].map((k) => `${k}=${vnd(n(r[k]))}`).join(" ")} | ${String(r.name || r.nameGood || r.goodName || "").slice(0, 50)}`);
    };
    if (Array.isArray(g)) {
      const fv = g.filter((x) => x && x.formValue), flat = g.filter((x) => x && !x.formValue);
      if (flat.length) show(flat, "mảng dòng");
      for (const x of fv) show(x.formValue?.lotContent?.Table || [], `formValue ${x.contractorCode}${win.some((w) => w.orgCode === x.contractorCode) ? "*" : ""}`);
    } else {
      console.log("    object khoá:", Object.keys(g).map((k) => `${k}(${Array.isArray(g[k]) ? g[k].length : typeof g[k]})`).join(", "));
      for (const w of g.dsHhKq || []) show(w.dsHH || [], `dsHhKq lô ${w.lotNo} ${w.contractorCode}${win.some((c) => c.orgCode === w.contractorCode) ? "*" : ""}`);
    }
  }
}
