// bidhist config.text giữ dòng số pha (pha-soat, 24/11/2026): `want` của histConfigOf không có "pha" nên 22 / 24 gói thiếu chữ pha;
// CONFIG_KEY đưa dòng pha lên trước khi cắt 6.000 ký tự. Dòng mẫu theo HSMT thật (IB2200029877, IB2300343668, IB2500189675).
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

test("histConfigOf: dòng nêu số pha vào config.text dù không có từ khoá khác", () => {
  const text = [
    "Hệ thống kết nối điện áp ra: Cơ chế bảo vệ: Aptomat 1 pha, dòng điện phù hợp công suất máy",
    "Tổ máy: Loại: Máy phát điện xoay chiều, 1 pha 2 dây",
    "Máy 2250 kVA: cấu hình: 01 máy 3P-4W-50Hz-0.4kV, Diesel 4 Cycle",
    "Đầu phát - Số pha, số dây: 3 pha - 4 dây",
    "Dòng không liên quan: sơn tĩnh điện dày 1,2 mm",
  ].join("\n");
  const t = P.histConfigOf(text, "x").text;
  assert.match(t, /1 pha 2 dây/);
  assert.match(t, /3P-4W/);
  assert.match(t, /3 pha - 4 dây/);
  assert.doesNotMatch(t, /sơn tĩnh điện/);
});

test("histConfigOf: dòng pha đi cùng nhóm KEY khi chữ vượt giới hạn, không vượt CONFIG_TEXT_MAX", () => {
  const filler = Array.from({ length: 80 }, (_, i) => `Động cơ dòng ${i}: ` + "x".repeat(150));
  const text = [...filler, "Đầu phát: Số pha, số dây: 3 pha, 4 dây"].join("\n");
  const t = P.histConfigOf(text, "x").text;
  assert.ok(t.length <= P.CONFIG_TEXT_MAX);
  assert.match(t, /3 pha, 4 dây/);
});

test("CONFIG_KEY: nhận số pha, không nhận chữ 'phát' / 'phạm vi'", () => {
  assert.ok(P.CONFIG_KEY.test("điện áp 3 pha"));
  assert.ok(P.CONFIG_KEY.test("Số pha: 3"));
  assert.ok(P.CONFIG_KEY.test("một pha"));
  assert.ok(!/pha/.test("phạm vi") || !P.CONFIG_KEY.test("phạm vi cung ứng ở đây"));
});
