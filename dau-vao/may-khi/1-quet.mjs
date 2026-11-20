// Quét MỌI bảng suppliers/cn (origin/main) tìm dấu hiệu máy KHÍ / XĂNG, chỉ đọc. Không phân loại: chỉ liệt kê bảng có dấu hiệu + bản ghi CAT.build sinh ra.
//   node 1-quet.mjs <gốc repo (bản chép origin/main)> <out.json>
// Dấu hiệu (mỗi cái ghi vị trí: title / header / rows / url):
//   gas   : chữ khí (燃气, 沼气, 天然气, natural gas, biogas, LPG, CNG, LNG, "gas generator/engine/set", landfill, methane, khí…)
//   xang  : chữ xăng (gasoline, petrol, 汽油, xăng, gasolina, benzin)
//   fuelv : GIÁ TRỊ đứng sau nhãn nhiên liệu ("Fuel Type | X", "FUEL: X", 燃料 X)
//   m3    : đơn vị tiêu hao khí m3/h, Nm3/h, Nm³/h, 立方/h (tiêu hao khí)
//   ng    : ô model đuôi -NG / -LPG / -BG
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const ROOT = process.argv[2], OUT = process.argv[3];
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog, dir = path.join(ROOT, "suppliers", "cn"), src = path.join(ROOT, "suppliers", "sources");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const GAS = /燃气|沼气|天然气|煤层气|瓦斯|生物质气|液化气|气体发电|气体机|气体燃料|natural\s*gas|\bgas[- ]?(gen|engine|set|fired|powered|genset)|biogas|bio-gas|\bLPG\b|\bCNG\b|\bLNG\b|syngas|landfill|methane|gas natural|gás natural|khí thiên nhiên|khí tự nhiên|khí sinh học|khí hóa lỏng|\bgaz\b/ig;
const XANG = /gasoline|petrol|汽油|xăng|gasolina|benzin/ig;
const FUELV = /(?:fuel\s*type|type\s*of\s*fuel|fuel|燃料种类|燃料类型|燃料|nhiên liệu|combustible)\s*[:|：]\s*\|?\s*([^|\n]{0,40})/ig;
const M3 = /(?:nm3|nm³|m3|m³|立方米?)\s*\/\s*h|(?:nm3|nm³|m3|m³)\s*\/\s*(?:kwh|kw\.h)|gas\s*consumption|gas\s*cons\b|耗气|气耗/ig;
const urlOf = (id, n) => { try { return (fs.readFileSync(path.join(src, id, n + ".md"), "utf8").match(/^URL:\s*(\S+)/m) || [])[1] || ""; } catch { return ""; } };
const full = C.build(sups);
const units = {};
for (const kind of ["engines", "alternators"]) for (const e of full[kind]) for (const u of e.uses || []) {
  const k = `${u.supplierId}|${u.n}|${u.table}`; (units[k] = units[k] || []).push({ kind, ekey: e.key, make: e.make, model: e.model, line: u.line || (u.lines?.rows || []).join(" ") });
}
const snip = (text, re, max = 3) => { const out = []; re.lastIndex = 0; let m; while ((m = re.exec(text)) && out.length < max) out.push(text.slice(Math.max(0, m.index - 25), m.index + m[0].length + 35).replace(/\s+/g, " ")); return out; };
const out = [];
for (const s of sups) {
  const recs = C.fromSupplier(s);
  (s.specTables || []).forEach((t, ti) => {
    const header = t.header || [], rows = t.rows || [];
    const where = { title: String(t.title || ""), header: header.join("\n"), rows: rows.join("\n") };
    const sig = {};
    for (const [name, re] of [["gas", GAS], ["xang", XANG], ["m3", M3]]) {
      for (const [w, tx] of Object.entries(where)) { const h = snip(tx, re); if (h.length) (sig[name] = sig[name] || {})[w] = h; }
    }
    const fv = []; { const tx = `${where.header}\n${where.rows}`; FUELV.lastIndex = 0; let m; while ((m = FUELV.exec(tx)) && fv.length < 6) fv.push(m[1].trim().slice(0, 30)); }
    if (fv.length) sig.fuelv = fv;
    // ô model tổ máy đuôi -NG / *7NG / -LPG / -BG (có số), hoặc ô động cơ Baudouin dạng ...N0/5 (đuôi N0 = khí)
    const ng = rows.filter((l) => { const cs = C.cellsOf(l); return (/(-|[0-9])(NG|LPG|BG)[0-9]?$/i.test((cs[0] || "").trim()) && /\d/.test(cs[0] || "")) || cs.some((c) => /^[0-9A-Z.]+N0\/[56]$/.test(c.trim())); });
    if (ng.length) sig.ng = { n: ng.length, ex: C.cellsOf(ng[0])[0] };
    const url = urlOf(s.id, t.n);
    if (/gas|ranqi|biogas|lpg|natural|petrol|gasoline|methane/i.test(url) && !/gasket|vegas/i.test(url)) sig.url = url;
    if (!Object.keys(sig).length) return;
    const own = recs.filter((o) => o.table === ti && o.n === t.n);
    out.push({
      id: s.id, n: t.n, ti, title: where.title, url, sig, nHeader: header.length, nRows: rows.length, nRecs: own.length,
      header: header.slice(0, 3).map((x) => x.slice(0, 220)), samples: rows.slice(0, 2).map((x) => x.slice(0, 220)), last: rows.slice(-1).map((x) => x.slice(0, 220)),
      units: (units[`${s.id}|${t.n}|${ti}`] || []).map((u) => ({ kind: u.kind, ekey: u.ekey, make: u.make, model: u.model, line: u.line })),
    });
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
const by = {}; for (const o of out) { const b = (by[o.id] = by[o.id] || { bang: 0 }); b.bang++; }
console.log("bảng có dấu hiệu:", out.length, "NCC:", Object.keys(by).length, "tổng bảng cn:", sups.reduce((a, s) => a + (s.specTables || []).length, 0), "tổng bản ghi build:", Object.values(units).reduce((a, x) => a + x.length, 0));
