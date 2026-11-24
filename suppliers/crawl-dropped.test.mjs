// node --test suppliers/*.test.mjs — dòng máy bị cắt khỏi tiêu đề (crawl-dropped, 23/11/2026).
// Dòng dưới hai ô ("| Perkins Series（60HZ）", "|" trống, mảnh dòng bị cắt "| 750") kết thúc một khối của `tablesOf`
// (crawl-specs.mjs); các dòng đứng sau không có tiêu đề riêng, không có chữ kVA / kW nên bị bỏ: 1.661 dòng máy ở tệp
// nguồn của 27 NCC không nằm trong bảng nào. Nay khối như vậy thành MỘT BẢNG RIÊNG, tiêu đề = tiêu đề của khối trước
// cùng dãy + dòng phân đoạn; bảng trước đây đã có thì giữ nguyên từng dòng.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tablesOf } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const read = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), "utf8"));
const source = (id, n) => fs.readFileSync(path.join(ROOT, "sources", id, `${n}.md`), "utf8");

const T0 = "| Model | Standby KVA | Prime KVA | Standby KW | Prime KW | Engine | Specifications";
const A = ["| LSP10S | 10 | 9 | 8 | 7 | 403D-11G | PDF", "| LSP14S | 14 | 13 | 11 | 10 | 403D-15G | PDF"];
const B = ["| LSP10S3-E | 10 | 9 | 8 | 7 | 403D-11G | PDF", "| LSP22S3 | 22 | 20 | 18 | 16 | 404D-22G | PDF"];
const D = ["| LSP33S3 | 33 | 30 | 26 | 24 | 1103A-33G | PDF", "| LSP50S3 | 50 | 45 | 40 | 36 | 1103A-33TG1 | PDF"];

test("dòng phân đoạn một ô: các dòng sau nó là bảng riêng, tiêu đề = tiêu đề khối trước + dòng phân đoạn", () => {
  const t = tablesOf(["text", T0, "| Single phase", ...A, "| Three phase", ...B, "more text"].join("\n"));
  assert.deepEqual(t, [{ header: [T0, "| Single phase"], rows: A }, { header: [T0, "| Three phase"], rows: B }]);
});

test("bảng đã có giữ nguyên; phần sau dòng phân đoạn là bảng riêng xếp cuối, không nối vào bảng trước", () => {
  const first = { header: [T0], rows: A };
  assert.deepEqual(tablesOf([T0, ...A].join("\n")), [first]);
  assert.deepEqual(tablesOf([T0, ...A, "| Three phase", ...B].join("\n")), [first, { header: [T0, "| Three phase"], rows: B }]);
});

test("dòng '|' trống hoặc mảnh dòng bị cắt: các dòng sau vẫn dưới dòng phân đoạn cũ, mảnh không được ghép lại", () => {
  const t = tablesOf([T0, "| 60HZ series", ...A, "| LSP20S | 20", "| 18", "| 16 | 14 | 404D-22G", ...B, "|", ...D].join("\n"));
  assert.deepEqual(t.map((x) => x.header), [[T0, "| 60HZ series"], [T0, "| 60HZ series"], [T0, "| 60HZ series"]]);
  assert.deepEqual(t.map((x) => x.rows), [A, B, D]);
  assert.ok(!JSON.stringify(t).includes("LSP20S"), "dòng bị cắt giữa ô không được dựng lại");
});

test("mảnh chữ của dòng bị cắt ('| Electric', '| JET634C' cạnh mảnh số) không thành dòng phân đoạn", () => {
  const t = tablesOf([T0, ...A, "| LSP20S | 20", "| Electric", "| 25.18", "| JET634C", ...B].join("\n"));
  assert.deepEqual(t[1], { header: [T0], rows: B });
});

test("khối sau không mở bằng dòng mã máy, có tiêu đề riêng, khác số ô, hoặc sau dòng không '|': vẫn bị bỏ như trước", () => {
  const one = [{ header: [T0], rows: A }];
  assert.deepEqual(tablesOf([T0, ...A, "|", "| Length (mm) | 2240 | 2700 | 3000", "| Width (mm) | 900 | 1020 | 1100"].join("\n")), one);
  assert.deepEqual(tablesOf([T0, ...A, "|", "| Type | Length | Width | Height", "| X1 | 2240 | 900 | 1400", "| X2 | 2700 | 1020 | 1530"].join("\n")), one);
  assert.deepEqual(tablesOf([T0, ...A, "|", "| LSP33S3 | 33 | 30 | 1103A-33G", "| LSP50S3 | 50 | 45 | 1103A-33TG1"].join("\n")), one);
  assert.deepEqual(tablesOf([T0, ...A, "NR2", ...B].join("\n")), one);
});

test("tiêu đề chỉ chữ Hán có 额定功率 được nhận; 功率因数 và 备用电源 thì không", () => {
  const rows = ["| HY500GF | TBD604BL6 | 500 | 450 | 4470 | 1505 | 2156 | 5500", "| HY550GF | TBD604BL6 | 550 | 500 | 4470 | 1505 | 2156 | 5800"];
  const head = ["| 机组型号 | 柴油机型号 | 额定功率 | 外形尺寸 (mm) | 净重 （Kg）", "| 备用 | 常用"];
  assert.deepEqual(tablesOf([...head, ...rows].join("\n")), [{ header: head, rows }]);
  assert.deepEqual(tablesOf(["| 类型 | 智能型 | 电机 | 自选", "| 稳态电压偏差 | 0.005 | 功率因数 | 0.8", "| 电压降 | 1 | 稳定时间 | 1.0"].join("\n")), []);
  assert.deepEqual(tablesOf(["| 型号 | 用途 | 转速 | 净重", "| 发电机组 | 备用电源 | 1500 | 5500", "| 发电机组 | 常用电源 | 1800 | 5800"].join("\n")), []);
});

