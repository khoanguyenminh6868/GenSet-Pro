// node --test suppliers/catalog-b3.test.mjs — catalog-b3 (Khoa 20/11/2026 "làm như em đề xuất"): mã tổ máy ở cột sau cột thứ hai
// (zhengchi-power n102–n150, 610 bảng dòng) không còn bị đọc làm động cơ. Mọi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const recs = (s, kind, notes = []) => C.fromSupplier(s, notes).filter((r) => !kind || r.kind === kind);

const ZC_HEADER = ["| 功率 | 备用功率 | 品牌 | 整机编号 | 柴油机型号 | 频率 | 电压(V) | 高压(KV) | 燃油率 | 输出 | 缸数 | 排量(L) | 机组长宽高(mm) | 重量KG | 参数"];
const zc = (rows, header = ZC_HEADER) => sup("zhengchi-power", [{ n: 110, title: "1500KW柴油发电机组 - 【官网】", header, rows }]);

test("zhengchi n110: 整机编号 (cột 3) là model tổ máy, 柴油机型号 (cột 4) là động cơ, công suất ở hai cột đầu", () => {
  const s = zc([
    "| 1500KW | 1650KW | 康明斯 | ZCDL-C1650 | QSK60G3 | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 16 | 50.3 | 6200×2300×2250 | 15200 | 更多",
    "| 1380KW | 1500KW | 玉柴 | ZCDL-Y1500 | YC12VC2270L-D20 | 50Hz | 230/400 | 6.3/10.5 | 220g/kw.h | 三相四线 | 12 | 79.17 | 6500×2300×2600 | 13350 | 更多",
  ]);
  const r = recs(s);
  assert.deepEqual(r.map((x) => x.kind), ["engine", "engine"]);
  assert.deepEqual(r.map((x) => x.model), ["QSK60G3", "YC12VC2270L-D20"]);
  assert.deepEqual(r.map((x) => x.genset), ["ZCDL-C1650", "ZCDL-Y1500"]);
  assert.equal(r[1].power.standby.kW, 1500);
  assert.equal(r[1].power.rated.kW, 1380);
  // không còn bản ghi động cơ nào mang mã tổ máy
  assert.ok(!r.some((x) => /^ZCDL/.test(x.model)));
});

test("zhengchi bảng 整机编号: bỏ cyl + disp (Khoa 20/11/2026), giữ thông số khác; bảng n101 (机组型号) giữ cyl", () => {
  const notes = [];
  const r = recs(zc(["| 21KW | 23KW | 潍柴 | ZCDL-W23 | WP2.3D25E200 | 50Hz | 230/400 | 6.3/10.5 | 155g/kw.h | 三相四线 | 6 | 8.2 | 1300×550×900 | 500 | 更多"]), "engine", notes);
  assert.equal(r.length, 1);
  const keys = r[0].specs.map((x) => x.key);
  assert.ok(!keys.includes("cyl") && !keys.includes("disp"));
  assert.ok(keys.includes("weight"));
  assert.ok(notes.some((n) => n.reason === "bỏ thông số theo bảng"));
  const t101 = sup("zhengchi-power", [{ n: 101, title: "沃尔沃发电机", header: ["| | 机组型号 | 输出功率(KW) | 电流 | 柴油机型号 | 缸数 | 缸径×行程 | 排气量 | 燃油消耗率 | 机组尺寸mm | 机组重量 | 电压(V) | 频率 | 输出 | 详细参数", "| 主用 | 备用"],
    rows: ["| ZCDL-V75 | 70 | 75 | 126A | TAD550GE | 4 | 108*130 | 4.76L | 190g/kw.h | 2188*566*1300 | 1256kg | 220/380 | 50Hz | 三相四线 | 详细参数"] }]);
  assert.ok(recs(t101, "engine")[0].specs.some((x) => x.key === "cyl"));
});

test("zhengchi: ô động cơ viết dấu '－' toàn chiều rộng (U+FF0D) đọc như '-' (Khoa 20/11/2026), chỉ NCC trong DASH_FIX", () => {
  const row = ["| 1200KW | 1345KW | 玉柴 | ZCDL-Y1345 | YC12VTD2000－D30 | 50Hz | 230/400 | 6.3/10.5 | 213g/kw.h | 三相四线 | 12 | 57.25 | 6100×2600×3100 | 12000 | 更多"];
  const notes = [];
  const r = recs(zc(row), "engine", notes);
  assert.deepEqual(r.map((x) => x.model), ["YC12VTD2000-D30"]);
  assert.equal(r[0].genset, "ZCDL-Y1345");
  assert.ok(notes.some((n) => /toàn chiều rộng/.test(n.reason)));
  // NCC không có trong danh sách: không đổi (vẫn không đọc ra mã)
  const o = recs(sup("aosif", [{ n: 112, title: "1500KW柴油发电机组 - 【官网】", header: ZC_HEADER, rows: row }]), "engine");
  assert.ok(!o.some((x) => x.model === "YC12VTD2000-D30"));
});

test("mã tổ máy ở cột 0 / 1 như cũ (zhengchi n101: 机组型号 ở cột 1)", () => {
  const s = sup("zhengchi-power", [{ n: 101, title: "沃尔沃发电机", header: ["| | 机组型号 | 输出功率(KW) | 电流 | 柴油机型号 | 缸数 | 缸径×行程 | 排气量 | 燃油消耗率 | 机组尺寸mm | 机组重量 | 电压(V) | 频率 | 输出 | 详细参数", "| 主用 | 备用"],
    rows: ["| ZCDL-V75 | 70 | 75 | 126A | TAD550GE | 4 | 108*130 | 4.76L | 190g/kw.h | 2188*566*1300 | 1256kg | 220/380 | 50Hz | 三相四线 | 详细参数"] }]);
  const r = recs(s, "engine");
  assert.equal(r.length, 1);
  assert.equal(r[0].model, "TAD550GE");
  assert.equal(r[0].genset, "ZCDL-V75");
  assert.equal(r[0].power.standby.kW, 75);
});

test("zhengchi bảng 整机编号: ô 品牌 là phiếu hãng ở mức 'tên trang' (Khoa 20/11/2026), NCC khác vẫn ở 'dòng bảng'", () => {
  const z = recs(zc(["| 1450KW | 1600KW | 上柴 | ZCDL-S1450 | S16R-PTA-C | 50Hz | 230/400 | 6.3/10.5 | 238g/kw.h | 三相四线 | 16 | 65.37 | 7800×1600×2500 | 9500 | 更多"]), "engine");
  assert.equal(z.length, 1);
  assert.deepEqual(z[0].makes.map((m) => [m.name, m.via]), [["SDEC", "tên trang"]]);
  const o = recs(sup("other-ncc", [{ n: 1, title: "三菱发电机组", header: ["| 型号 | 品牌 | 柴油机型号 | 功率"], rows: ["| ZX-1500 | 三菱 | S16R-PTA-C | 1500KW"] }]), "engine");
  assert.deepEqual(o[0].makes.map((m) => [m.name, m.via]), [["Mitsubishi", "dòng bảng"]]);
});
