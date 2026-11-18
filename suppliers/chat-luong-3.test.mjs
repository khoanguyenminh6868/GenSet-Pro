// node --test suppliers/chat-luong-3.test.mjs — bố cục mã chưa hiểu thì để thiếu và ghi vào danh sách chưa đọc được
// (chat-luong-3, Khoa 18/11/2026: phương án C + giữ 6 số đúng). Dòng thật ở suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(ROOT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const sup = (header, rows, title = "", role = "genset_oem") => ({ id: "t", role, country: "CN", names: { en: "Test" }, specTables: [{ n: 101, title, header, rows }] });
const read = (...a) => { const notes = []; const out = C.fromSupplier(sup(...a), notes); return { out, notes }; };
const spec = (u, k) => u.specs.find((s) => s.key === k)?.value;

test("L3B gb-power n1001: the page footer 'GB POWER | 3/4' is no 4 kVA / 3 kW rating; the sheet's own ratings stay", () => {
  const rows = ["Standard Features", "| MODEL | GB-P10", "| Standby Power(50Hz) | 8.8KW/11KVA", "| Prime Power(50Hz) | 8KW/10KVA", "| Engine | PERKINS 403D-11G",
    "| Alternator | STAMFORD PI044E", "| Copyright By GB POWER | 1/4", "| GB POWER | 3/4", "| Engine Model | 403D-11G"];
  const { out, notes } = read([], rows, "Datasheet: GB-P10.doc-1.pdf");
  const e = out.find((u) => u.kind === "engine");
  assert.equal(e.model, "403D-11G");
  assert.deepEqual(e.power, { prime: { kW: 8, kVA: 10 }, standby: { kW: 8.8, kVA: 11 } });
  assert.ok(notes.some((x) => x.reason === "cặp a/b dưới nhãn không ghi mức / đơn vị" && /3\/4/.test(x.detail)));
});

test("L3B keeps 'a/b' under a rating written as ESP / PRP with the unit in its own cell (westinpower)", () => {
  const { out } = read([], ["| Model | 4016-61TRG3", "| Engine Model | 4016-61TRG3", "| Power(ESP) | kVA/kw | 2500/2000", "| Power(PRP) | kVA/kw | 2250/1800"]);
  const e = out.find((u) => u.kind === "engine");
  assert.deepEqual(e.power.standby, { kVA: 2500, kW: 2000 });
  assert.deepEqual(e.power.prime, { kVA: 2250, kW: 1800 });
});

const WCHK = "dòng điện / điện áp theo vị trí không khớp công suất";
test("WCHK power-hf n109: a row missing cells puts the kW under the current and the standby kW under the voltage: both left out", () => {
  const { out, notes } = read(["| 序号 | 机组型号 | 常用功率（kW） | 备用功率（kW） | 额定电流（A） | 额定电压 （V） | 额定频率 （Hz） | 柴油机型号 | 敞开型 | 静音型 | 拖车型"],
    ["| 13 | PHF-100RX | 100 | 110 | 180 | PHF6110ZLD1(R2J01) | ● | ● | ●"]);
  const e = out.find((u) => u.kind === "engine");
  assert.equal(spec(e, "current"), undefined);
  assert.equal(spec(e, "voltage"), undefined);
  assert.ok(notes.filter((x) => x.reason === WCHK).length >= 1);
});

test("WCHK yingtai-jiangsu n113 (6,3 kV set): 128 A is kept, the standby 1230 kW read as the voltage is left out", () => {
  const { out } = read(["| 机组型号 | 功率（KW） | 额定电压 | 电流 | 净重 | 机组外形尺寸 | 发动机型号 | 品牌 | 功率（KW） | 缸数 | 排气量 | 燃油耗 | 调速方式", "| 主用 | 备用 | V | A | （kg) | L×W×H(m) | 主用 | 备用 | （L) | (g/kW.h)"],
    ["| 1120GF | 1120 | 1230 | 128 | 11830 | 6.40×2.04×2.64 | QSK50-G3 | 进口康明斯 | 1210 | 1401 | 16 | 50.3 | ≤197 | 电喷"]);
  const e = out.find((u) => u.kind === "engine");
  assert.notEqual(spec(e, "voltage"), "1230");
  if (spec(e, "current") !== undefined) assert.equal(spec(e, "current"), "128");
});

test("WCHK honny n102 (10,5 kV set HGM1100EHV10.5): 55 A is a current of 1000 kVA at 10,5 kV, kept", () => {
  const { out } = read(["| | 机组技术参数 | 发动机技术参数 | 机组尺寸与重量", "| 机组 型号 | 备用 容量 (kVA) | 常用 容量 (kVA) | 备用 功率 (kW) | 常用 功率 (kW) | 燃油 消耗 (L) | 额定 电流 (A) | 发动机 型号 | 备用 功率 (kW) | 常用 功率 (kW) | 缸数 | 缸径 | 行程 | 排量 (A) | 压缩比 | 发电机 型号 | 机组尺寸(mm) | 重量", "| 长 | 宽 | 高 | (kg)"],
    ["| HGM1100EHV10.5 | 1100 | 1000 | 880 | 800 | 212 | 55.0 | PTAA16V-EG980 | 980 | 893 | V16 | 135 | 145 | 33 | 15.5:1 | GPH-1000-4P | 4400 | 2200 | 2400 | 7650"]);
  assert.equal(spec(out.find((u) => u.kind === "engine"), "current"), "55.0");
});

test("WCHK huatai n111: 1267 A fits the 700 kW of '700GF' though the output column holds other figures ('140/165'): kept", () => {
  const { out } = read(["| 组型号Type of set | 输出功率 Power of output (KW/KVA) | 额定电流Rated current (A) | 柴油机参数 Parameters of set | 机组尺寸及重量 Size and weight of machine set", "| 型号 Type | 额定功率 power (KW) | 缸数及类型Numbers& Type of cylinder | 燃油消耗 (g/kw.h)Consumption of fuel(g/kw.h) | 机油容量 Oil capacity (L) | 长×宽×高 Length Width Height (MM) | 净重 Net Weight (kg)"],
    ["| 700GF | 140/165 | 1267 | WD305TAD68 | 750 | 12缸V型 | 196 | 55 | 3800×1800×2100 | 4550"]);
  assert.equal(spec(out.find((u) => u.kind === "engine"), "current"), "1267");
});
