// node --test suppliers/*.test.mjs — reading datasheet PDFs (crawl-datasheets.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { pdfText, sheetOf } from "./crawl-datasheets.mjs";

test("two label/value columns on one PDF line are cut into pairs", () => {
  const t = pdfText("Displacement                              3.9L                 Coolant capacity\nWeight(kg)        700       1100\nGovernor     Mechanical      Standard exhaust pipe diameter     75mm");
  assert.deepEqual(t.split("\n"), ["| Displacement | 3.9L", "Coolant capacity", "| Weight(kg) | 700 | 1100", "| Governor | Mechanical", "| Standard exhaust pipe diameter | 75mm"]);
});

test("a sheet is kept only when it names an engine or alternator model", () => {
  const body = ["| Prime Power | 20KVA/16KW", "| Displacement | 3.9L", "| Bore x Stroke | 102x120mm", "| Governor | Mechanical"];
  assert.deepEqual(sheetOf(body.join("\n")), []);
  const withModel = sheetOf(["Engine specification", "| Model | 4B3.9-G11", ...body].join("\n"));
  assert.ok(withModel.includes("| Model | 4B3.9-G11") && withModel.includes("Engine specification"));
});
