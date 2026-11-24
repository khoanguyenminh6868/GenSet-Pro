// bidhist config.text giữ dòng số pha (pha-soat, 24/11/2026): `want` của histConfigOf không có "pha" nên 22 / 24 gói thiếu chữ pha.
// Dòng pha (tối đa 2) xếp SAU nhóm CONFIG_KEY, trước phần còn lại: không đẩy dòng KEY. Dòng mẫu theo HSMT thật (IB2200029877, IB2300343668, IB2500189675).
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

test("histConfigOf: dòng nêu số pha vào config.text dù không có từ khoá khác, tối đa 2 dòng, ưu tiên dòng của tổ máy", () => {
  const text = [
    "Hệ thống kết nối điện áp ra: Cơ chế bảo vệ: Aptomat 1 pha, dòng điện phù hợp công suất máy",
    "Tổ máy: Loại: Máy phát điện xoay chiều, 1 pha 2 dây",
    "Máy 2250 kVA: cấu hình: 01 máy 3P-4W-50Hz-0.4kV, Diesel 4 Cycle",
    "Đầu phát - Số pha, số dây: 1 pha - 2 dây",
    "Dòng không liên quan: sơn tĩnh điện dày 1,2 mm",
  ].join("\n");
  const t = P.histConfigOf(text, "x").text;
  assert.ok(t.split("\n").length <= 4, t);
  assert.match(t, /Số pha, số dây: 1 pha - 2 dây/);
  assert.doesNotMatch(t, /sơn tĩnh điện/);
});

test("configText: dòng pha đứng sau nhóm KEY, KEY không bao giờ bị đẩy", () => {
  const key = Array.from({ length: 30 }, (_, i) => `Công suất dòng ${i}: ` + "k".repeat(150));
  const rest = Array.from({ length: 30 }, (_, i) => `Động cơ dòng ${i}: ` + "r".repeat(150));
  const all = [...key, ...rest, "Đầu phát: Số pha, số dây: 3 pha, 4 dây"];
  const t = P.configText([...key, ...rest], 6000, all);
  assert.ok(t.length <= P.CONFIG_TEXT_MAX);
  for (const k of key) assert.ok(t.includes(k), k.slice(0, 20));
  assert.match(t, /3 pha, 4 dây/);
  const before = P.configText([...key, ...rest]);
  assert.ok(before.split("\n").filter((l) => /^Công suất/.test(l)).length === t.split("\n").filter((l) => /^Công suất/.test(l)).length);
});

test("configText: dòng dài chỉ giữ mệnh đề có pha; mặc định không đổi so với trước", () => {
  const long = "Tổ máy phát điện: " + "x".repeat(200) + "; điện áp 400V, 3 pha, 4 dây; " + "y".repeat(100);
  const t = P.configText([], 6000, [long]);
  assert.equal(t, "điện áp 400V, 3 pha, 4 dây");
  const lines = ["Model a công suất", "Động cơ b"];
  assert.equal(P.configText(lines), "Model a công suất\nĐộng cơ b");
});
