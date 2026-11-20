// node --test suppliers/named-own-alt.test.mjs — #969 (Khoa 20/11/2026): `named()` khớp TRỌN token của chữ HSMT (không còn chuỗi
// con của chữ dồn: "Model: 224D" từng thành "model224d" chứa "el224d"), và đầu phát tự gắn nhãn của chính NCC (OWN_BRAND_ALTS:
// eastern-lion "EL 164D" / "ELS 184F") không được +40 "tra được đầu phát" / +3 mỗi loại thông số trên dòng của NCC đó.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { candidates, hintsOf, named, OWN_BRAND_ALTS } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const H = (s) => hintsOf(`Chương V. Yêu cầu kỹ thuật\n${s}`);

test("named(): trọn token, viết rời hay dính dấu đều nhận; chuỗi con giữa token thì không", () => {
  assert.equal(named(H("Đầu phát: Model: 224D, loại không chổi than"), "EL 224D"), false);  // IB2300027083 kiểu này
  assert.equal(named(H("Đầu phát Stamford HCI 544 D hoặc tương đương"), "HCI544D"), true);
  assert.equal(named(H("Động cơ Cummins 6BT5.9-G2"), "6BT5.9-G2"), true);
  assert.equal(named(H("Động cơ Cummins 6BT5.9-G2"), "6BT5.9G2"), true);
  assert.equal(named(H("Động cơ Cummins 4BTA3.9-G11"), "4BTA3.9-G1"), false);   // G1 ≠ G11
  assert.equal(named(H("Động cơ Cummins 6BT5.9-G2"), "6BT5.9-G"), false);      // model cụt của catalog: không nêu đích danh
  assert.equal(named(H("Ắc quy khởi động 12VDC/24VDC"), "DC 24V"), false);
  assert.equal(named(H("Điện áp 220/380V, 50Hz"), "V2203"), false);
  assert.equal(named(H("Cầu dao ACB 2500A 4P"), "B2500"), false);
  // hints dựng tay không có `bounds`: như cũ (chuỗi con)
  assert.equal(named({ text: "model224d" }, "EL224D"), true);
});

test("OWN_BRAND_ALTS: danh sách tường minh (NCC + mẫu mã), chỉ eastern-lion", () => {
  assert.deepEqual(OWN_BRAND_ALTS.map((x) => x.supplierId), ["eastern-lion-fuan"]);
  for (const m of ["EL 164D", "EL224D", "ELS 184F", "EL 274G"]) assert.ok(OWN_BRAND_ALTS[0].code.test(m), m);
  for (const m of ["HCI544D", "UCI274D", "ELS-RUIFEN"]) assert.ok(!OWN_BRAND_ALTS[0].code.test(m), m);
});

test("dòng eastern-lion có đầu phát EL: không +40 / +3 thông số; dòng NCC khác không đổi; bản ghi đầu phát EL vẫn còn", () => {
  const list = [real("eastern-lion-fuan")], cat = C.build(list);
  assert.ok(cat.alternators.some((a) => /^ELS?\s?\d{3}/.test(a.model)), "bản ghi đầu phát EL vẫn trong catalog");
  const hints = H("Tần số 50 Hz");
  const run = () => new Map(candidates(cat, { value: 30, unit: "kVA" }, hints, { suppliers: list, makeCap: 0 }).all.map((r) => [`${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${C.keyOf(r.u.line || "")}`, r]));
  const withRule = run();
  const saved = OWN_BRAND_ALTS.splice(0);
  let without;
  try { without = run(); } finally { OWN_BRAND_ALTS.push(...saved); }
  let own = 0;
  for (const [k, r] of withRule) {
    const o = without.get(k);
    assert.ok(o, k);
    if (r.a && /^ELS?\s?\d{3}/i.test(r.a.model)) { own++; assert.ok(o.score - r.score >= 40, `${k}: ${o.score} → ${r.score}`); }
    else assert.equal(r.score, o.score, k);
  }
  assert.ok(own > 0, "có dòng eastern-lion mang đầu phát EL");
});
