// node --test suppliers/buoc-3-to-doc.test.mjs — hạng 7 "tờ dọc" (buoc-3-to-doc; kiểm kê nghiem-thu/buoc-3-bo-cuc-chua-doc.md
// nhánh dieu-phoi, họ V3): dòng "Model" trơ thứ hai của tờ dọc một máy là ĐỘNG CƠ chỉ khi mã nằm trong `V_SECOND_ENGINE` (danh
// sách đóng theo NCC; mỗi mã đã là khoá động cơ của NCC KHÁC trong cn/, test dưới kiểm bằng build()). Dòng nguyên văn ở
// suppliers/fixtures/to-doc.json (chép từ suppliers/cn; test kiểm chúng vẫn có trong cn/).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const FX = JSON.parse(fs.readFileSync(path.join(ROOT, "fixtures", "to-doc.json"), "utf8"));
const fx = (id, n) => FX.find((x) => x.supplierId === id && x.n === n);
const sheet = (id, n, over = {}) => { const x = fx(id, n); return { id: over.id || id, country: "CN", sources: [], specTables: [{ n, title: x.title, header: x.header, rows: over.rows || x.rows }] }; };
const read = (s) => { const notes = []; return { r: C.fromSupplier(s, notes), notes }; };
const V = (o) => o.sheet === "bảng dọc";

test("fixture: dòng nguyên văn vẫn có trong suppliers/cn", () => {
  for (const x of FX) {
    const s = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", x.supplierId + ".json"), "utf8"));
    assert.ok(s.specTables.some((t) => t.n === x.n && JSON.stringify(t.rows) === JSON.stringify(x.rows) && JSON.stringify(t.header || []) === JSON.stringify(x.header)), `${x.supplierId} n${x.n} đổi chữ`);
  }
});

test("astra n102: '| Model | WP6D152E200' sau model tổ máy là động cơ; 'Rated Power' không là mức, chỉ đọc standby", () => {
  const { r } = read(sheet("astra-fuan", 102));
  assert.deepEqual(r.map((o) => [o.kind, o.genset, o.model, o.sheet]), [["engine", "AS165W", "WP6D152E200", "bảng dọc"]]);
  // "| Rated Power (kW/kVA) | 120/150" bỏ; "| Standby Power (kW/kVA) | 132/165" đọc.
  assert.deepEqual(r[0].power, { standby: { kW: 132, kVA: 165 } });
  assert.deepEqual(r[0].makes, []); // bảng không ghi hãng, tên trang chỉ có "ASTRA": không đoán theo họ mã WP
  assert.equal(r[0].freq, 50);
  // Thông số dưới dòng động cơ là của động cơ: "| Bore × Stroke (mm) | 105*130", "| Displacement | 6.75L".
  assert.deepEqual(r[0].specs.filter((x) => ["bore", "disp"].includes(x.key)).map((x) => x.value), ["105*130", "6.75L"]);
});

test("kubota n104: '| Model | - | V2203' là động cơ; 'Continuous Rated Output' dưới nó không là công suất tổ máy", () => {
  const { r } = read(sheet("kubota-japan", 104));
  assert.deepEqual(r.map((o) => [o.kind, o.genset, o.model]), [["engine", "SQ-3200", "V2203"]]);
  // "| Standby Output | kVA (kW) | 22.0 (17.6)" / "| Prime Output | kVA (kW) | 20.0 (16.0)"
  assert.deepEqual(r[0].power, { prime: { kVA: 20, kW: 16 }, standby: { kVA: 22, kW: 17.6 } });
  assert.ok(!JSON.stringify(r[0].power).includes("19.4"), "Continuous Rated Output của động cơ không vào công suất");
});

test("dingbo n102: mã động cơ trong danh sách nhưng tổ máy chỉ ghi 'Rated Power': không ra gì, 'Prime Power 354kW' của động cơ không lấy", () => {
  const { r, notes } = read(sheet("dingbo", 102));
  assert.equal(r.length, 0);
  assert.ok(notes.some((x) => x.reason === "bảng dọc: không có công suất prime / standby ghi rõ ở phần tổ máy"));
});

test("mã KHÔNG trong danh sách (kubota n106 Z482: không NCC nào khác có khoá): vẫn là hai model, không ra gì", () => {
  const { r, notes } = read(sheet("kubota-japan", 106));
  assert.equal(r.length, 0);
  assert.ok(notes.some((x) => x.reason === "bảng dọc: bảng ghi từ hai model tổ máy trở lên" && /Z482/.test(x.detail)));
});

test("danh sách theo NCC: cùng dòng ở NCC khác không đọc; dòng Model thứ hai đứng TRƯỚC model tổ máy không đọc", () => {
  assert.equal(read(sheet("astra-fuan", 102, { id: "khac" })).r.length, 0);
  const rows = fx("astra-fuan", 102).rows, eng = rows.find((l) => /WP6D152E200/.test(l));
  // Dòng động cơ chuyển lên đầu: model đầu tiên là WP6D152E200 (thành model tổ máy), không có tổ máy → không đọc.
  assert.equal(read(sheet("astra-fuan", 102, { rows: [eng, ...rows.filter((l) => l !== eng)] })).r.filter(V).length, 0);
});

test("toàn bộ cn/: mỗi mã của V_SECOND_ENGINE là khoá động cơ của NCC KHÁC; bản ghi mới chỉ ở bảng chưa cho bản ghi khác", () => {
  const dir = path.join(ROOT, "cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const b = C.build(S);
  const eng = new Map(b.engines.map((e) => [e.key.replace(/^.*\|/, ""), new Set(e.suppliers)]));
  const ids = new Set(C.V_SECOND_ENGINE.map((x) => x.supplierId));
  for (const x of C.V_SECOND_ENGINE) for (const code of x.codes.split(" ")) {
    const sup = eng.get(C.keyOf(code)) || new Set();
    assert.ok([...sup].some((y) => y !== x.supplierId), `${x.supplierId} ${code}: không NCC nào khác có khoá động cơ này`);
  }
  let n = 0;
  for (const s of S.filter((s) => ids.has(s.id))) {
    const r = C.fromSupplier(s);
    for (const o of r.filter(V)) {
      n++;
      assert.ok(!r.some((y) => !V(y) && y.table === o.table), `${s.id} n${o.n}: bảng đã cho bản ghi khác`);
      assert.ok(o.power && (o.power.prime || o.power.standby) && !o.power.rated, `${s.id} n${o.n}: phải có prime / standby`);
    }
  }
  assert.ok(n >= 60, `bản ghi tờ dọc của astra / kubota / dingbo: ${n}`);
});
