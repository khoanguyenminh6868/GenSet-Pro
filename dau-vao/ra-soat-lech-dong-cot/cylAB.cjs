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
    // Khoá gopRow là NCC | dòng: hai dòng cùng chữ khác động cơ (cooltech-shanghai "PRIME POWER 80KW/100KVA": TAD531GE và
    // 6BT59G2) chung một khoá, bản ghi sau đè bản trước; ở nhánh dòng TAD531GE bị loại [cyl] nên khoá hiện dòng kia.
    const collide = x && y && x.eng !== y.eng;
    const c = cylNew && g ? "đổi: thêm luật [cyl] theo số đông" : collide ? "đổi: khoá NCC | dòng trùng hai động cơ (hiện dòng khác)" : "đổi: KHÁC";
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
    // Không bị loại, điểm không đổi: bị đẩy vì giới hạn chọn của candidates (PER_ENGINE 3, PER_SUPPLIER 4, MAKE_CAP 10): một dòng
    // VÀO cùng động cơ / NCC / hãng, điểm ≥, chiếm suất (NCC / hãng của nó vừa được nhả chỗ do dòng bị loại [cyl]).
    const sup = (rk) => rk.split("|")[0], mk = (m) => (m || "?").split(" / ")[0];
    const pusher = !ok && y && y.st !== "dropped" && y.score === x.score && ins.map((q) => [q, b.rows[q]]).find(([q, z]) => z.score >= x.score && (z.eng === x.eng || sup(q) === sup(r) || mk(z.make) === mk(x.make)));
    const why = pusher ? (pusher[1].eng === x.eng ? "cùng động cơ (PER_ENGINE 3)" : sup(pusher[0]) === sup(r) ? "cùng NCC (PER_SUPPLIER 4)" : "cùng hãng (MAKE_CAP 10)") : "";
    // NCC đã đủ PER_SUPPLIER (4) dòng ở nhánh: suất CN_ROWS (12 dòng hãng TQ chọn trước) lấp chỗ dòng TQ bị loại [cyl] bằng
    // dòng TQ điểm thấp hơn của chính NCC này (IB2200065274: fdk-energy SDEC 225/217/213/205 → ba dòng Cummins 284 hết suất).
    const full = !ok && !pusher && y && y.st !== "dropped" && y.score === x.score && tb.filter((q) => sup(q) === sup(r)).length >= 4;
    const c = ok ? "ra: loại [cyl] theo số đông" : pusher ? `ra: bị đẩy, giới hạn ${why}` : full ? "ra: bị đẩy, NCC đủ 4 dòng (PER_SUPPLIER) qua suất CN_ROWS" : "ra: KHÁC";
    add(c);
    console.log(`  RA  ${r.slice(0, 100)}\n      main top#${x.ti} điểm ${x.score} → nhánh ${y?.st} [${y?.ruled || ""}]; ${x.make} ${x.eng}; ${pusher ? `bị đẩy bởi ${pusher[0].slice(0, 70)} (${pusher[1].eng}, điểm ${pusher[1].score})` : gdesc(g)}`);
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
