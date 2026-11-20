// Bộ điều khiển + mô-đun truyền thông, PR 2 (Khoa 20/11/2026, 6 câu): ctl-module.mjs on the saved datasheets of Deep Sea and
// ComAp (bdk-mo-dun PR 1, #977), and through check() on a configuration of IB2600603983's communication requirement.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { check, modelFacts, factsFor, rankConfigs, scoreOf } from "./config-bot.mjs";
import * as CM from "./ctl-module.mjs";

const C = globalThis.GenbidCatalog;
const load = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const dse = load("deep-sea-electronics"), comap = load("comap");
const CTL_LINE = "Deepsea DSE7320, DSE7420, DSE6120";
const offer = { id: "uleengen-test", country: "CN", role: "genset_oem", specTables: [], controllers: [{ brand: "Deep Sea", model: "DSE7320", text: "DSE7320", line: CTL_LINE, src: [3001] }] };
const sups = [dse, comap, offer];
const facts = modelFacts(C.build(sups), sups);
const ctl = (m) => factsFor(facts, "controller", m);
const mf = CM.moduleFacts(sups);
const sub = (k) => CM.SUBS.find((s) => s.k === k);

test("moduleFacts: the module's own datasheet and its name line in a controller's datasheet", () => {
  const d890 = mf.get("DSE890MKII") || [];
  assert.ok(d890.some((f) => f.own && f.n === 1012 && f.line === "| • | 4G Connectivity"));
  assert.ok(d890.some((f) => !f.own && f.line === "| DSE890 MKII | DSEWebNet® / IoT Gateway - 4G (GSM/Ethernet) | 0890-04"));
  assert.ok((mf.get("CM24GGPS") || []).some((f) => f.own && f.line === "Built-in 4G (LTE) cellular modem"));
  // A module's datasheet is not a controller's: no controller key gets its lines (the title trap of PR 1).
  assert.equal([...facts.keys()].filter((k) => /DSE8680|DSE6010|DSE6020/.test(k) && facts.get(k).some((f) => f.n === 1012 || f.n === 1013)).length, 0);
});

test("compat: DSE7320 MKII's datasheet names DSE890 MKII; DSE891's sheet does not give 5G (a third party router)", () => {
  const list = ctl("DSE7320");
  const comp = CM.compatModules(list, new Set(["DSE7320", "DSE7320MKII"]), mf, () => []);
  assert.ok(comp.some((x) => x.m.key === "DSE890MKII" && x.compat.n === 1001));
  const m891 = CM.COMM_MODULES.find((m) => m.key === "DSE891MKII");
  assert.ok(!(mf.get("DSE891MKII") || []).some((f) => CM.modShows(f.line, sub("5G"), m891)));
  // Q2: no module gives the controller's Ethernet.
  assert.ok(!(mf.get("DSE890MKII") || []).some((f) => CM.modShows(f.line, sub("Ethernet"), CM.COMM_MODULES[0])));
});

test("commWords (Q5): a module's name line is no proof of the controller's Internet / 5G", () => {
  const x = { item: "Truyền thông: Điều khiển từ xa qua cổng Internet/5G", name: "Điều khiển từ xa qua cổng Internet/5G", status: "met", sourceQuote: "| DSE890 MKII | DSEWebNet® Gateway | 0890-04" };
  CM.commWords(x, ctl("DSE7320"));
  assert.equal(x.status, "unclear");
  assert.deepEqual(x.wordsMissing, ["5G", "Internet"]);
  CM.commRestore(x);
  assert.equal(x.status, "met");
  assert.equal(x.wordsMissing, undefined);
  // The words in the quote: kept met.
  const y = { name: "RS485", item: "T: RS485", status: "met", sourceQuote: "| RS485 | 1 Modbus RTU Port" };
  CM.commWords(y, ctl("DSE7320"));
  assert.equal(y.status, "met");
  // An optional extension line is not the controller's own Ethernet (Q2).
  assert.equal(CM.ctlShows("Extendable options including 4G/GPS, Ethernet and RS485/RS232", sub("Ethernet")), null);
});

test("commWords (Q3): BMS met through Modbus / SNMP, with the note", () => {
  const x = { name: "BMS", item: "T: BMS", status: "met", sourceQuote: "| RS485 | 1 Modbus RTU Port" };
  CM.commWords(x, ctl("DSE7320"));
  assert.equal(x.status, "met");
  assert.equal(x.bmsVia, "Modbus");
  assert.match(x.note, /BMS qua Modbus\/SNMP, cần NCC xác nhận/);
});

