// node --test suppliers/*.test.mjs — dung tích chỉ khác độ làm tròn (Khoa 19/11/2026, so-dong-dung-tich vòng 3): các số tương
// thích làm tròn của một động cơ là MỘT nhóm phiếu (majorityRound), ngưỡng so CHẶT bằng số chính xác nhất của nhóm thắng
// (dispExact); trần vẫn × 1,005 như main. Dòng thật: suppliers/fixtures/so-dong-lam-tron.json (chép nguyên văn từ suppliers/cn
// 19/11/2026 bằng genbid-work\dieu-phoi\dau-vao\so-dong-dung-tich\fixture.mjs, mọi dòng có nhắc DP222CB, SC8D280D2, Y490D,
// 403D15G, 6DTAA89G34, WP10D264E200).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { candidates, hintsOf, modelFacts, dispVoters, majorityOf, majorityRound, dispExact, roundCompat, normFig, useNormCtx, BLOCK } from "./config-bot.mjs";

process.env.GENBID_SPEC_NORM = "1";
const C = globalThis.GenbidCatalog;
const SUPS = JSON.parse(fs.readFileSync(new URL("./fixtures/so-dong-lam-tron.json", import.meta.url), "utf8"));
const CAT = C.build(SUPS), FACTS = modelFacts(CAT, SUPS);
const read = (f, ctx) => { const x = normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : BLOCK; };
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
function votes(key) {
  const e = CAT.engines.find((x) => x.key === key), ef = FACTS.get(`engine:${key}`) || [];
  const v = dispVoters(e, ef, { suppliers: new Map(SUPS.map((s) => [s.id, s])), read });
  const figs = ef.filter((f) => f.key === "disp").map((f) => [f.supplierId, read(f)]);
  for (const u of e.uses) for (const f of u.specs || []) if (f.key === "disp") figs.push([u.supplierId, read(f, useNormCtx(u))]);
  const m = figs.map(([s, x]) => [v.get(s) ?? s, x]);
  return { old: majorityOf(m), mj: majorityRound(m) };
}
const run = (kva, text) => candidates(CAT, { value: kva, unit: "kVA" }, free(text), { suppliers: SUPS });
const rows = (r, key) => ({ kept: r.all.filter((x) => x.e.key === key), drop: r.dropped.filter((x) => x.e.key === key) });

test("roundCompat: làm tròn ra đúng số kia và lệch ≤ 1 %; không nhận cắt cụt, không nhận cùng độ chính xác", () => {
  for (const [a, b] of [[21.927, 21.9], [6.75, 6.8], [10.338, 10.34], [10.338, 10.3], [1.496, 1.5], [2.672, 2.67]]) assert.ok(roundCompat(a, b) && roundCompat(b, a), `${a} ~ ${b}`);
  for (const [a, b] of [[37.88, 37.8], [4.3, 4], [5.9, 6], [8.8, 8.9], [8.071, 8.074], [149, 1.5]]) assert.ok(!roundCompat(a, b), `${a} ≁ ${b}`);
});

test("dispExact: số nhiều chữ số thập phân nhất; cùng độ chính xác thì số nhiều phiếu, bằng phiếu thì số trượt trước", () => {
  assert.equal(dispExact({ group: [21.9, 21.927], raw: { 21.9: 4, 21.927: 1 } }, "min"), 21.927);
  assert.equal(dispExact({ group: [8.07, 8.071, 8.074], raw: { 8.07: 3, 8.071: 1, 8.074: 2 } }, "min"), 8.074);
  assert.equal(dispExact({ group: [8.07, 8.071, 8.074], raw: { 8.07: 3, 8.071: 1, 8.074: 1 } }, "min"), 8.071);
  assert.equal(dispExact({ group: [8.07, 8.071, 8.074], raw: { 8.07: 3, 8.071: 1, 8.074: 1 } }, "max"), 8.074);
});

test("DP222CB: 21,9 × 4 và 21,927 là MỘT nhóm; HSMT ≥ 21,927 → số chính xác 21,927 đạt, dòng ở lại (trước: loại theo 21,9)", () => {
  const { old, mj } = votes("DP222CB");
  assert.equal(old.win, 21.9);
  assert.deepEqual(mj.group, [21.9, 21.927]);
  assert.equal(dispExact(mj, "min"), 21.927);
  const r = run(800, "Dung tích xi lanh: ≥ 21,927 lít\n50 Hz"), x = rows(r, "DP222CB");
  assert.ok(x.kept.length > 0);
  assert.ok(!x.drop.some((d) => d.ruled.includes("disp")));
});

