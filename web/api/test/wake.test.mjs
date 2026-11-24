// Bot dự phòng trong Vercel Sandbox theo nhu cầu (Khoa, 2026-11-17): web bật sandbox khi có yêu cầu mà không bot nào mở
// (api/_wake.js → api/_sandbox.js up()), nhịp tim của bot sandbox quyết dừng / gia hạn (api/requests.js → tick()).
// Sandbox giả qua _setSandbox: không gọi mạng, không cần @vercel/sandbox.
import { INGEST, makeDb, installFetch, fresh, mkReq, call } from "./harness.mjs";
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { shouldWake } from "../_wake.js";
import * as S from "../_sandbox.js";

let db, undo, box;
const NOW = Date.parse("2026-11-17T05:00:00.000Z");
const ago = (min) => new Date(NOW - min * 60e3).toISOString();
const ENV = { SANDBOX_WAKE: "1", INGEST_TOKEN: INGEST, ANTHROPIC_API_KEY: "ak", GITHUB_TOKEN: "gh" };

// Sandbox giả: status, bot chạy hay không, đã cài chưa; ghi lại mọi lệnh / create / stop / extend.
function fakeBox({ exists = true, status = "running", botUp = false, installed = true, statusUpdatedAt = new Date(NOW - 60 * 60e3), expiresAt = NOW + 50 * 60e3, createFails = false } = {}) {
  const b = { exists, created: [], cmds: [], stopped: 0, extended: [] };
  const sb = {
    get status() { return b.status; }, statusUpdatedAt, expiresAt,
    async runCommand(p) { b.cmds.push(p); b.status = "running"; const s = p.args[1]; const out = s === S.BOT_UP_CMD ? (botUp ? "UP" : "DOWN") : s.startsWith("test -f") ? (installed ? "DONE" : "TODO") : ""; return { exitCode: 0, stdout: async () => out }; },
    async stop() { b.stopped++; b.status = "stopped"; },
    async extendTimeout(ms) { b.extended.push(ms); },
  };
  b.status = status;
  b.Sandbox = {
    async get() { if (!b.exists) throw Object.assign(new Error("Not Found"), { status: 404 }); return sb; },
    async create(o) { b.created.push(o); if (createFails && o.timeout > 45 * 60e3) throw new Error("vượt trần gói"); b.exists = true; return sb; },
  };
  return b;
}

beforeEach(() => {
  db = makeDb(); undo = installFetch(db);
  db.member("tok-user", "User@Example.com", "member");
  mock.method(console, "warn", () => {}); mock.method(console, "log", () => {});
  mock.timers.enable({ apis: ["Date"], now: NOW });
  box = fakeBox(); S._setSandbox(box.Sandbox);
});
afterEach(() => { undo(); mock.restoreAll(); mock.timers.reset(); S._setSandbox(null); for (const k of Object.keys(ENV)) delete process.env[k]; });

const webreq = async (items, env = ENV) => {
  const h = await fresh("webreq.js", env);
  const r = (await call(h, mkReq({ method: "POST", body: { coll: "hsmtreq", items }, token: "tok-user" }))).jsonBody;
  await S.lastBackground;
  return r;
};
const poll = async (query, env = ENV) => { const r = (await call(await fresh("requests.js", env), mkReq({ query, token: INGEST }))).jsonBody; await S.lastBackground; return r; };
const startCmd = () => box.cmds.find((c) => c.detached);

test("shouldWake: bot có tim < 1 phút thì thôi; đã thử < 5 phút thì chờ; còn lại thì bật", () => {
  assert.equal(shouldWake({ current: { lastPollAt: ago(0.5) } }, NOW), "bot-on");
  assert.equal(shouldWake({ current: { lastPollAt: ago(4) }, wake: { at: ago(4) } }, NOW), "waking");
  assert.equal(shouldWake({ current: { lastPollAt: ago(4) }, wake: { at: ago(6) } }, NOW), "wake");
  assert.equal(shouldWake({ current: { lastPollAt: ago(1.5) } }, NOW), "wake", "im 1 phút 30 giây = tắt");
  assert.equal(shouldWake({}, NOW), "wake");
});

