// node --test suppliers/lech-cot-11.test.mjs — các dòng bị đọc lệch mà cổng kiểm theo dòng (row-flags, chat-luong-1) tìm ra
// (lech-cot-11, Khoa duyệt 18/11/2026 "sửa 45 dòng do mã đọc lệch"). Dòng thật ở suppliers/cn; mỗi ca nói rõ bảng nào.
// Nguồn tự ghi sai mà đọc đúng ô (nhóm B) KHÔNG đụng ở đây.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(ROOT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const sup = (header, rows, { title = "", role = "genset_oem", n = 101, id = "t" } = {}) => ({ id, role, country: "CN", names: { en: "Test" }, specTables: [{ n, title, header, rows }] });
const read = (header, rows, o) => { const notes = []; const out = C.fromSupplier(sup(header, rows, o), notes); return { out, notes }; };
import fs from "node:fs";
// A real table of suppliers/cn found by its source number and a text of one of its rows (the table index shifts when the bot adds tables).
const real = (id, n, has) => { const s = JSON.parse(fs.readFileSync(path.join(ROOT, "suppliers", "cn", id + ".json"), "utf8")); const t = s.specTables.find((x) => x.n === n && x.rows.some((r) => r.includes(has))); assert.ok(t, `${id} n${n} / ${has}`); return { ...s, specTables: [t] }; };
const readReal = (...a) => { const notes = []; const out = C.fromSupplier(real(...a), notes); return { out, notes }; };
const spec = (u, k) => u?.specs.find((s) => s.key === k)?.value;
const eng = (out, m) => out.find((u) => u.kind === "engine" && (!m || u.model === m));
const alt = (out, m) => out.find((u) => u.kind === "alternator" && (!m || u.model === m));

const YT113 = ["| 机组型号 | 功率（KW） | 额定电压 | 电流 | 净重 | 机组外形尺寸 | 发动机型号 | 品牌 | 功率（KW） | 缸数 | 排气量 | 燃油耗 | 调速方式", "| 主用 | 备用 | V | A | （kg) | L×W×H(m) | 主用 | 备用 | （L) | (g/kW.h)"];
test("yingtai-jiangsu n113 (6,3 kV): the row has no voltage cell, so the standby 1100 / 1300 kW under 额定电压 is no voltage; the current 114.3 stays", () => {
  const { out, notes } = read(YT113, ["| 1000GF | 1000 | 1100 | 114.3 | 11330 | 6.40×2.04×2.64 | KTA50-G3 | 1097 | 1227 | 16 | 50.3 | ≤209 | 电子", "| 1100GF | 1100 | 1300 | 125.7 | 11350 | 6.40×2.04×2.70 | KTA50-G8 | 1200 | 1429 | 16 | 50.3 | ≤206 | 电子"], { n: 113 });
  for (const m of ["KTA50-G3", "KTA50-G8"]) { assert.equal(spec(eng(out, m), "voltage"), undefined); assert.ok(spec(eng(out, m), "current")); }
  assert.equal(spec(eng(out, "KTA50-G3"), "current"), "114.3");
  assert.equal(notes.filter((x) => x.reason === "điện áp trùng công suất của dòng").length, 2);
});

test("a 400 V next to a 400 kW stays a voltage (chuangyuan: the standard mains voltage is no output by chance)", () => {
  const { out } = read(["| 机组型号 | 主用功率（KW） | 额定电压（V） | 发动机型号"], ["| 400GF | 400 | 400 | 6M33D506E310"]);
  assert.equal(spec(eng(out), "voltage"), "400");
});

