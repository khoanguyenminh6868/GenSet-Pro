// Nhóm 3 E: với khoá động cơ đã có trong catalog, catalog đã có cyl / disp / bore chưa; bảng E có cột gì.
// node g3c.mjs <repo> all.json g3.json
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [REPO, ALL, G3] = process.argv.slice(2);
const box = { console }; box.globalThis = box; box.window = box;
vm.runInNewContext(fs.readFileSync(path.join(REPO, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog;
const T = JSON.parse(fs.readFileSync(ALL, "utf8"));
const spec = new Map(), uses = new Map(), sups = new Map();
for (const t of Object.values(T)) for (const r of t.recs) {
  if (r.kind !== "engine") continue; const k = C.keyOf(r.model || "");
  if (!spec.has(k)) { spec.set(k, new Set()); uses.set(k, 0); sups.set(k, new Set()); }
  for (const s of r.specs) spec.get(k).add(s.split("=")[0]);
  uses.set(k, uses.get(k) + 1); sups.get(k).add(t.sid);
}
const g3 = JSON.parse(fs.readFileSync(G3, "utf8")).filter((o) => o.cls === "E");
let tot = { keys: 0, known: 0, noCyl: 0, noDisp: 0, noBore: 0, uses: 0 };
for (const o of g3) {
  const t = T[o.sid + "|" + o.ti];
  const per = { keys: 0, known: 0, noCyl: 0, noDisp: 0, noBore: 0, uses: 0, ex: [] };
  const seen = new Set();
  for (const r of t.rows) {
    const c = r.split("|").map((x) => x.trim()).filter(Boolean);
    const m = /康明斯|Cummins/.test(c[0]) ? c[1] : c[0];
    const k = C.keyOf(m || ""); if (!k || seen.has(k)) continue; seen.add(k); per.keys++;
    if (!spec.has(k)) continue; per.known++; per.uses += uses.get(k);
    const s = spec.get(k);
    if (!s.has("cyl")) per.noCyl++; if (!s.has("disp")) per.noDisp++; if (!s.has("bore")) per.noBore++;
    if (per.ex.length < 4) per.ex.push(`${m}: ${uses.get(k)} bản ghi/${sups.get(k).size} NCC, có ${[...s].join(",") || "-"}`);
  }
  for (const x of Object.keys(tot)) tot[x] += per[x];
  console.log(o.sid, "n" + o.n, JSON.stringify({ ...per, ex: undefined }), "\n   ", per.ex.join(" ; "));
}
console.log("TỔNG", JSON.stringify(tot));
