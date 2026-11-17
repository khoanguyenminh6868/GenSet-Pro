// node --test suppliers/*.test.mjs — soát ngưỡng đợt 3 (hints-audit 2026-11-17, Khoa "làm 3"): các dạng dòng HSMT có
// ngưỡng tiêu hao / số xi lanh mà Phân tích đọc được còn code không. Mỗi ca là dòng thật (pdftotext) của gói ghi bên cạnh.
import test from "node:test";
import assert from "node:assert/strict";
import { engineMins, powerRead } from "./config-bot.mjs";

const fuel = (t) => powerRead(t).mins;
const fig = (t) => powerRead(t).fuel.map((x) => [x.v, x.load]);

// ---------- Số xi lanh ----------
test("\"8 Số xilanh ≥ 4\" không bị gộp với dòng trên có \"≤\" (IB2200029877)", () => {
  const m = engineMins("    7      Tỉ số nén               ≤ 19\n    8      Số xilanh               ≥ 4\n    9      Công suất liên tục      ≥ 14kW");
  assert.equal(m.minCyl, 4);
  assert.equal(m.cylExact, false);
});
test("nhãn một dòng, \"≥ 3 thẳng hàng\" dòng dưới: tối thiểu 3 (IB2400497572, IB2400473260, IB2500390999)", () => {
  assert.deepEqual([engineMins("Số xy lanh, kiểu bố trí\n≥ 3 thẳng hàng.\n9").minCyl, engineMins("Số xy lanh, kiểu bố trí\n≥ 3 thẳng hàng.\n9").cylExact], [3, false]);
  assert.equal(engineMins("   Số xy lanh, kiểu bố\n7  ≥ 3 thẳng hàng           Đạt     Không đạt\n   trí").minCyl, 3);
  assert.equal(engineMins("Số xy lanh, kiểu bố       Không\n≥ 3 thẳng hàng      Đạt\ntrí               đạt").minCyl, 3);
  assert.equal(engineMins("Số xy lanh, kiểu bố trí\n≥ 4thẳnghàng\nĐạt").minCyl, 4);
});
test("số thứ tự hàng trước dấu không là số xi lanh: \"Số lượng xi lanh của\" / \"2 ≥ 16 (*)\" → 16 (IB2300015080)", () => {
  const m = engineMins("Số lượng xi lanh của\n2           ≥ 16 (*)\nđộng cơ");
  assert.equal(m.minCyl, 16);
  assert.equal(m.cylExact, false);
});
test("nhãn \"Số xy-lanh\", \"Số lượng xi lanh\", \"Số cylinder\", \"Number of cylinder\", giá trị \"6L\" (số trơ: chính xác)", () => {
  for (const [t, n] of [["- Số xy-lanh 6 xy lanh, xếp thẳng", 6], ["- Số lượng xi lanh: 6", 6], ["- Tốc độ: 1500 V/phút, Số cylinder: 16 bố trí hình chữ V;", 16],
    ["Number of cylinder - 6", 6], ["Số xi lanh: 6L", 6], ["- Số Xi-lanh/ kết cầu Xi-lanh 4/L.", 4], ["Số xi-lanh, cách bố trí ≥6", 6]]) {
    assert.equal(engineMins(t).minCyl, n, t);
  }
  assert.equal(engineMins("Số xi lanh: 6L").cylExact, true);
  assert.equal(engineMins("Số xi-lanh, cách bố trí ≥6").cylExact, false);
});
test("\"N xy lanh\" giữa câu tả động cơ (IB2200032133, IB2200012854, IB2600587429)", () => {
  assert.equal(engineMins("Động cơ đốt trong, 4 kỳ, 6 xy lanh, thẳng hàng, có turbo tăng áp và làm mát khí nạp").minCyl, 6);
  assert.equal(engineMins(" - Động cơ 4 thì, 4 xylanh, phun nhiên liệu trực tiếp").minCyl, 4);
  assert.equal(engineMins("- Loại động cơ: Diesel 4 thì 4 xy lanh").cylExact, true);
  // hàng hoá tham khảo: tối thiểu, không loại động cơ số xi lanh khác (IB2400474549)
  const ref = engineMins("- Loại động cơ: 4 thì 2 xi lanh- Tốc độ: 3000 vòng/phút\n* Hàng hóa tương tự để nhà thầu tham khảo");
  assert.deepEqual([ref.minCyl, ref.cylExact], [2, false]);
  // "tối thiều" (OCR) vẫn là tối thiểu
  assert.equal(engineMins("2. | Kiểu động cơ: 4 thì, tối thiều 2 xi lanh.").cylExact, false);
});
test("không đọc: nhiều lựa chọn, động cơ xuồng, đường kính xi lanh, \"≤ 6\"", () => {
  assert.equal(engineMins("Engine type: 4 strokes, 6 or 8- or 12-cylinder").minCyl, null);
  assert.equal(engineMins("Kiểu động cơ: 4 thì, 6 hoặc 8 xi lanh").minCyl, null);
  assert.equal(engineMins("1 Động cơ xuồng - Kiểu động cơ: Diesel 4 thì, 6 xy-lanh thẳng hàng").minCyl, null);
  assert.equal(engineMins("Số xy lanh: ≤ 6").minCyl, null);
});