const YT111 = ["| 机组型号 Genset Model | 主用功率（主用） | 备用功率（备用） | 电流（主用）Power(A) | 电流（备用）Power(A) | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m) | 品牌 Brand | 发 动 机型号 Engine Type | 主要功 率 power()KW", "| KW | KVA | KW | KVA"];
const YT111_ROW = "| 64GF | 64 | 75 | 88 | 88 | 115.2 | 126.7 | 1180 | 1.9*0.9*1.4 | WP4.1D80E200 | 72";
test("yingtai-jiangsu n111: 88 | 88 is one kVA / kW pair, the walk steps over it, so 1180 is the weight and 115.2 the current", () => {
  const { out } = read(YT111, [YT111_ROW]);
  assert.equal(spec(eng(out), "weight"), "1180");
  assert.equal(spec(eng(out), "dims"), "1.9*0.9*1.4");
});
test("yingtai-jiangsu n111, the copy of the table with no unit line (n2005): no power read, so nothing after the power titles is placed (115.2 A was the weight)", () => {
  const { out, notes } = read(YT111.slice(0, 1), [YT111_ROW]);
  assert.equal(spec(eng(out), "weight"), undefined);
  assert.equal(spec(eng(out), "dims"), undefined);
  assert.equal(notes.length, 0);
});

test("yanfa-yancheng n107: 'Max. power' of the lower header line over 1345 / 2730: the line lies off the row, the fuel 2.5 / 58.8 L/h is no displacement", () => {
  const H = ["| 发电机组型号 Generator Model | 备用功率 Reserve Power | 常用功率 Normal power | 发动机型谱 Engine Spectrum | 燃油消耗 Fuel Consumption L/h | 外形尺寸(mm) Dimensions | 净重(kg) Net Weight", "| KW | KVA | KW | KVA | 型号 Model | 排量 NDisplaement(L) | 最大功率 Max. power(kw) | L | W | H"];
  const { out } = read(H, ["| YC-8.8GF | 8.8 | 11 | 8 | 10 | X1.3-G2 | 1.3 | 11.5 | 2.5 | 1345 | 650 | 1050 | 495", "| YC-200GF | 200 | 250 | 180 | 225 | QSL9-G2 | 9 | 231 | 58.8 | 2730 | 1160 | 1680 | 3150"], { n: 107 });
  assert.equal(spec(eng(out, "X1.3-G2"), "disp"), undefined);
  assert.equal(spec(eng(out, "QSL9-G2"), "disp"), undefined);
});

test("victory-generator n110: a lower header line that reaches the right edge keeps its weight and dimensions (no 'Max power' title, no loss)", () => {
  const H = ["| Model | Frequency | Prime Power | Standby Power | Engine Model | Full-Load Diesel Consumption (L/H) | Displacement (L) | Cylinders & arrangement | Governor Type | Open Type | Silent Type", "| HZ | kW | kVA | kW | kVA | Dimension L*W*H (mm) | Weight (KG) | Dimension L*W*H (mm) | Weight (KG)"];
  const { out } = read(H, ["| V18C | 50 | 16 | 20 | 18 | 22 | 4B3.9-G11 | 5.7 | 3.9 | 4L | mechanical | 1750*970*1500 | 930 | 2250*1080*1255 | 1150"], { n: 110 });
  assert.equal(spec(eng(out), "weight"), "930");
  assert.equal(spec(eng(out), "dims"), "1750*970*1500");
});

const CGM_H = ["| M/E Engine governor | EU Emission standard | consumo ¾ caricoconsumption 3/4 loadconsommation 3/4 charge", "| OPEN BASE FRAME | SOUNDPROOF CANOPY | dB(A) at 7 mt", "| [kVA] | [kW]", "| lt/hr | lt", "| Model | kg", "| LxLWxH [mm] | Model", "| kg | LxLWxH [mm]", "| dB(A) | Model"];
test("cgm-italia n1001: the 'kg' / 'dB(A)' of a pile of header lines over the engine cell and the standby kW (39,6 / 52,8) is no weight and no noise level", () => {
  const { out } = read(CGM_H, ["| 45P | 45 | 36 | 49,5 | 39,6 | 1103A-33TG1", "| 60P | 60 | 48 | 66 | 52,8 | 1103A-33TG2"], { n: 1001 });
  for (const m of ["1103A-33TG1", "1103A-33TG2"]) { assert.equal(spec(eng(out, m), "weight"), undefined); assert.equal(spec(eng(out, m), "noise"), undefined); }
});

