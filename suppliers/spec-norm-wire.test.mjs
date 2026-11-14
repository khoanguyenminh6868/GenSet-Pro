// node --test suppliers/*.test.mjs — lớp chuẩn hoá nối vào so số của config-bot sau cờ GENBID_SPEC_NORM=1 (việc
// noi-chuan-hoa, 14/11/2026: chỉ đo, cờ mặc định tắt). Tắt: như trước (bộ test cũ khoá hành vi). Bật: số nguồn thiếu đơn
// vị / mức tải / khoảng cách / trần-vỏ, hoặc nhiều giá trị, không được so → "Chưa rõ", ứng viên giữ lại không trừ điểm.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, khoaRules, normFig, enginePowerOf, specNormOn } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const on = (f) => { process.env.GENBID_SPEC_NORM = "1"; try { return f(); } finally { delete process.env.GENBID_SPEC_NORM; } };
const sup = (id, rows, header, title = "Gensets 50Hz") => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title, header: [header], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, hints) => candidates(C.build(list), { value: 400, unit: "kVA" }, hints, { suppliers: list });

test("the flag is off by default", () => {
  delete process.env.GENBID_SPEC_NORM;
  assert.equal(specNormOn(), false);
  assert.equal(on(specNormOn), true);
  process.env.GENBID_SPEC_NORM = "fuel";
  try { assert.deepEqual(["fuel", "disp", "other"].map(specNormOn), [true, false, false]); assert.equal(specNormOn(), true); }
  finally { delete process.env.GENBID_SPEC_NORM; }
  process.env.GENBID_SPEC_NORM = "0";
  try { assert.equal(specNormOn(), false); } finally { delete process.env.GENBID_SPEC_NORM; }
});

test("by group: fuel on alone leaves a displacement in cc compared as before", () => {
  const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (cc) |";
  const list = [sup("cc", ["| c-1 | 420 | 336 | WP13D405E200 | XY1 | 11000 |"], H)];
  const h = free("Dung tích xi lanh ≥ 12 lít\n50 Hz");
  process.env.GENBID_SPEC_NORM = "fuel";
  try { assert.deepEqual(run(list, h).dropped.map((d) => d.ruled), [["disp"]]); } finally { delete process.env.GENBID_SPEC_NORM; }
  process.env.GENBID_SPEC_NORM = "disp";
  try { assert.equal(run(list, h).dropped.length, 0); } finally { delete process.env.GENBID_SPEC_NORM; }
});

test("normFig: fuel needs L/h at the HSMT's load; noise its distance; weight / size open or canopied", () => {
  assert.deepEqual(normFig({ key: "fuel", label: "Fuel Consumption (L/h)", value: "99" }, { header: [] }, { unit: "L/h", load: 100 }).why, ["load"]);
  assert.equal(normFig({ key: "fuel", label: "Fuel consumption 100% load (L/h)", value: "99" }, { header: [] }, { unit: "L/h", load: 100 }).r.num, 99);
  assert.deepEqual(normFig({ key: "fuel75", label: "Fuel consumption 75% load (L/h)", value: "74" }, { header: [] }, { unit: "L/h", load: 75 }).why, []);
  assert.deepEqual(normFig({ key: "fuel", label: "Fuel consumption 100% load", value: "230 g/kWh" }, { header: [] }, { unit: "L/h", load: 100 }).why, ["đơn vị g/kWh"]);
  assert.deepEqual(normFig({ key: "noise", label: "Noise dB(A)", value: "72" }, { header: [] }, { unit: ["dB(A)", "dB"], distance: 7 }).why, ["distance"]);
  assert.equal(normFig({ key: "noise", label: "Noise level dB(A)@7m", value: "72" }, { header: [] }, { unit: ["dB(A)", "dB"], distance: 7 }).ok, true);
  assert.deepEqual(normFig({ key: "noise", label: "Noise level dB(A)@1m", value: "72" }, { header: [] }, { unit: ["dB(A)", "dB"], distance: 7 }).why, ["khoảng cách 1 m"]);
  assert.deepEqual(normFig({ key: "weight", label: "Gross Weight(kg)", value: "3550" }, { header: [] }, { unit: "kg" }).why, ["enclosure"]);
  assert.equal(normFig({ key: "weight", label: "Weight (kg)", value: "3550" }, { title: "Open type diesel generator", header: [] }, { unit: "kg" }).ok, true);
  assert.deepEqual(normFig({ key: "weight", label: "Weight (kg)", value: "3550" }, { title: "Open type diesel generator", header: [] }, { unit: "kg", enclosure: "enclosed" }).why, ["bản open"]);
  // Displacement in cc: no formula in web/conversions.js, not compared with litres.
  assert.deepEqual(normFig({ key: "disp", label: "Displacement (cc)", value: "11000" }, { header: [] }, { unit: "L" }).why, ["đơn vị cc"]);
});

