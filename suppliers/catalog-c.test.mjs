// node --test suppliers/*.test.mjs — việc (C) PR 1 (Khoa 20/11/2026 "PA1 trước"): bảng tổ máy KHÔNG ghi mã động cơ, đọc theo
// danh sách tường minh GENSET_TABLES (46 bảng soát tay) bằng gensetsOf, lưu ở build().gensets; CHƯA nối Gợi ý. Mọi ca là dòng
// thật trong suppliers/cn (NCC, số bảng n ghi cạnh), gồm các lỗi của cách đọc chung mà danh sách phải chặn
// (dieu-phoi/nghiem-thu/catalog-c-de-xuat.md 1.4).
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables, extra = {}) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables, ...extra });
const read = (s, notes = []) => C.gensetsOf(s, notes);
const one = (s, model) => read(s).find((r) => r.model === model);
const spec = (r, key) => r.specs.find((x) => x.key === key)?.value;

const TEKSAN_H = ["| | COMPARE | Model | Phase | Hz | Power 9 - 45 kVA 46 - 110 kVA 111 - 179 kVA 180 - 300 kVA 301 - 499 kVA 500 - 749 kVA 750 - 999 kVA 1000 - 1499 kVA 1500 - 2500 kVA 2501 - 4500 kVA | Voltage | Engine | ALL", "| Standby (ESP) | Prime (PRP)", "| kVA | kW | kVA | kW"];
const teksan = (n, title, rows) => sup("teksan", [{ n, title, header: TEKSAN_H, rows }]);

test("danh sách: 46 bảng của 12 NCC, mỗi mục khoá NCC + n + tiêu đề nguyên văn", () => {
  // 45 khoá (NCC + n + tiêu đề) cho 46 bảng: frs-shenyang n108 có hai bảng cùng tiêu đề, cả hai là tổ máy
  assert.equal(C.GENSET_TABLES.reduce((a, x) => a + x.n.length, 0), 45);
  assert.equal(new Set(C.GENSET_TABLES.map((x) => x.supplierId)).size, 12);
  for (const x of C.GENSET_TABLES) assert.ok(x.header.startsWith("|") && x.cells.length && x.checked, x.supplierId);
});

test("teksan n101 / n104 / n102: cột Hz là tần số, Voltage là điện áp, Phase là số pha; Prime '0' (máy khí) chỉ còn standby; prime > standby để trống", () => {
  const s = teksan(101, "Diesel Generator", ["| | TJ8BD-1 | 1 | 50 | 8 | 6.4 | 7 | 5.6 | 230 | BAUDOUIN |", "| | TJ9PE6-1 | 1 | 60 | 9 | 9 | 8 | 8 | 240 | PERKINS |"]);
  const a = one(s, "TJ8BD-1");
  assert.deepEqual(a.power, { standby: { kVA: 8, kW: 6.4 }, prime: { kVA: 7, kW: 5.6 } });
  assert.equal(a.freq, 50);
  assert.equal(spec(a, "voltage"), "230");
  assert.equal(spec(a, "phase"), "1");
  assert.deepEqual(a.makes.map((m) => [m.name, m.via]), [["Baudouin", "dòng bảng"]]);
  assert.equal(one(s, "TJ9PE6-1").freq, 60);
  // một pha, hệ số 1: 9 kVA / 9 kW là số nguồn, giữ
  assert.deepEqual(one(s, "TJ9PE6-1").power, { standby: { kVA: 9, kW: 9 }, prime: { kVA: 8, kW: 8 } });
  const gas = one(teksan(104, "The Best Natural Gas Generators are Here -Teksan", ["| | TJ53MN-NG5L | 3 | 50 | 53 | 42 | 0 | 0 | 400 | MAN |"]), "TJ53MN-NG5L");
  assert.deepEqual(gas.power, { standby: { kVA: 53, kW: 42 } }); // trước: "rated"
  const notes = [];
  const bad = read(teksan(102, "The Best Rental Generators Are Here - Teksan", ["| | TJ53S5-RH | 3 | 50 | 53 | 40 | 50.74 | 40.6 | 400 | HYUNDAI |"]), notes)[0];
  assert.equal(bad.power, null); // prime 40,6 kW > standby 40 kW: không biết số nào sai
  assert.ok(notes.some((x) => /prime lớn hơn standby/.test(x.reason)));
});

