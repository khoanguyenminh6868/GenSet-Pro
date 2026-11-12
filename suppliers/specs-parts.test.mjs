// specs: a Chương V longer than one call is read in parts and joined by code (partsOf, specsMerge, specsFinish in
// bot/genbid-hsmt/genbid-sync.js, which is not a module: the code is cut out of it and run in a vm).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bot", "genbid-hsmt", "genbid-sync.js"), "utf8");
const cut = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); assert.ok(i > 0 && j > i, `không thấy ${a}`); return src.slice(i, j); };
const code = [cut("const plainVi", "function chapterV"), cut("const setsOf", "function histConfigOf"), cut("const lineOf", "const pdftotext"),
  cut("function specsFinish", "async function specsRound"), cut("const normTxt", "async function runFinish")].join("\n");
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const X = vm.runInNewContext(code + "\n({ partsOf, specsMerge, specsFinish, specsEmpty, partHead, densestCut })", { fs, path, os, readJson, console });

const mk = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("\n");
const spec = (item, requirement, quote = requirement) => ({ item, requirement, quote, reference: null });
const set = (o) => ({ qty: null, primeKva: null, standbyKva: null, primeKw: null, standbyKw: null, phases: null, quote: null, ...o });

test("partsOf: a text that fits is one part", () => {
  const p = X.partsOf("a\nb\nc\n", 100);
  assert.equal(p.length, 1);
  assert.equal(p[0].text, "a\nb\nc\n");
});

test("partsOf: whole lines, each part within max, overlap, every line covered, ranges named", () => {
  const t = mk(3000, (i) => `Dòng ${i + 1}: ${"x".repeat(50 + (i % 40))}`) + "\n";
  const p = X.partsOf(t, 30000, 2000);
  const total = t.length, n0 = Math.ceil((total - 2000) / 28000);
  assert.ok(p.length >= n0 && p.length <= n0 + 1, `parts ${p.length} vs ${n0}`);
  for (const [k, x] of p.entries()) {
    assert.ok(x.text.length <= 30000);
    assert.ok(x.text.startsWith("Dòng "), "starts at a line start");
    assert.ok(x.text.endsWith("\n"), "ends at a line end");
    assert.ok(t.includes(x.text));
    if (k) { assert.ok(x.from <= p[k - 1].to, "overlaps the part before"); assert.ok(x.from > p[k - 1].from); }
  }
  assert.equal(p[0].from, 1);
  assert.equal(p.at(-1).to, 3000);
  const lines = new Set(p.flatMap((x) => x.text.split("\n").filter(Boolean)));
  assert.equal(lines.size, 3000);
});

test("partsOf: the last line of a part is the first of the next (a table row is not split)", () => {
  const t = mk(2000, (i) => `Hàng ${i}: động cơ 6 xi lanh ${"y".repeat(60)}`) + "\n";
  const p = X.partsOf(t, 20000, 1500);
  for (let k = 1; k < p.length; k++) {
    const lastRow = p[k - 1].text.trimEnd().split("\n").at(-1);
    assert.ok(p[k].text.includes(lastRow), "last line of a part is in the next one");
  }
});

test("partsOf: a very long line is cut in pieces, not lost", () => {
  const t = "a\n" + "z".repeat(50000) + "\nb\n";
  const p = X.partsOf(t, 10000, 500);
  assert.ok(p.every((x) => x.text.length <= 10000));
  assert.ok(p.map((x) => x.text).join("").split("z").length - 1 >= 50000);
});

test("specsMerge: technicalSpecs joined, the overlap read twice kept once", () => {
  const r = X.specsMerge([
    { i: 1, v: { technicalSpecs: [spec("Động cơ", "6 xi lanh", "Động cơ 6 xi lanh"), spec("Đầu phát", "Stamford")] } },
    { i: 2, v: { technicalSpecs: [spec("Động cơ", "6 xi lanh", "Động cơ  6 xi lanh."), spec("ATS", "800A")] } },
  ]);
  assert.deepEqual([...r.technicalSpecs.map((s) => s.item)], ["Động cơ", "Đầu phát", "ATS"]);
  assert.equal(r.conflicts.length, 0);
});

test("specsMerge: same item, other figures in two parts: both kept, unverified, said in the notes", () => {
  const r = X.specsMerge([
    { i: 1, v: { technicalSpecs: [spec("Điện áp", "400 V", "điện áp 400 V")] } },
    { i: 2, v: { technicalSpecs: [spec("Điện áp", "230 V", "điện áp 230 V")] } },
  ]);
  assert.equal(r.technicalSpecs.length, 2);
  assert.ok(r.technicalSpecs.every((s) => s.unverified));
  assert.match(r.conflicts[0], /phần 1 và phần 2/);
});

test("specsMerge: the same quote with other figures is not chosen between", () => {
  const r = X.specsMerge([
    { i: 1, v: { technicalSpecs: [spec("Công suất", "500 kVA", "công suất 500 kVA")] } },
    { i: 2, v: { technicalSpecs: [spec("Công suất máy", "550 kVA", "công suất 500 kVA")] } },
  ]);
  assert.equal(r.technicalSpecs.length, 1);
  assert.equal(r.technicalSpecs[0].unverified, true);
  assert.equal(r.conflicts.length, 1);
});

