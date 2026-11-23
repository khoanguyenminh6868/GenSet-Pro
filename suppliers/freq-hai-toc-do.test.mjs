// node --test suppliers/*.test.mjs — tiêu đề nêu cả hai tốc độ "1500/1800 RPM" không cho tần số nào (baifa n104, 23/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const freqOf = (last) => {
  const header = `| Model | Prime kVA | Prime kW | Engine | Alternator | ${last}`;
  const s = { id: "x", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [header], rows: ["| a-1 | 198 | 159 | 1206J-E70TTAG3 | UCI274H1 | ●"] }] };
  return C.fromSupplier(s).find((r) => r.kind === "engine").freq;
};

test("tiêu đề ghi cả hai tốc độ: không có tần số", () => {
  assert.equal(freqOf("1500/1800 RPM SWITCHABLE"), null);
  assert.equal(freqOf("1800 / 1500 rpm"), null);
  assert.equal(freqOf("1500/1800 r/min"), null);
});

test("tiêu đề ghi một tốc độ hoặc một tần số vẫn đọc như cũ", () => {
  assert.equal(freqOf("1800 RPM"), 60);
  assert.equal(freqOf("1500 rpm"), 50);
  assert.equal(freqOf("60Hz"), 60);
  assert.equal(freqOf("1500/1800 RPM 50Hz"), 50);
});