test("googol n107: cột 'Engine (Output Power)' là kW ĐỘNG CƠ, công suất tổ máy là 'Genset … (kW/kVA)'", () => {
  const s = sup("googol", [{ n: 107, title: "PV20 & PV20生产厂家 &价格 &工厂 - Chongqing Googol Engine-Tech. Co.,Ltd.",
    header: ["| Model | Engine (Output Power) | Genset (Typical Generation Output Power) | No. of Cylinders | Displacement (L) | Weight (kg) | Full Load Consumption (L/h)", "| Standby (kW) | Prime (kW) | Standby (kW/kVA) | Prime (kW/kVA)"],
    rows: ["| PTAA20V-EG1120C | 1120 | 1020 | 1000/1250 | 900/1125 | V20 | 40.7 | 2450 | 238"] }], { role: "engine_maker", names: { en: "Chongqing Googol Engine-Tech Co., Ltd." } });
  const r = one(s, "PTAA20V-EG1120C");
  assert.deepEqual(r.power, { standby: { kW: 1000, kVA: 1250 }, prime: { kW: 900, kVA: 1125 } }); // trước: standby 1.120 kW / 1.250 kVA
  assert.deepEqual([spec(r, "cyl"), spec(r, "disp"), spec(r, "weight"), spec(r, "fuel")], ["V20", "40.7", "2450", "238"]);
  assert.deepEqual(r.makes.map((m) => [m.name, m.via]), [["Googol", "hãng sản xuất"]]);
});

test("googol n101: 'Continuous Power' không là prime: số giữ, không mức (rated); cột tần số đọc", () => {
  const s = sup("googol", [{ n: 101, title: "Gas Genset COP:1000-2500kVA & Gas Genset COP:1000-2500kVA生产厂家 &价格 &工厂 - Chongqing Googol Engine-Tech. Co.,Ltd.",
    header: ["| No. | Gas Genset Model | Continuous Power（kW/kVA) | Frequency（Hz） | Voltage (V) | Generator Efficiency"], rows: ["| 1 | GPAC1000-XXX-50 | 800/1000 | 50 | 400-11000 | 95.50%"] }], { role: "engine_maker" });
  const r = one(s, "GPAC1000-XXX-50");
  assert.deepEqual(r.power, { rated: { kW: 800, kVA: 1000 } });
  assert.equal(r.freq, 50);
  assert.equal(r.power.prime, undefined);
});

test("yingtai n109: 39 dòng ĐỘNG CƠ (12 ô) trong bảng tổ máy không thành bản ghi; '8020' kW (gõ sai) bỏ mức prime", () => {
  const notes = [];
  const s = sup("yingtai-jiangsu", [{ n: 109, title: "科克柴油发电机组, 科克柴油发电机组 供应 - 英泰集团有限公司",
    header: ["| 机组型号 | 功率（主用） | 功率（主用） | 功率（备用） | 功率（备用） | 电流（主用） | 电流（备用） | 净重 | 外形尺寸 | 品牌", "| KW | KVA | KW | KVA | A | A | kg | m*m*m"],
    rows: ["| 300GF | 300 | 375 | 330 | 412.5 | 540 | 594 | 2630 | 3.1*1.2*1.6 |", "| 800GF | 8020 | 1000 | 880 | 1100 | 1440 | 1584 | 6201 | 4.6*2.2*2.4 |", "| PTAA13EG1 | 346 | 378 | L6 | 128×166 | 12.8 | 15.5:1 | 40 | 198.75 | 电喷 | 36 | T3"] }]);
  const rs = read(s, notes);
  assert.deepEqual(rs.map((r) => r.model), ["300GF", "800GF"]);
  assert.deepEqual(rs[0].power, { prime: { kW: 300, kVA: 375 }, standby: { kW: 330, kVA: 412.5 } });
  assert.deepEqual([spec(rs[0], "current"), spec(rs[0], "weight"), spec(rs[0], "dims")], ["540", "2630", "3.1*1.2*1.6"]);
  assert.deepEqual(rs[1].power, { standby: { kW: 880, kVA: 1100 } });
  assert.ok(notes.some((x) => x.row === 2 && /bố cục cột/.test(x.reason)));
  assert.ok(notes.some((x) => x.row === 1 && /prime không đọc được/.test(x.reason)));
});

