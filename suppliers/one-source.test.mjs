// node --test suppliers/one-source.test.mjs — bộ kiểm giá trị một nguồn internet (one-source-check.mjs, PR 1 của thiết kế
// nghiem-thu/gia-tri-mot-nguon-thiet-ke.md, Khoa duyệt 24/11/2026). Mọi bản ghi, tệp nguồn, danh mục, fact tờ hãng ở đây là
// fixture trong test (ctx dựng tay), KHÔNG ghi vào suppliers/one-source.json thật.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import "../web/catalog.js";
import { checkOneSource, runOneSource, FILE } from "./one-source-check.mjs";

const CAT = globalThis.GenbidCatalog;
const FIELDS = JSON.parse(fs.readFileSync(new URL("./spec-fields.json", import.meta.url), "utf8")).parts;

const PAGES = {
  "sources/one-source/1.md": [
    "URL: https://example.com/lsa46.pdf",
    "Accessed: 2026-11-24",
    "",
    "Ratings 50 Hz - 1500 R.P.M.",
    "| Duty/T°C | Continuous duty/40°C | Stand-by/40°C",
    "| Class/T°K | H/125°K | H/163°K",
    "| Y | 400V",
    "46.2 L9 kVA 280 300",
    "Number of poles 4 poles",
    "Insulation class H",
  ].join("\n"),
  "sources/one-source/2.md": "URL: https://example.org/6m33.html\nAccessed: 2026-11-20\n\n6M33 engine Displacement 32.1 L, Cylinders 6\nCompression ratio 15.0:1\nPrime power at 1500 rpm\n",
};

// Danh mục, tờ hãng, hồ sơ của fixture.
function ctxOf(extra = {}) {
  return {
    fields: FIELDS,
    readSource: (f) => PAGES[f] ?? null,
    keyOf: CAT.keyOf,
    entries: {
      engine: new Map([["6M33G6D2/5", { makes: [{ name: "Baudouin", via: "dòng bảng" }] }], ["D17", { makes: [{ name: "Volvo Penta" }, { name: "Deutz" }] }]]),
      alternator: new Map([["LSA462L9", { makes: [{ name: "Leroy-Somer" }] }]]),
      controller: new Map(),
    },
    facts: new Map([["engine:6M33G6D2/5", [{ key: "cyl", value: "6", supplierId: "weichai-power", n: 119, line: "| WPG700*7 | 6M33G6D2/5 | 6 |", sheet: true }]]]),
    altRatings: new Map(), altAttrs: new Map(), engRatings: new Map(),
    suppliers: new Map([["leroy-somer-fuzhou", { role: "alternator_maker", sources: new Set([1007, 6003]) }], ["weichai-power", { role: "engine_maker", sources: new Set([119]) }]]),
    ...extra,
  };
}

// Một bản ghi hợp lệ: định mức LSA 46.2 L9, 400 V 50 Hz liên tục H/125K, 280 kVA (giá trị của fixture, không phải số thật đã đọc).
const GOOD = {
  id: "ls-lsa462-l9-ratings-1", part: "alternator", make: "Leroy-Somer", model: "LSA 46.2 L9", key: "LSA462L9", field: "ratings",
  value: { voltage: 400, connection: null, phases: null, hz: 50, duty: "continuous", insulation_rise: "H/125K", kva: 280, kw: null, efficiency_pct: null },
  unit: null, cond: null, level: 2, url: "https://example.com/lsa46.pdf", file: "sources/one-source/1.md", accessedAt: "2026-11-24",
  quote: ["46.2 L9 kVA 280 300"], condQuote: ["Ratings 50 Hz - 1500 R.P.M.", "| Duty/T°C | Continuous duty/40°C | Stand-by/40°C", "| Class/T°K | H/125°K | H/163°K", "| Y | 400V"],
  makerChecked: [{ supplierId: "leroy-somer-fuzhou", n: [1007, 6003], note: "không tờ nào ghi LSA 46.2" }], addedBy: "test", note: "",
};
const run = (recs, extra) => checkOneSource(recs, ctxOf(extra));
const msgs = (r) => r.errors.map((e) => e.msg);
const has = (r, re) => assert.ok(msgs(r).some((m) => re.test(m)), `không thấy lỗi ${re} trong ${JSON.stringify(msgs(r))}`);

