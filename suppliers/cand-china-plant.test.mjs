// node --test suppliers/*.test.mjs — NCC tự ghi nhà máy Trung Quốc của động cơ ở chính dòng (Khoa 22/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, chinaPlantInRow, placeInRow, placesInRow } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const K = { model: "KTA50-GS8", make: "Cummins" }, P = { model: "403A-15G1", make: "Perkins" };
const at = (e, line, extra = {}) => chinaPlantInRow(e, { line, ...extra })?.form || null;

test("đọc tên nhà máy, hãng + China, mã + China", () => {
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | Cummins (CCEC CHINA) | S7 |"), "plant");
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | 重庆康明斯 | S7 |"), "plant");
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | dongfeng Cummins | S7 |"), "plant");
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | Cummins (China Dongfeng) | S7 |"), "make");
  assert.equal(at(P, "| P1 | 16 | 403A-15G1 | Perkins China | S0 |"), "make");
  assert.equal(at(P, "| P1 | 16 | 403A-15G1 made in china | S0 |"), "code");
});
test("không suy ra: mã trơn, hai nơi, thang khí thải, đầu phát China", () => {
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | Cummins | S7 |"), null);
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | UK/ CCEC | S7 |"), null);
  assert.equal(at(K, "| C1 | 1650 | Cummins KTA50-GS8 | Stage IIIA / CHINA STAGE3 | S7 |"), null);
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | Stamford China | S7 |"), null);
  assert.equal(at(K, "| C1 | 1650 | KTA50-GS8 | S7 | CHINA |"), null);
});
test("Weichai Baudouin và hãng Baudouin không đọc", () => {
  for (const make of ["Baudouin", "Weichai", "Baudouin / Weichai"]) {
    const e = { model: "6M33D572E310", make };
    assert.equal(at(e, "| B1 | 572 | 6M33D572E310 | 潍柴博杜安 | S5 |"), null, make);
    assert.equal(at(e, "| B1 | 572 | 6M33D572E310 | Weichai Baudouin China | S5 |"), null, make);
  }
});
test("bảng nhãn: dòng động cơ ghi nhà máy; chưa rõ hãng chỉ đọc tên nhà máy", () => {
  const u = (rows) => ({ lines: { rows } });
  assert.equal(chinaPlantInRow(K, u(["| Prime power | KW | 18", "| Engine-DCEC Cummins | Power factor | 0.8"]))?.form, "plant");
  assert.equal(chinaPlantInRow({ model: "KTA19-G4", make: "Cummins" }, u(["| Model | CCEC | KTA19-G4"]))?.form, "plant");
  assert.equal(chinaPlantInRow({ model: "4BTA3.9-G2-58KW", make: null }, u(["| Engine-DCEC Cummins | Power factor | 0.8"]))?.form, "plant");
  assert.equal(chinaPlantInRow({ model: "12M33G5D2/5", make: null }, { line: "| B1 | 66 | 12M33G5D2/5 | S7 | STAGE3 | CHINA", supplierId: "baifa-power", header: ["| BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY"] }), null);
  assert.equal(chinaPlantInRow(K, u(["| Address | Shantou, Guangdong, China"])), null);
});
test("cột xuất xứ động cơ: chỉ NCC + tiêu đề trong danh sách", () => {
  const baifa = { supplierId: "baifa-power", header: ["| BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY"] };
  const origin = { supplierId: "yanan-power", header: ["| Genset Model | Standby power | Prime power | Engine Model | Engine origin | NO. of Cylinder | Detail Data"] };
  assert.equal(at(K, "| B1 | 66 | 60 | KTA50-GS8 | S7 | STAGE3 | CHINA", baifa), "column");
  assert.equal(at(K, "| B1 | 66 | 60 | KTA50-GS8 | S7 | STAGE3 | UK/ CCEC", baifa), null);
  assert.equal(at(K, "| Y1 | 66 | 60 | KTA50-GS8 | CHINA | 6 | PDF", origin), "column");
  assert.equal(at(K, "| Y1 | 66 | 60 | KTA50-GS8 | 6 | CHINA | PDF", origin), null);
  assert.equal(at(K, "| Y1 | 66 | 60 | KTA50-GS8 | CHINA | 6 | PDF", { ...origin, supplierId: "khac" }), null);
  assert.equal(at(K, "| B1 | 66 | 60 | KTA50-GS8 | S7 | STAGE3 | CHINA", { ...baifa, header: ["| Model | kVA | kW | Engine | Alternator | Emission | Note"] }), null);
});
test("shanhua: nhãn Manufacturer ghi India Factory đọc IN, chỉ khi đúng hãng", () => {
  const rows = ["| Engine Model | 1103A-33TG2", "| 制造商 Manufacturer | PERKINS ENGINE COMPANY LIMITED (India Factory)"];
  assert.equal(placeInRow({ model: "1103A-33TG2", make: "Perkins" }, { lines: { rows } }), "IN");
  assert.equal(placeInRow({ model: "1103A-33TG2", make: "Cummins" }, { lines: { rows } }), null);
});
test("JAPAN OR CHINA: G7/EU giữ dòng, không trừ điểm, gắn cần xác nhận; G20 không gắn; chỉ đúng cột của NCC trong danh sách", () => {
  const H = "| Genset Model | Standby power | Prime power | Engine Model | Engine origin | NO. of Cylinder | Detail Data";
  const line = "| Y1 | 825 | 750 | S6R2-PTAA | JAPAN OR CHINA | 6 | PDF", S = { model: "S6R2-PTAA", make: "Mitsubishi" };
  assert.deepEqual(placesInRow(S, { supplierId: "yanan-power", line, header: [H] }), ["JP", "CN"]);
  assert.equal(placesInRow(S, { supplierId: "khac", line, header: [H] }), null);
  assert.equal(placesInRow(S, { supplierId: "yanan-power", line, header: ["| Model | a | b | Engine | Note | c | d"] }), null);
  assert.equal(placesInRow(S, { supplierId: "yanan-power", line: "| Y1 | 825 | 750 | S6R2-PTAA | 6 | JAPAN OR CHINA | PDF", header: [H] }), null);
  assert.equal(chinaPlantInRow(S, { supplierId: "yanan-power", line, header: [H] }), null);
  const rows = [{ id: "yanan-power", country: "CN", confidence: "high", specTables: [{ n: 105, title: "Mitsubishi gensets", header: [H], rows: ["| Y1 | 825kVA | 750kVA | S6R2-PTAA | JAPAN OR CHINA | 6 | PDF"] }] }];
  const hints = { ...hintsOf("Chương V. Yêu cầu kỹ thuật\nĐiện áp 380 V"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] };
  const go = (origin) => candidates(C.build(rows), { value: 700, unit: "kVA" }, hints, { suppliers: rows, origin });
  const r = go("g7eu"), x = r.top.find((y) => y.e.model === "S6R2-PTAA");
  assert.deepEqual(r.dropped, []);
  assert.deepEqual(x.ruled, []);
  assert.equal(x.made.engine, "?");
  assert.ok(x.why.some((w) => w.includes("cần xác nhận nơi sản xuất động cơ (NCC ghi «JAPAN OR CHINA»)")));
  const g20 = go("g20").top.find((y) => y.e.model === "S6R2-PTAA");
  assert.ok(g20 && !g20.why.some((w) => w.includes("JAPAN OR CHINA")));
});
test("candidates: loại ở G7/EU, giữ ở G20 và gói không đòi nhóm; Baudouin ở lại", () => {
  const H = "| Model | Prime kVA | Prime kW | Engine | Engine make | Alternator |";
  const sup = (id, row) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows: [row] }] });
  const rows = [sup("tq", "| a-1 | 750 | 600 | 4006-23TAG3A | Perkins China | S5L1D-H41 |"), sup("tron", "| b-1 | 750 | 600 | 4006-23TAG3A | Perkins | S5L1D-H41 |"), sup("bd", "| c-1 | 750 | 600 | 6M33G825/5 | Weichai Baudouin | S5L1D-H41 |")];
  const hints = { ...hintsOf("Chương V. Yêu cầu kỹ thuật\nĐiện áp 380 V"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] };
  const go = (origin) => candidates(C.build(rows), { value: 700, unit: "kVA" }, hints, { suppliers: rows, origin });
  const r = go("g7eu");
  assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["tq", ["made"]]]);
  assert.ok(r.top.some((x) => x.u.supplierId === "bd"));
  assert.ok(go("g20").top.some((x) => x.u.supplierId === "tq"));
});
