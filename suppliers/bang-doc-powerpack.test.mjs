// node --test suppliers/bang-doc-powerpack.test.mjs — bảng dọc (verticalRecords, web/catalog.js) đọc được trang tổ máy của Powerpack
// Generator (powerpack, TR; điều phối 22/11/2026): (1) model tổ máy chỉ ở TIÊU ĐỀ trang, (2) dòng định mức "Voltage, Frequency | Prime |
// Standby" + "400V, 50 Hz | 680 kVA / 544 kW | 750 kVA / 600 kW", (3) mã động cơ có hậu tố "/5" (Baudouin 6M33G750/5), (4) mã Doosan
// "DP222CC" (isCode đọc "<số>CC" là dung tích cc), (5) Bore + Stroke là hai dòng → một số "150 × 185", (6) "HYUNDAI DOOSAN" là hãng Doosan.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const pp = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", "powerpack.json"), "utf8"));
const recs = C.fromSupplier(pp, []);
const by = (m) => recs.find((r) => r.model === m);
const spec = (r, k) => (r.specs.find((s) => s.key === k) || {}).value;

test("powerpack: 126 trang → 126 bản ghi động cơ, mỗi bản có công suất prime + standby, tỉ số nén, số xi lanh, dung tích, bore × stroke", () => {
  assert.equal(pp.specTables.length, 126);
  assert.equal(recs.length, 126);
  for (const r of recs) {
    assert.equal(r.sheet, "bảng dọc");
    assert.ok(r.power.prime && r.power.standby, r.model);
    for (const k of ["compr", "cyl", "disp", "bore"]) assert.ok(spec(r, k), `${r.model} thiếu ${k}`);
  }
});

test("Baudouin 6M33G750/5 (PG750-B): model tổ máy từ tiêu đề, 680/544 prime, 750/600 standby, nén 15 : 1, 150 × 185", () => {
  const r = by("6M33G750/5");
  assert.equal(r.genset, "PG750-B");
  assert.deepEqual(r.power, { prime: { kVA: 680, kW: 544 }, standby: { kVA: 750, kW: 600 } });
  assert.equal(spec(r, "compr"), "15 : 1");
  assert.equal(spec(r, "bore"), "150 × 185");
  assert.equal(spec(r, "disp"), "19,6 L");
  assert.deepEqual(r.makes.map((m) => m.name), ["Baudouin"]);
});

test("Doosan DP222CC (PG1000-D): mã đọc được, hãng 'HYUNDAI DOOSAN' → Doosan", () => {
  const r = by("DP222CC");
  assert.ok(r, "DP222CC có bản ghi");
  assert.deepEqual(r.makes.map((m) => m.name), ["Doosan"]);
  assert.equal(spec(r, "compr"), "14,6 : 1");
});

test("modelFacts đọc tỉ số nén Powerpack của đúng động cơ (khoá catalog)", () => {
  const cat = C.build([pp]);
  const e = cat.engines.find((x) => x.key === "6M33G750/5");
  assert.ok(e, "động cơ 6M33G750/5 có trong danh mục");
  assert.ok(e.uses.some((u) => u.supplierId === "powerpack" && u.specs.some((s) => s.key === "compr" && s.value === "15 : 1")));
});

test("không nới nhầm: ô '6BT5.9/6CT8.3' (hai mã) và 'A / B' vẫn không là mã bảng dọc", () => {
  const sheet = (cell) => ({ id: "x", country: "CN", sources: [], specTables: [{ n: 1, title: "X", header: [], rows: ["| Model | AB-100", "| Prime Power | 100kVA/80kW", `| Engine Brand / Model | ${cell}`] }] });
  const eng = (cell) => C.fromSupplier(sheet(cell)).filter((o) => o.sheet === "bảng dọc").length;
  assert.equal(eng("6BT5.9/6CT8.3"), 0);
  assert.equal(eng("NTA855 / KTA19"), 0);
  assert.equal(eng("Cummins NTA855-G2A"), 1);
});
