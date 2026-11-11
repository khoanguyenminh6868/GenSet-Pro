// node --test suppliers/*.test.mjs — đọc lại bảng định mức có nhãn cột từ datasheet đã lưu (ratings.mjs, PR 5, 2026-11-11).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stamfordRatings, lsRatings, cumminsRatings } from "./ratings.mjs";
import { altColumns, sourceRatings, comboChecks } from "./config-bot.mjs";

// Lines as the saved Stamford UCI274C sheet has them (sources/stamford-avk-china/1002.md): the 50 Hz block runs each
// class on its own line with N/A for 440 V, the 60 Hz block is one row of 16.
const STAMFORD = ["URL: https://example/UCI274C.pdf", "Accessed: 2026-11-02", "", "UCI274C - Winding 311", "Technical Data Sheet", "RATINGS",
  "| Class - Temp Rise | Cont. F - | 105/40°C | Cont. H - 125/40°C", "| Standby - | 150/40°C", "| Standby - | 163/27°C",
  "| 50 | Series Star (V) | 380 | 400 | 415 | 440 | 380 | 400 | 415 | 440 | 380 | 400 | 415 | 440 | 380 | 400 | 415 | 440",
  "| Hz | Parallel Star (V) | 190 | 200 | 208 | 220 | 190 | 200 | 208 | 220 | 190 | 200 | 208 | 220 | 190 | 200 | 208 | 220",
  "| kVA | 84.0 | 84.0 | 84.0", "| N/A | 100.0 100.0 100.0", "| N/A | 106.0 106.0 | 106.0", "| N/A | 110.0 110.0 | 110.0", "N/A",
  "| kW | 67.2 | 67.2 | 67.2", "| N/A | 80.0 | 80.0 | 80.0", "| N/A | 84.8 | 84.8 | 84.8", "| N/A | 88.0 | 88.0 | 88.0", "N/A",
  "| Efficiency (%) | 90.7 | 91.1 | 91.3", "| N/A | 89.8 | 90.3 | 90.6", "| N/A | 89.5 | 90.0 | 90.4", "| N/A | 89.2 | 89.8 | 90.2", "N/A",
  "| 60 | Series Star (V) | 416 | 440 | 460 | 480 | 416 | 440 | 460 | 480 | 416 | 440 | 460 | 480 | 416 | 440 | 460 | 480",
  "| kVA | 97.5 | 106.3 | 106.3 | 112.5 | 112.5 | 117.5 | 117.5 | 125.0 | 116.3 | 125.0 | 125.0 | 132.5 | 120.0 | 127.5 | 127.5 | 137.5",
  "| Efficiency (%) | 90.9 | 91.0 | 91.4 | 91.5 | 90.2 | 90.6 | 91.0 | 91.1 | 90.0 | 90.2 | 90.7 | 90.8 | 89.8 | 90.1 | 90.6 | 90.6", "DIMENSIONS"].join("\n");

