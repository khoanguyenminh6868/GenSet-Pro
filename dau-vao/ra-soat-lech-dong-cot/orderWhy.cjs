// node orderWhy.cjs: lượt chỉ đổi thứ tự ở bước dữ liệu (O → X) mà dãy điểm khác: có dòng xingguang-jiangsu đổi điểm trong top
// (bộ điều khiển nhận từ starlight-power, #909) hay có khoá NCC | dòng trùng (gopRow), hay khác.
const fs = require("fs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const O = J("rowDL-cu.json"), XC = J("rowCyl-main.json"), XN = J("rowDL-moi-nocyl.json"), G8 = J("gop-lech-cot-8.json");
const lineKey = (k) => { const p = k.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const topOf = (R) => Object.entries(R.rows).filter(([, r]) => r.st === "top").sort((a, b) => a[1].ti - b[1].ti).map(([k]) => k);
const T = {};
for (const k of Object.keys(O)) {
  const X = XC[k] || XN[k], to = topOf(O[k]), tx = topOf(X);
  if (JSON.stringify(to) === JSON.stringify(tx) || to.length !== tx.length || to.some((r) => !tx.includes(r))) continue;
  const sc = (R, t) => t.map((r) => R.rows[r].score).join(",");
  const tie = sc(O[k], to) === sc(X, tx);
  const xg = to.some((r) => r.startsWith("xingguang-jiangsu|") && O[k].rows[r].score !== X.rows[r].score);
  const g = G8[k].top.map(lineKey), dup = g.length !== new Set(g).size;
  const c = tie ? (dup ? "cùng điểm (có khoá trùng)" : "cùng điểm") : xg ? "dòng xingguang-jiangsu đổi điểm (+50/+250, #909)" : dup ? "khoá NCC | dòng trùng (vị trí ảo)" : "KHÁC";
  T[c] = (T[c] || 0) + 1;
  if (c === "KHÁC") console.log(k, to.map((r, i) => (r === tx[i] ? "" : `#${i} ${O[k].rows[r].score}/${X.rows[tx[i]].score}`)).filter(Boolean).join(" "));
}
console.log(T);
