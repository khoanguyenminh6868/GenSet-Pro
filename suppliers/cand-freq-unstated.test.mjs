// node --test suppliers/*.test.mjs — dòng không ghi tần số (Khoa 24/11/2026): chính dòng / mã / tờ hãng trái gói thì loại,
// chỉ NCC khác ghi tần số kia thì giữ và cần xác nhận.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, freqAskCheck, freqVerdict, hintsOf, hzOfCode } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator |";
const sup = (id, engine, title = "Generator set") => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title, header: [H], rows: [`| ${id}-1 | 750 | 600 | ${engine} | X |`] }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, text) => candidates(C.build(list), { value: 700, unit: "kVA" }, free(text), { suppliers: list });
const inTop = (r, id) => r.top.find((x) => x.u.supplierId === id);
const outOf = (r, id) => r.dropped.find((x) => x.u.supplierId === id);

test("hzOfCode: chỉ đuôi /5, /6 của mã Baudouin; /S (đổi được 50/60 Hz) và mã khác không kết luận", () => {
  assert.equal(hzOfCode({ key: "4M06G25/6" }), 60);
  assert.equal(hzOfCode({ key: "16M33G2250/5^" }), 50);
  assert.equal(hzOfCode({ key: "6M11G2D0/S" }), null);
  assert.equal(hzOfCode({ key: "TAD1350GE" }), null);
  assert.equal(hzOfCode({ key: "ABC/6" }), null);
});

test("dòng không ghi tần số, NCC khác chỉ ghi 60 Hz: giữ ở gói 50 Hz, cần xác nhận", () => {
  const list = [sup("a", "TAD1350GE", "Series 60HZ"), sup("b", "TAD1350GE", "Series 60 Hz"), sup("c", "TAD1350GE")];
  const r = run(list, "Tần số 50 Hz"), x = inTop(r, "c");
  assert.ok(x, "dòng không ghi tần số ở lại");
  assert.equal(x.freqAsk, "others");
  assert.ok(x.why.includes("cần xác nhận tần số: dòng không ghi tần số; NCC khác chỉ ghi 60 Hz"));
  assert.ok(!inTop(r, "a") && !inTop(r, "b"), "dòng tự ghi 60 Hz vẫn bị lọc");
});

test("KHÔNG đối xứng, gói 60 Hz: các dòng khác chỉ ghi 50 Hz (≥ 2) thì loại, why nêu căn cứ; một dòng thì không đủ", () => {
  const list = [sup("a", "TAD1350GE", "Series 50HZ"), sup("b", "TAD1350GE", "Series 50 Hz"), sup("c", "TAD1350GE")];
  const r = run(list, "Tần số 60 Hz"), x = outOf(r, "c");
  assert.ok(!inTop(r, "c"));
  assert.deepEqual(x?.ruled, ["freq"]);
  assert.ok(x.why.some((w) => w.includes("dòng không ghi tần số; các dòng khác của động cơ chỉ ghi 50 Hz")));
  const one = run([sup("a", "TAD1350GE", "Series 50HZ"), sup("c", "TAD1350GE")], "Tần số 60 Hz");
  assert.ok(inTop(one, "c"), "một dòng 50 Hz không đủ để loại");
  const both = run([sup("a", "TAD1350GE", "Series 50HZ"), sup("b", "TAD1350GE", "Series 50 Hz"), sup("d", "TAD1350GE", "Series 60 Hz"), sup("c", "TAD1350GE")], "Tần số 60 Hz");
  assert.ok(inTop(both, "c"), "có dòng ghi 60 Hz thì giữ");
});

test("KHÔNG đối xứng, tài liệu hãng chỉ liệt kê 50 Hz: gói 60 Hz loại khi ≥ 2 dòng, một dòng thì cần xác nhận", () => {
  const s = new Map([["perkins", maker]]), p = { supplierId: "perkins", n: 5001, freq: 50, line: "| P |" }, y = { supplierId: "y", n: 2, freq: 50, line: "| Y |" };
  assert.equal(freqVerdict(engine([p, y, blank]), blank, 60, { sup: s }).kind, "only50");
  assert.equal(freqVerdict(engine([p, blank]), blank, 60, { sup: s }).kind, "makerList");
});

