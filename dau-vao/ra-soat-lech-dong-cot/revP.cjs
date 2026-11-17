// Soát chéo công suất sau khi sửa: node revP.cjs <repo cũ> <repo mới> [tệp ra]
// 1) Mỗi bản ghi đổi: kiểm ĐỘC LẬP từng số (đơn vị, mức) bằng chữ ngay trong ô hoặc tiêu đề cùng bề rộng → "tự xác nhận".
// 2) Phần còn lại gom theo (kiểu tiêu đề × bề rộng dòng × kiểu đổi) để soát bằng mắt từng lớp.
// 3) Bất biến trên MỌI bản ghi mới: kW ≈ 0,8 kVA; prime ≤ standby.
const fs = require("fs"), path = require("path");
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [A, B, outFile = path.join(__dirname, "revP.txt")] = process.argv.slice(2);
const fmt = (p) => { if (!p) return "∅"; const one = (x) => (x ? `${x.kVA ?? "·"}/${x.kW ?? "·"}` : null); return ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k[0].toUpperCase()} ${one(p[k])}`).join("  ") || "∅"; };
const read = (repo) => { const { C, S } = load(repo); const m = new Map(); for (const s of S) { if (s.status === "incomplete") continue; const seen = new Map(); for (const o of C.fromSupplier(s)) { let k = [o.supplierId, o.n, o.table, o.row ?? "L", o.kind, o.model, o.genset ?? ""].join("|"); const c = seen.get(k) || 0; seen.set(k, c + 1); if (c) k += "#" + c; m.set(k, o); } } return { m, C }; };
const a = read(A), b = read(B), C = b.C;
const numOf = (c) => { const t = String(c).replace(/\s+/g, "").replace(/(kva|kwe?)$/i, ""); return /^\d+(?:[.,]\d+)?$/.test(t) ? Number(t.replace(",", ".")) : null; };
const U = (x) => { const s = String(x || "").replace(/g\s*\/\s*kw|kw\s*\.?\s*h|kwm|kwt/gi, " "); const k = /kva/i.test(s), w = /kwe?(?![a-z])/i.test(s); return k && !w ? "kVA" : w && !k ? "kW" : k && w ? "both" : null; };
const R = (x) => { const s = String(x || ""), p = /prime|primary|\bprp\b|常用|主用/i.test(s), q = /standby|stand-by|\besp\b|\bltp\b|backup|备用/i.test(s); return p && !q ? "prime" : q && !p ? "standby" : null; };
// xác nhận độc lập một số: tìm ô chứa số đó, đơn vị từ hậu tố ô hoặc tiêu đề cùng bề rộng (kể cả tiêu đề thiếu ô trống đầu)
function confirm(o, rate, unit, v) {
  const cells = C.cellsOf(o.line), hs = (o.header || []).map((h) => C.cellsOf(h));
  const res = { unit: false, rate: rate === "rated", cell: false };
  for (let j = 0; j < cells.length; j++) {
    const c = String(cells[j]).replace(/\s+/g, "");
    const inPair = c.match(/^(\d+(?:[.,]\d+)?)(kva|kwe?)?[\/／](\d+(?:[.,]\d+)?)(kva|kwe?)?$/i);
    const hit = numOf(c) === v || (inPair && [+inPair[1].replace(",", "."), +inPair[3].replace(",", ".")].includes(v));
    if (!hit) continue;
    res.cell = true;
    if (!inPair && U(c) === unit) res.unit = true;
    if (inPair) { const i = +inPair[1].replace(",", ".") === v ? 2 : 4; if (inPair[i] && U(inPair[i]) === unit) res.unit = true; }
    for (const h0 of hs) {
      const h = h0.length === cells.length ? h0 : !h0[0] && h0.length === cells.length + 1 ? h0.slice(1) : null; if (!h) continue;
      if (U(h[j]) === unit || (inPair && U(h[j]) === "both")) res.unit = true;
      if (R(h[j]) === rate) res.rate = true;
    }
  }
  return res;
}
const classes = new Map(); let auto = 0, changed = 0; const inv = [];
const sigH = (o) => (o.header || []).slice(0, 3).map((h) => C.cellsOf(h).map((x) => String(x).toLowerCase().replace(/\s+/g, "").slice(0, 14)).join("|")).join(" ⏎ ");
for (const [k, o] of b.m) {
  const P = o.power || {};
  // bất biến trên mọi bản ghi mới (cả bản ghi không đổi)
  if (o.row != null) {
    for (const r of ["prime", "standby", "rated"]) { const p = P[r]; if (p && p.kVA && p.kW) { const bad = p.kW > p.kVA * 1.001 || (Math.abs(p.kW - 0.8 * p.kVA) > Math.max(1.01, 0.025 * p.kVA) && Math.abs(p.kW - p.kVA) > 0.011 * p.kVA && Math.abs(p.kW - 0.9 * p.kVA) > 0.011 * p.kVA); if (bad) inv.push({ t: "pf", o, d: `${r} ${p.kVA}/${p.kW}` }); } }
    if (P.prime && P.standby) for (const u of ["kVA", "kW"]) if (P.prime[u] && P.standby[u] && (P.prime[u] > P.standby[u] || P.standby[u] > P.prime[u] * 1.26)) inv.push({ t: "ps", o, d: `${u} prime ${P.prime[u]} standby ${P.standby[u]}` });
  }
  const old = a.m.get(k); if (!old) continue;
  const pa = fmt(old.power), pb = fmt(o.power); if (pa === pb) continue;
  changed++;
  if (o.row == null || !o.line) { const ck = "BẢNG NHÃN " + o.supplierId; if (!classes.has(ck)) classes.set(ck, { n: 0, ex: [], sups: new Set(), header: [] }); const c = classes.get(ck); c.n++; c.sups.add(o.supplierId); if (c.ex.length < 3) c.ex.push(`${o.kind} ${o.model} | ${o.genset}  ⇒  ${pa}  →  ${pb}`); continue; }
  let ok = pb !== "∅";
  for (const r of ["prime", "standby", "rated"]) for (const u of ["kVA", "kW"]) { const v = P[r]?.[u]; if (v == null) continue; const c = confirm(o, r, u, v); if (!(c.cell && c.unit && c.rate)) ok = false; }
  if (ok) { auto++; continue; }
  const cells = C.cellsOf(o.line), kind = pb === "∅" ? "MẤT" : pa === "∅" ? "THÊM" : "ĐỔI";
  const ck = `${kind} · ${cells.length} ô · ${sigH(o)}`;
  if (!classes.has(ck)) classes.set(ck, { n: 0, ex: [], sups: new Set(), header: o.header || [] });
  const c = classes.get(ck); c.n++; c.sups.add(o.supplierId);
  const ei = cells.findIndex((x) => C.keyOf(x) === C.keyOf(o.model) || x === o.other);
  const line = `${(ei > 0 ? cells.slice(0, ei + 1) : cells.slice(0, 10)).map((x) => String(x).slice(0, 16)).join(" | ")}  ⇒  ${pa}  →  ${pb}`;
  if (c.ex.length < 2 || (c.n % 37 === 0 && c.ex.length < 4)) c.ex.push(line);
}
const out = [`đổi ${changed} | tự xác nhận độc lập (ô + đơn vị + mức đều có chữ làm chứng) ${auto} | còn ${changed - auto} bản ghi ở ${classes.size} lớp cần soát bằng mắt`, `bất biến vi phạm trên mọi bản ghi mới: pf ${inv.filter((x) => x.t === "pf").length}, prime/standby ${inv.filter((x) => x.t === "ps").length}`];
const cut = (h) => C.cellsOf(h).map((x) => String(x).slice(0, 22)).join(" | ").slice(0, 380);
let i = 0;
for (const [ck, c] of [...classes].sort((x, y) => y[1].n - x[1].n)) {
  out.push(`\n#${++i} ${ck.split(" · ").slice(0, 2).join(" · ")} ×${c.n} | ${[...c.sups].slice(0, 5).join(", ")}${c.sups.size > 5 ? ` +${c.sups.size - 5}` : ""}`);
  for (const h of c.header.slice(0, 3)) out.push("  H: " + cut(h));
  for (const e of c.ex) out.push("  R: " + e);
}
fs.writeFileSync(outFile, out.join("\n"), "utf8");
fs.writeFileSync(outFile.replace(/\.txt$/, "-inv.txt"), inv.map((x) => `${x.t} [${x.o.supplierId} n${x.o.n} d${x.o.row}] ${x.d} | ${String(x.o.line).slice(0, 150)}`).join("\n"), "utf8");
console.log(out[0]); console.log(out[1]); console.log("dòng in:", out.length);
