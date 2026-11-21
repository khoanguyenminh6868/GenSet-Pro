// bdk-mo-dun-4 (Khoa 20/11/2026 "1. Ok làm đi"): bảng câu hỏi NCC (rfqOf) hỏi NCC có cấp được bộ điều khiển / mô-đun chọn theo
// tài liệu hãng (NCC chưa chào) không, kèm mã đặt hàng và CO; cấu hình không có các trường đó thì bảng như cũ.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rfqOf } from "./config-bot.mjs";
import * as CM from "./ctl-module.mjs";

const base = () => ({ engine: { model: "6M31G825/5", make: "Baudouin" }, controller: { model: "DSE7320 MKII", make: "Deep Sea" }, checks: [] });

test("cấu hình không có fromMaker / modules: rfq không thêm dòng", () => {
  assert.deepEqual(rfqOf(base()), []);
  const c = base(); c.controller.modules = [{ model: "DSE890 MKII", order: "0890-04", offeredBy: "voltgent", label: CM.MODULE_LABEL }];
  assert.deepEqual(rfqOf(c), []);
});

test("bộ điều khiển + mô-đun NCC chưa chào: hỏi cấp được không, mã đặt hàng, CO; ở tầng hãng / model / xuất xứ", () => {
  const c = base();
  c.controller.fromMaker = true; c.controller.label = CM.CTL_ALT_LABEL;
  c.controller.modules = [{ model: "DSE890 MKII", make: "Deep Sea", order: "0890-04", compat: [], offeredBy: null, label: CM.MODULE_LABEL, why: ["Ethernet", "4G"] }];
  const q = rfqOf(c);
  assert.equal(q.length, 2);
  assert.ok(q.every((x) => x.tier === 1 && x.part === "controller" && x.status === "unclear"));
  assert.equal(q[0].item, "Bộ điều khiển DSE7320 MKII");
  assert.match(q[0].ask, /cấp được bộ điều khiển DSE7320 MKII \(Deep Sea\).*CO/);
  assert.equal(q[0].note, CM.CTL_ALT_LABEL);
  assert.equal(q[1].item, "Mô-đun DSE890 MKII, mã đặt hàng 0890-04");
  assert.equal(q[1].requirement, "cho Ethernet, 4G");
  assert.match(q[1].ask, /mô-đun DSE890 MKII \(Deep Sea\), mã đặt hàng 0890-04 lắp kèm bộ điều khiển DSE7320 MKII.*CO/);
  assert.equal(q[1].note, CM.MODULE_LABEL);
});
