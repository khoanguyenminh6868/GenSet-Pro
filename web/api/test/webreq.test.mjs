import { makeDb, installFetch, fresh, mkReq, call, sbDocsWrites } from "./harness.mjs";
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

let db, undo, h;
const NOW = "2026-11-13T05:00:00.000Z";
beforeEach(async () => {
  db = makeDb(); undo = installFetch(db);
  db.member("tok-user", "User@Example.com", "member").member("tok-admin", "root@example.com", "superadmin");
  mock.timers.enable({ apis: ["Date"], now: Date.parse(NOW) });
  h = await fresh("webreq.js");
});
afterEach(() => { undo(); mock.restoreAll(); mock.timers.reset(); });

const post = (body, token = "tok-user") => call(h, mkReq({ method: "POST", body, token }));
const one = async (coll, item, token) => { const r = await post({ coll, items: [item] }, token); assert.equal(r.statusCode, 200, JSON.stringify(r.jsonBody)); return r.jsonBody.saved[0].data; };

test("Cấu hình hệ thống (settings/ai): chỉ Superadmin; lọc giá trị; số tiền đã dùng có mốc giờ; giữ trường cũ", async () => {
  const ai = { use: { analysis: "plan", config: "bậy", bidprice: "api", extra: "plan" }, switchAtUsd: "98", spentUsd: 41.257 };
  assert.equal((await post({ coll: "settings", ai })).statusCode, 403);
  assert.equal(sbDocsWrites(db).length, 0);
  const r = await post({ coll: "settings", ai }, "tok-admin");
  assert.equal(r.statusCode, 200, JSON.stringify(r.jsonBody));
  const d = db.get("settings", "ai");
  assert.deepEqual(d.data.use, { analysis: "plan", config: "api", bidprice: "api", compare: "api" });
  assert.equal(d.data.switchAtUsd, 98);
  assert.deepEqual(d.data.spent, { usd: 41.26, at: NOW });
  assert.equal(d.updated_at, NOW);
  assert.equal(d.data.by, "root@example.com");
  // Không gửi spentUsd: giữ số cũ.
  await post({ coll: "settings", ai: { use: {}, switchAtUsd: 90 } }, "tok-admin");
  assert.deepEqual(db.get("settings", "ai").data.spent, { usd: 41.26, at: NOW });
  assert.equal(db.get("settings", "ai").data.switchAtUsd, 90);
  assert.equal((await post({ coll: "settings", ai: { spentUsd: "abc" } }, "tok-admin")).statusCode, 400);
});

test("Cấu hình hệ thống: lĩnh vực mặc định Máy phát điện, lọc khoá lạ, không gửi thì giữ cũ", async () => {
  await post({ coll: "settings", ai: { use: {} } }, "tok-admin");
  assert.deepEqual(db.get("settings", "ai").data.fields, ["genset"]);
  await post({ coll: "settings", ai: { use: {}, fields: ["genset", "lạ", "genset"] } }, "tok-admin");
  assert.deepEqual(db.get("settings", "ai").data.fields, ["genset"]);
  await post({ coll: "settings", ai: { use: {}, fields: ["lạ"] } }, "tok-admin");
  assert.deepEqual(db.get("settings", "ai").data.fields, ["genset"]);
});

test("Chỉ nhận POST; chưa đăng nhập hoặc token lạ thì 401, không ghi gì", async () => {
  assert.equal((await call(h, mkReq({ method: "GET", token: "tok-user" }))).statusCode, 405);
  assert.equal((await post({ coll: "hsmtreq", items: [{ key: "A" }] }, null)).statusCode, 401);
  assert.equal((await post({ coll: "hsmtreq", items: [{ key: "A" }] }, "tok-lạ")).statusCode, 401);
  assert.equal(sbDocsWrites(db).length, 0);
});