test("a weight or a noise level equal to one of the row's own outputs: kept in its own column right of the engine", () => {
  const H = ["| Model | Standby kW | Standby kVA | Engine Model | Weight (kg) | Noise dB(A)"];
  // 80 again in a column of its own (right of the engine): that is the cell of the title (cgm-italia e63B noise 69).
  const a = read(H, ["| G100 | 80 | 100 | 6BTA5.9-G2 | 80 | 80"]);
  assert.equal(spec(eng(a.out), "noise"), "80");
  // The figure only among the power cells (cgm n1001 "kg" 39,6 = standby kW) is covered by the real-row test above.
  const b = read(H, ["| G100 | 80 | 100 | 6BTA5.9-G2 | 1450 | 75"]);
  assert.equal(spec(eng(b.out), "weight"), "1450");
});

test("hosem-power n1001: 'Circuit Breaker Rated Current (A)' is the breaker's rating, not the set's current", () => {
  const { out } = read([], ["Voltage: 400/230V", "Frequency: 50Hz", "| Standby Power (ESP) | kVA | 2000.0", "| Engine Model | 4016TAG1A", "| Circuit Breaker Rated Current (A) | 3200", "| Rated Current (A) | 2887"], { title: "Datasheet: Download" });
  assert.equal(spec(eng(out), "current"), "2887");
});

test("aosif n1065: 'Maximum Over Speed' (2250 RPM) is no rated speed; xinhengxin 'Motor Size' (190*130) is the engine's size, no genset dimensions", () => {
  const a = readReal("aosif", 1065, "Maximum Over Speed");
  assert.ok(eng(a.out, "KTA50-G16B"));
  assert.equal(spec(eng(a.out, "KTA50-G16B"), "speed"), undefined);
  const b = readReal("xinhengxin-fujian", 101, "Motor Size");
  assert.ok(b.out.length > 0);
  assert.ok(b.out.every((u) => spec(u, "dims") === undefined));
});

test("mwm n1028: '3,333' kW is 3333 (comma and three digits: thousands); a sheet that writes decimal commas leaves it out and notes it", () => {
  const a = readReal("mwm", 1028, "| Electrical power3) | kW | 3,333 |");
  assert.deepEqual(eng(a.out, "TCG 2032").power, { rated: { kW: 3333 } });
  // the same sheet with a decimal-comma line added: the thousands reading is off, the figure is left out and noted
  const s = real("mwm", 1028, "| Electrical power3) | kW | 3,333 |");
  s.specTables[0] = { ...s.specTables[0], rows: [...s.specTables[0].rows, "| Fuel | l/h | 3,51"] };
  const notes = [];
  const out = C.fromSupplier(s, notes);
  assert.equal(eng(out, "TCG 2032").power, null);
  assert.ok(notes.some((x) => /dấu phẩy/.test(x.reason)));
});

test("zhengdian-zhengzhou n101: the OCR current '5 9/54' is no number, left out; the other figures of the row stay", () => {
  const H = ["| | 机组型号 | 机组功率（ kw ） | 电流A | 柴油机型号 | 柴油机功 率 KW | 缸 数 | 缸径 mm | 行程 mm | 排气量 L | 压缩比 | 机油 容量 L | 燃油消耗率 g/KW.h | 机组重量 kg | 机组外型尺寸 mm×mm×mm", "| 备用 | 额定"];
  const { out } = read(H, ["| 3 0GF | 33 | 30 | 5 9/54 | 4BT3.9-G1 | 40 /36 | 4 | 102 | 120 | 3.9 | 16.5:1 | 11 | 214 | 900 | 18 00×780×1230"]);
  assert.equal(spec(eng(out), "current"), undefined);
  assert.equal(spec(eng(out), "weight"), "900");
});

