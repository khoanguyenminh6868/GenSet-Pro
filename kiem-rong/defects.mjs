// Quét mẫu lỗi đọc ngưỡng trên toàn corpus (thr.json) và lỗi đổi đơn vị dung tích (catalog). node defects.mjs
import fs from "node:fs";
import * as L from "./lib.mjs";
const T = JSON.parse(fs.readFileSync(L.HERE + "/out/thr.json", "utf8"));
const runs = []; for (const f of fs.readdirSync(L.HERE + "/out").filter((f) => /^run-\d+\.jsonl$/.test(f))) for (const l of fs.readFileSync(L.HERE + "/out/" + f, "utf8").split("\n")) if (l.trim()) runs.push(JSON.parse(l));
const rm = new Map(runs.filter((r) => !r.error && !r.noCap).map((r) => [`${r.key}|${r.i}`, r]));
const out = { T1: [], T2: [], T4disp: [], T4cyl: [], T6: [] };
// T1: "< N lít" bị đọc là tối thiểu
for (const t of T) for (const c of t.cells.minDisp) if (/(?<![≤<]=?)<(?!=)\s*\d|(?<![≥>])<\s*\d/.test(c) && !/≥|>=|tối thiểu|ít nhất/i.test(c) && t.th1.minDisp != null) out.T1.push({ key: t.key, i: t.i, cap: t.cap, minDisp: t.th1.minDisp, cell: c.slice(0, 120) });
// T4: ô dung tích không có chữ xi lanh (bồn nhiên liệu...), ô xi lanh là số thứ tự hàng
for (const t of T) { for (const c of t.cells.minDisp) if (!/xi ?lanh|xy ?lanh|xilanh|cylinder|xylanh/i.test(c) && t.th1.minDisp != null) out.T4disp.push({ key: t.key, i: t.i, cap: t.cap, minDisp: t.th1.minDisp, cell: c.slice(0, 120) });
  for (const c of t.cells.minCyl) if (/^\s*\d{1,2}\s+(xi|xy)\s?lanh\s*,/i.test(c) && t.th1.minCyl != null) out.T4cyl.push({ key: t.key, i: t.i, cap: t.cap, minCyl: t.th1.minCyl, cell: c.slice(0, 120) }); }
// T2: minPrime lấy từ con số cạnh chữ dự phòng/standby mà không có nhãn prime gần hơn
const C = L.corpus(); const num = (v) => String(v).replace(".", "[.,]");
for (const t of T) { if (!t.th0.minPrime) continue; const e = C.get(t.key), v = t.th0.minPrime.kVA ?? t.th0.minPrime.kW, unit = t.th0.minPrime.kVA != null ? "kva" : "kw";
  const txt = L.B.unflatten(e.text).replace(/\s+/g, " "); const re = new RegExp(`(?<![\d.,])${num(v)}\s*${unit}`, "gi"); let m, bad = [], good = 0;
  while ((m = re.exec(txt))) { const before = txt.slice(Math.max(0, m.index - 60), m.index), after = txt.slice(m.index, m.index + 50);
    const P = /prime|li[êe]n t[ụu]c|continuous|c[ơo] b[ảa]n|định mức/i, S = /standby|d[ựu] ph[òo]ng|emergency/i;
    const pb = before.search(P) >= 0, sb = S.test(before), pa = P.test(after), sa = S.test(after);
    // "…Prime/180kVA dự phòng Standby": figure directly after "Prime/" and followed by standby word
    if (/prime\s*\/\s*$/i.test(before) && sa) bad.push(txt.slice(Math.max(0, m.index - 60), m.index + 50)); else if (pb || pa) good++; }
  if (bad.length && !good) out.T2.push({ key: t.key, i: t.i, cap: t.cap, minPrime: t.th0.minPrime, ctx: bad[0] }); }
// T6: dung tích > 100 L bị đọc là cc
const sups = L.loadSuppliers(), env = new L.Env(sups); const facts = L.B.modelFacts(env.full, sups);
const big = new Map();
for (const [k, fs_] of facts) { if (!k.startsWith("engine:")) continue; for (const f of fs_) if (f.key === "disp") { const n = Number(String(f.value).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/)?.[0]); if (n > 100 && n < 400 && !/cc|cm|ml/i.test(String(f.value) + f.label)) { const e = env.full.engines.find((x) => "engine:" + x.key === k); big.set(k, { engine: e?.model, make: e?.make, vals: [...(big.get(k)?.vals || []), String(f.value)] }); } } }
out.T6 = [...big.values()].map((x) => ({ ...x, vals: [...new Set(x.vals)].slice(0, 4) }));
fs.writeFileSync(L.HERE + "/out/defects.json", JSON.stringify(out, null, 1));
const eff = (arr) => arr.map((x) => { const r = rm.get(`${x.key}|${x.i}`); return r ? { ...x, nBand: r.nBand, nRows: r.nRows, top: r.topN, loạiDisp: r.dropBy.disp, loạiCyl: r.dropBy.cyl, loạiPrime: r.dropBy.prime } : x; });
for (const k of ["T1", "T2", "T4disp", "T4cyl"]) { console.log(`\n== ${k}: ${out[k].length} lượt, ${new Set(out[k].map((x) => x.key)).size} gói`); for (const x of eff(out[k]).slice(0, 40)) console.log(" ", JSON.stringify(x).slice(0, 330)); }
console.log("\n== T6 engine có dung tích >100 (không có cc):", out.T6.length); for (const x of out.T6.slice(0, 30)) console.log(" ", JSON.stringify(x));
process.exit(0);
