// node --test suppliers/lech-cot-8.test.mjs — lỗi đọc còn lại của rà soát lệch dòng / cột (18/11/2026), dòng thật ở suppliers/cn:
// acepow đầu phát đứng trước động cơ không tiêu đề, vantek "3S0", sr-genset "Engine | Modle", hosem trang liệt kê, mecca MC1000D.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(ROOT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const read = (header, rows, role = "genset_oem", title = "") => C.fromSupplier({ id: "t", role, country: "CN", names: { en: "Test" }, specTables: [{ n: 101, title, header, rows }] });
const spec = (u, k) => u.specs.find((s) => s.key === k)?.value;

test("acepow n155: the alternator BC164C before the engine, under no title of its own", () => {
  const header = ["| Model | P | Hz | KW | kva | Model | Output | Engine", "| Rated | Standby | Rated | Standby | Rated(KW) | Standy(kw) | Model"];
  const out = read(header, ["| APW-10.5 | 3 | 50 | 10.5 | 12 | 13 | 14 | BC164C | 10.8 | 12 | Y480BD", "| APW-18 | 3 | 50 | 18 | 20 | 23 | 25 | BC184E | 18 | 20 | N4100DS-26"]);
  assert.deepEqual(out.filter((u) => u.kind === "engine").map((u) => u.model), ["Y480BD", "N4100DS-26"]);
  assert.deepEqual(out.filter((u) => u.kind === "alternator").map((u) => u.model), ["BC164C", "BC184E"]);
});

test("a code before the engine under no title is still no alternator unless it is acepow's BC1xx (Doosan P158LE, Mitsubishi S4L2)", () => {
  const header = ["| Model | Hz | kW | kva | Model | Output | Engine"];
  const out = read(header, ["| X-100 | 50 | 80 | 100 | P158LE | 90 | DP158LD"]);
  assert.deepEqual(out.filter((u) => u.kind === "alternator").map((u) => u.model), []);
});

test("vantek n101: '3S0' (OCR of 350) is a figure, not the engine; the engine is N855-DM, no alternator is read", () => {
  const header = ["| Model | Prime | Standby | Engine | Power | Cyl | Size | Weight", "| kw | kva | kw | L-W-H(mm) | (kg)"];
  const out = read(header, ["| CCFJ250J-WTP | 250 | 312.5 | N855-DM | 284 | 6 | 2760-1000-1790 | 2800", "| CCFJ280J-WTP | 280 | 3S0 | N855-DM | 317 | 6 | 2998-1000-1790 | 2950"]);
  const row = out.filter((u) => u.row === 1);
  assert.deepEqual(row.map((u) => [u.kind, u.model]), [["engine", "N855-DM"]]);
  assert.equal(row[0].power, null); // 280 kW alone with no kVA: left unread rather than guessed
});

test("sr-genset n2001: a kVA under 'Engine | Modle' is not the voltage", () => {
  const header = ["| Frequency | Voltage | Rated power | Standby Power | Engine | Modle | Alternator | Modle | Specifications", "| kW | kVA | kW | kVA"];
  const out = read(header, ["| 50 | 400 | 70 | 87.5 | 77 | 96.25 | SRGENSET | 4FWZL | SRGENSET | SAL274B2 | PDF", "| 50 | 400 | 95 | 118.75 | 104.5 | 130.625 | SRGENSET | 4FWZL1 | SRGENSET | SAL274C2 | PDF"]);
  for (const u of out) assert.equal(spec(u, "voltage"), undefined, `${u.model} voltage`);
  assert.deepEqual(out.filter((u) => u.kind === "engine").map((u) => u.model), ["4FWZL", "4FWZL1"]);
});

test("hosem n136: prime 500 kVA beside a standby of 22 kW (two products of a listing page) gives no power", () => {
  const rows = ["| Model | A-C500S", "| Engine Model | QSZ13-G3", "| Standby Power | 22kW", "| Standby Power | 550kVA", "| Prime Power | 500kVA", "| Engine Model | 4B3.9-G1"];
  const out = read([], rows, "genset_oem", "Buy 500kva diesel generator, Good quality 500kva diesel generator manufacturer");
  const e = out.find((u) => u.kind === "engine" && u.model === "QSZ13-G3");
  assert.ok(e); assert.equal(e.power, null);
});

test("a label sheet whose kVA and kW fit one set keeps both ratings (keypower)", () => {
  const out = read([], ["Model: KP-YC22P", "Prime Power (kW/kVA): 17.6/22", "Standby Power (kW/kVA): 19.2/24", "Engine Model: YC4V35-D20"], "genset_oem", "KP-YC22P 17.6kW 22kVA");
  const e = out.find((u) => u.kind === "engine");
  assert.equal(e.power?.prime?.kVA, 22); assert.equal(e.power?.standby?.kVA, 24);
});

test("mecca-power: no MC1000D row with standby 1000 kVA over prime 325 kVA (catalog misprint, Khoa 18/11/2026)", () => {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, "suppliers", "cn", "mecca-power.json"), "utf8"));
  const bad = [];
  for (const t of s.specTables) for (const r of t.rows) {
    const c = r.split("|").map((x) => x.trim());
    if (/^MC1000D$/.test(c[1]) && c[6] === "TCD12.1") bad.push(r);
  }
  assert.deepEqual(bad, []);
  // The right MC1000D row (DP222CC, 1001 / 801 kVA / kW) stays.
  assert.ok(s.specTables.some((t) => t.rows.some((r) => /\| MC1000D \| 1001 \| 801 \| 910 \| 728 \| DP222CC/.test(r))));
});
