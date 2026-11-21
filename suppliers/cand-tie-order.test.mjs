// node --test suppliers/*.test.mjs — candidates(): thứ tự cố định giữa các dòng CÙNG ĐIỂM (thu-tu-hang, 2026-11-21).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | No. of Cylinder |";
const sup = (id, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, kva = 700) => candidates(C.build(list), { value: kva, unit: "kVA" }, free("Số xi lanh: ≥ 6\n50 Hz"), { suppliers: list });
const order = (r) => r.top.map((x) => `${x.u.supplierId}|${x.e.key}`);

// Dòng giống hệt nhau ở ba nhà cung cấp: điểm bằng nhau, thứ tự trước đây theo thứ tự duyệt danh mục.
const same = (id) => sup(id, [`| m-1 | 750 | 600 | QSK23-G2 | S5L1D-H41 | 6 |`]);
const list = [same("zeta"), same("alpha"), same("mid")];

test("hoà điểm: đảo thứ tự nhà cung cấp trong danh sách không đổi thứ tự top; điểm bằng nhau thật", () => {
  const r = run(list);
  const scores = new Set(r.top.map((x) => x.score));
  assert.equal(r.top.length, 3);
  assert.equal(scores.size, 1, "ba dòng phải cùng điểm");
  const base = order(r);
  assert.deepEqual(base.map((k) => k.split("|")[0]), ["alpha", "mid", "zeta"]);
  for (const l of [[...list].reverse(), [list[1], list[2], list[0]], [list[2], list[0], list[1]]]) assert.deepEqual(order(run(l)), base);
});

test("điểm không đổi: top vẫn xếp điểm giảm dần", () => {
  const r = run([...list, sup("other", ["| o-1 | 750 | 600 | 6M33G825 | S5L1D-H41 | 6 |"])]);
  for (let i = 1; i < r.top.length; i++) assert.ok(r.top[i - 1].score >= r.top[i].score);
});
