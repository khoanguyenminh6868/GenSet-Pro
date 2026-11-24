// node --test suppliers/*.test.mjs — một mã động cơ nằm ở hai khoá, dạng có ngoặc và dạng trơn (ma-dong-co-trung PR 3).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator |";
const sup = (rows) => ({ id: "x", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows }] });
const models = (rows) => C.fromSupplier(sup(rows)).filter((r) => r.kind === "engine").map((r) => r.model);

test("ngoặc trong danh sách: về mã trơn, dòng vẫn giữ nguyên chữ nguồn", () => {
  const line = "| a-1 | 1705 | 1364 | 12V4000G74F(3D) | S7L1D-C41 |";
  const [r] = C.fromSupplier(sup([line])).filter((x) => x.kind === "engine");
  assert.equal(r.model, "12V4000G74F");
  assert.equal(r.line, line);
});

test("6 mã Cummins \"(M)\" để riêng (Khoa 24/11/2026): không về mã trơn", () => {
  for (const code of ["4BTA3.9-G2(M)", "6BT5.9-G2(M)", "KTA19-G3(M)", "KTA19-G4(M)", "KTA38-G(M)", "NTA855-G2(M)"]) {
    assert.deepEqual(models([`| a-1 | 138 | 110 | ${code} | S5L1D-H41 |`]), [code], code);
  }
});

test("cặp có số lệch và số trơ trong ngoặc: vẫn là khoá riêng", () => {
  for (const code of ["186FA(E)", "192F(E)", "1100F(E)", "4BTA3.9-G13(40)", "6BT5.9-G2(115)"]) {
    assert.deepEqual(models([`| a-1 | 100 | 80 | ${code} | S5L1D-H41 |`]), [code], code);
  }
});

test("toàn bộ cn/: không còn khoá ngoặc của 27 mã MTU đã gộp, 6 khoá \"(M)\" vẫn riêng", () => {
  const dir = path.join(HERE, "cn");
  const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const keys = new Set(C.build(all).engines.map((e) => e.key));
  for (const k of ["12V4000G14F(3B)", "12V4000G74F(3D)", "20V4000G94S(3D)"]) assert.equal(keys.has(k), false, k);
  for (const k of ["186FA(E)", "192F(E)", "1100F(E)", "4BTA39G13(40)", "16V4000G84S(3D)", "4BTA39G2(M)", "6BT59G2(M)", "KTA19G3(M)", "KTA19G4(M)", "KTA38G(M)", "NTA855G2(M)"]) assert.equal(keys.has(k), true, k);
});
