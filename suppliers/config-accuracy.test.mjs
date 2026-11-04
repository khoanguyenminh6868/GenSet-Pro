// node --test suppliers/*.test.mjs — Gợi ý cấu hình, độ chính xác và tốc độ (Khoa, 2026-11-02): figures shared by
// model (factSrc), sources that disagree, the code's ranking (engine and controller before the alternator), the
// candidate rows written to catalog.md, the requirements kept between runs and the check of Tìm NCC configurations.
import test from "node:test";
import assert from "node:assert/strict";
import { check, modelFacts, factConflicts, factsFor, rankConfigs, scoreOf, candidates, hintsOf, catalogMd, mergeChecked, reqHashOf, NO_CONTROLLER, byOrigin, cnSuppliers, engineMins, powerMins, capacity, plausible } from "./config-bot.mjs";
import { makerSheet, controllerSheet } from "./maker-datasheets.mjs";

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

test("the engine and the controller weigh more than the alternator and the genset as a whole (Khoa, 2026-11-02)", () => {
  const ck = (item, part, status) => ({ item, part, status, level: "core" });
  const reqs = [{ item: "E", part: "engine" }, { item: "K", part: "controller" }, { item: "G", part: "genset" }, { item: "A", part: "alternator" }];
  const all = (over) => ["E", "K", "G", "A"].map((i) => ck(i, reqs.find((r) => r.item === i).part, over[i] || "met"));
  const r = { requirements: reqs, configs: [
    { rank: 1, checks: all({ K: "not_met" }), suppliers: [{ supplierId: "ctl-bad" }] },
    { rank: 2, checks: all({ G: "not_met", A: "not_met" }), suppliers: [{ supplierId: "genset-alt-bad" }] },
    { rank: 3, checks: all({ E: "unclear" }), suppliers: [{ supplierId: "engine-unclear" }] },
    { rank: 4, checks: all({ G: "unclear", A: "unclear" }), suppliers: [{ supplierId: "genset-alt-unclear" }] },
  ] };
  rankConfigs(r);
  assert.deepEqual(r.configs.map((c) => c.suppliers[0].supplierId), ["genset-alt-unclear", "engine-unclear", "genset-alt-bad", "ctl-bad"]);
});

test("suppliers offering both the engine and the controller come first, then the genset row's own, then the alternator", () => {
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

test("candidate rows: every supplier of the engine the HSMT names gets a place; one supplier's pages count once and fill at most 4", () => {
  const table = (n, rows) => ({ n, title: "Cummins gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows });
  // "big" lists the named engine on three pages and eight other engines; ten more suppliers have the named engine.
  const big = { id: "big", country: "CN", confidence: "high", controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: "DSE7320", src: [3001] }],
    specTables: [table(101, ["| U-1 | 275 | 220 | QSZ13-G3 | HCI444ES |"]), table(102, ["| U-1 | 275 | 220 | QSZ13-G3 | HCI444ES |"]), table(103, ["U-1 | 275 | 220 | QSZ13-G3 | HCI444ES"]),
      table(104, ["NTA855-G1B", "NTA855-G2A", "KTA19-G3", "KTA19-G4", "6LTAA8.9-G2", "6CTAA8.3-G2", "QSL9-G2", "QSL9-G3"].map((e, i) => `| B-${i} | 275 | 220 | ${e} | HCI444ES |`))] };
  const others = Array.from({ length: 10 }, (_, i) => ({ id: `s${i}`, country: "CN", confidence: "low", specTables: [table(101, [`| S-${i} | 275 | 220 | QSZ13-G3 | UCI274G |`])] }));
  const list = [big, ...others];
  const hints = hintsOf("Chương V. Yêu cầu kỹ thuật\nĐộng cơ Cummins QSZ13-G3, tần số 50 Hz");
  const { top } = candidates(C.build(list), { value: 250, unit: "kVA" }, hints, { suppliers: list });
  const named = top.filter((r) => r.e.model === "QSZ13-G3");
  assert.equal(named.length, 8);
  assert.equal(named.filter((r) => r.u.supplierId === "big").length, 1);
  assert.equal(top.filter((r) => r.u.supplierId === "big").length, 4);
  // The rest of the named engine's suppliers are listed under it for the configuration's suppliers.
  const { md } = catalogMd(C.build(list), { value: 250, unit: "kVA" }, hints, { suppliers: list });
  const more = md.split("## Nhà cung cấp khác")[1].split("\n## ")[0];
  assert.equal(new Set(more.match(/supplierId: s\d/g)).size, 3);
});

test("candidate rows: an engine whose sources name two makes still counts as the make the HSMT names", () => {
  const t = (title, row) => [{ n: 101, title, header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: [row] }];
  const list = [
    { id: "p", country: "CN", specTables: t("Perkins gensets 50Hz", "| P-1 | 275 | 220 | 1506A-E88TAG3 | HCI444ES |") },
    { id: "l", country: "CN", specTables: t("Lovol gensets 50Hz", "| L-1 | 275 | 220 | 1506A-E88TAG3 | HCI444ES |") },
    { id: "w", country: "CN", confidence: "high", specTables: t("Weichai gensets 50Hz", "| W-1 | 275 | 220 | WP10D264E200 | HCI444ES |") },
  ];
  const cat = C.build(list);
  assert.match(cat.engines.find((e) => e.model === "1506A-E88TAG3").make, / \/ /);
  const { top } = candidates(cat, { value: 250, unit: "kVA" }, hintsOf("Chương V. Yêu cầu kỹ thuật\nĐộng cơ Perkins, 50 Hz"), { suppliers: list });
  assert.equal(top[0].e.model, "1506A-E88TAG3");
  assert.match(top[0].why.join(" "), /hãng động cơ Perkins/);
});

test("candidate rows, Xuất xứ Trung Quốc: a Chinese make before a foreign engine with more figures; a make the HSMT names still first", () => {
  const t = (title, row) => [{ n: 101, title, header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: [row] }];
  const list = [
    { id: "c", country: "CN", confidence: "high", controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: "DSE7320", src: [3001] }], specTables: t("Cummins gensets 50Hz", "| C-1 | 275 | 220 | QSZ13-G3 | HCI444ES |") },
    { id: "w", country: "CN", confidence: "low", specTables: t("Weichai gensets 50Hz", "| W-1 | 275 | 220 | WP10D264E200 | XY274K |") },
  ];
  const cat = C.build(list), cn = cnSuppliers(list), cap = { value: 250, unit: "kVA" };
  const order = (text, origin) => candidates({ ...cat, engines: byOrigin(cat.engines, origin, cn) }, cap, hintsOf(text), { suppliers: list, origin, cn }).top.map((r) => r.u.supplierId);
  assert.deepEqual(order("Chương V. Yêu cầu kỹ thuật\n50 Hz", "cn"), ["w", "c"]);
  assert.deepEqual(order("Chương V. Yêu cầu kỹ thuật\n50 Hz", "all"), ["c", "w"]);
  assert.deepEqual(order("Chương V. Yêu cầu kỹ thuật\nĐộng cơ Cummins, 50 Hz", "cn"), ["c", "w"]);
});

