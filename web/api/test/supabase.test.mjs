import { SB, SERVICE, makeDb, installFetch } from "./harness.mjs";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

const m = await import("../_supabase.js");
let db, undo;
beforeEach(() => { db = makeDb(); undo = installFetch(db); db.member("good", "Khoa@Example.com", "superadmin"); db.tokens["nomember"] = "stranger@example.com"; });
afterEach(() => undo());

test("projectUrl: nhận URL dự án, link bảng điều khiển dán nhầm, URL có đường dẫn; rác thì rỗng", () => {
  assert.equal(m.projectUrl("https://abcd.supabase.co"), "https://abcd.supabase.co");
  assert.equal(m.projectUrl("  https://abcd.supabase.co/rest/v1  "), "https://abcd.supabase.co");
  assert.equal(m.projectUrl("https://supabase.com/dashboard/project/AbCd1234/editor"), "https://abcd1234.supabase.co");
  assert.equal(m.projectUrl("không phải url"), "");
  assert.equal(m.projectUrl(""), "");
});

test("SB_URL lấy từ biến môi trường lúc nạp", () => { assert.equal(m.SB_URL, SB); });

test("memberFrom: token hợp lệ + có trong bảng members → { email, role }, email tra bằng chữ thường", async () => {
  const r = await m.memberFrom({ headers: { authorization: "Bearer good" } });
  assert.deepEqual(r, { email: "khoa@example.com", role: "superadmin" });
  const q = db.calls.find((c) => c.path === "/rest/v1/members");
  assert.ok(q.search.includes("email=eq.khoa%40example.com"));
  assert.equal(q.headers.apikey, SERVICE, "bảng members đọc bằng khoá dịch vụ");
});

test("memberFrom: không có header, token rỗng, token sai, người đã đăng nhập nhưng chưa được cấp quyền → null", async () => {
  assert.equal(await m.memberFrom({ headers: {} }), null);
  assert.equal(await m.memberFrom({ headers: { authorization: "Bearer " } }), null);
  assert.equal(await m.memberFrom({ headers: { authorization: "Bearer sai" } }), null);
  assert.equal(await m.memberFrom({ headers: { authorization: "Bearer nomember" } }), null);
  assert.equal(db.calls.filter((c) => c.path === "/auth/v1/user").length, 2, "không có token thì không gọi mạng");
});

test("memberFrom: tiền tố Bearer không phân biệt hoa thường; gửi token người dùng + khoá anon tới Supabase Auth", async () => {
  assert.ok(await m.memberFrom({ headers: { authorization: "bearer good" } }));
  const c = db.calls.find((x) => x.path === "/auth/v1/user");
  assert.equal(c.headers.Authorization, "Bearer good");
  assert.equal(c.headers.apikey, "anon-key-for-tests");
});

test("memberFrom: bảng members lỗi → null (từ chối, không cho qua)", async () => {
  db.override = (req) => (req.u.pathname === "/rest/v1/members" ? new Response("x", { status: 500 }) : null);
  assert.equal(await m.memberFrom({ headers: { authorization: "Bearer good" } }), null);
});

test("logActivity: ghi một dòng source=server với actor/action/detail; lỗi mạng bị nuốt", async () => {
  await m.logActivity({ actor: "a@x", action: "upload", detail: { key: "K" } });
  const c = db.calls.find((x) => x.path === "/rest/v1/activity_log");
  assert.deepEqual(c.body, { actor: "a@x", source: "server", action: "upload", detail: { key: "K" } });
  db.override = () => Promise.reject(new Error("net"));
  await assert.doesNotReject(m.logActivity({ actor: "a", action: "b", detail: {} }));
});

test("downloadScratch: trả { type, data base64 }, mặc định image/jpeg; lỗi → ném 'scratch <path>: HTTP <mã>'", async () => {
  db.files.set("scratch/p/a.png", { data: Buffer.from("PNGDATA"), type: "image/png" });
  db.files.set("scratch/p/b", { data: Buffer.from("zz") });
  const a = await m.downloadScratch("p/a.png");
  assert.deepEqual(a, { type: "image/png", data: Buffer.from("PNGDATA").toString("base64") });
  assert.equal((await m.downloadScratch("p/b")).type, "application/octet-stream", "theo content-type máy chủ trả (khoá hành vi: chỉ mặc định khi thiếu header)");
  await assert.rejects(m.downloadScratch("p/none"), /scratch p\/none: HTTP 404/);
});

test("removeScratch: danh sách rỗng thì không gọi mạng; có thì DELETE với prefixes; lỗi mạng bị nuốt", async () => {
  await m.removeScratch([]);
  assert.equal(db.calls.length, 0);
  db.files.set("scratch/a/b", { data: Buffer.from("x") });
  await m.removeScratch(["a/b"]);
  assert.equal(db.calls[0].method, "DELETE");
  assert.deepEqual(db.calls[0].body, { prefixes: ["a/b"] });
  assert.equal(db.files.has("scratch/a/b"), false);
  db.override = () => Promise.reject(new Error("net"));
  await assert.doesNotReject(m.removeScratch(["x"]));
});
