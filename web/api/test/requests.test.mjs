import { INGEST, SB, makeDb, installFetch, fresh, mkReq, call, sbDocsWrites } from "./harness.mjs";
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

let db, undo;
beforeEach(() => { db = makeDb(); undo = installFetch(db); mock.method(console, "warn", () => {}); });
afterEach(() => { undo(); mock.restoreAll(); mock.timers.reset(); });

const get = (h, query, token = INGEST) => call(h, mkReq({ query, token }));
const reqDoc = (coll, id, data) => db.put(coll, id, data);
const viewCalls = () => db.where((c) => c.path === "/rest/v1/pending_requests");
const marksCalls = () => db.where((c) => c.path === "/rest/v1/docs" && c.search.includes("data-%3E%3E") || c.search.includes("data->>"));

test("Chỉ nhận GET, thiếu token hoặc sai token thì 401", async () => {
  const h = await fresh("requests.js");
  assert.equal((await call(h, mkReq({ method: "POST", token: INGEST }))).statusCode, 405);
  assert.equal((await call(h, mkReq({ query: { kind: "all" } }))).statusCode, 401);
  assert.equal((await get(h, { kind: "all" }, INGEST.replace(/.$/, "x"))).statusCode, 401);
  assert.equal(db.calls.length, 0, "không đụng Supabase khi chưa qua token");
});

test("Bot không được đọc bộ sưu tập ngoài danh sách (botstatus, quote, members, activity_log)", async () => {
  const h = await fresh("requests.js");
  for (const coll of ["botstatus", "quote", "members", "activity_log", ""]) {
    const r = await get(h, { kind: "docs", coll });
    assert.equal(r.statusCode, 400, coll);
  }
  for (const coll of ["bcdg", "bidhist", "specmatch", "supexcl", "supdeleted", "supplier", "analysis"]) {
    assert.equal((await get(h, { kind: "docs", coll })).statusCode, 200, coll);
  }
});

test("kind=stamps trả [{id, updated_at}] của mọi tài liệu, không kèm data", async () => {
  db.put("analysis", "IB1", { status: "done", big: "x".repeat(1000) }, "2026-11-01T00:00:00.000Z");
  db.put("analysis", "IB2", { status: "done" }, "2026-11-02T00:00:00.000Z");
  const r = await get(await fresh("requests.js"), { kind: "stamps", coll: "analysis" });
  assert.deepEqual(r.jsonBody, [{ id: "IB1", updated_at: "2026-11-01T00:00:00.000Z" }, { id: "IB2", updated_at: "2026-11-02T00:00:00.000Z" }]);
  assert.equal(r.headers["cache-control"], "no-store");
});

test("kind=stamps phân trang 1000 dòng: 2300 tài liệu đều về đủ, theo thứ tự id", async () => {
  for (let i = 0; i < 2300; i++) db.put("hsmt", "K" + String(i).padStart(5, "0"), {});
  const r = await get(await fresh("requests.js"), { kind: "stamps", coll: "hsmt" });
  assert.equal(r.jsonBody.length, 2300);
  const ids = r.jsonBody.map((x) => x.id);
  assert.deepEqual(ids, [...ids].sort());
  const pages = db.where((c) => c.path === "/rest/v1/docs").map((c) => c.headers.Range);
  assert.deepEqual(pages, ["0-999", "1000-1999", "2000-2999"]);
  assert.ok(db.calls.every((c) => c.search.includes("order=id")), "mọi truy vấn phân trang có order");
});

test("kind=docs&ids= chỉ trả các tài liệu được hỏi; ids quá 100 hoặc rỗng thì 400", async () => {
  for (const id of ["A", "B", "C"]) db.put("analysis", id, { v: id });
  const h = await fresh("requests.js");
  const r = await get(h, { kind: "docs", coll: "analysis", ids: "A,C,Z" });
  assert.deepEqual(r.jsonBody.map((d) => d.id), ["A", "C"]);
  assert.equal((await get(h, { kind: "docs", coll: "analysis", ids: Array.from({ length: 101 }, (_, i) => "i" + i).join(",") })).statusCode, 400);
  assert.equal((await get(h, { kind: "docs", coll: "analysis", ids: "," })).statusCode, 400);
  assert.equal((await get(h, { kind: "docs", coll: "analysis", ids: Array.from({ length: 100 }, (_, i) => "i" + i).join(",") })).statusCode, 200, "đúng 100 là còn được (biên)");
});

