import fs from "node:fs";
import * as L from "./lib.mjs";
const R = []; for (const f of fs.readdirSync(L.HERE + "/out").filter((f) => /^run-\d+\.jsonl$/.test(f))) for (const l of fs.readFileSync(L.HERE + "/out/" + f, "utf8").split("\n")) if (l.trim()) R.push(JSON.parse(l));
const ok = R.filter((r) => !r.error && !r.noCap), kva = (c) => (c.unit === "kVA" ? c.value : c.value / 0.8);
const risk = ok.filter((r) => r.old.nBand > 0 && r.nRows < 5);
const band = risk.filter((r) => r.nBand < 5), thr = risk.filter((r) => r.nBand >= 5);
console.log("rủi ro:", risk.length, "| do dải (nBand<5):", band.length, "| do ngưỡng (nBand>=5):", thr.length);
const sz = (r) => kva(r.cap) <= 20 ? "<=20" : kva(r.cap) <= 100 ? "21-100" : "101+";
for (const [n, g] of [["dải", band], ["ngưỡng", thr]]) { const t = {}; for (const r of g) t[sz(r)] = (t[sz(r)] || 0) + 1; console.log(n, t); }
// khoảng cách gần nhất
const nearAbove = band.map((r) => r.above).filter((x) => x), nearBelow = band.map((r) => r.below).filter((x) => x);
console.log("dòng gần nhất ở trên dải (>120%): min", Math.min(...nearAbove), "median", nearAbove.sort((a, b) => a - b)[Math.floor(nearAbove.length / 2)], "| dưới dải: max", Math.max(...nearBelow));
const trueZero = ok.filter((r) => r.nRows === 0 || r.topN === 0);
const bigCap = trueZero.filter((r) => kva(r.cap) > 20000);
console.log("top=0:", trueZero.length, "| cỡ >20.000 kVA (đọc sai công suất/ngoài catalog):", bigCap.length, "| còn lại:", trueZero.filter((r) => kva(r.cap) <= 20000).map((r) => `${r.key} ${r.cap.value}${r.cap.unit} cũ=${r.old.nBand} mới=${r.nBand}`).join("; "));
const smallBand = ok.filter((r) => kva(r.cap) <= 20); const t2 = { "0": 0, "1-9": 0, "10-29": 0, ">=30": 0 }; const t3 = { ...t2 };
const bin = (n) => (n === 0 ? "0" : n < 10 ? "1-9" : n < 30 ? "10-29" : ">=30"); for (const r of smallBand) { t2[bin(r.old.nBand)]++; t3[bin(r.nBand)]++; }
console.log("cỡ ≤20 kVA:", smallBand.length, "dải cũ", t2, "dải mới", t3);
const big = ok.filter((r) => kva(r.cap) > 20); const t4 = { ...t2 }, t5 = { ...t2 }; for (const r of big) { t4[bin(r.old.nBand)]++; t5[bin(r.nBand)]++; } console.log("cỡ >20 kVA:", big.length, "cũ", t4, "mới", t5);
// tổng xếp hạng
const pk = ok.filter((r) => r.nBand > 0 && r.old.nBand > 0); const rat = pk.map((r) => r.nBand / r.old.nBand).sort((a, b) => a - b); console.log("tỉ lệ dòng trong dải mới/cũ: median", rat[Math.floor(rat.length / 2)].toFixed(2), "p10", rat[Math.floor(rat.length * 0.1)].toFixed(2), "p90", rat[Math.floor(rat.length * 0.9)].toFixed(2));
// danh sách cỡ ≥21 kVA trong risk
for (const r of risk.filter((r) => kva(r.cap) > 20)) console.log(`  ${r.key} ${r.cap.value}${r.cap.unit} cũ=${r.old.nBand} mớiTrongDải=${r.nBand} sauNgưỡng=${r.nRows} top=${r.topN} dưới=${r.below} trên=${r.above} loại=${JSON.stringify(r.dropBy)}`);
process.exit(0);
