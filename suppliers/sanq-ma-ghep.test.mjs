// node --test suppliers/sanq-ma-ghep.test.mjs — sanq-power n111 / n117 (Khoa 21/11/2026 "A"): ô "TAD1650GE(1345GE)" là một ô ghi hai mã:
// dòng không cho bản ghi động cơ, vẫn giữ bản ghi đầu phát. Dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const HEADER = ["| Genset Model | Standby Power | Prime Power | Engine Model | C/O Of Engine | Alternator Model | Fuel Cons-umption | Genset Weight (KG) | Genset Overall L×W×H(MM) | Click for detail data",
  "| Kw/Kva | Kw/Kva | Volvo | Stamford | g/Kwh | Open Type | Silent Type | Open Type | Silent Type"];
const ROW = "| SQV500 | 400/500 | 360/450 | TAD1650GE(1345GE) | Sweden | HCI544C | 196 | 3300 | 4405 | 3205×1115×1850 | 4230×1460×2150 |";
const read = (id, n, rows, notes = []) => C.fromSupplier({ id, country: "CN", confidence: "high", role: "genset_oem",
  specTables: [{ n, title: "Powered by Volvo penta", header: HEADER, rows }] }, notes);

for (const n of [111, 117]) test(`sanq n${n}: không bản ghi động cơ, giữ đầu phát, có note`, () => {
  const notes = [], r = read("sanq-power", n, [ROW], notes);
  assert.deepEqual(r.map((x) => x.kind), ["alternator"]);
  assert.equal(r[0].model, "HCI544C");
  assert.equal(r[0].other, "TAD1650GE(1345GE)");
  assert.equal(r[0].genset, "SQV500");
  assert.ok(notes.some((x) => x.reason === "một ô ghi hai mã" && x.detail === "TAD1650GE(1345GE)"));
});

test("danh sách tường minh: bảng khác của sanq và NCC khác đọc như cũ", () => {
  for (const [id, n] of [["sanq-power", 110], ["bdadl-shanghai", 111]])
    assert.ok(read(id, n, [ROW]).some((x) => x.kind === "engine" && x.model === "TAD1650GE(1345GE)"), `${id} n${n}`);
});

test("sanq n111: ô một mã vẫn là động cơ", () => {
  const r = read("sanq-power", 111, [ROW.replace("TAD1650GE(1345GE)", "TAD1650GE")]);
  assert.deepEqual(r.map((x) => [x.kind, x.model]), [["engine", "TAD1650GE"], ["alternator", "HCI544C"]]);
});
