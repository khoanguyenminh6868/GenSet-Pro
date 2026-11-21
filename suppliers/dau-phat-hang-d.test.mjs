// dau-phat-hang D2 (21/11/2026): Mecc Alte và Stamford S6 / S7 đọc từ tệp nguồn thật; suy giảm; nơi sản xuất S6 / S7.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { meccRatings, meccDerate, meccSheetAttrs, stamfordRatings } from "./ratings.mjs";
import { makerDerate, makerMadeOf, makerAltFix, sourceRatings, contKva } from "./config-bot.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url)), SRC = path.join(ROOT, "sources");
const text = (id, n) => fs.readFileSync(path.join(SRC, id, `${n}.md`), "utf8");
const rec = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8"));
const at = (rows, model, hz, volt, rise = "125/40°C") => rows.find((r) => r.model === model && r.hz === hz && r.volt === volt && r.rise === rise);

test("meccRatings: ECO46 đọc dòng Parallel Star 380–440 V, cột H-125/40", () => {
  const r = meccRatings(text("mecc-alte", 1016));
  assert.equal(at(r, "ECO46 VL4 A", 50, 400).kVA, 2800);
  assert.equal(at(r, "ECO46 VL4 A", 50, 440).kVA, 2000);
  assert.equal(at(r, "ECO46 1S4 A", 60, 480).kVA, 1800);
  assert.equal(at(r, "ECO46 1S4 A", 50, 400).conn, "Parallel Star YY");
  assert.equal(at(r, "ECO46 1S4 A", 50, 400, "150/40°C").duty, "Standby");
});

test("meccRatings: số phẩy thập phân; ô \"-\" xuống dòng không lệch cột (ECP28 1VS4, 440 V trống)", () => {
  const r = meccRatings(text("mecc-alte", 1009));
  assert.equal(at(r, "ECP28 1VS4 C", 50, 400).kVA, 7.5);
  assert.equal(at(r, "ECP28 1VS4 C", 50, 400).kW, 6);
  assert.equal(at(r, "ECP28 1VS4 C", 50, 440), undefined);
  assert.equal(at(r, "ECP28 1VS4 C", 60, 480).kVA, 9);
});

test("meccDerate / meccSheetAttrs: bảng 7 hàng × 8 cột, cấp H, > 300 % / 20 s", () => {
  const t = text("mecc-alte", 1016), d = meccDerate(t);
  assert.deepEqual(d.temps, [25, 40, 45, 50, 55, 60, 65, 70]);
  assert.equal(d.rows.length, 7);
  assert.equal(d.rows[1].factors[3], 0.89);
  const a = Object.fromEntries(meccSheetAttrs(t).map((x) => [x.key, x.value]));
  assert.equal(a.insulation, "H");
  assert.deepEqual(a.sc300, { pct: 300, s: 20, all: true });
  assert.equal(a.excitation, undefined);
});

test("stamfordRatings: tờ S6 / S7 ghi \"Star (V)\"; S7L1D-K4 có cột 440 V N/A", () => {
  assert.equal(at(stamfordRatings(text("stamford-avk-china", 1021)), "S6L1D-C4", 50, 400).kVA, 810);
  const k = stamfordRatings(text("stamford-avk-china", 1033));
  assert.equal(at(k, "S7L1D-K4", 50, 400).kVA, 2800);
  assert.equal(at(k, "S7L1D-K4", 50, 415).kVA, 2700);
  assert.equal(at(k, "S7L1D-K4", 50, 440), undefined);
});

test("makerDerate: Mecc một ô (mốc ngay trên, không nội suy); TAL 0xx có bảng [6004]; TAL-A chưa rõ; Stamford \"meters\"", () => {
  assert.equal(makerDerate({ supplierId: "mecc-alte", n: 1016, model: "ECO46 1S4 A" }, { temp: 47, alt: 1200 }, SRC).f, 0.89);
  assert.equal(makerDerate({ supplierId: "mecc-alte", n: 1016, model: "ECO46 1S4 A" }, { temp: 50 }, SRC).f, 0.93);
  assert.deepEqual(makerDerate({ supplierId: "mecc-alte", n: 1016, model: "ECO46 1S4 A" }, { temp: 75 }, SRC).missing, ["nhiệt độ"]);
  assert.equal(makerDerate({ supplierId: "gfe-power", n: 1, model: "TAL 046 F" }, { temp: 50 }, SRC).f, 0.946);
  const a = makerDerate({ supplierId: "leroy-somer-fuzhou", n: 1004, model: "TAL-A46-F" }, { temp: 50 }, SRC);
  assert.equal(a.f, null); assert.deepEqual(a.missing, ["nhiệt độ"]);
  assert.equal(makerDerate({ supplierId: "stamford-avk-china", n: 1031, model: "S7L1D-G4" }, { alt: 1800 }, SRC).f, 0.94);
});

test("makerMadeOf: S6 / S7 chưa rõ (Khoa 21/11/2026), S5 vẫn Trung Quốc, thương hiệu Anh; Mecc Alte Ý", () => {
  assert.deepEqual([makerMadeOf("stamford-avk-china", "Stamford", "S6L1D-C4").at, makerMadeOf("stamford-avk-china", "Stamford", "S7L1D-K4").at], ["?", "?"]);
  assert.equal(makerMadeOf("stamford-avk-china", "Stamford", "S6L1D-C4").brand, "GB");
  assert.equal(makerMadeOf("stamford-avk-china", "Stamford", "S5L1D-H4").at, "CN");
  assert.equal(makerMadeOf("mecc-alte", "Mecc Alte", "ECO46 1S4 A").at, "IT");
});

test("makerAltFix: đầu phát NCC chào đủ ở 40 °C nhưng dưới mức sau suy giảm hãng → code thay, nêu phép tính", () => {
  const sup = [rec("mecc-alte")], RT = sourceRatings(sup, SRC);
  const col = contKva(RT.alt.get("ECO461S4A"), { hz: 50, volts: [400], ins: "H" });
  assert.equal(col.max, 1500);
  const reqs = [{ code: "alt_power", requirement: "≥ 1500 kVA" }, { code: "frequency", requirement: "50 Hz" }, { code: "voltage", requirement: "400 V" }];
  const run = (hsmtText) => {
    const result = { requirements: reqs, configs: [{ rank: 1, engine: { model: "X" }, alternator: { model: "ECO46 1S4 A", make: "Mecc Alte" }, checks: [] }] };
    makerAltFix(result, { suppliers: sup, RT, built: { alternators: [], engines: [] }, hsmtText, sourcesDir: SRC });
    return result.configs[0].alternator;
  };
  assert.equal(run("").model, "ECO46 1S4 A");
  const hot = run("Nhiệt độ môi trường 50 °C");
  assert.notEqual(hot.model, "ECO46 1S4 A");
  assert.equal(hot.was.model, "ECO46 1S4 A");
  assert.match(hot.wasWhy, /× hệ số suy giảm 0\.93/);
});