test("Loại yêu cầu ngoài danh sách bị từ chối (không ghi được botstatus, quote, supplier qua đường này)", async () => {
  for (const coll of ["botstatus", "quote", "supplier", "analysis", undefined, ""]) {
    assert.equal((await post({ coll, items: [{ key: "A" }] })).statusCode, 400, String(coll));
  }
  for (const coll of ["analysisreq", "hsmtreq", "syncreq", "translationreq", "comparereq", "hsdtreq", "tlktreq", "supplierreq", "configreq", "findreq", "bidpricereq"]) {
    assert.equal((await post({ coll, items: [{ key: coll === "syncreq" ? "current" : "A" }] })).statusCode, 200, coll);
  }
});

test("Tìm Thông Số (specreq) chỉ Superadmin; member thường 403, superadmin ghi spec:true", async () => {
  assert.equal((await post({ coll: "specreq", items: [{ key: "ncc1" }] }, "tok-user")).statusCode, 403);
  assert.equal(db.get("specreq", "ncc1"), undefined);
  const d = await one("specreq", { key: "ncc1" }, "tok-admin");
  assert.equal(d.spec, true);
  assert.equal(d.by, "root@example.com");
});

test("Kiểm tra danh sách: rỗng, >200, mã sai ký tự, syncreq khác 'current' đều 400; đúng 200 mục là biên còn được", async () => {
  const items = (n) => Array.from({ length: n }, (_, i) => ({ key: "K" + i }));
  assert.equal((await post({ coll: "hsmtreq", items: [] })).statusCode, 400);
  assert.equal((await post({ coll: "hsmtreq" })).statusCode, 400);
  assert.equal((await post({ coll: "hsmtreq", items: items(201) })).statusCode, 400);
  assert.equal((await post({ coll: "hsmtreq", items: items(200) })).statusCode, 200);
  for (const key of ["a b", "a/b", "a;b", "", "x".repeat(201), 'a"b']) assert.equal((await post({ coll: "hsmtreq", items: [{ key }] })).statusCode, 400, key);
  assert.equal((await post({ coll: "syncreq", items: [{ key: "other" }] })).statusCode, 400);
  assert.equal((await post({ coll: "hsmtreq", items: [{ key: "IB2600123456-00" }, { key: "bad key" }] })).statusCode, 400, "một mã sai làm hỏng cả lô");
});

test("Ghi đúng dạng: id, updated_at = giờ ghi, merge-duplicates, x-actor là email thành viên (không phải service role)", async () => {
  await post({ coll: "hsmtreq", items: [{ key: "IB1", notifyNo: "IB1", bidName: "Gói A" }] });
  const w = sbDocsWrites(db)[0];
  assert.equal(w.headers.Prefer, "resolution=merge-duplicates,return=minimal");
  assert.equal(w.headers["x-actor"], "user@example.com", "email viết thường như memberFrom trả");
  assert.deepEqual(w.body.map((r) => [r.coll, r.id, r.updated_at]), [["hsmtreq", "IB1", NOW]]);
  assert.equal(db.get("hsmtreq", "IB1").updated_at, NOW);
});

test("Ghi hai lần cùng nội dung ở hai thời điểm thì updated_at đổi (doc-cache và view dựa vào đó)", async () => {
  await post({ coll: "analysisreq", items: [{ key: "IB1" }] });
  const t1 = db.get("analysisreq", "IB1").updated_at;
  mock.timers.tick(1000);
  await post({ coll: "analysisreq", items: [{ key: "IB1" }] });
  assert.notEqual(db.get("analysisreq", "IB1").updated_at, t1);
});

test("Trường cơ bản: notifyNo mặc định = key, bidName cắt 1000, requestedAt/by/from; auto chỉ khi truthy", async () => {
  const d = await one("analysisreq", { key: "IB1", bidName: "x".repeat(1500), auto: 1, rogue: "bỏ", doneAt: "2999-01-01" });
  assert.equal(d.notifyNo, "IB1");
  assert.equal(d.bidName.length, 1000);
  assert.equal(d.requestedAt, NOW);
  assert.equal(d.by, "user@example.com");
  assert.equal(d.from, "web");
  assert.equal(d.auto, true);
  assert.ok(!("rogue" in d) && !("doneAt" in d), "trường ngoài danh sách bị bỏ: web không tự đánh dấu xong được");
  assert.ok(!("auto" in await one("analysisreq", { key: "IB2" })));
  assert.equal((await one("hsmtreq", { key: "IB3", notifyNo: "IB3-v2" })).notifyNo, "IB3-v2");
});

