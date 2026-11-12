// node --test suppliers/*.test.mjs — Đồng bộ thương hiệu asked: the rows of genset makers keep places among the
// candidate rows; a one-model datasheet's power row (catalog.js fromLine) is a usable source (Khoa 2026-11-12,
// IB2600594596).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, catalogMd, hintsOf, check, gensetMakerOf, supplierFamily, keepOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const table = (n, title, rows) => ({ n, title, header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows });
const engines = ["NTA855-G2A", "NTAA855-G7", "KTA19-G3", "6ZTAA13-G3", "QSZ13-G3", "2206C-E13TAG3", "TAD1352GE", "YC6K520-D30", "YC6MJ500L-D21", "WP13D405E200", "QSX15-G8", "KTA19-G4"];
// Twelve assemblers in China with rows full of figures and a controller with its datasheet: they fill the 30 rows.
const assemblers = () => Array.from({ length: 12 }, (_, i) => ({ id: `f${i}`, country: "CN", confidence: "high", role: "genset_oem", controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: "DSE7320", src: [3001] }],
  specTables: [table(101, "Cummins gensets 50Hz", engines.map((e, j) => `| F-${i}-${j} | 420 | 336 | ${e} | HCI444F |`))] }));
const D440 = "400/230  50  352 440 635                                       320       400";
const rehlko = () => ({ id: "rehlko", country: "US", confidence: "medium", role: "genset_oem", names: { en: "Rehlko", brands: ["Rehlko", "Kohler"] }, status: "verified",
  controllers: [{ brand: "Kohler", model: "APM403", text: "APM403", line: "Controller APM403", src: [2003] }],
  specTables: [{ n: 2003, title: "Industrial Generator Set - D440 — Generator sets ratings", header: ["Hz  kWe kVA Amps kWe                                            kVA"], rows: [D440] }],
  productLines: [{ kind: "genset", series: "D440", fuel: "diesel", frequency: ["50 Hz"], power: { min: 400, max: 400, unit: "kVA", rating: "prime", src: [2003] }, engineMakes: ["DOOSAN / HYUNDAI"], engineModels: ["P158LE"], src: [2003] }] });
// An assembler in Italy whose name is no make, and one in China carrying a foreign make in its name: not genset makers.
const others = () => [
  { id: "cgm-italia", country: "IT", confidence: "medium", role: "genset_oem", names: { en: "C.G.M. Gruppi elettrogeni Srl" }, specTables: [table(101, "Gensets 50Hz", ["| CGM-1 | 410 | 328 | DP158LD | |"])] },
  { id: "x-cummins", country: "CN", confidence: "medium", role: "genset_oem", names: { en: "Fujian Cummins Power Co" }, specTables: [table(101, "Gensets 50Hz", ["| XC-1 | 410 | 328 | QSG12-G4 | |"])] },
];
const cap = { value: 400, unit: "kVA" };
const hints = hintsOf("Chương V. Yêu cầu kỹ thuật\nTần số 50 Hz\nTổ máy phải được đồng bộ 02 trong 03 bộ phận chính (động cơ, đầu phát, bộ điều khiển) bởi nhà sản xuất máy phát điện");
// makeCap: 0 = no ceiling per make: these tests are about the places held and `keep`, not the ceiling (cand-cap.test.mjs).
// The HSMT asks for Đồng bộ (suppliers of every country are kept then).
const HSMT = "Chương V. Yêu cầu kỹ thuật\nTần số 50 Hz\n- Tổ máy phải được đồng bộ 02 trong 03 bộ phận chính (động cơ, đầu phát, bộ điều khiển) bởi nhà sản xuất máy phát điện";
const sync = { need: 2, parts: ["engine", "alternator", "controller"] };

