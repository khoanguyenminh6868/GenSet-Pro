// Liệt kê MỌI bản ghi mà nhãn tiêu hao đổi ĐƠN VỊ (g/kWh ↔ L/h), kèm công suất và L/h ước theo kW để người duyệt xem.
// Không sửa gì. Mức 0,2–0,35 L/kWh chỉ để đánh dấu "đáng ngờ", không dùng để đọc dữ liệu.
//   node fuel-unit.mjs <gốc catalog> <gốc trước> <gốc sau> <id,id,...> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, before, after, idArg, outFile] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const recs = (r, id) => C.fromSupplier(JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8")), []);
const key = (r) => [r.kind, r.model, r.genset ?? "", r.line ?? ""].join(" ¦ ");
const unit = (l) => (/g\s*\/\s*kw/i.test(l) ? "g/kWh" : /l\s*\/\s*h/i.test(l) ? "L/h" : "?");
const out = []; let total = 0, odd = 0;
for (const id of idArg.split(",")) {
  const gb = new Map(); for (const r of recs(after, id)) if (!gb.has(key(r))) gb.set(key(r), r);
  const done = new Set();
  for (const x of recs(before, id)) {
    const k = key(x), y = gb.get(k); if (!y || done.has(k)) continue; done.add(k);
    const p = (x.specs || []).find((s) => s.key === "fuel"), q = (y.specs || []).find((s) => s.key === "fuel");
    if (!p || !q || unit(p.label) === unit(q.label)) continue;
    total++;
    const kw = x.power?.prime?.kW ?? x.power?.rated?.kW ?? x.power?.standby?.kW, v = parseFloat(q.value);
    const perKw = kw && v ? v / kw : null, flag = unit(q.label) === "L/h" && perKw != null && (perKw < 0.15 || perKw > 0.4);
    if (flag) odd++;
    out.push(`${flag ? "ĐÁNG NGỜ" : "ok"}\t${id}\t${x.kind}\t${x.model}\t${x.genset ?? ""}\t${unit(p.label)} → ${unit(q.label)}\t${q.value}\tkW ${kw ?? "?"}\tL/kWh ${perKw ? perKw.toFixed(3) : "?"}`);
  }
}
fs.writeFileSync(outFile, out.join("\n") + "\n", "utf8");
console.log(`nhãn tiêu hao đổi đơn vị: ${total}; đáng ngờ: ${odd}`);
