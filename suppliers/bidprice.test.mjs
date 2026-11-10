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
  assert.match(BP.cfgLine(ats), /giống 100% \(cùng: bộ điều khiển Deep Sea, vỏ cách âm, ATS\)/);
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

test("brandSyncOf: đồng bộ 02 trong 03, cùng một nhà sản xuất; not hoà đồng bộ / ATS / chịu trách nhiệm", () => {
  const two = BP.brandSyncOf("- Tổ máy phải được đồng bộ 02 trong 03\nbộ phận chính (động cơ, đầu phát, bộ điều\nkhiển) bởi nhà sản xuất máy phát điện");
  assert.deepEqual([two.need, two.parts, two.quote], [2, ["engine", "alternator", "controller"], "- Tổ máy phải được đồng bộ 02 trong 03"]);
  const all = BP.brandSyncOf("Máy phát điện chạy dầu diesel bao gồm đồng bộ động cơ, đầu phát, bảng điều khiển, ắc quy và vỏ máy chống ồn cùng một nhà sản xuất");
  assert.deepEqual([all.need, all.parts], [3, ["engine", "alternator", "controller"]]);
  assert.deepEqual(BP.brandSyncOf("- Động cơ và đầu phát đồng bộ cùng một thương hiệu sản xuất").parts, ["engine", "alternator"]);
  assert.equal(BP.brandSyncOf("trong đó 2 trong 3 bộ phận động cơ, đầu phát, bộ điều khiển đồng bộ cùng một hãng sản xuất").need, 2);
  for (const t of ["Tủ hòa đồng bộ cùng một hãng với động cơ và đầu phát", "Bộ ATS phải được đấu nối đồng bộ với phần động lực và bộ điều khiển của máy phát điện",
    "(bao gồm máy phát, động cơ diesel, tủ bảng điều khiển) phải được lắp ráp hoàn chỉnh và được chịu trách nhiệm bởi 1 Nhà sản xuất",
    "động cơ, đầu phát, bộ điều khiển phải được đồng bộ theo tiêu chuẩn của nhà sản xuất"]) assert.equal(BP.brandSyncOf(t), null, t);
});

test("candidates: a tender asking for đồng bộ thương hiệu prefers lots that asked for it too", () => {
  const g = [{ name: "Máy phát điện 400kVA", maker: "Cummins", origin: "Mỹ" }];
  const d = { A: { bidName: "Mua sắm máy phát điện 400kVA", final: true, config: { text: "Động cơ Cummins" }, lots: [lot(1e9, 8e8, g)] },
    B: { bidName: "Mua sắm máy phát điện 400kVA", final: true, config: { text: "Động cơ Cummins. Động cơ, đầu phát, bảng điều khiển cùng một hãng sản xuất" }, lots: [lot(1e9, 8e8, g)] } };
  const { list } = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA", cfgText: "Động cơ Cummins", sync: { need: 2 } }, d, 400, 1e9);
  assert.deepEqual(list.map((s) => s.key), ["B", "A"]);
});

test("candidates: power within 10% when the tender asks for đồng bộ thương hiệu, 5% otherwise", () => {
  const d = { A: { bidName: "Mua sắm máy phát điện 435kVA", final: true, lots: [lot(1e9, 8e8)] }, B: { bidName: "Mua sắm máy phát điện 450kVA", final: true, lots: [lot(1e9, 8e8)] } };
  const t = { notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" };
  assert.deepEqual(BP.candidates(t, d, 400, 1e9).list.map((s) => s.key), []);
  const r = BP.candidates({ ...t, sync: { need: 2 } }, d, 400, 1e9);
  assert.deepEqual([r.tol, r.list.map((s) => s.key)], [0.1, ["A"]]);
});

test("kvaRated / powerMatch: the rating of a figure and the standby factor (2026-11-06 audit)", () => {
  assert.deepEqual(BP.kvaRated("500 kVA liên tục; 513 kVA - 550kVA dự phòng (phân tích)"), { kva: 500, rating: "prime" });
  assert.equal(BP.kvaRated("Công suất định mức (Standby) kVA: 2500kVA").rating, "standby");
  assert.equal(BP.kvaRated("Mua máy phát điện 400 kVA").rating, null);
  // The tender's 400 kVA prime against a lot named 440 kVA with no rating: the standby reading matches; two bare names do not shift.
  assert.equal(BP.powerMatch(400, "prime", 440, null, 0.05), true);
  assert.equal(BP.powerMatch(400, null, 440, null, 0.05), false);
  assert.equal(BP.powerMatch(400, "prime", 440, "standby", 0.05), true);
  assert.equal(BP.powerMatch(400, "prime", 440, "prime", 0.05), false);
  assert.equal(BP.powerMatch(440, "standby", 400, "prime", 0.05), true);
  assert.deepEqual(BP.cfgPower({ config: { text: "Máy phát điện: Công suất định mức liên tục P ≥ 100,0 kVA ở 50 Hz\nĐộng cơ: Công suất tối đa: Pmax ≥ 99,5 kW" } }), { kva: 100, rating: "prime" });
  assert.deepEqual(BP.cfgPower({ config: { kvas: [{ u: "kVA", v: 550 }], text: "Công suất 500/550 kVA" } }), { kva: 550, rating: null });
  assert.deepEqual(BP.cfgPower({ config: { sets: [{ qty: 2, primeKva: 250, standbyKva: 275 }] } }), { kva: 250, rating: "prime" });
  assert.equal(BP.unitsOf("Mua 20 bộ máy phát điện loại 30kVA nhập kho"), 20);
  assert.equal(BP.unitsOf("Gói thầu số 03: Mua sắm 01 Máy phát điện 400KVA", [{ name: "Máy phát điện 400kVA", qty: 1 }]), 1);
  assert.equal(BP.unitsOf("Mua máy phát điện", [{ name: "Máy phát điện 100kVA", qty: 3 }]), 3);
});

test("candidates: a lot named at the other rating is found and marked, after an exact one; an HSMT prime figure is not shifted", () => {
  const d = { A: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8)] }, B: { bidName: "Mua sắm máy phát điện 440kVA", final: true, lots: [lot(1e9, 8e8)] },
    C: { bidName: "Mua máy phát điện", final: true, config: { text: "Công suất liên tục ≥ 440 kVA\nCông suất dự phòng ≥ 480 kVA" }, lots: [lot(1e9, 8e8)] } };
  const r = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA", rating: "prime" }, d, 400, 1e9);
  assert.deepEqual(r.list.map((s) => s.key), ["A", "B"]);
  assert.match(r.list[1].kNote, /dự phòng của máy 400 kVA/);
  assert.match(BP.sampleText(r.list[1]), /có thể là mức dự phòng/);
  // No rating known for the tender: 440 is another size, and a reference of the wider band (prior).
  const r2 = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" }, d, 400, 1e9);
  assert.deepEqual([r2.list.map((s) => s.key), r2.prior.map((p) => p.key).sort()], [["A"], ["B", "C"]]);
});

