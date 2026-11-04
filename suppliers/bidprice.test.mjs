import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { check } from "./bidprice-bot.mjs";

const BP = globalThis.GenbidBidprice;
const lot = (price, wp, goods = [], n = 3) => ({ lotNo: "", lotName: "", price, goods, bidders: Array.from({ length: n }, (_, i) => ({ name: `NT${i}`, taxCode: String(100 + i), bidPrice: i ? wp * 1.1 : wp, won: !i, winPrice: i ? null : wp })) });
const docs = {
  A: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8, [{ name: "Máy phát điện 400kVA", maker: "Weichai", origin: "Trung Quốc" }])] },
  B: { bidName: "Mua sắm máy phát điện 1500kVA", final: true, lots: [lot(5e9, 4e9)] },
  C: { bidName: "Mua sắm máy phát điện dự phòng", final: true, lots: [lot(1e9, 9e8)] },
  D: { bidName: "Sửa chữa máy phát điện 400kVA", final: true, lots: [lot(1e8, 9e7)] },
  E: { bidName: "Mua sắm máy phát điện dự phòng", final: true, lots: [lot(1e9, 9.9e8, [{ name: "Máy phát điện", maker: "HBC Power", code: "EXT20KLE.LS" }], 1)] },
};

test("candidates: only power within 5% when the tender's is known; repair left out", () => {
  const more = { ...docs, G: { bidName: "Mua sắm máy phát điện 420kVA", final: true, lots: [lot(1e9, 8e8)] }, H: { bidName: "Mua sắm máy phát điện 440kVA", final: true, lots: [lot(1e9, 8e8)] } };
  const { list } = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" }, more, 400, 1.2e9);
  assert.deepEqual(list.map((s) => s.key).sort(), ["A", "G"]);
  // Power not known for the tender: a lot with won goods stays even without a power, one with nothing about it does not.
  assert.deepEqual(BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện" }, docs, null, 1.2e9).list.map((s) => s.key).sort(), ["A", "B", "E"]);
  assert.match(BP.sampleText(list.find((s) => s.key === "A")), /hãng Weichai \| xuất xứ Trung Quốc/);
});

test("candidates: lots of the other engine origin group left out; alike configuration ranks first", () => {
  const g = (maker, origin) => [{ name: "Máy phát điện 400kVA", maker, origin }];
  const more = {
    CN: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8, g("Weichai", "Trung Quốc"))] },
    US: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8, g("Cummins", "Mỹ"))] },
    // Origin not on the goods, but the HSMT asks for a G7 engine.
    G7: { bidName: "Mua sắm máy phát điện 400kVA", final: true, config: { text: "Động cơ: xuất xứ các nước G7" }, lots: [lot(1e9, 8e8)] },
    ATS: { bidName: "Mua sắm máy phát điện 400kVA", final: true, config: { text: "Vỏ cách âm, tủ ATS, bộ điều khiển Deep Sea" }, lots: [lot(1e9, 8e8)] },
    NONE: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8)] },
  };
  const t = { notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA", cfgText: "Có vỏ cách âm; ATS 630A; bộ điều khiển Deep Sea DSE7320", engine: { make: "Weichai", model: "WP13D385E200" } };
  const r = BP.candidates(t, more, 400, 1e9);
  assert.equal(r.group, "cn");
  assert.equal(r.otherGroup, 2);
  assert.deepEqual(r.list.map((s) => s.key), ["ATS", "CN", "NONE"]);
  const ats = r.list[0];
  assert.equal(ats.cfg.sim, 1);
  assert.match(BP.cfgLine(ats), /giống 100% \(cùng: bảng điều khiển Deep Sea, vỏ cách âm, ATS\)/);
  assert.match(BP.cfgLine(r.list[1]), /nhóm xuất xứ động cơ Trung Quốc/);
  // No configuration planned and an HSMT naming no make: every group stays.
  assert.equal(BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" }, more, 400, 1e9).list.length, 5);
});

