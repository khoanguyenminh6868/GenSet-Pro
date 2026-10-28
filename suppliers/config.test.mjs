// node --test suppliers/*.test.mjs — the code check of a "Gợi ý cấu hình" answer (config-bot.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { check } from "./config-bot.mjs";

const sup = [{ id: "s", specTables: [{ n: 101, title: "Perkins gensets", header: ["| Model | Standby kW/kVA | Prime kW/kVA | Engine | Alternator"], rows: ["| SQP500 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C | UK"] }] }];
const hsmt = "Chương V. Yêu cầu kỹ thuật\nCông suất liên tục (Prime): ≥ 450 kVA\nĐầu phát: Stamford hoặc tương đương\nTần số 50Hz";
const row = { kind: "catalog", supplierId: "s", n: 101, line: "| SQP500 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C | UK" };
const base = () => ({
  requirements: [{ item: "Công suất", requirement: "≥ 450 kVA prime", quote: "Công suất liên tục (Prime): ≥ 450 kVA" }],
  configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src: row }, alternator: { model: "HCI544C", src: row }, genset: { model: "SQP500", src: row },
    checks: [{ item: "Công suất", hsmtQuote: "Công suất liên tục (Prime): ≥ 450 kVA", offered: "450 kVA prime", sourceQuote: "360/450", part: "genset", status: "met" }] }],
});
const readWeb = (f) => (f === "web/1.txt" ? "URL: https://maker.example/a\nAccessed: 2026-10-28\n\nAlternator UCI274C 50Hz class H insulation" : null);

test("a configuration copied from a catalog row passes", () => {
  const { problems, result } = check(base(), { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.deepEqual(problems, []);
  assert.equal(result.configs[0].checks[0].status, "met");
});

test("a number not in the source quote makes 'met' unclear", () => {
  const r = base(); r.configs[0].checks[0].offered = "500 kVA prime";
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.equal(result.configs[0].checks[0].status, "unclear");
  assert.ok(result.configs[0].checks[0].unverified);
});

test("an invented catalog row or HSMT quote is flagged", () => {
  const r = base(); r.configs[0].engine.src = { ...row, line: "| SQP500 | 400/500 | 360/450 | KTA19-G3 | HCI544C | UK" };
  r.requirements[0].quote = "Công suất ≥ 500 kVA";
  const { problems, result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.ok(result.configs[0].engine.unverified);
  assert.ok(result.requirements[0].unverified);
  assert.ok(problems.length >= 2);
});

test("internet source: the quote must be in the saved page", () => {
  const r = base();
  r.configs[0].alternator = { model: "UCI274C", src: { kind: "internet", url: "https://maker.example/a", file: "web/1.txt", quote: "class H insulation" } };
  r.configs[0].checks.push({ item: "Cách điện", hsmtQuote: "Tần số 50Hz", offered: "class F", sourceQuote: "class F insulation", part: "alternator", status: "met" });
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.ok(!result.configs[0].alternator.unverified);
  assert.equal(result.configs[0].checks[1].status, "unclear");
});

test("no configuration gives the 'not found' message", () => {
  const { result } = check({ requirements: [], configs: [] }, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.match(result.message, /Không có động cơ và đầu phát/);
});