test("kind=docs&id= đọc một tài liệu", async () => {
  db.put("analysis", "A", { v: 1 }).put("analysis", "B", { v: 2 });
  const r = await get(await fresh("requests.js"), { kind: "docs", coll: "analysis", id: "B" });
  assert.deepEqual(r.jsonBody, [{ id: "B", data: { v: 2 } }]);
});

test("NCC xoá mềm (supdeleted) và NCC loại trừ (supexcl on:true) bị bỏ khỏi supplier — cả docs lẫn stamps", async () => {
  for (const id of ["a", "b", "c", "d"]) db.put("supplier", id, { name: id });
  db.put("supdeleted", "a", { at: "x" });
  db.put("supexcl", "b", { on: true });
  db.put("supexcl", "c", { on: false }); // đã bỏ loại trừ: vẫn đọc được
  const h = await fresh("requests.js");
  assert.deepEqual((await get(h, { kind: "docs", coll: "supplier" })).jsonBody.map((d) => d.id), ["c", "d"]);
  assert.deepEqual((await get(h, { kind: "stamps", coll: "supplier" })).jsonBody.map((d) => d.id), ["c", "d"]);
});

test("Bộ lọc NCC chỉ áp cho coll=supplier; supexcl on kiểu chuỗi 'true' không phải loại trừ (so sánh chặt)", async () => {
  db.put("supplier", "a", {}).put("supexcl", "a", { on: "true" });
  db.put("suppliermatch", "a", {}).put("supdeleted", "zz", {});
  const h = await fresh("requests.js");
  assert.equal((await get(h, { kind: "docs", coll: "supplier" })).jsonBody.length, 1, "on:'true' không loại (khoá hành vi: web ghi boolean)");
  assert.equal((await get(h, { kind: "docs", coll: "suppliermatch" })).jsonBody.length, 1, "suppliermatch không bị lọc");
});

test("tracked: bỏ note và bidPrice (giữ trên web), giữ các trường khác; stamps không đổi", async () => {
  db.put("tracked", "IB1", { stage: "submitted", note: "ghi chú riêng", bidPrice: 123, tender: { notifyNo: "IB1" } });
  const h = await fresh("requests.js");
  const d = (await get(h, { kind: "docs", coll: "tracked" })).jsonBody;
  assert.deepEqual(d, [{ id: "IB1", data: { stage: "submitted", tender: { notifyNo: "IB1" } } }]);
  assert.deepEqual((await get(h, { kind: "stamps", coll: "tracked" })).jsonBody.map((x) => Object.keys(x).sort()), [["id", "updated_at"]]);
});

test("Lỗi đọc Supabase → 502 kèm 'read <mã>'", async () => {
  db.failDocsRead = true;
  const r = await get(await fresh("requests.js"), { kind: "docs", coll: "analysis" });
  assert.equal(r.statusCode, 502);
  assert.equal(r.jsonBody.error, "read 500");
});

// ---------- kind=all ----------
const T = (s) => `2026-11-${s}:00.000Z`;
function seedReqs() {
  reqDoc("hsmtreq", "OLD", { notifyNo: "IB-OLD", requestedAt: "2020-01-01T00:00:00.000Z", sourceUrl: "https://x", bidName: "Gói cũ", extra: "bỏ" });
  reqDoc("hsmtreq", "NEW", { requestedAt: T("12T08:00") });
  reqDoc("hsmtreq", "DONE", { requestedAt: T("12T07:00"), doneAt: T("12T07:30") });
  reqDoc("hsmtreq", "EQ", { requestedAt: T("12T07:00"), doneAt: T("12T07:00") });
  reqDoc("hsmtreq", "AGAIN", { requestedAt: T("12T09:00"), doneAt: T("12T08:00") });
  reqDoc("analysisreq", "A1", { notifyNo: "IB-A1", requestedAt: T("11T01:00") });
  reqDoc("configreq", "C1", { requestedAt: T("11T02:00"), origin: "g7", extra: "yêu cầu khác" });
  reqDoc("specreq", "S1", { requestedAt: T("11T03:00"), spec: true });
}

