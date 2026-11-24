// Giá trị một nguồn internet trong bản chuẩn (PR 3 của thiết kế gia-tri-mot-nguon, nhánh dieu-phoi): spec-standard.mjs đọc
// one-source.json SAU khi gộp số NCC + tờ hãng, mỗi bản ghi một dòng riêng có dấu origin "one-source".
// Dữ liệu thật của 6 NCC có LSA 44.2 / 46.2 / 51.2 (CAT.build nhỏ, ~2 s) + bản ghi thật của one-source.json.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { standardOf, statsOf, stable, readOneSource, oneSourcePick, oneSourceItem, checkOneSourceValues, FIELDS } from "./spec-standard.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const IDS = ["camda-generator", "hosem-power", "leroy-somer-fuzhou", "pramac", "rise-power", "wintpower"];
const sub = IDS.map((id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8")));
const built = globalThis.GenbidCatalog.build(sub.filter((s) => s.status !== "incomplete"));
const records = readOneSource();
const report = {};
const before = standardOf(sub, { built, oneSource: [] });
const after = standardOf(sub, { built, oneSource: records, oneSourceReport: report });
const byId = (docs) => new Map(docs.map((d) => [d.id, d]));
const B = byId(before), A = byId(after);
const readSource = (file) => { const p = path.join(ROOT, file); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
const ones = (d) => Object.values(d.fields || {}).flat().filter((x) => x.origin === "one-source");
const withoutOnes = (d) => {
  const fields = {};
  for (const [k, items] of Object.entries(d.fields)) { const l = items.filter((x) => x.origin !== "one-source"); if (l.length) fields[k] = l; }
  return stable({ ...d, hash: null, fields });
};
const rec = (over) => ({ ...records.find((r) => r.key === "LSA462M3"), ...over });

test("dữ liệu thật: doc đổi chỉ là THÊM giá trị có dấu, không giá trị cũ nào đổi", () => {
  assert.equal(after.length, before.length);
  let changed = 0, added = 0;
  for (const d of after) {
    const o = B.get(d.id);
    assert.ok(o, d.id);
    if (stable(o) === stable(d)) continue;
    changed++;
    added += ones(d).length;
    assert.equal(ones(o).length, 0);
    assert.equal(withoutOnes(d), stable({ ...o, hash: null }), d.id);
    assert.notEqual(d.hash, o.hash, `${d.id}: hash phải đổi để doc được đăng lại`);
  }
  // 14 model trong danh mục × 16 dòng (LSA 44.2 / 46.2) hoặc 12 (LSA 51.2); LSA 51.2 L70 / VL95 không NCC nào chào.
  assert.equal(changed, 14);
  assert.equal(added, 212);
  assert.deepEqual({ records: report.records, used: report.used, docs: report.docs }, { records: records.length, used: 212, docs: 14 });
  assert.deepEqual(Object.keys(report.skipped), ["khong-doc"]);
  assert.equal(report.skipped["khong-doc"].length, 24);
  assert.ok(report.skipped["khong-doc"].every((id) => /^ls-lsa512-(l70|vl95)-/.test(id)), report.skipped["khong-doc"].join(" "));
  assert.ok(!A.has("alternator:LSA512L70") && !A.has("alternator:LSA512VL95"), "không sinh doc cho model chỉ có giá trị một nguồn");
});

test("dấu riêng: origin, src { oneSource, url, level }, suppliers 0, raw = câu trích đầu, đứng sau mọi giá trị NCC", () => {
  const d = A.get("alternator:LSA462M3");
  const items = d.fields.ratings;
  assert.equal(items.length, 16);
  for (const it of items) {
    const r = records.find((x) => x.id === it.src.oneSource);
    assert.ok(r, stable(it.src));
    assert.deepEqual(Object.keys(it).sort(), ["origin", "raw", "src", "suppliers", "value"]);
    assert.equal(it.origin, "one-source");
    assert.deepEqual(it.src, { oneSource: r.id, url: r.url, level: r.level });
    assert.equal(it.suppliers, 0);
    assert.equal(it.raw, r.quote[0]);
    assert.deepEqual(it.value, r.value);
  }
  // doc.suppliers là NCC chào model, không thêm gì.
  assert.deepEqual(d.suppliers, B.get("alternator:LSA462M3").suppliers);
  for (const x of after) for (const items of Object.values(x.fields || {})) {
    const i = items.findIndex((y) => y.origin === "one-source");
    if (i >= 0) assert.ok(items.slice(i).every((y) => y.origin === "one-source"), `${x.id}: giá trị một nguồn phải đứng cuối`);
  }
});

test("không gộp chung dòng với số NCC dù cùng giá trị", () => {
  // hosem-power ghi IP23 cho TALA46B; một bản ghi một nguồn cùng chữ vẫn là dòng riêng.
  const r = rec({ id: "t-ip", key: "TALA46B", model: "TAL-A46-B", field: "ip", value: "IP23" });
  const docs = standardOf(sub, { built, oneSource: [r] });
  const items = docs.find((d) => d.id === "alternator:TALA46B").fields.ip;
  const old = B.get("alternator:TALA46B").fields.ip;
  assert.equal(items.length, old.length + 1);
  assert.deepEqual(items.slice(0, -1), old);
  assert.equal(items.at(-1).origin, "one-source");
  assert.equal(items.at(-1).value, "IP23");
  assert.equal(items.at(-1).suppliers, 0);
});

test("luật thắng: tờ hãng đã ghi cùng trường + điều kiện thì không hiện giá trị một nguồn", () => {
  const sheet = B.get("alternator:LSA472M7").fields.ratings.find((x) => x.src?.supplierId === "leroy-somer-fuzhou" && x.value.voltage === 380 && x.value.phases === 3 && x.value.hz === 50 && x.value.duty === "continuous");
  assert.ok(sheet, "tờ hãng LSA 47.2 M7 có dòng 380 V 50 Hz liên tục");
  const v = { voltage: 380, connection: "Y", phases: 3, hz: 50, duty: "continuous", ambient_c: 40, insulation_rise: "F/105 K", kva: 999 };
  const hit = rec({ id: "t-sheet", key: "LSA472M7", model: "LSA 47.2 M7", value: v });
  // Cùng model, điều kiện tờ hãng không ghi (600 V) → vẫn hiện.
  const other = rec({ id: "t-sheet-other", key: "LSA472M7", model: "LSA 47.2 M7", value: { ...v, voltage: 600, kva: 1 } });
  const rep = {};
  const docs = standardOf(sub, { built, oneSource: [hit, other], oneSourceReport: rep });
  assert.deepEqual(rep.skipped, { "to-hang": ["t-sheet"] });
  const got = ones(docs.find((d) => d.id === "alternator:LSA472M7"));
  assert.deepEqual(got.map((x) => x.src.oneSource), ["t-sheet-other"]);
});

test("mâu thuẫn: không hiện bản nào; trùng: giữ một (bậc nhỏ hơn, rồi accessedAt mới hơn)", () => {
  const has = () => true, makerCtx = () => ({});
  const a = rec({ id: "a" }), b = rec({ id: "b", value: { ...a.value, kva: a.value.kva + 1 } });
  assert.deepEqual(oneSourcePick([a, b], { has, makerCtx }).skipped, { "mau-thuan": ["a", "b"] });
  const c = rec({ id: "c", level: 3 }), d = rec({ id: "d", level: 2, accessedAt: "2026-01-01" }), e = rec({ id: "e", level: 2, accessedAt: "2026-11-30" });
  const p = oneSourcePick([c, d, e], { has, makerCtx });
  assert.deepEqual(p.keep.map((x) => x.rec.id), ["e"]);
  assert.deepEqual(p.skipped, { trung: ["c", "d"] });
  // Trường lạ / danh tính, không có doc.
  const q = oneSourcePick([rec({ id: "f", field: "model" }), rec({ id: "g", field: "khong-co" }), rec({ id: "h" })], { has: () => false, makerCtx });
  assert.deepEqual(q.skipped, { "khong-doc": ["h"], "truong-la": ["f", "g"] });
  assert.equal(q.keep.length, 0);
});

test("oneSourceItem: missing theo đơn vị / điều kiện trường đòi", () => {
  const f = FIELDS.parts.alternator.find((x) => x.id === "voltage_regulation");
  const it = oneSourceItem(rec({ id: "v", field: "voltage_regulation", value: 0.5, unit: null, cond: null }), f);
  assert.deepEqual(it.missing, ["excitation", "unit"]);
  const it2 = oneSourceItem(rec({ id: "v", field: "voltage_regulation", value: 0.5, unit: "%", cond: { excitation: "AREP" } }), f);
  assert.equal(it2.missing, undefined);
  assert.equal(it2.unit, "%");
  assert.deepEqual(it2.cond, { excitation: "AREP" });
});

test("statsOf đếm riêng giá trị một nguồn", () => {
  const s0 = statsOf(before), s1 = statsOf(after);
  assert.equal(s0.oneSource, 0);
  assert.equal(s1.oneSource, 212);
  const r0 = s0.fields.alternator.ratings, r1 = s1.fields.alternator.ratings;
  assert.equal(r1.values - r0.values, 212);
  assert.equal(r1.oneSource, 212);
  // 14 model trước đây không có định mức nào: nay chỉ có giá trị một nguồn.
  assert.equal(r1.models - r0.models, 14);
  assert.equal(r1.oneSourceOnly, 14);
});

test("checkOneSourceValues: raw nằm nguyên văn trong tệp nguồn của bản ghi; bắt giá trị bị sửa", () => {
  const ok = checkOneSourceValues(after, records, readSource);
  assert.equal(ok.checked, 212);
  assert.deepEqual(ok.bad, []);
  const d = structuredClone(A.get("alternator:LSA462M3"));
  d.fields.ratings[0].raw = "46.2 M3 kVA 999";
  d.fields.ratings[1].value = { ...d.fields.ratings[1].value, kva: 1 };
  d.fields.ratings[2].src = { ...d.fields.ratings[2].src, oneSource: "khong-co" };
  const bad = checkOneSourceValues([d], records, readSource).bad.map((x) => x.why);
  assert.ok(bad.includes("raw khác câu trích đầu của bản ghi"), bad.join("; "));
  assert.ok(bad.some((w) => /^raw không nằm nguyên văn/.test(w)), bad.join("; "));
  assert.ok(bad.includes("value / unit / cond khác bản ghi"), bad.join("; "));
  assert.ok(bad.includes("không có bản ghi này trong one-source.json"), bad.join("; "));
  assert.equal(checkOneSourceValues(after, records, () => null).bad.length, 212);
});

test("spec-standard.mjs không import one-source-check.mjs (vòng import qua config-bot)", () => {
  for (const f of ["spec-standard.mjs", "one-source-rules.mjs"]) {
    const src = fs.readFileSync(path.join(ROOT, f), "utf8");
    assert.ok(!/from\s+["']\.\/one-source-check\.mjs["']|import\(\s*["'][^"']*one-source-check/.test(src), f);
  }
  assert.ok(!/from\s+["']\.\/config-bot\.mjs["']/.test(fs.readFileSync(path.join(ROOT, "one-source-rules.mjs"), "utf8")));
});
