// node --test suppliers/*.test.mjs — gộp mã viết hai cách (gop-trung-ma, Khoa 24/11/2026; báo cáo trung-ma-28.md).
import test from "node:test";
import assert from "node:assert/strict";
import "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Cylinder | Displacement (L) | Fuel consumption (L/h) |";
const sup = (id, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows }] });
const recs = (rows) => C.fromSupplier(sup("x", rows));
const engineOf = (m) => recs([`| a-1 | 100 | 80 | ${m} | S5L1D-H41 | 6 | 5.9 | 20 |`]).filter((r) => r.kind === "engine").map((r) => r.model);

test("6 nhóm động cơ gộp về mã đối ứng", () => {
  const pairs = [["4BTA3.9-GM4/7", "4BTA3.9-GM47"], ["4HTAA4.3*G34", "4HTAA4.3-G34"], ["KTA19-D(M)", "KTA19-DM"],
    ["KTA38-D(M)", "KTA38-DM"], ["NTA855-D(M)", "NTA855-DM"], ["(YD485D)", "YD485D"]];
  for (const [from, to] of pairs) assert.deepEqual(engineOf(from), [to], from);
});

test("6 mã Cummins (M) Khoa để riêng, NT855-D(M) chưa đủ bằng chứng: giữ nguyên", () => {
  for (const m of ["4BTA3.9-G2(M)", "6BT5.9-G2(M)", "KTA19-G3(M)", "KTA19-G4(M)", "KTA38-G(M)", "NTA855-G2(M)", "NT855-D(M)"]) assert.deepEqual(engineOf(m), [m], m);
});

test("đầu phát ECP 28-M/4C gộp về ECP28 M4C; ECP 28-2S/4C và ECP32-2S/4C giữ nguyên", () => {
  const alt = (m) => recs([`| a-1 | 100 | 80 | 4TNV88 | ${m} | 4 | 2.2 | 20 |`]).filter((r) => r.kind === "alternator").map((r) => r.model);
  assert.deepEqual(alt("ECP 28-M/4C"), ["ECP28 M4C"]);
  assert.deepEqual(alt("ECP 28-2S/4C"), ["ECP 28-2S/4C"]);
  assert.deepEqual(alt("ECP32-2S/4C"), ["ECP32-2S/4C"]);
});