test("kind=all KHÔNG lọc theo thời gian: yêu cầu từ 2020 chưa xong vẫn trả về; xong (doneAt ≥ requestedAt) thì không", async () => {
  seedReqs();
  const r = await get(await fresh("requests.js"), { kind: "all" });
  assert.deepEqual(Object.keys(r.jsonBody).sort(), ["analysis", "bidprice", "compare", "config", "files", "find", "hsdt", "spec", "supplier", "sync", "tlkt", "translation"]);
  const keys = r.jsonBody.files.map((f) => f.key);
  assert.deepEqual(keys, ["OLD", "NEW", "AGAIN"], "sắp theo requestedAt tăng dần");
  assert.ok(!keys.includes("DONE") && !keys.includes("EQ"));
});

test("kind=all: dạng từng loại yêu cầu (files chỉ giữ trường bot cần; loại khác giữ cả data + key + notifyNo)", async () => {
  seedReqs();
  const r = (await get(await fresh("requests.js"), { kind: "all" })).jsonBody;
  assert.deepEqual(r.files.find((f) => f.key === "OLD"), { notifyNo: "IB-OLD", key: "OLD", sourceUrl: "https://x", bidName: "Gói cũ", requestedAt: "2020-01-01T00:00:00.000Z" });
  assert.equal(r.files.find((f) => f.key === "NEW").notifyNo, "NEW", "thiếu notifyNo thì lấy id");
  assert.deepEqual(r.analysis, [{ key: "A1", notifyNo: "IB-A1", requestedAt: T("11T01:00") }]);
  assert.deepEqual(r.config, [{ requestedAt: T("11T02:00"), origin: "g7", extra: "yêu cầu khác", key: "C1", notifyNo: "C1" }]);
  assert.deepEqual(r.spec.map((x) => x.key), ["S1"]);
  assert.deepEqual(r.find, []);
});

test("kind=all: sync — không có dòng syncreq thì pending=false; có yêu cầu mới hơn doneAt thì pending + mode", async () => {
  const h = await fresh("requests.js");
  assert.deepEqual((await get(h, { kind: "all" })).jsonBody.sync, { pending: false, requestedAt: null, mode: "" });
  reqDoc("syncreq", "current", { requestedAt: T("12T10:00"), doneAt: T("12T09:00"), mode: "new" });
  assert.deepEqual((await get(h, { kind: "all" })).jsonBody.sync, { pending: true, requestedAt: T("12T10:00"), mode: "new" });
  reqDoc("syncreq", "current", { requestedAt: T("12T10:00"), doneAt: T("12T10:00") });
  assert.equal((await get(h, { kind: "all" })).jsonBody.sync.pending, false);
});

test("beat=0: KHÔNG ghi botstatus; thiếu beat (bot cũ) thì ghi mỗi lượt, running theo ?running=1", async () => {
  const h = await fresh("requests.js");
  await get(h, { kind: "all", beat: "0" });
  assert.equal(sbDocsWrites(db).length, 0);
  assert.equal(db.get("botstatus", "current"), undefined);
  await get(h, { kind: "all" });
  assert.equal(sbDocsWrites(db).length, 1);
  assert.equal(db.get("botstatus", "current").data.running, false);
  await get(h, { kind: "all", running: "1" });
  assert.equal(db.get("botstatus", "current").data.running, true);
  await get(h, { kind: "all", beat: "1" });
  assert.equal(sbDocsWrites(db).length, 3, "chỉ beat=0 mới bỏ ghi");
});

test("Nhịp tim ghi botstatus/current với updated_at = lastPollAt (mọi chỗ ghi docs đều đổi updated_at)", async () => {
  mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-11-13T05:00:00Z") });
  await get(await fresh("requests.js"), { kind: "all" });
  const d = db.get("botstatus", "current");
  assert.equal(d.updated_at, "2026-11-13T05:00:00.000Z");
  assert.equal(d.data.lastPollAt, d.updated_at);
});