test("yingtai n104: cột theo tiêu đề (cách đọc chung từng lấy dòng điện làm standby); dòng 8 ô (thiếu khối lượng) chỉ đọc tới dòng điện", () => {
  const s = sup("yingtai-jiangsu", [{ n: 104, title: "帕金斯发电机组, 帕金斯发电机组 供应 - 英泰集团有限公司",
    header: ["| 机组型号 Genset Model | 主用功率（主用） | 备用功率（备用） | 电流（主用） Power(A) | 电流（备用） Power(A) | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m) | 品牌 Brand", "| KW | KVA | KW | KVA"],
    rows: ["| 4.5GF | 4.5 | 5.6 | 4.9 | 6.4 | 8.1 | 8.82 | 250 | 1.05* 0.44* 0.95 | 帕金斯 Perkins", "| 12GF | 12 | 15 | 13 | 16.25 | 21.6 | 23.4 | 1.32* 0.552* 1.18"] }]);
  const a = one(s, "4.5GF"), b = one(s, "12GF");
  assert.deepEqual(a.power, { prime: { kW: 4.5, kVA: 5.6 }, standby: { kW: 4.9, kVA: 6.4 } }); // trước: standby 8,1 kVA / 6,4 kW
  assert.deepEqual(a.makes.map((m) => [m.name, m.via]), [["Perkins", "dòng bảng"]]);
  assert.deepEqual(b.power, { prime: { kW: 12, kVA: 15 }, standby: { kW: 13, kVA: 16.25 } });
  assert.deepEqual(b.specs.map((x) => x.key), ["current"]);
  assert.deepEqual(b.makes, []); // ô hãng chỉ ở dòng đầu; tên trang "帕金斯" không có trong ENGINE_BRANDS: để trống, không đoán
});

test("acepow n105: 2 dòng kích thước dính dưới dòng tổ máy (6 ô) không thành bản ghi", () => {
  const notes = [];
  const rs = read(sup("acepow-fuan", [{ n: 105, title: "200KVA 160KW Residential Standby Diesel Generator , Fawde Diesel Generator", header: ["| Generating Set Model | Prime | Standby"],
    rows: ["| APX-200 | 200KVA/160KW | 220KVA/176KW", "| APX-200 | 2800 | 1100 | 1600 | 1910 | 1990", "| APXS-200 | 3350 | 1300 | 1850 | 2510 | 2590"] }]), notes);
  assert.equal(rs.length, 1);
  assert.deepEqual(rs[0].power, { prime: { kVA: 200, kW: 160 }, standby: { kVA: 220, kW: 176 } });
  assert.equal(notes.filter((x) => /bố cục cột/.test(x.reason)).length, 2);
});

test("vpower n101: 'kWe' là công suất điện không mức; kW NHIỆT (热能) không là kVA", () => {
  const r = read(sup("vpower-hk", [{ n: 101, title: "VPower | 天然气系列", header: ["| | 输出 | 效率 |", "| 型号 | 电能 (kWe) | 热能 (kW) | 电能 (%) | 热能 (%) | 整体 (%)"], rows: ["| PPU4500NG | 4500 | 3668 | 44.6 | 43.1 | 87.7"] }]))[0];
  assert.deepEqual(r.power, { rated: { kW: 4500 } }); // trước: rated 4.500 kVA / 3.668 kW
});

test("kangwo n101: '功率 KW KVA' một ô hai số cách nhau dấu cách, không mức; cột '（cm）' ghi số mm không đọc", () => {
  const r = read(sup("kangwo-xiamen", [{ n: 101, title: "网站首页 --- 厦门康沃机电设备有限公司", header: ["| 机组型号 | 功率 KW KVA | 长X宽X高（cm） | 重量（kg）"], rows: ["| KE200 | 200 250 | 4900X1800X2500 | 4800"] }]))[0];
  assert.deepEqual(r.power, { rated: { kW: 200, kVA: 250 } });
  assert.deepEqual(r.specs.map((x) => [x.key, x.value]), [["weight", "4800"]]);
});

