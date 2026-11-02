// node --test suppliers/*.test.mjs — genset controllers (web/catalog.js controllersIn, controllers.mjs, check).
import test from "node:test";
import assert from "node:assert/strict";
import { controllersOf, lineAround } from "./controllers.mjs";
import { check } from "./config-bot.mjs";

const CAT = globalThis.GenbidCatalog;
const names = (line) => CAT.controllersIn(line).map((c) => c.model || `${c.brand}?`);

test("controller models are read as written, makes alone only on a controller line", () => {
  assert.deepEqual(names("• DSE6020, HGM6120N, DSE7320 (AMF) Series Standard control panel"), ["DSE6020", "DSE7320", "HGM6120N"]);
  assert.deepEqual(names("| GF/GFS-C200 | 200 | 250 | NT855-GA | ELS 274J | Smartgen 6120 | Detail"), ["HGM6120"]);
  assert.deepEqual(names("Genset Control panel: Deepsea DSE6120"), ["DSE6120"]);
  assert.deepEqual(names("4. Famous brand COMAP AMF20 controller"), ["AMF20"]);
  assert.deepEqual(names("Controller: Deepsea/Comap/Smartgen"), ["Deep Sea?", "SmartGen?", "ComAp?"]);
  assert.deepEqual(names("InteliLite NT AMF25 with RS485"), ["InteliLite NT AMF25"]);
  // Not controllers: expansion modules, a make on a line about something else, AMF without ComAp.
  assert.deepEqual(names("DSE2548 annunciator, DSE2157 relay module"), []);
  assert.deepEqual(names("Deep sea marine application"), []);
  assert.deepEqual(names("Standard AMF25 function"), []);
});

test("controllersOf keeps one entry per model with its line, a make alone only without a model", () => {
  const pages = [
    { n: 1, text: "URL: x\nAccessed: y\n\nController: Deepsea/Smartgen\nOptional DSE7320 controller" },
    { n: 101, text: "URL: x\nAccessed: y\n\n| W-1 | 250 | DSE7320 |" },
    { n: 102, text: "URL: x\nAccessed: y\n\nOptional DSE7320 controller" },
  ];
  const c = controllersOf(pages);
  // Page 101 names it on another line, so it is not a source of the line kept.
  assert.deepEqual(c.map((x) => [x.model || x.brand, x.src]), [["DSE7320", [1, 102]], ["SmartGen", [1]]]);
  assert.equal(c[0].line, "Optional DSE7320 controller");
  const long = "a ".repeat(300) + "DSE6120 controller " + "b ".repeat(300);
  const cut = lineAround(long, "DSE6120");
  assert.ok(cut.length < 300 && cut.includes("DSE6120") && long.includes(cut));
});

test("catalog builds controllers from records and genset rows", () => {
  const s = { id: "s", role: "genset_oem", names: { en: "S" }, controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: "Optional DSE7320 controller", src: [1] }],
    specTables: [{ n: 101, title: "Weichai gensets", header: ["| Model | Standby kVA | Standby kW | Prime kVA | Prime kW | Engine | Controller"], rows: ["| W-1 | 312.5 | 250 | 275 | 220 | WP10D264E200 | HGM6120N"] }] };
  const cat = CAT.build([s]);
  const m = Object.fromEntries(cat.controllers.map((e) => [e.model, e]));
  assert.ok(m.DSE7320 && m.HGM6120N);
  assert.equal(m.HGM6120N.uses[0].other, "WP10D264E200");
  assert.deepEqual(m.HGM6120N.kva, [275, 312.5]);
});

test("check accepts a controller quoted from the supplier's controller line", () => {
  const line = "Optional DSE7320 controller with AMF";
  const sup = [{ id: "s", controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line, src: [1] }], specTables: [] }];
  const result = { configs: [{ rank: 1, controller: { model: "DSE7320", make: "Deep Sea", src: { kind: "controller", supplierId: "s", n: 1, line } },
    checks: [{ item: "Bộ điều khiển", hsmtQuote: "Bộ điều khiển DSE7320", offered: "DSE7320", sourceQuote: "DSE7320 controller with AMF", part: "controller", status: "met" }] }] };
  const { problems } = check(result, { hsmtText: "Yêu cầu: Bộ điều khiển DSE7320 hoặc tương đương", suppliers: sup, readWeb: () => null });
  assert.deepEqual(problems, []);
  const bad = structuredClone(result); bad.configs[0].controller.src.line = "DSE7320 typed by hand";
  assert.ok(check(bad, { hsmtText: "Bộ điều khiển DSE7320", suppliers: sup, readWeb: () => null }).problems.length);
});

test("Deep Sea MKIII is its own generation, not MKII", () => {
  const C = globalThis.GenbidCatalog;
  assert.deepEqual(["DSE6120 MKIII", "DSE6120MK3", "DSE7320 MKII", "DSE8610 MK2", "DSE 7320"].map((s) => C.controllersIn(s).map((c) => c.model).join()), ["DSE6120 MKIII", "DSE6120 MKIII", "DSE7320 MKII", "DSE8610 MKII", "DSE7320"]);
});
