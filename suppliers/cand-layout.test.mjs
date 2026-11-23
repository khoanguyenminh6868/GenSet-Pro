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
  const r = run(rows, free("Số xi lanh: ≥ 6 xy lanh, bố trí thẳng hàng\n50 Hz"));
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
  const ask = free("Số xi lanh: ≥ 6 xy lanh, bố trí thẳng hàng\n50 Hz");
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
  // (Không xét top: trần mỗi động cơ có thể đẩy "other" ra khỏi top.)
  const r4 = run([...rows, vee2, vee3, other, clash, clash2], ask);
  assert.ok(r4.all.some((x) => x.u.supplierId === "other"));
  assert.ok(!r4.dropped.some((d) => d.u.supplierId === "other"));
});

// Khoa 17/11/2026: "nếu HSMT ghi rõ 6 thì nên loại 12".
test("cylExact: HSMT ghi trơ số xi lanh là số chính xác; có ≥ / tối thiểu / trở lên thì vẫn là tối thiểu", () => {
  const h = (t) => hintsOf(`Chương V. Yêu cầu kỹ thuật\n${t}`);
  assert.deepEqual([h("12    Số xilanh                          6 xy lanh, bố trí thẳng hàng").minCyl, h("12    Số xilanh                          6 xy lanh, bố trí thẳng hàng").cylExact], [6, true]);
  assert.deepEqual([h("Số xi lanh: 06").minCyl, h("Số xi lanh: 06").cylExact], [6, true]);
  for (const t of ["Số xi lanh: ≥ 6", "Tối thiểu 06 xi lanh", "Số xi lanh: 6 trở lên", "Số xi lanh không nhỏ hơn 6"]) assert.deepEqual([h(t).minCyl, h(t).cylExact], [6, false], t);
  assert.equal(h("Công suất liên tục 700 kVA").cylExact, false);
});
test("HSMT ghi rõ 6 xi lanh: dòng 12 xi lanh bị loại dù không ghi bố trí; dòng 6 xi lanh và dòng không ghi số ở lại", () => {
  const twelve = sup("twelve", ["| t-1 | 750 | 600 | KTA38-GA | S5L1D-H41 | 12 |"]), none = sup("none", ["| n-1 | 750 | 600 | S6R2-PTAA | S5L1D-H41 | |"]);
  const r = run([...rows, twelve, none], free("Số xi lanh: 6 xy lanh\n50 Hz"));
  assert.deepEqual(ids(r), ["bare", "line", "none"]);
  assert.deepEqual(r.dropped.map((d) => d.u.supplierId).sort(), ["twelve", "vee"]);
  assert.ok(r.dropped.every((d) => d.ruled.includes("cyl")));
  // "≥ 6": 12 xi lanh vẫn đạt (số trần có dấu ≥ là tối thiểu).
  assert.deepEqual(ids(run([...rows, twelve, none], free("Số xi lanh: ≥ 6\n50 Hz"))), ["bare", "line", "none", "twelve", "vee"]);
});
test("HSMT ghi rõ 6 xi lanh: nguồn của động cơ mâu thuẫn về số xi lanh thì không xét dòng không ghi số", () => {
  const a = sup("a", ["| a-1 | 750 | 600 | KTA38-GA | S5L1D-H41 | 12 |"]), b = sup("b", ["| b-1 | 750 | 600 | KTA38-GA | S5L1D-H41 | 6 |"]), c = sup("c", ["| c-1 | 750 | 600 | KTA38-GA | S5L1D-H41 | |"]);
  const r = run([a, b, c], free("Số xi lanh: 6 xy lanh\n50 Hz"));
  assert.deepEqual(ids(r), ["b", "c"]);
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

test("ô của chính dòng bị ≥ 2 NCC khác ghi đúng kiểu HSMT đòi: không dùng để loại (Khoa 22/11/2026)", () => {
  const row = (id, cyl) => sup(id, [`| ${id}-1 | 750 | 600 | KTA38-G2 | S5L1D-H41 | ${cyl} |`]);
  const hsmtV = free("Số xi lanh 12, kiểu chữ V");
  assert.ok(ids(run([row("sai", "12 L"), row("a", "12V"), row("b", "V12")], hsmtV)).includes("sai"));
  // Chỉ một NCC khác ghi đúng kiểu HSMT: ô của dòng vẫn loại dòng đó.
  assert.ok(!ids(run([row("sai", "12 L"), row("a", "12V")], hsmtV)).includes("sai"));
  // Hai NCC khác ghi cùng kiểu với dòng không phải lý do giữ dòng: vẫn loại.
  assert.ok(!ids(run([row("sai", "12 L"), row("a", "12 L"), row("b", "6L")], hsmtV)).includes("sai"));
});

test("phía ghi ngược phải ĐÔNG HƠN phía của dòng mới giữ dòng (Khoa 23/11/2026, phương án B)", () => {
  const row = (engine, id, cyl) => sup(id, [`| ${id}-1 | 750 | 600 | ${engine} | S5L1D-H41 | ${cyl} |`]);
  const many = (engine, prefix, n, cyl) => Array.from({ length: n }, (_, i) => row(engine, `${prefix}${i}`, cyl));
  const out = (r, id) => r.dropped.some((d) => d.u.supplierId === id && d.ruled.includes("layout"));
  const stays = (r, id) => r.all.some((x) => x.u.supplierId === id) && !out(r, id);
  // Không ghi số xi lanh trơ ở gói đòi thẳng hàng: "6 xy lanh" sẽ loại dòng "V12" bằng luật số xi lanh, không phải luật bố trí.
  const inline = free("Số xi lanh: bố trí thẳng hàng"), vee = free("Số xi lanh 12, kiểu chữ V");
  // DP180LB: 6 NCC ghi V, 2 NCC ghi thẳng hàng. Gói đòi thẳng hàng: dòng "10V" bị loại.
  const dp = [...many("DP180LB", "v", 6, "10V"), ...many("DP180LB", "l", 2, "10 L")];
  const rDp = run(dp, inline);
  for (let i = 0; i < 6; i++) assert.ok(out(rDp, `v${i}`), `v${i}`);
  // liangzi "12L" cho KTA38 (1 NCC so với 6 NCC ghi V): gói đòi chữ V vẫn giữ.
  const kta = run([row("KTA38-G2", "liangzi", "12 L"), ...many("KTA38-G2", "v", 6, "12V")], vee);
  assert.ok(stays(kta, "liangzi"));
  // longkai "V12" cho QSK19 (1 NCC so với 2 NCC ghi thẳng hàng): gói đòi thẳng hàng vẫn giữ.
  const qsk = run([row("QSK19-G6", "longkai", "V12"), ...many("QSK19-G6", "l", 2, "6L")], inline);
  assert.ok(stays(qsk, "longkai"));
  // P158LE-1: 4 NCC ghi V, 3 NCC ghi thẳng hàng. Bên ít hơn được giữ, bên đông hơn bị loại.
  const p = [...many("P158LE-1", "v", 4, "12V"), ...many("P158LE-1", "l", 3, "12 L")];
  const rInline = run(p, inline), rVee = run(p, vee);
  for (let i = 0; i < 4; i++) assert.ok(out(rInline, `v${i}`), `v${i}`);
  for (let i = 0; i < 3; i++) assert.ok(stays(rVee, `l${i}`), `l${i}`);
  // Bằng nhau (2 NCC mỗi phía): không đông hơn nên ô của dòng vẫn loại dòng.
  const tie = run([...many("KTA38-G2", "v", 2, "12V"), ...many("KTA38-G2", "l", 2, "12 L")], vee);
  assert.ok(out(tie, "l0") && out(tie, "l1"));
});

test("aosif n102: bỏ số xi lanh 12V của QSK19 / KTA19, giữ dòng", () => {
  const s = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "cn", "aosif.json"), "utf8"));
  const rows = C.fromSupplier(s).filter((r) => r.kind === "engine" && ["AC700-I", "AC700-II", "AC750-III"].includes(r.genset) && /12V \| 18\.9/.test(r.line || ""));
  assert.equal(rows.length, 3);
  for (const r of rows) assert.ok(!(r.specs || []).some((f) => f.key === "cyl"), r.genset);
});
