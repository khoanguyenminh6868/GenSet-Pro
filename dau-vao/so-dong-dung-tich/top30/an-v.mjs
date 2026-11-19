// node an-v.mjs <worktree> <gop-nhanh.json> <do-v.json> <out.txt>
// 1. Kiểm do-v "off" trùng gop-nhanh (top, all, khoá dòng bị loại vì dung tích).
// 2. Lớp làm tròn (trên "off" = nhánh hiện tại): dòng bị loại mà trong các số của động cơ (src.vals) có số tương thích làm tròn
//    với giá trị thắng (roundCompat) đạt ngưỡng; tách riêng số chỉ khớp khi CẮT CỤT (không nhận). Nhóm theo (động cơ, luật, thắng,
//    ngưỡng, số tương thích).
// 3. V ("on") so "off": dòng được giữ lại (theo nhóm) / dòng mới bị loại / thay đổi top; với dòng được giữ: số chính xác nhất
//    của nhóm đạt ngưỡng ("đạt theo số chính xác") hay chỉ số làm tròn đạt ("Khoa quyết").
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, NH, DV, OUT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const nh = JSON.parse(fs.readFileSync(NH, "utf8")), dv = JSON.parse(fs.readFileSync(DV, "utf8"));
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const decs = (x) => { const s = String(x), i = s.indexOf("."); return i < 0 ? 0 : s.length - i - 1; };
const trunc = (p, d) => Math.trunc(p * 10 ** d + 1e-9) / 10 ** d;
const L = [];
// 1
let same = 0, diff = 0;
for (const [k, x] of Object.entries(dv)) {
  if (x.error) { L.push(`LỖI ${k} ${x.error}`); diff++; continue; }
  const y = nh[k], a = new Set((y.dispDrop || []).map((d) => noAlt(d[0]))), b = new Set(x.off.drop.map((d) => noAlt(d.k)));
  const ok = y.top.join("\n") === x.off.top.join("\n") && JSON.stringify(y.all) === JSON.stringify(x.off.all) && a.size === b.size && [...a].every((q) => b.has(q));
  ok ? same++ : (diff++, L.push(`off ≠ gop-nhanh: ${k}`));
}
L.unshift(`1. do-v off so gop-nhanh: ${same} lượt trùng, ${diff} lượt khác (trên ${Object.keys(dv).length} lượt có minDisp / maxDisp)`);
// 2 + 3
const pass = (rule, x, h) => (rule === "disp" ? x >= h.minDisp : x <= h.maxDisp * 1.005);
const gW = new Map(), gN = new Map(), g1 = new Map(), gT = new Map(), gRes = new Map(), gNew = new Map();
const add = (m, key, run) => { const o = m.get(key) || { rows: 0, runs: new Set() }; o.rows++; o.runs.add(run); m.set(key, o); };
let topCh = 0, topRuns = [], rescuedTop = 0, newTop = 0;
for (const [k, x] of Object.entries(dv)) {
  if (x.error) continue;
  const h = x.hints;
  for (const d of x.off.drop) for (const rule of d.ruled.filter((r) => r === "disp" || r === "maxDisp")) {
    const s = d[rule];
    if (!s?.vals || s.win == null) continue;
    const thr = rule === "disp" ? `≥ ${h.minDisp}` : `≤ ${h.maxDisp}`;
    const comp = s.vals.filter((v) => v !== s.win && B.roundCompat(v, s.win) && pass(rule, v, h));
    if (comp.length) add(g1, `${d.e}\t${rule}\tthắng ${s.win}\t${thr}\ttương thích đạt ${comp.join("/")}\tsố ${s.vals.join(",")}`, k);
    const tr = s.vals.filter((v) => v !== s.win && !B.roundCompat(v, s.win) && decs(v) > decs(s.win) && Math.abs(trunc(v, decs(s.win)) - s.win) < 1e-9 && pass(rule, v, h));
    if (tr.length) add(gT, `${d.e}\t${rule}\tthắng ${s.win}\t${thr}\tchỉ khớp khi cắt cụt ${tr.join("/")}\tsố ${s.vals.join(",")}`, k);
    const t = rule === "disp" ? h.minDisp : h.maxDisp;
    if (B.roundCompat(s.win, t)) add(gW, `${d.e}\t${rule}\tthắng ${s.win}\t${thr}\tsố ${s.vals.join(",")}`, k);
    else if (!comp.length && Math.abs(s.win - t) <= t * 0.03) add(gN, `${d.e}\t${rule}\tthắng ${s.win}\t${thr}\tsố ${s.vals.join(",")}`, k);
  }
  {
    const onK0 = new Set(x.on.drop.map((d) => noAlt(d.k)));
    for (const d of x.off.drop) {
      const rule = d.ruled.find((r) => r === "disp" || r === "maxDisp"), s = d[rule];
      if (!s?.vals || !onK0.has(noAlt(d.k))) continue;
      if (s.vals.some((v) => v !== s.win && B.roundCompat(v, s.win) && pass(rule, v, h))) L.push(`  V vẫn loại dù có số tương thích đạt: ${k} ${d.k} ${JSON.stringify(x.on.drop.find((o) => noAlt(o.k) === noAlt(d.k))[rule])}`);
    }
  }
  const onK = new Map(x.on.drop.map((d) => [noAlt(d.k), d])), offK = new Map(x.off.drop.map((d) => [noAlt(d.k), d]));
  const sTopOn = new Set(x.on.top.map(noAlt));
  for (const [q, d] of offK) if (!onK.has(q)) {
    const rule = d.ruled.find((r) => r === "disp" || r === "maxDisp"), s = d[rule] || {};
    // nhóm V của động cơ: lấy lại bằng majorityRound trên src.vals không được (thiếu phiếu) → dùng group của dòng cùng động
    // cơ ở "on" nếu có; không có thì ghi tập số tương thích với số thắng "off".
    const grp = (s.vals || []).filter((v) => B.roundCompat(v, s.win)), precise = grp.reduce((a, v) => (decs(v) > decs(a) ? v : a), s.win);
    const cls = pass(rule, precise, x.hints) ? "đạt theo số chính xác nhất" : "CHỈ số làm tròn đạt (Khoa quyết)";
    add(gRes, `${d.e}\t${rule}\tthắng off ${s.win}\t${rule === "disp" ? `≥ ${h.minDisp}` : `≤ ${h.maxDisp}`}\tnhóm ${grp.join("/")}\tchính xác nhất ${precise}\t${cls}`, k);
    if (sTopOn.has(q)) rescuedTop++;
  }
  for (const [q, d] of onK) if (!offK.has(q)) {
    const rule = d.ruled.find((r) => r === "disp" || r === "maxDisp"), s = d[rule] || {};
    add(gNew, `${d.e}\t${rule}\tthắng V ${s.win}\tnhóm ${(s.group || []).join("/")}\t${rule === "disp" ? `≥ ${h.minDisp}` : `≤ ${h.maxDisp}`}\tphiếu ${JSON.stringify(s.votes)}`, k);
    if (x.off.top.map(noAlt).includes(q)) newTop++;
  }
  if (x.off.top.join("\n") !== x.on.top.join("\n")) { topCh++; topRuns.push(k); }
}
const dump = (title, m) => {
  const rows = [...m.values()].reduce((n, o) => n + o.rows, 0);
  L.push(`\n${title}: ${m.size} nhóm, ${rows} dòng`);
  for (const [key, o] of [...m].sort((a, b) => b[1].rows - a[1].rows)) L.push(`  ${key}\t${o.rows} dòng / ${o.runs.size} lượt (${[...o.runs].slice(0, 4).join(" ")}${o.runs.size > 4 ? " …" : ""})`);
};
dump("2. Nhánh hiện tại: dòng bị loại mà có số TƯƠNG THÍCH LÀM TRÒN với số thắng đạt ngưỡng", g1);
dump("2b. Chỉ khớp khi CẮT CỤT (không nhận vào lớp làm tròn)", gT);
dump("2c. Số thắng là NGƯỠNG HSMT làm tròn (nguồn không ghi số chính xác hơn; V không đổi)", gW);
dump("2d. Còn lại: số thắng lệch ngưỡng ≤ 3% (loại đúng theo số)", gN);
dump("3a. V giữ lại (off loại, on không loại)", gRes);
dump("3b. V loại thêm (off không loại, on loại)", gNew);
L.push(`\n3c. Lượt top đổi giữa off và on: ${topCh} (${topRuns.join(" ")}); dòng được giữ mà vào top: ${rescuedTop}; dòng mới bị loại vốn ở top: ${newTop}`);
fs.writeFileSync(OUT, L.join("\n"));
console.log(L.filter((l) => !l.startsWith("  ")).join("\n"));
