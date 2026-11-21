// Chức năng manual ghi là tuỳ chọn → "cần xác nhận" kèm dòng nguyên văn (bdk-manual-2, Khoa 21/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as CM from "./ctl-module.mjs";
import { modelFacts, scoreOf } from "./config-bot.mjs";

const dse = JSON.parse(fs.readFileSync(new URL("./cn/deep-sea-electronics.json", import.meta.url), "utf8"));
const rows = CM.optionRows([dse]);
const facts = modelFacts({ engines: [], alternators: [] }, [dse]).get("controller:DSE7320MKII");
const part = (name, status = "unclear", extra = {}) => ({ item: `Nhóm: ${name}`, name, status, offered: "", part: "controller", group: {}, ...extra });

test("hai chức năng: đúng dòng nguyên văn của bảng tuỳ chọn", () => {
  const names = { "Nhiệt độ, áp suất bôi trơn": "Oil Temperature*", "Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc": "Frequency Adjust | 0.0 %" };
  for (const [name, line] of Object.entries(names)) {
    const x = part(name);
    CM.ctlOptions([x], facts, rows);
    assert.equal(x.status, "confirm", name);
    assert.equal(x.sourceQuote, line);
    assert.deepEqual(x.factSrc, { supplierId: "deep-sea-electronics", n: 1016, line });
    assert.ok(rows.get("deep-sea-electronics|1016").includes(line));
  }
});

test("manual không nói đúng nghĩa: giữ chưa rõ", () => {
  for (const name of ["Mức nước làm mát thấp", "Mức nhiên liệu thấp / hết nhiên liệu","Sai lệch điện áp AC giữa các pha", "Lệch pha", "Nhiệt độ nước làm mát cao", "Áp lực dầu nhớt thấp", "Tần số quá cao/quá thấp", "Cài đặt tần số 50/60 Hz"]) {
    const x = part(name);
    CM.ctlOptions([x], facts, rows);
    assert.equal(x.status, "unclear", name);
    assert.equal(x.ctlOption, undefined);
  }
});

test("chỉ đổi phần chưa rõ, không đổi đạt / không đạt / chưa khớp nguồn", () => {
  for (const [status, extra] of [["met", {}], ["not_met", {}], ["unclear", { unverified: true }], ["unclear", { conflict: true }], ["unclear", { version: "DSE7320 MKII" }]]) {
    const x = part("Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc", status, extra);
    CM.ctlOptions([x], facts, rows);
    assert.equal(x.status, status);
  }
});

test("datasheet đời khác (version) không dùng bảng tuỳ chọn của MKII", () => {
  const x = part("Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc");
  CM.ctlOptions([x], facts.map((f) => ({ ...f, version: "DSE7320 MKII" })), rows);
  assert.equal(x.status, "unclear");
});

test("chạy lại: trả về đúng câu của agent rồi mới chấm", () => {
  const x = part("Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc", "unclear", { note: "Agent ghi", offered: "x" });
  CM.ctlOptions([x], facts, rows);
  CM.commRestore(x);
  assert.equal(x.status, "unclear");
  assert.equal(x.note, "Agent ghi");
  assert.equal(x.offered, "x");
  assert.equal(x.sourceQuote, undefined);
  assert.equal(x.ctlOption, undefined);
});

test("điểm xếp hạng: phần tuỳ chọn vẫn tính như chưa rõ", () => {
  const c = (p) => ({ suppliers: [], checks: [{ item: "G", part: "controller", level: "core", status: "unclear", parts: [p] }] });
  const x = part("Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc");
  const before = scoreOf(c({ ...x }));
  CM.ctlOptions([x], facts, rows);
  assert.deepEqual(scoreOf(c(x)), before);
});
