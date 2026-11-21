// node --test suppliers/*.test.mjs — 2026-11-12 audit of 1,162 tenders: minimums of the HSMT read wrong (and, since #555, the
// rows left out for them). Every case is the HSMT's own line.
import test from "node:test";
import assert from "node:assert/strict";
import { engineMins, powerMins, hintsOf, litres, candidates } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "Chương V. Yêu cầu kỹ thuật\n";

test("a '<' / 'nhỏ hơn' / 'dưới' figure is a largest displacement, never a least one (IB2300260615, IB2400564384, IB2500360231)", () => {
  // IB2300260615: label and figure on two lines.
  let m = engineMins("Kiểu động cơ\nĐộng cơ đốt trong, 4 kỳ, có tăng áp và làm mát khí nạp\n 2.5\nDung tích xi lanh\n< 20 lít\n\n 2.6\nSố xi lanh\n");
  assert.equal(m.minDisp, null); assert.equal(m.maxDisp, 20);
  // IB2400564384: one line.
  m = engineMins(" 2.5   Dung tích xi lanh                     < 20 lít\n");
  assert.equal(m.minDisp, null); assert.equal(m.maxDisp, 20);
  // IB2500360231: no accent on "lit", no space after the sign.
  m = engineMins("- Bộ làm mát nhiên liệu Có\n- Dung tích xi lanh <78 lit\n- Hệ thông làm mát tiêu chuân Két nước ở nhiệt độ môi trường <40°C\n");
  assert.equal(m.minDisp, null); assert.equal(m.maxDisp, 78);
  assert.equal(engineMins("Dung tích xi lanh: nhỏ hơn 15 lít").minDisp, null);
  assert.equal(engineMins("Dung tích xi lanh: dưới 15 lít").maxDisp, 15);
  // "không nhỏ hơn" is a least one, as before; "<=" and "≤" as before.
  assert.equal(engineMins("Dung tích xi lanh không nhỏ hơn 9 lít").minDisp, 9);
  assert.equal(engineMins("Dung tích xi lanh ≤ 15,2 L").maxDisp, 15.2);
});

test("the displacement is that of the cylinders: coolant, oil, tank are not (IB2300214975, IB2500314401, IB2300031444)", () => {
  let m = engineMins("Dung tích xy lanh: ≥ 9.7 L\nTổng dung tích nhớt: ≥ 26L\nTổng dung tích làm mát: ≥ 22L\n");
  assert.equal(m.minDisp, 9.7);
  m = engineMins("5\nDung tích xylanh\n≥ 12.5 L\n6\nCông suất tối đa  ( KW ) ở tốc độ 1500 vòng/phút\n≥ 460 KW\n9\nHệ thống làm mát\nLàm mát bằng nước\n10\nTổng dung tích làm mát \n≥ 55L\n15\n Tổng dung tích nhớt \n≥ 30L\n");
  assert.equal(m.minDisp, 12.5);
  m = engineMins("Dung tích xy lanh: ≤ 9.84 L. Đường kính x Hành trình piston (mm): ≥ 118 x\nTổng dung tích nhớt: ≥ 34.5L\nKiểu nạp khí: Tối thiểu loại Turbo tăng áp và làm mát khí nạp\nDung tích làm mát: ≥ 42L\n");
  assert.equal(m.maxDisp, 9.84); assert.equal(m.minDisp, null);
  // A label of a displacement that names no part is none; one that names the engine or the cylinders is.
  assert.equal(engineMins("Dung tích: ≥ 55 L").minDisp, null);
  assert.equal(engineMins("Dung tích làm mát ≥ 55 L").minDisp, null);
  assert.equal(engineMins("Dung tích động cơ ≥ 12 L").minDisp, 12);
  assert.equal(engineMins("Displacement ≥ 12 L").minDisp, 12);
  // The label split over the lines around the figure (IB2500280002).
  assert.equal(engineMins("Tổng dung tích\n8     ≥ 0.79 lít\nxilanh\n").minDisp, 0.79);
});

test("a displacement over 100 L is litres when it has its unit; cc / cm³ / ml are divided (Yuchai YC16VC 105,56 L)", () => {
  assert.equal(litres("105,56 L"), 105.56);
  assert.equal(litres("105.56 L"), 105.56);
  assert.equal(litres("105.56 lít"), 105.56);
  assert.equal(litres("37.8"), 37.8);
  assert.equal(litres("12 L"), 12);
  assert.equal(litres("2197 cc"), 2.197);
  assert.equal(litres("2.197 cm³"), 2.197);
  assert.equal(litres("499 cc"), 0.499);
  assert.equal(litres("4087"), 4.087);
  assert.equal(litres("105.56"), null, "no unit, 100..130: litres or cc, none");
  assert.equal(litres("2,5 lít"), 2.5);
  // Through the rows: a 105.56 L engine is not 0.1 L, so it is not under a minimum of 14.5 L; its (L) is in the label.
  const t = (row) => [{ n: 101, title: "Yuchai gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) |"], rows: [row] }];
  const list = [{ id: "yc", country: "CN", confidence: "high", specTables: t("| G-1 | 3000 | 2400 | YC16VC3300-D31 | NFS5-F | 105.56 |") }];
  const hints = { ...hintsOf(H + "Dung tích xy lanh ≥ 14,5 L"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] };
  const r = candidates(C.build(list), { value: 3000, unit: "kVA" }, hints, { suppliers: list });
  assert.equal(r.dropped.length, 0);
});

test("a Standby figure after 'Prime/' is not the prime (IB2200021335)", () => {
  assert.equal(powerMins("Máy phát điện 163kVA liên tục Prime/180kVA dự phòng Standby\n").minPrime, null);
  assert.equal(powerMins("Máy phát điện 163 kVA Prime/180kVA Standby. Mới 100%. Lắp ráp năm 2021 – 2022:\n").minPrime, null);
  // The label before its figure is as before.
  assert.equal(powerMins("Công suất liên tục (Prime) ≥ 400 kVA\n").minPrime?.kVA, 400);
});

test("a decomposed (NFD) text reads the same as the composed one", () => {
  const text = H + "II. Yêu cầu đối với động cơ\n- Số xy lanh: ≥ 8 xy lanh\n- Dung tích xy lanh ≥ 14,5 L\n- Công suất liên tục ≥ 400 kVA\n- Tiêu hao nhiên liệu ở 100% tải ≤ 91 Lít/giờ\n";
  const a = hintsOf(text), b = hintsOf(text.normalize("NFD"));
  for (const k of ["minDisp", "minCyl", "minPrime", "maxFuel", "maxDisp"]) assert.deepEqual(b[k], a[k], k);
  assert.equal(b.minDisp, 14.5); assert.equal(b.minCyl, 8);
  assert.notEqual(text.normalize("NFD"), text);
});
