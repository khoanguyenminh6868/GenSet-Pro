// node --test suppliers/*.test.mjs — kiểm tra tổ hợp của Gợi ý cấu hình (config-bot.mjs hsmtCombo / comboChecks /
// comboNotes, web/conversions.js kwe_from_kwm / bmep_4s, mã alt_excitation / alt_short_circuit), 2026-11-10.
import test from "node:test";
import assert from "node:assert/strict";
import { hsmtCombo, enginePowerOf, comboChecks, comboNotes, rfqOf, effRange, kwmOf, ratedFacts, factConflicts, altKvaOf, altKvaRange } from "./config-bot.mjs";
const CAT = globalThis.GenbidCatalog;
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

// A row of a table that states 50 Hz, whose engine figure names the engine and its speed.
const row = (eng = "284/1500") => ({ line: "| WT250 | 312/250 |", freq: 50, specs: [{ key: "engPower", label: "Engine Prime Power / Speed (KW/RPM)", value: eng }, { key: "disp", label: "Displacement", value: "14L" }], power: { prime: { kVA: 312, kW: 250 } } });
const eff = (v, label = "Efficiency (%)") => [{ key: "eff", label, value: `${v}`, line: `| ${label} | ${v}`, supplierId: "stamford" }];
const cfg = () => ({ rank: 1, engine: { model: "NTA855-G1B" }, alternator: { model: "UCI274G" }, genset: { model: "WT250" }, checks: [] });

test("comboChecks: power balance ok / low / not checked; nothing changes a check's status", () => {
  const ok = comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(92.3) });
  assert.equal(ok.combo.power.status, "ok"); assert.match(ok.combo.power.text, /\(prime, 50 Hz \/ 1500 v\/p\).*262,1 kWe ≥ 250 kWe prime \(dòng tổ máy\)/); assert.equal(ok.warnings, undefined);
  const low = comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(85) });
  assert.equal(low.combo.power.status, "low");
  assert.match(low.warnings[0], /241,4 kWe < 250 kWe prime \(dòng tổ máy\) — cần NCC xác nhận công suất động cơ \(gross\/net\) và hiệu suất đầu phát\.$/);
  // The HSMT's kW at that rating counts when it is higher.
  const req = comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(92.3), reqs: [{ code: "power_prime", item: "Công suất liên tục", requirement: "≥ 340 kVA / 272 kW" }] });
  assert.equal(req.combo.power.status, "low"); assert.match(req.combo.power.text, /272 kWe prime \(HSMT\)/);
  // Missing figures: not concluded. A "Mechanical Efficiency" (the engine's) is not the alternator's.
  assert.equal(comboChecks(cfg(), { combo: {}, row: row(), altFacts: eff(38.2, "Mechanical Efficiency (%)") }).combo.power.status, "missing");
  assert.match(comboChecks(cfg(), { combo: {}, row: { ...row(), specs: [{ key: "engPower", label: "Engine power (kW)", value: "264" }] }, altFacts: eff(92.3) }).combo.power.text, /thiếu công suất động cơ có ghi mức/);
  // Two sources whose efficiency ranges do not overlap: not used.
  const other = eff(94.5).map((f) => ({ ...f, supplierId: "reseller" }));
  assert.match(comboChecks(cfg(), { combo: {}, row: row(), altFacts: [...eff(92.3), ...other] }).combo.power.text, /không trùng khoảng: 92.3–92.3% \/ 94.5–94.5%/);
});

