import test from "node:test";
import assert from "node:assert/strict";
import { costOf } from "./api-budget.mjs";

// Shortened from a real run (2026-11-12, Gợi ý cấu hình, stdout as config-bot stores it: "[Ns] " before every line).
// The newer CLI writes "type":"result" after other keys, so the line does not start with {"type":"result".
const REAL = [
  '[61s] {"type":"system","subtype":"init","model":"claude-opus-5-5","tools":["Bash","Read"]}',
  '[120s] {"type":"user","message":{"content":[{"type":"tool_result","tool_use_id":"t1","content":"x"}]}}',
  '[434s] {"duration_api_ms":266291,"stop_reason":"end_turn","session_id":"s","total_cost_usd":1.6170104,"usage":{"input_tokens":22,"output_tokens":27939,"service_tier":"standard","speed":"standard"},"type":"result","subtype":"success","is_error":false,"result":"xong"}',
].join("\n") + "\n";

test("costOf reads the result line whatever its key order, with the [Ns] prefix", () => {
  assert.equal(costOf(REAL), 1.6170104);
});
test("costOf: old key order, no prefix", () => {
  assert.equal(costOf('{"type":"system"}\n{"type":"result","subtype":"success","total_cost_usd":0.91}\n'), 0.91);
});
test("costOf: plain --output-format json", () => {
  assert.equal(costOf('{"type":"result","total_cost_usd":0.4}'), 0.4);
});
test("costOf: last result wins; none or garbage gives null", () => {
  assert.equal(costOf('[1s] {"type":"result","total_cost_usd":1}\n[9s] {"a":1,"type":"result","total_cost_usd":2}'), 2);
  assert.equal(costOf('[1s] {"type":"assistant"}\n'), null);
  assert.equal(costOf(""), null);
  assert.equal(costOf(undefined), null);
});
