// node --test suppliers/*.test.mjs — catalog-b (Khoa 19/11/2026 duyệt cả bốn): dấu chú thích trong mã động cơ, mã ở cột khác
// đọc làm động cơ (tecnogen "AUS7310"), ba dạng ô đầu phát, ngoại lệ dòng huatai n111. Mọi ca là dòng thật trong suppliers/cn
// (NCC, số bảng n ghi cạnh).
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const recs = (s, kind, notes = []) => C.fromSupplier(s, notes).filter((r) => !kind || r.kind === kind);
const names = (r) => (r.makes || []).map((m) => m.name);

test("dấu chú thích cuối mã (^ ×) và gạch ngang dài là cùng model: khoá như mã trơn", () => {
  for (const [a, b] of [["20M33G4D3/5^", "20M33G4D3/5"], ["8M33D1012E311^", "8M33D1012E311"], ["WP6D180E201^", "WP6D180E201"],
    ["KTA50-G15×", "KTA50-G15"], ["QSNT-G4×", "QSNT-G4"], ["KTA50–G3", "KTA50-G3"], ["4135D—1", "4135D-1"], ["6CT8.3–GM115", "6CT8.3-GM115"],
    ["QSK19-G4*", "QSK19-G4"]]) assert.equal(C.keyOf(a), C.keyOf(b), a);
  // "*" giữa mã (frs-shenyang n106 "4HTAA4.3*G34", hàng xóm ghi "-G33" / "-G35") KHÔNG đổi: là lỗi gõ, sửa là đoán
  assert.notEqual(C.keyOf("4HTAA4.3*G34"), C.keyOf("4HTAA4.3-G34"));
  // "2*TAD1641GE" (tổ máy hai động cơ) không phải dấu cuối
  assert.equal(C.keyOf("2*TAD1641GE"), "2*TAD1641GE");
});

test("tellhow n115: '★' (ghi chú khí thải stage-III) bỏ khỏi model; ettes n146: '★' = 'made by Perkins China' giữ, không gộp", () => {
  const tellhow = sup("tellhow-power", [{ n: 115, title: "160kW-641kW THLV (VOLVO)series diesel generator set",
    header: ["| Model | Prime power | Standby power | Overall size Length (L)×Width (W)×Height (H) | Weight | Engine model | Number of cylinders/arrangement | Displacement | Fuel consumption rate | Lubricating oil capacity | Total coolant capacity",
      "| (kW) | (kW) | mm | (Kg) | (L) | g/kw.h | (L) | (L)"],
    rows: ["| THLV200 | 200 | 220 | 2740×1372×1706 | 1930 | TAD851GE ★ | 6/L | 7.7 | 210 | 27 | 41"] }]);
  const t = recs(tellhow, "engine");
  assert.deepEqual(t.map((r) => r.model), ["TAD851GE"]);
  const ettes = { ...sup("ettes-power", [{ n: 146, title: "Perkins 2000 Series from China manufacturer - ETTES POWER",
    header: ["| Model | Prime Power | Standby Power | Engine Model | Max Power (kW/Hp) | Cyls.& Type | Dspl. (L) | Overall Dimmension (mm) | Weight (kg) | PDF D/L", "| kW | kVa | kW | kVa"],
    rows: ["| EP-10 | 7 | 9 | 8 | 10 | 403A-11G1★ | TBA | 3.L | TBA | 1150*500*1100 | 280 |"] }]) };
  const e = recs(ettes, "engine");
  assert.deepEqual(e.map((r) => r.model), ["403A-11G1★"]);
  assert.notEqual(C.keyOf(e[0].model), C.keyOf("403A-11G1"));
  // cùng dấu ở NCC khác thì bỏ (dấu của ettes có nghĩa theo chú thích của chính trang ettes)
  const other = recs({ ...ettes, id: "x-power" }, "engine");
  assert.deepEqual(other.map((r) => r.model), ["403A-11G1"]);
});

test("tecnogen n2005: mã ở cột 'Standard panel' không đọc làm động cơ; ô dưới 'Engine' dạng mã đầu phát là động cơ", () => {
  const s = sup("tecnogen", [{ n: 2005, title: "Tecnogen Enermax (Mitsubishi): model | kVA LTP/PRP 50 Hz | kVA LTP/PRP 60 Hz | engine | panel",
    header: ["| MODEL | kVA LTP | kVA PRP | kVA LTP | kVA PRP | | Regulator | Cylinder | cm3 | kWm 1500 rpm | kWm 1800 rpm | (l/h) 1500 rpm | (l/h) 1800 rpm | Aspiration | Standard panel | Automatic panel | dB(A) (•) 7 m | | | | |",
      "| | 50 Hz | | 60 Hz | | Engine | | | | | | Cons. 70% | Cons. 70% | | | | | Tank l | L | W | H | Kg"],
    rows: ["| MI12MSX* | 11 | 10 | 13.2 | 12 | S3L2 SD | M | 3 | 1318 | 9.7 | 11.8 | 2.1 | 2.5 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560",
      "| MI45TSX* | 42 | 40 | 54 | 49 | S4S DT SD | M | 4 | 3331 | 36.7 | 43.7 | 7.1 | 8.6 | T | AUS7310 | ACP 7320 | 67 | 135 | 196 | 98 | 136 | 1000"] }]);
  const notes = [];
  const e = recs(s, "engine", notes);
  assert.deepEqual(e.map((r) => [r.genset, r.model]), [["MI12MSX*", "S3L2 SD"]]);
  assert.ok(!e.some((r) => /AUS/.test(r.model)));
  assert.ok(notes.some((n) => n.reason === "ô động cơ không đọc được, mã ở cột khác" && /S4S DT SD \| AUS7310/.test(n.detail)));
});

