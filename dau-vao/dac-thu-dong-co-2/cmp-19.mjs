// node cmp-19.mjs <do19-main.json> <do19-2b.json>: so top 30 từng lượt của 19 gói, mọi dòng vào / ra và điểm đổi.
import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const ids = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
let same = 0;
for (const id of ids) {
  const a = A[id] || {}, b = B[id] || {};
  if (a.error || b.error) { console.log(`\n${id}: LỖI main=${a.error || "-"} 2b=${b.error || "-"}`); continue; }
  const sa = new Map(a.top.map((k, i) => [k, i])), sb = new Map(b.top.map((k, i) => [k, i]));
  const out = a.top.filter((k) => !sb.has(k)), inn = b.top.filter((k) => !sa.has(k));
  const sc = b.top.filter((k) => sa.has(k) && a.topScore[sa.get(k)] !== b.topScore[sb.get(k)]);
  const order = JSON.stringify(a.top) === JSON.stringify(b.top);
  if (order && !sc.length) { same++; console.log(`${id}: KHÔNG ĐỔI (top ${a.top.length}; trait 2b: ${JSON.stringify(b.trait)})`); continue; }
  const mk = (t) => { const m = {}; for (const x of t.topMake) m[x || "?"] = (m[x || "?"] || 0) + 1; return JSON.stringify(m); };
  console.log(`\n${id}: cap ${b.cap?.value} ${b.cap?.unit}; trait 2b ${JSON.stringify(b.trait)}; top ${a.top.length}→${b.top.length}; all ${a.all}→${b.all}; dropped ${a.dropped}→${b.dropped} (trait ${b.trait_dropped})`);
  console.log(`  hãng top main ${mk(a)}`);
  console.log(`  hãng top 2b   ${mk(b)}`);
  for (const k of out) console.log(`  RA  #${sa.get(k) + 1} ${k} [${a.topMake[sa.get(k)]}] ${a.topScore[sa.get(k)]}`);
  for (const k of inn) console.log(`  VÀO #${sb.get(k) + 1} ${k} [${b.topMake[sb.get(k)]}] ${b.topScore[sb.get(k)]} — ${b.topWhy[sb.get(k)]}`);
  for (const k of sc) console.log(`  ĐIỂM ${k} ${a.topScore[sa.get(k)]}→${b.topScore[sb.get(k)]} — ${b.topWhy[sb.get(k)]}`);
  if (!out.length && !inn.length && !sc.length) console.log("  chỉ đổi thứ tự");
}
console.log(`\n${ids.length} lượt, không đổi ${same}`);