test("a single-model table: '| Alternator | Control system' is two headings, not the alternator model", () => {
  // aosif n 1048: the datasheet names no alternator.
  const s = { id: "x", country: "CN", specTables: [{ n: 1048, title: "Datasheet", header: [], rows: ["| Prime Power | 500KVA/400KW", "| Brand | Cummins", "Engine", "| Model | QSZ13-G3",
    "Alternator specification", "Control system Introduction", "| Alternator | Control system"] }] };
  const e = C.build([s]).engines.find((x) => x.model === "QSZ13-G3");
  assert.equal(e.uses[0].other, null);
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

// Datasheets of a controller maker (Deep Sea: two models in one sheet), Khoa 2026-11-02.
const dse = { id: "dse", role: "controller_maker", country: "GB", specTables: [{ n: 1001, title: "Datasheet: | DSE7310 MKII Auto Start & DSE7320 MKII | Auto", header: [], rows: [
  "| DSE7310 MKII | DSE7320 MKII",
  "The DSE7320 MKII will also monitor the mains (utility) supply.",
  "Common Key Features",
  "| • | Integrated RS232 and RS485 ports providing Modbus RTU support",
  "| DSE7310 MKII Manual / Automatic Start Controller Key Features | Typical Applications",
  "| • | 3 phase generator sensing with protection",
  "| DSE7320 MKII Automatic Mains (Utility) Failure (AMF) Controller | Key",
  "| • | Automatic start and stopping of generator and transfer of load",
  "| DSE7310 MKII Auto Start | & | DSE7320",
  "Specifications",
  "| Number | DSE7310 MKII: 1",
  "DSE7320 MKII: 2",
  "| Event Log | Up to 250 events"] }] };
const ctlLines = (facts, model) => (facts.get(`controller:${C.keyOf(model)}`) || []).map((f) => f.line);

test("a controller datasheet gives each line to the models of its section", () => {
  const facts = modelFacts(C.build([dse]), [dse]);
  const a = ctlLines(facts, "DSE7320 MKII"), b = ctlLines(facts, "DSE7310 MKII");
  for (const l of ["| • | Integrated RS232 and RS485 ports providing Modbus RTU support", "| Event Log | Up to 250 events"]) { assert.ok(a.includes(l), l); assert.ok(b.includes(l), l); }
  assert.ok(a.includes("| • | Automatic start and stopping of generator and transfer of load"));
  assert.ok(!b.includes("| • | Automatic start and stopping of generator and transfer of load"));
  assert.ok(b.includes("| • | 3 phase generator sensing with protection") && !a.includes("| • | 3 phase generator sensing with protection"));
  // A line naming one model is of that model only, and does not open a section.
  assert.ok(a.includes("The DSE7320 MKII will also monitor the mains (utility) supply.") && !b.includes("The DSE7320 MKII will also monitor the mains (utility) supply."));
  assert.ok(a.includes("DSE7320 MKII: 2") && !b.includes("DSE7320 MKII: 2") && b.includes("| Number | DSE7310 MKII: 1"));
  // The catalog does not read a controller maker's datasheet as gensets.
  assert.equal(C.build([dse]).engines.length, 0);
  // A controller only mentioned in another model's datasheet gets none of its lines.
  const other = { id: "dse2", role: "controller_maker", specTables: [{ n: 1002, title: "Datasheet: DSE8610 MKII Synchronising", header: [], rows: ["| • | Compatible with DSE7320 MKII", "| • | Load sharing"] }] };
  const f2 = modelFacts(C.build([other]), [other]);
  assert.deepEqual([ctlLines(f2, "DSE7320 MKII"), ctlLines(f2, "DSE8610 MKII")], [[], ["| • | Compatible with DSE7320 MKII", "| • | Load sharing"]]);
});

const ctlConfig = (model, checks) => ({ requirements: [{ item: "AMF", requirement: "tự động khi mất điện lưới", quote: "Bộ điều khiển Deep Sea", part: "controller", level: "core" }],
  configs: [{ rank: 1, engine: { model: "NTA855-G1B", src: rowB }, controller: { model, make: "Deep Sea", src: rowB }, checks, suppliers: [{ supplierId: "b", n: 102, line: lineB }] }] });
const amf = { item: "AMF", hsmtQuote: "Bộ điều khiển Deep Sea", offered: "AMF", sourceQuote: "Automatic start and stopping of generator", part: "controller", status: "met",
  factSrc: { supplierId: "dse", n: 1001, line: "| • | Automatic start and stopping of generator and transfer of load" } };

test("a controller check quoting its maker's datasheet (factSrc) is met; a line of the other model is not", () => {
  const list = [...sups, dse];
  // The configuration's controller is named in its source row for this test.
  const row = { ...rowB }, sups2 = list.map((s) => (s.id === "b" ? { ...s, specTables: [{ ...s.specTables[0], header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Controller DSE7320 MKII DSE7320 |"] }] } : s));
  let { problems, result } = check(ctlConfig("DSE7320 MKII", [{ ...amf }]), { hsmtText: hsmt, suppliers: sups2, readWeb: () => null, origin: "all" });
  assert.deepEqual(problems, []);
  assert.equal(result.configs[0].checks[0].status, "met");
  assert.equal(result.configs[0].checks[0].version, undefined);
  ({ result } = check(ctlConfig("DSE7310 MKII", [{ ...amf }]), { hsmtText: hsmt, suppliers: sups2, readWeb: () => null, origin: "all" }));
  assert.equal(result.configs[0].checks[0].status, "unclear");
  assert.ok(row);
});

test("a controller written without its generation takes the datasheet of its generations, to be confirmed", () => {
  const sups2 = [...sups, dse].map((s) => (s.id === "b" ? { ...s, specTables: [{ ...s.specTables[0], header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Controller DSE7320 |"] }] } : s));
  const { problems, result } = check(ctlConfig("DSE7320", [{ ...amf }]), { hsmtText: hsmt, suppliers: sups2, readWeb: () => null, origin: "all" });
  assert.deepEqual(problems, []);
  const x = result.configs[0].checks[0];
  assert.equal(x.status, "met");
  assert.equal(x.version, "DSE7320 MKII");
  assert.match(x.note, /cần xác nhận đời/);
  assert.ok(result.configs[0].gaps.some((g) => /DSE7320 hay DSE7320 MKII/.test(g)));
  // What that other generation's datasheet does not have is unclear, not "not met", until the generation is known.
  const no = check(ctlConfig("DSE7320", [{ ...amf, status: "not_met" }]), { hsmtText: hsmt, suppliers: sups2, readWeb: () => null, origin: "all" }).result.configs[0].checks[0];
  assert.equal(no.status, "unclear");
});

test("catalog.md lists the controllers' datasheet lines", () => {
  const b = { ...sups[1], controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: "Controller: Deep Sea DSE7320", src: [3001] },
    { brand: "Deep Sea", model: "DSE7310 MKII", text: "DSE7310 MKII", line: "Controller: Deep Sea DSE7310 MKII", src: [3001] }] };
  const list = [sups[0], b, sups[2], dse];
  const { md, ctlMd } = catalogMd(C.build(list), { value: 250, unit: "kVA" }, hintsOf(hsmt), { suppliers: list });
  assert.match(md, /## Thông số bộ điều khiển/);
  assert.match(md, /### DSE7320 — datasheet của DSE7320 MKII \(nhà cung cấp ghi DSE7320: cần xác nhận đời\) — supplierId: dse, n: 1001/);
  assert.ok(md.includes("- | • | Automatic start and stopping of generator and transfer of load"));
  // controllers.md has every line; two models of one datasheet each have their own lines.
  const part = (m) => ctlMd.split("\n### ").find((s) => s.startsWith(m)) || "";
  assert.ok(part("DSE7320 —").includes("Automatic start and stopping") && !part("DSE7320 —").includes("3 phase generator sensing"));
  assert.ok(part("DSE7310 MKII —").includes("3 phase generator sensing") && !part("DSE7310 MKII —").includes("Automatic start and stopping"));
});

test("SmartGen: a series written HGM6110N/6120N..., 'models: text' lines and wrapped sentences go to the right models", () => {
  const sg = { id: "sg", role: "controller_maker", specTables: [{ n: 1001, title: "Datasheet: HGM6100N SERIES (HGM6110N/6120N/6110NC/6120NC)", header: [], rows: [
    "HGM6100N SERIES",
    "(HGM6110N/6120N/6110NC/6120NC)",
    "HGM6110N/6110NC: Automatic Start Module, it controls genset to start/stop automatically by remote signal;",
    "| HGM6120N/6120NC: Based on HGM6110N/6110NC, it | adds mains",
    "AC",
    "| monitoring and mains/generator automatic switching control (AMF), especially | suitable for",
    "NOTE1: HGM6110NC/6120NC has RS485 port, HGM6110N/6120N without.",
    "|  | Event log, real-time clock, scheduled start & stop function"] }] };
  const f = modelFacts(C.build([sg]), [sg]);
  const amf = "| monitoring and mains/generator automatic switching control (AMF), especially | suitable for";
  assert.ok(ctlLines(f, "HGM6120N").includes(amf) && ctlLines(f, "HGM6120NC").includes(amf));
  assert.ok(!ctlLines(f, "HGM6110N").includes(amf) && !ctlLines(f, "HGM6110NC").includes(amf));
  assert.ok(!ctlLines(f, "HGM6120N").includes("HGM6110N/6110NC: Automatic Start Module, it controls genset to start/stop automatically by remote signal;"));
  for (const m of ["HGM6110N", "HGM6120N", "HGM6110NC", "HGM6120NC"]) assert.ok(ctlLines(f, m).includes("|  | Event log, real-time clock, scheduled start & stop function"), m);
});

// Khoa, 2026-11-02: a configuration with no controller is "not met" on the controller.
test("a configuration without a controller is not met on the controller, and ranks below one that has one", () => {
  const ck = (item, part, status) => ({ item, part, status, level: "core" });
  const reqs = [{ item: "E", part: "engine", level: "core" }, { item: "K", part: "controller", level: "core" }, { item: "G", part: "genset", level: "core" }];
  const r = { requirements: reqs, configs: [
    { rank: 1, engine: { model: "X" }, checks: [ck("E", "engine", "met"), ck("K", "controller", "unclear"), ck("G", "genset", "met")], suppliers: [{ supplierId: "none" }] },
    { rank: 2, engine: { model: "Y" }, controller: { model: "DSE7320" }, checks: [ck("E", "engine", "met"), ck("K", "controller", "met"), ck("G", "genset", "not_met")], suppliers: [{ supplierId: "with" }] },
  ] };
  rankConfigs(r);
  assert.deepEqual(r.configs.map((c) => c.suppliers[0].supplierId), ["with", "none"]);
  const x = r.configs[1].checks.find((c) => c.item === NO_CONTROLLER);
  assert.deepEqual([x.status, x.part, x.byCode], ["not_met", "controller", true]);
  assert.ok(!r.configs[0].checks.some((c) => c.item === NO_CONTROLLER));
  // Ranking again adds it once; a controller added later takes it away; no controller requirement, no check.
  rankConfigs(r);
  assert.equal(r.configs[1].checks.filter((c) => c.item === NO_CONTROLLER).length, 1);
  r.configs[1].controller = { model: "HGM6120N" };
  rankConfigs(r);
  assert.ok(!r.configs.some((c) => c.checks.some((x) => x.item === NO_CONTROLLER)));
  const r2 = { requirements: [reqs[0]], configs: [{ rank: 1, checks: [], suppliers: [] }] };
  rankConfigs(r2);
  assert.deepEqual(r2.configs[0].checks, []);
});

test("Leroy-Somer: a frame's datasheet gives its figures to the models its own lines name", () => {
  const sheet = makerSheet(["Low Voltage Alternators - 4 pole", "TAL-A46", "| Insulation class | H | Excitation system 6 wires", "| Protection | IP 23",
    "| TAL-A46-D | kVA | 240 | 250", "| TAL-A46-H | kVA | 350 | 365", "| Some text | without a figure"].join("\n"));
  assert.equal(sheet.title, "TAL-A46");
  assert.deepEqual(sheet.rows, ["| Insulation class | H | Excitation system 6 wires", "| Protection | IP 23", "| TAL-A46-D | kVA | 240 | 250", "| TAL-A46-H | kVA | 350 | 365"]);
  const ls = { id: "ls", role: "alternator_maker", specTables: [{ n: 1004, title: "Datasheet: TAL-A46", header: [], rows: sheet.rows }] };
  // Genset rows that name the alternators, so the catalog knows them.
  const g = { id: "g", role: "genset_oem", specTables: [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Leroy Somer alternator |"],
    rows: ["| G-1 | 275 | 220 | NTA855-G1B | TAL-A46-H |", "| G-2 | 250 | 200 | NTA855-G1B | TAL-A46-Z |", "| G-3 | 450 | 360 | KTA19-G3 | TAL-A473-C |"] }] };
  const f = modelFacts(C.build([g, ls]), [g, ls]);
  const of = (m) => (f.get(`alternator:${C.keyOf(m)}`) || []).map((x) => `${x.key}=${x.value}`).sort();
  assert.deepEqual(of("TAL-A46-H"), ["insul=H", "ip=IP 23"]);
  // Not listed in the datasheet, or of another frame: nothing.
  assert.deepEqual([of("TAL-A46-Z"), of("TAL-A473-C")], [[], []]);
});

test("ComAp: AMF25 written without its generation takes InteliLite 4 AMF25's datasheet; InteliLite NT AMF25 does not", () => {
  const sheet = controllerSheet(["InteliLite 4", "AMF 25", "Order code: IL4AMF25BAA", "| Key benefits | Detailed history log with up to 350 records", "4 applications in 1 HW: AMF (Stand-by) – default"].join("\n"));
  assert.equal(sheet.title, "InteliLite 4 AMF 25");
  const ca = { id: "ca", role: "controller_maker", specTables: [{ n: 1001, title: `Datasheet: ${sheet.title}`, header: [], rows: sheet.rows }] };
  const f = modelFacts(C.build([ca]), [ca]);
  for (const m of ["AMF25", "InteliLite AMF25", "InteliLite 4 AMF25"]) assert.ok(factsFor(f, "controller", m).some((x) => /350 records/.test(x.line)), m);
  assert.equal(factsFor(f, "controller", "AMF25")[0].version, "InteliLite 4 AMF25");
  assert.equal(factsFor(f, "controller", "InteliLite 4 AMF25")[0].version, undefined);
  assert.deepEqual([factsFor(f, "controller", "InteliLite NT AMF25"), factsFor(f, "controller", "AMF20")], [[], []]);
});

// Tốc độ (Khoa, 2026-11-03): at most 6 configurations, the controller's functions of one kind grouped, each model's
// checks written once and copied by the code.
const ctlSups = () => [...sups, dse].map((s) => (s.id === "b" ? { ...s, specTables: [{ ...s.specTables[0], header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Controller DSE7320 MKII |"] }] } : s));
const rs485 = { item: "RS485", offered: "RS485", sourceQuote: "RS232 and RS485 ports", status: "met", factSrc: { supplierId: "dse", n: 1001, line: "| • | Integrated RS232 and RS485 ports providing Modbus RTU support" } };

test("a grouped controller requirement: every part is checked like a check of its own; met only when all are", () => {
  const group = (parts) => ({ item: "Truyền thông", hsmtQuote: "Bộ điều khiển Deep Sea", part: "controller", status: "met", parts });
  let { result, problems } = check(ctlConfig("DSE7320 MKII", [group([{ ...rs485 }, { item: "Ethernet", status: "unclear", offered: "" }])]), { hsmtText: hsmt, suppliers: ctlSups(), readWeb: () => null, origin: "all" });
  let x = result.configs[0].checks[0];
  assert.deepEqual(problems, []);
  assert.equal(x.status, "unclear");
  assert.deepEqual(x.parts.map((p) => [p.item, p.status]), [["RS485", "met"], ["Ethernet", "unclear"]]);
  assert.match(x.note, /Chưa rõ: Ethernet/);
  assert.equal(x.offered, "Đạt 1/2");
  ({ result } = check(ctlConfig("DSE7320 MKII", [group([{ ...rs485 }])]), { hsmtText: hsmt, suppliers: ctlSups(), readWeb: () => null, origin: "all" }));
  assert.equal(result.configs[0].checks[0].status, "met");
  // A part whose quote is not in its source is not met, nor is the group; a part not met makes the group not met.
  ({ result, problems } = check(ctlConfig("DSE7320 MKII", [group([{ ...rs485, sourceQuote: "RS485 and CAN ports" }])]), { hsmtText: hsmt, suppliers: ctlSups(), readWeb: () => null, origin: "all" }));
  x = result.configs[0].checks[0];
  assert.equal(x.status, "unclear");
  assert.ok(x.unverified && x.parts[0].unverified);
  assert.match(problems.join(" "), /Truyền thông: RS485/);
  ({ result } = check(ctlConfig("DSE7320 MKII", [group([{ ...rs485 }, { item: "Ethernet", status: "not_met", offered: "RS485", sourceQuote: "RS232 and RS485 ports", factSrc: rs485.factSrc }])]), { hsmtText: hsmt, suppliers: ctlSups(), readWeb: () => null, origin: "all" }));
  assert.equal(result.configs[0].checks[0].status, "not_met");
  // Checking again (Tìm NCC, a later merge) gives the same.
  const again = check(JSON.parse(JSON.stringify(result)), { hsmtText: hsmt, suppliers: ctlSups(), readWeb: () => null, origin: "all" }).result.configs[0].checks[0];
  assert.deepEqual([again.status, again.parts.length], ["not_met", 2]);
});

test("a configuration with the controller of an earlier one gets its controller checks copied and checked again", () => {
  const r = ctlConfig("DSE7320 MKII", [{ ...amf }]);
  r.configs.push({ ...JSON.parse(JSON.stringify(r.configs[0])), rank: 2, checks: [] });
  r.configs.push({ ...JSON.parse(JSON.stringify(r.configs[0])), rank: 3, controller: { model: "DSE7310 MKII", make: "Deep Sea", src: rowB }, checks: [] });
  const { result } = check(r, { hsmtText: hsmt, suppliers: ctlSups(), readWeb: () => null, origin: "all" });
  const [a, b, c] = result.configs;
  assert.deepEqual([a.checks[0].status, b.checks[0].status, b.checks[0].copiedFrom], ["met", "met", 1]);
  assert.equal(c.checks.find((x) => x.item === "AMF"), undefined);
});

test("an engine's model checks (factSrc) are copied to a later configuration with that engine; its own row's are not", () => {
  const r = config([{ item: "Số xi lanh", hsmtQuote: "số xi lanh ≥ 6", offered: "6", sourceQuote: lineA, part: "engine", status: "met", factSrc: factA },
    { item: "Dung tích", hsmtQuote: "Dung tích xi lanh ≥ 11 lít", offered: "?", sourceQuote: "", part: "engine", status: "unclear" }]);
  r.configs.push({ ...JSON.parse(JSON.stringify(r.configs[0])), rank: 2, checks: [] });
  const b = run(r).result.configs[1];
  assert.deepEqual(b.checks.map((x) => [x.item, x.status]), [["Số xi lanh", "met"]]);
});


test("under Chinese origin, a foreign engine on the saved page of a supplier based in China is kept", () => {
  const page = "Cummins QSZ13-G3 Ranges 550 kva diesel generator, alternator TAL-A473-C";
  const r = { requirements: [], configs: [{ rank: 1, engine: { model: "QSZ13-G3", make: "Cummins", src: { kind: "internet", url: "https://x.cn/p", file: "web/2.txt", quote: "Cummins QSZ13-G3 Ranges" } },
    checks: [], suppliers: [{ supplierId: "dep", n: 2001, line: "x" }] }] };
  const run2 = (country) => check(JSON.parse(JSON.stringify(r)), { hsmtText: hsmt, suppliers: [{ id: "dep", country, specTables: [] }], readWeb: () => `URL: x\n\n${page}`, origin: "cn" }).result.configs.length;
  assert.deepEqual([run2("CN"), run2("US")], [1, 0]);
});

test("check: an engine's make given by another row naming the model is the make catalog.md shows; another make is not", () => {
  const t = (title, row) => [{ n: 101, title, header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: [row] }];
  const list = [
    { id: "w", country: "CN", specTables: t("Weichai gensets 50Hz", "| W-1 | 275 | 220 | WP10D264E200 | XY274K |") },
    { id: "d", country: "CN", specTables: t("Diesel gensets 50Hz", "| D-1 | 275 | 220 | WP10D264E200 | XY274K |") },
  ];
  const src = { kind: "catalog", supplierId: "d", n: 101, line: "| D-1 | 275 | 220 | WP10D264E200 | XY274K |" };
  const res = (make) => check({ requirements: [], configs: [{ rank: 1, engine: { model: "WP10D264E200", make, src }, checks: [] }] }, { hsmtText: "x", suppliers: list, readWeb: () => null, origin: "all" });
  assert.equal(res("Weichai").problems.filter((p) => /hãng/.test(p)).length, 0);
  assert.equal(res("Yuchai").problems.filter((p) => /hãng Yuchai/.test(p)).length, 1);
});

test("modelFacts: a genset maker's own datasheet of an alternator it makes gives that model's figures", () => {
  const list = [{ id: "g", role: "genset_oem", country: "CN", specTables: [
    { n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: ["| G-1 | 275 | 220 | WP10D264E200 | WT274C |"] },
    { n: 1001, title: "Datasheet: WT274C - Technical Data Sheet", header: [], rows: ["WT274C - Technical Data Sheet", "| INSULATION SYSTEM | CLASS H", "| PROTECTION | IP23"] },
    { n: 1002, title: "Gensets WT274C brochure", header: [], rows: ["| INSULATION SYSTEM | CLASS F"] }] }];
  const facts = modelFacts(C.build(list), list).get(`alternator:${C.keyOf("WT274C")}`) || [];
  assert.deepEqual(facts.filter((f) => f.n === 1001).map((f) => f.key).sort(), ["insul", "ip"]);
  assert.equal(facts.filter((f) => f.n === 1002).length, 0);
});

test("check: a grouped requirement's function the agent left out makes the group unclear, not met", () => {
  const line = "| D-1 | 275 | 220 | WP10D264E200 | XY274K |";
  const list = [{ id: "d", country: "CN", specTables: [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: [line] }] }];
  const src = { kind: "catalog", supplierId: "d", n: 101, line };
  const r = { requirements: [{ item: "Bảo vệ", part: "genset", parts: [{ item: "Quá áp" }, { item: "Thấp áp" }] }],
    configs: [{ rank: 1, engine: { model: "WP10D264E200", src }, checks: [{ item: "Bảo vệ", part: "genset", parts: [{ item: "Quá áp", status: "met", offered: "275 kVA", sourceQuote: line }] }] }] };
  const g = check(r, { hsmtText: "x", suppliers: list, readWeb: () => null, origin: "all" }).result.configs[0].checks[0];
  assert.equal(g.status, "unclear");
  assert.deepEqual(g.parts.map((p) => [p.item, p.status]), [["Quá áp", "met"], ["Thấp áp", "unclear"]]);
});

test("check: a Prime power check offering the row's standby figures is not met", () => {
  const line = "| D-1 | 300 | 240 | 275 | 220 | WP10D264E200 | XY274K |";
  const list = [{ id: "d", country: "CN", specTables: [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Standby kVA | Standby kW | Prime kVA | Prime kW | Engine | Alternator |"], rows: [line] }] }];
  const src = { kind: "catalog", supplierId: "d", n: 101, line };
  const res = (offered) => check({ requirements: [], configs: [{ rank: 1, engine: { model: "WP10D264E200", src }, genset: { model: "D-1", src },
    checks: [{ item: "Công suất liên tục (Prime)", requirement: "≥ 280 kVA", part: "genset", status: "met", offered, sourceQuote: line }] }] }, { hsmtText: "x", suppliers: list, readWeb: () => null, origin: "all" }).result.configs[0].checks[0].status;
  assert.equal(C.build(list).engines[0].uses[0].power.prime.kVA, 275);
  assert.equal(res("Prime 300 kVA / 240 kW"), "unclear");
  assert.equal(res("Prime 275 kVA / 220 kW"), "met");
});

test("check hints: an unclear controller function names its datasheet line; the module's own supply voltage is not one", () => {
  const line = "| D-1 | 275 | 220 | WP10D264E200 | XY274K |";
  const list = [
    { id: "d", country: "CN", controllers: [{ brand: "Deep Sea", model: "DSE8610", text: "DSE8610", line: "DSE8610 controller", src: [3001] }], specTables: [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: [line] }] },
    { id: "dse", role: "controller_maker", country: "GB", specTables: [{ n: 1004, title: "Datasheet: DSE8610 MKII", header: [], rows: ["DSE8610 MKII", "| Continuous Voltage | Rating | 5 V to 35 V DC continuous", "The event log records 250 events", "Emergency Stop Input"] }] },
  ];
  const src = { kind: "catalog", supplierId: "d", n: 101, line };
  const r = { requirements: [{ item: "Vận hành", part: "controller", parts: [{ item: "Nhật ký sự kiện" }, { item: "Dừng khẩn cấp" }, { item: "Điện áp ắc quy thấp" }] }],
    configs: [{ rank: 1, engine: { model: "WP10D264E200", src }, controller: { model: "DSE8610", make: "Deep Sea", src: { kind: "controller", supplierId: "d", n: 3001, line: "DSE8610 controller" } },
      checks: [{ item: "Vận hành", part: "controller", parts: [{ item: "Nhật ký sự kiện", status: "unclear" }, { item: "Dừng khẩn cấp", status: "unclear" }, { item: "Điện áp ắc quy thấp", status: "unclear" }] }] }] };
  const { result, hints } = check(r, { hsmtText: "x", suppliers: list, readWeb: () => null, origin: "all" });
  const parts = result.configs[0].checks.find((x) => x.item === "Vận hành").parts;
  assert.deepEqual(parts.map((p) => p.hint?.line || null), ["The event log records 250 events", "Emergency Stop Input", null]);
  assert.equal(parts[0].status, "unclear");
  assert.equal(hints.length, 2);
});

test("engine minimums of the HSMT: read once each; an engine a source shows below them ranks lower", () => {
  const mins = (t) => { const { minDisp, minCyl } = engineMins(t); return { minDisp, minCyl }; };
  assert.deepEqual(mins("Dung tích ước tính ≥ 615 lít\nDung tích xy lanh ≥ 11,05 L\nSố xy lanh: ≥ 6 xy lanh\nTiêu hao ≤ 90 L/h"), { minDisp: 11.05, minCyl: 6 });
  // A bare figure is the least the HSMT accepts (Khoa, 2026-11-03); the label may sit on the line above.
  assert.deepEqual(mins("Dung tích xi lanh: 3.9L\n6 xilanh thẳng hàng"), { minDisp: 3.9, minCyl: 6 });
  assert.deepEqual(mins("Số xylanh, kiểu xếp\n6 xy lanh, xếp trên 1 đường thẳng\nDung tích xi lanh\n11.051 L\nDung tích bình nhiên liệu\n≥ 50 lít"), { minDisp: 11.051, minCyl: 6 });
  assert.deepEqual(mins("Dung tích tối thiểu 12 L\nDung tích tối thiểu 3,9 L"), { minDisp: null, minCyl: null });
  const t = (title, header, row) => [{ n: 101, title, header: [header], rows: [row] }];
  const list = [
    { id: "s", country: "CN", confidence: "high", specTables: t("Weichai gensets 50Hz", "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) |", "| S-1 | 275 | 220 | WP10D264E200 | XY274K | 9.7 |") },
    { id: "b", country: "CN", confidence: "low", specTables: t("Weichai gensets 50Hz", "| Model | Prime kVA | Prime kW | Engine | Alternator |", "| B-1 | 275 | 220 | WP13D385E200 | XY274K |") },
  ];
  const hints = hintsOf("Chương V. Yêu cầu kỹ thuật\nDung tích xy lanh ≥ 11,05 L\n50 Hz");
  const { top } = candidates(C.build(list), { value: 250, unit: "kVA" }, hints, { suppliers: list });
  assert.deepEqual(top.map((r) => r.u.supplierId), ["b", "s"]);
  assert.match(top[1].why.join(" "), /dung tích 9.7 L < 11.05 L/);
});

test("factConflicts: one figure rounded two ways or a China level written two ways is no disagreement", () => {
  const f = (key, value, supplierId) => ({ key, value, supplierId, n: 101, line: value });
  assert.equal(factConflicts([f("disp", "37.8", "a"), f("disp", "38", "b")]).size, 0);
  assert.equal(factConflicts([f("emission", "国二", "a"), f("emission", "国Ⅱ", "b"), f("emission", "国 II", "c")]).size, 0);
  assert.deepEqual([...factConflicts([f("disp", "37.8", "a"), f("disp", "18.9", "b")]).keys()], ["disp"]);
  assert.deepEqual([...factConflicts([f("emission", "国Ⅱ", "a"), f("emission", "国Ⅲ", "b")]).keys()], ["emission"]);
});

test("power minimums of the HSMT: prime by the nearest word, fuel at 100% load; a row below them ranks lower", () => {
  assert.deepEqual(powerMins("Công suất liên tục\nI.3   ≥ 400 kVA / 320 kW\n(Prime)\nCông suất dự phòng\nI.4   ≥ 440 kVA / 352 kW\n(Standby)"), { minPrime: { kVA: 400, kW: 320 }, maxFuel: null });
  assert.deepEqual(powerMins("- Công suất liên tục tổ máy phát điện: 500kVA/ 400kW\n- Công suất dự phòng (Standby Power): 550 kVA (440 kW)."), { minPrime: { kVA: 500, kW: 400 }, maxFuel: null });
  assert.equal(powerMins("Tiêu hao nhiên liệu\n+ Ở 50% tải nhiên liệu tiêu hao ≤ 49,6 L/h\n+ Ở 75% tải nhiên liệu tiêu hao ≤ 73,2 L/h\n+ Ở 100% tải nhiên liệu tiêu hao ≤ 97,4 L/h").maxFuel, 97.4);
  assert.equal(powerMins("≤ 90 Lít/giờ tại 100% tải liên tục (Prime Power)").maxFuel, null, "the load is after the figure: not read");
  const t = (row) => [{ n: 101, title: "Weichai gensets 50Hz", header: ["| Model | Standby kVA | Standby kW | Prime kVA | Prime kW | Engine | Alternator |"], rows: [row] }];
  const list = [
    { id: "lo", country: "CN", confidence: "high", specTables: t("| L-1 | 413 | 330 | 375 | 300 | WP13D385E200 | XY444 |") },
    { id: "ok", country: "CN", confidence: "low", specTables: t("| O-1 | 450 | 360 | 413 | 330 | WP13D405E200 | XY444 |") },
  ];
  const hints = hintsOf("Chương V. Yêu cầu kỹ thuật\nCông suất liên tục ≥ 400 kVA (Prime)\n50 Hz");
  const { top } = candidates(C.build(list), { value: 400, unit: "kVA" }, hints, { suppliers: list });
  assert.deepEqual(top.map((r) => r.u.supplierId), ["ok", "lo"]);
  assert.match(top[1].why.join(" "), /Prime 375 kVA/);
});

test("controller datasheets: 'DSE6010/20 MKII' is two models; 'HGM6110' takes the HGM6110N datasheet, to be confirmed", () => {
  const list = [
    { id: "dse", role: "controller_maker", country: "GB", specTables: [{ n: 1007, title: "Datasheet: DSEGenset | DSE6010/20 MKII | ENVIRONMENTAL TESTING STANDARDS", header: [], rows: ["| DSE6010/20 MKII | ENVIRONMENTAL TESTING STANDARDS", "| EMERGENCY | DC POWER"] }] },
    { id: "sg", role: "controller_maker", country: "CN", specTables: [{ n: 1001, title: "Datasheet: HGM6100N SERIES (HGM6110N/6120N)", header: [], rows: ["HGM6100N SERIES (HGM6110N/6120N)", "Event log: 50 records"] }] },
  ];
  const facts = modelFacts(C.build(list), list);
  assert.ok(factsFor(facts, "controller", "DSE6020 MKII").length > 0);
  const dse = factsFor(facts, "controller", "DSE6020");
  assert.ok(dse.length > 0 && dse.every((f) => f.version === "DSE6020 MKII"));
  const hgm = factsFor(facts, "controller", "HGM6110");
  assert.ok(hgm.some((f) => /Event log/.test(f.line)) && hgm.every((f) => f.version === "HGM6110N"));
});

test("figures as Vietnamese writes them: '1.600 kW' is 1600, '12 ± 0,5 kVA' is 12 (2026-11-03 regression run)", () => {
  assert.deepEqual(powerMins("Công suất liên tục (Prime) ≥ 1.600 kW").minPrime, { kW: 1600 });
  assert.deepEqual(powerMins("Công suất liên tục ≥ 400 kVA / 320 kW").minPrime, { kVA: 400, kW: 320 });
  assert.deepEqual(capacity(["39 máy, công suất liên tục ≥ 12 ± 0,5 KVA (100% tải)"]), { value: 12, unit: "kVA" });
  assert.deepEqual(capacity(["6 x 8,5 +/- 0,5 kVA (1 pha)"]), { value: 8.5, unit: "kVA" });
  assert.deepEqual(capacity(["2 x 1.600 kW liên tục"]), { value: 1600, unit: "kW" });
});

test("'≥ 12 ± 0,5 kVA' continuous asks at least 11.5 kVA prime", () => {
  assert.deepEqual(powerMins("công suất liên tục ≥ 12 ± 0,5 KVA (100% tải)").minPrime, { kVA: 11.5 });
});

test("the engine's own continuous output is not the genset's; close genset and alternator figures give the lowest", () => {
  const t = "Công suất liên tục (100 % tải)\n≥ 12 ± 0,5 KVA\n4\nCông suất dự phòng\n≥ 13,2KVA.\n6\nCông suất liên tục của động cơ\n≥ 15,5KW.\n5\nCông suất liên tục\n≥ 12KVA.";
  assert.deepEqual(powerMins(t).minPrime, { kVA: 11.5 });
  assert.equal(powerMins("Máy 1: Công suất liên tục ≥ 250 kVA\nMáy 2: Công suất liên tục ≥ 30 kVA").minPrime, null);
});

test("an engine section in kW under a genset in kVA, a maximum, or a second smaller genset are not the genset prime minimum", () => {
  assert.deepEqual(powerMins("Công suất định mức\n≥ 12.0 kVA\nLoại động cơ\n4 kỳ làm mát bằng nước\n2\nCông suất liên tục\n≥ 15,5 kW.\n3\nCông suất tối đa\n≥ 17 KW").minPrime, { kVA: 12 });
  assert.equal(powerMins("- Công suất liên tục: 12.5kVA/10kW\n* Đầu phát\n- Công suất liên tục: 13kVA\n- Công suất liên tục: 5kW").minPrime, null);
  assert.deepEqual(powerMins("Công suất liên tục (Prime) ≥ 1.600 kW").minPrime, { kW: 1600 });
});

test("ranking counts each controller function of a group: 26 of 30 met before 4 of 30", () => {
  const parts = (met) => Array.from({ length: 30 }, (_, i) => ({ item: `F${i}`, status: i < met ? "met" : "unclear" }));
  const cfg = (model, met, extra) => ({ engine: { model: "E" }, controller: { model }, suppliers: [{ supplierId: "s" }],
    checks: [{ item: "Chức năng", part: "controller", status: "unclear", parts: parts(met) }, { item: "Công suất", part: "genset", status: extra }] });
  const r = rankConfigs({ requirements: [], configs: [cfg("DSE7320", 4, "met"), cfg("HGM6110NC", 26, "unclear")] });
  assert.deepEqual(r.configs.map((c) => c.controller.model), ["HGM6110NC", "DSE7320"]);
});

test("a controller written without its series ('6120' by SmartGen, 'Smartgen 6120') takes the HGM6120 datasheet", async () => {
  const { ctlModelOf } = await import("./config-bot.mjs");
  assert.equal(ctlModelOf({ model: "6120", make: "SmartGen" }), "HGM6120");
  assert.equal(ctlModelOf({ model: "Smartgen 6120" }), "HGM6120");
  assert.equal(ctlModelOf({ model: "7320", make: "Deep Sea" }), "DSE7320");
  assert.equal(ctlModelOf({ model: "RUIFEN6120" }), "RUIFEN6120");
});

test("a row number under a label is not its figure; a tank or coolant volume is not the displacement", () => {
  const mins = (t) => { const { minDisp, minCyl } = engineMins(t); return { minDisp, minCyl }; };
  assert.deepEqual(mins("Số xy lanh: Nêu rõ\n7\n\nTốc độ quay: 1500 vòng / phút"), { minDisp: null, minCyl: null });
  assert.deepEqual(mins("9    Bình nhiên liệu    Bằng thép, dung tích ≥ 25 lít\n1.7 Hệ thống làm mát Dung tích chất làm mát: Cho động cơ 23,1 Lít"), { minDisp: null, minCyl: null });
  assert.deepEqual(mins("Số xilanh \n≥ 1 \nX"), { minDisp: null, minCyl: 1 });
});

test("HSMT minimums that do not fit this genset (another size, an OCR slip) are left out; '250 ekW' is 250 kW", () => {
  const cap = { value: 2500, unit: "kVA" };
  assert.equal(plausible({ maxFuel: 104.2, minDisp: 13 }, cap).maxFuel, null);
  assert.equal(plausible({ maxFuel: 104.2, minDisp: 13 }, cap).minDisp, 13);
  assert.equal(plausible({ minPrime: { kVA: 107 } }, { value: 8.5, unit: "kVA" }).minPrime, null);
  assert.deepEqual(plausible({ minPrime: { kVA: 11.5 }, maxFuel: 4.9 }, { value: 12, unit: "kVA" }), { minPrime: { kVA: 11.5 }, maxFuel: 4.9 });
  assert.equal(plausible({ minDisp: 13 }, { value: 30, unit: "kVA" }).minDisp, null);
  assert.equal(plausible({ minDisp: 3.9 }, { value: 8.8, unit: "kVA" }).minDisp, 3.9);
  assert.deepEqual(capacity(["250 ekW và 50 ekW"]), { value: 250, unit: "kW" });
});

test("a controller written two ways ('DSE7320', 'Deepsea 7320') gets the earlier configuration's checks", async () => {
  const { copyModelChecks } = await import("./config-bot.mjs");
  const configs = [
    { rank: 1, controller: { model: "DSE7320", make: "Deep Sea" }, checks: [{ item: "Chức năng", part: "controller", status: "unclear", parts: [{ item: "AMF", status: "unclear" }] }] },
    { rank: 2, controller: { model: "Deepsea 7320" }, checks: [] },
  ];
  copyModelChecks(configs);
  assert.equal(configs[1].checks.length, 1);
  assert.equal(configs[1].checks[0].copiedFrom, 1);
});

test("a table whose models run across: any row may be quoted, each figure from the model's own column", () => {
  const eng = "| Engine | CP192FE | CP195FE | CP198FE";
  const s = [{ id: "cam", country: "CN", confidence: "medium", role: "genset_oem", specTables: [{ n: 103, title: "Cameo diesel generators", header: [],
    rows: ["| Rated Frequency(Hz) | 50 | 50 | 50", "| Rated Power(kva) | 6.5 | 7 | 8", eng, "| Displacement(CC) | 499 | 531 | 633"] }] }];
  const src = { kind: "catalog", supplierId: "cam", n: 103, line: eng };
  const r = (offered) => ({ requirements: [{ item: "Dung tích", requirement: "≥ 600 cc", quote: "Dung tích xi lanh ≥ 11 lít", part: "engine", level: "core" }],
    configs: [{ rank: 1, engine: { model: "CP198FE", src }, suppliers: [{ supplierId: "cam", n: 103, line: eng }],
      checks: [{ item: "Dung tích", part: "engine", status: "met", offered, sourceQuote: "| Displacement(CC) | 499 | 531 | 633" }] }] });
  const ok = check(r("633 cc (cột CP198FE)"), { hsmtText: hsmt, suppliers: s, readWeb: () => null, origin: "all" });
  assert.equal(ok.result.configs[0].checks[0].status, "met");
  const wrong = check(r("531 cc"), { hsmtText: hsmt, suppliers: s, readWeb: () => null, origin: "all" });
  assert.equal(wrong.result.configs[0].checks[0].status, "unclear");
});

test("a largest displacement of the HSMT ('≤ 15,2 L') ranks larger engines lower", () => {
  assert.equal(engineMins("Dung tích xi lanh ≤ 15,2 L\nDung tích bình nhiên liệu ≤ 500 lít").maxDisp, 15.2);
  const t = (row) => [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) |"], rows: [row] }];
  const list = [
    { id: "big", country: "CN", confidence: "high", specTables: t("| G-1 | 700 | 560 | YC6TD840-D31 | NFS5-F | 19.6 |") },
    { id: "fit", country: "CN", confidence: "low", specTables: t("| G-2 | 700 | 560 | YC6C1020-D31 | NFS5-F | 14.9 |") },
  ];
  const cat = C.build(list), hints = { ...hintsOf("Dung tích xi lanh ≤ 15,2 L"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] };
  const { top } = candidates(cat, { value: 700, unit: "kVA" }, hints, { suppliers: list, origin: "cn", cn: cnSuppliers(list) });
  assert.deepEqual(top.map((r) => r.e.model), ["YC6C1020-D31", "YC6TD840-D31"]);
  assert.match(top[1].why.join(" "), /19.6 L > 15.2 L/);
});

test("a largest displacement below the least one, or too small for the power, is left out", () => {
  assert.equal(plausible({ minDisp: 3.9, maxDisp: 2.3 }, { value: 8.8, unit: "kVA" }).maxDisp, null);
  assert.equal(plausible({ maxDisp: 13 }, { value: 2500, unit: "kVA" }).maxDisp, null);
  assert.equal(plausible({ maxDisp: 15.3 }, { value: 700, unit: "kVA" }).maxDisp, 15.3);
});

test("a table whose models run across is read from the right: rows with two label cells line up", () => {
  const eng = "| Engine | Engine Model | LPG210 | LPG420 | LPG620";
  const s = [{ id: "lp", country: "CN", confidence: "medium", role: "genset_oem", specTables: [{ n: 103, title: "LPG generators", header: [],
    rows: [eng, "| Rated.AC output (KVA) | 2.0 | 5.0 | 8.5"] }] }];
  const src = { kind: "catalog", supplierId: "lp", n: 103, line: eng };
  const r = (offered) => ({ requirements: [{ item: "Công suất", requirement: "≥ 5 kVA", quote: "Dung tích xi lanh ≥ 11 lít", part: "genset", level: "core" }],
    configs: [{ rank: 1, engine: { model: "LPG420", src }, suppliers: [{ supplierId: "lp", n: 103, line: eng }],
      checks: [{ item: "Công suất", part: "genset", status: "met", offered, sourceQuote: "| Rated.AC output (KVA) | 2.0 | 5.0 | 8.5" }] }] });
  const opts = { hsmtText: hsmt, suppliers: s, readWeb: () => null, origin: "all" };
  assert.equal(check(r("5.0 kVA"), opts).result.configs[0].checks[0].status, "met");
  assert.equal(check(r("8.5 kVA"), opts).result.configs[0].checks[0].status, "unclear");
});

test("catalog: a second label cell is joined to the label, figures per frequency are not", () => {
  const eng = (list, model) => C.build(list).engines.find((e) => e.model === model)?.uses[0];
  const lpg = [{ id: "v", country: "CN", specTables: [{ n: 1, title: "LPG generators", header: [], rows: [
    "| Generator | Model : | LPG2500 | LPG6500 | LPG11000", "| Frequency (Hz) | 50 | 50 | 50", "| Rated.AC output (KVA) | 2.0 | 5.0 | 8.5",
    "| Engine | Engine Model | LPG210 | LPG420 | LPG620", "| Displacement (cc) | 208 | 389 | 614"] }] }];
  assert.deepEqual(eng(lpg, "LPG420").power.rated, { kVA: 5 });
  const xh = [{ id: "x", country: "CN", specTables: [{ n: 1, title: "Gasoline", header: ["| Model | DG8500SE | DG9500SE"], rows: [
    "| Frequency (Hz) | 50 | 60 | 50 | 60", "| Rated output(KW) | 6 | 6.5 | 7 | 7.5", "| Engine Model | 192F | 195F", "| Bore*stroke(mm) | 92*75 | 95*75"] }] }];
  assert.equal(eng(xh, "192F").power.rated.kW, 6);
});

test("the genset's capacity, not a transformer's or a UPS's in the same name (2026-11-04 regression over 1,241 HSMT)", () => {
  assert.deepEqual(capacity(["Gói thầu số 14: Mua sắm, lắp đặt máy biến áp 400kVA; máy phát điện 350kVA"]), { value: 350, unit: "kVA" });
  assert.deepEqual(capacity(["Cung cấp UPS 10KVA và máy phát điện 5KVA, 3KVA"]), { value: 5, unit: "kVA" });
  assert.deepEqual(capacity(["Thí nghiệm TBA 400kVA, 560kVA; bảo dưỡng máy phát điện", "377 kVA"]), { value: 377, unit: "kVA" });
  assert.deepEqual(capacity(["Trạm biến áp 630kVA-22/0,4kV; Máy phát điện dự phòng", "250 kVA"]), { value: 250, unit: "kVA" });
  // Gensets only: the first figure, as before.
  assert.deepEqual(capacity(["220 kVA (01 tổ máy); 7.5 kVA (01 tổ máy)"]), { value: 220, unit: "kVA" });
  assert.deepEqual(capacity(["Mua sắm máy phát điện 12.5KVA và 15KVA"]), { value: 12.5, unit: "kVA" });
});

test("engine minimums in column tables, with the unit in the label or in cc (2026-11-04 regression)", () => {
  const mins = (t) => { const { minDisp, minCyl } = engineMins(t); return { minDisp, minCyl }; };
  assert.deepEqual(mins(" 1.2       Số xilanh                                                04"), { minDisp: null, minCyl: 4 });
  assert.deepEqual(mins("4.    Dung tích xy lanh (L)      ≥ 4.45          Bắt buộc"), { minDisp: 4.45, minCyl: null });
  assert.deepEqual(mins("7. Dung tích động cơ Tối thiểu 25.000 cm3"), { minDisp: 25, minCyl: null });
  assert.deepEqual(mins("8 Dung tích xilanh ≥ 2300 cc Đạt Không đạt"), { minDisp: 2.3, minCyl: null });
  // Two gensets of the tender: no single minimum.
  assert.deepEqual(mins("Dung tích xi lanh > 2.900 cm3\nDung tích xi lanh > 667 cm3"), { minDisp: null, minCyl: null });
});

test("prime with the load or the units in the label, or the figure on the next line (2026-11-04 regression)", () => {
  assert.deepEqual(powerMins("Công suất liên tục (100% tải) 125kVA / 100 kW\nCông suất dự phòng (110% tải) 137,5 kVA / 110 kW").minPrime, { kVA: 125, kW: 100 });
  assert.deepEqual(powerMins("Công suất liên tục (kVA/kW) 100/80, Công suất dự phòng (kVA/kW) 110/88").minPrime, { kVA: 100, kW: 80 });
  assert.deepEqual(powerMins("- Công suất dự phòng: 2.500kVA/2.000kW.\n- Công suất liên tục:\n2.250kVA/1.800kW.").minPrime, { kVA: 2250, kW: 1800 });
  assert.deepEqual(powerMins("+ Tổ máy phát: công suất liên tục\n16KW/20KVA, công suất dự phòng 18KW/22KVA").minPrime, { kW: 16, kVA: 20 });
  assert.equal(powerMins("Công suất liên tục của động cơ\n15,5 kW").minPrime, null);
});
