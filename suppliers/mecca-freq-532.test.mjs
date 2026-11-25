// node --test suppliers/mecca-freq-532.test.mjs — mecca-freq-532 (điều phối 25/11/2026, Khoa: "532 bản Mecca tìm trong hệ thống và trên internet
// xem có mã nào giống không thì lấy tần số từ đó, nếu không có thì để trống").
// Căn cứ từng mục ở suppliers/mecca-freq-532.json; MECCA_FREQ (web/catalog.js) phải khớp từng mục; mỗi bản ghi nguồn phải có tần số RÕ
// (tên bảng catalog n5001 ghi "(50Hz)" / "(60Hz)", hoặc dòng mô tả TABLE_CAPTIONS), cùng mã, cùng công suất.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const s = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", "mecca-power.json"), "utf8"));
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "mecca-freq-532.json"), "utf8"));
const recs = C.fromSupplier(s).filter((r) => r.kind === "engine");
const pk = (p) => [p?.prime?.kVA ?? null, p?.prime?.kW ?? null, p?.standby?.kVA ?? null, p?.standby?.kW ?? null];

test("MECCA_FREQ khớp từng mục của mecca-freq-532.json, không trùng khoá", () => {
  const want = doc.entries.map((e) => `${e.n}|${e.genset}|${JSON.stringify(e.power)}|${e.freq}`);
  assert.deepEqual([...C.MECCA_FREQ].sort(), want.sort());
  assert.equal(new Set(C.MECCA_FREQ.map((x) => x.split("|").slice(0, 3).join("|"))).size, C.MECCA_FREQ.length);
});

test("mỗi mục: mọi bản ghi nguồn cùng mã + cùng công suất, tần số rõ từ tên bảng / TABLE_CAPTIONS, và một tần số duy nhất", () => {
  assert.ok(doc.entries.length >= 70);
  for (const e of doc.entries) {
    assert.ok([50, 60].includes(e.freq));
    assert.ok(e.src.length >= 1, `${e.genset} không có nguồn`);
    const srcRecs = [];
    for (const x of e.src) {
      const t = s.specTables[x.table];
      assert.equal(+t.n, x.n);
      const explicit = x.n === 5001
        ? new RegExp(`\\(${e.freq}\\s*Hz\\)`, "i").test(String(t.title || ""))
        : C.TABLE_CAPTIONS.some((c) => c[0] === "mecca-power" && c[1] === x.n && c[2] === String(t.rows?.[0] ?? "").trim() && new RegExp(`${e.freq}\\s*HZ`, "i").test(c[3]));
      assert.ok(explicit, `${e.genset}: nguồn n${x.n} #${x.table} không ghi ${e.freq} Hz rõ`);
      const m = recs.filter((r) => r.table === x.table && r.genset === e.genset && JSON.stringify(pk(r.power)) === JSON.stringify(e.power));
      assert.ok(m.length >= 1, `${e.genset}: bản ghi nguồn n${x.n} #${x.table}`);
      for (const r of m) assert.equal(r.freq, e.freq);
      srcRecs.push(...m);
    }
    // Mọi bản ghi có tần số RÕ cho đúng mã + công suất này (ngoài các mục của danh sách) đều cùng một tần số.
    const same = recs.filter((r) => r.genset === e.genset && JSON.stringify(pk(r.power)) === JSON.stringify(e.power) && !(r.n === e.n && e.tables.includes(r.table)));
    assert.ok(same.length >= 1);
    assert.deepEqual([...new Set(same.map((r) => r.freq))], [e.freq], e.genset);
  }
});

test("mecca-power: 532 bản ghi null → gắn được 96, còn 436; mục để trống đúng lý do", () => {
  assert.equal(doc.summary.total, 532);
  assert.equal(doc.summary.attached, 96);
  const left = recs.filter((r) => r.freq == null);
  assert.equal(left.length, 532 - 96);
  const b = doc.blank;
  assert.equal(b.conflict.reduce((a, x) => a + x.records, 0) + b.codeOnly.reduce((a, x) => a + x.records, 0) + b.none.reduce((a, x) => a + x.records, 0), 436);
  // Cùng mã + cùng công suất có CẢ 50 lẫn 60 Hz → để trống.
  for (const x of b.conflict) {
    const f = [...new Set(recs.filter((r) => r.genset === x.genset && JSON.stringify(pk(r.power)) === JSON.stringify(x.power) && r.freq != null).map((r) => r.freq))];
    assert.deepEqual(f.sort(), [50, 60], x.genset);
    assert.ok(left.some((r) => r.n === x.n && r.genset === x.genset && JSON.stringify(pk(r.power)) === JSON.stringify(x.power)));
  }
  // Các ca trang đã ghi "không đoán" vẫn trống.
  const tab = (n, g) => { const ti = s.specTables.findIndex((t) => +t.n === n && C.cellsOf(t.rows[0])[0] === g); assert.ok(ti >= 0, g); return [...new Set(recs.filter((r) => r.table === ti).map((r) => r.freq))]; };
  assert.deepEqual(tab(144, "MC12Y"), [null]);
  assert.deepEqual(tab(159, "MC11Y"), [null]);
});
