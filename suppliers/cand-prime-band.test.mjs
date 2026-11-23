// node --test suppliers/cand-prime-band.test.mjs — Khoa 21/11/2026: cỡ máy HSMT không ghi mức thì hiểu là prime.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, capacity, hintsOf, sizesOf, engineRows } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const ENG = ["WP10D264E200", "WP10D238E200", "WP12D317E200", "WP13D385E200"];
const rec = (id, prime, standby, eng) => ({ id, role: "genset_maker", country: "CN", confidence: "high", names: { en: id }, specTables: [{ n: 2001, title: "Weichai gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Standby kVA | Standby kW | Engine"], rows: [`| ${id}-1 | ${prime} | ${+(prime * 0.8).toFixed(2)} | ${standby} | ${+(standby * 0.8).toFixed(2)} | ${eng}`] }] });
const free = () => ({ ...hintsOf("Chương V. Yêu cầu kỹ thuật\n50 Hz"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (cap, list) => candidates(C.build(list), cap, free(), { suppliers: list, makeCap: 0 });

test("không ghi mức: prime 95 / standby 105 không vào gói 100 kVA, prime 100 / standby 110 vào", () => {
  const list = [rec("low", 95, 105, ENG[0]), rec("ok", 100, 110, ENG[1])];
  assert.deepEqual(run({ value: 100, unit: "kVA" }, list).top.map((r) => r.u.supplierId), ["ok"]);
});

test("không ghi mức: trần dải cũng so bằng prime (prime 120 / standby 132 vào, prime 121 không)", () => {
  const list = [rec("top", 120, 132, ENG[0]), rec("over", 121, 133, ENG[1])];
  assert.deepEqual(run({ value: 100, unit: "kVA" }, list).top.map((r) => r.u.supplierId), ["top"]);
});

test("HSMT ghi rõ standby: giữ luật cũ, một mức trong dải là vào", () => {
  const list = [rec("low", 95, 105, ENG[0])];
  assert.equal(run({ value: 100, unit: "kVA", rating: "standby" }, list).top.length, 1);
});

test("Tìm NCC cùng cách so", () => {
  assert.equal(engineRows(rec("low", 95, 105, ENG[0]), { value: 100, unit: "kVA" }).length, 0);
  assert.equal(engineRows(rec("ok", 100, 110, ENG[0]), { value: 100, unit: "kVA" }).length, 1);
});

test("capacity: chỉ chữ chỉ MỨC mới là standby, chữ công dụng 'dự phòng' thì không", () => {
  for (const s of ["Công suất dự phòng 100 kVA", "Standby ≥ 100 kVA", "100 kVA dự phòng", "100 kVA (standby)"]) assert.equal(capacity([s]).rating, "standby", s);
  for (const s of ["Máy phát điện dự phòng 100 kVA", "Nguồn dự phòng 100 kVA", "Tổ máy dự phòng 100 kVA", "Standby generator 100 kVA", "100 kVA", "Công suất liên tục 100 kVA", "100 kVA liên tục / 110 kVA dự phòng"]) assert.equal(capacity([s]).rating, undefined, s);
});

test("sizesOf: cỡ chỉ ghi dự phòng mang nhãn standby, cỡ thường không", () => {
  assert.equal(sizesOf(["2000 kVA dự phòng"])[0].cap.rating, "standby");
  assert.equal(sizesOf(["2 x 250 kVA và 1 x 500 kVA"])[0].cap.rating, undefined);
});
