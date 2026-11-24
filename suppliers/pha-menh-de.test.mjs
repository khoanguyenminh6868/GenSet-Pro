// Số pha đọc theo mệnh đề (pha-soat, 24/11/2026): dòng có thiết bị khác (ATS, bảo vệ…) ở MỘT mệnh đề vẫn nêu số pha của tổ máy ở mệnh đề khác.
// Chữ dựng theo mẫu dòng HSMT thật (IB2300046166, IB2400459339, IB2400043707, IB2300194512, IB2500430242, IB2400311290).
import test from "node:test";
import assert from "node:assert/strict";
import { phaseOf } from "./config-bot.mjs";

test("phaseOf: ATS ở mệnh đề khác không làm mất số pha của tổ máy", () => {
  assert.equal(phaseOf("Hạng mục 1 - Máy 550 kVA: Tính đồng bộ: Tổ máy phát điện đồng bộ xoay chiều 3 pha, 4 dây; động cơ, đầu phát, bảng điều khiển, vỏ chống ồn, ATS do cùng một nhà sản xuất"), 3);
  assert.equal(phaseOf("Tổ 150 kVA: Loại tổ máy: Tổ máy phát điện đồng bộ xoay chiều 3 pha, 4 dây, kèm thiết bị khác. Động cơ, đầu phát, ATS do cùng một nhà sản xuất."), 3);
});

test("phaseOf: cấp bảo vệ IP ở mệnh đề khác không làm mất điện áp 3 pha của đầu phát", () => {
  assert.equal(phaseOf("Tổ hợp 50ekW: Đầu phát điện: Công suất ≥ 50kW; điện áp 400V/50Hz/3 pha; cấp bảo vệ IP23 trở lên; cấp cách điện H"), 3);
});

test("phaseOf: nhãn là thiết bị khác thì vẫn bỏ cả dòng", () => {
  assert.equal(phaseOf("Tủ ATS: Số cực: 3 pha 4 cực; chân giá đỡ"), null);
  assert.equal(phaseOf("Bộ điều khiển: Chức năng bảo vệ: Gửi tín hiệu cắt; dừng máy; chạm đất 1 pha"), null);
  assert.equal(phaseOf("Hệ thống chống sét lan truyền: Bộ chống sét, dòng cắt sét ≥ 135kA/1pha; cọc tiếp địa"), null);
});

test("phaseOf: mệnh đề thiết bị khác không đổi kết quả của mệnh đề tổ máy", () => {
  assert.equal(phaseOf("Tổ máy phát điện: Số lượng: 12 máy phát điện diesel 8,5 kVA, 1 pha, 220V; kèm 6 bộ ATS 3 pha"), 1);
  assert.equal(phaseOf("Máy phát điện: Điện áp 3 pha; ATS 1 pha, bảo vệ quá dòng"), 3);
});

test("phaseOf: ghi 3P / 3PH / số pha 3", () => {
  assert.equal(phaseOf("Máy phát điện 30kVA: Điện áp, số pha, hệ số công suất: 230/400VAC, 3P/4W, Pf0.8"), 3);
  assert.equal(phaseOf("MPĐ 750kVA: Điện áp, tần số, số pha: 230V/400V/3P/50Hz"), 3);
  assert.equal(phaseOf("Đầu máy phát: Pha: 3PH+N hoặc tương đương"), 3);
  assert.equal(phaseOf("Máy phát điện: Điện áp, số pha, tần số: Điện áp 400/230 (V); số pha 3; tần số 50Hz"), 3);
  assert.equal(phaseOf("Máy 12 kVA: Số pha: 1P/2W"), 1);
  assert.equal(phaseOf("Máy 2250 kVA: Số lượng và cấu hình: 01 máy 3P-4W-50Hz-0.4kV, 2250 kVA DCP, Diesel 4 Cycle"), 3);
  assert.equal(phaseOf("Aptomat MCCB: Ue ≥ 690V (3P), ≥ 550V (2P)"), null);
});

test("phaseOf: ghi chú 'Văn bản ghi …' của người đọc không là số pha của máy", () => {
  assert.equal(phaseOf("Phần A - Máy 40 kVA: Đầu phát: công suất ≥ 40KVA; cấp bảo vệ IP 23; 50 Hz. Văn bản ghi loại đầu phát và điện áp ra là 1 pha 2 dây"), null);
});
