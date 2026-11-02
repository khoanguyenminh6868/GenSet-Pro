// node --test suppliers/*.test.mjs — Gợi ý cấu hình, độ chính xác và tốc độ (Khoa, 2026-11-02): figures shared by
// model (factSrc), sources that disagree, the code's ranking (engine and controller before the alternator), the
// candidate rows written to catalog.md, the requirements kept between runs and the check of Tìm NCC configurations.
import test from "node:test";
import assert from "node:assert/strict";
import { check, modelFacts, factConflicts, rankConfigs, scoreOf, candidates, hintsOf, catalogMd, mergeChecked, reqHashOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const lineA = "| A-1 | 275 | 220 | NTA855-G1B | HCI444ES | 6 | 14 |";
const lineB = "| B-1 | 275 | 220 | NTA855-G1B | UCI274G |";
const sups = [
  { id: "a", country: "CN", confidence: "medium", role: "genset_oem", specTables: [{ n: 101, title: "Cummins gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Cylinders | Displacement (L) |"], rows: [lineA] }] },
  { id: "b", country: "CN", confidence: "high", role: "genset_oem", specTables: [{ n: 102, title: "Cummins gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: [lineB] }],
    controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: "Controller: Deep Sea DSE7320", src: [3001] }] },
  // A datasheet of the same engine that gives another displacement.
  { id: "c", country: "CN", confidence: "low", role: "genset_oem", specTables: [{ n: 1001, title: "NTA855-G1B datasheet", header: [], rows: ["| Engine Model | NTA855-G1B", "| Displacement | 10.8 L", "| Governor | Electronic"] }] },
];
const hsmt = "Chương V. Yêu cầu kỹ thuật\nĐộng cơ: số xi lanh ≥ 6\nDung tích xi lanh ≥ 11 lít\nĐiều tốc điện tử\nCông suất prime ≥ 250 kVA, 50Hz\nBộ điều khiển Deep Sea";
const rowB = { kind: "catalog", supplierId: "b", n: 102, line: lineB };
const reqs = () => [
  { item: "Số xi lanh", requirement: "≥ 6", quote: "số xi lanh ≥ 6", part: "engine", level: "core" },
  { item: "Dung tích", requirement: "≥ 11 L", quote: "Dung tích xi lanh ≥ 11 lít", part: "engine", level: "core" },
];
const config = (checks) => ({ requirements: reqs(), configs: [{ rank: 1, engine: { model: "NTA855-G1B", src: rowB }, alternator: { model: "UCI274G", src: rowB }, checks,
  suppliers: [{ supplierId: "b", n: 102, line: lineB }] }] });
const factA = { supplierId: "a", n: 101, line: lineA };
const run = (r) => check(r, { hsmtText: hsmt, suppliers: sups, readWeb: () => null, origin: "all" });

test("modelFacts gathers an engine's figures from every row and datasheet that names it", () => {
  const facts = modelFacts(C.build(sups)).get(`engine:${C.keyOf("NTA855-G1B")}`);
  const of = (k) => facts.filter((f) => f.key === k).map((f) => `${f.supplierId}:${f.value}`).sort();
  assert.deepEqual(of("cyl"), ["a:6"]);
  assert.deepEqual(of("disp"), ["a:14", "c:10.8 L"]);
  assert.deepEqual(of("gov"), ["c:Electronic"]);
  // The datasheet's fact is its own line, word for word.
  assert.equal(facts.find((f) => f.supplierId === "c" && f.key === "disp").line, "| Displacement | 10.8 L");
  assert.deepEqual([...factConflicts(facts).keys()], ["disp"]);
});

test("a maker's datasheet named after one model gives that model's figures (maker-datasheets.mjs)", () => {
  const maker = { id: "st", role: "alternator_maker", specTables: [
    { n: 1001, title: "Datasheet: UCI274G - Winding 311", header: [], rows: ["UCI274G - Winding 311", "| INSULATION SYSTEM | CLASS H", "| PROTECTION | IP23", "| WEIGHT COMP. GENERATOR | 450 kg"] },
    // Two models in the title: whose figures they are is not clear, so none is used.
    { n: 1002, title: "Datasheet: UCI274G / UCI274F", header: [], rows: ["| PROTECTION | IP21"] }] };
  const list = [...sups, maker];
  const facts = modelFacts(C.build(list), list).get(`alternator:${C.keyOf("UCI274G")}`) || [];
  assert.deepEqual(facts.map((f) => `${f.key}=${f.value}@${f.n}`).sort(), ["insul=CLASS H@1001", "ip=IP23@1001"]);
  // A check quoting it with factSrc is met.
  const r = config([{ item: "Cách điện", hsmtQuote: "Động cơ: số xi lanh ≥ 6", offered: "Class H", sourceQuote: "| INSULATION SYSTEM | CLASS H", part: "alternator", status: "met",
    factSrc: { supplierId: "st", n: 1001, line: "| INSULATION SYSTEM | CLASS H" } }]);
  const { problems, result } = check(r, { hsmtText: hsmt, suppliers: list, readWeb: () => null, origin: "all" });
  assert.deepEqual(problems, []);
  assert.equal(result.configs[0].checks[0].status, "met");
});

