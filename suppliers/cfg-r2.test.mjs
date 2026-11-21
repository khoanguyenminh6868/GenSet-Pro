// node --test suppliers/*.test.mjs — rà soát lần hai Gợi ý cấu hình (điều phối 2026-11-11): ổn định điện áp theo AVR
// (vregChecks), câu hỏi làm rõ HSMT (clarifyOf), giá chạy lại sau Gợi ý lại (rebidOf), thứ tự + gộp bảng câu hỏi NCC (rfqOf).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { plainWhy, vregChecks, pctsIn, clarifyOf, rebidOf, rfqOf, rfqPoints, RFQ_TIERS, confirmChecks, scoreOf, rankConfigs } from "./config-bot.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VREG = { code: "alt_vreg", item: "Ổn định điện áp", part: "alternator", level: "core", requirement: "Dao động điện áp ≤ ±0,5% Udm", quote: "15   Dao động điện áp                          ≤ ± 0,5% Udm" };
const FREQ = { code: "freq_regulation", item: "Ổn định tần số", part: "genset", level: "core", requirement: "≤ ±0,25%", quote: "Ổn định tần số ≤ ±0,25%" };
const vcfg = (x) => ({ rank: 1, engine: { model: "QSK23-G2" }, alternator: { model: "S5L1D-H41" }, checks: [{ item: "Ổn định điện áp", part: "alternator", ...x }] });

test("pctsIn reads ± bands written several ways", () => {
  assert.deepEqual(pctsIn("≤ ± 0,5% Udm"), [0.5]);
  assert.deepEqual(pctsIn("| Voltage regulation NL-FL | ≤±1%"), [1]);
  assert.deepEqual(pctsIn("+/- 1.5 %"), [1.5]);
  assert.deepEqual(pctsIn("70% tải"), []);
});

test("A: alt_vreg not met / unclear with a looser band in the source → confirm (order), note with both bands", () => {
  const c = vregChecks(vcfg({ status: "not_met", offered: "≤ ±1%", sourceQuote: "| Voltage regulation NL-FL | ≤±1%" }), [VREG]);
  const x = c.checks[0];
  assert.equal(x.status, "confirm"); assert.equal(x.confirm, "order"); assert.equal(x.was, "not_met");
  assert.match(x.note, /phụ thuộc AVR chọn khi đặt hàng, cần AVR đạt ±0,5%/);
  assert.doesNotMatch(x.note, /nguồn ghi/);
  assert.equal(x.avrSrc, "±1%");
  // From a line of the alternator model's sources when the check has no quote.
  const u = vregChecks(vcfg({ status: "unclear" }), [VREG], [{ label: "Voltage Regulation", value: "±1%", line: "| Voltage Regulation, | ≤±1%" }]);
  assert.equal(u.checks[0].status, "confirm");
  // The strictest band the HSMT states is the one asked (0,5 of 0,5 and 1,5).
  const two = { ...VREG, requirement: "≤ ±0,5% Udm; ≤ ±1,5% Udm" };
  assert.match(vregChecks(vcfg({ status: "not_met", sourceQuote: "≤±1%" }), [two]).checks[0].note, /cần AVR đạt ±0,5%/);
  // No longer counted against the configuration.
  assert.deepEqual(scoreOf(c, [VREG]), scoreOf(vcfg({ status: "met", sourceQuote: "x" }), [VREG]));
});

