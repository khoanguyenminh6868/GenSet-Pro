import { INGEST, makeDb, installFetch, fresh, mkReq, call, sbDocsWrites, idxOf } from "./harness.mjs";
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// ingest.js: ghi từ bot Windows. Nạp một lần để lấy cả hàm authorized đã xuất.
const mod = await import("../ingest.js");
const authorized = mod.authorized;

let db, undo, h;
// 12:00 giờ Việt Nam ngày 13/11/2026
const NOW_MS = Date.parse("2026-11-13T05:00:00Z"), NOW = new Date(NOW_MS).toISOString();
beforeEach(async () => {
  db = makeDb(); undo = installFetch(db); mock.method(console, "error", () => {});
  mock.timers.enable({ apis: ["Date"], now: NOW_MS });
  h = await fresh("ingest.js");
});
afterEach(() => { undo(); mock.restoreAll(); mock.timers.reset(); });

const post = (rows, token = INGEST) => call(h, mkReq({ method: "POST", body: { rows }, token }));
const row = (coll, id, data = {}) => ({ coll, id, data });
const written = () => sbDocsWrites(db).flatMap((c) => c.body);

test("authorized: token đúng độ dài và nội dung; ngắn hơn 32 ký tự, lệch độ dài, sai nội dung đều bị từ chối", () => {
  const ok = (t) => authorized({ headers: { authorization: t } });
  assert.equal(ok("Bearer " + INGEST), true);
  assert.equal(ok("bearer " + INGEST), true, "Bearer không phân biệt hoa thường");
  assert.equal(ok(INGEST), true, "không có tiền tố Bearer vẫn so token trần (khoá hành vi)");
  assert.equal(ok("Bearer " + INGEST.replace(/.$/, "x")), false, "cùng độ dài, khác nội dung");
  assert.equal(ok("Bearer " + INGEST + "x"), false);
  assert.equal(ok("Bearer " + INGEST.slice(0, -1)), false);
  assert.equal(ok(""), false);
  assert.equal(authorized({ headers: {} }), false);
  const saved = process.env.INGEST_TOKEN;
  try {
    process.env.INGEST_TOKEN = "short-token"; // < 32 ký tự: coi như chưa cấu hình, ngay cả khi trùng khớp
    assert.equal(ok("Bearer short-token"), false);
    delete process.env.INGEST_TOKEN;
    assert.equal(ok("Bearer "), false, "chưa cấu hình token thì không ai qua được (kể cả token rỗng)");
  } finally { process.env.INGEST_TOKEN = saved; }
});

test("Chỉ POST; thiếu hoặc sai token 401 và không đụng Supabase", async () => {
  assert.equal((await call(h, mkReq({ method: "GET", token: INGEST }))).statusCode, 405);
  assert.equal((await call(h, mkReq({ method: "POST", body: { rows: [row("feed", "current")] } }))).statusCode, 401);
  assert.equal((await post([row("feed", "current")], "sai")).statusCode, 401);
  assert.equal(db.calls.length, 0);
});

test("Kiểm tra lô: không phải mảng, rỗng, >200 → 400; đúng 200 là biên còn được", async () => {
  for (const rows of [null, [], "x", { 0: 1 }]) assert.equal((await post(rows)).statusCode, 400);
  assert.equal((await post(Array.from({ length: 201 }, (_, i) => row("hsmt", "K" + i)))).statusCode, 400);
  assert.equal((await post(Array.from({ length: 200 }, (_, i) => row("hsmt", "K" + i)))).statusCode, 200);
});

test("Dòng sai: bộ sưu tập ngoài danh sách (botstatus, tracked, quote, members), mã sai, data không phải object → 400, không ghi dòng nào", async () => {
  const bad = [row("botstatus", "current"), row("tracked", "A"), row("quote", "A"), row("hsmt", "a b"), row("hsmt", ""), row("hsmt", "a/b"),
    { coll: "hsmt", id: "A" }, { coll: "hsmt", id: "A", data: "chuỗi" }, null, row("feed", "other"), row("syncreq", "x"), row("synclog", "x")];
  for (const r of bad) {
    const res = await post([row("hsmt", "OK"), r]);
    assert.equal(res.statusCode, 400, JSON.stringify(r));
  }
  assert.equal(sbDocsWrites(db).length, 0, "một dòng sai làm hỏng cả lô, không ghi gì");
});