test("sourceUrl chỉ nhận https tại cổng muasamcong (.mof/.mpi); còn lại bị bỏ", async () => {
  const ok = ["https://muasamcong.mof.gov.vn/egp/x?a=1", "https://muasamcong.mpi.gov.vn/x"];
  const bad = ["http://muasamcong.mof.gov.vn/x", "https://muasamcong.mof.gov.vn.evil.com/x", "https://evil.com/muasamcong.mof.gov.vn", "https://muasamcong.mof.gov.vn@evil.com/", "ftp://muasamcong.mof.gov.vn/x", "javascript:alert(1)", "không phải url", "", "https://muasamcong.gov.vn/x"];
  for (const u of ok) assert.equal((await one("hsmtreq", { key: "A", sourceUrl: u })).sourceUrl, new URL(u).href, u);
  for (const u of bad) assert.equal((await one("hsmtreq", { key: "A", sourceUrl: u })).sourceUrl, undefined, u);
});

test("syncreq: không có notifyNo; mode chỉ nhận 'new'", async () => {
  const a = await one("syncreq", { key: "current", mode: "new", notifyNo: "x" });
  assert.equal(a.notifyNo, undefined);
  assert.equal(a.mode, "new");
  assert.equal((await one("syncreq", { key: "current", mode: "full" })).mode, undefined);
  assert.equal((await one("hsmtreq", { key: "K", mode: "new" })).mode, undefined, "mode chỉ dành cho syncreq");
});

test("Gợi ý cấu hình / Tìm NCC: xuất xứ g7, g20, other, all, cn đều giữ nguyên (không bị rơi về cn)", async () => {
  for (const coll of ["configreq", "findreq"]) {
    for (const origin of ["cn", "g7", "g20", "other", "all"]) assert.equal((await one(coll, { key: "K", origin })).origin, origin, `${coll}/${origin}`);
  }
});

test("Xuất xứ lạ hoặc thiếu → cn (mặc định Khoa chốt); xuất xứ không gắn vào loại yêu cầu khác", async () => {
  for (const origin of [undefined, "", "US", "G7", "jp", null, 7, ["g7"]]) assert.equal((await one("configreq", { key: "K", origin })).origin, "cn", String(origin));
  const d = await one("analysisreq", { key: "K", origin: "g7", extra: "x" });
  assert.ok(!("origin" in d) && !("extra" in d));
});

test("'Yêu cầu khác' (extra) được cắt khoảng trắng, giới hạn 2000 ký tự, rỗng thì bỏ", async () => {
  assert.equal((await one("configreq", { key: "K", extra: "  Động cơ Perkins  " })).extra, "Động cơ Perkins");
  assert.equal((await one("configreq", { key: "K", extra: "x".repeat(3000) })).extra.length, 2000);
  assert.equal((await one("configreq", { key: "K", extra: "   " })).extra, undefined);
  assert.equal((await one("findreq", { key: "K" })).extra, undefined);
});

test("Tìm NCC: target chỉ khi có engine.model; chỉ giữ model/make, size, rank hợp lệ", async () => {
  const t = (await one("findreq", { key: "K", target: {
    size: "500 kVA", rank: 2, secret: "bỏ",
    engine: { model: "6BTA5.9", make: "Cummins", price: 9 }, alternator: { model: "ECP", make: "Cummins", x: 1 },
    controller: { model: "" }, genset: { make: "chỉ có hãng" },
  } })).target;
  assert.deepEqual(t, { size: "500 kVA", rank: 2, engine: { model: "6BTA5.9", make: "Cummins" }, alternator: { model: "ECP", make: "Cummins" } });
  assert.equal((await one("findreq", { key: "K", target: { engine: { make: "Cummins" } } })).target, undefined);
  assert.equal((await one("findreq", { key: "K" })).target, undefined);
  assert.equal((await one("configreq", { key: "K", target: { engine: { model: "x" } } })).target, undefined, "target chỉ dành cho findreq");
});

