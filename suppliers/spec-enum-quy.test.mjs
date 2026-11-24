// Quy chữ nguồn về giá trị chuẩn của enum (aspiration, governor, insulation): `same` mới, ô dính "| Insulation class | H",
// "H class" / "Class H", ghép ô bị cắt ("Turbocharged and" + ô kế tiếp CỦA CÙNG DÒNG). Ca lấy từ chữ thật của cn/.
import test from "node:test";
import assert from "node:assert/strict";
import { enumOf, nextCellOf, valueOf, FIELDS } from "./spec-standard.mjs";

const f = (part, id) => FIELDS.parts[part].find((x) => x.id === id);
const asp = f("engine", "aspiration"), gov = f("engine", "governor"), ins = f("alternator", "insulation"), exc = f("alternator", "excitation");

test("aspiration: cách viết cùng nghĩa về giá trị chuẩn", () => {
  assert.equal(enumOf(asp, "Turbo-charged")?.value, "turbo");
  assert.equal(enumOf(asp, "涡轮增压")?.value, "turbo");
  assert.equal(enumOf(asp, "增压中冷")?.value, "turbo_aftercooled");
  assert.equal(enumOf(asp, "Turbo /Inter cooling")?.value, "turbo_aftercooled");
  assert.equal(enumOf(asp, "Naturally Aspirated")?.value, "natural");
  assert.equal(enumOf(asp, "自然吸气")?.value, "natural");
});
test("aspiration: dòng 'cần Khoa xem' để nguyên (không đoán)", () => {
  for (const t of ["Aftercooled", "Supercharged non-intercooled", "Natural Turbocharged & Aftercooled", "Turbocharged and Air", "water-cooled,4 valves, Turbo charged"]) assert.equal(enumOf(asp, t), null, t);
});
test("governor: điện tử / cơ khí / ECU; ghi cả hai hoặc mô tả hệ thống phun để nguyên", () => {
  assert.equal(enumOf(gov, "Electric")?.value, "electronic");
  assert.equal(enumOf(gov, "电子调速E")?.value, "electronic");
  assert.equal(enumOf(gov, "Mechanically")?.value, "mechanical");
  assert.equal(enumOf(gov, "EMS2 / ECU")?.value, "ecu");
  for (const t of ["Electronic/M", "Mechanical/ Electrical", "Electronically Controlled Common Rail System", "G-Drive Governor", "Electronic ECM"]) assert.equal(enumOf(gov, t), null, t);
});
test("insulation: bỏ tiền tố ô dính, 'H class' / 'Class H', H/H", () => {
  assert.deepEqual(enumOf(ins, "| Insulation class | H"), { value: "H", rule: "tien-to-o" });
  assert.equal(enumOf(ins, "| Insulation class | H | Excitation system 6-wire")?.value, "H");
  assert.equal(enumOf(ins, "| INSULATION SYSTEM | CLASS H")?.value, "H");
  assert.deepEqual(enumOf(ins, "H class"), { value: "H", rule: "chu-class" });
  assert.equal(enumOf(ins, "Class H")?.value, "H");
  assert.equal(enumOf(ins, "Class F")?.value, "F");
  assert.equal(enumOf(ins, "H/H")?.value, "H");
  assert.equal(enumOf(ins, "H /IP22 or F/IP21"), null, "hai tổ hợp cách điện + IP: không chọn");
  assert.equal(enumOf(ins, "Class X"), null, "chữ cái không là giá trị chuẩn");
});
test("ghép ô: chữ cắt ở nối từ + ô kế tiếp của cùng dòng, đúng một giá trị chuẩn", () => {
  const line = "| BF-1 | Turbocharged and | Aftercooled | 6 |";
  assert.equal(nextCellOf(line, "Turbocharged and"), "Aftercooled");
  const r = enumOf(asp, "Turbocharged and", "Aftercooled");
  assert.deepEqual(r, { value: "turbo_aftercooled", rule: "ghep-o", joined: "Aftercooled" });
  assert.equal(valueOf(asp, null, { value: "Turbocharged and" }, "Aftercooled").joined, "Aftercooled");
});
test("ghép ô: không ghép khi không có ô kế tiếp, khi chữ không cắt ở nối từ, hoặc ghép ra chưa chuẩn", () => {
  assert.equal(nextCellOf("| Aspiration | Turbocharged and", "Turbocharged and"), null, "hết dòng: không lấy dòng khác");
  assert.equal(nextCellOf(null, "x"), null);
  assert.equal(enumOf(asp, "Turbocharged and", null), null);
  assert.equal(enumOf(asp, "Turbocharged", "Aftercooled")?.value, "turbo", "không cắt ở nối từ: giữ nghĩa của chính ô");
  assert.equal(enumOf(asp, "Turbocharged and", "Governor"), null, "ghép ra chữ chưa chuẩn");
});
test("excitation: chưa đổi (kiểu trường chỉ một giá trị, 'không chổi than' không có chỗ)", () => {
  assert.deepEqual(exc.values, ["shunt", "arep", "pmg", "aux_winding"]);
  assert.equal(exc.same, undefined);
  assert.equal(enumOf(exc, "Brushless, self-excited"), null);
});
