// Stamford PI7 (PI734B–F) và LVSI804 (LV 804 S / R / T / W) + Wintpower WT734C: tờ có "| 50Hz | Star (V) | 380 …" (tần số là ô đầu dòng),
// "RATINGS" riêng một dòng, tiêu đề cột xuống dòng, tên model nằm ở "| PI734F - Technical Data Sheet | Winding 07" / "| LV 804 S | WDG 12 -
// Technical Data Sheet". Mọi dòng lấy từ tệp nguồn thật; không nội suy, không quy đổi kW ↔ kVA.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stamfordRatings, ratingsOf } from "./ratings.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const text = (id, n) => fs.readFileSync(path.join(here, "sources", id, `${n}.md`), "utf8");
const at = (rs, model, hz, duty, rise, volt) => rs.find((x) => x.model === model && x.hz === hz && x.duty === duty && x.rise === rise && x.volt === volt);

const SHEETS = [[1060, "PI734C", 32], [1061, "PI734B", 12], [1062, "PI734D", 32], [1063, "PI734E", 32], [1064, "PI734F", 4],
  [1065, "LV804S", 32], [1066, "LV804R", 32], [1067, "LV804T", 32], [1068, "LV804W", 32]];

test("PI7 / LVSI804: mỗi tờ ra đủ dòng, đúng model, chỉ số có trong dòng nguồn", () => {
  for (const [n, model, count] of SHEETS) {
    const t = text("stamford-avk-china", n), r = stamfordRatings(t);
    assert.equal(r.length, count, `${n} ${model}`);
    assert.deepEqual([...new Set(r.map((x) => x.model))], [model]);
    assert.deepEqual(ratingsOf(t).filter((x) => x.part === "alternator").length, count);
    for (const x of r) {
      assert.ok(x.lines.every((l) => t.includes(l)), `${n}: dòng không có trong nguồn`);
      assert.ok(x.lines.some((l) => /^\|\s*kVA\b/.test(l) && l.split("|").some((c) => Number(c.trim()) === x.kVA)));
      if (x.kW != null) assert.ok(x.lines.some((l) => /^\|\s*kW\b/.test(l) && l.split("|").some((c) => Number(c.trim()) === x.kW)));
      // kW theo hệ số 0,8 (tờ ghi): chỉ để soát số đọc, không dùng để quy đổi.
      if (x.kW != null) assert.ok(Math.abs(x.kW - 0.8 * x.kVA) <= 0.0051 * x.kVA, `${n} ${x.volt}V kW ${x.kW} / kVA ${x.kVA}`);
    }
    // F ≤ H ≤ Standby 150 ≤ Standby 163 cho từng (tần số, điện áp)
    for (const hz of [50, 60]) for (const v of new Set(r.filter((x) => x.hz === hz).map((x) => x.volt))) {
      const k = ["105/40°C", "125/40°C", "150/40°C", "163/27°C"].map((rise) => r.find((x) => x.hz === hz && x.volt === v && x.rise === rise)?.kVA);
      assert.ok(k.every((x) => x > 0), `${n} ${hz} Hz ${v} V thiếu mức`);
      assert.deepEqual(k, [...k].sort((a, b) => a - b), `${n} ${hz} Hz ${v} V thứ tự`);
    }
  }
});

test("PI734C (Winding 312): 50 Hz 380–440 V và 60 Hz 416–480 V, bốn mức; hiệu suất theo cột", () => {
  const r = stamfordRatings(text("stamford-avk-china", 1060));
  assert.deepEqual([...new Set(r.filter((x) => x.hz === 50).map((x) => x.volt))], [380, 400, 415, 440]);
  assert.deepEqual([...new Set(r.filter((x) => x.hz === 60).map((x) => x.volt))], [416, 440, 460, 480]);
  const a = at(r, "PI734C", 50, "Cont.", "125/40°C", 400);
  assert.deepEqual([a.kVA, a.kW, a.eff], [1550, 1240, 95.4]);
  const b = at(r, "PI734C", 60, "Standby", "163/27°C", 480);
  assert.deepEqual([b.kVA, b.kW, b.eff], [2025, 1620, 95.3]);
  assert.equal(at(r, "PI734C", 50, "Standby", "150/40°C", 415).kVA, 1615);
});

test("PI734B (Winding 13): chỉ 60 Hz, 380 / 400 / 416 V (hàng kVA 12 số cho 4 mức)", () => {
  const r = stamfordRatings(text("stamford-avk-china", 1061));
  assert.ok(r.every((x) => x.hz === 60));
  assert.deepEqual([...new Set(r.map((x) => x.volt))], [380, 400, 416]);
  assert.equal(at(r, "PI734B", 60, "Cont.", "125/40°C", 400).kVA, 1560);
  assert.equal(at(r, "PI734B", 60, "Standby", "163/27°C", 416).kW, 1336);
});

test("PI734F (Winding 07): 60 Hz, 600 V, bốn mức", () => {
  const r = stamfordRatings(text("stamford-avk-china", 1064));
  assert.deepEqual(r.map((x) => [x.rise, x.volt, x.kVA, x.kW, x.eff]), [["105/40°C", 600, 2420, 1936, 96.5], ["125/40°C", 600, 2600, 2080, 96.5],
    ["150/40°C", 600, 2705, 2164, 96.4], ["163/27°C", 600, 2785, 2228, 96.3]]);
});

test("LV 804 S (Winding 12): tên model lấy từ tiêu đề; 50 và 60 Hz", () => {
  const r = stamfordRatings(text("stamford-avk-china", 1065));
  const a = at(r, "LV804S", 50, "Cont.", "125/40°C", 415);
  assert.deepEqual([a.kVA, a.kW, a.eff], [2790, 2232, 96.1]);
  const b = at(r, "LV804S", 60, "Standby", "150/40°C", 480);
  assert.equal(b.kVA, 3585);
});

test("tờ bố cục cũ vẫn như trước: UCI / S4L1D không đổi số dòng", () => {
  assert.ok(stamfordRatings(text("stamford-avk-china", 1021)).length > 0);
  assert.equal(stamfordRatings("PI734X\n| 50Hz | Star (V) | 380\n").length, 0);
});
