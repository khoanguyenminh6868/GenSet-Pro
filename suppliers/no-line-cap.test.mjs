// node --test suppliers/*.test.mjs — a document's lines are not cut at a fixed count (Khoa 24/11/2026):
// sheetOf (crawl-datasheets.mjs, was 250), the one-model spec sheet of tablesOf (crawl-specs.mjs, was 60) and
// controllerSheet (maker-datasheets.mjs, was 700).
import test from "node:test";
import assert from "node:assert/strict";
import { sheetOf } from "./crawl-datasheets.mjs";
import { tablesOf } from "./crawl-specs.mjs";
import { controllerSheet } from "./maker-datasheets.mjs";
import { ctlKinds } from "./ctl-module.mjs";
import { ctlModelsIn } from "./config-bot.mjs";

test("ctlKinds: lines of a full manual do not change a controller's kind", () => {
  const sheet = (title, rows) => ({ id: "x", role: "controller_maker", specTables: [{ n: 1001, title, header: [], rows }] });
  const k = ctlKinds([
    sheet("Datasheet: HGM9510", ["Genset parallel controller", "Please refer to HGM9500 Synchronization Plan List for GOV and AVR settings."]),
    sheet("Datasheet: DEIF AGC-4 Mk II", ["Reactive load sharing (island paralleling with other generators)"]),
  ], { modelsIn: ctlModelsIn });
  assert.equal(k.get("HGM9510"), "sync");
  assert.equal(k.get("HGM9500"), undefined);
  assert.equal(k.get("AGC4"), undefined);
});

test("controllerSheet keeps every line of a manual longer than 700 lines, in order", () => {
  const body = Array.from({ length: 900 }, (_, i) => `Protection item ${i}: delay ${i + 1} s`);
  const { rows } = controllerSheet(["HGM6110N controller manual", ...body].join("\n"));
  assert.equal(rows.length, 901);
  assert.deepEqual(rows.slice(1), body);
});

test("sheetOf keeps every spec line of a sheet longer than 250 lines", () => {
  const body = Array.from({ length: 300 }, (_, i) => `| Power item ${i} | ${i + 1} kW`);
  const rows = sheetOf(["Engine specification", "| Model | 4B3.9-G11", ...body].join("\n"));
  assert.ok(rows.length >= 302, `còn ${rows.length} dòng`);
  assert.ok(rows.includes(body[299]));
});

test("tablesOf keeps every line of a one-model spec sheet longer than 60 lines", () => {
  const body = Array.from({ length: 80 }, (_, i) => `Engine item ${i}: ${i + 1} units`);
  const [sheet] = tablesOf(["Prime power: 100 kVA", "Standby power: 110 kVA", ...body].join("\n")).filter((t) => t.sheet);
  assert.equal(sheet.rows.length, 82);
  assert.equal(sheet.rows.at(-1), body[79]);
});