test("profileOf / candidates: a foreign make made in China is its own group, compared with both (2026-11-06)", () => {
  assert.equal(BP.profileOf("Động cơ Cummins, xuất xứ Trung Quốc").group, "cnmade");
  assert.equal(BP.profileOf("Động cơ Cummins DCEC").group, "cnmade");
  assert.equal(BP.profileOf("Động cơ Cummins, xuất xứ Mỹ").group, "foreign");
  assert.equal(BP.goodsGroup([{ name: "Máy phát điện 500kVA", maker: "Cummins", origin: "Trung Quốc" }]), "cnmade");
  const g = (maker, origin) => [{ name: "Máy phát điện 400kVA", maker, origin }];
  const d = { CN: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8, g("Weichai", "Trung Quốc"))] },
    US: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8, g("Cummins", "Mỹ"))] },
    CNM: { bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, 8e8, g("Cummins", "Trung Quốc"))] } };
  // Offering a Cummins from a supplier based in China: nothing dropped, the lot of the same group first.
  const r = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA", engine: { make: "Cummins", model: "6BTAA5.9-G12" }, place: "cn" }, d, 400, 1e9);
  assert.deepEqual([r.group, r.otherGroup, r.list[0].key, r.list.length], ["cnmade", 0, "CNM", 3]);
  // Offering a Cummins made abroad: the Chinese lot goes, the one made in China stays.
  const r2 = BP.candidates({ notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA", engine: { make: "Cummins", model: "6BTAA5.9-G12" } }, d, 400, 1e9);
  assert.deepEqual([r2.group, r2.list.map((s) => s.key).sort()], ["foreign", ["CNM", "US"]]);
});

test("suggest: under 5 alike lots the same-size prior backs them; bidders counted; per kVA divides by the sets", () => {
  const s = (ratio, level = "same", units = 1) => ({ key: "K" + ratio, lotNo: "", level, ratio, wp: ratio * 1e9 * units, price: 1e9 * units, k: 400, units, bidders: [{ name: "a", price: 1, won: true }, { name: "b", price: 2 }] });
  const prior = [0.6, 0.7, 0.8].map((r, i) => ({ key: "P" + i, lotNo: "", ratio: r, nb: i + 4, k: 420, wp: r * 1e9, price: 1e9, units: 1 }));
  const st = BP.suggest([s(0.9), s(0.95)], 1e9, 400, prior);
  assert.deepEqual([st.n, st.nPrior, st.pool, st.enough], [2, 3, 5, true]);
  assert.deepEqual(st.levels.map((l) => l.ratio), [0.7, 0.8, 0.9]);
  assert.equal(st.bidders.median, 4);
  assert.deepEqual(st.byBidders.map((x) => [x.label, x.n]), [["2–3 nhà thầu", 2], ["từ 4 nhà thầu", 3]]);
  assert.equal(BP.suggest([s(0.7), s(0.8), s(0.9), s(0.95), s(1)], 1e9, 400, prior).nPrior, 0);
  assert.equal(BP.suggest([s(0.8), s(0.8, "same", 20), s(0.8)], 1e9, 400).perKva.value, 2000000);
});

