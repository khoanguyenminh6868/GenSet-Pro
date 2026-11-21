// node --test suppliers/*.test.mjs — candidates(): Doosan / Hyundai là một nhóm hãng khi đếm trần mỗi hãng (thu-tu-hang, 2026-11-21).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Make | Alternator | No. of Cylinder |";
const sup = (id, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });

test("trần 1 mỗi hãng: động cơ ghi Hyundai và động cơ ghi Doosan chung một chỗ", () => {
  const l = [
    sup("s1", ["| a-1 | 750 | 600 | P222LE | Hyundai | S5L1D-H41 | 12 |"]),
    sup("s2", ["| b-1 | 750 | 600 | P158LE | Doosan | S5L1D-H41 | 8 |"]),
    sup("s3", ["| c-1 | 750 | 600 | QSK23-G2 | Cummins | S5L1D-H41 | 6 |"]),
  ];
  const r = candidates(C.build(l), { value: 700, unit: "kVA" }, free("50 Hz"), { suppliers: l, makeCap: 1, max: 2 });
  assert.equal(r.top.length, 2);
  const makes = r.top.map((x) => x.e.make);
  assert.equal(makes.filter((m) => /Doosan|Hyundai/.test(m || "")).length, 1, JSON.stringify(makes));
  assert.ok(makes.includes("Cummins"), JSON.stringify(makes));
});
