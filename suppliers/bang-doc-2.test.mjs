// node --test suppliers/bang-doc-2.test.mjs — bảng dọc, chặng 2 (`verticalRecords` + `verticalTitleModel` trong web/catalog.js):
// bảng dọc một tổ máy KHÔNG có dòng "Model" ở 8 dòng đầu, model tổ máy lấy ở TIÊU ĐỀ trang (nhóm V2 / V5 / F1 của
// dau-vao-bang-doc). Mọi hàng rào của chặng 1 giữ nguyên; thêm: tiêu đề phải cho ĐÚNG MỘT mã qua isCode.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { modelFacts } from "./config-bot.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const C = globalThis.GenbidCatalog;
const cn = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const only = (s, n) => ({ ...s, specTables: s.specTables.filter((t) => t.n === n) });
const V = (o) => o.sheet === "bảng dọc";
const fake = (title, rows, id = "x") => ({ id, country: "CN", sources: [], specTables: [{ n: 1, title, header: [], rows }] });
const run = (title, rows) => { const notes = []; return { r: C.fromSupplier(fake(title, rows), notes), notes: notes.map((x) => x.reason) }; };
const SHEET = ["| Prime Power | 100kVA/80kW", "| Standby Power | 110kVA/88kW", "| Rated Speed | 1500rpm", "| Voltage | 400V", "| Frequency | 50Hz", "| Engine Brand / Model | Cummins 6BTA5.9-G2", "| Displacement | 5.9L"];

test("model một mã ở tiêu đề → bản ghi động cơ, genset theo tiêu đề, gensetFrom", () => {
  const { r } = run("AB-100 Diesel Generator 100 kVA - Technical data", SHEET);
  assert.equal(r.length, 1);
  const o = r[0];
  assert.deepEqual([o.kind, o.model, o.genset, o.sheet, o.gensetFrom, o.freq], ["engine", "6BTA5.9-G2", "AB-100", "bảng dọc", "tiêu đề trang", 50]);
  assert.deepEqual(o.power, { prime: { kVA: 100, kW: 80 }, standby: { kVA: 110, kW: 88 } });
});

test("tiêu đề mơ hồ hoặc không phải model: không bản ghi, ghi lý do", () => {
  const cases = [
    ["AB-100/120 Diesel Generator", /mã lẫn công suất \/ nhiều lựa chọn/], // "/" = lựa chọn
    ["AB-100 / AB-120 Diesel Generator", /hai mã trở lên/],
    ["AB-100 Genset with UCI274H alternator", /hai mã trở lên/],
    ["QSV Series QSV250PS", /dòng sản phẩm \/ series/],
    ["Diesel Generators from 9kVA to 100kVA-KACHAI", /dòng sản phẩm \/ series/],
    ["HJM12-600KW-Jiangsu Nenjo Generator", /mã lẫn công suất/],
    ["Diesel Generator Set 100 kVA", /không có mã/],
  ];
  for (const [title, why] of cases) {
    const x = run(title, SHEET);
    assert.equal(x.r.length, 0, title);
    assert.ok(x.notes.some((n) => n.startsWith("bảng dọc (model ở tiêu đề): ") && why.test(n)), `${title}: ${x.notes.join("; ")}`);
  }
});

test("giữ hàng rào chặng 1: model tiêu đề là mã động cơ / đầu phát, prime > standby, không mã động cơ, công suất không nhãn", () => {
  let x = run("6BTA5.9-G2 Diesel Generator", SHEET); // tiêu đề chỉ ghi mã động cơ
  assert.equal(x.r.length, 0);
  assert.ok(x.notes.some((n) => /trùng \/ giống/.test(n)));
  x = run("UCI274H 100kVA", SHEET.slice(2).concat(["| Prime Power | 100kVA/80kW"]));
  assert.equal(x.r.length, 0);
  x = run("GR6500 Portable Generator", ["| Stand-by Power (STP) | 13,8kVA", "| Prime Power (PRP) | 15kVA", "| Engine Brand / Model | Honda GX390"]); // như grupel n107
  assert.equal(x.r.length, 0);
  assert.ok(x.notes.some((n) => /prime lớn hơn standby/.test(n)));
  x = run("AB-100 Diesel Generator", SHEET.filter((l) => !/Engine/.test(l)));
  assert.equal(x.r.length, 0);
  assert.ok(x.notes.some((n) => /không có mã động cơ/.test(n)));
  x = run("AB-100 Diesel Generator", ["| Output | 100kVA", "| Engine Brand / Model | Cummins 6BTA5.9-G2"]);
  assert.equal(x.r.length, 0);
  assert.ok(x.notes.some((n) => /không có công suất prime \/ standby/.test(n)));
});

