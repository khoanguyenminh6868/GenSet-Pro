// node --test suppliers/*.test.mjs — candidates(): a row with no fuel figure of its own takes the engine maker's sheet (L/h at a
// stated load), as fuelChecks grades it (điều phối 22/11/2026, Khoa "có làm đi"). Real sheet: Baudouin 6M31G825/5 [1021], 156 / 113 / 77 L/h.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { candidates, hintsOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const baudouin = JSON.parse(fs.readFileSync(new URL("./cn/baudouin.json", import.meta.url), "utf8"));
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Fuel consumption 100% load (L/h) | Fuel consumption 75% load (L/h) |";
const sup = (id, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets 50Hz", header: [H], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, text) => candidates(C.build(list), { value: 825, unit: "kVA" }, free(text), { suppliers: list });
const none = sup("none", ["| n-1 | 825 | 660 | 6M31G825/5 | S5L1D-H41 | | |"]);
const of = (list, id) => list.find((x) => x.u.supplierId === id);

test("dòng không có số, tờ hãng vượt ngưỡng: loại như số của dòng", () => {
  const r = run([baudouin, none], "Tiêu hao nhiên liệu ở 100% tải ≤ 150 L/h\n50 Hz"), x = of(r.dropped, "none");
  assert.ok(x, "dòng phải bị loại");
  assert.deepEqual(x.ruled, ["fuel"]);
  assert.ok(!of(r.all, "none"));
});

test("đúng mức tải: 75% so với 113, không so với 156", () => {
  assert.ok(of(run([baudouin, none], "Tiêu hao nhiên liệu ở 75% tải ≤ 110 L/h\n50 Hz").dropped, "none")?.ruled.includes("fuel75"));
  assert.ok(!of(run([baudouin, none], "Tiêu hao nhiên liệu ở 75% tải ≤ 120 L/h\n50 Hz").dropped, "none"));
});

test("tờ hãng bằng đúng ngưỡng: giữ dòng, không cộng điểm", () => {
  const a = of(run([baudouin, none], "Tiêu hao nhiên liệu ở 100% tải ≤ 156 L/h\n50 Hz").all, "none"), b = of(run([baudouin, none], "Điện áp 400 V\n50 Hz").all, "none");
  assert.ok(a && b);
  assert.equal(a.score, b.score);
  assert.ok(!a.fuelOver);
});

test("dòng tự ghi số thì theo số của dòng, không theo tờ hãng", () => {
  const low = sup("low", ["| l-1 | 825 | 660 | 6M31G825/5 | S5L1D-H41 | 140 | 105 |"]), high = sup("high", ["| h-1 | 825 | 660 | 6M31G825/5 | S5L1D-H41 | 170 | 125 |"]);
  const r = run([baudouin, low, high], "Tiêu hao nhiên liệu ở 100% tải ≤ 150 L/h\n50 Hz");
  assert.ok(of(r.all, "low"), "dòng 140 L/h ở lại dù tờ hãng 156");
  assert.deepEqual(of(r.dropped, "high")?.ruled, ["fuel"]);
  const r2 = run([baudouin, high], "Tiêu hao nhiên liệu ở 100% tải ≤ 160 L/h\n50 Hz");
  assert.ok(of(r2.dropped, "high"), "dòng 170 L/h bị loại dù tờ hãng 156 đạt");
});

test("tắt chuẩn hoá tiêu hao: không dùng tờ hãng", () => {
  const was = process.env.GENBID_SPEC_NORM;
  process.env.GENBID_SPEC_NORM = "0";
  try { assert.ok(!of(run([baudouin, none], "Tiêu hao nhiên liệu ở 100% tải ≤ 150 L/h\n50 Hz").dropped, "none")); }
  finally { if (was === undefined) delete process.env.GENBID_SPEC_NORM; else process.env.GENBID_SPEC_NORM = was; }
});
