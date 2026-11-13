// Noise and fuel limits of an HSMT against what diesel sets can do (Khoa, 2026-11-13: thresholds per size, approved the
// same day): a limit tighter than the usual figure of a set of that size is a critical highlight of Phân tích (Khoa: "Quan
// Trọng chứ không phải Thông Tin"), titled by whether the best sets still reach it; a looser one says nothing. Figures by hand.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

const res = (specs, { cap = null, sets = [] } = {}) => ({ keyInfo: { generatorCapacity: cap }, generatorSets: sets, technicalSpecs: specs.map(([item, requirement]) => ({ item, requirement, quote: requirement, reference: "Chương V" })), highlights: [] });
const got = (r) => P.normHighlights(r).map((h) => [h.severity, h.title]);

test("noise: the loosest figure per distance, tolerance added; no distance gives nothing", () => {
  assert.deepEqual(P.noiseLimits("Độ ồn | ≤ 75 dB(A) tại 7m"), [{ db: 75, dist: 7 }]);
  assert.deepEqual(P.noiseLimits("Độ ồn đo tại 7m | ≤ 75dBA (10 điểm); ≤ 70dBA (20 điểm); ≤ 65dBA (30 điểm)"), [{ db: 75, dist: 7 }]);
  assert.deepEqual(P.noiseLimits("Độ ồn cách 7m: 69 dB(A) ±3"), [{ db: 72, dist: 7 }]);
  assert.deepEqual(P.noiseLimits("Độ ồn 65 ± 5 dB(A) đo tại 7m"), [{ db: 70, dist: 7 }]);
  assert.deepEqual(P.noiseLimits("Độ ồn ở 75% tải, khoảng cách 7m: ≤ 60dB (sai lệch +3dB)"), [{ db: 63, dist: 7 }]);
  assert.deepEqual(P.noiseLimits("Độ ồn | 75 dB(A) @ 7m, 85 dB(A) @ 1m"), [{ db: 75, dist: 7 }, { db: 85, dist: 1 }]);
  assert.deepEqual(P.noiseLimits("Độ ồn | ≤ 75 dB(A)"), []);
  assert.deepEqual(P.noiseLimits("Độ ồn | ≤ 75 dB(A) tại 3 m"), []);
});

test("noise: 250 kVA is usual 72 / best 66 at 7 m, 81 / 75 at 1 m", () => {
  const one = (req) => got(res([["Độ ồn", req]], { cap: "250 kVA liên tục" }));
  assert.deepEqual(one("≤ 75 dB(A) tại 7m"), []);
  assert.deepEqual(one("≤ 72 dB(A) tại 7m"), []);
  assert.deepEqual(one("≤ 70 dB(A) tại 7m"), [["critical", "Độ ồn yêu cầu (70 dB(A) tại 7 m) thấp hơn mức bình quân"]]);
  assert.deepEqual(one("≤ 66 dB(A) tại 7m"), [["critical", "Độ ồn yêu cầu (66 dB(A) tại 7 m) thấp hơn mức bình quân"]]);
  assert.deepEqual(one("≤ 65 dB(A) tại 7m"), [["critical", "Độ ồn yêu cầu (65 dB(A) tại 7 m) chặt hơn mức máy đạt được"]]);
  assert.deepEqual(one("68 dBA @ khoảng cách 1m"), [["critical", "Độ ồn yêu cầu (68 dB(A) tại 1 m) chặt hơn mức máy đạt được"]]);
  assert.deepEqual(one("≤ 76 dB(A) tại 1m"), [["critical", "Độ ồn yêu cầu (76 dB(A) tại 1 m) thấp hơn mức bình quân"]]);
  // Running without load a set is 2 dB quieter: best 64.
  assert.deepEqual(one("≤ 65 dB(A) tại 7m, chạy không tải"), [["critical", "Độ ồn yêu cầu (65 dB(A) tại 7 m) thấp hơn mức bình quân"]]);
});

test("fuel limits of a row: one figure, or as many as loads; a row naming its own kW is left", () => {
  assert.deepEqual(P.fuelLimits("Tiêu hao nhiên liệu | Tại 100% tải không quá 29 lít/h"), [{ load: 100, lph: 29 }]);
  assert.deepEqual(P.fuelLimits("Tiêu hao nhiên liệu | ≤ 25,1 L/h"), [{ load: 100, lph: 25.1 }]);
  assert.deepEqual(P.fuelLimits("Suất tiêu hao nhiên liệu: 75% tải: 39.5 lít / giờ; 100% tải: 53.3 lít / giờ"), [{ load: 75, lph: 39.5 }, { load: 100, lph: 53.3 }]);
  assert.deepEqual(P.fuelLimits("Tiêu hao nhiên liệu 110% tải | ≤ 60 L/h"), []);
  assert.deepEqual(P.fuelLimits("Mức tiêu thụ nhiên liệu ở 100% công suất | ≤ 385 l/h (tại 1460kW)"), []);
  assert.deepEqual(P.fuelLimits("Suất tiêu hao nhiên liệu | ≤ 185 g/kWh ở 100% tải"), [{ load: 100, gkwh: 185 }]);
  assert.deepEqual(P.fuelLimits("Tiêu hao nhiên liệu | 50 L/h, 40 L/h"), []);
});

