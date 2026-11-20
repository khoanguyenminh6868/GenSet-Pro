// node --test suppliers/fuel-hsmt.test.mjs — Gợi ý cấu hình theo NHIÊN LIỆU (may-khi-2 PR 2, Khoa 20/11/2026): fuelOfHsmt / hintsOf.fuel /
// candidates (`ruled: "fuel"`) / check ("Nhiên liệu (HSMT)"). Dòng catalog thật: agg-fuzhou n115 (máy khí, fuel "gas" mức M).
// HSMT không nêu nhiên liệu → coi diesel; dòng catalog KHÔNG ghi nhiên liệu thì luôn ở lại (rỗng ≠ diesel).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as CB from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const free = (text) => ({ ...CB.hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const H = "| Model | Prime kVA | Prime kW | Engine |";
const diesel = { id: "dz", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Diesel gensets 50Hz", header: [H], rows: ["| DZ-260 | 260 | 208 | 6CTAA8.3-G2 |"] }] };
const agg = real("agg-fuzhou");
const gas = { id: "gz", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Natural Gas Generator Set 50Hz", header: [H], rows: ["| GZ-260 | 260 | 208 | G12V190ZLD |"] }] };
const cap = { value: 260, unit: "kVA" };
const run = (hsmt) => { const L = [agg, gas, diesel]; return CB.candidates(C.build(L), cap, free(hsmt), { suppliers: L }); };
const gasRows = (r) => r.top.filter((x) => x.u.supplierId === "gz");

test("fuelOfHsmt: chỉ chữ NÊU nhiên liệu của tổ máy; không nêu thì diesel; hai loại trở lên thì không xét", () => {
  const f = (t) => CB.fuelOfHsmt(t);
  assert.deepEqual([f("Nhiên liệu: Dầu Diesel").fuel, f("Nhiên liệu: Dầu Diesel").stated], ["diesel", true]);
  assert.deepEqual([f("Tần số 50 Hz\nSố xi lanh ≥ 6").fuel, f("Tần số 50 Hz").stated], ["diesel", false]);
  assert.equal(f("Máy phát điện chạy bằng khí thiên nhiên, công suất 500 kVA").fuel, "gas");
  assert.equal(f("Động cơ: Nhiên liệu: Biogas").fuel, "gas");
  assert.equal(f("Nhiên liệu sử dụng: Xăng").fuel, "gasoline");
  assert.equal(f("Máy phát điện chạy xăng 7,5 kVA").fuel, "gasoline");
  // không phải nhiên liệu: hút khí tự nhiên (động cơ không tăng áp), liên động cơ khí, cửa hàng xăng dầu, khí thải, khí nén
  for (const t of ["Kiểu nạp khí: Hút khí tự nhiên hoặc Turbo", "ATS có khóa liên động cơ khí", "Lắp tại cửa hàng xăng dầu số 5", "Lượng khí thải, khí nén 8 bar"]) assert.equal(f(t).fuel, "diesel", t);
  assert.equal(f("Nhiên liệu: Dầu Diesel hoặc xăng").fuel, null);                  // hai loại: không xét
  assert.equal(f("Máy xăng 6,5 kVA và máy chạy dầu diesel 100 kVA").fuel, null);
});

test("fuelOff: dòng ghi khí / xăng trái HSMT; dual hợp cả khí lẫn xăng; dòng không ghi nhiên liệu không bao giờ sai", () => {
  assert.equal(CB.fuelOff("diesel", "gas"), true);
  assert.equal(CB.fuelOff("diesel", "dual"), true);
  assert.equal(CB.fuelOff("diesel", undefined), false);
  assert.equal(CB.fuelOff("gas", "gas"), false);
  assert.equal(CB.fuelOff("gas", "dual"), false);
  assert.equal(CB.fuelOff("gas", "gasoline"), true);
  assert.equal(CB.fuelOff("gasoline", "dual"), false);
  assert.equal(CB.fuelOff("gasoline", "gas"), true);
  assert.equal(CB.fuelOff(null, "gas"), false);                                      // HSMT hỗn hợp: không loại
});

test("hintsOf.fuel", () => {
  assert.equal(CB.hintsOf("Chương V\nNhiên liệu: Diesel").fuel, "diesel");
  assert.equal(CB.hintsOf("Chương V\nTần số 50 Hz").fuel, "diesel");
  assert.equal(CB.hintsOf("Chương V\nNhiên liệu: khí tự nhiên").fuel, "gas");
});

test("candidates: HSMT diesel (hoặc không nêu) loại dòng máy khí agg-fuzhou kèm lý do; dòng diesel không ghi nhiên liệu ở lại", () => {
  for (const t of ["Nhiên liệu: Diesel\n50 Hz", "50 Hz"]) {
    const r = run(t);
    assert.equal(gasRows(r).length, 0, t);
    assert.ok(r.top.some((x) => x.u.supplierId === "dz"), "dòng diesel ở lại");
    const d = r.dropped.filter((x) => x.u.supplierId === "agg-fuzhou" && x.u.n === 115);
    assert.ok(d.length >= 1 && d.every((x) => x.ruled.includes("fuel") && x.u.fuel === "gas"));
  }
});

test("candidates: HSMT khí giữ dòng máy khí; HSMT xăng loại dòng khí; HSMT hỗn hợp không loại ai", () => {
  const g = run("Nhiên liệu: khí thiên nhiên\n50 Hz");
  assert.ok(gasRows(g).length >= 1);
  assert.equal(g.dropped.filter((x) => x.ruled.includes("fuel")).length, 0);
  const x = run("Máy chạy xăng\n50 Hz");
  assert.equal(gasRows(x).length, 0);
  const m = run("Nhiên liệu: Dầu Diesel hoặc xăng\n50 Hz");
  assert.ok(gasRows(m).length >= 1);
});

test("candidates: tổ máy HSMT nêu đích danh vẫn ở lại dù dòng ghi khí", () => {
  const L = [agg, gas, diesel], h = free("Nhiên liệu: Diesel\nĐộng cơ: model G12V190ZLD\n50 Hz");
  const r = CB.candidates(C.build(L), cap, h, { suppliers: L });
  assert.ok(gasRows(r).length >= 1 && gasRows(r).every((x) => x.named));
});

test("check: cấu hình dùng dòng khí cho HSMT diesel → check Nhiên liệu không đạt; HSMT khí → không có check; chạy lại không nhân đôi", () => {
  const line = "| DC260G6-NG | 260/208 | LY13-G280 | AGG";
  const mk = () => ({ requirements: [], configs: [{ rank: 1, engine: { model: "LY13-G280", make: "AGG" }, genset: { model: "DC260G6-NG" }, checks: [], suppliers: [{ supplierId: "agg-fuzhou", n: 115, line }] }] });
  const ask = (t, r = mk()) => CB.check(r, { hsmtText: t, suppliers: [agg], readWeb: () => null, origin: "all" }).result;
  const bad = ask("Nhiên liệu: Diesel\n50 Hz");
  const fc = (bad.configs[0].checks || []).filter((x) => x.fuelRule);
  assert.equal(fc.length, 1);
  assert.equal(fc[0].status, "not_met");
  assert.match(fc[0].note, /gas|khí/i);
  assert.equal((ask("Nhiên liệu: Diesel\n50 Hz", JSON.parse(JSON.stringify(bad))).configs[0].checks || []).filter((x) => x.fuelRule).length, 1);
  assert.equal((ask("Máy phát điện chạy bằng khí thiên nhiên\n50 Hz").configs[0].checks || []).filter((x) => x.fuelRule).length, 0);
});
