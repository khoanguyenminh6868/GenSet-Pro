// node --test suppliers/sup-skip.test.mjs — NCC Loại trừ (supexcl on) / xoá mềm (supdeleted) không ra đầu ra bot
// (Khoa 2026-11-11; điều phối 2026-11-12).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { skippedOf, dropSkipped, UNFILTERED_WARNING } from "./sup-skip.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const reader = (m) => async (coll) => m[coll];

test("supexcl: chỉ on===true được tính; supdeleted: mọi doc", async () => {
  const r = await skippedOf(reader({ supexcl: [{ id: "a", data: { on: true } }, { id: "b", data: { on: false } }, { id: "c", data: {} }], supdeleted: [{ id: "d", data: { name: "D" } }] }));
  assert.equal(r.ok, true);
  assert.deepEqual([...r.ids].sort(), ["a", "d"]);
});
test("bỏ loại trừ rồi thì NCC quay lại", async () => {
  const list = [{ id: "a" }, { id: "b" }];
  const on = await skippedOf(reader({ supexcl: [{ id: "a", data: { on: true } }], supdeleted: [] }));
  const off = await skippedOf(reader({ supexcl: [{ id: "a", data: { on: false } }], supdeleted: [] }));
  assert.deepEqual(dropSkipped(list, on.ids).map((x) => x.id), ["b"]);
  assert.deepEqual(dropSkipped(list, off.ids).map((x) => x.id), ["a", "b"]);
});
test("không đọc được → ok=false, danh sách rỗng", async () => {
  assert.equal((await skippedOf(async () => { throw new Error("fetch failed"); })).ok, false);
  assert.equal((await skippedOf(reader({ supexcl: [] }))).ok, false); // supdeleted undefined
});

// gaps.mjs end to end on the repo's cn/*.json with fixture files (no network).
const run = (skipfile, queue) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "supskip-"));
  const hist = path.join(tmp, "hist.json"), empty = path.join(tmp, "empty.json"), json = path.join(tmp, "out.json");
  fs.writeFileSync(hist, "[]"); fs.writeFileSync(empty, "[]");
  const args = [path.join(HERE, "gaps.mjs"), "--bidhist", hist, "--configmatch", empty, "--json", json];
  if (skipfile) args.push("--skipfile", skipfile);
  const r = spawnSync(process.execPath, args, { encoding: "utf8", env: { ...process.env, SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "", GENBID_WEB: "http://127.0.0.1:9" } });
  return { r, report: fs.existsSync(json) ? JSON.parse(fs.readFileSync(json, "utf8")) : null, tmp };
};
test("gaps: danh sách đọc được → báo cáo không có cảnh báo", () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "supskip-")), "skip.json");
  fs.writeFileSync(f, JSON.stringify({ supexcl: [], supdeleted: [] }));
  const { r, report } = run(f);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(report && !report.warning);
});
test("gaps: không đọc được danh sách → vẫn ra báo cáo, có cảnh báo, không gửi specreq", () => {
  const { r, report } = run(path.join(os.tmpdir(), "supskip-missing.json"), 3);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(report.warning, UNFILTERED_WARNING);
  assert.ok(!report.queued);
  assert.match(r.stdout, /CẢNH BÁO/);
  assert.doesNotMatch(r.stdout, /Gửi Tìm Thông Số/);
});
