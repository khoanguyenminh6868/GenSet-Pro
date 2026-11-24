// node --test suppliers/*.test.mjs — bước 3, họ R3 "dòng máy dưới tiêu đề nhiều tầng / tiêu đề thiếu ô" (điều phối 24/11/2026).
// (1) HEADER_LINES: dòng tiêu đề bộ cào làm rơi (ô tiêu đề xuống dòng trong nguồn), chép nguyên văn từ sources/<id>/<n>.md, đặt lại
// trước tiêu đề đã lưu khi đọc; bảng đó đọc công suất theo tiêu đề THÔI, động cơ / đầu phát ở đúng ô dưới tiêu đề nguồn.
// (2) titledPowers: tiêu đề con một ô mỗi tiêu đề kể cả khi dòng tiêu đề con dài hơn (dòng tiêu đề trùng số ô với dòng); bỏ cách
// đọc mà tiêu đề "Engine Model" kế sau công suất nằm đè một ô số (camda n155). (3) ENGINE_TABLES: bảng DCP của Baudouin.
// Mọi ca là dòng thật trong suppliers/cn (NCC, n ghi cạnh).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const load = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const one = (id, n, first, rows = null) => {
  const s = load(id), t = s.specTables.find((x) => x.n === n && C.cellsOf(x.rows[0])[0] === first);
  assert.ok(t, `${id} n${n} ${first}`);
  // (the entry is keyed by the table's first row, so a test's rows come after it)
  return { ...s, specTables: [{ ...t, rows: rows ? (C.cellsOf(rows[0])[0] === first ? rows : [t.rows[0], ...rows]) : t.rows }] };
};
const recs = (s, notes = []) => C.fromSupplier(s, notes);
const eng = (rs) => rs.filter((r) => r.kind === "engine");

test("mỗi dòng HEADER_LINES có nguyên văn trong tệp nguồn (ô xuống dòng = một dấu cách) và khớp đúng một bảng của cn/", () => {
  for (const x of C.HEADER_LINES) {
    const src = fs.readFileSync(path.join(ROOT, "sources", x.supplierId, `${x.n}.md`), "utf8").replace(/\r/g, "").replace(/\n(?!\|)/g, " ");
    const lines = src.split("\n").map((l) => l.trim());
    for (const a of x.add) assert.ok(lines.includes(a), `${x.supplierId} n${x.n}: ${a}`);
    const s = load(x.supplierId);
    assert.equal(s.specTables.filter((t) => t.n === x.n && t.header?.[0] === x.header && C.cellsOf(t.rows[0])[0] === x.first).length, 1, `${x.supplierId} n${x.n} ${x.first}`);
  }
});

test("camda n137 (50 Hz): tiêu đề 'Genset Model | Standby power | Prime power | Engine Model | Alternator Model' trả lại, dòng ra động cơ + đầu phát, standby rồi prime", () => {
  const rs = recs(one("camda-generator", 137, "KDGC22S", ["| KDGC22S | 27 | 22 | 25 | 20 | 4B3.9-G2 | PI144E | 1580×650×1146 | 777"]));
  assert.deepEqual(rs.map((r) => [r.kind, r.model, r.genset]), [["engine", "4B3.9-G2", "KDGC22S"], ["alternator", "PI144E", "KDGC22S"]]);
  assert.deepEqual(rs[0].power, { standby: { kVA: 27, kW: 22 }, prime: { kVA: 25, kW: 20 } });
  assert.equal(rs[0].freq, 50);
  assert.deepEqual(rs[0].specs.map((x) => [x.key, x.value]), [["dims", "1580×650×1146"], ["weight", "777"]]);
});

test("camda n137: ô công suất gõ sai '220SL' không thành động cơ; động cơ là ô dưới 'Engine Model', công suất để trống + note", () => {
  const notes = [], rs = recs(one("camda-generator", 137, "KDGC22S", ["| KDGC220SL | 275 | 220SL | 250 | 200 | 6LTAA8.9-G2 | UCDI274K | 2540×1018×1527 | 1985"]), notes).filter((r) => r.row === 1);
  assert.deepEqual(rs.map((r) => [r.kind, r.model, r.power]), [["engine", "6LTAA8.9-G2", null], ["alternator", "UCDI274K", null]]);
  assert.ok(notes.some((x) => x.row === 1 && /tiêu đề bổ sung/.test(x.reason)));
});

test("camda n158 (60 Hz, bảng không cột đầu phát): tần số 60 từ dòng mô tả trả lại", () => {
  const rs = recs(one("camda-generator", 158, "KDGP10S1", ["| KDGP10S1 | 12 | 10 | 11 | 9 | 403D-11G | 1500×650×1225 | 436"]));
  assert.deepEqual(rs.map((r) => [r.kind, r.model, r.freq]), [["engine", "403D-11G", 60]]);
  assert.deepEqual(rs[0].power, { standby: { kVA: 12, kW: 10 }, prime: { kVA: 11, kW: 9 } });
});

