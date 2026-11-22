// node --test suppliers/dau-phat-hang.test.mjs — Đầu phát theo datasheet hãng (dau-phat-hang B, Khoa 20/11/2026): đọc yêu
// cầu đầu phát của HSMT (altNeedOf), lọc model trên tờ hãng đã lưu (makerAlts, hồ sơ thật leroy-somer-fuzhou +
// stamford-avk-china), đặt / thay đầu phát trong check (makerAltFix), check do code viết (makerAltChecks, altAttrChecks
// đọc khối "General characteristics" của Leroy-Somer), altKvaOf không tách "1 025".
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { primeKvaOf, altNeedOf, makerAlts, makerAltsOf, makerAltFix, makerAltChecks, contKva, sourceRatings, ratingsFor, altAttrChecks, altKvaOf, rankConfigs, makerDerate, makerMadeOf } from "./config-bot.mjs";

const CAT = globalThis.GenbidCatalog;
const here = path.dirname(fileURLToPath(import.meta.url));
const rec = (id) => JSON.parse(fs.readFileSync(path.join(here, "cn", `${id}.json`), "utf8"));
const makers = [rec("leroy-somer-fuzhou"), rec("stamford-avk-china")];
const RT = sourceRatings(makers);
// IB2600603983 (HSMT đọc ngày 20/11/2026; dòng nguyên văn của Phân tích): đầu phát ≥ 750 kVA, cấp H, ±0,5 %, 300 % / 10 s, G7 / EU.
const IB_REQS = [
  { code: "power_prime", requirement: "Liên tục ≥ 700 kVA; tối đa ≥ 770 kVA; hệ số công suất ≥ 0,8", quote: "Công suất liên tục | kVA | ≥ 700", part: "genset" },
  { code: "frequency", requirement: "380/220 V; 50 Hz; ≤ 1.500 vòng/phút", part: "genset" },
  { code: "voltage", requirement: "220/380 – 230/400 V; 3 pha – 4 dây", quote: "3 pha – 4 dây", part: "genset" },
  { code: "alt_power", item: "Công suất đầu phát", requirement: "Định mức ≥ 750 / 600 kVA/kWm; dự phòng ≥ 825 / 660 kVA/kWm", quote: "Công suất định mức | kVA/kWm | ≥ 750 / 600", part: "alternator" },
  { code: "alt_insulation", item: "Cấp cách điện", requirement: "Cấp H", quote: "Cấp cách điện | Cấp H", part: "alternator" },
  { code: "alt_vreg", item: "Ổn định điện áp", requirement: "Bảng thông số ghi ≤ ± 0,5% Udm; mục B.II.1.3 ghi ≤ ±1,5%Udm khi chuyển tải 0–100%Pđm", quote: "Dao động điện áp | ≤ ± 0,5% Udm", part: "alternator" },
  { code: "alt_short_circuit", item: "Dòng ngắn mạch duy trì (300% / 10 s)", requirement: "300% (3 IN) trong 10 giây", quote: "300% (3 IN) trong 10 giây", part: "alternator" },
  { code: "alt_origin", item: "Xuất xứ đầu phát", requirement: "Nhà sản xuất/nhãn hiệu thuộc nhóm nước G7, EU; mới 100%", quote: "Nhóm các nước khối G7, EU", part: "alternator" },
];
const IB_TEXT = "Tần số | Hz | 50\nNhiệt độ môi trường lớn nhất | 45oC";

test("primeKvaOf: số kVA prime trước chữ dự phòng / tối đa", () => {
  assert.equal(primeKvaOf("Định mức ≥ 750 / 600 kVA/kWm; dự phòng ≥ 825 / 660 kVA/kWm"), 750);
  assert.equal(primeKvaOf("Công suất định mức | kVA/kWm | ≥ 750 / 600"), 750);
  assert.equal(primeKvaOf("Liên tục ≥ 700 kVA; tối đa ≥ 770 kVA"), 700);
  assert.equal(primeKvaOf("≥ 1.250 kVA"), 1250);
  assert.equal(primeKvaOf("Standby 825 kVA"), null);
  assert.equal(primeKvaOf("Cấp H"), null);
});

