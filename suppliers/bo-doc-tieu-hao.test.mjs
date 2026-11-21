// node --test suppliers/bo-doc-tieu-hao.test.mjs — bo-doc-tieu-hao (Khoa 20/11/2026): tiêu hao chọn cột theo ô đơn vị, tờ hãng động cơ
// vào fuelChecks, nhãn số xi lanh, bảng dòng máy gắn model. Mọi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";
import "../web/spec-norm.js";
import { modelFacts, fuelChecks, fuelAt } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const sup = (id, tables, role = "genset_oem") => ({ id, country: "CN", confidence: "high", role, specTables: tables });
const fuelOf = (r, k) => (r.specs || []).filter((x) => x.key === k).map((x) => SN.normalize(x, { title: r.title, header: r.header || r.lines?.header || [] }));

test("Baudouin 6M31G825/5 [1021]: cột L/hr, không phải gr/kWh; số xi lanh; fuelChecks đạt 156 / 113 / 77", () => {
  const s = real("baudouin"), cat = C.build([s]), facts = modelFacts(cat, [s]).get(`engine:${C.keyOf("6M31G825/5")}`);
  const r = C.fromSupplier(s, []).find((x) => x.n === 1021 && x.model === "6M31G825/5");
  assert.deepEqual(["fuel", "fuel75", "fuel50"].map((k) => [fuelOf(r, k)[0].num, fuelOf(r, k)[0].unit]), [[156, "L/h"], [113, "L/h"], [77, "L/h"]]);
  assert.equal(SN.normalize(r.specs.find((x) => x.key === "cyl"), {}).count, 6);
  const reqs = [["fuel_consumption", 156, "100%"], ["fuel_consumption_75", 113, "75%"], ["fuel_consumption_50", 77, "50%"]].map(([code, n, at]) => ({ code, item: `Tiêu hao ${at}`, requirement: `≤ ${n} lít/giờ`, level: "core" }));
  const c = { engine: { model: "6M31G825/5" }, checks: [] };
  fuelChecks(c, reqs, { specs: [], line: "x" }, facts);
  assert.deepEqual(c.checks.map((x) => x.status), ["met", "met", "met"]);
  assert.ok(c.checks[0].note.includes("156 L/h"));
  assert.ok(c.checks.every((x) => x.note.startsWith("Số của động cơ theo tờ hãng, dung sai ±5 %")), "Khoa 21/11/2026: ghi nguồn là động cơ + dung sai");
  const over = { engine: { model: "6M31G825/5" }, checks: [] };
  fuelChecks(over, [{ code: "fuel_consumption", item: "Tiêu hao", requirement: "≤ 150 lít/giờ", level: "core" }], { specs: [], line: "x" }, facts);
  assert.equal(over.checks[0].status, "not_met");
});

test("ô đơn vị cùng dòng: longkai '| 100% load(Prime power) | L/h | 15'", () => {
  const s = sup("x", [{ n: 1001, title: "Datasheet: Download", header: [], rows: ["| Model | LG55SC", "| Engine model | SC4H95D2", "| 100% load(Prime power) | L/h | 15", "| 75% load(Prime power) | L/h | 11.4"] }]);
  const r = C.fromSupplier(s, []).find((x) => x.kind === "engine");
  assert.equal(fuelOf(r, "fuel")[0].unit, "L/h");
  assert.equal(fuelOf(r, "fuel75")[0].num, 11.4);
});

test("một ô nhiều mức tải: mỗi khoá lấy số ở mức của nó (spec-norm và fuelAt)", () => {
  const x = { label: "Fuel Consumption", value: "342.9 / 457.1 L/h (@75% / @100%)" };
  assert.equal(SN.normalize({ key: "fuel", ...x }, {}).num, 457.1);
  assert.equal(SN.normalize({ key: "fuel75", ...x }, {}).num, 342.9);
  assert.equal(fuelAt(x, 100), 457.1);
  assert.equal(fuelAt(x, 75), 342.9);
});

test("không đoán: số không có ô đơn vị vẫn thiếu đơn vị; tiêu hao tổ máy của NCC không phải hãng không vào fact động cơ", () => {
  assert.ok(SN.normalize({ key: "fuel", label: "100% PRP", value: "193" }, {}).missing.includes("unit"));
  const s = sup("x", [{ n: 1, title: "t", header: [], rows: ["| Engine model | SC4H95D2", "| 100% load(Prime power) | L/h | 15"] }]);
  const f = modelFacts(C.build([s]), [s]).get(`engine:${C.keyOf("SC4H95D2")}`) || [];
  assert.ok(!f.some((y) => /^fuel/.test(y.key)));
});

test("số xi lanh: '6 in line', '12缸V型水冷' đọc; longkai 20M33 ghi '6 in line' (nguồn sai) bỏ", () => {
  assert.equal(SN.normalize({ key: "cyl", label: "No. cylinders", value: "6 in line" }, {}).cond.layout, "L");
  assert.equal(SN.normalize({ key: "cyl", label: "缸数", value: "12缸V型水冷" }, {}).cond.layout, "V");
  const r = C.fromSupplier(real("longkai-power"), []).filter((x) => x.model === "20M33D2020E310" && x.n === 1158);
  assert.ok(r.length && r.every((x) => !(x.specs || []).some((y) => y.key === "cyl")));
});

test("bảng dòng máy của hãng gắn vào model CÙNG trang liệt kê: Baudouin 6M31 [115]", () => {
  const s = real("baudouin"), facts = modelFacts(C.build([s]), [s]);
  const f = (facts.get(`engine:${C.keyOf("6M31G660/5")}`) || []).filter((x) => x.n === 115);
  assert.ok(f.some((x) => x.key === "cyl" && x.value === "6"));
  assert.ok(f.some((x) => x.key === "disp" && x.value === "18.5"));
  assert.ok(!(facts.get(`engine:${C.keyOf("6M33G715/5")}`) || []).some((x) => x.n === 115));
});