test("candidates: moving or re-installing an owned set is left out", () => {
  const ks = (more) => BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" }, more, 400, 1e9).list.map((s) => s.key).sort();
  const g = [{ name: "Máy phát điện 400kVA", maker: "Weichai" }];
  assert.deepEqual(ks({
    A: docs.A,
    MOVE: { bidName: "Di dời, lắp đặt máy phát điện 400kVA và các tủ điện", final: true, lots: [lot(1e9, 8e8)] },
    BUY: { bidName: "Mua sắm và điều chuyển máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8, g)] },
    OLD: { bidName: "Lắp đặt máy phát điện 400kVA, cải tạo tủ điện", final: true, config: { text: "Máy phát điện 400 KVA do Bệnh viện chuyển giao, cần di dời, cải tạo và lắp đặt" }, lots: [lot(1e9, 8e8)] },
    // A new set won, the old one taken away: a supply.
    NEW: { bidName: "Cung cấp, lắp đặt máy phát điện 400kVA", final: true, config: { text: "Tháo dỡ, đóng gói hệ thống máy phát hiện hữu" }, lots: [lot(1e9, 8e8, g)] },
    WHEEL: { bidName: "Mua máy phát điện 400kVA", final: true, config: { text: "Tổ máy: có bánh xe để di chuyển, tận dụng tối đa không gian" }, lots: [lot(1e9, 8e8)] },
  }), ["A", "BUY", "NEW", "WHEEL"]);
});

test("profileOf: makes decide the group, a mix of both is none", () => {
  assert.equal(BP.profileOf("Động cơ Cummins hoặc Perkins").group, "foreign");
  assert.equal(BP.profileOf("Động cơ Cummins, Weichai hoặc tương đương").group, null);
  assert.equal(BP.profileOf("Máy phát điện", "YC6MK420L-D20").group, "cn");
  assert.deepEqual(BP.profileOf("Tổ máy 1 pha 220V, có chuyển nguồn tự động").tags, ["ATS", "1 pha"]);
});

test("check: a quote not in the lot's text is not counted; lone-bidder lots do not set the price", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bp-test-"));
  const { list } = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" }, { ...docs, F: { bidName: "Mua sắm máy phát điện 420kVA", final: true, lots: [lot(1.5e9, 1.2e9, [], 1)] }, G: { bidName: "Mua sắm máy phát điện 380kVA", final: true, lots: [lot(1e9, 8e8)] } }, 400, 1.2e9);
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: 400, price: 1.2e9 }, total: 5, list }));
  const id = (k) => list.find((s) => s.key === k).id;
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify({ samples: [
    { id: id("A"), level: "same", quote: "Máy phát điện 400kVA | hãng Weichai" },
    { id: id("G"), level: "same", quote: "Máy phát điện 380kVA | hãng X" },
    { id: id("F"), level: "same", quote: "Mua sắm máy phát điện 420kVA" },
  ] }));
  const { result, problems } = check(dir);
  const by = (k) => result.samples.find((s) => s.key === k);
  assert.equal(by("A").level, "same");
  assert.ok(!by("A").unverified);
  assert.ok(by("G").unverified);
  assert.ok(!by("F").unverified);
  assert.equal(problems.length, 1);
  // Only A counts (G is unverified, F has one bidder): under 3 lots, no price.
  assert.equal(result.stats.n, 1);
  assert.equal(result.stats.levels.length, 0);
});

test("suggest: three levels from the alike lots, each with its chance", () => {
  const s = (ratio, level = "same") => ({ level, ratio, wp: ratio * 1e9, price: 1e9, k: 400, bidders: [{ name: "a", price: 1, won: true }, { name: "b", price: 2 }] });
  const st = BP.suggest([s(0.7), s(0.8), s(0.9), s(0.95), s(1), s(0.5, "close")], 1e9, 400);
  assert.equal(st.basis, "same");
  assert.equal(st.n, 5);
  assert.deepEqual(st.levels.map((l) => l.price), [800000000, 900000000, 950000000]);
  assert.deepEqual(st.levels.map((l) => l.chance), [0.8, 0.6, 0.4]);
  assert.equal(st.perKva.price, 900000000);
});

test("sharesOf: the package price by quantity x kVA^0.7 (Gói nhiều cỡ máy, Khoa 2026-11-04)", async () => {
  const { sharesOf } = await import("./bidprice-bot.mjs");
  const s = sharesOf([{ kva: 20, qty: 2 }, { kva: 60, qty: 2 }]).map((x) => Math.round(100 * x.share));
  assert.deepEqual(s, [32, 68]);
  // No quantity counts as one set; the shares add up to the whole.
  const t = sharesOf([{ kva: 100 }, { kva: 200 }, { kva: 30, qty: 4 }]);
  assert.ok(Math.abs(t.reduce((a, x) => a + x.share, 0) - 1) < 1e-9);
  assert.ok(t[1].share > t[0].share);
});
