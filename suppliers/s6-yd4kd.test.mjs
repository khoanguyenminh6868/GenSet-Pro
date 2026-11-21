// node --test suppliers/s6-yd4kd.test.mjs — S6-5 (điều phối 21/11/2026): ô động cơ "YD4KD(YD485D)" của comappower n113 và yanan-power
// n111 (4 dòng) ghi hai mã mà trang không nói ngoặc là gì → không bản ghi động cơ (TWO_CODE_CELLS, như sanq #1020 / eastern-lion S6-3).
// Bảng không có cột đầu phát nên dòng không còn bản ghi nào. Dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const load = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));

test("comappower n113 / yanan-power n111: 4 dòng 'YD4KD(YD485D)' không cho bản ghi, ghi note 'một ô ghi hai mã'", () => {
  for (const [id, n, lines] of [
    ["comappower", 113, ["| COM15 | 15kVA | 12kW | 14kVA | 11kW | YD4KD(YD485D) | 4 | COM15", "| COM21 | 21kVA | 17kW | 19kVA | 15kW | YD4KD(YD485D) | 4 | COM21"]],
    ["yanan-power", 111, ["| YN15YD | 15kVA | 12kW | 14kVA | 11kW | YD4KD(YD485D) | 4 | YN15YD", "| YN21YD | 21kVA | 17kW | 19kVA | 15kW | YD4KD(YD485D) | 4 | YN21YD"]],
  ]) {
    const notes = [], recs = C.fromSupplier(load(id), notes);
    for (const line of lines) assert.ok(!recs.some((r) => String(r.line).trim() === line), `${id} ${line}`);
    assert.equal(notes.filter((x) => x.n === n && x.reason === "một ô ghi hai mã" && x.detail === "YD4KD(YD485D)").length, 2, id);
    assert.ok(!recs.some((r) => /YD4KD/.test(r.model)), id);
  }
});

test("không đổi: acepow-fuan n114 '(YD485D)' vẫn đọc như cũ (chỉ báo hiện trạng)", () => {
  const r = C.fromSupplier(load("acepow-fuan"), []).filter((x) => x.n === 114 && /\(YD485D\)/.test(x.line));
  assert.deepEqual(r.map((x) => [x.kind, x.model]), [["engine", "(YD485D)"], ["alternator", "APS164D"]]);
});
