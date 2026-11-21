// node --test suppliers/doc-ma-2.test.mjs — doc-ma-2 (Khoa duyệt 21/11/2026): đọc mã động cơ. Mọi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const HEADER = ["| | 机组型号 | 输出功率 (KW/KVA) | 柴油机品牌 | 柴油机型号 | 缸数 | 排量 (L) | 润滑油 容量(L) | 燃油消耗 (g/kw.h) | 外形尺寸(L×W×H) | 机组重 量(KG)"];
const engines = (id, n, rows) => C.fromSupplier(sup(id, [{ n, title: "250KW", header: HEADER, rows }])).filter((r) => r.kind === "engine");

test("giai đoạn khí thải trong ngoặc ASCII sau mã là ghi chú: (欧三), (国三), có dấu cách", () => {
  const r = engines("bdadl-shanghai", 118, [
    "| BDA-V270 | 270/337.5 | 沃尔沃遍达 | TAD1351GE(欧三) | 6 | 9.36 | 34 | ≤192 | 2900*1100*1600 | 2400",
    "| BDA-Y2200 | 2200/2750 | 玉柴机器股份 | YC16VC3300-D31(国三) | 16 | 105.56 | 280 | ≤195 | 6500*2300*2600 | 14000",
    "| BDA-W900 | 900/1125 | 潍柴博杜安 | 12M33D968E310( 国三) | 12 | 32.8 | 120 | ≤195 | 4500*1800*2300 | 7000",
  ]);
  assert.deepEqual(r.map((x) => x.model), ["TAD1351GE", "YC16VC3300-D31", "12M33D968E310"]);
  assert.deepEqual(r.map((x) => x.genset), ["BDA-V270", "BDA-Y2200", "BDA-W900"]);
});

test("ngoặc ASCII khác sau mã không bị bỏ như ghi chú khí thải", () => {
  const r = engines("bdadl-shanghai", 118, ["| BDA-X | 270/337.5 | 沃尔沃遍达 | TAD1351GE(1341GE) | 6 | 12.78 | 34 | ≤192 | 2900*1100*1600 | 2400"]);
  assert.deepEqual(r.map((x) => x.model), ["TAD1351GE(1341GE)"]);
});
