import { INGEST, SB, makeDb, installFetch, fresh, mkReq, call } from "./harness.mjs";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

let db, undo, h;
beforeEach(async () => {
  db = makeDb(); undo = installFetch(db);
  db.member("tok", "khoa@example.com", "member");
  h = await fresh("bcdg.js");
});
afterEach(() => undo());

const sign = (body, token = INGEST) => call(h, mkReq({ method: "POST", body, token }));
const dl = (id, token = "tok") => call(h, mkReq({ query: { id }, token }));

test("Chỉ GET và POST", async () => {
  assert.equal((await call(h, mkReq({ method: "PUT", token: INGEST }))).statusCode, 405);
  assert.equal((await call(h, mkReq({ method: "DELETE", token: INGEST }))).statusCode, 405);
});

test("Xin liên kết tải lên: cần token bot — thành viên thường và người lạ đều 401", async () => {
  const body = { action: "sign", key: "IB1", name: "bc.pdf" };
  assert.equal((await sign(body, null)).statusCode, 401);
  assert.equal((await sign(body, "tok")).statusCode, 401);
  assert.equal((await sign(body, INGEST.replace(/.$/, "x"))).statusCode, 401);
  assert.equal(db.calls.length, 0);
});

test("Thao tác và mã gói được kiểm tra", async () => {
  assert.equal((await sign({ action: "delete", key: "IB1", name: "a" })).jsonBody.error, "Thao tác không hợp lệ.");
  assert.equal((await sign(undefined)).statusCode, 400);
  for (const key of ["", "a b", "a/b", "x".repeat(101), undefined, "ký tự lạ"]) {
    const r = await sign({ action: "sign", key, name: "a.pdf" });
    assert.equal(r.statusCode, 400, String(key));
    assert.equal(r.jsonBody.error, "Mã gói thầu không hợp lệ.");
  }
});

test("Tên tệp được làm sạch: ký tự lạ thành '_', bỏ dấu chấm đầu, giữ tối đa 120 ký tự cuối; kết quả luôn nằm trong thư mục của gói", async () => {
  const path = async (name) => (await sign({ action: "sign", key: "IB1", name })).jsonBody?.path;
  assert.equal(await path("Báo cáo.pdf"), "IB1/B_o_c_o.pdf");
  assert.equal(await path("..secret.pdf"), "IB1/_secret.pdf");
  assert.equal(await path("../../etc/passwd"), "IB1/__.._etc_passwd", "dấu '/' bị thay nên không thoát khỏi thư mục");
  for (const name of ["../../x", "a/b/c", "a\\b", "...", "%2e%2e/x", ".."]) {
    const p = await path(name);
    assert.ok(p, name);
    assert.equal(p.split("/").length, 2, name);
    assert.ok(!p.split("/").some((s) => /^\.+$/.test(s)), name);
  }
  assert.equal((await path("x".repeat(200))).length, "IB1/".length + 120);
  assert.equal(await path("ok-1_2.PDF"), "IB1/ok-1_2.PDF");
});

test("Tên tệp rỗng → 400", async () => {
  for (const name of ["", undefined, null]) {
    const r = await sign({ action: "sign", key: "IB1", name });
    assert.equal(r.statusCode, 400, String(name));
    assert.equal(r.jsonBody.error, "Tên tệp không hợp lệ.");
  }
});

test("Cấp liên kết tải lên: trả { path, url } dạng Supabase signed upload, ghi đè (x-upsert), không cache", async () => {
  const r = await sign({ action: "sign", key: "IB1", name: "bc.pdf" });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.jsonBody, { path: "IB1/bc.pdf", url: `${SB}/storage/v1/object/upload/sign/bcdg/IB1/bc.pdf?token=tkn` });
  assert.equal(r.headers["cache-control"], "no-store");
  const c = db.where((x) => x.path.startsWith("/storage/v1/object/upload/sign/"))[0];
  assert.equal(c.headers["x-upsert"], "true");
});

test("Kho bcdg tự tạo khi chưa có, RIÊNG TƯ (repo public); đã tạo thì lần sau không tạo lại; 409 coi như đã có", async () => {
  db.buckets.delete("bcdg");
  await sign({ action: "sign", key: "IB1", name: "a.pdf" });
  await sign({ action: "sign", key: "IB1", name: "b.pdf" });
  const b = db.where((c) => c.path === "/storage/v1/bucket");
  assert.equal(b.length, 1);
  assert.deepEqual(b[0].body, { id: "bcdg", name: "bcdg", public: false });
  const h2 = await fresh("bcdg.js"); // module mới, kho đã tồn tại → 409 → vẫn cấp được liên kết
  const r = await call(h2, mkReq({ method: "POST", body: { action: "sign", key: "IB1", name: "a.pdf" }, token: INGEST }));
  assert.equal(r.statusCode, 200);
});

test("Supabase từ chối cấp liên kết → 502 kèm mã; liên kết trả về sai dạng → 502", async () => {
  db.signStatus = 500;
  const r = await sign({ action: "sign", key: "IB1", name: "a.pdf" });
  assert.equal(r.statusCode, 502);
  assert.match(r.jsonBody.error, /Không cấp được liên kết tải lên \(HTTP 500\)/);
  db.signStatus = 0; db.signRel = "https://evil.example/upload";
  const bad = await sign({ action: "sign", key: "IB1", name: "a.pdf" });
  assert.equal(bad.statusCode, 502);
  assert.equal(bad.jsonBody.error, "Liên kết tải lên không đúng dạng.");
});

test("Lỗi mạng khi cấp liên kết → 502 với thông báo lỗi", async () => {
  db.override = (req) => (req.u.pathname.includes("/upload/sign/") ? Promise.reject(new Error("mạng đứt")) : null);
  const r = await sign({ action: "sign", key: "IB1", name: "a.pdf" });
  assert.equal(r.statusCode, 502);
  assert.equal(r.jsonBody.error, "mạng đứt");
});

// ---------- tải về ----------
test("Tải báo cáo đánh giá: thành viên đăng nhập nhận tệp riêng tư, không cache", async () => {
  db.files.set("bcdg/IB1/bc.pdf", { data: Buffer.from("BCĐG"), type: "application/pdf" });
  const r = await dl("IB1/bc.pdf");
  assert.equal(r.statusCode, 200);
  assert.equal(r.bytes.toString(), "BCĐG");
  assert.equal(r.headers["content-type"], "application/pdf");
  assert.equal(r.headers["cache-control"], "private, no-store");
});

test("Tải: chưa đăng nhập 401, token bot cũng không xem được (chỉ thành viên); id sai dạng 400 trước khi hỏi quyền", async () => {
  db.files.set("bcdg/IB1/bc.pdf", { data: Buffer.from("x") });
  assert.equal((await dl("IB1/bc.pdf", null)).statusCode, 401);
  assert.equal((await dl("IB1/bc.pdf", INGEST)).statusCode, 401);
  for (const id of ["", "IB1", "../IB1/bc.pdf", "IB1/../bc.pdf", "IB1/a/b", "IB1/a b", "IB1/.."]) assert.equal((await dl(id)).statusCode, 400, JSON.stringify(id));
  assert.equal(db.where((c) => c.path.startsWith("/storage/")).length, 0);
});

test("Tải: không thấy 404, lỗi kho 502", async () => {
  assert.equal((await dl("IB1/none.pdf")).statusCode, 404);
  db.getStatus = 500; assert.equal((await dl("IB1/none.pdf")).statusCode, 502);
});