test("zc-power n109: '50/60Hz' không có tần số (cách đọc chung ra 60); Rated / Max power", () => {
  const r = read(sup("zc-power", [{ n: 109, title: "Gasoline Generators | Factory-Direct Prices | ZC Power",
    header: ["| | Model | Rated Power | Max Power | Voltage | Frequency | Engine | Fuel Tank | Runtime (50%) | Noise (7m) | Start | Weight"], rows: ["| ZC-GF2500 | 2.0 kW | 2.5 kW | 110/220V | 50/60Hz | OHV 208cc | 15L | 11 hrs | 68 dB | Recoil | 42 kg"] }]))[0];
  assert.equal(r.freq, null);
  assert.deepEqual(r.power, { rated: { kW: 2 }, standby: { kW: 2.5 } });
  assert.deepEqual([spec(r, "tank"), spec(r, "noise"), spec(r, "weight")], ["15L", "68 dB", "42 kg"]);
});

test("NCC khác: frs n107, green-power n130 (phẩy thập phân), interpower n2002, superwatt n102, westinpower n113", () => {
  const notes = [];
  const frs = read(sup("frs-shenyang", [{ n: 107, title: "燃气发电机组 - 沈阳福瑞斯动力设备有限公司,福瑞斯动力,福瑞斯官网",
    header: ["| 机组型号 | 机组主用功率 （kW） | 控制器型号 | 气缸数 | 排量 | 缸数/排列 (mm) | 压缩比 | 机组尺寸 - 开架 (mm) | 机组重量 - 开架 (kg)"],
    rows: ["| FRS-30NG | 30 | ComAp | 11;1 | 3.9 | 102×120 | 10.5:1 | 1800×870×1450 | 1120", "| FRS-45NG | 45 | ComAp | 4 | 3.9 | 102×120 | 10.5:1 | 1800×870×1450 | 1120"] }]), notes);
  assert.deepEqual(frs[0].power, { prime: { kW: 30 } });
  assert.equal(spec(frs[0], "cyl"), undefined); // "11;1" (nguồn gõ sai) không là số xi lanh
  assert.ok(notes.some((x) => x.detail === "cyl=11;1"));
  assert.deepEqual([spec(frs[1], "cyl"), spec(frs[1], "disp"), spec(frs[1], "compr"), spec(frs[1], "bore")], ["4", "3.9", "10.5:1", undefined]);
  const gp = read(sup("green-power-generators", [{ n: 130, title: "Gruppi elettrogeni - Green Power Generators",
    header: ["| | MODELLO MODEL | POTENZA POWER (PRP kVA) | POTENZA POWER (LTP kVA) | MOTORE ENGINE | CONSUMO CONSUMPTION (l/h) | SERBATOIO TANK (l) | DIMENSIONI (LxLxA) DIMENSIONS (LxWxH) (mm) | PESO WEIGHT (kg)"],
    rows: ["| GP6 SH/K-SV | 5 | 5,5 | KOHLER | 1,2 | 55 | 1300 x 700 x 970 | 370"] }]))[0];
  assert.deepEqual(gp.power, { prime: { kVA: 5 }, standby: { kVA: 5.5 } });
  assert.deepEqual(gp.makes.map((m) => m.name), ["Kohler"]);
  const ip = read(sup("interpower-international", [{ n: 2002, title: "Musgrave Generators – Products (Baudouin engine, Stamford alternator)", header: ["| Genset Model | Prime kVA | Standby kVA | Data Sheet"], rows: ["| GFE20BMC | 18 | 20 | Download"] }]))[0];
  assert.deepEqual(ip.power, { prime: { kVA: 18 }, standby: { kVA: 20 } });
  const swt = read(sup("superwatt-swt", [{ n: 102, title: "SWT Kubota Series Diesel Generator Set 24kW 30kVA | SWT", header: ["| Model | Frequency | Phase / Voltage | Prime Power | Standby Power | Rated Speed"], rows: ["| SK40.4X | 60Hz | 3-phase, 220/127V | 29.4kW / 37kVA | 32.3kW / 40.4kVA | 1800r/min"] }]))[0];
  assert.deepEqual([swt.power, swt.freq], [{ prime: { kW: 29.4, kVA: 37 }, standby: { kW: 32.3, kVA: 40.4 } }, 60]);
  const wp = read(sup("westinpower", [{ n: 113, title: "Natural Gas Generator Sets with Liyu Engines | Westinpower", header: ["| N0. | Genset Model | Rated Power | Engine Model | Cylinder | Bore*Stroke (mm) | Displacement (L) | Dimensions", "| kW | kVA | L*W*H (mm)"], rows: ["| 1 | LY1200 | 1100 | 1375 | Liyu Engine | 12/V | 170*195 | 53.1 | 4700*1700*2300"] }]))[0];
  assert.deepEqual([wp.model, wp.power, spec(wp, "disp")], ["LY1200", { rated: { kW: 1100, kVA: 1375 } }, "53.1"]);
});

