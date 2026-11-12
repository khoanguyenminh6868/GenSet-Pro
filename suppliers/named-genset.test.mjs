// node --test suppliers/*.test.mjs — Tổ máy HSMT nêu đích danh (Khoa 2026-11-12, IB2600601812: "Nhà sản xuất Huyndai",
// "Mã hiệu DHY110K SE" gave six configurations of other makes and none of that model).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, check, rankConfigs, groupSuppliers, byOrigin } from "./config-bot.mjs";
import { normMake, sameMake, namesModel, modelKey, namedGensetOf, namedSuppliers, markNamed } from "./named-genset.mjs";
import { modelKeysOf } from "./web-memo.mjs";

const C = globalThis.GenbidCatalog;
// The HSMT of IB2600601812 as the web form gives it: one flattened line, "tương đương" only for the origin.
const ROW = "I Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy phát điện diesel có vỏ giảm âm, công suất 100kVA, 03 pha 2 Nước sản xuất Trung Quốc hoặc tương đương 3 Nhà sản xuất Huyndai 4 Mã hiệu DHY110K SE 5 Tình trạng Mới 100% 6 Công suất liên tục ≥ 100 kVA 7 Công suất tối đa ≥ 110 kVA 11 Tần số 50Hz II Thông số kỹ thuật động cơ: 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể III Thông số kỹ thuật đầu phát điện 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể";
const HSMT = `Chương V. Yêu cầu kỹ thuật\nSTT\tDanh mục hàng hóa\tĐơn vị tính\tKhối lượng\tKý mã hiệu\tNhãn hiệu\tHãng sản xuất\tXuất xứ của hàng hóa\n1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\t${ROW}\n`;

test("hãng: chuẩn hoá chính tả chỉ để so", () => {
  for (const [s, m] of [["Huyndai", "Hyundai"], ["HUYNDAI", "Hyundai"], ["HuynDai", "Hyundai"], ["Mitshubishi", "Mitsubishi"], ["Misubishi", "Mitsubishi"], ["Cumins", "Cummins"], ["CUMMINS BY VGENTECH", "Cummins"], ["Perkin", "Perkins"], ["FG Wilson", "FG Wilson"]]) assert.equal(normMake(s), m, s);
  for (const s of ["Nêu cụ thể", "Theo E-HSDT", "", "Trung Quốc"]) assert.equal(normMake(s), null, s);
  assert.ok(sameMake("Huyndai", "HYUNDAI"));
  assert.ok(!sameMake("Hyundai", "Doosan"));
});

test("model: so bỏ dấu cách / gạch, không khớp mã dài hơn", () => {
  assert.equal(modelKey("DHY110K SE"), "DHY110KSE");
  assert.ok(namesModel("DHY110KSE Diesel engine", "DHY110K SE"));
  assert.ok(namesModel("| DHY-110K-SE |", "DHY110KSE"));
  assert.ok(!namesModel("DHY110KSE3", "DHY110K SE"));
  assert.ok(!namesModel("ADHY110KSE", "DHY110K SE"));
});

test("kho âm: model có dấu cách là một khoá", () => {
  assert.ok(modelKeysOf("4 Mã hiệu DHY110K SE 5 Tình trạng").has("DHY110KSE"));
});