test("PR 3: ranges — one source's several efficiency figures; concluded only when the whole range is on one side", () => {
  // A Stamford sheet: "Efficiency (%) | 90.7 | 91.1 | 91.3" (columns: voltages / loads, titles lost) → 90.7–91.3%.
  const st = [{ key: "eff", label: "Efficiency (%)", value: "90.7 | 91.1 | 91.3", line: "| Efficiency (%) | 90.7 | 91.1 | 91.3", supplierId: "stamford-avk-china", n: 2002 }];
  assert.deepEqual((({ min, max }) => [min, max])(effRange(st)), [90.7, 91.3]);
  // 284 × 90.7% = 257.6 ≥ 250: ok. 275 kW asked: 284 × 91.3% = 259.3 < 275: low. 259 asked: inside the range: not concluded.
  assert.equal(comboChecks(cfg(), { combo: {}, row: row(), altFacts: st }).combo.power.status, "ok");
  const r2 = (kw) => ({ ...row(), power: { prime: { kVA: kw / 0.8, kW: kw } } });
  assert.equal(comboChecks(cfg(), { combo: {}, row: r2(275), altFacts: st }).combo.power.status, "low");
  const un = comboChecks(cfg(), { combo: {}, row: r2(259), altFacts: st });
  assert.equal(un.combo.power.status, "unsure"); assert.equal(un.warnings, undefined); assert.match(un.combo.power.text, /257,6–259,3 kWe so với 259 kWe prime/);
});

test("điều phối 10/11: which engine figures are the engine's (maker, names the engine, above the set's kWe)", () => {
  // An assembler's "Prime power / Speed = 144kw/1500" on a set of 144 kWe prime (fdk-energy FDK-P198): the set's kWe.
  assert.deepEqual(ratedFacts("Prime power / Speed (KW/RPM)", "144kw/1500", { setPower: { prime: { kW: 144 } } }), []);
  // Not naming the engine, from an assembler: not used even when above the set's kWe.
  assert.deepEqual(ratedFacts("Prime power / Speed (KW/RPM)", "284/1500", { setPower: { prime: { kW: 250 } } }), []);
  assert.deepEqual(ratedFacts("Engine Prime Power (kW)", "441", { setPower: { prime: { kW: 400 } } }).map((f) => [f.key, f.kW]), [["engPrime", 441]]);
  assert.deepEqual(ratedFacts("Engine Prime Power (kW)", "400", { setPower: { prime: { kW: 400 } } }), []);
  // An assembler's figure with no set kWe beside it: not used. The engine maker's: used.
  assert.deepEqual(ratedFacts("Engine Prime Power (kW)", "441"), []);
  assert.deepEqual(ratedFacts("Rated Engine Output", "571kW prp ; 625kW standby", { maker: true }).map((f) => [f.key, f.kW, f.maker]), [["engPrime", 571, true], ["engStandby", 625, true]]);
  assert.deepEqual(ratedFacts("Engine power (kW)", "264", { maker: true }), []);
  // The row's own figure goes through the same test: "Prime power / Speed" equal to the set's kWe gives nothing.
  assert.equal(kwmOf({ ...row("250/1500") }, []), null);
});