test("keyText: the first part of an HSMT, then its later lines about make, origin and scope", () => {
  const t = ["a".repeat(100), "Xuất xứ: Trung Quốc", "b".repeat(100), "Kèm tủ ATS 630A", "c".repeat(100)].join("\n");
  const o = BP.keyText(t, 150);
  assert.ok(o.startsWith("a".repeat(100) + "\nXuất xứ: Trung Quốc\nKèm tủ ATS 630A"), o);
  assert.ok(!o.includes("ccc") && o.endsWith("…"));
  assert.equal(BP.keyText("ngắn", 150), "ngắn");
});

test("supWon: brand or first distinctive name word in won genset rows of supply tenders only", () => {
  const sups = [
    { id: "kachai", role: "genset_oem", names: { en: "Zhejiang Kachai Generator Co., Ltd", brands: ["Kachai"] } },
    { id: "cummins", role: "engine_maker", names: { en: "Cummins Inc.", brands: ["Cummins"] } },
    { id: "dealer", role: "distributor", names: { en: "Chongfa Cummins Shenzhen", brands: ["Cummins"] } },
    { id: "man", role: "engine_maker", names: { en: "MAN Engines", brands: ["MAN"] } },
    { id: "camel", role: "genset_oem", names: { en: "Camel Power", brands: ["Camel"] } },
  ];
  const won = (goods) => ({ lotNo: "", lotName: "", goods, bidders: [{ name: "NT", taxCode: "1", won: true }] });
  const docs = {
    A: { bidName: "Mua sắm máy phát điện 33kVA", lots: [won([{ name: "Máy phát điện chạy dầu 33kVA", maker: "Kachai", label: "Kachai", desc: "Động cơ Cummins; bộ chuyển mạch Auto - Off - Man; Bình ắc quy hiệu Camel" }])] },
    B: { bidName: "Bảo dưỡng máy phát điện", lots: [won([{ name: "Máy phát điện Kachai", maker: "Kachai" }])] },
    C: { bidName: "Mua sắm máy phát điện", lots: [won([{ name: "Lọc dầu máy phát điện Cummins" }])] },
    D: { bidName: "Mua sắm máy phát điện", lots: [won([{ name: "Máy phát điện hiệu Cummins (Model C62.5D5P) hoặc tương đương" }])] },
    E: { bidName: "Mua sắm máy phát điện", lots: [{ ...won([{ name: "Máy phát điện", maker: "Kachai" }]), bidders: [{ name: "NT", won: false }] }] },
  };
  const m = BP.supWon(sups, docs);
  assert.deepEqual([...m.keys()].sort(), ["cummins", "kachai"]);
  assert.deepEqual(m.get("kachai").map((x) => [x.key, x.where]), [["A", "set"]]);
  assert.deepEqual(m.get("cummins").map((x) => [x.key, x.where]), [["A", "cfg"]]);
});

// ---------- Cạnh tranh dự báo, xác suất thắng, giá vốn ----------
// 60 phần thường (3 nhà thầu, trúng 85% giá gói) ở Hà Nội + 4 phần của một chủ đầu tư ở Quảng Ninh, đều 1 nhà thầu, cùng
// một người trúng ở 99% giá gói.
const histDocs = () => {
  const d = {}, day = (i) => new Date(Date.UTC(2024, 0, 1 + i)).toISOString();
  const bidders = (n, wp, win = "900") => Array.from({ length: n }, (_, i) => ({ name: i ? `NT${i}` : `Trúng ${win}`, taxCode: i ? String(100 + i) : win, won: !i, winPrice: i ? null : wp, bidPrice: i ? wp * 1.1 : wp }));
  for (let i = 0; i < 60; i++) d["N" + i] = { bidName: "Mua sắm máy phát điện 100kVA", final: true, field: "HH", investorName: "CĐT " + i, location: "Thành phố Hà Nội", bidCloseDate: day(i), lots: [{ lotNo: "", price: 1e9, bidders: bidders(3, 8.5e8, String(500 + i)) }] };
  for (let i = 0; i < 4; i++) d["Q" + i] = { bidName: "Mua sắm máy phát điện 100kVA", final: true, field: "HH", investorName: "Công ty Than Quảng Ninh", location: "Phường A, Tỉnh Quảng Ninh", bidCloseDate: day(70 + i), lots: [{ lotNo: "", price: 1e9, bidders: bidders(1, 9.9e8) }] };
  return d;
};

test("provinceOf / invKeyOf: one key for the ways muasamcong writes a place and a name", () => {
  assert.equal(BP.provinceOf("TP. Hồ Chí Minh"), BP.provinceOf("Thành phố Hồ Chí Minh"));
  assert.equal(BP.provinceOf("Xã A, Huyện B, Tỉnh Thanh Hoá"), BP.provinceOf("Tỉnh Thanh Hóa"));
  assert.equal(BP.provinceOf("Tỉnh Quảng Ninh, Thành phố Hải Phòng"), "quang ninh");
  assert.equal(BP.invKeyOf("CÔNG TY  Than - Quảng Ninh."), BP.invKeyOf("Công ty Than Quảng Ninh"));
});

