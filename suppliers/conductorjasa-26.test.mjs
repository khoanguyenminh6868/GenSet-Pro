// node --test suppliers/conductorjasa-26.test.mjs — 26 dòng máy conductorjasa không vào bảng nào (conductorjasa-26, 25/11/2026).
// (1) Ô cuối "–" (cột kích thước trống) khiến dòng "| MJPS-2000 S16R-PTAA2 2000 kVA prime | S16R-PTAA2 | 2000 | 2200 | 305 L/jam | –"
//     chỉ có 2 ô số trên 6 ô: `isData` (≥ 40 % ô là số) trượt, `tableOf` trả null (7 dòng n101-103).
// (2) Khối dòng máy không có tiêu đề riêng, tiêu đề dính cùng dòng với nhãn mục không có "|" ở đầu:
//     "3 model | | Model | Mesin | Prime kVA | Standby kVA" (19 dòng + 8 dòng n116 → 27 dòng).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tablesOf } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const source = (n) => fs.readFileSync(path.join(ROOT, "sources", "conductorjasa", `${n}.md`), "utf8");

test("ô cuối '–' là ô trống: dòng có '305 L/jam' và '–' là dòng dữ liệu", () => {
  const rows = ["| MJPS-2000 S16R-PTAA2 2000 kVA prime | S16R-PTAA2 | 2000 | 2200 | 305 L/jam | –", "| MJPS-2000 WP S16R-PTAA2-C 2000 kVA prime | S16R-PTAA2-C | 2000 | 2200 | 315 L/jam | –"];
  assert.deepEqual(tablesOf(["Mesin Mitsubishi", ...rows, "hết"].join("\n")), [{ header: [], rows }]);
});

test("ô '–' ở giữa dòng vẫn là ô chữ: danh sách dòng sản phẩm không thành bảng máy (eastern-lion)", () => {
  const l = "| 60HZ Engine By Yuxing Series | 24 – 371 kW | 0 | — | — | — | View details →";
  assert.deepEqual(tablesOf(["| | | Power range | models | Engine | Alternator | Controller |", l, l].join("\n")).flatMap((t) => t.rows.filter((r) => r === l)), []);
});

test("khối dòng máy không tiêu đề, tiêu đề dính cùng dòng nhãn: bảng riêng với tiêu đề lấy từ dòng đó", () => {
  const rows = ["| PJPS-13 WP 403A-15G1 | 403A-15G1 | 13 | 14,3", "| PJPS-15 WP 403A-15G2 | 403A-15G2 | 15 | 16,5"];
  const t = tablesOf(["Seri 400", "3 model | | Model | Mesin | Prime kVA | Standby kVA", ...rows, "Seri 1100"].join("\n"));
  assert.deepEqual(t, [{ header: ["| Model | Mesin | Prime kVA | Standby kVA"], rows }]);
});

test("dòng trên khối không đủ chắc (ít ô hơn dòng máy, có số trần, không nói công suất) thì không lấy làm tiêu đề", () => {
  const rows = ["| PJPS-13 WP 403A-15G1 | 403A-15G1 | 13 | 14,3 kVA", "| PJPS-15 WP 403A-15G2 | 403A-15G2 | 15 | 16,5 kVA"];
  for (const above of ["3 model | Mesin | Prime", "3 model | | Model | Mesin | 13 | 14", "3 model | | Model | Mesin | Warna | Berat"]) {
    assert.ok(tablesOf([above, ...rows].join("\n")).every((t) => t.header.length === 0), above);
  }
});

test("tệp nguồn conductorjasa: mọi dòng '|' có số nằm trong một bảng (n101-103, n116)", () => {
  for (const n of [101, 102, 103, 116]) {
    const inTable = new Set(tablesOf(source(n)).flatMap((t) => t.rows));
    const out = source(n).split("\n").filter((l) => l.startsWith("|") && l.split("|").length >= 4 && /\d/.test(l) && !inTable.has(l));
    assert.deepEqual(out, [], `n${n}`);
  }
  assert.equal(tablesOf(source(116)).flatMap((t) => t.rows).length, 44);
});