test("bản ghi hợp lệ: không lỗi", () => {
  const r = run([GOOD]);
  assert.deepEqual(r.errors, []);
});

test("one-source.json thật: danh sách, và tệp rỗng không dựng danh mục", async () => {
  const recs = JSON.parse(fs.readFileSync(FILE, "utf8"));
  assert.ok(Array.isArray(recs));
  if (!recs.length) {
    const out = [];
    assert.equal(await runOneSource({ log: (s) => out.push(s) }), 0);
    assert.match(out[0], /0 bản ghi/);
  }
});

test("1. khoá lạ, part / field / level sai, thiếu khoá", () => {
  has(run([{ ...GOOD, conv: "kW→kVA" }]), /khoá lạ "conv"/);
  has(run([{ ...GOOD, part: "genset" }]), /part "genset"/);
  has(run([{ ...GOOD, field: "kva" }]), /field "kva" không có/);
  has(run([{ ...GOOD, field: "model", value: "LSA 46.2 L9" }]), /danh tính/);
  has(run([{ ...GOOD, level: 4 }]), /level 4/);
  const { url, ...noUrl } = GOOD;
  has(run([noUrl]), /thiếu url/);
  has(run([{ ...GOOD, value: { ...GOOD.value, kvar: 1 } }]), /cột lạ kvar/);
});

test("2. nguồn: url / accessedAt khác đầu tệp, tệp không có", () => {
  has(run([{ ...GOOD, url: "https://example.com/other.pdf" }]), /url khác dòng đầu/);
  has(run([{ ...GOOD, accessedAt: "2026-11-23" }]), /accessedAt 2026-11-23 khác/);
  has(run([{ ...GOOD, file: "sources/one-source/9.md" }]), /thiếu tệp nguồn/);
  has(run([{ ...GOOD, file: "sources/leroy-somer-fuzhou/1007.md" }]), /phải là sources\/one-source/);
});

test("3. câu trích không có trong tệp, câu quá ngắn", () => {
  has(run([{ ...GOOD, quote: ["46.2 L9 kVA 280 290"] }]), /không tìm thấy câu trích "46.2 L9 kVA 280 290"/);
  has(run([{ ...GOOD, condQuote: [...GOOD.condQuote, "| Y | 415V"] }]), /condQuote: không tìm thấy/);
  has(run([{ ...GOOD, quote: ["280"] }]), /dưới 8 ký tự/);
});

test("4. câu trích thiếu số của giá trị / điều kiện", () => {
  // 290 kVA: câu trích có thật nhưng không chứa 290.
  has(run([{ ...GOOD, value: { ...GOOD.value, kva: 290 } }]), /giá trị kva = 290 không có trong quote/);
  // Số chỉ có ở câu điều kiện không đủ cho giá trị: 400 là điện áp, không phải kVA.
  has(run([{ ...GOOD, value: { ...GOOD.value, kva: 400 } }]), /giá trị kva = 400/);
  // Điều kiện không ở đâu cả: 415 V.
  has(run([{ ...GOOD, value: { ...GOOD.value, voltage: 415 } }]), /điều kiện voltage = 415/);
  // Thiếu câu tiêu đề cột: điều kiện không còn căn cứ.
  has(run([{ ...GOOD, condQuote: [] }]), /điều kiện hz = 50/);
  // Số trơn.
  const disp = { ...GOOD, id: "b-6m33-disp", part: "engine", make: "Baudouin", model: "6M33G6D2/5", key: "6M33G6D2/5", field: "displacement", value: 32.1, unit: "L",
    url: "https://example.org/6m33.html", file: "sources/one-source/2.md", accessedAt: "2026-11-20", quote: ["6M33 engine Displacement 32.1 L"], condQuote: [], makerChecked: [{ supplierId: "weichai-power", n: [119] }] };
  assert.deepEqual(run([disp]).errors, []);
  has(run([{ ...disp, value: 32.2 }]), /giá trị 32.2 không có trong quote/);
});

