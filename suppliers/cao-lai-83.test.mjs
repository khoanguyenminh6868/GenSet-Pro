// Cào lại 5 trang có ô bị cắt xuống dòng (24/11/2026): jet-power n129, sanq-power n102 / n107 / n123, camda-generator n155.
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
const PAGES = [["jet-power", 129], ["sanq-power", 102], ["sanq-power", 107], ["sanq-power", 123], ["camda-generator", 155]];
const body = (id, n) => read("sources", id, `${n}.md`).split("\n").slice(3).join("\n");

test("5 trang: không còn mảnh ô nằm giữa hai dòng bảng", () => {
  for (const [id, n] of PAGES) {
    const L = body(id, n).split("\n");
    for (let i = 1; i < L.length - 1; i++) {
      const frag = !L[i].startsWith("|") && L[i - 1].startsWith("|") && L[i + 1].startsWith("|") && L[i - 1].split("|").length >= 6 && L[i + 1].split("|").length >= 6;
      assert.ok(!frag, `${id} n${n} dòng ${i + 4}: mảnh "${L[i]}" giữa hai dòng bảng`);
    }
  }
});

test("5 trang: bảng trong specs/ và cn/ đúng bằng tablesOf của tệp nguồn", () => {
  for (const [id, n] of PAGES) {
    const want = tablesOf(body(id, n)).flatMap((t) => [...t.header, ...t.rows]);
    const spec = JSON.parse(read("specs", `${id}.json`)).filter((t) => t.n === n).flatMap((t) => [...t.header, ...t.rows]);
    const cn = (JSON.parse(read("cn", `${id}.json`)).specTables || []).filter((t) => t.n === n).flatMap((t) => [...t.header, ...t.rows]);
    assert.deepEqual(spec, want, `${id} n${n}: specs/`);
    assert.deepEqual(cn, want, `${id} n${n}: cn/`);
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
