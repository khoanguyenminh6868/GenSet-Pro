// node --test web/test/spec-norm.test.mjs — lớp chuẩn hoá thông số web/spec-norm.js (việc chuan-hoa-2, 14/11/2026).
// Mỗi ca là một nhãn + ô giá trị thật trong suppliers/cn/*.json (NCC ghi trong ngoặc), kể cả ca phải ra `missing`:
// đơn vị / điều kiện chỉ đọc từ chữ có trong nguồn, không đoán theo độ lớn con số.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(WEB, "conversions.js")).href);
await import(pathToFileURL(path.join(WEB, "spec-norm.js")).href);
const SN = globalThis.GenbidSpecNorm;

// Header of agestar "FAWDE generator set": titles span columns, the units sit on a third line.
const AGESTAR = ["| Model | Specification 50HZ 400-230V | General specifications | Alternator | Dimensions | Weight", "| ESP | PRP | Engine type | Consumption 100% | Gov | MODEL", "| KVA | KW | KVA | KW | L/H | mm | kg"];
// Header of aosif "CCEC Series(50HZ)": a second line of units under each title.
const AOSIF = ["| Prime Power | Standby Power | Engine Model | Fuel Consumption | Cylinder | Displacement", "| KVA/KW | KVA/KW | | L/h | |"];
// cgm-italia datasheet: the noise column title names the distance.
const CGM = ["| M/E Engine governor | EU Emission standard | consumo ¾ caricoconsumption 3/4 loadconsommation 3/4 charge", "| OPEN BASE FRAME | SOUNDPROOF CANOPY | dB(A) at 7 mt"];
// Rows of himoinsa-china "12.5 kVA ... HYW-13 T5 Soundproof" (n114) and "7.9 kVA ... HSY-10 M6" (n142): decimal commas.
const HIMOINSA_13 = ["Rated Engine Output: 12,2kW prp ; 13,2kW standby", "Displacement: 1,642 L", "Fuel Consumption ESP: 3,51 l/h", "Fuel Consumption 100% PRP: 3,19 l/h"];
const HIMOINSA_10 = ["Displacement: 1,116 L", "Fuel Consumption ESP: 3,767 l/h", "Fuel Consumption 100% PRP: 2,80 l/h", "Fuel Consumption 75 % PRP: 2,21 l/h", "Fuel Consumption 50 % PRP: 1,74 l/h"];
// One "(mm)" unit cell under two titles that could take it (bore and size): the unit belongs to neither as the source
// writes it. haifeng-taizhou n2001 (vantek-jiangsu n104 / n108 have the same header).
const HAIFENG = ["| 机组型号 | 常用功率 | 发动机型号 | 缸数 | 缸径/行程 | 燃油消耗量 | 外形尺寸 | 重量", "| KVA | KW | (mm) | (g/kw.h) | (L×W×H) (mm) | (kg)"];
// jet-power n134 "FAWDE Water Cooled Diesel Generator": "(MM)" once, but "(L x W x H)" titles could take mm too.
const JET = ["| Model | 400V / 50Hz / 1500RPM | FAWDE Diesel Engine | Alternator | Open type | Soundproof type", "| Standby | Prime | Model | Engine type | Displacement | Bore×Stroke | JET POWER BRAND | Packing (mm) | Weight | Packing (mm) | Weight", "| KVA | KW | KVA | KW | No. of Cylinder | Governor | (L) | (MM) | BRUSHLESS TYPE | (L x W x H) | Kg | (L x W x H) | Kg"];