test("figures that share a number agree; ones that share none disagree", () => {
  let i = 0;
  const f = (key, value, page) => ({ key, value, supplierId: "s", n: page ?? ++i });
  assert.equal(factConflicts([f("cyl", "6"), f("cyl", "6L"), f("cyl", "In-line 6")]).size, 0);
  assert.equal(factConflicts([f("bore", "140x152mm"), f("bore", "140*152")]).size, 0);
  assert.equal(factConflicts([f("gov", "Electronic"), f("gov", "Electrical")]).size, 0);
  assert.equal(factConflicts([f("gov", "Electronic"), f("gov", "Mechanical")]).size, 1);
  // Two values on one page are two conditions (two AVRs), not sources that disagree.
  assert.equal(factConflicts([f("vreg", "± 0.5 %", 9), f("vreg", "± 1.0 %", 9)]).size, 0);
});

test("a figure of the engine from another supplier's row (factSrc) counts as met", () => {
  const { problems, result } = run(config([{ item: "Số xi lanh", hsmtQuote: "số xi lanh ≥ 6", offered: "6 xi lanh", sourceQuote: lineA, part: "engine", status: "met", factSrc: factA }]));
  assert.deepEqual(problems, []);
  assert.equal(result.configs[0].checks[0].status, "met");
  assert.equal(result.configs[0].checks[0].level, "core");
});

test("a factSrc that is not a figure line of this model, or a genset figure of that row, is not met", () => {
  for (const [x, why] of [
    [{ offered: "6", sourceQuote: lineA, factSrc: { ...factA, supplierId: "b" } }, "wrong supplier"],
    [{ offered: "6", sourceQuote: lineA, factSrc: { ...factA, line: "| A-2 | 275 | 220 | NTA855-G1B | HCI444ES | 6 | 14 |" } }, "invented line"],
    // The other row's power is that genset's, not the engine's.
    [{ item: "Công suất", offered: "275 kVA prime", sourceQuote: "| A-1 | 275 | 220", factSrc: factA }, "genset figure"],
    // An alternator check cannot quote the engine's figures.
    [{ offered: "6", sourceQuote: lineA, factSrc: factA, part: "alternator" }, "other part"],
  ]) {
    const { result } = run(config([{ item: "Số xi lanh", hsmtQuote: "số xi lanh ≥ 6", part: "engine", status: "met", ...x }]));
    assert.equal(result.configs[0].checks[0].status, "unclear", why);
    assert.ok(result.configs[0].checks[0].unverified, why);
  }
});

test("a figure the sources of the model give differently is not met", () => {
  const { result } = run(config([{ item: "Dung tích", hsmtQuote: "Dung tích xi lanh ≥ 11 lít", offered: "14 L", sourceQuote: "| 6 | 14 |", part: "engine", status: "met", factSrc: factA }]));
  const x = result.configs[0].checks[0];
  assert.equal(x.status, "unclear");
  assert.ok(x.conflict);
  assert.match(x.note, /10\.8 L/);
  // A figure with no disagreement stays met.
  const { result: ok } = run(config([{ item: "Điều tốc", hsmtQuote: "Điều tốc điện tử", offered: "Electronic", sourceQuote: "| Governor | Electronic", part: "engine", status: "met",
    factSrc: { supplierId: "c", n: 1001, line: "| Governor | Electronic" } }]));
  assert.equal(ok.configs[0].checks[0].status, "met");
});

test("the code ranks engine and controller before the alternator, and counts missing checks as unclear", () => {
  const ck = (item, part, status, level = "core") => ({ item, part, status, level });
  const r = {
    requirements: [{ item: "E", part: "engine", level: "core" }, { item: "A", part: "alternator", level: "core" }, { item: "K", part: "controller", level: "core" }, { item: "T", part: "genset", level: "option" }],
    configs: [
      { rank: 1, checks: [ck("E", "engine", "not_met"), ck("A", "alternator", "met"), ck("K", "controller", "met"), ck("T", "genset", "met", "option")], suppliers: [{ supplierId: "x" }] },
      { rank: 2, checks: [ck("E", "engine", "met"), ck("A", "alternator", "not_met"), ck("K", "controller", "met"), ck("T", "genset", "met", "option")], suppliers: [{ supplierId: "y" }] },
      // Only one check: the three requirements it does not check count as unclear.
      { rank: 3, checks: [ck("E", "engine", "met")], suppliers: [{ supplierId: "z" }] },
      { rank: 4, checks: [ck("E", "engine", "met"), ck("A", "alternator", "met"), ck("K", "controller", "unclear"), ck("T", "genset", "not_met", "option")], suppliers: [{ supplierId: "w" }] },
    ],
  };
  rankConfigs(r);
  assert.deepEqual(r.configs.map((c) => c.suppliers[0].supplierId), ["w", "z", "y", "x"]);
  assert.deepEqual(r.configs.map((c) => c.rank), [1, 2, 3, 4]);
  assert.deepEqual(scoreOf({ checks: [], suppliers: [] }, r.requirements), [0, 0, 1, 2, 1, 0, 1]);
});