test("đọc HSMT IB2600601812: Huyndai / DHY110K SE, không cho tương đương (chữ đó chỉ ở dòng xuất xứ)", () => {
  const n = namedGensetOf(HSMT);
  assert.equal(n.make, "Hyundai");
  assert.equal(n.makeRaw, "Huyndai");
  assert.deepEqual(n.models, ["DHY110K SE"]);
  assert.equal(n.equivMake, false);
  assert.equal(n.equivModel, false);
  // The flattened row alone (no Mẫu 02B table): the same.
  const r = namedGensetOf(ROW);
  assert.equal(r.make, "Hyundai");
  assert.equal(r.model, "DHY110K SE");
  assert.equal(r.equivMake, false);
  // From the agent's requirements (quotes checked in the HSMT).
  const q = namedGensetOf(ROW, { reqs: [{ code: "genset_make", requirement: "Huyndai", quote: "3 Nhà sản xuất Huyndai" }, { code: "genset_model", requirement: "DHY110K SE", quote: "4 Mã hiệu DHY110K SE" }] });
  assert.equal(q.quoteMake, "3 Nhà sản xuất Huyndai");
  assert.equal(q.equivMake, false);
  // A quote the HSMT does not have is not read.
  assert.equal(namedGensetOf("Tần số 50 Hz", { reqs: [{ code: "genset_make", requirement: "Hyundai", quote: "Nhà sản xuất Hyundai" }] }), null);
});

test("đọc HSMT: tương đương theo từng yêu cầu hoặc câu chung; mục con của động cơ không phải hãng tổ máy", () => {
  const T = ["Tổ máy phát điện 500kVA", "  - Xuất xứ: Trung Quốc", "  - Nhà sản xuất: FORTUGEN", "  - Model máy phát điện: FG-C525LS", "  - Động cơ diesel:", "  + Nhà sản xuất: Dongfeng Cummins (DCEC)", "  + Model: QSZ13-G3", "  - Đầu phát:", "  + Nhà sản xuất: LEROY SOMER", "  + Model: TAL-A473-C"].join("\n");
  const n = namedGensetOf(T);
  assert.equal(n.make, "Fortugen");
  assert.deepEqual(n.models, ["FG-C525LS"]);
  assert.equal(n.equivMake, false);
  const general = `${T}\nGhi chú: Bất kỳ thương hiệu, ký mã hiệu, xuất xứ (nếu có) trong tiêu chuẩn kỹ thuật chi tiết là để\nminh họa các tiêu chuẩn chất lượng.`;
  assert.equal(namedGensetOf(general).equivMake, true);
  assert.equal(namedGensetOf("Tổ máy phát điện\n- Nhà sản xuất: Hyundai hoặc tương đương\n- Model: DHY34KSE hoặc tương đương").equivModel, true);
  // A list of makes to choose from, a set under maintenance, a value left to the bidder: none.
  assert.equal(namedGensetOf("Tổ máy phát điện\n- Hãng sản xuất: MTU/ Caterpillar/ Cummins hoặc tương đương"), null);
  assert.equal(namedGensetOf("Tổ máy phát điện\n- Nhà sản xuất: Nêu cụ thể\n- Mã hiệu: Nêu cụ thể"), null);
  assert.equal(namedGensetOf("Bảo dưỡng máy phát điện\n- Nhãn hiệu: Cummins C2250D5 cần phải bảo trì"), null);
  assert.equal(namedGensetOf("Chương V\nCông suất liên tục ≥ 100 kVA\nĐộng cơ: Cummins 6BTA5.9-G2"), null);
});

// The Hyundai Power Products record of #598, made up: a table per part, the genset model in its titles, the engine's
// 100 kW only (no kVA), a supplier in Spain; and assemblers in China with rows full of figures at 100 kVA.
const hyundai = () => ({ id: "hpp-test", country: "ES", role: "genset_oem", confidence: "medium", status: "verified", names: { en: "GRV POWER PRODUCTS, S.L.", brands: ["HYUNDAI"] },
  specTables: [{ n: 5001, title: "DHY110KSE", header: [], rows: ["| Prime Power | KVA / KW | 100 / 80", "| Standby Power | KVA / KW | 110 / 88"] },
    { n: 5001, title: "DHY110KSE Diesel engine", header: [], rows: ["| Engine Model | HY4A140Z-D25", "| Prime power | Kw | 100", "| Structure | 4 cylinder,inline", "| Displacement | L | 4.75"] }] });
