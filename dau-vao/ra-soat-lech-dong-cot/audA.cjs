// Soát bản ghi catalog đọc ra từ bảng NCC: kiểm số bằng quan hệ vật lý / số học, không dựa nhãn.
const fs = require("fs"), path = require("path");
const REPO = process.argv[2] || "C:/Projects/GenSet Pro/GenSet-Pro";
const { C, S } = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs")(REPO);
const nums = (v) => (String(v).replace(/(\d),(\d{3})(?!\d)/g, "$1$2").replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
const flags = [];
const near = (o, detail) => { const ks = [...new Set((String(detail).match(/\d+(?:[.,]\d+)?/g) || []).filter((x) => x.length >= 2))]; return (o.lines?.rows || []).filter((r) => ks.some((k) => String(r).includes(k)) || /prime|standby|备用|主用|常用|power|功率|output/i.test(r)).slice(0, 9).map((r) => String(r).slice(0, 260)); };
const flag = (code, o, detail) => flags.push({ code, near: o.line ? undefined : near(o, detail), title: String(o.title || "").slice(0, 90), sup: o.supplierId, n: o.n, table: o.table, row: o.row ?? null, kind: o.kind, model: o.model, genset: o.genset, detail, line: String(o.line || "").slice(0, 400), header: (o.header || o.lines?.header || []).map((h) => String(h).slice(0, 400)), width: o._w });
const spec = (o, k) => (o.specs || []).filter((x) => x.key === k);
const kWof = (p) => p && (p.kW || (p.kVA ? p.kVA * 0.8 : null));
let total = 0, withRow = 0; const widthStat = { same: 0, diff: 0, diffWithSpecs: 0, noHeader: 0 };
const checked = {}; const ck = (k) => (checked[k] = (checked[k] || 0) + 1);
const byEngine = new Map();
for (const s of S) {
  if (s.status === "incomplete") continue;
  for (const o of C.fromSupplier(s)) {
    total++;
    // bề rộng dòng so với tiêu đề
    if (o.row != null && o.line) {
      withRow++;
      const c = C.cellsOf(o.line).length, hs = (o.header || []).map((h) => C.cellsOf(h).length);
      if (!hs.length) { widthStat.noHeader++; o._w = "không tiêu đề"; }
      else if (hs.includes(c)) { widthStat.same++; o._w = "khớp"; }
      else { widthStat.diff++; o._w = `lệch ${c}/${hs.join(",")}`; if ((o.specs || []).length) widthStat.diffWithSpecs++; }
    }
    const P = o.power || {};
    // P1: cặp kW / kVA và prime / standby
    for (const r of ["prime", "standby", "rated"]) {
      const p = P[r]; if (!p || !p.kVA || !p.kW) continue; ck("pair");
      const q = p.kW / p.kVA;
      if (q > 1.001) flag("P1a kW > kVA (đảo cột?)", o, `${r}: ${p.kVA} kVA / ${p.kW} kW`);
      else if (q < 0.74 || (q > 0.86 && q < 0.999)) flag("P1b kW/kVA ngoài 0,8 và 1,0", o, `${r}: ${p.kVA} kVA / ${p.kW} kW = ${q.toFixed(3)}`);
    }
    if (P.prime && P.standby) {
      for (const u of ["kVA", "kW"]) {
        const a = P.prime[u], b = P.standby[u]; if (!a || !b) continue; ck("ps");
        if (a > b) flag("P2a prime > standby (đảo trước / sau?)", o, `${u}: prime ${a}, standby ${b}`);
        else if (b / a > 1.26) flag("P2b standby / prime > 1,26", o, `${u}: prime ${a}, standby ${b} = ${(b / a).toFixed(2)}`);
        else if (a === b) flag("P2c prime = standby", o, `${u}: ${a}`);
      }
    }
    const kW = kWof(P.prime) || kWof(P.rated) || (kWof(P.standby) ? kWof(P.standby) / 1.1 : null);
    // P3: tốc độ ↔ tần số
    for (const x of spec(o, "speed")) {
      const n = nums(x.value); ck("speed");
      const has50 = n.some((y) => [1500, 3000, 1000, 750].includes(y)), has60 = n.some((y) => [1800, 3600, 1200, 900].includes(y));
      if (!has50 && !has60) flag("P3a tốc độ không phải số vòng chuẩn", o, `${x.label} = ${x.value}`);
      else if (o.freq === 50 && has60 && !has50) flag("P3b 50 Hz mà tốc độ 1800/3600", o, `${x.label} = ${x.value}`);
      else if (o.freq === 60 && has50 && !has60) flag("P3b 60 Hz mà tốc độ 1500/3000", o, `${x.label} = ${x.value}`);
    }
    // P4: số xi lanh
    let cyl = null;
    for (const x of spec(o, "cyl")) {
      ck("cyl"); const n = nums(x.value).filter((y) => Number.isInteger(y) && y >= 1 && y <= 24);
      if (!n.length || ![1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 18, 20].includes(n[0])) flag("P4 số xi lanh lạ", o, `${x.label} = ${x.value}`);
      else if (cyl == null) cyl = n[0];
    }
    // P5: đường kính × hành trình × số xi lanh ↔ dung tích
    let bs = null;
    for (const x of spec(o, "bore")) {
      const n = nums(x.value).filter((y) => y >= 40 && y <= 500); ck("bore");
      if (n.length < 2) { flag("P5a đk×ht không đủ hai số", o, `${x.label} = ${x.value}`); continue; }
      const strokeFirst = /stroke.*bore|行程.*缸径/i.test(x.label);
      if (!bs) bs = strokeFirst ? [n[1], n[0]] : [n[0], n[1]];
    }
    let disp = null;
    for (const x of spec(o, "disp")) {
      const n = nums(x.value); if (!n.length) continue; ck("disp");
      const t = (x.label + " " + x.value).toLowerCase();
      let d = n[0]; if (/cc|ml|cm3|cm³|ccm/.test(t) || d >= 400) d /= 1000; else if (/in3|cu\.?\s*in|in³/.test(t)) d *= 0.016387;
      if (d < 0.2 || d > 120) { flag("P5b dung tích ngoài dải", o, `${x.label} = ${x.value}`); continue; }
      if (disp == null) disp = d;
    }
    if (bs && disp && cyl) {
      ck("physics");
      const calc = (b, st, c) => (Math.PI / 4) * b * b * st * c / 1e6, d0 = calc(bs[0], bs[1], cyl), e = d0 / disp;
      if (e < 0.94 || e > 1.06) {
        const sw = calc(bs[1], bs[0], cyl) / disp, alt = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 18, 20].find((c) => { const r = calc(bs[0], bs[1], c) / disp; return r > 0.96 && r < 1.04; });
        const why = sw > 0.96 && sw < 1.04 ? "đảo đường kính / hành trình" : alt ? `số xi lanh phải là ${alt}` : "dung tích hoặc đk×ht sai";
        flag("P5c đk×ht×xi lanh ≠ dung tích", o, `${bs[0]}×${bs[1]} × ${cyl} xl = ${d0.toFixed(2)} L, bảng ghi ${disp} L → ${why}`);
      }
    }
    // P6: công suất động cơ ↔ công suất tổ máy
    if (kW && !o.own) for (const x of spec(o, "engPower")) {
      const n = nums(x.value).filter((y) => y > 3); if (!n.length) continue; ck("engPower");
      let v = n[0]; if (/\bhp\b|马力|\bps\b/i.test(x.label + x.value) && !/kw/i.test(x.label + x.value)) v *= 0.7355;
      const m = Math.max(...n.slice(0, 2));
      if (m < kW * 0.93 || v > kW * 1.7) flag("P6 công suất động cơ không hợp tổ máy", o, `${x.label} = ${x.value}; tổ máy ~${Math.round(kW)} kW`);
    }
    // P7: tiêu hao ↔ công suất
    for (const k of ["fuel", "fuel75", "fuel50"]) for (const x of spec(o, k)) {
      const n = nums(x.value); if (!n.length) continue; ck("fuel");
      const t = (x.label + " " + x.value).toLowerCase(), v = n[0], f = k === "fuel" ? 1 : k === "fuel75" ? 0.75 : 0.5;
      const isG = /g\s*\/\s*\(?\s*kw|g\/kwh|g\/kw·h|克/.test(t), isL = /l\s*\/\s*h|lph|lit|升|l\/hr|ltr/.test(t), isGas = /m3|m³|nm|gas|燃气|mj|kj|btu/.test(t);
      if (isGas || /gal/.test(t) || /%/.test(x.value)) continue;
      if (isG) { if (v < 150 || v > 300) flag("P7a tiêu hao g/kWh ngoài 150–300", o, `${x.label} = ${x.value}`); continue; }
      if (!kW) continue;
      if (!isL && v >= 150 && v <= 300 && kW < 600) continue; // không đơn vị, giống g/kWh
      const r = v / (kW * f);
      if (r < 0.15 || r > 0.42) flag(isL ? "P7b tiêu hao L/h không hợp công suất" : "P7c tiêu hao (không đơn vị) không hợp công suất", o, `${x.label} = ${x.value}; ~${Math.round(kW)} kW × ${f} → ${r.toFixed(2)} L/kWh`);
    }
    // P8: các số có dải cố định
    for (const x of spec(o, "pf")) { const n = nums(x.value); ck("pf"); if (!n.length || !n.some((y) => (y >= 0.6 && y <= 1))) flag("P8a hệ số công suất lạ", o, `${x.label} = ${x.value}`); }
    for (const x of spec(o, "phase")) { const n = nums(x.value); ck("phase"); if (n.length && !n.some((y) => y === 1 || y === 3)) flag("P8b số pha lạ", o, `${x.label} = ${x.value}`); }
    for (const x of spec(o, "noise")) { const n = nums(x.value); ck("noise"); if (!n.length || !n.some((y) => y >= 45 && y <= 125)) flag("P8c độ ồn lạ", o, `${x.label} = ${x.value}`); }
    for (const x of spec(o, "compr")) { const n = nums(x.value); ck("compr"); if (!n.length || !n.some((y) => y >= 7 && y <= 26)) flag("P8d tỉ số nén lạ", o, `${x.label} = ${x.value}`); }
    for (const x of spec(o, "voltage")) { const n = nums(x.value); ck("voltage"); if (n.length && !n.some((y) => y >= 100 && y <= 15000) && !n.some((y) => y >= 3 && y <= 15 && /kv/i.test(x.label + x.value))) flag("P8e điện áp lạ", o, `${x.label} = ${x.value}`); }
    for (const x of spec(o, "current")) { const n = nums(x.value); if (!n.length || !P.prime?.kVA && !P.standby?.kVA && !P.rated?.kVA) continue; ck("current"); const kva = (P.prime || P.rated || P.standby).kVA, i400 = kva * 1000 / (Math.sqrt(3) * 400); if (!n.some((y) => y > i400 * 0.5 && y < i400 * 2.2) && kva > 5) flag("P8f dòng điện không hợp kVA", o, `${x.label} = ${x.value}; ${kva} kVA → ~${Math.round(i400)} A ở 400 V`); }
    // P9: khối lượng / kích thước
    const kva = (P.prime || P.rated || P.standby || {}).kVA || (kW ? kW / 0.8 : null);
    for (const x of spec(o, "weight")) {
      const n = nums(x.value); if (!n.length) continue; ck("weight");
      let w = n[0]; if (/\bt\b|tấn|吨|ton/i.test(x.label + " " + x.value) && w < 100) w *= 1000;
      if (w < 20) { flag("P9a khối lượng < 20", o, `${x.label} = ${x.value}`); continue; }
      if (kva && !o.own) { const r = w / kva; if (r < 2.5 || r > 90) flag("P9b khối lượng không hợp kVA", o, `${x.label} = ${x.value}; ${Math.round(kva)} kVA → ${r.toFixed(1)} kg/kVA`); }
    }
    for (const x of spec(o, "dims")) {
      const n = nums(x.value); ck("dims");
      if (n.length < 3) { flag("P9c kích thước không đủ ba số", o, `${x.label} = ${x.value}`); continue; }
      const d = n.slice(0, 3), mm = d.map((y) => (y < 30 ? y * 1000 : y < 300 && /cm/i.test(x.label + x.value) ? y * 10 : y));
      if (mm.some((y) => y < 200 || y > 20000)) flag("P9d kích thước ngoài dải", o, `${x.label} = ${x.value}`);
    }
    // gom theo động cơ để so giữa các NCC
    if (o.kind === "engine" && o.model) {
      const k = C.keyOf(o.model); if (!byEngine.has(k)) byEngine.set(k, []);
      byEngine.get(k).push({ o, kW: kWof(P.prime), kWs: kWof(P.standby), freq: o.freq, cyl, disp, bs });
    }
  }
}
// P10: cùng một động cơ, công suất tổ máy của một dòng lệch xa các NCC khác
for (const [k, list] of byEngine) {
  for (const f of ["kW", "kWs"]) {
    const v = list.filter((x) => x[f] && !x.o.own); const sups = new Set(v.map((x) => x.o.supplierId));
    if (sups.size < 4) continue;
    const sorted = v.map((x) => x[f]).sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)];
    for (const x of v) { ck("crossPower"); const r = x[f] / med; if (r < 0.6 || r > 1.6) flag("P10 công suất tổ máy lệch xa các NCC khác cùng động cơ", x.o, `${f === "kW" ? "prime" : "standby"} ${Math.round(x[f])} kW; trung vị ${Math.round(med)} kW của ${sups.size} NCC (${v.length} dòng)`); }
  }
  // số xi lanh / dung tích lệch số đông
  for (const f of ["cyl", "disp"]) {
    const v = list.filter((x) => x[f]); const cnt = new Map();
    for (const x of v) { const key = f === "disp" ? Math.round(x.disp * 10) / 10 : x.cyl; if (!cnt.has(key)) cnt.set(key, new Set()); cnt.get(key).add(x.o.supplierId); }
    if (cnt.size < 2) continue;
    const top = [...cnt].sort((a, b) => b[1].size - a[1].size);
    if (top[0][1].size < 3) continue;
    for (const x of v) { const key = f === "disp" ? Math.round(x.disp * 10) / 10 : x.cyl; const mine = cnt.get(key).size; ck("cross" + f); if (key !== top[0][0] && top[0][1].size >= 3 * mine && (f === "cyl" || Math.abs(key / top[0][0] - 1) > 0.08)) flag(`P11 ${f === "cyl" ? "số xi lanh" : "dung tích"} khác số đông cùng động cơ`, x.o, `${key} (${mine} NCC) ↔ ${top[0][0]} (${top[0][1].size} NCC)`); }
  }
}
const by = new Map(); for (const f of flags) { if (!by.has(f.code)) by.set(f.code, []); by.get(f.code).push(f); }
console.log("bản ghi:", total, "| có dòng bảng:", withRow, "| bề rộng:", JSON.stringify(widthStat));
console.log("số lần kiểm:", JSON.stringify(checked));
for (const [code, list] of [...by].sort()) {
  const sup = new Map(); for (const f of list) sup.set(f.sup, (sup.get(f.sup) || 0) + 1);
  const w = list.filter((f) => /^lệch/.test(f.width || "")).length;
  console.log(`\n### ${code}: ${list.length} (dòng lệch bề rộng: ${w}) | NCC ${sup.size}: ${[...sup].sort((a, b) => b[1] - a[1]).slice(0, 12).map((x) => x.join("×")).join(", ")}`);
}
fs.writeFileSync(path.join(__dirname, "audA.json"), JSON.stringify(flags, null, 0));