test("nbForecast: an owner whose lots drew one bidder leans to one; the same winner is the usual contractor", () => {
  const docs = histDocs();
  const fc = BP.nbForecast({ notifyNo: "X", investorName: "CÔNG TY THAN QUẢNG NINH", location: "Tỉnh Quảng Ninh", field: "HH" }, docs);
  assert.equal(fc.parts.investor.n, 4);
  assert.equal(fc.top, 0);
  assert.ok(Math.abs(fc.p.reduce((a, x) => a + x, 0) - 1) < 1e-9);
  assert.equal(fc.lock.level, "high");
  assert.deepEqual([fc.lock.top.id, fc.lock.top.wins, fc.lock.one], ["900", 4, 4]);
  // Walk-forward check of the sign: Q2 and Q3 had it (two earlier lots, same winner), and the winner won again.
  assert.deepEqual(fc.lock.stats.quen, { n: 2, one: 2, again: 2 });
  // An owner never seen, in the place where every lot drew three bidders.
  const other = BP.nbForecast({ notifyNo: "X", investorName: "Chưa có gói nào", location: "Thành phố Hà Nội", field: "HH" }, docs);
  assert.equal(other.top, 1);
  assert.equal(other.lock.level, "unknown");
  // A tender sees only lots closed before it, and never itself.
  const past = BP.nbForecast({ notifyNo: "Q3", investorName: "Công ty Than Quảng Ninh", location: "Tỉnh Quảng Ninh", field: "HH", bidCloseDate: docs.Q3.bidCloseDate }, docs);
  assert.equal(past.parts.investor.n, 3);
  assert.equal(BP.nbForecast({ notifyNo: "X" }, { A: docs.N0 }), null);
});

test("winCurve / profitTable: chance of bidding under the past winners, by bidder count; best expected profit", () => {
  const docs = histDocs(), t = { notifyNo: "X", investorName: "Chưa có gói nào", location: "Thành phố Hà Nội", field: "HH" };
  const c = BP.winCurve(t, docs, BP.nbForecast(t, docs));
  assert.deepEqual(c.byNb.map((b) => b.n), [4, 60, 0, 0]);
  const at = (r) => c.grid.indexOf(r);
  // 3-bidder lots were won at 85%: under it always wins, at it or over it never.
  assert.deepEqual([c.byNb[1].w[at(0.84)], c.byNb[1].w[at(0.85)], c.byNb[1].w[at(0.9)]], [1, 0, 0]);
  assert.ok(c.mix[at(0.84)] > 0.9 && c.mix[at(0.9)] < 0.5);
  const p = BP.profitTable(1e9, 7e8, c, c.byNb[1].w);
  assert.equal(p.best.r, 0.84);
  assert.equal(p.best.margin, 1.4e8);
  assert.equal(p.breakEven, 0.7);
  // Cost above every price: nothing to suggest.
  assert.equal(BP.profitTable(1e9, 1.2e9, c).best, null);
  assert.equal(BP.profitTable(1e9, 0, c).best, null);
});

test("quoteCost / quoteLedger: price lines in their currency, extras in đồng or percent of the goods", () => {
  const row = { id: "r1", supplierId: "s1", items: [{ id: "a", desc: "Tổ máy 500kVA", qty: 2, unitPrice: 100000, currency: "CNY" }, { id: "b", desc: "ATS", unitPrice: 5e7, currency: "VND" }, { id: "c", desc: "chưa có giá" }] };
  assert.deepEqual(BP.quoteCost(row, {}).missing, ["CNY"]);
  assert.equal(BP.quoteCost(row, {}).total, null);
  const c = BP.quoteCost(row, { fx: { CNY: 3600 }, extras: [{ label: "Vận chuyển", kind: "vnd", value: 3e7 }, { label: "Thuế", kind: "pct", value: 10 }] });
  assert.equal(c.goods, 2 * 100000 * 3600 + 5e7);
  assert.equal(c.total, c.goods + 3e7 + c.goods * 0.1);
  assert.equal(BP.quoteCost({ items: [] }, {}).total, null);
  // VAT: on the goods not yet taxed plus the extras; a line whose price already holds the tax is left out.
  const v = BP.quoteCost(row, { fx: { CNY: 3600 }, vat: 10, extras: [{ kind: "vnd", value: 3e7 }] });
  assert.equal(v.vat, (v.goods + 3e7) * 0.1);
  assert.equal(v.total, v.goods + 3e7 + v.vat);
  const w = BP.quoteCost({ items: [row.items[0], { ...row.items[1], vatIncl: true }] }, { fx: { CNY: 3600 }, vat: 10 });
  assert.equal(w.vat, 2 * 100000 * 3600 * 0.1);
  assert.equal(c.vat, 0);
  const led = BP.quoteLedger({ _cost: { fx: { USD: 26000 }, vat: 10 }, K1: { rows: [{ ...row, items: [{ ...row.items[0], date: "2026-10-01" }, row.items[2]] }] }, K2: { rows: [{ id: "r1", supplierId: "s2", items: [{ desc: "Máy", kva: 250, unitPrice: 9e8, date: "2026-11-01" }] }] } });
  assert.deepEqual(led.map((x) => [x.key, x.supplierId, x.kvaNum]), [["K2", "s2", 250], ["K1", "s1", 500]]);
  // engineMake, for the ledger's engine filter: a known make from the engine cell, else the cell as written, else "".
  const eng = (engine) => BP.quoteLedger({ K: { rows: [{ id: "r", supplierId: "s", items: [{ desc: "Máy", unitPrice: 1, engine }] }] } })[0].engineMake;
  assert.deepEqual([eng("cummins KTA19-G4"), eng("Động cơ Yuchai YC6MK420"), eng(" Hãng Lạ X1 "), eng(""), eng(undefined)], ["Cummins", "Yuchai", "Hãng Lạ X1", "", ""]);
});

