// node --test suppliers/dropspec-2.test.mjs — `dropspec` của nhóm "9 dòng loại" (Khoa 20/11/2026): số sai của NGUỒN, bỏ riêng số đó,
// giữ phần còn lại của dòng; dòng kế bên không đổi. Mỗi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const spec = (r, k) => (r.specs || []).find((x) => x.key === k)?.value;
const eng = (id, n, notes = []) => C.fromSupplier(real(id), notes).filter((r) => r.kind === "engine" && r.n === n);

test("aoke n129: dung tích 108 / 105 bỏ; dòng kế (NTA855 14, SC13G 12.88) không đổi", () => {
  const e = eng("aoke-yangzhou", 129);
  assert.equal(spec(e.find((r) => r.model === "MTAA11-G3"), "disp"), undefined);
  assert.equal(spec(e.find((r) => r.model === "6R1600G20F"), "disp"), undefined);
  assert.equal(spec(e.find((r) => r.model === "MTAA11-G3"), "cyl"), "6");
  assert.equal(spec(e.find((r) => r.model === "SC13G420D2"), "disp"), "12.88");
});

test("jlmech n103 JL-1000GF: dung tích 458 bỏ; JL-1200GF kế bên giữ 45.8", () => {
  const e = eng("jlmech-wuhan", 103);
  assert.equal(spec(e.find((r) => r.genset === "JL-1000GF"), "disp"), undefined);
  assert.equal(spec(e.find((r) => r.genset === "JL-1000GF"), "cyl"), "12");
  assert.equal(spec(e.find((r) => r.genset === "JL-1200GF"), "disp"), "45.8");
});

test("jlmech n104 JL-180GF / JL-220GF: kích thước mất * bỏ; JL-200GF kế bên giữ", () => {
  const e = eng("jlmech-wuhan", 104);
  for (const g of ["JL-180GF", "JL-220GF"]) {
    const r = e.find((x) => x.genset === g);
    assert.equal(spec(r, "dims"), undefined, g);
    assert.equal(spec(r, "weight") != null, true, g);
  }
  assert.equal(spec(e.find((r) => r.genset === "JL-200GF"), "dims"), "3000*1030*1580");
});

test("aosif n123 AW1000: xi lanh + dung tích bỏ; AW875 kế bên giữ 8V / 26.1", () => {
  const e = eng("aosif", 123);
  const r = e.find((x) => x.genset === "AW1000");
  assert.equal(spec(r, "cyl"), undefined); assert.equal(spec(r, "disp"), undefined);
  assert.equal(spec(r, "fuel"), "205.4");
  const k = e.find((x) => x.genset === "AW875");
  assert.equal(spec(k, "cyl"), "8V"); assert.equal(spec(k, "disp"), "26.1");
});

test("cameo n107 SC-70YC: công suất động cơ 35/41 bỏ; hai cột kia giữ", () => {
  const e = eng("cameo-power", 107);
  assert.equal(spec(e.find((r) => r.genset === "SC-70YC"), "engPower"), undefined);
  assert.equal(spec(e.find((r) => r.genset === "SC-55YC"), "engPower"), "50/55");
  assert.equal(spec(e.find((r) => r.genset === "SC-60YC"), "engPower"), "55/60");
});

test("jiangchai n107 J20B400M (6M33D506E310): dòng điện 7200 bỏ; dòng cùng tên (6M26D447E200, 630) và J20B520M giữ", () => {
  const e = eng("jiangchai-xuzhou", 107).filter((r) => r.genset === "J20B400M");
  assert.equal(spec(e.find((r) => r.model === "6M33D506E310"), "current"), undefined);
  assert.equal(spec(e.find((r) => r.model === "6M33D506E310"), "fuel"), "88");
  assert.equal(spec(e.find((r) => r.model === "6M26D447E200"), "current"), "630");
});

test("mingbang n125 MB-V480: xi lanh + dung tích bỏ, đường kính × hành trình giữ; MB-V500 kế bên không đổi", () => {
  const e = eng("mingbang-mbkl", 125);
  const r = e.find((x) => x.genset === "MB-V480");
  assert.equal(spec(r, "cyl"), undefined); assert.equal(spec(r, "disp"), undefined);
  assert.equal(spec(r, "bore"), "105*127");
  assert.equal(spec(e.find((x) => x.genset === "MB-V500"), "disp"), "6.0");
});

test("westinpower n1064 TP880L: tốc độ 1191 bỏ; dòng điện 1299 và dung tích giữ", () => {
  const r = eng("westinpower", 1064).find((x) => x.genset === "TP880L");
  assert.equal(spec(r, "speed"), undefined);
  assert.equal(spec(r, "current"), "1299");
  assert.equal(spec(r, "disp"), "22.921L");
});

test("mọi ngoại lệ nhóm này ghi note đúng bảng; chữ dòng nguồn đổi thì hết hiệu lực", () => {
  for (const [id, n] of [["aoke-yangzhou", 129], ["jlmech-wuhan", 103], ["jlmech-wuhan", 104], ["aosif", 123], ["cameo-power", 107], ["jiangchai-xuzhou", 107], ["mingbang-mbkl", 125], ["westinpower", 1064]]) {
    const notes = [];
    C.fromSupplier(real(id), notes);
    assert.ok(notes.some((x) => x.reason === "ngoại lệ theo dòng" && x.n === n), id + " n" + n);
  }
  const s = real("aoke-yangzhou");
  for (const t of s.specTables) t.rows = t.rows.map((r) => r.replace("MTAA11-G3 | 6 | 108", "MTAA11-G3 | 6 | 108.0"));
  const e = C.fromSupplier(s, []).filter((r) => r.kind === "engine" && r.n === 129 && r.model === "MTAA11-G3");
  assert.equal(spec(e[0], "disp") != null, true);
});
