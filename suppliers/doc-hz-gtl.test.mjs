// node --test suppliers/*.test.mjs — doc-hz-gtl (điều phối 25/11/2026).
// (1) TABLE_CAPTIONS: dòng mô tả "…50Hz 3 phases+4 wires…" / "Powered by … 60HZ …" nằm ngay trên bảng của camda / mecca nhưng bộ cào
//     không đưa vào bảng đã lưu, nên bảng 50 / 60 Hz đó có freq null. Danh sách tường minh, mỗi dòng chép nguyên văn từ nguồn.
// (2) "Maximum Power (kw) | 24.5 | 24.2" trong khối động cơ ("| Diesel Engine | Model | …", gtl-power n105) là công suất ĐỘNG CƠ, không
//     là standby của tổ máy. Mọi ca là dòng thật trong suppliers/cn (NCC, n ghi cạnh).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const load = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const recs = (id, n) => C.fromSupplier(load(id)).filter((r) => n == null || r.n === n);
const HZ = /\b(50|60)\s*hz\b/i;

test("mỗi dòng TABLE_CAPTIONS có nguyên văn trong tệp nguồn, đứng liền trên bảng (mọi dòng giữa là dòng bảng) và khớp đúng một bảng của cn/", () => {
  assert.ok(C.TABLE_CAPTIONS.length >= 22);
  for (const [id, n, first, line] of C.TABLE_CAPTIONS) {
    const src = fs.readFileSync(path.join(ROOT, "sources", id, `${n}.md`), "utf8").replace(/\r/g, "").split("\n").map((l) => l.trim());
    const hits = src.map((l, i) => (l === first ? i : -1)).filter((i) => i >= 0);
    assert.ok(hits.length >= 1, `${id} n${n}: dòng đầu của bảng không có trong nguồn`);
    // At least one place in the source where the first row is under this caption with only table lines between.
    const ok = hits.some((i) => { let j = i - 1; while (j >= 0 && src[j].startsWith("|") && src[j] !== line) j--; return j >= 0 && src[j] === line; });
    assert.ok(ok, `${id} n${n}: ${line}`);
    assert.ok(HZ.test(line), line);
    const s = load(id);
    assert.equal(s.specTables.filter((t) => +t.n === n && String(t.rows?.[0] ?? "").trim() === first).length, 1, `${id} n${n} ${first}`);
  }
});

test("camda: bảng 50 Hz của n138 / n155 có freq 50, bảng 60 Hz giữ 60; không còn bản ghi freq null", () => {
  const rs = recs("camda-generator");
  assert.equal(rs.filter((r) => r.freq == null).length, 0);
  const f = (n, g) => [...new Set(rs.filter((r) => r.n === n && r.genset === g).map((r) => r.freq))];
  assert.deepEqual(f(138, "KDGC22S"), [50]);
  assert.deepEqual(f(138, "KDGC27S1"), [60]);
  assert.deepEqual(f(155, "KDGC660S"), [50]);
  assert.deepEqual(f(155, "KDGC660S1"), [60]);
});

test("mecca: bảng có dòng 'Powered by … 50HZ / 60HZ' ngay trên nó nhận đúng tần số", () => {
  const rs = recs("mecca-power");
  const s = load("mecca-power");
  const f = (n, g) => { const ti = s.specTables.findIndex((t) => +t.n === n && C.cellsOf(t.rows[0])[0] === g); assert.ok(ti >= 0, g); return [...new Set(rs.filter((r) => r.table === ti).map((r) => r.freq))]; };
  assert.deepEqual(f(101, "MC22C"), [50]);
  assert.deepEqual(f(101, "MC28C"), [60]);
  assert.deepEqual(f(101, "MC66C"), [50], "bảng nối tiếp sau dòng 'StageⅢ' vẫn dưới dòng mô tả 50HZ");
  assert.deepEqual(f(101, "MC425C"), [60]);
  assert.deepEqual(f(129, "MC69D"), [50]);
  assert.deepEqual(f(151, "MC61SC"), [50], "'Dual Frequency Engine) 50HZ'");
  assert.deepEqual(f(151, "MC69SC"), [60]);
  assert.deepEqual(f(190, "CCFJ-20"), [50]);
});

test("mecca: nhãn tab 'rời' 50HZ | 60HZ của trang, 'Both 50Hz and 60Hz', trang catalog không ghi Hz: không đoán, freq vẫn null", () => {
  const rs = recs("mecca-power");
  const s = load("mecca-power");
  const f = (n, g) => { const ti = s.specTables.findIndex((t) => +t.n === n && C.cellsOf(t.rows[0])[0] === g); assert.ok(ti >= 0, g); return [...new Set(rs.filter((r) => r.table === ti).map((r) => r.freq))]; };
  assert.deepEqual(f(144, "MC12Y"), [null]); // tab 50HZ / 60HZ, hai bảng, không dòng nào gắn bảng với tần số
  assert.deepEqual(f(159, "MC11Y"), [null]);
  assert.deepEqual(f(103, "MC22D"), [null]);
  assert.deepEqual(f(134, "MC220C"), [null]); // "1.Both 50Hz and 60Hz;"
  assert.deepEqual(f(5001, "MC138D"), [null]); // "trang 14 trái" không có (50Hz) / (60Hz)
});

test("gtl-power n105: 'Maximum Power (kw)' của động cơ không thành standby của tổ máy; prime 15 kW của tổ máy giữ nguyên", () => {
  const rs = recs("gtl-power", 105);
  assert.ok(rs.length >= 3);
  assert.deepEqual(rs.find((r) => r.genset === "PWUG15" && r.kind === "engine").power, { prime: { kW: 15 } });
  for (const r of rs) assert.equal(r.power?.standby, undefined, `${r.genset} ${r.model}`);
});

const sheet = (lines) => ({ id: "x", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [lines[0]], rows: lines.slice(1) }] });
const powerOf = (lines) => C.fromSupplier(sheet(lines)).find((r) => r.kind === "engine")?.power;

test("khối '| Diesel Engine | Model | mã' + 'Maximum Power (kw)': công suất động cơ, không ra standby", () => {
  const p = powerOf(["| Model | AB15", "| Prime Power (kw) | 15", "| Rated Frequency (Hz) | 60", "| Diesel Engine | Model | 404D-22 | 404D-24G3", "| Maximum Power (kw) | 24.5 | 24.2"]);
  assert.equal(p?.standby, undefined);
});

test("'Maximum Power' ngoài khối động cơ (tờ tổ máy nhỏ) vẫn là standby như trước; 'Standby Power' trong khối động cơ thì không bị chặn", () => {
  const a = powerOf(["| Model | AB15 | AB20", "| Maximum Power (kW) | 5.5 | 7.0", "| Engine | Model | KM170F | KM178F"]);
  assert.equal(a?.standby?.kW, 5.5);
  const b = powerOf(["| Model | AB15", "| Prime Power (kw) | 15", "| Diesel Engine | Model | 404D-22 | 404D-24G3", "| Standby Power (kw) | 16.5 | 16.5"]);
  assert.equal(b?.standby?.kW, 16.5);
});

test("khối động cơ kết thúc ở dòng mở phần khác (Alternator): 'Maximum Power' sau đó không bị chặn oan", () => {
  const p = powerOf(["| Model | AB15 | AB16", "| Diesel Engine | Model | 404D-22 | 404D-24G3", "| Alternator | Model | RF-15 | RF-16", "| Maximum Power (kw) | 16.5 | 16.5"]);
  assert.equal(p?.standby?.kW, 16.5);
});