test("Yêu cầu lúc máy tắt: nối lại sandbox, chạy start-bot.sh nền với bí mật trong env; lần sau trong 5 phút không thử lại", async () => {
  box = fakeBox({ status: "stopped" }); S._setSandbox(box.Sandbox);
  db.put("botstatus", "current", { lastPollAt: ago(30) });
  const r = await webreq([{ key: "IB1" }]);
  assert.equal(r.wake, "sent");
  assert.equal(r.saved[0].key, "IB1");
  const c = startCmd();
  assert.ok(c, "có lệnh chạy nền");
  assert.match(c.args[1], /exec bash .*start-bot\.sh .*< \/dev\/null$/);
  assert.match(c.args[1], /merge -q --ff-only origin\/main.*\|\| true && exec bash .*start-bot\.sh/, "kéo mã mới trước khi chạy start-bot.sh");
  assert.doesNotMatch(c.args[1], /setup-sandbox/, "đã cài thì không cài lại");
  assert.deepEqual(c.env, { GENBID_INGEST_TOKEN: INGEST, ANTHROPIC_API_KEY: "ak", GH_TOKEN: "gh" });
  for (const x of box.cmds) assert.ok(!JSON.stringify(x.args).includes(INGEST), "bí mật không nằm trong dòng lệnh");
  assert.equal(db.get("botstatus", "wake").data.at, new Date(NOW).toISOString());
  const n = box.cmds.length;
  assert.equal((await webreq([{ key: "IB2" }])).wake, "waking");
  assert.equal(box.cmds.length, n);
});

test("Lần đầu: tạo sandbox persistent sin1 phiên 60 phút (Hobby: 45 phút), cài setup-sandbox.sh rồi mới chạy bot", async () => {
  box = fakeBox({ exists: false, installed: false, createFails: true }); S._setSandbox(box.Sandbox);
  assert.equal(await S.up({ env: ENV, log() {} }), "installing");
  assert.equal(box.created.length, 2);
  const o = box.created[0];
  assert.equal(o.name, "genbid-bot"); assert.equal(o.persistent, true); assert.equal(o.region, "sin1"); assert.equal(o.timeout, 60 * 60e3);
  assert.equal(o.image, "vercel/sandbox/ubuntu"); assert.equal(o.runtime, undefined);
  assert.equal(o.snapshotExpiration, 5 * 365 * 24 * 3600e3);
  assert.equal(box.created[1].timeout, 45 * 60e3);
  assert.match(startCmd().args[1], /command -v curl .*apt-get install .*curl .*setup-sandbox\.sh main && touch .*sandbox-setup-done; } > \$HOME\/setup\.log 2>&1 && .*start-bot\.sh/);
});

test("Sandbox có sẵn giữ hạn snapshot cũ: cập nhật lên 5 năm, lỗi thì vẫn chạy bot", async () => {
  const updates = [];
  box = fakeBox({ status: "stopped" }); S._setSandbox(box.Sandbox);
  const sb = await box.Sandbox.get();
  sb.snapshotExpiration = 365 * 24 * 3600e3;
  sb.update = async (o) => { updates.push(o); throw new Error("không cho"); };
  assert.equal(await S.up({ env: ENV, log() {} }), "started");
  assert.equal(updates.length, 1);
  assert.equal(updates[0].snapshotExpiration, 5 * 365 * 24 * 3600e3);
  assert.equal(updates[0].keepLastSnapshots.expiration, 5 * 365 * 24 * 3600e3);
  sb.snapshotExpiration = S.SNAPSHOT_MS; updates.length = 0;
  await S.up({ env: ENV, log() {} });
  assert.equal(updates.length, 0, "đã đúng hạn thì không cập nhật");
});

test("Đang có lượt cài chạy dở: không chạy thêm lượt thứ hai", async () => {
  box = fakeBox({ installed: false }); S._setSandbox(box.Sandbox);
  const run = box.Sandbox.get; box.Sandbox.get = async () => { const sb = await run(); const rc = sb.runCommand; sb.runCommand = async (p) => (p.args[1].includes("[s]etup-sandbox") ? { exitCode: 0, stdout: async () => "BUSY" } : rc(p)); return sb; };
  assert.equal(await S.up({ env: ENV, log() {} }), "installing");
  assert.equal(startCmd(), undefined);
});

test("Bot đã chạy trong sandbox: không chạy thêm; thiếu INGEST_TOKEN hoặc khoá Claude: báo lỗi, không đụng sandbox", async () => {
  box = fakeBox({ botUp: true }); S._setSandbox(box.Sandbox);
  assert.equal(await S.up({ env: ENV, log() {} }), "running");
  assert.equal(startCmd(), undefined);
  await assert.rejects(S.up({ env: { INGEST_TOKEN: "x" }, log() {} }), /thiếu/);
  assert.equal(box.cmds.length, 1);
});

