// node --test suppliers/*.test.mjs — cfg-r3 (điều phối 2026-11-11, "giảm chưa rõ ở tổ máy và đầu phát"): điểm tính được từ
// dòng nguồn của cấu hình (powerChecks, pfChecks, currentChecks, freqChecks) và thuộc tính đầu phát theo tờ hãng đã lưu
// (altSheetAttrs, altAttrChecks).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { powerChecks, pfChecks, currentChecks, freqChecks, altAttrChecks, ratedRowPower } from "./config-bot.mjs";
import { altSheetAttrs } from "./ratings.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROW = { header: ["| Model | 400V / 1500RPM | Engine | Alternator", "| Standby output | Prime Output | Model"], line: "| SD-440 | 440 | 352 | 400 | 320 | 6ETAA12.8-G21 | JET444F", title: "", power: { standby: { kVA: 440, kW: 352 }, prime: { kVA: 400, kW: 320 } } };
const cfg = (checks = []) => ({ rank: 1, alternator: { model: "UCI274H" }, checks });
const R = (code, item, requirement, extra = {}) => ({ code, item, requirement, quote: requirement, part: "genset", level: "core", ...extra });

test("ratedRowPower: a rating's column only when the header names it and both figures are in the line", () => {
  assert.deepEqual(ratedRowPower(ROW, "prime"), { kVA: 400, kW: 320 });
  assert.equal(ratedRowPower({ ...ROW, header: ["| Model | Power(kW) | Power(kVA)"], power: { rated: { kVA: 400, kW: 320 } } }, "prime"), null);
  // "KVA/KW" over a cell written kW/kVA (IB2600574589 WT-YC481 350/438): the source contradicts itself, no power.
  const odd = { header: ["| Genset Model | Prime Power | Standby Power", "| | KVA/KW | KVA/KW"], line: "| WT-YC481 | 350/438 | 385/481 | YC6T600L-D22", title: "", power: { prime: { kVA: 438, kW: 350 }, standby: { kVA: 481, kW: 385 } } };
  assert.equal(ratedRowPower(odd, "prime"), null);
});

test("powerChecks: labeled column ≥ HSMT → met; short, ceiling, not met or unlabeled → unchanged", () => {
  const P = R("power_prime", "Công suất liên tục (Prime)", "≥ 400 kVA / 320 kW (Prime)"), S = R("power_standby", "Công suất dự phòng", "≥ 440 kVA / 352 kW");
  const c = powerChecks(cfg([{ item: P.item, part: "genset", status: "unclear" }]), [P, S], ROW);
  assert.equal(c.checks[0].status, "met");
  assert.equal(c.checks[1].status, "met");
  assert.equal(c.checks[0].sourceQuote, ROW.line);
  assert.equal(powerChecks(cfg(), [R("power_prime", "P", "≥ 500 kVA")], ROW).checks.length, 0);
  const nm = powerChecks(cfg([{ item: P.item, part: "genset", status: "not_met" }]), [P], ROW);
  assert.equal(nm.checks[0].status, "not_met");
  assert.equal(powerChecks(cfg(), [P], { ...ROW, header: ["| Model | Power(kW) | Power(kVA)"] }).checks.length, 0);
});

test("pfChecks: cosφ = kW / kVA of one rating (conversions), rounding of the table's kVA allowed", () => {
  const PF = R("power_factor", "Hệ số công suất", "cosφ ≥ 0,8");
  const c = pfChecks(cfg([{ item: PF.item, part: "genset", status: "unclear" }]), [PF], ROW).checks[0];
  assert.equal(c.status, "met");
  assert.match(c.offered, /320 kW \/ 400 kVA = 0,8/);
  assert.equal(c.conversions[0].formula, "pf_from_kw_kva");
  const r313 = { ...ROW, line: "| V-344 | 344 | 275 | 313 | 250 | TAD1351GE", power: { standby: { kVA: 344, kW: 275 }, prime: { kVA: 313, kW: 250 } } };
  const d = pfChecks(cfg(), [PF], r313).checks[0];
  assert.equal(d.status, "met");
  assert.match(d.note, /làm tròn/);
  assert.equal(pfChecks(cfg(), [R("power_factor", "Hệ số công suất", "cosφ = 0,9")], ROW).checks.length, 0);
  // Only kVA in the row: nothing.
  assert.equal(pfChecks(cfg(), [PF], { ...ROW, power: { prime: { kVA: 400 } } }).checks.length, 0);
});

test("currentChecks: I = kVA × 1000 / (√3 × U) with U of the requirement or the voltage requirement", () => {
  const I = R("current", "Dòng điện định mức", "≥ 600 A tại 380 V");
  const c = currentChecks(cfg([{ item: I.item, part: "genset", status: "unclear", unverified: true }]), [I], ROW).checks[0];
  assert.equal(c.status, "met");
  assert.match(c.offered, /607,7 A/);
  assert.equal(c.unverified, undefined);
  const V = R("voltage", "Điện áp", "400/230 V");
  assert.equal(currentChecks(cfg(), [R("current", "Dòng điện định mức", "≥ 570 A"), V], ROW).checks[0].status, "met");
  assert.equal(currentChecks(cfg(), [R("current", "Dòng điện định mức", "≥ 620 A tại 380 V")], ROW).checks.length, 0);
  assert.equal(currentChecks(cfg(), [R("current", "Dòng điện định mức", "≥ 570 A"), R("voltage", "Điện áp", "380 V hoặc 400 V")], ROW).checks.length, 0);
});