test("specsMerge: generatorSets joined by size, nulls filled from the other part", () => {
  const r = X.specsMerge([
    { i: 1, v: { generatorSets: [set({ standbyKva: 500, quote: "máy 500 kVA dự phòng" })] } },
    { i: 2, v: { generatorSets: [set({ standbyKva: 500, qty: 2, phases: 3 }), set({ standbyKva: 250, qty: 1 })] } },
  ]);
  assert.equal(r.generatorSets.length, 2);
  const s500 = r.generatorSets.find((s) => s.standbyKva === 500);
  assert.equal(s500.qty, 2); assert.equal(s500.phases, 3); assert.equal(s500.quote, "máy 500 kVA dự phòng");
  assert.equal(r.conflicts.length, 0);
});

test("specsMerge: sets of the same size stated differently: the field is null, not chosen, a note", () => {
  const r = X.specsMerge([
    { i: 1, v: { generatorSets: [set({ primeKva: 400, qty: 2 })] } },
    { i: 2, v: { generatorSets: [set({ primeKva: 400, qty: 3 })] } },
    { i: 3, v: { generatorSets: [set({ primeKva: 400, qty: 2 })] } },
  ]);
  assert.equal(r.generatorSets.length, 1);
  assert.equal(r.generatorSets[0].qty, null);
  assert.equal(r.generatorSets[0].primeKva, 400);
  assert.equal(r.conflicts.length, 1);
  assert.match(r.conflicts[0], /số lượng 2 \(phần 1\) khác 3 \(phần 2\)/);
});

test("specsMerge: prime and standby of the same number are other sizes", () => {
  const r = X.specsMerge([{ i: 1, v: { generatorSets: [set({ primeKva: 500 })] } }, { i: 2, v: { generatorSets: [set({ standbyKva: 500 })] } }]);
  assert.equal(r.generatorSets.length, 2);
});

test("specsMerge: generatorCapacity — the same text once; different texts: made from the sets, or null with a note", () => {
  assert.equal(X.specsMerge([{ i: 1, v: { generatorCapacity: "500 kVA dự phòng" } }, { i: 2, v: { generatorCapacity: "500 KVA dự phòng" } }]).generatorCapacity, "500 kVA dự phòng");
  const a = X.specsMerge([{ i: 1, v: { generatorCapacity: "500 kVA", generatorSets: [set({ standbyKva: 500, qty: 2 })] } }, { i: 2, v: { generatorCapacity: "250 kVA", generatorSets: [set({ standbyKva: 250 })] } }]);
  assert.equal(a.generatorCapacity, "2 x 500 kVA dự phòng + 250 kVA dự phòng");
  const b = X.specsMerge([{ i: 1, v: { generatorCapacity: "500 kVA" } }, { i: 2, v: { generatorCapacity: "250 kVA" } }]);
  assert.equal(b.generatorCapacity, null);
  assert.match(b.conflicts[0], /chưa rõ/);
});

test("specsFinish: parts without generator content are skipped; all empty is none; checkResult runs on the whole text", () => {
  const body = "Chương V. Yêu cầu kỹ thuật. Máy phát điện diesel công suất dự phòng 500 kVA, động cơ 6 xi lanh, đầu phát Stamford. ".repeat(6);
  const t = { notifyNo: "IB1", bidName: "thử" };
  const good = { generatorCapacity: "500 kVA dự phòng", generatorSets: [set({ standbyKva: 500, quote: "công suất dự phòng 500 kVA" })], technicalSpecs: [spec("Động cơ", "6 xi lanh", "động cơ 6 xi lanh"), spec("Làm mát", "gió 777", "bịa đặt không có")] };
  const f = X.specsFinish(t, [{ i: 1, v: { _error: "không có" } }, { i: 2, v: good }, { i: 3, v: { _error: "không có" } }], body, { n: 3, len: 12345 });
  assert.equal(f.none, undefined);
  assert.equal(f.result.technicalSpecs.length, 2);
  assert.equal(f.result.technicalSpecs[1].unverified, true, "figure not in the text");
  assert.equal(f.result.keyInfo.generatorCapacity, "500 kVA dự phòng");
  assert.match(f.v._notes[0], /đọc hết bằng 3 lần gọi/);
  assert.ok(!f.v._notes.some((n) => /đã lược/.test(n)));
  const g = X.specsFinish(t, [{ i: 1, v: { _error: "gói lưới điện" } }, { i: 2, v: { _error: "không có" } }], body, { n: 2, len: 1 });
  assert.match(g.none, /gói lưới điện/);
  assert.match(g.none, /cả 2 phần/);
});

test("specsFinish: a joined set's quote that is not in the text is dropped", () => {
  const body = "Máy phát điện công suất dự phòng 500 kVA, 3 pha, động cơ diesel làm mát bằng nước. ".repeat(8);
  const f = X.specsFinish({ notifyNo: "IB1" }, [{ i: 1, v: { generatorSets: [set({ standbyKva: 500, quote: "câu này không có trong văn bản gốc" })], technicalSpecs: [] } }, { i: 2, v: { technicalSpecs: [spec("Pha", "3 pha", "3 pha")] } }], body, { n: 2, len: 1 });
  assert.equal(f.result.generatorSets[0].quote, null);
  assert.ok(f.checked.some((n) => /trích dẫn của máy/.test(n)));
});
