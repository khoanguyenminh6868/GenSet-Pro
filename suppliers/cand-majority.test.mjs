// node --test suppliers/*.test.mjs — candidates(): một thông số động cơ có giá trị thắng theo số đông nhà cung cấp (≥ 3 NCC và
// gấp ≥ 3 lần mỗi giá trị khác, Khoa 16/11/2026) thì bước loại xét theo giá trị đó; không có thì như cũ (nguồn mâu thuẫn →
// không loại). lech-cot-9, 18/11/2026: datasheet longkai in "No. cylinders | V 12" cho Cummins QSK19-G4 (6 xi lanh) nên hai gói
// HSMT đòi ≥ 12 xi lanh (IB2400517601, IB2400617546) giữ dòng QSK19-G4 của agg-power, tecnogen.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, majorityOf, BLOCK } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | No. of Cylinder |";
const HN = "| Model | Prime kVA | Prime kW | Engine | Alternator |";
const HD = "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) |";
const sup = (id, rows, header = H) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [header], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, hints, kva = 650) => candidates(C.build(list), { value: kva, unit: "kVA" }, hints, { suppliers: list });
// Rows kept (r.all: before the per-make cap of r.top, MAKE_CAP: every fixture row here is Cummins).
const ids = (r) => r.all.map((x) => x.u.supplierId).sort();
const ruledOf = (r, id) => r.dropped.find((d) => d.u.supplierId === id)?.ruled || null;

test("majorityOf: ≥ 3 NCC và gấp ≥ 3 lần; một NCC một phiếu; NCC không so được tính như phiếu chống", () => {
  const f = (o) => Object.entries(o).flatMap(([s, xs]) => xs.map((x) => [s, x]));
  assert.equal(majorityOf(f({ a: [6], b: [6], c: [6], d: [12] }))?.win, 6);
  assert.equal(majorityOf(f({ a: [6], b: [6], d: [12] })), null, "2 NCC chưa đủ");
  assert.equal(majorityOf(f({ a: [6], b: [6], c: [6], d: [12], e: [12] })), null, "3 : 2 chưa gấp 3 lần");
  // Một NCC ghi nhiều dòng cùng số: một phiếu.
  assert.equal(majorityOf(f({ a: [6, 6, 6, 6], d: [12], e: [12] })), null);
  // NCC ghi hai số: phiếu theo số đông của các NCC khác (CAT.tally).
  assert.deepEqual(majorityOf(f({ a: [6], b: [6], c: [6], d: [6, 12] })).votes, { 6: 4 });
  // NCC chỉ có số không so được: cộng vào giá trị thứ hai.
  assert.equal(majorityOf(f({ a: [6], b: [6], c: [6], d: [BLOCK] }))?.win, 6);
  assert.equal(majorityOf(f({ a: [6], b: [6], c: [6], d: [12], e: [BLOCK] })), null, "3 : (1 + 1)");
  assert.equal(majorityOf(f({ a: [null], b: [6] })), null);
});

// Ca thật QSK19-G4 (số liệu suppliers/cn 18/11/2026): 10 NCC ghi "6", 5 ghi "6L", longkai "V 12". Rút gọn: 3 ghi 6, 1 ghi 6L.
const qsk = [
  sup("aosif", ["| a-1 | 650 | 520 | QSK19-G4 | S5L1D-H41 | 6L |"]),
  sup("depco-power", ["| d-1 | 650 | 520 | QSK19-G4 | S5L1D-H41 | 6 |"]),
  sup("fdk-energy", ["| f-1 | 650 | 520 | QSK19-G4 | S5L1D-H41 | 6 |"]),
  sup("yunding-jiangsu", ["| y-1 | 650 | 520 | QSK19-G4 | S5L1D-H41 | 6 |"]),
  sup("longkai-power", ["| LK-1 | 650 | 520 | QSK19-G4 | S5L1D-H41 | V 12 |"]),
  sup("agg-power", ["| 650/520 | 650 | 520 | QSK19-G4 | S5L1D-H41 |"], HN),
  sup("v12", ["| v-1 | 650 | 520 | KTA38-G2 | S5L1D-H41 | 12 |"]),
];
test("HSMT ≥ 12 xi lanh: QSK19-G4 số đông ghi 6 xi lanh → loại dòng không ghi số (agg-power) lẫn dòng ghi sai V 12 (longkai)", () => {
  const r = run(qsk, free("Số xi lanh: ≥ 12\n50 Hz"));
  assert.deepEqual(ids(r), ["v12"]);
  for (const id of ["agg-power", "longkai-power", "aosif", "depco-power"]) assert.deepEqual(ruledOf(r, id), ["cyl"], id);
  const d = r.dropped.find((x) => x.u.supplierId === "agg-power");
  assert.deepEqual(d.src.cyl, { n: 5, win: 6, votes: { 6: 4, 12: 1 } });
  assert.ok(d.e && r.dropped.length === 6);
});
test("đối chứng không có giá trị thắng: 2 NCC ghi 6, 1 ghi V 12 → nguồn mâu thuẫn, dòng không ghi số ở lại (như cũ)", () => {
  const few = qsk.filter((s) => !["depco-power", "fdk-energy"].includes(s.id));
  const r = run(few, free("Số xi lanh: ≥ 12\n50 Hz"));
  assert.ok(ids(r).includes("agg-power"));
  assert.deepEqual(ids(r), ["agg-power", "aosif", "longkai-power", "v12", "yunding-jiangsu"], "như trước luật: không ai bị loại");
  assert.equal(r.dropped.length, 0);
});

