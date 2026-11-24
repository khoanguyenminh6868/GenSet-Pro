// Cào lại 11 trang (5 đợt đầu, 6 đợt sau: camda n138 / n139, mecca n144 / n159, sanq n103 / n108) có ô bị cắt xuống dòng (24/11/2026): jet-power n129, sanq-power n102 / n107 / n123, camda-generator n155.
// Các tệp nguồn lưu ngày 28/10/2026, trước khi #123 (29/10) cho htmlToText giữ một ô trên một dòng; bảng và hồ sơ dựng từ
// tệp cũ mất 56 dòng máy (và cắt tiêu đề cột). Test này giữ cho: (1) không còn mảnh ô giữa hai dòng bảng ở 5 trang,
// (2) mọi dòng bảng của specs/ nằm đúng trong tệp nguồn, (3) cn/ khớp merge-specs, (4) các dòng từng bị cắt có mặt.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tablesOf } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const PAGES = [["jet-power", 129], ["sanq-power", 102], ["sanq-power", 107], ["sanq-power", 123], ["camda-generator", 155],
  ["camda-generator", 138], ["camda-generator", 139], ["mecca-power", 144], ["mecca-power", 159], ["sanq-power", 103], ["sanq-power", 108]];
// mecca-power: cn/ bỏ bảng trùng nguyên dòng với bảng khác (merge-specs), nên chỉ so specs/.
const CN_SAME = (id) => id !== "mecca-power";
// sanq-power n102 / n103 / n107 / n108: dòng phân đoạn tần số một ô ("| 60HZ (DCEC)") đứng ngay trên tiêu đề được gắn vào đầu header
// (bộ thu thập bỏ dòng này; `catalog.js` đọc tần số từ header). Dòng có thật trong tệp nguồn.
const HZ_SECT = /^\| *[56]0 ?HZ[^|]*$/i;
const noSect = (a) => a.filter((l) => !HZ_SECT.test(l));
const body = (id, n) => read("sources", id, `${n}.md`).split("\n").slice(3).join("\n");

test("11 trang: không còn mảnh ô nằm giữa hai dòng bảng", () => {
  for (const [id, n] of PAGES) {
    const L = body(id, n).split("\n");
    for (let i = 1; i < L.length - 1; i++) {
      const frag = !L[i].startsWith("|") && L[i - 1].startsWith("|") && L[i + 1].startsWith("|") && L[i - 1].split("|").length >= 6 && L[i + 1].split("|").length >= 6;
      assert.ok(!frag, `${id} n${n} dòng ${i + 4}: mảnh "${L[i]}" giữa hai dòng bảng`);
    }
  }
});

test("11 trang: bảng trong specs/ và cn/ đúng bằng tablesOf của tệp nguồn", () => {
  for (const [id, n] of PAGES) {
    const want = noSect(tablesOf(body(id, n)).flatMap((t) => [...t.header, ...t.rows]));
    const spec = JSON.parse(read("specs", `${id}.json`)).filter((t) => t.n === n).flatMap((t) => [...t.header, ...t.rows]);
    const cn = (JSON.parse(read("cn", `${id}.json`)).specTables || []).filter((t) => t.n === n).flatMap((t) => [...t.header, ...t.rows]);
    assert.deepEqual(noSect(spec), want, `${id} n${n}: specs/`);
    if (CN_SAME(id)) assert.deepEqual(noSect(cn), want, `${id} n${n}: cn/`);
  }
});

test("các dòng từng bị cắt có mặt nguyên trong hồ sơ", () => {
  const rows = (id) => (JSON.parse(read("cn", `${id}.json`)).specTables || []).flatMap((t) => t.rows);
  const jet = rows("jet-power");
  for (const m of ["| P-250 | 250 | 200 | 225 | 180 | 1206D-E70TTAG2 |", "| P-2500 | 2500 | 2000 | 2250 | 1800 | 4016-61TRG3 |"]) assert.ok(jet.some((r) => r.startsWith(m)), m);
  const sanq = rows("sanq-power");
  assert.ok(sanq.includes("| SQC715 | 572/715 | 520/650 | QSKTAA19-G4 NR2 | HCI544F | 145 | 6600 | 9000 | 3525×1550×2032 | 5000×1983×2371"), "SQC715 đủ ô động cơ");
  assert.ok(sanq.some((r) => r.startsWith("| SQN619 | 495/619 | 450/563 | D2840LE211 | HCI544E | 198 | 3350 | 6000 | 3350×1350×1700 | 5030x1860x2550")), "SQN619 đủ ô kích thước");
  const camda = rows("camda-generator");
  assert.ok(camda.includes("| KDGC1505S1 | 1880 | 1505 | 1713 | 1370 | 4012-46TAG3A | LSA50.2L8 | 12192×2438×2896 | 18485"), "KDGC1505S1");
});

test("sanq-power: dòng phân đoạn tần số có trong nguồn, hàng -6 đọc ra 60 Hz, hàng thường 50 Hz", async () => {
  await import("../web/catalog.js");
  const C = globalThis.GenbidCatalog;
  for (const n of [102, 103, 107, 108]) {
    const src = read("sources", "sanq-power", `${n}.md`).split("\n");
    for (const t of (JSON.parse(read("cn", "sanq-power.json")).specTables || []).filter((t) => t.n === n)) for (const l of t.header.filter((l) => HZ_SECT.test(l))) assert.ok(src.includes(l), `n${n}: ${l}`);
  }
  const recs = C.fromSupplier(JSON.parse(read("cn", "sanq-power.json")), []).filter((r) => r.kind === "engine");
  const hz = (g) => [...new Set(recs.filter((r) => r.genset === g).map((r) => r.freq))];
  assert.deepEqual(hz("SQC275-6"), [60]);
  assert.deepEqual(hz("SQC275"), [50]);
});
