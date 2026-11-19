// node pushed.cjs <gốc.json> <nhánh.json>: với mỗi dòng RA khỏi top mà vẫn ở all của nhánh (bị đẩy), kiểm:
//  (1) điểm của nó ở gốc = ở nhánh; (2) trong cùng lượt có dòng VÀO top với điểm ≥ điểm nó, hoặc cùng NCC / cùng động cơ
//      (giới hạn PER_SUPPLIER / PER_ENGINE: dòng khác chiếm chỗ), hoặc có dòng VÀO thuộc phần CN_ROWS (hạng < 12).
// In mọi dòng không thoả để xem tay.
const fs = require("fs");
const [A, Bf] = process.argv.slice(2);
const a = JSON.parse(fs.readFileSync(A, "utf8")), b = JSON.parse(fs.readFileSync(Bf, "utf8"));
const f = (k, i) => k.split("|")[i];
let n = 0, ok1 = 0, byScore = 0, bySame = 0, byCn = 0;
const bad = [];
for (const k of Object.keys(a)) {
  const x = a[k], y = b[k];
  if (!y || x.error || y.error) continue;
  const sb = new Set(y.top), sa = new Set(x.top), allB = new Map(y.all.map(([r, s]) => [r, s]));
  const inn = y.top.map((r, i) => ({ r, s: y.topScore[i], i })).filter((o) => !sa.has(o.r));
  x.top.forEach((r, i) => {
    if (sb.has(r) || !allB.has(r)) return;
    n++;
    const s = x.topScore[i];
    if (allB.get(r) === s) ok1++;
    if (inn.some((o) => o.s >= s)) byScore++;
    else if (inn.some((o) => f(o.r, 0) === f(r, 0) || f(o.r, 1) === f(r, 1))) bySame++;
    else if (inn.some((o) => o.i < 12)) byCn++;
    else bad.push(`${k} ${r.slice(0, 90)} điểm ${s}; vào: ${inn.map((o) => `${o.r.slice(0, 40)}@${o.i}:${o.s}`).join(", ")}`);
  });
}
console.log({ n, sameScore: ok1, byScore, bySame, byCn, bad: bad.length });
console.log(bad.join("\n"));
