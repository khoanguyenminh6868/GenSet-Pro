// Bảng có cột "COP" / "Continuous" / 连续功率 ở tiêu đề: catalog.js đọc cột đó thành prime (mà luật: COP không là mức nào)?
//   node 4-cop.mjs <gốc repo origin/main> <thư mục ra>
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const [ROOT, OUT] = process.argv.slice(2);
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog, dir = path.join(ROOT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const classes = JSON.parse(fs.readFileSync(path.join(here, "dong-khi.json"), "utf8")); const gasTab = new Map(classes.map((u) => [`${u.id}|${u.n}|${u.ti}`, u.cls]));
const COP = /\bCOP\b|continuous\s*(power|rating|output)|连续功率|持续功率|连续运行/i;
const LEVEL = /\bPRP\b|prime|standby|\bESP\b|\bLTP\b|主用|备用|常用|stand-by/i;
const rows = ["ncc\tn\tti\tdong\tbanghi\tcot-COP(tieu-de)\tcon-cot-prime/standby\tdoc-ra-prime\tdoc-ra-standby\tlop-may-khi\tdong-mau"];
let nTab = 0, nRowsTot = 0, nBad = 0, nBadRows = 0; const byNcc = {}; let gasBad = 0, gasBadRows = 0;
for (const s of sups) {
  const recs = C.fromSupplier(s);
  (s.specTables || []).forEach((t, ti) => {
    const hdr = (t.header || []).join(" | "); if (!COP.test(hdr)) return;
    const own = recs.filter((o) => o.table === ti && o.n === t.n && o.kind !== "alternator");
    if (!own.length) return;
    const cell = (hdr.match(new RegExp(`[^|]*(${COP.source})[^|]*`, "i")) || [""])[0].trim().slice(0, 40);
    const prime = own.filter((o) => o.power && o.power.prime).length, stby = own.filter((o) => o.power && o.power.standby).length;
    const hasLevel = LEVEL.test(hdr.replace(COP, ""));
    nTab++; nRowsTot += (t.rows || []).length;
    const bad = prime > 0 && !hasLevel; // đọc ra prime trong khi tiêu đề chỉ có COP
    const cls = gasTab.get(`${s.id}|${t.n}|${ti}`) || "";
    if (bad) { nBad++; nBadRows += prime; (byNcc[s.id] = byNcc[s.id] || { b: 0, r: 0 }).b++; byNcc[s.id].r += prime; if (cls === "khi") { gasBad++; gasBadRows += prime; } }
    rows.push([s.id, t.n, ti, (t.rows || []).length, own.length, cell, hasLevel ? "có" : "không", prime, stby, cls, bad ? (own.find((o) => o.power?.prime)?.line || "").slice(0, 120) : ""].join("\t"));
  });
}
fs.writeFileSync(path.join(OUT, "cop-bang.tsv"), rows.join("\n") + "\n");
console.log({ bangCoCOP: nTab, dongCoCOP: nRowsTot, bangDocRaPrimeKhongCoCotMuc: nBad, banGhiPrime: nBadRows, trongBangKhi: { bang: gasBad, banGhi: gasBadRows } });
console.log(Object.entries(byNcc).sort((a, b) => b[1].r - a[1].r).map(([k, v]) => `${k}:${v.b}b/${v.r}bg`).join("  "));
