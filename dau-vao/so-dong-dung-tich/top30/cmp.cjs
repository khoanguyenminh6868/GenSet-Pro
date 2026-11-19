// node cmp.cjs <gốc.json> <nhánh.json> <out.txt> : so top 30 + `all` (đa tập khoá dòng, điểm) giữa gốc (do-gop-rf) và nhánh
// (do-gop-sd, có dispDrop / hints / ctrlWhy). Giải thích từng lượt đổi:
//   - dòng RA khỏi `all`: phải nằm trong dispDrop của nhánh (bị loại vì dung tích theo số đông) → "loại theo số đông";
//   - dòng VÀO `all`: gốc loại nó vì dung tích "mọi nguồn" mà nhánh không có giá trị thắng (hoặc giá trị thắng đạt) → "cứu";
//     chỉ kiểm được gián tiếp: lượt phải có minDisp / maxDisp;
//   - dòng ở cả hai mà điểm khác: KHÔNG được có (chỉ thêm chữ lý do +50, không đổi điểm);
//   - top: RA = bị loại / bị đẩy (giới hạn chọn), VÀO = dòng được cứu / lấp chỗ.
const fs = require("fs");
const [A, Bf, OUT] = process.argv.slice(2);
const a = JSON.parse(fs.readFileSync(A, "utf8")), b = JSON.parse(fs.readFileSync(Bf, "utf8"));
const L = [], S = { runs: 0, err: 0, same: 0, order: 0, set: 0, allSame: 0, allDiff: 0, scoreDiff: 0, outDrop: 0, outOther: 0, inNoHint: 0, inHint: 0, topOut: 0, topIn: 0, topOutDropped: 0, topOutPushed: 0, topInRescued: 0, topInFill: 0, topInOther: 0, topOutOther: 0, ctrlWhyRows: 0 };
const ms = (rows) => { const m = new Map(); for (const [k, s] of rows) m.set(k, [...(m.get(k) || []), s].sort((x, y) => x - y)); return m; };
const unexplained = [];
// dropped trong do-gop-sd không mang r.a nên khoá dispDrop có ô máy phát rỗng: so bỏ trường thứ 3.
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
for (const k of Object.keys(a).sort()) {
  const x = a[k], y = b[k];
  S.runs++;
  if (!y || x.error || y.error) { S.err++; L.push(`${k} LỖI ${x.error || ""} ${y?.error || "thiếu ở nhánh"}`); continue; }
  for (const w of y.ctrlWhy || []) if (w) S.ctrlWhyRows++;
  const ma = ms(x.all), mb = ms(y.all), dropB = new Map((y.dispDrop || []).map((d) => [noAlt(d[0]), d]));
  const outAll = [], inAll = [], scoreCh = [];
  for (const [key, sa] of ma) {
    const sb = mb.get(key) || [];
    if (sb.length < sa.length) outAll.push([key, sa.length - sb.length]);
    if (sb.length && sb.length === sa.length && sb.join() !== sa.join()) scoreCh.push([key, sa, sb]);
  }
  for (const [key, sb] of mb) { const sa = ma.get(key) || []; if (sb.length > sa.length) inAll.push([key, sb.length - sa.length]); }
  const allChanged = outAll.length || inAll.length || scoreCh.length;
  allChanged ? S.allDiff++ : S.allSame++;
  S.scoreDiff += scoreCh.length;
  for (const [key] of outAll) dropB.has(noAlt(key)) ? S.outDrop++ : (S.outOther++, unexplained.push(`${k} RA all không thấy trong dispDrop: ${key}`));
  const hint = y.hints && (y.hints.minDisp != null || y.hints.maxDisp != null);
  for (const [key] of inAll) hint ? S.inHint++ : (S.inNoHint++, unexplained.push(`${k} VÀO all mà gói không đòi dung tích: ${key}`));
  for (const [key, sa, sb] of scoreCh) unexplained.push(`${k} ĐỔI ĐIỂM ${key}: ${sa} → ${sb}`);
  const ta = x.top, tb = y.top;
  if (ta.join("\n") === tb.join("\n")) { S.same++; if (!allChanged) continue; }
  const sa = new Set(ta), sb = new Set(tb);
  const out = ta.filter((r) => !sb.has(r)), inn = tb.filter((r) => !sa.has(r));
  if (!out.length && !inn.length && ta.join("\n") !== tb.join("\n")) S.order++;
  if (out.length || inn.length) S.set++;
  S.topOut += out.length; S.topIn += inn.length;
  const lines = [`== ${k} minDisp ${y.hints?.minDisp ?? "-"} maxDisp ${y.hints?.maxDisp ?? "-"} | top ${ta.length}→${tb.length} | all −${outAll.reduce((n, [, c]) => n + c, 0)} +${inAll.reduce((n, [, c]) => n + c, 0)}`];
  for (const r of out) {
    const d = dropB.get(noAlt(r));
    if (d) { S.topOutDropped++; lines.push(`  RA  ${r}  → LOẠI [${d[1]}] số đông ${d[2] ?? d[3] ?? "?"}`); }
    else if (mb.has(r)) { S.topOutPushed++; const i = ta.indexOf(r); lines.push(`  RA  ${r}  (hạng ${i}, điểm ${x.topScore[i]}) → bị đẩy, vẫn ở all (điểm ${mb.get(r)})`); }
    else { S.topOutOther++; lines.push(`  RA  ${r}  → ??? không trong all, không trong dispDrop`); unexplained.push(`${k} top RA không rõ: ${r}`); }
  }
  for (const r of inn) {
    const i = tb.indexOf(r);
    if (!ma.has(r)) { S.topInRescued++; lines.push(`  VÀO ${r}  (hạng ${i}, điểm ${y.topScore[i]}) → được cứu: gốc loại vì dung tích "mọi nguồn"`); }
    else if (ma.has(r)) { S.topInFill++; lines.push(`  VÀO ${r}  (hạng ${i}, điểm ${y.topScore[i]}) → lấp chỗ / được đẩy lên, đã ở all của gốc (điểm ${ma.get(r)})`); }
    else { S.topInOther++; }
  }
  if (out.length || inn.length || allChanged) L.push(lines.join("\n"));
}
const head = `Tổng: ${JSON.stringify(S, null, 1)}\nChưa giải thích: ${unexplained.length}\n${unexplained.slice(0, 200).join("\n")}`;
fs.writeFileSync(OUT, head + "\n\n" + L.join("\n"));
console.log(head.slice(0, 3000));