test("bảng có dòng Model riêng (sau 8 dòng đầu) không lấy model ở tiêu đề", () => {
  const rows = ["| Prime Power | 100kVA/80kW", "| Standby Power | 110kVA/88kW", "| Voltage | 400V", "| Phase | 3", "| Power Factor | 0.8", "| Fuel tank | 200L", "| Noise | 72dB", "| Weight | 1500kg", "| Model | CD-200", "| Engine Brand / Model | Cummins 6BTA5.9-G2"];
  const x = run("AB-100 Diesel Generator", rows);
  assert.equal(x.r.length, 0);
  assert.ok(x.notes.some((n) => /dòng Model riêng/.test(n)), x.notes.join("; "));
});

test("speed / voltage / freq của tổ máy không vào facts của khoá động cơ", () => {
  const s = fake("AB-100 Diesel Generator 100 kVA", SHEET, "x-v2");
  const cat = C.build([s]);
  const e = cat.engines.find((x) => x.key === C.keyOf("6BTA5.9-G2"));
  assert.ok(e && e.uses.some((u) => u.sheet === "bảng dọc" || u.genset === "AB-100"), "bản ghi bảng dọc vào uses");
  const f = modelFacts(cat, [s]).get(`engine:${C.keyOf("6BTA5.9-G2")}`) || [];
  assert.deepEqual([...new Set(f.map((x) => x.key))].sort(), ["disp"]);
  assert.ok(!f.some((x) => /speed|voltage|freq/.test(x.key) || /1500|400V|50Hz/i.test(x.value)));
});

test("bảng thật: không bảng V2 / V5 / F1 nào qua đủ hàng rào (đo 21/11/2026)", () => {
  const cases = [
    ["pramac", 2002, /không có mã động cơ/], // "• Engine MTU 12V4000G61": dòng chấm đầu dòng, không phải ô nhãn | giá trị
    ["stephill", 2008, /không có công suất prime \/ standby/], // "OUTPUT: | 136.8kVA / 109.5kW" không ghi mức
    ["cgen-alternator", 2001, /nhiều lựa chọn/], // "MYI182/184"
    ["kachai-hangzhou", 104, /series/],
    ["lei-shing-hong", 2001, /không có mã động cơ/], // tiêu đề là mã động cơ "4006-23TAG3A E-unit", không có dòng động cơ
  ];
  for (const [id, n, why] of cases) {
    const notes = [], r = C.fromSupplier(only(cn(id), n), notes).filter((o) => o.n === n && V(o));
    assert.equal(r.length, 0, `${id} n${n}`);
    assert.ok(notes.some((x) => x.n === n && x.reason.startsWith("bảng dọc (model ở tiêu đề): ") && why.test(x.reason)), `${id} n${n}: ${notes.map((x) => x.reason).join("; ")}`);
  }
});

test("toàn bộ cn/: bản ghi model tiêu đề (nếu có) có đúng mã đó trong tiêu đề, có prime / standby, không trùng khoá động cơ / đầu phát", () => {
  const dir = path.join(ROOT, "cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const b = C.build(S);
  const parts = new Set([...b.engines, ...b.alternators].map((e) => e.key.replace(/^.*\|/, "")));
  for (const s of S) {
    if (s.status === "incomplete") continue;
    for (const o of C.fromSupplier(s).filter((x) => V(x) && x.gensetFrom)) {
      assert.ok(String(o.title).normalize("NFKC").includes(o.genset), `${s.id} n${o.n}: ${o.genset} không có trong tiêu đề`);
      assert.ok(!parts.has(C.keyOf(o.genset)), `${s.id} n${o.n}: model ${o.genset} là mã động cơ / đầu phát`);
      assert.ok(o.power && (o.power.prime || o.power.standby) && !o.power.rated, `${s.id} n${o.n}: phải có prime / standby`);
    }
  }
});
