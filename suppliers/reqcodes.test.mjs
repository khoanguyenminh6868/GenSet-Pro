// node --test suppliers/*.test.mjs — the requirement codes of Gợi ý cấu hình (reqcodes.mjs, Khoa 2026-11-06).
import test from "node:test";
import assert from "node:assert/strict";
import { REQ_CODES, codeOf, withCode, missingCodes, codesIn } from "./reqcodes.mjs";
import { check } from "./config-bot.mjs";

test("codeOf: the agent's item names (as past runs wrote them) map to one code each", () => {
  const cases = [
    ["Công suất liên tục (Prime)", "power_prime"], ["Tổ máy phát điện: Công suất dự phòng", "power_standby"], ["Điện áp, số pha", "voltage"], ["Số pha", "phases"],
    ["Tần số", "frequency"], ["Hệ số công suất", "power_factor"], ["Tiêu hao nhiên liệu 50% tải", "fuel_consumption_50"], ["Tiêu hao nhiên liệu 100% tải", "fuel_consumption"],
    ["Tiêu hao nhiên liệu", "fuel_consumption"], ["Kiểu động cơ", "engine_type"], ["Hệ thống khởi động", "starting"], ["Dung tích xi lanh", "displacement"], ["Số xy lanh", "cylinders"],
    ["Hãng động cơ", "engine_make"], ["Xuất xứ động cơ", "engine_origin"], ["Hãng, model đầu phát", "alt_make"], ["Cấp cách điện đầu phát", "alt_insulation"], ["Cấp bảo vệ đầu phát", "alt_ip"],
    ["Đầu phát không chổi than", "alt_type"], ["Làm mát đầu phát bằng quạt", "alt_cooling"], ["Méo sóng hài (THD)", "alt_thd"], ["Biến thiên tần số xác lập", "freq_regulation"],
    ["Bồn dầu dưới chân máy", "fuel_tank"], ["Kích thước máy trần", "dimensions"], ["Độ ồn (máy có vỏ cách âm)", "noise"], ["Xuất xứ tổ máy", "genset_origin"], ["Hãng sản xuất tổ máy", "genset_make"],
    ["Tiêu chuẩn ISO 8528", "iso8528_class"], ["Chứng nhận prototype tested", "prototype"], ["Tiêu chuẩn ISO 9001:2015", "standards"], ["Nhận tải một bước", "load_step"], ["Khả năng quá tải", "overload"],
    ["Chức năng bảo vệ", "ctl_protection"], ["Tự động cấp điện, bật/tắt máy", "ctl_start_amf"], ["Hiển thị thông số", "ctl_measure"], ["Truyền thông RS485", "ctl_comm"], ["Hãng bộ điều khiển", "ctl_make"],
    ["Model bộ điều khiển", "ctl_model"], ["Nhiệt độ làm việc", "ambient"], ["Tỷ số nén", "compression"], ["Bộ điều tốc", "governor"], ["Tốc độ vòng quay", "speed"],
    ["Dòng điện định mức", "current"], ["Dung tích nước làm mát", "coolant_capacity"], ["Hãng / nơi sản xuất động cơ", "engine_make"], ["Nơi sản xuất đầu phát", "alt_origin"], ["Động cơ", "engine_make"],
    ["Công suất cực đại động cơ", "engine_power"], ["Đường kính xi lanh", "bore_stroke"], ["Tải trọng máy tĩnh", "weight"], ["Tủ đóng cắt MCCB", "breaker"], ["Hệ số công suất đầu phát", "power_factor"], ["Lưu lượng khí thải tại công suất dự phòng", "exhaust"],
  ];
  for (const [item, code] of cases) assert.equal(codeOf({ item }), code, item);
  // The part the agent gave decides between an engine's and an alternator's cooling; a check-less name is "other".
  assert.equal(codeOf({ item: "Làm mát", part: "alternator" }), "alt_cooling");
  assert.equal(codeOf({ item: "Làm mát", part: "engine" }), "cooling");
  assert.equal(codeOf({ item: "Màu sơn vỏ máy" }), "other");
  assert.equal(codeOf({ code: "cylinders", item: "gì cũng được" }), "cylinders");
  assert.deepEqual(withCode({ item: "Số xy lanh", requirement: "≥ 6", part: "genset", level: "option" }), { item: "Số xi lanh", requirement: "≥ 6", part: "engine", level: "core", code: "cylinders", kind: "model" });
  assert.ok(REQ_CODES.every((c) => c.code && c.item && c.part && c.level && c.words instanceof RegExp));
  assert.equal(new Set(REQ_CODES.map((c) => c.code)).size, REQ_CODES.length);
});

