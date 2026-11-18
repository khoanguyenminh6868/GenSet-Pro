// node orderTie.cjs: lượt chỉ đổi thứ tự ở bước dữ liệu (gop 8 → X) mà có điểm ở X (rowCyl-main, lượt có minCyl): mọi vị trí đổi chỗ
// có phải dòng cùng điểm không (điểm của dòng ở vị trí i của gốc 8 = điểm của dòng ở vị trí i của X, đọc ở X). Lượt không minCyl
// không có điểm (gop chỉ lưu khoá).
const fs = require("fs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const G8 = J("gop-lech-cot-8.json"), XC = J("rowCyl-main.json");
const lineKey = (k) => { const p = k.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
let n = 0, tie = 0, notTie = [];
for (const k of Object.keys(XC)) {
  const o = G8[k].top.map(lineKey), R = XC[k].rows;
  const x = Object.entries(R).filter(([, r]) => r.st === "top").sort((a, b) => a[1].ti - b[1].ti).map(([q]) => q);
  if (JSON.stringify(o) === JSON.stringify(x) || o.length !== x.length || o.some((r) => !x.includes(r))) continue;
  n++;
  const ok = o.every((r, i) => r === x[i] || R[r]?.score === R[x[i]]?.score);
  if (ok) tie++; else notTie.push(k + " " + o.map((r, i) => (r === x[i] ? "" : `#${i} ${R[r]?.score}/${R[x[i]]?.score}`)).filter(Boolean).join(" "));
}
console.log(`lượt minCyl chỉ đổi thứ tự (dữ liệu): ${n}; mọi chỗ đổi là dòng cùng điểm: ${tie}; khác: ${notTie.length}\n${notTie.join("\n")}`);