test("nguồn cào lại đổi tiêu đề: bảng hết hiệu lực, không đọc, ghi note; NCC / bảng ngoài danh sách không đọc", () => {
  const notes = [];
  assert.deepEqual(read(sup("interpower-international", [{ n: 2002, title: "x", header: ["| Genset Model | Prime kVA | Standby kVA"], rows: ["| GFE20BMC | 18 | 20"] }]), notes), []);
  assert.ok(notes.some((x) => /đổi tiêu đề/.test(x.reason)));
  assert.deepEqual(read(sup("interpower-international", [{ n: 2003, title: "x", header: ["| Genset Model | Prime kVA | Standby kVA | Data Sheet"], rows: ["| GFE20BMC | 18 | 20 | Download"] }])), []);
  assert.deepEqual(read(sup("other-oem", [{ n: 2002, title: "x", header: ["| Genset Model | Prime kVA | Standby kVA | Data Sheet"], rows: ["| GFE20BMC | 18 | 20 | Download"] }])), []);
});

test("build: gensets khoá NCC|model (cùng tên '300GF' ở hai NCC là hai bản ghi), engines không đổi; unread tính bảng đã dùng", () => {
  const yt = sup("yingtai-jiangsu", [{ n: 109, title: "科克柴油发电机组, 科克柴油发电机组 供应 - 英泰集团有限公司",
    header: ["| 机组型号 | 功率（主用） | 功率（主用） | 功率（备用） | 功率（备用） | 电流（主用） | 电流（备用） | 净重 | 外形尺寸 | 品牌", "| KW | KVA | KW | KVA | A | A | kg | m*m*m"],
    rows: ["| 300GF | 300 | 375 | 330 | 412.5 | 540 | 594 | 2630 | 3.1*1.2*1.6 |", "| 300GF | 300 | 375 | 330 | 412.5 | 540 | 594 | 2700 | 3.1*1.2*1.6 |"] }]);
  const gg = sup("googol", [{ n: 107, title: "PV20", header: ["| Model | Engine (Output Power) | Genset (Typical Generation Output Power) | No. of Cylinders | Displacement (L) | Weight (kg) | Full Load Consumption (L/h)", "| Standby (kW) | Prime (kW) | Standby (kW/kVA) | Prime (kW/kVA)"],
    rows: ["| 300GF | 1120 | 1020 | 1000/1250 | 900/1125 | V20 | 40.7 | 2450 | 238"] }], { role: "engine_maker" });
  const b = C.build([yt, gg]);
  assert.deepEqual(b.engines, []);
  assert.deepEqual(b.gensets.map((g) => [g.key, g.uses.length, g.kva, g.kw]), [["googol|300GF", 1, [1125, 1250], [900, 1000]], ["yingtai-jiangsu|300GF", 2, [375, 412.5], [300, 330]]]);
  // thông số động cơ không mã (xi lanh, dung tích) đi theo bản ghi tổ máy
  assert.deepEqual(b.gensets[0].specs.map((x) => x.key).sort(), ["cyl", "disp", "fuel", "weight"]);
  assert.deepEqual(b.gensets[1].specs.find((x) => x.key === "weight").values.map((v) => v.value), ["2630", "2700"]);
  assert.equal(C.unread([yt, gg]).filter((x) => x.reason === "bảng không cho bản ghi nào").length, 0);
});
