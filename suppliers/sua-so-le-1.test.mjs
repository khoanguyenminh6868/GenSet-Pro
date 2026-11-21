// node --test suppliers/sua-so-le-1.test.mjs — dòng lẻ Khoa duyệt 21/11/2026 ("fix"): aosif n1079 QSL9-G5 xi lanh (dropspec),
// depco n2102 P158LE-1 xi lanh + dung tích (fixspec). Mỗi ca là dòng thật trong suppliers/cn; bản ghi kế bên không đổi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const spec = (r, k) => (r.specs || []).find((x) => x.key === k)?.value;
const eng = (id, n, notes = []) => C.fromSupplier(real(id), notes).filter((r) => r.kind === "engine" && r.n === n);

test("aosif n1079 QSL9-G5: xi lanh 4 (khối QSL9-G7 của datasheet) bỏ; n1078 (cùng QSL9-G5) giữ 6, số khác của n1079 giữ", () => {
  const notes = [];
  const a = eng("aosif", 1079, notes).find((r) => r.model === "QSL9-G5");
  assert.equal(spec(a, "cyl"), undefined);
  for (const k of ["bore", "disp", "compr"]) assert.equal(spec(a, k), undefined, k);   // cùng khối QSL9-G7 (điều phối 21/11/2026)
  assert.equal(spec(a, "current"), "433A");            // số khác của dòng giữ
  assert.equal(a.fixed, undefined);
  assert.ok(notes.some((x) => x.n === 1079 && /ngoại lệ theo dòng/.test(x.reason) && /dropspec/.test(x.detail)));
  assert.equal(spec(eng("aosif", 1078).find((r) => r.model === "QSL9-G5"), "cyl"), "6");
});

test("depco n2102 P158LE-1: 6 xi lanh / 11.051 L (số P126TI) sửa thành 8 / 14.618, mang dấu đã sửa; P158LE n2101 / n2182 không đổi", () => {
  const r = eng("depco-power", 2102).find((x) => x.model === "P158LE-1");
  assert.equal(spec(r, "cyl"), "8");
  assert.equal(spec(r, "disp"), "14.618");
  assert.deepEqual(r.fixed.map((f) => [f.key, f.from, f.to]), [["cyl", "6", "8"], ["disp", "11.051", "14.618"]]);
  assert.equal(spec(r, "bore"), "128 X 142");
  assert.equal(r.specs.find((x) => x.key === "cyl").fixed.from, "6");
  assert.equal(spec(eng("depco-power", 2101).find((x) => x.model === "P158LE"), "cyl"), "8");
  assert.equal(eng("depco-power", 2101).find((x) => x.model === "P158LE").fixed, undefined);
  assert.equal(spec(eng("depco-power", 2182).find((x) => x.model === "P158LE"), "disp"), "14.62");
});