test("tệp nguồn thật: bảng theo dòng phân đoạn của awt-aiweite, lees-power, longkai-power, huayuan-weifang", () => {
  const sect = (id, n) => tablesOf(source(id, n)).map((t) => [t.header[t.header.length - 1], t.rows.length]);
  assert.deepEqual(sect("awt-aiweite", 101).slice(-2), [["| Perkins Series（50HZ）", 64], ["| Perkins Series（60HZ）", 62]]);
  assert.deepEqual(sect("lees-power", 111).slice(-2), [["| Single phase", 5], ["| Three phase", 16]]);
  // hai khối cùng dưới một dòng phân đoạn (giữa chúng là một dòng bị cắt): cả hai mang dòng đó
  assert.deepEqual(sect("longkai-power", 126).slice(-2), [["| Weichai Series--Baudouin Engine", 41], ["| Weichai Series--Baudouin Engine", 27]]);
  const hy = tablesOf(source("huayuan-weifang", 113)).find((t) => t.rows[0].startsWith("| HY500GF"));
  assert.equal(hy.rows.length, 6);
  // trang một model của tecgen-fujian: bảng "nhãn | giá trị" (sheet) vẫn như trước, không thêm bảng kích thước
  const tg = tablesOf(source("tecgen-fujian", 101));
  assert.equal(tg.length, 1);
  assert.equal(tg[0].sheet, true);
});

test("hồ sơ: mọi bảng tablesOf đọc ra từ tệp nguồn của 15 NCC đã dựng lại đều có trong cn/ (trừ bảng trùng nguyên dòng)", () => {
  const ids = ["aosif", "awt-aiweite", "camda-generator", "huayuan-weifang", "jet-power", "jianghao-genset", "kangwo-guangdong", "lees-power", "longkai-power", "mecca-power", "previa-ningde", "sanq-power", "shengfeng-fuan", "taihai-taizhou", "walter-yangzhou"];
  const pages = { "awt-aiweite": [101, 102, 103, 104, 105], "lees-power": [111, 112, 127, 131], "longkai-power": [103, 121, 122, 126], "previa-ningde": [102, 105, 109, 110], "jianghao-genset": [109, 110, 111], "walter-yangzhou": [115, 116], "mecca-power": [101, 136], "kangwo-guangdong": [105, 106], aosif: [104], "camda-generator": [139], "huayuan-weifang": [113], "jet-power": [136], "sanq-power": [123], "shengfeng-fuan": [108], "taihai-taizhou": [106] };
  assert.deepEqual(Object.keys(pages).sort(), ids);
  let cut = 0;
  for (const id of ids) {
    const rec = read("cn", `${id}.json`), have = new Set(rec.specTables.map((t) => t.rows.join("\n"))), lines = new Set(rec.specTables.flatMap((t) => [...t.header, ...t.rows]));
    for (const n of pages[id]) for (const t of tablesOf(source(id, n)).filter((t) => t.header.length && !rec.specTables.some((x) => x.n === n && x.header.join("\n") === t.header.join("\n") && x.rows.join("\n") === t.rows.join("\n")))) {
      assert.ok(have.has(t.rows.join("\n")), `${id} n${n}: bảng "${t.rows[0]}" chưa có trong cn/`);
      cut++;
    }
    for (const n of pages[id]) for (const t of tablesOf(source(id, n))) for (const l of [...t.header, ...t.rows]) assert.ok(lines.has(l) || t.sheet, `${id} n${n}: dòng chưa có trong cn/: ${l}`);
  }
  assert.equal(cut, 2, "chỉ hai bảng 'Single phase' của lees-power n127 / n131 trùng nguyên dòng với bảng n112 / n111");
});

test("catalog: dòng phân đoạn cho tần số và hãng của bảng (awt-aiweite 60HZ, aosif Hyundai)", () => {
  const awt = C.fromSupplier(read("cn", "awt-aiweite.json"), []);
  const p10 = awt.find((r) => r.genset === "AWT-P10" && r.model === "403F-11G");
  assert.equal(p10.freq, 60);
  assert.deepEqual(p10.power, { prime: { kW: 9, kVA: 11 }, standby: { kW: 9.9, kVA: 12 } });
  assert.deepEqual(p10.makes.map((m) => m.name), ["Perkins"]);
  const p8 = awt.find((r) => r.genset === "AWT-P8" && r.model === "403D-11G");
  assert.equal(p8.freq, 50);
  // 562 trước #1087; nay 566: `ENGINE_CELL_LIST` (ma-dong-co-trung PR 2) tách bốn ô động cơ ghi hai mã ("1206J-E70TTAG3/4",
  // "2206C-E13TAG2/3", "2506C-E15TAG1/2", "2806A-E18TTAG4/5" của AWT-P175 / P350 / P450 / P710) thành mỗi mã một bản ghi:
  // +4 bản ghi động cơ, 0 mất. Số bản ghi của bảng đọc lại do #1105 không đổi.
  assert.equal(awt.length, 566);
  const ao = C.fromSupplier(read("cn", "aosif.json"), []).find((r) => r.genset === "AD33" && r.model === "DP023CAV");
  assert.deepEqual(ao.makes.map((m) => m.name), ["Hyundai"]);
  assert.deepEqual(ao.power, { prime: { kVA: 30, kW: 24 }, standby: { kVA: 33, kW: 26 } });
});
