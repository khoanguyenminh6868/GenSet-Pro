// node --test suppliers/*.test.mjs — khoá động cơ / đầu phát rác (engine-key-junk, 24/11/2026).
// baifa-power n101 bảng SCANIA: dòng "| BF-SC440-V | 440 | 400 | SCANIA | DC13 505A 400KVA | ECU | S4L1D-F41 | 51.1 | STAGE V |
// SWEDEN | 4 months |" có ô động cơ "DC13 505A 400KVA" (mã Scania + kVA của tổ máy) mà `isCode` không nhận, nên ô
// "4 months" (thời gian giao hàng) là ô đầu tiên qua `isCode` và thành mã động cơ (khoá "4MONTHS", 3 bản ghi).
// Cùng kiểu: thời gian ("7 Days", "1500 Hours"), áp suất ("22 bar"), khối lượng ("6,500 lbs"), "4 Wheels", công suất ghi
// như mã ("30kKVA", "18KW22.5KVA"), "Tire 2" (Tier 2 gõ sai), "IEC 60034 Standard", "Combustion 3" của man-engines.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const CN = path.join(ROOT, "cn");
const read = (id) => JSON.parse(fs.readFileSync(path.join(CN, `${id}.json`), "utf8"));

const JUNK = [
  /^\d[\d.,]*\s*(?:months?|mths?|years?|yrs?|days?|weeks?|wks?|hours?|hrs?|bar|psi|lbs?|wheels?)$/i,
  /^\d+(?:[.,]\d+)?\s*k\s*(?:kva|kw)$/i,
  /^\d+(?:[.,]\d+)?\s*kw\s*\d+(?:[.,]\d+)?\s*kva$/i,
  /^(?:tire|tier)\s?\d$/i,
  /\bstandard$/i,
  /^(?:combustion|efficiency|mechanical)\s\d{1,2}$/i,
];

test("mọi bản ghi động cơ / đầu phát của cn/: không có model là thời gian, áp suất, khối lượng, công suất, tiêu chuẩn", () => {
  const bad = [];
  for (const f of fs.readdirSync(CN).filter((x) => x.endsWith(".json"))) {
    const s = JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"));
    for (const r of C.fromSupplier(s, [])) if ((r.kind === "engine" || r.kind === "alternator") && JUNK.some((re) => re.test(String(r.model || "")))) bad.push(`${s.id} n${r.n} ${r.kind} ${r.genset} | ${r.model}`);
  }
  assert.deepEqual(bad, []);
});

test("baifa-power bảng SCANIA: động cơ lấy từ ô 'DC13 505A 400KVA' (DC13 505A), không phải ô thời gian giao hàng", () => {
  const rec = C.fromSupplier(read("baifa-power"), []);
  for (const g of ["BF-SC385-V", "BF-SC440-V", "BF-SC550-V"]) {
    const eng = rec.filter((r) => r.kind === "engine" && r.genset === g && /^DC13 505A/.test(r.model));
    assert.equal(eng.length, 1, g);
    assert.equal(eng[0].model, "DC13 505A");
    assert.ok(/505A \d+KVA/i.test(eng[0].line), "dòng nguồn giữ nguyên văn");
  }
  assert.equal(rec.filter((r) => /month/i.test(r.model || "")).length, 0);
});

test("mã thật không bị loại: mã Scania bốn cụm, mã Isuzu của elitech, 'Tier 2' không là mã", () => {
  const baifa = C.fromSupplier(read("baifa-power"), []);
  assert.ok(baifa.some((r) => r.kind === "engine" && r.model === "DC13 320A 02-62"));
  const el = C.fromSupplier(read("elitech-power"), []);
  const e = el.find((r) => r.kind === "engine" && r.genset === "EPS30IA-3B");
  assert.equal(e.model, "JE493ZDB-04");
});