test("suppliers offering the controller come first, then the genset row's own, then the alternator", () => {
  const r = { requirements: [], configs: [{ rank: 1, genset: { src: { supplierId: "g" } }, checks: [], suppliers: [
    { supplierId: "alt", hasAlternator: true }, { supplierId: "g" }, { supplierId: "ctl", hasController: true }, { supplierId: "bad", hasController: true, unverified: true }] }] };
  rankConfigs(r);
  assert.deepEqual(r.configs[0].suppliers.map((s) => s.supplierId), ["ctl", "g", "alt", "bad"]);
});

test("candidate rows: the engine the HSMT names before the alternator it names; a 60 Hz row is left out", () => {
  const list = [
    { id: "w", country: "CN", confidence: "medium", specTables: [{ n: 101, title: "Weichai gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: ["| W-1 | 275 | 220 | WP10D264E200 | XY274K |"] }] },
    { id: "y", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Yuchai gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Stamford alternator |"], rows: ["| Y-1 | 275 | 220 | YC6MK350L-D20 | UCI274G |"] }] },
    { id: "s", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Weichai gensets 60Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: ["| W-6 | 275 | 220 | WP10D264E200 | XY274K |"] }] },
  ];
  const hints = hintsOf("Chương V. Yêu cầu kỹ thuật\nĐộng cơ Weichai, đầu phát Stamford, tần số 50 Hz");
  assert.equal(hints.freq, 50);
  assert.deepEqual([hints.engineMakes, hints.altMakes], [["Weichai"], ["Stamford"]]);
  const { top } = candidates(C.build(list), { value: 250, unit: "kVA" }, hints, { suppliers: list });
  assert.deepEqual(top.map((r) => r.u.supplierId), ["w", "y"]);
  assert.match(top[0].why.join(" "), /Weichai/);
});

test("catalog.md lists the candidates and each model's figures with their factSrc, and flags disagreement", () => {
  const { md, shown } = catalogMd(C.build(sups), { value: 250, unit: "kVA" }, hintsOf(hsmt), { suppliers: sups });
  assert.match(md, /## Ứng viên \(2 dòng/);
  assert.match(md, /⚠ Dung tích xi lanh: các nguồn ghi khác nhau/);
  assert.ok(md.includes(`factSrc: { "supplierId": "c", "n": 1001, "line": "| Governor | Electronic" }`));
  assert.ok(shown.has("a") && shown.has("b"));
});

test("the requirements are read again only when the HSMT or Yêu cầu khác change", () => {
  assert.equal(reqHashOf("x", ""), reqHashOf("x", ""));
  assert.notEqual(reqHashOf("x", ""), reqHashOf("x", "Deep Sea"));
  assert.notEqual(reqHashOf("x", ""), reqHashOf("y", ""));
});

test("Tìm NCC: the agent's checks are verified and put back; the engine and suppliers stay as the code made them", () => {
  const result = { origin: "all", requirements: reqs(), configs: [
    { rank: 1, engine: { model: "NTA855-G1B", src: rowB }, checks: [{ item: "Số xi lanh", status: "met" }], suppliers: [{ supplierId: "b", n: 102, line: lineB }] },
    { rank: 2, fromFind: true, engine: { model: "NTA855-G1B", src: rowB }, checks: [{ item: "Công suất", status: "unclear" }], suppliers: [{ supplierId: "b", n: 102, line: lineB }],
      gaps: ["Cấu hình bổ sung từ Tìm NCC: chưa đối chiếu từng yêu cầu kỹ thuật của HSMT."] }] };
  const got = { configs: [{ rank: 2, engine: { model: "KTA19-G3", src: rowB }, suppliers: [], checks: [
    { item: "Số xi lanh", hsmtQuote: "số xi lanh ≥ 6", offered: "6", sourceQuote: lineA, part: "engine", status: "met", factSrc: factA },
    { item: "Dung tích", hsmtQuote: "Dung tích xi lanh ≥ 11 lít", offered: "16 L", sourceQuote: lineA, part: "engine", status: "met", factSrc: factA }] }] };
  const out = mergeChecked(result, got, { hsmtText: hsmt, suppliers: sups, origin: "all" });
  assert.equal(out.checked, 1);
  const c = result.configs[1];
  assert.equal(c.engine.model, "NTA855-G1B");
  assert.equal(c.suppliers.length, 1);
  assert.ok(c.findChecked);
  assert.deepEqual(c.checks.map((x) => x.status), ["met", "unclear"]);
  assert.deepEqual(c.gaps, []);
  // The configuration the agent was not asked about is untouched.
  assert.deepEqual(result.configs[0].checks, [{ item: "Số xi lanh", status: "met" }]);
});
