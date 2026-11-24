// Bản chuẩn (spec-standard.mjs) trên dòng THẬT của suppliers/cn. Một lần sinh dùng chung cho mọi ca (build ~1 phút).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { standardOf, FIELDS, stable, enumOf, joinKey, tidyText, planOf, batchesOf, valueOf } from "./spec-standard.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const load = () => fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
const all = load();
const built = globalThis.GenbidCatalog.build(all.filter((s) => s.status !== "incomplete"));
const docs = standardOf(all, { built });
const byId = new Map(docs.map((d) => [d.id, d]));
const sup = new Map(all.map((s) => [s.id, s]));
const fieldsOf = function* () {
  for (const d of docs) {
    if (d.part === "genset") for (const m of Object.values(d.models)) yield [d, m.fields];
    else yield [d, d.fields];
  }
};
const gov = FIELDS.parts.engine.find((f) => f.id === "governor"), asp = FIELDS.parts.engine.find((f) => f.id === "aspiration");

test("mọi id sinh ra có trong spec-fields.json", () => {
  for (const [d, fields] of fieldsOf()) for (const id of Object.keys(fields)) assert.ok(FIELDS.parts[d.part].some((f) => f.id === id), `${d.part}.${id}`);
});
test("mọi raw có dòng / bảng nguồn nó trỏ tới chứa nguyên văn", () => {
  const flat = (s) => String(s).normalize("NFKC").replace(/[\s|]+/g, "");
  let n = 0;
  for (const [, fields] of fieldsOf()) for (const [id, items] of Object.entries(fields)) for (const it of items) {
    // ratings point at a source file, not a table; model names are the catalog's tidied codes (tidyModel), not cell text.
    if (it.raw == null || it.src?.table == null || ["ratings", "model", "engine_model", "alternator_model"].includes(id)) continue;
    const t = sup.get(it.src.supplierId)?.specTables?.[it.src.table];
    assert.ok(t, `bảng ${stable(it.src)}`);
    const text = flat([...(t.header || []), ...(t.rows || [])].join("\n"));
    // rawJoined: the catalog joined cells of a vertical sheet ("lt | 3,3" → "3,3 L"); each figure must still be in the table.
    if (it.rawJoined) { for (const x of String(it.raw).match(/\d+(?:[.,]\d+)?/g) || []) assert.ok(text.includes(flat(x)), `${id} ${it.raw}`); }
    else if (!text.includes(flat(it.raw)) && !/^\d+(\.\d+)?$/.test(String(it.raw))) assert.fail(`${id} ${it.raw} ${stable(it.src)}`);
    n++;
  }
  assert.ok(n > 50000, `chỉ kiểm ${n}`);
});
test("luật gộp cách viết", () => {
  assert.equal(tidyText("150 X 185").text, tidyText("150 × 185").text);
  assert.equal(tidyText("150x185").text, "150 × 185");
  assert.equal(joinKey("Turbocharged & Aftercooled"), joinKey("Turbocharged and Aftercooled"));
  assert.equal(joinKey("Turbocharged, Aftercooled"), joinKey("Turbocharged / Aftercooled"));
  assert.notEqual(joinKey("1500/1800"), joinKey("1500 & 1800"));
  for (const w of ["Electronic", "Electronic Governor", "Electrical", "điện tử"]) assert.equal(enumOf(gov, w)?.value, "electronic", w);
  assert.equal(enumOf(asp, "Turbocharged and Aftercooled")?.value, "turbo_aftercooled");
  const SN = globalThis.GenbidSpecNorm, cyl = FIELDS.parts.engine.find((f) => f.id === "cylinders"), compr = FIELDS.parts.engine.find((f) => f.id === "compression");
  const read = (key, label, value, f) => valueOf(f, SN.normalize({ key, label, value }, { header: [] }), { key, label, value });
  assert.equal(read("compr", "Compression ratio", "15.0:1", compr).value, read("compr", "Compression ratio", "15 : 1", compr).value);
  const a = read("cyl", "Cylinders", "12", cyl), b = read("cyl", "Cylinders", "12 V", cyl);
  assert.equal(a.value, b.value);
  assert.deepEqual(a.missing, b.missing);
  assert.equal(b.layout, "V");
});
test("số xi lanh ghi V có cyl_layout", () => {
  const v = docs.filter((d) => d.part === "engine" && d.fields.cyl_layout?.some((x) => x.value === "V"));
  assert.ok(v.length > 100);
  for (const [, fields] of fieldsOf()) for (const x of fields.cyl_layout || []) assert.ok(["V", "inline"].includes(x.value), x.value);
});
test("tiêu hao không ghi tải có missing", () => {
  let n = 0;
  for (const [d, fields] of fieldsOf()) if (d.part === "genset") for (const x of fields.fuel_100 || []) if (!x.cond?.load) { n++; assert.ok(x.missing?.includes("load"), stable(x)); }
  assert.ok(n > 1000);
});
test("động cơ không sinh kVA từ kWm", () => {
  for (const d of docs) if (d.part === "engine") {
    assert.equal(d.fields.genset_power, undefined);
    for (const x of d.fields.power_kwm || []) assert.ok(!("kva" in x.value) && !("kw" in x.value));
  }
});
test("công suất ghi HP / PS giữ số nguồn ở power_hp, không nằm trong power_kwm", () => {
  for (const d of docs) if (d.part === "engine") {
    for (const x of d.fields.power_hp || []) { assert.match(String(x.unit), /^(hp|PS)$/); if (typeof x.value.hp === "number") assert.ok(String(x.raw).replace(/,/g, "").includes(String(x.value.hp)), stable(x)); }
    for (const x of d.fields.power_kwm || []) assert.ok(!/^(hp|PS)$/.test(String(x.unit)), stable(x));
  }
  // cn/ has no engine power written in HP today (24/11/2026), so this one case is hand-written: spec-norm gives kW, the standard keeps 100 hp.
  const f = FIELDS.parts.engine.find((x) => x.id === "power_kwm"), sp = { key: "engPower", label: "Engine power", value: "100 HP" };
  const n = globalThis.GenbidSpecNorm.normalize(sp, { header: [] });
  assert.equal(n.unit, "kW");
  const r = valueOf(f, n, sp);
  assert.equal(r.value, 100);
  assert.equal(r.unit, "hp");
});
test("Leroy-Somer, Stamford, Mecc Alte có ratings tách theo điện áp", () => {
  for (const re of [/^(TAL|LSA)/, /^(S[4-7]L|UC[ID])/, /^EC[OP]/]) {
    const hit = docs.filter((d) => d.part === "alternator" && re.test(d.key) && new Set((d.fields.ratings || []).map((x) => x.value.voltage)).size >= 2);
    assert.ok(hit.length > 0, String(re));
  }
});
test("chạy hai lần ra cùng byte", () => {
  const again = standardOf(load(), { built: globalThis.GenbidCatalog.build(load().filter((s) => s.status !== "incomplete")) });
  assert.equal(again.length, docs.length);
  for (const d of again) assert.equal(d.hash, byId.get(d.id).hash, d.id);
  assert.equal(stable(again), stable(docs));
});
test("đăng: chỉ doc đổi nội dung, doc mất ghi gone một lần, lô ≤ 200", () => {
  const a = { id: "engine:A", hash: "1" }, b = { id: "engine:B", hash: "2" };
  const p = planOf([a, b], new Map([["engine:A", "1"], ["engine:B", "x"], ["engine:C", "9"], ["engine:D", "gone"]]));
  assert.deepEqual(p.write.map((d) => d.id), ["engine:B"]);
  assert.deepEqual(p.gone.map((d) => d.id), ["engine:C"]);
  assert.equal(p.same, 1);
  const rows = Array.from({ length: 450 }, (_, i) => ({ coll: "specstd", id: `x${i}`, data: {} }));
  assert.ok(batchesOf(rows).every((x) => x.rows.length <= 200));
});
