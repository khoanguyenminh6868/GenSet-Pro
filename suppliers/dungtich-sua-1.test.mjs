// node --test suppliers/dungtich-sua-1.test.mjs — dung-tich-sua-1 (Khoa 20/11/2026): ngoại lệ `fixspec` (sửa số nguồn mất dấu chấm khi có căn cứ
// kiểm được, bản ghi mang dấu đã sửa), `dropspec` mingbang n125, cổng dung tích `likely` theo L/kW của chính dòng (≤ 300 L). Ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const spec = (r, k) => (r.specs || []).find((x) => x.key === k)?.value;
const eng = (id, n, notes = []) => C.fromSupplier(real(id), notes).filter((r) => r.kind === "engine" && r.n === n);

test("fixspec jlmech n102 JL-320GF / JL-350GF: 142 → 14.2, mang dấu đã sửa; dòng kế giữ", () => {
  const e = eng("jlmech-wuhan", 102);
  for (const g of ["JL-320GF", "JL-350GF"]) {
    const r = e.find((x) => x.genset === g);
    assert.equal(spec(r, "disp"), "14.2", g);
    assert.equal(r.fixed.length, 1); assert.equal(r.fixed[0].key, "disp"); assert.equal(r.fixed[0].from, "142");
    assert.match(r.fixed[0].src, /135×165×6/);
    assert.equal((r.specs.find((x) => x.key === "disp").fixed || {}).from, "142");
    assert.equal(spec(r, "cyl"), "6");
  }
  const other = e.find((x) => x.genset !== "JL-320GF" && x.genset !== "JL-350GF" && spec(x, "disp"));
  assert.equal(other.fixed, undefined);
});

test("fixspec jlmech n104 JL-30GF 249 → 2.49; JL-40GF (YCD4J12D-55) chỉ bỏ dung tích, giữ xi lanh", () => {
  const e = eng("jlmech-wuhan", 104);
  const a = e.find((x) => x.genset === "JL-30GF");
  assert.equal(spec(a, "disp"), "2.49"); assert.equal(a.fixed[0].from, "249");
  const b = e.find((x) => x.genset === "JL-40GF");
  assert.equal(spec(b, "disp"), undefined); assert.equal(spec(b, "cyl"), "4"); assert.equal(b.fixed, undefined);
});

test("fixspec jlmech n103 JL-10GF 149 → 1.496; JL-1000GF (đã có ngoại lệ ở PR khác) không bị đụng ở đây", () => {
  const e = eng("jlmech-wuhan", 103);
  const r = e.find((x) => x.genset === "JL-10GF");
  assert.equal(spec(r, "disp"), "1.496"); assert.equal(r.fixed[0].to, "1.496");
});

test("fixspec hết hiệu lực khi chữ dòng nguồn đổi (cào lại); số nguồn giữ nguyên", () => {
  const s = real("jlmech-wuhan");
  const t = s.specTables.find((x) => x.n === 102);
  t.rows = t.rows.map((r) => (r.includes("| JL-320GF |") ? r.replace("| 2700", "| 2701") : r));
  const notes = [];
  const r = C.fromSupplier(s, notes).filter((x) => x.kind === "engine" && x.n === 102 && x.genset === "JL-320GF")[0];
  assert.equal(spec(r, "disp"), "142"); assert.equal(r.fixed, undefined);
  const hit = notes.filter((x) => x.reason === "ngoại lệ theo dòng" && x.n === 102);
  assert.equal(hit.length, 1, "chỉ JL-350GF của n102 còn khớp");
});

test("mingbang n125: 7 dòng Volvo TAD13xx / TAD16xx / TWD1643GE bỏ xi lanh + dung tích, giữ bore; dòng 1–7 chưa đụng; V480 do #957", () => {
  const e = eng("mingbang-mbkl", 125);
  for (const g of ["MB-V252", "MB-V280", "MB-V300", "MB-V320", "MB-V360", "MB-V400", "MB-V500"]) {
    const r = e.find((x) => x.genset === g);
    assert.equal(spec(r, "cyl"), undefined, g); assert.equal(spec(r, "disp"), undefined, g);
    assert.equal(spec(r, "bore") != null, true, g);
  }
  for (const g of ["MB-V68", "MB-V120", "MB-V160"]) assert.equal(spec(e.find((x) => x.genset === g), "cyl"), "4", g);
  assert.equal(spec(e.find((x) => x.genset === "MB-V480"), "cyl"), undefined, "MB-V480 do PR #957");
});

test("cổng dung tích: 105.56 L của YC16VC (frs, tellhow, waeta, yunding) và 108 L của honny QTA20V vào; 108 trên tổ máy 250 kW (zhengchi MTAA11-G3) không vào", () => {
  const frs = eng("frs-shenyang", 103).find((x) => x.genset === "FRS-1800Y");
  assert.equal(spec(frs, "disp"), "105.56");
  assert.equal(spec(eng("yunding-jiangsu", 2006).find((x) => x.genset === "YDY-1800GF"), "disp"), "105.56");
  assert.equal(spec(eng("honny-dongguan", 101).find((x) => x.model === "QTA20V-EG2950D"), "disp"), "108");
  const z = eng("zhengchi-power", 132).filter((x) => /MTAA11-G3/.test(x.line || ""));
  assert.equal(z.length > 0, true); for (const r of z) assert.equal(spec(r, "disp"), undefined);
  // aoke n129 MTAA11-G3 "108" is read by another path (not this gate): the source figure is the PR #957 case.
});

test("cổng dung tích: giá trị trong 0,4–100 L không đổi (agestar 5.9, liangzi 65.65)", () => {
  assert.equal(spec(eng("agestar", 104).find((x) => x.model === "6BTA5.9-G2"), "disp"), "5.9");
  assert.equal(spec(eng("liangzi-yangzhou", 101).find((x) => x.model === "12M55D2210E310"), "disp"), "65.65");
});