test("Bot đang mở (tim < 1 phút), huỷ yêu cầu, hoặc chưa đặt SANDBOX_WAKE=1: không bật sandbox", async () => {
  db.put("botstatus", "current", { lastPollAt: ago(0.5) });
  assert.equal((await webreq([{ key: "IB1" }])).wake, "bot-on");
  db.put("botstatus", "current", { lastPollAt: ago(30) });
  assert.equal((await webreq([{ key: "IB1", cancel: true }])).wake, "off");
  assert.equal((await webreq([{ key: "IB1" }], { ...ENV, SANDBOX_WAKE: undefined })).wake, "off");
  assert.equal(box.cmds.length, 0);
});

test("Trang thấy máy tắt (coll=wake): chỉ bật khi có yêu cầu chờ; bỏ qua mốc 'bot-on' của lần gửi yêu cầu lúc máy vừa tắt", async () => {
  const ping = async () => { const h = await fresh("webreq.js", ENV); const r = (await call(h, mkReq({ method: "POST", body: { coll: "wake" }, token: "tok-user" }))).jsonBody; await S.lastBackground; return r.wake; };
  db.put("botstatus", "current", { lastPollAt: ago(30) });
  assert.equal(await ping(), "idle");
  assert.equal(box.cmds.length, 0);
  assert.equal(db.get("botstatus", "wake"), undefined, "không có việc thì không ghi mốc");
  db.put("syncreq", "current", { requestedAt: ago(2) });
  assert.equal(await ping(), "sent");
  assert.ok(startCmd());
  assert.equal(await ping(), "waking");
});

test("Bật sandbox lỗi: yêu cầu vẫn lưu, trả lời không chờ, không ném lỗi", async () => {
  box.Sandbox.get = async () => { throw new Error("401 OIDC"); };
  const r = await webreq([{ key: "IB1" }]);
  assert.equal(r.wake, "sent");
  assert.ok(db.get("hsmtreq", "IB1"));
});

test("decide: tắt → bật khi có việc và máy Windows im; chạy → dừng khi máy bật lại hoặc rảnh 5 phút; đang làm dở thì giữ", () => {
  const RUN = { status: "running", statusUpdatedAt: new Date(NOW - 60 * 60e3) };
  assert.equal(S.decide({ pending: true, pc: { lastPollAt: ago(10) } }, null, NOW), "up");
  assert.equal(S.decide({ pending: true, pc: { lastPollAt: ago(0.5) } }, { status: "stopped" }, NOW), "none");
  assert.equal(S.decide({ pending: true, pc: { lastPollAt: ago(1.5) } }, { status: "stopped" }, NOW), "up", "máy Windows im 1 phút 30 giây = tắt (Khoa 17/11: ngưỡng 1 phút)");
  assert.equal(S.decide({ pending: false }, { status: "stopped" }, NOW), "none");
  assert.equal(S.decide({ pending: false, pc: { lastPollAt: ago(0.5) }, sandbox: { lastPollAt: ago(0), running: false } }, RUN, NOW), "stop");
  assert.equal(S.decide({ pending: true, pc: { lastPollAt: ago(0.5) }, sandbox: { lastPollAt: ago(0), running: true } }, RUN, NOW), "up");
  assert.equal(S.decide({ pending: false, sandboxBusyAt: ago(25) }, RUN, NOW), "stop");
  assert.equal(S.decide({ pending: false, sandboxBusyAt: ago(3) }, RUN, NOW), "up", "rảnh 3 phút: giữ");
  assert.equal(S.decide({ pending: false, sandboxBusyAt: ago(6) }, RUN, NOW), "stop", "rảnh 6 phút: dừng (Khoa 17/11: ngưỡng 5 phút)");
  assert.equal(S.decide({ pending: false, sandboxBusyAt: ago(600) }, { status: "running", statusUpdatedAt: new Date(NOW - 2 * 60e3) }, NOW), "up", "vừa nối lại phiên");
});

