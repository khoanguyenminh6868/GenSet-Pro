import { INGEST, GH_TOKEN, makeDb, installFetch, fresh, mkReq, call } from "./harness.mjs";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

let db, undo, h;
beforeEach(async () => {
  db = makeDb(); undo = installFetch(db);
  db.member("tok", "khoa@example.com", "member");
  h = await fresh("gh.js", { GITHUB_TOKEN: GH_TOKEN });
});
afterEach(() => undo());

const asset = (id, over = {}) => {
  db.gh.assets[id] = { bytes: Buffer.from("0123456789"), meta: { browser_download_url: `https://github.com/owner/repo/releases/download/hsmt-IB2600123456/f.pdf`, content_type: "application/pdf", label: "Chương V.pdf", name: "f.pdf" }, ...over };
};
const get = (id, { token = "tok", headers } = {}) => call(h, mkReq({ query: { id }, token, headers }));

test("Quyền: không đăng nhập 401; token bot HOẶC thành viên đều được; token lạ 401", async () => {
  asset("1");
  assert.equal((await get("1", { token: null })).statusCode, 401);
  assert.equal((await get("1", { token: "lạ" })).statusCode, 401);
  assert.equal((await get("1", { token: "tok" })).statusCode, 200);
  assert.equal((await get("1", { token: INGEST })).statusCode, 200);
  assert.equal(db.where((c) => c.url.includes("api.github.com")).length > 0, true);
});

test("Token bot đúng thì không cần hỏi Supabase Auth", async () => {
  asset("1");
  await get("1", { token: INGEST });
  assert.equal(db.where((c) => c.path === "/auth/v1/user").length, 0);
});

test("Supabase Auth hỏng (mạng đứt) → 502, không lộ tệp", async () => {
  asset("1");
  db.override = (req) => (req.u.pathname === "/auth/v1/user" ? Promise.reject(new Error("net")) : null);
  const r = await get("1", { token: "tok" });
  assert.equal(r.statusCode, 502);
  assert.equal(r.bytes.length, 0);
});

test("id phải là 1–15 chữ số (chặn đường dẫn, dấu, quá dài, rỗng)", async () => {
  asset("1"); asset("123456789012345");
  for (const id of ["", "abc", "1/2", "../1", "1a", "-1", "1.5", "1 ", "1234567890123456", undefined]) assert.equal((await get(id)).statusCode, 400, String(id));
  assert.equal((await get("123456789012345")).statusCode, 200, "đúng 15 chữ số là biên còn được");
  assert.equal(db.where((c) => c.url.includes("/releases/assets/") && !c.url.includes("123456789012345") && !c.url.includes("/1")).length, 0);
});

test("Chưa cấu hình GITHUB_TOKEN → 503", async () => {
  const h2 = await fresh("gh.js", { GITHUB_TOKEN: undefined });
  asset("1");
  const r = await call(h2, mkReq({ query: { id: "1" }, token: "tok" }));
  assert.equal(r.statusCode, 503);
  assert.equal(db.where((c) => c.url.includes("api.github.com")).length, 0);
});

test("Chỉ phục vụ tệp hồ sơ mời thầu (release hsmt-<TBMT>); release khác, tệp khác của repo → 404", async () => {
  const dl = (tag) => `https://github.com/owner/repo/releases/download/${tag}/x.pdf`;
  let i = 0;
  for (const tag of ["ncc-IB2600123456", "hsmt-ib2600123456", "hsmt-IB12345", "hsmt-IB", "v1.0", "hsmt-", "bcdg-IB2600123456", "hsmt-1B2600123456"]) {
    const id = String(++i); asset(id, { meta: { browser_download_url: dl(tag), content_type: "x" } });
    assert.equal((await get(id)).statusCode, 404, tag);
  }
  asset("90", { meta: { browser_download_url: "https://github.com/owner/repo/archive/main.zip" } });
  assert.equal((await get("90")).statusCode, 404);
  asset("91", { meta: {} });
  assert.equal((await get("91")).statusCode, 404, "thiếu đường dẫn tải");
  for (const tag of ["hsmt-IB2600123456", "hsmt-TT260012", "hsmt-IB2600123456-01".replace("-01", "")]) { asset("100", { meta: { browser_download_url: dl(tag) } }); assert.equal((await get("100")).statusCode, 200, tag); }
});

test("Không thấy tệp trên GitHub → 404; GitHub lỗi → 502; không có liên kết tải → 502", async () => {
  assert.equal((await get("777")).statusCode, 404);
  asset("1", { metaStatus: 500 }); assert.equal((await get("1")).statusCode, 502);
  asset("2", { metaStatus: 404 }); assert.equal((await get("2")).statusCode, 404);
  asset("3", { noLocation: true }); assert.equal((await get("3")).statusCode, 502);
});

test("Phát tệp: nội dung, Content-Type của GitHub, tên tệp UTF-8 theo label, cache riêng tư 1 ngày, Accept-Ranges", async () => {
  asset("1");
  const r = await get("1");
  assert.equal(r.bytes.toString(), "0123456789");
  assert.equal(r.headers["content-type"], "application/pdf");
  assert.equal(r.headers["content-disposition"], `inline; filename*=UTF-8''${encodeURIComponent("Chương V.pdf")}`);
  assert.equal(r.headers["cache-control"], "private, max-age=86400");
  assert.equal(r.headers["accept-ranges"], "bytes");
  assert.equal(r.headers["content-length"], "10");
});

test("Thiếu label thì lấy name; thiếu content_type thì octet-stream", async () => {
  asset("1", { meta: { browser_download_url: "https://github.com/owner/repo/releases/download/hsmt-IB2600123456/f.pdf", name: "f g.pdf" } });
  const r = await get("1");
  assert.equal(r.headers["content-type"], "application/octet-stream");
  assert.match(r.headers["content-disposition"], /f%20g\.pdf$/);
});

test("Range được chuyển tiếp (đọc PDF từng đoạn): 206 + Content-Range", async () => {
  asset("1");
  const r = await get("1", { headers: { range: "bytes=0-3" } });
  assert.equal(r.statusCode, 206);
  assert.equal(r.bytes.toString(), "0123");
  assert.equal(r.headers["content-range"], "bytes 0-3/10");
  const objCall = db.calls.find((c) => c.url.startsWith("https://objects.example/"));
  assert.equal(objCall.headers.Range, "bytes=0-3");
});

test("GITHUB_TOKEN chỉ gửi cho api.github.com, KHÔNG gửi sang địa chỉ tải về đã ký", async () => {
  asset("1");
  await get("1");
  for (const c of db.calls.filter((x) => x.url.startsWith("https://api.github.com/"))) assert.equal(c.headers.Authorization, `Bearer ${GH_TOKEN}`);
  const obj = db.calls.find((x) => x.url.startsWith("https://objects.example/"));
  assert.ok(obj);
  assert.equal(JSON.stringify(obj.headers).includes(GH_TOKEN), false);
  const link = db.calls.find((x) => x.headers.Accept === "application/octet-stream");
  assert.equal(link.redirect, "manual", "tự xử lý chuyển hướng để không rò token");
});

test("Địa chỉ tải về lỗi → trả mã đó (404/503…)", async () => {
  asset("1", { fileStatus: 503 });
  assert.equal((await get("1")).statusCode, 503);
});
