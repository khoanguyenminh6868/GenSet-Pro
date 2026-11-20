// Nhóm 3: model ở ô đầu (hoặc ô thứ 2 với yingtai n101/n2003, nenjo) của 29 bảng: đã có khoá trong catalog chưa (CAT.keyOf thật).
// node g3b.mjs <repo> all.json g3.json
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [REPO, ALL, G3] = process.argv.slice(2);
const box = { console }; box.globalThis = box; box.window = box;
vm.runInNewContext(fs.readFileSync(path.join(REPO, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog;
const T = JSON.parse(fs.readFileSync(ALL, "utf8"));
const have = { engine: new Map(), alternator: new Map() };
for (const t of Object.values(T)) for (const r of t.recs) { if (!have[r.kind]) continue; const k = C.keyOf(r.model || ""); const m = have[r.kind]; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(t.sid); }
const g3 = JSON.parse(fs.readFileSync(G3, "utf8"));
const tot = { A: { rows: 0, models: 0, known: 0, knownOther: 0 }, E: { rows: 0, models: 0, known: 0, knownOther: 0 } };
const lines = [];
for (const o of g3) {
  const t = T[o.sid + "|" + o.ti];
  const kind = o.cls === "A" ? "alternator" : "engine";
  const models = new Set();
  for (const r of t.rows) {
    const c = r.split("|").map((x) => x.trim()).filter(Boolean);
    let m = c.find((x) => C.isCode ? C.isCode(x) : /[A-Za-z]/.test(x) && /\d/.test(x));
    if (/中心高|Center height/.test(c[0] || "")) m = c[1];
    if (/^(进口|Import|东风|重庆|西安|广西)/.test(c[0] || "") || /康明斯|Cummins/.test(c[0] || "")) m = c[1];
    if (m && /\d/.test(m) && /[A-Za-z]/.test(m)) models.add(m);
  }
  let known = 0, knownOther = 0; const kn = [];
  for (const m of models) { const k = C.keyOf(m); const s = have[kind].get(k); if (s) { known++; if ([...s].some((x) => x !== o.sid)) knownOther++; kn.push(m); } }
  tot[o.cls].rows += t.nrows; tot[o.cls].models += models.size; tot[o.cls].known += known; tot[o.cls].knownOther += knownOther;
  lines.push([o.cls, o.sid, o.n, o.ti, t.nrows, models.size, known, knownOther, kn.slice(0, 6).join(" ")].join("\t"));
}
console.log(lines.join("\n"));
console.log(JSON.stringify(tot));