test("freqChecks: 1500 rpm on the row + 4 poles on the alternator sheet → 50 Hz; no poles or a Hz on the row → unchanged", () => {
  const F = R("frequency", "Tần số", "50 Hz");
  const poles = [{ key: "poles", value: 4, lines: ["| Number of Poles | 4"] }];
  assert.equal(freqChecks(cfg(), [F], ROW, poles).checks[0].status, "met");
  assert.equal(freqChecks(cfg(), [F], ROW, []).checks.length, 0);
  assert.equal(freqChecks(cfg(), [F], { ...ROW, header: ["| Model | 400V / 50Hz / 1500RPM"] }, poles).checks.length, 0);
  assert.equal(freqChecks(cfg(), [F], ROW, [...poles, { key: "poles", value: 2, lines: ["x"] }]).checks.length, 0);
});

test("altSheetAttrs reads a saved Stamford TD sheet word for word", () => {
  const t = fs.readFileSync(path.join(HERE, "sources", "stamford-avk-china", "1012.md"), "utf8");
  const a = Object.fromEntries(altSheetAttrs(t).map((x) => [x.key, x]));
  assert.equal(a.insulation.value, "H");
  assert.equal(a.insulation.lines[0], "| INSULATION SYSTEM | CLASS H");
  assert.equal(a.thd.value, 5);
  assert.equal(a.overspeed.value, 2250);
  assert.deepEqual(a.bearings.value, [1, 2]);
  assert.ok(a.self_excited && a.pmg);
  assert.equal(a.brushless, undefined); // the sheet never writes "brushless"
  const s = Object.fromEntries(altSheetAttrs(fs.readFileSync(path.join(HERE, "sources", "stamford-avk-china", "1018.md"), "utf8")).map((x) => [x.key, x]));
  assert.equal(s.poles.value, 4);
  assert.ok(s.sc300);
});

test("altAttrChecks: met only on the sheet's words; conflicting facts, unknown terms, not met → unchanged", () => {
  const at = (key, value, line) => ({ key, value, lines: [line], model: "UCI274H", supplierId: "stamford-avk-china", n: 1012 });
  const A = [at("insulation", "H", "| INSULATION SYSTEM | CLASS H"), at("thd", 5, "| WAVEFORM DISTORTION | NO LOAD < 1.5% NON-DISTORTING BALANCED LINEAR LOAD < 5.0%"), at("overspeed", 2250, "| MAXIMUM OVERSPEED | 2250 Rev/Min"), at("bearings", [1, 2], "| 1 BEARING | 2 BEARING"), at("self_excited", true, "| CONTROL SYSTEM | SELF EXCITED")];
  const Q = (code, item, requirement) => R(code, item, requirement, { part: "alternator" });
  const reqs = [Q("alt_insulation", "Cấp cách điện", "Tối thiểu Class H"), Q("alt_thd", "THD", "≤ 5%"), Q("other", "Quá tốc độ đầu phát", "Quá tốc độ ≤ 2250 v/p"), Q("alt_bearing", "Ổ đỡ", "Một ổ đỡ"),
    Q("alt_type", "Kiểu đầu phát", "Tự kích từ"), Q("alt_type", "Kiểu 2", "Không chổi than, tự kích từ")];
  const c = altAttrChecks(cfg(), reqs, A);
  const st = Object.fromEntries(c.checks.map((x) => [x.item, x.status]));
  assert.deepEqual(st, { "Cấp cách điện": "met", THD: "met", "Quá tốc độ đầu phát": "met", "Ổ đỡ": "confirm", "Kiểu đầu phát": "met" });
  assert.equal(c.checks.find((x) => x.item === "Cấp cách điện").sourceQuote, "| INSULATION SYSTEM | CLASS H");
  // Another source of the model says class F: unchanged.
  assert.equal(altAttrChecks(cfg(), [reqs[0]], A, [{ key: "insul", label: "Insulation", value: "F" }]).checks.length, 0);
  // Class H asked "hoặc C" → H met; class F asked exactly → not met by H, unchanged.
  assert.equal(altAttrChecks(cfg(), [Q("alt_insulation", "Cấp", "Class H hoặc C")], A).checks[0].status, "met");
  assert.equal(altAttrChecks(cfg(), [Q("alt_insulation", "Cấp", "Cấp F")], A).checks.length, 0);
  // A not met stays.
  assert.equal(altAttrChecks(cfg([{ item: "Cấp cách điện", part: "alternator", status: "not_met" }]), [reqs[0]], A).checks[0].status, "not_met");
  // Overspeed other than the sheet's figure, poles with more asked, AREP: unchanged.
  assert.equal(altAttrChecks(cfg(), [Q("other", "Quá tốc độ", "Quá tốc độ 2700 v/p")], A).checks.length, 0);
  assert.equal(altAttrChecks(cfg(), [Q("alt_poles", "Số cực", "4 cực, 3 pha, 6 dây")], [...A, at("poles", 4, "| Number of Poles | 4")]).checks.length, 0);
  assert.equal(altAttrChecks(cfg(), [Q("alt_poles", "Số cực", "4 cực")], [...A, at("poles", 4, "| Number of Poles | 4")]).checks[0].status, "met");
  assert.equal(altAttrChecks(cfg(), [Q("alt_type", "Kiểu", "AREP")], A).checks.length, 0);
  // Two sheets of the model that differ: unchanged.
  assert.equal(altAttrChecks(cfg(), [reqs[0]], [...A, at("insulation", "F", "| INSULATION SYSTEM | CLASS F")]).checks.length, 0);
});
