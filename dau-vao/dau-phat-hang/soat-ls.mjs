// Soát MỌI mục định mức mới (có trong sau, không có trong trước):
//  (1) kW = 0,8 × kVA (±0,6) khi có kW; (2) cùng model / Hz / pha / điện áp: F 105K ≤ H 125K ≤ Standby 40 °C ≤ Standby 27 °C;
//  (3) mỗi kVA có mặt trong dòng nguồn (ghép số nghìn); (4) in bảng kVA từng model để đối chiếu tay.
// node soat-ls.mjs truoc.json sau.json <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [fa, fb, root] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(fa, "utf8")), B = JSON.parse(fs.readFileSync(fb, "utf8"));
const R = await import(pathToFileURL(path.join(root, "suppliers", "ratings.mjs")).href);
let bad = 0, n = 0;
const rank = (x) => (x.duty === "Cont." ? (x.rise.startsWith("F") ? 0 : 1) : /27/.test(x.rise.split(" ").pop()) ? 3 : 2);
for (const f of Object.keys(B)) {
  const old = new Set((A[f]?.r || []).map((x) => JSON.stringify(x)));
  const nw = B[f].r.filter((x) => !old.has(JSON.stringify(x)));
  if (!nw.length) continue;
  const text = fs.readFileSync(path.join(root, "suppliers", "sources", f), "utf8");
  const full = R.ratingsOf(text).filter((x) => x.part === "alternator");
  const rowsOf = new Map(full.map((x) => [JSON.stringify((({ lines, ...y }) => y)(x)), x.lines]));
  const by = new Map();
  for (const x of nw) {
    n++;
    if (x.kW != null && Math.abs(x.kW - 0.8 * x.kVA) > Math.max(0.6, 0.02 * x.kW)) { bad++; console.log(`kW≠0,8kVA ${f} ${x.model} ${x.hz} ${x.rise} ${x.volt}: ${x.kVA} / ${x.kW}`); }
    const lines = rowsOf.get(JSON.stringify(x)) || [];
    const rowTxt = lines.filter((l) => /kVA/.test(l)).join(" ").replace(/(\b[1-9])[\s|]+(\d{3})\b/g, "$1$2");
    if (!new RegExp(`(^|[^\\d.])${String(x.kVA).replace(".", "\\.")}(\\.0)?([^\\d.]|$)`).test(rowTxt)) { bad++; console.log(`kVA không có trong dòng ${f} ${x.model}: ${x.kVA}`); }
    const k = `${x.model}|${x.hz}|${x.phase}|${x.volt}`;
    by.set(k, [...(by.get(k) || []), x]);
  }
  for (const [k, xs] of by) {
    const s = [...xs].sort((a, b) => rank(a) - rank(b));
    for (let j = 1; j < s.length; j++) if (s[j].kVA < s[j - 1].kVA) { bad++; console.log(`thứ tự cấp nhiệt sai ${f} ${k}: ${s.map((x) => `${x.rise}=${x.kVA}`).join(", ")}`); break; }
  }
  // Bảng tay: kVA theo model, 50 Hz 400 V và 60 Hz 480 V (3 pha), bốn cột F/H/SB40/SB27; dòng 1 pha 50 Hz.
  const models = [...new Set(nw.map((x) => x.model))];
  console.log(`\n# ${f}`);
  for (const m of models) {
    const pick = (hz, v, ph = 3) => [0, 1, 2, 3].map((r) => nw.filter((x) => x.model === m && x.hz === hz && x.phase === ph && (ph === 1 || x.volt === v) && rank(x) === r).map((x) => x.kVA).join("/") || "-").join(" | ");
    console.log(`${m}: 50Hz 400V [F|H|SB40|SB27] ${pick(50, 400)} ; 1ph ${pick(50, null, 1)} ; 60Hz 480V ${pick(60, 480)}`);
  }
}
console.log(`\nmục mới: ${n}, lỗi: ${bad}`);
