// node --test suppliers/fuel.test.mjs — nhiên liệu của bản ghi (may-khi-2, Khoa 20/11/2026): `fuel` ("gas" / "gasoline" / "dual"),
// `fuelFrom` (B bảng tự ghi, M mã model -NG kèm tiêu đề / URL khí, T tên trang) và `fuelWhy`; không đủ dấu hiệu thì KHÔNG ghi
// (rỗng ≠ diesel). Cùng PR: COP / Continuous không là prime (agg-fuzhou n115–118, hosem-power n112). Mỗi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const rec = (id, n) => C.fromSupplier(real(id)).filter((r) => r.n === n);
const fuels = (rs) => [...new Set(rs.map((r) => `${r.fuel || ""}/${r.fuelFrom || ""}`))];

test("B: bảng tự ghi nhiên liệu (ô nhãn, cột tiêu hao khí)", () => {
  const nai = rec("naipute-weifang", 2001);                       // "Fuel Type | Natural gas/Biogas"
  assert.ok(nai.length && nai.every((r) => r.fuel === "gas" && r.fuelFrom === "B" && /Natural gas/.test(r.fuelWhy)));
  const cam = rec("cameo-power", 127);                            // "Fuel Type | Gasoline"
  assert.ok(cam.length && cam.every((r) => r.fuel === "gasoline" && r.fuelFrom === "B"));
  const slo = rec("slong-power", 105);                          // "Fuel Type | Gasoline , LPG , NG": xăng + LPG / khí
  assert.ok(slo.length && slo.every((r) => r.fuel === "dual" && r.fuelFrom === "B"));
  const hy = rec("huayuan-weifang", 105);                         // cột "燃气消耗(m3/kw.h)"
  assert.ok(hy.length && hy.every((r) => r.fuel === "gas" && r.fuelFrom === "B"));
});

test("T: chỉ tên trang / URL ghi khí hay xăng, bảng không có cột nhiên liệu", () => {
  const kai = rec("kaihua-genset", 116);                          // title + URL "By-Function/Gas-Generator"
  assert.ok(kai.length && kai.every((r) => r.fuel === "gas" && r.fuelFrom === "T"));
  const vic = rec("victory-generator", 119);                      // "2KW~8.8KW Gasoline Portable Generator"
  assert.ok(vic.length && vic.every((r) => r.fuel === "gasoline" && r.fuelFrom === "T" || r.fuel === "gasoline" && r.fuelFrom === "B"));
  const lpg = rec("victory-generator", 118);                      // tiêu đề "Gas(LPG)" + dòng "Gasoline Consumption": hai loại = dual, mức yếu nhất (T)
  assert.ok(lpg.length && lpg.every((r) => r.fuel === "dual" && r.fuelFrom === "T"));
  const kig = rec("kigerpower", 2011);                            // chỉ URL "…portable-gasoline-generator"
  assert.ok(kig.length && kig.every((r) => r.fuel === "gasoline" && r.fuelFrom === "T"));
});

test("M: mã model -NG của CHÍNH dòng + tên trang / URL khí; dòng không mang mã -NG chỉ còn T", () => {
  for (const [id, n] of [["agg-fuzhou", 115], ["agg-fuzhou", 116], ["agg-fuzhou", 117], ["agg-fuzhou", 118], ["penlucky", 107], ["weichai-heavy-machinery", 104]]) {
    const rs = rec(id, n);
    assert.ok(rs.length, `${id} n${n}`);
    for (const r of rs) { assert.equal(r.fuel, "gas", `${id} n${n} ${r.genset}`); assert.equal(r.fuelFrom, "M", `${id} n${n} ${r.genset}`); assert.ok(r.fuelWhy); }
  }
  // dòng giả: cùng bảng có hai dòng, chỉ một mang -NG
  const t = { n: 9, title: "AGG-x", header: ["| | Model | Prime (kVA/kW) | Engine | Brand"], rows: ["| DC260G6-NG | 260/208 | LY13-G280 | AGG", "| DC260G6 | 260/208 | LY13-G280 | AGG"] };
  const url = "https://x.example/agg-natural-gas-generator-sets";
  assert.equal(C.fuelOf(t, url, t.rows[0]).from, "M");
  assert.equal(C.fuelOf(t, url, t.rows[1]).from, "T");           // URL khí, dòng không ghi -NG: mức yếu hơn
  assert.equal(C.fuelOf(t, "", t.rows[0]), null);                 // mã -NG đứng một mình: không đủ
});