test("yongcai-elecmama n172: a page listing engines one after the other gives each its own lines (the last one's 18.8 kW and 2350 rpm were the first's)", () => {
  const rows = ["Engine model : QC380D", "Rated power ( KW/rpm ) : 10/1500 12/1800", "Engine model : QC385D", "Rated power ( KW/rpm ) : 11/1500 13/1800", "Engine model : QC480D", "Rated power ( KW/rpm ) : 14/1500 17/1800", "Frequency : 50Hz or 60Hz", "Engine model : QC385BT", "Rated output : 18.8 KW", "Engine speed : 2350 rpm"];
  const { out } = read([], rows, { title: "Quanchai Diesel Engine | Yangzhou Yongcai Machinery Co., Ltd." });
  assert.deepEqual(out.map((u) => u.model), ["QC380D", "QC385D", "QC480D", "QC385BT"]);
  assert.equal(eng(out, "QC380D").power, null);
  assert.equal(spec(eng(out, "QC380D"), "engPower"), "10/1500 12/1800");
  assert.deepEqual(eng(out, "QC385BT").power, { rated: { kW: 18.8 } });
});

test("a page whose headline names the engine and whose table names it again (mingbang '4B3.9-G2' / '4B3.9-G12') is one engine, not split", () => {
  const rows = ["Engine Model: Cummins 4B3.9-G2", "| Generator Model | MB-C30", "| Prime Power | 30KW/37.5KVA", "| Engine Model | 4B3.9-G12", "| Displacement | 3.92L", "| Engine Structure | 4 Cylinder-in-line"];
  const { out } = read([], rows);
  assert.equal(out.filter((u) => u.kind === "engine").length, 1);
  assert.equal(spec(eng(out), "disp"), "3.92L");
});

test("keypower: sheets that END each genset with its 'Engine Model' line are read as before (the first genset's figures with the first engine)", () => {
  const rows = ["Frequency: 50Hz", "Model: KP-YC1125P", "Prime Power (kW/kVA): 900/1125", "Engine Model: YC6C1520-D31", "Protection grade: IP23", "Model: KP-YC22P", "Prime Power (kW/kVA): 17.6/22", "Engine Model: YC4V35-D20", "Protection grade: IP23", "Model: KP-YC40P", "Prime Power (kW/kVA): 32/40", "Engine Model: YC4D60-D25"];
  const { out } = read([], rows);
  assert.equal(eng(out).model, "YC6C1520-D31");
  assert.equal(out.length, 1);
});

test("hosem-power n134: a page with two engines of different families (DP158LD, QSZ13-G3) leaves the engine size lines out (the '6 Cylinder In Line' is the QSZ13's)", () => {
  const rows = ["| Prime Output | 450kVA", "| Engine Model | DP158LD", "| Engine Prime Power | 464kW At 1500RPM", "| Cylinders | 6 Cylinder In Line", "| Engine Model | QSZ13-G3", "| Prime Output | 500kVA", "| Frequency | 50/60Hz", "| Current | 721.7A"];
  const { out, notes } = read([], rows);
  assert.equal(spec(eng(out, "DP158LD"), "cyl"), undefined);
  assert.equal(spec(eng(out, "DP158LD"), "engPower"), "464kW At 1500RPM");
  assert.ok(notes.some((x) => /hai động cơ/.test(x.reason)));
});

test("acepow n123: the same engine named twice ('AP292F') plus a tail of related engines keeps the page's displacement", () => {
  const { out } = readReal("acepow-fuan", 123, "Displacement [L]");
  assert.equal(spec(eng(out, "AP292F"), "disp"), "0.997");
});

const EL_H = ["| | | Power range | models | Engine | Alternator | Controller |"];
test("eastern-lion-fuan n109: 'Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K' is a family of 40 models over a range, no engine or alternator record", () => {
  const { out, notes } = read(EL_H, ["| Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K | Smartgen 6120 | View details →", "| Engine By Perkins Series | 7.2 – 2000 kW | 54 | 403A-15G1 | EL 224G | Smartgen 6120 | View details →"]);
  assert.equal(out.length, 0);
  assert.equal(notes.filter((x) => /dải công suất/.test(x.reason)).length, 2);
});
test("a table of one genset per row with a 'Power range' column title but no range cell is read as before", () => {
  const { out } = read(["| Model | Power range | Engine model | Alternator"], ["| G100 | 80 kW | 6BTA5.9-G2 | UCI274C"]);
  assert.ok(eng(out));
});

