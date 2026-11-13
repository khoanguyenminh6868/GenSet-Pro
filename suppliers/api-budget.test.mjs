import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { costOf, aiUse, meterLog, logUsd } from "./api-budget.mjs";

test("aiUse: Cấu hình hệ thống đặt gói tháng cho config/bidprice; còn lại API", () => {
  const s = '﻿{"use":{"config":"plan","bidprice":"api"}}';
  assert.equal(aiUse("config", s), "plan");
  assert.equal(aiUse("bidprice", s), "api");
  assert.equal(aiUse("", s), "api");
  assert.equal(aiUse("config", "{hỏng"), "api");
  assert.equal(aiUse("config", ""), "api");
});

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

// GenBid-Bot.ps1 Invoke-Agent: `api-budget.mjs meter` đọc log lượt agent mỗi phút và ghi phần tăng thêm (Khoa 13/11/2026).
test("meterLog: ghi phần tăng ≥ 0,05 USD trong lúc chạy, lần cuối ghi đúng tới total_cost_usd", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "meter-")), log = path.join(dir, "run.log"), state = log + ".spend", book = path.join(dir, "book.jsonl");
  const a = (id, n) => JSON.stringify({ type: "assistant", message: { id, model: "claude-opus-5-5", usage: { cache_read_input_tokens: n } } }) + "\n";
  const run = (o) => meterLog({ log, state, file: book, start: "2026-11-13T04:00:00.000Z", ...o });
  fs.writeFileSync(log, a("m1", 1e5)); // 0,02
  assert.equal(run({ now: new Date("2026-11-13T04:01:00Z") }), 0);
  fs.appendFileSync(log, a("m2", 1e6)); // +0,2
  assert.equal(run({ now: new Date("2026-11-13T04:02:00Z") }), 0.22);
  fs.appendFileSync(log, '{"type":"result","total_cost_usd":0.3}\n');
  assert.equal(run({ final: true, now: new Date("2026-11-13T04:03:00Z") }), 0.08);
  assert.equal(run({ final: true }), 0); // không ghi hai lần
  const lines = fs.readFileSync(book, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  assert.deepEqual(lines.map((l) => [l.usd, l.t0]), [[0.22, "2026-11-13T04:00:00.000Z"], [0.08, "2026-11-13T04:02:00.000Z"]]);
  assert.equal(logUsd(fs.readFileSync(log, "utf8")), 0.3);
  // không trả bằng API (không có sổ): không ghi gì
  assert.equal(meterLog({ log, state: state + "2", file: "" , final: true }), 0);
});