test("5. key khác keyOf(model), make không phải hãng của khoá", () => {
  has(run([{ ...GOOD, key: "LSA462" }]), /key LSA462 khác keyOf/);
  has(run([{ ...GOOD, make: "Stamford" }]), /make "Stamford" không phải hãng của khoá LSA462L9/);
  // Khoá hai hãng (D17: Volvo Penta / Deutz): make phải khớp đúng một.
  const d17 = { ...GOOD, id: "d17-x", part: "engine", make: "Cummins", model: "D17", key: "D17", field: "cyl_layout", value: "inline", quote: ["46.2 L9 kVA 280 300"], condQuote: [] };
  has(run([d17]), /make "Cummins" không phải hãng của khoá D17 .*Volvo Penta \/ Deutz/);
  assert.ok(!msgs(run([{ ...d17, make: "Deutz" }])).some((m) => /không phải hãng/.test(m)));
  // Khoá chưa có trong danh mục: chỉ lưu ý (Q9).
  const r = run([{ ...GOOD, model: "LSA 46.2 M5", key: "LSA462M5" }]);
  assert.ok(!msgs(r).some((m) => /hãng của khoá/.test(m)));
  assert.ok(r.warnings.some((w) => /không có trong danh mục/.test(w.msg)));
});

test("6. đè số của tờ hãng: fact sheet, định mức tờ hãng, thuộc tính tờ hãng", () => {
  // Số xi lanh: tờ của Weichai / Baudouin đã ghi (fact sheet: true, khoá cyl).
  const cyl = { ...GOOD, id: "b-6m33-cyl", part: "engine", make: "Baudouin", model: "6M33G6D2/5", key: "6M33G6D2/5", field: "cylinders", value: 6, unit: null,
    url: "https://example.org/6m33.html", file: "sources/one-source/2.md", accessedAt: "2026-11-20", quote: ["6M33 engine Displacement 32.1 L, Cylinders 6"], condQuote: [], makerChecked: [{ supplierId: "weichai-power", n: [119] }] };
  has(run([cyl]), /tờ hãng trong repo đã ghi cylinders của 6M33G6D2\/5: weichai-power nguồn 119/);
  // Fact không phải tờ hãng (sheet không có) thì không chặn.
  const notSheet = new Map([["engine:6M33G6D2/5", [{ key: "cyl", value: "6", supplierId: "x", n: 101, line: "| 6 |" }]]]);
  assert.deepEqual(run([cyl], { facts: notSheet }).errors, []);
  // Định mức: tờ hãng (alternator_maker) có dòng cùng điện áp, tần số, mức, cấp → chặn; khác cấp → không.
  const row = (rise) => ({ part: "alternator", model: "LSA 46.2 L9", hz: 50, duty: "Cont.", rise, phase: 3, volt: 400, kVA: 280, supplierId: "leroy-somer-fuzhou", n: 1007, lines: ["| LSA 46.2 L9 | kVA | 280"] });
  has(run([GOOD], { altRatings: new Map([["LSA462L9", [row("H:125K Continuous/ 40°C")]]]) }), /tờ hãng trong repo đã ghi ratings của LSA462L9: leroy-somer-fuzhou nguồn 1007/);
  assert.deepEqual(run([GOOD], { altRatings: new Map([["LSA462L9", [row("F:105K Continuous/ 40°C")]]]) }).errors, []);
  // Cùng dòng nhưng hồ sơ không phải hãng đầu phát: không tính là tờ hãng.
  assert.deepEqual(run([GOOD], { altRatings: new Map([["LSA462L9", [{ ...row("H:125K"), supplierId: "weichai-power" }]]]) }).errors, []);
  // Thuộc tính tờ hãng: cấp cách điện.
  const ins = { ...GOOD, id: "ls-lsa462-ins", field: "insulation", value: "H", quote: ["Insulation class H"], condQuote: [] };
  has(run([ins], { altAttrs: new Map([["LSA462L9", [{ key: "insulation", value: "H", lines: ["| Insulation class | H"], supplierId: "leroy-somer-fuzhou", n: 6003 }]]]) }), /đã ghi insulation/);
  // Công suất động cơ: tờ hãng có prime cùng tốc độ.
  const kwm = { ...cyl, id: "b-6m33-kwm", field: "power_kwm", value: { rating: "prime", kwm: 32.1, rpm: null }, quote: ["6M33 engine Displacement 32.1 L"], condQuote: ["Prime power at 1500 rpm"] };
  has(run([kwm], { facts: new Map([["engine:6M33G6D2/5", [{ key: "engPrime", kW: 500, rpm: 1500, maker: true, supplierId: "weichai-power", n: 119, line: "| Prime | 500 |" }]]]) }), /đã ghi power_kwm/);
  assert.deepEqual(run([kwm], { facts: new Map([["engine:6M33G6D2/5", [{ key: "engStandby", kW: 550, rpm: 1500, maker: true, supplierId: "weichai-power", n: 119, line: "| Standby | 550 |" }]]]) }).errors, []);
});

