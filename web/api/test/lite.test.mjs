import { makeDb, installFetch, fresh, mkReq, call } from "./harness.mjs";
import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

let db, undo;
beforeEach(() => { db = makeDb(); undo = installFetch(db); mock.method(console, "warn", () => {}); });
afterEach(() => { undo(); mock.restoreAll(); mock.timers.reset(); });

const get = (h, query, auth = "Bearer member-token") => call(h, mkReq({ query, headers: auth ? { authorization: auth } : {} }));
const specs = (...rows) => rows.map(([item, requirement]) => ({ item, requirement }));
const tender = (technicalSpecs, extra = {}) => ({ status: "done", analyzedAt: "2026-11-01", result: { keyFacts: { cap: "500 kVA" }, highlights: ["h"], technicalSpecs, ...extra } });
const viewCalls = () => db.where((c) => c.path === "/rest/v1/analysis_lite");
const wholeReads = () => db.where((c) => c.path === "/rest/v1/docs");

test("Chỉ nhận GET và coll=analysis; ids sai dạng hoặc quá 300 thì 400", async () => {
  const h = await fresh("lite.js");
  assert.equal((await call(h, mkReq({ method: "POST", query: { coll: "analysis" } }))).statusCode, 405);
  for (const coll of ["", "supplier", "hsmt", "analysis,quote"]) assert.equal((await get(h, { coll })).statusCode, 400, coll);
  for (const ids of ["a b", "a;b", 'a"b', "a,,b", "a/b", "x".repeat(201)]) assert.equal((await get(h, { coll: "analysis", ids })).statusCode, 400, ids);
  assert.equal((await get(h, { coll: "analysis", ids: Array.from({ length: 301 }, (_, i) => "i" + i).join(",") })).statusCode, 400);
  assert.equal((await get(h, { coll: "analysis", ids: Array.from({ length: 300 }, (_, i) => "i" + i).join(",") })).statusCode, 200, "đúng 300 là biên còn được");
});

test("Bỏ technicalSpecs, chỉ giữ dòng nêu công suất có số kèm kVA/kW; gắn _lite", async () => {
  db.put("analysis", "IB1", tender(specs(
    ["Công suất", "500 kVA"], ["Điện áp", "400/230 V"], ["Động cơ", "Cummins, 4 kỳ"],
    ["Công suất dự phòng", "550 kva"], ["Công suất", "Theo yêu cầu"], ["Tần số", "50 Hz"],
  )));
  const [row] = (await get(await fresh("lite.js"), { coll: "analysis" })).jsonBody;
  assert.equal(row.data._lite, true);
  assert.deepEqual(row.data.result.technicalSpecs, specs(["Công suất", "500 kVA"], ["Công suất dự phòng", "550 kva"]));
  assert.deepEqual(row.data.result.keyFacts, { cap: "500 kVA" }, "các trường khác của result giữ nguyên");
  assert.deepEqual(row.data.result.highlights, ["h"]);
  assert.equal(row.data.status, "done");
});

test("Dòng công suất: số phải nằm ở requirement kèm đơn vị kVA/kW; có chữ 'công suất' ở requirement cũng tính", async () => {
  db.put("analysis", "IB1", tender(specs(
    ["Máy phát điện", "Công suất liên tục 400 kW"],  // giữ: item không nêu nhưng requirement nêu
    ["Công suất", "500"],                              // bỏ: không có đơn vị
    ["Công suất", "500kVA"],                           // giữ: sát nhau
    ["Công suất", "500 kVAr"],                         // bỏ: kVAr không phải kVA/kW (\\b)
    ["Power", "250 KW"],                               // giữ: tiếng Anh, hoa thường
    ["Kích thước", "2 kW tiêu thụ phụ"],               // giữ: có chữ kw và số kèm kW (khoá hành vi)
  )));
  const rows = (await get(await fresh("lite.js"), { coll: "analysis" })).jsonBody[0].data.result.technicalSpecs;
  // 4 dòng đủ điều kiện nhưng chỉ giữ 3 dòng đầu; dòng "2 kW tiêu thụ phụ" (khoá hành vi) đứng thứ 4 nên bị cắt.
  assert.deepEqual(rows.map((x) => x.requirement), ["Công suất liên tục 400 kW", "500kVA", "250 KW"]);
});

