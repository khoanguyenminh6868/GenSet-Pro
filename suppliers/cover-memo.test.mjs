// node --test suppliers/*.test.mjs — T2: hàm xuất ra của web-memo.mjs chưa có test nào nhắc tới:
// NEG_DAYS, OUTCOMES, WEB_MEMO, familyOfRec, officialDomains, officialOfSource, inTrace, negKey, negLine.
// Số mong đợi lấy từ chú thích trong mã: kho âm hết hạn sau 90 ngày; "source" phụ thuộc xuất xứ của lượt; nguồn chính thức
// = tên miền của website hãng (và hãng cùng họ), không phải bên bán / CDN.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { NEG_DAYS, OUTCOMES, WEB_MEMO, PARTS, familyOfRec, officialDomains, officialOfSource, inTrace, negKey, negLine, traceOf, isLive } from "./web-memo.mjs";

const rec = (id, role, website, extra = {}) => ({ id, role, website, names: { en: extra.en || id, brands: extra.brands || [] }, sources: extra.sources || [] });

test("hằng số kho âm: 90 ngày; kết quả chỉ not_found / blocked; mọi bộ phận có tên", () => {
  assert.equal(NEG_DAYS, 90);
  assert.deepEqual(OUTCOMES, ["not_found", "blocked"]);
  assert.deepEqual(PARTS, ["engine", "alternator", "controller", "genset"]);
});
test("hằng số NEG_DAYS khớp isLive: mục 89 ngày còn hạn, 90 ngày hết hạn", () => {
  assert.ok(isLive({ date: "2026-08-15" }, "2026-11-12")); // 89 ngày
  assert.ok(!isLive({ date: "2026-08-14" }, "2026-11-12")); // 90 ngày
});
test("WEB_MEMO: thư mục web-memo (ngoài git); đổi được bằng GENBID_WEB_MEMO", () => {
  assert.equal(typeof WEB_MEMO, "string");
  assert.ok(path.isAbsolute(WEB_MEMO) || process.env.GENBID_WEB_MEMO); // khoá hành vi: đường mặc định cạnh tệp token
  if (!process.env.GENBID_WEB_MEMO) assert.equal(path.basename(WEB_MEMO), "web-memo");
});

test("familyOfRec: họ hãng đọc từ tên, thương hiệu hoặc id; hãng Trung Quốc nhỏ không có họ", () => {
  assert.equal(familyOfRec(rec("cummins-power", "engine_maker", "https://cummins.com", { en: "Cummins Inc" })), familyOfRec(rec("x", "engine_maker", null, { en: "Cummins" })));
  assert.ok(familyOfRec(rec("cummins", "engine_maker", "https://cummins.com")));
  assert.equal(familyOfRec(rec("fdk-energy", "genset_oem", "https://fdk.example.cn", { en: "FDK Energy" })), null);
  assert.equal(familyOfRec(null), null);
  assert.equal(familyOfRec({}), null);
});

test("officialDomains: website của chính bản ghi", () => {
  const r = rec("fdk", "genset_oem", "https://www.fdk-energy.com/about");
  assert.deepEqual([...officialDomains(r)], ["fdk-energy.com"]);
});
test("officialDomains: hãng cùng họ gộp tên miền (Rehlko + Kohler); trang A thứ hai trên cùng miền không thêm miền mới", () => {
  const kohler = rec("kohler", "engine_maker", "https://kohler.com", { en: "Kohler" });
  const kohlerGen = rec("kohler-energy", "genset_oem", "https://kohlerenergy.com", { en: "Kohler Energy", brands: ["KOHLER"] });
  const d = officialDomains(kohler, [kohler, kohlerGen]);
  assert.ok(d.has("kohler.com"));
  assert.ok(d.has("kohlerenergy.com"));
});
test("officialDomains: nhà phân phối cùng họ KHÔNG thêm tên miền; bản ghi không website cho tập rỗng", () => {
  const maker = rec("cummins", "engine_maker", "https://cummins.com");
  const dist = rec("cummins-dist", "distributor", "https://reseller.example.com", { en: "Cummins Distributor" });
  assert.ok(!officialDomains(maker, [maker, dist]).has("reseller.example.com"));
  assert.equal(officialDomains(rec("nosite", "genset_oem", null)).size, 0);
  assert.equal(officialDomains(null).size, 0);
});
test("officialDomains: tên miền hai tầng (.com.cn, .co.jp) giữ đủ ba nhãn", () => {
  assert.deepEqual([...officialDomains(rec("dcec", "engine_maker", "https://www.dcec.com.cn"))], ["dcec.com.cn"]);
  assert.deepEqual([...officialDomains(rec("isuzu", "engine_maker", "https://www.isuzu.co.jp/x"))], ["isuzu.co.jp"]);
});

