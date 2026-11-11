// node --test suppliers/*.test.mjs — Gợi ý cấu hình cfg-r4 (Khoa duyệt 11/11 "ok làm đi", qua điều phối):
// (A) khởi động / làm mát → "xác nhận khi đặt hàng" khi nguồn không ghi; (B) nguồn ghi khác nhau → theo tờ thông số
// chính hãng đúng mã model.
import test from "node:test";
import assert from "node:assert/strict";
import { check, modelFacts, khoaRules, makerSheetChecks, rfqOf, rfqPoints } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const ROW = { header: ["| Model | 400V / 1500RPM | Engine | Alternator", "| Standby output | Prime Output | Model"], line: "| SD-440 | 440 | 352 | 400 | 320 | 6ETAA12.8-G21 | JET444F", title: "SDEC diesel generator set", power: { standby: { kVA: 440, kW: 352 }, prime: { kVA: 400, kW: 320 } } };
const cfg = (checks = []) => ({ rank: 1, engine: { model: "NTA855-G1B" }, alternator: { model: "UCI274H" }, checks });
const R = (code, item, requirement, extra = {}) => ({ code, item, requirement, quote: requirement, part: "engine", level: "core", ...extra });
const ST = R("starting", "Hệ thống khởi động", "Đề điện 24 VDC, ắc quy, sạc tự động"), CO = R("cooling", "Hệ thống làm mát động cơ", "Két nước + quạt gió");

// ---------- (A) khởi động / làm mát ----------
test("A: starting / cooling the row does not state, agent 'Nguồn không ghi' → confirm order; offered kept", () => {
  const c = khoaRules(cfg([{ item: ST.item, part: "engine", status: "unclear", offered: "Nguồn không ghi" }, { item: CO.item, part: "engine", status: "unclear", offered: "Chưa rõ" }]), [ST, CO], ROW);
  assert.deepEqual(c.checks.map((x) => [x.item, x.status, x.confirm, x.rule, x.was]), [[ST.item, "confirm", "order", "khoi-dong-lam-mat", "unclear"], [CO.item, "confirm", "order", "khoi-dong-lam-mat", "unclear"]]);
  assert.equal(c.checks[0].offered, "Nguồn không ghi");
  assert.match(c.checks[0].note, /ắc quy, bộ sạc, két nước và quạt do nhà lắp ráp chọn theo đơn hàng/);
  assert.match(c.checks[0].why, /đơn hàng/);
  // No check written yet: one is added, confirmed.
  const n = khoaRules(cfg(), [ST], ROW).checks[0];
  assert.deepEqual([n.status, n.confirm, n.byCode], ["confirm", "order", true]);
});

test("A: the source states it (row figure, row / header / title words, agent's quote or figure) → unchanged", () => {
  const un = (row, checks = [{ item: ST.item, part: "engine", status: "unclear", offered: "" }], reqs = [ST]) => khoaRules(cfg(checks), reqs, row).checks[0]?.status;
  assert.equal(un({ ...ROW, specs: [{ key: "start", label: "Starting", value: "24V DC Electric Start" }] }), "unclear");
  assert.equal(un({ ...ROW, header: [...ROW.header, "| Starting Method"] }), "unclear");
  assert.equal(un({ ...ROW, line: `${ROW.line} | DC24V` }), "unclear");
  assert.equal(un(ROW, [{ item: ST.item, part: "engine", status: "unclear", offered: "Đề 24 V DC; ắc quy, sạc chưa ghi", sourceQuote: "| Starting | 24V DC Electric Start" }]), "unclear");
  assert.equal(un(ROW, [{ item: ST.item, part: "engine", status: "unclear", offered: "Ắc quy 1 x 24 Ah" }]), "unclear");
  assert.equal(un(ROW, [{ item: ST.item, part: "engine", status: "unclear", offered: "Nguồn ghi khác nhau" }]), "unclear");
  // "Water Cooled" in the table title states the cooling: compared by the agent, not confirmed.
  assert.equal(un({ ...ROW, title: "WEICHAI Water Cooled Diesel Generator" }, [{ item: CO.item, part: "engine", status: "unclear", offered: "Nguồn không ghi" }], [CO]), "unclear");
  // A word of another figure ("Turbocharged") is not the starting system.
  assert.equal(un({ ...ROW, line: `${ROW.line} | Turbocharged` }), "confirm");
});

