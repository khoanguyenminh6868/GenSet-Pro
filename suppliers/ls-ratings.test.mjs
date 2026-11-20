// node --test suppliers/ls-ratings.test.mjs — bảng định mức và khối "General characteristics" của tờ Leroy-Somer đã lưu
// (dau-phat-hang A, 20/11/2026). Đọc thẳng tệp nguồn thật trong sources/leroy-somer-fuzhou/; số mong đợi chép tay từ tệp.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lsRatings, lsFigures, lsSheetAttrs } from "./ratings.mjs";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "sources", "leroy-somer-fuzhou");
const read = (n) => fs.readFileSync(path.join(dir, `${n}.md`), "utf8");
const at = (rs, model, hz, cls, volt, phase = 3) => rs.filter((x) => x.model === model && x.hz === hz && x.phase === phase && x.volt === volt && x.rise.startsWith(cls)).map((x) => x.kVA);

test("LSA 49.3 (chỉ cột 3 pha, ô dính '1 000 1 000'): M8 820 kVA ở Cont. H 125K 40 °C 400 V 50 Hz", () => {
  const r = lsRatings(read(1012));
  assert.deepEqual([...new Set(r.map((x) => x.model))], ["LSA 49.3 M6", "LSA 49.3 M8", "LSA 49.3 L9", "LSA 49.3 L10"]);
  assert.deepEqual(at(r, "LSA 49.3 M8", 50, "H:125K", 400), [820]);
  assert.deepEqual(at(r, "LSA 49.3 M8", 50, "F:105K", 400), [760]);
  assert.deepEqual(at(r, "LSA 49.3 M8", 50, "H:150K", 400), [910]);
  assert.deepEqual(at(r, "LSA 49.3 M8", 50, "H:163K", 400), [945]);
  assert.deepEqual(at(r, "LSA 49.3 M6", 50, "H:125K", 400), [730]);
  // "| LSA 49.3 L9 | kVA | 910 | … | 1 000 | 1 000 1 000 | 920 | …"
  assert.deepEqual(at(r, "LSA 49.3 L9", 50, "H:150K", 415), [1000]);
  assert.deepEqual(at(r, "LSA 49.3 L9", 50, "H:150K", 440), [920]);
  assert.deepEqual(at(r, "LSA 49.3 M8", 60, "H:125K", 480), [1025]);
  const m8 = r.find((x) => x.model === "LSA 49.3 M8" && x.hz === 50 && x.volt === 400 && x.rise.startsWith("H:125K"));
  assert.equal(m8.duty, "Cont."); assert.equal(m8.kW, 656);
  assert.ok(m8.lines.some((l) => l.startsWith("| LSA 49.3 M8 | kVA | 820")));
  assert.ok(r.every((x) => x.phase === 3));
});

test("LSA 40 (dòng Y ghi điện áp một lần cho mọi nhóm, có cột 1 pha; ô '10.5 10.5')", () => {
  const r = lsRatings(read(1007));
  assert.deepEqual(at(r, "LSA 40 VS1", 50, "H:125K", 400), [10]);
  assert.deepEqual(at(r, "LSA 40 VS1", 50, "H:125K", null, 1), [7]);
  assert.deepEqual(at(r, "LSA 40 VS1", 50, "H:150K", 415), [10.5]);
  assert.deepEqual(at(r, "LSA 40 VS1", 50, "H:163K", 440), [10]);
  assert.equal(r.filter((x) => x.model === "LSA 40 VS1").length, 40); // 2 tần số × 4 nhóm × (4 điện áp + 1 pha)
});

test("LSA 52.3 (tên model một dòng riêng, số nghìn tách bằng '|': '| 1 | 860 |')", () => {
  const r = lsRatings(read(1014));
  assert.deepEqual(at(r, "LSA 52.3 S5", 50, "H:125K", 400), [1860]);
  assert.deepEqual(at(r, "LSA 52.3 S5", 50, "H:163K", 415), [2046]);
  assert.deepEqual(at(r, "LSA 52.3 S5", 60, "H:125K", 480), [2232]);
});

test("LSA 50.2: bảng quấn dây tuỳ chọn (dòng Y thứ hai) không đọc chồng lên bảng chuẩn", () => {
  const r = lsRatings(read(1013));
  assert.deepEqual(at(r, "LSA 50.2 M6", 50, "H:125K", 400), [1250]);
  assert.equal(r.filter((x) => x.model === "LSA 50.2 M6").length, 32);
});

test("TAL-A473: 'TAL -A473-A' (dấu cách thừa ở bảng 60 Hz) là cùng model", () => {
  const r = lsRatings(read(1005));
  assert.ok(!r.some((x) => /\s-/.test(x.model)));
  assert.equal(r.filter((x) => x.model === "TAL-A473-A").length, 32);
});

test("lsFigures: ghép số nghìn chỉ khi đúng một cách, không thì null", () => {
  assert.deepEqual(lsFigures("| 1 000 1 000 | 920", 3), [1000, 1000, 920]);
  assert.deepEqual(lsFigures("| 1 | 315 | 1 | 275", 2), [1315, 1275]);
  assert.equal(lsFigures("| 103.2108.0 | 52.8", 2), null); // ô gõ liền
  assert.equal(lsFigures("| 820 | 820", 3), null); // thiếu số
  assert.equal(lsFigures("| 1 | 315 | 1 | 275", 3), null); // không có cách ghép cho đúng 3 số
});

test("lsSheetAttrs: khối General characteristics, giữ dòng nguyên văn", () => {
  const a = Object.fromEntries(lsSheetAttrs(read(1012)).map((x) => [x.key, x]));
  assert.equal(a.insulation.value, "H");
  assert.deepEqual(a.excitation.value, ["AREP", "PMG"]);
  assert.deepEqual(a.avr.value, ["D350"]);
  assert.deepEqual(a.vreg.value, [0.25]);
  assert.deepEqual(a.sc300.value, { pct: 300, s: 10, all: true });
  assert.equal(a.ip.value, "IP23");
  assert.deepEqual(a.sc300.lines, ["| Short-circuit current | 300% (3 IN) : 10s"]);
  // LSA 40: cột SHUNT ghi "-" → ngắn mạch 300% không có ở mọi kiểu kích từ; nhãn xuống dòng "10" + "s".
  const b = Object.fromEntries(lsSheetAttrs(read(1007)).map((x) => [x.key, x]));
  assert.deepEqual(b.sc300.value, { pct: 300, s: 10, all: false });
  assert.deepEqual(b.avr.value, ["R220", "D350"]);
  assert.deepEqual(b.excitation.value, ["SHUNT", "AREP"]);
  // TAL: "± 0.8 % | ± 0.5" rồi "%" ở dòng sau; "AREP+" rồi "/ PMG" ở dòng sau.
  const c = Object.fromEntries(lsSheetAttrs(read(1004)).map((x) => [x.key, x]));
  assert.deepEqual(c.vreg.value, [0.8, 0.5]);
  assert.deepEqual(c.excitation.value, ["SHUNT", "AREP", "PMG"]);
  assert.equal(c.sc300, undefined);
});