test("Stamford / Wintpower: each figure with its frequency, duty, temperature rise and voltage; lines verbatim", () => {
  const r = stamfordRatings(STAMFORD), at = (hz, rise, v) => r.find((x) => x.hz === hz && x.rise === rise && x.volt === v);
  assert.equal(r[0].model, "UCI274C");
  assert.deepEqual((({ duty, kVA, kW, eff }) => ({ duty, kVA, kW, eff }))(at(50, "125/40°C", 400)), { duty: "Cont.", kVA: 100, kW: 80, eff: 90.3 });
  assert.equal(at(50, "105/40°C", 415).eff, 91.3);
  assert.equal(at(50, "163/27°C", 380).duty, "Standby");
  assert.equal(at(50, "105/40°C", 440), undefined); // N/A
  assert.equal(at(60, "150/40°C", 480).kVA, 132.5);
  const lines = new Set(STAMFORD.split("\n"));
  assert.ok(r.every((x) => x.lines.every((l) => lines.has(l))));
  // A Wintpower header the PDF cut ("| C | nt. H …", "| St | andb …"): read the same.
  const cut = STAMFORD.replace("| Class - Temp Rise | Cont. F - | 105/40°C | Cont. H - 125/40°C\n| Standby - | 150/40°C\n| Standby - | 163/27°C",
    "| Class - Temp Rise | Cont. F | 105/40°C\n| C | nt. H 125/40°C\n| St | andb | 150/40°C\n| St | andb | 163/27°C\n| y | y");
  assert.deepEqual([...new Set(stamfordRatings(cut).map((x) => `${x.rise}:${x.duty}`))], ["105/40°C:Cont.", "125/40°C:Cont.", "150/40°C:Standby", "163/27°C:Standby"]);
  // A row whose cells the PDF dropped (8 figures for 16 columns): that row is not used.
  const lost = STAMFORD.replace(/\| 60 \| Series Star[\s\S]*DIMENSIONS/, "| 60 | Series Star (V) | 416 | 440 | 460 | 480 | 416 | 440 | 460 | 480 | 416 | 440 | 460 | 480 | 416 | 440 | 460 | 480\n| kVA | 12.0 | 13.3 | 13.3 | 14.1 | 13.5 | 14.8 | 14.8 | 15.0\nDIMENSIONS");
  assert.equal(stamfordRatings(lost).filter((x) => x.hz === 60).length, 0);
});

const LS = ["Ratings 50 Hz - 1500 R.P.M. - 6 & 12-wire", "| kVA / kW - P.F. = | 0.8", "| Duty/T°C | Continuous/ 40°C | Continuous/ 40°C | Stand-by/ 40°C | Stand-by/ 27°C",
  "| Class/T°K | H:125K | F:105K | H:150K | H:163K", "| Phase | 3ph. | 1ph. | 3ph. | 1ph. | 3ph. | 1ph. | 3ph. | 1ph.",
  "| Y | 380V | 400V 415V 440V* | 380V 400V 415V 440V* | 380V 400V 415V 440V* | 380V | 400V 415V 440V*",
  "| TAL-A44-J | kVA | 143 | 150 | 143 | 73 | 129 | 135 | 129 | 66 | 150 | 158 | 150 | 77 | 157 | 165 | 157 | 80",
  "| kW | 114.4 | 120.0 | 114.4 | 58.4 | 103.2108.0 103.2 | 52.8 | 120.0126.4 120.0 | 61.6 | 125.6 | 132.0 | 125.6 | 64.0",
  "| TAL-A44-L | kVA | 180 | 180 | 180 | 171 | 90 | 164 164 | 164 | 156 | 82 | 191 191 | 191 | 181 | 95 | 200 | 200 | 200 | 188 | 99"].join("\n");

test("Leroy-Somer: kVA by duty / class / phase / voltage; a starred voltage only when the row has its column", () => {
  const r = lsRatings(LS), j = r.filter((x) => x.model === "TAL-A44-J");
  assert.equal(j.length, 16);
  assert.deepEqual(j.filter((x) => x.phase === 3 && x.volt === 400).map((x) => [x.duty, x.rise, x.kVA]),
    [["Cont.", "H:125K Continuous/ 40°C", 150], ["Cont.", "F:105K Continuous/ 40°C", 135], ["Standby", "H:150K Stand-by/ 40°C", 158], ["Standby", "H:163K Stand-by/ 27°C", 165]]);
  assert.ok(j.every((x) => x.kW === null)); // the kW row has figures run together: not used
  const l = r.filter((x) => x.model === "TAL-A44-L");
  assert.equal(l.length, 20); assert.equal(l.find((x) => x.volt === 440 && x.rise.startsWith("H:125K")).kVA, 171);
});