test("Bộ sưu tập bot được ghi: toàn bộ danh sách trong chú thích (analysis, bidhist, bcdg, specmatch, gaps…)", async () => {
  for (const coll of ["analysis", "translation", "compare", "notice", "analysisreq", "hsmtreq", "hsmt", "hsmttext", "bidders", "portalids", "translationreq", "comparereq", "hsdtreq", "hsdt", "tlktreq", "tlkt", "supplier", "supplierreq", "suppliermatch", "configreq", "configmatch", "findreq", "findmatch", "bidhist", "bidpricereq", "bidprice", "specreq", "specmatch", "gaps", "bcdg"]) {
    const r = await post([row(coll, "K1", coll === "analysis" ? { status: "done" } : {})]);
    assert.equal(r.statusCode, 200, coll);
  }
});

// ---------- updated_at ----------
test("Mọi dòng ghi đều có updated_at = giờ máy chủ, bỏ qua giờ bot gửi kèm", async () => {
  const r = await post([{ coll: "hsmt", id: "K1", data: { files: [] }, updated_at: "1999-01-01T00:00:00Z" }, row("hsmt", "K2", { updated_at: "1999" })]);
  assert.deepEqual(r.jsonBody, { written: 2, skipped: 0 });
  assert.deepEqual(written().map((x) => [x.id, x.updated_at]), [["K1", NOW], ["K2", NOW]]);
  assert.equal(sbDocsWrites(db)[0].headers.Prefer, "resolution=merge-duplicates,return=minimal");
});

test("Ghi lại đúng nội dung cũ ở lúc khác vẫn đổi updated_at (doc-cache của bot, IndexedDB web đọc theo nó)", async () => {
  await post([row("hsmt", "K1", { files: ["a"] })]);
  const t1 = db.get("hsmt", "K1").updated_at;
  mock.timers.tick(5000);
  await post([row("hsmt", "K1", { files: ["a"] })]);
  assert.notEqual(db.get("hsmt", "K1").updated_at, t1);
});

// ---------- không ghi đè bản mới ----------
test("Sync: 'xong' của bot không đè một Sync mới bấm sau khi bot đọc yêu cầu", async () => {
  db.put("syncreq", "current", { requestedAt: "2026-11-13T04:00:00.000Z" });
  const r = await post([row("syncreq", "current", { requestedAt: "2026-11-13T03:00:00.000Z", doneAt: "2026-11-13T03:05:00.000Z" })]);
  assert.deepEqual(r.jsonBody, { written: 0, skipped: 1 });
  assert.equal(db.get("syncreq", "current").data.doneAt, undefined);
  assert.equal(sbDocsWrites(db).length, 0, "không có dòng nào cần ghi thì không POST");
});

test("Sync: cùng requestedAt hoặc chưa có dòng cũ thì ghi (biên: bằng nhau không phải 'mới hơn')", async () => {
  const same = "2026-11-13T04:00:00.000Z";
  db.put("syncreq", "current", { requestedAt: same });
  assert.equal((await post([row("syncreq", "current", { requestedAt: same, doneAt: NOW })])).jsonBody.written, 1);
  assert.equal(db.get("syncreq", "current").data.doneAt, NOW);
  db.docs.clear();
  assert.equal((await post([row("syncreq", "current", { requestedAt: same, doneAt: NOW })])).jsonBody.written, 1);
});

test("Yêu cầu Phân tích / Lấy lại tệp bấm lại lúc bot bận: bản 'xong/lỗi' cũ của bot bị bỏ; yêu cầu khác trong lô vẫn ghi", async () => {
  db.put("hsmtreq", "A", { requestedAt: "2026-11-13T04:00:00.000Z" });
  db.put("analysisreq", "B", { requestedAt: "2026-11-13T01:00:00.000Z" });
  const r = await post([
    row("hsmtreq", "A", { requestedAt: "2026-11-13T03:00:00.000Z", error: "hết hạn" }),
    row("analysisreq", "B", { requestedAt: "2026-11-13T01:00:00.000Z", doneAt: "2026-11-13T02:00:00.000Z" }),
    row("hsmt", "A", { files: [] }),
  ]);
  assert.deepEqual(r.jsonBody, { written: 2, skipped: 1 });
  assert.equal(db.get("hsmtreq", "A").data.error, undefined, "hsmtreq/A giữ yêu cầu mới");
  assert.equal(db.get("analysisreq", "B").data.doneAt, "2026-11-13T02:00:00.000Z");
  assert.ok(db.get("hsmt", "A"));
});