test("Nhịp tim sandbox: rảnh 5 phút → dừng; có việc → ghi sandboxbusy, gia hạn khi phiên còn < 20 phút; beat=0 không quyết gì", async () => {
  db.put("botstatus", "sandboxbusy", { at: ago(25) });
  await poll({ kind: "all", host: "sandbox" });
  assert.equal(box.stopped, 1);

  box = fakeBox({ expiresAt: NOW + 10 * 60e3 }); S._setSandbox(box.Sandbox);
  db.put("hsmtreq", "IB1", { requestedAt: ago(1) });
  await poll({ kind: "all", host: "sandbox" });
  assert.equal(box.stopped, 0);
  assert.deepEqual(box.extended, [60 * 60e3]);
  assert.equal(db.get("botstatus", "sandboxbusy").data.at, new Date(NOW).toISOString());

  box = fakeBox(); S._setSandbox(box.Sandbox);
  await poll({ kind: "all", host: "sandbox", beat: "0" });
  assert.equal(box.stopped + box.extended.length, 0);
});

test("Nhịp tim sandbox khi máy Windows đã bật lại (tim < 1 phút) và không làm dở: dừng sandbox", async () => {
  db.put("botstatus", "pc", { lastPollAt: ago(0.5), running: false });
  db.put("hsmtreq", "IB1", { requestedAt: ago(1) });
  await poll({ kind: "all", host: "sandbox" });
  assert.equal(box.stopped, 1);
  box = fakeBox(); S._setSandbox(box.Sandbox);
  await poll({ kind: "all", host: "sandbox", running: "1" });
  assert.equal(box.stopped, 0, "đang làm dở thì để làm xong");
});

test("Nhịp tim: máy Windows ghi botstatus/pc, sandbox ghi botstatus/sandbox; cả hai ghi current kèm host", async () => {
  await poll({ kind: "all" });
  assert.equal(db.get("botstatus", "current").data.host, "pc");
  assert.equal(db.get("botstatus", "pc").data.lastPollAt, new Date(NOW).toISOString());
  await poll({ kind: "all", host: "sandbox" });
  assert.equal(db.get("botstatus", "current").data.host, "sandbox");
  assert.ok(db.get("botstatus", "sandbox"));
});

test("Máy Windows bật lại khi sandbox còn tim < 2 phút: máy nhận danh sách rỗng; sandbox im hoặc chưa bật SANDBOX_WAKE thì nhận như cũ", async () => {
  db.put("hsmtreq", "IB1", { requestedAt: ago(1) });
  db.put("botstatus", "sandbox", { lastPollAt: ago(1), running: true });
  let r = await poll({ kind: "all" });
  assert.equal(r.yieldTo, "sandbox");
  assert.deepEqual(r.files, []);
  r = await poll({ kind: "all" }, { ...ENV, SANDBOX_WAKE: undefined });
  assert.equal(r.files.length, 1);
  db.put("botstatus", "sandbox", { lastPollAt: ago(3), running: false });
  r = await poll({ kind: "all" });
  assert.equal(r.yieldTo, undefined);
  assert.equal(r.files.length, 1);
  db.put("botstatus", "sandbox", { lastPollAt: ago(0), running: true });
  assert.equal((await poll({ kind: "all", host: "sandbox", beat: "0" })).files.length, 1);
});

test("?kind=bots: trạng thái để xem tay, không ghi gì", async () => {
  db.put("botstatus", "pc", { lastPollAt: ago(10), running: false });
  db.put("botstatus", "sandboxbusy", { at: ago(5) });
  assert.deepEqual(await poll({ kind: "bots" }), { pending: false, pc: { lastPollAt: ago(10), running: false }, sandbox: null, sandboxBusyAt: ago(5) });
  assert.equal(db.calls.filter((c) => c.method === "POST").length, 0);
});

test("botEnv: GH_BOT_TOKEN ưu tiên hơn GITHUB_TOKEN; không mang biến Supabase / Vercel", () => {
  assert.deepEqual(S.botEnv({ INGEST_TOKEN: "i", GITHUB_TOKEN: "g", GH_BOT_TOKEN: "b", SUPABASE_SERVICE_ROLE_KEY: "s", VERCEL_OIDC_TOKEN: "o", CLAUDE_CODE_OAUTH_TOKEN: "c" }),
    { GENBID_INGEST_TOKEN: "i", CLAUDE_CODE_OAUTH_TOKEN: "c", GH_TOKEN: "b" });
});