test("green-power-generators n108: the one code of the row under 'MOTORE ENGINE' is a Doosan P086TI / P126TI II / P158LE, an engine and no alternator", () => {
  const H = ["| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | SERBATOIO TANK | DIMENSIONI DIMENSIONS | PESO WEIGHT | DOWNLOAD", "| kVA - 50 Hz | MODELLO MODEL | REG | CIL. | CONSUMO AL 75% PRP CONSUMPTION AT 75% PRP | Lu | La | A | LEROY SOMER | LINZ | MECC ALTE | STAMFORD", "| PRP | ESP | N. | L/h | L | mm | mm | mm | kg"];
  const { out } = read(H, ["| GP220 A/H | O | 200 | 210 | P086TI | E | 6 | 31.7 | 140 | 2850 | 1000 | 1400 | 1650 | | | |", "| GP330 A/H | O | 300 | 330 | P126TI II | E | 6 | 45.7 | 210 | 3000 | 1100 | 1650 | 1750 | | | |", "| GP440 A/H | O | 400 | 440 | P158LE | E | 8 | 65.1 | 290 | 3200 | 1300 | 1900 | 2340 | | | |"], { n: 108 });
  assert.deepEqual(out.map((u) => [u.kind, u.model]), [["engine", "P086TI"], ["engine", "P126TI II"], ["engine", "P158LE"]]);
});

test("uleengen n5001 / kaichen n5001: 'Engine model | Alternator' with P086TI and 274G: the Doosan is the engine, 274G the alternator", () => {
  const { out } = read(["| Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator"], ["| UD150GF | 150 | 188 | 170 | 213 | P086TI | 274G", "| UD160GF | 160 | 200 | 176 | 220 | P086TI |"], { n: 5001 });
  assert.deepEqual(out.map((u) => [u.kind, u.model, u.genset]), [["engine", "P086TI", "UD150GF"], ["alternator", "274G", "UD150GF"], ["engine", "P086TI", "UD160GF"]]);
});

test("uleengen n136: a garbled engine cell ('380码') leaves the alternator '164B' as the alternator, not the engine; a clean engine row is unchanged", () => {
  const H = ["| 发电机组型号 | 50HZ | 柴油发动机 | 交流发电机 | 整体尺寸静音型（mm） | 毛重（kg）", "| 功率（kW） | 功率（kVA） | 模型 | 额定功率（kW） | 气缸数量 | 孔径x行程（mm） | 排量（L） | 额定燃油消耗量（L/h） | 模型"];
  const { out } = read(H, ["| UY10GFS | 8 | 10 | 380码 | 10 | 3 | 80*90 | 1.357 | 1.9 | 164B | 1860x850x1200 | 700", "| UY20GFS | 16 | 20 | YSD490D | 21 | 4 | 90*100 | 2.54 | 3.7 | 164D | 2200x950x1200 | 800"], { n: 136 });
  assert.deepEqual(out.filter((u) => u.genset === "UY10GFS").map((u) => [u.kind, u.model]), [["alternator", "164B"]]);
  assert.deepEqual(out.filter((u) => u.genset === "UY20GFS").map((u) => [u.kind, u.model]), [["engine", "YSD490D"], ["alternator", "164D"]]);
});

test("engine codes of the same shape as an alternator frame but not frame numbers ('380D', '490D') stay engines under an alternator column", () => {
  const { out } = read(["| Model | kW | kVA | Engine | Alternator"], ["| UY20GFS | 16 | 20 | 490D | 164D"]);
  assert.equal(eng(out)?.model, "490D");
  assert.equal(alt(out)?.model, "164D");
});