test("Mọi loại yêu cầu đều được bảo vệ khỏi bản cũ ghi đè", async () => {
  for (const coll of ["analysisreq", "hsmtreq", "translationreq", "comparereq", "hsdtreq", "tlktreq", "supplierreq", "configreq", "findreq", "bidpricereq", "specreq"]) {
    db.put(coll, "A", { requestedAt: "2026-11-13T04:00:00.000Z" });
    const r = await post([row(coll, "A", { requestedAt: "2026-11-13T03:00:00.000Z", doneAt: "x" })]);
    assert.equal(r.jsonBody.skipped, 1, coll);
  }
});

test("Lỗi đọc khi kiểm yêu cầu mới hơn → 502 và không ghi gì", async () => {
  db.failDocsRead = true;
  const r = await post([row("hsmtreq", "A", { requestedAt: "x" })]);
  assert.equal(r.statusCode, 502);
  assert.equal(r.jsonBody.error, "read 500");
  assert.equal(sbDocsWrites(db).length, 0);
});

// ---------- analysis ----------
test("Chỉ phân tích đã xong mới lên web; bản lỗi/đang chạy bị bỏ", async () => {
  const r = await post([row("analysis", "A", { status: "error" }), row("analysis", "B", { status: "running" }), row("analysis", "C", {}), row("analysis", "D", { status: "done", analyzedAt: "2026-11-13" })]);
  assert.deepEqual(r.jsonBody, { written: 1, skipped: 3 });
  assert.deepEqual(db.of("analysis").map((d) => d.id), ["D"]);
});

test("Không đè phân tích đã xong mới hơn trên web; cũ hơn hoặc chưa xong thì ghi (biên: analyzedAt bằng nhau thì giữ bản web)", async () => {
  db.put("analysis", "NEWER", { status: "done", analyzedAt: "2026-11-10", v: "web" });
  db.put("analysis", "EQUAL", { status: "done", analyzedAt: "2026-11-10", v: "web" });
  db.put("analysis", "OLDER", { status: "done", analyzedAt: "2026-11-01", v: "web" });
  db.put("analysis", "ERR", { status: "error", analyzedAt: "2026-11-12", v: "web" });
  const bot = (id, at) => row("analysis", id, { status: "done", analyzedAt: at, v: "bot" });
  const r = await post([bot("NEWER", "2026-11-05"), bot("EQUAL", "2026-11-10"), bot("OLDER", "2026-11-10"), bot("ERR", "2026-11-01"), bot("FRESH", "2026-11-10")]);
  assert.equal(r.jsonBody.written, 3);
  assert.equal(db.get("analysis", "NEWER").data.v, "web");
  assert.equal(db.get("analysis", "EQUAL").data.v, "web");
  for (const id of ["OLDER", "ERR", "FRESH"]) assert.equal(db.get("analysis", id).data.v, "bot", id);
});

test("Ghi thất bại → 502 kèm mã và đoạn lỗi", async () => {
  db.failDocsWrite = true;
  const r = await post([row("hsmt", "A")]);
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /^write 500: write boom/);
});

// ---------- dọn activity_log ----------
const log = (coll, at) => db.activity.push({ id: db.activity.length + 1, coll, at });
const logCalls = () => db.where((c) => c.path === "/rest/v1/activity_log");

