// node --test suppliers/*.test.mjs — ĐO THỬ (nhánh thu-tu-ly-do): hoà điểm thì NCC hồ sơ `verified` trước `partial`.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | No. of Cylinder |";
const sup = (id, status) => ({ id, status, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows: ["| m-1 | 750 | 600 | QSK23-G2 | S5L1D-H41 | 6 |"] }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list) => candidates(C.build(list), { value: 700, unit: "kVA" }, free("Số xi lanh: ≥ 6\n50 Hz"), { suppliers: list });

test("hoà điểm: hồ sơ verified trước partial, bất kể tên và thứ tự danh sách", () => {
  const list = [sup("a-partial", "partial"), sup("b-partial", "partial"), sup("z-verified", "verified"), sup("y-verified", "verified")];
  for (const l of [list, [...list].reverse()]) {
    const r = run(l);
    assert.equal(new Set(r.all.map((x) => x.score)).size, 1);
    const st = r.all.map((x) => (x.u.supplierId.endsWith("verified") ? "v" : "p")).join("");
    assert.equal(st, "vvpp");
  }
});
