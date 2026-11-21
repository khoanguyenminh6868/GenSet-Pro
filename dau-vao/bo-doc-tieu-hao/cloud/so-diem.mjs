// #1022 (b): giải thích MỌI dòng đổi điểm: Δ = 8 × (min(số loại thông số động cơ nhánh, 8) − min(gốc, 8)), phần dư phải là −300 (tiêu hao vượt, dòng ở lại).
import fs from "node:fs";
const R = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const A = R("./diem-goc.json"), B = R("./diem-nhanh.json"), T = R("./giai-thich.json");
const minus = new Set(T.fuelMinus.map((x) => `${x.run}|${x.sup}|${x.model}|${x.a}|${x.b}`));
const out = [], p = (...a) => out.push(a.join(" "));
const add = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n), top = (m, n = 40) => [...m].sort((x, y) => y[1] - x[1]).slice(0, n);
let total = 0, okEight = 0, okMinus = 0, okCombo = 0; const bad = [], byDelta = new Map(), added = new Map(), removed = new Map(), combos = new Map(), lostFact = [], capped = new Map();
for (const run of Object.keys(B)) {
  const a = new Map(A[run].map((x) => [x[0], x])) ;
  for (const [k, s0, s1, keys1] of B[run]) {
    total++; const keys0 = a.get(k)?.[3] || [], d = s1 - s0; add(byDelta, d);
    const exp = 8 * (Math.min(keys1.length, 8) - Math.min(keys0.length, 8)), rest = d - exp;
    const plus = keys1.filter((x) => !keys0.includes(x)), minusK = keys0.filter((x) => !keys1.includes(x));
    plus.forEach((x) => add(added, x)); minusK.forEach((x) => add(removed, x));
    if (minusK.length) lostFact.push(`${run} ${k.slice(0, 50)} mất ${minusK}`);
    if (keys0.length >= 8) add(capped, "gốc đã đủ 8 loại");
    if (rest === 0) okEight++;
    else if (rest === -300 && exp === 0) okMinus++;
    else if (rest === -300) { okCombo++; add(combos, `${exp} − 300`); }
    else bad.push(`${run} ${k.slice(0, 70)} ${s0}→${s1} kỳ vọng ${exp} dư ${rest} thêm [${plus}]`);
  }
}
p("Tổng dòng đổi điểm:", total);
p("Khớp đúng +8 × số loại thông số động cơ mới:", okEight);
p("Khớp đúng −300 (tiêu hao vượt, không đổi loại thông số):", okMinus);
p("Khớp +8k và −300 cùng lúc:", okCombo, JSON.stringify(top(combos)));
p("CHƯA giải thích:", bad.length);
bad.slice(0, 40).forEach((x) => p("  ", x));
p("\nMức chênh:", JSON.stringify(top(byDelta)));
p("Loại thông số thêm (lượt-dòng):", JSON.stringify(top(added)));
p("Loại thông số mất (lượt-dòng):", JSON.stringify(top(removed)), "| dòng có mất:", lostFact.length);
lostFact.slice(0, 10).forEach((x) => p("  ", x));
p("fuelMinus đã ghi:", minus.size, "bản ghi khác nhau");
// −300: mọi dòng, số tiêu hao so với ngưỡng và suất L/kWh
const lineKw = (x) => null;
const m300 = new Map();
for (const x of T.fuelMinus) for (const w of x.why) { const k = `${x.sup} | ${x.model} | ${(x.fuel || []).map((f) => `${f.k}:${f.l}=${f.v}`).join(" ; ").slice(0, 90)}`; add(m300, k); }
p("\n−300 theo (NCC, model, nhãn = số):", m300.size);
for (const [k, n] of top(m300, 80)) p(n, k);
p("\nNCC của −300:", JSON.stringify(top(T.fuelMinus.reduce((m, x) => (add(m, x.sup), m), new Map()))));
fs.writeFileSync(new URL("./so-diem.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 13000));
