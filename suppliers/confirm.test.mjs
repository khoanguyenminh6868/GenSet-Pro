// node --test suppliers/*.test.mjs — bốn loại yêu cầu (reqcodes.mjs kind), trạng thái "confirm" và bảng câu hỏi gửi NCC
// (config-bot.mjs confirmChecks / rfqOf / scoreOf), 2026-11-10.
import test from "node:test";
import assert from "node:assert/strict";
import { REQ_CODES, KINDS, kindOf, withCode, confirmKindOf, voltsIn } from "./reqcodes.mjs";
import { check, confirmChecks, rfqOf, scoreOf, rankConfigs } from "./config-bot.mjs";

test("every requirement code has a kind; order / document / site as decided", () => {
  for (const c of REQ_CODES) assert.ok(KINDS.includes(c.kind), c.code);
  const k = (code) => kindOf({ code });
  assert.deepEqual(["voltage", "phases", "alt_ip", "alt_avr", "breaker", "battery", "fuel_tank", "canopy", "genset_type", "ctl_display_lang"].map(k), Array(10).fill("order"));
  assert.deepEqual(["standards", "prototype", "alt_standard"].map(k), Array(3).fill("document"));
  assert.equal(k("genset_origin"), "model"); // điều phối 10/11: nước lắp ráp = nước của NCC, xử lý ở PR 2
  assert.deepEqual(["ambient", "noise"].map(k), ["site", "site"]);
  assert.deepEqual(["cylinders", "engine_type", "fuel_system", "overload", "load_step", "alt_vreg", "frequency"].map(k), Array(7).fill("model"));
  assert.equal(kindOf({ code: "other" }), "model");
  assert.equal(withCode({ item: "Điện áp", requirement: "400/230 V" }).kind, "order");
});

test("confirmKindOf: voltage low only, phases three only, IP23 or below; a figure not read stays unclear (điều phối 10/11)", () => {
  const ck = (code, requirement, quote = "") => confirmKindOf({ code, requirement, quote });
  assert.deepEqual(voltsIn("380V - 415V / 50Hz"), [380, 415]);
  assert.deepEqual(voltsIn("400/230 V"), [400, 230]);
  assert.deepEqual(voltsIn("0,4 kV"), [400]);
  assert.equal(ck("voltage", "400/230 V"), "order");
  assert.equal(ck("voltage", "380/220VAC"), "order");
  assert.equal(ck("voltage", "0,4 kV"), "order");
  assert.equal(ck("voltage", "6,3 kV"), null);
  assert.equal(ck("voltage", "22kV / 0,4 kV"), null);
  assert.equal(ck("voltage", "Theo lưới điện tại công trình"), null);
  assert.equal(ck("phases", "3 pha – 4 dây"), "order");
  assert.equal(ck("phases", "", "380V / 50Hz / 3 pha - 4 dây"), "order");
  assert.equal(ck("phases", "1 pha 220 V"), null);
  assert.equal(ck("phases", "Một pha"), null);
  assert.equal(ck("phases", "3 pha hoặc 1 pha"), null);
  assert.equal(ck("phases", "Theo HSMT"), null);
  assert.equal(ck("alt_ip", "IP23"), "order");
  assert.equal(ck("alt_ip", "≥ IP21"), "order");
  assert.equal(ck("alt_ip", "IP44"), null);
  assert.equal(ck("alt_ip", "IP 54"), null);
  assert.equal(ck("alt_ip", "Cấp bảo vệ phù hợp"), null);
  assert.equal(ck("breaker", "MCCB 400A"), "order");
  assert.equal(ck("genset_origin", "G7"), null);
});

test("confirmChecks: a medium-voltage, 1-phase or IP54 requirement stays unclear", () => {
  const rq = [{ item: "Điện áp", code: "voltage", requirement: "6,3 kV" }, { item: "Số pha", code: "phases", requirement: "1 pha" }, { item: "Cấp bảo vệ đầu phát (IP)", code: "alt_ip", requirement: "IP54" }];
  const c = confirmChecks({ rank: 1, checks: rq.map((r) => ({ item: r.item, part: "genset", status: "unclear" })) }, rq);
  assert.deepEqual(c.checks.map((x) => x.status), ["unclear", "unclear", "unclear"]);
  assert.ok(rfqOf(c, rq).every((q) => q.status === "unclear" && /datasheet/.test(q.ask)));
});

