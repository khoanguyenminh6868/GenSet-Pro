// node --test suppliers/catalog-hy.test.mjs — Khoa 20/11/2026 (catalog nhóm còn lại): câu 7 = C, huatai-yangzhou n111 lấy công suất
// tổ máy từ tên "NNNGF" (mức `rated`) và công suất động cơ từ ô "额定功率 power (KW)" (NAMED_POWER); câu 6 = C, bảng động cơ
// Cummins của yingtai-jiangsu n101 / n2003 thành bản ghi động cơ không công suất tổ máy (ENGINE_TABLES). Dòng nguyên văn từ cn/.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8"));
const sup = (id, tables) => ({ id, country: "CN", role: "genset_maker", names: { en: id }, specTables: tables });
const spec = (o, k) => (o.specs || []).filter((x) => x.key === k).map((x) => x.value);
const HUATAI = { n: 111, title: "无锡动力系列柴油发电机组-扬州华泰电气有限公司",
  header: ["| 组型号Type of set | 输出功率 Power of output (KW/KVA) | 额定电流Rated current (A) | 柴油机参数 Parameters of set | 机组尺寸及重量 Size and weight of machine set",
    "| 型号 Type | 额定功率 power (KW) | 缸数及类型Numbers& Type of cylinder | 燃油消耗 (g/kw.h)Consumption of fuel(g/kw.h) | 机油容量 Oil capacity (L) | 长×宽×高 Length Width Height (MM) | 净重 Net Weight (kg)"],
  rows: ["| 200GF | 135/320 | 362 | WD129TAD23 | 259 | 6缸直列 | 198 | 24 | 2700×900×1400 | 1900"] };
const YT = { n: 2003, title: "Yingtai / Imported Cummins",
  header: ["| 品 牌 Br and | 发 动 机 型 号 En g ine Ty pe | 功 率 (主用) Power (KW) | 功率 (备用) Po wer (KW) | 缸 数 No Of Cylin ders | 缸径 *行程 Bore /Strokse (MM) | 排 气 量 Exha ust Csp acity (L) | 压 缩 比 Com pression Ratio | 机 油 容 量 Lubri cating Cap acity (L) | 燃油耗 Fuel Consu mptio (G / KW.H) | 燃油消耗率 Fuel Con sum ptio (L/H) | 调 速方式 Type Of Gov ernor | 冷却液容量 Liquid coo lind ca paci ty | 排放等级 Emiss ion l eveis"],
  rows: ["| 进口 康明斯 Import Cummins | X2.5G2 | 24.4 | 27 | 3 | 91.4X127 | 2.5 | 18.5:1 | 6.5 | 204 | 6 | 机械 | 15 | N/A",
    "| NTA855G7 | / | 391 | 6 | 140X152 | 14 | 14.0:1 | 36 | 212 | 97.7 | 电调 | 65.9 | N/A",
    "| | | | | 9 | | | |"] };

test("huatai n111: công suất tổ máy = số trong tên (rated), công suất động cơ = ô 额定功率", () => {
  const [o] = C.fromSupplier(sup("huatai-yangzhou", [HUATAI])).filter((r) => r.kind === "engine");
  assert.equal(o.model, "WD129TAD23");
  assert.deepEqual(o.power, { rated: { kW: 200 } });
  assert.deepEqual(spec(o, "engPower"), ["259"]);
  assert.equal(o.powerFrom, "tên tổ máy");
});

test("NAMED_POWER chỉ áp cho huatai n111 đúng tiêu đề", () => {
  const other = C.fromSupplier(sup("ncc-khac", [HUATAI])).find((r) => r.kind === "engine");
  assert.equal(other.power, null);
  const changed = C.fromSupplier(sup("huatai-yangzhou", [{ ...HUATAI, header: ["| 组型号 | 输出功率", HUATAI.header[1]] }])).find((r) => r.kind === "engine");
  assert.ok(!changed || !changed.power, "đổi tiêu đề thì không đọc công suất theo tên");
});

test("yingtai bảng động cơ: ô hãng ở dòng đầu bỏ đi, '/' không đọc, dòng rác có note", () => {
  const notes = [];
  const r = C.fromSupplier(sup("yingtai-jiangsu", [YT]), notes);
  assert.deepEqual(r.map((o) => [o.kind, o.model, o.power]), [["engine", "X2.5G2", null], ["engine", "NTA855G7", null]]);
  assert.deepEqual(spec(r[0], "engPower"), ["24.4", "27"]);
  assert.deepEqual([spec(r[0], "cyl"), spec(r[0], "bore"), spec(r[0], "disp"), spec(r[0], "compr")], [["3"], ["91.4X127"], ["2.5"], ["18.5:1"]]);
  assert.deepEqual(spec(r[1], "engPower"), ["391"]);
  assert.deepEqual(r[0].makes.map((m) => [m.name, m.via]), [["Cummins", "dòng bảng"]]);
  assert.ok(notes.some((n) => n.reason === "dòng bảng động cơ sai số ô"), "dòng 9 ô (rác) bỏ, có note");
  assert.equal(C.fromSupplier(sup("ncc-khac", [YT])).length, 0, "NCC khác: đọc như cũ");
});

test("yingtai: số Cummins ghi khác bị bỏ riêng (dropspec theo model), phần còn lại của dòng giữ", () => {
  const notes = [];
  const y = C.fromSupplier(real("yingtai-jiangsu"), notes).filter((o) => o.kind === "engine" && ((o.n === 101 && o.table === 1) || o.n === 2003));
  const m = (k) => y.find((o) => o.model === k);
  assert.deepEqual([spec(m("KTA19G4"), "bore"), spec(m("KTA19G4"), "disp")], [[], ["18.9"]]);
  assert.deepEqual([spec(m("QSL9G5"), "compr"), spec(m("QSL9G5"), "disp")], [[], ["8.8"]]);
  assert.deepEqual([spec(m("QSL9G7"), "disp"), spec(m("QSL9G7"), "compr")], [[], ["16.1:1"]]);
  assert.equal(notes.filter((n) => n.supplierId === "yingtai-jiangsu" && n.reason === "ngoại lệ theo dòng").length, 6);
});

test("hồ sơ thật: huatai n111 17 bản ghi có công suất theo tên; yingtai 56 bản ghi động cơ (n2003 gộp vào n101 qua also)", () => {
  const h = C.fromSupplier(real("huatai-yangzhou")).filter((o) => o.n === 111);
  assert.equal(h.length, 17);
  assert.ok(h.every((o) => o.power?.rated?.kW === +o.genset.replace(/GF$/, "") && spec(o, "engPower").length === 1));
  const y = C.fromSupplier(real("yingtai-jiangsu")).filter((o) => (o.n === 101 && o.table === 1) || o.n === 2003);
  assert.equal(y.length, 56);
  assert.ok(y.every((o) => o.kind === "engine" && o.power === null && o.also?.some((a) => a.n === 2003)));
});
