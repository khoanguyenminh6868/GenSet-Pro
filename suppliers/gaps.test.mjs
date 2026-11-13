import { test } from "node:test";
import assert from "node:assert/strict";
import { gapReport, codesOfText, demandOf, reportText, BANDS } from "./gaps.mjs";

const hsmt = "Động cơ: Dung tích xi lanh ≥ 11 lít\nĐộng cơ: Số xi lanh: 6\nĐầu phát: Cấp cách điện: H\nKhả năng quá tải 10% trong 1 giờ\nTiêu hao nhiên liệu ở 100% tải ≤ 100 L/h";
const docs = {
  A: { bidName: "Mua sắm máy phát điện 500kVA", config: { text: hsmt } },
  B: { bidName: "Mua sắm máy phát điện 550kVA", config: { text: ["Động cơ: Dung tích xi lanh ≥ 12 lít", "Đầu phát: Cấp cách điện: H", "Tiêu hao nhiên liệu ở 100% tải ≤ 110 L/h"].join("\n") } },
  // Sửa chữa, không có chữ Chương V, không rõ công suất: không tính.
  C: { bidName: "Sửa chữa máy phát điện 500kVA", config: { text: hsmt } },
  D: { bidName: "Mua sắm máy phát điện 500kVA" },
  E: { bidName: "Mua sắm máy phát điện dự phòng", config: { text: hsmt } },
};
const use = (supplierId, extra = {}) => ({ supplierId, power: { prime: { kVA: 500 } }, specs: [], ...extra });
const cat = {
  engines: [
    { key: "E1", model: "E1", make: "Cummins", uses: [use("oem-a", { other: "ALT1", specs: [{ key: "fuel" }] })] },
    { key: "E2", model: "E2", make: "Cummins", uses: [use("oem-a")] },
    { key: "E3", model: "E3", make: "Weichai", uses: [use("oem-b", { other: "ALT2" })] },
    { key: "E4", model: "E4", make: "Weichai", uses: [{ supplierId: "oem-b", power: { prime: { kVA: 50 } }, specs: [] }] },
  ],
  alternators: [{ key: "ALT1", make: "Stamford" }, { key: "ALT2", make: "Leroy-Somer" }],
};
const facts = () => new Map([["engine:E1", [{ key: "disp" }, { key: "cyl" }]], ["engine:E3", [{ key: "cyl" }]], ["alternator:ALT1", [{ key: "insul" }]]]);
const suppliers = [
  { id: "cummins-inc", role: "genset_oem", names: { en: "Cummins Inc.", brands: ["Cummins"] } },
  { id: "dcec", role: "engine_maker", names: { en: "Dongfeng Cummins Engine", brands: ["Cummins"] } },
  { id: "dealer", role: "distributor", names: { en: "Cummins dealer", brands: ["Cummins"] } },
  { id: "weichai", role: "engine_maker", names: { en: "Weichai Power", brands: ["Weichai"] } },
  { id: "oem-a", role: "genset_oem", names: { en: "OEM A" } }, { id: "oem-b", role: "genset_oem", names: { en: "OEM B" } },
];

test("codesOfText / demandOf: requirement codes an HSMT names, by the tender's power band", () => {
  assert.deepEqual([...codesOfText(hsmt)].sort(), ["alt_insulation", "cylinders", "displacement", "fuel_consumption", "overload"]);
  const d = demandOf(docs), i = BANDS.findIndex((b) => b[2] === "300–700 kVA");
  assert.deepEqual([d.n, d.noPower, d.bands[i].tenders, d.bands[i].codes.get("displacement"), d.bands[i].codes.get("cylinders")], [2, 1, 2, 2, 1]);
});

test("gapReport: score = tenders asking × share of models without the figure; who to ask first", () => {
  const r = gapReport({ docs, suppliers, modelFacts: facts, cat, specs: { weichai: "2026-11-01T00:00:00Z" }, now: new Date("2026-11-10T00:00:00Z"),
    configmatch: [{ result: { configs: [{ checks: [{ code: "displacement", status: "unclear" }, { code: "displacement", status: "met" }, { code: "cylinders", status: "not_met" }] }] } }] });
  const f = Object.fromEntries(r.fields.map((x) => [x.code, x]));
  // Displacement: 2 tenders ask, 1 of the 3 models in the band has it.
  assert.deepEqual([f.displacement.demand, f.displacement.have, f.displacement.total, f.displacement.score], [2, 1, 3, 1.3]);
  assert.deepEqual([f.alt_insulation.have, f.fuel_consumption.have], [1, 1]);
  assert.ok(!f.cylinders || f.cylinders.score < 1);
  // No column for it in any table: counted apart.
  assert.deepEqual(r.noKey.map((x) => x.code), ["overload"]);
  // Engine figures go to the engine's maker (its own record first, never a dealer), alternator figures to the
  // alternator's maker, set figures to the row's supplier.
  const t = Object.fromEntries(r.targets.map((x) => [`${x.kind}:${x.name}`, x]));
  assert.deepEqual(t["engine:Cummins"].supplierIds, ["cummins-inc", "dcec"]);
  assert.deepEqual(t["engine:Weichai"].supplierIds, ["weichai"]);
  assert.deepEqual(t["alternator:Leroy-Somer"].supplierIds, []);
  assert.ok(t["supplier:OEM B"].missing.some((m) => m.item.startsWith("Tiêu hao nhiên liệu")));
  // Queue: only targets with a record, not searched in the last 8 weeks.
  assert.ok(r.queue.some((q) => q.supplierId === "cummins-inc") && !r.queue.some((q) => q.supplierId === "weichai"));
  assert.deepEqual(r.unclear.map((u) => [u.code, u.unclear, u.total]), [["displacement", 1, 2]]);
  assert.match(reportText(r), /Dung tích xi lanh · 300–700 kVA: 2 gói nêu, 1\/3 model có/);
});

test("gapReport: NCC trong spec-none.json (đã tìm không ra) không vào hàng chờ Tìm Thông Số", () => {
  const base = { docs, suppliers, modelFacts: facts, cat, now: new Date("2026-11-10T00:00:00Z") };
  const all = gapReport(base), first = all.queue[0].supplierId;
  const r = gapReport({ ...base, none: { [first]: { at: "2026-11-13", why: "thử" } } });
  assert.ok(!r.queue.some((q) => q.supplierId === first));
  // Vẫn hiện trong danh sách hãng nên tìm (để biết vì sao thiếu), chỉ không bị gửi lại.
  assert.ok(r.targets.some((t) => t.supplierIds.includes(first)));
});
