// Câu hỏi làm rõ: mục agent cùng tên mục + chung câu trích với mục của code thì bỏ, giữ mục của code (IB2600603983).
import test from "node:test";
import assert from "node:assert/strict";
import { clarifyOf } from "./config-bot.mjs";

const A = "15 Dao động điện áp ≤ ± 0,5% Udm", B = "Ổn định điện áp ±1,5%Udm khi chuyển tải", C = "14 Tỉ số nén 14 : 01";
const hsmt = [A, B, C].join("\n");
const reqs = [{ code: "alt_vreg", item: "Ổn định điện áp", quote: A, quotes: [A, B] }];

test("agent trùng tên mục và câu trích: giữ mục của code", () => {
  const r = { requirements: reqs, clarify: [{ item: "Ổn định điện áp", quoteA: A, quoteB: "Ổn định điện áp ±1,5%Udm", why: "x", by: "agent" }, { item: "Tỷ số nén", quoteA: C, why: "y", by: "agent" }] };
  clarifyOf(r, hsmt, null, [], { scan: false });
  assert.deepEqual(r.clarify.map((x) => [x.by, x.item]), [["code", "Ổn định điện áp"], ["agent", "Tỷ số nén"]]);
});

test("cùng câu trích nhưng khác tên mục: không gộp", () => {
  const r = { requirements: reqs, clarify: [{ item: "Dao động khi chuyển tải", quoteA: A, quoteB: C, why: "z", by: "agent" }] };
  clarifyOf(r, hsmt, null, [], { scan: false });
  assert.equal(r.clarify.length, 2);
});