test("Tìm NCC: rank phải là số nguyên 1..99 (biên 0, 99, 100, 1.5, chuỗi)", async () => {
  const rank = async (r) => (await one("findreq", { key: "K", target: { engine: { model: "m" }, rank: r } })).target.rank;
  assert.equal(await rank(1), 1);
  assert.equal(await rank(99), 99);
  for (const r of [0, 100, 1.5, "2", -1, null]) assert.equal(await rank(r), undefined, String(r));
});

test("Gợi ý giá đấu: basis kva/price dương < 1e13, ngoài ra null; capText cắt 300; mặc định rỗng", async () => {
  const b = (await one("bidpricereq", { key: "K", basis: { kva: "500", price: 1.2e9, capText: "c".repeat(400), bidForm: "Đấu thầu rộng rãi", investorName: "Chủ đầu tư", location: "Hà Nội, Hải Phòng", field: "Hàng hóa", bidCloseDate: "2026-11-20T03:00:00", rogue: 1 } })).basis;
  assert.deepEqual(b, { kva: 500, price: 1.2e9, capText: "c".repeat(300), bidForm: "Đấu thầu rộng rãi", investorName: "Chủ đầu tư", location: "Hà Nội, Hải Phòng", field: "Hàng hóa", bidCloseDate: "2026-11-20T03:00:00" });
  const long = (await one("bidpricereq", { key: "K", basis: { location: "x".repeat(400), field: "y".repeat(200), bidCloseDate: "2026-11-20T03:00:00".repeat(5) } })).basis;
  assert.deepEqual([long.location.length, long.field.length, long.bidCloseDate.length], [300, 100, 40]);
  const bad = (await one("bidpricereq", { key: "K", basis: { kva: 0, price: -5 } })).basis;
  assert.deepEqual(bad, { kva: null, price: null, capText: "", bidForm: "", investorName: "", location: "", field: "", bidCloseDate: "" });
  assert.equal((await one("bidpricereq", { key: "K", basis: { kva: 1e13 } })).basis.kva, null, "đúng 1e13 bị loại (biên)");
  assert.equal((await one("bidpricereq", { key: "K", basis: { kva: 9.99e12 } })).basis.kva, 9.99e12);
  assert.equal((await one("bidpricereq", { key: "K", basis: { kva: "abc" } })).basis.kva, null);
  assert.deepEqual((await one("bidpricereq", { key: "K" })).basis, { kva: null, price: null, capText: "", bidForm: "", investorName: "", location: "", field: "", bidCloseDate: "" });
  assert.ok(!("basis" in await one("hsmtreq", { key: "K", basis: { kva: 5 } })));
});

test("Đối chiếu HSDT: chỉ nhận tệp nằm dưới hsdt/<mã gói>/, không có '..', tối đa 50, text cắt 200000", async () => {
  const files = [
    { path: "hsdt/K/1700/a.pdf", name: "a.pdf", size: "123" },
    { path: "hsdt/KHÁC/1700/b.pdf", name: "b.pdf" },
    { path: "tlkt/K/1700/c.pdf" },
    { path: "hsdt/K/../K2/d.pdf" },
    { path: "quote/K/e.pdf" },
    { path: 5 }, null, "hsdt/K/x",
  ];
  const d = await one("comparereq", { key: "K", files, text: "t".repeat(300000) });
  assert.deepEqual(d.files, [{ path: "hsdt/K/1700/a.pdf", name: "a.pdf", size: 123 }]);
  assert.equal(d.text.length, 200000);
  const many = Array.from({ length: 80 }, (_, i) => ({ path: `hsdt/K/${i}/f.pdf` }));
  assert.equal((await one("comparereq", { key: "K", files: many })).files.length, 50);
  assert.deepEqual((await one("comparereq", { key: "K" })).files, []);
  assert.equal((await one("comparereq", { key: "K", files: "không phải mảng" })).files.length, 0);
});

