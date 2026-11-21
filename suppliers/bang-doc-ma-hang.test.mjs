// node --test suppliers/bang-doc-ma-hang.test.mjs — bảng dọc: `verticalCode` (web/catalog.js) chỉ bóc chữ đứng trước mã tới
// tên hãng cuối cùng (điều phối 21/11/2026, Q2 của PR #1054). Trước đó mọi từ toàn chữ đều bị bóc: "Kohler KDI 2504M"
// (ô động cơ nguyên văn của hgi-generators n2001) thành "2504M". Không có tên hãng trong dãy chữ thì bóc như cũ.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const cn = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const only = (s, n) => ({ ...s, specTables: s.specTables.filter((t) => t.n === n) });
const V = (o) => o.sheet === "bảng dọc";
// Bảng giả dạng V1 (dòng Model) để ô động cơ đi qua verticalCode; chỉ ô động cơ thay đổi giữa các ca.
const sheet = (engineCell) => ({ id: "x", country: "CN", sources: [], specTables: [{ n: 1, title: "X", header: [], rows: ["| Model | AB-100", "| Prime Power | 100kVA/80kW", `| Engine Brand / Model | ${engineCell}`] }] });
const engineOf = (cell) => { const r = C.fromSupplier(sheet(cell)).filter(V); return r.length ? [r[0].model, r[0].makes.map((m) => m.name).join(",")] : null; };

test("hgi n2001: ô nguyên văn 'Kohler KDI 2504M' (dòng Engine của bảng) → mã KDI 2504M, hãng Kohler", () => {
  const t = cn("hgi-generators").specTables.find((x) => x.n === 2001);
  assert.ok(t.rows.includes("| Engine | Kohler KDI 2504M"), "dòng nguồn còn nguyên văn");
  assert.deepEqual(engineOf("Kohler KDI 2504M"), ["KDI 2504M", "Kohler"]);
});

test("ca đang đúng giữ nguyên: CCEC Cummins, PERKINS , mã, Volvo Penta, Yuchai", () => {
  assert.deepEqual(engineOf("CCEC Cummins NTA855-G2A"), ["NTA855-G2A", "Cummins"]);
  assert.deepEqual(engineOf("PERKINS , 1106A－70TAG4"), ["1106A-70TAG4", "Perkins"]);
  assert.deepEqual(engineOf("Volvo Penta TAD1641GE"), ["TAD1641GE", "Volvo Penta"]);
  assert.deepEqual(engineOf("Yuchai YC16VC3300-D31"), ["YC16VC3300-D31", "Yuchai"]);
  assert.deepEqual(engineOf("Y4110ZLD"), ["Y4110ZLD", ""]);
});

test("không có tên hãng trong dãy chữ: bóc như cũ ('SGC 420' của westinpower không thành mã)", () => {
  assert.equal(engineOf("SGC 420"), null);
});

test("bảng thật: sunkings n116 và westinpower n1117 cho đúng bản ghi như trước", () => {
  const a = C.fromSupplier(only(cn("sunkings"), 116)).filter(V);
  assert.deepEqual(a.map((o) => [o.model, o.genset]), [["NTA855-G2A", "SHX-350"]]);
  const b = C.fromSupplier(only(cn("westinpower"), 1117)).filter(V);
  assert.deepEqual(b.map((o) => [o.model, o.genset]), [["1106A-70TAG4", "TP220T"]]);
});
