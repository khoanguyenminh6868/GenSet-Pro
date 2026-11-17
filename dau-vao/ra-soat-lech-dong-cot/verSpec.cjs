// node verSpec.cjs <repo cũ> <repo mới>: tự kiểm ĐỘC LẬP từng thông số đổi / thêm giữa hai bản catalog.js bằng quan hệ số với
// công suất của chính dòng (dòng điện ≈ 1,44–1,52 × kVA hoặc 1,8 × kW; khối lượng 2,5–150 kg/kVA; công suất động cơ 0,9–1,8 ×
// kW; xi lanh 1–20; điện áp chuẩn). In mọi giá trị KHÔNG tự xác nhận được để soát tay, và một dòng mẫu mỗi (bảng, thông số).
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [A, B] = process.argv.slice(2);
const read = (repo) => { const { C, S } = load(repo); const m = new Map(); for (const s of S) { if (s.status === "incomplete") continue; const seen = new Map(); for (const o of C.fromSupplier(s)) { let k = [o.supplierId, o.n, o.table, o.row ?? "L", o.kind].join("|"); const c = seen.get(k) || 0; seen.set(k, c + 1); m.set(k + "#" + c, o); } } return m; };
const a = read(A), b = read(B);
const num = (v) => { const m = String(v).replace(/(\d),(\d{3})\b/g, "$1$2").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const sp = (o) => { const r = {}; (o.specs || []).forEach((s, i, l) => { r[s.key + (l.slice(0, i).filter((t) => t.key === s.key).length || "")] = s; }); return r; };
const check = (key, s, o) => {
  const v = num(s.value), P = o.power || {}, kvas = ["prime", "standby", "rated"].map((r) => P[r]?.kVA).filter(Boolean), kws = ["prime", "standby", "rated"].map((r) => P[r]?.kW).filter(Boolean);
  const near = (x, y, t) => Math.abs(x / y - 1) <= t;
  switch (key.replace(/\d+$/, "")) {
    case "current": return v != null && (kvas.some((k) => [1.443, 1.519, 1.39, 1.312, 1.203].some((f) => near(v, k * f, 0.04))) || kws.some((k) => [1.8, 1.9, 1.804].some((f) => near(v, k * f, 0.04))) || kvas.some((k) => near(v, k * 4.35, 0.05)) || kws.some((k) => near(v, k * 4.35, 0.05) || near(v, k * 4.55, 0.05)));
    case "weight": return v != null && (kvas.length ? kvas : kws.map((k) => k / 0.8)).some((k) => v / k >= 2.5 && v / k <= 150);
    case "engPower": return v != null && kws.some((k) => v >= k * 0.9 && v <= k * 1.8);
    case "cyl": return v != null && Number.isInteger(v) && v >= 1 && v <= 20;
    case "disp": return v != null && v >= 0.4 && v <= 100;
    case "voltage": return [110, 115, 120, 127, 208, 220, 230, 240, 380, 400, 415, 440, 480, 690, 6300, 10500].includes(v);
    case "dims": return (String(s.value).match(/\d+(?:\.\d+)?/g) || []).length >= 3;
    case "gov": return /mechanical|electr|ecu|机械|电子|电调/i.test(s.value);
    case "speed": return [1000, 1500, 1800, 3000, 3600].includes(v);
    default: return null;
  }
};
const stat = {}, shown = new Set(); let fails = 0;
for (const [k, o] of a) {
  const p = b.get(k); if (!p) continue;
  const x = sp(o), y = sp(p);
  for (const key of new Set([...Object.keys(x), ...Object.keys(y)])) {
    if ((x[key]?.value ?? null) === (y[key]?.value ?? null)) continue;
    const base = key.replace(/\d+$/, ""), kind = !x[key] ? "thêm" : !y[key] ? "bỏ" : "đổi";
    const ok = y[key] ? check(key, y[key], p) : null, wasOk = x[key] ? check(key, x[key], o) : null;
    const tag = `${base} ${kind}: mới ${ok === true ? "tự xác nhận" : ok === false ? "KHÔNG xác nhận" : "không kiểm được"}${kind === "đổi" ? `, cũ ${wasOk === true ? "cũng hợp lệ" : wasOk === false ? "sai" : "?"}` : ""}`;
    stat[tag] = (stat[tag] || 0) + 1;
    const tk = `${o.supplierId} n${o.n} bảng ${o.table} ${base}`;
    if (ok !== true || (kind === "đổi" && wasOk === true)) { fails++; console.log(`(!) [${tk}] dòng ${o.row}: ${x[key]?.value ?? "∅"} → ${y[key]?.value ?? "∅"} (nhãn "${String(y[key]?.label || x[key]?.label).slice(0, 40)}") | ${JSON.stringify(p.power)} | ${String(o.line).slice(0, 150)}`); }
    else if (!shown.has(tk)) { shown.add(tk); console.log(`    [${tk}] dòng ${o.row}: ${x[key]?.value ?? "∅"} → ${y[key].value} (nhãn "${String(y[key].label).slice(0, 40)}") | ${String(o.line).slice(0, 150)}`); }
  }
}
console.log("\n" + Object.entries(stat).sort().map(([k, v]) => `${v}  ${k}`).join("\n"));
console.log(`\ncần soát tay: ${fails}`);
