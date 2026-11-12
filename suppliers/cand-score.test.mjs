// node --test suppliers/*.test.mjs — candidates(): engines first (Khoa, 2026-11-12). `fit` (what the HSMT names) decides which
// engines enter; `data` (figures, alternator, controller, confidence) only picks the supplier that shows an engine and breaks ties.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) | Cylinders |";
const rich = (id, rows, conf = "high", mk = "Cummins") => ({ id, country: "CN", confidence: conf, specTables: [{ n: 101, title: `${mk} gensets 50Hz`, header: [H], rows }] });
const bare = (id, rows, conf = "low", mk = "Cummins") => ({ id, country: "CN", confidence: conf, specTables: [{ n: 101, title: `${mk} gensets 50Hz`, header: ["| Model | Prime kVA | Prime kW | Engine |"], rows }] });
const free = (text = "50 Hz") => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const cap = { value: 400, unit: "kVA" };
const run = (list, hints, o = {}) => candidates(C.build(list), cap, hints, { suppliers: list, patches: false, ...o });
const make = (r) => (r.e.make || "?").split(" / ")[0];
const CUM = ["NTA855-G2A", "KTA19-G3", "QSZ13-G3", "QSX15-G8", "QSL9-G5", "QSG12-G4"], YC = ["YC6K520-D30", "YC6MJ500L-D21"], WC = ["WP13D405E200", "WP13D385E200"];
const cumRows = (id) => rich(id, CUM.map((e, i) => `| ${id}-${i} | 420 | 336 | ${e} | HCI444F | 12 | 6 |`));
const others = () => [bare("yc", YC.map((e, i) => `| Y-${i} | 420 | 336 | ${e} |`), "low", "Yuchai"), bare("wc", WC.map((e, i) => `| W-${i} | 420 | 336 | ${e} |`), "low", "Weichai")];

test("engine first: the make with the most datasheet figures does not take every place", () => {
  const list = [cumRows("c1"), cumRows("c2"), ...others()];
  const top = run(list, free(), { max: 6 }).top;
  assert.equal(top.length, 6);
  const makes = new Set(top.map(make));
  assert.ok(makes.has("Yuchai") && makes.has("Weichai"), [...makes].join());
  // By the old score the six Cummins rows (more data) would have been the whole list.
  assert.ok(top.filter((r) => make(r) === "Cummins").length <= 2);
});

test("engines of equal fit take turns by make: round 1 the best engine of each make, round 2 the second", () => {
  const list = [cumRows("c1"), ...others()];
  const top = run(list, free(), { max: 6 }).top;
  assert.deepEqual(top.map(make).sort(), ["Cummins", "Cummins", "Weichai", "Weichai", "Yuchai", "Yuchai"]);
  const four = run(list, free(), { max: 3 }).top;
  assert.deepEqual(four.map(make).sort(), ["Cummins", "Weichai", "Yuchai"]);
});

test("every engine has a row before any has a second one (another supplier)", () => {
  const list = [cumRows("c1"), cumRows("c2"), ...others()];
  const engines = new Set(run(list, free(), { max: 100 }).all.map((r) => r.e.key)).size;
  let top = run(list, free(), { max: engines }).top;
  assert.equal(new Set(top.map((r) => r.e.key)).size, engines, "one row of each engine");
  top = run(list, free(), { max: engines + 2 }).top;
  assert.equal(top.length, engines + 2);
  assert.equal(new Set(top.map((r) => r.e.key)).size, engines);
});

test("fit before data: the engine of the HSMT's make goes first however few figures it has", () => {
  const list = [cumRows("c1"), ...others()];
  const hints = { ...free(), engineMakes: ["Yuchai"] };
  const top = run(list, hints, { max: 4 }).top;
  assert.equal(make(top[0]), "Yuchai"); assert.equal(make(top[1]), "Yuchai");
  assert.ok(top[0].fit > top[2].fit);
});

test("data only picks the supplier of an engine and breaks ties", () => {
  const list = [rich("many", ["| M-1 | 420 | 336 | QSL9-G5 | HCI444F | 8.9 | 6 |"], "high"), bare("few", ["| F-1 | 420 | 336 | QSL9-G5 |"], "low")];
  const top = run(list, free(), { max: 1 }).top;
  assert.equal(top.length, 1);
  assert.equal(top[0].u.supplierId, "many");
  const rows = run(list, free(), { max: 2 }).top;
  assert.deepEqual(rows.map((r) => r.u.supplierId), ["many", "few"]);
  assert.ok(rows[0].data > rows[1].data && rows[0].fit === rows[1].fit);
});

test("fit and data: score is their sum less the power over the size", () => {
  const top = run([cumRows("c1")], free(), { max: 6 }).top;
  for (const r of top) assert.ok(r.score <= r.fit + r.data && r.score >= r.fit + r.data - 20);
});