test("botEnv: khoá Firecrawl chính và dự phòng (Khoa 24/11/2026) đi vào sandbox khi có", () => {
  assert.deepEqual(S.botEnv({ INGEST_TOKEN: "i", FIRECRAWL_KEY: "k1", FIRECRAWL_KEY_2: "k2" }), { GENBID_INGEST_TOKEN: "i", FIRECRAWL_KEY: "k1", FIRECRAWL_KEY_2: "k2" });
  assert.deepEqual(S.botEnv({ INGEST_TOKEN: "i", FIRECRAWL_KEY: "k1" }), { GENBID_INGEST_TOKEN: "i", FIRECRAWL_KEY: "k1" });
});

// Sync theo lịch khi mọi máy Windows tắt (Khoa 18/11/2026): Vercel Cron 10:10 / 14:10 / 18:10 giờ VN, thứ Hai–thứ Sáu.
const cron = async (env, bearer) => { const r = await call(await fresh("cron.js", env), mkReq({ bearer })); await S.lastBackground; return r; };
const CENV = { ...ENV, CRON_SECRET: "cs" };

test("cron: chưa đặt CRON_SECRET thì 503; sai khoá thì 401; không đánh thức gì", async () => {
  db.put("botstatus", "current", { lastPollAt: ago(30) });
  assert.equal((await cron({ ...ENV, CRON_SECRET: undefined }, "x")).statusCode, 503);
  assert.equal((await cron(CENV, "sai")).statusCode, 401);
  assert.equal((await cron(CENV)).statusCode, 401);
  assert.equal(startCmd(), undefined);
  delete process.env.CRON_SECRET;
});

test("cron ngày thường, mọi máy tắt: bật sandbox (bot sandbox tự Sync mốc vừa tới); có máy bật thì thôi", async () => {
  box = fakeBox({ status: "stopped" }); S._setSandbox(box.Sandbox);
  db.put("botstatus", "current", { lastPollAt: ago(0.5) });
  assert.equal((await cron(CENV, "cs")).jsonBody.wake, "bot-on");
  assert.equal(startCmd(), undefined);
  db.put("botstatus", "current", { lastPollAt: ago(30) });
  assert.equal((await cron(CENV, "cs")).jsonBody.wake, "sent");
  assert.ok(startCmd(), "đã chạy start-bot.sh");
  delete process.env.CRON_SECRET;
});

test("cron thứ Bảy, Chủ nhật (giờ VN) không Sync, kể cả khi mọi máy tắt; 03:10 UTC thứ Hai là thứ Hai ở VN", async () => {
  const { isWorkday } = await import("../cron.js");
  assert.equal(isWorkday(Date.parse("2026-11-21T03:10:00Z")), false, "thứ Bảy");
  assert.equal(isWorkday(Date.parse("2026-11-22T11:10:00Z")), false, "Chủ nhật 18:10");
  assert.equal(isWorkday(Date.parse("2026-11-23T03:10:00Z")), true, "thứ Hai 10:10");
  assert.equal(isWorkday(Date.parse("2026-11-28T11:10:00Z")), false, "thứ Bảy 18:10");
  assert.equal(isWorkday(Date.parse("2026-11-27T11:10:00Z")), true, "thứ Sáu 18:10");
  mock.timers.setTime(Date.parse("2026-11-21T03:10:00Z"));
  db.put("botstatus", "current", { lastPollAt: ago(60 * 24 * 5) });
  assert.equal((await cron(CENV, "cs")).jsonBody.wake, "weekend");
  assert.equal(startCmd(), undefined);
  delete process.env.CRON_SECRET;
});

test("nhịp tim trả schedule.last = mốc Sync theo lịch gần nhất (synclog/current.slot), cả khi máy phải nhường sandbox", async () => {
  assert.equal((await poll({ kind: "all" })).schedule, undefined, "chưa có synclog");
  db.put("synclog", "current", { slot: "2026-11-17 10:10", doneAt: ago(100), ok: true });
  assert.deepEqual((await poll({ kind: "all" })).schedule, { last: "2026-11-17 10:10" });
  assert.equal((await poll({ kind: "all", beat: "0" })).schedule, undefined, "không phải nhịp tim thì không đọc thêm");
  db.put("botstatus", "sandbox", { lastPollAt: ago(0.5) });
  const r = await poll({ kind: "all" });
  assert.equal(r.yieldTo, "sandbox");
  assert.deepEqual(r.schedule, { last: "2026-11-17 10:10" });
  db.put("synclog", "current", { slot: "2026-11-17 14:10", doneAt: ago(1), ok: false, summary: "Sync lỗi: x" });
  assert.equal((await poll({ kind: "all" })).schedule, undefined, "Sync lỗi không tính là xong mốc");
});
