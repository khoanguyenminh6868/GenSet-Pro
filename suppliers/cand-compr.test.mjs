// node --test suppliers/*.test.mjs — candidates(): tỉ số nén HSMT ghi trơ phải khớp (Khoa 21/11/2026, IB2600603983).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, comprOff, placeInModel, placeInRow } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Compression ratio |";
const sup = (id, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, hints) => candidates(C.build(list), { value: 700, unit: "kVA" }, hints, { suppliers: list });
const ids = (r) => r.top.map((x) => x.u.supplierId).sort();
const list = [
  sup("khac", ["| a-1 | 750 | 600 | 6M33G825/5 | S5L1D-H41 | 15.0:1 |"]),
  sup("dung", ["| b-1 | 750 | 600 | 6M31G825/5 | S5L1D-H41 | 14 : 1 |"]),
  sup("tron", ["| c-1 | 750 | 600 | S6R2-PTAA | S5L1D-H41 | 14.1:1 |"]),
  sup("trong", ["| d-1 | 750 | 600 | QSK23-G2 | S5L1D-H41 | - |"]),
];

test("HSMT ghi trơ 14:1: loại dòng mọi nguồn ghi số khác; số đúng, khác độ làm tròn, không ghi thì ở lại", () => {
  const r = run(list, free("Tỉ số nén | 14:1"));
  assert.deepEqual(ids(r), ["dung", "tron", "trong"]);
  assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["khac", ["compr"]]]);
});
test("HSMT có dấu ≥ hoặc không nêu: không lọc", () => {
  assert.deepEqual(ids(run(list, free("Tỉ số nén | ≥ 14:1"))), ["dung", "khac", "tron", "trong"]);
  assert.deepEqual(ids(run(list, free("Điện áp 380 V"))), ["dung", "khac", "tron", "trong"]);
});
test("gói nhiều cỡ: không lọc (chưa biết con số thuộc cỡ nào)", () => {
  assert.deepEqual(ids(run(list, { ...free("Tỉ số nén | 14:1"), multiSize: true })), ["dung", "khac", "tron", "trong"]);
});
test("model HSMT nêu đích danh ở lại, trừ 600 điểm và ghi lý do", () => {
  const r = run(list, free("Động cơ 6M33G825/5\nTỉ số nén | 14:1")), x = r.all.find((y) => y.u.supplierId === "khac");
  assert.ok(x?.named);
  assert.deepEqual(x.ruled, ["compr"]);
  assert.ok(x.why.some((w) => w.includes("HSMT ghi 14:1")));
});
test("6M33G8D3/5 (cả cách ghi kèm ngoặc) nhận tỉ số nén của 6M33G825/5 theo tờ Koten", () => {
  const more = [...list, sup("ngoac", ["| e-1 | 750 | 600 | 6M33G8D3/5 (6M33G825/5) | S5L1D-H41 | - |"]), sup("tron8", ["| f-1 | 750 | 600 | 6M33G8D3/5 | S5L1D-H41 | - |"])];
  const r = run(more, free("Tỉ số nén | 14:1"));
  assert.deepEqual(ids(r), ["dung", "tron", "trong"]);
  assert.deepEqual(r.dropped.map((d) => d.u.supplierId).sort(), ["khac", "ngoac", "tron8"]);
});
test("mã có tiền tố nước dùng tỉ số nén của mã gốc", () => {
  const rows = [sup("goc", ["| g-1 | 750 | 600 | 4006-23TAG2A | S5L1D-H41 | 13.6:1 |"]), sup("uk", ["| u-1 | 750 | 600 | UK 4006-23TAG2A | S5L1D-H41 | - |"]), sup("dung", ["| b-1 | 750 | 600 | 6M31G825/5 | S5L1D-H41 | 14:1 |"])];
  const r = run(rows, free("Tỉ số nén | 14:1"));
  assert.deepEqual(ids(r), ["dung"]);
  assert.deepEqual(r.dropped.map((d) => d.u.supplierId).sort(), ["goc", "uk"]);
});
test("placeInModel: chỉ đọc nước NCC ghi ngay trước mã", () => {
  assert.equal(placeInModel("India 4006-23TAG2A"), "IN");
  assert.equal(placeInModel("UK 4006-23TAG2A"), "GB");
  assert.equal(placeInModel("1103A-33G(India)"), "IN");
  assert.equal(placeInModel("1103A-33G (UK)"), "GB");
  assert.equal(placeInModel("S16R2-PTAW-C SME"), "CN");
  for (const m of ["4006-23TAG2A", "UK-12Y", "US TIER3", "", "1103A-33G(UK/EP)", "1103A-33G(USA/EU)", "1104D-44TG2 EU"]) assert.equal(placeInModel(m), null, m);
});
test("placeInRow: đọc đúng ô của động cơ; SME chỉ tính cho Mitsubishi", () => {
  const row = (cell) => ({ line: `| a-1 | 750 | 600 | ${cell} | S5L1D-H41 |` });
  assert.equal(placeInRow({ model: "1103A-33G", make: "Perkins" }, row("1103A-33G(India)")), "IN");
  assert.equal(placeInRow({ model: "1103A-33G", make: "Perkins" }, row("1104A-44TG1(India)")), null);
  assert.equal(placeInRow({ model: "S16R2-PTAW-C", make: "Mitsubishi" }, row("S16R2-PTAW-C SME")), "CN");
  assert.equal(placeInRow({ model: "X1234", make: "Perkins" }, row("X1234 SME")), null);
  assert.equal(placeInRow({ model: "S16R2-PTAW-C", make: "Mitsubishi" }, { lines: { rows: ["| Genset Model | SW-1", "| Engine Model | S16R2-PTAW-C SME"] } }), "CN");
});
test("gói G7/EU: dòng NCC ghi India bị loại, dòng UK và dòng không ghi ở lại; G20 giữ India", () => {
  const rows = [sup("in", ["| i-1 | 750 | 600 | India 4006-23TAG2A | S5L1D-H41 | - |"]), sup("gb", ["| g-1 | 750 | 600 | UK 4006-23TAG2A | S5L1D-H41 | - |"]), sup("none", ["| n-1 | 750 | 600 | 4006-23TAG2A | S5L1D-H41 | - |"])];
  const go = (origin) => candidates(C.build(rows), { value: 700, unit: "kVA" }, free("Điện áp 380 V"), { suppliers: rows, origin });
  const r = go("g7eu");
  assert.deepEqual(ids(r), ["gb", "none"]);
  assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["in", ["made"]]]);
  assert.ok(ids(go("g20")).includes("in"));
});
test("India 4006-23TAG2A bị loại ở g7eu cả khi khoá có tiền tố lẫn khi khoá đã gộp về mã gốc", () => {
  const rows = [sup("in", ["| i-1 | 750 | 600 | India 4006-23TAG2A | S5L1D-H41 | - |"]), sup("gb", ["| g-1 | 750 | 600 | UK 4006-23TAG2A | S5L1D-H41 | - |"]), sup("none", ["| n-1 | 750 | 600 | 4006-23TAG2A | S5L1D-H41 | - |"])];
  const built = C.build(rows), bare = "4006-23TAG2A", key = C.keyOf(bare), mine = built.engines.filter((e) => C.keyOf(String(e.model).replace(/^(india|uk)\s+/i, "")) === key);
  const uses = mine.flatMap((e) => e.uses), rest = built.engines.filter((e) => !mine.includes(e));
  assert.equal(uses.length, 3, "fixture: ba dòng của cùng một mã");
  const merged = { ...built, engines: [...rest, { ...mine[0], key, model: bare, uses }] };
  const apart = { ...built, engines: [...rest, ...uses.map((u) => { const m = C.cellsOf(u.line).find((c) => c.includes(bare)); return { ...mine[0], key: C.keyOf(m), model: m, uses: [u] }; })] };
  for (const cat of [apart, merged]) {
    const r = candidates(cat, { value: 700, unit: "kVA" }, free("Điện áp 380 V"), { suppliers: rows, origin: "g7eu" });
    assert.deepEqual(ids(r), ["gb", "none"]);
    assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["in", ["made"]]]);
  }
});
test("comprOf: số xi lanh chung ô không là tỉ số nén; dấu so sánh bị mất thì không phải số trơ", () => {
  const h = (t) => { const x = hintsOf(`Chương V. Yêu cầu kỹ thuật\n${t}`); return [x.compr, x.comprExact]; };
  assert.deepEqual(h("Động cơ: Số xilanh và tỷ số nén: 6 xilanh; tỷ số nén > 17.5:1"), [17.5, false]);
  assert.deepEqual(h("Động cơ: Số xilanh và tỷ số nén: 6 xilanh; tỷ số nén 17.5:1"), [17.5, true]);
  assert.deepEqual(h("Động cơ: Tỷ số nén: 14 : 1 (ký hiệu so sánh bị mất trong văn bản)"), [14, false]);
  assert.deepEqual(h("Máy 500 kVA: Động cơ - Tỷ số nén: 13,5 : 1 (ký hiệu so sánh trước giá trị không đọc được trong văn bản)"), [13.5, false]);
  assert.deepEqual(h("Động cơ: Tỷ số nén: 14 : 1"), [14, true]);
});
test("comprOff: nguồn mâu thuẫn, không đọc được hoặc không ghi thì không kết luận", () => {
  const f = (...v) => v.map((value) => ({ key: "compr", value }));
  assert.equal(comprOff(f("13.9:1", "13.0:1"), 14), null);
  assert.equal(comprOff(f("18.2–18.3:1"), 14), null);
  assert.equal(comprOff([], 14), null);
  assert.equal(comprOff(f("14.1:1", "14:1"), 14), null);
  assert.equal(comprOff(f("15.0:1", "15:1"), 14).length, 2);
});
