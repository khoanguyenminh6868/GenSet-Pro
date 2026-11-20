// Trần cấu hình mỗi hãng động cơ (rankConfigs, perMakeConfigs): 2; Perkins, Volvo Penta, Cummins, Mitsubishi 1 (Khoa 17/11/2026);
// Baudouin 3 (Khoa 20/11/2026, IB2600603983: "Sửa lại luật để Baudouin được 3 cấu hình").
import { test } from "node:test";
import assert from "node:assert/strict";
import { perMakeConfigs, rankConfigs } from "./config-bot.mjs";

test("perMakeConfigs: Baudouin 3, Perkins 1, hãng khác 2", () => {
  assert.equal(perMakeConfigs("Baudouin"), 3);
  assert.equal(perMakeConfigs("baudouin / Weichai"), 3);
  assert.equal(perMakeConfigs("Perkins"), 1);
  assert.equal(perMakeConfigs("Yuchai"), 2);
});

const cfg = (make, model, ctl) => ({ engine: { make, model }, alternator: { model: "LSA 49.3 M8" }, controller: { make: "Deep Sea", model: ctl }, suppliers: [], checks: [] });
test("rankConfigs giữ 3 cấu hình Baudouin, bỏ cấu hình thứ tư; Yuchai vẫn 2", () => {
  const out = rankConfigs({ requirements: [], configs: [
    cfg("Baudouin", "6M31G825/5", "DSE7420"), cfg("Baudouin", "6M31G825/5", "DSE7320"), cfg("Baudouin", "6M33G825/5", "DSE6120"), cfg("Baudouin", "6M33G900/5", "DSE7320"),
    cfg("Yuchai", "YC6T", "DSE7320"), cfg("Yuchai", "YC6K", "DSE7320"), cfg("Yuchai", "YC6C", "DSE7320"),
  ] });
  assert.equal(out.configs.filter((c) => c.engine.make === "Baudouin").length, 3);
  assert.equal(out.configs.some((c) => c.engine.model === "6M33G900/5"), false);
  assert.equal(out.configs.filter((c) => c.engine.make === "Yuchai").length, 2);
});
