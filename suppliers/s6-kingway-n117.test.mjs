// node --test suppliers/s6-kingway-n117.test.mjs — S6-2 (điều phối 21/11/2026): kingway n117 KHÔNG có bản ghi động cơ SC9D340D2.
// Bảng nhãn ghi "| Model | SC9D340D2" (không nhãn "Engine") sau "Alternator Model" / "Controller Model": bản ghi duy nhất là đầu phát
// "Kingway KAI250"; số xi lanh / bore / dung tích / tốc độ của khối đó nằm trên bản ghi đầu phát (chung specs như mọi bảng nhãn) và
// build() bỏ chúng theo `scope` (động cơ ≠ đầu phát). Chưa sinh bản ghi động cơ cho SC9D340D2: chờ chủ dự án quyết (xem PR S6-2).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(new URL("./cn/kingway-power.json", import.meta.url), "utf8"));

test("kingway n117: một bản ghi đầu phát Kingway KAI250, không bản ghi động cơ nào", () => {
  const t = s.specTables.find((x) => x.n === 117);
  assert.ok(t.rows.includes("| Model | SC9D340D2"));
  const r = C.fromSupplier(s, []).filter((x) => x.n === 117);
  assert.deepEqual(r.map((x) => [x.kind, x.model, x.genset]), [["alternator", "Kingway KAI250", "KGD250B"]]);
});

test("kingway: build() không có động cơ SC9D340D2 và đầu phát KAI250 không nhận số của động cơ", () => {
  const b = C.build([s]);
  assert.ok(!b.engines.some((e) => /SC9D340D2/.test(e.model)));
  const a = b.alternators.find((x) => x.model === "Kingway KAI250");
  assert.ok(a);
  for (const k of ["cyl", "bore", "disp", "speed"]) assert.ok(!JSON.stringify(a.specs || []).includes(`"key":"${k}"`), k);
});