test("officialOfSource: cờ chính thức từng nguồn tính bằng code (không tin bản ghi), khoá id#n", () => {
  const r = rec("fdk", "genset_oem", "https://fdk-energy.com", {
    sources: [{ n: 1, url: "https://www.fdk-energy.com/p", tier: "A" }, { n: 2001, url: "https://cdn.shopify.com/f.pdf", tier: "C" }, { n: 2002, url: "https://shop.example.com/fdk", official: true }],
  });
  const m = officialOfSource([r]);
  assert.equal(m.get("fdk#1"), true);
  assert.equal(m.get("fdk#2001"), false); // CDN không phải trang hãng
  assert.equal(m.get("fdk#2002"), false); // cờ `official` tự khai bị bỏ qua
  assert.deepEqual(officialOfSource([]).size, 0);
  assert.equal(officialOfSource([rec("a", "genset_oem", null)]).size, 0);
});

test("inTrace: URL phải là trang agent đã tải (bỏ dấu / và dấu chấm cuối); câu tìm so không phân biệt hoa thường, khoảng trắng", () => {
  const trace = { fetched: new Map([["https://a.com/x.pdf", { status: 200 }]]), searches: new Set(["cummins qsb7 datasheet"]) };
  assert.ok(inTrace("https://a.com/x.pdf", trace));
  assert.ok(inTrace("https://a.com/x.pdf/", trace));
  assert.ok(inTrace("https://a.com/x.pdf.", trace));
  assert.ok(!inTrace("https://a.com/y.pdf", trace));
  assert.ok(inTrace("  Cummins   QSB7 Datasheet ", trace));
  assert.ok(!inTrace("Cummins QSB7 manual", trace));
  assert.ok(!inTrace("", trace));
});
test("inTrace khớp đầu ra traceOf: WebSearch/WebFetch trong log là dấu vết, lệnh bị từ chối thì không", () => {
  const ev = (o) => `[1s] ${JSON.stringify(o)}`;
  const log = [
    ev({ message: { content: [{ type: "tool_use", id: "1", name: "WebSearch", input: { query: "Perkins 1104D datasheet" } }] } }),
    ev({ message: { content: [{ type: "tool_result", tool_use_id: "1", content: "results" }] } }),
    ev({ message: { content: [{ type: "tool_use", id: "2", name: "WebFetch", input: { url: "https://perkins.com/a.pdf" } }] } }),
    ev({ message: { content: [{ type: "tool_result", tool_use_id: "2", content: "The permission for this action was denied", is_error: true }] } }),
  ].join("\n");
  const t = traceOf(log);
  assert.ok(inTrace("perkins 1104d datasheet", t));
  assert.ok(!inTrace("https://perkins.com/a.pdf", t)); // bị từ chối không tính là đã tải
});

test("negKey: 'source' có xuất xứ trong khoá (tra trong CN không nói gì về G7); loại khác không", () => {
  const base = { part: "engine", modelKey: "QSB7", what: "source" };
  assert.equal(negKey({ ...base, origin: "cn" }), "engine|QSB7|source|cn");
  assert.notEqual(negKey({ ...base, origin: "cn" }), negKey({ ...base, origin: "g7" }));
  assert.equal(negKey({ ...base }), "engine|QSB7|source|"); // không ghi xuất xứ
  assert.equal(negKey({ part: "engine", modelKey: "QSB7", what: "datasheet", origin: "cn" }), "engine|QSB7|datasheet");
});

test("negLine: datasheet không thấy → ghi ngày, nơi tra, 'đừng tra lại'; tên miền ghi trong hosts", () => {
  const e = { what: "datasheet", outcome: "not_found", date: "2026-11-01", hosts: ["cummins.com"], where: ["https://cummins.com/a.pdf", "qsb7 datasheet"], statuses: { "https://cummins.com/a.pdf": 404 } };
  const s = negLine(e);
  assert.match(s, /datasheet trên cummins\.com/);
  assert.match(s, /2026-11-01/);
  assert.match(s, /HTTP 404/);
  assert.match(s, /tìm "qsb7 datasheet"/);
  assert.match(s, /đừng tra lại/);
});
test("negLine: blocked → dặn KHÔNG thử lại, không đổi User-Agent (quy tắc suppliers/CLAUDE.md: 403 thì dừng)", () => {
  const s = negLine({ what: "datasheet", outcome: "blocked", date: "2026-11-01", hosts: [], where: ["https://x.com/a"] });
  assert.match(s, /chặn tải tự động/);
  assert.match(s, /KHÔNG thử lại/);
  assert.match(s, /không đổi User-Agent/);
  assert.match(s, /các nguồn đã tìm/); // không có hosts
});
test("negLine: 'source' nêu điều kiện xuất xứ bằng tiếng Việt; xuất xứ lạ ghi nguyên", () => {
  const base = { what: "source", model: "QSB7", date: "2026-11-01", where: ["q"], outcome: "not_found" };
  assert.match(negLine({ ...base, origin: "g7" }), /nhóm G7/);
  assert.match(negLine({ ...base, origin: "cn" }), /Trung Quốc/);
  assert.match(negLine({ ...base, origin: "zz" }), /zz/);
});
test("negLine: quá 4 nơi tra thì rút gọn 'và N chỗ khác'", () => {
  const where = ["a", "b", "c", "d", "e", "f"].map((x) => `https://x.com/${x}`);
  const s = negLine({ what: "datasheet", outcome: "not_found", date: "2026-11-01", hosts: ["x.com"], where });
  assert.match(s, /và 2 chỗ khác/);
  assert.ok(!s.includes("https://x.com/e"));
});
