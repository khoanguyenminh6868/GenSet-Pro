// In bảng mất / thêm của một tệp trong measure.json: node mshow.mjs <measure.json> <id> [n] [số tệp tối đa]
import fs from "node:fs";
const [file, id, n, max = 2] = process.argv.slice(2);
const res = JSON.parse(fs.readFileSync(file, "utf8")).filter((r) => r.id === id && (!n || n === "-" || r.n === +n)).slice(0, +max);
const show = (t, tag) => { console.log(`  ${tag} header ${t.header.length}, rows ${t.rows.length}`); for (const h of t.header.slice(0, 4)) console.log(`     H ${h.slice(0, 170)}`); for (const r of t.rows.slice(0, 3)) console.log(`     R ${r.slice(0, 170)}`); if (t.rows.length > 3) console.log(`     R… ${t.rows[t.rows.length - 1].slice(0, 170)}`); };
for (const r of res) {
  console.log(`\n=== ${r.id} n${r.n}: giữ ${r.same}, cũ đổi ${r.gone.length}, mới ${r.added.length}, dòng thêm ${r.rowsAdded.length}, mất ${r.rowsLost.length} (thành tiêu đề ${r.rowsLostToHeader.length})`);
  r.gone.forEach((t) => show(t, "CŨ "));
  r.added.forEach((t) => show(t, "MỚI"));
  for (const l of r.rowsLost.filter((x) => !r.rowsLostToHeader.includes(x)).slice(0, 6)) console.log(`  MẤT ${l.slice(0, 170)}`);
}