test("Ghi nhịp tim lỗi mạng không làm hỏng lượt hỏi của bot", async () => {
  seedReqs();
  const h = await fresh("requests.js");
  db.override = (req) => (req.method === "POST" ? Promise.reject(new Error("net")) : null);
  const r = await get(h, { kind: "all" });
  assert.equal(r.statusCode, 200);
  assert.equal(r.jsonBody.files.length, 3);
});

// ---------- view pending_requests ----------
test("Đọc view pending_requests: một cuộc gọi lấy ngày, không liệt kê mọi dòng yêu cầu; kết quả giống nhau", async () => {
  seedReqs();
  const h = await fresh("requests.js");
  const r = await get(h, { kind: "all", beat: "0" });
  assert.equal(viewCalls().length, 1);
  assert.equal(db.where((c) => c.search.includes("data-%3E%3E") || c.search.includes("data->>")).length, 0, "không gọi marksOf");
  assert.deepEqual(r.jsonBody.files.map((f) => f.key), ["OLD", "NEW", "AGAIN"]);
  // Chỉ đọc nguyên dòng của các yêu cầu đang chờ (không đọc hàng đã xong)
  const whole = db.where((c) => c.path === "/rest/v1/docs" && c.search.includes("select=id%2Cdata") || c.search.includes("select=id,data"));
  assert.ok(whole.length > 0);
  assert.ok(!whole.some((c) => decodeURIComponent(c.search).includes('"DONE"')));
});

test("View chưa tạo (404) → tự lùi về liệt kê mọi dòng, kết quả vẫn đúng; 10 phút sau mới thử view lại", async () => {
  seedReqs();
  db.pendingView = 404;
  const h = await fresh("requests.js");
  mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-11-13T05:00:00Z") });
  const a = await get(h, { kind: "all", beat: "0" });
  assert.deepEqual(a.jsonBody.files.map((f) => f.key), ["OLD", "NEW", "AGAIN"]);
  assert.equal(viewCalls().length, 1);
  assert.ok(db.where((c) => c.search.includes("data->>") || c.search.includes("data-%3E")).length >= 1, "đã lùi về marksOf");
  await get(h, { kind: "all", beat: "0" });
  assert.equal(viewCalls().length, 1, "trong 10 phút không thử lại view (một poll = một cuộc gọi)");
  mock.timers.tick(10 * 60e3 - 1);
  await get(h, { kind: "all", beat: "0" });
  assert.equal(viewCalls().length, 1, "còn 1 ms");
  mock.timers.tick(1);
  db.pendingView = "auto";
  await get(h, { kind: "all", beat: "0" });
  assert.equal(viewCalls().length, 2, "đủ 10 phút thì thử lại");
});

for (const [name, mode] of [["lỗi 500", 500], ["không có quyền 401", 401], ["trả không phải danh sách", "garbage"], ["dòng sai dạng", "badrow"], ["lỗi mạng", "throw"]]) {
  test(`View ${name} không được làm dừng bot: lùi về liệt kê mọi dòng`, async () => {
    seedReqs();
    db.pendingView = mode;
    const r = await get(await fresh("requests.js"), { kind: "all", beat: "0" });
    assert.equal(r.statusCode, 200);
    assert.deepEqual(r.jsonBody.files.map((f) => f.key), ["OLD", "NEW", "AGAIN"]);
    assert.equal(r.jsonBody.analysis.length, 1);
  });
}

test("Lùi về marksOf phân trang 1000 dòng (2100 yêu cầu đã xong + 1 chờ vẫn thấy)", async () => {
  db.pendingView = 404;
  for (let i = 0; i < 2100; i++) reqDoc("hsmtreq", "D" + String(i).padStart(5, "0"), { requestedAt: "2026-01-01", doneAt: "2026-01-02" });
  reqDoc("hsmtreq", "Z-PENDING", { requestedAt: "2026-11-01" });
  const r = await get(await fresh("requests.js"), { kind: "all", beat: "0" });
  assert.deepEqual(r.jsonBody.files.map((f) => f.key), ["Z-PENDING"]);
});

