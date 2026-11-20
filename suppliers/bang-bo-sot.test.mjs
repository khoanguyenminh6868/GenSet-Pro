// node --test suppliers/*.test.mjs — bảng bỏ sót (Khoa duyệt 20/11/2026): 4 bảng tổ máy CÓ mã động cơ mà ô viết có dấu cách /
// ngoặc nên isCode không nhận (catalog-c-de-xuat.md 1.1 lớp X), đọc theo danh sách tường minh ENGINE_CELL_TABLES thành bản ghi
// động cơ như dòng bảng thường. Mọi ca là dòng thật trong suppliers/cn (NCC, số bảng n ghi cạnh).
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const engines = (s, notes = []) => C.fromSupplier(s, notes).filter((r) => r.kind === "engine");
const spec = (r, key) => r.specs.find((x) => x.key === key)?.value;

const MTU = { n: 115, title: "Gruppi elettrogeni Stazionari Mtu - Green Power Generators",
  header: ["| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | SERBATOIO TANK | DIMENSIONI DIMENSIONS | PESO WEIGHT | DOWNLOAD",
    "| kVA - 50 Hz | MODELLO MODEL | REG | CIL. | CONSUMO AL 75% PRP CONSUMPTION AT 75% PRP | Lu | La | A | LEROY SOMER | LINZ | MECC ALTE | STAMFORD",
    "| PRP | ESP | N. | L/h | L | mm | mm | mm | kg"],
  rows: ["| GP610 A/M | O | 550 | 600 | 12V 1600 G10F | E | 12 | 90.8 | 340 | 3500 | 1500 | 2100 | 4000 | | | |", "| GP610 SM/M | S | 370 | 5000 | 1900 | 2350 | 6200",
    "| GP2800 A/M | O | 2500 | 2750 | 20V 4000 G14F | E | 20 | 385 | 600 | 6100 | 3000 | 2500 | N.A. | | | |"] };

test("green-power n115 (MTU): '12V 1600 G10F' là động cơ của GP610 A/M, PRP / ESP kVA 50 Hz, hãng từ tên trang; dòng bản cách âm không ghi động cơ", () => {
  const notes = [], e = engines(sup("green-power-generators", [MTU]), notes);
  assert.deepEqual(e.map((r) => [r.model, r.genset]), [["12V 1600 G10F", "GP610 A/M"], ["20V 4000 G14F", "GP2800 A/M"]]);
  assert.deepEqual(e[0].power, { prime: { kVA: 550 }, standby: { kVA: 600 } });
  assert.equal(e[0].freq, 50);
  assert.deepEqual(e[0].makes.map((m) => [m.name, m.via]), [["MTU", "tên trang"]]);
  assert.deepEqual([spec(e[0], "cyl"), spec(e[0], "fuel75"), spec(e[0], "tank"), spec(e[0], "weight")], ["12", "90.8", "340", "4000"]);
  assert.equal(spec(e[1], "weight"), undefined); // "N.A."
  assert.ok(notes.some((x) => x.row === 1 && /không ghi động cơ/.test(x.reason)));
  // khoá trùng với "12V1600G10F" viết liền của NCC khác
  assert.equal(C.keyOf(e[0].model), C.keyOf("12V1600G10F"));
});

test("green-power n117 (Kohler): 'KDW 702 (M)' → KDW 702 ('(M)' là cột điều tốc REG của dòng), khí thải, tiêu hao phẩy thập phân giữ nguyên chữ", () => {
  const e = engines(sup("green-power-generators", [{ n: 117, title: "Gruppi elettrogeni Mobili Relhko - Green Power Generators",
    header: ["| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | | SERBATOIO TANK | DIMENSIONI DIMENSIONS | PESO WEIGHT | DOWNLOAD"],
    rows: ["| GP6 A/K-SV | O | 5 | 5.5 | KDW 702 (M) | M | 2 | 1,2 | STAGE V | 55 | / | 1300 | 700 | 1000 | 300 | | | |", "| GP6 SH/K-SV | LS | 55 | / | 1300 | 700 | 970 | 370",
      "| GP22 A/K-SV | O | 20 | 22 | KSD 1403 TCA | E | 3 | 3,5 | STAGE V | 60 | / | 1500 | 700 | 1020 | 520 | | | |"] }]));
  assert.deepEqual(e.map((r) => [r.model, r.genset, r.power]), [["KDW 702", "GP6 A/K-SV", { prime: { kVA: 5 }, standby: { kVA: 5.5 } }], ["KSD 1403 TCA", "GP22 A/K-SV", { prime: { kVA: 20 }, standby: { kVA: 22 } }]]);
  assert.deepEqual([spec(e[0], "cyl"), spec(e[0], "fuel75"), spec(e[0], "emission"), spec(e[0], "tank")], ["2", "1,2", "STAGE V", "55"]);
  assert.deepEqual(e[0].makes, []); // tên trang "Relhko" (viết sai) không có trong ENGINE_BRANDS: để trống, không đoán
});

