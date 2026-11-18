// node pushWhy.cjs: bước dữ liệu (O → X), lượt đổi tập. Với mỗi lượt có dòng RA "bị đẩy, điểm không đổi": các dòng VÀO của lượt
// là gì (xingguang-jiangsu lên điểm, dòng mới denyo / yanmar, đổi id starlight → xingguang, lấp chỗ). Kèm số lượt đổi thứ tự có
// khoá NCC | dòng trùng trong top (gopRow không cho thứ tự thật).
const fs = require("fs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const O = J("rowDL-cu.json"), XC = J("rowCyl-main.json"), XN = J("rowDL-moi-nocyl.json"), G8 = J("gop-lech-cot-8.json");
const lineKey = (k) => { const p = k.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const topOf = (R) => Object.entries(R.rows).filter(([, r]) => r.st === "top").sort((a, b) => a[1].ti - b[1].ti).map(([k]) => k);
const T = {}, add = (c) => (T[c] = (T[c] || 0) + 1);
let dupOrder = 0;
for (const k of Object.keys(O)) {
  const X = XC[k] || XN[k], to = topOf(O[k]), tx = topOf(X), so = new Set(to), sx = new Set(tx);
  const outs = to.filter((r) => !sx.has(r)), ins = tx.filter((r) => !so.has(r));
  const g = G8[k].top.map(lineKey);
  if (!outs.length && !ins.length) { if (JSON.stringify(to) !== JSON.stringify(tx) && g.length !== new Set(g).size) dupOrder++; continue; }
  const pushed = outs.filter((r) => !r.startsWith("starlight-power|") && X.rows[r] && X.rows[r].st !== "dropped" && X.rows[r].score === O[k].rows[r].score);
  if (!pushed.length) continue;
  const kinds = ins.map((r) => {
    const o = O[k].rows[r], x = X.rows[r];
    if (r.startsWith("xingguang-jiangsu|") && O[k].rows["starlight-power|" + r.split("|").slice(1).join("|")]) return "đổi id starlight";
    if (r.startsWith("xingguang-jiangsu|") && o && o.score !== x.score) return `xingguang lên điểm ${o.score}→${x.score}`;
    if (!o) return `dòng mới ${r.split("|")[0]}`;
    return o.score === x.score ? "lấp chỗ" : "KHÁC";
  });
  // Hoà điểm ở ranh giới hạng 30: dòng ra và dòng vào cùng điểm, thứ tự trong danh mục đổi (bỏ dòng yingtai-group, starlight →
  // xingguang) nên `rows.sort` (ổn định) xếp dòng khác lên trước (IB2200049404: eastern-lion-fuan YC6K520D30 ↔ bobig-power, 269).
  const tieCut = kinds.every((q) => q === "lấp chỗ") && pushed.every((r) => ins.some((q) => X.rows[q].score === O[k].rows[r].score));
  const c = kinds.some((q) => q.startsWith("xingguang lên")) ? "bị đẩy bởi dòng xingguang-jiangsu lên điểm" : kinds.some((q) => q.startsWith("dòng mới")) ? "bị đẩy bởi dòng mới của dữ liệu" : tieCut ? "hoà điểm ở ranh giới hạng 30, đổi chỗ theo thứ tự danh mục" : "KHÁC";
  for (const r of pushed) add(c);
  if (c === "KHÁC") console.log(k, pushed.map((r) => r.slice(0, 60)), kinds);
}
console.log(T, "lượt chỉ đổi thứ tự có khoá trùng:", dupOrder);
