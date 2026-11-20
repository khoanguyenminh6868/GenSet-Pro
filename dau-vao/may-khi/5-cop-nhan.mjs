// Bảng nhãn (mỗi dòng "nhãn | giá trị"): có dòng nhãn COP / Continuous power mà KHÔNG có dòng prime / standby nào, bản ghi lại có prime?
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const ROOT = process.argv[2];
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog, dir = path.join(ROOT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const COPL = /^\s*(COP|continuous\s*(power|rating|output)|连续功率)\b/i, LV = /\bPRP\b|prime|standby|\bESP\b|主用|备用|常用|stand-by/i;
let n = 0; const out = [];
for (const s of sups) { const recs = C.fromSupplier(s);
  (s.specTables || []).forEach((t, ti) => {
    const rows = t.rows || []; const copRows = rows.filter((l) => COPL.test(C.cellsOf(l)[0] || ""));
    if (!copRows.length) return; const hasLv = rows.concat(t.header || []).some((l) => LV.test(C.cellsOf(l)[0] || "")); if (hasLv) return;
    const own = recs.filter((o) => o.table === ti && o.n === t.n && o.kind !== "alternator"); const prime = own.filter((o) => o.power && o.power.prime);
    out.push([s.id, t.n, ti, rows.length, copRows[0].slice(0, 60), own.length, prime.length].join("\t"));
  }); }
console.log("ncc\tn\tti\tdong\tdong-COP\tbanghi\tdoc-prime"); console.log(out.join("\n")); console.log("tổng bảng nhãn có COP không prime/standby:", out.length);
