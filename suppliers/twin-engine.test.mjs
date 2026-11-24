// node --test suppliers/twin-engine.test.mjs
// catalog-doc-4, nhóm 1: ô động cơ "2*TAD1355GE" (baifa TWIN, n101–n106), "2 x TAD1641GE" (tecnogen), "2X DC13 505A AE" (green-power).
// Trước: cả dòng bị bỏ (ghi chú "tổ máy nhiều động cơ"). Nay: bản ghi động cơ mang mã đơn, `units` = số động cơ, KHÔNG mang công suất
// của tổ máy (một dòng "900 kVA" không phải công suất của một TAD1355GE) và không mang số liệu thuộc phạm vi động cơ; ô đầu phát "2*S4L1D-F41" không ra bản ghi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const load = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8"));

test("baifa n106: mọi dòng TWIN có một bản ghi động cơ mã đơn, units 2, không công suất", () => {
  const sup = load("baifa-power.json");
  const recs = C.fromSupplier(sup, []);
  const rows = sup.specTables.filter((t) => t.n === 106).flatMap((t) => t.rows).filter((r) => /\|\s*2\s*\*/.test(r));
  assert.equal(rows.length, 36);
  for (const line of rows) {
    const code = line.match(/\|\s*2\s*\*\s*([^|]+?)\s*\|/)[1];
    const e = recs.filter((r) => r.n === 106 && r.line === line && r.kind === "engine");
    assert.equal(e.length, 1, line);
    assert.equal(e[0].model, code.replace(/\s+/g, " "), line);
    assert.equal(e[0].units, 2, line);
    assert.equal(e[0].power, null, line);
    assert.ok(e[0].setPower && Object.keys(e[0].setPower).length, `setPower ${line}`);
    assert.ok(!e[0].specs.some((x) => ["cyl", "disp", "bore", "engPower"].includes(x.key)), line);
    assert.ok(!recs.some((r) => r.n === 106 && r.line === line && r.kind === "alternator"), `đầu phát ${line}`);
  }
});

test("TAD1355GE (baifa n106) vào danh mục như một động cơ, không có công suất 900 kVA", () => {
  const sup = load("baifa-power.json");
  const recs = C.fromSupplier(sup, []).filter((r) => r.kind === "engine" && r.model === "TAD1355GE" && r.n === 106);
  assert.ok(recs.length >= 1);
  for (const r of recs) assert.equal(r.power, null);
});

test("tecnogen / green-power: ô \"2 x TAD…\" vẫn không ra bản ghi (chưa duyệt, danh sách TWIN_ENGINE_SUPPLIERS chỉ có baifa)", () => {
  for (const f of ["tecnogen.json", "green-power-generators.json"]) {
    const notes = [];
    const r = C.fromSupplier(load(f), notes).filter((x) => x.kind === "engine" && x.units != null);
    assert.equal(r.length, 0, f);
    assert.ok(notes.some((x) => x.reason === "tổ máy nhiều động cơ"), f);
  }
});

test("ô một động cơ (không 2*) không có units", () => {
  const recs = C.fromSupplier(load("baifa-power.json"), []).filter((r) => r.kind === "engine" && !/\|\s*[2-4]\s*[x×*]/i.test(r.line));
  assert.ok(recs.length > 100 && recs.every((r) => r.units == null));
});
