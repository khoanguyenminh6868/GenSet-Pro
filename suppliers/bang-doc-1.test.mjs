// node --test suppliers/bang-doc-1.test.mjs — bảng dọc, chặng 1 (`verticalRecords` trong web/catalog.js; nhóm V1 của
// bang-chua-doc-1.md: một tổ máy, dòng "nhãn | giá trị", model ở dòng nhãn Model). Dòng lấy nguyên văn từ suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const cn = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const only = (s, n) => ({ ...s, specTables: s.specTables.filter((t) => t.n === n) });
const recs = (id, n, notes) => C.fromSupplier(only(cn(id), n), notes).filter((o) => o.n === n);
const fake = (rows, title = "X") => ({ id: "x", country: "CN", sources: [], specTables: [{ n: 1, title, header: [], rows }] });
const V = (o) => o.sheet === "bảng dọc";

test("sunkings n116: model tổ máy, động cơ sau tên hãng, prime / standby có nhãn", () => {
  const r = recs("sunkings", 116).filter(V);
  assert.equal(r.length, 1);
  const o = r[0];
  assert.deepEqual([o.kind, o.model, o.genset, o.freq, o.other], ["engine", "NTA855-G2A", "SHX-350", 50, null]);
  assert.deepEqual(o.power, { prime: { kW: 280, kVA: 350 }, standby: { kW: 308, kVA: 385 } });
  assert.deepEqual(o.makes.map((m) => [m.name, m.via]), [["Cummins", "dòng bảng"]]);
  assert.ok(o.lines && !o.line, "bản ghi bảng nhãn mang lines, không line");
});

test("westinpower n1117: đơn vị ở ô riêng (kVA/kw), mã động cơ dưới tiêu đề ENGINE, dấu － đọc qua NFKC", () => {
  const o = recs("westinpower", 1117).find(V);
  assert.equal(o.genset, "TP220T");
  assert.equal(o.model, "1106A-70TAG4");
  assert.deepEqual(o.power, { prime: { kVA: 200, kW: 160 }, standby: { kVA: 220, kW: 176 } });
  // "Max. stand by power at rated RPM | 196.3KW" nằm ở phần động cơ: không là standby của tổ máy.
  assert.ok(!JSON.stringify(o.power).includes("196.3"));
});

test("lees n1118: chỉ dòng có nhãn mức; 'Power | kW | 70.6' không ghi mức thì không đọc", () => {
  const o = recs("lees-power", 1118).find(V);
  assert.deepEqual([o.model, o.genset], ["Y4110ZLD", "LSY97S3-6"]);
  assert.deepEqual(o.power, { prime: { kVA: 80.2 }, standby: { kVA: 97 } });
});

test("bảng không đọc (ghi lý do): công suất ở phần động cơ, nhiều model, động cơ không là mã", () => {
  const cases = [
    ["dingbo", 102, /hai model tổ máy/], // "Genset Model: DB-329GF" + "| Model: | TAD1344GE-B" (động cơ không tiêu đề)
    ["supermaly", 107, /hai model tổ máy/], // SP28GFS, 1103A-33G, BC184FS trên một trang
    ["ronsun-power", 101, /không có mã động cơ/], // "Engine Model: Gas Series 6 Cylinder"
  ];
  for (const [id, n, why] of cases) {
    const notes = [], r = recs(id, n, notes);
    assert.equal(r.filter(V).length, 0, `${id} n${n}`);
    assert.ok(notes.some((x) => x.n === n && x.reason.startsWith("bảng dọc: ") && why.test(x.reason)), `${id} n${n}: ${notes.map((x) => x.reason).join("; ")}`);
  }
});

test("công suất trong phần động cơ (sau dòng mã động cơ) không là của tổ máy", () => {
  const notes = [];
  const r = C.fromSupplier(fake(["| Genset Model | AB-100", "| Engine Brand / Model | Cummins 6BTA5.9-G2", "| Prime Power | 100kW", "| Standby Power | 110kW"]), notes);
  assert.equal(r.length, 0);
  assert.ok(notes.some((x) => /không có công suất prime \/ standby/.test(x.reason)));
});

test("luật chặn: hai số khác nhau cùng mức, kW / kVA không khớp, prime > standby, model giống mã đầu phát / trùng động cơ", () => {
  const eng = "| Engine Brand / Model | Cummins 6BTA5.9-G2";
  const run = (rows) => { const notes = []; return { r: C.fromSupplier(fake(rows), notes), notes: notes.map((x) => x.reason) }; };
  // mức ghi hai lần khác số: bỏ mức đó, mức kia còn
  let x = run(["| Model | AB-100", "| Prime Power | 100kVA/80kW", "| Prime Power | 120kVA/96kW", "| Standby Power | 110kVA/88kW", eng]);
  assert.deepEqual(x.r[0].power, { standby: { kVA: 110, kW: 88 } });
  // kW / kVA không khớp một tổ máy
  x = run(["| Model | AB-100", "| Prime Power | 100kVA/100kW", "| Standby Power | 553kVA/530kW", eng]);
  assert.deepEqual(x.r[0].power, { prime: { kVA: 100, kW: 100 } });
  // prime > standby: bỏ cả hai → không bản ghi
  x = run(["| Model | AB-100", "| Prime Power | 120kVA", "| Standby Power | 110kVA", eng]);
  assert.equal(x.r.length, 0);
  // model dạng mã đầu phát / trùng mã động cơ
  for (const m of ["UCI274H", "6BTA5.9-G2"]) {
    x = run([`| Model | ${m}`, "| Prime Power | 100kVA/80kW", eng]);
    assert.equal(x.r.length, 0, m);
    assert.ok(x.notes.some((n) => /trùng \/ giống/.test(n)), m);
  }
  // "or equivalent" / dãy lựa chọn: không là mã động cơ
  x = run(["| Model | AB-100", "| Prime Power | 100kVA/80kW", "| Engine Brand / Model | Cummins 6BTA5.9-G2 or equivalent"]);
  assert.equal(x.r.length, 0);
  // "Rated Power" không ghi mức: không đọc
  x = run(["| Model | AB-100", "| Rated Power | 100kVA/80kW", eng]);
  assert.equal(x.r.length, 0);
});

test("toàn bộ cn/: bản ghi bảng dọc chỉ ở bảng không cho bản ghi khác; model không trùng khoá động cơ / đầu phát của build()", () => {
  const dir = path.join(ROOT, "cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const b = C.build(S);
  const parts = new Set([...b.engines, ...b.alternators].map((e) => e.key.replace(/^.*\|/, "")));
  let n = 0;
  for (const s of S) {
    if (s.status === "incomplete") continue;
    const r = C.fromSupplier(s);
    for (const o of r.filter(V)) {
      n++;
      assert.ok(!parts.has(C.keyOf(o.genset)), `${s.id} n${o.n}: model ${o.genset} là mã động cơ / đầu phát (thêm vào V_PART_MODELS)`);
      assert.ok(!r.some((x) => !V(x) && (x.table === o.table || (x.also || []).some((a) => a.table === o.table))), `${s.id} n${o.n}: bảng đã cho bản ghi khác`);
      assert.ok(o.power && (o.power.prime || o.power.standby) && !o.power.rated, `${s.id} n${o.n}: phải có prime / standby`);
    }
  }
  assert.ok(n > 0);
});
