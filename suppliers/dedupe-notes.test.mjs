// dedupe-notes.mjs: only repeats go, the first stays where it stood (mk-lap-3, 24/11/2026).
import test from "node:test";
import assert from "node:assert/strict";
import { dedupeNote, dedupeMatch } from "./dedupe-notes.mjs";
import { BMS_NOTE } from "./ctl-module.mjs";

const MK = (v, m) => `Nguồn là datasheet ${v}; nhà cung cấp ghi ${m}, cần xác nhận đời (MK) của bộ điều khiển.`;

test("dedupeNote: three MK sentences become one, other words stay", () => {
  const s = `Đạt. ${MK("DSE7320 MKII", "DSE7320")} ${MK("DSE7320 MKII", "DSE7320")} ${MK("DSE7320 MKII", "DSE7320")} Xem thêm.`;
  const [out, mk, bms] = dedupeNote(s);
  assert.equal(out, `Đạt. ${MK("DSE7320 MKII", "DSE7320")} Xem thêm.`);
  assert.equal(mk, 2); assert.equal(bms, 0);
  // Two different MK sentences are not repeats.
  const two = `${MK("A MKII", "A")} ${MK("B MKII", "B")}`;
  assert.deepEqual(dedupeNote(two), [two, 0, 0]);
  assert.deepEqual(dedupeNote(undefined), [undefined, 0, 0]);
});

test("dedupeNote: BMS sentence twice (agent + code) becomes once", () => {
  const s = `${BMS_NOTE} ${MK("DSE7320 MKII", "Deepsea 7320")} ${BMS_NOTE}`;
  const [out, mk, bms] = dedupeNote(s);
  assert.equal(out, `${BMS_NOTE} ${MK("DSE7320 MKII", "Deepsea 7320")}`);
  assert.equal(mk, 0); assert.equal(bms, 1);
});

test("dedupeMatch: sizes, parts, codeWas; nothing else changes", () => {
  const note = `${MK("AMF9", "AMF9")} ${MK("AMF9", "AMF9")}`;
  const data = { at: "x", result: { sizes: [{ label: "100 kVA", result: { notes: ["Kiểm tra bằng code: 4 điểm", "Kiểm tra bằng code: 4 điểm", "Kiểm tra bằng code: 2 điểm"],
    configs: [{ rank: 1, checks: [{ item: "A", status: "met", note, parts: [{ item: "p", note }], codeWas: { note } }] }] } }] } };
  const s = dedupeMatch(data);
  assert.equal(s.mk, 3); assert.equal(s.mkFields, 3); assert.equal(s.codeLines, 1);
  const c = data.result.sizes[0].result.configs[0].checks[0];
  assert.equal(c.note, MK("AMF9", "AMF9")); assert.equal(c.parts[0].note, MK("AMF9", "AMF9")); assert.equal(c.codeWas.note, MK("AMF9", "AMF9"));
  assert.deepEqual(data.result.sizes[0].result.notes, ["Kiểm tra bằng code: 4 điểm", "Kiểm tra bằng code: 2 điểm"]);
  assert.equal(c.status, "met"); assert.equal(data.at, "x");
});