test("bruno n101: 'KOHLER KDW 702' dưới 'Engine', mã bảng điện 'MCP 120-80' cuối dòng không là động cơ", () => {
  const s = sup("bruno-generators", [{ n: 101, title: "Bruno Generators - SITE LIGHT - SOFT LIGHT EN",
    header: ["| | MODEL | NUMBER OF HEADS | W PER LAMP | TOTAL W | CURRENT | VOLTAGE V | 50 HZ | | 60 HZ | | | | | | | | | TANK l | DIMENSIONS cm | | | MAXIMUM SIZE cm | | | WEIGHT kg | STANDARD PANEL",
      "| MODEL | NUMBER OF HEADS | W PER LAMP | TOTAL W | CURRENT | VOLTAGE V | 50 Hz | | 60 Hz | | Engine | cm3 | kWm | kWm | fuel consumption (l/h) | fuel consumption (l/h) | Aspiration | TANK (l) | DIMENSIONS (cm) | | | MAXIMUM SIZE (cm) | | | WEIGHT | STANDARD PANEL",
      "| | | | | | | kVA LTP | kVA PRP | kVA LTP | kVA PRP | | | 1500 rpm | 1800 rpm | 1500 rpm* | 1800 rpm* | | | L | W | H | L | W | H | |"],
    rows: ["| SL 9506 KL | 6 | 250 W | 1500 W | AC | 230 V | 5.3 | 4.5 | 6.5 | 6 | KOHLER KDW 702 | 686 | 5 | 5.9 | 0.8 | 0.7 | N | 140 | 245 | 130 | 230 | 245 | 280 | 920 | 1050 | MCP 120-80",
      "| SL 9606 YM | 6 | 250 W | 2000 W | AC | 230 V | 5 | 4.5 | 6.6 | 6 | YANMAR 2TNV70 | 570 | 4.2 | 5.8 | 0.6 | 0.6 | N | 140 | 245 | 130 | 230 | 245 | 280 | 920 | 1050 | MCP 120-80"] }]);
  assert.deepEqual(recs(s, "engine").map((r) => r.model), ["2TNV70"]);
});

test("taihai n102: tiêu đề '常用功率' đè hai ô làm lệch cột: ô số dưới '发动机型号' không phải dấu hiệu, động cơ giữ như cũ", () => {
  const s = sup("taihai-taizhou", [{ n: 102, title: "t", header: ["| 机组型号 | 常用功率 | 发动机型号 | 缸数 | 缸径/行程 (mm) | 排气量 (L) | 燃油消耗量 (g/kw.h) | 外形尺寸 (L×W×H) (mm) | 重量 (kg) | 技术文档", "| | KVA | KW | | | | | | |"],
    rows: ["| TH-1000GF | 1250 | 1000 | KTA50-G3 | 16V | 159/159 | 50.3 | 202 | 5100×2280×2500 | 9600 |"] }]);
  assert.deepEqual(recs(s, "engine").map((r) => r.model), ["KTA50-G3"]);
});

