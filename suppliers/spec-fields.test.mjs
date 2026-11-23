// Bộ trường chuẩn (spec-fields.json, Khoa chốt 24/11/2026): mỗi trường một id trong phần của nó, kiểu hợp lệ, mã yêu cầu
// HSMT có thật và đúng bộ phận, và cả bốn phần đều có "thương hiệu ở đâu" tách khỏi nơi sản xuất.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CODE_BY } from "./reqcodes.mjs";

const F = JSON.parse(fs.readFileSync(new URL("./spec-fields.json", import.meta.url), "utf8"));
const TYPES = new Set(["number", "enum", "text", "bool", "table", "country"]);

test("bốn phần, id không trùng, kiểu hợp lệ", () => {
  assert.deepEqual(Object.keys(F.parts), ["genset", "engine", "alternator", "controller"]);
  for (const [part, fields] of Object.entries(F.parts)) {
    const ids = fields.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length, `${part}: id trùng`);
    for (const f of fields) {
      assert.ok(/^[a-z][a-z0-9_]*$/.test(f.id), `${part}.${f.id}: id`);
      assert.ok(f.vi, `${part}.${f.id}: thiếu tên`);
      assert.ok(TYPES.has(f.type), `${part}.${f.id}: kiểu ${f.type}`);
      if (f.type === "enum") assert.ok(f.values?.length > 1, `${part}.${f.id}: enum cần values`);
      if (f.type === "table") assert.ok(f.cols?.length > 1, `${part}.${f.id}: table cần cols`);
      for (const v of Object.keys(f.same || {})) assert.ok(f.values.includes(v), `${part}.${f.id}: same.${v} không có trong values`);
    }
  }
});

test("mã yêu cầu HSMT có trong reqcodes.mjs", () => {
  for (const [part, fields] of Object.entries(F.parts)) for (const f of fields) if (f.req) assert.ok(CODE_BY.has(f.req), `${part}.${f.id}: mã ${f.req}`);
});

test("cả bốn phần có thương hiệu ở đâu và nơi sản xuất riêng", () => {
  for (const [part, fields] of Object.entries(F.parts)) {
    for (const id of ["brand_country", "made_in"]) assert.equal(fields.find((f) => f.id === id)?.type, "country", `${part}.${id}`);
  }
});

test("đầu phát lưu thông số điện theo từng điện áp", () => {
  const r = F.parts.alternator.find((f) => f.id === "ratings");
  for (const c of ["voltage", "hz", "kva", "kw"]) assert.ok(r.cols.includes(c), c);
});
