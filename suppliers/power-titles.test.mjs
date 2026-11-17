// node --test suppliers/power-titles.test.mjs — a genset row's outputs read by its column titles (web/catalog.js
// titledPowers, 2026-11-17). Each case in fixtures/power-titles.json is a real table header and row of suppliers/cn with
// the outputs checked by eye against the titles; `why` says what the row is there for.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(HERE, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const cases = JSON.parse(fs.readFileSync(path.join(HERE, "fixtures", "power-titles.json"), "utf8"));
const engineOf = (c) => {
  const s = { id: c.supplier, country: "CN", names: { en: c.supplier }, specTables: [{ n: c.n, title: c.title, header: c.header, rows: [c.row] }] };
  return C.fromSupplier(s).find((o) => o.kind === "engine");
};

for (const c of cases) {
  test(`${c.supplier}: ${c.why}`, () => {
    const e = engineOf(c);
    assert.ok(e, "the row gives an engine");
    assert.equal(e.model, c.engine);
    assert.deepEqual(e.power, c.power);
    if ("fuel" in c) assert.equal((e.specs.find((x) => x.key === "fuel") || {}).value ?? null, c.fuel);
  });
}

test("strict pairing: two cells are a kVA / kW pair only at power factor 0.8, never with one unit written twice", () => {
  assert.deepEqual(C.powersIn(["550", "727"], "", true), null); // two weights (frs-shenyang)
  assert.deepEqual(C.powersIn(["30KVA", "35KVA"], "", true), null);
  assert.deepEqual(C.powersIn(["25", "20"], "", true), { rated: { kVA: 25, kW: 20 } });
  assert.deepEqual(C.powersIn(["25kVA", "31.25kW"], "", true), { rated: { kVA: 31.25, kW: 25 } });
});