const NAMES = ["Điều khiển từ xa qua cổng Internet/4G", "Cổng kết nối với hệ thống kiểm soát từ xa", "RS232", "RS485", "Ethernet", "BMS", "USB"];
const hsmt = "Chương V. Yêu cầu kỹ thuật\nBộ điều khiển: Cổng kết nối tiêu chuẩn: RS232, RS485, Ethernet, BMS, USB; điều khiển từ xa qua cổng Internet/4G";
const result = (model, statuses) => ({
  requirements: [{ code: "ctl_comm", item: "Truyền thông, giám sát từ xa", part: "controller", level: "core", parts: NAMES.map((item) => ({ item })), quote: "Cổng kết nối tiêu chuẩn: RS232, RS485, Ethernet, BMS, USB" }],
  configs: [{ rank: 1, controller: { model, make: "Deep Sea", src: { kind: "controller", supplierId: "uleengen-test", n: 3001, line: CTL_LINE } },
    checks: [{ item: "Truyền thông, giám sát từ xa", part: "controller", status: "unclear", parts: NAMES.map((item) => ({ item, status: "unclear", offered: "Datasheet chưa ghi", ...(statuses[item] || {}) })) }] }],
});
const run = (r) => check(r, { hsmtText: hsmt, suppliers: sups, readWeb: () => null, origin: "all" });

test("check (Q4): DSE7320 + DSE890 MKII added by code for Internet/4G; Ethernet stays unclear (Q2); run again = same", () => {
  const r = result("DSE7320", { RS232: { status: "met", offered: "RS232", sourceQuote: "| RS232 | 1 Modbus RTU Port", factSrc: { supplierId: "deep-sea-electronics", n: 1001, line: "| RS232 | 1 Modbus RTU Port" } } });
  const out = run(r).result, c = out.configs[0], g = c.checks.find((x) => x.item === "Truyền thông, giám sát từ xa");
  const p = (n) => g.parts.find((x) => x.item === n);
  assert.equal(p("Điều khiển từ xa qua cổng Internet/4G").status, "met");
  assert.deepEqual(p("Điều khiển từ xa qua cổng Internet/4G").viaModule, ["DSE890 MKII"]);
  assert.match(p("Điều khiển từ xa qua cổng Internet/4G").note, /Mô-đun chọn theo tài liệu hãng, NCC chưa chào/);
  assert.equal(p("Ethernet").status, "unclear");
  assert.equal(p("RS232").status, "met", JSON.stringify(p("RS232")));
  assert.equal(c.controller.modules.length, 1);
  assert.equal(c.controller.modules[0].model, "DSE890 MKII");
  assert.equal(c.controller.modules[0].order, "0890-04");
  assert.equal(c.controller.modules[0].offeredBy, null);
  assert.deepEqual(c.controller.modules[0].why, ["4G", "Internet"]);
  // Run again on the saved result: the same modules, alternatives and parts (the "cần xác nhận đời" note and the supplier gap
  // repeat on every run already on main: not this code's).
  const snap = (cc) => JSON.stringify({ ctl: cc.controller, parts: cc.checks[0].parts.map(({ note, ...p }) => (p.viaModule || p.wordsMissing ? { ...p, note } : p)) });
  const once = snap(c);
  assert.equal(snap(run(out).result.configs[0]), once);
});

test("check (Q1): DSE7420 offered; DSE7320 MKII + DSE890 MKII listed as the other pair with no 'không đạt'", () => {
  const out = run(result("DSE7420", {})).result, c = out.configs[0];
  assert.ok(c.controller.alternatives.some((a) => a.model === "DSE7320 MKII" && a.modules.some((m) => m.model === "DSE890 MKII")));
  assert.match(c.controller.altLine, /^Phương án khác đạt tương đương: .*DSE7320 MKII \+ DSE890 MKII/);
});

test("check (Q1, PR 3): only pairs meeting at least the main pair's parts less one", () => {
  const mainMet = (m) => { const l = ctl(m); return CM.bestPair(NAMES, l, CM.compatModules(l, new Set([C.keyOf(m), ...l.map((f) => C.keyOf(f.sheetModel || ""))]), mf), mf).met; };
  for (const model of ["DSE7420", "DSE7320", "DSE6120"]) {
    const c = run(result(model, {})).result.configs[0], floor = Math.max(1, mainMet(model) - 1);
    for (const a of c.controller.alternatives || []) assert.ok(a.met >= floor, `${model}: ${a.model} ${a.met} < ${floor}`);
  }
  // DSE6120 MKIII (fewer ports) is not an alternative of DSE7420; DSE7320 MKII + DSE890 MKII still is (5/7 beside 6/7).
  const c = run(result("DSE7420", {})).result.configs[0];
  assert.ok(!(c.controller.alternatives || []).some((a) => /6120/.test(a.model)), JSON.stringify(c.controller.alternatives));
});

test("rankConfigs: same score, the configuration without a module first", () => {
  const a = { rank: 1, controller: { model: "X", modules: [{ model: "DSE890 MKII" }] }, checks: [{ item: "T", part: "controller", status: "met" }] };
  const b = { rank: 2, controller: { model: "Y" }, checks: [{ item: "T", part: "controller", status: "met" }] };
  const r = { requirements: [{ item: "T", part: "controller", level: "core" }], configs: [a, b] };
  assert.deepEqual(scoreOf(a, r.requirements), scoreOf(b, r.requirements));
  rankConfigs(r);
  assert.equal(r.configs[0].controller.model, "Y");
});
