// node --test suppliers/engine-traits-config.test.mjs — Đặc thù hãng động cơ, chặng 2: Khoa's rules (1)–(5) of 18/11/2026
// in Gợi ý cấu hình. Written before config-bot.mjs is wired (PR 2): every test is `todo` until then, so it runs and shows
// its result without failing CI. PR 2 removes the `todo` of each rule it wires; the names (hints.trait, result.engineTrait,
// variantFamily, cap in check) are the design of genbid-work\dieu-phoi\nghiem-thu\dac-thu-dong-co-2.md.
import test from "node:test";
import assert from "node:assert/strict";
import * as CB from "./config-bot.mjs";

const C = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const TODO = { todo: "PR 2 (config-bot.mjs chưa nối)" };
// thật: IB2500416364, Chương V (khoảng trắng rút gọn)
const ETVCS = ["II Yêu cầu đối với động cơ", "3. Loại động cơ 4 kỳ làm mát bằng nước Đạt Không đạt", "Xoáy ba hướng (E-TVCS) giúp hòa trộn",
  "4. Kiểu buồng đốt nhiên liệu với không khí tốt hơn, cải thiện Đạt Không đạt", "5. Kiểu phun nhiên liệu Gián tiếp (IDI) Đạt Không đạt", "Tần số 50 Hz"].join("\n");
const H = "| Model | Prime kVA | Prime kW | Engine |";
const tab = (id, mk, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: `${mk} gensets 50Hz`, header: [H], rows }] });
const cap = { value: 10, unit: "kVA" };
const list = () => [
  tab("k1", "Kubota", ["| K-13 | 11 | 8.8 | V1505 |", "| K-11 | 10.5 | 8.4 | D1105 |"]),
  tab("p1", "Perkins", ["| P-11 | 11 | 8.8 | 403A-11G1 |"]),
  tab("y1", "Yanmar", ["| Y-11 | 11 | 8.8 | 3TNV76 |"]),
  tab("c1", "Caterpillar", ["| C-11 | 11 | 8.8 | C1.1 |"]),
];
const makeOf = (r) => (r.e.make || "?").split(" / ")[0];

test("(1) hintsOf reads the engine term of the HSMT: Kubota", TODO, () => {
  const h = CB.hintsOf(ETVCS);
  assert.equal(h.trait?.engineMake, "Kubota");
});

test("(1) candidates: only rows of that make; the others are ruled out with the term as reason", TODO, () => {
  const L = list(), r = CB.candidates(C.build(L), cap, CB.hintsOf(ETVCS), { suppliers: L, patches: false });
  assert.ok(r.top.length >= 2);
  assert.deepEqual([...new Set(r.top.map(makeOf))], ["Kubota"]);
  assert.ok(r.dropped.some((d) => d.ruled.includes("trait")));
});

test("(1) rankConfigs: no ceiling of configurations for the make of the term (IB2600612866: 4 Kubota written, 2 kept)", TODO, () => {
  const k = (model) => ({ engine: { model, make: "Kubota" }, checks: [], suppliers: [] });
  const res = { engineTrait: { make: "Kubota" }, requirements: [], configs: [k("D1105"), k("V1505"), k("V2203"), k("Z482")] };
  assert.equal(CB.rankConfigs(res).configs.length, 4);
  // without the term the ceiling of 2 per make stays
  assert.equal(CB.rankConfigs({ requirements: [], configs: [k("D1105"), k("V1505"), k("V2203"), k("Z482")] }).configs.length, 2);
});

test("(2) a configuration from the internet outside 100–140% of the size is dropped (Denyo 13 kVA for 8.5 kVA)", TODO, () => {
  assert.equal(typeof CB.webPowerOf, "function", "PR 2: công suất của cấu hình internet đọc từ trang đã lưu");
  const c = { genset: { model: "DCA-15LSX", src: { kind: "internet", file: "web/1.txt", quote: "Prime Power 13 kVA" } }, checks: [] };
  const p = CB.webPowerOf(c, () => "URL: https://x\nAccessed: 2026-11-18\n\nDCA-15LSX Prime Power 13 kVA");
  assert.equal(p.kVA, 13);
  const b = CB.bandOf({ value: 8.5, unit: "kVA" });
  assert.ok(p.kVA > 8.5 * b.high);
});

test("(3) variants of one engine: one family (D1105 / D1105-BG / D1105-E2BG-CHN-1/8.4KW)", TODO, () => {
  for (const m of ["D1105", "D1105-BG", "D1105-E2BG", "D1105-E2BG-CHN", "D1105-E2BG-CHN-1", "D1105-E2BG-CHN-1/8.4KW"]) assert.equal(CB.variantFamily(m), "D1105", m);
  assert.notEqual(CB.variantFamily("V1505-E2BG"), CB.variantFamily("D1105-E2BG"));
});

test("(3) same figures → one configuration; different → only the one that meets the HSMT", TODO, () => {
  const pw = (status) => ({ item: "Công suất động cơ", part: "engine", status, byCode: true });
  const same = { requirements: [], configs: [{ engine: { model: "D1105-BG", make: "Kubota" }, checks: [pw("met")], suppliers: [] }, { engine: { model: "D1105-E2BG", make: "Kubota" }, checks: [pw("met")], suppliers: [] }] };
  assert.equal(CB.rankConfigs(same).configs.length, 1);
  const diff = { requirements: [], configs: [{ engine: { model: "D1105-E2BG-CHN-1", make: "Kubota" }, checks: [pw("not_met")], suppliers: [] }, { engine: { model: "D1105-BG", make: "Kubota" }, checks: [pw("met")], suppliers: [] }] };
  assert.deepEqual(CB.rankConfigs(diff).configs.map((c) => c.engine.model), ["D1105-BG"]);
});

test("(4) Đồng bộ thương hiệu asks only the parts the HSMT names (IB2600612866, thật: analysis quote)", TODO, () => {
  const s = BP.brandSyncOf("Máy phát điện chạy dầu diesel bao gồm đồng bộ động cơ thương hiệu G7, đầu phát và vỏ chống ồn đồng bộ cùng một nhãn hiệu, thông tin này có trên website của hãng sản xuất tổ máy.");
  assert.ok(!s || !s.parts.includes("engine"), JSON.stringify(s));
});

test("(4) a clause that names the engine still asks it (IB2600594596 kind)", () => {
  const s = BP.brandSyncOf("- Tổ máy phát điện, đầu phát điện và động cơ có cùng thương hiệu.");
  assert.ok(s && s.parts.includes("engine") && s.parts.includes("alternator"), JSON.stringify(s));
});

test("(5) a controller term names the controller, the engine make is not filtered", TODO, () => {
  const h = CB.hintsOf("III Yêu cầu đối với bộ điều khiển\n+ Tích hợp phần mềm AmpSentry bảo vệ đầu phát (không chấp nhận sử dụng máy cắt đầu cực để bảo vệ).\nTần số 50 Hz");
  assert.deepEqual(h.trait?.controllers?.map((c) => c.term), ["AmpSentry"]);
  assert.equal(h.trait?.engineMake ?? null, null);
  const L = list(), r = CB.candidates(C.build(L), cap, h, { suppliers: L, patches: false });
  assert.ok(new Set(r.top.map(makeOf)).size > 1, "mọi hãng động cơ vẫn còn");
});
