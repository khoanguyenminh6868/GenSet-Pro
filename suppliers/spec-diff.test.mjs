// spec-diff.mjs: so mọi trường của mọi bản ghi giữa hai bản mã đọc, đếm đảo vai động cơ ↔ đầu phát, tự kiểm số.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { records, diff, fullText, swaps, verify, checkSpec, markdown, loadSide, run } from "./spec-diff.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.join(HERE, "..");
// Bên giả: fromSupplier trả đúng danh sách bản ghi đã cho của NCC.
const side = (bySup) => ({ C: { fromSupplier: (s) => bySup[s.id] }, S: Object.keys(bySup).map((id) => ({ id })) });
const rec = (o) => ({ supplierId: "a", n: 101, table: 0, row: 0, kind: "engine", model: "X", line: "| L |", header: ["| H |"], specs: [], ...o });

test("diff: thay đổi từng trường, bản ghi mất / thêm, theo NCC", () => {
  const A = side({ a: [rec({ power: { prime: { kVA: 100, kW: 80 } }, specs: [{ key: "weight", value: "36" }] }), rec({ row: 1, model: "OLD" })] });
  const B = side({ a: [rec({ power: { prime: { kVA: 100, kW: 80 } }, specs: [{ key: "weight", value: "710" }, { key: "current", value: "144" }] }), rec({ row: 2, model: "NEW" })] });
  const d = diff(records(A), records(B));
  assert.equal(d.changed, 1);
  assert.equal(d.onlyA, 1);
  assert.equal(d.onlyB, 1);
  assert.deepEqual(d.kinds, { "weight đổi": 1, "current thêm": 1 });
  assert.deepEqual(d.bySup.get("a"), { changed: 1, onlyA: 1, onlyB: 1, rows: 3 });
  const t = fullText(d);
  assert.match(t, /^bản ghi cũ 2, mới 2 \| khác 1 \| chỉ cũ 1, chỉ mới 1 \| bảng có đổi 1/);
  assert.match(t, /weight: 36 → 710; current: ∅ → 144/);
  assert.match(t, /MẤT bản ghi engine OLD/);
  assert.match(t, /THÊM bản ghi engine NEW/);
});

test("records: bản ghi trùng khoá đánh số, NCC incomplete bị bỏ", () => {
  const S = [{ id: "a" }, { id: "b", status: "incomplete" }];
  const C = { fromSupplier: (s) => [rec({ supplierId: s.id }), rec({ supplierId: s.id, model: "Y" })] };
  assert.deepEqual([...records({ C, S }).keys()], ["a|101|0|0|engine#0", "a|101|0|0|engine#1"]);
});

test("swaps: mã mà ≥ 3 NCC khác đọc ở vai kia", () => {
  const alt = (id) => rec({ supplierId: id, kind: "alternator", model: "UCI 274-C" });
  const recs = [alt("b"), alt("c"), alt("d"), rec({ supplierId: "a", kind: "engine", model: "UCI274C" })];
  const s = swaps(recs);
  assert.equal(s.n, 1);
  assert.deepEqual(s.cnt, { "a engine←alternator": 1 });
  assert.match(s.text, /tổng: 1$/);
  // Có NCC khác cũng đọc là động cơ: không tính (mã mơ hồ).
  assert.equal(swaps([...recs, rec({ supplierId: "e", model: "UCI274C" })]).n, 0);
  // Chỉ 2 NCC khác: không đủ.
  assert.equal(swaps(recs.slice(1)).n, 0);
});

test("checkSpec: quan hệ số với công suất của chính dòng", () => {
  const o = { power: { prime: { kVA: 100, kW: 80 } } };
  assert.equal(checkSpec("current", { value: "144" }, o), true);
  assert.equal(checkSpec("current", { value: "36" }, o), false);
  assert.equal(checkSpec("weight", { value: "710 kg" }, o), true);
  assert.equal(checkSpec("weight1", { value: "36" }, o), false);
  assert.equal(checkSpec("engPower", { value: "92" }, o), true);
  assert.equal(checkSpec("noise", { value: "75" }, o), null);
});

test("verify: giá trị không tự xác nhận được thì vào danh sách soát tay", () => {
  const A = side({ a: [rec({ power: { prime: { kVA: 100, kW: 80 } }, specs: [{ key: "weight", value: "36" }] })] });
  const B = side({ a: [rec({ power: { prime: { kVA: 100, kW: 80 } }, specs: [{ key: "weight", value: "710" }, { key: "current", value: "50" }] })] });
  const v = verify(records(A), records(B));
  assert.deepEqual(v.stat, { "weight đổi: mới tự xác nhận, cũ sai": 1, "current thêm: mới KHÔNG xác nhận": 1 });
  assert.equal(v.fails.length, 1);
  assert.match(v.text, /cần soát tay: 1$/);
});

