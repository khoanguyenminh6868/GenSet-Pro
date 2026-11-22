// node --test suppliers/s6-kingway-n117.test.mjs — kingway n117 SC9D340D2.
// S6-2 (21/11/2026): Khoa từ chối sinh bản ghi động cơ vì khối "| Model | SC9D340D2 | Cylinder Number | 6 …" không ghi nhãn "Engine".
// Khoa 22/11/2026 ("coi lại vụ kingway nếu data hợp lý thì lấy luôn", nhánh kingway-n117): danh sách tường minh `ENGINE_LINES` sinh
// bản ghi động cơ SC9D340D2 cho đúng bảng này: các bảng khác cùng trang ghi "SDEC Engine Model : SC9D340D2" cho cùng tổ máy KGD250B,
// SC9D340D2 là khoá động cơ SDEC của 60+ NCC, số của khối khớp (6 xi lanh, 114x144, 8.9 L; hình học 8.82 L). Công suất động cơ
// "228/255" (nhãn "Rated /Standby") và tốc độ "1500/1800" không đọc. Bản ghi đầu phát Kingway KAI250 giữ nguyên.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(new URL("./cn/kingway-power.json", import.meta.url), "utf8"));

test("kingway n117: đầu phát Kingway KAI250 (như cũ) + động cơ SC9D340D2 của tổ máy KGD250B, không hãng, cyl / bore / disp", () => {
  const t = s.specTables.find((x) => x.n === 117);
  assert.ok(t.rows.includes("| Model | SC9D340D2"));
  const r = C.fromSupplier(s, []).filter((x) => x.n === 117);
  assert.deepEqual(r.map((x) => [x.kind, x.model, x.genset, x.other]), [["alternator", "Kingway KAI250", "KGD250B", null], ["engine", "SC9D340D2", "KGD250B", "Kingway KAI250"]]);
  const e = r[1];
  assert.deepEqual(e.makes, []);
  assert.deepEqual(e.power, { prime: { kVA: 250, kW: 200 }, standby: { kVA: 275, kW: 220 } });
  assert.deepEqual(e.specs.map((p) => [p.key, p.value]), [["cyl", "6"], ["bore", "114x144"], ["disp", "8.9"]]);
  // Bằng chứng vai: bảng khác cùng trang ghi rõ "SDEC Engine Model : SC9D340D2" cho KGD250B.
  assert.ok(s.specTables.some((x) => x.n !== 117 && x.rows.some((l) => /KGD250B.*SDEC Engine Model\s*:\s*SC9D340D2/.test(l))));
});

test("kingway: build() có động cơ SC9D340D2 nhận dòng KGD250B; đầu phát KAI250 không nhận số của động cơ", () => {
  const b = C.build([s]);
  const e = b.engines.find((x) => x.key === "SC9D340D2");
  assert.ok(e && e.uses.some((u) => u.supplierId === "kingway-power" && u.n === 117 && u.genset === "KGD250B"));
  const a = b.alternators.find((x) => x.model === "Kingway KAI250");
  assert.ok(a);
  for (const k of ["cyl", "bore", "disp", "speed"]) assert.ok(!JSON.stringify(a.specs || []).includes(`"key":"${k}"`), k);
});

test("kingway n117: chữ dòng đổi (cào lại) → không đọc, ghi note", () => {
  const s2 = JSON.parse(JSON.stringify(s)), t = s2.specTables.find((x) => x.n === 117);
  t.rows = t.rows.map((l) => (l === "| Displacement (L) | 8.9" ? "| Displacement (L) | 8.8" : l));
  const notes = [];
  assert.ok(!C.fromSupplier(s2, notes).some((x) => x.n === 117 && x.kind === "engine"));
  assert.ok(notes.some((x) => x.n === 117 && x.reason === "dòng động cơ trong danh sách đổi chữ: không đọc"));
});
