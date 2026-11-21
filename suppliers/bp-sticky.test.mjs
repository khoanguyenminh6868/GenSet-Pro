// Giữ mức xếp cũ của agent (bp-sticky, 13/11/2026): hai lượt cùng đầu vào cho cùng pool dù agent trả khác.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { check, stickyPlan, ratingSig, lotKey, rerateOn } from "./bidprice-bot.mjs";

const BP = globalThis.GenbidBidprice;
const lot = (price, wp, n) => ({ lotNo: "", lotName: "", price, goods: [{ name: "Máy phát điện 100kVA", maker: "Weichai", origin: "Trung Quốc" }],
  bidders: Array.from({ length: n }, (_, i) => ({ name: `NT${i}`, taxCode: String(100 + i), bidPrice: i ? wp * 1.05 : wp, won: !i, winPrice: i ? null : wp })) });
// Eight lots like IB2600601812's pool; B5 is the boundary lot (0,868, 5 bidders).
const ratios = [[0.552, 4], [0.656, 3], [0.822, 2], [0.86, 3], [0.868, 5], [0.945, 2], [0.97, 2], [0.99, 3]];
const docs = Object.fromEntries(ratios.map(([r, n], i) => [`B${i + 1}`, { bidName: "Mua sắm máy phát điện 100kVA", final: true, lots: [lot(4.5e8, 4.5e8 * r, n)] }]));
const t = { notifyNo: "X", bidName: "Mua sắm máy phát điện 100 kVA", cfgText: "Động cơ Weichai; vỏ cách âm" };
const { list } = BP.candidates(t, docs, 100, 4.66e8);
const sig = ratingSig({ first: { engine: { make: "Weichai", model: "WP4" } }, group: "cn", K: 100, rating: null, sync: null, cfgText: t.cfgText, size: null });
const fc = { p: [0.322, 0.403, 0.164, 0.111] };
const quote = (s) => BP.sampleText(s).split("\n")[0];
// The agent's answer: every lot "close", except the boundary lot at `edge`.
const agent = (edge, only = list) => ({ tender: { summary: "100 kVA", points: [] }, notes: [], samples: only.map((s) => ({ id: s.id, level: s.key === "B5" ? edge : "close", same: [], diff: [], quote: quote(s) })) });
function run(prev, answer, force = false) {
  const plan = stickyPlan(list, prev?.ratings, sig, force);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bp-sticky-"));
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: 100, price: 4.66e8 }, total: list.length, list, prior: [], fc,
    sticky: { sig, kept: plan.kept, why: plan.why, ...(plan.reused ? { tender: prev.ratings.tender, notes: prev.ratings.notes } : {}) } }));
  // No new lot: the bot does not run the agent (no result.json); else the agent rates the new lots only (`answer` may
  // still say something else about the kept ones: it must not count).
  if (plan.fresh.length || answer) fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(answer ? answer(plan.fresh) : agent("close", plan.fresh)));
  const out = check(dir).result;
  fs.rmSync(dir, { recursive: true, force: true });
  return { plan, out };
}
const lv = (st) => [st.levels.map((l) => l.price), st.calib.levels.map((l) => l.price), st.pool];

test("bp-sticky: lượt 2 giữ mức lượt 1 dù agent trả khác → cùng pool, cùng 3 mức", () => {
  assert.equal(list.length, 8);
  const r1 = run(null, () => agent("close"));
  assert.equal(r1.plan.fresh.length, 8);
  assert.equal(r1.out.stats.pool, 8);
  assert.equal(Object.keys(r1.out.ratings.items).length, 8);
  // Run 2, same inputs: nothing new for the agent; even if an agent answer flips B5 to "different", the kept level stays.
  const r2 = run(r1.out, () => agent("different"));
  assert.equal(r2.plan.fresh.length, 0);
  assert.deepEqual(lv(r2.out.stats), lv(r1.out.stats));
  assert.equal(r2.out.samples.find((s) => s.key === "B5").level, "close");
  assert.deepEqual(r2.out.rated, { kept: 8, fresh: 0 });
  // No agent run at all (no result.json): same again, the tender summary kept.
  const r3 = run(r2.out, null);
  assert.deepEqual(lv(r3.out.stats), lv(r1.out.stats));
  assert.equal(r3.out.tender.summary, "100 kVA");
  // Without the kept levels, the flip would move the levels (what happened on IB2600601812).
  const flip = run(null, () => agent("different"));
  assert.equal(flip.out.stats.pool, 7);
  assert.notDeepEqual(lv(flip.out.stats), lv(r1.out.stats));
});

test("bp-sticky: ứng viên mới → agent chỉ xếp gói mới; gói cũ đổi chữ → xếp lại gói đó", () => {
  const r1 = run(null, () => agent("close"));
  const prev = { ratings: { ...r1.out.ratings, items: { ...r1.out.ratings.items } } };
  delete prev.ratings.items[lotKey(list[2])];
  assert.deepEqual(stickyPlan(list, prev.ratings, sig).fresh.map((s) => s.key), [list[2].key]);
  // A lot whose text the agent read changed (bidhist read again): its hash no longer matches.
  const changed = list.map((s, i) => (i === 0 ? { ...s, name: s.name + " (đọc lại)" } : s));
  assert.deepEqual(stickyPlan(changed, r1.out.ratings, sig).fresh.map((s) => s.key), [list[0].key]);
});

test("bp-sticky: khoá so sánh đổi hoặc buộc tay → xếp lại toàn bộ", () => {
  const r1 = run(null, () => agent("close"));
  const base = { first: { engine: { make: "Weichai", model: "WP4" } }, group: "cn", K: 100, rating: null, sync: null, cfgText: t.cfgText, size: null };
  assert.equal(ratingSig({ ...base }), sig);
  // Not a change: spacing / case of the requirement text.
  assert.equal(ratingSig({ ...base, cfgText: "  động cơ  weichai; VỎ cách âm " }), sig);
  for (const ch of [{ first: { engine: { make: "Cummins", model: "6BT" } } }, { first: { engine: { make: "Weichai", model: "WP6" } } }, { first: { engine: { make: "Weichai", model: "WP4" }, alternator: { make: "Stamford" } } },
    { group: "foreign" }, { K: 125 }, { rating: "standby" }, { sync: { need: 3 } }, { cfgText: "Động cơ Weichai; không vỏ" }, { size: { label: "100 kVA", qty: 2 } }]) {
    const s2 = ratingSig({ ...base, ...ch });
    assert.notEqual(s2, sig, JSON.stringify(ch));
    const p = stickyPlan(list, r1.out.ratings, s2);
    assert.equal(p.fresh.length, 8);
    assert.match(p.why, /đổi/);
  }
  const forced = stickyPlan(list, r1.out.ratings, sig, true);
  assert.equal(forced.fresh.length, 8);
  assert.equal(forced.why, "buộc xếp lại");
  assert.equal(rerateOn({ rerate: true }), true);
  assert.equal(rerateOn({ basis: { rerate: true } }), true);
  assert.equal(rerateOn({ basis: {} }), false);
});

test("bp-sticky: gói câu trích không khớp không được lưu (lượt sau hỏi lại)", () => {
  const bad = () => ({ ...agent("close"), samples: agent("close").samples.map((x) => (x.id === list[1].id ? { ...x, quote: "không có trong gói" } : x)) });
  const r1 = run(null, bad);
  assert.equal(r1.out.ratings.items[lotKey(list[1])], undefined);
  assert.deepEqual(stickyPlan(list, r1.out.ratings, sig).fresh.map((s) => s.key), [list[1].key]);
});
