// node decomp.cjs > decomp.txt: lech-cot-9, tách gop-lech-cot-8 → gop-lech-cot-9 thành hai bước, cùng mã chọn ứng viên của main:
//   bước DỮ LIỆU: O (dữ liệu e0f51ec8 = lúc đo gốc 8, mã main b9d4f06d) → X (dữ liệu b9d4f06d, mã main)
//   bước LUẬT (d): X → N (dữ liệu b9d4f06d, mã nhánh lech-cot-9)
// O = rowDoi-main-cu.json (gopRow, mọi lượt đổi tập / thứ tự giữa gốc 8 và 9). X = rowCyl-main.json (lượt có minCyl) hoặc
// rowDoi-main-moi-nocyl.json. N = rowCyl-lc9.json (lượt có minCyl); lượt không minCyl thì N = X (nhánh chỉ khác main khi có minCyl).
// Kiểm trước: top của O khớp gop 8, top của N khớp gop 9 (khoá NCC | dòng). In MỌI dòng ra / vào của từng bước và kết luận.
const fs = require("fs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const G8 = J("gop-lech-cot-8.json"), G9 = J("gop-lech-cot-9.json");
// 18/11 16:30: lượt gopRow dữ liệu cũ đầu tiên bị ngắt (máy mất kết nối 16:17); đo lại chỉ các lượt bước dữ liệu đổi top
// (dataStep.cjs → keys-du-lieu.txt): rowDL-cu.json (dữ liệu e0f51ec8), rowDL-moi-nocyl.json (dữ liệu b9d4f06d, lượt không minCyl).
const O = J("rowDL-cu.json"), XC = J("rowCyl-main.json"), XN = J("rowDL-moi-nocyl.json"), NC = J("rowCyl-lc9.json");
const wd = J("winDiff.json"), cylWin = new Map(wd.filter((g) => g.key === "cyl").map((g) => [g.ekey, g]));
const keys = fs.readFileSync("keys-du-lieu.txt", "utf8").split(",");
const lineKey = (k) => { const p = k.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const topOf = (R) => Object.entries(R.rows).filter(([, r]) => r.st === "top").sort((a, b) => a[1].ti - b[1].ti).map(([k]) => k);
const sup = (rk) => rk.split("|")[0], line = (rk) => rk.split("|").slice(1).join("|");
const MERGE = { "starlight-power": "xingguang-jiangsu", "yingtai-group": "yingtai-jiangsu", kubota: "kubota-japan" };
const INTO = Object.fromEntries(Object.entries(MERGE).map(([a, b]) => [b, a]));
const T = {};
const add = (c, n = 1) => (T[c] = (T[c] || 0) + n);
const out = [];
const P = (s) => out.push(s);
let bad = 0;
for (const k of keys) {
  const o = O[k], x = XC[k] || XN[k], n = NC[k] || x;
  if (!o || !x) { P(`THIẾU gopRow ${k}`); bad++; continue; }
  const to = topOf(o), tx = topOf(x), tn = topOf(n);
  const g8 = G8[k].top.map(lineKey), g9 = G9[k].top.map(lineKey);
  if (JSON.stringify(to) !== JSON.stringify(g8)) { P(`KHÔNG KHỚP gốc 8 ${k}`); bad++; }
  if (JSON.stringify(tn) !== JSON.stringify(g9)) { P(`KHÔNG KHỚP gop 9 ${k}`); bad++; }
  // Số all / dropped lấy từ gop (gopRow gộp dòng trùng khoá NCC | dòng nên đếm thiếu).
  P(`\n== ${k}  (gop: all ${G8[k].all} → ${G9[k].all}, dropped ${G8[k].dropped} → ${G9[k].dropped})`);
  // all theo NCC đổi ở bước dữ liệu.
  const bySup = (R, st) => { const m = {}; for (const [rk, r] of Object.entries(R.rows)) if (st(r)) m[sup(rk)] = (m[sup(rk)] || 0) + 1; return m; };
  const sO = bySup(o, (r) => r.st !== "dropped"), sX = bySup(x, (r) => r.st !== "dropped");
  const dsup = [...new Set([...Object.keys(sO), ...Object.keys(sX)])].filter((s) => (sO[s] || 0) !== (sX[s] || 0)).map((s) => `${s} ${sO[s] || 0}→${sX[s] || 0}`);
  if (dsup.length) P(`  all theo NCC (dữ liệu): ${dsup.join(", ")}`);
  for (const s of Object.keys(sO)) if ((sO[s] || 0) !== (sX[s] || 0) && !MERGE[s] && !INTO[s] && !["denyo", "yanmar"].includes(s)) { add("all: NCC ngoài 8 tệp dữ liệu đổi số dòng (KHÁC)"); P(`  KHÁC: ${s} đổi số dòng all ở bước dữ liệu`); }
  // Bước dữ liệu.
  const step = (A, B, ta, tb, label) => {
    const sa = new Set(ta), sb = new Set(tb), outs = ta.filter((r) => !sb.has(r)), ins = tb.filter((r) => !sa.has(r));
    if (!outs.length && !ins.length) {
      if (JSON.stringify(ta) !== JSON.stringify(tb)) {
        const sc = (R, t) => t.map((r) => R.rows[r].score).join(",");
        const same = sc(A, ta) === sc(B, tb);
        const c = `${label}: chỉ đổi thứ tự, ${same ? "dãy điểm giữ nguyên (đổi chỗ trong nhóm cùng điểm)" : "dãy điểm KHÁC"}`;
        add(c); P(`  ${c}`);
        if (!same) for (let i = 0; i < ta.length; i++) if (ta[i] !== tb[i]) P(`    #${i} ${ta[i].slice(0, 70)} ${A.rows[ta[i]].score} ↔ ${tb[i].slice(0, 70)} ${B.rows[tb[i]].score}`);
      }
      return;
    }
    const renamed = new Set();
    for (const r of outs) {
      const a = A.rows[r], b = B.rows[r], s = sup(r);
      let c;
      if (MERGE[s] && B.rows[`${MERGE[s]}|${line(r)}`]) {
        const tw = `${MERGE[s]}|${line(r)}`, bt = B.rows[tw];
        if (sb.has(tw)) { renamed.add(tw); c = `${label} ra: ${s} gộp vào ${MERGE[s]}, cùng dòng ${bt.score === a.score ? "cùng điểm" : "ĐIỂM KHÁC"} vẫn trong top`; }
        else c = `${label} ra: ${s} gộp vào ${MERGE[s]}; bản ${MERGE[s]} ngoài top (${bt.st}${bt.i != null ? " hạng " + bt.i : ""}, điểm ${bt.score} / cũ ${a.score})`;
      } else if (MERGE[s]) c = `${label} ra: ${s} xoá, ${MERGE[s]} không có dòng này`;
      else if (b && b.st !== "dropped") c = `${label} ra: bị đẩy, ${b.score === a.score ? "điểm không đổi" : "ĐIỂM KHÁC"}`;
      else c = `${label} ra: KHÁC (${b?.st} [${b?.ruled || ""}])`;
      if (label === "LUẬT") {
        const g = cylWin.get(a.eng);
        c = b?.st === "dropped" && (b.ruled || []).includes("cyl") && !(a.ruled || []).includes("cyl") && g ? "LUẬT ra: loại [cyl] theo số đông" : c.replace("LUẬT ra:", "LUẬT ra: KHÁC,");
        P(`  ${c}: ${r.slice(0, 90)} top#${a.ti} điểm ${a.score} · ${a.make} ${a.eng} · ${g ? `số đông ${g.win} xi lanh ${JSON.stringify(g.votes)}, nguồn khác ${[...new Set(g.odd.map((q) => `${q.sid} «${q.value}»`))].join(", ")}` : "không có nhóm xi lanh"} · HSMT minCyl ${(XC[k] || {}).hints?.minCyl}${(XC[k] || {}).hints?.cylExact ? " (ghi trơ)" : ""}`);
      } else P(`  ${c}: ${r.slice(0, 90)} top#${a.ti} điểm ${a.score}`);
      add(c.replace(/ \(.*\)$/, "").replace(/hạng \d+/, ""));
    }
    for (const r of ins) {
      const a = A.rows[r], b = B.rows[r], s = sup(r);
      let c;
      if (renamed.has(r)) c = `${label} vào: cùng dòng mang id ${s} (gộp từ ${INTO[s]})`;
      else if (INTO[s] && A.rows[`${INTO[s]}|${line(r)}`] && !a) c = `${label} vào: dòng gộp từ ${INTO[s]} (bản cũ ${A.rows[`${INTO[s]}|${line(r)}`].st}${A.rows[`${INTO[s]}|${line(r)}`].i != null ? " hạng " + A.rows[`${INTO[s]}|${line(r)}`].i : ""}, điểm ${A.rows[`${INTO[s]}|${line(r)}`].score} → ${b.score})`;
      else if (!a) c = `${label} vào: dòng mới của dữ liệu (${s})`;
      else if (a.st !== "dropped" && a.score === b.score) c = `${label} vào: lấp chỗ, điểm không đổi`;
      else c = `${label} vào: KHÁC (cũ ${a.st} điểm ${a.score} → ${b.score})`;
      P(`  ${c}: ${r.slice(0, 90)} → top#${b.ti} điểm ${b.score}${a && a.i != null ? ` (hạng cũ ${a.i})` : ""}`);
      add(c.replace(/ \(.*\)$/, ""));
    }
  };
  step(o, x, to, tx, "DỮ LIỆU");
  // Bước luật đã kiểm đủ 402 lượt ở cylAB.cjs; ở đây chỉ in lại cho lượt chung.
  step(x, n, tx, tn, "LUẬT");
  // Mọi dòng đổi ở bước luật (cả ngoài top): phải là thêm [cyl].
  for (const rk of new Set([...Object.keys(x.rows), ...Object.keys(n.rows)])) {
    const a = x.rows[rk], b = n.rows[rk];
    if ((a?.st === "dropped") === (b?.st === "dropped") && String(a?.ruled) === String(b?.ruled) && a?.score === b?.score) continue;
    const ok = b?.st === "dropped" && (b.ruled || []).includes("cyl") && !(a?.ruled || []).includes("cyl") && cylWin.get(a?.eng);
    add(ok ? "LUẬT mọi dòng đổi: thêm [cyl] số đông" : "LUẬT mọi dòng đổi: KHÁC");
    if (!ok) P(`  LUẬT KHÁC dòng ${rk.slice(0, 90)} ${a?.st} ${a?.score} [${a?.ruled}] → ${b?.st} ${b?.score} [${b?.ruled}]`);
  }
}
P(`\nLượt: ${keys.length}; lỗi khớp: ${bad}`);
for (const [c, v] of Object.entries(T).sort()) P(`${String(v).padStart(5)}  ${c}`);
console.log(out.join("\n"));
