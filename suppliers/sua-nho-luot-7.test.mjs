// node --test suppliers/sua-nho-luot-7.test.mjs — hai lỗi đọc còn sót của lượt đo 7 (nhánh sua-nho-luot-7). Dòng lấy nguyên văn từ suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const cn = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));

test("specKey: nửa câu văn của tờ LVSI804 không là avr / excit", () => {
  assert.equal(C.specKey("the Automatic Voltage Regulator (AVR) to the main exciter."), null);
  assert.equal(C.specKey("via the Automatic Voltage Regulator (AVR) to the main"), null);
  // nhãn bảng thật vẫn đọc
  assert.equal(C.specKey("AVR Type"), "avr");
  assert.equal(C.specKey("Voltage regulator A.V.R"), "avr");
  assert.equal(C.specKey("Exciter Type"), "excit");
  assert.equal(C.specKey("VOLTAGE REGULATION"), "vreg");
});

test("stamford-avk-china n1066-1068: không còn dòng câu văn nào ra khoá avr", () => {
  for (const n of [1066, 1067, 1068]) {
    const t = cn("stamford-avk-china").specTables.find((x) => +x.n === n);
    for (const l of t.rows) { const c = C.cellsOf(l); if (/Automatic Voltage Regulator/.test(l)) assert.equal(C.specKey(c[0]), null, l); }
  }
});

test("cgm-italia n101 750DZ: 'DEUTZ TCD 24V12' là động cơ TCD 24V12, không phải vỏ máy B800", () => {
  assert.equal(C.isCode("DEUTZ TCD 24V12"), true);
  const s = cn("cgm-italia");
  const r = C.fromSupplier({ ...s, specTables: s.specTables.filter((t) => +t.n === 101).map((t) => ({ ...t, rows: t.rows.filter((l) => l.startsWith("| 750DZ")) })) }).filter((o) => o.kind === "engine");
  assert.deepEqual(r.map((o) => o.model), ["TCD 24V12"]);
  assert.equal(r[0].genset, "750DZ");
});

test("cgm-italia: dòng đuôi không có model tổ máy / ô động cơ không đọc được không ra bản ghi động cơ từ ô vỏ máy", () => {
  const notes = [];
  const s = cn("cgm-italia");
  const r = C.fromSupplier(s, notes);
  const shell = r.filter((o) => /^(B|C|CT|SH|QM|QA)\d{2,4}\+?$/.test(o.model));
  assert.deepEqual(shell.map((o) => o.model), []);
  assert.ok(notes.some((x) => /vỏ máy/.test(x.reason) && x.detail === "B800"));
  // dòng thật ở n1001 bảng 13
  const line = s.specTables.flatMap((t) => (+t.n === 1001 ? t.rows : [])).find((l) => l.startsWith("| E | 0 | 130 | 400 | B800"));
  assert.ok(line);
});
