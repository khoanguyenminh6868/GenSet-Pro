import { test } from "node:test";
import assert from "node:assert/strict";

await import("../../conversions.js");
const { compute, matches } = globalThis.GenbidConversions;

test("compute: công thức đơn giản kva_from_kw và kw_from_kva", () => {
  const r1 = compute({
    formula: "kva_from_kw",
    inputs: [
      { name: "P_kW", value: 800 },
      { name: "pf", value: 0.8 },
    ],
  });
  assert.equal(r1.error, undefined);
  assert.ok(Math.abs(r1.value - 1000) < 1e-9);

  const r2 = compute({
    formula: "kw_from_kva",
    inputs: [
      { name: "S_kVA", value: 1250 },
      { name: "pf", value: 0.8 },
    ],
  });
  assert.equal(r2.error, undefined);
  assert.ok(Math.abs(r2.value - 1000) < 1e-9);
});

test("compute: công thức rpm_from_poles và c_from_f (kể cả số âm, 0)", () => {
  const rpm = compute({
    formula: "rpm_from_poles",
    inputs: [
      { name: "f_Hz", value: 50 },
      { name: "poles", value: 4 },
    ],
  });
  assert.equal(rpm.error, undefined);
  assert.equal(rpm.value, 1500);

  const c100 = compute({
    formula: "c_from_f",
    inputs: [{ name: "t_F", value: 212 }],
  });
  assert.equal(c100.error, undefined);
  assert.ok(Math.abs(c100.value - 100) < 1e-9);

  const c0 = compute({
    formula: "c_from_f",
    inputs: [{ name: "t_F", value: 32 }],
  });
  assert.equal(c0.error, undefined);
  assert.ok(Math.abs(c0.value - 0) < 1e-9);

  const cNeg = compute({
    formula: "c_from_f",
    inputs: [{ name: "t_F", value: -40 }],
  });
  assert.equal(cNeg.error, undefined);
  assert.ok(Math.abs(cNeg.value - -40) < 1e-9);
});

test("compute: lph_from_gkwh với rho_gL chuẩn trả về khoảng [min, max] đúng thứ tự", () => {
  // b = 200 g/kWh, P = 845 kW => b*P = 169000
  // Chia cho DIESEL.max (845) = 200; chia cho DIESEL.min (820) = 169000/820 = 206.09756097560975
  const r = compute({
    formula: "lph_from_gkwh",
    inputs: [
      { name: "b_gkWh", value: 200 },
      { name: "P_kW", value: 845 },
      { name: "rho_gL", from: "standard" },
    ],
  });
  assert.equal(r.error, undefined);
  assert.ok(Array.isArray(r.value));
  assert.equal(r.value.length, 2);
  assert.ok(r.value[0] < r.value[1]);
  assert.ok(Math.abs(r.value[0] - 200) < 1e-9);
  assert.ok(Math.abs(r.value[1] - 206.09756097560975) < 1e-9);
});

test("compute: gkwh_from_lph với rho_gL chuẩn trả về khoảng [min, max]", () => {
  // Q = 100 L/h, P = 500 kW => Q/P = 0.2
  // Nhân 820 = 164; nhân 845 = 169
  const r = compute({
    formula: "gkwh_from_lph",
    inputs: [
      { name: "Q_Lh", value: 100 },
      { name: "rho_gL", from: "standard" },
      { name: "P_kW", value: 500 },
    ],
  });
  assert.equal(r.error, undefined);
  assert.ok(Array.isArray(r.value));
  assert.equal(r.value.length, 2);
  assert.ok(Math.abs(r.value[0] - 164) < 1e-9);
  assert.ok(Math.abs(r.value[1] - 169) < 1e-9);
});

test("compute: báo lỗi khi công thức không hợp lệ hoặc tham số là null/undefined", () => {
  const r1 = compute({ formula: "khong_ton_tai", inputs: [] });
  assert.equal(typeof r1.error, "string");
  assert.ok(r1.error.includes("khong_ton_tai"));
  assert.equal(r1.value, undefined);

  const r2 = compute(undefined);
  assert.equal(typeof r2.error, "string");
  assert.equal(r2.value, undefined);

  const r3 = compute(null);
  assert.equal(typeof r3.error, "string");
  assert.equal(r3.value, undefined);
});

test("compute: báo lỗi khi thiếu đầu vào hoặc giá trị không phải số dương", () => {
  const missing = compute({
    formula: "kva_from_kw",
    inputs: [{ name: "P_kW", value: 800 }],
  });
  assert.equal(typeof missing.error, "string");
  assert.ok(missing.error.includes("pf"));
  assert.equal(missing.value, undefined);

  for (const bad of [0, -10, "abc", NaN]) {
    const r = compute({
      formula: "kva_from_kw",
      inputs: [
        { name: "P_kW", value: bad },
        { name: "pf", value: 0.8 },
      ],
    });
    assert.equal(typeof r.error, "string");
    assert.ok(r.error.includes("P_kW"));
    assert.equal(r.value, undefined);
  }
});

test("compute: báo lỗi khi dùng from standard cho đầu vào không có giá trị chuẩn", () => {
  const r = compute({
    formula: "kva_from_kw",
    inputs: [
      { name: "P_kW", value: 800 },
      { name: "pf", from: "standard" },
    ],
  });
  assert.equal(typeof r.error, "string");
  assert.ok(r.error.includes("pf"));
  assert.equal(r.value, undefined);
});

test("compute: báo lỗi khi vi phạm giới hạn vật lý (pf, eff_pct, poles)", () => {
  const badPf = compute({
    formula: "kva_from_kw",
    inputs: [
      { name: "P_kW", value: 800 },
      { name: "pf", value: 1.05 },
    ],
  });
  assert.equal(typeof badPf.error, "string");
  assert.ok(badPf.error.includes("pf"));
  assert.equal(badPf.value, undefined);

  const badEff = compute({
    formula: "kwe_from_kwm",
    inputs: [
      { name: "P_kWm", value: 500 },
      { name: "eff_pct", value: 102 },
    ],
  });
  assert.equal(typeof badEff.error, "string");
  assert.ok(badEff.error.includes("eff_pct"));
  assert.equal(badEff.value, undefined);

  for (const p of [3, 4.5]) {
    const badPoles = compute({
      formula: "rpm_from_poles",
      inputs: [
        { name: "f_Hz", value: 50 },
        { name: "poles", value: p },
      ],
    });
    assert.equal(typeof badPoles.error, "string");
    assert.ok(badPoles.error.includes("poles"));
    assert.equal(badPoles.value, undefined);
  }
});

test("matches: khớp số làm tròn 1 chữ số thập phân và từ chối số lệch quá ngưỡng", () => {
  assert.equal(matches(12.3, 12.34), true);
  assert.equal(matches(1004, 1000), true);
  assert.equal(matches(1010, 1000), false);
  assert.equal(matches(12.2, 12.34), false);
});

test("matches: giá trị dưới 2 dùng ngưỡng tuyệt đối 0.005", () => {
  assert.equal(matches(0.85, 0.85), true);
  assert.equal(matches(0.854, 0.85), true);
  assert.equal(matches(0.8, 0.85), false);
});

test("matches: với khoảng [a, b] chỉ khớp ở hai đầu, không khớp ở giữa", () => {
  assert.equal(matches(200, [200, 206.1]), true);
  assert.equal(matches(206.1, [200, 206.1]), true);
  assert.equal(matches(203, [200, 206.1]), false);
});
