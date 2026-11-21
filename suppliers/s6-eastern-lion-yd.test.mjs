// node --test suppliers/s6-eastern-lion-yd.test.mjs — S6-3 (điều phối 21/11/2026): ô động cơ "(YD4KD) YD485D" của eastern-lion-fuan
// n122 / n141 / n146 / n151 ghi hai mã mà bảng không nói ngoặc nghĩa là gì → không bản ghi động cơ, giữ đầu phát (TWO_CODE_CELLS,
// cùng nguyên tắc sanq #1020). Dòng thật trong suppliers/cn/eastern-lion-fuan.json.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(new URL("./cn/eastern-lion-fuan.json", import.meta.url), "utf8"));
const rowsOf = (recs, line) => recs.filter((r) => String(r.line).trim() === line);

test("bốn dòng '(YD4KD) YD485D': không bản ghi động cơ, đầu phát EL / ELS 164D giữ nguyên, ghi note 'một ô ghi hai mã'", () => {
  const notes = [], recs = C.fromSupplier(s, notes);
  const lines = {
    122: "| GF/GFS-YD18 | 14 | 17 | 15 | 18 | (YD4KD) YD485D | 18 | ELS 164D | 14.1 | RUIFEN6120 | Detail",
    141: "| GF/GFS-YD12 | 12kw | 15kva | 13kw | 17kva | (YD4KD) YD485D | 15KW | EL 164D | 12.8KW | RUIFEN6120 | Detail",
    146: "| GF/GFS-YD12 | 12kw | 15kva | 13kw | 17kva | (YD4KD) YD485D | 15KW | EL 164D | 12.8KW | RUIFEN6120",
    151: "| GF/GFS-YD18 | 14 | 17 | 15 | 18 | (YD4KD) YD485D | 18 | ELS 164D | 14.1 | RUIFEN6120",
  };
  for (const [n, line] of Object.entries(lines)) {
    const r = rowsOf(recs.filter((x) => x.n === +n), line);
    assert.deepEqual(r.map((x) => [x.kind, x.model]), [["alternator", /ELS/.test(line) ? "ELS 164D" : "EL 164D"]], `n${n}`);
    assert.ok(notes.some((x) => x.n === +n && x.reason === "một ô ghi hai mã" && x.detail === "(YD4KD) YD485D"), `note n${n}`);
  }
  assert.ok(!recs.some((x) => x.kind === "engine" && /YD4KD|YD485D/.test(x.model)));
});

test("không đổi: dòng khác của bảng (YD380D, YND485D) vẫn có bản ghi động cơ", () => {
  const recs = C.fromSupplier(s, []).filter((x) => x.n === 141 && x.kind === "engine");
  assert.ok(recs.some((x) => x.model === "YD380D"));
  assert.ok(recs.some((x) => x.model === "YND485D"));
});
