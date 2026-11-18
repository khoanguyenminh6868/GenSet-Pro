// node cylAB.cjs <gopRow main> <gopRow nhánh> <winDiff.json>: lech-cot-9, hai bản cùng dữ liệu suppliers/cn, chỉ các lượt có minCyl.
// Mọi dòng RA khỏi top 30: phải bị loại [cyl] ở nhánh, main không loại [cyl], động cơ có nhóm số xi lanh trong winDiff. Mọi dòng
// VÀO: đã có ở main ngoài top, điểm không đổi (lấp chỗ). Thêm: mọi dòng mà st / điểm / luật đổi (kể cả ngoài top 30) đều in ra.
const fs = require("fs");
const [RA, RB, WD] = process.argv.slice(2);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const A = J(RA), B = J(RB), wd = J(WD);
const cylWin = new Map(wd.filter((g) => g.key === "cyl").map((g) => [g.ekey, g]));
const tally = {};
const add = (c) => (tally[c] = (tally[c] || 0) + 1);
const topOf = (R) => Object.entries(R.rows).filter(([, r]) => r.st === "top").sort((a, b) => a[1].ti - b[1].ti).map(([k]) => k);
const gdesc = (g) => (g ? `số đông xi lanh ${g.win} ${JSON.stringify(g.votes)}; nguồn khác: ${[...new Set(g.odd.map((o) => `${o.sid} «${o.value}»`))].join(", ")}` : "KHÔNG có nhóm xi lanh trong winDiff");
let runs = 0, same = 0, order = 0, setc = 0, nOut = 0, nIn = 0;
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k];
  if (!b) { console.log("THIẾU", k); continue; }
  runs++;
  const ta = topOf(a), tb = topOf(b);
  // Mọi dòng đổi trạng thái loại / luật / điểm (cả ngoài top).
  const changed = [];
  for (const rk of new Set([...Object.keys(a.rows), ...Object.keys(b.rows)])) {
    const x = a.rows[rk], y = b.rows[rk];
    const dx = x?.st === "dropped", dy = y?.st === "dropped";
    if (dx !== dy || String(x?.ruled) !== String(y?.ruled) || (!dx && !dy && x?.score !== y?.score)) changed.push([rk, x, y]);
  }
  for (const [rk, x, y] of changed) {
    const g = cylWin.get(y?.eng || x?.eng);
    const cylNew = (y?.ruled || []).includes("cyl") && !(x?.ruled || []).includes("cyl");
    const c = cylNew && g ? "đổi: thêm luật [cyl] theo số đông" : "đổi: KHÁC";
    add(c);
    if (c.includes("KHÁC") || !ta.includes(rk)) console.log(`  ${c} ${k} ${rk.slice(0, 90)}  ${x?.st}${x?.ti ?? ""} ${x?.score} [${x?.ruled || ""}] → ${y?.st}${y?.ti ?? ""} ${y?.score} [${y?.ruled || ""}]${c.includes("KHÁC") ? " " + gdesc(g) : ""}`);
  }
  if (JSON.stringify(ta) === JSON.stringify(tb)) { same++; continue; }
  const sa = new Set(ta), sb = new Set(tb);
  const outs = ta.filter((r) => !sb.has(r)), ins = tb.filter((r) => !sa.has(r));
  if (!outs.length && !ins.length) { order++; console.log(`\n== ${k}: chỉ đổi thứ tự`); continue; }
  setc++; nOut += outs.length; nIn += ins.length;
  console.log(`\n== ${k} (ra ${outs.length}, vào ${ins.length})`);
  for (const r of outs) {
    const x = a.rows[r], y = b.rows[r], g = cylWin.get(x.eng);
    const ok = y?.st === "dropped" && (y.ruled || []).includes("cyl") && !(x?.ruled || []).includes("cyl") && g;
    const c = ok ? "ra: loại [cyl] theo số đông" : "ra: KHÁC";
    add(c);
    console.log(`  RA  ${r.slice(0, 100)}\n      main top#${x.ti} điểm ${x.score} → nhánh ${y?.st} [${y?.ruled || ""}]; ${x.make} ${x.eng}; ${gdesc(g)}`);
  }
  for (const r of ins) {
    const x = a.rows[r], y = b.rows[r];
    const ok = x && x.st === "all" && x.score === y.score;
    const c = ok ? "vào: lấp chỗ (điểm không đổi)" : "vào: KHÁC";
    add(c);
    console.log(`  VÀO ${r.slice(0, 100)}\n      main ${x?.st} hạng ${x?.i} điểm ${x?.score} → nhánh top#${y.ti} điểm ${y.score}`);
  }
}
console.log(`\nLượt có minCyl: ${runs}; top giống hệt ${same}; chỉ đổi thứ tự ${order}; đổi tập ${setc} (ra ${nOut}, vào ${nIn})`);
console.log(tally);
