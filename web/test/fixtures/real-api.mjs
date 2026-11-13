// Cho yêu cầu mà trang gửi (genbidApi("/api/webreq", body), ghi ở window.__gb.api) đi qua handler THẬT web/api/webreq.js,
// với Supabase giả trong bộ nhớ của test API (web/api/test/harness.mjs). Kiểm được trường nào bot thật sự nhận: webreq.js
// lọc trường theo danh sách, trường trang gửi mà danh sách thiếu thì mất.
import { makeDb, installFetch, fresh, mkReq, call } from "../../api/test/harness.mjs";

export async function throughWebreq(body) {
  const db = makeDb();
  db.member("tok-test", "member@example.invalid", "superadmin");
  const undo = installFetch(db);
  try {
    const h = await fresh("webreq.js");
    const r = await call(h, mkReq({ method: "POST", body, token: "tok-test" }));
    return { status: r.statusCode, saved: r.jsonBody?.saved || [], error: r.jsonBody?.error };
  } finally { undo(); }
}
