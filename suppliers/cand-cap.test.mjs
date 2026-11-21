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


const cum = (n) => Array.from({ length: n }, (_, i) => cumRows(`c${i + 1}`));
const keepOf2 = (pairs) => new Set(pairs.map(([s, e]) => `${s}\n${C.keyOf(e)}`));

test("ceiling per make: no make has more than makeCap rows while others can fill; no HSMT make or model named", () => {
  const list = [...cum(2), ...others()];
  const top = run(list, free(), { max: 7, makeCap: 3, patches: false }).top;
  assert.equal(top.length, 7);
  const by = {}; for (const r of top) by[make(r)] = (by[make(r)] || 0) + 1;
  assert.ok(by.Cummins <= 3, JSON.stringify(by));
  assert.equal(by.Yuchai, 2); assert.equal(by.Weichai, 2); assert.equal(by.Cummins, 3);
  // Without the ceiling the six engines of Cummins, with the most figures, come first.
  const open = run(list, free(), { max: 8, makeCap: 0, patches: false }).top.filter((r) => make(r) === "Cummins").length;
  assert.ok(open > 3, String(open));
});

test("the places the ceiling leaves empty are filled with the best rows left, whatever their make", () => {
  const list = [...cum(3), bare("yc", ["| Y-0 | 420 | 336 | YC6K520-D30 |"], "low", "Yuchai")];
  const top = run(list, free(), { max: 10, makeCap: 2, patches: false }).top;
  assert.equal(top.length, 10);
  assert.equal(top.filter((r) => make(r) === "Yuchai").length, 1);
  assert.equal(top.filter((r) => make(r) === "Cummins").length, 9);
});

test("no ceiling when the HSMT names an engine make", () => {
  const list = [...cum(2), ...others()];
  const top = run(list, { ...free(), engineMakes: ["Cummins"] }, { max: 8, makeCap: 3, patches: false }).top;
  assert.ok(top.filter((r) => make(r) === "Cummins").length > 3);
});

test("a make 'A / B' counts for A, and rows of no make share one group '?'", () => {
  const t = (id, title, rows) => ({ id, country: "CN", confidence: "low", specTables: [{ n: 101, title, header: ["| Model | Prime kVA | Prime kW | Engine |"], rows }] });
  const list = [cumRows("c1"), t("u1", "Gensets 50Hz", YC.concat(WC).map((e, i) => `| U-${i} | 420 | 336 | ${e} |`))];
  const r = run(list, free(), { max: 100, makeCap: 100, patches: false });
  const unknown = r.top.filter((x) => !x.e.make);
  assert.ok(unknown.length > 0, "fixture: engines of no make");
  const top = run(list, free(), { max: 4, makeCap: 2, patches: false }).top;
  assert.equal(top.length, 4);
  assert.ok(top.filter((x) => !x.e.make).length <= 2);
});

test("keep: the rows of the last run's configurations stay for every tender, not only Đồng bộ", () => {
  const list = [...cum(2), ...others()];
  const all = run(list, free(), { max: 100, patches: false }).all;
  const weak = all.filter((r) => make(r) === "Weichai").sort((a, b) => a.score - b.score)[0];
  const keep = keepOf2([[weak.u.supplierId, weak.e.model]]);
  const without = run(list, free(), { max: 3, makeCap: 0, patches: false }).top;
  assert.ok(!without.some((r) => r.u.supplierId === weak.u.supplierId && r.e.key === weak.e.key));
  const withKeep = run(list, free(), { max: 3, makeCap: 0, patches: false, keep }).top;
  assert.equal(withKeep.length, 3);
  assert.ok(withKeep.some((r) => r.u.supplierId === weak.u.supplierId && r.e.key === weak.e.key));
});

test("keep: a row the hard filters left out does not come back", () => {
  const list = [...cum(2), ...others()];
  // The HSMT wants at least 14.5 L: the Yuchai / Weichai rows (no displacement figure) stay, Cummins rows with 12 L go.
  const hints = free("Dung tích xy lanh ≥ 14,5 L\n50 Hz");
  const r = run(list, hints, { max: 100, makeCap: 0, patches: false });
  assert.ok(r.dropped.length > 0);
  const d = r.dropped[0], keep = keepOf2([[d.u.supplierId, d.e.model]]);
  const top = run(list, hints, { max: 100, makeCap: 0, patches: false, keep }).top;
  assert.ok(!top.some((x) => x.u.supplierId === d.u.supplierId && x.e.key === d.e.key));
});
