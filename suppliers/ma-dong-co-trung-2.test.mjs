// node --test suppliers/*.test.mjs — ô động cơ ghi hai mã (ma-dong-co-trung PR 2, Khoa 20/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Cylinder | Displacement (L) | Fuel consumption (L/h) |";
const sup = (id, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows }] });
const engines = (rows) => C.fromSupplier(sup("x", rows)).filter((r) => r.kind === "engine");
const spec = (r, k) => (r.specs || []).find((f) => f.key === k)?.value;

test("ô hai mã đủ: mỗi mã một bản ghi, bỏ thông số động cơ, giữ công suất và thông số tổ máy", () => {
  const list = engines(["| a-1 | 750 | 600 | 6M33G8D3/5 (6M33G825/5) | S5L1D-H41 | 6 | 19.6 | 150 |"]);
  assert.deepEqual(list.map((r) => r.model), ["6M33G8D3/5", "6M33G825/5"]);
  for (const r of list) {
    assert.equal(spec(r, "cyl"), undefined);
    assert.equal(spec(r, "disp"), undefined);
    assert.equal(spec(r, "fuel"), "150");
    assert.ok(r.power);
  }
});

test("mã thứ hai viết tắt", () => {
  assert.deepEqual(engines(["| a-1 | 750 | 600 | QSK38-G3/G5 | S5L1D-H41 | 12 | 37.8 | 150 |"]).map((r) => r.model), ["QSK38-G3", "QSK38-G5"]);
  assert.deepEqual(engines(["| a-1 | 750 | 600 | BF8M1015CP-G3/4/5 | S5L1D-H41 | 8 | 15.9 | 150 |"]).map((r) => r.model), ["BF8M1015CP-G3", "BF8M1015CP-G4", "BF8M1015CP-G5"]);
});

test("ngoặc là mã riêng của NCC: giữ mã ngoài ngoặc cùng thông số", () => {
  const [r, ...rest] = engines(["| a-1 | 100 | 80 | 6BT5.9-G2(G75E1) | S5L1D-H41 | 6 | 5.9 | 20 |"]);
  assert.equal(rest.length, 0);
  assert.equal(r.model, "6BT5.9-G2");
  assert.equal(spec(r, "cyl"), "6");
});

test("mã một mã có dấu / và ô chưa có căn cứ: không tách", () => {
  for (const m of ["6M11G150/5", "4M10G2D0/S", "4D24TG2/A", "8300D/M-2", "DE2V1000 (2V92)", "4BTA3.9-G13(40)", "ZS1110/295D"]) {
    assert.equal(engines([`| a-1 | 100 | 80 | ${m} | S5L1D-H41 | 6 | 5.9 | 20 |`]).filter((r) => r.model !== m).length, 0, m);
  }
});