test("A: the other side — a band that meets, no band, a transient line, a quote not found, frequency: unchanged", () => {
  const st = (x, reqs = [VREG], facts = []) => vregChecks(vcfg(x), reqs, facts).checks[0].status;
  assert.equal(st({ status: "met", sourceQuote: "≤±0,5%" }), "met");
  assert.equal(st({ status: "unclear", sourceQuote: "| Voltage regulation | ±0.25%" }), "unclear"); // meets: left to the agent / check
  assert.equal(st({ status: "not_met", sourceQuote: "≤±1% / ±0,5% with MX321" }), "not_met"); // one band meets
  assert.equal(st({ status: "unclear" }), "unclear"); // the sources state no band
  assert.equal(st({ status: "unclear" }, [VREG], [{ label: "Transient voltage dip", line: "| Transient voltage dip | ±15%" }]), "unclear");
  assert.equal(st({ status: "not_met", sourceQuote: "≤±1%", unverified: true }), "not_met");
  assert.equal(st({ status: "not_met", sourceQuote: "≤±1%" }, [{ ...VREG, requirement: "Tự động ổn định điện áp", quote: "Ổn định điện áp tự động" }]), "not_met"); // no band asked
  // Not for frequency.
  const f = { rank: 1, checks: [{ item: "Ổn định tần số", part: "genset", status: "not_met", sourceQuote: "±0,5%" }] };
  assert.equal(vregChecks(f, [FREQ, VREG]).checks[0].status, "not_met");
});

test("A: a configuration not met only on the voltage band now ranks with one that meets it", () => {
  const reqs = [VREG, { code: "cylinders", item: "Số xi lanh", part: "engine", level: "core" }];
  const a = { rank: 1, engine: { model: "4006-23TAG2A" }, checks: [{ item: "Ổn định điện áp", part: "alternator", status: "unclear" }, { item: "Số xi lanh", part: "engine", status: "unclear" }] };
  const b = { rank: 2, engine: { model: "QSK23-G2" }, checks: [{ item: "Ổn định điện áp", part: "alternator", status: "not_met", sourceQuote: "≤±1%" }, { item: "Số xi lanh", part: "engine", status: "met", sourceQuote: "6" }] };
  assert.equal(rankConfigs({ requirements: reqs, configs: [structuredClone(a), structuredClone(b)] }).configs[0].engine.model, "4006-23TAG2A");
  const b2 = vregChecks(structuredClone(b), reqs);
  assert.equal(rankConfigs({ requirements: reqs, configs: [structuredClone(a), b2] }).configs[0].engine.model, "QSK23-G2");
});

const HSMT = [
  "3. Máy phát điện (đầu phát):",
  "-    Kích từ: không chổi than, tự động điều chỉnh điện áp, đảm bảo dao động điện áp ≤",
  "     ±1,5%Udm trong quá trình chuyển đổi tải từ 0 đến 100%Pđm.",
  "Bảng II.2",
  "14    Tỉ số nén                                     14 : 01",
  "15   Dao động điện áp                          ≤ ± 0,5% Udm",
  "Điện áp định mức: 220/380V",
  "Điện áp 380/220 V",
  "Khả năng quá tải Pmax = 1,1Pdm.",
].join("\n");

test("B: clarifyOf — one point at two places (HSMT scan across a wrapped line), a design figure the agent noted", () => {
  const r = { requirements: [VREG, { code: "compression", item: "Tỷ số nén", part: "engine", requirement: "14:1", quote: "14    Tỉ số nén                                     14 : 01" },
    { code: "voltage", item: "Điện áp", requirement: "380/220 V", quote: "Điện áp 380/220 V", quotes: ["Điện áp định mức: 220/380V"] }],
    configs: [{ rank: 1, checks: [{ item: "Tỷ số nén", status: "unclear" }] }],
    notes: ["Tỉ số nén 14:1 là giá trị thiết kế; không động cơ nào trong danh mục ghi đúng 14:1 (QSK23-G2 16,0:1)."] };
  clarifyOf(r, HSMT, null);
  const by = Object.fromEntries(r.clarify.map((x) => [x.item, x]));
  assert.equal(by["Ổn định điện áp"].quoteA, VREG.quote);
  assert.match(by["Ổn định điện áp"].quoteB, /≤ ±1,5%Udm/);
  assert.match(by["Ổn định điện áp"].why, /±0,5% và ±1,5%/);
  assert.ok(by["Tỷ số nén"]);
  assert.equal(by["Điện áp"], undefined); // 220/380 and 380/220: the same figures
  // Without the agent's note the design figure is not asked.
  const r2 = { ...structuredClone(r), notes: [] }; delete r2.clarify;
  assert.equal(clarifyOf(r2, HSMT, null).clarify.some((x) => x.item === "Tỷ số nén"), false);
});

