// Đếm riêng từng loại LỖI ĐỌC đã xác nhận bằng mẫu (không phải lỗi của nguồn).
const fs = require("fs"), path = require("path");
const REPO = process.argv[2] || "C:/Projects/GenSet Pro/GenSet-Pro";
const { C, S } = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs")(REPO);
const out = {}; const add = (code, o, detail) => (out[code] = out[code] || []).push({ sup: o.supplierId, n: o.n, row: o.row ?? null, kind: o.kind, model: o.model, genset: o.genset, detail, line: String(o.line || "").slice(0, 300), header: (o.header || []).slice(0, 3).map((h) => String(h).slice(0, 300)) });
const numOf = (c) => { const t = String(c).replace(/\s+/g, "").replace(/(kva|kw|kwe|kwm)$/i, ""); return /^\d+(?:[.,]\d+)?$/.test(t) ? Number(t.replace(",", ".")) : null; };
const POWERISH = /power|output|功率|\bkw\b|\bkva\b|prime|standby|主用|备用|常用/i;
let rowRecs = 0, pairsAdj = 0, pairsCell = 0, total = 0;
const role = new Map();
for (const s of S) {
  if (s.status === "incomplete") continue;
  const recs = C.fromSupplier(s);
  for (const o of recs) {
    total++;
    const k = C.keyOf(o.model || ""); if (k) { if (!role.has(k)) role.set(k, { engine: new Map(), alternator: new Map() }); const m = role.get(k)[o.kind]; if (m) { if (!m.has(o.supplierId)) m.set(o.supplierId, o); } }
    // B2: "model" không phải mã máy
    if (/stroke|cylinder|phase|diesel$|^\d+\s*(kw|kva|hp|rpm|v|hz)\b/i.test(String(o.model || ""))) add("B2 model không phải mã máy", o, `model = "${o.model}", tổ máy = "${o.genset}", công suất ${JSON.stringify(o.power)}`);
    if (o.row == null || !o.line) {
      // B6: bảng nhãn | giá trị: công suất lấy từ dòng "Starting power" hoặc trộn nhiều model
      const rows = o.lines?.rows || [];
      const P = o.power || {};
      for (const r of ["prime", "standby", "rated"]) {
        const p = P[r]; if (!p) continue;
        const hit = rows.find((l) => /starting power|start(er)? motor|启动电机|起动电机|heater|charger|充电/i.test(l) && [p.kW, p.kVA].some((v) => v != null && String(l).replace(",", ".").includes(String(v))));
        if (hit && !rows.some((l) => !/start|heater|charger/i.test(l) && /power|output|功率/i.test(l) && [p.kW, p.kVA].some((v) => v != null && String(l).replace(",", ".").includes(String(v))))) add("B6a công suất lấy từ dòng không phải công suất tổ máy", o, `${r} ${JSON.stringify(p)} ← "${String(hit).slice(0, 120)}"`);
        if (p.kVA && p.kW) { const q = p.kW / p.kVA; const same = rows.some((l) => { const t = String(l).replace(/,/g, "."); return t.includes(String(p.kVA)) && t.includes(String(p.kW)); }); if ((q > 1.001 || q < 0.74 || (q > 0.86 && q < 0.999)) && !same) add("B6b cặp kVA / kW ghép từ hai dòng khác nhau", o, `${r} ${p.kVA} kVA / ${p.kW} kW`); else if ((q > 1.001 || q < 0.74 || (q > 0.86 && q < 0.999)) && same) add("N1 nguồn ghi cặp kVA / kW lạ trong cùng một dòng", o, `${r} ${p.kVA} kVA / ${p.kW} kW`); }
      }
      if (P.prime && P.standby) for (const u of ["kVA", "kW"]) if (P.prime[u] && P.standby[u] && P.prime[u] > P.standby[u]) add("B6c prime > standby ở bảng nhãn | giá trị", o, `${u}: prime ${P.prime[u]}, standby ${P.standby[u]}`);
      continue;
    }
    rowRecs++;
    const cells = C.cellsOf(o.line), hs = (o.header || []).map((h) => C.cellsOf(h));
    const P = o.power || {};
    // B1: cặp kVA / kW ghép từ hai ô kề nhau
    for (const r of ["prime", "standby", "rated"]) {
      const p = P[r]; if (!p || !p.kVA || !p.kW) continue;
      const inCell = cells.some((c) => { const m = String(c).replace(/\s+/g, "").replace(/(kva|kw)/gi, "").match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/); return m && [+m[1], +m[2]].includes(p.kVA) && [+m[1], +m[2]].includes(p.kW); });
      const q = p.kW / p.kVA, odd = Math.abs(p.kW - 0.8 * p.kVA) > Math.max(1.01, 0.025 * p.kVA) && Math.abs(p.kW - p.kVA) > 0.01 && Math.abs(p.kW - 0.9 * p.kVA) > 0.011 * p.kVA;
      const orderLbl = (o.header || []).join(" ").match(/[（(]\s*(主用|常用|prime)\s*[/／]\s*(备用|standby)\s*[)）]/i);
      if (inCell && orderLbl && odd) { add("B1e một ô \"a/b\" là prime / standby cùng đơn vị, bị đọc thành kVA / kW", o, `${r} ${p.kVA} kVA / ${p.kW} kW; tiêu đề ghi "${orderLbl[0]}"`); continue; }
      if (inCell) { pairsCell++; if (odd && (q < 0.74 || q > 0.86)) add("N1 nguồn ghi cặp kVA / kW lạ trong cùng một ô", o, `${r} ${p.kVA} kVA / ${p.kW} kW`); continue; }
      const i = cells.findIndex((c, j) => j + 1 < cells.length && [p.kVA, p.kW].includes(numOf(c)) && [p.kVA, p.kW].includes(numOf(cells[j + 1])) && numOf(c) !== numOf(cells[j + 1]));
      if (i < 0) continue;
      pairsAdj++;
      const a = cells[i], b = cells[i + 1], unit = (x) => (/kva/i.test(x) ? "kVA" : /kw/i.test(x) ? "kW" : null);
      const h = hs.find((x) => x.length === cells.length), ta = h?.[i] || "", tb = h?.[i + 1] || "";
      const tu = (x) => (/kva/i.test(x) && !/kw/i.test(x) ? "kVA" : /kw/i.test(x) && !/kva/i.test(x) ? "kW" : null);
      const sameUnit = (unit(a) && unit(a) === unit(b)) || (tu(ta) && tu(ta) === tu(tb));
      const notPower = h && [ta, tb].some((x) => x && !POWERISH.test(x) && /freq|hz|频率|current|电流|weight|重量|净重|volt|电压|heat|kwt|rpm|转速|缸/i.test(x));
      const freqCell = [a, b].some((x) => /^(50|60)(\s*hz)?$/i.test(String(x).trim())) && hs.some((x) => x.some((t) => /freq|hz|频率/i.test(t)));
      if (sameUnit) add("B1a ghép hai ô CÙNG đơn vị thành cặp kVA / kW", o, `${r} ${p.kVA} kVA / ${p.kW} kW ← "${a}" | "${b}"${h ? ` dưới "${ta}" | "${tb}"` : ""}`);
      else if (notPower) add("B1b ghép ô không phải công suất (tần số, dòng điện, khối lượng…) thành cặp", o, `${r} ${p.kVA} kVA / ${p.kW} kW ← "${a}" | "${b}" dưới "${ta}" | "${tb}"`);
      else if (freqCell && odd) add("B1c nghi ô tần số 50 / 60 bị đọc thành công suất", o, `${r} ${p.kVA} kVA / ${p.kW} kW ← "${a}" | "${b}"`);
      else if (odd) add("B1d cặp từ hai ô kề, tỉ số không phải 0,8 (nghi ghép lệch)", o, `${r} ${p.kVA} kVA / ${p.kW} kW = ${q.toFixed(3)} ← "${a}" | "${b}"`);
    }
    // B8: giá trị lấy theo tiêu đề đếm từ trái trong dòng rộng hơn tiêu đề, sau một tiêu đề công suất (tiêu đề phủ hai ô)
    for (const sp of o.specs || []) {
      const js = cells.map((c, j) => (String(c).trim() === String(sp.value).trim() ? j : -1)).filter((j) => j >= 0);
      if (js.length !== 1) continue; const j = js[0];
      for (const h of hs) {
        if (h.length >= cells.length || h[j] !== sp.label) continue;
        const k = cells.length - h.length, ei = cells.findIndex((c) => C.keyOf(c) === C.keyOf(o.kind === "engine" ? o.model : o.other || ""));
        const right = h[j - k] === sp.label;
        const spans = h.slice(0, j).filter((t) => POWERISH.test(t) && !/engine|发动机|柴油机|alternator|发电机(?!组)/i.test(t)).length;
        const sub = hs.some((x) => x !== h && x.filter((t) => /^\(?\s*(kw|kva|prime|standby|主用|备用|常用|额定)\)?$/i.test(t.trim())).length >= 2);
        if (!right && spans && sub && j > 1 && (ei < 0 || j < ei)) add("B8 lệch cột: tiêu đề hai tầng, giá trị lấy theo cột đếm từ trái", o, `${sp.key} "${sp.label}" = "${sp.value}" (ô thứ ${j + 1}; dòng ${cells.length} ô, tiêu đề ${h.length} ô)`);
      }
    }
  }
}
// B4: một mã vừa là động cơ vừa là đầu phát
for (const [k, r] of role) {
  const e = r.engine.size, a = r.alternator.size; if (!e || !a) continue;
  const minor = e * 3 <= a && a >= 3 ? "engine" : a * 3 <= e && e >= 3 ? "alternator" : null;
  if (minor) for (const o of r[minor].values()) add(`B4 mã bị đọc thành ${minor === "engine" ? "động cơ" : "đầu phát"}, đa số NCC ghi là ${minor === "engine" ? "đầu phát" : "động cơ"}`, o, `${o.model}: động cơ ở ${e} NCC, đầu phát ở ${a} NCC`);
  else for (const o of [...r.engine.values()].slice(0, 1)) add("B4x mã vừa là động cơ vừa là đầu phát, chưa rõ bên nào đúng", o, `${o.model}: động cơ ở ${e} NCC, đầu phát ở ${a} NCC`);
}
console.log("bản ghi", total, "| từ dòng bảng", rowRecs, "| cặp kVA/kW trong một ô", pairsCell, "| cặp từ hai ô kề", pairsAdj);
for (const [code, list] of Object.entries(out).sort()) {
  const sup = new Map(); for (const f of list) sup.set(f.sup, (sup.get(f.sup) || 0) + 1);
  console.log(`\n### ${code}: ${list.length} bản ghi | ${sup.size} NCC: ${[...sup].sort((a, b) => b[1] - a[1]).slice(0, 14).map((x) => x.join("×")).join(", ")}`);
  const seen = new Set();
  for (const f of list) { if (seen.has(f.sup) || seen.size >= 4) continue; seen.add(f.sup); console.log(`  [${f.sup} n${f.n}] ${f.kind} ${f.model} | ${f.genset} → ${f.detail}`); if (f.line) { for (const h of f.header.slice(0, 2)) console.log("     H:", h.slice(0, 240)); console.log("     R:", f.line.slice(0, 240)); } }
}
fs.writeFileSync(path.join(__dirname, "audB.json"), JSON.stringify(out));