test("missingCodes: lines of the HSMT about codes no requirement carries; a text saying 'không nêu' names none", () => {
  const hsmt = "Chương V\nCông suất liên tục ≥ 400 kVA\nĐiện áp: 380/220 V\nSố pha: 3 pha\nCấp cách điện: H\nĐộ ồn ≤ 75 dBA tại 7 m\nTiêu hao nhiên liệu ở 100% tải ≤ 85 L/h";
  const miss = missingCodes(hsmt, [{ code: "power_prime" }, { code: "voltage" }]);
  assert.deepEqual(miss.map((m) => m.code), ["phases", "alt_insulation", "fuel_consumption"]);
  assert.match(miss[0].line, /Số pha/);
  assert.deepEqual(codesIn("Độ ồn: Không nêu trong tài liệu"), []);
});

test("check: requirements take their code's item, part and level; duplicates merge; checks are renamed", () => {
  const sup = [{ id: "s", specTables: [{ n: 101, title: "", header: ["| Model | Prime kVA | Engine | Alternator"], rows: ["| SQP500 | 450 | 2506C-E15TAG1 | HCI544C"] }] }];
  const row = { kind: "catalog", supplierId: "s", n: 101, line: "| SQP500 | 450 | 2506C-E15TAG1 | HCI544C" };
  const hsmt = "Công suất liên tục (Prime): ≥ 450 kVA\nSố xy lanh: 6\nĐiện áp 380/220V\nĐiện áp định mức 380/220V";
  const r = { requirements: [
      { item: "Công suất", requirement: "≥ 450 kVA prime", quote: "Công suất liên tục (Prime): ≥ 450 kVA", part: "genset", level: "core" },
      { item: "Số xy lanh", requirement: "6", quote: "Số xy lanh: 6", part: "genset", level: "option" },
      { item: "Điện áp", requirement: "380/220 V", quote: "Điện áp 380/220V", part: "genset", level: "core" },
      { item: "Điện áp định mức", requirement: "380/220 V định mức", quote: "Điện áp định mức 380/220V", part: "alternator", level: "core" },
      { item: "Màu sơn", requirement: "xanh", quote: "", part: "genset", level: "option" }],
    configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src: row }, alternator: { model: "HCI544C", src: row }, genset: { model: "SQP500", src: row },
      checks: [{ item: "Công suất", hsmtQuote: "Công suất liên tục (Prime): ≥ 450 kVA", offered: "450 kVA", sourceQuote: "450", part: "genset", status: "met" },
        { item: "Số xy lanh", offered: "", sourceQuote: "", part: "genset", status: "unclear" }, { item: "Điện áp định mức", offered: "", sourceQuote: "", part: "alternator", status: "unclear" }] }] };
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb: () => null });
  assert.deepEqual(result.requirements.map((q) => [q.code, q.item, q.part, q.level]), [
    ["power_prime", "Công suất liên tục", "genset", "core"], ["cylinders", "Số xi lanh", "engine", "core"], ["voltage", "Điện áp", "genset", "core"], ["other", "Màu sơn", "genset", "option"]]);
  assert.equal(result.requirements[2].requirement, "380/220 V; 380/220 V định mức");
  const items = result.configs[0].checks.map((x) => x.item);
  assert.ok(items.includes("Công suất liên tục") && items.includes("Số xi lanh") && items.includes("Điện áp") && !items.includes("Điện áp định mức"), items.join(", "));
  assert.equal(result.configs[0].checks.find((x) => x.item === "Số xi lanh").itemWas, "Số xy lanh");
});

test("missingCodes: a goods-table cell holding a whole specification is read clause by clause", () => {
  const cell = "1\tMáy phát điện Cummins 150 KVA\tTổ máy\t1\t1* Thông số động cơ:Động cơ 6BTAA5.9G12 Loại động cơ :Diesel 4 thì có turbo tăng áp Tỷ số nén:17.3:1 Dung tích dầu bôi trơn:16.4 lít Tiêu thụ nhiên liệu:34 lít/giờ ở 100% tải 2* Thông số đầu phát: Hãng sản xuất :Leroy Somer Số pha, dây:3 pha, 4 dây Cấp cách điện:Cấp H " + "x".repeat(60);
  const codes = missingCodes(cell, [], 40).map((m) => m.code);
  for (const c of ["engine_type", "compression", "oil_capacity", "fuel_consumption", "alt_make", "phases", "alt_insulation"]) assert.ok(codes.includes(c), c);
  assert.ok(!codes.includes("current"));
});
