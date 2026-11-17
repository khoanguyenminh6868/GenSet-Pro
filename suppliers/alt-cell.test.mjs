// node --test suppliers/*.test.mjs — altOf(): ô đầu phát ghi kèm hãng ("Stamford S5L1D-C41") vẫn ghép được với danh mục.
import test from "node:test";
import assert from "node:assert/strict";
import { altOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | No. of Cylinder |";
const sup = (id, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows }] });
// Dòng thật (cummins-dongfeng): ô đầu phát ghi "Stamford S5L1D-C41".
const list = [
  sup("a", ["| CG550E-H1 | 550 | 440 | QSX15-G8 | Stamford S5L1D-C41 | 6L |"]),
  sup("b", ["| X-1 | 550 | 440 | QSX15-G8 | S5L1D-C41 | 6L |", "| Y-1 | 400 | 320 | 6CTAA8.3-G2 | Leroy-Somer TAL044 | 6L |"]),
];
const cat = C.build(list), alts = new Map(cat.alternators.map((x) => [x.key, x]));

test("altOf: ô trơ, ô kèm hãng, ô kèm hãng có gạch nối", () => {
  assert.equal(altOf(alts, "S5L1D-C41")?.key, "S5L1D-C41".replace(/-/g, ""));
  assert.equal(altOf(alts, "Stamford S5L1D-C41")?.key, "S5L1D-C41".replace(/-/g, ""));
  assert.equal(altOf(alts, "Leroy-Somer TAL044") ? "ok" : "none", alts.has("TAL044") ? "ok" : "none");
});
test("altOf: không đoán — hãng lạ hay mã không có trong danh mục thì null", () => {
  assert.equal(altOf(alts, "Stamford ZZ9Z9-Q99"), null);
  assert.equal(altOf(alts, "Foobar S5L1D-C41"), null);
  assert.equal(altOf(alts, ""), null);
  assert.equal(altOf(alts, null), null);
});
test("danh mục có đầu phát S5L1D-C41 từ dòng của cả hai NCC", () => {
  const a = alts.get("S5L1DC41");
  assert.ok(a, [...alts.keys()].join(","));
});
