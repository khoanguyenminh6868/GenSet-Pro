import fs from "node:fs";
const S = "/tmp/claude-0/-home-user-GenSet-Pro/e19a5d75-27cc-5de7-a135-3f10e2ae9600/scratchpad";
const A = JSON.parse(fs.readFileSync(S + "/nen.json")), B = JSON.parse(fs.readFileSync(S + "/th.json"));
const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
const rows = [];
let pkgChanged = 0, errs = [];
for (const k of keys) {
  const a = A[k], b = B[k];
  if (!a || !b) { errs.push(k + " thiếu " + (a ? "tích hợp" : "nền")); continue; }
  if (a.error || b.error) { if (a.error !== b.error) errs.push(`${k} nền:${a.error || "ok"} th:${b.error || "ok"}`); continue; }
  const ma = new Map(a.top.map((r, i) => [r, [i + 1, a.topScore[i]]])), mb = new Map(b.top.map((r, i) => [r, [i + 1, b.topScore[i]]]));
  let ch = false;
  for (const r of new Set([...ma.keys(), ...mb.keys()])) {
    const x = ma.get(r), y = mb.get(r);
    if (!x || !y || x[0] !== y[0] || x[1] !== y[1]) { ch = true; rows.push({ pkg: k, row: r, sup: r.split("|")[0], from: x || null, to: y || null }); }
  }
  if (ch) pkgChanged++;
}
fs.writeFileSync(S + "/changes.json", JSON.stringify(rows));
const bySup = {};
for (const r of rows) { const t = r.from && r.to ? "đổi hạng/điểm" : r.to ? "vào" : "ra"; (bySup[r.sup] ||= {}); bySup[r.sup][t] = (bySup[r.sup][t] || 0) + 1; }
console.log({ pkgs: keys.length, pkgChanged, rows: rows.length, errs: errs.length });
console.log(JSON.stringify(bySup));
if (errs.length) console.log(errs.slice(0, 10));
