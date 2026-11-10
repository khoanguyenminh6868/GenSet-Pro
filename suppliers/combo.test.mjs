// node --test suppliers/*.test.mjs — kiểm tra tổ hợp của Gợi ý cấu hình (config-bot.mjs hsmtCombo / comboChecks /
// comboNotes, web/conversions.js kwe_from_kwm / bmep_4s, mã alt_excitation / alt_short_circuit), 2026-11-10.
import test from "node:test";
import assert from "node:assert/strict";
import { hsmtCombo, enginePowerOf, comboChecks, comboNotes, rfqOf } from "./config-bot.mjs";
import { codeOf, codesIn } from "./reqcodes.mjs";
const CONV = globalThis.GenbidConversions;

test("conversions: kWe from kWm and the alternator's efficiency; BMEP of a 4-stroke engine", () => {
  const e = CONV.compute({ formula: "kwe_from_kwm", inputs: [{ name: "P_kWm", value: 284 }, { name: "eff_pct", value: 92.3 }] });
  assert.ok(Math.abs(e.value - 262.132) < 1e-9);
  const b = CONV.compute({ formula: "bmep_4s", inputs: [{ name: "P_kW", value: 284 }, { name: "V_L", value: 14 }, { name: "n_rpm", value: 1500 }] });
  assert.ok(Math.abs(b.value - 16.2286) < 1e-3);
  for (const f of ["kwe_from_kwm", "bmep_4s"]) assert.ok(CONV.FORMULAS[f].basis.length > 20);
  assert.match(CONV.compute({ formula: "bmep_4s", inputs: [{ name: "P_kW", value: 284 }, { name: "V_L", value: 0 }, { name: "n_rpm", value: 1500 }] }).error, /không phải số dương/);
});

test("hsmtCombo: site above 40 °C / 1 000 m only; overload on the standby rating; load step; load types", () => {
  assert.deepEqual(hsmtCombo("Nhiệt độ môi trường lớn nhất 45oC\nNhiệt độ môi trường nhỏ nhất 0oC").site, { temp: 45, alt: null, quote: "Nhiệt độ môi trường lớn nhất 45oC" });
  assert.equal(hsmtCombo("Nhiệt độ làm việc ≥ 40 °C").site, null);
  assert.equal(hsmtCombo("Độ cao lắp đặt: 1.500 m so với mực nước biển").site.alt, 1500);
  assert.equal(hsmtCombo("khung thép cường độ cao 2000 m").site, null);
  assert.match(hsmtCombo("Khả năng quá tải 10% trên công suất dự phòng (Standby) trong 1 giờ").overloadEsp.quote, /dự phòng/);
  assert.equal(hsmtCombo("Khả năng chạy quá tải 110% công suất liên tục trong 01 giờ mỗi 12 giờ").overloadEsp, null);
  assert.ok(hsmtCombo("Đáp ứng ISO 8528-5 Class G2 / G3").loadStep);
  // A requirement of bare ISO 8528 compliance is not a load step one.
  assert.equal(hsmtCombo("Tiêu chuẩn ISO 8528", [{ code: "iso8528_class", requirement: "ISO 8528", quote: "Tiêu chuẩn ISO 8528" }]).loadStep, null);
  assert.equal(hsmtCombo("x", [{ code: "load_step", requirement: "Nhận 100% tải một bước", quote: "nhận 100% tải" }]).loadStep.quote, "nhận 100% tải");
  const t = (s) => hsmtCombo(s).loadTypes.map((l) => l.type);
  assert.deepEqual(t("Cấp điện cho bơm chữa cháy 75 kW"), ["fire_pump"]);
  assert.deepEqual(t("Nhà thầu tuân thủ quy định về phòng cháy chữa cháy"), []);
  assert.deepEqual(t("19 Quá tải 300% (3 IN) trong 10\n%\ngiây"), ["short300"]);
  assert.deepEqual(t("Kích từ nam châm vĩnh cửu (PMG)"), ["excitation"]);
  assert.deepEqual(t("Phụ tải gồm UPS 60 kVA và biến tần bơm"), ["ups", "vfd"]);
});

test("enginePowerOf: only a figure whose rating the row names", () => {
  const row = (label, value) => ({ line: "| r", specs: [{ key: "engPower", label, value }] });
  assert.deepEqual((({ prime, rpm }) => ({ prime, rpm }))(enginePowerOf(row("Prime power / Speed (KW/RPM)", "284/1500"))), { prime: 284, rpm: 1500 });
  assert.equal(enginePowerOf(row("Engine Prime Power (kW)", "441")).prime, 441);
  const two = enginePowerOf(row("Rated Engine Output", "571kW prp ; 625kW standby"));
  assert.deepEqual([two.prime, two.standby], [571, 625]);
  const ps = enginePowerOf(row("Engine Power(kw) (prime/standby)", "110/121"));
  assert.deepEqual([ps.prime, ps.standby], [110, 121]);
  assert.equal(enginePowerOf(row("Engine power (kW)", "264")), null);
  assert.equal(enginePowerOf(row("Engine power", "380 hp")), null);
});

