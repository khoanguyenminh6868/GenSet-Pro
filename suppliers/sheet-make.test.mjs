// node --test suppliers/sheet-make.test.mjs — Khoa duyệt 24/11/2026 (nghiem-thu/dau-phat-khong-hang-trung-ma.md, "Cần Khoa xem"):
// đầu phát LVSI804W: NCC meao-jiangsu chỉ ghi mã, không ghi hãng; tờ hãng Stamford (stamford-avk-china n1068, "LV 804 W")
// nêu đúng mã. Hãng "Stamford" gắn ở mức `via` "tờ hãng" qua SHEET_MAKE (danh sách đóng một mục), không phải do NCC ghi.
// Dữ liệu thật: suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const dir = new URL("./cn/", import.meta.url);
const load = (id) => JSON.parse(fs.readFileSync(new URL(`${id}.json`, dir), "utf8"));
const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(new URL(f, dir), "utf8")));

test("dữ liệu thật: meao-jiangsu ghi mã LVSI804W không hãng, tờ Stamford n1068 ghi LV 804 W", () => {
  const meao = load("meao-jiangsu"), st = load("stamford-avk-china");
  assert.ok(JSON.stringify(meao.specTables).includes("LVSI804W"));
  const src = st.sources.find((x) => x.n === 1068);
  assert.match(src.url, /LVSI804W/);
  assert.ok(src.quote.some((q) => /LV 804 W/.test(q)));
});

test("LVSI804W có hãng Stamford, via 'tờ hãng', nguồn stamford-avk-china n1068", () => {
  const a = C.build(all).alternators.find((x) => x.key === "LVSI804W");
  assert.equal(a.make, "Stamford");
  assert.deepEqual(a.makes.map((m) => [m.name, m.via, m.supplierId, m.n]), [["Stamford", "tờ hãng", "stamford-avk-china", 1068]]);
  assert.equal(a.makeConflict, null);
});

test("chỉ một mục đổi: không đầu phát nào khác nhận via 'tờ hãng'", () => {
  const alts = C.build(all).alternators;
  const sheet = alts.filter((x) => (x.makesAll || []).some((m) => m.via === "tờ hãng"));
  assert.deepEqual(sheet.map((x) => x.key), ["LVSI804W"]);
});

test("không đè hãng NCC đã ghi: mục đã có hãng giữ nguyên", () => {
  const mk = (rows) => ({ id: "x", country: "CN", confidence: "high", role: "genset_oem", specTables: [{ n: 1, title: "", header: ["| Model | Engine | Alternator"], rows }] });
  const a = C.build([mk(["| G1 | QSK60-G4 | Stamford LVSI804W"])]).alternators.find((x) => x.key === "LVSI804W");
  if (a?.make) assert.equal(a.makes.some((m) => m.via === "tờ hãng"), false);
});
