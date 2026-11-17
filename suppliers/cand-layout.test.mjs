// node --test suppliers/*.test.mjs — candidates(): bố trí xi lanh và động cơ khác tần số (Khoa, 2026-11-17, IB2600603983).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { candidates, hintsOf, cylLayoutOf, layoutOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | No. of Cylinder |";
const sup = (id, rows, title = "Gensets", header = H) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title, header: [header], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, hints, kva = 700) => candidates(C.build(list), { value: kva, unit: "kVA" }, hints, { suppliers: list });
const ids = (r) => r.top.map((x) => x.u.supplierId).sort();

test("cylLayoutOf: bố trí xi lanh HSMT nêu (dòng thật của IB2600603983), hai kiểu cùng lúc thì không xét", () => {
  assert.equal(cylLayoutOf("12    Số xilanh                          6 xy lanh, bố trí thẳng hàng"), "inline");
  assert.equal(cylLayoutOf("Số xi lanh\n12 xi lanh, kiểu chữ V"), "v");
  assert.equal(cylLayoutOf("Số xi lanh: ≥ 6, thẳng hàng hoặc chữ V"), null);
  assert.equal(cylLayoutOf("Số xi lanh: ≥ 6\nĐiện áp 380 V"), null);
  assert.equal(cylLayoutOf("Dây chuyền thẳng hàng\nĐộng cơ 4 kỳ"), null);
});

test("layoutOf: các cách ghi trong bảng nhà cung cấp", () => {
  for (const v of ["12V", "12.V", "12 V", "V12", "12-V", "12 cylinders V type", "16 cylinder Diesel.VEE type", "12 cyl / 90°V", "12-cylinder, Vee"]) assert.equal(layoutOf(v), "v", v);
  for (const v of ["6L", "6.L", "6 L", "L6", "6-L", "6 Inline", "6 cylinders, in-line", "6 cyl / vertical in-line", "6 cylinder Diesel L type"]) assert.equal(layoutOf(v), "inline", v);
  for (const v of ["6", "12", "", "Electrical"]) assert.equal(layoutOf(v), null, v);
});

const rows = [
  sup("vee", ["| v-1 | 750 | 600 | KTA38-G2 | S5L1D-H41 | 12.V |"]),
  sup("line", ["| l-1 | 750 | 600 | QSK23-G2 | S5L1D-H41 | 6L |"]),
  sup("bare", ["| b-1 | 750 | 600 | 4006-23TAG2A | S5L1D-H41 | 6 |"]),
];
test("HSMT đòi thẳng hàng: dòng ghi chữ V bị loại kèm lý do; dòng thẳng hàng và dòng chỉ ghi số xi lanh ở lại", () => {
  const r = run(rows, free("Số xi lanh: 6 xy lanh, bố trí thẳng hàng\n50 Hz"));
  assert.deepEqual(ids(r), ["bare", "line"]);
  assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["vee", ["layout"]]]);
});
test("HSMT không nêu bố trí: không loại ai", () => {
  const r = run(rows, free("Số xi lanh: ≥ 6\n50 Hz"));
  assert.deepEqual(ids(r), ["bare", "line", "vee"]);
});
test("dòng không ghi bố trí: theo động cơ khi ÍT NHẤT HAI nhà cung cấp ghi kiểu kia; một nhà cung cấp ghi thì chỉ tính cho dòng của họ", () => {
  // "12V" dưới cột số xi lanh là thông số của động cơ (catalog đọc được); "12.V" chỉ đọc được ở chính dòng đó.
  const other = sup("other", ["| o-1 | 750 | 600 | KTA38-G2 | S5L1D-H41 | 12 |"]);
  const vee2 = sup("vee2", ["| w-1 | 750 | 600 | KTA38-G2 | S5L1D-H41 | 12V |"]), vee3 = sup("vee3", ["| x-1 | 750 | 600 | KTA38-G2 | S5L1D-H41 | 12V |"]);
  const ask = free("Số xi lanh: 6 xy lanh, bố trí thẳng hàng\n50 Hz");
  // Một nhà cung cấp ghi 12V (như aosif ghi nhầm "12V" cho KTA19-G9A): dòng của họ bị loại, dòng nhà khác ở lại.
  const r1 = run([...rows, vee2, other], ask);
  assert.ok(r1.dropped.some((d) => d.u.supplierId === "vee2" && d.ruled.includes("layout")));
  assert.ok(ids(r1).includes("other"));
  // Hai nhà cung cấp ghi 12V: dòng không ghi bố trí của động cơ đó cũng bị loại.
  const r2 = run([...rows, vee2, vee3, other], ask);
  assert.ok(r2.dropped.some((d) => d.u.supplierId === "other" && d.ruled.includes("layout")));
  // Thêm MỘT nhà ghi "12 L" (liangzi-yangzhou ghi vậy cho KTA38): không đủ hai nhà nên không thành mâu thuẫn; dòng của họ ở lại.
  const clash = sup("clash", ["| c-1 | 750 | 600 | KTA38-G2 | S5L1D-H41 | 12 L |"]);
  const r3 = run([...rows, vee2, vee3, other, clash], ask);
  assert.ok(r3.dropped.some((d) => d.u.supplierId === "other" && d.ruled.includes("layout")));
  assert.ok(ids(r3).includes("clash"));
  // Hai nhà ghi thẳng hàng, hai nhà ghi chữ V: không xét, dòng không ghi bố trí ở lại.
  const clash2 = sup("clash2", ["| d-1 | 750 | 600 | KTA38-G2 | S5L1D-H41 | 12 L |"]);
  assert.ok(ids(run([...rows, vee2, vee3, other, clash, clash2], ask)).includes("other"));
});

const B = "| Model | Prime kVA | Prime kW | Engine | Alternator |";
const baud = [
  sup("f60a", ["| a-1 | 750 | 600 | 6M33G660/6 | X |"], "Baudouin 60Hz Models", B),
  sup("f60b", ["| b-1 | 750 | 600 | 6M33G660/6 | X |"], "Baudouin series 60 Hz", B),
  sup("nofreq", ["| n-1 | 750 | 600 | 6M33G660/6 | X |"], "Baudouin generator set", B),
  sup("ok50", ["| k-1 | 750 | 600 | 6M31G825/5 | X |"], "Baudouin generator set", B),
];
test("động cơ chỉ có dòng 60 Hz (hai dòng trở lên): dòng không ghi tần số của nó bị loại khi HSMT đòi 50 Hz", () => {
  const built = C.build(baud), e = built.engines.find((x) => /660\/6/.test(x.model));
  assert.deepEqual(e.uses.map((u) => u.freq || 0).sort(), [0, 60, 60], "fixture: hai dòng 60 Hz, một dòng không ghi");
  const r = run(baud, free("Tần số 50 Hz"));
  assert.deepEqual(ids(r), ["ok50"]);
  assert.ok(r.dropped.some((d) => d.u.supplierId === "nofreq" && d.ruled.includes("freq")));
  // HSMT không nêu tần số: không loại.
  assert.ok(ids(run(baud, free("Công suất liên tục 700 kVA"))).includes("nofreq"));
});
test("động cơ bán ở cả hai tần số: dòng không ghi tần số ở lại", () => {
  const both = [...baud, sup("f50", ["| z-1 | 750 | 600 | 6M33G660/6 | X |"], "Baudouin series 50 Hz", B)];
  assert.ok(ids(run(both, free("Tần số 50 Hz"))).includes("nofreq"));
});
