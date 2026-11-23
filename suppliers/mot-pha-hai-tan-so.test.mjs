// node --test suppliers/*.test.mjs — dòng bảng ghi một pha và tiêu đề ghi hai tần số (Khoa 24/11/2026). Câu HSMT trong test là câu tự đặt.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, minsForSize, onePhaseOf, phaseOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator";
const sup = (id, rows, header = [H], title = "Gensets") => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title, header, rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, hints) => candidates(C.build(list), { value: 20, unit: "kVA" }, hints, { suppliers: list });
const ROW = "| a-1 | 20 | 16 | 404A-22G1 | UCI224D";

test("phaseOf: chỉ nhận khi chữ nêu đúng một loại", () => {
  assert.equal(phaseOf("Số pha, số dây: 3 pha 4 dây"), 3);
  assert.equal(phaseOf("Điện áp 400 V, 03 pha"), 3);
  assert.equal(phaseOf("Máy phát điện xoay chiều ba pha"), 3);
  assert.equal(phaseOf("Số pha: 1 pha 2 dây"), 1);
  assert.equal(phaseOf("Điện áp 220 V, một pha"), 1);
  assert.equal(phaseOf("Số pha: 3 pha hoặc 1 pha"), null);
  assert.equal(phaseOf("Số pha: 1 pha/3 pha"), null);
  assert.equal(phaseOf("Máy phát điện 50 kVA/3 pha"), 3);
  assert.equal(phaseOf("Máy phát điện 12 kVA/1 pha"), 1);
  assert.equal(phaseOf("Công suất 20 kVA"), null);
});

test("phaseOf: dòng về thiết bị khác không tính, trừ dòng có nhãn số pha", () => {
  for (const l of ["Bộ sạc ắc quy 1 pha", "Hộp cầu dao 3 pha/4 cực", "Biến dòng một pha", "Bảo vệ mất pha", "Đồng hồ đo điện áp 3 pha"]) assert.equal(phaseOf(l), null, l);
  assert.equal(phaseOf("Tủ điện: số pha 3 pha"), 3);
});

test("phaseOf theo từng cỡ của gói nhiều cỡ", () => {
  const t = "Máy 12 kVA/1 pha: Số pha, số dây: 1 pha 2 dây\nMáy 45 kVA/3 pha: Số pha, số dây: 3 pha 4 dây";
  const sizes = [{ cap: { value: 12, unit: "kVA" }, kva: 12 }, { cap: { value: 45, unit: "kVA" }, kva: 45 }];
  assert.equal(phaseOf(t), null);
  assert.equal(minsForSize(t, sizes[0], sizes).mins.phase, 1);
  assert.equal(minsForSize(t, sizes[1], sizes).mins.phase, 3);
});

test("onePhaseOf: dòng phân đoạn và cột pha của chính dòng", () => {
  assert.equal(onePhaseOf({ header: [H, "| Single phase"], line: ROW }).from, "segment");
  const heads = ["| Model | Hz | Phase | Engine"];
  assert.equal(onePhaseOf({ header: heads, line: "| a-1 | 50Hz | 1-phase | 404A-22G1" }).from, "column");
  assert.equal(onePhaseOf({ header: heads, line: "| a-1 | 50Hz | 3-phase | 404A-22G1" }), null);
});

test("onePhaseOf: không suy từ tên model, tên trang, điện áp; có căn cứ ba pha thì không kết luận", () => {
  assert.equal(onePhaseOf({ header: [H], line: "| P2500-1P | 2500 | 2000 | 4016-61TRG3X | LL9324R" }), null);
  assert.equal(onePhaseOf({ title: "Single Phase Diesel Generator", header: [H], line: ROW }), null);
  assert.equal(onePhaseOf({ header: ["| Model | Voltage | Engine"], line: "| a-1 | 230V | 404A-22G1" }), null);
  assert.equal(onePhaseOf({ header: [H, "| Single phase", "| Three phase"], line: ROW }), null);
});

const one = () => sup("mot-pha", [ROW], [H, "| Single phase"]);
const three = () => sup("ba-pha", ["| b-1 | 20 | 16 | 404A-22G1 | UCI224E"]);

test("candidates: gói đòi ba pha loại dòng một pha, ruled phase", () => {
  const r = run([one(), three()], free("Số pha: 3 pha 4 dây"));
  assert.deepEqual(r.top.map((x) => x.u.supplierId), ["ba-pha"]);
  assert.ok(r.dropped.some((x) => x.u.supplierId === "mot-pha" && x.ruled.includes("phase")));
});

test("candidates: gói không nêu rõ số pha giữ dòng, ghi cần xác nhận", () => {
  const r = run([one(), three()], free("Công suất 20 kVA"));
  const row = r.top.find((x) => x.u.supplierId === "mot-pha");
  assert.ok(row);
  assert.ok(row.why.some((w) => /cần xác nhận số pha/.test(w)));
  assert.ok(!r.top.find((x) => x.u.supplierId === "ba-pha").why.some((w) => /số pha/.test(w)));
});

test("candidates: gói đòi một pha chưa loại dòng nào theo pha", () => {
  const r = run([one(), three()], free("Số pha: 1 pha 2 dây"));
  assert.deepEqual(r.top.map((x) => x.u.supplierId).sort(), ["ba-pha", "mot-pha"]);
  assert.ok(!r.dropped.some((x) => x.ruled.includes("phase")));
});

const freqOf = (last) => C.fromSupplier(sup("x", [`${ROW} | ●`], [`${H} | ${last}`])).find((r) => r.kind === "engine").freq;

test("freqIn: tiêu đề ghi cặp 50/60 Hz không cho tần số", () => {
  for (const s of ["Dual-band 50/60HZ", "50/60 Hz", "60/50Hz", "50-60Hz", "50 / 60 Hz"]) assert.equal(freqOf(s), null, s);
});

test("freqIn: một tần số và số dính vào mã vẫn đọc như cũ", () => {
  assert.equal(freqOf("60Hz"), 60);
  assert.equal(freqOf("50Hz"), 50);
  assert.equal(freqOf("GB-D60-50HZ"), 50);
});