test("6. trường không kiểm tự động được: lưu ý và makerChecked phải có", () => {
  const poles = { ...GOOD, id: "ls-lsa462-poles", field: "poles", value: 4, quote: ["Number of poles 4 poles"], condQuote: [] };
  const r = run([poles]);
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some((w) => /không kiểm tự động/.test(w.msg)));
  has(run([{ ...poles, makerChecked: [], note: "đã tìm leroy-somer.com" }]), /makerChecked rỗng: trường poles/);
  // Trường kiểm được: makerChecked rỗng cần note.
  has(run([{ ...GOOD, makerChecked: [] }]), /makerChecked rỗng thì note/);
  assert.deepEqual(run([{ ...GOOD, makerChecked: [], note: "hãng chưa có tài liệu trong repo; đã tìm leroy-somer.com" }]).errors, []);
});

test("7. trùng và mâu thuẫn", () => {
  has(run([GOOD, { ...GOOD, id: "ls-lsa462-l9-ratings-2", level: 3 }]), /trùng ls-lsa462-l9-ratings-1/);
  // Cùng điều kiện, khác kVA: mâu thuẫn (300 có trong câu trích nên mỗi bản tự nó hợp lệ).
  const other = { ...GOOD, id: "ls-lsa462-l9-ratings-3", value: { ...GOOD.value, kva: 300 } };
  has(run([GOOD, other]), /mâu thuẫn với ls-lsa462-l9-ratings-1/);
  // Khác điều kiện (mức standby H/163K): hai dòng định mức, không trùng.
  const sb = { ...GOOD, id: "ls-lsa462-l9-ratings-4", value: { ...GOOD.value, duty: "standby", insulation_rise: "H/163K", kva: 300 } };
  assert.deepEqual(run([GOOD, sb]).errors, []);
  has(run([GOOD, { ...sb, id: GOOD.id }]), /id trùng/);
});

test("8. makerChecked trỏ hồ sơ / nguồn không có", () => {
  has(run([{ ...GOOD, makerChecked: [{ supplierId: "leroy-somer-xyz", n: [1007] }] }]), /không có hồ sơ leroy-somer-xyz/);
  has(run([{ ...GOOD, makerChecked: [{ supplierId: "leroy-somer-fuzhou", n: [1007, 9999] }] }]), /nguồn 9999 không có trong leroy-somer-fuzhou/);
  has(run([{ ...GOOD, makerChecked: [{ supplierId: "leroy-somer-fuzhou", n: [1007], seen: true }] }]), /makerChecked\[0\]: khoá lạ "seen"/);
});

test("lưu ý bậc 3 khi cùng model đã có bậc 1 / 2", () => {
  const poles = { ...GOOD, id: "ls-lsa462-poles", field: "poles", value: 4, level: 3, quote: ["Number of poles 4 poles"], condQuote: [] };
  const r = run([GOOD, poles]);
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some((w) => w.id === "ls-lsa462-poles" && /bậc 3 trong khi/.test(w.msg)));
});

test("runOneSource trên tệp fixture: đọc lỗi JSON, không phải danh sách", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "one-source-"));
  const f = path.join(dir, "x.json");
  fs.writeFileSync(f, "[{");
  assert.equal(await runOneSource({ file: f, log: () => {} }), 1);
  fs.writeFileSync(f, "{}");
  assert.equal(await runOneSource({ file: f, log: () => {} }), 1);
  fs.rmSync(dir, { recursive: true, force: true });
});