// [key, label, value, ctx, expected subset] — expected.missing is compared as a set, other fields deep-equal.
const CASES = [
  // fuel
  ["fuel", "燃油消耗 (g/kw.h)", "≤210", null, { unit: "g/kWh", op: "≤", num: 210, missing: ["load"] }], // bdadl-shanghai
  ["fuel", "Fuel Cons.", "192", null, { unit: null, num: 192, missing: ["unit", "load"] }], // jet-power: no unit, no load written
  ["fuel", "Fuel Consumption ESP", "3,51 l/h", null, { unit: "L/h", num: 3.51, cond: { rating: "standby" }, missing: ["load"] }], // himoinsa-china
  ["fuel", "Fuel consumption (L/h) 100%", "2.67", null, { unit: "L/h", num: 2.67, cond: { load: 100 }, missing: [] }], // excel-power-ningde
  ["fuel", "Fuel Consumption @Prime Power (L/H)", "127", null, { unit: "L/h", num: 127, cond: { load: 100, rating: "prime" }, missing: [] }], // victory-generator
  ["fuel", "燃气消耗量 (m3/kwh)", "≤0.33", null, { unit: "m³/kWh", op: "≤", num: 0.33, missing: ["load"] }], // taihai-taizhou (gas)
  ["fuel", "Consumption 100%", "5.5", { header: AGESTAR }, { unit: "L/h", num: 5.5, cond: { load: 100, headerUnit: "L/H" }, missing: [] }], // agestar
  ["fuel", "Fuel Consumption", "254", { header: AOSIF }, { unit: "L/h", num: 254, cond: { headerUnit: "L/h" }, missing: ["load"] }], // aosif
  ["fuel", "Fuel consumption @25/50/75/100% load", "8.25/13.2/18.7/24.6", null, { num: 24.6, cond: { load: 100 }, missing: ["unit"] }], // hyundai-power-products
  ["fuel", "最低燃油耗（g/kW.h）", "198", null, { unit: "g/kWh", num: 198, cond: { minimum: true }, missing: ["load"] }], // wudong-wuxi
  ["fuel", "Gas consumption（Nm³/hr）", "234.31", null, { unit: "Nm³/h", num: 234.31, missing: ["load"] }], // googol: Nm³ kept apart from m³
  ["fuel", "燃油消耗率(lir/hr)","88", null, { unit: null, num: 88, missing: ["unit", "load"] }], // fukangsi-yangzhou n2010: misspelt unit is not read
  ["fuel", "Cons 100% ( L/H )", "180/225", null,{ unit: "L/h", options: [180, 225], cond: { load: 100 }, missing: ["ambiguous"] }], // wintpower
  // fuel75
  ["fuel75", "Fuel Consumption 75 % PRP", "2,50 l/h", null, { unit: "L/h", num: 2.5, cond: { load: 75, rating: "prime" }, missing: [] }], // himoinsa-china
  ["fuel75", "Fuel consumption75% (of the Prime Power)", "56.8L", null, { unit: null, num: 56.8, cond: { load: 75, rating: "prime" }, missing: ["unit"] }], // westinpower: "L" is no rate
  ["fuel75", "75%Prime", "17L/h", null, { unit: "L/h", num: 17, cond: { load: 75, rating: "prime" }, missing: [] }], // aosif
  ["fuel75", "Fuel L/h @75% / @100%", "11.9 / 15.8", null, { unit: "L/h", num: 11.9, cond: { load: 75 }, missing: [] }], // generatordieselchina
  ["fuel75", "燃油消耗", "57.3", null, { num: 57.3, cond: { load: 75, loadFrom: "key" }, missing: ["unit"] }], // shanhua (75% in a cell of the row)
  ["fuel75", "Running time @ 75% PRP", "5", null, { missing: ["kind"] }], // endress-stromerzeuger: not a consumption
  ["fuel75", "Fuel consumption75% (of the Prime Power)", "193g/kWh", null, { unit: "g/kWh", num: 193, missing: [] }], // westinpower
  // fuel50
  ["fuel50", "50%Prime", "3.7L/h", null, { unit: "L/h", num: 3.7, cond: { load: 50, rating: "prime" }, missing: [] }], // aosif
  ["fuel50", "50%Prime", "0.216", null, { num: 0.216, missing: ["unit"] }], // aosif
  ["fuel50", "Fuel consumption at 50% Prime Power", "0", null, { missing: ["unit", "value"] }], // gfe-power
  ["fuel50", "Fuel consumption at 50% Prime Power", "197.5", null, { num: 197.5, cond: { load: 50, rating: "prime" }, missing: ["unit"] }], // gfe-power: 197.5 is not read as g/kWh
  ["fuel50", "Consumption", "17", null, { num: 17, cond: { load: 50, loadFrom: "key" }, missing: ["unit"] }], // genlitec
  // noise
  ["noise", "Noise Level", "≤72dB(A) @ 7m", null, { unit: "dB(A)", op: "≤", num: 72, cond: { distance_m: 7 }, missing: [] }], // jiuan-power
  ["noise", "Noise(LP1m)", "100dB（A）", null, { unit: "dB(A)", num: 100, cond: { distance_m: 1, measure: "LpA" }, missing: [] }], // supermaly
  ["noise", "Noise Level", "70dB", null, { unit: "dB", num: 70, missing: ["distance"] }], // hosem-power
  ["noise", "Noise Level for Soundproof Generator at 7M", "75", null, { unit: null, num: 75, cond: { distance_m: 7, enclosure: "enclosed" }, missing: ["unit"] }], // hosem-power
  ["noise", "噪音dB(A)", "86 ≤69", null, { options: [86, 69], missing: ["ambiguous", "distance"] }], // changchai
  ["noise", "dB(A)", "69", { header: CGM }, { unit: "dB(A)", num: 69, cond: { distance_m: 7, distanceFrom: "header" }, missing: [] }], // cgm-italia
  ["noise", "Noise level (7m, dB)", "68-72", null, { unit: "dB", range: [68, 72], cond: { distance_m: 7 }, missing: [] }], // bison-zhejiang
  // dims
  ["dims", "外形尺寸(L×W×H)", "2900*1100*1600", null, { dims: { L: 2900, W: 1100, H: 1600 }, unit: null, missing: ["unit", "enclosure"] }], // bdadl-shanghai
  ["dims", "Dimension mm Open Type", "1760*760*1380", null, { dims: { asWritten: [1760, 760, 1380] }, unit: "mm", cond: { enclosure: "open" }, missing: ["order"] }], // hichai-power
  ["dims", "开架机组 外形尺寸 L × W × H(mm)", "3100×1020 ×1780", null, { dims: { L: 3100, W: 1020, H: 1780 }, unit: "mm", cond: { order: "L×W×H", enclosure: "open" }, missing: [] }], // xingguang-jiangsu
  ["dims", "Dimensions", "1900*800*1050", { header: AGESTAR }, { unit: "mm", dims: { asWritten: [1900, 800, 1050] }, missing: ["order", "enclosure"] }], // agestar
  ["dims", "Size", "4500*1800*2745", null, { unit: null, missing: ["unit", "order", "enclosure"] }], // bobig-power
  // bobig-power: the title says "Canopy" but the header has an open and a soundproof column → not read from the title
  ["dims", "Size", "3600*1500*2460", { title: "ISO8528 Standard 20KW To 400KW Weichai Diesel Generator For Home Canopy", header: ["| Gensets | | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator(50hz/1500rpm) | Size", "| Model | Gensets power(KW/KVA) | Engine model | Engine power(kw) | BOBIG | Open type (MM) | sounproof type (MM)"] }, { missing: ["unit", "order", "enclosure"] }],
  ["weight", "Weight", "1250", { title: "Ricardo Series (open type)" }, { cond: { enclosure: "open" }, missing: ["unit", "basis"] }], // agestar: title names the build
  ["dims", "L*M*H(mm)(open)", "2000*800*1350", null, { dims: { L: 2000, W: 800, H: 1350 }, unit: "mm", cond: { order: "L×W×H", enclosure: "open" }, missing: [] }], // long-gen ("M" = width)
  // weight
  ["weight", "Gross Weight(kg)", "700", null, { unit: "kg", num: 700, cond: { basis: "gross" }, missing: ["enclosure"] }], // uleengen
  ["weight", "毛重（kg）", "800", null, { unit: "kg", num: 800, cond: { basis: "gross" }, missing: ["enclosure"] }], // uleengen
  ["weight", "Weight", "4100", null, { unit: null, num: 4100, missing: ["unit", "basis", "enclosure"] }], // hichai-power
  ["weight", "净重 Net Weight (kg)", "738", null, { unit: "kg", cond: { basis: "net" }, missing: ["enclosure"] }], // yingtai-group
  ["weight", "开架款重量", "9500", null, { num: 9500, cond: { enclosure: "open" }, missing: ["unit", "basis"] }], // kanpor-fuan
  ["weight", "Weight", "630", { header: AGESTAR }, { unit: "kg", num: 630, missing: ["basis", "enclosure"] }], // agestar
  // disp
  ["disp", "Displacement (L)", "3.9", null, { unit: "L", num: 3.9, missing: [] }], // genlitec
  // "1,642" (comma + 3 digits): thousands (Khoa 14/11), except in a table that itself writes decimal commas (himoinsa:
  // "3,51 l/h", "2,80 l/h" in the same table) → not read at all.
  ["disp", "Displacement", "1,642 L", { rows: HIMOINSA_13 }, { unit: "L", missing: ["number"] }], // himoinsa-china n114
  ["disp", "Displacement", "1,116 L", { rows: HIMOINSA_10 }, { unit: "L", missing: ["number"] }], // himoinsa-china n142
  ["fuel", "Fuel Consumption ESP", "3,767 l/h", { rows: HIMOINSA_10 }, { unit: "L/h", cond: { rating: "standby" }, missing: ["number", "load"] }], // himoinsa-china n142
  ["disp", "Displacement", "0,667 L", { rows: ["Displacement: 0,667 L"] }, { unit: "L", num: 0.667, missing: [] }], // himoinsa-china n122: a leading 0 is never thousands
  ["weight", "Dry Weight", "4,095kg", { rows: ["| Dry Weight | 4,095kg"] }, { unit: "kg", num: 4095, cond: { basis: "dry" }, missing: ["enclosure"] }], // ade-power n2001
  ["dims", "Dimension (L × W × H)", "1,381 x 1,138 x 1,207 mm", null, { unit: "mm", dims: { L: 1381, W: 1138, H: 1207 }, missing: ["enclosure"] }], // hd-hyundai-infracore
  ["dims", "Dimensions (L×W×H)", "4300 × 1600 × 2250mm / 4,300kg", null, { unit: "mm", dims: { L: 4300, W: 1600, H: 2250 }, missing: ["enclosure"] }], // jiuan-power: weight after "/"
  // cc / cm³ / ml → L by l_from_cc (Khoa 22/11/2026, S8-1) when the unit is written in the cell, label or header unit.
  ["disp", "Displacement (cc)", "418", null, { unit: "L", num: 0.418, conv: { formula: "l_from_cc", from: { num: 418, unit: "cc" } }, missing: [] }], // mingbang-mbkl
  // No unit written anywhere: disp only takes a default unit by magnitude (Khoa 14/11, "displacement nên default đơn vị là
  // L hoặc cm³ (cc)"): 0.4–100 → L, 400–100000 → cc, cond.unitFrom "default"; outside both bands still missing.
  ["disp", "Displacement", "38", null, { unit: "L", num: 38, cond: { unitFrom: "default" }, missing: [] }], // aosif
  ["disp", "排量", "7.146", null, { unit: "L", num: 7.146, cond: { unitFrom: "default" }, missing: [] }], // kanpor-fuan n122
  ["disp", "Displacement", "1642", null, { unit: "cc", num: 1642, cond: { unitFrom: "default" }, missing: [] }], // rule test: cc band, NOT converted (no unit written; S8-1 converts only a written unit)
  ["disp", "Displacement", "171", null, { unit: null, num: 171, missing: ["unit"] }], // rule test: between the bands
  ["disp", "Displacement", "1.6", { title: "Engine data (cc)" }, { unit: null, num: 1.6, missing: ["unit"] }], // rule test: the title writes a unit
  // A label that writes some other unit is not "no unit": no default (jlmech "(mm)", honny "(A)" for displacement).
  ["disp", "Displacement (mm)", "4.3", null, { unit: null, num: 4.3, missing: ["unit"] }], // jlmech-wuhan n102
  ["disp", "排量 (A)", "14", null, { unit: null, num: 14, missing: ["unit"] }], // honny-dongguan n101
  ["disp", "Displacement [ccm]", "171", null, { unit: "L", num: 0.171, missing: [] }], // endress-stromerzeuger n108: ccm = cm³, read from the label
  ["disp", "Displacement", "296cc", null, { unit: "L", num: 0.296, missing: [] }], // bison-zhejiang n101
  ["disp", "Displacement", "418 cc", null, { unit: "L", num: 0.418, missing: [] }], // zc-power n105
  ["disp", "Displacement (ml)", "1247", null, { unit: "L", num: 1.247, missing: [] }], // jet-power
  ["disp", "Displacement(CC)", "499", null, { unit: "L", num: 0.499, missing: [] }], // cameo-power
  ["disp", "cm3", "2156", null, { unit: "L", num: 2.156, missing: [] }], // tecnogen n2001 column title (S8-2)
  ["disp", "Displacement", "2156 cm³", null, { unit: "L", num: 2.156, missing: [] }], // rule test: cm³ (NFKC → cm3)
  ["disp", "Displacement", "2156 c.c.", null, { unit: "L", num: 2.156, missing: [] }], // rule test: c.c.
  ["disp", "Displacement", "3900", { header: ["| Model | Displacement", "| | cc"] }, { unit: "L", num: 3.9, missing: [] }], // rule test: header unit cell
  ["disp", "Displacement", "6.44L", null, { unit: "L", num: 6.44, missing: [] }], // jiuan-power
  ["disp", "排量(L)", "8.2", null, { unit: "L", num: 8.2, missing: [] }], // zhengchi-power
  // bore
  ["bore", "Bore and Stroke", "88 x 90 mm", null, { unit: "mm", bore: { bore: 88, stroke: 90 }, missing: [] }], // himoinsa-china
  ["bore", "缸径/行程 (mm)", "190/215", null, { unit: "mm", bore: { bore: 190, stroke: 215 }, missing: [] }], // haifeng-taizhou
  ["bore", "缸径 mm", "159", null, { unit: "mm", bore: { bore: 159 }, missing: ["stroke"] }], // xinzhengfa
  ["bore", "Bore×Stroke", "90×100", null, { unit: null, bore: { bore: 90, stroke: 100 }, missing: ["unit"] }], // jet-power
  ["bore", "Bore / stroke", "1200", null, { options: [1200], missing: ["unit", "ambiguous"] }], // agco-power
  ["bore", "Bore × Stroke", "127mm × 165mm", null, { unit: "mm", bore: { bore: 127, stroke: 165 }, missing: [] }], // jiuan-power
  ["bore", "缸径/行程", "102/120", { header: HAIFENG }, { unit: null, bore: { bore: 102, stroke: 120 }, missing: ["unit"] }], // haifeng-taizhou: "(mm)" also fits 外形尺寸
  ["bore", "Bore×Stroke", "85×100", { header: JET }, { unit: null, missing: ["unit"] }], // jet-power n134
  ["dims", "外形尺寸", "1600*720*1200", { header: HAIFENG }, { unit: null, missing: ["unit", "order", "enclosure"] }], // haifeng-taizhou
  ["disp", "Displacement", "2.27", { header: JET }, { unit: "L", num: 2.27, cond: { headerUnit: "(L)" }, missing: [] }], // jet-power n134: "(L)" has one title that takes litres
  // cyl
  ["cyl", "缸数", "6", null, { count: 6, missing: ["layout"] }], // aoke-yangzhou
  ["cyl", "Cylinder", "6L", null, { count: 6, cond: { layout: "L" }, missing: [] }], // aosif
  ["cyl", "Cylinder", "12V", null, { count: 12, cond: { layout: "V" }, missing: [] }], // aosif
  ["cyl", "缸数", "V20", null, { count: 20, cond: { layout: "V" }, missing: [] }], // honny-dongguan
  ["cyl", "Number of cylinders / arrangement", "16 cyl / 60°V", null, { count: 16, cond: { layout: "V", angle: 60 }, missing: [] }], // gfe-power
  ["cyl", "Cylinder Configuration", "16-cylinder, 60° Vee", null, { count: 16, cond: { layout: "V", angle: 60 }, missing: [] }], // huali-shandong
  // compr (no compression cell in the data lacks a figure: the missing case is a cell of another kind)
  ["compr", "Compression Ratio", "14:1", null, { num: 14, unit: null, missing: [] }], // fdk-energy
  ["compr", "Compression ratio", "13.6: 1", null, { num: 13.6, missing: [] }], // westinpower
  ["compr", "Compression Ratio", "18·2 :1", null, { num: 18.2, missing: [] }], // weiman-fujian
  ["compr", "Compression Ratio", "16.5：1", null, { num: 16.5, missing: [] }], // full-width colon
  ["compr", "Compression Ratio", "14.0", null, { num: 14, missing: [] }], // jet-power
  ["compr", "Compression Ratio", "-", null, { missing: ["value"] }],
  // speed
  ["speed", "Rated speed", "1500 rpm", null, { unit: "rpm", num: 1500, missing: [] }], // fdk-energy
  ["speed", "额定转速 (RPM)", "1500", null, { unit: "rpm", num: 1500, missing: [] }], // chuangyuan-zhongshan
  ["speed", "Speed", "1800", null, { unit: null, num: 1800, missing: ["unit"] }], // acepow-fuan
  ["speed", "Rated Rotation Speed [rpm]", "3000 3600", null, { unit: "rpm", options: [3000, 3600], missing: [] }], // acepow-fuan
  ["speed", "kWm @ rpm 50Hz Standby", "1,240 @ 1500", null, { missing: ["kind"] }], // hd-hyundai-infracore: power and speed under one title
  ["speed", "转速", "1500", null,{ unit: null, num: 1500, missing: ["unit"] }], // "转速" is the word "speed", not a unit
  ["speed", "Rated speed", "1200 r/min", null,{ unit: "rpm", num: 1200, missing: [] }], // repower-gas
  ["speed", "Rated rotation speed", "1191", null, { unit: null, num: 1191, missing: ["unit"] }], // westinpower
  // voltage
  ["voltage", "电压(V)", "230/400", null, { unit: "V", options: [[230, 400]], missing: [] }], // zhengchi-power
  ["voltage", "Voltage", "415/240V, 400/230V, 380/220V", null, { unit: "V", options: [[415, 240], [400, 230], [380, 220]], missing: [] }], // jiuan-power
  ["voltage", "Voltage", "380-415V", null, { unit: "V", range: [380, 415], missing: [] }], // ade-power
  ["voltage", "Fre/Volt HZ/V 频率 /电压", "1000", null, { missing: ["kind"] }], // kangwo-guangdong: a power figure under a frequency/voltage title
  ["voltage", "Voltage", "208/120; 220/127; 416/240;", null, { unit: null, options: [[208, 120], [220, 127], [416, 240]], missing: ["unit"] }], // lees-power
  ["voltage", "Voltage/", "220V / 50Hz", null, { unit: "V", num: 220, missing: [] }], // cameo-power
  ["voltage", "Rated Voltage", "380V/400V/415V、10.5kv(Optional)", null, { unit: null, missing: ["unit"] }], // superwatt-swt: V and kV in one cell
  ["voltage", "Rated voltage line to line", "400/230", null,{ cond: { kind: "line-line" }, missing: ["unit"] }], // longkai-power
  // phase
  ["phase", "Phases", "3", null, { num: 3, missing: [] }], // aosif
  ["phase", "Phase", "Three", null, { num: 3, missing: [] }], // fdk-energy
  ["phase", "Phase & Wire", "3 Phase, 4 Wires", null, { num: 3, cond: { wires: [4] }, missing: [] }], // genlitec
  ["phase", "Phase", "1-Phase , 3-Phase", null, { options: [1, 3], missing: [] }], // elitech-power
  ["phase", "Numbers of Wires", "6 Wires", null, { cond: { wires: [6] }, missing: ["value"] }], // hosem-power
  ["phase", "Frequency / Phase", "50Hz/ Three phase", null, { num: 3, cond: { freq: 50 }, missing: [] }], // acepow-fuan
  ["phase", "50HZ PF=0.8 400/230V 3Phase 4Wire", "3", null, { num: 3, missing: [] }], // wintpower
  // pf (raw rows of the tables; catalog.js keys some of these labels only after chuan-hoa-1b)
  ["pf", "Factor (Cos Phi)", "0.8", null, { num: 0.8, missing: [] }], // westinpower
  ["pf", "Power Factor", "0.8 lagging", null, { num: 0.8, cond: { lagging: true }, missing: [] }],
  ["pf", "Power Factor", "0.8 (Lagging)", null, { num: 0.8, cond: { lagging: true }, missing: [] }],
  ["pf", "Power Factor", "COSΦ=0.8", null, { num: 0.8, missing: [] }],
  ["pf", "Power Factor", "1.0", null, { num: 1, missing: [] }],
  ["pf", "Power Factor", "-", null, { missing: ["value"] }],
  ["pf", "Power factor", "1(0.8)", null, { options: [1, 0.8], missing: ["ambiguous"] }], // bison-zhejiang
  ["pf", "Power factor", "0.8（Lag）", null, { num: 0.8, cond: { lagging: true }, missing: [] }], // jichai-huanneng
  // tank
  ["tank", "Fuel Tank", "60 L", null, { unit: "L", num: 60, missing: [] }], // himoinsa-china
  ["tank", "Fuel Tank Capacity (L)", "25", null, { unit: "L", num: 25, missing: [] }], // victory-generator
  ["tank", "Fuel tank capacity", "780", null, { unit: null, num: 780, missing: ["unit"] }], // longkai-power
  ["tank", "FuelTank (lt)", "2 x 950", null, { unit: "L", num: 950, cond: { count: 2 }, missing: [] }], // teksan
  ["tank", "Fuel tank", "Capable of continuous use for over 10 hours", null, { cond: { runtime_h: 10 }, missing: ["value"] }], // kaichen-jiangsu
  ["tank", "FUEL TANK GAL. (LITERS)", "4.0 GAL. (15 L.) METAL FUEL TANK WITH GAUGE, TWIST-CAP, & SLOSH VALVE", null, { unit: "L", num: 15, cond: { gal: 4 }, missing: [] }], // gillette-generators
  ["tank", "Fuel Tank running hours:", "8/10/12H", null, { missing: ["kind"] }], // acepow-fuan
  // engPower
  ["engPower", "Rated Engine Output", "12,2kW prp ; 13,2kW standby", null, { unit: "kW", options: [12.2, 13.2], cond: { ratings: ["prime", "standby"] }, missing: ["speed"] }], // himoinsa-china
  ["engPower", "Engine power (kW)", "36", null, { unit: "kW", num: 36, missing: ["speed"] }], // eastern-lion-fuan
  ["engPower", "Gross Engine Output — Prime", "1,097 kWm at 1,500 rpm", null, { unit: "kW", num: 1097, cond: { rpm: 1500, rating: "prime" }, missing: [] }], // huali-shandong
  ["engPower", "Engine power (kW)", "30.1KW/1500转", null, { unit: "kW", num: 30.1, cond: { rpm: 1500 }, missing: [] }], // eastern-lion-fuan: "1500转" = v/p (Khoa 14/11)
  ["engPower", "Max Power (kW/Hp)", "575/771", null, { unit: "kW", num: 575, cond: { hp: 771 }, missing: ["speed"] }], // ettes-power
  ["engPower", "Prime power / Speed (KW/RPM)", "340/1500", null, { unit: "kW", num: 340, cond: { rpm: 1500, rating: "prime" }, missing: [] }], // fdk-energy
  ["engPower", "Engine Power", "96-105kw", null, { unit: "kW", range: [96, 105], missing: ["speed"] }], // yongcai-elecmama
  ["engPower", "Engine Power", "20/23", null, { unit: null, options: [20, 23], missing: ["ambiguous", "unit", "speed"] }], // beidou-yangzhou
  ["engPower", "柴油机额定功率/转速 Engine prime power （KW/rpm)", "125/1500", null, { unit: "kW", num: 125, cond: { rpm: 1500, rating: "prime" }, missing: [] }], // nenjo-generator
  // emission
  ["emission", "排放 Discharge", "国Ⅱ", null, { enum: [{ scale: "CN", level: "2", text: "国II" }], missing: [] }], // senci-jiangsu
  ["emission", "Emission standards", "T3", null, { enum: [{ scale: null, level: "3", text: "T3" }], missing: ["scale"] }], // hanyang-weifang
  ["emission", "Emission standard", "Non-Road Emission Exempt", null, { cond: { exempt: true }, missing: [] }], // weichai-heavy-machinery
  ["emission", "Emission Standard", "EU Stage II / EPA Tier 2", null, { enum: [{ scale: "EU Stage", level: "2", text: "EU Stage II" }, { scale: "EPA Tier", level: "2", text: "EPA Tier 2" }], missing: [] }], // jiuan-power
  ["emission", "EU Emissions Level", "V", null, { enum: [{ scale: "EU Stage", level: "5", text: "V" }], missing: [] }], // welland-power
  ["emission", "Emission standards", "CHINA STAGE", null, { missing: ["value"] }], // aosif
  ["emission", "Emission Standards", "CN III, EU III", null, { enum: [{ scale: "CN", level: "3", text: "CN III" }, { scale: "EU Stage", level: "3", text: "EU III" }], missing: [] }], // victory-generator
  ["emission", "EPA EMISSION LEVEL", "Tier 4 Final", null, { enum: [{ scale: "EPA Tier", level: "4F", text: "Tier 4 Final" }], missing: [] }], // airman
  ["emission", "Emission level", "Stage IIIA / Tier 3", null, { enum: [{ scale: null, level: "3A", text: "Stage IIIA" }, { scale: null, level: "3", text: "Tier 3" }], missing: ["scale"] }], // jet-power: no conversion between scales
  // alternator poles / wires / bearing / overspeed / air flow (buoc-4-c, 24/11/2026)
  ["poles", "Poles", "4", null, { num: 4, missing: [] }], // koten-power
  ["poles", "Pole number", "2", null, { num: 2, missing: [] }], // jet-power
  ["poles", "Number of Poles", "4", null, { num: 4, missing: [] }], // huali-shandong
  ["poles", "No of Poles", "4 Poles", null, { num: 4, missing: [] }],
  ["poles", "No of Poles", "2 or 4", null, { options: [2, 4], missing: [] }],
  ["poles", "Poles", "4/6", null, { missing: ["value"] }], // not read: which is which is not written
  ["wires", "Wires", "12", null, { num: 12, missing: [] }], // depco-power
  ["wires", "Wires:", "4", null, { num: 4, missing: [] }], // genlitec
  ["wires", "Numbers of Wires", "6 Wires", null, { num: 6, missing: [] }], // hosem-power
  ["wires", "Number of wires", "6 or 12", null, { options: [6, 12], missing: [] }],
  ["wires", "No of Leads", "12/6", null, { missing: ["value"] }], // powerpack: not read
  ["wires", "Number of wires", "6 (12 option)", null, { missing: ["value"] }], // hipower / mecc alte sheet: not read
  ["bearing", "No.of bearings", "1", null, { num: 1, missing: [] }], // depco-power
  ["bearing", "Bearing", "Single bearing", null, { num: 1, missing: [] }], // koten-power
  ["bearing", "Bearing Arrangement", "Single-bearing", null, { num: 1, missing: [] }], // huali-shandong
  ["bearing", "轴承数", "双轴承", null, { num: 2, missing: [] }],
  ["bearing", "Bearing", "Two bearing", null, { num: 2, missing: [] }],
  ["bearing", "Bearing", "6319-2RS", null, { missing: ["value"] }], // a bearing code, not a count
  ["overspeed", "Overspeed: rpm", "2250", null, { unit: "rpm", num: 2250, missing: [] }], // genlitec
  ["overspeed", "Overspeed", "2250RPM", null, { unit: "rpm", num: 2250, missing: [] }], // long-gen
  ["overspeed", "Maximum Over Speed", "2250 RPM", null, { unit: "rpm", num: 2250, missing: [] }], // aosif
  ["overspeed", "MAXIMUM OVERSPEED", "2250 Rev/Min", null, { unit: "rpm", num: 2250, missing: [] }], // stamford-avk-china
  ["overspeed", "Overspeed", "2250", null, { num: 2250, missing: ["unit"] }], // no unit written: not guessed
  ["overspeed", "Overspeed", "12", null, { missing: ["value"] }], // comap controller, not a speed
  ["airflow", "Cooling Air Flow", "0,7 m3/s", null, { unit: "m3/s", num: 0.7, missing: [] }], // himoinsa-china
  ["airflow", "Cooling Air Flow", "0,0875 m3/s", null, { unit: "m3/s", num: 0.0875, missing: [] }], // himoinsa-china
  ["airflow", "Cooling Air Flow 60 Hz", "74 m3/min", null, { unit: "m3/min", num: 74, missing: [] }], // unit kept as written, not converted
  ["airflow", "Air flow (m3/s)", "0.48", null, { unit: "m3/s", num: 0.48, missing: [] }], // gfe-power
  ["airflow", "Cooling Air Flow", "0.48", null, { num: 0.48, missing: ["unit"] }],
  ["airflow", "Cooling Air Flow", "TBA kg/h", null, { missing: ["value"] }],
  // engine electrical system voltage (buoc-4-d, 25/11/2026)
  ["elecv", "Starting Voltage", "DC24V", null, { unit: "VDC", num: 24, missing: [] }], // aosif
  ["elecv", "Starter motor voltage", "12V", null, { unit: "VDC", num: 12, missing: [] }], // genlitec
  ["elecv", "Starter Voltage (V)", "24", null, { unit: "VDC", num: 24, missing: [] }], // westinpower
  ["elecv", "起动机电压 Start Motor Voltage (V)", "24", null, { unit: "VDC", num: 24, missing: [] }], // shanhua
  ["elecv", "Engine Electrical System", "24", null, { num: 24, missing: ["unit"] }], // powerpack: unit cell not passed
  ["elecv", "Starting Voltage", "12V/24V", null, { missing: ["value"] }], // two systems: not read
];

