// node gopRowCmp.cjs <a.json> <b.json>: với từng lượt, in dòng vào / ra top kèm trạng thái, điểm, lý do ở hai bản; và mọi dòng của
// top (hai bản) có điểm / trạng thái đổi.
const fs = require("fs");
const [FA, FB] = process.argv.slice(2), A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
const d = (x) => (!x ? "(không có)" : x.st === "dropped" ? `LOẠI [${x.ruled}] ${x.make} ${x.eng}` : `${x.st}${x.ti != null ? "#" + x.ti : ""} hạng ${x.i} điểm ${x.score} ${x.make} ${x.eng}${x.ruled?.length ? " ruled=" + x.ruled : ""}`);
for (const k of Object.keys(A)) {
  const a = A[k].rows, b = B[k].rows; console.log(`\n== ${k} cap ${JSON.stringify(A[k].cap)} origin ${A[k].origin}${JSON.stringify(A[k].hints) === JSON.stringify(B[k].hints) ? "" : " HINTS ĐỔI"}`);
  const na = Object.keys(a).length, nb = Object.keys(b).length; console.log(`   dòng: ${na} → ${nb}`);
  for (const r of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[r], y = b[r], top = x?.st === "top" || y?.st === "top";
    if (!top) continue;
    if (x?.st !== y?.st || x?.score !== y?.score) { console.log(`   ${r.slice(0, 100)}\n      ${d(x)}\n      ${d(y)}`); const wa = (x?.why || []).join("; "), wb = (y?.why || []).join("; "); if (wa !== wb) console.log(`      lý do: ${wa.slice(0, 300)}\n          →  ${wb.slice(0, 300)}`); }
  }
}
