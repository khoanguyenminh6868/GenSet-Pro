// Tệp nén nhiều tệp (20/11/2026): đọc đủ tệp, tệp có chữ trước, scan sau, tệp bị cắt thì được gọi tên.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

test("trần số tệp = trần số mục: tệp nén 42 / 48 tệp (IB2500441397, IB2600576655) đọc đủ", () => {
  assert.equal(P.ARCHIVE_LIMITS.files, P.ARCHIVE_LIMITS.entries);
  for (const n of [30, 31, 42, 48, 500]) assert.equal(n <= P.ARCHIVE_LIMITS.files, true, String(n));
});
test("chốt chống bom nén vẫn giữ: 501 mục, quá dung lượng, đường dẫn ra ngoài đều bị từ chối", () => {
  const files = (n) => Array.from({ length: n }, (_, i) => ({ name: `f${i}.pdf`, size: 1 }));
  assert.equal(P.archiveRefusal(files(500)), "");
  assert.match(P.archiveRefusal(files(501)), /501 mục, quá giới hạn 500/);
  assert.match(P.archiveRefusal([{ name: "bomb", size: 1024 ** 3 + 1 }]), /quá giới hạn 1024 MB/);
  assert.match(P.archiveRefusal([{ name: "..\\x", size: 1 }]), /ra ngoài thư mục/);
  assert.equal(P.ARCHIVE_LIMITS.depth, 1);
});
test("archiveOrder: tệp có chữ trước, scan sau, giữ thứ tự trong mỗi nhóm", () => {
  const items = [{ p: "a.pdf", scan: true }, { p: "b.docx", scan: false }, { p: "c.png", scan: true }, { p: "d.xlsx", scan: false }, { p: "e.pdf", scan: false }];
  assert.deepEqual(P.archiveOrder(items).map((i) => i.p), ["b.docx", "d.xlsx", "e.pdf", "a.pdf", "c.png"]);
  assert.deepEqual(P.archiveOrder([]), []);
  assert.deepEqual(P.archiveOrder([{ p: "x", scan: true }]).map((i) => i.p), ["x"]);
  const all = Array.from({ length: 48 }, (_, i) => ({ p: `p${i}`, scan: i % 2 === 0 }));
  const o = P.archiveOrder(all);
  assert.equal(o.length, 48);
  assert.equal(o.findIndex((i) => i.scan), 24);        // 24 có chữ rồi 24 scan
  assert.equal(o.some((i) => !i.scan && o.indexOf(i) >= 24), false);
});
test("unreadList: gọi tên tệp chưa đọc, rút gọn khi nhiều", () => {
  assert.equal(P.unreadList(["a", "b"]), "a, b");
  assert.equal(P.unreadList(["a", "b", "c"], 2), "a, b ... (+1)");
  assert.equal(P.unreadList([]), "");
});
