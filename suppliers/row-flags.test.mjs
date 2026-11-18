// node --test suppliers/row-flags.test.mjs — cổng kiểm chất lượng theo dòng (Chất lượng 1, chặng 1: chỉ phát hiện).
// Dòng bảng lấy nguyên văn từ suppliers/cn (18/11/2026), ghi nguồn ở từng ca.
import test from "node:test";
import assert from "node:assert/strict";
import { flagRows, absurdOf, rowKey, overHalf } from "./row-flags.mjs";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", specTables: tables.map(([n, title, header, rows]) => ({ n, title, header, rows })) });
const codesOf = (r, id) => [...r.flags.values()].filter((f) => f.o.supplierId === id).flatMap((f) => f.reasons.map((x) => x.code));

// yingtai-jiangsu n113 (高压发电机组): hàng thiếu ô điện áp, nên "1100" (công suất dự phòng) rơi vào cột 额定电压.
const YT = sup("yingtai-jiangsu", [[113, "高压发电机组", [
  "| 机组型号 | 功率（KW） | 额定电压 | 电流 | 净重 | 机组外形尺寸 | 发动机型号 | 品牌 | 功率（KW） | 缸数 | 排气量 | 燃油耗 | 调速方式",
  "| 主用 | 备用 | V | A | （kg) | L×W×H(m) | 主用 | 备用 | （L) | (g/kW.h)",
], ["| 1000GF | 1000 | 1100 | 114.3 | 11330 | 6.40×2.04×2.64 | KTA50-G3 | 1097 | 1227 | 16 | 50.3 | ≤209 | 电子"]]]);

test("absurd: ô lệch cột (điện áp = công suất dự phòng) bị gắn cờ", () => {
  const r = flagRows([YT]);
  const f = [...r.flags.values()].find((x) => x.o.model === "KTA50-G3");
  assert.ok(f, "dòng KTA50-G3 phải bị gắn cờ");
  assert.ok(f.reasons.some((x) => x.code === "absurd" && /voltage "1100"/.test(x.detail)), JSON.stringify(f.reasons));
});

test("absurd: số đúng mà checkSpec chặn thì được nới (cao thế 10,5 kV, 220 V, dòng chỉ ghi kVA, động cơ lớn)", () => {
  // honny-dongguan n102: tổ máy 10,5 kV, 1000 kVA prime → 55 A.
  assert.equal(absurdOf({ key: "current", label: "额定 电流 (A)", value: "55.0" }, { power: { standby: { kVA: 1100, kW: 880 }, prime: { kVA: 1000, kW: 800 } } }), true);
  // westinpower n1052: 1375 kVA ở 220 V → 3609 A.
  assert.equal(absurdOf({ key: "current", label: "Rated Current", value: "3609" }, { power: { prime: { kVA: 1250, kW: 1000 }, standby: { kW: 1100, kVA: 1375 } } }), true);
  // hosem-power n117: dòng chỉ ghi kVA → kW = kVA × 0,8 (575 kVA → 460 kW, động cơ 570 kW).
  assert.equal(absurdOf({ key: "engPower", label: "Engine Max.Output Power", value: "570" }, { power: { prime: { kVA: 575 }, standby: { kVA: 633 } } }), true);
  // Ô không có số, dòng không có công suất: không xét.
  assert.equal(absurdOf({ key: "cyl", label: "Cylinder Arrangement", value: "In-line" }, { power: null }), null);
  assert.equal(absurdOf({ key: "weight", label: "Weight", value: "1200" }, { power: null }), null);
  // Danh sách điện áp: một mức chuẩn là đạt.
  assert.equal(absurdOf({ key: "voltage", label: "Voltage [V]", value: "220,230,240,110/220" }, { power: null }), true);
  // Dòng điện vô lý thật: jiangchai-xuzhou n107 "7200" A cho tổ 400 kW.
  assert.equal(absurdOf({ key: "current", label: "电流（A）", value: "7200" }, { power: { prime: { kW: 400 }, standby: { kW: 450 } } }), false);
});

