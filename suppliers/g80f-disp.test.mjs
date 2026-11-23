// node --test suppliers/*.test.mjs — 23,88 L của 12V2000 chép nhầm cho 12V1600G80F (điều phối 23/11/2026): bỏ riêng dung tích, giữ dòng.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const load = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const g80f = (id) => C.fromSupplier(load(id), []).filter((r) => r.kind === "engine" && C.keyOf(r.model) === C.keyOf("12V1600G80F"));
const disp = (r) => (r.specs || []).filter((f) => f.key === "disp").map((f) => f.value);

for (const id of ["bdadl-shanghai", "fukangsi-yangzhou", "pengpai-yangzhou"]) {
  test(`${id}: dòng G80F còn, không còn 23.88`, () => {
    const list = g80f(id);
    assert.ok(list.length >= 1);
    for (const r of list) assert.ok(!disp(r).includes("23.88"));
  });
}

test("wintpower vẫn ghi G80F = 21; 12V2000G65 của bdadl vẫn 23.88", () => {
  assert.ok(g80f("wintpower").some((r) => disp(r).includes("21")));
  const g65 = C.fromSupplier(load("bdadl-shanghai"), []).filter((r) => r.kind === "engine" && C.keyOf(r.model) === C.keyOf("12V2000G65"));
  assert.ok(g65.some((r) => disp(r).includes("23.88")));
});
