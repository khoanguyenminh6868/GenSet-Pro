// sizesOf với chữ HSMT làm ngữ cảnh (sizes-co-ao, 24/11/2026): danh sách số trơ của bidhist `config.kvas` mất chữ quanh mỗi số,
// nên số dự phòng / tối đa và công suất động cơ từng thành cỡ máy riêng. Chữ rút gọn từ HSMT thật (số thông báo ở tên ca).
import test from "node:test";
import assert from "node:assert/strict";

const { sizesOf, sizeText } = await import("./config-bot.mjs");
const read = (kvas, ctx, name = "") => sizesOf([kvas, name], name, ctx).map(sizeText);

test("dự phòng của cùng máy không là cỡ (IB2300005377, IB2500291421, IB2600327799)", () => {
  assert.deepEqual(read("1000 kVA, 1132 kVA, 906 kW, 1029 kVA, 823 kW",
    "Tổ máy phát điện 1000 kVA: Số lượng: 1 bộ tổ máy phát điện công suất liên tục 1000kVA\nTổ máy phát điện 1000 kVA: Công suất dự phòng: 1132 kVA/906KW\nTổ máy phát điện 1000 kVA: Công suất liên tục: 1029kVA/823KW"), ["1.000 kVA"]);
  assert.deepEqual(read("550 kVA, 440 kW, 605 kVA, 484 kVA",
    "Máy 550 kVA: Tổ máy phát điện - công suất liên tục: Công suất liên tục 550KVA/440KW.\nMáy 550 kVA: Tổ máy phát điện - công suất dự phòng: Công suất dự phòng 605KVA/484KVA (theo đúng văn bản)."), ["550 kVA"]);
  assert.deepEqual(read("300 kVA, 350 kVA, 200 kVA, 230 kVA, 100 kVA, 120 kVA",
    "Phần 1 - Máy 300 kVA: Đầu phát - Công suất: Liên tục ≥300 KVA; dự phòng ≥350 KVA\nPhần 2 - Máy 200 kVA: Máy phát điện - Công suất dự phòng: ≥230 KVA\nPhần 3 - Máy 100 kVA: Máy phát điện - Công suất dự phòng: ≥120KVA"),
  ["100 kVA", "200 kVA", "300 kVA"]);
});

test("số đứng sau nhãn dự phòng qua dấu ; vẫn là dự phòng; tối đa không là cỡ (IB2400145438)", () => {
  assert.deepEqual(read("7 kVA, 7.5 kVA, 8 kVA, 12 kVA, 12.5 kVA, 13.2 kVA, 13.7 kVA",
    "Máy xăng 7 kVA: Công suất định mức: ≥ 7KVA (MRQ); ≥ 7.5KVA (RQ).\nMáy xăng 7 kVA: Công suất tối đa: ≥ 8KVA (MRQ).\nMáy dầu 12 kVA: Công suất định mức: ≥ 12.0 kVA (MRQ); ≥ 12.5 kVA (RQ).\nMáy dầu 12 kVA: Công suất dự phòng: ≥ 13.2 kVA (MRQ); ≥ 13.7 kVA (RQ)."),
  ["7 kVA", "12 kVA"]);
});

test("công suất động cơ (động cơ lai, trục khuỷu, hp) không là cỡ (IB2300003199, IB2300232318, IB2600457659)", () => {
  assert.deepEqual(read("91 kW, 80 kW, 13 kW, 8 kW",
    "Tổ máy phát điện chính: Công suất: Động cơ diesel lai công suất 91 kW; máy phát 80 kW, 400V, 50Hz, 3 pha.\nTổ máy phát điện sinh hoạt: Công suất: Động cơ diesel lai công suất 13 kW; máy phát 08 kWe, 50Hz, 1 pha.\nTổ máy phát điện sinh hoạt: Động cơ - Công suất lớn nhất: 13 kW ± 5%."),
  ["8 kW", "80 kW"]);
  assert.deepEqual(read("12 kW, 15.2 kW", "Đinamo phát điện 3 pha: Điện áp đầu ra 12KW 220V\nĐộng cơ đầu nổ bộ đề: Động cơ dầu Diesel 24hp; công suất >=15.2kw"), ["12 kW"]);
  assert.deepEqual(read("13.5 kW, 15.5 kW, 27 kW, 32.1 kW",
    "Hạng mục 1 - Máy phát: Công suất: 13,5 kW\nHạng mục 1 - Động cơ lai: Công suất: 15,5 KW\nHạng mục 2 - Máy phát: Công suất: 27 kW\nHạng mục 2 - Động cơ lai: Công suất: 32,1 KW"),
  ["13,5 kW", "27 kW"]);
});

test("nhãn đứng sau số và 'liên tục tối đa' (IB2200068912, IB2500092506); kW cạnh kVA là cùng máy (IB2200022333)", () => {
  assert.deepEqual(read("275 kVA, 250 kVA", "Máy phát điện: Công suất: Máy phát điện công suất 275 kVA Standby (dự phòng) / 250 kVA Prime (liên tục), nguyên chiếc"), ["250 kVA"]);
  assert.deepEqual(read("2405 kVA, 1924 kW, 2573 kVA",
    "Đầu phát điện: Công suất dự phòng tối đa (6,3kV): 2573 kVA/2058 kW\nĐầu phát điện: Công suất liên tục tối đa (6,3kV): 2405 kVA/1924 kW"), ["2.405 kVA"]);
  assert.deepEqual(read("400 kVA, 160 kW, 220 kVA, 176 kW",
    "Máy phát điện 400 kVA: Công suất định mức (prime): 400,0 kVA / 160,0 kW\nMáy phát điện 400 kVA: Công suất dự phòng (stanby): 220,0 kVA / 176,0 kW"), ["400 kVA"]);
});

test("cỡ thật giữ nguyên; không ngữ cảnh thì như cũ", () => {
  const kvas = "100 kVA, 80 kW, 110 kVA, 88 kW, 150 kVA, 120 kW, 165 kVA, 132 kW";
  const ctx = "Phần 1 - Máy 100 kVA: Công suất: Công suất dài hạn 80 kW / 100 kVA.\nPhần 1 - Máy 100 kVA: Công suất dự phòng: Công suất dự phòng 88 kW / 110 kVA.\nPhần 2 - Máy 150 kVA: Công suất: Công suất dài hạn 120 kW / 150 kVA.\nPhần 2 - Máy 150 kVA: Công suất dự phòng: Công suất dự phòng 132 kW / 165 kVA.";
  assert.deepEqual(read(kvas, ctx), ["100 kVA", "150 kVA"]);
  // Một cỡ chỉ ghi dự phòng: không có số liên tục nào thì vẫn là cỡ.
  assert.deepEqual(read("150 kVA, 400 kVA", "Hạng mục 3 - Máy 400 kVA: Công suất định mức: Chế độ dự phòng, S ≥ 400 kVA\nHạng mục 4 - Máy 150 kVA: Công suất định mức: Chế độ dự phòng, S ≥ 150 kVA"), ["150 kVA", "400 kVA"]);
  assert.deepEqual(sizesOf(["1000 kVA, 1132 kVA", ""], "").map(sizeText), ["1.000 kVA", "1.132 kVA"]);
});
