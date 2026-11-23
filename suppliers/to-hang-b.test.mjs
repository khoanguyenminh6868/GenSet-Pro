// Nhóm B (Khoa 23/11/2026): hằng số động cơ và nạp khí từ tờ của chính hãng, tiêu đề ghi đúng một model.
import test from "node:test";
import assert from "node:assert/strict";
import { engineSheetChecks, engineSheetsOf, makerConstCells, modelFacts, undoubled } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog, KEY = C.keyOf("AX123G"), OTHER = C.keyOf("BY456G");
const engine = (model, make = "Acme") => ({ key: C.keyOf(model), model, make, uses: [] });
const cat = { engines: [engine("AX123G"), engine("BY456G")], alternators: [] };
const maker = (tables, id = "acme") => ({ id, role: "engine_maker", names: { en: id === "acme" ? "Acme Engines" : "Zeta Engines" }, specTables: tables });
const rows = ["| Number of Cylinders | 4 vertical inline 4 vertical inline", "| Bore | 3.3 in 84 mm", "| Stroke | 3.9 in 100 mm", "| Displacement | 135 in³ 2.2 l", "| Compression Ratio | 23.3:1 23.3:1", "| Aspiration | Turbocharged aftercooled Turbocharged aftercooled"];
const sheet = (title, header = ["| Gross Mechanical Output | 18 kWm 18 kWm"], n = 2001) => ({ n, title, header, rows });
const got = (s, k = KEY) => Object.fromEntries((modelFacts(cat, [s]).get(`engine:${k}`) || []).map((f) => [f.key, f.value]));

test("đọc ô hai lần, hai đơn vị; dung tích hai đơn vị không lấy", () => {
  assert.equal(undoubled("4 inline 4 inline"), "4 inline");
  assert.equal(undoubled("Turbocharged"), "Turbocharged");
  const v = Object.fromEntries(makerConstCells(rows).map((x) => [x.key, x.value]));
  assert.deepEqual(v, { cyl: "4", compr: "23.3:1", asp: "Turbocharged aftercooled", bore: "84 × 100" });
});

test("đường kính thiếu hành trình, một nhãn hai giá trị: không lấy", () => {
  assert.ok(!makerConstCells(["| Bore | 3.3 in 84 mm"]).some((x) => x.key === "bore"));
  assert.ok(!makerConstCells(["| Number of Cylinders | 4 inline", "| Number of Cylinders | 6 inline"]).some((x) => x.key === "cyl"));
  assert.ok(!makerConstCells(["| Compression Ratio | 17:1-18:1 17:1-18:1"]).some((x) => x.key === "compr"));
});

test("chỉ gắn khi tờ của chính hãng và tiêu đề ghi đúng một model", () => {
  assert.equal(got(maker([sheet("AX123G Product Specifications")])).bore, "84 × 100");
  assert.deepEqual(got(maker([sheet("AX123G Product Specifications")], "zeta")), {});
  assert.deepEqual(got(maker([sheet("AX123G and BY456G Specifications")])), {});
  assert.deepEqual(got({ ...maker([sheet("AX123G Product Specifications")]), role: "genset_oem" }), {});
  assert.deepEqual(got(maker([sheet("AX123G Technical data", ["| | BY456G"])])), {}, "cột tiêu đề nêu model khác");
});

const check = (requirement, value) => {
  const s = maker([{ n: 1, title: "AX123G Datasheet", rows: ["| Thermodynamic Cycle | Diesel 4 stroke", "| Cooling System | Liquid", `| Aspiration | ${value}`] }]);
  const r = { code: "engine_type", item: "Kiểu động cơ", requirement, part: "engine", level: "core" }, c = { engine: { model: "AX123G" }, checks: [{ item: r.item, status: "unclear", part: "engine" }] };
  engineSheetChecks(c, [r], engineSheetsOf(cat, [s]).get(KEY), [], null);
  return c.checks[0].status;
};

test("tăng áp, làm mát khí nạp, dung dịch: đạt khi tờ ghi rõ", () => {
  const all = "Diesel 4 thì, làm mát bằng dung dịch, tăng áp, làm mát khí nạp";
  assert.equal(check(all, "Turbocharged and Aftercooled"), "met");
  assert.equal(check(all, "Turbocharged"), "unclear", "tờ không ghi làm mát khí nạp");
  assert.equal(check("Diesel 4 thì, tăng áp", "Naturally aspirated"), "unclear");
  assert.equal(check("Diesel 4 thì, tăng áp hai tầng", "Turbocharged and Aftercooled"), "unclear", "còn ý tờ chưa trả lời");
  assert.equal(check("Diesel 4 thì, không tăng áp", "Turbocharged"), "unclear");
});

test("mã aspiration chấm từ tờ, kể cả bảng có dòng tiêu đề của hãng", () => {
  const s = maker([sheet("AX123G Product Specifications")]), a = engineSheetsOf(cat, [s]).get(KEY);
  const run = (requirement) => { const r = { code: "aspiration", item: "Nạp khí", requirement, part: "engine", level: "core" }, c = { engine: { model: "AX123G" }, checks: [{ item: r.item, status: "unclear", part: "engine" }] }; engineSheetChecks(c, [r], a, [], null); return c.checks[0].status; };
  assert.equal(run("Turbo tăng áp, làm mát khí nạp sau turbo"), "met");
  assert.equal(run("Tăng áp hai tầng"), "unclear");
  const bare = maker([{ ...sheet("AX123G Product Specifications"), rows: ["| Aspiration | Turbocharged Turbocharged"] }]), b = engineSheetsOf(cat, [bare]).get(KEY);
  const r = { code: "aspiration", item: "Nạp khí", requirement: "Tăng áp, làm mát khí nạp", part: "engine", level: "core" }, c = { engine: { model: "AX123G" }, checks: [{ item: r.item, status: "unclear", part: "engine" }] };
  engineSheetChecks(c, [r], b, [], null);
  assert.equal(c.checks[0].status, "unclear", "tờ chỉ ghi tăng áp");
});

test("nạp khí không lấy từ tờ của hãng khác", () => {
  const s = maker([{ n: 1, title: "BY456G Datasheet", rows: ["| Aspiration | Turbocharged"] }], "zeta");
  assert.equal(engineSheetsOf(cat, [s]).get(OTHER)?.attrs?.asp, undefined);
});