test("mamo n103: '(KW) | (KVA) | (KW) | (KVA) | (KW)' dưới PRIME | PRIME | STANDBY | STANDBY đọc theo thứ tự (tiêu đề con thứ năm là của ENGINE)", () => {
  const rs = recs(one("mamo-power", 103, "TF17", ["| TF17 | 12 | 15 | 13 | 17 | 4DW81-23D | 17 | O | O | O"]));
  assert.deepEqual(eng(rs).map((r) => [r.model, r.genset]), [["4DW81-23D", "TF17"]]);
  assert.deepEqual(rs[0].power, { prime: { kW: 12, kVA: 15 }, standby: { kW: 13, kVA: 17 } });
});

test("mamo n103: dòng trái tiêu đề (prime > standby) không ghép theo độ lớn; kW / kVA ngoài một tổ máy để trống mức", () => {
  const notes = [], rs = recs(one("mamo-power", 103, "TF21", ["| TF33 | 30 | 37.5 | 26 | 33 | 4DW93-50D | 37 | O | O | O", "| TF41 | 36 | 38 | 40 | 41 | 4DX21-61D | 44 | O | O | O"]), notes);
  assert.deepEqual(rs.map((r) => [r.model, r.power]), [["4DW81-28D", { prime: { kW: 15, kVA: 19 }, standby: { kW: 17, kVA: 21 } }], ["4DW93-50D", null], ["4DX21-61D", null]]);
  assert.ok(notes.some((x) => x.row === 1 && /không khớp tiêu đề/.test(x.reason)));
  assert.equal(notes.filter((x) => x.row === 2 && /không khớp một tổ máy/.test(x.reason)).length, 2);
});

test("jet-power n111: tiêu đề ba tầng trả lại; standby / prime kVA-kW, động cơ D905, đầu phát JET164A, thông số theo cột", () => {
  const rs = recs(one("jet-power", 111, "K-7D5", ["| K-7D5 | 7.0 | 5.6 | 6.4 | 5.1 | D905 | T2 | 247 | 3 | Mechanical | 0.898 | 72×73.6 | JET164A | 1200*650*1000 | 320 | 1800*850*1100 | 540"]));
  assert.deepEqual(rs.map((r) => [r.kind, r.model]), [["engine", "D905"], ["alternator", "JET164A"]]);
  assert.deepEqual(rs[0].power, { standby: { kVA: 7, kW: 5.6 }, prime: { kVA: 6.4, kW: 5.1 } });
  assert.equal(rs[0].freq, 50);
  const sp = Object.fromEntries(rs[0].specs.map((x) => [x.key, x.value]));
  assert.deepEqual([sp.cyl, sp.disp, sp.bore, sp.emission], ["3", "0.898", "72×73.6", "T2"]);
});

test("hosem n106: 'Rated power' trên 'KW | KVA' là mức rated, động cơ dưới 'Engine model'", () => {
  const rs = recs(one("hosem-power", 106, "A-WC16M", ["| A-WC16M | 16 | 20 | 50/400 | WP2.3CD25E200 | 22/1500 | 1240*700*1115 | 467"]));
  assert.deepEqual(rs.map((r) => [r.kind, r.model, r.power]), [["engine", "WP2.3CD25E200", { rated: { kW: 16, kVA: 20 } }]]);
});

test("camda n155: 'Container type | kVA | kW' (hai tiêu đề con cho bốn số) không còn đọc standby 800 kVA + prime 660 kW", () => {
  const rs = recs(one("camda-generator", 155, "KDGC660S", ["| KDGC660S | 800 | 660 | 725 | 580 | 4006-23TAG2A | LSA49.1M6 | 6058×2438×2591 | 10370"]));
  assert.deepEqual(rs[0].power, { standby: { kVA: 800, kW: 660 }, prime: { kVA: 725, kW: 580 } });
});

test("weiman n107 (ngoài R3): 'Gensets power(KW/KVA)' trên hai ô giữ như cũ", () => {
  const rs = eng(recs(one("weiman-fujian", 107, "WT-M7", ["| WT-M19 | 16 | 20 | 14.9 | 19 | S4Q2-65SAG | 20.6 | 22.4 | 260 | 6.30 | 4×88×103 | 2.505 | 22:1 | N/A | More data"]))).filter((r) => r.genset === "WT-M19");
  assert.deepEqual(rs[0].power, { rated: { kVA: 20, kW: 16 } });
  assert.equal(rs[0].specs.find((x) => x.key === "fuel"), undefined);
});

test("baudouin DCP (ENGINE_TABLES): chỉ model động cơ, không công suất DCP, không tốc độ", () => {
  const rs = recs(one("baudouin", 120, "12M33G1265/5"));
  assert.deepEqual(rs.map((r) => [r.kind, r.model, r.power, r.specs.length]), [["engine", "12M33G1265/5", null, 0], ["engine", "12M33G1410/5", null, 0], ["engine", "12M33G1650/5", null, 0]]);
});
