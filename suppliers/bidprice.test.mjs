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

test("candidates: power far off, repair, and lots with nothing about their goods are left out", () => {
  const { list } = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" }, docs, 400, 1.2e9);
  assert.deepEqual(list.map((s) => s.key).sort(), ["A", "E"]);
  assert.match(BP.sampleText(list.find((s) => s.key === "A")), /hãng Weichai \| xuất xứ Trung Quốc/);
});

test("check: a quote not in the lot's text is not counted; lone-bidder lots and power far off are not 'same'", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bp-test-"));
  const { list } = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" }, { ...docs, F: { bidName: "Mua sắm máy phát điện 600kVA", final: true, lots: [lot(1.5e9, 1.2e9)] } }, 400, 1.2e9);
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: 400, price: 1.2e9 }, total: 5, list }));
  const id = (k) => list.find((s) => s.key === k).id;
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify({ samples: [
    { id: id("A"), level: "same", quote: "Máy phát điện 400kVA | hãng Weichai" },
    { id: id("E"), level: "same", quote: "Máy phát điện 400kVA | hãng HBC" },
    { id: id("F"), level: "same", quote: "Mua sắm máy phát điện 600kVA" },
  ] }));
  const { result, problems } = check(dir);
  const by = (k) => result.samples.find((s) => s.key === k);
  assert.equal(by("A").level, "same");
  assert.ok(!by("A").unverified);
  assert.ok(by("E").unverified);
  assert.equal(by("F").level, "close");
  assert.equal(problems.length, 2);
  // Only A and F count (E is unverified and has one bidder): under 3 lots, no price.
  assert.equal(result.stats.n, 2);
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
