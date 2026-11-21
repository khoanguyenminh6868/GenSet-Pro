// node --test suppliers/tach-mu-muon-so.test.mjs — luật đã duyệt tach-mu-2 (Khoa 21/11/2026 chọn M): catalog tách "X" / "X^",
// luật loại của `candidates` mượn số giữa hai khoá. Mọi ca đọc hồ sơ thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { candidates, hintsOf, modelFacts } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const dir = new URL("./cn/", import.meta.url);
// Chỉ NCC có ghi các mã của test (nạp cả cn/ mất vài phút).
const list = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => fs.readFileSync(new URL(f, dir), "utf8")).filter((t) => /6M31G1000\/5|20M33G4D3\/5|8M33D1012E311|8M33G900\/6/.test(t)).map((t) => JSON.parse(t)).filter((d) => d.status !== "incomplete");
const cat = C.build(list), facts = modelFacts(cat, list);
const base = { ...hintsOf("Chương V. Yêu cầu kỹ thuật\nMáy phát điện diesel"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [], fuel: null, freq: null };

// Xét một dòng của NCC (không ghi tần số) ở cỡ công suất của chính dòng đó.
function judge(key, supplierId, extra) {
  const e = cat.engines.find((x) => x.key === key);
  assert.ok(e, key);
  const u = e.uses.find((x) => x.supplierId === supplierId && !x.freq && Object.keys(x.power || {}).length);
  assert.ok(u, `${key} ${supplierId}`);
  const p = Object.values(u.power)[0], unit = p.kVA != null ? "kVA" : "kW";
  const R = candidates(cat, { value: p[unit], unit }, { ...base, ...extra }, { suppliers: list, facts, focus: new Set([key]) });
  const same = (x) => x.u === u;
  return { out: R.dropped.find(same), kept: R.all.find(same) };
}

test("6M31G1000/5 trơn mượn 6 xi lanh và 149×177 (18,52 L) của khoá ^", () => {
  assert.deepEqual(judge("6M31G1000/5", "agg-fuzhou", { minCyl: 12 }).out.ruled, ["cyl"]);
  assert.deepEqual(judge("6M31G1000/5", "agg-fuzhou", { minDisp: 21.927 }).out.ruled, ["disp"]);
  assert.ok(judge("6M31G1000/5", "agg-fuzhou", { minCyl: 6, minDisp: 18.5 }).kept);
});

test("20M33G4D3/5^ mượn 20 xi lanh của khoá trơn", () => {
  assert.deepEqual(judge("20M33G4D3/5^", "baifa-power", { minCyl: 16, cylExact: true }).out.ruled, ["cyl"]);
  assert.ok(judge("20M33G4D3/5^", "baifa-power", { minCyl: 20, cylExact: true }).kept);
});

test("8M33D1012E311: khoá có số riêng giữ số riêng, không bị 12V / 31,8 của aosif kéo lại", () => {
  assert.deepEqual(judge("8M33D1012E311", "kaihua-genset", { minDisp: 30 }).out.ruled, ["disp"]);
  assert.deepEqual(judge("8M33D1012E311", "kaihua-genset", { minCyl: 12 }).out.ruled, ["cyl"]);
});

test("tần số tính trên dòng của cả hai khoá", () => {
  assert.deepEqual(judge("8M33G900/6", "koten-power", { freq: 50 }).out.ruled, ["freq"]);
  assert.ok(judge("8M33D1012E311", "kaihua-genset", { freq: 50 }).kept, "dòng 50 Hz của khoá ^ giữ mã khỏi luật tần số, như main");
});
