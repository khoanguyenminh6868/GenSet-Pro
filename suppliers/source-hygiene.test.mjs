// Mã nguồn không chứa ký tự điều khiển lạc. Lỗi thật 13/11/2026 (Argon review): trong bot/genbid-hsmt/bcdg-reason.js,
// `\b` quanh MST thành ký tự backspace (0x08) sau khi sửa bằng heredoc, regex không bao giờ khớp mà không báo lỗi gì.
// Tab, xuống dòng, CR và form-feed (có trong chuỗi `\f` của PowerShell/pdftotext) là hợp lệ.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODE = /\.(js|mjs|cjs|ts|html|ps1|cmd|yml|yaml)$/i;
const BAD = /[\x00-\x08\x0B\x0E-\x1F\x7F]/;

test("tệp mã nguồn trong git không có ký tự điều khiển (backspace, NUL, ESC...)", () => {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, maxBuffer: 64 << 20 }).toString("utf8").split("\0").filter((f) => CODE.test(f));
  assert.ok(files.length > 50, `chỉ thấy ${files.length} tệp mã: git ls-files có chạy đúng không?`);
  const found = [];
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, "utf8").split("\n");
    lines.forEach((l, i) => { const m = BAD.exec(l); if (m) found.push(`${f}:${i + 1} ký tự 0x${m[0].charCodeAt(0).toString(16).padStart(2, "0")}`); });
  }
  assert.deepEqual(found, [], "ký tự điều khiển trong mã (thường là \\b thành backspace sau khi sửa bằng heredoc)");
});
