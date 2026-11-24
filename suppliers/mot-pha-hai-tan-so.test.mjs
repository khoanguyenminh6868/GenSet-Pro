// node --test suppliers/*.test.mjs — dòng bảng ghi một pha và tiêu đề ghi hai tần số (Khoa 24/11/2026). Câu HSMT trong test là câu tự đặt.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, minsForSize, onePhaseOf, phaseOf, rowPhaseOf } from "./config-bot.mjs";

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

test("onePhaseOf: không suy từ điện áp; có căn cứ ba pha thì không kết luận", () => {
  assert.equal(onePhaseOf({ header: ["| Model | Voltage | Engine"], line: "| a-1 | 230V | 404A-22G1" }), null);
  assert.equal(onePhaseOf({ header: [H, "| Single phase", "| Three phase"], line: ROW }), null);
});

test("rowPhaseOf: căn cứ ba pha ở tiêu đề, dòng phân đoạn, cột pha", () => {
  assert.equal(rowPhaseOf({ header: [H, "| Three phase"], line: ROW }).phase, 3);
  assert.equal(rowPhaseOf({ header: ["| Model | 50HZ PF=0.8 400/230V 3Phase 4Wire | Engine"], line: "| a-1 | 20 | 404A-22G1" }).phase, 3);
  assert.equal(rowPhaseOf({ header: ["| Model | 3Phases/50Hz/400V/PF=0.8 | Engine"], line: "| a-1 | 20 | 404A-22G1" }).phase, 3);
  assert.equal(rowPhaseOf({ header: ["| Model | Phase | Engine"], line: "| a-1 | 3 | 404A-22G1" }).from, "column");
  assert.equal(rowPhaseOf({ header: ["| Model | 三相0.8或单相1.0 | Engine"], line: "| a-1 | 20 | 404A-22G1" }), null);
});

test("rowPhaseOf: tiêu đề mở bằng ô trống lệch dòng một ô, dòng có thể thừa ô cuối", () => {
  const welland = "| | GenName | ESP kVA | Phases | Freq | Engine Brand | Engine Model |";
  assert.equal(rowPhaseOf({ header: [welland], line: "| 53WC1400A01 | 1375 | 3 | 50 | Cummins | KTA50G3 | View" }).phase, 3);
  const aj = "| | Model | Frequency | Phase | R.P.M | Prime-kVA | Engine Model";
  assert.equal(rowPhaseOf({ header: [aj], line: "| AJ33 | 50hz | Single Phase | 1500 | 22.5 | 1103A-33G" }).phase, 1);
  assert.equal(rowPhaseOf({ header: ["| Frequ ency | Phase | Model"], line: "| 50 | 3 | LR4M3L-D | 86" }).phase, 3);
  assert.equal(rowPhaseOf({ header: ["| Model | Phase | Engine"], line: "| a-1 | 50 | 404A-22G1" }), null);
});

test("rowPhaseOf: căn cứ dự phòng chỉ khi không có thông tin pha nào khác", () => {
  const m = rowPhaseOf({ genset: "P2500-1P", header: [H], line: "| P2500-1P | 2500 | 2000 | 4016-61TRG3X | LL9324R" });
  assert.deepEqual([m.phase, m.basis], [1, "tên model đuôi -1P"]);
  const p = rowPhaseOf({ genset: "a-1", title: "Single Phase Diesel Generator", header: [H], line: ROW });
  assert.deepEqual([p.phase, p.basis], [1, "tên trang ghi Single Phase"]);
  assert.equal(rowPhaseOf({ genset: "a-1P", title: "Single Phase", header: [H, "| Three phase"], line: ROW }).phase, 3);
  assert.equal(rowPhaseOf({ genset: "a-1P", header: ["| Model | Phase | Engine"], line: "| a-1P | 3 | 404A-22G1" }).phase, 3);
  assert.equal(rowPhaseOf({ genset: "a-1P", header: ["| Model | Phases Voltage"], line: "| a-1P | x" }), null);
  assert.equal(rowPhaseOf({ genset: "a-1", title: "Single Phase and Three Phase Generators", header: [H], line: ROW }), null);
});

test("rowPhaseOf: hai ngoại lệ tường minh của căn cứ dự phòng (voltgent P2500-1P, acepow-fuan n136)", () => {
  const v = { supplierId: "voltgent", n: 101, genset: "P2500-1P", header: [H], line: "| P2500-1P | 2500 | 2000 | 4016-61TRG3X | LL9324R" };
  assert.equal(rowPhaseOf(v), null);
  assert.equal(rowPhaseOf({ ...v, supplierId: "khac" }).phase, 1);
  assert.equal(rowPhaseOf({ ...v, genset: "P100-1P" }).phase, 1, "chỉ đúng model trong danh sách");
  const a = { supplierId: "acepow-fuan", n: 136, genset: "APYD-10", title: "1000KVA Single Phase 75KW Portable Electric Power Generator", header: [H], line: ROW };
  assert.equal(rowPhaseOf(a), null);
  assert.equal(rowPhaseOf({ ...a, n: 137 }).phase, 1, "trang khác của cùng NCC vẫn theo luật");
  assert.equal(rowPhaseOf({ ...a, header: [H, "| Single phase"] }).phase, 1, "tiêu đề / cột pha vẫn thắng ngoại lệ");
  assert.equal(rowPhaseOf({ ...a, header: ["| Model | Phase | Engine"], line: "| APYD-10 | 3 | YD480D" }).phase, 3);
  // Gói đòi 1 pha: giữ dòng, ghi "cần xác nhận số pha" (như dòng không ghi pha), không loại.
  const list = [sup("voltgent", ["| P2500-1P | 20 | 16 | 404A-22G1 | UCI224D"])];
  const r = run(list, { ...free("Số pha: 1 pha"), phase: 1 });
  const row = r.top.find((x) => x.u.supplierId === "voltgent");
  assert.ok(row && !row.ruled?.includes("phase"));
  assert.ok(row.why.some((w) => /cần xác nhận số pha/.test(w)));
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

test("candidates: gói đòi một pha loại dòng có căn cứ ba pha, giữ dòng không có căn cứ và ghi cần xác nhận", () => {
  const baCo = sup("ba-pha-ghi", ["| c-1 | 20 | 16 | 404A-22G1 | UCI224F"], [H, "| Three phase"]);
  const r = run([one(), three(), baCo], free("Số pha: 1 pha 2 dây"));
  assert.deepEqual(r.top.map((x) => x.u.supplierId).sort(), ["ba-pha", "mot-pha"]);
  const off = r.dropped.find((x) => x.u.supplierId === "ba-pha-ghi");
  assert.ok(off.ruled.includes("phase"));
  assert.ok(off.why.some((w) => /Three phase/.test(w)));
  assert.ok(r.top.find((x) => x.u.supplierId === "ba-pha").why.some((w) => /cần xác nhận số pha/.test(w)));
  assert.ok(!r.top.find((x) => x.u.supplierId === "mot-pha").why.some((w) => /số pha/.test(w)));
});

test("candidates: đuôi -1P là một pha khi dòng không có thông tin pha khác, why ghi căn cứ", () => {
  const p = sup("duoi-1p", ["| a-1P | 20 | 16 | 404A-22G1 | UCI224D"]);
  const r = run([p, three()], free("Số pha: 3 pha 4 dây"));
  const off = r.dropped.find((x) => x.u.supplierId === "duoi-1p");
  assert.ok(off.ruled.includes("phase"));
  assert.ok(off.why.some((w) => /tên model đuôi -1P/.test(w)));
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