test("không ghi: menu / khẩu hiệu / đơn vị / chữ mơ hồ / mâu thuẫn (rỗng, KHÔNG phải diesel)", () => {
  for (const [id, n] of [
    ["powerzoo", 101], ["powerzoo", 169],                         // menu "Diesel Generator Set | Gas Generator Set | …"
    ["chenxing-weifang", 101],                                    // khẩu hiệu "提供柴油、燃气发电机组…"
    ["gillette-generators", 101],                                 // "Natural Gas and … Diesel" là menu
    ["westinpower", 1003],                                        // m³/h = lưu lượng nước làm mát
    ["simpson-power", 124],                                       // "SIMPSON-GasGenerators": gas hay gasoline?
    ["jianghao-genset", 104],                                     // tiêu đề "Gas Generator" nhưng "FuelCon. (L)"
    ["victory-generator", 129], ["victory-generator", 133],       // "Diesel Twin-cylinder"; chữ xăng ở dòng khác
    ["kingway-power", 117],                                       // bể chứa khí sinh học
    ["man-engines", 104],                                         // "diesel and gas engines" trộn
    ["penlucky", 102],                                            // URL diesel; chỉ mã động cơ K38N
  ]) {
    const rs = rec(id, n);
    assert.ok(rs.length, `${id} n${n} có bản ghi`);
    for (const r of rs) { assert.equal(r.fuel, undefined, `${id} n${n} ${r.model}`); assert.equal(r.fuelFrom, undefined); assert.equal(r.fuelWhy, undefined); }
  }
  const t = (title, rows = ["| X | 1 | Y"]) => ({ n: 1, title, header: [], rows });
  assert.equal(C.fuelOf(t("Gas Powered Storage Tank | Biogas Storage Tank"), ""), null);
  assert.equal(C.fuelOf(t("Coolant flow 80 m3/h diesel"), ""), null);
  assert.equal(C.fuelOf(t("TAIZHOU KAIHUA DIESEL GENERATOR SETS CO. LTD - Gas Generator"), "").fuel, "gas"); // diesel trong TÊN CÔNG TY không tính
});

test("weichai-power n125–128: tiêu đề / URL không ghi khí, nhưng đường dẫn của CHÍNH trang (\"Generator Set / Overseas Gas\") có → T (FUEL_PAGES)", () => {
  for (const n of [125, 126, 127, 128]) {
    const rs = rec("weichai-power", n);
    assert.ok(rs.length, `n${n}`);
    for (const r of rs) { assert.equal(r.fuel, "gas"); assert.equal(r.fuelFrom, "T"); assert.match(r.fuelWhy, /Overseas Gas/); }
  }
  // chỉ bảng đã soát trang: bảng khác của NCC không bị gán
  const other = C.fromSupplier(real("weichai-power")).filter((r) => ![125, 126, 127, 128].includes(r.n));
  assert.ok(other.length && other.every((r) => r.fuel === undefined));
});

test("fuel đi tới uses của build() ở mức DÒNG", () => {
  const cat = C.build([real("agg-fuzhou")]);
  const uses = cat.engines.flatMap((e) => e.uses).filter((u) => u.n >= 115 && u.n <= 118);
  assert.equal(uses.length, 42);
  assert.ok(uses.every((u) => u.fuel === "gas" && u.fuelFrom === "M" && typeof u.fuelWhy === "string"));
  // bảng khác của cùng NCC (diesel, không dấu hiệu): uses không có trường
  const other = cat.engines.flatMap((e) => e.uses).filter((u) => u.n < 115);
  assert.ok(other.length && other.every((u) => u.fuel === undefined));
});

test("COP / Continuous không là prime (agg-fuzhou n115–118: cột \"COP (kVA/kW)\"; hosem-power n112: dòng nhãn \"Continuous Power\")", () => {
  for (const n of [115, 116, 117, 118]) {
    const rs = rec("agg-fuzhou", n);
    assert.ok(rs.length);
    for (const r of rs) { assert.equal(r.power?.prime, undefined, `${r.genset}`); assert.ok(r.power?.rated?.kVA > 0 && r.power.rated.kW > 0, `${r.genset}`); }
  }
  const dc = rec("agg-fuzhou", 115).find((r) => r.kind === "engine" && r.genset === "DC260G6-NG");
  assert.deepEqual(dc.power, { rated: { kVA: 260, kW: 208 } });
  const ho = rec("hosem-power", 112);
  assert.equal(ho.length, 2);
  for (const r of ho) { assert.equal(r.power.prime, undefined); assert.deepEqual(r.power, { rated: { kVA: 200 } }); }
  // cột Prime thật vẫn là prime (agg-fuzhou bảng diesel n101: ESP / PRP)
  const d = rec("agg-fuzhou", 101).find((r) => r.power?.prime);
  assert.ok(d, "bảng diesel vẫn đọc prime");
});
