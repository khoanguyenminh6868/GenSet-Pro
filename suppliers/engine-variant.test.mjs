// node --test suppliers/engine-variant.test.mjs — variantFamily (Đặc thù hãng động cơ, chặng 2, điều 3). Models are
// written as the catalog (suppliers/cn, web/catalog.js build) has them, 18/11/2026.
import test from "node:test";
import assert from "node:assert/strict";
import { variantFamily, familiesOf, SCOPES } from "./engine-variant.mjs";

const D1105 = ["D1105-E2BG", "D1105", "D1105-BG", "D1105-E2BG-CHN", "D1105-E2BG-CHN-1", "D1105-E2BG-CHN-1/8.4KW"];

test("Kubota versions are one family under both scopes (IB2600612866: D1105 / D1105-BG / -E2BG / -CHN / -CHN-1)", () => {
  for (const scope of SCOPES) for (const m of D1105) assert.equal(variantFamily(m, scope), "D1105", `${scope} ${m}`);
  for (const scope of SCOPES) assert.notEqual(variantFamily("V1505-E2BG", scope), variantFamily("D1105-E2BG", scope), scope);
  // The turbo "-T" of Kubota: "version" keeps V2003-T-… with V2003T; "all" cuts at the first hyphen and puts it with the
  // non-turbo V2003 (one more reason Khoa has to choose the scope).
  assert.equal(variantFamily("V2003-T-E2BG-CHN-1/20.4KW", "version"), variantFamily("V2003T", "version"));
  assert.equal(variantFamily("V2003-T-E2BG", "all"), variantFamily("V2003", "all"));
});

test("a power written in the model cell is no version ('WP6D152E200/138KW', 'ZH4100D/30,1 KW')", () => {
  for (const scope of SCOPES) {
    assert.equal(variantFamily("WP6D152E200/138KW", scope), "WP6D152E200");
    assert.equal(variantFamily("ZH4100D/30,1 KW", scope), "ZH4100D");
  }
});

test("scope 'all' groups rating suffixes too, scope 'version' does not (Khoa chooses, câu 4)", () => {
  assert.equal(variantFamily("QSK60-G3", "all"), variantFamily("QSK60-G4", "all"));
  assert.equal(variantFamily("4006-23TAG2A", "all"), variantFamily("4006-23TAG3A", "all"));
  assert.notEqual(variantFamily("QSK60-G3", "version"), variantFamily("QSK60-G4", "version"));
  assert.notEqual(variantFamily("4006-23TAG2A", "version"), variantFamily("4006-23TAG3A", "version"));
  // "all" also joins engines of other displacements under one series code (Perkins 403A-11G1 1.1 L, 403A-15G1 1.5 L).
  assert.equal(variantFamily("403A-11G1", "all"), variantFamily("403A-15G1", "all"));
  assert.notEqual(variantFamily("403A-11G1", "version"), variantFamily("403A-15G1", "version"));
});

test("'version': a two-digit suffix is a rating, a one-digit one a version (ZCDL-15 / -18, N4105DS-38 / -46; 6190ZLC-1 / -2)", () => {
  assert.notEqual(variantFamily("ZCDL-15", "version"), variantFamily("ZCDL-18", "version"));
  assert.notEqual(variantFamily("N4105DS-38", "version"), variantFamily("N4105DS-46", "version"));
  assert.equal(variantFamily("6190ZLC-1", "version"), variantFamily("6190ZLC-2", "version"));
});

test("'all': a base that is no engine code keeps the whole model", () => {
  assert.equal(variantFamily("C-15", "all"), "C15");
  assert.equal(variantFamily("AB-12", "all"), "AB12");
});

test("familiesOf keeps only families of two models or more, and checks the scope", () => {
  const f = familiesOf([...D1105, "V1505", "QSK60-G3", "QSK60-G4"], "version");
  assert.deepEqual([...f.keys()], ["D1105"]);
  assert.equal(f.get("D1105").length, 6);
  assert.throws(() => variantFamily("D1105", "rating"));
  // Khoa 18/11/2026, câu 4 (b): the default is "version" (rating suffixes are other engines)
  assert.notEqual(variantFamily("QSK60-G3"), variantFamily("QSK60-G4"));
  assert.equal(variantFamily("D1105-E2BG-CHN-1/8.4KW"), "D1105");
});
