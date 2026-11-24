// node --test suppliers/*.test.mjs — luật hình học trong lá phiếu số đông của Gợi ý cấu hình (Khoa 24/11/2026: thay cho danh
// sách ngoại lệ các ca `hinh-hoc` của spec-value-check). Một dòng nguồn mà xi lanh × π/4 × bore² × hành trình lệch dung tích
// của chính dòng > 5 % (SN.selfCheck qua `useGeo`, cùng chỗ gọi với spec-value-check) không biết ô nào sai: khi các nguồn của
// động cơ ghi số khác nhau, số của dòng đó rời lá phiếu xi lanh / dung tích, trừ số mà một dòng tự khớp cũng ghi; không còn
// dòng tự khớp nào thì như cũ. Dữ liệu thật: đọc thẳng suppliers/cn (các NCC có dòng của QSB5.9-G31, QSB5-G3, WP6D180E201).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { candidates, hintsOf, modelFacts, dispVoters, majorityRound, normFig, geoRows, geoKeep, useGeo, BLOCK } from "./config-bot.mjs";

process.env.GENBID_SPEC_NORM = "1";
const C = globalThis.GenbidCatalog;
const IDS = ["aosif", "voltgent", "yunding-jiangsu", "tecnogen", "yingtai-jiangsu", "depco-power", "jianghao-genset", "victory-generator"];
const SUPS = IDS.map((id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8")));
const CAT = C.build(SUPS), FACTS = modelFacts(CAT, SUPS), SUP = new Map(SUPS.map((s) => [s.id, s]));
const ROWS = new Map();
for (const s of SUPS) (s.specTables || []).forEach((t, i) => ROWS.set(`${s.id}|${i}`, t.rows || []));
const read = (f, ctx) => { const x = normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : BLOCK; };
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const eng = (model) => CAT.engines.find((e) => e.model === model);
// Lá phiếu dung tích của động cơ (như majOf của candidates: NCC gộp theo dispVoters, nhóm làm tròn), có / không luật hình học.
function dispVote(model, geo = true) {
  const e = eng(model), ef = FACTS.get(`engine:${e.key}`) || [], g = geoRows(e.uses, ROWS);
  const v = dispVoters(e, ef, { suppliers: SUP, read, rowsMap: ROWS });
  const all = ef.filter((f) => f.key === "disp").map((f) => [f, read(f)]);
  const kept = geo ? geoKeep(all, "disp", g) : all;
  return { g, all, kept, mj: majorityRound(kept.map(([f, x]) => [v.get(f.supplierId) ?? f.supplierId, x])) };
}
function withGeo(on, fn) { const old = process.env.GENBID_GEO_VOTE; process.env.GENBID_GEO_VOTE = on ? "1" : "0"; try { return fn(); } finally { if (old == null) delete process.env.GENBID_GEO_VOTE; else process.env.GENBID_GEO_VOTE = old; } }

test("useGeo: dòng aosif n1024 QSB5.9-G31 tự mâu thuẫn (ghi 3,9 L), dòng voltgent / yunding tự khớp", () => {
  const e = eng("QSB5.9-G31");
  const bad = e.uses.find((u) => u.supplierId === "aosif" && u.n === 1024), good = e.uses.filter((u) => ["voltgent", "yunding-jiangsu"].includes(u.supplierId));
  assert.ok(bad && good.length >= 2);
  // bo-o-lech-126 (Khoa 24/11/2026): ô "3.9 L" của dòng này đã bị bỏ ở nguồn (`dropspec` disp), nên dòng không còn tự mâu thuẫn
  // (thiếu dung tích: selfCheck null); luật hình học ở lá phiếu không còn việc với dòng này, các dòng khác không đổi.
  assert.equal(useGeo(bad, ROWS), null);
  assert.equal(bad.specs.some((s) => s.key === "disp"), false);
  // Dòng thiếu một trong bốn số (selfCheck null, voltgent n102) không tốt không xấu: bỏ phiếu như cũ.
  const checked = good.map((u) => useGeo(u, ROWS)).filter(Boolean);
  assert.ok(checked.length >= 2 && checked.every((x) => !x.bad));
  assert.ok(good.some((u) => useGeo(u, ROWS) == null));
});

test("QSB5.9-G31: số 3,9 của dòng tự mâu thuẫn rời lá phiếu → 5,9 L thắng (aosif n101, voltgent, yunding); trước: không thắng", () => {
  const before = dispVote("QSB5.9-G31", false), after = dispVote("QSB5.9-G31");
  // bo-o-lech-126: số 3,9 đã bị bỏ ở nguồn nên không còn gì để luật rời khỏi lá phiếu: cả hai cách đếm đều ra 5,9 × 3.
  assert.deepEqual(before.mj?.votes, { 5.9: 3 });
  assert.deepEqual(after.mj?.votes, { 5.9: 3 });
  assert.equal(after.all.length - after.kept.length, 0);
});

test("QSB5-G3: 4,5 L (dòng yingtai tự khớp, cùng số aosif / tecnogen) thắng khi số của dòng tự mâu thuẫn rời lá phiếu", () => {
  assert.equal(dispVote("QSB5-G3", false).mj, null);
  const after = dispVote("QSB5-G3");
  assert.equal(after.mj?.win, 4.5);
  assert.ok(after.all.length > after.kept.length);
});

test("WP6D180E201: dòng depco tự mâu thuẫn nhưng ghi 6,75 như dòng jianghao tự khớp → số ở lại, 6,75 vẫn thắng (bỏ hẳn thì mất thắng)", () => {
  const before = dispVote("WP6D180E201", false), after = dispVote("WP6D180E201");
  const depco = after.all.find(([f]) => f.supplierId === "depco-power");
  // bo-o-lech-126: ô xi lanh sai của dòng depco (n2025) đã bỏ ở nguồn nên dòng không còn "bad" (thiếu xi lanh); dung tích 6,75 ở lại.
  assert.equal(after.g.of(depco[0]), null);
  assert.equal(depco[1], 6.75);
  assert.equal(after.kept.length, after.all.length, "không bỏ số nào");
  assert.equal(before.mj?.win, 6.75);
  assert.equal(after.mj?.win, 6.75);
});

test("geoKeep: không dòng tự khớp, hay nguồn không mâu thuẫn → giữ nguyên lá phiếu", () => {
  const f = (s, x) => [{ supplierId: s, n: 1, line: s }, x];
  const geoOf = (m) => ({ bad: 1, good: Object.values(m).filter((g) => g === "good").length, of: (x) => m[x.supplierId] ?? null });
  const all = [f("a", 6.75), f("b", 6.25), f("c", 6.75)];
  assert.equal(geoKeep(all, "disp", geoOf({ b: "bad" })), all, "không có dòng tốt");
  const same = [f("a", 6.75), f("b", 6.8), f("c", 6.75)];
  assert.equal(geoKeep(same, "disp", geoOf({ a: "good", b: "bad" })), same, "6,75 / 6,8 là một nhóm làm tròn: không mâu thuẫn");
  assert.deepEqual(geoKeep(all, "disp", geoOf({ a: "good", b: "bad" })).map(([g]) => g.supplierId), ["a", "c"]);
  assert.deepEqual(geoKeep([f("a", 6), f("b", 12), f("c", 6)], "cyl", geoOf({ a: "good", b: "bad", c: "bad" })).map(([g]) => g.supplierId), ["a", "c"], "dòng xấu ghi số của dòng tốt ở lại");
  assert.equal(geoKeep(all, "disp", null), all);
});

test("candidates: HSMT ≤ 5 lít → dòng QSB5.9-G31 bị loại theo giá trị thắng 5,9 (luật hình học); tắt luật thì ở lại như cũ", () => {
  const e = eng("QSB5.9-G31"), u = e.uses.find((x) => x.supplierId === "voltgent" && x.power?.prime?.kVA);
  assert.ok(u, "dòng voltgent có công suất prime");
  const run = () => candidates(CAT, { value: u.power.prime.kVA, unit: "kVA" }, free("Dung tích xi lanh: ≤ 5 lít\n50 Hz"), { suppliers: SUPS });
  const on = withGeo(true, run), off = withGeo(false, run);
  const d = on.dropped.find((x) => x.e.key === e.key && x.u.supplierId === "voltgent");
  assert.ok(d, "bật luật: dòng voltgent bị loại");
  assert.ok(d.ruled.includes("maxDisp"));
  assert.equal(d.src.maxDisp.win, 5.9);
  // bo-o-lech-126: số 3,9 sai đã bỏ ở nguồn, nên 5,9 thắng kể cả khi tắt luật hình học: cả hai cách đều loại dòng.
  assert.ok(off.dropped.some((x) => x.e.key === e.key && x.u.supplierId === "voltgent" && x.ruled.includes("maxDisp")), "tắt luật: vẫn loại vì nguồn đã bỏ số 3,9");
});
