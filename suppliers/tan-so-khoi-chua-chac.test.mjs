// node --test suppliers/tan-so-khoi-chua-chac.test.mjs
// catalog-doc-4, nhóm 2: ba khối bảng "chưa chắc" của tach-bang-con.md. Soát trang nguồn (sources/<id>/<n>.md) 24/11/2026: KHÔNG đổi bản ghi nào.
//  - huachai-deutz n114 (500GF): bảng ghi "Rated frequency | 50Hz", "Rated speed | 1500rpm", ô đầu phát "Frequency | 50Hz"; dòng "Frequency | 50Hz/60Hz"
//    nằm ở danh sách thuộc tính chung của trang ("Type | Generator Set 500GF | Place of Origin …"), KHÔNG kèm số liệu 60 Hz nào → bản ghi 50 Hz đúng.
//  - gtl-power n105: dòng tiêu đề của chính bảng ghi "Rated Frequency (Hz) | 60" (một giá trị cho cả hai cột PWUG15 / FWUG15), "Rotation 1800" → 60 Hz đúng.
//  - jichai n109 (12V175PZL, bộ ly hợp thuỷ lực): trang không ghi Hz; cột tốc độ 1200 r/min không phải 1500 / 1800 → tần số để trống (cần xác nhận), không suy.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const recs = (id, n) => C.fromSupplier(JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8")), []).filter((r) => r.n === n);
const src = (id, n) => fs.readFileSync(path.join(ROOT, "sources", id, `${n}.md`), "utf8");

test("huachai-deutz n114: bản ghi 50 Hz, trang ghi 50Hz ở bảng và 1500rpm", () => {
  const s = src("huachai-deutz", 114);
  assert.ok(s.includes("| Rated frequency | 50Hz | No. of Cylinder"));
  assert.ok(s.includes("Rated speed | 1500rpm"));
  assert.ok(s.includes("| Frequency | 50Hz/60Hz"));
  const r = recs("huachai-deutz", 114);
  assert.ok(r.length >= 1 && r.every((x) => x.freq === 50));
});

test("gtl-power n105: bảng tự ghi Rated Frequency 60 Hz, 1800 r/min → các bản ghi 60 Hz", () => {
  const s = src("gtl-power", 105);
  assert.ok(s.includes("| Rated Frequency (Hz) | 60"));
  const r = recs("gtl-power", 105);
  assert.equal(r.length, 3);
  assert.ok(r.every((x) => x.freq === 60));
});

test("jichai n109: trang không ghi Hz → tần số để trống, không đoán từ 1200 r/min", () => {
  assert.ok(!/\bhz\b/i.test(src("jichai", 109)));
  const r = recs("jichai", 109);
  assert.ok(r.length >= 1 && r.every((x) => x.freq == null));
});