test("Sync đầu tiên trong ngày (giờ VN) dọn nhật ký cũ hơn một ngày, trước khi ghi synclog của chính nó", async () => {
  log("hsmt", "2026-11-11T00:00:00.000Z"); // 2 ngày trước
  log("hsmt", "2026-11-12T04:00:00.000Z"); // 04:00Z < mốc 05:00Z (24 giờ trước): bị dọn
  log("hsmt", "2026-11-12T06:00:00.000Z"); // trong vòng 24 giờ: giữ
  log("synclog", "2026-11-12T10:00:00.000Z"); // Sync hôm qua theo giờ VN
  const r = await post([row("synclog", "current", { ok: true })]);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(db.activity.filter((x) => x.coll === "hsmt").map((x) => x.at), ["2026-11-12T06:00:00.000Z"]);
  const del = logCalls().find((c) => c.method === "DELETE");
  assert.ok(del, "đã xoá");
  assert.ok(decodeURIComponent(del.search).includes("at=lt.2026-11-12T05:00:00.000Z"), "mốc = 24 giờ trước");
  assert.ok(idxOf(db, (c) => c.method === "DELETE") < idxOf(db, (c) => c.method === "POST" && c.path === "/rest/v1/docs"), "dọn trước khi ghi");
});

test("Đã có synclog hôm nay (VN) thì không dọn nữa; Sync thứ hai trong ngày không xoá gì", async () => {
  log("hsmt", "2026-11-01T00:00:00.000Z");
  await post([row("synclog", "current", {})]); // lần đầu: dọn, rồi bộ kích hoạt ghi nhật ký synclog
  assert.equal(db.activity.filter((x) => x.coll === "hsmt").length, 0);
  log("hsmt", "2026-11-05T00:00:00.000Z"); // cũ, nhưng chưa tới lượt dọn
  mock.timers.tick(3600e3);
  await post([row("synclog", "current", {})]);
  assert.equal(db.activity.filter((x) => x.coll === "hsmt").length, 1, "lần hai trong ngày không dọn");
  assert.equal(logCalls().filter((c) => c.method === "DELETE").length, 1);
});

test("Ranh giới ngày theo giờ Việt Nam (UTC+7), không theo UTC", async () => {
  // 01:30 VN ngày 14/11 = 18:30Z ngày 13/11; đầu ngày VN = 17:00Z ngày 13/11
  mock.timers.reset();
  mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-11-13T18:30:00Z") });
  log("old", "2026-11-01T00:00:00.000Z");
  log("synclog", "2026-11-13T16:50:00.000Z"); // 23:50 VN ngày 13: ngày hôm trước → vẫn dọn
  await post([row("synclog", "current", {})]);
  assert.equal(db.activity.filter((x) => x.coll === "old").length, 0);
  db.activity = []; db.calls.length = 0;
  log("old", "2026-11-01T00:00:00.000Z");
  log("synclog", "2026-11-13T17:10:00.000Z"); // 00:10 VN ngày 14: hôm nay → không dọn (dù UTC vẫn là 13/11)
  await post([row("synclog", "current", {})]);
  assert.equal(db.activity.filter((x) => x.coll === "old").length, 1);
});

test("Không có synclog trong lô thì không đụng activity_log", async () => {
  await post([row("hsmt", "A"), row("feed", "current")]);
  assert.equal(logCalls().length, 0);
});

test("Dọn nhật ký lỗi không làm mất dữ liệu bot gửi (vẫn ghi, báo lỗi ra console)", async () => {
  db.failActivityRead = true;
  const r = await post([row("synclog", "current", { n: 1 }), row("hsmt", "A")]);
  assert.equal(r.statusCode, 200);
  assert.equal(r.jsonBody.written, 2);
  assert.ok(db.get("synclog", "current"));
});

// ---------- đánh dấu đã nộp / trúng ----------
const OUR = { taxCode: "4101-623-015", bidPrice: 900, priceAfterDiscount: 850 };
test("Công ty Thảo Nguyên (MST 4101623015) có trong danh sách nhà thầu → gói Mới chuyển sang Đã nộp, lấy giá sau giảm, đủ dữ liệu gói từ seen", async () => {
  db.put("seen", "IB1", { notifyNo: "IB1", name: "Gói 1" });
  db.put("tracked", "IB1", { stage: "new", note: "ghi chú của Khoa" });
  const r = await post([row("bidders", "IB1", { list: [{ taxCode: "0100000000", bidPrice: 1 }, OUR] })]);
  assert.deepEqual(r.jsonBody.joined, ["IB1"]);
  const d = db.get("tracked", "IB1");
  assert.equal(d.data.stage, "submitted");
  assert.equal(d.data.prevStage, "new");
  assert.equal(d.data.bidPrice, 850);
  assert.equal(d.data.bidPriceSrc, "biên bản mở thầu");
  assert.equal(d.data.note, "ghi chú của Khoa");
  assert.deepEqual(d.data.tender, { notifyNo: "IB1", name: "Gói 1" });
  assert.equal(d.updated_at, NOW);
});

