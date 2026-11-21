// Soát toàn bộ SỐ làm dòng bị loại: xi lanh, dung tích, tiêu hao so với chính dòng đó và NCC khác.
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new URL("./giai-thich.json", import.meta.url), "utf8"));
const out = [];
const p = (...a) => out.push(a.join(" "));
const num = (v) => { const m = String(v ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const show = (v) => (v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v));
const LIM = { fuel: "maxFuel", fuel75: "maxFuel75", fuel50: "maxFuel50" };
const FRAC = { fuel: 1, fuel75: 0.75, fuel50: 0.5 };
const lineKw = (x) => { const m = String(x.line || "").match(/(\d+(?:\.\d+)?)\s*kw\b/i); return m ? +m[1] : null; };
const lineKva = (x) => { const m = String(x.line || "").match(/(\d+(?:\.\d+)?)\s*kva\b/i); return m ? +m[1] : null; };

p("Mẫu cyl:", show(J.lost.find((x) => x.cyl && typeof x.cyl === "object")?.cyl));
p("Mẫu disp:", show(J.lost.find((x) => x.disp)?.disp));

// 1. Xi lanh / dung tích theo model
const byModel = new Map();
for (const x of J.lost) if ((x.ruled || []).some((r) => ["cyl", "layout", "disp", "maxDisp"].includes(r))) {
  const k = `${x.sup} | ${x.model}`;
  const e = byModel.get(k) || { n: 0, cyl: new Set(), disp: new Set(), rules: new Set(), lims: new Set() };
  e.n++; e.cyl.add(show(x.cyl)); e.disp.add(show(x.disp)); x.ruled.forEach((r) => e.rules.add(r));
  e.lims.add(`cyl${x.lim?.minCyl ?? "-"}${x.lim?.cylExact ? "=" : "+"}${x.lim?.cylLayout ?? ""} d${x.lim?.minDisp ?? "-"}..${x.lim?.maxDisp ?? "-"}`);
  byModel.set(k, e);
}
p("\n== Xi lanh / dung tích theo (NCC, model):", byModel.size);
for (const [k, e] of [...byModel].sort((a, b) => b[1].n - a[1].n))
  p(e.n, k, "| cyl", [...e.cyl].join(" ; "), "| disp", [...e.disp].join(" ; "), "|", [...e.rules].join(","), "|", [...e.lims].slice(0, 4).join(" , "));

// 2. Tiêu hao: suất L/kWh, so công suất dòng với HSMT, nếu quy về công suất HSMT thì còn vượt không
const fr = J.lost.filter((x) => (x.ruled || []).some((r) => LIM[r]));
const b = { thap: [], ok: 0, cao: [], noKw: 0 };
let bigger = 0, sameSize = 0, noCmp = 0, passIfScaled = 0;
const scaled = new Map();
for (const x of fr) {
  const kw = lineKw(x), kva = lineKva(x), cap = x.lim?.cap;
  for (const k of x.ruled) if (LIM[k]) {
    const f = (x.fuel || []).find((y) => y.k === k); if (!f) continue;
    const v = num(f.v); if (!kw || !v) { b.noKw++; continue; }
    const s = v / (kw * FRAC[k]);
    if (s < 0.17) b.thap.push(`${x.sup} ${x.model} ${k}=${v} @${kw}kW s=${s.toFixed(3)}`);
    else if (s > 0.42) b.cao.push(`${x.sup} ${x.model} ${k}=${v} @${kw}kW s=${s.toFixed(3)}`);
    else b.ok++;
  }
  const capKva = cap?.unit === "kVA" ? cap.value : cap?.unit === "kW" ? cap.value / 0.8 : null;
  if (!kva || !capKva) { noCmp++; continue; }
  if (kva > capKva * 1.02) {
    bigger++;
    const allPass = x.ruled.filter((k) => LIM[k]).every((k) => { const f = (x.fuel || []).find((y) => y.k === k); const v = f ? num(f.v) : null; return v != null && v * (capKva / kva) <= x.lim[LIM[k]]; });
    if (allPass) { passIfScaled++; scaled.set(x.sup, (scaled.get(x.sup) || 0) + 1); }
  } else sameSize++;
}
p("\n== Tiêu hao: dòng", fr.length);
p("Suất L/kWh hợp lý (0,17–0,42):", b.ok, "| thấp:", b.thap.length, "| cao:", b.cao.length, "| thiếu kW:", b.noKw);
p("Thấp (duy nhất):", [...new Set(b.thap)].slice(0, 40).join("\n  "));
p("Cao (duy nhất):", [...new Set(b.cao)].slice(0, 40).join("\n  "));
p("Dòng lớn hơn công suất HSMT >2%:", bigger, "| xấp xỉ bằng/nhỏ hơn:", sameSize, "| không so được:", noCmp);
p("Trong nhóm lớn hơn: nếu quy tỉ lệ về công suất HSMT thì mọi mức đều đạt:", passIfScaled, JSON.stringify([...scaled]));

// 3. Cùng model, NCC khác ghi tiêu hao khác nhau >10 %
const mf = new Map();
for (const x of fr) for (const f of x.fuel || []) { const v = num(f.v); if (!v) continue; const k = `${x.model}|${f.k}`; const m = mf.get(k) || new Map(); m.set(x.sup, v); mf.set(k, m); }
p("\n== Cùng model, các NCC lệch >10 %:");
for (const [k, m] of mf) { if (m.size < 2) continue; const a = [...m.values()]; if (Math.max(...a) / Math.min(...a) > 1.1) p(k, JSON.stringify([...m])); }

// 4. Nhãn "Fuel Consumption" không ghi mức tải
p("\n== Số có nhãn không tách mức tải:");
const gen = new Map();
for (const x of fr) for (const f of x.fuel || []) if (/^Fuel Consumption$/i.test(f.l)) { const k = `${x.sup} | ${x.model} | ${f.k} | ${f.v}`; gen.set(k, (gen.get(k) || 0) + 1); }
for (const [k, n] of gen) p(n, k);

// 5. Ngưỡng 1 xi lanh
fs.writeFileSync(new URL("./soat-so.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 16000));
