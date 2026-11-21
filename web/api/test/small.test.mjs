// blob.js, config.js, scratch.js: ba hàm nhỏ.
import { INGEST, SB, SERVICE, ANON, makeDb, installFetch, fresh, mkReq, call } from "./harness.mjs";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

let db, undo;
beforeEach(() => { db = makeDb(); undo = installFetch(db); });
afterEach(() => undo());

// ---------- blob ----------
test("blob: chuyển hướng 302 tới kho công khai blobs, cache công khai 1 ngày", async () => {
  const h = await fresh("blob.js");
  const r = await call(h, mkReq({ query: { id: "abc-123_x.png" } }));
  assert.equal(r.statusCode, 302);
  assert.equal(r.redirectTo, `${SB}/storage/v1/object/public/blobs/abc-123_x.png`);
  assert.equal(r.headers["cache-control"], "public, max-age=86400");
});

test("blob: id rỗng hoặc toàn ký tự lạ → 400; ký tự lạ bị bỏ nên không thoát khỏi thư mục blobs", async () => {
  const h = await fresh("blob.js");
  for (const id of [undefined, "", "///", "%%%", "   "]) assert.equal((await call(h, mkReq({ query: { id } }))).statusCode, 400, String(id));
  for (const id of ["../../private/x", "a/b", "a\\b", "a?x=1", "a#b", "a%2Fb"]) {
    const r = await call(h, mkReq({ query: { id } }));
    assert.equal(r.statusCode, 302, id);
    const tail = r.redirectTo.slice(`${SB}/storage/v1/object/public/blobs/`.length);
    assert.match(tail, /^[A-Za-z0-9._-]+$/, id);
  }
});

// ---------- config ----------
test("config: trả địa chỉ Supabase + khoá anon công khai, không cache; không lộ khoá dịch vụ hay token bot", async () => {
  const h = await fresh("config.js");
  const r = await call(h, mkReq());
  assert.deepEqual(r.jsonBody, { url: SB, anonKey: ANON });
  assert.equal(r.headers["cache-control"], "no-cache");
  const all = JSON.stringify(r.jsonBody) + JSON.stringify(r.headers);
  assert.equal(all.includes(SERVICE), false);
  assert.equal(all.includes(INGEST), false);
});

test("config: thiếu khoá anon thì trả chuỗi rỗng (không undefined)", async () => {
  const h = await fresh("config.js", { SUPABASE_ANON_KEY: undefined });
  try { assert.equal((await call(h, mkReq())).jsonBody.anonKey, ""); } finally { process.env.SUPABASE_ANON_KEY = ANON; }
});

// ---------- scratch ----------
const sc = async (query, token = INGEST, method = "GET") => call(await fresh("scratch.js"), mkReq({ method, query, token }));

test("scratch: chỉ bot (token) xin được liên kết tải; GET duy nhất", async () => {
  db.files.set("scratch/hsdt/IB1/1/a.pdf", { data: Buffer.from("x") });
  assert.equal((await sc({ path: "hsdt/IB1/1/a.pdf" }, INGEST, "POST")).statusCode, 405);
  assert.equal((await sc({ path: "hsdt/IB1/1/a.pdf" }, null)).statusCode, 401);
  db.member("tok", "a@b", "superadmin");
  assert.equal((await sc({ path: "hsdt/IB1/1/a.pdf" }, "tok")).statusCode, 401, "thành viên (kể cả superadmin) không dùng đường này");
  assert.equal(db.where((c) => c.path.startsWith("/storage/")).length, 0);
});

test("scratch: chỉ nhận hsdt/<mã>/… hoặc tlkt/<mã>/…, không có '..' hay '\\'", async () => {
  for (const path of ["", "quote/IB1/1/a.pdf", "bcdg/IB1/a.pdf", "hsdt/IB1", "hsdt//a.pdf", "hsdt/IB1/../quote/a", "hsdt/IB 1/a.pdf", "hsdt/IB1/a\\b.pdf", "../hsdt/IB1/a.pdf", "hsdt/IB1/" + "x".repeat(401), undefined]) {
    assert.equal((await sc({ path })).statusCode, 400, String(path));
  }
  assert.equal(db.where((c) => c.path.startsWith("/storage/")).length, 0);
});

test("scratch: tệp có thật → { url } liên kết ký 10 phút trỏ vào kho; không cache", async () => {
  db.files.set("scratch/tlkt/IB1/1700/Đề xuất.pdf", { data: Buffer.from("x") });
  const r = await sc({ path: "tlkt/IB1/1700/Đề xuất.pdf" });
  assert.equal(r.statusCode, 200);
  assert.equal(r.jsonBody.url.startsWith(`${SB}/storage/v1/object/sign/scratch/tlkt/IB1/1700/`), true);
  assert.equal(r.headers["cache-control"], "no-store");
  const c = db.where((x) => x.path.includes("/object/sign/scratch/"))[0];
  assert.deepEqual(c.body, { expiresIn: 600 });
  assert.match(c.path, /%C4%90%E1%BB%81%20xu%E1%BA%A5t\.pdf$/, "từng đoạn đường dẫn được mã hoá URL");
});

test("scratch: tệp không có → 404 (kho báo 400/404); lỗi khác → 502", async () => {
  assert.equal((await sc({ path: "hsdt/IB1/1/none.pdf" })).statusCode, 404);
  db.files.set("scratch/hsdt/IB1/1/a.pdf", { data: Buffer.from("x") });
  db.signStatus = 500;
  const r = await sc({ path: "hsdt/IB1/1/a.pdf" });
  assert.equal(r.statusCode, 502);
  assert.equal(r.jsonBody.error, "sign 500");
  db.signStatus = 404;
  assert.equal((await sc({ path: "hsdt/IB1/1/a.pdf" })).statusCode, 404);
});

// Đã sửa (T3 tìm thấy): chỉ ký tự lạ bị bỏ, dấu chấm thì không → id ".." từng đi vào địa chỉ.
test("blob: id '..' hoặc '.' không được chuyển hướng (sẽ bị trình duyệt chuẩn hoá thành thư mục cha)", async () => {
  const h = await fresh("blob.js");
  for (const id of ["..", "."]) assert.equal((await call(h, mkReq({ query: { id } }))).statusCode, 400, id);
});