const CUMMINS = ["Specification Sheet", "", "QSL9-G5", "", "\f1500 rpm (50 Hz Ratings)", "", "Gross engine output                   Net engine output                       Typical generator set output", "",
  "Standby Prime     Base                Standby Prime     Base   Standby (ESP)       Prime (PRP)              Base (COP)", "",
  "     kWm/BHP                              kWm/BHP              kWe       kVA      kWe                 kVA  kWe               kVA", "",
  "310/415 268/359 228/305               296/397 257/345 217/291  276       345       240                300   202              253"].join("\n");

test("Cummins sheet: gross and net kWm by rating at the sheet's speed (a page break before the heading)", () => {
  const r = cumminsRatings(CUMMINS);
  assert.deepEqual(r.map((x) => [x.model, x.hz, x.rpm, x.rating, x.gross, x.net]), [["QSL9-G5", 50, 1500, "standby", 310, 296], ["QSL9-G5", 50, 1500, "prime", 268, 257], ["QSL9-G5", 50, 1500, "base", 228, 217]]);
});

test("altColumns: the row's frequency, the rating's duty, the HSMT's voltage; nothing without a frequency", () => {
  const r = stamfordRatings(STAMFORD);
  const p = altColumns(r, { hz: 50, rating: "prime", reqs: [{ code: "voltage", requirement: "400/230 V" }] });
  assert.deepEqual([p.eff.min, p.eff.max, p.kVA.min, p.kVA.max], [90.3, 91.1, 84, 100]);
  assert.match(p.label, /Cont\. 105\/40°C \/ 125\/40°C, 50 Hz, 400 V/);
  assert.equal(altColumns(r, { hz: 50, rating: "standby" }).kVA.max, 110);
  assert.equal(altColumns(r, { hz: null }), null);
  // Labeled efficiency replaces the range of every figure in the power balance.
  const row = { line: "| x |", freq: 50, specs: [{ key: "engPower", label: "Engine Prime Power / Speed (KW/RPM)", value: "100/1500" }], power: { prime: { kVA: 112.5, kW: 90 } } };
  const c = comboChecks({ alternator: { model: "UCI274C" }, checks: [] }, { combo: {}, row, altRatings: r, reqs: [{ code: "voltage", requirement: "400/230 V" }] });
  assert.equal(c.combo.power.status, "ok"); assert.match(c.combo.power.text, /90,3–91,1% \(datasheet UCI274C: Cont\./);
  // kVA below the set's prime kVA: a question with the columns named, never a warning.
  assert.match(c.comboAsk.find((q) => q.item === "Công suất định mức đầu phát").ask, /Cont\. 105\/40°C \/ 125\/40°C, 50 Hz, 400 V: lớn nhất 100 kVA/);
  assert.equal(c.warnings, undefined);
});

test("sourceRatings: only the saved sources a supplier lists; the maker's engine output as a rated fact", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rt-"));
  fs.mkdirSync(path.join(dir, "st")); fs.writeFileSync(path.join(dir, "st", "1002.md"), STAMFORD); fs.writeFileSync(path.join(dir, "st", "1003.md"), STAMFORD.replace(/UCI274C/g, "UCI274X"));
  fs.mkdirSync(path.join(dir, "cu")); fs.writeFileSync(path.join(dir, "cu", "2001.md"), CUMMINS + "\n©2021 Cummins Inc.");
  const RT = sourceRatings([{ id: "st", role: "alternator_maker", names: { en: "STAMFORD" }, sources: [{ n: 1002, url: "u" }] }, { id: "cu", role: "genset_oem", names: { en: "Cummins Inc." }, sources: [{ n: 2001 }] }], dir);
  assert.ok(RT.alt.get("UCI274C")?.length); assert.equal(RT.alt.get("UCI274X"), undefined); // 1003 is not in its record
  const e = RT.eng.get("QSL9G5");
  assert.deepEqual(e.map((f) => [f.key, f.kW, f.rpm, f.maker]), [["engStandby", 296, 1500, true], ["engPrime", 257, 1500, true]]);
  fs.rmSync(dir, { recursive: true, force: true });
});