test("A: met / not met / a conflict stay; no row of its own → unchanged; other engine codes untouched", () => {
  for (const st of ["met", "not_met"]) assert.equal(khoaRules(cfg([{ item: ST.item, part: "engine", status: st, offered: "12 VDC", sourceQuote: "x" }]), [ST], ROW).checks[0].status, st);
  assert.equal(khoaRules(cfg([{ item: ST.item, part: "engine", status: "unclear", conflict: true, offered: "" }]), [ST], ROW).checks[0].status, "unclear");
  assert.equal(khoaRules(cfg([{ item: ST.item, part: "engine", status: "unclear", offered: "Nguồn không ghi" }]), [ST], null).checks[0].status, "unclear");
  assert.equal(khoaRules(cfg(), [ST], null).checks.length, 0);
  for (const [code, item] of [["engine_type", "Kiểu động cơ"], ["governor", "Bộ điều tốc"], ["fuel_system", "Hệ thống nhiên liệu"], ["emission", "Khí thải"], ["aspiration", "Nạp khí"], ["speed", "Tốc độ"]])
    assert.equal(khoaRules(cfg(), [R(code, item, "Theo tiêu chuẩn nhà sản xuất")], ROW).checks.length, 0, code);
});

test("A: cooling with an ambient temperature — the temperature is the ambient rule's, not counted twice", () => {
  const CT = R("cooling", "Hệ thống làm mát động cơ", "Két nước + quạt đầu trục, nhiệt độ môi trường ≥ 50°C"), AM = R("ambient", "Nhiệt độ môi trường làm việc", "≥ 40 °C", { part: "genset" });
  // Another requirement asks the temperature: there it is decided (site rule), the cooling note points to it.
  const c = khoaRules(cfg(), [CT, AM], ROW);
  assert.deepEqual(c.checks.map((x) => [x.item, x.status, x.rule]), [[CT.item, "confirm", "khoi-dong-lam-mat"], [AM.item, "confirm", "vo-may"]]);
  assert.match(c.checks[0].note, /mục nhiệt độ môi trường/);
  // None does, the row gives no temperature: confirmed with the radiator, as the ambient rule would.
  const o = khoaRules(cfg(), [CT], ROW).checks[0];
  assert.equal(o.status, "confirm");
  assert.match(o.note, /Nhiệt độ môi trường HSMT nêu cũng không có/);
  // None does, the row gives a temperature: unchanged (the ambient rule does not compare it).
  assert.equal(khoaRules(cfg(), [CT], { ...ROW, line: `${ROW.line} | 40°C` }).checks.length, 0);
});

test("A: the confirm points stay in the supplier questionnaire, at 'Xác nhận khi đặt hàng' (rfqOf tier 4)", () => {
  const reqs = [ST, CO], un = () => cfg([{ item: ST.item, part: "engine", status: "unclear", offered: "Nguồn không ghi" }, { item: CO.item, part: "engine", status: "unclear", offered: "" }]);
  const before = rfqPoints(rfqOf(un(), reqs)), q = rfqOf(khoaRules(un(), reqs, ROW), reqs);
  assert.equal(rfqPoints(q), before);
  assert.ok(q.filter((x) => (x.items || [x]).some((i) => i.item === ST.item || i.item === CO.item)).every((x) => x.tier === 4));
});

// ---------- (B) theo tờ thông số chính hãng ----------
const F = (key, value, supplierId, sheet = false, n = 101) => ({ key, value, supplierId, n, line: `| ${key} | ${value}`, text: `| ${key} | ${value}`, ...(sheet ? { sheet: true } : {}) });
const CR = R("compression", "Tỷ số nén", "≤ 17,0 : 1");

