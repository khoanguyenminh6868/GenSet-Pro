// node --test suppliers/*.test.mjs — candidates(): cột tốc độ của chính dòng là tần số của dòng (6M31G660/6, 1800 v/p).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, hzOfRow } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Genset Model | Rated speed (rpm) | Prime Power (kVA/kW) | Engine Model | Alternator |";
const sup = (id, rows, header = H) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [header], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, text) => candidates(C.build(list), { value: 700, unit: "kVA" }, free(text), { suppliers: list });

test("hzOfRow: chỉ đọc cột tốc độ có tiêu đề, ô đúng 1500 / 1800", () => {
  const row = (line, header = H) => ({ line, header: [header] });
  assert.equal(hzOfRow(row("| W1 | 1800 | 825/660 | 6M31G660/6 | S5 |")), 60);
  assert.equal(hzOfRow(row("| W1 | 1500 | 825/660 | 6M31G825/5 | S5 |")), 50);
  assert.equal(hzOfRow(row("| W1 | 1500/1800 | 825/660 | X | S5 |")), null);
  assert.equal(hzOfRow(row("| W1 | 1800 | 825 | X | S5 |", "| Model | Weight | kVA | Engine | Alternator |")), null);
  assert.equal(hzOfRow(row("| W1 | 600/1800 | 825 | X | S5 |", "| Model | Power/Speed (kWm/rpm) | kVA | Engine | Alternator |")), null);
  assert.equal(hzOfRow({ freq: 50, line: "| W1 | 1800 | 825/660 | X | S5 |", header: [H] }), 50);
});
test("gói 50 Hz: dòng 1800 v/p bị loại; dòng 1500 v/p ở lại; gói không nêu tần số không lọc", () => {
  const list = [sup("sau", ["| W1 | 1800 | 750/600 | 6M31G660/6 | S5L1D-H41 |"]), sup("nam", ["| W2 | 1500 | 750/600 | 6M31G825/5 | S5L1D-H41 |"])];
  const r = run(list, "Tần số 50 Hz");
  assert.deepEqual(r.top.map((x) => x.u.supplierId), ["nam"]);
  assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["sau", ["freq"]]]);
  assert.equal(run(list, "Điện áp 380 V").top.length, 2);
});
test("dòng không ghi tốc độ của động cơ chỉ có dòng 1800 v/p (từ hai dòng) bị loại ở gói 50 Hz", () => {
  const H2 = "| Genset Model | Prime Power (kVA/kW) | Engine Model | Alternator |";
  const list = [sup("a", ["| W1 | 1800 | 750/600 | 6M31G660/6 | S5L1D-H41 |"]), sup("b", ["| W3 | 1800 | 750/600 | 6M31G660/6 | S5L1D-H41 |"]), sup("c", ["| B8 | 750/600 | 6M31G660/6 | S5L1D-H41 |"], H2)];
  assert.deepEqual(run(list, "Tần số 50 Hz").dropped.map((d) => d.u.supplierId).sort(), ["a", "b", "c"]);
});
