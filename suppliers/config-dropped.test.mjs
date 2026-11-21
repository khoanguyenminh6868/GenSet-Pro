// IB2600612866 (2026-11-17): the agent wrote `names: ["KUBOTA Corporation"]` for a supplier found on the internet;
// verify.mjs wants names.en / names.zh, so Kubota was not added and its J112 configuration was dropped, while the
// summary still said "Gợi ý 6 cấu hình" over a list of 5.
import test from "node:test";
import assert from "node:assert/strict";
import { namesOf, noteDropped, cfgKey, cfgName } from "./config-bot.mjs";

test("namesOf: a list or a string becomes { en, zh }", () => {
  assert.deepEqual(namesOf(["KUBOTA Corporation"]), { en: "KUBOTA Corporation" });
  assert.deepEqual(namesOf(["潍柴动力", "Weichai Power"]), { en: "Weichai Power", zh: "潍柴动力" });
  assert.deepEqual(namesOf("Denyo"), { en: "Denyo" });
  assert.deepEqual(namesOf(undefined), {});
  const obj = { en: "Cummins", brands: ["Cummins"] };
  assert.equal(namesOf(obj), obj);
});

test("noteDropped: the summary's count follows the list, with the reason of each dropped configuration", () => {
  const cfg = (rank, make, model) => ({ rank, engine: { make, model } });
  const given = [cfg(1, "Kubota", "J112"), cfg(2, "Kubota", "D1105"), cfg(3, "Perkins", "403A-11G1")]
    .map((c) => ({ rank: c.rank, key: cfgKey(c), name: cfgName(c) }));
  const result = { summary: "Gợi ý 3 cấu hình động cơ hãng G7: tổ máy Kubota J112 chính hãng và 2 tổ máy lắp ráp.", configs: [cfg(1, "Kubota", "D1105"), cfg(2, "Perkins", "403A-11G1")], notes: [] };
  noteDropped(given, result, ["#1: nhà cung cấp kubota không có trong hệ thống, đã bỏ", "#2 Tốc độ: câu trích HSMT"]);
  assert.match(result.summary, /^Gợi ý 2 cấu hình/);
  assert.match(result.summary, /Code đã bỏ Kubota J112 .*còn 2 cấu hình/);
  assert.deepEqual(result.notes, ["Code đã bỏ cấu hình Kubota J112 agent đề xuất: nhà cung cấp kubota không có trong hệ thống, đã bỏ."]);
});

test("noteDropped: nothing dropped, nothing changes", () => {
  const result = { summary: "Gợi ý 1 cấu hình.", configs: [{ rank: 1, engine: { make: "Kubota", model: "D1105" } }], notes: [] };
  noteDropped([], result, []);
  assert.equal(result.summary, "Gợi ý 1 cấu hình.");
  assert.deepEqual(result.notes, []);
});