test("Tối đa 3 dòng công suất", async () => {
  db.put("analysis", "IB1", tender(specs(...Array.from({ length: 8 }, (_, i) => ["Công suất " + i, `${100 * (i + 1)} kVA`]))));
  const rows = (await get(await fresh("lite.js"), { coll: "analysis" })).jsonBody[0].data.result.technicalSpecs;
  assert.deepEqual(rows.map((x) => x.item), ["Công suất 0", "Công suất 1", "Công suất 2"], "giữ ba dòng đầu theo thứ tự");
});

test("Gói không có technicalSpecs (chưa phân tích, lỗi) vẫn được gắn _lite và giữ nguyên dữ liệu", async () => {
  db.put("analysis", "E1", { status: "error", error: "hết hạn" });
  db.put("analysis", "E2", { status: "done", result: { keyFacts: {} } });
  db.put("analysis", "E3", tender([]));
  const rows = (await get(await fresh("lite.js"), { coll: "analysis" })).jsonBody;
  assert.deepEqual(rows.find((r) => r.id === "E1").data, { status: "error", error: "hết hạn", _lite: true });
  assert.deepEqual(rows.find((r) => r.id === "E2").data, { status: "done", result: { keyFacts: {} }, _lite: true });
  assert.deepEqual(rows.find((r) => r.id === "E3").data.result.technicalSpecs, []);
});

test("Phần tử technicalSpecs null / thiếu trường không làm hỏng cả trang", async () => {
  db.put("analysis", "IB1", tender([null, {}, { item: "Công suất" }, { item: "x", requirement: "300 kVA" }]));
  const rows = (await get(await fresh("lite.js"), { coll: "analysis" })).jsonBody[0].data.result.technicalSpecs;
  assert.deepEqual(rows, [{ item: "x", requirement: "300 kVA" }]);
});

test("Trả [{ id, updated_at, data }] theo thứ tự id, không cache", async () => {
  db.put("analysis", "B", tender([]), "2026-11-02T00:00:00.000Z").put("analysis", "A", tender([]), "2026-11-01T00:00:00.000Z");
  const r = await get(await fresh("lite.js"), { coll: "analysis" });
  assert.deepEqual(r.jsonBody.map((x) => [x.id, x.updated_at]), [["A", "2026-11-01T00:00:00.000Z"], ["B", "2026-11-02T00:00:00.000Z"]]);
  assert.equal(r.headers["cache-control"], "no-store");
});

test("Đọc bằng token của người dùng (RLS quyết định), không dùng khoá dịch vụ", async () => {
  db.put("analysis", "A", tender([]));
  await get(await fresh("lite.js"), { coll: "analysis" });
  for (const c of db.calls) {
    assert.equal(c.headers.Authorization, "Bearer member-token");
    assert.equal(c.headers.apikey, "anon-key-for-tests");
  }
});

test("Phân trang 300 dòng/trang bằng Range: from=0 → 0-299, from=600 → 600-899; from âm hoặc rác → 0", async () => {
  for (let i = 0; i < 650; i++) db.put("analysis", "G" + String(i).padStart(4, "0"), tender([]));
  const h = await fresh("lite.js");
  assert.equal((await get(h, { coll: "analysis", from: "0" })).jsonBody.length, 300);
  assert.equal((await get(h, { coll: "analysis", from: "600" })).jsonBody.length, 50);
  assert.equal((await get(h, { coll: "analysis", from: "-50" })).jsonBody[0].id, "G0000");
  assert.equal((await get(h, { coll: "analysis", from: "abc" })).jsonBody[0].id, "G0000");
  const ranges = wholeReads().map((c) => c.headers.Range);
  assert.deepEqual(ranges, ["0-299", "600-899", "0-299", "0-299"]);
  assert.ok(db.calls.every((c) => c.search.includes("order=id")), "truy vấn phân trang có order");
});