test("genset makers: the same reading as Đồng bộ thương hiệu (no distributor, no assembler)", () => {
  assert.equal(gensetMakerOf(rehlko()), "Kohler");
  for (const s of [...others(), ...assemblers().slice(0, 1)]) assert.equal(gensetMakerOf(s), null, s.id);
  assert.equal(gensetMakerOf({ ...rehlko(), role: "distributor" }), null);
});

test("đồng bộ asked: a genset maker's power row (fromLine) keeps a place among the 30 rows; assemblers do not", () => {
  const list = [...assemblers(), rehlko(), ...others()], cat = C.build(list);
  const ids = (o) => candidates(cat, cap, hints, { makeCap: 0, suppliers: list, ...o }).top.map((r) => `${r.u.supplierId} ${r.e.model}`);
  // Before: 30 rows of assemblers, the maker's row (no alternator, controller without datasheet) left out.
  assert.ok(!ids({}).some((x) => x.startsWith("rehlko")));
  const withSync = candidates(cat, cap, hints, { makeCap: 0, suppliers: list, sync }).top;
  assert.equal(withSync.length, 30);
  const r = withSync.find((x) => x.u.supplierId === "rehlko");
  assert.ok(r && r.u.fromLine && r.e.model === "P158LE");
  assert.ok(r.why.some((w) => /chính hãng Kohler/.test(w)));
  assert.ok(!withSync.some((x) => ["cgm-italia", "x-cummins"].includes(x.u.supplierId)));
  // No đồng bộ: nothing changes, the same rows in the same order.
  assert.deepEqual(ids({ sync: null }), ids({}));
});

test("đồng bộ asked: at most 2 engines a maker, the size nearest the HSMT's first; a row the HSMT rules out keeps no place", () => {
  const maker = { ...rehlko(), specTables: [...rehlko().specTables, table(101, "Rehlko gensets 50Hz", ["| K-560 | 560 | 448 | DP180LB | |", "| K-500 | 500 | 400 | DP158LD | |", "| K-450 | 450 | 360 | DP126LB | |"])] };
  const list = [...assemblers(), maker], cat = C.build(list);
  const mine = candidates(cat, cap, hints, { makeCap: 0, suppliers: list, sync }).top.filter((x) => x.u.supplierId === "rehlko").map((x) => x.e.model).sort();
  assert.deepEqual(mine, ["DP126LB", "P158LE"]);
  // Prime below the HSMT's minimum (−600): no place.
  const low = hintsOf("Chương V. Yêu cầu kỹ thuật\nTần số 50 Hz\nCông suất liên tục (Prime) ≥ 420 kVA");
  assert.ok(!candidates(cat, cap, low, { makeCap: 0, suppliers: list, sync }).top.some((x) => x.u.supplierId === "rehlko" && x.e.model === "P158LE"));
});

test("catalog.md: a fromLine row says its engine comes from the product line", () => {
  const list = [...assemblers(), rehlko()];
  const { md } = catalogMd(C.build(list), cap, hints, { suppliers: list, sync });
  const at = md.indexOf("supplierId: rehlko, n: 2003");
  assert.ok(at > 0 && at < md.indexOf("## Thông số theo model"));
  assert.match(md.slice(at, at + 600), /động cơ P158LE theo dòng sản phẩm của bản ghi/);
});

test("check: a configuration from a fromLine row keeps its engine and supplier verified", () => {
  const src = { kind: "catalog", supplierId: "rehlko", n: 2003, line: D440 };
  const r = { requirements: [], configs: [{ rank: 1, engine: { model: "P158LE", src }, genset: { model: "D440", src }, checks: [], suppliers: [{ supplierId: "rehlko", n: 2003, line: D440 }] }] };
  const { result } = check(r, { hsmtText: HSMT, suppliers: [rehlko()], readWeb: () => null, origin: "all" });
  const c = result.configs[0];
  assert.ok(!c.engine.unverified && !c.genset.unverified);
  assert.ok(!c.suppliers[0].unverified);
  // Another engine on that row is still not named by it.
  const r2 = { requirements: [], configs: [{ rank: 1, engine: { model: "DP158LD", src }, checks: [], suppliers: [{ supplierId: "rehlko", n: 2003, line: D440 }] }] };
  const c2 = check(r2, { hsmtText: HSMT, suppliers: [rehlko()], readWeb: () => null, origin: "all" }).result.configs[0];
  assert.ok(c2.engine.unverified);
});