for (const [key, label, value, ctx, want] of CASES) {
  test(`${key}: "${label}" = "${value}"`, () => {
    const r = SN.normalize({ key, label, value }, ctx || {});
    assert.ok(r, "có kết quả");
    assert.deepEqual(r.raw, { label, value }, "raw là nguyên văn");
    for (const [f, v] of Object.entries(want)) {
      if (f === "missing") assert.deepEqual([...r.missing].sort(), [...v].sort(), `missing của ${JSON.stringify(r)}`);
      else if (f === "cond") for (const [c, cv] of Object.entries(v)) assert.deepEqual(r.cond?.[c], cv, `cond.${c} của ${JSON.stringify(r)}`);
      else assert.deepEqual(r[f], v, `${f} của ${JSON.stringify(r)}`);
    }
  });
}

test("mỗi mã có ít nhất 5 ca, và mỗi mã có ca ra missing", () => {
  for (const k of SN.KEYS) {
    const mine = CASES.filter((c) => c[0] === k);
    assert.ok(mine.length >= 5, `${k}: ${mine.length} ca`);
    assert.ok(mine.some((c) => c[4].missing?.length), `${k}: không có ca missing`);
  }
});

test("không đoán đơn vị theo độ lớn: 205 không thành g/kWh, 75 không thành dB, 1500 không thành rpm", () => {
  assert.equal(SN.normalize({ key: "fuel", label: "Fuel Consumption", value: "205" }).unit, null);
  assert.equal(SN.normalize({ key: "noise", label: "Noise Level", value: "75" }).unit, null);
  assert.equal(SN.normalize({ key: "speed", label: "Speed", value: "1500" }).unit, null);
});

