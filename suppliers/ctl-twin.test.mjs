// Hai bản bộ điều khiển (Khoa 21/11/2026 "sửa theo phương án 2"): cùng động cơ, giữ bản tài liệu hãng và bản NCC chào, một chỗ của
// trần mỗi hãng. Dòng lấy nguyên văn từ cn/ (agg-fuzhou, voltgent, deep-sea-electronics).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as CB from "./config-bot.mjs";

const rec = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const suppliers = ["agg-fuzhou", "voltgent", "deep-sea-electronics"].map(rec);
const LINE = "| B825E5 | 825/660 | 750/600 | 6M31G825/5";
const hsmtText = "Bộ điều khiển máy phát có chức năng tự động khởi động khi mất điện lưới (AMF). Truyền thông: RS485, Ethernet.";
const base = () => ({
  requirements: [{ item: "Truyền thông", requirement: "RS485, Ethernet", part: "controller", level: "core", code: "ctl_comm", parts: [{ item: "RS485" }, { item: "Ethernet" }] }],
  configs: [{
    rank: 1,
    engine: { make: "Baudouin", model: "6M31G825/5", src: { kind: "catalog", supplierId: "agg-fuzhou", n: 107, line: LINE } },
    controller: { make: "Deep Sea", model: "DSE7320 MKII", src: { kind: "maker", supplierId: "deep-sea-electronics", n: 1001 } },
    suppliers: [{ supplierId: "agg-fuzhou", n: 107, line: LINE }],
    checks: [{ item: "Truyền thông", status: "unclear", part: "controller", parts: [{ item: "RS485", status: "unclear" }, { item: "Ethernet", status: "unclear" }] }],
  }],
});
const run = (result) => { const o = CB.check(result, { hsmtText, suppliers, readWeb: () => null, sized: false }); CB.rankConfigs(o.result); return o.result; };

test("bộ theo tài liệu hãng + NCC cùng động cơ chào bộ khác: hai cấu hình liền nhau", () => {
  const r = run(base());
  assert.deepEqual(r.configs.map((c) => c.controller.model), ["DSE7320 MKII", "DSE7420"]);
  const t = r.configs[1];
  assert.equal(t.ctlTwin.of, "DSE7320 MKII");
  assert.deepEqual(t.suppliers.map((s) => s.supplierId), ["voltgent"]);
  assert.equal(t.controller.fromMaker, undefined);
  assert.match(t.gaps[0], /voltgent chào DSE7420.*cần hỏi NCC/);
});

test("chạy lại check không nhân thêm bản", () => {
  const r = run(run(base()));
  assert.equal(r.configs.filter((c) => c.ctlTwin).length, 1);
  assert.equal(r.configs.length, 2);
});

test("agent đã viết bản NCC chào: không sinh thêm", () => {
  const b = base(), v = rec("voltgent").controllers.find((x) => x.model === "DSE7420");
  b.configs.push({ ...structuredClone(b.configs[0]), rank: 2, controller: { make: "Deep Sea", model: "DSE7420", src: { kind: "controller", supplierId: "voltgent", n: v.src?.[0], line: v.line } } });
  const r = run(b);
  assert.equal(r.configs.filter((c) => c.ctlTwin).length, 0);
});

test("bộ NCC tự chào (không theo tài liệu hãng): không sinh bản", () => {
  const b = base(), v = rec("voltgent").controllers.find((x) => x.model === "DSE7420");
  b.configs[0].controller = { make: "Deep Sea", model: "DSE7420", src: { kind: "controller", supplierId: "voltgent", n: v.src?.[0], line: v.line } };
  assert.equal(run(b).configs.filter((c) => c.ctlTwin).length, 0);
});

// IB2600603983, configmatch 2026-11-21T08:52:00Z, cấu hình #4: agent ghi dòng tổ máy B825E5 của agg-fuzhou.
test("dòng tổ máy của NCC khác: vẫn sinh bản, bản sao lấy dòng tổ máy của NCC chào", () => {
  const b = base();
  b.configs[0].genset = { model: "B825E5", src: { kind: "catalog", supplierId: "agg-fuzhou", n: 107, line: LINE } };
  b.configs[0].checks.push({ item: "Công suất liên tục", status: "met", part: "genset", offered: "750 kVA", sourceQuote: LINE });
  const r = run(b);
  assert.deepEqual(r.configs.map((c) => c.controller.model), ["DSE7320 MKII", "DSE7420"]);
  assert.equal(r.configs[0].genset.model, "B825E5");
  const t = r.configs[1];
  assert.deepEqual(t.suppliers.map((s) => s.supplierId), ["voltgent"]);
  assert.equal(t.genset.model, "VB825-5");
  assert.equal(t.genset.src.supplierId, "voltgent");
  assert.notEqual(t.checks.find((x) => x.item === "Công suất liên tục").status, "met");
  assert.equal(run(r).configs.filter((c) => c.ctlTwin).length, 1);
});

test("cặp hai bản là một chỗ của trần mỗi hãng", () => {
  const b = base();
  b.configs[0].engine.make = "Volvo Penta"; // trần 1 cấu hình mỗi hãng
  assert.equal(run(b).configs.length, 2);
});
