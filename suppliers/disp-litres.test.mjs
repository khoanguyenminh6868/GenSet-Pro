// node --test suppliers/*.test.mjs — a displacement in litres written with three decimals ("9.726L") is no thousand
// litres (2026-11-12, westinpower "Displacement | 9.726L" of a Baudouin 6M16 was read 9726 L).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, litres } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;

test("litres: three decimals with a litre unit are decimals; cc and plain figures as before", () => {
  assert.equal(litres("9.726L"), 9.726);
  assert.equal(litres("1,116 L"), 1.116);
  assert.equal(litres("12.540 lít"), 12.54);
  assert.equal(litres("105,560 L"), 105.56);
  assert.equal(litres("1.234.567 L"), null, "two separators in litres: no figure");
  // unchanged
  assert.equal(litres("9.726 cc"), 9.726);
  assert.equal(litres("9726 cc"), 9.726);
  assert.equal(litres("9.726"), 9.726);
  assert.equal(litres("105,56 L"), 105.56);
  assert.equal(litres("257 L"), 257);
  assert.equal(litres("12 L"), 12);
  assert.equal(litres("2.197 cm³"), 2.197);
});

test("a row's '9.726L' no longer puts an engine past the largest displacement of the HSMT", () => {
  const sheet = (id) => ({ id, country: "CN", confidence: "high", specTables: [
    { n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kW | Prime kVA | Engine | Alternator | Displacement |"], rows: ["| G-1 | 200 | 250 | WP10D264E200 | UCI274G | 9.726L |"] },
  ] });
  const list = [sheet("w")];
  const hints = { ...hintsOf("Chương V. Yêu cầu kỹ thuật\nDung tích xy lanh ≤ 9.8 L\n50 Hz"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] };
  const r = candidates(C.build(list), { value: 250, unit: "kVA" }, hints, { suppliers: list });
  assert.equal(hints.maxDisp, 9.8);
  assert.deepEqual(r.dropped.map((x) => x.ruled), []);
  assert.deepEqual(r.top.map((x) => x.u.supplierId), ["w"]);
});
