// node --test suppliers/*.test.mjs — bảng con nối liền trong một khối, mỗi bảng có tiêu đề riêng (tach-bang-con, 23/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import { tablesOf } from "./crawl-specs.mjs";

const H50 = ["| 3Phases/50Hz/400V/PF=0.8 | | Brand | Engine", "| Model | Prime kVA | Standby kVA | Engine Model"];
const H60 = ["| 3Phases/60Hz/220V/PF=0.8 | | Brand | Engine", "| Model | Prime kVA | Standby kVA | Engine Model"];
const A = ["| AP-10 | 10 | 11 | 4B3.9-G1", "| AP-20 | 20 | 22 | 4B3.9-G2"];
const B = ["| AP-12 | 12 | 13 | 4B3.9-G11", "| AP-24 | 24 | 26 | 4B3.9-G12"];

test("tiêu đề lặp giữa khối: mỗi bảng con đứng dưới tiêu đề của chính nó, kể cả dòng tiêu đề ngay trên", () => {
  assert.deepEqual(tablesOf([...H50, ...A, ...H60, ...B].join("\n")), [{ header: H50, rows: A }, { header: H60, rows: B }]);
});

test("không có tiêu đề lặp: khối đọc như cũ", () => {
  assert.deepEqual(tablesOf([...H50, ...A, ...B].join("\n")), [{ header: H50, rows: [...A, ...B] }]);
});

test("mảnh nhãn của thẻ một sản phẩm không tách bảng", () => {
  const T = "| | Manufacturer | Model | Year | Wattage | kVA | Voltage | Frequency | Fuel Type | Condition | Hours";
  const t = tablesOf([T, "| | Perkins | P-100 | 2020 | 80 | 100 | 400 | 50 | Diesel | Used | 12", "| | Manufacturer | Model | Year", "| | Perkins | P-100 | 2020"].join("\n"));
  assert.equal(t.length, 1);
});

test("dòng máy thiếu tối đa 2 ô được giữ nguyên chữ, không điền ô", () => {
  const T = "| Model | Standby kVA | Prime kVA | Brand | Engine | Gov | Alternator | Emission | Weight | Noise";
  const full = "| BF-1 | 100 | 90 | CUMMINS | 6BT5.9-G1 | E | UCI274C | T3 | 900 | 75";
  const short = "| BF-2 | 110 | 100 | 6BT5.9-G2 | E | UCI274D | T3 | 950 | 76";
  const far = "| BFXYZ-3 | 120 | 110 | AAAA | BBBB | CCCC | DDDD"; // thiếu 3 ô: không giữ
  const t = tablesOf([T, full, short, far].join("\n"));
  assert.deepEqual(t[0].rows, [full, short]);
});

test("dòng phân đoạn ghi dải công suất không vào tiêu đề của bảng con sau", () => {
  const S = "| PREMIUM | P≥560KW NOMINAL POWER", T = ["| Model | Standby | Prime | Engine", "| | KVA | KVA |"];
  const t = tablesOf([...T, ...A, S, ...T, ...B].join("\n"));
  assert.equal(t.length, 2);
  assert.deepEqual(t[1].header, T);
  assert.deepEqual(t[1].rows, B);
});
