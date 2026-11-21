// #1022 đo lần 2: giải thích dòng mất mới và mọi dòng đổi điểm. Chỉ số, không chữ HSMT. node giai-2.mjs <D>
import fs from "node:fs";
import path from "node:path";
const D = process.argv[2], R = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8")), T = R("giai-thich-3.json"), J = R("doi-chieu-2.json"), A = R("diem-goc.json"), B = R("diem-nhanh.json");
const out = [], p = (...a) => out.push(a.join(" ")), add = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n), top = (m, n = 40) => JSON.stringify([...m].sort((a, b) => b[1] - a[1]).slice(0, n));
const id = (x) => `${x.run}\t${x.k}`, byId = new Map(T.lost.map((x) => [id(x), x])), find = (k) => byId.get(k) || byId.get(k.slice(0, k.indexOf("\t") + 121));
const rows = J.newLost.map((k) => ({ k, x: find(k) })), miss = rows.filter((r) => !r.x), nrun = rows.filter((r) => r.x && r.x.ruled[0] === "(không thấy trong dropped)"), ok = rows.filter((r) => r.x && r.x.ruled[0] !== "(không thấy trong dropped)");
p("Mất mới:", rows.length, "| có luật loại:", ok.length, "| chạy lại không thấy bị loại:", nrun.length, "| không có bản ghi:", miss.length);
const rule = new Map(), sup = new Map(); for (const { x } of ok) { add(rule, x.ruled.join(",")); add(sup, x.sup); } p("Theo luật:", top(rule)); p("Theo NCC:", top(sup));
const fuelNum = (x, key) => { const f = (x.fuel || []).find((y) => y.k === key); const m = String(f?.v ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const LIM = { fuel: "maxFuel", fuel75: "maxFuel75", fuel50: "maxFuel50" }; let fOk = 0, fMulti = 0; const fBad = [];
for (const { x } of ok) for (const r of x.ruled) if (LIM[r]) { const v = fuelNum(x, r), l = x.lim[LIM[r]]; if (v != null && l != null && v > l) fOk++; else if (String((x.fuel || []).find((y) => y.k === r)?.v ?? "").includes("/")) fMulti++; else fBad.push(`${x.run} ${x.sup} ${x.model} ${r}=${v} ngưỡng ${l}`); }
p("Luật tiêu hao: số > ngưỡng", fOk, "| ô đa mức", fMulti, "| cần xem", fBad.length); fBad.slice(0, 30).forEach((y) => p("  ", y));
const geoRuns = new Map(); for (const { x } of ok) { const g = x.ruled.filter((r) => ["cyl", "layout", "disp", "maxDisp"].includes(r)); if (!g.length) continue; const k = `${x.run} cỡ ${x.lim.cap?.value}: ${g.join(",")} (minDisp ${x.lim.minDisp ?? "-"}, maxDisp ${x.lim.maxDisp ?? "-"}, minCyl ${x.lim.minCyl ?? "-"} exact ${x.lim.cylExact}) ${x.model}`; add(geoRuns, k); } p("\nLuật hình học, từng lượt + model:"); [...geoRuns].forEach(([k, n]) => p("  ", n, k));
const nr = new Map(); nrun.concat(miss).forEach(({ k }) => add(nr, `${k.split("\t")[0]} ${k.split("\t")[1].split("|").slice(0, 2).join(" ")}`)); p("\nKhông tái lập:"); [...nr].slice(0, 60).forEach(([k, n]) => p("  ", n, k));
let total = 0, okE = 0, okM = 0, okC = 0; const bad = [], lostFact = [];
for (const run of Object.keys(B)) { const a = new Map((A[run] || []).map((x) => [x[0], x])); for (const [k, s0, s1, keys1] of B[run]) { total++; const keys0 = a.get(k)?.[3] || [], d = s1 - s0, e = 8 * (Math.min(keys1.length, 8) - Math.min(keys0.length, 8)), rest = d - e; if (keys0.some((x) => !keys1.includes(x))) lostFact.push(`${run} ${k.slice(0, 50)}`); if (rest === 0) okE++; else if (rest === -300 && e === 0) okM++; else if (rest === -300) okC++; else bad.push(`${run} ${k.slice(0, 70)} ${s0}→${s1} kỳ vọng ${e} [${keys0.length}→${keys1.length}]`); } }
p("\nĐổi điểm:", total, "| +8k:", okE, "| −300:", okM, "| +8k−300:", okC, "| chưa giải thích:", bad.length, "| dòng mất loại thông số:", lostFact.length); bad.slice(0, 40).forEach((y) => p("  ", y));
const m3 = new Map(); for (const x of T.fuelMinus) add(m3, `${x.sup} ${x.model} ${(x.fuel || []).map((f) => `${f.k}=${f.v}`).join(" ").slice(0, 60)}`); p("\n−300 trong các lượt chạy lại:", T.fuelMinus.length, top(m3, 25));
fs.writeFileSync(path.join(import.meta.dirname, "giai-2.txt"), out.join("\n")); console.log(out.join("\n").slice(0, 15000));
