// Bộ kiểm giá trị từng thông số: ca lấy từ dòng thật của cn/ (ghi NCC + n), cả số đúng từng bị chặn nhầm. Hàm thuần, không dựng lại bản chuẩn.
import test from "node:test";
import assert from "node:assert/strict";
import { FIELDS } from "./spec-standard.mjs";
import { RULES, checkValue, numsOf, ownUnitKinds, ratingClash, levelSwaps, dutySwaps, dupCodes, dupKind, looseCode, checkDocs } from "./spec-value-check.mjs";

const rulesOf = (part, id, it, ctx) => checkValue(part, id, it, ctx).map((x) => x.rule);
const ok = (part, id, it, ctx) => assert.deepEqual(rulesOf(part, id, it, ctx), [], `${part}.${id} ${JSON.stringify(it.value)}`);
const bad = (part, id, it, rule, ctx) => assert.ok(rulesOf(part, id, it, ctx).includes(rule), `${part}.${id} ${JSON.stringify(it.value)} phải báo ${rule}`);

test("mọi luật trỏ đúng trường của spec-fields.json và ghi căn cứ", () => {
  for (const [k, r] of Object.entries(RULES)) {
    const [p, id] = k.split(".");
    assert.ok(FIELDS.parts[p].some((f) => f.id === id), k);
    assert.ok(r.basis, `${k} thiếu căn cứ`);
  }
});
test("đọc số: phẩy nghìn, phẩy thập phân, danh sách", () => {
  assert.deepEqual(numsOf("1,200"), [1200]);
  assert.deepEqual(numsOf("12,5"), [12.5]);
  assert.deepEqual(numsOf("397/361"), [397, 361]);
  assert.deepEqual(numsOf([180, 225]), [180, 225]);
});
test("đơn vị chỉ xét ngay sau số của chính giá trị", () => {
  assert.deepEqual(ownUnitKinds("2650 kg / 600 L", 600), ["volume"]); // mpmc n123
  assert.deepEqual(ownUnitKinds("220V / 50Hz", 220), ["volt"]); // cameo n117
  ok("genset", "tank", { value: 260, unit: "L", raw: "260L (7–8 hours at full load)" }); // jiuan n141
});
test("tỉ số nén không mang kg / L", () => {
  ok("engine", "compression", { value: 17.3, raw: "17.3:1" });
  bad("engine", "compression", { value: 16.5, raw: "16.5 kg" }, "sai-loai");
  bad("engine", "compression", { value: 12, raw: "12 L" }, "sai-loai");
  bad("engine", "compression", { value: 3, raw: "16 3:1" }, "ngoai-dai"); // gfe-power n1023
});
test("dung tích không mang mm", () => {
  ok("engine", "displacement", { value: 257, unit: "L", raw: "257 L" }); // Weichai 8WH32
  ok("engine", "displacement", { value: 105.56, unit: "L", raw: "105.56" }); // Yuchai YC16VC
  bad("engine", "displacement", { value: 150, raw: "150 mm" }, "sai-loai");
});
test("số thật từng bị chặn nhầm vẫn đạt", () => {
  ok("genset", "voltage", { value: 10500, unit: "V", raw: "10500V" });
  ok("genset", "voltage", { value: 220, unit: "V", raw: "220V / 50Hz" });
  ok("engine", "speed", { value: 1200, unit: "rpm", raw: "1200 rpm" });
  ok("engine", "speed", { value: 2200, raw: "2200" }); // zhengdian ZS1100
  ok("engine", "cylinders", { value: 12, raw: "12V" });
  ok("engine", "cooling", { value: "wassergekühlt", raw: "wassergekühlt" }); // endress n1001
});
test("kích thước: hai bản trong một ô đạt, số dính nhau báo", () => {
  ok("genset", "dimensions", { value: [3000, 1120, 1950, 4000, 1430, 2040], unit: "mm", raw: "3000×1120×1950 / 4000×1430×2040 mm" }); // generatordieselchina n112
  bad("genset", "dimensions", { value: [1400, 660, 8401450, 660, 840], raw: "1400X660X8401450X660X840" }, "so-chieu"); // changchai n2001
  bad("genset", "dimensions", { value: "3130 × 115 × 1850", unit: "mm", raw: "3130*115*1850" }, "ngoai-dai"); // aoke n127
  assert.equal(checkValue("genset", "dimensions", { value: "2580 × 1100 × 1666", unit: "m", raw: "2580×1100×1666" }).length, 1); // yingtai n107: một giá trị một vi phạm
});
test("tiêu hao theo kW của dòng, máy lớn và máy nhỏ", () => {
  ok("genset", "fuel_100", { value: 854.1, unit: "L/h", raw: "854.1" }, { kws: [2800, 3200] }); // aosif AW3500
  ok("genset", "fuel_50", { value: 3.1, unit: "L/h", raw: "3,1 L/h" }, { kws: [10.4] }); // powerpack PG13-Y
  bad("genset", "fuel_100", { value: 650, unit: "L/h", raw: "650" }, "lech-cong-suat", { kws: [580, 650] }); // fukangsi n2011: số kW chép vào cột tiêu hao
  bad("genset", "fuel_100", { value: 418, unit: "g/kWh", raw: "≤418" }, "ngoai-dai", { kws: [1500] }); // bdadl n104
});
test("nhầm mức prime / standby", () => {
  assert.equal(ratingClash("prime", "110 kW standby"), true);
  assert.equal(ratingClash("standby", "110 kW prime"), true);
  assert.equal(ratingClash("prime", "4,9kW prp ; 5,4kW standby"), false);
  const src = { supplierId: "depco-power", n: 2050, table: 54, row: null };
  const items = [{ value: { rating: "prime", kva: 70, kw: 50, hz: 60 }, src }, { value: { rating: "standby", kva: 69, kw: 55, hz: 60 }, src }];
  assert.equal(levelSwaps(items, "kva").length, 1);
  assert.equal(levelSwaps(items, "kw").length, 0);
  // khác dòng nguồn thì không so
  assert.equal(levelSwaps([items[0], { ...items[1], src: { ...src, n: 1 } }], "kva").length, 0);
  const d = (duty, kva) => ({ value: { voltage: 400, connection: "Y", phases: 3, hz: 50, duty, kva }, src: { supplierId: "x", n: 1 } });
  assert.equal(dutySwaps([d("continuous", 100), d("standby", 110)]).length, 0);
  assert.equal(dutySwaps([d("continuous", 100), d("standby", 90)]).length, 1);
});
test("công suất động cơ lẫn tốc độ trong ô", () => {
  bad("engine", "power_kwm", { value: { rating: null, rpm: null, kwm: [15, 20, 1500] }, unit: "kW", raw: "15/20/1500" }, "lan-toc-do"); // ricardo n107
  ok("engine", "power_kwm", { value: { rating: null, rpm: null, kwm: [4.9, 5.4] }, unit: "kW", raw: "4,9kW prp ; 5,4kW standby" });
});
test("giá trị hỏng và chữ sai loại", () => {
  bad("engine", "emission", { value: "[object Object]", raw: "T2" }, "gia-tri-hong");
  bad("engine", "engine_type", { value: "Turbocharged", raw: "Turbocharged" }, "sai-loai"); // jet-power n125
  bad("engine", "coolant_capacity", { value: "50% ethylene", raw: "50% ethylene" }, "sai-loai"); // aosif n1088
});
test("trùng mã: khác khoá cùng mã; khoá theo NCC và tên tổ máy của NCC khác không tính", () => {
  assert.equal(looseCode("4BTA3.9-G2"), looseCode("4BTA3.9 G2/"));
  const docs = [
    { part: "engine", key: "4BTA39G2", model: "4BTA3.9-G2", suppliers: ["a"], fields: {} },
    { part: "engine", key: "4BTA39G2/", model: "4BTA3.9-G2/", suppliers: ["b"], fields: {} },
    { part: "alternator", key: "a|STC10", model: "STC-10", suppliers: ["a"], fields: {} },
    { part: "alternator", key: "b|STC10", model: "STC-10", suppliers: ["b"], fields: {} },
    { part: "genset", supplierId: "a", models: { "200GF": { model: "200GF", fields: {} } } },
    { part: "genset", supplierId: "b", models: { "200GF": { model: "200GF", fields: {} } } },
  ];
  const r = dupCodes(docs);
  assert.equal(r.list.length, 1);
  assert.equal(r.list[0].part, "engine");
  assert.equal(r.scoped, 1);
  assert.equal(dupKind(["6M31G800/6", "6M31G800/6^"]), "dau-co-nghia");
  assert.equal(dupKind(["KTA19-D(M)", "KTA19-DM"]), "ngoac-m-e");
  assert.equal(dupKind(["4HTAA4.3*G34", "4HTAA4.3-G34"]), "khac");
});
test("chỉ báo: không đổi doc; trường chưa có luật được liệt kê", () => {
  const docs = [{ part: "engine", key: "X", model: "X", suppliers: ["a"], fields: { compression: [{ value: 3, raw: "16 3:1", src: { supplierId: "a", n: 1, table: 0, row: 0 }, suppliers: 1 }] } }];
  const before = JSON.stringify(docs);
  const r = checkDocs(docs, [{ id: "a", specTables: [{ rows: ["| X | 16 3:1"] }] }]);
  assert.equal(JSON.stringify(docs), before);
  assert.equal(r.violations.length, 1);
  assert.equal(r.violations[0].row, "| X | 16 3:1");
  assert.ok(r.noRule.some((x) => x.field === "controller.usb"));
  assert.ok(!r.noRule.some((x) => x.field === "engine.compression"));
});
