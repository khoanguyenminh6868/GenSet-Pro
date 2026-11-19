// Kiểm đơn vị + độ hợp lý của MỌI giá trị mới (khối lượng, tiêu hao, dòng điện, xi lanh) so với công suất của CHÍNH dòng.
// Công suất: lấy từ bản ghi; bản ghi không có công suất thì lấy số trong chữ dòng (ô "a/b" đầu tiên hoặc tên "XXGF") — CHỈ để kiểm,
// không ghi vào catalog. Nhãn (đơn vị) lấy từ bản ghi nhánh.
// node 5-hop-ly.mjs <soat.tsv> > hop-ly.tsv
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const load = (root) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(root, "web", "catalog.js"), "utf8"), box); return box.GenbidCatalog; };
const CH = load("../../../../wt-catalog-a"), dir = "../../../../wt-catalog-a/suppliers/cn";
const rows = fs.readFileSync(process.argv[2], "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const want = new Map(); // khoá bản ghi → các khoá thông số mới
for (const r of rows) if (r[0] !== "MẤT") {
  const keys = r[0] === "MỚI" ? (r[11] ? r[11].split("; ").map((x) => x.split("=")[0]) : []) : (r[14] || "").split("; ").filter((x) => / → /.test(x) && !/^(makes|power|genset|other|line)\b/.test(x)).map((x) => x.split(":")[0]);
  if (keys.length) want.set(`${r[1]}|${r[2]}|${r[3]}|${r[4]}|${r[5]}|${r[6]}`, { t: r[0], keys });
}
const sups = new Set([...want.keys()].map((k) => k.split("|")[0]));
const out = ["loai\tncc\tn\tbang\tdong\tmodel\tkhoa\tgia-tri\tnhan\tkW-dong\tnguon-kW\tti-so\tket-luan\tdong-nguon"];
const tally = {};
const kwOf = (o) => {
  const p = o.power || {};
  for (const k of ["prime", "standby", "rated"]) { if (p[k]?.kW) return [p[k].kW, "bản ghi " + k]; if (p[k]?.kVA) return [p[k].kVA * 0.8, "bản ghi " + k + " kVA×0,8"]; }
  const cells = CH.cellsOf(o.line || "");
  for (const c of cells) { const m = c.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/); if (m) return [Math.min(+m[1], +m[2]), "ô a/b của dòng (số nhỏ)"]; }
  const g = String(o.genset || "").match(/(\d+(?:\.\d+)?)\s*GF/i); if (g) return [+g[1], "tên XXGF"];
  return [null, ""];
};
const num = (v) => { const m = String(v).replace(/,/g, "").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); if (!sups.has(s.id)) continue;
  for (const o of CH.fromSupplier(s)) {
    const w = want.get(`${s.id}|${o.n}|${o.table}|${o.row}|${o.kind}|${o.model}`); if (!w) continue;
    const [kw, src] = kwOf(o);
    for (const sp of o.specs || []) {
      if (!w.keys.includes(sp.key)) continue;
      const v = num(sp.value), lab = String(sp.label || "");
      let ratio = "", ok = "không xét";
      if (sp.key === "weight" && v && kw) { const r = v / kw; ratio = r.toFixed(1) + " kg/kW"; ok = /kg|重量|weight/i.test(lab) && r >= 5 && r <= 80 ? "ok" : "NGHI"; }
      else if (sp.key === "fuel" && v) {
        if (/g\s*\/?\s*k?w/i.test(lab + sp.value) || /耗油率|燃油消耗率/.test(lab)) { ratio = v + " g/kWh"; ok = v >= 150 && v <= 300 ? "ok" : "NGHI"; }
        else if (/l\s*\/\s*h|L\/H|升/i.test(lab + sp.value) && kw) { const r = v / kw; ratio = r.toFixed(3) + " L/h/kW"; ok = r >= 0.15 && r <= 0.35 ? "ok" : "NGHI"; }
        else ok = "đơn vị không rõ";
      } else if (sp.key === "current" && v && kw) { const r = v / kw; ratio = r.toFixed(2) + " A/kW"; ok = r >= 1.6 && r <= 2.0 ? "ok" : "NGHI"; }
      else if (sp.key === "cyl" && v) ok = [1, 2, 3, 4, 6, 8, 10, 12, 16, 18, 20].includes(v) ? "ok" : "NGHI";
      else if (!kw) ok = "không có công suất để so";
      const k = `${s.id} ${sp.key} ${ok}`; tally[k] = (tally[k] || 0) + 1;
      out.push([w.t, s.id, o.n, o.table, o.row, o.model, sp.key, sp.value, lab, kw ?? "", src, ratio, ok, String(o.line).replace(/\t/g, " ")].join("\t"));
    }
  }
}
fs.writeFileSync(process.argv[3] || "hop-ly.tsv", out.join("\n") + "\n");
for (const [k, v] of Object.entries(tally).sort()) console.log(v + "\t" + k);
