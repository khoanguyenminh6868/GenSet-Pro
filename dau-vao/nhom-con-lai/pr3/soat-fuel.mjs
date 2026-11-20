// So MỌI bản ghi fromSupplier + gensetsOf của mọi NCC giữa hai catalog.js: nhiên liệu đổi ở đâu, phần khác có y nguyên không.
// node soat-fuel.mjs <catalog cũ.js> <catalog mới.js> <suppliers/cn> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [OLD, NEW, DIR, OUT] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const A = load(OLD), B = load(NEW);
const FK = ["fuel", "fuelFrom", "fuelWhy"];
const strip = (o) => JSON.stringify(o, (k, v) => (FK.includes(k) ? undefined : v));
const lines = ["supplier\tpart\tn\tbảng\tdòng\tmodel\tfuel cũ\tfuel mới\tmức\twhy"];
let total = 0, other = 0, changed = 0;
const by = {};
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json")).sort()) {
  const s0 = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  for (const [part, fn] of [["row", "fromSupplier"], ["genset", "gensetsOf"]]) {
    const a = A[fn](JSON.parse(JSON.stringify(s0))), b = B[fn](JSON.parse(JSON.stringify(s0)));
    total += b.length;
    if (a.length !== b.length) { other++; console.log("SỐ BẢN GHI KHÁC", f, part, a.length, b.length); continue; }
    a.forEach((x, i) => {
      const y = b[i];
      if (strip(x) !== strip(y)) { other++; console.log("KHÁC NGOÀI NHIÊN LIỆU", f, part, i); }
      if (FK.some((k) => x[k] !== y[k])) {
        changed++;
        const k = `${y.supplierId} n${y.n} b${y.table} ${part} ${x.fuel || "-"}→${y.fuel || "-"}/${y.fuelFrom || ""}`;
        by[k] = (by[k] || 0) + 1;
        lines.push([y.supplierId, part, y.n, y.table, y.row, y.model, x.fuel || "", y.fuel || "", y.fuelFrom || "", y.fuelWhy || ""].join("\t"));
      }
    });
  }
}
fs.writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`bản ghi ${total}; đổi nhiên liệu ${changed}; khác ngoài nhiên liệu ${other}`);
for (const [k, v] of Object.entries(by)) console.log(" ", v, k);