const row = (eng = "284/1500") => ({ line: "| WT250 | 312/250 |", specs: [{ key: "engPower", label: "Prime power / Speed (KW/RPM)", value: eng }, { key: "disp", label: "Displacement", value: "14L" }], power: { prime: { kVA: 312, kW: 250 } } });
const eff = (v, label = "Efficiency (%)") => [{ key: "eff", label, value: `${v}`, line: `| ${label} | ${v}`, supplierId: "stamford" }];
const cfg = () => ({ rank: 1, engine: { model: "NTA855-G1B" }, alternator: { model: "UCI274G" }, genset: { model: "WT250" }, checks: [] });

test("comboChecks: power balance ok / low / not checked; nothing changes a check's status", () => {
  const ok = comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(92.3) });
  assert.equal(ok.combo.power.status, "ok"); assert.match(ok.combo.power.text, /262,1 kWe ≥ 250 kWe prime \(dòng tổ máy\)/); assert.equal(ok.warnings, undefined);
  const low = comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(85) });
  assert.equal(low.combo.power.status, "low"); assert.match(low.warnings[0], /241,4 kWe < 250 kWe/);
  // The HSMT's kW at that rating counts when it is higher.
  const req = comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(92.3), reqs: [{ code: "power_prime", item: "Công suất liên tục", requirement: "≥ 340 kVA / 272 kW" }] });
  assert.equal(req.combo.power.status, "low"); assert.match(req.combo.power.text, /272 kWe prime \(HSMT\)/);
  // Missing figures: not concluded. A "Mechanical Efficiency" (the engine's) is not the alternator's.
  assert.equal(comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(38.2, "Mechanical Efficiency (%)") }).combo.power.status, "missing");
  assert.match(comboChecks(cfg(), { combo: {}, row: { ...row(), specs: [{ key: "engPower", label: "Engine power (kW)", value: "264" }] }, altFacts: eff(92.3) }).combo.power.text, /thiếu công suất động cơ có ghi mức/);
  assert.match(comboChecks(cfg(), { combo: {}, row: row(), altFacts: [...eff(92.3), ...eff(94.5)] }).combo.power.text, /nguồn ghi khác nhau: 92.3 \/ 94.5/);
});

test("comboChecks: BMEP for reference and questions for the supplier (load step, site, load types)", () => {
  const combo = hsmtCombo("Đáp ứng ISO 8528-5 Class G2 / G3. Nhiệt độ môi trường 45°C. Đầu phát kích từ PMG, chịu ngắn mạch duy trì 300% trong 10 giây.");
  const c = comboChecks(cfg(), { combo, row: row(), altFacts: eff(92.3) });
  assert.ok(Math.abs(c.combo.bmep.value - 16.2286) < 1e-3); assert.match(c.combo.bmep.text, /tham khảo/);
  const items = c.comboAsk.map((q) => q.item);
  assert.deepEqual(items, ["Nhận tải một bước / ISO 8528-5", "Điều kiện hiện trường", "Loại tải: Dòng ngắn mạch duy trì 300% / 10 s", "Loại tải: Kích từ PMG / AREP"]);
  assert.match(c.comboAsk[0].ask, /BMEP tham khảo 16,2 bar/);
  assert.ok(c.comboAsk.every((q) => q.status === "unclear"));
  // A met check of the code takes its load-type question away; an ambient requirement carries the site question itself.
  const reqs = [{ item: "Kích từ đầu phát (PMG / AREP)", code: "alt_excitation" }, { item: "Nhiệt độ môi trường làm việc", code: "ambient" }];
  const c2 = cfg(); c2.checks = [{ item: "Kích từ đầu phát (PMG / AREP)", status: "met" }];
  assert.deepEqual(comboChecks(c2, { combo, row: row(), reqs }).comboAsk.map((q) => q.item), ["Nhận tải một bước / ISO 8528-5", "Loại tải: Dòng ngắn mạch duy trì 300% / 10 s"]);
  // rfqOf lists them with the part they are about.
  const q = rfqOf(c, []);
  assert.ok(q.some((x) => x.item === "Loại tải: Kích từ PMG / AREP" && x.of === "Đầu phát UCI274G"));
});

test("comboNotes: an overload on the standby rating asks for the HSMT to be clarified, once", () => {
  const r = { notes: ["x"] }, combo = hsmtCombo("Khả năng quá tải 10% công suất dự phòng ESP");
  comboNotes(r, combo); comboNotes(r, combo);
  assert.equal(r.notes.filter((n) => /Cần làm rõ HSMT/.test(n)).length, 1);
  assert.match(r.notes[1], /ISO 8528-1/);
  comboNotes(r, hsmtCombo("không có"));
  assert.deepEqual(r.notes, ["x"]);
});

test("reqcodes: excitation and sustained short circuit have codes of their own", () => {
  assert.equal(codeOf({ item: "Kích từ nam châm vĩnh cửu (PMG)", part: "alternator" }), "alt_excitation");
  assert.equal(codeOf({ item: "Dòng ngắn mạch duy trì", part: "alternator" }), "alt_short_circuit");
  assert.ok(codesIn("Quá tải 300% (3 IN) trong 10 giây").some((c) => c.code === "alt_short_circuit"));
  assert.equal(codeOf({ item: "Kiểu đầu phát", requirement: "Không chổi than, tự kích từ", part: "alternator" }), "alt_type");
  assert.equal(codeOf({ item: "Bảo vệ ngắn mạch", part: "controller" }), "ctl_protection");
});
