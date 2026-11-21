// node --test suppliers/*.test.mjs — đầu phát FG Wilson và ô ghi HAI hãng đầu phát kèm model riêng (catalog-fg-wilson, Khoa 19/11/2026).
// Dòng thật: genlitec n122 / n1013, generatordieselchina n114 / n101 (suppliers/cn).
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const recs = (s, kind) => C.fromSupplier(s, []).filter((r) => r.kind === kind);
const names = (r) => (r.makes || []).map((m) => m.name);

// genlitec n122: "| Alternator | FG Wilson FGL70030" (hãng + model trong một ô).
const gen122 = sup("genlitec", [{ n: 122, title: "P900-1 FG Wilson 900kVA Diesel Generator", header: [], rows: [
  "| Model | FG Wilson P900-1", "| Frequency | 50Hz", "| Prime Power | 800kVA / 640kW", "| Standby Power | 892kVA / 713.6kW",
  "| Voltage | 380/400/415V", "| Phase | 3-Phase, 4-Wire", "| Power Factor | 0.8", "| Engine | Perkins 4006-23TAG3A",
  "| Alternator | FG Wilson FGL70030", "| Fuel Tank Capacity | 1494 Litres", "| Engine Model | Perkins 4006-23TAG3A",
  "| Bore x Stroke | 160 x 190mm", "| Displacement | 22.9L", "| Starting Voltage | 24V DC", "| Alternator Model | FG Wilson FGL70030"] }]);
// genlitec n1013: ô hãng riêng "| Alternator Make | FG Wilson", ô model "| Alternator Model: | FGL70030".
const gen1013 = sup("genlitec", [{ n: 1013, title: "Datasheet: Download as PDF", header: [], rows: [
  "| Engine Make | Perkins", "| Engine Model: | 4006-23TAG3A", "| Alternator Make | FG Wilson", "| Alternator Model: | FGL70030", "| Control Panel: | DSE7410",
  "| Frequency: | 50 HZ | 60 HZ", "| Engine Speed: RPM | rpm | 1500", "| Fuel Tank Capacity: | litres (US gal) | 1494 (394.67)"] }]);
// generatordieselchina n114 / n101: "| Alternator | Stamford X / Leroy-Somer Y".
const gdc = (n, genset, eng, alt) => sup("generatordieselchina", [{ n, title: "Diesel Generator | Factory Direct", header: [], rows: [
  `Model: ${genset} · 50Hz (1500 rpm)`, "| Standby Power | 176 kW / 220 kVA", "| Prime Power | 160 kW / 200 kVA", `| Engine Model | ${eng}`, `| Alternator | ${alt}`, "| Frequency | 50Hz (1500 rpm)"] }]);

test("FG Wilson: ô đầu phát 'FG Wilson FGL70030' cho bản ghi đầu phát FGL70030, hãng FG Wilson", () => {
  const a = recs(gen122, "alternator");
  assert.equal(a.length, 1);
  assert.equal(a[0].model, "FGL70030");
  assert.deepEqual(names(a[0]), ["FG Wilson"]);
  // ô của bản ghi động cơ vẫn là chữ nguồn
  assert.equal(recs(gen122, "engine")[0].other, "FG Wilson FGL70030");
});
test("FG Wilson: ô hãng riêng 'Alternator Make | FG Wilson' gắn hãng cho đầu phát FGL70030", () => {
  const a = recs(gen1013, "alternator");
  assert.equal(a.length, 1);
  assert.equal(a[0].model, "FGL70030");
  assert.deepEqual(names(a[0]), ["FG Wilson"]);
});
test("FG Wilson chỉ đọc ở ô của đầu phát: tên trang / dòng có 'FG Wilson' không gán hãng cho đầu phát không ghi hãng", () => {
  const s = sup("x", [{ n: 1, title: "P900-1 FG Wilson 900kVA Diesel Generator", header: [], rows: [
    "| Model | FG Wilson P900-1", "| Prime Power | 800kVA / 640kW", "| Engine | Perkins 4006-23TAG3A", "| Alternator | S5L1D-C41"] }]);
  const a = recs(s, "alternator");
  assert.equal(a.length, 1);
  assert.deepEqual(names(a[0]), []);
});
test("hai hãng: mỗi model gắn đúng hãng đứng cạnh nó (generatordieselchina n114)", () => {
  const a = recs(gdc(114, "R-DC200D5/S", "6CTAA8.3-G2", "Stamford UCI274H / Leroy-Somer TAL-A44-M"), "alternator");
  assert.deepEqual(a.map((r) => [r.model, names(r)]), [["UCI274H", ["Stamford"]], ["TAL-A44-M", ["Leroy-Somer"]]]);
  // bản ghi động cơ vẫn mang nguyên ô (không gộp)
  assert.equal(recs(gdc(114, "R-DC200D5/S", "6CTAA8.3-G2", "Stamford UCI274H / Leroy-Somer TAL-A44-M"), "engine")[0].other, "Stamford UCI274H / Leroy-Somer TAL-A44-M");
});
test("hai hãng: model Leroy-Somer có dấu cách ('LSA 52.3 L12', n101) đọc nguyên văn, đúng hãng", () => {
  const a = recs(gdc(101, "R-MYC2500D5/S", "20V4000G23F", "Stamford S7L1D-J4 / Leroy-Somer LSA 52.3 L12"), "alternator");
  assert.deepEqual(a.map((r) => [r.model, names(r)]), [["S7L1D-J4", ["Stamford"]], ["LSA 52.3 L12", ["Leroy-Somer"]]]);
});
test("không đoán: danh sách hãng không kèm model, hay hai mã không hãng thì KHÔNG tách", () => {
  // "Leroy Somer TAL-A44-M / TAL-A46-C" (một hãng viết một lần trước hai model, saudi-diesel): từ catalog-b (Khoa 19/11/2026)
  // mỗi model một bản ghi Leroy-Somer, test ở suppliers/catalog-b.test.mjs
  assert.deepEqual(recs(gdc(114, "R-X", "6CTAA8.3-G2", "Leroy Somer TAL-A44-M / TAL-A46-C"), "alternator").map((r) => [r.model, names(r)]),
    [["TAL-A44-M", ["Leroy-Somer"]], ["TAL-A46-C", ["Leroy-Somer"]]]);
  assert.equal(recs(gdc(114, "R-X", "6CTAA8.3-G2", "Stamford, Marathon, Leroy Somer"), "alternator").length, 0);
  // hai mã không hãng: không tách, không gắn hãng (ô bảng ngang như cũ; ô bảng nhãn từ catalog-b không cho bản ghi)
  const two = recs(gdc(114, "R-X", "6CTAA8.3-G2", "S5L1D-C41 / S5L1D-F41"), "alternator");
  assert.ok(two.length <= 1 && two.every((r) => names(r).length === 0));
});
