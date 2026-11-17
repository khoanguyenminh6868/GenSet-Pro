// Định lượng ảnh hưởng của từng lỗi đọc ngưỡng: chạy lại candidates() với ngưỡng đã sửa tay (chỉ để đo, không sửa mã).
import fs from "node:fs";
import * as L from "./lib.mjs";
const C = L.corpus(), env = new L.Env(L.loadSuppliers());
const ne = (e) => `${e.e.make || "?"} ${e.e.model}`;
function run(key, i, patch, label) {
  const e = C.get(key), { runs } = L.sizesOfEntry(e), r = runs.find((x) => x.i === i) || runs[0];
  const cap = r.cap, hf = (t, x) => ({ ...L.B.hintsOf(t, x), ...patch });
  const base = env.prep(e, cap), fix = env.prep(e, cap, { hintsFn: hf });
  const drops = (P) => { const t = {}; for (const d of P.dropped) for (const k of d.ruled) t[k] = (t[k] || 0) + 1; return t; };
  const eng = (P) => new Set(P.top.map((x) => x.e.key));
  const lost = [...eng(base)].filter((k) => !eng(fix).has(k)).length, gain = [...eng(fix)].filter((k) => !eng(base).has(k)).length;
  const baseRows = new Set(base.all.map((x) => `${x.u.supplierId}|${x.e.key}`)), fixRows = new Set(fix.all.map((x) => `${x.u.supplierId}|${x.e.key}`));
  const back = [...fixRows].filter((k) => !baseRows.has(k)).length;
  console.log(`${label} | ${key} cỡ ${cap.value}${cap.unit}: hiện tại nRows=${base.all.length} top=${base.top.length} loại=${JSON.stringify(drops(base))} | sửa tay: nRows=${fix.all.length} top=${fix.top.length} loại=${JSON.stringify(drops(fix))} | dòng bị loại oan (lấy lại khi sửa)=${back} | động cơ trong top: mất ${lost}, thêm ${gain}`);
  console.log("   top hiện tại:", [...eng(base)].length, "động cơ; ví dụ:", base.top.slice(0, 5).map(ne).join("; "), "\n   top sau sửa:", fix.top.slice(0, 5).map(ne).join("; "));
  return { base, fix };
}
run("IB2200075147", null, { minPrime: { kVA: 163 } }, "T2 minPrime 180→163");
run("IB2200021335", null, { minPrime: { kVA: 163 } }, "T2 minPrime 180→163");
run("IB2300260615", 0, { minDisp: null, maxDisp: 20 }, "T1 '<20 lít' → tối đa 20");
run("IB2400564384", null, { minDisp: null, maxDisp: 20 }, "T1 '<20 lít' → tối đa 20");
run("IB2500360231", null, { minDisp: null, maxDisp: 78 }, "T1 '<78 lít' → tối đa 78");
run("IB2500314401", null, { minDisp: null }, "T4 coolant 42 L");
run("IB2300031444", null, { minDisp: null }, "T4 coolant 55 L");
run("IB2300214975", null, { minDisp: 9.7 }, "T4 coolant 22 → thật 9.7 L");
run("IB2400311120", 1, { maxDisp: null, minDisp: 3.3 }, "T5 cỡ 30 kVA: maxDisp 1.826 của cỡ 12");
run("IB2400311120", 2, { maxDisp: null, minDisp: 4.5 }, "T5 cỡ 45 kVA: maxDisp 1.826 của cỡ 12");
run("IB2300363623", 1, { minDisp: null }, "T5 cỡ 15 kVA ok? (đối chứng: giữ 1.758)");
run("IB2300266461", null, { minPrime: { kVA: 40 } }, "T3 minPrime 42 (đầu phát) → 40");
// T6: dòng của động cơ >100 L bị loại do đọc cc
const T6 = new Set(["YC16VC3300D31", "YC16VC3600D31", "YC16VC3000D31", "YC16VC4000D31", "6WH32D30007.2", "6WH32D30007.5", "8WH32D40007.2", "8WH32D40007.5", "JTA20VNG2066", "YC16VC2470ND30"].map((x) => x.toLowerCase()));
let n = 0, rows = 0, pk = new Set();
const thr = JSON.parse(fs.readFileSync(L.HERE + "/out/thr.json", "utf8"));
for (const t of thr) { const k = t.cap.unit === "kVA" ? t.cap.value : t.cap.value / 0.8; if (k < 1500 || t.th1.minDisp == null) continue; const e = C.get(t.key), r = L.sizesOfEntry(e).runs.find((x) => x.i === t.i) || L.sizesOfEntry(e).runs[0]; const P = env.prep(e, r.cap);
  const hit = P.dropped.filter((d) => d.ruled.includes("disp") && [...T6].some((x) => d.e.key.toLowerCase().replace(/[^a-z0-9.]/g, "") === x.replace(/[^a-z0-9.]/g, ""))); n++; if (hit.length) { rows += hit.length; pk.add(t.key); console.log("T6", t.key, r.cap.value + r.cap.unit, "minDisp", t.th1.minDisp, "dòng engine >100 L bị loại:", hit.length, [...new Set(hit.map((d) => d.e.model))].join(",")); } }
console.log(`T6: quét ${n} lượt cỡ ≥1500 kVA có minDisp; dòng bị loại oan ${rows} ở ${pk.size} gói`);
process.exit(0);