test("altNeedOf IB2600603983: 750 kVA (đầu phát > tổ máy 700), 50 Hz, 380 / 400 V, H, ±0,5 %, 300 %, G7 / EU, 45 °C", () => {
  const n = altNeedOf(IB_REQS, { cap: { value: 700, unit: "kVA" }, hsmtText: IB_TEXT });
  assert.equal(n.kva, 750); assert.equal(n.hz, 50); assert.deepEqual(n.volts, [380, 400]); assert.equal(n.ins, "H");
  assert.equal(n.vreg, 0.5); assert.equal(n.sc, true); assert.deepEqual(n.exc, []); assert.equal(n.origin.grp, "g7eu"); assert.equal(n.site.temp, 45);
  // Only F asked → the F 105 K column; a kW size → ÷ 0.8.
  assert.equal(altNeedOf([{ code: "alt_insulation", requirement: "Cấp F" }], { cap: { value: 400, unit: "kW" }, hsmtText: "50 Hz" }).ins, "F");
  assert.equal(altNeedOf([], { cap: { value: 400, unit: "kW" }, hsmtText: "50 Hz" }).kva, 500);
});

test("makerAlts IB2600603983: LSA 49.3 M8 (820 kVA cột H 125 K / 40 °C, AREP / PMG, D350) đứng đầu; M6 730 kVA và TAL-A49 (ngắn mạch 2,7 In / 5 s) không có", () => {
  const need = altNeedOf(IB_REQS, { cap: { value: 700, unit: "kVA" }, hsmtText: IB_TEXT });
  const list = makerAlts(makers, RT, need);
  // D2 (21/11/2026): the Stamford S6 sheets [1021–1022] meet the kVA after 45 °C but state no 300 % / 10 s: after the LSA.
  assert.deepEqual(list.map((m) => m.model), ["LSA 49.3 M8", "LSA 49.3 L9", "S6L1D-C4", "S6L1D-D4"]);
  assert.ok(list.slice(2).every((m) => m.unknown.includes("ngắn mạch 300 % / 10 s")));
  const m8 = list[0];
  assert.equal(m8.kva, 820); assert.equal(m8.make, "Leroy-Somer"); assert.equal(m8.supplierId, "leroy-somer-fuzhou"); assert.equal(m8.n, 1012);
  assert.deepEqual(m8.options.map((o) => `${o.what} ${o.value}`), ["Kích từ AREP / PMG", "AVR D350"]);
  assert.deepEqual(m8.unknown, []);
  assert.equal(m8.made.at, "CN"); assert.equal(m8.made.brand, "FR");
  assert.ok(m8.lines.includes("| LSA 49.3 M8 | kVA | 820 | 820 | 820 | 810 | 760 | 760 | 760 | 710 | 910 | 910 | 910 | 885 | 945 | 945 | 945 | 925"));
  // Without the 300 % asked, TAL-A49-B (750 kVA) is the smallest that meets, but it states its short circuit as no figure
  // the HSMT asks here, so with it asked it is out.
  const noSc = makerAlts(makers, RT, { ...need, sc: false, site: null });
  assert.equal(noSc[0].model, "TAL-A49-B");
  // At 45 °C (B2): M8 after the LSA table's 0.973 = 797.9 kVA; TAL-A49-B has no derating in the saved sources → unknown, after.
  assert.equal(m8.derated, 797.9);
  const hot = makerAlts(makers, RT, { ...need, sc: false }, { all: true });
  assert.ok(hot.findIndex((m) => m.model === "TAL-A49-B") > hot.findIndex((m) => m.model === "LSA 49.3 M8"));
  assert.deepEqual(hot.find((m) => m.model === "TAL-A49-B").unknown, ["suy giảm theo nhiệt độ của hiện trường"]);
  // At most 2 a make; ≤ 130 %.
  assert.ok(makerAlts(makers, RT, { ...need, sc: false }).every((m) => m.kva <= 750 * 1.3 + 0.5));
  assert.ok(new Set(makerAlts(makers, RT, { ...need, sc: false, kva: 200 }).map((m) => m.make)).size >= 1);
  const per = makerAlts(makers, RT, { ...need, sc: false, vreg: null, origin: null, kva: 200 });
  for (const mk of new Set(per.map((m) => m.make))) assert.ok(per.filter((m) => m.make === mk).length <= 2);
  // A make the HSMT names without "tương đương": only that make.
  const st = makerAlts(makers, RT, { ...need, sc: false, vreg: null, kva: 200, makes: ["Stamford"], equivalent: false });
  assert.ok(st.length && st.every((m) => m.make === "Stamford"));
  const eq = makerAlts(makers, RT, { ...need, sc: false, vreg: null, kva: 200, makes: ["Stamford"], equivalent: true });
  assert.equal(eq[0].make, "Stamford"); assert.ok(eq.some((m) => m.make === "Leroy-Somer"));
});

