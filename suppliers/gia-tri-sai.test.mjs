// node --test suppliers/gia-tri-sai.test.mjs — gia-tri-sai (Khoa 24/11/2026 "Đưa từng ca vào danh sách để bỏ hoặc sửa"): vi phạm
// "sai" của spec-value-check mà NGUỒN ghi sai → `dropspec` / `nopower` theo dòng (danh sách tường minh trong ROW_EXCEPTIONS);
// googol "Weight (kg)" (không nói của động cơ hay tổ máy) → `unsurespec`: giữ hiện, spec-norm missing "confirm", không chấm / lọc.
// Một dòng khớp nhiều mục thì áp hết (LZ1750: khối lượng 19/11 + tiêu hao 24/11). Mỗi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/conversions.js";
import "../web/catalog.js";
import "../web/spec-norm.js";
import { normFig } from "./config-bot.mjs";
import { absurdOf } from "./row-flags-lib.mjs";

const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const recsOf = new Map();
const recs = (id) => { if (!recsOf.has(id)) recsOf.set(id, C.fromSupplier(real(id))); return recsOf.get(id); };
const find = (id, n, genset, kind = "engine") => recs(id).filter((r) => r.n === n && r.genset === genset && r.kind === kind);
const keys = (r) => (r.specs || []).map((s) => s.key);

test("dropspec tiêu hao: cột g/kw.h bảng mẫu bdadl, cột 油耗 chép kW standby (jiangchai), longkai 18,3 L/h cho 288 kW", () => {
  // jiangchai n110 has three J20C88M rows (one per engine): only the QSB5.9-G2 row writes 88 under 油耗; the 6BT rows' 17 L/h stay.
  for (const [id, n, g, k, eng] of [["bdadl-shanghai", 119, "BDA-M240", "fuel"], ["jiangchai-xuzhou", 110, "J20C88M", "fuel", "QSB5.9-G2"], ["longkai-power", 1085, "LG288C", "fuel75"], ["huipu-power", 102, "HP-K1000", "fuel"]]) {
    const rs = find(id, n, g).filter((r) => !eng || r.model === eng);
    assert.ok(rs.length, `${id} ${g} không có bản ghi`);
    for (const r of rs) assert.ok(!keys(r).includes(k), `${id} ${g} còn ${k}`);
  }
  const keep = find("jiangchai-xuzhou", 110, "J20C88M").filter((r) => r.model === "6BT5.9-G1");
  assert.ok(keep.length && keep.every((r) => keys(r).includes("fuel")));
});

test("dropspec chỉ bỏ thông số đã liệt kê: phần còn lại của dòng giữ nguyên", () => {
  const [r] = find("bdadl-shanghai", 119, "BDA-M240");
  assert.ok(keys(r).includes("weight") && keys(r).includes("dims"));
  const [j] = find("jiangchai-xuzhou", 110, "J20C100M");
  assert.ok(!keys(j).includes("fuel") && !keys(j).includes("dims") && keys(j).includes("weight"));
});

test("hai mục cùng khớp một dòng: LZ1750 mất cả khối lượng (19/11) lẫn tiêu hao (24/11)", () => {
  for (const r of find("bdadl-shanghai", 104, "BDA-LZ1750")) {
    assert.ok(!keys(r).includes("weight"));
    assert.ok(!keys(r).includes("fuel"));
    assert.ok(keys(r).includes("dims"));
  }
});

test("dropspec bore / compr của bản ghi động cơ (khớp theo model động cơ)", () => {
  const h = recs("huipu-power").find((r) => r.n === 102 && r.kind === "engine" && r.model === "PTAA1340G3");
  assert.ok(h && !keys(h).includes("bore"));
  const g = recs("gfe-power").find((r) => r.n === 1023 && r.kind === "engine" && r.model === "2206C-E13TAG2L");
  assert.ok(g && !keys(g).includes("compr"));
});

test("nopower: depco DPK-DYM-44 ghi standby 35kW/344kVA", () => {
  const rs = recs("depco-power").filter((r) => r.n === 2013 && r.genset === "DPK-DYM-44");
  assert.ok(rs.length);
  for (const r of rs) assert.equal(r.power, null);
});

test("unsurespec googol: khối lượng giữ, cờ unconfirmed, missing confirm, không so / không absurd", () => {
  // googol is a GENSET_TABLES supplier: its set rows come from gensetsOf, where ROW_EXCEPTIONS now apply too.
  const rs = C.gensetsOf(real("googol")).filter((r) => r.n === 109 && r.model === "QTA20V-EG3600C");
  assert.ok(rs.length);
  for (const r of rs) {
    const sp = r.specs.find((s) => s.key === "weight");
    assert.equal(sp.value, "7800");
    assert.ok(sp.unconfirmed);
    const n = SN.normalize(sp, { header: r.header || [] });
    assert.equal(n.num, 7800);
    assert.ok(n.missing.includes("confirm"));
    assert.equal(normFig(sp, null, { unit: "kg" }).ok, false);
    assert.equal(absurdOf(sp, r, null), null);
  }
});

test("dòng KHÔNG có trong danh sách đọc như cũ (googol khối lượng của dòng khác không có cờ)", () => {
  const all = C.gensetsOf(real("googol")).flatMap((r) => r.specs || []).filter((s) => s.key === "weight");
  assert.equal(all.filter((s) => s.unconfirmed).length, 11);
  assert.ok(all.some((s) => !s.unconfirmed));
});