test("quy đổi chỉ bằng web/conversions.js và giữ giá trị gốc (hp → kW)", () => {
  const r = SN.normalize({ key: "engPower", label: "Engine Power (HP)", value: "100" });
  assert.equal(r.unit, "kW");
  assert.ok(Math.abs(r.num - 74.57) < 1e-9);
  assert.deepEqual(r.conv, { formula: "kw_from_hp", from: { num: 100, unit: "hp" } });
});

test("cc → L (S8-1): l_from_cc chia 1000, đúng chữ số; mọi cách viết đơn vị; số trơ dải mặc định không đổi", () => {
  const C = globalThis.GenbidConversions;
  assert.equal(C.compute({ formula: "l_from_cc", inputs: [{ name: "V_cc", value: 2156 }] }).value, 2.156);
  assert.equal(String(C.compute({ formula: "l_from_cc", inputs: [{ name: "V_cc", value: 1498.5 }] }).value), "1.4985");
  assert.equal(String(C.compute({ formula: "l_from_cc", inputs: [{ name: "V_cc", value: 3900 }] }).value), "3.9");
  assert.ok(C.compute({ formula: "l_from_cc", inputs: [{ name: "V_cc", value: 0 }] }).error);
  for (const [label, value] of [["Displacement", "2156 cc"], ["Displacement", "2156 cm3"], ["Displacement", "2156 cm³"], ["Displacement", "2156 ml"], ["Displacement", "2156 CC"], ["Displacement", "2156 c.c."], ["Displacement", "2156cc"], ["Displacement (cc)", "2156"], ["cm3", "2156"], ["Displacement [ccm]", "2156"], ["Displacement (ML)", "2156"]]) {
    const r = SN.normalize({ key: "disp", label, value });
    assert.equal(r.unit, "L", `${label} | ${value}`);
    assert.equal(r.num, 2.156, `${label} | ${value}`);
    assert.deepEqual(r.conv, { formula: "l_from_cc", from: { num: 2156, unit: "cc" } }, `${label} | ${value}`);
  }
  // Số trơ không ghi đơn vị: dải mặc định gán "cc" nhưng KHÔNG đổi (không đoán theo độ lớn).
  const d = SN.normalize({ key: "disp", label: "Displacement", value: "2156" });
  assert.equal(d.unit, "cc"); assert.equal(d.num, 2156); assert.equal(d.conv, undefined); assert.equal(d.cond.unitFrom, "default");
  // "cc" không bắt nhầm chữ khác; L vẫn là L.
  assert.equal(SN.normalize({ key: "disp", label: "Displacement", value: "2.156 L" }).num, 2.156);
  assert.equal(SN.normalize({ key: "disp", label: "Displacement", value: "2.156 L" }).conv, undefined);
  // Viết liền / ô đơn vị tiêu đề "ml", "cm3", "ccm" (điều phối 22/11/2026).
  for (const [label, value, ctx] of [["Displacement", "2156ml", {}], ["Displacement", "2156ccm", {}], ["Displacement", "2156", { header: ["| Model | Displacement", "| | ml"] }],
    ["Displacement", "2156", { header: ["| Model | Displacement", "| | cm3"] }], ["Displacement", "2156", { header: ["| Model | Displacement", "| | ccm"] }]]) {
    const r = SN.normalize({ key: "disp", label, value }, ctx);
    assert.equal(r.unit, "L", `${value} ${JSON.stringify(ctx)}`); assert.equal(r.num, 2.156, `${value} ${JSON.stringify(ctx)}`);
  }
  // Số không hợp lý cho cc: phần thập phân hoặc < 20 → không đổi, missing "number" (không so).
  for (const [label, value, num] of [["Displacement", "2.156 cc", 2.156], ["Displacement (cc)", "6.7", 6.7], ["Displacement", "12.500 cm3", 12.5], ["Displacement (cc)", "15", 15], ["Displacement (ml)", "1498.5", 1498.5]]) {
    const r = SN.normalize({ key: "disp", label, value });
    assert.equal(r.unit, "cc", `${label} | ${value}`); assert.equal(r.num, num, `${label} | ${value}`);
    assert.ok(r.missing.includes("number"), `${label} | ${value}`); assert.equal(r.conv, undefined, `${label} | ${value}`);
  }
  assert.equal(SN.normalize({ key: "disp", label: "Displacement (cc)", value: "20" }).num, 0.02);
  // cc / cm3 theo sau bởi "/" là lưu lượng / thể tích mỗi vòng, không phải dung tích.
  for (const [label, value] of [["Displacement", "2156 cm3/min"], ["Displacement", "45 cc/rev"], ["Displacement (cc/rev)", "45"], ["Displacement (cm3 / min)", "2156"]]) {
    const r = SN.normalize({ key: "disp", label, value });
    assert.equal(r.unit, null, `${label} | ${value}`); assert.ok(r.missing.includes("unit"), `${label} | ${value}`); assert.equal(r.conv, undefined, `${label} | ${value}`);
  }
  // selfCheck nay xét được dòng ghi cc (đã là L).
  const sc = SN.selfCheck([SN.normalize({ key: "cyl", label: "Cylinders", value: "1" }), SN.normalize({ key: "bore", label: "Bore x Stroke (mm)", value: "86*72" }), SN.normalize({ key: "disp", label: "Displacement (cc)", value: "418" })]);
  assert.equal(sc?.bad, false);
});