test("Đối chiếu TLKT: tệp dưới tlkt/<mã>/, kèm reqFiles/reqText/uploadError; translate chỉ mang theo cờ translate", async () => {
  const d = await one("tlktreq", { key: "K", files: [{ path: "tlkt/K/1/a.pdf" }, { path: "hsdt/K/1/a.pdf" }], reqFiles: [{ path: "tlkt/K/2/y.pdf" }], reqText: "yckt", text: "tl", uploadError: "lỗi tải", translate: false });
  assert.deepEqual(d.files.map((f) => f.path), ["tlkt/K/1/a.pdf"]);
  assert.deepEqual(d.reqFiles.map((f) => f.path), ["tlkt/K/2/y.pdf"]);
  assert.equal(d.reqText, "yckt");
  assert.equal(d.uploadError, "lỗi tải");
  const t = await one("tlktreq", { key: "K", translate: true, files: [{ path: "tlkt/K/1/a.pdf" }], text: "bỏ" });
  assert.equal(t.translate, true);
  assert.ok(!("files" in t) && !("text" in t));
  assert.equal((await one("tlktreq", { key: "K", text: "t".repeat(900000) })).text.length, 800000);
});

test("Tạo HSDT tham khảo: templateFiles/configFiles dưới hsdt/<mã>/, text 400000, uploadError 500", async () => {
  const d = await one("hsdtreq", { key: "K", templateFiles: [{ path: "hsdt/K/1/m.docx" }, { path: "hsdt/X/1/m.docx" }], configFiles: [{ path: "hsdt/K/2/c.xlsx" }], templateText: "a".repeat(500000), configText: "b", uploadError: "e".repeat(600) });
  assert.deepEqual(d.templateFiles.map((f) => f.path), ["hsdt/K/1/m.docx"]);
  assert.deepEqual(d.configFiles.map((f) => f.path), ["hsdt/K/2/c.xlsx"]);
  assert.equal(d.templateText.length, 400000);
  assert.equal(d.uploadError.length, 500);
  assert.ok(!("files" in d));
});

test("Huỷ yêu cầu (cancel): giữ nguyên trường cũ, thêm doneAt = giờ huỷ và xoá error; không có dòng cũ vẫn ghi doneAt", async () => {
  db.put("hsmtreq", "OLD", { notifyNo: "IB-OLD", requestedAt: "2026-11-12T00:00:00.000Z", by: "ai đó", error: "lỗi cũ", sourceUrl: "https://muasamcong.mof.gov.vn/x" });
  const r = await post({ coll: "hsmtreq", items: [{ key: "OLD", cancel: true, bidName: "bỏ qua khi huỷ" }, { key: "NEW" }, { key: "MISSING", cancel: true }] });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(db.get("hsmtreq", "OLD").data, { notifyNo: "IB-OLD", requestedAt: "2026-11-12T00:00:00.000Z", by: "ai đó", error: "", sourceUrl: "https://muasamcong.mof.gov.vn/x", doneAt: NOW });
  assert.deepEqual(db.get("hsmtreq", "MISSING").data, { doneAt: NOW, error: "" });
  assert.equal(db.get("hsmtreq", "NEW").data.requestedAt, NOW, "mục không huỷ vẫn là yêu cầu mới");
  assert.equal(db.get("hsmtreq", "OLD").updated_at, NOW);
});

test("Huỷ chỉ đọc đúng các khoá bị huỷ; lỗi đọc → 502 và không ghi gì", async () => {
  db.failDocsRead = true;
  const r = await post({ coll: "hsmtreq", items: [{ key: "OLD", cancel: true }] });
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /Đọc thất bại \(HTTP 500\)/);
  assert.equal(sbDocsWrites(db).length, 0);
});

test("Lỗi ghi Supabase → 502 kèm mã và đoạn lỗi; thành công trả saved [{key, data}]", async () => {
  db.failDocsWrite = true;
  const r = await post({ coll: "hsmtreq", items: [{ key: "A" }] });
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /Lưu thất bại \(HTTP 500\): write boom/);
  db.failDocsWrite = false;
  const ok = await post({ coll: "hsmtreq", items: [{ key: "A" }, { key: "B" }] });
  assert.deepEqual(ok.jsonBody.saved.map((s) => s.key), ["A", "B"]);
  assert.ok(ok.jsonBody.saved.every((s) => s.data.requestedAt === NOW));
});