test("Giá đã nhập tay không bị ghi đè; thiếu giá sau giảm thì lấy bidPrice; không có giá thì không đặt", async () => {
  db.put("seen", "A", { notifyNo: "A" }).put("seen", "B", { notifyNo: "B" }).put("seen", "C", { notifyNo: "C" });
  db.put("tracked", "A", { stage: "reviewing", bidPrice: 777 });
  db.put("tracked", "B", { stage: "reviewing" });
  await post([row("bidders", "A", { list: [OUR] }), row("bidders", "B", { list: [{ taxCode: "4101623015", bidPrice: 900 }] }), row("bidders", "C", { list: [{ taxCode: "4101623015" }] })]);
  assert.equal(db.get("tracked", "A").data.bidPrice, 777);
  assert.equal(db.get("tracked", "B").data.bidPrice, 900);
  assert.ok(!("bidPrice" in db.get("tracked", "C").data));
});

test("Đã có kết quả (final): trúng nếu công ty có won, ngược lại không trúng; nguồn giá KQLCNT", async () => {
  for (const id of ["W", "L"]) db.put("seen", id, { notifyNo: id }).put("tracked", id, { stage: "submitted" });
  await post([
    row("bidders", "W", { final: true, list: [{ taxCode: "4101623015", won: true, bidPrice: 5 }, { taxCode: "9", won: false }] }),
    row("bidders", "L", { final: true, list: [{ taxCode: "4101623015", won: false, bidPrice: 5 }, { taxCode: "9", won: true }] }),
  ]);
  assert.equal(db.get("tracked", "W").data.stage, "won");
  assert.ok(db.get("tracked", "W").data.wonAt, "wonAt để web báo trúng thầu");
  assert.equal(db.get("tracked", "L").data.stage, "lost");
  assert.ok(!("wonAt" in db.get("tracked", "L").data));
  assert.equal(db.get("tracked", "L").data.bidPriceSrc, "KQLCNT");
});

test("Giai đoạn do người dùng đặt được giữ nguyên: Bỏ qua (dropped), đã trúng/không trúng; Đã nộp chưa có kết quả không đổi", async () => {
  for (const [id, stage] of [["D", "dropped"], ["WON", "won"], ["LOST", "lost"], ["SUB", "submitted"]]) db.put("seen", id, { notifyNo: id }).put("tracked", id, { stage });
  await post([row("bidders", "D", { list: [OUR] }), row("bidders", "WON", { final: true, list: [OUR] }), row("bidders", "LOST", { final: true, list: [{ ...OUR, won: true }] }), row("bidders", "SUB", { list: [OUR] })]);
  assert.equal(db.get("tracked", "D").data.stage, "dropped");
  assert.equal(db.get("tracked", "WON").data.stage, "won");
  assert.equal(db.get("tracked", "LOST").data.stage, "lost");
  assert.equal(db.get("tracked", "SUB").data.stage, "submitted");
  assert.equal(db.get("tracked", "SUB").updated_at, "2026-01-01T00:00:00.000Z", "không đổi thì không ghi lại");
});

test("Đã nộp + có kết quả → chuyển sang trúng/không trúng (Khoa 27/10)", async () => {
  db.put("seen", "S", { notifyNo: "S" }).put("tracked", "S", { stage: "submitted", bidPrice: 1 });
  await post([row("bidders", "S", { final: true, list: [OUR] })]);
  assert.equal(db.get("tracked", "S").data.stage, "lost");
});

test("Không có tên công ty trong danh sách, hoặc không tìm thấy dữ liệu gói → không tạo tracked", async () => {
  db.put("seen", "A", { notifyNo: "A" });
  const r = await post([row("bidders", "A", { list: [{ taxCode: "0100000000" }, { taxCode: "41016230150" }] }), row("bidders", "NOSEEN", { list: [OUR] }), row("bidders", "EMPTY", {})]);
  assert.equal(r.jsonBody.joined, undefined);
  assert.equal(db.of("tracked").length, 0);
});