test("cylMaj: số xi lanh lệch giá trị thắng số đông (≥ 3 NCC, gấp ≥ 3 lần) bị gắn cờ, chỉ dòng lệch", () => {
  const H = ["| Model | Prime kVA | Prime kW | Engine | No. of Cylinder |"];
  const mk = (id, cyl) => sup(id, [[101, "Gensets", H, [`| X${id.length}1250 | 1250 | 1000 | KTA50-G3 | ${cyl} |`]]]);
  // comappower n102 ghi "12" cho KTA50-G3 (16 xi lanh).
  const S = [mk("a-one", 16), mk("b-two", 16), mk("c-three", 16), mk("comappower", 12)];
  const r = flagRows(S);
  assert.deepEqual(codesOf(r, "comappower"), ["cylMaj"]);
  for (const id of ["a-one", "b-two", "c-three"]) assert.deepEqual(codesOf(r, id), []);
  // Hai NCC chưa đủ số đông: không gắn cờ.
  assert.deepEqual(codesOf(flagRows([mk("a-one", 16), mk("b-two", 16), mk("comappower", 12)]), "comappower"), []);
});

test("lowRead: bảng ≥ 4 dòng có mã mà dưới nửa cho bản ghi → mọi bản ghi của bảng; skip bỏ lý do", () => {
  // aoke-yangzhou n115 (850KW): ba dòng sau cũng nằm nguyên văn ở bảng khác của cùng NCC, fromSupplier chỉ giữ lần đầu
  // (khoá vai | model | chữ dòng), nên bảng này chỉ "đọc" được 1/4 dòng có mã — dạng cờ nhầm hay gặp nhất của lowRead.
  const H = ["| 机组型号 | 主用功率(KW) | 备用功率(KW) | 发动机品牌 | 柴油机型号 | 缸数 | 排量(L) | 机油容量(L) | 燃油消(g/kw/h) | 外形尺寸 (L×W×H mm×mm×mm) | 机组重量(KG) | 技术咨询 | 详细参数"];
  const rows = [
    "| AOKE-M880 | 800KW | 880KW | 奔驰 | 16V2000G65 | 12 | 31.48 | 110 | 200 | 4220*1580*2250 | 6590 | | 详细参数",
    "| AOKE-P880 | 800KW | 880KW | 珀金斯 | 4008TAG2A | 8 | 30.561 | 153 | 200 | 4940*2040*2450 | 6920 | | 详细参数",
    "| AOKE-X880 | 800KW | 880KW | 无锡动力 | WD327TAD88 | 12 | 32.7 | 90 | 217 | 2472*1800*2135 | 5120 | | 详细参数",
  ];
  const S = [sup("x-low", [[114, "800KW", H, rows], [115, "850KW - 奥克发电", H, [
    "| AOKE-C880 | 800KW | 880KW | 重庆康明斯 | KTA38-G5 | 12 | 37.8 | 135 | 210 | 4450*1700*2360 | 7100 | | 详细参数", ...rows]]])];
  const r = flagRows(S);
  const t = r.tables.get("x-low|1");
  assert.ok(t.coded >= 4 && t.read / t.coded < 0.5, JSON.stringify({ coded: t.coded, read: t.read }));
  assert.ok(codesOf(r, "x-low").includes("lowRead"));
  assert.deepEqual(codesOf(flagRows(S, { skip: ["lowRead"] }), "x-low"), []);
});

test("rowKey: bền qua đánh số lại nguồn / bảng; đổi khi chữ của dòng đổi", () => {
  const H = ["| Model | Prime kVA | Prime kW | Engine | Cylinder |"];
  const a = C.fromSupplier(sup("k", [[101, "t", H, ["| G100 | 100 | 80 | 6BTA5.9-G2 | 6 |"]]]))[0];
  const b = C.fromSupplier(sup("k", [[1, "x", H, ["x"]], [205, "t", H, ["| G100 | 100 | 80 |  6BTA5.9-G2 | 6 |"]]])).find((o) => o.model === "6BTA5.9-G2");
  const c = C.fromSupplier(sup("k", [[101, "t", H, ["| G100 | 110 | 88 | 6BTA5.9-G2 | 6 |"]]]))[0];
  assert.equal(rowKey(a), rowKey(b));
  assert.notEqual(rowKey(a), rowKey(c));
});

test("overHalf: NCC có quá nửa số bảng bị nghi", () => {
  const bySup = new Map([["p", { tables: new Set([0, 1, 2]), flagged: new Set([0, 1]) }], ["q", { tables: new Set([0, 1]), flagged: new Set([0]) }]]);
  assert.deepEqual(overHalf(bySup).map((x) => x.id), ["p"]);
});