test("SC8D280D2: nhóm {8,27; 8,3}, số chính xác 8,27 < 8,3 → loại (Khoa 19/11: chỉ số làm tròn đạt thì loại)", () => {
  const { mj } = votes("SC8D280D2");
  // buoc-4 PR A: cột "排气量" của haifeng-taizhou / zhengchi-power ghi 8,28 (kangwo-guangdong ghi 8,27, cldj-fujian 8,82 không vào nhóm) → nhóm thêm 8,28; số chính xác vẫn 8,27.
  assert.deepEqual(mj.group, [8.27, 8.28, 8.3]);
  const r = run(188, "Dung tích xi lanh: ≥ 8,3 lít\n50 Hz"), x = rows(r, "SC8D280D2");
  assert.ok(x.drop.length > 0);
  const d = x.drop.find((y) => y.ruled.includes("disp"));
  assert.deepEqual(d.src.disp.group, [8.27, 8.28, 8.3]);
  assert.equal(d.src.disp.exact, 8.27);
});

test("Y490D: mọi nguồn chỉ ghi 2,67 (90×105×4 = 2,672), HSMT ≥ 2,672 → loại (Khoa 19/11: nguồn chỉ có số làm tròn thì không giữ)", () => {
  assert.deepEqual(votes("Y490D").mj.group, [2.67]);
  const x = rows(run(26, "Dung tích xi lanh: ≥ 2,672 lít\n50 Hz"), "Y490D");
  assert.equal(x.kept.length, 0);
  assert.ok(x.drop.length > 0 && x.drop.every((d) => d.ruled.includes("disp")));
});

test("403D15G: 1,496 và 1,5 trước chia phiếu (không số đông); nay một nhóm thắng → HSMT ≥ 1,6 loại", () => {
  const { old, mj } = votes("403D15G");
  assert.equal(old, null);
  // buoc-4 PR A: kangwo-guangdong ghi "1.49" (cột 排气量, cắt cụt của 1,496) nên nhóm thêm 1,49; số chính xác vẫn 1,496.
  assert.deepEqual(mj.group, [1.49, 1.496, 1.5]);
  assert.equal(dispExact(mj, "min"), 1.496);
  const x = rows(run(15, "Dung tích xi lanh: ≥ 1,6 lít\n50 Hz"), "403D15G");
  assert.equal(x.kept.length, 0);
  assert.ok(x.drop.length > 0 && x.drop.every((d) => d.ruled.includes("disp")));
});

test("6DTAA89G34: {8,8; 8,82} × 3 thắng 8,9 × 1; hanyang-weifang ghi 114×144 × 6 = 8,819 L → số chính xác 8,82 < 8,9", () => {
  const { old, mj } = votes("6DTAA89G34");
  assert.equal(old, null);
  assert.deepEqual(mj.votes, { 8.8: 3, 8.9: 1 });
  assert.equal(dispExact(mj, "min"), 8.82);
  assert.ok(SUPS.find((s) => s.id === "hanyang-weifang").specTables.some((t) => t.rows.some((l) => /6DTAA8\.9-G34/.test(l) && /114\s*[*×xX]\s*144/.test(l))), "nguồn ghi 114×144");
  assert.ok(Math.abs(Math.PI / 4 * 114 ** 2 * 144 * 6 / 1e6 - 8.819) < 0.001);
});

test("Trần: WP10D264E200 nhóm {9,7; 9,72; 9,726; 9,73}, HSMT ≤ 9,5 → số chính xác 9,726 > 9,5 × 1,005 → loại; ≤ 9,7 → ở lại", () => {
  const { mj } = votes("WP10D264E200");
  assert.deepEqual(mj.group, [9.7, 9.72, 9.726, 9.73]);
  assert.equal(dispExact(mj, "max"), 9.726);
  const a = rows(run(250, "Dung tích xi lanh: ≤ 9,5 lít\n50 Hz"), "WP10D264E200");
  assert.ok(a.drop.length > 0 && a.drop.every((d) => d.ruled.includes("maxDisp")));
  assert.equal(a.drop.find((d) => d.src.maxDisp).src.maxDisp.exact, 9.726);
  const b = rows(run(250, "Dung tích xi lanh: ≤ 9,7 lít\n50 Hz"), "WP10D264E200");
  assert.ok(!b.drop.some((d) => d.ruled.includes("maxDisp")), "9,726 ≤ 9,7 × 1,005 = 9,7485");
});
