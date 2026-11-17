// node --test suppliers/depco-sua.test.mjs — mâu thuẫn số liệu động cơ sau #806 (depco-sua, Khoa 17/11/2026):
// kiểm nội bộ dòng (SN.selfCheck), một NCC một phiếu + luật số đông (C.tally), dung sai dung tích 2%, quality.measure.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) await import(pathToFileURL(path.join(ROOT, "..", "web", f)).href);
const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const { measure } = await import("./quality.mjs");
const sup = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8"));
const rowOf = (s, model) => C.fromSupplier(s).find((o) => o.kind === "engine" && C.keyOf(o.model) === model);

test("selfCheck: dòng depco WP10D264E201 ghi 4 xi lanh, 126×130 mm, 9,726 L → tự mâu thuẫn", () => {
  const d = sup("depco-power"), o = rowOf(d, "WP10D264E201");
  const r = SN.selfCheck(SN.normalizeRecord(o, d.specTables[o.table].rows));
  assert.equal(r.cyl, 4); assert.equal(r.disp, 9.726); assert.ok(r.bad); assert.equal(r.calc, 6.484);
});
test("selfCheck: depco 6M33G660/6 ghi 12 xi lanh, 150×185, 19,6 L → tự mâu thuẫn; dòng thiếu bore → null", () => {
  const d = sup("depco-power"), o = rowOf(d, "6M33G660/6");
  assert.ok(SN.selfCheck(SN.normalizeRecord(o, d.specTables[o.table].rows)).bad);
  assert.equal(SN.selfCheck([{ key: "cyl", count: 6, missing: [] }]), null);
});
test("selfCheck: dòng nhất quán (6 xi lanh, 126×130, 9,726 L) không bị đánh dấu", () => {
  const norm = [{ key: "cyl", count: 6, missing: [] }, { key: "bore", bore: { bore: 126, stroke: 130 }, missing: [] }, { key: "disp", num: 9.726, unit: "L", missing: [] }];
  assert.equal(SN.selfCheck(norm).bad, false);
});

const by = (o) => new Map(Object.entries(o));
test("tally: một NCC một phiếu, NCC hai giá trị lấy giá trị số đông (4006-23TAG3A: 6 ×25, depco 6 và 8)", () => {
  const m = {}; for (let i = 0; i < 25; i++) m[`n${i}`] = [6]; m.depco = [6, 8]; m.bdadl = [8];
  const t = C.tally(by(m));
  assert.equal(t.win, 6); assert.deepEqual(t.split, ["depco"]); assert.equal(t.votes.get(6).length, 26); assert.equal(t.votes.get(8).length, 1);
});
test("tally: NCC hai giá trị mà không có số đông → không phiếu", () => {
  const t = C.tally(by({ a: [13.9, 17], b: [13.9], c: [14.5] }));
  assert.equal(t.win, null); assert.deepEqual(t.dropped, ["a"]); assert.equal(t.votes.size, 2);
});
test("tally: thắng cần ≥3 NCC và gấp ≥3 lần mỗi giá trị khác", () => {
  assert.equal(C.tally(by({ a: [6], b: [6], c: [6], d: [8] })).win, 6);
  assert.equal(C.tally(by({ a: [6], b: [6], c: [6], d: [8], e: [8] })).win, null);
  assert.equal(C.tally(by({ a: [6], b: [6], c: [8] })).win, null);
});
test("tally: dung tích trong 2% là một giá trị (22,9 và 23; 3,9 và 4,0 thì không)", () => {
  assert.equal(C.tally(by({ a: [22.9], b: [23] }), 0.02).votes.size, 1);
  assert.equal(C.tally(by({ a: [3.9], b: [4] }), 0.02).votes.size, 2);
});

test("catalog: model động cơ có win theo từng NCC một phiếu (WP10D264E201: 6 xi lanh)", () => {
  const cat = C.build(["depco-power", "weichai-power", "weichai-engine"].filter((id) => fs.existsSync(path.join(ROOT, "cn", `${id}.json`))).map(sup));
  const e = cat.engines.find((x) => x.key === "WP10D264E201");
  assert.ok(e);
  const cyl = e.specs.find((s) => s.key === "cyl");
  assert.ok(cyl && "votes" in cyl && "win" in cyl);
});

test("quality: mâu thuẫn đủ đơn vị không tăng so với cách đếm cũ, mỗi bước chỉ làm giảm", () => {
  const sups = ["depco-power", "weichai-power"].filter((id) => fs.existsSync(path.join(ROOT, "cn", `${id}.json`))).map(sup);
  const m = measure(sups);
  for (const v of Object.values(m.conflicts)) {
    const s = v.steps;
    assert.ok(s.self <= s.old && s.one <= s.self && s.tol <= s.one && s.win <= s.tol, JSON.stringify(s));
    assert.equal(v.strict.conflicts, s.win);
  }
});
