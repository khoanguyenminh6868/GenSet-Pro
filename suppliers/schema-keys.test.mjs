// node --test suppliers/schema-keys.test.mjs — every key in suppliers/cn/*.json is declared in schema.json (chuan-hoa-1).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRecord, loadAll } from "./verify.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(fs.readFileSync(path.join(DIR, "schema.json"), "utf8"));
const top = new Set(Object.keys(schema.properties)), tbl = new Set(Object.keys(schema.properties.specTables.items.properties));

test("schema declares the keys the data uses (specTables, brandLicensed, foundedSrc...)", () => {
  for (const k of ["specTables", "brandLicensed", "controllers", "contacts", "vietnam", "foundedSrc", "checkedBy"]) assert.ok(top.has(k), k);
  assert.deepEqual([...tbl].sort(), ["header", "n", "rows", "title"]);
});
test("every suppliers/cn/*.json has only keys the schema declares", () => {
  const bad = [];
  for (const { file, rec } of loadAll(path.join(DIR, "cn"))) {
    for (const k of Object.keys(rec)) if (!top.has(k)) bad.push(`${path.basename(file)}: ${k}`);
    for (const [i, t] of (rec.specTables || []).entries()) for (const k of Object.keys(t)) if (!tbl.has(k)) bad.push(`${path.basename(file)} specTables[${i}]: ${k}`);
  }
  assert.deepEqual(bad.slice(0, 10), []);
});
test("verify.mjs rejects a key the schema does not declare", () => {
  const rec = { id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X" }, productLines: [], sources: [], confidence: "low", checkedAt: "2026-11-14", extra: 1 };
  assert.ok(checkRecord(rec).errors.some((e) => /khoá extra/.test(e)));
  const t = { ...rec, extra: undefined, specTables: [{ n: 1, title: "t", header: [], rows: ["a"], src: [1] }] };
  assert.ok(checkRecord(t).errors.some((e) => /khoá src/.test(e)));
});