test("markdown: bảng theo NCC, ví dụ mỗi dạng, đảo vai tăng thì ghi chặn", () => {
  const A = records(side({ a: [rec({ specs: [{ key: "weight", value: "36" }] })] }));
  const B = records(side({ a: [rec({ specs: [{ key: "weight", value: "710" }] })] }));
  const d = diff(A, B), ver = verify(A, B), norm = { changes: [], skipped: true };
  const sw = (n) => ({ n, cnt: n ? { "a engine←alternator": n } : {}, list: Array.from({ length: n }, () => ({ o: rec({}), other: "alternator", oth: 3 })) });
  const ok = markdown({ d, swA: sw(1), swB: sw(1), ver, norm });
  assert.match(ok, /^<!-- spec-diff -->/);
  assert.match(ok, /\| a \| 1 \| 1 \| 0 \| 0 \|/);
  assert.match(ok, /\*\*weight đổi\*\*: 1 lượt, 1 NCC/);
  assert.match(ok, /1 → \*\*1\*\* ✅/);
  assert.match(markdown({ d, swA: sw(0), swB: sw(1), ver, norm }), /0 → \*\*1\*\* ❌ TĂNG \(chặn\)/);
  assert.match(markdown({ d: diff(A, A), swA: sw(0), swB: sw(0), ver: verify(A, A), norm }), /Không có bản ghi nào đổi\./);
  // chat-luong-3: dòng "Chưa đọc được" theo lý do; bên cũ chưa có unread() ghi "—".
  const un = { a: null, b: { "bảng không cho bản ghi nào": { items: 3, tables: 3, sups: 1 }, "số vô lý so với công suất": { items: 2, tables: 1, sups: 1 } } };
  assert.match(markdown({ d, swA: sw(0), swB: sw(0), ver, norm, un }), /Chưa đọc được .*: bảng không cho bản ghi nào: — → 3; số vô lý so với công suất: — → 2/);
  assert.doesNotMatch(markdown({ d, swA: sw(0), swB: sw(0), ver, norm }), /Chưa đọc được/);
});

// Bên thật: catalog.js / spec-norm.js của repo trên một NCC; bản spec-norm sửa (đơn vị trống) phải hiện ở phần chuẩn hoá.
function tmpSide(normPatch) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spec-diff-test-"));
  fs.mkdirSync(path.join(dir, "web")); fs.mkdirSync(path.join(dir, "suppliers", "cn"), { recursive: true });
  for (const f of ["catalog.js", "spec-norm.js", "conversions.js"]) {
    let t = fs.readFileSync(path.join(REPO, "web", f), "utf8");
    if (f === "spec-norm.js" && normPatch) t = normPatch(t);
    fs.writeFileSync(path.join(dir, "web", f), t);
  }
  fs.copyFileSync(path.join(HERE, "cn", "kangwo-guangdong.json"), path.join(dir, "suppliers", "cn", "kangwo-guangdong.json"));
  return dir;
}
test("run: hai bản spec-norm.js trong cùng tiến trình, đổi kết quả chuẩn hoá được đếm", () => {
  const a = tmpSide(), b = tmpSide((t) => t.replace("root.GenbidSpecNorm = {", "const _nr = normalizeRecord; normalizeRecord = (o, rows) => _nr(o, rows).map((r) => r.key === \"weight\" ? { ...r, unit: \"lb\" } : r);\n  root.GenbidSpecNorm = {"));
  const same = run(loadSide(a), loadSide(a));
  assert.ok(same.a.size > 100);
  assert.equal(same.d.changed, 0);
  assert.equal(same.norm.skipped, true);
  assert.deepEqual(same.un.a, same.un.b);
  const r = run(loadSide(a), loadSide(b));
  assert.equal(r.d.changed, 0);
  assert.equal(r.norm.skipped, false);
  assert.ok(r.norm.changes.length > 0);
  assert.ok(Object.keys(r.norm.kinds).every((k) => k === "weight đổi số / đơn vị"), JSON.stringify(r.norm.kinds));
});

test("CLI: --gate thoát 1 khi đảo vai tăng", () => {
  const a = tmpSide(), b = tmpSide();
  // Bên mới thêm 3 NCC đọc động cơ YC2108D của kangwo ở vai đầu phát.
  for (const id of ["x1", "x2", "x3"]) fs.writeFileSync(path.join(b, "suppliers", "cn", id + ".json"), JSON.stringify({ id, specTables: [{ n: 101, title: "Diesel generator set", header: ["| Genset Model | Engine Model | Alternator Model | kVA | kW |"], rows: ["| GX-30 | 4BT3.9-G2 | YC2108D | 30 | 24 |"] }] }));
  const cli = (args) => { try { execFileSync(process.execPath, [path.join(HERE, "spec-diff.mjs"), ...args], { stdio: "pipe" }); return 0; } catch (e) { return e.status; } };
  const md = path.join(b, "out.md");
  assert.ok(swaps(records(loadSide(b)).values()).n > swaps(records(loadSide(a)).values()).n);
  assert.equal(cli([a, b, "--md", md, "--gate"]), 1);
  assert.match(fs.readFileSync(md, "utf8"), /TĂNG \(chặn\)/);
  assert.equal(cli([b, a, "--gate"]), 0);
});