test("B: the scan takes no frequency line for the voltage band, and is off for one size of a multi-size tender", () => {
  const H2 = "Biến thiên điện áp, không tải đến đầy tải     ≤ ± 1%\n-    Biến thiên tần số trạng thái xác lập             ≤ ± 0,25%\nMáy 400 kVA:\nBiến thiên điện áp ≤ ± 0,5%";
  const req = { code: "alt_vreg", item: "Ổn định điện áp", requirement: "≤ ±1%", quote: "Biến thiên điện áp, không tải đến đầy tải     ≤ ± 1%" };
  const one = clarifyOf({ requirements: [req], configs: [] }, H2.split("\nMáy")[0], null);
  assert.equal(one.clarify, undefined);
  // A tender of one size stating two bands is asked; one size of several is not (each size has its own section).
  assert.equal(clarifyOf({ requirements: [req], configs: [] }, H2, null).clarify.length, 1);
  assert.equal(clarifyOf({ requirements: [req], configs: [] }, H2, null, [], { scan: false }).clarify, undefined);
});

test("B: agent clarify kept only when its quotes are in the HSMT; overload on ESP from the code; check again is the same", () => {
  const problems = [];
  const r = { requirements: [], configs: [], clarify: [
    { item: "Điện áp", quoteA: "Điện áp định mức: 220/380V", quoteB: "Điện áp 380/220 V", why: "x" },
    { item: "Bịa", quoteA: "Điện áp 400/230 V", why: "không có trong HSMT" },
    { item: "Một nửa", quoteA: "Điện áp 380/220 V", quoteB: "câu không có", why: "" }] };
  clarifyOf(r, HSMT, { overloadEsp: { quote: "Khả năng quá tải Pmax = 1,1Pdm." } }, problems);
  assert.deepEqual(r.clarify.map((x) => [x.item, x.by]), [["Quá tải trên công suất dự phòng", "code"], ["Điện áp", "agent"]]);
  assert.equal(problems.length, 2);
  const again = clarifyOf(structuredClone(r), HSMT, { overloadEsp: { quote: "Khả năng quá tải Pmax = 1,1Pdm." } });
  assert.deepEqual(again.clarify, r.clarify);
  // Nothing to ask: no field.
  assert.equal(clarifyOf({ requirements: [], configs: [] }, HSMT, null).clarify, undefined);
});

test("C: rebidOf — again only after a price run, same basis, not without power or configurations", () => {
  const result = { configs: [{ rank: 1 }] }, prior = { notifyNo: "IB1", bidName: "Máy 700kVA", basis: { kva: 700, price: 5412000000, capText: "700kVA (tên gói)" }, requestedAt: "2026-11-10T11:23:56.449Z", doneAt: "2026-11-10T11:25:37.033Z", from: "sync" };
  assert.equal(rebidOf({ result, key: "IB1" }), null); // never priced: autoBidprice decides as before
  const d = rebidOf({ prior, result, key: "IB1", now: "2026-11-11T05:00:00.000Z" });
  assert.deepEqual(d.basis, prior.basis);
  assert.equal(d.requestedAt, "2026-11-11T05:00:00.000Z"); assert.equal(d.doneAt, undefined); assert.equal(d.after, "configmatch");
  assert.equal(rebidOf({ prior: { ...prior, basis: { kva: null, price: 1 } }, result }), null);
  assert.equal(rebidOf({ prior, result: { configs: [] } }), null);
  assert.equal(rebidOf({ prior, result: { sizes: [{ result: { configs: [] } }, { error: "x" }] } }), null);
  assert.ok(rebidOf({ prior, result: { sizes: [{ result: { configs: [{}] } }] } }));
  // A bidprice whose request is gone: its basis.
  assert.equal(rebidOf({ price: { result: { basis: { kva: 400, price: 3 } } }, result, key: "K" }).basis.kva, 400);
});