test("makerAltsOf (prep): mục catalog.md có src để chép, nói rõ NCC chưa chào", () => {
  const r = makerAltsOf(makers, IB_REQS, { cap: { value: 700, unit: "kVA" }, hsmtText: IB_TEXT });
  assert.match(r.md, /## Đầu phát theo datasheet hãng \(NCC chưa chào\)/);
  assert.match(r.md, /### LSA 49\.3 M8 — hãng Leroy-Somer, 820 kVA/);
  assert.match(r.md, /src: \{"kind":"maker","supplierId":"leroy-somer-fuzhou","n":1012\}/);
  assert.match(r.md, /NCC CHƯA chào/);
  assert.equal(makerAltsOf(makers, [], { cap: null, hsmtText: "" }).md, "");
});

// makerAltFix with a stub row: { other } is what the genset row writes in its alternator cell.
const fix = (configs, { rowOther = null, env = null } = {}) => {
  const result = { requirements: IB_REQS, configs };
  const old = process.env.GENBID_MAKER_ALT;
  if (env != null) process.env.GENBID_MAKER_ALT = env;
  try {
    const problems = [], need = makerAltFix(result, { suppliers: makers, RT, built: { engines: [], alternators: [] }, rowOf: () => (rowOther == null ? null : { other: rowOther }), hsmtText: IB_TEXT, cap: { value: 700, unit: "kVA" }, problems });
    return { result, problems, need };
  } finally { if (env != null) { if (old == null) delete process.env.GENBID_MAKER_ALT; else process.env.GENBID_MAKER_ALT = old; } }
};
const row = { kind: "catalog", supplierId: "x", n: 101, line: "| KB700 | 6M31G825/5 | LSA 49.3 M6 |" };

test("makerAltFix câu 1: NCC chào LSA 49.3 M6 (730 kVA < 750) → thay bằng M8, ghi NCC chào gì và vì sao", () => {
  const c = { rank: 1, engine: { model: "6M31G825/5", make: "Baudouin", src: row }, alternator: { model: "LSA 49.3 M6", make: "Leroy-Somer", src: row },
    checks: [{ item: "Công suất đầu phát", part: "alternator", status: "unclear" }, { item: "Công suất liên tục", part: "genset", status: "met" }] };
  const { result } = fix([c], { rowOther: "LSA 49.3 M6" });
  const a = result.configs[0].alternator;
  assert.equal(a.model, "LSA 49.3 M8"); assert.equal(a.fromMaker, true); assert.equal(a.byCode, true); assert.equal(a.src.kind, "maker");
  assert.equal(a.was.model, "LSA 49.3 M6"); assert.match(a.wasWhy, /730 kVA .* < 750 kVA/);
  assert.deepEqual(a.options.map((o) => o.value), ["AREP / PMG", "D350"]);
  // The agent's alternator checks were about M6: gone; the genset ones stay.
  assert.deepEqual(result.configs[0].checks.map((x) => x.item), ["Công suất liên tục"]);
  assert.match(result.configs[0].gaps.join(" "), /LSA 49\.3 M8 \(Leroy-Somer\) chọn theo datasheet hãng, NCC chưa chào \(NCC chào LSA 49\.3 M6: .*\): cần NCC xác nhận .* lắp ghép với động cơ 6M31G825\/5/);
  // Run again: the same, once.
  makerAltFix(result, { suppliers: makers, RT, built: { engines: [], alternators: [] }, rowOf: () => ({ other: "LSA 49.3 M6" }), hsmtText: IB_TEXT, cap: { value: 700, unit: "kVA" } });
  assert.equal(result.configs[0].alternator.model, "LSA 49.3 M8"); assert.equal(result.configs[0].alternator.was.model, "LSA 49.3 M6");
  assert.equal(result.configs[0].gaps.filter((g) => /datasheet hãng/.test(g)).length, 1);
});

test("makerAltFix câu 2: đầu phát NCC không có số liệu, hoặc đạt → giữ; dòng không ghi đầu phát → thêm M8", () => {
  const keep = fix([{ rank: 1, engine: { model: "E" }, alternator: { model: "LSA49.3 M65", src: row } }], { rowOther: "LSA49.3 M65" }).result.configs[0];
  assert.equal(keep.alternator.model, "LSA49.3 M65"); assert.equal(keep.alternator.fromMaker, undefined);
  const ok = fix([{ rank: 1, engine: { model: "E" }, alternator: { model: "LSA 49.3 L9", src: row } }], { rowOther: "LSA 49.3 L9" }).result.configs[0];
  assert.equal(ok.alternator.model, "LSA 49.3 L9");
  const none = fix([{ rank: 1, engine: { model: "E" }, alternator: null, checks: [] }], { rowOther: null }).result.configs[0];
  assert.equal(none.alternator.model, "LSA 49.3 M8"); assert.equal(none.alternator.was, undefined);
  // A row that names an alternator the agent left out: nothing put in its place.
  const left = fix([{ rank: 1, engine: { model: "E" }, alternator: null }], { rowOther: "LSA49.3 M65" }).result.configs[0];
  assert.equal(left.alternator, null);
  // GENBID_MAKER_ALT=0: off.
  const off = fix([{ rank: 1, engine: { model: "E" }, alternator: null }], { env: "0" });
  assert.equal(off.result.configs[0].alternator, null); assert.equal(off.result.makerAlt, undefined);
});

test("makerAltFix: đầu phát hãng agent chọn — giữ khi có trong danh sách và dòng cho phép; không thì bỏ", () => {
  const pick = (model, rowOther) => fix([{ rank: 1, engine: { model: "E" }, alternator: { model, make: "Leroy-Somer", src: { kind: "maker", supplierId: "leroy-somer-fuzhou", n: 1012 } } }], { rowOther });
  const ok = pick("LSA 49.3 M8", null);
  assert.equal(ok.result.configs[0].alternator.fromMaker, true); assert.equal(ok.result.configs[0].alternator.byCode, undefined);
  // LSA 49.3 M6 is below: dropped, then the list's first put by the code.
  const low = pick("LSA 49.3 M6", null);
  assert.match(low.problems[0], /không có trong danh sách/); assert.equal(low.result.configs[0].alternator.model, "LSA 49.3 M8");
  // The row names an alternator that meets: the row's alternator back.
  const row9 = pick("LSA 49.3 M8", "LSA 49.3 L9");
  assert.match(row9.problems[0], /chưa bị chứng minh là không đạt/); assert.equal(row9.result.configs[0].alternator.model, "LSA 49.3 L9");
});

test("makerAltChecks: công suất cột liên tục (45 °C → hệ số 0,973 của bảng Leroy-Somer [6003] → đạt), xuất xứ thương hiệu G7 / EU → đạt", () => {
  const { result, need } = fix([{ rank: 1, engine: { model: "E" }, alternator: null, checks: [] }]);
  const reqs = IB_REQS.map((r) => ({ ...r, item: r.item || r.code, level: "core" }));
  const c = makerAltChecks(result.configs[0], reqs, need);
  const pw = c.checks.find((x) => x.item === "Công suất đầu phát");
  assert.equal(pw.sourceQuote, "| LSA 49.3 M8 | kVA | 820 | 820 | 820 | 810 | 760 | 760 | 760 | 710 | 910 | 910 | 910 | 885 | 945 | 945 | 945 | 925");
  assert.equal(pw.status, "met"); assert.match(pw.offered, /^797,9 kVA sau suy giảm \(820 kVA Continuous cấp H 125 K \/ 40 °C, 50 Hz, 3 pha, 380 \/ 400 V/);
  assert.match(pw.note, /45 °C\) vượt 40 °C.*hệ số nhiệt độ 0\.973 \(cột 45 °C \(đúng mức HSMT, không nội suy\); leroy-somer-fuzhou \[6003\]: "Ambient T °C 25 40 45 50 55 60 \(\*\) \| Class H 1.076 1 0.973 0.946 0.918 0.889"\); 820 kVA × 0.973 = 797,9 kVA ≥ 750 kVA HSMT/);
  assert.deepEqual(pw.derate.map((x) => [x.what, x.factor, x.src.n]), [["nhiệt độ", 0.973, 6003]]);
  // 55 °C: 820 × 0.918 = 752.8 ≥ 750 → met; 60 °C: 820 × 0.889 = 729 < 750 → not met.
  const at = (temp) => makerAltChecks({ ...result.configs[0], checks: [] }, reqs, { ...need, site: { temp } }).checks.find((x) => x.item === "Công suất đầu phát");
  assert.equal(at(55).status, "met"); assert.equal(at(60).status, "not_met"); assert.match(at(60).note, /729 kVA < 750 kVA HSMT/);
  // A TAL (not in the LSA table) at 45 °C: no derating in the saved sources → unclear, saying where it looked.
  const tal = makerAltChecks({ ...result.configs[0], alternator: { ...result.configs[0].alternator, model: "TAL-A49-B" }, checks: [] }, reqs, need).checks.find((x) => x.item === "Công suất đầu phát");
  assert.equal(tal.status, "unclear"); assert.match(tal.note, /không có hệ số suy giảm theo nhiệt độ \(đã tìm trong tờ leroy-somer-fuzhou \[1012\]\): chưa rõ/);
  const cool = makerAltChecks({ ...result.configs[0], checks: [] }, reqs, { ...need, site: null }).checks.find((x) => x.item === "Công suất đầu phát");
  assert.equal(cool.status, "met");
  const og = c.checks.find((x) => x.item === "Xuất xứ đầu phát");
  assert.equal(og.status, "met"); assert.match(og.note, /NCC chưa chào/);
  // A place asked (not a brand): the Fuzhou plant's sheet is made in China, outside G7.
  const place = makerAltChecks({ ...result.configs[0], checks: [] }, [{ code: "alt_origin", item: "Xuất xứ đầu phát", requirement: "Nước sản xuất: thuộc G7", quote: "Nước sản xuất: G7", level: "core" }], need).checks[0];
  assert.equal(place.status, "not_met"); assert.match(place.note, /Trung Quốc \(tờ của nhà máy Phúc Châu/);
});

test("makerAltChecks: hãng HSMT nêu → đạt; model HSMT nêu: đúng → đạt, khác → chưa rõ; xuất xứ một nước → confirm CO", () => {
  const { result, need } = fix([{ rank: 1, engine: { model: "E" }, alternator: null, checks: [] }]);
  const reqs = [
    { code: "alt_make", item: "Hãng đầu phát", requirement: "Leroy Somer (Pháp)", level: "core" },
    { code: "alt_model", item: "Model đầu phát", requirement: "LSA 49.3 M8", level: "core" },
    { code: "alt_origin", item: "Xuất xứ đầu phát", requirement: "Trung Quốc", level: "core" },
  ];
  const n = { ...need, makes: ["Leroy-Somer"] }, st = (c) => Object.fromEntries(c.checks.map((x) => [x.item, x.status]));
  // The Fuzhou plant's sheet (Khoa 20/11/2026): made in China → "Trung Quốc" met; another country → to be confirmed (CO).
  assert.deepEqual(st(makerAltChecks({ ...result.configs[0], checks: [] }, reqs, n)), { "Hãng đầu phát": "met", "Model đầu phát": "met", "Xuất xứ đầu phát": "met" });
  assert.equal(makerAltChecks({ ...result.configs[0], checks: [] }, [{ ...reqs[2], requirement: "Ý" }], n).checks[0].status, "confirm");
  // Another model of the make: not concluded without "tương đương", met with it (Khoa 20/11/2026).
  const other = makerAltChecks({ ...result.configs[0], checks: [] }, [{ ...reqs[1], requirement: "TAL-A44-J" }], n).checks[0];
  assert.equal(other.status, "unclear"); assert.match(other.note, /TAL-A44-J/);
  const eq = makerAltChecks({ ...result.configs[0], checks: [] }, [{ ...reqs[1], requirement: "TAL-A44-J hoặc tương đương" }], n).checks[0];
  assert.equal(eq.status, "met"); assert.match(eq.note, /"TAL-A44-J hoặc tương đương" \(có "tương đương"\); đầu phát chọn theo datasheet hãng là LSA 49.3 M8/);
  // A make the HSMT does not name: no check written.
  assert.equal(makerAltChecks({ ...result.configs[0], checks: [] }, [reqs[0]], { ...need, makes: ["Stamford"] }).checks.length, 0);
});

test("makerAlts: model HSMT nêu đứng đầu (IB2600602880: TAL-A44-J trước LSA 44.3 L10)", () => {
  const n = altNeedOf([
    { code: "alt_power", item: "Công suất đầu phát", requirement: "150 kVA", part: "alternator" },
    { code: "alt_make", item: "Hãng đầu phát", requirement: "Leroy Somer (Pháp)", part: "alternator" },
    { code: "alt_model", item: "Model đầu phát", requirement: "TAL-A44-J", part: "alternator" },
    { code: "voltage", requirement: "400 V; 3 pha" },
  ], { hsmtText: "Tần số 50 Hz" });
  assert.equal(makerAlts(makers, RT, n)[0].model, "TAL-A44-J");
});

test("altAttrChecks đọc khối General characteristics của Leroy-Somer (cả model trong tờ dải)", () => {
  const attrs = ratingsFor(RT.attr, "LSA 49.3 M8");
  assert.deepEqual([...new Set(attrs.map((a) => a.key))].sort(), ["altitude", "avr", "excitation", "insulation", "ip", "overspeed", "sc300", "standards", "vreg"]);
  const c = { alternator: { model: "LSA 49.3 M8" }, checks: [] };
  altAttrChecks(c, [
    { code: "alt_short_circuit", item: "Ngắn mạch", requirement: "300% (3 IN) trong 10 giây", part: "alternator" },
    { code: "alt_excitation", item: "Kích từ", requirement: "Kích từ PMG", part: "alternator" },
    { code: "alt_vreg", item: "Ổn định điện áp", requirement: "≤ ± 0,5%", part: "alternator" },
    { code: "alt_insulation", item: "Cấp cách điện", requirement: "Cấp H", part: "alternator" },
    // IB2600603983: the item is "Quá tốc đầu phát" (no "độ"); the excitation item's name says "PMG / AREP", its requirement does not.
    { code: "other", item: "Quá tốc đầu phát", requirement: "≤ 2250 vòng/phút", part: "alternator" },
    { code: "alt_excitation", item: "Kích từ đầu phát (PMG / AREP)", requirement: "Không chổi than, tự động kích từ", part: "alternator" },
  ], attrs);
  const st = Object.fromEntries(c.checks.map((x) => [x.item, x.status]));
  assert.deepEqual(st, { "Ngắn mạch": "met", "Kích từ": "confirm", "Ổn định điện áp": "met", "Cấp cách điện": "met", "Quá tốc đầu phát": "met" });
  // LSA 46.3 (SHUNT column "-"): the 300 % only with AREP / PMG, chosen when ordering.
  const c46 = { alternator: { model: "LSA 46.3 M8" }, checks: [] };
  altAttrChecks(c46, [{ code: "alt_short_circuit", item: "Ngắn mạch", requirement: "300% (3 IN) trong 10 giây", part: "alternator" }], ratingsFor(RT.attr, "LSA 46.3 M8"));
  assert.equal(c46.checks[0].status, "confirm"); assert.match(c46.checks[0].offered, /AREP \/ PMG/);
});

test("contKva: cột liên tục H, số nhỏ nhất ở các điện áp HSMT", () => {
  const col = contKva(ratingsFor(RT.alt, "LSA 49.3 M8"), { hz: 50, ins: "H", volts: [380, 400, 440] });
  assert.equal(col.min, 810); assert.equal(col.max, 820);
  assert.equal(contKva(ratingsFor(RT.alt, "LSA 49.3 M8"), { hz: 60, ins: "H", volts: [480] }).min, 1025);
});

test("altKvaOf: ô '1 025' là một số (không tách 1 và 25)", () => {
  const built = { alternators: [{ key: CAT.keyOf("LSA 49.3 M8") }] };
  const m = altKvaOf([{ id: "ls", specTables: [{ n: 1012, rows: ["| LSA 49.3 M8 | kVA | 815 | 890 | 940 | 1 025 | 735 | 805 | 850 | 925 | 865 | 945 | 1 000 | 1 090 | 895 | 980 | 1 040 | 1 130"] }] }], built);
  const v = m.get(CAT.keyOf("LSA 49.3 M8"))[0].values;
  assert.ok(v.includes(1025) && v.includes(1130) && !v.includes(25) && !v.includes(1));
});

test("rankConfigs: cùng động cơ, đầu phát NCC chào + đầu phát hãng → một chỗ của trần mỗi hãng, bản sau đứng ngay dưới", () => {
  const cfg = (rank, make, model, alt) => ({ rank, engine: { make, model }, alternator: alt, controller: { model: "DSE6120" }, checks: [], suppliers: [] });
  const result = { requirements: [], configs: [
    cfg(1, "Cummins", "4B3.9-G12", { model: "TAL-A42-E", make: "Leroy-Somer", fromMaker: true }),
    cfg(2, "Yuchai", "YCV2.5T45-G20", { model: "184GS" }),
    cfg(3, "Cummins", "4B3.9-G12", { model: "S0L2-P1", make: "Stamford" }),
    cfg(4, "Cummins", "6BTAA5.9-G12", { model: "UCI274C" }),
  ] };
  const out = rankConfigs(result).configs.map((c) => `${c.engine.model} | ${c.alternator.model}`);
  // Khoa 20/11/2026 (câu 1): both of the pair stay; Cummins' ceiling (1) still leaves out the other Cummins engine.
  // Same score: the Chinese make (Yuchai) first, an older rule.
  assert.deepEqual(out, ["YCV2.5T45-G20 | 184GS", "4B3.9-G12 | TAL-A42-E", "4B3.9-G12 | S0L2-P1"]);
});

test("makerDerate (B2): hệ số suy giảm chỉ từ nguồn đã lưu của hãng, mốc nóng / cao hơn, không nội suy", () => {
  const ls = (temp, alt = null, model = "LSA 49.3 M8") => makerDerate({ supplierId: "leroy-somer-fuzhou", n: 1012, model }, { temp, alt });
  assert.equal(ls(40), null);
  assert.equal(ls(45).f, 0.973);
  assert.equal(ls(47).f, 0.946); assert.match(ls(47).parts[0].why, /cột 50 °C \(mốc ngay trên 47/);
  assert.equal(ls(61).f, null); assert.deepEqual(ls(61).missing, ["nhiệt độ"]);
  assert.equal(ls(null, 1200).f, 0.975);
  assert.equal(ls(45, 2000).f, Number((0.973 * 0.949).toFixed(4)));
  assert.deepEqual(ls(45, null, "TAL-A49-B").missing, ["nhiệt độ"]);
  // Stamford: its own sheet's "3% for every 5°C … exceeds 40°C" and "3% for every 500 metres … exceeds 1000 metres".
  const st = (temp, alt = null) => makerDerate({ supplierId: "stamford-avk-china", n: 1001, model: "S5L1D-H4" }, { temp, alt });
  assert.equal(st(45).f, 0.97); assert.equal(st(46).f, 0.94); assert.match(st(45).parts[0].src.line, /3% for every 5°C by which the operational ambient/);
  assert.equal(st(null, 1500).f, 0.97); assert.equal(st(null, 1600).f, 0.94);
  assert.deepEqual(st(62).missing, ["nhiệt độ"]);
  // Another maker: none.
  assert.deepEqual(makerDerate({ supplierId: "mecc-alte", n: 1001, model: "ECO40" }, { temp: 45 }).missing, ["nhiệt độ"]);
});

test("makerMadeOf: tờ nhà máy Phúc Châu và Stamford Trung Quốc (dải ngoài S4–S7) → sản xuất tại Trung Quốc, thương hiệu giữ nước hãng", () => {
  assert.deepEqual([makerMadeOf("leroy-somer-fuzhou", "Leroy-Somer", "LSA 49.3 M8").at, makerMadeOf("leroy-somer-fuzhou", "Leroy-Somer", "LSA 49.3 M8").brand], ["CN", "FR"]);
  const s = makerMadeOf("stamford-avk-china", "Stamford", "UCI274F");
  assert.equal(s.at, "CN"); assert.notEqual(s.brand, "CN"); assert.match(s.why, /Stamford ở Trung Quốc/);
});
