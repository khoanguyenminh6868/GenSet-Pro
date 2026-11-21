// node --test suppliers/*.test.mjs — "thương hiệu G7" khác "xuất xứ G7" (Khoa, 2026-11-11, "làm 1, 2"): originOfHsmt basis,
// brandMakers / groupSuppliers, check() with meta basis, originChecks (CO + genset_origin), rfq.
import test from "node:test";
import assert from "node:assert/strict";
import { originOfHsmt, brandMakers, groupSuppliers, check, rankConfigs } from "./config-bot.mjs";

const b = (t) => originOfHsmt(t)?.basis;

test("basis brand: only the make is named, on every G7 / G20 line of the genset", () => {
  assert.equal(b("4 Thương hiệu Đạt Không đạt\nHàng hóa có thương hiệu thuộc nhóm nước EU; G7 hoặc Việt Nam\n2 Xuất xứ Nhà thầu cung cấp thông tin"), "brand");
  assert.equal(b("7\nHãng sản xuất EU/G7"), "brand");
  assert.equal(b("1\nThương hiệu\nG7"), "brand");
  // The row above is another row, not this cell's label (IB2600603983 table).
  assert.equal(b("1 Nước sản xuất Nêu cụ thể\n2 Nhà sản xuất/ nhãn hiệu Nhóm các nước khối G7,\nEU"), "brand");
});

test("basis origin: any line about where it is made, an unclear line, OCR slips, a wider origin rule", () => {
  assert.equal(b("2 Xuất xứ tổ máy: G7"), "origin");
  assert.equal(b("- Thương hiệu và xuất xứ: G7"), "origin");
  assert.equal(b("- Tổ máy có nhãn hiệu và xuất xứ thuộc các nước G7/Châu Âu"), "origin");
  assert.equal(b("Động cơ, đầu phát, do các hãng thuộc các nước G7 sản xuất và lắp ráp"), "origin");
  assert.equal(b("1. Nhà sản xuất - Nhà thầu đề xuất\nSán xuất tại các nước EU, G7"), "origin");
  // OCR (IB2200043247, "Thucmg hiu và xut xü"): never read as brand.
  assert.notEqual(b("- Thucmg hiu và xut xü:\nCác nước thuộc nhóm\nEU,G7"), "brand");
  assert.equal(b("2 Hang san xuAt Các nước thuộc nhóm\n- Thucmg hiu và xut xü: Các nước\nEU,G7 Bắt buộc"), "origin");
  // One brand line beside one origin line (IB2400503492): origin.
  assert.equal(b("Thương hiệu: G7\n3 Xuất xứ Hãng sản xuất thuộc các nước G7 hoặc Việt Nam"), "origin");
  // A wider origin rule still counts (IB2400349459: a set made in China fails G7/EU/ASEAN).
  assert.equal(b("2 Thương hiệu G7/EU\n3 Xuất xứ Nhập khẩu đồng bộ từ các nước\nG7/EU/Asean"), "origin");
  // A line that names neither: origin.
  assert.equal(b("2.2 Thương hiệu G20, G7, EU\nB Thông số động cơ\n1 Động cơ EU, G7 hoặc G20"), "origin");
  // An example is not a rule and does not count either way.
  assert.equal(b("Ví dụ về nhóm nước: nhóm các nền kinh tế lớn G20, G8, G7...\nthì sẽ bị loại.\nChương V\nII Yêu cầu đối với tổ máy\n1 Thương hiệu thuộc các hãng EU hoặc G7"), "brand");
  // G7 asked of the parts only (#509 scope "parts"): basis is not used.
  assert.equal(b("- Động cơ : thương hiệu nhóm G7"), "origin");
  assert.equal(originOfHsmt("- Động cơ : thương hiệu nhóm G7").scope, "parts");
});

// Suppliers: Caterpillar (US), its Tianjin plant (CN, linked), a Chinese company named after Baudouin (no link), an
// assembler (CN), a UK maker.
const list = [
  { id: "caterpillar", role: "genset_oem", country: "US", names: { en: "Caterpillar" } },
  { id: "cat-tianjin", role: "genset_oem", country: "CN", names: { en: null, brands: ["FG Wilson", "Cat"] }, relatedIds: ["caterpillar", "fg-wilson"] },
  { id: "bdadl-shanghai", role: "genset_oem", country: "CN", names: { en: "Shanghai Baudouin Power Technology Co., Ltd." } },
  { id: "baudouin", role: "engine_maker", country: "FR", names: { en: "Société Internationale des Moteurs Baudouin" } },
  { id: "asm", role: "genset_oem", country: "CN", names: { en: "Fujian Assembler Power" }, relatedIds: ["caterpillar"] },
];

