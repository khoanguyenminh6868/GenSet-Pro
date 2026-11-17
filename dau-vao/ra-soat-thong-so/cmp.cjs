// Compare catalog read on main vs PR, record by record (same order: both read the same tables).
const fs = require("fs");
const A = JSON.parse(fs.readFileSync(__dirname + "/all-main.json", "utf8")), B = JSON.parse(fs.readFileSync(__dirname + "/all-pr.json", "utf8"));
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 12) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
console.log("ban ghi main / PR:", A.length, B.length);
const lost = new Map(), gained = new Map(), lostEx = new Map(), gainEx = new Map(), modelCh = new Map(); let otherDiff = 0, powerDiff = 0;
for (let i = 0; i < A.length; i++) {
  const a = A[i], b = B[i];
  if (a.supplierId !== b.supplierId || a.table !== b.table || a.row !== b.row || a.kind !== b.kind) { otherDiff++; continue; }
  if (JSON.stringify(a.power) !== JSON.stringify(b.power) || a.freq !== b.freq || a.genset !== b.genset || JSON.stringify(a.makes) !== JSON.stringify(b.makes)) powerDiff++;
  if (a.model !== b.model) cnt(modelCh, `${a.model} -> ${b.model}`);
  const sa = new Map((a.specs || []).map((x) => [x.key, x])), sb = new Map((b.specs || []).map((x) => [x.key, x]));
  for (const [k, x] of sa) if (!sb.has(k) || sb.get(k).value !== x.value) { cnt(lost, k); const m = lostEx.get(k) || new Map(); cnt(m, `"${x.label.slice(0, 34)}" = "${x.value.slice(0, 34)}"`); lostEx.set(k, m); }
  for (const [k, x] of sb) if (!sa.has(k) || sa.get(k).value !== x.value) { cnt(gained, k); const m = gainEx.get(k) || new Map(); cnt(m, `"${x.label.slice(0, 34)}" = "${x.value.slice(0, 34)}" [${b.supplierId}]`); gainEx.set(k, m); }
}
console.log("ban ghi lech vi tri:", otherDiff, "| doi cong suat/tan so/genset/hang:", powerDiff);
console.log("\nGIA TRI MAT (co o main, khong con o PR):", top(lost, 40).map((x) => x.join("=")).join(", "));
for (const [k, m] of lostEx) { console.log(" ", k, "- cac nhan/gia tri bi bo (", m.size, "mau):"); for (const [e, n] of top(m, 14)) console.log("     ", n, e); }
console.log("\nGIA TRI THEM (moi o PR):", top(gained, 40).map((x) => x.join("=")).join(", "));
for (const [k, m] of gainEx) { console.log(" ", k, "- (", m.size, "mau):"); for (const [e, n] of top(m, 10)) console.log("     ", n, e); }
console.log("\nMODEL DOI TEN:", modelCh.size, "kieu,", [...modelCh.values()].reduce((a, b) => a + b, 0), "ban ghi");
for (const [e, n] of top(modelCh, 30)) console.log("     ", n, e);
