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

// ---- Nguồn 1022 (LSA 43.2): dòng bảng "| 43.2 S1 | kVA | …" không có chữ "LSA"; 4 nhóm × (4 điện áp 3 pha + 1 cột 1 pha) ----
test("LSA 43.2 (1022): dòng không chữ LSA, 20 cột mỗi model, số khớp dòng nguồn", () => {
  const r = lsRatings(read(1022));
  assert.deepEqual([...new Set(r.map((x) => x.model))], ["LSA 43.2 S1", "LSA 43.2 S15", "LSA 43.2 S25", "LSA 43.2 S35", "LSA 43.2 M45", "LSA 43.2 L65", "LSA 43.2 L8"]);
  assert.equal(r.length, 7 * 2 * 20);
  // "| 43.2 S35 | kVA | 50 | 53 | 52 | 47 | 33 | 45 | 48 | 47 | 42 | 30 | …" (50 Hz, 380 400 415 440 V)
  assert.deepEqual([380, 400, 415, 440].map((v) => at(r, "LSA 43.2 S35", 50, "H:125K", v)[0]), [50, 53, 52, 47]);
  assert.deepEqual([380, 400, 415, 440].map((v) => at(r, "LSA 43.2 S35", 50, "F:105K", v)[0]), [45, 48, 47, 42]);
  assert.deepEqual(at(r, "LSA 43.2 S35", 50, "H:150K", 400), [56]);
  assert.deepEqual(at(r, "LSA 43.2 S35", 50, "H:163K", 400), [58]);
  // "| kW | 40 | 42 | 42 | 38 | 26 | …"
  assert.equal(r.find((x) => x.model === "LSA 43.2 S35" && x.hz === 50 && x.volt === 400 && x.rise.startsWith("H:125K")).kW, 42);
  // 60 Hz "| 43.2 L8 | …" dòng cuối nhóm: 380 416 440 480 V
  const l8 = r.filter((x) => x.model === "LSA 43.2 L8" && x.hz === 60 && x.rise.startsWith("H:125K") && x.phase === 3);
  assert.deepEqual(l8.map((x) => x.volt), [380, 416, 440, 480]);
  assert.ok(r.every((x) => x.lines.some((l) => /^\| 43\.2 \w+ \| kVA/.test(l))));
});

// ---- Nguồn 6003 (LSA Rating Table, mục 8.1 Series Star 6 dây): "LSA 53.2 M9 - C6S/4 Option 6 …" 12 số ----
test("LSA 53.2 / 54.2 (6003): 12 số = 3 điện áp × [H125, F105, H150, H163]", () => {
  const r = lsRatings(read(6003));
  assert.deepEqual([...new Set(r.map((x) => x.model))], ["LSA 53.2 M9", "LSA 53.2 M12", "LSA 54.2 M10", "LSA 54.2 UL14"]);
  assert.ok(r.every((x) => x.hz === 50 && x.phase === 3 && x.kW === null));
  // "LSA 53.2 M9 - C6S/4 Option 6 3 000 2 736 3 150 3 300 3 000 2 736 3 150 3 300 3 000 2 736 3 150 3 300"
  assert.deepEqual([380, 400, 415].map((v) => at(r, "LSA 53.2 M9", 50, "H:125K", v)[0]), [3000, 3000, 3000]);
  assert.deepEqual(at(r, "LSA 53.2 M9", 50, "F:105K", 400), [2736]);
  assert.deepEqual(at(r, "LSA 53.2 M9", 50, "H:150K", 400), [3150]);
  assert.deepEqual(at(r, "LSA 53.2 M9", 50, "H:163K", 400), [3300]);
  // "LSA 54.2 UL14 - C6TS/4 Option 6 4 320 3 940 4 536 4 752 4 320 3 940 4 536 4 752 3 900 3 557 4 095 4 290"
  assert.deepEqual([380, 400, 415].map((v) => at(r, "LSA 54.2 UL14", 50, "H:125K", v)[0]), [4320, 4320, 3900]);
  assert.deepEqual([380, 400, 415].map((v) => at(r, "LSA 54.2 UL14", 50, "F:105K", v)[0]), [3940, 3940, 3557]);
  assert.deepEqual([380, 400, 415].map((v) => at(r, "LSA 54.2 UL14", 50, "H:163K", v)[0]), [4752, 4752, 4290]);
  assert.deepEqual(at(r, "LSA 54.2 M10", 50, "H:150K", 415), [3591]);
  assert.equal(r.filter((x) => x.model === "LSA 53.2 M12").length, 12);
  // các cỡ 49.3 / 50.2 / 52.3 của cùng bảng đã đọc từ tờ riêng: không đọc lại từ 6003
  assert.ok(!r.some((x) => /49\.3|50\.2|52\.3/.test(x.model)));
});
