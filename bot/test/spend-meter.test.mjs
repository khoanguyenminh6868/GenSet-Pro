// Sổ chi API theo lượt đang chạy (Khoa 13/11/2026: "số tiền sử dụng API vẫn không được cập nhật. cần cập nhật mỗi khi sử
// dụng"): spendMeter trong sync-pure.js đọc stream-json của claude -p và ghi sổ trong lúc chạy; lượt bị dừng giữa chừng
// (22 lượt Tìm thông số "quá 40 phút" ngày 13/11, không có dòng result) vẫn được tính.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

const msg = (id, usage, content = [], model = "claude-opus-5-5") => JSON.stringify({ type: "assistant", message: { id, model, usage, content } });
const meterOf = (opts = {}) => {
  const recs = []; let n = 0;
  const now = () => new Date(Date.UTC(2026, 10, 13, 4, 0, n++));
  return { recs, m: P.spendMeter((r, t) => recs.push({ ...r, t: t.toISOString() }), { now, ...opts }) };
};

test("usageUsd: giá Opus 5.5 khớp total_cost_usd của một lượt thật (2,5240332 USD)", () => {
  const u = { input_tokens: 40, output_tokens: 40776, cache_read_input_tokens: 3084241, cache_creation_input_tokens: 218301, cache_creation: { ephemeral_5m_input_tokens: 218301, ephemeral_1h_input_tokens: 0 } };
  assert.ok(Math.abs(P.usageUsd("claude-opus-5-5", u) - 2.5240332) < 1e-9);
  // model lạ tính như Opus 5.5; cache 1 h giá riêng; tìm web 0,01 USD/lần
  assert.equal(P.usageUsd("claude-x", { input_tokens: 1e6 }), 4);
  assert.equal(P.usageUsd("claude-opus-5-5", { cache_creation_input_tokens: 1e6, cache_creation: { ephemeral_1h_input_tokens: 1e6 } }), 8);
  assert.equal(P.usageUsd("claude-sonnet-5-5", { server_tool_use: { web_search_requests: 3 } }), 0.03);
});

test("ghi sổ trong lúc chạy: mỗi lần ước tính vượt 0,05 USD; mỗi id tin nhắn tính một lần dù lặp theo từng khối", () => {
  const { recs, m } = meterOf();
  const u = { input_tokens: 0, cache_read_input_tokens: 100000, output_tokens: 1 }; // 0,02 USD
  m.data(msg("a", u) + "\n" + msg("a", u) + "\n");
  assert.equal(recs.length, 0);
  m.data(msg("b", u) + "\n[12s] " + msg("c", u).slice(0, 10)); // dòng chưa trọn chờ phần sau; tiền tố "[Ns] " của config-bot
  assert.equal(recs.length, 0);
  m.data(msg("c", u).slice(10) + "\n");
  assert.equal(recs.length, 1);
  assert.ok(Math.abs(recs[0].usd - 0.06) < 1e-3, String(recs[0].usd));
  assert.equal(recs[0].t0, "2026-11-13T04:00:00.000Z"); // lúc bắt đầu lượt
});

test("token ra ước theo số ký tự đã viết (stream-json chỉ có output_tokens lúc tin nhắn bắt đầu)", () => {
  const { m } = meterOf();
  m.line(msg("a", { output_tokens: 6 }, [{ type: "text", text: "x".repeat(1000) }]));
  m.line(msg("a", { output_tokens: 6 }, [{ type: "tool_use", input: { file_path: "y".repeat(980) } }]));
  const r = m.finish();
  assert.ok(Math.abs(r.est - 2000 * 1.15 * 20 / 1e6) < 5e-4, String(r.est));
});

test("kết thúc có dòng result: ghi phần chênh tới total_cost_usd (âm nếu ước cao)", () => {
  const { recs, m } = meterOf();
  m.data(msg("a", { cache_read_input_tokens: 1e6 }) + "\n"); // 0,2 USD
  assert.equal(recs.length, 1);
  m.data('{"duration_api_ms":1,"type":"result","total_cost_usd":0.15}\n');
  const r = m.finish();
  assert.equal(r.usd, 0.15);
  assert.deepEqual(recs.map((x) => x.usd), [0.2, -0.05]);
  assert.equal(recs[1].t0, recs[0].t); // phần sau nối tiếp phần trước
});

test("lượt bị dừng (không có dòng result): finish ghi phần ước còn lại", () => {
  const { recs, m } = meterOf();
  m.data(msg("a", { input_tokens: 5000 }));
  m.finish();
  assert.deepEqual(recs.map((x) => x.usd), [0.02]);
});

test("sổ ghi dần vẫn cộng đúng trong apiBudgetOf (cả dòng âm)", () => {
  const { recs, m } = meterOf();
  m.data(msg("a", { cache_read_input_tokens: 1e6 }) + "\n" + msg("b", { cache_read_input_tokens: 1e6 }) + "\n" + '{"type":"result","total_cost_usd":0.35}\n');
  m.finish();
  const book = recs.map((r) => JSON.stringify(r)).join("\n");
  assert.equal(P.apiBudgetOf("", book, new Date("2026-11-13T12:00:00Z")).spent, 0.35);
});