test("wonEvidence: won lots that name the engine model, the genset model, or the engine make at this power", () => {
  const won = (goods) => ({ lotNo: "", lotName: "", goods, bidders: [{ name: "NT trúng", taxCode: "77", won: true }] });
  const docs = {
    M: { bidName: "Mua sắm máy phát điện 500kVA", investorName: "Bệnh viện A", openedAt: "2025-03-01", lots: [won([{ name: "Máy phát điện 500kVA", maker: "Kim Bình", code: "KB550", desc: "Động cơ: Cummins KTA19-G4; Đầu phát: Stamford HCI544D" }])] },
    G: { bidName: "Mua sắm máy phát điện 2500kVA", investorName: "Bệnh viện B", openedAt: "2025-04-01", lots: [won([{ name: "Máy phát điện 2500kVA", maker: "Cummins Ltd", code: "C2500 D5A", desc: "Chi tiết tại bảng cam kết" }])] },
    B: { bidName: "Mua sắm máy phát điện 520kVA", investorName: "BỆNH VIỆN A", openedAt: "2025-05-01", lots: [won([{ name: "Máy phát điện 520kVA động cơ Cummins", maker: "Hữu Toàn" }])] },
    // Chữ chép từ HSMT, gói sửa chữa, phụ tùng và cỡ máy khác: không tính.
    E: { bidName: "Mua sắm máy phát điện 500kVA", lots: [won([{ name: "Máy phát điện 500kVA hiệu Cummins hoặc tương đương" }])] },
    S: { bidName: "Sửa chữa máy phát điện 500kVA", lots: [won([{ name: "Máy phát điện 500kVA", desc: "Động cơ: Cummins KTA19-G4" }])] },
    P: { bidName: "Mua sắm máy phát điện", lots: [won([{ name: "Lọc dầu máy phát điện Cummins 500kVA" }])] },
    F: { bidName: "Mua sắm máy phát điện 100kVA", lots: [won([{ name: "Máy phát điện 100kVA động cơ Cummins" }])] },
  };
  assert.deepEqual(BP.wonSets(docs).map((r) => r.key).sort(), ["B", "E", "F", "G", "M"]);
  const c = { engine: { make: "Cummins", model: "KTA19G4" }, genset: { model: "KB-550" } };
  const e = BP.wonEvidence(docs, c, { kva: 500, investorName: "Bệnh viện A" });
  assert.deepEqual(e.lots.map((x) => [x.key, x.by, x.same]), [["M", "model", true], ["B", "make", true]]);
  assert.deepEqual([e.model, e.genset, e.make, e.sameInvestor, e.score], [1, 0, 1, 2, 3 + 4 + 1]);
  // The tender itself is never its own evidence; no power → no make-level match.
  assert.deepEqual(BP.wonEvidence(docs, c, { kva: 500, self: "M" }).lots.map((x) => x.key), ["B"]);
  assert.deepEqual(BP.wonEvidence(docs, c, {}).lots.map((x) => x.key), ["M"]);
  assert.deepEqual(BP.wonEvidence(docs, { engine: { make: "Cummins", model: "QSK60-G4" }, genset: { model: "C2500D5A" } }, { kva: 2500 }).lots.map((x) => [x.key, x.by]), [["G", "genset"]]);
  assert.equal(BP.wonEvidence(docs, { engine: { make: "Weichai", model: "WP13D405E200" } }, { kva: 500 }).score, 0);
});

