// node cylWhy.cjs <gop gốc> <gop mới> <gopRow cũ> <gopRow mới> <winDiff.json>: lệch cột 9 (luật số đông số xi lanh).
// Với mỗi lượt đổi tập top 30: mọi dòng RA phải bị loại [cyl] ở bản mới mà bản cũ không loại [cyl], và động cơ phải có nhóm
// số xi lanh trong winDiff (giá trị thắng khác ít nhất một nguồn); mọi dòng VÀO phải đã có ở bản cũ (hạng sau 30) và
// điểm không đổi (lấp chỗ). In mọi dòng, đếm theo kết luận.
const fs = require("fs");
const [FA, FB, RA, RB, WD] = process.argv.slice(2);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const A = J(FA), B = J(FB), RowA = J(RA), RowB = J(RB), wd = J(WD);
const cylWin = new Map(wd.filter((g) => g.key === "cyl").map((g) => [g.ekey, g]));
// Khoá do-gop: NCC | động cơ | đầu phát | dòng; khoá gopRow: NCC | dòng.
const lineKey = (k) => { const p = k.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const eng = (k) => k.split("|")[1];
const tally = {};
const add = (c) => (tally[c] = (tally[c] || 0) + 1);
let runs = 0, same = 0, order = 0;
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k];
  if (!b || a.error || b.error) { console.log("LỖI", k); continue; }
  runs++;
  if (JSON.stringify(a.top) === JSON.stringify(b.top)) { same++; continue; }
  const sa = new Set(a.top), sb = new Set(b.top);
  const outs = a.top.filter((r) => !sb.has(r)), ins = b.top.filter((r) => !sa.has(r));
  if (!outs.length && !ins.length) { order++; continue; }
  const ra = RowA[k]?.rows, rb = RowB[k]?.rows;
  console.log(`\n== ${k} (ra ${outs.length}, vào ${ins.length})${ra ? "" : " — CHƯA CÓ gopRow"}`);
  if (!ra) continue;
  for (const r of outs) {
    const x = ra[lineKey(r)], y = rb[lineKey(r)], g = cylWin.get(eng(r));
    const ok = y?.st === "dropped" && (y.ruled || []).includes("cyl") && !(x?.ruled || []).includes("cyl") && g;
    const c = ok ? "ra: loại [cyl] theo số đông" : `ra: KHÁC (${y?.st} ${y?.ruled})`;
    add(c);
    console.log(`  RA  ${r.slice(0, 110)}\n      cũ ${x?.st}${x?.ti != null ? "#" + x.ti : ""} điểm ${x?.score} → mới ${y?.st} [${y?.ruled || ""}]; ${g ? `số đông xi lanh ${g.win} ${JSON.stringify(g.votes)}, nguồn khác: ${g.odd.map((o) => `${o.sid} «${o.value}»`).filter((v, i, s) => s.indexOf(v) === i).join(", ")}` : "KHÔNG có nhóm xi lanh trong winDiff"}`);
  }
  for (const r of ins) {
    const x = ra[lineKey(r)], y = rb[lineKey(r)];
    const ok = x && x.st === "all" && y && x.score === y.score;
    const c = ok ? "vào: lấp chỗ (điểm không đổi)" : `vào: KHÁC`;
    add(c);
    console.log(`  VÀO ${r.slice(0, 110)}\n      cũ ${x?.st} hạng ${x?.i} điểm ${x?.score} → mới ${y?.st}#${y?.ti} điểm ${y?.score}`);
  }
}
console.log(`\nLượt: ${runs}; giống hệt ${same}; chỉ đổi thứ tự ${order}; đổi tập ${runs - same - order}`);
console.log(tally);