test("saudi-diesel n109 / n115: một hãng trước nhiều mã → mỗi mã một bản ghi Leroy-Somer, tần số trong ngoặc là của mã đó", () => {
  const n109 = sup("saudi-diesel", [{ n: 109, title: "Bobcat PG220W Diesel Generator | SDEC Saudi Arabia", header: [],
    rows: ["Standby Power: 220 / 249 kVA", "Prime Power: 200 / 226 kVA", "Engine: Hyundai P086TI", "| Alternator | Leroy Somer TAL-A44-M / TAL-A46-C", "| Dimensions | 4,400 × 1,370 × 2,100 mm", "| Weight | 2,800 kg"] }]);
  const a = recs(n109, "alternator");
  assert.deepEqual(a.map((r) => [r.model, names(r).join(",")]), [["TAL-A44-M", "Leroy-Somer"], ["TAL-A46-C", "Leroy-Somer"]]);
  const n115 = sup("saudi-diesel", [{ n: 115, title: "Bobcat PG610W 605 kVA Generator Specifications | SDEC", header: [],
    rows: ["Standby Power: 605 / 660 kVA (50 / 60 Hz)", "Prime Power: 550 / 600 kVA (50 / 60 Hz)", "Engine: Hyundai DP180LA", "| Standby Power (50 / 60 Hz) | 605 / 660 kVA",
      "| Prime Power (50 / 60 Hz) | 550 / 600 kVA", "| Frequency | 50 / 60 Hz", "| Engine | Hyundai DP180LA", "| Alternator | Leroy Somer TAL-A47-D (50 Hz) / TAL-A47-F (60 Hz)", "| Fuel Tank | 950 L (extended tank)"] }]);
  const b = recs(n115, "alternator");
  assert.deepEqual(b.map((r) => [r.model, r.freq, names(r).join(",")]), [["TAL-A47-D", 50, "Leroy-Somer"], ["TAL-A47-F", 60, "Leroy-Somer"]]);
  // ô một mã kèm tần số (n110): tần số không thành một phần của model
  const n110 = sup("saudi-diesel", [{ n: 110, title: "t", header: [], rows: ["Engine: Hyundai P126TI", "| Alternator | Leroy Somer TAL-A46-F (50 Hz)"] }]);
  assert.deepEqual(recs(n110, "alternator").map((r) => [r.model, r.freq]), [["TAL-A46-F", 50]]);
  // hai mã không hãng, mã không phải dạng đầu phát (n128 "S54D / S5C"): như cũ, không tách
  const n128 = sup("saudi-diesel", [{ n: 128, title: "t", header: [], rows: ["Engine: Hyundai P158LE", "| Alternator | S54D / S5C"] }]);
  assert.ok(!recs(n128, "alternator").some((r) => r.model === "S54D" || r.model === "S5C"));
});

test("gb-power n1020: hãng + mã có dấu cách ('STAMFORD HCI 444D') → đầu phát HCI 444D, hãng Stamford", () => {
  const s = sup("gb-power", [{ n: 1020, title: "Datasheet: GB-P300.doc-1.pdf", header: [],
    rows: ["Standard Features", "| MODEL | GB-P300", "| Standby Power(50Hz) | 264KW/330KVA", "| Prime Power(50Hz) | 240KW/300KVA", "| Engine | PERKINS 1606A-E93TAG5", "| Alternator | STAMFORD HCI 444D"] }]);
  const a = recs(s, "alternator");
  assert.deepEqual(a.map((r) => [r.model, names(r).join(",")]), [["HCI 444D", "Stamford"]]);
});

test("acepow n127: hai mã đầu phát không hãng ('UC274D / UCI274D') → không bản ghi đầu phát, ghi note", () => {
  const s = sup("acepow-fuan", [{ n: 127, title: "Soundproof 106 KVA 85KW 240 Volt 3 Phase Generator", header: [],
    rows: ["| Model Number: | API-94", "| Engine Model | 6BG1-ZL1", "| Alternator Model | UC274D / UCI274D", "| Frequency / Phase | 50Hz/ Three phase", "| Displacement (L) | 5.885"] }]);
  const notes = [];
  const all = recs(s, null, notes);
  assert.equal(all.filter((r) => r.kind === "alternator").length, 0);
  assert.deepEqual(all.filter((r) => r.kind === "engine").map((r) => r.model), ["6BG1-ZL1"]);
  assert.ok(notes.some((n) => n.reason === "một ô ghi hai mã" && n.detail === "UC274D / UCI274D"));
});

// Khoa 20/11/2026 (câu 7 = C): cả bảng lấy công suất tổ máy từ tên "NNNGF" (NAMED_POWER), không còn ngoại lệ nopower.
test("huatai n111: ba dòng '140/165' (đường kính / hành trình dưới nhãn công suất) → công suất theo tên, không theo ô '140/165'", () => {
  const s = sup("huatai-yangzhou", [{ n: 111, title: "无锡动力系列柴油发电机组-扬州华泰电气有限公司",
    header: ["| 组型号Type of set | 输出功率 Power of output (KW/KVA) | 额定电流Rated current (A) | 柴油机参数 Parameters of set | 机组尺寸及重量 Size and weight of machine set",
      "| 型号 Type | 额定功率 power (KW) | 缸数及类型Numbers& Type of cylinder | 燃油消耗 (g/kw.h)Consumption of fuel(g/kw.h) | 机油容量 Oil capacity (L) | 长×宽×高 Length Width Height (MM) | 净重 Net Weight (kg)"],
    rows: ["| 700GF | 140/165 | 1267 | WD305TAD68 | 750 | 12缸V型 | 196 | 55 | 3800×1800×2100 | 4550",
      "| 800GF | 140/165 | 1448 | WD327TAD78 | 858 | 12缸V型 | 196 | 60 | 3900×1850×2100 | 5000",
      "| 850GF | 140/165 | 1538.5 | WD327TAD82 | 902 | 12缸V型 | 196 | 60 | 3900×1850×2100 | 5000"] }]);
  const notes = [];
  const e = recs(s, "engine", notes);
  assert.deepEqual(e.map((r) => [r.model, r.power]), [["WD305TAD68", { rated: { kW: 700 } }], ["WD327TAD78", { rated: { kW: 800 } }], ["WD327TAD82", { rated: { kW: 850 } }]]);
  assert.equal(notes.filter((n) => n.reason === "ngoại lệ theo dòng").length, 0);
});