// ---------- 2026-11-10: giá theo cấu hình, khoản chi gợi ý, chi phí vốn, cảnh báo, đối thủ, báo giá cũ ----------
const grpDocs = () => {
  const g = (maker, origin) => [{ name: "Máy phát điện 400kVA", maker, origin }];
  const mk = (ratio, goods, n = 3) => ({ bidName: "Mua sắm máy phát điện 400kVA", final: true, lots: [lot(1e9, ratio * 1e9, goods, n)] });
  return { CN1: mk(0.8, g("Weichai", "Trung Quốc")), CN2: mk(0.82, g("Yuchai", "Trung Quốc")), CN3: mk(0.84, g("Weichai", "Trung Quốc")),
    US1: mk(0.95, g("Cummins", "Mỹ")), US2: mk(0.96, g("Cummins", "Anh")), UK1: mk(0.97, g("Perkins", "Anh")),
    NO: mk(0.5, [{ name: "Máy phát điện 400kVA" }]) };
};
test("groupPrices: three levels from the lots of that origin group only; unknown-group lots are not borrowed", () => {
  const t = { notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" };
  const f = BP.groupPrices({ t, docs: grpDocs(), K: 400, P: 1e9, group: "foreign" });
  assert.equal(f.basis, "code");
  assert.deepEqual(f.stats.levels.map((l) => l.ratio), [0.95, 0.96, 0.96]);
  const c = BP.groupPrices({ t, docs: grpDocs(), K: 400, P: 1e9, group: "cn" });
  assert.deepEqual(c.stats.levels.map((l) => l.ratio), [0.8, 0.82, 0.82]);
  // Two foreign lots only: no levels, a note says how many.
  const d = grpDocs(); delete d.UK1;
  const g = BP.groupPrices({ t, docs: d, K: 400, P: 1e9, group: "foreign" });
  assert.equal(g.stats.levels.length, 0);
  assert.match(g.note, /cần ít nhất 3, có 2/);
});

test("candidates / check: the first configuration's result is unchanged by groups and byConfig (regression)", () => {
  const t = { notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA", engine: { make: "Weichai", model: "WP13D385E200" } };
  const a = BP.candidates(t, grpDocs(), 400, 1e9), b = BP.candidates({ ...t, group: undefined }, grpDocs(), 400, 1e9);
  assert.deepEqual(a, b);
  assert.equal(a.group, "cn");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bp-test-"));
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify({ samples: a.list.map((s) => ({ id: s.id, level: "close", quote: "Mua sắm máy phát điện 400kVA" })) }));
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: 400, price: 1e9 }, total: 7, list: a.list, prior: a.prior }));
  const before = check(dir).result.stats;
  const alt = BP.groupPrices({ t, docs: grpDocs(), K: 400, P: 1e9, group: "foreign" });
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: 400, price: 1e9 }, total: 7, list: a.list, prior: a.prior, byConfig: [{ rank: 1, main: true, group: "cn" }, { rank: 2, group: "foreign", ...alt }] }));
  const after = check(dir).result;
  assert.deepEqual(after.stats, before);
  assert.equal(after.byConfig[1].stats.levels.length, 3);
});

test("configPrices: the first configuration plus the nearest one of another engine group", async () => {
  const { configPrices } = await import("./bidprice-bot.mjs");
  const t = { notifyNo: "X", bidName: "Mua sắm máy phát điện 400 kVA" };
  const cfgs = [{ rank: 1, engine: { make: "Weichai", model: "WP13D385E200" } }, { rank: 2, engine: { make: "Yuchai", model: "YC6MK420" } }, { rank: 3, engine: { make: "Cummins", model: "KTA19-G4" } }];
  const r = await configPrices(cfgs, cfgs[0], "cn", t, grpDocs(), 400, 1e9);
  assert.deepEqual(r.map((x) => [x.rank, x.group, !!x.main]), [[1, "cn", true], [3, "foreign", false]]);
  assert.deepEqual(r[1].stats.levels.map((l) => l.ratio), [0.95, 0.96, 0.96]);
  assert.equal((await configPrices([cfgs[0], cfgs[1]], cfgs[0], "cn", t, grpDocs(), 400, 1e9)).length, 1);
});

test("costHints: costs that may arise, with the words of the analysis; none guessed, those in extras marked", () => {
  const a = { result: {
    keyInfo: { deliveryLocation: "Trạm ra đa, huyện đảo Lý Sơn, Quảng Ngãi", warranty: "24 tháng" },
    technicalSpecs: [{ item: "Tủ ATS", requirement: "4P 800A" }, { item: "Vỏ chống ồn", requirement: "Vỏ cách âm 75 dB(A)@7m" }, { item: "Khung bệ máy", requirement: "Thép sơn tĩnh điện" },
      { item: "Phụ kiện", requirement: "Tài liệu kỹ thuật + hướng dẫn sử dụng; Ống xả" }, { item: "Hoà đồng bộ", requirement: "Không yêu cầu" }, { item: "Biên bản thử tải xuất xưởng", requirement: "Test report" }],
    contractTerms: [{ term: "Nghiệm thu", requirement: "Chạy thử liên tục 2 giờ đến Pđm tại công trình", quote: "chạy thử" }],
  } };
  const h = BP.costHints(a, [{ label: "ats", kind: "vnd", value: 1 }]);
  assert.deepEqual(h.map((x) => x.id), ["ats", "canopy", "loadtest", "remote", "warranty"]);
  assert.equal(h.find((x) => x.id === "ats").have, true);
  assert.equal(h.find((x) => x.id === "canopy").have, false);
  assert.match(h.find((x) => x.id === "remote").quote, /Lý Sơn/);
  assert.equal(h.find((x) => x.id === "warranty").kind, "pct");
  assert.equal(h.find((x) => x.id === "warranty").months, 24);
  assert.ok(h.every((x) => !("value" in x)));
  assert.deepEqual(BP.costHints({ result: { technicalSpecs: [{ item: "ATS", requirement: "Không có trong tài liệu được cung cấp" }], keyInfo: { warranty: "12 tháng" } } }), []);
  assert.deepEqual([BP.monthsIn("tối thiểu 730 ngày"), BP.monthsIn("02 năm"), BP.monthsIn("không ghi")], [24, 24, null]);
  // Lắp đặt and the exhaust only when the HSMT makes them an item of their own, not in a scope or accessory list.
  const own = (specs) => BP.costHints({ result: { technicalSpecs: specs } }).map((x) => x.id);
  assert.deepEqual(own([{ item: "Phạm vi công việc", requirement: "Cung cấp, vận chuyển; lắp đặt, nghiệm thu" }, { item: "Phụ kiện đi kèm", requirement: "Ắc quy; Ống xả" }]), []);
  assert.deepEqual(own([{ item: "Lắp đặt, chạy thử", requirement: "Bởi kỹ sư hãng" }, { item: "Ống thoát gió nóng, ống khói", requirement: "Tôn kẽm 0,75mm" }]), ["exhaust", "install"]);
});

