// bdk-ten-tat (điều phối 24/11/2026): tên model BĐK NCC ghi phải tới được datasheet hãng đã lưu, mà không nhận nhầm chữ khác.
// HGM410 / HGM420 (tờ smartgen 1010), "AMF5" của ComAp (tờ comap 1021 InteliNano AMF 5), SICES GC315 / GC400 / GC600 /
// DST4602Evolution (tờ sices 1001–1004). Mẫu mới đo trên cả cn/ (xem nghiem-thu/bdk-ten-tat.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const bot = await import(pathToFileURL(path.join(ROOT, "config-bot.mjs")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const m = (t) => C.controllersIn(t).filter((x) => x.model).map((x) => x.model);

test("SmartGen: HGM410 / HGM420 ba chữ số theo danh sách đóng; không nhận tên genset HGM550E, series HGM400", () => {
  assert.deepEqual(m("Control System: Digital Panel HGM420"), ["HGM420"]);
  assert.deepEqual(m("Controller: HGM 410"), ["HGM410"]);
  assert.deepEqual(m("Control System: Smartgen HGM420"), ["HGM420"]);
  assert.deepEqual(m("| HGM550E | 550 | 500 | 440 | 400 | PTAA6L-EG490 |"), []);
  assert.deepEqual(m("| HGM1000E | 1000 | 900 |"), ["HGM1000E"]); // đọc cũ, không đổi
  assert.deepEqual(m("HGM400 Series Genset Controller"), []);
  assert.deepEqual(m("HGM4200"), ["HGM4200"]); // bốn chữ số: mẫu cũ, không đổi; mẫu mới không đọc "HGM420" bên trong
  assert.deepEqual(m("HGM4020T"), ["HGM4020T"]);
});

test("ComAp: AMF5 chỉ khi dòng ghi ComAp; InteliNano AMF 5 là model của tờ 1021", () => {
  assert.deepEqual(m("ComAp AMF5"), ["AMF5"]);
  assert.deepEqual(m("Datasheet: InteliNano AMF 5"), ["InteliNano AMF5"]);
  assert.deepEqual(m("LEXYS AMF 5.1"), []);
  assert.deepEqual(m("ComAp AMF25"), ["AMF25"]);
});

test("SICES: model có tờ, ghi kèm tên hãng; tên genset GC-600(S) / GC500 không phải bộ điều khiển", () => {
  assert.deepEqual(m("Datasheet: Mecc Alte GC315 (GC315Plus, GC315Link)"), ["GC315", "GC315Plus", "GC315Link"]);
  assert.deepEqual(m("Datasheet: Mecc Alte GC315-GC400"), ["GC315", "GC400"]);
  assert.deepEqual(m("Mecc Alte DST4602Evolution"), ["DST4602Evolution"]);
  assert.deepEqual(m("SICES GC600"), ["GC600"]);
  assert.deepEqual(m("| GC-600(S) | 600 | 480 | KTAA19-G5 |"), []);
  assert.deepEqual(m("| GC500 | 500 | 400 |"), []);
  assert.deepEqual(m("Mecc Alte, Stamford alternator, and Deepsea and Comap controller"), m("Deepsea and Comap controller"));
  assert.equal(C.controllersIn("Alternator: Mecc Alte, controller: Deepsea").some((x) => x.brand === "SICES"), false);
  // GC310 / GC350 / GC500Plus: không có tờ, không đọc
  assert.deepEqual(m("SICES GC310"), []);
});

test("factsFor: datasheet tới HGM420, HGM410, AMF5, GC315, GC600, DST4602Evolution", () => {
  const recs = ["smartgen", "comap", "sices"].map((id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8")));
  const facts = bot.modelFacts({ engines: [], alternators: [] }, recs);
  for (const [model, min] of [["HGM420", 100], ["HGM410", 100], ["AMF5", 100], ["GC315", 100], ["GC600", 100], ["DST4602Evolution", 100]]) {
    const n = bot.factsFor(facts, "controller", model).length;
    assert.ok(n >= min, `${model}: ${n} dòng`);
  }
  // AMF5 lấy tờ InteliNano kèm version (cần xác nhận đời)
  assert.ok(bot.factsFor(facts, "controller", "AMF5").every((f) => /INTELINANOAMF5|InteliNano/i.test(f.version || "")));
  // IG200 vẫn không gắn, InteliDrive không có khoá riêng
  assert.equal(bot.factsFor(facts, "controller", "IG200").length, 0);
});