test("Dữ liệu gói lấy theo thứ tự tracked.tender → seen → manual → feed/current", async () => {
  db.put("manual", "M", { notifyNo: "M", from: "manual" });
  db.put("feed", "current", { tenders: [{ notifyNo: "F", from: "feed" }] });
  const r = await post([row("bidders", "M", { list: [OUR] }), row("bidders", "F", { list: [OUR] })]);
  assert.deepEqual(r.jsonBody.joined.sort(), ["F", "M"]);
  assert.equal(db.get("tracked", "M").data.tender.from, "manual");
  assert.equal(db.get("tracked", "F").data.tender.from, "feed");
});

// ---------- gói được sửa đổi sau khi Bỏ qua ----------
test("Gói Bỏ qua mà TBMT được sửa (notifyVersion cao hơn) thì quay về Mới, giữ ghi chú", async () => {
  db.put("tracked", "A", { stage: "dropped", prevStage: "reviewing", note: "giữ", tender: { notifyNo: "A", notifyVersion: 1 } });
  const r = await post([row("feed", "current", { tenders: [{ notifyNo: "A", notifyVersion: 2, closeAt: "mới" }] })]);
  assert.deepEqual(r.jsonBody.reopened, ["A"]);
  const d = db.get("tracked", "A");
  assert.equal(d.data.stage, "new");
  assert.equal(d.data.prevStage, "dropped");
  assert.equal(d.data.note, "giữ");
  assert.equal(d.data.tender.closeAt, "mới");
  assert.equal(d.data.reopenedVersion, 2);
  assert.equal(d.updated_at, NOW);
});

test("Không mở lại: bản bằng/thấp hơn, Bỏ qua từ Đã nộp, giai đoạn khác Bỏ qua, hoặc gói chưa theo dõi", async () => {
  db.put("tracked", "SAME", { stage: "dropped", tender: { notifyVersion: 2 } });
  db.put("tracked", "FROMSUB", { stage: "dropped", prevStage: "submitted", tender: { notifyVersion: 1 } });
  db.put("tracked", "ACTIVE", { stage: "reviewing", tender: { notifyVersion: 1 } });
  const r = await post([row("feed", "current", { tenders: ["SAME", "FROMSUB", "ACTIVE", "NONE"].map((id) => ({ notifyNo: id, notifyVersion: id === "SAME" ? 2 : 5 })) })]);
  assert.equal(r.jsonBody.reopened, undefined);
  assert.equal(db.get("tracked", "SAME").data.stage, "dropped");
  assert.equal(db.get("tracked", "FROMSUB").data.stage, "dropped");
  assert.equal(db.get("tracked", "ACTIVE").data.stage, "reviewing");
  assert.equal(db.get("tracked", "NONE"), undefined);
});

test("TBMT bị huỷ không phải bản sửa đổi: không về Mới, nhưng trạng thái huỷ được ghi vào tracked và seen", async () => {
  db.put("tracked", "A", { stage: "dropped", tender: { notifyNo: "A", notifyVersion: 1, status: "open" } });
  db.put("tracked", "B", { stage: "reviewing", tender: { notifyNo: "B", status: "open" } });
  db.put("seen", "A", { notifyNo: "A", status: "open" });
  const r = await post([row("feed", "current", { tenders: [{ notifyNo: "A", notifyVersion: 3, status: "cancelled" }, { notifyNo: "B", status: "cancelled" }] })]);
  assert.equal(r.jsonBody.reopened, undefined, "huỷ không được báo là mở lại");
  assert.equal(db.get("tracked", "A").data.stage, "dropped");
  assert.equal(db.get("tracked", "A").data.tender.status, "cancelled");
  assert.equal(db.get("tracked", "B").data.tender.status, "cancelled");
  assert.equal(db.get("seen", "A").data.status, "cancelled");
  assert.equal(db.get("tracked", "A").updated_at, NOW);
});

