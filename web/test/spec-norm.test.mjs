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
  ["disp", "Displacement (cc)", "418", null, { unit: "cc", num: 418, missing: [] }], // mingbang-mbkl: no cc→L formula, kept
  // No unit written anywhere: disp only takes a default unit by magnitude (Khoa 14/11, "displacement nên default đơn vị là
  // L hoặc cm³ (cc)"): 0.4–100 → L, 400–100000 → cc, cond.unitFrom "default"; outside both bands still missing.
  ["disp", "Displacement", "38", null, { unit: "L", num: 38, cond: { unitFrom: "default" }, missing: [] }], // aosif
  ["disp", "排量", "7.146", null, { unit: "L", num: 7.146, cond: { unitFrom: "default" }, missing: [] }], // kanpor-fuan n122
  ["disp", "Displacement", "1642", null, { unit: "cc", num: 1642, cond: { unitFrom: "default" }, missing: [] }], // rule test: cc band
  ["disp", "Displacement", "171", null, { unit: null, num: 171, missing: ["unit"] }], // rule test: between the bands
  ["disp", "Displacement", "1.6", { title: "Engine data (cc)" }, { unit: null, num: 1.6, missing: ["unit"] }], // rule test: the title writes a unit
  // A label that writes some other unit is not "no unit": no default (jlmech "(mm)", honny "(A)" for displacement).
  ["disp", "Displacement (mm)", "4.3", null, { unit: null, num: 4.3, missing: ["unit"] }], // jlmech-wuhan n102
  ["disp", "排量 (A)", "14", null, { unit: null, num: 14, missing: ["unit"] }], // honny-dongguan n101
  ["disp", "Displacement [ccm]", "171", null, { unit: "cc", num: 171, missing: [] }], // endress-stromerzeuger n108: ccm = cm³, read from the label
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
