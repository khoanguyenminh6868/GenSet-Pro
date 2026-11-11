// node --test suppliers/*.test.mjs — catalogs Khoa uploads (catalog-pdf.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { segments, keptRow, known, engineRow } from "./catalog-pdf.mjs";

test("an engine power selector line: figures from the end, pf 0.8 pairs, engine above the set", () => {
  assert.deepEqual(engineRow("0.76        403J-07G        EU     Stage  V  -               5      6           5           6    5                 6    -    -"), { cop: false, row: "| 403J-07G | 5 | 6 | 5 | 6 | 5 | 6" });
  // "Tier 4" is not a figure; prime = standby engine output (9 / 9) is not a pair of ratings the check can tell apart.
  assert.deepEqual(engineRow("1.1         403F-11G        U.S  EPA  Tier  4  Final  -                 9      9           7           9    8                 10   -    -"), null);
  assert.deepEqual(engineRow("            1103D-33G2                                  29     32                         25           32   28      35            Y"), { cop: false, row: "| 1103D-33G2 | 29 | 32 | 25 | 32 | 28 | 35" });
  assert.deepEqual(engineRow("            4016-61TRG1    1179         1558             1648     1120       1400  1480  1850                    1600  2000"), { cop: true, row: "| 4016-61TRG1 | 1179 | 1558 | 1648 | 1120 | 1400 | 1480 | 1850 | 1600 | 2000" });
  // 176 kWe is not 225 kVA at pf 0.8: dropped, not mended.
  assert.equal(engineRow("            1206D-E70TTAG1                      178    196     160          200     176       225"), null);
});

const C = globalThis.GenbidCatalog;
const engines = new Map(["4B3.9-G2", "QSB5-G1", "KTA19-G3", "403A-11G1", "QSK19-G4"].map((m) => [C.keyOf(m), m]));
const alternators = new Map(["S0L1-H1", "QSK19-G4"].map((m) => [C.keyOf(m), m]));

test("two tables side by side on one OCR line are cut at each model", () => {
  const segs = segments("KCC-25GF 30 24 27 22 4B3.9-G2 3.9 208 KCC-30GF 35 28 30 25 4B3.9-G2 3.9");
  assert.deepEqual(segs.map((s) => s[0]), ["KCC-25GF", "KCC-30GF"]);
});

test("a row needs two kW / kVA pairs, a known engine and a model figure that fits the power", () => {
  assert.equal(keptRow("KCC-25GF 30 24 27 22 4B3.9-G2 3.9 208".split(" "), engines, alternators), "| KCC-25GF | 22 | 27 | 24 | 30 | 4B3.9-G2 |");
  // Engine second (APP), pairs in kW / kVA order.
  assert.equal(keptRow("APP-75GF QSB5-G1 55 69 60 75".split(" "), engines, alternators), "| APP-75GF | 55 | 69 | 60 | 75 | QSB5-G1 |");
  // OCR misreads: a figure off (30 → 38), the model's figure (80 for 25), an engine nobody has.
  assert.equal(keptRow("KCC-25GF 38 24 27 22 4B3.9-G2".split(" "), engines, alternators), null);
  assert.equal(keptRow("KCC-80GF 30 24 27 22 4B3.9-G2".split(" "), engines, alternators), null);
  assert.equal(keptRow("KCC-25GF 30 24 27 22 4B39-G9".split(" "), engines, alternators), null);
});

test("the Z of a 4Z engine read as 7 or 2 is put back only when that engine is known", () => {
  const e = new Map([...engines, [C.keyOf("4Z2.3-G11"), "4Z2.3-G11"]]);
  assert.equal(keptRow("APP-16GF 472.3-G11 12 15 13.6 17".split(" "), e, alternators), "| APP-16GF | 12 | 15 | 13.6 | 17 | 4Z2.3-G11 |");
  assert.equal(keptRow("APP-16GF 472.9-G11 12 15 13.6 17".split(" "), e, alternators), null);
});

test("an alternator code that is an engine model is not taken as the alternator", () => {
  assert.equal(keptRow("KCC-560GF 625 500 563 450 KTA19-G3 QSK19-G4".split(" "), engines, alternators), "| KCC-560GF | 450 | 563 | 500 | 625 | KTA19-G3 |");
});

test("one rating only with --single; slashed prime / standby figures; a new engine only from the PDF's text", () => {
  assert.equal(keptRow("UP10GF 8 10 403A-11G1 9 3.L 77x81 S0L1-H1".split(" "), engines, alternators), null);
  assert.equal(keptRow("UP10GF 8 10 403A-11G1 9 3.L 77x81 S0L1-H1".split(" "), engines, alternators, true), "| UP10GF | 8 | 10 | 403A-11G1 | S0L1-H1");
  assert.equal(keptRow("UD120GF 120/150 132/165 DP086TA 137".split(" "), engines, alternators, true, true), "| UD120GF | 120 | 150 | 132 | 165 | DP086TA |");
  assert.equal(keptRow("UP250GF 200 250 1206A-E70TTAG3 217 6.L".split(" "), engines, alternators, true), null);
  assert.equal(keptRow("UP250GF 200 250 1206A-E70TTAG3 217 6.L".split(" "), engines, alternators, true, true), "| UP250GF | 200 | 250 | 1206A-E70TTAG3 |");
});

test("a row the record has (same model and codes) is not added again", () => {
  const have = ["| MC66C | 66 | 53 | 60 | 48 | 4BTA3.9-G2 | CN"].map((r) => new Set(C.cellsOf(r).map((c) => C.keyOf(c.trim()))));
  assert.equal(known("| MC66C | 48 | 60 | 53 | 66 | 4BTA3.9-G2 |", have), true);
  assert.equal(known("| MC66C | 48 | 60 | 53 | 66 | 4BTAA3.3G14 |", have), false);
});
