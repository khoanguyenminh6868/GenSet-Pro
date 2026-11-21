// node --test suppliers/*.test.mjs — altOf(): make of two words ("FG Wilson FGL20060", "Leroy Somer LL5114H") in the engine row's cell
// (altof-fgw, Khoa 19/11/2026). Real lines: genlitec n122 / n132, saudi-diesel n114 (suppliers/cn).
import test from "node:test";
import assert from "node:assert/strict";
import { altOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const gen122 = sup("genlitec", [{ n: 122, title: "P900-1 FG Wilson 900kVA Diesel Generator", header: [], rows: [
  "| Model | FG Wilson P900-1", "| Frequency | 50Hz", "| Prime Power | 800kVA / 640kW", "| Standby Power | 892kVA / 713.6kW",
  "| Voltage | 380/400/415V", "| Engine | Perkins 4006-23TAG3A", "| Alternator | FG Wilson FGL70030", "| Engine Model | Perkins 4006-23TAG3A",
  "| Alternator Model | FG Wilson FGL70030"] }]);
const gen132 = sup("genlitec", [{ n: 132, title: "P550 Diesel Generator", header: [], rows: [
  "| Model | P550-1", "| Frequency | 50Hz", "| Prime Power | 500kVA / 400kW", "| Standby Power | 550kVA / 440kW",
  "| Engine | Perkins 2506C-E15TAG1", "| Alternator | Leroy Somer LL5114H", "| Engine Model | Perkins 2506C-E15TAG1", "| Alternator Model | Leroy Somer LL5114H"] }]);
// The record LL5114H comes from a row that writes the code alone (the catalog reads a make of two words in the cell only when it is
// a row's alternator cell of a table it can split; the engine row's "other" keeps the cell as written).
const gen1030 = sup("genlitec", [{ n: 1030, title: "Datasheet: Download as PDF", header: [], rows: [
  "| Engine Make | Perkins", "| Engine Model: | 2506C-E15TAG1", "| Alternator Make | Leroy Somer", "| Alternator Model: | LL5114H", "| Frequency: | 50 HZ | 60 HZ"] }]);
const cat = C.build([gen122, gen132, gen1030]), alts = new Map(cat.alternators.map((x) => [x.key, x]));
const makes = (a) => (a.makes || []).map((m) => m.name);

test("altOf: 'FG Wilson FGL70030' → đầu phát FGL70030, hãng FG Wilson (như catalog đọc ô)", () => {
  const a = altOf(alts, "FG Wilson FGL70030");
  assert.equal(a?.key, "FGL70030");
  assert.deepEqual(makes(a), ["FG Wilson"]);
  assert.equal(altOf(alts, "FG-Wilson FGL70030")?.key, "FGL70030");
  assert.equal(altOf(alts, "FGL70030")?.key, "FGL70030");
});
test("altOf: hãng hai từ 'Leroy Somer LL5114H' → LL5114H", () => {
  const a = altOf(alts, "Leroy Somer LL5114H");
  assert.equal(a?.key, "LL5114H");
  assert.deepEqual(makes(a), ["Leroy-Somer"]);
});
test("altOf: không đoán — hãng lạ, mã không có, hãng một từ + mã có dấu cách, hai hãng trong một ô", () => {
  assert.equal(altOf(alts, "FG Wilson ZZ9999"), null);
  assert.equal(altOf(alts, "Foo Wilson FGL70030"), null);
  assert.equal(altOf(alts, "FG FGL70030"), null);
  assert.equal(altOf(alts, "Stamford FGL70030 / Leroy-Somer LL5114H"), null);
  assert.equal(altOf(alts, "Leroy Somer"), null);
  // "Stamford HCI" không phải hãng hai từ: bóc một từ như cũ, phần còn lại "HCI 444D" không có trong danh mục
  assert.equal(altOf(alts, "Stamford HCI 444D"), null);
});