test("green-power n126 (Scania khí): 'OC16 071A 02 81 (E)' → OC16 071A 02 81, cùng khoá với 'OC16 071A 02-81' (kaihua); ESP '/' để trống", () => {
  const e = engines(sup("green-power-generators", [{ n: 126, title: "Gruppi elettrogeni a Gas Scania - Green Power Generators",
    header: ["| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | DOWNLOAD"],
    rows: ["| GP385A/G | O | 350 | / | / | / | OC16 071A 02 81 (E) | METANO / BIOGAS METHANE / BIOGAS | E | 8 | | | |"] }]))[0];
  assert.deepEqual([e.model, e.genset, e.power, e.freq, spec(e, "cyl")], ["OC16 071A 02 81", "GP385A/G", { prime: { kVA: 350 } }, 50, "8"]);
  assert.deepEqual(e.makes.map((m) => m.name), ["Scania"]);
  assert.equal(C.keyOf(e.model), C.keyOf("OC16 071A 02-81"));
  // Máy khí: nhiên liệu từ chính dòng (fuelOf, mức B), bản ghi bảng bỏ sót đi qua cùng bước nhiên liệu của fromSupplier.
  assert.deepEqual([e.fuel, e.fuelFrom, e.fuelWhy], ["gas", "B", 'bảng ghi "METANO"']);
});

test("lees-power n133: 'MTU 8V4000 GS/L32' → hãng MTU (dòng bảng) + model 8V4000 GS/L32; 'Electrical Power KW' không ghi mức → rated; dòng không model bỏ", () => {
  const notes = [];
  const e = engines(sup("lees-power", [{ n: 133, title: "- Buy Product on Wuxi Lees Power Company Limited - Generator Expert!",
    header: ["| Model | Electrical Power KW | Efficiency (%) | Nox mg/m3 | Dimensions L×W×H (mm) | Weight (kg) | Specifications", "| LEES | MTU | Electrical Efficiency | Thermal Efficiency | Total Efficiency"],
    rows: ["| LSMU800NGE3 | MTU 8V4000 GS/L32 | 776 | 41.9 | 46.7 | 88.6 | 500 | 4000×2000×2300 | 10000 | PDF", "| 800 | 43.0 | 42.7 | 85.7 | 500 | PDF"] }]), notes);
  assert.equal(e.length, 1);
  assert.deepEqual([e[0].model, e[0].genset, e[0].power, e[0].freq], ["8V4000 GS/L32", "LSMU800NGE3", { rated: { kW: 776 } }, null]);
  assert.deepEqual(e[0].makes.map((m) => [m.name, m.via]), [["MTU", "dòng bảng"]]);
  assert.deepEqual([spec(e[0], "dims"), spec(e[0], "weight")], ["4000×2000×2300", "10000"]);
  assert.ok(notes.some((x) => x.row === 1 && /không ghi động cơ/.test(x.reason)));
});

test("nhiên liệu: lees n133 khí theo URL trang (mức T); green n115 MTU diesel không ghi nhiên liệu → không có trường fuel", () => {
  const LEES = { n: 133, title: "- Buy Product on Wuxi Lees Power Company Limited - Generator Expert!",
    header: ["| Model | Electrical Power KW | Efficiency (%) | Nox mg/m3 | Dimensions L×W×H (mm) | Weight (kg) | Specifications"],
    rows: ["| LSMU800NGE3 | MTU 8V4000 GS/L32 | 776 | 41.9 | 46.7 | 88.6 | 500 | 4000×2000×2300 | 10000 | PDF"] };
  const e = engines({ ...sup("lees-power", [LEES]), sources: [{ n: 133, url: "https://www.leespower.com/MTU-GAS-GENERATOR-SET-pd106395538.html" }] })[0];
  assert.deepEqual([e.fuel, e.fuelFrom, e.fuelWhy], ["gas", "T", 'URL ghi "GAS GENERATOR"']);
  const m = engines({ ...sup("green-power-generators", [MTU]), sources: [{ n: 115, url: "https://www.greenpowergen.it/prodotti/gruppi-elettrogeni-stazionari/mtu/" }] });
  assert.ok(m.length && m.every((r) => r.fuel === undefined));
});

test("ngoại lệ theo dòng: GP1000 A/M ghi 16 xi lanh cho '12V 1600 G31F' (12V = 12) → bỏ riêng cyl, dòng và số khác giữ; GP880 A/M không đổi", () => {
  const notes = [];
  const e = engines(sup("green-power-generators", [{ ...MTU, rows: ["| GP880 A/M | O | 800 | 880 | 12V 1600 G21F | E | 12 | 123.6 | 450 | 4000 | 1500 | 2100 | 5350 | | | |",
    "| GP1000 A/M | O | 910 | 1005 | 12V 1600 G31F | E | 16 | 139 | 450 | 4450 | 1910 | 2250 | 6250 | | | |"] }]), notes);
  assert.deepEqual(e.map((r) => [r.model, spec(r, "cyl"), spec(r, "weight")]), [["12V 1600 G21F", "12", "5350"], ["12V 1600 G31F", undefined, "6250"]]);
  assert.deepEqual(e[1].power, { prime: { kVA: 910 }, standby: { kVA: 1005 } });
  assert.ok(notes.some((x) => /ngoại lệ theo dòng/.test(x.reason) && /12V 1600 G31F/.test(x.detail)));
});

test("danh sách: tiêu đề đổi → không đọc, ghi note; NCC / bảng khác không đọc theo danh sách", () => {
  const notes = [];
  assert.deepEqual(engines(sup("green-power-generators", [{ ...MTU, header: ["| MODELLO MODEL | POTENZA POWER | MOTORE ENGINE"] }]), notes), []);
  assert.ok(notes.some((x) => /đổi tiêu đề/.test(x.reason)));
  assert.deepEqual(engines(sup("green-power-x", [MTU])), []);
  assert.deepEqual(engines(sup("green-power-generators", [{ ...MTU, n: 999 }])), []);
});