// ---------- Tiêu hao nhiên liệu ----------
test("dấu \"<\" là mức tối đa; đơn vị \"lít/h\" (IB2200021336, IB2400440994, IB2300178837)", () => {
  assert.equal(fuel("20 Tiêu hao nhiên liệu Tại 100% tải < 26.5 lít/h").maxFuel, 26.5);
  assert.equal(fuel("22 Tiêu hao nhiên liệu tại 100% tải <5.4 lít/ giờ").maxFuel, 5.4);
  assert.equal(fuel("9     Mức tiêu thụ nhiên liêu            ≤ 3 lít/h").maxFuel, 3);
  assert.equal(fuel("Tiêu hao nhiên liệu\n- ≤ 503,2 L/hr (Lít/giờ)\ntại 100% công suất").maxFuel, 503.2);
});
test("số không dấu có nhãn tiêu hao cùng dòng (IB2400607862, IB2500291421, IB2600118095)", () => {
  assert.equal(fuel("Tiêu hao nhiên liệu (100% CS): 8.76Lít/ Giờ").maxFuel, 8.76);
  assert.equal(fuel("- Tiêu thụ nhiên liệu ( 100% tải): 81.8 L/h").maxFuel, 81.8);
  assert.equal(fuel("- Tiêu hao nhiên liệu: 3.9 L/h").maxFuel, 3.9);
  assert.deepEqual(fig("- Tiêu thụ ở 100% công suất liên tục: 53 lít/h\n- Tiêu thụ ở 75% công suất liên tục: 39 lít/h\n- Tiêu thụ ở 50% công suất liên tục: 27 lít/h\nnhiên liệu"), [[53, 100], [39, 75], [27, 50]]);
});
test("danh sách mức tải dưới nhãn (IB2300285618, IB2400389856)", () => {
  assert.equal(fuel("- Tiêu hao nhiên liệu:\n+ 75% tải: 47 l/h,\nTên hàng").maxFuel75, 47);
});
test("đơn vị trước số: \"ở L/h ≤ 135\" / \"mức100%tải\", \"(lít/giờ) ≤ 320\", \"(L/h): ≤ 4,5\" (IB2400533611, IB2400588970, IB2300026252)", () => {
  assert.equal(fuel("Tiêu hao nhiên liệu ở L/h ≤ 135\nmức100%tải").maxFuel, 135);
  assert.equal(fuel("Tiêu hao nhiên liệu tại 100% công suất liên tục\n(lít/giờ) ≤ 320\n1.10").maxFuel, 320);
  assert.deepEqual(fig("- Tiêu hao nhiên liệu ở 75% tải (L/h): ≤ 4,5\n- Tiêu hao nhiên liệu ở 100% tải (L/h): ≤ 5,5"), [[4.5, 75], [5.5, 100]]);
});
test("mức tải ở dòng dưới số; mức tải của hàng trên không tính (IB2200043097, IB2200052323)", () => {
  const t = "      Tiêu thụ nhiên liệu mức                                              Đạt\n15                               ≤ 4,0 L/h\n      100% tải liên tục\n      Tiêu thụ nhiên liệu mức                                              Đạt\n16                               ≤ 3,1 L/h\n      75% tải liên tục";
  assert.deepEqual(fig(t), [[4, 100], [3.1, 75]]);
  assert.deepEqual([fuel(t).maxFuel, fuel(t).maxFuel75], [4, 3.1]);
});
test("mức tải sau số: \"( tại 75% công\" gãy dòng, \"(100% CS)\" (IB2400440222, IB2500266050)", () => {
  assert.deepEqual(fig("Tiêu hao nhiên liệu       20 L/h ( tại 75% công\nsuất)"), [[20, 75]]);
  assert.deepEqual(fig("Thời gian chạy liên tục s 16h(50% CS)\nTiêu hao nhiên liệu « 4,83 L/h (100% CS)"), [[4.83, 100]]);
});
test("không đọc: dung sai \"±\", \"khoảng\", \"~\", \"≥\", ví dụ tính, số thứ tự dòng dưới (IB2400493077, IB2600278676, IB2600313010)", () => {
  assert.deepEqual(fig("Tiêu thụ nhiên liệu mức\n13 ≤ 21±2 lít/giờ, dòng điện ≥121.8A\n100% tải liên tục"), []);
  assert.deepEqual(fig("Tiêu hao nhiên liệu\n(≤19,4 lít/h ±5%) tại mức tải đạt 100% công suất."), []);
  assert.deepEqual(fig("-Tiêu hao nhiên liệu (100%CS): khoảng 13 đến 15L/h"), []);
  assert.deepEqual(fig("+ Mức 100% tải ~ 42.1 lít/giờ; mức tiêu thụ nhiên liệu"), []);
  assert.deepEqual(fig("Tiêu hao nhiên liệu ở mức 100% tải\n≥ 135 L/giờ"), []);
  assert.deepEqual(fig("Ví dụ: máy A tuyên bố tiêu thụ nhiên liệu ở 75% (tải 9,5 kW) là 3,7 l/h với dầu"), []);
  assert.deepEqual(fig("       Tiêu hao nhiên liệu tại     ≤34.5 lít/h\n15\n              100% tải").map((x) => x[0]), [34.5]);
});
