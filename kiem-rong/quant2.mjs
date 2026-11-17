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
run("IB2400487460", 0, { minDisp: null, maxDisp: 2.3 }, "T5 cỡ 8,8 kVA nhận minDisp 3.9 của cỡ 40 kVA");
run("IB2300363623", 0, { minDisp: null }, "T5 cỡ 5 kW nhận minDisp 1.758 của cỡ 15 kVA");
run("IB2400030247", 0, { minPrime: { kVA: 50 } }, "cỡ 50 kVA minPrime 60 (HSMT ghi 50KVA và 60kva liên tục)");
process.exit(0);