test("fuel: 200 kVA prime is 160 kW: usual 0.265 → 42.4 L/h, best 0.24 → 38.4 L/h at 100 %", () => {
  const one = (req, o = { cap: "200 kVA liên tục" }) => got(res([["Tiêu hao nhiên liệu", req]], o));
  assert.deepEqual(one("Tại 100% tải không quá 45 lít/h"), []);
  assert.deepEqual(one("Tại 100% tải không quá 40 lít/h"), [["critical", "Tiêu hao nhiên liệu yêu cầu (40 L/h ở 100% tải) thấp hơn mức bình quân"]]);
  assert.deepEqual(one("Tại 100% tải không quá 29 lít/h"), [["critical", "Tiêu hao nhiên liệu yêu cầu (29 L/h ở 100% tải) thấp hơn mức máy đạt được"]]);
  // 75 %: 120 kW × 0.24 × 0.98 = 28.2 L/h best; 50 %: 80 kW × 0.24 × 1.03 = 19.8 L/h best.
  assert.equal(one("≤ 28 L/h ở 75% tải")[0][1].includes("đạt được"), true);
  assert.equal(one("≤ 29 L/h ở 75% tải")[0][1].includes("bình quân"), true);
  assert.equal(one("≤ 19,5 L/h ở 50% tải")[0][1].includes("đạt được"), true);
  assert.equal(one("≤ 20 L/h ở 50% tải")[0][1].includes("bình quân"), true);
  // A standby figure is 200 / 1.1 = 182 kVA prime (145 kW): best 34.9 L/h. A bare "200 kVA" is read the same way.
  assert.deepEqual(one("≤ 36 L/h ở 100% tải", { cap: "200 kVA dự phòng" }), [["critical", "Tiêu hao nhiên liệu yêu cầu (36 L/h ở 100% tải) thấp hơn mức bình quân"]]);
  assert.equal(one("≤ 36 L/h ở 100% tải")[0][1].includes("đạt được"), true);
  assert.equal(one("≤ 36 L/h ở 100% tải", { cap: "200 kVA" })[0][1].includes("bình quân"), true);
  // generatorSets wins over the text of keyInfo.
  assert.equal(one("≤ 36 L/h ở 100% tải", { cap: "200 kVA", sets: [{ primeKva: 200 }] })[0][1].includes("đạt được"), true);
  // Engine figure in g/kWh: usual 205, best 190.
  assert.equal(one("≤ 185 g/kWh ở 100% tải")[0][1].includes("đạt được"), true);
  assert.equal(one("≤ 195 g/kWh")[0][1].includes("bình quân"), true);
  assert.deepEqual(one("≤ 210 g/kWh"), []);
});

test("which size a row is about: the size in its item, else the package's one size; several sizes and no item size: nothing", () => {
  const two = { cap: "100 kVA và 500 kVA", sets: [{ primeKva: 100 }, { primeKva: 500 }] };
  assert.deepEqual(got(res([["Độ ồn", "≤ 65 dB(A) tại 7m"]], two)), []);
  // 65 dB(A) at 7 m: fine for 100 kVA (usual 70, best 64 → note), out of reach for 500 kVA (best 70).
  assert.deepEqual(got(res([["Máy 100 kVA: Độ ồn", "≤ 65 dB(A) tại 7m"], ["Máy 500 kVA: Độ ồn", "≤ 65 dB(A) tại 7m"]], two)).map((x) => x[1].includes("bình quân")), [true, false]);
  assert.deepEqual(got(res([["Độ ồn", "≤ 65 dB(A) tại 7m"]])), []);
  assert.deepEqual(P.normPower(res([], { cap: "500 kVA liên tục / 550 kVA dự phòng" }), { item: "Độ ồn" }), { kva: 500, sure: true });
  assert.deepEqual(P.normPower(res([], { cap: "400 kW" }), { item: "Độ ồn" }), { kva: 500, sure: false });
});

test("gasoline and gas sets are not judged; lubricating oil is not fuel", () => {
  assert.deepEqual(got(res([["Nhiên liệu", "Xăng"], ["Tiêu hao nhiên liệu", "≤ 1 L/h ở 100% tải"], ["Độ ồn", "≤ 58 dB(A) tại 7m"]], { cap: "5 kVA" })), []);
  assert.deepEqual(got(res([["Tiêu hao dầu bôi trơn", "≤ 0,5 L/h"]], { cap: "500 kVA liên tục" })), []);
});

test("the highlight carries the HSMT row's quote and says the threshold is ours; a second pass replaces the first", () => {
  const r = res([["Tiêu hao nhiên liệu", "Tại 100% tải không quá 29 lít/h"]], { cap: "200 kVA liên tục" });
  r.highlights = [{ severity: "warning", category: "technical", title: "Của agent" }];
  const once = P.withNormHighlights(r), twice = P.withNormHighlights({ ...r, highlights: once });
  assert.deepEqual(twice, once);
  assert.equal(once.length, 2);
  assert.equal(once[0].title, "Của agent");
  const h = once[1];
  assert.equal(h.category, "technical");
  assert.equal(h.quote, "Tại 100% tải không quá 29 lít/h");
  assert.equal(h.reference, "Chương V");
  assert.match(h.detail, /thường tiêu hao khoảng 42,4 L\/h, động cơ tốt nhất khoảng 38,4 L\/h/);
  assert.match(h.detail, /mức tham chiếu của GenBid/);
  assert.match(h.recommendation, /^Khuyến nghị:/);
  assert.deepEqual(P.withNormHighlights({}), []);
});
