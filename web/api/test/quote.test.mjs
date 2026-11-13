import { INGEST, SB, makeDb, installFetch, fresh, mkReq, call } from "./harness.mjs";
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

let db, undo, h;
beforeEach(async () => {
  db = makeDb(); undo = installFetch(db);
  db.member("tok", "Khoa@Example.com", "member");
  mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-11-13T05:00:00Z") });
  h = await fresh("quote.js");
});
afterEach(() => { undo(); mock.restoreAll(); mock.timers.reset(); });

const post = (body, token = "tok") => call(h, mkReq({ method: "POST", body, token }));
const dl = (id, token = "tok") => call(h, mkReq({ query: { id }, token }));

// ---------- tải về ----------
test("Tải báo giá: thành viên đăng nhập nhận đúng tệp, riêng tư, không cache, giữ content-type/length", async () => {
  db.files.set("quote/IB1/a.pdf", { data: Buffer.from("%PDF-báo giá"), type: "application/pdf" });
  const r = await dl("IB1/a.pdf");
  assert.equal(r.statusCode, 200);
  assert.equal(r.bytes.toString(), "%PDF-báo giá");
  assert.equal(r.headers["content-type"], "application/pdf");
  assert.equal(r.headers["cache-control"], "private, no-store");
  assert.equal(r.headers["content-length"], String(Buffer.byteLength("%PDF-báo giá")));
});

test("Tải báo giá: chưa đăng nhập 401 (kể cả khi có token của bot — chỉ thành viên mới xem báo giá NCC)", async () => {
  db.files.set("quote/IB1/a.pdf", { data: Buffer.from("x") });
  assert.equal((await dl("IB1/a.pdf", null)).statusCode, 401);
  assert.equal((await dl("IB1/a.pdf", INGEST)).statusCode, 401);
  assert.equal((await dl("IB1/a.pdf", "tok-lạ")).statusCode, 401);
  assert.equal(db.where((c) => c.path.startsWith("/storage/")).length, 0, "chưa qua quyền thì không đọc kho");
});

test("Tải báo giá chỉ phục vụ <mã gói>/<tên tệp> hợp lệ: chặn '..', thư mục lồng nhau, ký tự lạ, mã gói không khớp", async () => {
  db.files.set("quote/IB1/a.pdf", { data: Buffer.from("x") });
  for (const id of ["", "IB1", "IB1/", "../IB1/a.pdf", "IB1/../a.pdf", "IB1/..", "../x", "./x", "IB1/a/b.pdf", "IB1/a b.pdf", "IB1/á.pdf", "IB1/a%2Fb", "IB1/" + "x".repeat(201), "x".repeat(101) + "/a", "IB1\\a.pdf"]) {
    assert.equal((await dl(id)).statusCode, 400, JSON.stringify(id));
  }
  assert.equal(db.where((c) => c.path.startsWith("/storage/")).length, 0);
});

test("Mã gói '..' hoặc '.' bị chặn dù khớp mẫu ký tự", async () => {
  assert.equal((await dl("../x")).statusCode, 400);
  assert.equal((await dl("./x")).statusCode, 400);
  assert.equal((await dl("../..")).statusCode, 400);
});

test("Tải báo giá: không thấy 404, 400 của kho → 404, lỗi khác → 502", async () => {
  assert.equal((await dl("IB1/none.pdf")).statusCode, 404);
  db.getStatus = 400; assert.equal((await dl("IB1/none.pdf")).statusCode, 404);
  db.getStatus = 500; assert.equal((await dl("IB1/none.pdf")).statusCode, 502);
});

// ---------- POST ----------
test("Chỉ GET và POST", async () => {
  assert.equal((await call(h, mkReq({ method: "PUT", token: "tok" }))).statusCode, 405);
  assert.equal((await call(h, mkReq({ method: "DELETE", token: "tok" }))).statusCode, 405);
});

test("POST cần thành viên đăng nhập; mã gói phải hợp lệ; thao tác phải biết", async () => {
  assert.equal((await post({ action: "upload", key: "IB1" }, null)).statusCode, 401);
  assert.equal((await post({ action: "upload", key: "IB1" }, INGEST)).statusCode, 401, "token bot không thay được thành viên");
  for (const key of ["", "a b", "a/b", "x".repeat(101), undefined]) assert.equal((await post({ action: "upload", key })).statusCode, 400, String(key));
  const r = await post({ action: "hack", key: "IB1" });
  assert.equal(r.statusCode, 400);
  assert.equal(r.jsonBody.error, "Thao tác không hợp lệ.");
  assert.equal((await post(undefined)).statusCode, 400);
});