test("HSMT nêu đích danh QSK19-G4: dòng ở lại, trừ 600 điểm, lý do ghi số phiếu để agent thấy", () => {
  const r = run(qsk, free("Động cơ Cummins QSK19-G4\nSố xi lanh: ≥ 12\n50 Hz"));
  const row = r.all.find((x) => x.u.supplierId === "agg-power");
  assert.ok(row, "agg-power ở lại");
  assert.ok(row.why.includes("6 xi lanh < 12 HSMT yêu cầu (số đông nhà cung cấp: 6 × 4, 12 × 1)"), row.why.join("; "));
});

// Dung tích: số đông áp từ 19/11/2026 (Khoa, (c)), NCC chép chung bảng mẫu tính một phiếu (dispVoters; ca thật ở
// cand-disp-c.test.mjs). Ở đây các NCC không có ô kích thước chung nên mỗi NCC một phiếu.
const disp = [
  sup("p", ["| p-1 | 650 | 520 | QSK19-G4 | X | 18.9 |"], HD),
  sup("q", ["| q-1 | 650 | 520 | QSK19-G4 | X | 18.9 |"], HD),
  sup("r", ["| r-1 | 650 | 520 | QSK19-G4 | X | 18.9 |"], HD),
  sup("bad", ["| b-1 | 650 | 520 | QSK19-G4 | X | 30 |"], HD),
  sup("bare", ["| n-1 | 650 | 520 | QSK19-G4 | X |"], HN),
];
test("dung tích tối thiểu: số đông 18,9 L × 3 : 30 L × 1 → loại cả dòng ghi sai 30 L lẫn dòng không ghi số", () => {
  const r0 = run(disp, free("Dung tích xi lanh: ≥ 20 lít\n50 Hz"));
  assert.deepEqual(ids(r0), []);
  for (const id of ["bad", "bare", "p"]) assert.deepEqual(ruledOf(r0, id), ["disp"], id);
  assert.ok(r0.dropped.find((x) => x.u.supplierId === "bare").src.disp.votes, "lý do có số phiếu");
  // Đối chứng 2 : 1 (không đủ 3 NCC): như trước, nguồn mâu thuẫn → không loại.
  assert.deepEqual(ids(run(disp.filter((s) => s.id !== "r"), free("Dung tích xi lanh: ≥ 20 lít\n50 Hz"))), ["bad", "bare", "p", "q"]);
  // Mọi nguồn dưới ngưỡng: vẫn loại như trước.
  const low = disp.filter((s) => s.id !== "bad"), r = run(low, free("Dung tích xi lanh: ≥ 20 lít\n50 Hz"));
  assert.deepEqual(ids(r), []);
  assert.deepEqual(ruledOf(r, "bare"), ["disp"]);
});
test("dung tích tối đa: số đông 30 L × 3 : 18,9 L × 1 → loại mọi dòng của động cơ (kể cả dòng ghi 18,9), lý do ghi số phiếu", () => {
  const big = disp.map((s) => (["p", "q", "r"].includes(s.id) ? sup(s.id, [s.specTables[0].rows[0].replace("18.9", "30")], HD) : s.id === "bad" ? sup("bad", ["| b-1 | 650 | 520 | QSK19-G4 | X | 18.9 |"], HD) : s));
  const r = run(big, free("Dung tích xi lanh: ≤ 25 lít\n50 Hz"));
  assert.equal(r.dropped.length, 5);
  const d = r.dropped.find((x) => x.u.supplierId === "bad");
  assert.deepEqual(d.ruled, ["maxDisp"]);
  assert.deepEqual(d.src.maxDisp, { win: 30, votes: { 18.9: 1, 30: 3 } });
  // Đối chứng 2 : 1: như trước (không phải mọi nguồn > 25) → không loại.
  assert.equal(run(big.filter((s) => s.id !== "r"), free("Dung tích xi lanh: ≤ 25 lít\n50 Hz")).dropped.length, 0);
});

test("HSMT ghi trơ 6 xi lanh: dòng không ghi số theo số đông của động cơ (12 × 3 thắng 6 × 1 → loại); dòng tự ghi số vẫn theo ô của nó", () => {
  const k = [
    sup("a", ["| a-1 | 650 | 520 | KTA38-GA | X | 12 |"]), sup("b", ["| b-1 | 650 | 520 | KTA38-GA | X | 12 |"]),
    sup("c", ["| c-1 | 650 | 520 | KTA38-GA | X | 12 |"]), sup("six", ["| s-1 | 650 | 520 | KTA38-GA | X | 6 |"]),
    sup("none", ["| n-1 | 650 | 520 | KTA38-GA | X |"], HN),
  ];
  const r = run(k, free("Số xi lanh: 6 xy lanh\n50 Hz"));
  assert.deepEqual(ids(r), ["six"]);
  assert.deepEqual(ruledOf(r, "none"), ["cyl"]);
  // Chỉ 2 NCC ghi 12: mâu thuẫn, dòng không ghi số ở lại như cũ.
  assert.deepEqual(ids(run(k.filter((s) => s.id !== "c"), free("Số xi lanh: 6 xy lanh\n50 Hz"))), ["none", "six"]);
});
