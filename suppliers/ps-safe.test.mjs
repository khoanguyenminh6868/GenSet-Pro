// ps-safe.mjs: đuôi ảnh từ URL và dấu nháy trong chuỗi PowerShell (lỗ chèn lệnh ở ocr-specs.mjs, Argon review 13/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import { imageExt, psQuote } from "./ps-safe.mjs";

test("imageExt: đuôi thường gặp giữ nguyên, hạ chữ thường", () => {
  assert.equal(imageExt("https://x.com/a/b.JPG"), ".jpg");
  assert.equal(imageExt("https://x.com/a/b.png?v=3"), ".png");
  assert.equal(imageExt("https://x.com/a/b.webp"), ".webp");
  assert.equal(imageExt("https://x.com/a/b.pdf"), ".pdf");
});

test("imageExt: URL cài lệnh sau dấu nháy đơn không lọt vào tên tệp", () => {
  const evil = "https://x.com/a.foo';calc;'png";
  assert.equal(imageExt(evil), ".png");
  for (const u of ["https://x.com/a.jpg'; Remove-Item C:\\x; '", "https://x.com/a.p$(whoami)", "https://x.com/a.\u2018x", "https://x.com/a.toolongext"]) assert.equal(imageExt(u), ".png", u);
});

test("imageExt: không có đuôi hoặc URL hỏng → .png", () => {
  assert.equal(imageExt("https://x.com/banggia"), ".png");
  assert.equal(imageExt("https://x.com/"), ".png");
  assert.equal(imageExt("không phải url"), ".png");
});

test("psQuote: nhân đôi mọi dấu nháy đơn kể cả nháy cong; chuỗi thường giữ nguyên", () => {
  assert.equal(psQuote("C:\\Temp\\a.png"), "C:\\Temp\\a.png");
  assert.equal(psQuote("it's"), "it''s");
  assert.equal(psQuote("a\u2018b\u2019c\u201Ad\u201Be"), "a\u2018\u2018b\u2019\u2019c\u201A\u201Ad\u201B\u201Be");
  // Trong '...' sau khi nhân đôi, chuỗi không còn dấu nháy lẻ nào để đóng sớm.
  const q = psQuote("x';calc;'y");
  assert.equal(q.replace(/''/g, "").includes("'"), false);
});
