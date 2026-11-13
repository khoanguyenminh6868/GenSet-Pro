import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { specNone, specTodo, needsSpecs, hasSpecRows, mark } from "./spec-todo.mjs";

const recs = [
  { id: "has", role: "genset_oem", website: "https://a.example", specTables: [{ rows: ["| X | 1 |"] }] },
  { id: "empty-table", role: "genset_oem", website: "https://b.example", specTables: [{ rows: [] }] },
  { id: "no-web", role: "distributor", website: null },
  { id: "tried", role: "genset_oem", website: "https://c.example" },
];

test("specTodo: NCC chưa có dòng bảng nào, trừ NCC đã đánh dấu tìm không ra", () => {
  assert.equal(hasSpecRows(recs[1]), false);
  const none = { tried: { at: "2026-11-13", why: "trang không có bảng" } };
  assert.deepEqual(specTodo(recs, none).map((t) => t.id), ["empty-table", "no-web"]);
  assert.deepEqual(specTodo(recs, none)[1], { id: "no-web", role: "distributor", website: null });
  assert.equal(needsSpecs(recs[3]), true);
  assert.equal(needsSpecs(recs[3], none), false);
});

test("mark: ghi ngày + lý do, sắp theo id, giữ mục cũ", () => {
  const m = mark({ zz: { at: "2026-11-01", why: "cũ" } }, ["bb", "aa"], "không có website", "2026-11-13");
  assert.deepEqual(Object.keys(m), ["aa", "bb", "zz"]);
  assert.deepEqual(m.aa, { at: "2026-11-13", why: "không có website" });
  assert.deepEqual(m.zz, { at: "2026-11-01", why: "cũ" });
});

test("specNone: chưa có tệp → rỗng; tệp hỏng → báo lỗi (không âm thầm tìm lại tất cả)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spec-none-"));
  assert.deepEqual(specNone(path.join(dir, "missing.json")), {});
  fs.writeFileSync(path.join(dir, "bad.json"), "{", "utf8");
  assert.throws(() => specNone(path.join(dir, "bad.json")));
});