test("C: no loop — the price bot posts bidprice / bidpricereq only, never a configuration request", () => {
  const src = fs.readFileSync(path.join(HERE, "bidprice-bot.mjs"), "utf8");
  assert.ok(!/coll:\s*["'](configreq|configmatch|findreq)/.test(src));
  assert.match(src, /coll: "bidpricereq"/);
});

// A configuration like IB2600603983 #1: every kind of point.
const RQ = [
  { code: "power_prime", item: "Công suất liên tục", part: "genset", level: "core", requirement: "≥ 700 kVA" },
  { code: "engine_make", item: "Hãng động cơ", part: "engine", level: "core", requirement: "G7" },
  { code: "genset_origin", item: "Xuất xứ tổ máy", part: "genset", level: "core", requirement: "Nêu nước lắp ráp" },
  { code: "engine_origin", item: "Xuất xứ động cơ", part: "engine", level: "core", requirement: "G7" },
  { code: "cylinders", item: "Số xi lanh", part: "engine", level: "core", requirement: "≥ 6" },
  { code: "compression", item: "Tỷ số nén", part: "engine", level: "core", requirement: "14:1" },
  { code: "ctl_protection", item: "Bảo vệ, dừng máy", part: "controller", level: "core", parts: [{ item: "Quá tốc" }, { item: "Áp lực dầu thấp" }] },
  { code: "ctl_measure", item: "Đo lường, hiển thị", part: "controller", level: "core", parts: [{ item: "Số giờ" }] },
  { code: "alt_insulation", item: "Cấp cách điện", part: "alternator", level: "core", requirement: "H" },
  { code: "voltage", item: "Điện áp", part: "genset", level: "core", requirement: "400/230 V", quote: "Điện áp 400/230 V" },
  { code: "phases", item: "Số pha", part: "genset", level: "core", requirement: "3 pha 4 dây", quote: "3 pha 4 dây" },
  { code: "alt_avr", item: "Điều chỉnh điện áp (AVR)", part: "alternator", level: "core", requirement: "AVR" },
  { code: "fuel_tank", item: "Bồn nhiên liệu", part: "genset", level: "option", requirement: "500 L" },
  { code: "standards", item: "Tiêu chuẩn, chứng nhận tổ máy (ISO 3046, IEC 60034, CE, ISO 9001)", part: "genset", level: "core", requirement: "ISO 8528" },
  { code: "prototype", item: "Thử nghiệm mẫu (prototype test)", part: "genset", level: "core", requirement: "Biên bản" },
  { code: "ambient", item: "Nhiệt độ môi trường làm việc", part: "genset", level: "core", requirement: "45 °C" },
  { code: "noise", item: "Độ ồn", part: "genset", level: "option", requirement: "≤ 75 dB ở 7 m" },
  { code: "dimensions", item: "Kích thước", part: "genset", level: "option", requirement: "≤ 5800 mm" },
];
const rcfg = () => ({ rank: 1, engine: { model: "QSK23-G2", make: "Cummins" }, alternator: { model: "S5L1D-H41" }, controller: { model: "DSE8610" }, genset: { model: "FDK-CG825E/H1" },
  checks: RQ.map((r) => ({ item: r.item, part: r.part, status: "unclear", ...(r.parts ? { parts: r.parts.map((p) => ({ item: p.item, status: "unclear" })) } : {}) })) });

test("D: rfq order — power first, then make / origin, core model points, site, order, documents, options", () => {
  const c = confirmChecks(rcfg(), RQ), q = rfqOf(c, RQ);
  const tiers = q.map((x) => x.tier);
  assert.deepEqual(tiers, [...tiers].sort((a, b) => a - b));
  assert.equal(q[0].item, "Công suất liên tục");
  assert.deepEqual(q.filter((x) => x.tier === 1).map((x) => x.item), ["Hãng động cơ", "Xuất xứ động cơ", "Xuất xứ tổ máy"]);
  assert.equal(RFQ_TIERS.length, 7);
  // The confirm option (tank) is in the order line, not with the options.
  const order = q.find((x) => x.tier === 4);
  assert.deepEqual(order.items.map((i) => i.item), ["Điều chỉnh điện áp (AVR)", "Điện áp", "Số pha", "Bồn nhiên liệu"]);
  assert.match(order.ask, /^Xác nhận cấu hình đặt hàng đáp ứng: .*Điện áp \(400\/230 V\).*Số pha \(3 pha 4 dây\).*Bồn nhiên liệu \(500 L\)/);
  const docs = q.find((x) => x.tier === 5);
  assert.equal(docs.items.length, 2); assert.match(docs.ask, /^Gửi chứng từ/);
  assert.deepEqual(q.filter((x) => x.tier === 6).map((x) => x.item), ["Độ ồn", "Kích thước"]);
});

test("D: rfq texts — noise at the HSMT's distance, origin asks for the CO; joined lines lose no point", () => {
  const c = confirmChecks(rcfg(), RQ), q = rfqOf(c, RQ);
  const all = q.flatMap((x) => (x.items || [x]).map((i) => [i.item, x]));
  const by = Object.fromEntries(all);
  assert.equal(by["Độ ồn"].ask, "Xác nhận độ ồn ở khoảng cách HSMT nêu, gửi kết quả đo / datasheet vỏ cách âm");
  assert.doesNotMatch(by["Độ ồn"].ask, /giảm công suất/);
  assert.match(by["Nhiệt độ môi trường làm việc"].ask, /giảm công suất/);
  for (const o of ["Xuất xứ tổ máy", "Xuất xứ động cơ"]) assert.equal(by[o].ask, "Nêu nước sản xuất, gửi CO / CQ");
  // Controller functions in one line, engine datasheet points in one line.
  const fn = q.find((x) => x.item === "Chức năng bộ điều khiển");
  assert.match(fn.ask, /Bảo vệ, dừng máy \(Quá tốc, Áp lực dầu thấp\); Đo lường, hiển thị \(Số giờ\)/);
  const eng = q.find((x) => x.item === "Thông số động cơ");
  assert.deepEqual(eng.items.map((i) => i.item), ["Số xi lanh", "Tỷ số nén"]);
  // Every point is in some line, once.
  assert.equal(rfqPoints(q), RQ.length);
  assert.deepEqual(all.map(([i]) => i).sort(), RQ.map((r) => r.item).sort());
  assert.ok(q.length <= 12, `${q.length} lines`);
  // rankConfigs writes the new form.
  assert.ok(rankConfigs({ requirements: RQ, configs: [rcfg()] }).configs[0].rfq.every((x) => Number.isInteger(x.tier)));
});
test("plainWhy bỏ nhãn nội bộ khỏi lý do chọn nhà cung cấp (Khoa 11/11)", () => {
  assert.equal(plainWhy("Chính dòng UP750GF (4006-23TAG2A + S5L1D-H41); genset_oem, độ tin cậy medium; có chào DSE8610"), "Chính dòng UP750GF (4006-23TAG2A + S5L1D-H41); có chào DSE8610");
  assert.equal(plainWhy("Dòng KP750D5 ghi 4006-23TAG2A, prime 750 kVA; genset_oem"), "Dòng KP750D5 ghi 4006-23TAG2A, prime 750 kVA");
  assert.equal(plainWhy("Chào đúng động cơ"), "Chào đúng động cơ");
});