test("brandMakers: the brand's own plant outside the group (linked), not an assembler named after a foreign make", () => {
  assert.deepEqual(brandMakers(list, "g7"), ["cat-tianjin"]);
  assert.deepEqual([...groupSuppliers(list, "g7", false, false, true)].sort(), ["baudouin", "cat-tianjin", "caterpillar"]);
  assert.deepEqual([...groupSuppliers(list, "g7", false, false, false)].sort(), ["baudouin", "caterpillar"]);
  // Scope parts (#509) is unchanged: the suppliers in China.
  assert.deepEqual([...groupSuppliers(list, "g7", false, true, true)].sort(), ["asm", "bdadl-shanghai", "cat-tianjin"]);
});

const line = "| C500 | 500/400 | 450/360 | 2506C-E15TAG1 | HCI544C";
const table = { n: 101, title: "Perkins gensets", header: ["| Model | Standby kVA/kW | Prime kVA/kW | Engine | Alternator"], rows: [line] };
const sups = [list[0], { ...list[0], id: "uk", country: "GB", names: { en: "UK Maker" }, specTables: [table] }, { ...list[1], specTables: [table] }, { ...list[4], specTables: [table] }];
const hsmt = "Chương V\nCông suất liên tục (Prime): ≥ 450 kVA\n2 Xuất xứ tổ máy: G7";
const of = (id) => {
  const src = { kind: "catalog", supplierId: id, n: 101, line };
  return { requirements: [{ item: "Xuất xứ tổ máy", code: "genset_origin", requirement: "G7", quote: "2 Xuất xứ tổ máy: G7", part: "genset", level: "core" }],
    configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src }, alternator: { model: "HCI544C", src }, genset: { model: "C500", src }, suppliers: [{ supplierId: id, n: 101, line }],
      checks: [{ item: "Xuất xứ tổ máy", part: "genset", status: "unclear" }] }] };
};

test("check(): brand keeps the brand's plant; origin and a group chosen on the web drop it", () => {
  const run = (id, basis) => check(of(id), { hsmtText: hsmt, suppliers: sups, readWeb: () => null, origin: "g7", basis }).result;
  const br = run("cat-tianjin", "brand");
  assert.equal(br.configs.length, 1); assert.equal(br.originBasis, "brand");
  assert.ok(br.notes.some((n) => /HSMT đòi thương hiệu G7/.test(n)));
  assert.equal(br.configs[0].originAsk, undefined);
  assert.equal(run("cat-tianjin", "origin").configs.length, 0);
  assert.equal(run("cat-tianjin", undefined).configs.length, 0); // chosen on the web: as before
  assert.equal(run("asm", "brand").configs.length, 0); // an assembler stays out
});

test("check(): origin asks for the CO and meets genset_origin by code for a supplier in the group", () => {
  const r = check(of("uk"), { hsmtText: hsmt, suppliers: sups, readWeb: () => null, origin: "g7", basis: "origin" }).result;
  const c = r.configs[0], x = c.checks.find((y) => y.item === "Xuất xứ tổ máy");
  assert.equal(x.status, "met"); assert.ok(x.byCode); assert.match(x.offered, /UK Maker đặt tại GB/);
  assert.equal(c.originAsk[0].item, "Xuất xứ G7 (CO)");
  assert.ok(rankConfigs(r).configs[0].rfq.some((q) => q.item === "Xuất xứ G7 (CO)" && /CO/.test(q.ask)));
  // Chosen on the web (no basis): no CO question, genset_origin left as the agent wrote it.
  const w = check(of("uk"), { hsmtText: hsmt, suppliers: sups, readWeb: () => null, origin: "g7" }).result.configs[0];
  assert.equal(w.originAsk, undefined); assert.equal(w.checks.find((y) => y.item === "Xuất xứ tổ máy").status, "unclear");
});
