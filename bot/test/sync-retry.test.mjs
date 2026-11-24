// A scheduled Sync that fails (Khoa 24/11/2026): tries inside the process, the failure pictures kept, the slot's retry mark.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

test("withRetries: lỗi rồi được thì trả kết quả, chờ đúng các khoảng", async () => {
  const slept = [], seen = [];
  let n = 0;
  const r = await P.withRetries(async () => { if (++n < 3) throw new Error("e" + n); return "ok"; },
    { waits: [30, 120], sleep: async (ms) => slept.push(ms), onRetry: (e, i) => seen.push(`${e.message}:${i}`) });
  assert.equal(r, "ok");
  assert.deepEqual(slept, [30, 120]);
  assert.deepEqual(seen, ["e1:1", "e2:2"]);
});

test("withRetries: hết lượt thì ném lỗi cuối; không có waits thì chỉ một lần", async () => {
  let n = 0;
  await assert.rejects(P.withRetries(async () => { throw new Error("e" + ++n); }, { waits: [1, 1], sleep: async () => {} }), /e3/);
  n = 0;
  await assert.rejects(P.withRetries(async () => { throw new Error("e" + ++n); }), /e1/);
});

test("failShotsToDrop: giữ các bộ mới nhất, không đụng tệp khác", () => {
  const names = ["run-1.log", "sync-fail-2026-11-20-11-11-00.png", "sync-fail-2026-11-20-11-11-00.txt", "sync-fail-2026-11-21-11-11-00.png", "sync-fail-2026-11-21-11-11-00.txt", "sync-fail-2026-11-22-11-11-00.txt"];
  assert.deepEqual(P.failShotsToDrop(names, 2), ["sync-fail-2026-11-20-11-11-00.png", "sync-fail-2026-11-20-11-11-00.txt"]);
  assert.deepEqual(P.failShotsToDrop(names, 3), []);
});

test("scheduleAfterOk: chỉ xoá retry của đúng mốc vừa thành công", () => {
  const s = { last: "2026-11-20 18:10", retry: { slot: "2026-11-20 18:10", tries: 1, at: "x" } };
  assert.deepEqual(P.scheduleAfterOk(s, "2026-11-20 18:10"), { last: "2026-11-20 18:10" });
  assert.equal(P.scheduleAfterOk(s, "2026-11-20 14:10"), s);
  assert.equal(P.scheduleAfterOk(null, "x"), null);
});