test("mã Baudouin trái gói: loại cả khi không dòng nào ghi tần số, ở cả hai chiều", () => {
  const r50 = run([sup("a", "8M33G770/6")], "Tần số 50 Hz");
  assert.deepEqual(outOf(r50, "a")?.ruled, ["freq"]);
  const r60 = run([sup("b", "6M31G825/5")], "Tần số 60 Hz");
  assert.deepEqual(outOf(r60, "b")?.ruled, ["freq"]);
  assert.ok(inTop(run([sup("a", "8M33G770/6")], "Tần số 60 Hz"), "a"));
});

const maker = { id: "perkins", role: "engine_maker", names: { en: "Perkins" } };
const engine = (uses) => ({ key: "2806CE18TTAG6", make: "Perkins", uses });
const blank = { supplierId: "b", n: 1, line: "| B1 | 750 |" };

const oneSheet = (v, supplierId = "perkins") => new Map([["2806CE18TTAG6", { speeds: v.map((x) => ({ v: x, supplierId, n: 1001, line: `| Speed | ${x} |` })) }]]);

test("tài liệu hãng chỉ LIỆT KÊ model ở phần một tần số: giữ, cần xác nhận, why nêu tài liệu; NCC thường một mình thì không", () => {
  const s = new Map([["perkins", maker], ["x", { id: "x" }]]);
  const v = freqVerdict(engine([{ supplierId: "perkins", n: 5001, freq: 60, line: "| P |" }, blank]), blank, 50, { sup: s });
  assert.equal(v.out, undefined);
  assert.equal(v.ask, true);
  assert.equal(v.kind, "makerList");
  assert.ok(v.why.includes("tài liệu hãng (perkins [5001]) chỉ liệt kê 60 Hz"));
  assert.equal(freqVerdict(engine([{ supplierId: "x", n: 1, freq: 60, line: "| X |" }, blank]), blank, 50, { sup: s }), null);
});

test("tờ riêng của chính model ghi đúng một tốc độ: loại, why nêu tờ; hai tốc độ hoặc tờ không phải của hãng thì chỉ cần xác nhận", () => {
  const s = new Map([["perkins", maker], ["x", { id: "x", role: "engine_maker" }]]);
  const e = engine([{ supplierId: "perkins", n: 5001, freq: 60, line: "| P |" }, blank]);
  const v = freqVerdict(e, blank, 50, { sup: s, sheets: oneSheet([1800]) });
  assert.equal(v.out, true);
  assert.equal(v.kind, "sheet");
  assert.ok(v.why.includes("perkins [1001]") && v.why.includes("1800 v/p"));
  assert.equal(freqVerdict(e, blank, 50, { sup: s, sheets: oneSheet([1500, 1800]) }).kind, "makerList");
  assert.equal(freqVerdict(e, blank, 50, { sup: s, sheets: oneSheet([1800], "x") }).kind, "makerList");
  assert.equal(freqVerdict(e, blank, 60, { sup: s, sheets: oneSheet([1800]) }), null);
});

test("mọi dòng bị loại tần số có why nêu căn cứ: cột tốc độ, tên -60, đuôi mã, tờ riêng", () => {
  const speedRow = { supplierId: "r", n: 1, line: "| R1 | 1800 |", header: ["| Model | Speed |"] };
  assert.ok(freqVerdict({ key: "X1", uses: [speedRow] }, speedRow, 50).why.includes("1800 v/p"));
  const named = { supplierId: "kaihua-genset", n: 1, line: "| HC-BD1500-60 | 1 |" };
  assert.ok(freqVerdict({ key: "X1", uses: [named] }, named, 50).why.includes('đuôi "-60"'));
  const coded = freqVerdict({ key: "8M33G770/6", uses: [blank] }, blank, 50);
  assert.equal(coded.kind, "code");
  assert.ok(coded.why.includes("87 / 87"));
  const r = run([sup("a", "8M33G770/6")], "Tần số 50 Hz");
  assert.ok(outOf(r, "a").why.some((w) => w.includes('đuôi "/6"')), "`dropped` mang why");
});

