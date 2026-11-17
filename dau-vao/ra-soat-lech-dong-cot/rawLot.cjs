// node rawLot.cjs <thư mục rawH>: lotNo / contractorCode trên mục của goodsList so với phần lô đang mang nó.
const fs = require("fs"), path = require("path");
const dir = process.argv[2];
const parse = (v) => { try { return typeof v === "string" ? JSON.parse(v || "[]") : v || []; } catch { return null; } };
const c = {};
const add = (k, id) => { c[k] = c[k] || new Set(); c[k].add(id); };
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const id = f.replace(".json", ""), kq = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), lots = kq.lotResultDTO || [];
  for (const lot of lots) {
    const g = parse(lot.goodsList); if (!Array.isArray(g)) { add(g && typeof g === "object" ? "object" : "null", id); continue; }
    if (!g.length) { add(lots.length > 1 ? "phần lô trống (gói nhiều phần)" : "trống (gói một phần)", id); continue; }
    const win = (lot.contractorList || []).filter((x) => x.bidResult === 1).map((x) => x.orgCode);
    for (const x of g) {
      const kind = x.formValue ? "formValue" : "dòng";
      add(`${kind}: lotNo ${x.lotNo == null ? "không có" : x.lotNo === lot.lotNo ? "= phần" : "KHÁC phần"}`, id);
      add(`${kind}: contractorCode ${x.contractorCode == null ? "không có" : win.includes(x.contractorCode) ? "= trúng" : "không trúng ở phần này"}`, id);
    }
  }
}
for (const [k, v] of Object.entries(c).sort()) console.log(`${k}: ${v.size} gói ${[...v].slice(0, 8).join(" ")}`);