const reqs = [
  { item: "Điện áp", code: "voltage", requirement: "400/230 V", part: "genset", level: "core" },
  { item: "Tiêu chuẩn, chứng nhận tổ máy (ISO 3046, IEC 60034, CE, ISO 9001)", code: "standards", requirement: "ISO 8528, ISO 9001", part: "genset", level: "core" },
  { item: "Số xi lanh", code: "cylinders", requirement: "≥ 6", part: "engine", level: "core" },
  { item: "Cấp bảo vệ đầu phát (IP)", code: "alt_ip", requirement: "IP23", part: "alternator", level: "core" },
  { item: "Nhiệt độ môi trường làm việc", code: "ambient", requirement: "45°C", part: "genset", level: "core" },
];
const cfg = () => ({ rank: 1, engine: { model: "6BTAA5.9-G2" }, alternator: { model: "UCI274E" }, checks: [
  { item: "Điện áp", part: "genset", status: "unclear", offered: "" },
  { item: "Tiêu chuẩn, chứng nhận tổ máy (ISO 3046, IEC 60034, CE, ISO 9001)", part: "genset", status: "unclear" },
  { item: "Số xi lanh", part: "engine", status: "unclear" },
  { item: "Nhiệt độ môi trường làm việc", part: "genset", status: "unclear" },
] });

test("confirmChecks: an unclear order / document point becomes confirm; model and site stay unclear", () => {
  const c = confirmChecks(cfg(), reqs), st = Object.fromEntries(c.checks.map((x) => [x.item, [x.status, x.confirm]]));
  assert.deepEqual(st["Điện áp"], ["confirm", "order"]);
  assert.deepEqual(st["Tiêu chuẩn, chứng nhận tổ máy (ISO 3046, IEC 60034, CE, ISO 9001)"], ["confirm", "document"]);
  assert.deepEqual(st["Số xi lanh"], ["unclear", undefined]);
  assert.deepEqual(st["Nhiệt độ môi trường làm việc"], ["unclear", undefined]);
  // A requirement of an order kind with no check gets one, written by the code.
  const ip = c.checks.find((x) => x.item === "Cấp bảo vệ đầu phát (IP)");
  assert.equal(ip.status, "confirm"); assert.ok(ip.byCode); assert.equal(ip.part, "alternator");
});

test("confirmChecks: not when the quote is not found (unverified) or sources disagree, nor a met / not met; a hint does not stop it", () => {
  const c = cfg();
  c.checks[0].conflict = true;
  c.checks[1].unverified = true;
  c.checks.push({ item: "Cấp bảo vệ đầu phát (IP)", part: "alternator", status: "not_met", offered: "IP21" });
  c.checks.push({ item: "Điều chỉnh điện áp (AVR)", part: "alternator", status: "unclear", hint: { line: "| Voltage regulation NL-FL | ≤±1%" } });
  confirmChecks(c, [...reqs, { item: "Điều chỉnh điện áp (AVR)", code: "alt_avr", part: "alternator", level: "core" }]);
  assert.equal(c.checks.find((x) => x.item === "Điều chỉnh điện áp (AVR)").status, "confirm");
  assert.equal(c.checks[0].status, "unclear");
  assert.equal(c.checks[1].status, "unclear");
  assert.equal(c.checks.find((x) => x.item === "Cấp bảo vệ đầu phát (IP)").status, "not_met");
});

test("confirmChecks: a confirm written on a model point goes back to unclear (the agent never decides it)", () => {
  const c = cfg(); c.checks[2].status = "confirm"; c.checks[2].confirm = "order";
  confirmChecks(c, reqs);
  assert.equal(c.checks[2].status, "unclear"); assert.equal(c.checks[2].confirm, undefined);
});

