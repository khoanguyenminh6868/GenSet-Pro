// Reading archives and files without OCR (Publish, 19/11/2026): the pure parts in sync-pure.js. Listings are the real
// output shapes of UnRAR 7.23 (`unrar lt -p-`) and bsdtar (`tar -tvf`, Windows tar.exe and libarchive-tools alike).
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

const UNRAR_LT = `
UNRAR 7.23 x64 freeware      Copyright (c) 1993-2026 Alexander Roshal

Archive: t.rar
Details: RAR 5

        Name: a.txt
        Type: File
        Size: 10
 Packed size: 10
       Ratio: 100%

        Name: sub\\tệp b.txt
        Type: File
        Size: 2
 Packed size: 2

        Name: sub
        Type: Directory
    Modified: 2026-11-19 17:41:02,405866500
`;
test("unrarList đọc tên, loại, kích thước từ `unrar lt`", () => {
  assert.deepEqual(P.unrarList(UNRAR_LT), [
    { name: "a.txt", size: 10, dir: false }, { name: "sub\\tệp b.txt", size: 2, dir: false }, { name: "sub", size: 0, dir: true }]);
});
test("tarList đọc kích thước và tên từ `tar -tvf`, kể cả tên có dấu cách và liên kết", () => {
  const out = ["-rw-r--r--  0 0      0          10 Nov 19 17:41 a.txt", "drwxr-xr-x  0 0      0           0 Nov 19 17:41 sub/",
    "-rw-r--r--  0 user   grp    123456 Jan  1  2020 Chương V/Yêu cầu kỹ thuật.pdf", "lrwxrwxrwx  0 0      0           0 Nov 19 17:41 x -> /etc/passwd",
    "tar.exe: Archive entry has empty or unreadable filename ... skipping"].join("\n");
  assert.deepEqual(P.tarList(out), [
    { name: "a.txt", size: 10, dir: false, link: false }, { name: "sub/", size: 0, dir: true, link: false },
    { name: "Chương V/Yêu cầu kỹ thuật.pdf", size: 123456, dir: false, link: false }, { name: "x", size: 0, dir: false, link: true }]);
});
test("unsafeEntry: đường dẫn tuyệt đối, ổ đĩa, '..' bị chặn; tên thường thì không", () => {
  for (const n of ["/etc/passwd", "C:\\Windows\\x.dll", "c:/x", "../x", "a/../../b", "a\\..\\b", "\\\\srv\\share\\x"]) assert.equal(P.unsafeEntry(n), true, n);
  for (const n of ["a.txt", "Chương V/YCKT.pdf", "a..b.pdf", "..x/y", "sub\\tệp b.txt"]) assert.equal(P.unsafeEntry(n), false, n);
});
test("archiveRefusal: đường dẫn thoát thư mục, quá số mục, quá dung lượng; trong giới hạn thì rỗng", () => {
  const lim = { entries: 3, bytes: 100, files: 30, depth: 1 };
  assert.match(P.archiveRefusal([{ name: "ok.pdf", size: 1 }, { name: "../evil.exe", size: 1 }], lim), /ra ngoài thư mục \(\.\.\/evil\.exe\)/);
  assert.match(P.archiveRefusal([1, 2, 3, 4].map((i) => ({ name: `f${i}`, size: 1 })), lim), /4 mục, quá giới hạn 3/);
  assert.match(P.archiveRefusal([{ name: "bomb.bin", size: 2 * 1048576 }], { ...lim, bytes: 1048576 }), /2 MB, quá giới hạn 1 MB/);
  assert.equal(P.archiveRefusal([{ name: "a", size: 50 }, { name: "b", size: 50 }], lim), "");
  assert.equal(P.archiveRefusal([]), "");
  assert.deepEqual(P.ARCHIVE_LIMITS, { entries: 500, bytes: 1024 ** 3, files: 500, depth: 1 });
});
test("unrarFail: 0 không lỗi; 1 tệp nén thiếu/hỏng một phần; 11 mật khẩu, 3 sai CRC, quá thời gian, mã lạ", () => {
  assert.equal(P.unrarFail(0), "");
  assert.equal(P.unrarFail(1), "tệp nén có lỗi (hỏng hoặc thiếu một phần)");
  assert.equal(P.unrarFail(11), "có mật khẩu");
  assert.equal(P.unrarFail(3), "tệp nén hỏng (sai CRC)");
  assert.equal(P.unrarFail(null), "giải nén quá thời gian");
  assert.equal(P.unrarFail(42), "giải nén lỗi (mã 42)");
});
test("tarFail: mật khẩu theo lời tar; lỗi khác lấy dòng đầu stderr", () => {
  assert.equal(P.tarFail(1, "tar: Encrypted file is unsupported"), "có mật khẩu");
  assert.equal(P.tarFail(1, "tar.exe: Passphrase required for this entry"), "có mật khẩu");
  assert.equal(P.tarFail(0, ""), "");
  assert.equal(P.tarFail(1, "tar.exe: Truncated input file (needed 1024 bytes, only 0 available)\ntar.exe: Error exit delayed"), "tệp nén hỏng hoặc không đọc được (Truncated input file (needed 1024 bytes, only 0 available))");
  assert.equal(P.tarFail(null, ""), "giải nén quá thời gian");
});
test("pdfNeedsOcr: ≥5 trang với ≥30% trang trống, chữ hỏng font, hay gần như không có chữ thì chờ OCR", () => {
  const page = (s) => s + "\f";
  const good = "Yêu cầu kỹ thuật của máy phát điện dự phòng công suất 500 kVA, động cơ diesel bốn kỳ.";
  assert.equal(P.pdfNeedsOcr([1, 2, 3, 4, 5].map(() => page(good)).join("")), false);
  assert.equal(P.pdfNeedsOcr([good, good, good, "", ""].map(page).join("")), true); // 2/5 = 40% trang scan
  assert.equal(P.pdfNeedsOcr([good, good, good, good, ""].map(page).join("")), false); // 1/5 = 20%
  assert.equal(P.pdfNeedsOcr(page("") + page("  ")), true); // 2 trang scan: không có chữ
  assert.equal(P.pdfNeedsOcr(page(good), () => true), true); // hỏng font (garbled của ocr-pdf.js)
});
