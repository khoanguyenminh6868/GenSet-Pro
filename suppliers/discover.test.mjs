import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkDraft } from "./discover.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const id = "zz-discover-test";
const draft = (over = {}) => ({ id, role: "genset_oem", status: "verified", conf: "medium", en: "ZZ Power Co., Ltd.", web: "https://www.zz-power.cn/",
  src: { 1: ["A", "ZZ Power Co., Ltd. was founded in 2008", "Power range: 10kVA-2500kVA"] }, founded: 2008, fsrc: [1],
  str: [["Có dải tổ máy 10–2500 kVA", 1]], lines: [{ k: "genset", s: "Diesel", fuel: "diesel", p: [10, 2500, "kVA", "unspecified", 1] }], ...over });

test("checkDraft: quotes, numbers, tiers and puffery are checked against the saved page", () => {
  const dir = path.join(ROOT, "sources", id);
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.writeFileSync(path.join(dir, "1.md"), "URL: https://www.zz-power.cn/\nAccessed: 2026-10-29\n\nZZ Power Co., Ltd. was founded in 2008.\nPower range: 10kVA-2500kVA\n");
    fs.writeFileSync(path.join(dir, "2.md"), "URL: https://zz.en.made-in-china.com/\nAccessed: 2026-10-29\n\nZZ Power Co., Ltd. leading supplier\n");
    assert.deepEqual(checkDraft(draft(), id), []);
    const e = (over) => checkDraft(draft(over), id).join("\n");
    assert.match(e({ src: { 1: ["A", "ZZ Power was founded in 2008"] } }), /không có nguyên văn[\s\S]*dòng gần nhất: ZZ Power Co\., Ltd\. was founded/);
    assert.match(e({ lines: [{ s: "Diesel", p: [10, 2000, "kVA", "unspecified", 1] }] }), /số 2000 không có/);
    assert.match(e({ founded: 2009 }), /năm 2009/);
    assert.match(e({ str: [["Nhà sản xuất hàng đầu", 1]] }), /Theo hãng/);
    assert.deepEqual(e({ str: [["Theo hãng: nhà sản xuất hàng đầu", 1]] }), "");
    assert.match(e({ web: "https://zz.en.made-in-china.com/" }), /sàn B2B/);
    assert.match(e({ src: { 1: ["A", "Power range: 10kVA-2500kVA"], 2: ["A", "ZZ Power Co., Ltd. leading supplier"] } }), /src 2: .*hạng phải là "C"/);
    assert.match(e({ src: { 2: ["C", "ZZ Power Co., Ltd. leading supplier"] }, founded: null, lines: [{ s: "x", src: [2] }], status: "partial" }), /conf.*low/);
    assert.match(e({ lines: [{ s: "Diesel", src: [1] }] }), /verified.*cần ít nhất một dòng máy/);
    assert.match(e({ lines: [{ s: "Diesel", eng: ["Cummins"], p: [10, 2500, "kVA", "unspecified", 1] }] }), /"eng" có "Cummins"/);
    assert.match(e({ src: { 3: ["A", "anything at all"] } }), /chưa lưu trang/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