const stage = (path, bytes = "BÁO GIÁ", type = "application/pdf") => db.files.set("scratch/" + path, { data: Buffer.from(bytes), type });

test("Tải lên: chuyển tệp từ thư mục tạm sang kho quote, xoá bản tạm, ghi nhật ký, trả { id, name, size, url }", async () => {
  stage("quote/IB1/1700/01-bao-gia.pdf");
  const r = await post({ action: "upload", key: "IB1", path: "quote/IB1/1700/01-bao-gia.pdf", name: "Báo giá NCC.pdf" });
  assert.equal(r.statusCode, 200, JSON.stringify(r.jsonBody));
  assert.equal(r.jsonBody.id, "IB1/1700-01-bao-gia.pdf", "id duy nhất lấy từ hai đoạn cuối của đường dẫn tạm");
  assert.equal(r.jsonBody.name, "Báo giá NCC.pdf");
  assert.equal(r.jsonBody.size, Buffer.byteLength("BÁO GIÁ"));
  assert.equal(r.jsonBody.url, "/api/quote?id=" + encodeURIComponent("IB1/1700-01-bao-gia.pdf"));
  assert.equal(db.files.get("quote/IB1/1700-01-bao-gia.pdf").data.toString(), "BÁO GIÁ");
  assert.equal(db.files.get("quote/IB1/1700-01-bao-gia.pdf").type, "application/pdf");
  assert.equal(db.files.has("scratch/quote/IB1/1700/01-bao-gia.pdf"), false, "tệp tạm đã xoá");
  const act = db.activity.find((a) => a.action === "upload");
  assert.deepEqual(act, { id: act.id, actor: "khoa@example.com", source: "server", action: "upload", detail: { key: "IB1", files: ["Báo giá NCC.pdf"], to: "quote/IB1/1700-01-bao-gia.pdf" } });
});

test("Tải lên từ chối đường dẫn tạm ngoài quote/<mã gói>/, có '..', hoặc thiếu tên (báo lỗi, không chép gì)", async () => {
  stage("quote/IB2/1/a.pdf"); stage("hsdt/IB1/1/a.pdf");
  for (const path of ["quote/IB2/1/a.pdf", "hsdt/IB1/1/a.pdf", "quote/IB1/../IB2/1/a.pdf", "", "quote/IB1"]) {
    const r = await post({ action: "upload", key: "IB1", path, name: "a.pdf" });
    assert.equal(r.statusCode, 502, path);
    assert.equal(r.jsonBody.error, "Tệp không hợp lệ.");
  }
  assert.equal((await post({ action: "upload", key: "IB1", path: "quote/IB1/1/a.pdf", name: "" })).jsonBody.error, "Tệp không hợp lệ.");
  assert.equal([...db.files.keys()].filter((k) => k.startsWith("quote/")).length, 0);
});

test("Tải lên: tệp tạm không đọc được → báo lỗi kèm mã; kho quote chưa có thì tự tạo rồi thử lại", async () => {
  const r = await post({ action: "upload", key: "IB1", path: "quote/IB1/1/none.pdf", name: "a" });
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /Không đọc được tệp vừa tải lên \(HTTP 404\)/);
  db.buckets.delete("quote");
  stage("quote/IB1/1/a.pdf");
  const ok = await post({ action: "upload", key: "IB1", path: "quote/IB1/1/a.pdf", name: "a.pdf" });
  assert.equal(ok.statusCode, 200);
  assert.ok(db.buckets.has("quote"));
  const bucketCalls = db.where((c) => c.path === "/storage/v1/bucket");
  assert.equal(bucketCalls.length, 1);
  assert.equal(bucketCalls[0].body.public, false, "kho báo giá luôn riêng tư (repo public)");
});

test("Tải lên: lưu vào kho lỗi khác (không phải thiếu kho) → báo lỗi, tệp tạm GIỮ lại", async () => {
  stage("quote/IB1/1/a.pdf");
  db.putStatus = 500;
  const r = await post({ action: "upload", key: "IB1", path: "quote/IB1/1/a.pdf", name: "a.pdf" });
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /Không lưu được tệp \(HTTP 500\)/);
  assert.equal(db.files.has("scratch/quote/IB1/1/a.pdf"), true);
  assert.equal(db.activity.length, 0, "chưa lưu được thì không ghi nhật ký tải lên");
});