test("B: Cummins sheet 16.8:1, assembler aosif 17.3:1, HSMT ≤ 17,0 : 1 → met by the maker's sheet; note names ids, no quote", () => {
  const facts = { engine: [F("compr", "16.8:1", "cummins-inc", true, 2010), F("compr", "17.3:1", "aosif", false, 124)] };
  const c = makerSheetChecks(cfg([{ item: CR.item, part: "engine", status: "unclear", conflict: true, offered: "16.8 / 17.3 (nguồn khác nhau)" }]), [CR], facts);
  const x = c.checks[0];
  assert.deepEqual([x.status, x.rule, x.offered, x.was, x.conflict, x.byCode], ["met", "to-hang", "16.8:1", "unclear", undefined, true]);
  assert.deepEqual(x.factSrc, { supplierId: "cummins-inc", n: 2010, line: "| compr | 16.8:1" });
  assert.deepEqual(x.makerOver, ["aosif"]);
  assert.match(x.note, /theo tờ thông số hãng \(cummins-inc \[2010\]\); trang nhà lắp ráp aosif ghi khác/);
  assert.doesNotMatch(x.note, /17[.,]3|16[.,]8/); // #527: no source figure in the note
  // No check yet: one is written.
  assert.equal(makerSheetChecks(cfg(), [CR], facts).checks[0].status, "met");
  // The maker's figure above the ceiling: not met.
  const hi = { engine: [F("compr", "17.5:1", "cummins-inc", true), F("compr", "16.5:1", "aosif")] };
  assert.equal(makerSheetChecks(cfg(), [CR], hi).checks[0].status, "not_met");
});

test("B: two maker sheets that differ, no maker sheet, no disagreement → unchanged", () => {
  const un = (engine) => makerSheetChecks(cfg([{ item: CR.item, part: "engine", status: "unclear", offered: "" }]), [CR], { engine }).checks[0].status;
  assert.equal(un([F("compr", "16.8:1", "cummins-inc", true, 1), F("compr", "17.3:1", "cummins-inc", true, 2), F("compr", "17.3:1", "aosif")]), "unclear");
  assert.equal(un([F("compr", "16.8:1", "jet-power"), F("compr", "17.3:1", "aosif")]), "unclear");
  assert.equal(un([F("compr", "16.8:1", "cummins-inc", true), F("compr", "16.8:1", "aosif")]), "unclear");
  // An HSMT with no ≤ / ≥ for a design value ("Nêu cụ thể"): not compared.
  assert.equal(makerSheetChecks(cfg(), [R("compression", "Tỷ số nén", "Nêu cụ thể")], { engine: [F("compr", "16.8:1", "cummins-inc", true), F("compr", "17.3:1", "aosif")] }).checks.length, 0);
});

test("B: only an unclear check changes; met / not met / another generation stay; codes without a plain comparison stay", () => {
  const facts = { engine: [F("compr", "16.8:1", "cummins-inc", true), F("compr", "17.3:1", "aosif")] };
  for (const st of ["met", "not_met"]) assert.equal(makerSheetChecks(cfg([{ item: CR.item, part: "engine", status: st }]), [CR], facts).checks[0].status, st);
  const em = { engine: [F("emission", "Non-Road Emission Exempt", "weichai-power", true), F("emission", "T2", "acepow-fuan")] };
  assert.equal(makerSheetChecks(cfg(), [R("emission", "Khí thải", "Tối thiểu Tier 2")], em).checks.length, 0);
});

test("B: displacement, governor, cylinders, insulation by the maker's sheet", () => {
  const D = R("displacement", "Dung tích xi lanh", "≥ 9 L");
  assert.equal(makerSheetChecks(cfg(), [D], { engine: [F("disp", "8.9", "cummins-inc", true), F("disp", "6.69L", "aosif")] }).checks[0].status, "not_met");
  const G = R("governor", "Bộ điều tốc", "Điện tử");
  const g = makerSheetChecks(cfg([{ item: G.item, part: "engine", status: "unclear", offered: "Nguồn ghi khác nhau (Electronic / Mechanical)" }]), [G], { engine: [F("gov", "Electronic Governor", "weichai-power", true, 113), F("gov", "Mechanically", "acepow-fuan", false, 104), F("gov", "Electronic", "acepow-fuan", false, 104)] }).checks[0];
  assert.deepEqual([g.status, g.makerOver], ["met", ["acepow-fuan"]]);
  // "Có bộ điều tốc tự động": not a plain comparison of electronic / mechanical → unchanged.
  assert.equal(makerSheetChecks(cfg(), [R("governor", "Bộ điều tốc", "Có bộ điều tốc tự động")], { engine: [F("gov", "Electronic Governor", "weichai-power", true), F("gov", "Mechanical", "jet-power")] }).checks.length, 0);
  // Cylinders with an arrangement asked: not compared.
  assert.equal(makerSheetChecks(cfg(), [R("cylinders", "Số xi lanh", "Tối thiểu 6 xi lanh thẳng hàng")], { engine: [F("cyl", "6", "cummins-inc", true), F("cyl", "4", "aosif")] }).checks.length, 0);
  assert.equal(makerSheetChecks(cfg(), [R("cylinders", "Số xi lanh", "≥ 6")], { engine: [F("cyl", "6", "cummins-inc", true), F("cyl", "4", "aosif")] }).checks[0].status, "met");
  // Insulation: "CLASS H" on the sheet and "H" on a page are one value, not a disagreement for this rule.
  const I = R("alt_insulation", "Cấp cách điện", "Class H hoặc C", { part: "alternator" });
  assert.equal(makerSheetChecks(cfg([{ item: I.item, part: "alternator", status: "unclear", conflict: true }]), [I], { alternator: [F("insul", "CLASS H", "stamford-avk-china", true), F("insul", "H", "fdk-energy")] }).checks[0].status, "unclear");
  assert.equal(makerSheetChecks(cfg(), [I], { alternator: [F("insul", "CLASS H", "stamford-avk-china", true), F("insul", "F", "gb-power")] }).checks[0].status, "met");
});