test("candidates: a fuel figure whose heading names no load is not compared under the flag (kept, no points off)", () => {
  const H100 = "| Model | Prime kVA | Prime kW | Engine | Alternator | Fuel consumption 100% load (L/h) |", HNL = "| Model | Prime kVA | Prime kW | Engine | Alternator | Fuel Consumption (L/h) |";
  const list = [sup("nl", ["| n-1 | 420 | 336 | WP13D405E200 | XY1 | 99 |"], HNL), sup("fl", ["| f-1 | 420 | 336 | YC6K520-D30 | XY1 | 99 |"], H100)];
  const h = free("Tiêu hao nhiên liệu ở 100% tải ≤ 90 L/h\n50 Hz");
  const off = run(list, h), x = off.top.find((r) => r.u.supplierId === "nl");
  assert.equal(x.fuelNoLoad, true);
  assert.deepEqual(off.dropped.map((d) => d.u.supplierId), ["fl"]);
  assert.ok(!("normSkip" in x));
  const n = on(() => run(list, h)), y = n.top.find((r) => r.u.supplierId === "nl");
  assert.equal(y.fuelOver, false); assert.equal(y.fuelNoLoad, false);
  assert.equal(y.score, x.score + 300);
  assert.deepEqual(y.normSkip.map((s) => [s.key, s.why]), [["fuel", ["load"]]]);
  // The 100% figure written with its load is still left out.
  assert.deepEqual(n.dropped.map((d) => [d.u.supplierId, d.ruled]), [["fl", ["fuel"]]]);
});

test("candidates: a displacement in cc is not compared with the HSMT's litres under the flag", () => {
  const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (cc) |";
  const list = [sup("cc", ["| c-1 | 420 | 336 | WP13D405E200 | XY1 | 11000 |"], H)];
  const h = free("Dung tích xi lanh ≥ 12 lít\n50 Hz");
  assert.deepEqual(run(list, h).dropped.map((d) => d.ruled), [["disp"]]);
  const n = on(() => run(list, h));
  assert.equal(n.dropped.length, 0);
  assert.deepEqual(n.top.map((r) => r.u.supplierId), ["cc"]);
});

test("candidates: a source the layer cannot compare keeps the row (Chưa rõ), even when another source is below", () => {
  const H1 = "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) |", H2 = "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement |";
  // Two suppliers of one engine: 5.9 L (with unit) below 8.3 L, and "8.3" with no unit.
  const list = [sup("u", ["| u-1 | 420 | 336 | 6BTAA5.9-G2 | XY1 | 5.9 |"], H1), sup("n", ["| n-1 | 420 | 336 | 6BTAA5.9-G2 | XY1 | 8.3 |"], H2)];
  const h = free("Dung tích xi lanh ≥ 8,3 lít\n50 Hz");
  // Off: "8.3" is read as litres, so not every source is below. On: it has no unit, which blocks the drop too.
  assert.equal(run(list, h).dropped.length, 0);
  const n = on(() => run(list, h));
  assert.equal(n.dropped.length, 0);
  assert.ok(n.top.every((r) => r.normSkip.some((s) => s.key === "disp" && s.why.includes("unit"))));
  // With only the source of known unit, the row is left out under either flag.
  assert.deepEqual(on(() => run(list.slice(0, 1), h)).dropped.map((d) => d.ruled), [["disp"]]);
});

test("khoaRules: a weight with no open / canopy written is compared off, \"Chưa rõ\" under the flag", () => {
  const ROW = { header: ["| Model | Prime kVA | Prime kW | Engine | Gross Weight(kg)"], line: "| SD-440 | 400 | 320 | 6ETAA12.8-G21 | 3550", title: "", power: { prime: { kVA: 400, kW: 320 } },
    specs: [{ key: "weight", label: "Gross Weight(kg)", value: "3550" }] };
  const W = { code: "weight", item: "Khối lượng", requirement: "≤ 3000 kg", quote: "≤ 3000 kg", part: "genset", level: "core" };
  assert.equal(khoaRules({ rank: 1, checks: [] }, [W], ROW).checks[0].status, "not_met");
  const x = on(() => khoaRules({ rank: 1, checks: [] }, [W], ROW)).checks[0];
  assert.equal(x.status, "unclear"); assert.equal(x.rule, "chuan-hoa"); assert.match(x.note, /trần hay có vỏ/);
  // The build written in the cell: compared. (Written in the header or table title, khoaRules leaves it unchanged under
  // either flag: its older guard against a table of two builds.)
  const open = { ...ROW, specs: [{ key: "weight", label: "Gross Weight(kg)", value: "3550 (open type)" }] };
  assert.equal(on(() => khoaRules({ rank: 1, checks: [] }, [W], open)).checks[0].status, "not_met");
  assert.equal(khoaRules({ rank: 1, checks: [] }, [W], { ...ROW, title: "Open type diesel generator set" }).checks.length, 0);
});

test("enginePowerOf: two figures with no rating per figure are not used under the flag", () => {
  const row = { line: "| X | 284/312 |", header: ["| Model | Engine power (kW) |"], specs: [{ key: "engPower", label: "Engine Prime power (kW)", value: "284" }] };
  assert.ok(enginePowerOf(row));
  assert.ok(on(() => enginePowerOf(row)));
  const amb = { ...row, specs: [{ key: "engPower", label: "Engine Prime power (kW)", value: "284/312" }] };
  assert.ok(enginePowerOf(amb));
  assert.equal(on(() => enginePowerOf(amb)), null);
});
