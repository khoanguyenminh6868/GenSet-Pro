// node --test suppliers/named-token.test.mjs — `named()` (model HSMT nêu đích danh) khớp TRỌN token của chữ HSMT (Khoa 20/11/2026):
// chữ dồn bỏ ranh giới nên chuỗi con từng khớp qua chữ khác; model catalog ghi CỤT là tiền tố model HSMT không tính.
import test from "node:test";
import assert from "node:assert/strict";
import { hintsOf, named } from "./config-bot.mjs";

const H = (s) => hintsOf(`Chương V. Yêu cầu kỹ thuật\n${s}`);

test("nêu đích danh thật: trọn mã, khác dấu gạch / dấu cách / hoa thường vẫn nhận", () => {
  assert.equal(named(H("Đầu phát Stamford HCI 544 D hoặc tương đương"), "HCI544D"), true);
  assert.equal(named(H("Động cơ Cummins 6BT5.9-G2"), "6BT5.9-G2"), true);
  assert.equal(named(H("Động cơ cummins 6bt5.9g2"), "6BT5.9-G2"), true);
  assert.equal(named(H("Động cơ: KTA50-G8, 1500 v/p"), "KTA50G8"), true);
  assert.equal(named(H("Đầu phát Eastern Lion EL 224D"), "EL 224D"), true);
});

test("khớp qua ranh giới chữ: không còn nhận (các ca thật của lượt quét bidhist 20/11/2026)", () => {
  assert.equal(named(H("Đầu phát: Model: 224D, loại không chổi than"), "EL 224D"), false);
  assert.equal(named(H("Ắc quy khởi động 12VDC/24VDC"), "DC 24V"), false);
  assert.equal(named(H("Điện áp 220/380V, 50Hz"), "V2203"), false);
  assert.equal(named(H("Cầu dao ACB 2500A 4P"), "B2500"), false);
  assert.equal(named(H("Đầu phát Stamford HCI 444 chung trục"), "HCI444C"), false);
  assert.equal(named(H("Tần số 50Hz"), "STC50"), false);
});

test("model catalog CỤT là tiền tố model HSMT: không tính (Khoa 20/11/2026)", () => {
  assert.equal(named(H("Động cơ Cummins 6BT5.9-G2"), "6BT5.9-G"), false);
  assert.equal(named(H("Động cơ Cummins 4BTA3.9-G11"), "4BTA3.9-G1"), false);
  assert.equal(named(H("Động cơ Cummins model KTA50-GS8"), "KTA50G"), false);
  assert.equal(named(H("Động cơ model HY4105D"), "4105D"), false);
});

test("hints dựng tay không có `bounds`: giữ cách cũ (chuỗi con)", () => {
  assert.equal(named({ text: "model224d" }, "EL224D"), true);
});