// Phản biện của điều phối (PR #926): ba giá trị ĐÚNG đã bị bỏ nhầm.
test("cgm-italia n101 e63B: the noise 69 dB(A) sits in its own column right of the engine, so it stays although 69 is also the standby kVA; n1001 (the figure only among the power cells) is still left out", () => {
  const { out } = readReal("cgm-italia", 101, "| e63B |");
  assert.equal(spec(eng(out, "4M10G2D3/5"), "noise"), "69");
  const o = readReal("cgm-italia", 1001, "| 60DZa |").out;
  assert.equal(spec(eng(o, "F6L 912"), "noise"), undefined);
  assert.equal(spec(eng(o, "F6L 912"), "weight"), undefined);
});

test("rise-power n120 RDL560-60: a row one cell short at the end keeps the open-type size 3420×1390×1840 like its neighbours (it was the sound-proof size read once, or nothing)", () => {
  const { out } = readReal("rise-power", 120, "| RDL560-60 |");
  const e = out.find((u) => u.kind === "engine" && u.genset === "RDL560-60"), a = out.find((u) => u.kind === "alternator" && u.genset === "RDL560-60");
  assert.equal(spec(e, "dims"), "3420×1390×1840");
  assert.equal(spec(e, "weight"), "4200");
  assert.equal(spec(a, "dims"), "3420×1390×1840");
});

test("sanq-power n110 SQD385: three walks from known cells agree on the open-type weight 3120; the walk from the right edge (one cell off in a row wider than the header) does not overrule them", () => {
  const { out } = readReal("sanq-power", 110, "| SQD385 |");
  assert.equal(spec(eng(out, "P158LE-1"), "weight"), "3120");
  assert.equal(spec(eng(out, "P158LE-1"), "fuel"), "72");
  const first = readReal("sanq-power", 110, "| SQD165 |").out;
  assert.equal(spec(eng(first, "DP086TA"), "weight"), "1420");
});

test("walks from the engine, the alternator and the genset model that agree on the weight cell: kept; no walk from a known cell: still left out", () => {
  const H = ["| Model | Engine | Alternator | Weight | Dimension"];
  const { out } = read(H, ["| G100 | 6BTA5.9-G2 | UCI274C | 900 | 1800 | 2200x900x1200"]);
  assert.equal(spec(eng(out), "weight"), "900");
});

// Điều phối 18/11/2026: dòng depco P158LE ghi "Frequency(Hz): 50" mà `freqIn` không đọc nên bị luật tần số của `candidates` loại.
test("depco-power n2182 (bảng nhãn xếp dọc 'Frequency(Hz):' / '50'): bản ghi mang tần số 50; n2101 (tiêu đề 60Hz) vẫn 60", () => {
  const { out } = readReal("depco-power", 2182, "DPK-DD-440");
  assert.equal(eng(out, "P158LE")?.freq, 50);
  const o = readReal("depco-power", 2101, "P158LE").out;
  assert.equal(eng(o, "P158LE")?.freq, 60);
});

test("a frequency label next to one figure gives the frequency; 50 / 60 together, a figure far from the label or a % gives none", () => {
  const L = (rows) => { const { out } = read([], ["| Standby Power (ESP) | kVA | 100", "| Engine Model | P158LE", ...rows], { title: "Datasheet: Download" }); return eng(out)?.freq ?? null; };
  assert.equal(L(["Frequency(Hz): 50"]), 50);
  assert.equal(L(["| Frequency (Hz) | 60 | Speed ( rpm ) | 1800"]), 60);
  assert.equal(L(["频率(Hz) | 50"]), 50);
  assert.equal(L(["Frequency | 50Hz/60Hz"]), null);
  assert.equal(L(["Frequency | 50 | 60"]), null);
  assert.equal(L(["Frequency regulation | 0.5 % | Voltage | 50"]), null);
  assert.equal(L(["Frequency | 50 Hz or 60 Hz"]), null);
});