test("ô một dung tích hai đơn vị (S9 cc-129): số cc là số in³ đổi ra rồi làm tròn → đọc số cc; khác thì ambiguous y như trước", () => {
  // gillette n101 / n103 / n105 (giá trị lấy sau "1 CYLINDER, " của ô "ENGINE DISPLACEMENT"): 23.7 in³ = 388.4 cc trong "390" = 385–395
  // (số nguyên ≥ 3 chữ số, MỘT số 0 cuối là làm tròn hàng chục); 41.97 in³ = 687.8 cc trong 687.5–688.5; 26.9 in³ = 440.8 cc trong 435–445.
  for (const [value, cc, in3] of [["23.7 CU. IN. (390 CC)", 390, 23.7], ["41.97 CU. IN. (688 CC)", 688, 41.97], ["26.9 CU. IN. (440 CC)", 440, 26.9], ["390 cc (23.7 cu. in.)", 390, 23.7], ["23.7 in³ (388 cm³)", 388, 23.7]]) {
    const r = SN.normalize({ key: "disp", label: "ENGINE DISPLACEMENT", value });
    assert.equal(r.unit, "L", value); assert.equal(r.num, cc / 1000, value); assert.deepEqual(r.missing, [], value);
    assert.deepEqual(r.conv, { formula: "l_from_cc", from: { num: cc, unit: "cc" }, same: { num: in3, unit: "in³" } }, value);
  }
  // Hai thể tích KHÁC nhau (điều phối 22/11/2026: luật đầu nới cả số 0 cuối của số in³ / số cc nhiều chữ số 0 và nhận nhầm các ô này),
  // số cc thập phân "390.0", số cc < 20, "/" thay ngoặc, ô có thêm chữ: không đọc; đơn vị, options, "ambiguous" y như trước luật.
  for (const value of ["23.7 CU. IN. (440 CC)", "23.7 CU. IN. (390.0 CC)", "41.97 CU. IN. (683 CC)", "23.7 CU. IN. / 390 CC", "1 CYLINDER, 23.7 CU. IN. (390 CC)",
    "30 CU. IN. (1000 CC)", "40 CU. IN. (700 CC)", "45 CU. IN. (700 CC)", "46 CU. IN. (700 CC)", "92 CU. IN. (1000 CC)", "20 CU. IN. (400 CC)", "30 CU. IN. (400 CC)",
    "100 CU. IN. (2000 CC)", "200 CU. IN. (2000 CC)", "275 CU. IN. (5000 CC)", "330 CU. IN. (5000 CC)", "600 CU. IN. (10000 CC)", "900 CU. IN. (10000 CC)",
    "1000 CU. IN. (10000 CC)", "1 CU. IN. (20 CC)", "1 CU. IN. (16 CC)"]) {
    const r = SN.normalize({ key: "disp", label: "ENGINE DISPLACEMENT", value });
    assert.equal(r.unit, "in³", value); assert.equal(r.num, undefined, value); assert.equal(r.conv, undefined, value);
    assert.ok(r.missing.includes("ambiguous"), value);
    assert.deepEqual(r.options, value.match(/\d+(?:\.\d+)?/g).map(Number), value);
  }
});