test("B: modelFacts marks only the part maker's own sheet of the exact model (not an assembler, a frame, nor a genset maker's datasheet)", () => {
  const oem = { id: "aosif", country: "CN", role: "genset_oem", specTables: [{ n: 124, title: "Cummins gensets", header: ["| Model | Prime kVA | Engine | Compression ratio"], rows: ["| AC500 | 500 | QSZ13-G3 | 17.3:1"] }] };
  const maker = { id: "cummins-inc", country: "US", role: "engine_maker", specTables: [{ n: 2010, title: "Datasheet: QSZ13-G3", header: [], rows: ["| Compression Ratio | 16.8:1", "| Displacement | 13 L"] }] };
  // A genset maker's own "Datasheet:" of a model (role genset_oem): not the engine maker's sheet.
  const gm = { id: "gm", country: "CN", role: "genset_oem", specTables: [{ n: 1001, title: "Datasheet: QSZ13-G3", header: [], rows: ["| Compression Ratio | 17.0:1"] }] };
  const list = [oem, maker, gm], facts = modelFacts(C.build(list), list).get(`engine:${C.keyOf("QSZ13-G3")}`) || [];
  const of = (k) => facts.filter((f) => f.key === k).map((f) => `${f.supplierId}:${f.value}:${!!f.sheet}`).sort();
  assert.deepEqual(of("compr"), ["aosif:17.3:1:false", "cummins-inc:16.8:1:true", "gm:17.0:1:false"]);
});

test("B through check(): a conflicting displacement follows the engine maker's sheet", () => {
  const lineA = "| A-1 | 275 | 220 | NTA855-G1B | UCI274G | 6 | 10.8 |";
  const sups = [
    { id: "a", country: "CN", role: "genset_oem", specTables: [{ n: 101, title: "Cummins gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Cylinders | Displacement (L) |"], rows: [lineA] }] },
    { id: "cummins-inc", country: "US", role: "engine_maker", specTables: [{ n: 2005, title: "Datasheet: NTA855-G1B", header: [], rows: ["| Displacement | 14 L", "| Governor | Electronic"] }] },
  ];
  const src = { kind: "catalog", supplierId: "a", n: 101, line: lineA };
  const r = { requirements: [{ item: "Dung tích xi lanh", requirement: "≥ 11 L", quote: "Dung tích xi lanh ≥ 11 lít", part: "engine", level: "core" }],
    configs: [{ rank: 1, engine: { model: "NTA855-G1B", src }, alternator: { model: "UCI274G", src }, suppliers: [{ supplierId: "a", n: 101, line: lineA }],
      checks: [{ item: "Dung tích xi lanh", part: "engine", status: "unclear", offered: "10.8 / 14 L (nguồn khác nhau)", hsmtQuote: "Dung tích xi lanh ≥ 11 lít" }] }] };
  const { result } = check(r, { hsmtText: "Chương V. Yêu cầu kỹ thuật\nDung tích xi lanh ≥ 11 lít\nCông suất prime ≥ 250 kVA", suppliers: sups, readWeb: () => null, origin: "all" });
  const x = result.configs[0].checks.find((y) => y.item === "Dung tích xi lanh");
  assert.deepEqual([x.status, x.rule, x.offered, x.makerOver], ["met", "to-hang", "14 L", ["a"]]);
});