test("TBMT huỷ đã ghi nhận rồi thì không ghi lại", async () => {
  db.put("tracked", "A", { stage: "reviewing", tender: { status: "cancelled" } });
  await post([row("feed", "current", { tenders: [{ notifyNo: "A", status: "cancelled" }] })]);
  assert.equal(db.get("tracked", "A").updated_at, "2026-01-01T00:00:00.000Z");
});

// ---------- dọn thư mục tạm ----------
const putFile = (p) => db.files.set("scratch/" + p, { data: Buffer.from("x") });
const scratch = () => [...db.files.keys()].filter((k) => k.startsWith("scratch/")).map((k) => k.slice(8)).sort();

test("Đối chiếu xong (doneAt): xoá tệp HSDT đã tải lên thư mục tạm hsdt/<mã>/; gói khác không bị ảnh hưởng", async () => {
  putFile("hsdt/K1/1700/a.pdf"); putFile("hsdt/K1/1701/b.pdf"); putFile("hsdt/K2/1700/c.pdf");
  await post([row("comparereq", "K1", { requestedAt: "2026-11-13T01:00:00.000Z", doneAt: "2026-11-13T02:00:00.000Z" })]);
  assert.deepEqual(scratch(), ["hsdt/K2/1700/c.pdf"]);
});

test("Yêu cầu chưa xong (không doneAt) thì giữ tệp tạm", async () => {
  putFile("hsdt/K1/1700/a.pdf");
  await post([row("comparereq", "K1", { requestedAt: "2026-11-13T01:00:00.000Z" })]);
  assert.deepEqual(scratch(), ["hsdt/K1/1700/a.pdf"]);
  assert.equal(db.where((c) => c.path.includes("/object/list/")).length, 0);
});

test("Đối chiếu và Tạo HSDT tham khảo dùng chung hsdt/<mã>/: tệp của yêu cầu kia còn chờ thì giữ lại (Khoa 05/11)", async () => {
  putFile("hsdt/K1/1/files-compare.pdf"); putFile("hsdt/K1/2/template.docx"); putFile("hsdt/K1/3/config.xlsx"); putFile("hsdt/K1/4/other.pdf");
  db.put("hsdtreq", "K1", { requestedAt: "2026-11-13T03:00:00.000Z", templateFiles: [{ path: "hsdt/K1/2/template.docx" }], configFiles: [{ path: "hsdt/K1/3/config.xlsx" }] });
  await post([row("comparereq", "K1", { requestedAt: "2026-11-13T01:00:00.000Z", doneAt: "2026-11-13T02:00:00.000Z" })]);
  assert.deepEqual(scratch(), ["hsdt/K1/2/template.docx", "hsdt/K1/3/config.xlsx"]);
});

test("Yêu cầu kia đã xong thì không giữ gì; không đọc được yêu cầu kia thì không xoá gì (chờ lần sau)", async () => {
  putFile("hsdt/K1/1/a.pdf");
  db.put("comparereq", "K1", { requestedAt: "2026-11-13T01:00:00.000Z", doneAt: "2026-11-13T02:00:00.000Z", files: [{ path: "hsdt/K1/1/a.pdf" }] });
  await post([row("hsdtreq", "K1", { requestedAt: "2026-11-13T01:00:00.000Z", doneAt: "2026-11-13T02:00:00.000Z" })]);
  assert.deepEqual(scratch(), []);
  putFile("hsdt/K1/1/a.pdf");
  db.override = (req) => (req.u.pathname === "/rest/v1/docs" && req.u.search.includes("coll=eq.comparereq") && req.method === "GET" ? new Response("x", { status: 500 }) : null);
  await post([row("hsdtreq", "K1", { requestedAt: "2026-11-13T01:00:00.000Z", doneAt: "2026-11-13T02:00:00.000Z" })]);
  assert.deepEqual(scratch(), ["hsdt/K1/1/a.pdf"]);
});

test("TLKT xong: xoá tlkt/<mã>/; thư mục hsdt không bị đụng", async () => {
  putFile("tlkt/K1/1/p.pdf"); putFile("hsdt/K1/1/h.pdf");
  await post([row("tlktreq", "K1", { requestedAt: "a", doneAt: "b" })]);
  assert.deepEqual(scratch(), ["hsdt/K1/1/h.pdf"]);
});
