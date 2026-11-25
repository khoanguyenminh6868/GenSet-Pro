import fs from "node:fs";
const S = ".";
const A = JSON.parse(fs.readFileSync("nen.json")), B = JSON.parse(fs.readFileSync("th.json"));
const pk = ["IB2300015591#0","IB2300153051#0","IB2300302196#0","IB2400104884#0","IB2400470041#0"];
let allok = true;
// 1. mọi gói khác: top giống hệt
let same = 0, diffOther = [];
for (const k of Object.keys(A)) { if (pk.includes(k)) continue; if (JSON.stringify(A[k].top) === JSON.stringify(B[k].top) && JSON.stringify(A[k].topScore) === JSON.stringify(B[k].topScore)) same++; else diffOther.push(k); }
console.log("gói không đổi top/điểm:", same, "gói đổi ngoài 5:", diffOther.length);
for (const k of pk) {
  const a = A[k], b = B[k];
  const inB = new Map(b.all.map(([r, s]) => [r, s])), inA = new Map(a.all.map(([r, s]) => [r, s]));
  const removed = a.top.filter((r) => !inB.has(r));           // rời R.all của bản tích hợp
  const gone = a.top.filter((r) => !b.top.includes(r));
  const scoreChange = a.top.filter((r) => inB.has(r) && inB.get(r) !== inA.get(r));
  const addedAll = [...inB.keys()].filter((r) => !inA.has(r)); // hàng mới xuất hiện trong R.all
  // mô phỏng: top cũ bỏ hàng bị loại, bù bằng thứ tự R.all mới
  const sim = a.top.filter((r) => inB.has(r) && inB.get(r) === inA.get(r));
  const need = 30 - sim.length;
  const rest = b.all.filter(([r]) => !sim.includes(r)).sort((x, y) => y[1] - x[1]).slice(0, need).map(([r]) => r);
  const simTop = [...sim, ...rest].sort((x, y) => inB.get(y) - inB.get(x));
  const bs = new Set(b.top), ss = new Set(simTop);
  const ok = bs.size === ss.size && [...bs].every((r) => ss.has(r));
  // điểm hàng chung đổi?
  const commonScoreDiff = b.top.filter((r) => inA.has(r) && inA.get(r) !== inB.get(r));
  console.log(k, { removedFromR_all: removed.map((r) => r.slice(0, 40)), droppedFromTop: gone.length, newInR_all: addedAll.length, scoreChange: scoreChange.length, commonScoreDiff: commonScoreDiff.length, simMatchesTh: ok });
  if (!ok || scoreChange.length || commonScoreDiff.length || addedAll.length) allok = false;
}
console.log("tất cả khớp mô phỏng:", allok);
// mecca / longkai trong top 30 toàn bộ
for (const [name, X] of [["nền", A], ["tích hợp", B]]) {
  let m = 0, l = 0; for (const k of Object.keys(X)) for (const r of X[k].top || []) { if (r.startsWith("mecca-power|")) m++; if (r.startsWith("longkai-power|")) l++; }
  console.log(name, "hàng mecca trong top30 (cộng mọi gói):", m, "longkai:", l);
}
