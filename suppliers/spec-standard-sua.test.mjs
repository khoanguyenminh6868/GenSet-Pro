// Bộ sinh bản chuẩn: khí thải giữ cấu trúc thang + mức (trước đây "[object Object]"), công suất động cơ không đơn vị không
// nằm dưới khoá kwm / hp. Hàm thuần, ca lấy từ ô thật của cn/.
import test from "node:test";
import assert from "node:assert/strict";
import { valueOf, levelsOf, moveEnginePower, FIELDS } from "./spec-standard.mjs";

const SN = globalThis.GenbidSpecNorm;
const emission = FIELDS.parts.engine.find((f) => f.id === "emission");
const read = (label, value) => {
  const sp = { key: "emission", label, value };
  return valueOf(emission, SN.normalize(sp, { title: "", header: [], rows: [] }), sp);
};

test("khí thải: danh sách { thang, mức }, không ép thành chữ", () => {
  const r = read("Emission", "EU Stage II / EPA Tier 2"); // jiuan-power n126
  assert.deepEqual(r.value, [{ scale: "EPA Tier", level: "2" }, { scale: "EU Stage", level: "2" }]);
  assert.ok(!JSON.stringify(r).includes("[object"));
});
test("khí thải: nguồn không ghi thang thì thang trống, không đoán", () => {
  const r = read("Emission", "T2"); // hanyang-weifang n101
  assert.deepEqual(r.value, [{ scale: null, level: "2" }]);
  assert.ok(r.missing.includes("scale"));
});
test("levelsOf: bỏ chữ nguồn, gộp trùng, thứ tự cố định", () => {
  const a = levelsOf([{ scale: "CN", level: "2", text: "国II" }, { scale: "CN", level: "2", text: "国 II" }]);
  assert.deepEqual(a, [{ scale: "CN", level: "2" }]);
  assert.deepEqual(levelsOf([{ scale: "EU Stage", level: "3A" }, { scale: null, level: "2" }]), levelsOf([{ scale: null, level: "2" }, { scale: "EU Stage", level: "3A" }]));
});
test("công suất động cơ: không đơn vị thì cột figure + missing unit, không phải kwm / hp", () => {
  const fields = { power_kwm: [
    { value: 3311, unit: null, missing: ["speed", "unit"], raw: "3311" }, // ettes-power n143 ET-3750 (unitspec)
    { value: 247, unit: "kW", missing: [], raw: "247kW", cond: { rating: "prime", rpm: 1500 } },
    { value: 100, unit: "hp", missing: [], raw: "100 HP" },
  ] };
  moveEnginePower(fields);
  assert.deepEqual(fields.power_kwm.map((x) => x.value), [{ rating: null, rpm: null, figure: 3311 }, { rating: "prime", rpm: 1500, kwm: 247 }]);
  assert.ok(fields.power_kwm[0].missing.includes("unit"));
  assert.deepEqual(fields.power_hp.map((x) => x.value), [{ rating: null, rpm: null, hp: 100 }]);
});
