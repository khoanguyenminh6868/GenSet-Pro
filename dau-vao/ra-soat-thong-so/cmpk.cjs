// Compare catalog read on main vs PR by key supplier|table|row|kind|nth (record counts may differ).
const fs = require("fs");
const A = JSON.parse(fs.readFileSync(__dirname + "/all-main.json", "utf8")), B = JSON.parse(fs.readFileSync(__dirname + "/all-pr.json", "utf8"));
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 14) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
const index = (L) => { const m = new Map(), seen = new Map(); for (const o of L) { const b = `${o.supplierId}|${o.n}|${o.table}|${o.row}|${o.kind}`; const i = seen.get(b) || 0; seen.set(b, i + 1); m.set(`${b}|${i}`, o); } return m; };
const MA = index(A), MB = index(B);
console.log("ban ghi main / PR:", A.length, B.length);
const onlyA = [...MA.keys()].filter((k) => !MB.has(k)), onlyB = [...MB.keys()].filter((k) => !MA.has(k));
console.log("chi co o main:", onlyA.length, onlyA.slice(0, 8).map((k) => `${k} ${MA.get(k).model}`).join(" ; "));
console.log("chi co o PR:", onlyB.length, onlyB.slice(0, 12).map((k) => `${k} ${MB.get(k).model} <${String(MB.get(k).line).slice(0, 70)}>`).join("\n   "));
const lost = new Map(), gained = new Map(), lostEx = new Map(), gainEx = new Map(), modelCh = new Map(), other = new Map();
for (const [k, a] of MA) {
  const b = MB.get(k); if (!b) continue;
  for (const f of ["power", "freq", "genset", "makes", "other"]) if (JSON.stringify(a[f]) !== JSON.stringify(b[f])) cnt(other, `${f}: ${a.supplierId} ${JSON.stringify(a[f]).slice(0, 50)} -> ${JSON.stringify(b[f]).slice(0, 50)}`);
  if (a.model !== b.model) cnt(modelCh, `[${a.supplierId}] ${a.model} -> ${b.model}`);
  const sa = new Map((a.specs || []).map((x) => [x.key, x])), sb = new Map((b.specs || []).map((x) => [x.key, x]));
  for (const [key, x] of sa) if (!sb.has(key) || sb.get(key).value !== x.value) { cnt(lost, key); const m = lostEx.get(key) || new Map(); cnt(m, `[${a.supplierId}] "${x.label.slice(0, 40)}" = "${x.value.slice(0, 30)}"`); lostEx.set(key, m); }
  for (const [key, x] of sb) if (!sa.has(key) || sa.get(key).value !== x.value) { cnt(gained, key); const m = gainEx.get(key) || new Map(); cnt(m, `[${b.supplierId}] "${x.label.slice(0, 40)}" = "${x.value.slice(0, 30)}"`); gainEx.set(key, m); }
}
console.log("\ndoi cong suat / tan so / genset / hang / other:", [...other.values()].reduce((x, y) => x + y, 0)); for (const [e, n] of top(other, 12)) console.log("   ", n, e);
console.log("\nGIA TRI MAT:", top(lost, 40).map((x) => x.join("=")).join(", "));
for (const [k, m] of lostEx) { console.log(" ", k, `(${m.size} mau)`); for (const [e, n] of top(m, 8)) console.log("     ", n, e); }
console.log("\nGIA TRI THEM:", top(gained, 40).map((x) => x.join("=")).join(", "));
for (const [k, m] of gainEx) { console.log(" ", k, `(${m.size} mau)`); for (const [e, n] of top(m, 8)) console.log("     ", n, e); }
console.log("\nMODEL DOI TEN:", modelCh.size, "kieu,", [...modelCh.values()].reduce((x, y) => x + y, 0), "ban ghi"); for (const [e, n] of top(modelCh, 40)) console.log("     ", n, e);
