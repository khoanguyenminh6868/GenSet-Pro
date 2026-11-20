// Liệt kê bản ghi fromSupplier của các bảng PR 3 (nhiên liệu theo bảng): node probe.mjs <catalog.js> <suppliers/cn>
import fs from "fs";
import path from "path";
import vm from "vm";
const [cat, dir] = process.argv.slice(2);
const box = { console }; box.globalThis = box; box.window = box;
vm.runInNewContext(fs.readFileSync(cat, "utf8"), box);
const C = box.GenbidCatalog;
const want = { "jianghao-genset": [104], "zc-power": [109], "simpson-power": [124] };
for (const [id, ns] of Object.entries(want)) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, id + ".json"), "utf8"));
  s.id = s.id || id;
  const tabs = s.specTables.map((t, i) => [i, t]).filter(([, t]) => ns.includes(+t.n));
  for (const [i, t] of tabs) console.log(`${id} n${t.n} b${i} title=${JSON.stringify(t.title || "").slice(0, 80)} h0=${JSON.stringify(String(t.header?.[0] ?? "")).slice(0, 100)} rows=${t.rows?.length}`);
  for (const o of C.gensetsOf(s)) if (ns.includes(+o.n)) console.log(` G b${o.table} r${o.row} ${o.model} fuel=${o.fuel || "-"}/${o.fuelFrom || ""} ${o.fuelWhy || ""}`);
  for (const o of C.fromSupplier(s)) if (ns.includes(+o.n)) console.log(` b${o.table} r${o.row} ${o.kind} ${o.model} genset=${o.genset} fuel=${o.fuel || "-"}/${o.fuelFrom || ""} ${o.fuelWhy ? o.fuelWhy.slice(0, 60) : ""} | ${String(o.line).slice(0, 60)}`);
}