const assemblers = () => Array.from({ length: 6 }, (_, i) => ({ id: `cn${i}`, country: "CN", role: "genset_oem", confidence: "high", status: "verified", names: { en: `Fujian Power ${i}` },
  controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: "DSE7320", src: [3001] }],
  specTables: [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: ["YC4D140-D31", "4HTAA4.3-G34", "1104C-44TAG2", "6BT5.9-G2"].map((e, j) => `| G-${i}-${j} | 100 | 80 | ${e} | UCI274C |`) }] }));
const CAP = { value: 100, unit: "kVA" };
function candOf(hsmt, sup) {
  const hints = hintsOf(hsmt), named = namedGensetOf(hsmt);
  if (named) hints.named = { ...named, strict: true };
  const full = C.build(sup), grp = groupSuppliers(sup, "all");
  if (named) for (const id of namedSuppliers(sup, named)) grp.add(id);
  return candidates({ ...full, engines: byOrigin(full.engines, "all", new Set(), grp) }, CAP, hints, { suppliers: sup, origin: "all" });
}

test("ứng viên: dòng DHY110KSE của NCC ngoài Trung Quốc vào, named, đứng đầu", () => {
  const sup = [hyundai(), ...assemblers()];
  const { top } = candOf(HSMT, sup);
  assert.equal(top[0].u.supplierId, "hpp-test");
  assert.equal(top[0].e.model, "HY4A140Z-D25");
  assert.equal(top[0].named, true);
  // An HSMT that names no genset: the row is not among them (no kVA in its table, a supplier outside China), as before.
  const plain = candOf("Chương V\nCông suất liên tục ≥ 100 kVA\nTần số 50 Hz", sup).top;
  assert.ok(!plain.some((r) => r.u.supplierId === "hpp-test"));
});

const req = (code, item, requirement, quote) => ({ code, item, requirement, quote, part: "genset", level: "core" });
const REQS = [req("genset_make", "Hãng sản xuất tổ máy", "Huyndai", "3 Nhà sản xuất Huyndai"), req("genset_model", "Model tổ máy", "DHY110K SE", "4 Mã hiệu DHY110K SE")];
const named1 = () => ({ rank: 1, engine: { model: "HY4A140Z-D25", src: { kind: "catalog", supplierId: "hpp-test", n: 5001, line: "| Engine Model | HY4A140Z-D25" } }, genset: { model: "DHY110KSE", make: "Hyundai" },
  checks: [], suppliers: [{ supplierId: "hpp-test", n: 5001, line: "| Engine Model | HY4A140Z-D25", why: "" }] });
const equiv = (i) => ({ rank: 2 + i, engine: { model: "YC4D140-D31", make: "Yuchai", src: { kind: "catalog", supplierId: `cn${i}`, n: 101, line: `| G-${i}-0 | 100 | 80 | YC4D140-D31 | UCI274C |` } },
  checks: [], suppliers: [{ supplierId: `cn${i}`, n: 101, line: `| G-${i}-0 | 100 | 80 | YC4D140-D31 | UCI274C |`, why: "" }] });

test("check: cấu hình model nêu giữ dù NCC ngoài TQ, nhãn tương đương, cảnh báo + câu hỏi làm rõ", () => {
  const sup = [hyundai(), ...assemblers()];
  const { result } = check({ requirements: REQS.map((r) => ({ ...r })), configs: [equiv(0), named1(), equiv(1)] }, { hsmtText: HSMT, suppliers: sup, readWeb: () => null, origin: "all" });
  rankConfigs(result);
  assert.equal(result.configs[0].named, "model");
  assert.equal(result.configs[0].engine.model, "HY4A140Z-D25");
  assert.ok(result.configs.slice(1).every((c) => c.equivalent && !c.named));
  assert.equal(result.named.found, true);
  assert.equal(result.named.makeRaw, "Huyndai");
  assert.match(result.namedWarn, /không ghi "hoặc tương đương"/);
  assert.ok((result.clarify || []).some((x) => x.named && x.quoteA === "3 Nhà sản xuất Huyndai"));
});

