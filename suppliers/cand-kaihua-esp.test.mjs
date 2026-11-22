// node --test suppliers/*.test.mjs — tên model kaihua đuôi "-60" và mã Baudouin "^" (Khoa 22/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, hzOfName, isEspCode } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Genset Model | Prime Power (kVA/kW) | Engine Model | Alternator |";
const sup = (id, rows, header = H) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [header], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, text, cap = { value: 700, unit: "kVA" }) => candidates(C.build(list), cap, free(text), { suppliers: list });

test("hzOfName: chỉ kaihua-genset, chỉ HC-BD… đuôi -60", () => {
  const k = (line, supplierId = "kaihua-genset") => hzOfName({ supplierId, line });
  assert.equal(k("| HC-BD1500-60 | 1500 | 12M33D1320E201 |"), 60);
  assert.equal(k("| HC-BD 2060-60 | 2060 | 16M33G1650/6 |"), 60);
  assert.equal(k("| HC-BD1500 | 1500 | 12M33D1320E201 |"), null);
  assert.equal(k("| HC-34GF-60 | 34 | 1103A-33G |"), null);
  assert.equal(k("| HC-BD1500-60 | 1500 | 12M33D1320E201 |", "other"), null);
});
test("gói 50 Hz: dòng kaihua -60 bị loại, dòng NCC khác cùng động cơ ở lại", () => {
  const list = [sup("kaihua-genset", ["| HC-BD750-60 | 750/600 | 6M31G825/5 | S5L1D-H41 |"]), sup("khac", ["| W2 | 750/600 | 6M31G825/5 | S5L1D-H41 |"])];
  const r = run(list, "Tần số 50 Hz");
  assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["kaihua-genset", ["freq"]]]);
  assert.deepEqual(r.top.map((x) => x.u.supplierId), ["khac"]);
  assert.equal(run(list, "Tần số 60 Hz").dropped.some((d) => d.u.supplierId === "kaihua-genset"), false);
});
test("isEspCode: chỉ mã Baudouin dạng số + M, có ^ ở cuối", () => {
  assert.equal(isEspCode({ key: "12M33G1320/5^" }), true);
  assert.equal(isEspCode({ key: "12M33G1320/5" }), false);
  assert.equal(isEspCode({ key: "WP13D385E201^" }), false);
});
test("mã ^: gói prime loại với lý do esp, gói ghi cỡ dự phòng giữ", () => {
  const list = [sup("a", ["| B1 | 750/600 | 6M33G660/5^ | S5L1D-H41 |"]), sup("b", ["| B2 | 750/600 | 6M33G660/5 | S5L1D-H41 |"])];
  const prime = run(list, "Điện áp 380 V");
  assert.deepEqual(prime.dropped.map((d) => [d.u.supplierId, d.ruled]), [["a", ["esp"]]]);
  assert.deepEqual(prime.top.map((x) => x.u.supplierId), ["b"]);
  const standby = run(list, "Điện áp 380 V", { value: 700, unit: "kVA", rating: "standby" });
  assert.equal(standby.dropped.some((d) => d.ruled.includes("esp")), false);
});