test("Xoá: tệp hợp lệ của gói thì xoá khỏi kho; id sai/của gói khác thì bỏ qua êm (ok:true, không gọi kho)", async () => {
  db.files.set("quote/IB1/a.pdf", { data: Buffer.from("x") });
  assert.deepEqual((await post({ action: "delete", key: "IB1", id: "IB1/a.pdf" })).jsonBody, { ok: true });
  assert.equal(db.files.has("quote/IB1/a.pdf"), false);
  db.calls.length = 0;
  db.files.set("quote/IB2/a.pdf", { data: Buffer.from("x") });
  for (const id of ["IB2/a.pdf", "../IB2/a.pdf", "IB1/../IB2/a.pdf", "IB1/", "", undefined]) {
    assert.deepEqual((await post({ action: "delete", key: "IB1", id })).jsonBody, { ok: true }, String(id));
  }
  assert.equal(db.where((c) => c.method === "DELETE").length, 0);
  assert.equal(db.files.has("quote/IB2/a.pdf"), true, "báo giá của gói khác còn nguyên");
});

test("Xoá: kho báo lỗi 404 coi như đã xoá; lỗi khác báo 502", async () => {
  db.override = (req) => (req.method === "DELETE" ? new Response("x", { status: 404 }) : null);
  assert.equal((await post({ action: "delete", key: "IB1", id: "IB1/a.pdf" })).statusCode, 200);
  db.override = (req) => (req.method === "DELETE" ? new Response("x", { status: 500 }) : null);
  const r = await post({ action: "delete", key: "IB1", id: "IB1/a.pdf" });
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /Không xoá được tệp \(HTTP 500\)/);
});

// ---------- migrate (một lần) ----------
test("migrate cần token của bot; thành viên thường 401", async () => {
  assert.equal((await post({ action: "migrate" }, "tok")).statusCode, 401);
  assert.equal((await post({ action: "migrate" }, null)).statusCode, 401);
  assert.equal(db.where((c) => c.url.includes("api.github.com")).length, 0);
});

test("migrate: chuyển tệp của release ncc-<TBMT> sang kho, trỏ quote/<TBMT> về kho, rồi xoá release và tag; release khác bỏ qua", async () => {
  db.gh.releases = [
    { id: 11, tag_name: "ncc-IB1", assets: [{ id: 501, name: "Báo giá 1.pdf", url: "https://objects.example/file/501", content_type: "application/pdf" }] },
    { id: 12, tag_name: "hsmt-IB1", assets: [{ id: 502, name: "hsmt.pdf", url: "https://objects.example/file/502" }] },
    { id: 13, tag_name: "ncc-bad tag", assets: [] },
  ];
  db.gh.assets = { 501: { bytes: Buffer.from("PDF501") }, 502: { bytes: Buffer.from("HSMT") } };
  db.put("quote", "IB1", { rows: [{ ncc: "A", files: [{ id: "501", url: "/old" }, { id: "999", url: "/keep" }] }] });
  const r = await post({ action: "migrate" }, INGEST);
  assert.equal(r.statusCode, 200, JSON.stringify(r.jsonBody));
  assert.deepEqual(r.jsonBody, { moved: [{ key: "IB1", files: 1, doc: true }] });
  assert.equal(db.files.get("quote/IB1/B_o_gi_1.pdf") === undefined, false, "tên tệp được làm sạch ký tự lạ");
  const doc = db.get("quote", "IB1").data;
  assert.deepEqual(doc.rows[0].files, [{ id: "IB1/B_o_gi_1.pdf", url: "/api/quote?id=" + encodeURIComponent("IB1/B_o_gi_1.pdf") }, { id: "999", url: "/keep" }]);
  assert.equal(db.get("quote", "IB1").updated_at, "2026-11-13T05:00:00.000Z", "ghi quote cũng đổi updated_at");
  const dels = db.where((c) => c.method === "DELETE" && c.url.includes("api.github.com")).map((c) => c.path);
  assert.deepEqual(dels, ["/repos/owner/repo/releases/11", "/repos/owner/repo/git/refs/tags/ncc-IB1"], "chỉ xoá release ncc-*, không đụng hsmt-*");
});
