// Bot dự phòng trong Vercel Sandbox theo nhu cầu (Khoa, 2026-11-17): web chạy workflow sandbox-ensure.yml khi có yêu cầu
// mà không bot nào mở (api/_wake.js qua api/webreq.js); nhịp tim tách máy Windows / sandbox (api/requests.js ?host, ?kind=bots).
import { INGEST, makeDb, installFetch, fresh, mkReq, call } from "./harness.mjs";
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { shouldWake } from "../_wake.js";

let db, undo;
const NOW = Date.parse("2026-11-17T05:00:00.000Z");
const ago = (min) => new Date(NOW - min * 60e3).toISOString();
beforeEach(() => {
  db = makeDb(); undo = installFetch(db);
  db.member("tok-user", "User@Example.com", "member");
  mock.method(console, "warn", () => {});
  mock.timers.enable({ apis: ["Date"], now: NOW });
});
afterEach(() => { undo(); mock.restoreAll(); mock.timers.reset(); delete process.env.GH_DISPATCH_TOKEN; });

const webreq = async (items, env = { GH_DISPATCH_TOKEN: "dispatch-tok" }) => {
  const h = await fresh("webreq.js", env);
  return (await call(h, mkReq({ method: "POST", body: { coll: "hsmtreq", items }, token: "tok-user" }))).jsonBody;
};
const dispatches = () => db.gh.dispatches || [];

test("shouldWake: bot có tim < 3 phút thì thôi; đã gọi < 5 phút thì chờ; còn lại thì gọi", () => {
  assert.equal(shouldWake({ current: { lastPollAt: ago(2) } }, NOW), "bot-on");
  assert.equal(shouldWake({ current: { lastPollAt: ago(4) }, wake: { at: ago(4) } }, NOW), "waking");
  assert.equal(shouldWake({ current: { lastPollAt: ago(4) }, wake: { at: ago(6) } }, NOW), "wake");
  assert.equal(shouldWake({}, NOW), "wake");
});

test("Yêu cầu lúc máy tắt: chạy workflow sandbox-ensure.yml trên main một lần, ghi botstatus/wake; lần sau trong 5 phút không gọi lại", async () => {
  db.put("botstatus", "current", { lastPollAt: ago(30) });
  const r = await webreq([{ key: "IB1" }]);
  assert.equal(r.wake, "sent");
  assert.equal(r.saved[0].key, "IB1");
  assert.equal(dispatches().length, 1);
  assert.equal(dispatches()[0].auth, "Bearer dispatch-tok");
  assert.deepEqual(JSON.parse(dispatches()[0].body), { ref: "main" });
  assert.equal(db.get("botstatus", "wake").data.at, new Date(NOW).toISOString());
  assert.equal((await webreq([{ key: "IB2" }])).wake, "waking");
  assert.equal(dispatches().length, 1);
});

test("Bot đang mở (tim < 3 phút), huỷ yêu cầu, hoặc chưa đặt GH_DISPATCH_TOKEN: không gọi workflow", async () => {
  db.put("botstatus", "current", { lastPollAt: ago(1) });
  assert.equal((await webreq([{ key: "IB1" }])).wake, "bot-on");
  db.put("botstatus", "current", { lastPollAt: ago(30) });
  assert.equal((await webreq([{ key: "IB1", cancel: true }])).wake, "off");
  assert.equal((await webreq([{ key: "IB1" }], { GH_DISPATCH_TOKEN: undefined })).wake, "off");
  assert.equal(dispatches().length, 0);
});

test("GitHub từ chối: yêu cầu vẫn lưu, báo wake=error", async () => {
  db.gh.dispatchStatus = 403;
  const r = await webreq([{ key: "IB1" }]);
  assert.equal(r.wake, "error");
  assert.ok(db.get("hsmtreq", "IB1"));
});

const poll = async (query, env = { GH_DISPATCH_TOKEN: "dispatch-tok" }) => (await call(await fresh("requests.js", env), mkReq({ query, token: INGEST }))).jsonBody;

test("Nhịp tim: máy Windows ghi botstatus/pc, sandbox ghi botstatus/sandbox (+ sandboxbusy khi có việc); cả hai ghi current kèm host", async () => {
  await poll({ kind: "all" });
  assert.equal(db.get("botstatus", "current").data.host, "pc");
  assert.equal(db.get("botstatus", "pc").data.lastPollAt, new Date(NOW).toISOString());
  assert.equal(db.get("botstatus", "sandbox"), undefined);
  await poll({ kind: "all", host: "sandbox" });
  assert.equal(db.get("botstatus", "current").data.host, "sandbox");
  assert.ok(db.get("botstatus", "sandbox"));
  assert.equal(db.get("botstatus", "sandboxbusy"), undefined, "không có việc thì không ghi sandboxbusy");
  await poll({ kind: "all", host: "sandbox", running: "1" });
  assert.ok(db.get("botstatus", "sandboxbusy"));
});

test("Máy Windows bật lại khi sandbox còn tim < 2 phút: máy nhận danh sách rỗng (không làm trùng); sandbox im thì nhận như cũ", async () => {
  db.put("hsmtreq", "IB1", { requestedAt: ago(1) });
  db.put("botstatus", "sandbox", { lastPollAt: ago(1), running: true });
  let r = await poll({ kind: "all" });
  assert.equal(r.yieldTo, "sandbox");
  assert.deepEqual(r.files, []);
  // chưa bật sandbox (không có GH_DISPATCH_TOKEN): không đọc botstatus/sandbox
  r = await poll({ kind: "all" }, { GH_DISPATCH_TOKEN: undefined });
  assert.equal(r.files.length, 1);
  db.put("botstatus", "sandbox", { lastPollAt: ago(3), running: false });
  r = await poll({ kind: "all" });
  assert.equal(r.yieldTo, undefined);
  assert.equal(r.files.length, 1);
  // chính sandbox thì luôn nhận
  db.put("botstatus", "sandbox", { lastPollAt: ago(0), running: true });
  assert.equal((await poll({ kind: "all", host: "sandbox", beat: "0" })).files.length, 1);
});

test("?kind=bots: trạng thái cho ensure.mjs, không ghi gì", async () => {
  db.put("botstatus", "pc", { lastPollAt: ago(10), running: false });
  db.put("botstatus", "sandboxbusy", { at: ago(5) });
  let r = await poll({ kind: "bots" });
  assert.deepEqual(r, { pending: false, pc: { lastPollAt: ago(10), running: false }, sandbox: null, sandboxBusyAt: ago(5) });
  db.put("analysisreq", "IB9", { requestedAt: ago(1) });
  r = await poll({ kind: "bots" });
  assert.equal(r.pending, true);
  assert.equal(db.calls.filter((c) => c.method === "POST").length, 0);
});