test("đồng bộ asked: a row of a configuration the last run chose is not pushed out by the places held", () => {
  const list = [...assemblers(), rehlko(), ...others()], cat = C.build(list), key = (r) => `${r.u.supplierId} ${r.e.model} ${r.u.other}`;
  const plain = candidates(cat, cap, hints, { suppliers: list }).top, held = candidates(cat, cap, hints, { makeCap: 0, suppliers: list, sync }).top;
  const pushed = plain.filter((r) => !held.some((x) => key(x) === key(r)));
  assert.ok(pushed.length > 0);
  const last = pushed[pushed.length - 1];
  const prev = { configs: [{ engine: { model: last.e.model, src: { kind: "catalog", supplierId: last.u.supplierId, n: last.u.n, line: last.u.line } }, suppliers: [{ supplierId: last.u.supplierId }] }] };
  const keep = keepOf(prev);
  assert.ok(keep.has(`${last.u.supplierId}\n${last.e.key}`));
  const now = candidates(cat, cap, hints, { makeCap: 0, suppliers: list, sync, keep }).top;
  assert.equal(now.length, 30);
  assert.ok(now.some((x) => key(x) === key(last)));
  // The maker's held row stays; the row given up is another one.
  assert.ok(now.some((x) => x.u.supplierId === "rehlko"));
  // No last run: as before.
  assert.deepEqual(candidates(cat, cap, hints, { makeCap: 0, suppliers: list, sync, keep: new Set() }).top.map(key), held.map(key));
});

test("an abbreviation that clashes is no make: Saudi Diesel Equipment Co (SDEC) is not the Shanghai SDEC", () => {
  const saudi = { id: "saudi-diesel", country: "SA", role: "genset_oem", names: { en: "Saudi Diesel Equipment Co (SDEC)", brands: ["SDEC"] } };
  assert.equal(gensetMakerOf(saudi), null);
  assert.equal(supplierFamily(saudi, true), null);
  // The same name in China, and makers of Chinese makes in China, keep their make.
  assert.equal(gensetMakerOf({ ...saudi, country: "CN" }), "SDEC");
  assert.equal(gensetMakerOf({ id: "jet-power", country: "CN", role: "genset_oem", names: { en: "Jet-Power" } }), "Jet-Power");
  assert.equal(gensetMakerOf({ id: "weichai-heavy-machinery", country: "CN", role: "genset_oem", names: { en: "Weichai Heavy Machinery" } }), "Weichai");
  // Foreign makes of foreign suppliers stay.
  assert.equal(gensetMakerOf(rehlko()), "Kohler");
  // It gets no reserved place under Đồng bộ thương hiệu.
  const list = [...assemblers(), { ...saudi, confidence: "medium", specTables: [table(101, "Gensets 50Hz", ["| S-1 | 410 | 328 | S6A3-PTAR | |"])] }];
  const ids = candidates(C.build(list), cap, hints, { makeCap: 0, suppliers: list, sync }).top.map((r) => r.u.supplierId);
  assert.ok(!ids.includes("saudi-diesel"));
});

test("the ceiling per make does not stop or count the places held for genset makers", () => {
  const list = [...assemblers(), rehlko(), ...others()], cat = C.build(list);
  const top = candidates(cat, cap, hints, { suppliers: list, sync, makeCap: 1 }).top;
  assert.equal(top.length, 30);
  const r = top.find((x) => x.u.supplierId === "rehlko");
  assert.ok(r && r.maker === "Kohler");
});
