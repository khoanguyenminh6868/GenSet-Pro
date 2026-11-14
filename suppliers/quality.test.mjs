// node --test suppliers/quality.test.mjs — báo cáo chất lượng thông số (quality.mjs, việc chuan-hoa-2).
import test from "node:test";
import assert from "node:assert/strict";
import { measure, check, baselineOf, DEFAULT_THRESHOLDS } from "./quality.mjs";

// Two suppliers writing the same engine: displacement in the same unit with different figures (a real conflict), and
// cylinders as "6L" / "6" (the same after normalization, as the 14/11 audit counted them too).
const sup = (id, rows) => ({ id, country: "CN", role: "assembler", names: { en: id }, specTables: [{ n: 101, title: "Cummins generator set", header: ["| Genset Model | Prime Power | Standby Power | Engine Model | Cylinder | Displacement (L) | Fuel Consumption (L/h) | Noise"], rows }] });
const SUPS = [
  sup("a-power", ["| AP100 | 100 | 110 | 6BTA5.9-G2 | 6L | 5.9 | 21 | 75"]),
  sup("b-power", ["| BP100 | 100 | 110 | 6BTA5.9-G2 | 6 | 8.3 | 22 | 76dB(A)@7m"]),
];

test("measure: độ phủ, missing theo loại, mâu thuẫn trước / sau", () => {
  const m = measure(SUPS);
  assert.equal(m.keys.fuel.n, 2);
  assert.equal(m.keys.fuel.missing.load, 2, "không ghi mức tải");
  assert.equal(m.keys.fuel.missing.unit, undefined, "L/h ở tiêu đề cột");
  assert.equal(m.keys.noise.missing.unit, 1);
  assert.equal(m.keys.noise.missing.distance, 1);
  assert.equal(m.keys.cyl.missing.layout, 1);
  assert.equal(m.conflicts.disp.strict.conflicts, 1);
  assert.deepEqual(m.conflicts.disp.strict.models[0].values.map((v) => v.value).sort(), [5.9, 8.3]);
  assert.equal(m.conflicts.cyl.strict.conflicts, 0);
  assert.equal(m.power.n, 2);
  assert.equal(m.power.missingPct.freq, 100, "bảng không ghi tần số");
});

test("check: đỏ khi xấu đi quá ngưỡng, xanh khi bằng mốc", () => {
  const m = measure(SUPS), base = baselineOf(m);
  assert.deepEqual(check(m, base), []);
  const worse = structuredClone(m);
  worse.keys.fuel.n = 5000; worse.keys.fuel.missingPct.unit = 50; worse.keys.fuel.valuePct = 90;
  worse.conflicts.disp.strict.conflicts = 1 + DEFAULT_THRESHOLDS.conflictRise + 1;
  const big = structuredClone(base); big.keys.fuel.n = 5000;
  const bad = check(worse, big);
  assert.ok(bad.some((x) => /fuel: thiếu "unit"/.test(x)), bad.join("\n"));
  assert.ok(bad.some((x) => /fuel: tỉ lệ có số/.test(x)));
  assert.ok(bad.some((x) => /disp: .* model mâu thuẫn/.test(x)));
});

test("check: mã ít mẫu (< smallN) chịu ngưỡng nới smallFactor lần", () => {
  const m = measure(SUPS), base = baselineOf(m);
  const moved = structuredClone(m);
  moved.keys.noise.missingPct.distance = base.keys.noise.missingPct.distance + DEFAULT_THRESHOLDS.missingPctRise * 2;
  assert.deepEqual(check(moved, base), [], "n = 2 < smallN: ngưỡng ×5");
  moved.keys.noise.missingPct.distance = base.keys.noise.missingPct.distance + DEFAULT_THRESHOLDS.missingPctRise * DEFAULT_THRESHOLDS.smallFactor + 1;
  assert.equal(check(moved, base).length, 1);
});
