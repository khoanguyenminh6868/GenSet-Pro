// Quy chữ nguồn về giá trị chuẩn của enum (aspiration, governor, insulation): `same` mới, ô dính "| Insulation class | H",
// "H class" / "Class H", ghép ô bị cắt ("Turbocharged and" + ô kế tiếp CỦA CÙNG DÒNG). Ca lấy từ chữ thật của cn/.
import test from "node:test";
import assert from "node:assert/strict";
import { enumOf, nextCellOf, valueOf, brushlessOf, stripBrushless, FIELDS } from "./spec-standard.mjs";

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
test("excitation: tự kích chỉ khi nguồn ghi tự kích; 'Brushless' tách sang trường brushless", () => {
  assert.deepEqual(exc.values, ["shunt", "arep", "pmg", "aux_winding", "self_excited"]);
  assert.equal(exc.labels.self_excited, "Tự kích");
  for (const t of ["Self-excited", "Self-excitation", "self-exciting", "Self-Excited", "自励磁", "自励"]) assert.equal(enumOf(exc, t)?.value, "self_excited", t);
  assert.equal(enumOf(exc, "SHUNT")?.value, "shunt");
  assert.equal(enumOf(exc, "Shunt-excited")?.value, "shunt");
  assert.deepEqual(enumOf(exc, "Brushless, self-excited"), { value: "self_excited", rule: "tach-khong-choi-than" });
  assert.equal(enumOf(exc, "Brush less,self-exciting")?.value, "self_excited");
  assert.equal(enumOf(exc, "Brushless,self-excitation")?.value, "self_excited");
  assert.equal(enumOf(exc, "无刷自励磁")?.value, "self_excited");
  assert.equal(enumOf(exc, "Brushless, shunt-excited")?.value, "shunt");
});
test("excitation: chỉ ghi Brushless thì KHÔNG suy ra tự kích; phần không quy được giữ nguyên", () => {
  for (const t of ["Brushless", "Brushless,", "brush less", "无刷"]) { assert.equal(enumOf(exc, t), null, t); assert.deepEqual(valueOf(exc, null, { value: t }), { drop: "chi-khong-choi-than" }, t); }
  assert.equal(enumOf(exc, "Single bearing, Brushless,"), null);
  const r = valueOf(exc, null, { value: "Single bearing, Brushless," });
  assert.deepEqual(r.missing, ["enum"]);
  assert.equal(r.value, "Single bearing, Brushless,");
  assert.equal(enumOf(exc, "Brushless, Permanent-Magnet,"), null, "chưa có luật pmg: không đoán");
});
test("brushless: nhận brushless / brush less / 无刷, không nhận chữ khác", () => {
  for (const t of ["Brushless", "Brush less,self-exciting", "无刷自励", "BRUSHLESS SHUNT"]) assert.equal(brushlessOf(t), true, t);
  for (const t of ["Self-excited", "Shunt", "Brush type", "STAMFORD", ""]) assert.equal(brushlessOf(t), false, t);
  assert.equal(stripBrushless("Brush less,self-exciting"), "self-exciting");
  assert.equal(stripBrushless("Brushless,"), "");
  assert.equal(FIELDS.parts.alternator.find((x) => x.id === "brushless").type, "bool");
});
test("ghép ô: 'Brushless,' + ô kế tiếp ghi tự kích → excitation = self_excited", () => {
  assert.deepEqual(enumOf(exc, "Brushless,", "Self-excited"), { value: "self_excited", rule: "ghep-o", joined: "Self-excited" });
  assert.equal(enumOf(exc, "Brushless", "Self-excited"), null, "không dấu nối: không ghép");
});
