// bdk-ds-4 (điều phối 22/11/2026): datasheet ComAp phải gắn được vào model NCC ghi (InteliSys Gas, InteliDrive DCU Marine,
// IG-NT / IG-NTC-BB / IG500 / IG1000, "InteliLite 4" / "InteliSys" / "InteliMains" trơn), kèm `version` để cần xác nhận.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const bot = await import(pathToFileURL(path.join(ROOT, "config-bot.mjs")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;

test("catalog.js đọc InteliSys Gas / InteliDrive DCU Marine là model riêng", () => {
  const m = (t) => C.controllersIn(t).filter((x) => x.model).map((x) => x.model);
  assert.deepEqual(m("ComAp InteliSys Gas Controller"), ["InteliSys Gas"]);
  assert.deepEqual(m("ComAp InteliDrive DCU Marine"), ["InteliDrive DCU Marine"]);
  assert.deepEqual(m("ComAp InteliSys NTC BaseBox"), ["InteliSys NTC"]);
  assert.deepEqual(m("ComAp InteliGen 1000"), ["InteliGen 1000"]);
  assert.deepEqual(m("ComAp InteliLite NT AMF 20"), ["InteliLite NT AMF20"]);
});

test("modelFacts / factsFor: tờ hãng ComAp tới model NCC ghi", () => {
  const recs = ["comap"].map((id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8")));
  const facts = bot.modelFacts({ engines: [], alternators: [] }, recs);
  const n = (model) => bot.factsFor(facts, "controller", model);
  for (const m of ["InteliSys Gas", "InteliDrive DCU Marine", "InteliGen NT", "InteliGen NTC"]) assert.ok(n(m).length > 0, m);
  // tên NCC viết tắt: có dòng, mang `version` (cần xác nhận đời)
  for (const [m, sheet] of [["IG1000", "InteliGen 1000"], ["IG500", "InteliGen 500"], ["IG-NT", "InteliGen NT"], ["IG-NTC-BB", "InteliGen NTC"], ["InteliSys", "InteliSys Gas"]]) {
    const f = n(m);
    assert.ok(f.length > 0, m);
    assert.ok(f.some((x) => x.version && String(x.version).includes(sheet.split(" ").pop()) || x.version), `${m} version`);
  }
  // không gắn bừa: IG200 (InteliGen 200 ≠ InteliGen4 200), InteliLite NT AMF20 / MRS10 (không có datasheet hãng)
  for (const m of ["IG200", "InteliLite NT AMF20", "MRS10"]) assert.equal(n(m).length, 0, m);
});
