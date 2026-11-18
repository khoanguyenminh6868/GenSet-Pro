// node gopCl3.mjs <worktree mới> <ref cũ> <gop-cũ.json> <gop-mới.json> <tệp ra>
// So MỌI gói (lượt) của hai lần do-gop: tập top 30, thứ tự, số all / dropped, lỗi. Mỗi dòng vào / ra top được truy về bản ghi
// danh mục của dòng đó (NCC + chữ dòng, như rowKey của do-gop) ở hai bên: đổi trường nào, mất, mới có, hay không đổi (bị chen /
// lấp chỗ). Gói chỉ đổi thứ tự / all / dropped cũng in, kèm bản ghi đổi của các dòng trong top.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, REF, FA, FB, OUT] = process.argv.slice(2);
const SD = await import(pathToFileURL(path.join(WT, "suppliers", "spec-diff.mjs")).href);
const sa = SD.loadSide(SD.checkoutRef(REF, WT)), sb = SD.loadSide(WT);
const pw = (p) => (p ? ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k[0].toUpperCase()} ${p[k].kVA ?? "·"}/${p[k].kW ?? "·"}`).join(" ") : "∅");
const desc = (o) => `${o.kind} ${o.model} gen=${o.genset ?? "∅"} ${pw(o.power)} other=${o.other ?? "∅"} | ${(o.specs || []).map((s) => `${s.key}=${s.value}`).join(", ")}`;
// Khoá dòng như do-gop (bỏ engine / alt key): NCC | keyOf(chữ dòng).
const idx = ({ C, S }) => {
  const m = new Map();
  for (const s of S) {
    if (s.status === "incomplete") continue;
    for (const o of C.fromSupplier(s)) {
      const k = s.id + "|" + C.keyOf(o.line || (o.lines?.rows || []).join(" "));
      (m.get(k) || m.set(k, []).get(k)).push(desc(o));
    }
  }
  for (const v of m.values()) v.sort();
  return m;
};
const ia = idx(sa), ib = idx(sb);
const lineOf = (rk) => { const p = rk.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const recState = (rk) => {
  const k = lineOf(rk), o = ia.get(k), n = ib.get(k);
  if (!o && !n) return { c: "không thấy bản ghi (?)", d: "" };
  if (!o) return { c: "dòng mới có", d: "MỚI: " + n.join(" ¦ ") };
  if (!n) return { c: "dòng không còn", d: "CŨ: " + o.join(" ¦ ") };
  if (o.join("¦") === n.join("¦")) return { c: "bản ghi KHÔNG đổi", d: "" };
  const a = new Set(o), b = new Set(n);
  return { c: "bản ghi ĐỔI", d: "CŨ: " + o.filter((x) => !b.has(x)).join(" ¦ ") + "\n            MỚI: " + n.filter((x) => !a.has(x)).join(" ¦ ") };
};
const A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
const L = [], cls = {}, kinds = {};
let same = 0;
const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
for (const k of keys) {
  const x = A[k], y = B[k];
  if (!x || !y || x.error || y.error) { kinds["thiếu / lỗi"] = (kinds["thiếu / lỗi"] || 0) + 1; L.push(`\n== ${k}: cũ ${x ? x.error || "ok" : "không có"} | mới ${y ? y.error || "ok" : "không có"}`); continue; }
  const setA = new Set(x.top), setB = new Set(y.top);
  const ins = y.top.filter((r) => !setA.has(r)), outs = x.top.filter((r) => !setB.has(r));
  const order = !ins.length && !outs.length && x.top.join("\n") !== y.top.join("\n");
  const cnt = x.all !== y.all || x.dropped !== y.dropped;
  if (!ins.length && !outs.length && !order && !cnt) { same++; continue; }
  const kind = ins.length || outs.length ? "đổi tập top" : order ? "chỉ đổi thứ tự" : "chỉ đổi all / dropped";
  kinds[kind] = (kinds[kind] || 0) + 1;
  L.push(`\n== ${k} [${kind}] all ${x.all} → ${y.all}, dropped ${x.dropped} → ${y.dropped}, top ${x.top.length} → ${y.top.length}`);
  for (const [dir, list, src] of [["VÀO", ins, y.top], ["RA", outs, x.top]]) for (const r of list) {
    const s = recState(r);
    cls[`${dir}: ${s.c}`] = (cls[`${dir}: ${s.c}`] || 0) + 1;
    L.push(`   ${dir} hạng ${src.indexOf(r) + 1}: ${r.slice(0, 140)}\n         → ${s.c}${s.d ? "\n            " + s.d.slice(0, 900) : ""}`);
  }
  if (order) {
    const moved = y.top.map((r, i) => [r, x.top.indexOf(r), i]).filter(([, a, b]) => a !== b);
    for (const [r, a, b] of moved) L.push(`   hạng ${a + 1} → ${b + 1}: ${r.slice(0, 140)}`);
  }
  // Bản ghi đổi của các dòng trong top (cả hai bên): nguyên nhân đổi thứ tự / số all / dropped.
  const changedTop = [...new Set([...x.top, ...y.top])].map((r) => [r, recState(r)]).filter(([r, s]) => s.c !== "bản ghi KHÔNG đổi" && !ins.includes(r) && !outs.includes(r));
  for (const [r, s] of changedTop) L.push(`   (trong top cả hai) ${r.slice(0, 120)} → ${s.c}\n            ${s.d.slice(0, 600)}`);
}
const head = `gói (lượt): ${keys.length}; không đổi gì: ${same}\n${JSON.stringify(kinds)}\n${JSON.stringify(cls, null, 1)}`;
fs.writeFileSync(OUT, head + "\n" + L.join("\n") + "\n", "utf8");
console.log(head);