test("Đọc nguyên dòng yêu cầu chờ theo lô 50: 120 yêu cầu chờ → 3 lần đọc, trả đủ", async () => {
  for (let i = 0; i < 120; i++) reqDoc("hsmtreq", "P" + String(i).padStart(3, "0"), { requestedAt: `2026-11-01T00:${String(i % 60).padStart(2, "0")}:00Z` });
  const r = await get(await fresh("requests.js"), { kind: "all", beat: "0" });
  assert.equal(r.jsonBody.files.length, 120);
  const wholeReads = db.where((c) => c.path === "/rest/v1/docs" && decodeURIComponent(c.search).includes("select=id,data") && c.search.includes("hsmtreq"));
  assert.equal(wholeReads.length, 3);
});

test("Yêu cầu vừa xong giữa hai lần đọc (view nói chờ, dòng nguyên đã doneAt) thì không giao lại", async () => {
  reqDoc("hsmtreq", "X", { requestedAt: "2026-11-01T00:00:00Z" });
  const h = await fresh("requests.js");
  db.override = (req) => {
    if (req.u.pathname === "/rest/v1/docs" && decodeURIComponent(req.u.search).includes("select=id,data")) {
      return new Response(JSON.stringify([{ id: "X", data: { requestedAt: "2026-11-01T00:00:00Z", doneAt: "2026-11-01T00:00:05Z" } }]), { status: 200 });
    }
  };
  assert.deepEqual((await get(h, { kind: "all", beat: "0" })).jsonBody.files, []);
});

test("Lỗi đọc nguyên dòng yêu cầu → 502", async () => {
  reqDoc("hsmtreq", "X", { requestedAt: "2026-11-01T00:00:00Z" });
  const h = await fresh("requests.js");
  db.override = (req) => (req.u.pathname === "/rest/v1/docs" && decodeURIComponent(req.u.search).includes("select=id,data") ? new Response("x", { status: 500 }) : null);
  const r = await get(h, { kind: "all", beat: "0" });
  assert.equal(r.statusCode, 502);
  assert.equal(r.jsonBody.error, "read 500");
});

// ---------- các kind lẻ ----------
test("kind lẻ: analysis / translation / compare / hsdt / tlkt / supplier / config / find / spec / bidprice / sync, mặc định = files", async () => {
  const byKind = { analysis: "analysisreq", translation: "translationreq", compare: "comparereq", hsdt: "hsdtreq", tlkt: "tlktreq", supplier: "supplierreq", config: "configreq", find: "findreq", spec: "specreq", bidprice: "bidpricereq" };
  const h = await fresh("requests.js");
  for (const [kind, coll] of Object.entries(byKind)) {
    reqDoc(coll, "K1", { requestedAt: "2026-11-01T00:00:00Z", extra: kind });
    reqDoc(coll, "K2", { requestedAt: "2026-11-01T00:00:00Z", doneAt: "2026-11-02T00:00:00Z" });
    const r = await get(h, { kind });
    assert.equal(r.jsonBody.length, 1, kind);
    assert.equal(r.jsonBody[0].key, "K1", kind);
  }
  reqDoc("hsmtreq", "F1", { requestedAt: "2026-11-01T00:00:00Z" });
  assert.deepEqual((await get(h, {})).jsonBody.map((x) => x.key), ["F1"]);
  assert.equal((await get(h, { kind: "sync" })).jsonBody.pending, false);
  reqDoc("syncreq", "current", { requestedAt: "2026-11-01T00:00:00Z" });
  assert.equal((await get(h, { kind: "sync" })).jsonBody.pending, true);
});

test("Lỗi Supabase ở kind lẻ → 502 { error }", async () => {
  db.failDocsRead = true;
  const r = await get(await fresh("requests.js"), { kind: "config" });
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /read 500/);
});

test("SB_URL được dùng đúng gốc (không chạm host khác)", async () => {
  seedReqs();
  await get(await fresh("requests.js"), { kind: "all", beat: "0" });
  assert.ok(db.calls.every((c) => c.url.startsWith(SB + "/")));
  assert.ok(db.calls.every((c) => c.headers.apikey === "service-role-key-for-tests" || c.headers.Authorization?.includes("service-role-key-for-tests")));
});
