// node rawStat.cjs <thư mục rawH>: thống kê trên MỌI dòng thô của các gói đã dump: mẫu trường giá, quan hệ giữa các trường
// (trường nào là đơn giá, trường nào là thành tiền), bảng lặp, nhà thầu lặp.
const fs = require("fs"), path = require("path");
const dir = process.argv[2];
const parse = (v) => { try { return typeof v === "string" ? JSON.parse(v || "[]") : v || []; } catch { return null; } };
const PRICE = ["priceUnit", "bidPrice", "unitPrice", "amount", "intoMoney", "bidAmount", "amountTotal", "amountBeforeTax", "priceIncludeTax", "priceExcludeTax", "exwUnitPrice", "exwPrice", "cost"];
const n = (v) => (v == null || v === "" || isNaN(Number(v)) ? null : Number(v));
const eq = (a, b) => a != null && b != null && Math.abs(a - b) <= Math.max(1, Math.abs(b) * 1e-6);
const T = new Map(); // mẫu → {rows, ids, rel:{}}
const dupTab = [], dupCl = [], wrapInfo = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const id = f.replace(".json", ""), kq = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const lot of kq.lotResultDTO || []) {
    const cl = lot.contractorList || [], ck = cl.map((c) => JSON.stringify(c));
    if (new Set(cl.map((c) => c.orgCode)).size !== cl.length) dupCl.push(`${id} lô ${lot.lotNo}: ${cl.length} dòng, ${new Set(cl.map((c) => c.orgCode)).size} mã, y hệt cả dòng: ${ck.length - new Set(ck).size} | khác nhau ở: ${[...new Set(cl.flatMap((c, i) => cl.slice(i + 1).filter((d) => d.orgCode === c.orgCode).flatMap((d) => Object.keys({ ...c, ...d }).filter((k) => JSON.stringify(c[k]) !== JSON.stringify(d[k])))))].join(",") || "không"}`);
    const g = parse(lot.goodsList); if (g == null) continue;
    const tabs = [];
    if (Array.isArray(g)) { const flat = g.filter((x) => x && !x.formValue); if (flat.length) tabs.push({ who: "", rows: flat }); for (const x of g.filter((x) => x && x.formValue)) tabs.push({ who: x.contractorCode, rows: x.formValue?.lotContent?.Table || [], keys: Object.keys(x).join(",") , lc: Object.keys(x.formValue?.lotContent || {}).join(","), fv: Object.keys(x.formValue || {}).join(",") }); }
    else for (const w of g.dsHhKq || []) { tabs.push({ who: w.contractorCode + "@" + w.lotNo, rows: w.dsHH || [] }); }
    if (!Array.isArray(g)) wrapInfo.push(`${id} lô ${lot.lotNo}: ${(g.dsHhKq || []).map((w) => `${w.lotNo}/${w.contractorCode}:${(w.dsHH || []).length}`).join(" ")}`);
    const seen = new Map();
    for (const t of tabs) { const k = t.who + "|" + JSON.stringify(t.rows); seen.set(k, (seen.get(k) || 0) + 1); }
    const reps = [...seen].filter(([k, c]) => c > 1 && !k.endsWith("|[]"));
    if (reps.length) dupTab.push(`${id} lô ${lot.lotNo}: ${tabs.length} bảng (${tabs.map((t) => t.who.replace(/^vn/, "") + ":" + t.rows.length).join(" ")}), bảng lặp y hệt: ${reps.map(([k, c]) => `×${c}`).join(" ")} | khoá mục: ${tabs[0].keys || ""} | formValue: ${tabs[0].fv || ""} | lotContent: ${tabs[0].lc || ""}`);
    for (const t of tabs) for (const r of t.rows) {
      const ks = PRICE.filter((k) => n(r[k])); if (!ks.length) continue;
      const sig = ks.join("+"), q = n(r.quantity) || n(r.qty), named = !!(r.name || r.nameGood || r.goodName);
      if (!T.has(sig)) T.set(sig, { rows: 0, ids: new Set(), rel: {}, named: 0, q1: 0 });
      const o = T.get(sig); o.rows++; o.ids.add(id); if (named) o.named++; if (!(q > 1)) { o.q1++; continue; }
      const rel = (name, ok) => { o.rel[name] = o.rel[name] || [0, 0]; o.rel[name][ok ? 0 : 1]++; };
      for (const u of ["priceUnit", "bidPrice", "unitPrice", "priceIncludeTax", "priceExcludeTax", "exwUnitPrice"]) for (const tot of ["amount", "intoMoney", "amountBeforeTax", "bidAmount", "exwPrice"]) if (n(r[u]) && n(r[tot])) { rel(`SL×${u}=${tot}`, eq(q * n(r[u]), n(r[tot]))); rel(`${u}=${tot}`, eq(n(r[u]), n(r[tot]))); }
    }
  }
}
console.log("### Mẫu trường giá của dòng (SL>1 mới xét quan hệ; [đúng, sai])");
for (const [sig, o] of [...T].sort((a, b) => b[1].rows - a[1].rows)) { console.log(`\n${sig}: ${o.rows} dòng (${o.named} có tên, ${o.q1} dòng SL≤1) ở ${o.ids.size} gói: ${[...o.ids].slice(0, 6).join(" ")}`); for (const [k, v] of Object.entries(o.rel)) if (v[0]) console.log(`    ${k}: ${v[0]} đúng, ${v[1]} sai`); }
console.log(`\n### Bảng lặp y hệt trong một lô: ${dupTab.length}`); for (const x of dupTab) console.log("  " + x.slice(0, 400));
console.log(`\n### Nhà thầu lặp mã trong một lô: ${dupCl.length}`); for (const x of dupCl) console.log("  " + x.slice(0, 400));
console.log(`\n### Mẫu nhiều phần lô (dsHhKq): ${wrapInfo.length}`); for (const x of wrapInfo) console.log("  " + x.slice(0, 300));
