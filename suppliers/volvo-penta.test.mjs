// node --test suppliers/volvo-penta.test.mjs — the Volvo Penta product page / bulletin readers (volvo-penta.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { specTableOf, pagePower, powerOf, sharedOf, fuelOf, bulletinTables } from "./volvo-penta.mjs";

const page = { TAD880GE: { 50: { prime: { kWm: 129, kVA: 150, kWe: 120 }, standby: { kWm: 142, kVA: 165, kWe: 132 } }, 60: { prime: { kWm: 151, kVA: 175, kWe: 140 }, standby: { kWm: 166, kVA: 193, kWe: 154 } } },
  TAD881GE: { 50: { prime: { kWm: 172, kVA: 200, kWe: 160 } } } };
// Lines of bulletin 47712910 (pdftotext -layout), the right column cut.
const text = [
  "                    50 Hz / 1500 rpm                                60 Hz / 1800 rpm",
  "TAD880GE     97  90 113 129 120 150 142 132 165 113 105 132 151 140 175 166 154 193",
  "TAD881GE   129 120 150 172 160 200 189 176 220 149 138 173 198 184 230 218 203 253",
  "Displacement, l (in³)........................................... 7.7 (470)                – Cast iron cylinder block",
  "Bore, mm (in.)...................................................... 110 (4.33)",
  "Stroke, mm (in.).................................................... 135 (5.31)",
  "Wet weight *), engine only, kg (lb)........................... 723 (1594)",
  "Fuel consumption",
  "Prime Power, g/kWh (lb/hph)                                                                                –",
  "     TAD880GE                         TAD881GE",
  "     1500 rpm 1800 rpm 1500 rpm 1800 rpm",
  "25%    237               247      221                          239                       Electrical system",
  "     (0.384)           (0.400)  (0.358)                      (0.387)",
  "50%    206               213      199                          206",
  "75%    197               203      195                          200",
  "                                                                                         diagnostics and fault tracing.",
  "100% 195                 200      195                          198",
].join("\n");

test("page table: the JSON given to createElement(Specifications, …)", () => {
  const html = `x React.createElement(Specifications, {"head":["TAD880GE"],"body":[{"name":"50 Hz power","rows":[{"label":"Prime power","values":["129 kWm / 150 kVA / 120 kWe"]}]},{"name":"Details","rows":[{"label":"Fuel type","values":["Diesel/HVO \\"}\\""]}]}]}) y`;
  const spec = specTableOf(html);
  assert.deepEqual(spec.head, ["TAD880GE"]);
  assert.deepEqual(pagePower(spec).TAD880GE[50].prime, { kWm: 129, kVA: 150, kWe: 120, cell: "129 kWm / 150 kVA / 120 kWe" });
});

test("power: a figure is written only when the page gives the same kWm, kWe and kVA", () => {
  const p = powerOf(text, page);
  assert.deepEqual(p.filter((x) => x.model === "TAD880GE").map((x) => `${x.rating}${x.hz}=${x.kWm}@${x.rpm}`), ["prime50=129@1500", "standby50=142@1500", "prime60=151@1800", "standby60=166@1800"]);
  // TAD881GE: the page gives only its 50 Hz prime power.
  assert.deepEqual(p.filter((x) => x.model === "TAD881GE").map((x) => `${x.rating}${x.hz}`), ["prime50"]);
  // A column read wrongly (the page's 129 kWm put with other kWe / kVA) gives nothing.
  assert.equal(powerOf(text, { TAD880GE: { 50: { prime: { kWm: 129, kVA: 160, kWe: 128 } } } }).length, 0);
});

test("shared lines: bore × stroke, displacement, weight", () => {
  assert.deepEqual(sharedOf(text).map((r) => r.row), ["| Bore × Stroke, mm | 110 × 135", "| Displacement, l | 7.7", "| Wet weight, engine only, kg | 723"]);
});

test("fuel: models × speeds of the table, one figure per column, right column text left out", () => {
  const f = fuelOf(text, []);
  assert.equal(f.length, 16);
  assert.ok(f.some((x) => x.model === "TAD881GE" && x.row === "| Fuel consumption, prime power, 25% load, 1800 rpm | 239 g/kWh"));
  assert.ok(f.some((x) => x.model === "TAD880GE" && x.row === "| Fuel consumption, prime power, 100% load, 1500 rpm | 195 g/kWh"));
  // Printed shifted by a row (the 25% figures on the title line, TAD1641GE): left out.
  const shifted = ["Performance    1500 rpm    1800 rpm", "Prime Power, g/kWh (lb/hph)   216 (0.350)   228 (0.369)", "25 %   199 (0.322)   204 (0.331)", "50 %   196 (0.318)   202 (0.328)", "75 %   199 (0.322)   206 (0.334)", "100 %"].join("\n");
  assert.equal(fuelOf(shifted, ["TAD1641GE"]).length, 0);
});

test("bulletin: one table per model, each figure from its source line", () => {
  const t = bulletinTables(text, page);
  assert.deepEqual(t.map((x) => x.model), ["TAD880GE", "TAD881GE"]);
  assert.equal(t[0].rows[0].row, "| Net engine prime power kWm, 50 Hz / 1500 rpm | 129 kWm / 1500 rpm");
});