test("mã không thuộc lớp này → null; normalizeRecord lấy ngữ cảnh của bản ghi", () => {
  assert.equal(SN.normalize({ key: "gov", label: "Governor", value: "Electronic" }), null);
  const rec = { title: "FAWDE generator set", header: AGESTAR, specs: [{ key: "weight", label: "Weight", value: "630" }, { key: "gov", label: "Gov", value: "Mechanical" }] };
  const out = SN.normalizeRecord(rec);
  assert.equal(out.length, 1);
  assert.equal(out[0].unit, "kg");
});

test("cờ công suất tổ máy: chỉ 'rated' → thiếu chế độ; không tần số → thiếu freq; cách đọc không đổi", () => {
  assert.deepEqual(SN.powerFlags({ power: { rated: { kVA: 100, kW: 80 } }, freq: null }).missing, ["rating", "freq"]);
  assert.deepEqual(SN.powerFlags({ power: { prime: { kVA: 100, kW: 80 } }, freq: 50 }).missing, []);
  assert.deepEqual(SN.powerFlags({ power: null, freq: 60 }).missing, ["value"]);
});

// PR D (buoc-4-d, 25/11/2026): điện áp hệ thống điện và công suất ghi HP / CV của động cơ.
test("elecv: 12 / 24 V của hệ thống điện, đơn vị chỉ khi ô / nhãn / ô đơn vị ghi", () => {
  const n = (label, value, unitCell) => SN.normalize({ key: "elecv", label, value, ...(unitCell ? { unitCell } : {}) });
  assert.deepEqual([n("Starting Voltage", "DC24V").num, n("Starting Voltage", "DC24V").unit], [24, "VDC"]);
  assert.equal(n("Starter motor voltage", "12V").unit, "VDC");
  const bare = n("Engine Electrical System", "24"); assert.equal(bare.num, 24); assert.equal(bare.unit, null); assert.ok(bare.missing.includes("unit"));
  assert.equal(n("Engine Electrical System", "24", "VDC").unit, "VDC");
  for (const v of ["12V/24V", "V", "Electric"]) assert.ok(!SN.hasValue(n("Starting Voltage", v)), v);
});
test("engPower: HP / BHP / CV giữ số nguồn ghi, hai số trơ ('75/3000') không đọc", () => {
  const n = (label, value) => SN.normalize({ key: "engPower", label, value });
  const a = n("Gross hp", "552"); assert.equal(a.conv.from.num, 552); assert.equal(a.conv.from.unit, "hp");
  assert.equal(n("BHP", "680").conv.from.unit, "hp");
  assert.equal(n("CV", "64").conv.from.unit, "PS"); // cavallo vapore = mã lực hệ mét
  const two = n("Rated power (HP)", "75/3000"); assert.ok(!SN.hasValue(two)); assert.ok(two.missing.includes("ambiguous"));
  assert.equal(n("Engine Power (kW)", "110").unit, "kW"); // cách đọc kW không đổi
});