test("financeCost: advance, payment, guarantees from the contract terms; rate and days from the user, else nothing", () => {
  const terms = [
    { term: "Tạm ứng", requirement: "Không tạm ứng", quote: "Tạm ứng: Không" },
    { term: "Thanh toán", requirement: "01 lần; thời hạn không quá 15 ngày từ khi xuất trình đủ chứng từ", quote: "Thời hạn thanh toán không quá 15 ngày" },
    { term: "Bảo đảm thực hiện hợp đồng", requirement: "3% giá hợp đồng", quote: "Giá trị bảo đảm thực hiện hợp đồng: 3 % giá hợp đồng" },
    { term: "Bảo đảm bảo hành", requirement: "Giữ lại 5% giá trị", quote: "giữ lại 5%" },
    { term: "Thời gian bảo hành", requirement: "Tối thiểu 730 ngày", quote: "730 ngày" },
    { term: "Phạt chậm giao hàng", requirement: "1%/tuần", quote: "1%/ tuần" },
    { term: "Mức phạt tối đa", requirement: "12%", quote: "khấu trừ đến 12%." },
    { term: "Thời hạn giao hàng", requirement: "≤ 90 ngày", quote: "≤ 90 ngày" },
  ];
  const none = BP.financeCost(terms, { price: 1e9 });
  assert.equal(none.total, null);
  assert.deepEqual(none.missing, ["lãi suất vay vốn (%/năm)", "số ngày thực hiện hợp đồng (điều khoản ghi 90 ngày)"]);
  const f = BP.financeCost(terms, { price: 1e9, base: 8e8, rate: 9, days: 90 }), by = (id) => f.lines.find((x) => x.id === id);
  assert.equal(Math.round(by("capital").amount), Math.round((8e8 * 0.09 * (90 + 15)) / 365));
  assert.equal(Math.round(by("security").amount), Math.round((1e9 * 0.03 * 0.09 * 90) / 365));
  assert.equal(Math.round(by("retention").amount), Math.round((1e9 * 0.05 * 0.09 * Math.round(24 * 30.4)) / 365));
  assert.equal(by("penalty").risk, true);
  assert.equal(by("penalty").amount, 1.2e8);
  assert.equal(Math.round(f.total), Math.round(by("capital").amount + by("security").amount + by("retention").amount));
  assert.match(by("security").basis, /3 % giá hợp đồng/);
  // A payment in two stages, an advance with no rate: listed to read by hand.
  const g = BP.financeCost([{ term: "Tạm ứng", requirement: "Theo thỏa thuận (không nêu tỷ lệ)" }, { term: "Thanh toán", requirement: "02 đợt: đợt 1 80% trong 07 ngày" }], { price: 1e9, rate: 9, days: 60 });
  assert.deepEqual(g.manual.map((x) => x.term), ["Tạm ứng", "Thanh toán"]);
  assert.equal(g.lines[0].amount, null);
  assert.deepEqual(g.lines[0].lack, ["% tạm ứng", "hạn thanh toán"]);
});

test("feasibility: cost and capital cost at or over the package price, or over the highest level", () => {
  const levels = [{ id: "low", label: "Cạnh tranh", price: 8e8, ratio: 0.8 }, { id: "high", label: "Cao", price: 9e8, ratio: 0.9 }];
  assert.deepEqual(BP.feasibility({ P: 1e9, cost: 7e8, levels }).flags, []);
  assert.equal(BP.feasibility({ P: 1e9, cost: 8.9e8, finance: 2e7, levels }).flags[0].id, "over-levels");
  const f = BP.feasibility({ P: 1e9, cost: 9.9e8, finance: 2e7, levels }).flags[0];
  assert.equal(f.id, "over-package");
  assert.match(f.text, /1\.010\.000\.000 đ.*bằng 101% giá gói/);
  assert.deepEqual(BP.feasibility({ P: 1e9, cost: null, levels }).flags, []);
});

