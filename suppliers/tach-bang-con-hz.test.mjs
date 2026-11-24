// node --test suppliers/*.test.mjs — dòng phân đoạn hai ô ghi tần số mở bảng con, kể cả khi tiêu đề sau nó khác tiêu đề đầu
// (kaihua-genset n124 / n125, 23/11/2026: dòng 60 Hz đang nằm trong bảng không ghi tần số).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tablesOf } from "./crawl-specs.mjs";

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), "sources", "kaihua-genset");
const T50 = "| Genset Model | Standby Power | Prime power | Engine model | Dimension | Weight (KG)";
const R50 = "| HC-68GF | 93.5 | 74.8 | 85 | 68 | TAD530GE";
const SEC = "| Powered by VOLVO | 440V, 1800RPM, 60Hz";
const T60 = "| Genset Model | Standby kVA | Prime kVA | Engine Model | Alternator Stamford | Dimension";
const R60 = "| HC-142GF2 | 145 | 131 | TAD532GE | UCI 274D1 | 2150*900*1550";

test("dòng hai ô ghi Hz ngay trên dòng tiêu đề mở bảng con; dòng 60 Hz không còn ở bảng đầu", () => {
  const t = tablesOf([T50, R50, R50.replace("68GF", "75GF"), SEC, T60, R60, R60.replace("142", "206")].join("\n"));
  assert.equal(t.length, 2);
  assert.ok(!t[0].rows.some((r) => r.includes("GF2")));
  assert.deepEqual(t[1].header, [SEC, T60]);
  assert.equal(t[1].rows.length, 2);
});

test("dòng hai ô không ghi Hz, hoặc không có tiêu đề ngay dưới, không mở bảng con", () => {
  const noHz = tablesOf([T50, R50, "| Powered by VOLVO | Open type", T60, R60].join("\n"));
  assert.equal(noHz.length, 1);
  const noTitle = tablesOf([T50, R50, SEC, R50.replace("68GF", "75GF")].join("\n"));
  assert.equal(noTitle.length, 1);
});

test("dòng máy ít số trơn là dòng: không thành tiêu đề của bảng con sau, không tạo điểm tách giả (rcg-power, pauway-tianjin)", () => {
  const H = "| | Model | Prime Power | Standby Power | Engine | Alternator | Download";
  const row = (m, e) => `| ${m} | 113 kVA / 90 kW | 124 kVA / 99 kW | ${e} | TAL-A44-E | PDF`;
  const whole = tablesOf([H, row("R-DC20D5-S", "4B3.9-G11"), row("R-DC113D5-S", "6BTA5.9-G2"), row("R-DC138D5-S", "6BTAA5.9-G2"), row("R-DC113D5-S", "6BTA5.9-G2").replace("TAL-A44-E", "UCI274ES")].join("\n"));
  assert.equal(whole.length, 1);
  assert.equal(whole[0].rows.length, 4);
  const P = "| 型号 | 主用功率 (kW/kVA) | 备用功率 (kW/kVA) | 发动机型号 | 下载";
  const last = "| PWP2500P | 2000/2500 | NA/NA | 4016-61TRG3X | VIEW PDF";
  const t = tablesOf([P, "| PWP10 | 7.2/9 | 7.92/10 | 403D-11G | VIEW PDF", last, P, "| PWP825-60 | 600/750 | 660/825 | 4006-23TAG2A | VIEW PDF"].join("\n"));
  assert.equal(t.length, 2);
  assert.ok(t[0].rows.includes(last));
  assert.ok(!t[1].header.includes(last));
});

for (const [n, count] of [[124, 36], [125, 40]]) {
  test(`tệp nguồn kaihua n${n}: mọi dòng sau dòng 60 Hz nằm ở bảng con có tiêu đề 60Hz, không dòng nào mất`, () => {
    const text = fs.readFileSync(path.join(SRC, `${n}.md`), "utf8"), L = text.split(/\r?\n/);
    const at = L.findIndex((l) => /^\| Powered by .*60Hz/.test(l));
    assert.ok(at > 0);
    const t = tablesOf(text), sub = t.filter((x) => x.header.some((h) => /60Hz/.test(h)));
    assert.equal(sub.length, 1);
    const others = t.filter((x) => !sub.includes(x)).flatMap((x) => x.rows);
    for (const r of sub[0].rows) { assert.ok(L.indexOf(r) > at, r); assert.ok(!others.includes(r), r); }
    assert.ok(sub[0].rows.length + others.length >= count, `${sub[0].rows.length} + ${others.length}`);
  });
}
