// node --test suppliers/eng-rating.test.mjs — the engine's prime and standby power, read from rows found in suppliers/cn
// (2026-11-16): two engine power columns kept (dcec, nenjo), ratings from the header line below (keliang, hanyang,
// acepow, wiseke), and config-bot enginePowerOf taking both.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { enginePowerOf } from "./config-bot.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(ROOT, "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
const engOf = (header, row, role = "genset_oem") => {
  const s = { id: "t", role, country: "CN", names: { en: "Test" }, specTables: [{ n: 101, title: "", header, rows: [row] }] };
  return CAT.fromSupplier(s).find((u) => u.kind === "engine");
};
const ep = (u) => u.specs.filter((x) => x.key === "engPower").map((x) => [x.label, x.value]);

test("dcec: a standby column next to the rated one is kept", () => {
  const u = engOf(["| 机型 | 额定功率/转速(kW/rpm) | 备用功率/转速(kW/rpm)"], "| QSB6.7-G3 | 151/1500 | 166/1500", "engine_maker");
  assert.deepEqual(ep(u), [["额定功率/转速(kW/rpm)", "151/1500"], ["备用功率/转速(kW/rpm)", "166/1500"]]);
  assert.equal(enginePowerOf(u).standby, 166);
});

test("keliang: 'Engine power(kw)' over 'Prime | Standby' gives both, and enginePowerOf both", () => {
  const u = engOf(["| Gensets | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator | Size & Weight",
    "| Model | Gensets power(KW/KVA) | Engine model | Engine power(kw) | Fuel consumption | Cylinder*Bore*Stroke | Displacement(L) | Compr-ession Ratio | Asp. | WANTONG | Rated Voltage(V) | Open Type Size(mm) | Weight(KG) | Silent Type Size(mm) | Weight(KG)",
    "| Prime | Standby | Prime | Standby | G/kw.h | L/h | (Qty*mm*mm)"],
  "| WT-FW17 | 12 | 15 | 13.2 | 17 | 4DW81-23D | 17 | 19 | 240 | 4.8 | 4x85x100 | 2.27 | 17:1 | N/A | WT-164D | 380, 400, 415, 440, 200, 208, 220, etc. | 1520x530x1020 | 390 | 2000x900x1250 | 780");
  assert.deepEqual(ep(u), [["Engine power(kw) Prime", "17"], ["Engine power(kw) Standby", "19"]]);
  const p = enginePowerOf(u);
  assert.equal(p.prime, 17); assert.equal(p.standby, 19);
});

test("acepow: the walk put standby 33 under 'Engine Power(KW)'; now Rated 30 and Standby 33", () => {
  const u = engOf(["| | Engine Model | | |", "| Frequ ency | Phase | Model | Engine Power(KW) | Bore / stroke | Intake | Displacement", "| Rated | Standby | MM"],
    "| 50 | 3 | YT3B2-D | 30 | 33 | 108x120 | Natural | 3.3");
  assert.deepEqual(ep(u), [["Engine Power(KW) Rated", "30"], ["Engine Power(KW) Standby", "33"]]);
  // "Rated" is not read as prime (only the words of the source): enginePowerOf has the standby only.
  assert.equal(enginePowerOf(u).prime, undefined);
  assert.equal(enginePowerOf(u).standby, 33);
});

test("wiseke: a '—' prime cell leaves the standby figure alone", () => {
  const u = engOf(["| | Genset Model | Genset Power (kVA / kW) | Engine Model | Engine Power (kW) | Cyl. | Bore x Stroke (mm) | Dimension (mm) | Weight (kg)", "| Prime | Standby | Prime | Standby"],
    "| WDL-520C1 | — | 650 / 520 | KTA19-G8 | — | 575 | 6 | 159*159 | 3650*1500*2000 | 4800");
  assert.deepEqual(ep(u), [["Engine Power (kW) Standby", "575"]]);
});

test("bobig: ratings below that belong to the genset columns are not given to the engine", () => {
  const u = engOf(["| l | Gensets power(KW/KVA) | Engine model | Engine power/kw | BOBIG | Open type (MM) | sounproof type (MM)", "| Prime | Standby | Prime"],
    "| BC24.75S | 18 | 23 | 20 | 25 | 4B3.9-G11 | 30 | BW-184ES | 1600*720*1300 | 2100*930*1200");
  assert.ok(ep(u).every(([l]) => !/prime|standby/i.test(l)), JSON.stringify(ep(u)));
});