test("rivalsOf: bidders of lots of the same investor, province or size before the tender; ratio only from 3 bids", () => {
  const b = (name, tax, price, won = false, reason = "") => ({ name, taxCode: tax, finalPrice: price, won, winPrice: won ? price : null, reason });
  const L = (bidders, goods = []) => ({ lotNo: "", lotName: "", price: 1e9, goods, bidders });
  const docs = {
    A: { bidName: "Mua sắm máy phát điện 400kVA", investorName: "Bệnh viện A", location: "Tỉnh Quảng Ngãi", bidCloseDate: "2025-01-01", lots: [L([b("Alpha", "1", 8e8, true), b("Beta", "2", 9e8)], [{ name: "Máy phát điện 400kVA", maker: "FPT", desc: "Tổ máy lắp tại Viễn thông FPT; Động cơ: Cummins KTA19-G4; đầu phát Stamford" }])] },
    B: { bidName: "Mua sắm máy phát điện 1000kVA", investorName: "BỆNH VIỆN A", location: "Hà Nội", bidCloseDate: "2025-02-01", lots: [L([b("Alpha", "1", 8.5e8, true), b("Beta", "2", 0, false, "Không đáp ứng yêu cầu về kỹ thuật")])] },
    C: { bidName: "Mua sắm máy phát điện 410kVA", investorName: "Sở Y tế", location: "Hà Nội", bidCloseDate: "2025-03-01", lots: [L([b("Alpha", "1", 9e8, true), b("Gamma", "3", 9.5e8)])] },
    D: { bidName: "Mua sắm máy phát điện 100kVA", investorName: "Sở khác", location: "Cần Thơ", bidCloseDate: "2025-03-01", lots: [L([b("Delta", "4", 9e8, true)])] },
    E: { bidName: "Sửa chữa máy phát điện 400kVA", investorName: "Bệnh viện A", location: "Quảng Ngãi", bidCloseDate: "2025-03-01", lots: [L([b("Eps", "5", 9e8, true)])] },
    LATE: { bidName: "Mua sắm máy phát điện 400kVA", investorName: "Bệnh viện A", bidCloseDate: "2027-01-01", lots: [L([b("Late", "6", 9e8, true)])] },
  };
  const r = BP.rivalsOf({ notifyNo: "X", investorName: "Bệnh viện A", location: "Quảng Ngãi", kva: 400, bidCloseDate: "2026-11-10" }, docs, { ownTax: "2" });
  assert.deepEqual(r.list.map((x) => x.id), ["1", "2", "3"]);
  const a = r.list[0];
  assert.deepEqual([a.n, a.wins, a.investor, a.size, a.priced], [3, 3, 2, 2, 3]);
  assert.deepEqual(a.ratio, { median: 0.85, min: 0.8, max: 0.9 });
  assert.deepEqual(a.makes, [{ make: "Cummins", n: 1 }]);
  const beta = r.list[1];
  assert.deepEqual([beta.self, beta.techOut, beta.ratio], [true, 1, null]);
});

test("suggest / calibLevels: levels unchanged; with a forecast, weighted levels by bidder group (off by default)", () => {
  const s = (ratio, nb) => ({ level: "close", ratio, wp: ratio * 1e9, price: 1e9, k: 400, bidders: Array.from({ length: nb }, (_, i) => ({ name: "b" + i, price: 1, won: !i })) });
  const pool = [s(0.97, 2), s(0.98, 2), s(0.96, 3), s(0.95, 3), s(0.8, 6), s(0.78, 7), s(0.82, 6)];
  const plain = BP.suggest(pool, 1e9, 400);
  assert.equal(plain.calib, undefined);
  const fc = { p: [0.1, 0.1, 0.1, 0.7] };
  const withFc = BP.suggest(pool, 1e9, 400, [], { fc });
  assert.deepEqual(withFc.levels, plain.levels);
  assert.deepEqual([withFc.calib.lam, withFc.calib.q], [0.5, 0.2]);
  // Most of the forecast on 6+ bidders: the weighted middle falls to the crowded lots' prices.
  assert.ok(withFc.calib.levels[1].ratio < plain.levels[1].ratio);
  assert.equal(withFc.calib.levels[1].ratio, 0.82);
  // A forecast of few bidders keeps it high.
  assert.ok(BP.suggest(pool, 1e9, 400, [], { fc: { p: [0.3, 0.6, 0.05, 0.05] } }).calib.levels[1].ratio >= 0.95);
  assert.equal(BP.wQuantile([1, 2, 3], [1, 1, 1], 0.5), 2);
});

test("quoteCost / quoteLedger: a price line older than 180 days or with no date is flagged; finance adds to the cost", () => {
  const now = Date.UTC(2026, 10, 10);
  const row = { items: [{ id: "a", desc: "Tổ máy", unitPrice: 1e9, date: "2026-10-01" }, { id: "b", desc: "ATS", unitPrice: 5e7, date: "01/03/2026" }, { id: "c", desc: "Cáp", unitPrice: 1e7 }] };
  const c = BP.quoteCost(row, { finance: 2e7 }, now);
  assert.deepEqual(c.stale.map((x) => [x.id, x.why]), [["b", "old"], ["c", "nodate"]]);
  assert.equal(c.stale[0].days, 254);
  assert.equal(c.total, 1e9 + 5e7 + 1e7 + 2e7);
  assert.equal(c.finance, 2e7);
  assert.equal(BP.quoteCost(row, { finance: 2e7, vat: 10 }, now).vat, (1e9 + 5e7 + 1e7) * 0.1);
  assert.deepEqual(BP.quoteLedger({ K: { rows: [{ id: "r", items: row.items }] } }, now).map((x) => x.stale && x.stale.why), [null, "old", "nodate"]);
});