test("mã Weichai đuôi E201 chưa có quy ước: không loại theo mã; chỉ tài liệu liệt kê 60 Hz thì cần xác nhận", () => {
  assert.equal(hzOfCode({ key: "WP10D264E201" }), null);
  const w = { id: "weichai-power", role: "engine_maker", names: { en: "Weichai Power" } }, s = new Map([["weichai-power", w]]);
  const list = { supplierId: "weichai-power", n: 113, line: "| WPG220*86 | 1800 | WP10D264E201 |", header: ["| Genset | Speed | Engine |"] };
  const v = freqVerdict({ key: "WP10D264E201", make: "Weichai", uses: [list, blank] }, blank, 50, { sup: s });
  assert.equal(v.ask, true);
  assert.equal(v.kind, "makerList");
  assert.ok(v.why.includes("weichai-power [113]"));
});

test("động cơ có dòng ghi đúng tần số gói: không xét theo tờ hãng hay NCC khác", () => {
  const s = new Map([["perkins", maker]]);
  const e = engine([{ supplierId: "perkins", n: 5001, freq: 60, line: "| P |" }, { supplierId: "y", n: 2, freq: 50, line: "| Y |" }, blank]);
  assert.equal(freqVerdict(e, blank, 50, { sup: s }), null);
});

const tag4 = (line, n = 109) => ({ supplierId: "long-gen", n, line });
const LG = "| LGPL-220EV | 160 | 200 | 176 | 220 | 1206J-E70TTAG4 |";
const eTag4 = (u) => ({ key: "1206JE70TTAG4", make: "Perkins", uses: [{ supplierId: "perkins", n: 5001, freq: 60, line: "| P |" }, u] });

test("ngoại lệ tường minh long-gen n109 LGPL-220EV: giữ ở gói 50 Hz; dòng khác của khoá đó vẫn theo luật chung", () => {
  const s = new Map([["perkins", maker]]), u = tag4(LG);
  assert.deepEqual(freqVerdict(eTag4(u), u, 50, { sup: s }), { ask: true, kind: "listed", why: "NCC ghi 50 Hz, tờ hãng chỉ ghi 60 Hz" });
  const other = tag4("| LGPL-250EV | 160 | 200 | 176 | 220 | 1206J-E70TTAG4 |");
  assert.equal(freqVerdict(eTag4(other), other, 50, { sup: s }).kind, "makerList");
  const otherTable = tag4(LG, 110);
  assert.equal(freqVerdict(eTag4(otherTable), otherTable, 50, { sup: s }).kind, "makerList");
});

test("check: dòng cần xác nhận thì mục tần số là confirm, chạy lại y nguyên; mục không đạt giữ nguyên", () => {
  const s = new Map([["perkins", maker]]), u = tag4(LG), e = eTag4(u), built = { engines: [e] };
  const reqs = [{ code: "frequency", part: "genset", item: "Tần số", requirement: "50 Hz", quote: "Tần số 50 Hz" }];
  const c = { checks: [{ item: "Tần số", status: "met", part: "genset", sourceQuote: "x" }] };
  freqAskCheck(c, reqs, u, built, s);
  assert.equal(c.checks[0].status, "confirm");
  assert.ok(c.checks[0].note.includes("NCC ghi 50 Hz, tờ hãng chỉ ghi 60 Hz"));
  assert.equal(c.checks[0].sourceQuote, undefined);
  const once = JSON.stringify(c);
  freqAskCheck(c, reqs, u, built, s);
  assert.equal(JSON.stringify(c), once);
  const bad = { checks: [{ item: "Tần số", status: "not_met", part: "genset" }] };
  freqAskCheck(bad, reqs, u, built, s);
  assert.equal(bad.checks[0].status, "not_met");
});