test("check(): an agent's confirm is unclear before the code decides; an order point the row does not state is confirm", () => {
  const row = { kind: "catalog", supplierId: "s", n: 101, line: "| SQP500 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C | UK" };
  const sup = [{ id: "s", country: "CN", specTables: [{ n: 101, title: "Perkins gensets", header: ["| Model | Standby kW/kVA | Prime kW/kVA | Engine | Alternator"], rows: [row.line] }] }];
  const hsmt = "Chương V\nCông suất liên tục (Prime): ≥ 450 kVA\nĐiện áp 400/230 V\nSố xi lanh ≥ 6\nCấp bảo vệ IP23";
  const r = { requirements: [{ item: "Điện áp", requirement: "400/230 V", quote: "Điện áp 400/230 V" }, { item: "Số xi lanh", requirement: "≥ 6", quote: "Số xi lanh ≥ 6" }, { item: "Cấp bảo vệ đầu phát (IP)", requirement: "IP23", quote: "Cấp bảo vệ IP23" }],
    configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src: row }, alternator: { model: "HCI544C", src: row }, genset: { model: "SQP500", src: row },
      checks: [{ item: "Điện áp", part: "genset", status: "unclear" }, { item: "Số xi lanh", part: "engine", status: "confirm" }] }] };
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb: () => null, origin: "all" });
  const st = Object.fromEntries(result.configs[0].checks.map((x) => [x.item, x.status]));
  assert.equal(st["Điện áp"], "confirm");
  assert.equal(st["Số xi lanh"], "unclear");
  assert.equal(st["Cấp bảo vệ đầu phát (IP)"], "confirm");
  // Checking the checked result again gives the same.
  const again = check(JSON.parse(JSON.stringify(result)), { hsmtText: hsmt, suppliers: sup, readWeb: () => null, origin: "all" }).result;
  assert.deepEqual(again.configs[0].checks.map((x) => [x.item, x.status]), result.configs[0].checks.map((x) => [x.item, x.status]));
});

test("scoreOf / rankConfigs: a confirm is not counted as unclear; everything else ranks as before", () => {
  const a = confirmChecks(cfg(), reqs);
  const b = cfg(); b.rank = 2; b.engine = { model: "QSB7-G5" }; b.checks[0].status = "met"; b.checks[0].sourceQuote = "x";
  confirmChecks(b, reqs);
  // a: voltage confirm; b: voltage met — same score.
  assert.deepEqual(scoreOf(a, reqs), scoreOf(b, reqs));
  // Unclear on the engine still weighs before anything else of the genset.
  const c = cfg(); c.rank = 3; c.engine = { model: "6LTAA8.9-G2" }; c.checks[2].status = "met"; c.checks[2].sourceQuote = "6";
  confirmChecks(c, reqs);
  const r = rankConfigs({ requirements: reqs, configs: [a, b, c] });
  assert.equal(r.configs[0].engine.model, "6LTAA8.9-G2");
});

test("rfqOf: one line per confirm / unclear point, with what to confirm or send", () => {
  const c = confirmChecks(cfg(), reqs), q = rfqOf(c, reqs);
  // A line joining several points (điều phối 2026-11-11) counts as each of its items.
  const by = Object.fromEntries(q.flatMap((x) => (x.items || [x]).map((i) => [i.item, x])));
  assert.equal(by["Điện áp"].status, "confirm");
  assert.match(by["Điện áp"].ask, /đặt hàng/);
  assert.match(by["Tiêu chuẩn, chứng nhận tổ máy (ISO 3046, IEC 60034, CE, ISO 9001)"].ask, /chứng từ/);
  assert.match(by["Số xi lanh"].ask, /datasheet/); assert.equal(by["Số xi lanh"].of, "Động cơ 6BTAA5.9-G2");
  assert.match(by["Nhiệt độ môi trường làm việc"].ask, /giảm công suất/);
  assert.equal(q[0].part, "engine");
  // rankConfigs writes it on every configuration.
  assert.ok(rankConfigs({ requirements: reqs, configs: [cfg()] }).configs[0].rfq.length >= 4);
});