test("ids= chỉ đọc các gói đó", async () => {
  for (const id of ["A", "B", "C"]) db.put("analysis", id, tender([]));
  const r = await get(await fresh("lite.js"), { coll: "analysis", ids: "A,C,Z" });
  assert.deepEqual(r.jsonBody.map((x) => x.id), ["A", "C"]);
});

test("Lỗi đọc: 401 của Supabase → 401 (token hết hạn), lỗi khác → 502 'read <mã>'", async () => {
  const h = await fresh("lite.js");
  db.override = (req) => (req.u.pathname === "/rest/v1/docs" ? new Response("x", { status: 401 }) : null);
  assert.deepEqual([(await get(h, { coll: "analysis" })).statusCode], [401]);
  db.override = (req) => (req.u.pathname === "/rest/v1/docs" ? new Response("x", { status: 500 }) : null);
  const r = await get(h, { coll: "analysis" });
  assert.equal(r.statusCode, 502);
  assert.equal(r.jsonBody.error, "read 500");
  db.override = (req) => { if (req.u.pathname === "/rest/v1/docs") throw new Error("mạng đứt"); };
  const n = await get(h, { coll: "analysis" });
  assert.equal(n.statusCode, 502);
  assert.equal(n.jsonBody.error, "mạng đứt");
});

// ---------- view analysis_lite ----------
test("Có view analysis_lite: đọc bản rút gọn từ Postgres, không đọc nguyên dòng; khoá _lite đặt cuối để JSON giống bản cắt ở đây", async () => {
  db.liteView = "ok";
  db.put("analysis", "A", tender(specs(["Công suất", "500 kVA"])));
  const r = await get(await fresh("lite.js"), { coll: "analysis" });
  assert.equal(viewCalls().length, 1);
  assert.equal(wholeReads().length, 0);
  assert.equal(Object.keys(r.jsonBody[0].data).at(-1), "_lite");
  assert.equal(r.jsonBody[0].data._lite, true);
  assert.equal(r.jsonBody[0].data.status, "done");
});

test("View: 401 → 401 ngay, không lùi (đọc nguyên dòng cũng sẽ 401)", async () => {
  db.liteView = 401;
  const r = await get(await fresh("lite.js"), { coll: "analysis" });
  assert.equal(r.statusCode, 401);
  assert.equal(wholeReads().length, 0);
});

for (const [name, mode] of [["chưa tạo (404)", 404], ["lỗi 500", 500], ["trả dòng không phải bản rút gọn", "notlite"], ["lỗi mạng", "throw"]]) {
  test(`View ${name}: lùi về đọc nguyên dòng rồi cắt tại chỗ; 10 phút không thử lại view`, async () => {
    db.liteView = mode;
    db.put("analysis", "A", tender(specs(["Công suất", "500 kVA"], ["Điện áp", "400 V"])));
    const h = await fresh("lite.js");
    mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-11-13T05:00:00Z") });
    const r = await get(h, { coll: "analysis" });
    assert.equal(r.statusCode, 200);
    assert.deepEqual(r.jsonBody[0].data.result.technicalSpecs, specs(["Công suất", "500 kVA"]));
    assert.equal(r.jsonBody[0].data._lite, true);
    await get(h, { coll: "analysis" });
    assert.equal(viewCalls().length, 1, "một yêu cầu = một cuộc gọi trong 10 phút");
    mock.timers.tick(10 * 60e3);
    await get(h, { coll: "analysis" });
    assert.equal(viewCalls().length, 2);
  });
}

test("View trả danh sách rỗng là hợp lệ (không phải lỗi): không lùi", async () => {
  db.liteView = "ok";
  const r = await get(await fresh("lite.js"), { coll: "analysis" });
  assert.deepEqual(r.jsonBody, []);
  assert.equal(wholeReads().length, 0);
});