test("check: cấu hình model nêu đứng thứ 7 không bị cắt ở giới hạn 6 cấu hình", () => {
  const sup = [hyundai(), ...assemblers()];
  const { result } = check({ requirements: REQS.map((r) => ({ ...r })), configs: [...Array.from({ length: 6 }, (_, i) => equiv(i)), { ...named1(), rank: 7 }] }, { hsmtText: HSMT, suppliers: sup, readWeb: () => null, origin: "all" });
  rankConfigs(result);
  assert.equal(result.configs[0].named, "model");
  assert.equal(result.named.found, true);
});

test("check: không có nguồn của model nêu → found false (web hiện dòng chưa có nguồn thông số)", () => {
  const { result } = check({ requirements: REQS.map((r) => ({ ...r })), configs: [equiv(0), equiv(1)] }, { hsmtText: HSMT, suppliers: assemblers(), readWeb: () => null, origin: "all" });
  assert.equal(result.named.found, false);
  assert.equal(result.named.model, "DHY110K SE");
  assert.equal(result.configs.length, 2);
  assert.ok(result.configs.every((c) => c.equivalent));
});

test("check: nguồn bên bán cho model nêu — cờ tắt thì bỏ, bật thì chưa xác minh và tối đa chưa rõ", () => {
  const page = "URL: https://micksgonebush.com.au/products/hyundai-110kva\nHyundai DHY110KSE 110kVA diesel generator. Prime power 100 kVA.";
  const web = () => ({ rank: 1, genset: { model: "DHY110KSE", make: "Hyundai", src: { kind: "internet", url: "https://micksgonebush.com.au/products/hyundai-110kva", file: "web/1.txt", quote: "Hyundai DHY110KSE 110kVA diesel generator" } },
    checks: [{ item: "Công suất liên tục", requirement: "≥ 100 kVA", hsmtQuote: "6 Công suất liên tục ≥ 100 kVA", offered: "100 kVA", sourceQuote: "Prime power 100 kVA", part: "genset", status: "met" }], suppliers: [] });
  const run = () => check({ requirements: REQS.map((r) => ({ ...r })), configs: [web(), equiv(0)] }, { hsmtText: HSMT, suppliers: assemblers(), readWeb: (f) => (f === "web/1.txt" ? page : null), origin: "all" }).result;
  const prev = process.env.GENBID_NAMED_SELLER;
  try {
    delete process.env.GENBID_NAMED_SELLER;
    let r = run();
    assert.ok(!r.configs.some((c) => c.named));
    assert.equal(r.named.found, false);
    process.env.GENBID_NAMED_SELLER = "1";
    r = run();
    const c = r.configs.find((x) => x.named === "model");
    assert.equal(c.unverifiedSource, "seller");
    assert.ok(c.checks.every((x) => x.status !== "met"));
  } finally { if (prev == null) delete process.env.GENBID_NAMED_SELLER; else process.env.GENBID_NAMED_SELLER = prev; }
});

test("gói không nêu hãng / model tổ máy: không có trường nào mới", () => {
  const hs = "Chương V. Yêu cầu kỹ thuật\n6 Công suất liên tục ≥ 100 kVA\nTần số 50 Hz\nĐộng cơ: Nhà sản xuất Nêu cụ thể";
  const { result } = check({ requirements: [], configs: [equiv(0), equiv(1)] }, { hsmtText: hs, suppliers: assemblers(), readWeb: () => null, origin: "all" });
  rankConfigs(result);
  assert.equal(result.named, undefined);
  assert.equal(result.namedWarn, undefined);
  assert.ok(result.configs.every((c) => !("equivalent" in c) && !("named" in c)));
  // markNamed with nothing named leaves a result as it is.
  const r = { configs: [{ rank: 1 }] };
  assert.deepEqual(markNamed(r, null), { configs: [{ rank: 1 }] });
});