test("điều phối 10/11: the engine's kWm from the model's facts — frequency stated, maker or two sources, 3% rule", () => {
  const fact = (kW, sid, rpm = 1500, maker = false) => ({ key: "engPrime", label: "Engine Prime Power (kW)", value: `${kW}`, kW, rpm, maker, supplierId: sid, n: 101, line: `| Engine Prime Power (kW) | ${kW}` });
  const noRow = (freq) => ({ line: "| WT250 |", freq, specs: [], power: { prime: { kVA: 312, kW: 250 } } });
  // Two agreeing sources at 1500 rpm on a 50 Hz row: used.
  const ok = comboChecks(cfg(), { combo: {}, row: noRow(50), engFacts: [fact(284, "a"), fact(290, "b")], altFacts: eff(92.3) });
  assert.equal(ok.combo.power.status, "ok"); assert.match(ok.combo.power.text, /284–290 kWm \(prime, 50 Hz \/ 1500 v\/p\)/);
  // One assembler source: not used; the engine maker's alone: used.
  assert.equal(kwmOf(noRow(50), [fact(284, "a")]), null);
  assert.equal(kwmOf(noRow(50), [fact(284, "cummins", 1500, true)]).min, 284);
  assert.match(comboChecks(cfg(), { combo: {}, row: noRow(50), engFacts: [fact(284, "a"), fact(320, "b")], altFacts: eff(92.3) }).combo.power.text, /lệch > 3%: 284 \/ 320 kW/);
  // Frequency: a row that does not state it gives nothing (sanq-power "SQP220-6" are 60 Hz sets with no frequency written).
  assert.equal(kwmOf(noRow(null), [fact(284, "cummins", 1500, true)]), null);
  assert.equal(comboChecks(cfg(), { combo: {}, row: noRow(null), engFacts: [fact(284, "cummins", 1500, true)], altFacts: eff(85) }).warnings, undefined);
  // 1500 rpm figures on a 60 Hz row: no; 1800 rpm on 60 Hz: yes; no speed given: no.
  assert.equal(kwmOf(noRow(60), [fact(163, "m", 1500, true)]), null);
  assert.equal(kwmOf(noRow(60), [fact(163, "m", 1800, true)]).min, 163);
  assert.equal(kwmOf(noRow(50), [fact(163, "m", null, true)]), null);
  // factConflicts: a prime and a standby figure are not two sources that disagree; two primes 13% apart are.
  assert.equal(factConflicts([fact(284, "a"), { ...fact(313, "b"), key: "engStandby" }]).size, 0);
  assert.equal(factConflicts([fact(284, "a"), fact(320, "b")]).size, 1);
});

test("điều phối 10/11: alternator kVA lines; below the set only asks (50 Hz rows), never warns", () => {
  const built = { alternators: [{ key: CAT.keyOf("TAL-A42-C") }, { key: CAT.keyOf("FD2A-4") }, { key: CAT.keyOf("BTP3 S/2") }] };
  const sup = [{ id: "ls", specTables: [{ n: 2001, rows: ["| TAL-A42-C | kVA | 29 | 30 | 30 | 18 | 26", "| TAL-A42-C kVA | 28 | 31 | 32.5 | 36", "| Phase | 3ph. | 1ph."] }] },
    { id: "fd", specTables: [{ n: 2001, rows: ["| FD2A-4 | 额定容量（KVA） | 42.5 | 42.5 | 52.5 | 55.0"] }] },
    { id: "ma", specTables: [{ n: 2001, rows: ["| BTP3 S/2 | 2 | 13kVA | 15.6kVA"] }] }];
  const m = altKvaOf(sup, built);
  assert.deepEqual(m.get(CAT.keyOf("TAL-A42-C")).map((x) => Math.max(...x.values)), [30, 36]);
  assert.deepEqual(m.get(CAT.keyOf("FD2A-4"))[0].values, [42.5, 42.5, 52.5, 55]);
  assert.deepEqual(m.get(CAT.keyOf("BTP3 S/2"))[0].values, [13, 15.6]);
  assert.equal(altKvaRange(m.get(CAT.keyOf("TAL-A42-C"))).max, 36);
  const at = (freq, kVA) => comboChecks(cfg(), { combo: {}, row: { line: "| x |", freq, specs: [], power: { prime: { kVA, kW: kVA * 0.8 } } }, altKva: m.get(CAT.keyOf("TAL-A42-C")) });
  const c50 = at(50, 50);
  assert.equal(c50.combo.altKva.status, "below"); assert.equal(c50.warnings, undefined);
  assert.deepEqual(c50.comboAsk.map((q) => q.item), ["Công suất định mức đầu phát"]); assert.match(c50.comboAsk[0].ask, /cấp nhiệt chào.*36 kVA/);
  // 60 Hz or no frequency: nothing asked.
  assert.deepEqual(at(60, 50).comboAsk, []); assert.deepEqual(at(null, 50).comboAsk, []);
  assert.equal(at(50, 30).combo.altKva.status, "any");
  // Two sources whose highest kVA are more than 3% apart: not used.
  assert.equal(altKvaRange([{ supplierId: "a", n: 1, values: [30] }, { supplierId: "b", n: 1, values: [40] }]).conflict.length, 2);
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
