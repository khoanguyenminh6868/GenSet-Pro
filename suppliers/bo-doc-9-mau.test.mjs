// node --test suppliers/bo-doc-9-mau.test.mjs — lỗi bộ đọc của bộ kiểm giá trị, 9 mẫu L1-B1 … L1-B9 (báo cáo
// dieu-phoi nghiem-thu/gia-tri-nghi-sai-gom-nhom.md, Khoa 24/11/2026: ca do bộ đọc thì sửa bộ đọc theo mẫu). Mỗi ca là dòng
// nguyên văn của NCC (ghi NCC + số nguồn); bảng giả chỉ chép đúng các dòng đó.
import test from "node:test";
import assert from "node:assert/strict";
import { standardOf } from "./spec-standard.mjs";

const SN = globalThis.GenbidSpecNorm, C = globalThis.GenbidCatalog;
const norm = (key, label, value, ctx = {}) => SN.normalize({ key, label, value }, { title: "", header: [], ...ctx });
const pick = (r) => Object.fromEntries(["num", "range", "options", "unit", "dims", "cond"].filter((k) => r[k] != null).map((k) => [k, r[k]]));
const sup = (id, tables) => ({ id, country: "CN", role: "genset_oem", names: { en: id }, specTables: tables });
const recs = (s) => C.fromSupplier(s, []);
const specOf = (r, key) => (r.specs || []).filter((x) => x.key === key).map((x) => x.value);

// ---------- L1-B1: tốc độ trong ô công suất động cơ ----------
test("B1: '47@1500' dưới 'Rated power output (kW@RPM)' = 47 kW ở 1500 v/p (penlucky n116)", () => {
  const r = norm("engPower", "Rated power output (kW@RPM)", "47@1500");
  assert.deepEqual(pick(r), { num: 47, unit: "kW", cond: { rpm: 1500 } });
  assert.deepEqual(r.missing, []);
  assert.deepEqual(pick(norm("engPower", "Rated Power (kW@rpm)", "142 @ 2200")), { num: 142, unit: "kW", cond: { rpm: 2200 } }); // kangjin-power n101
});
test("B1: '75-118/3000' dưới '额定功率/转速（kw/rpm）' = dải 75–118 kW ở 3000 v/p (yunnei-power n104)", () => {
  assert.deepEqual(pick(norm("engPower", "额定功率/转速（kw/rpm）", "75-118/3000")), { range: [75, 118], unit: "kW", cond: { rpm: 3000 } });
  assert.deepEqual(pick(norm("engPower", "额定功率 / 转速 （kw/rpm）", "118-125/3000")), { range: [118, 125], unit: "kW", cond: { rpm: 3000 } }); // n102 D25Pro
});
test("B1: '24kW At 1500R.P.M.' = 24 kW ở 1500 v/p (hosem-power n136)", () => {
  assert.deepEqual(pick(norm("engPower", "Engine Output", "24kW At 1500R.P.M.")), { num: 24, unit: "kW", cond: { rpm: 1500 } });
});
test("B1: '18kw/1500' dưới 'Engine power (kW)' = 18 kW; 1500 không là công suất, cũng không đọc thành v/p (eastern-lion-fuan n129)", () => {
  const hs = ["| | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet", "| Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller | Datasheet"];
  const r = norm("engPower", "Engine power (kW)", "18kw/1500", { header: hs });
  assert.deepEqual(pick(r), { num: 18, unit: "kW" });
  assert.deepEqual(r.missing, ["speed"]);
  // Nhãn đã nêu đơn vị số sau ("(KW/RPM)", fdk-energy n1077): đọc như trước, có v/p.
  assert.deepEqual(pick(norm("engPower", "Prime power / Speed (KW/RPM)", "8.6kw/1500")), { num: 8.6, unit: "kW", cond: { rpm: 1500, rating: "prime" } });
  // Số sau không là tốc độ đồng bộ, hay không quá 3 lần số trước: giữ "ambiguous" như trước.
  assert.ok(norm("engPower", "Engine power (kW)", "1000kw/1200").missing.includes("ambiguous"));
  assert.ok(norm("engPower", "Engine power (kW)", "18kw/22").missing.includes("ambiguous"));
});
test("B1 chưa sửa: '36/49/1500' dưới '(kw/rpm)' (ricardo-weifang n103) — nhãn nêu 2 đại lượng, ô 3 số", () => {
  assert.ok(norm("engPower", "Rated Power/Speed(kw/rpm)", "36/49/1500").missing.includes("ambiguous"));
});

// ---------- L1-B2: số kích thước có dấu cách lạc ----------
test("B2: '240 0×880×1360', '6200 × 1950 ×3 000', '2255 ×8 70 × 1260' = 3 số (zhengdian-zhengzhou n101 / n104 / n108)", () => {
  const L = "机组外型尺寸 mm×mm×mm";
  assert.deepEqual(norm("dims", L, "240 0×880×1360").dims, { asWritten: [2400, 880, 1360] });
  assert.deepEqual(norm("dims", L, "6200 × 1950 ×3 000").dims, { asWritten: [6200, 1950, 3000] });
  assert.deepEqual(norm("dims", "机组包装外型尺寸 mm×mm×mm", "2255 ×8 70 × 1260").dims, { asWritten: [2255, 870, 1260] });
  assert.deepEqual(norm("dims", L, "1740×770 ×12 00").dims, { asWritten: [1740, 770, 1200] });
  // Không đúng 3 mảnh chỉ có chữ số và dấu cách: như trước.
  assert.ok(norm("dims", L, "240 0×880×1360×2").missing.includes("ambiguous"));
  assert.ok(norm("dims", L, "3000×1120×1950 / 4000×1430×2040").missing.includes("ambiguous"));
});

// ---------- L1-B3: số pha trong ô điện áp ----------
test("B3: '230V - 3 Phase' = 230 V, 3 pha (hosem-power n110)", () => {
  const r = norm("voltage", "Voltage", "230V - 3 Phase");
  assert.deepEqual(pick(r), { num: 230, unit: "V", cond: { phase: 3 } });
  assert.deepEqual(pick(norm("voltage", "Voltage", "230V - 400V")), { range: [230, 400], unit: "V" });
});

// ---------- L1-B4: nhãn nhận nhầm trường ----------
test("B4: 'Coolant Ratio', 'Type of lub-oil' không là dung tích (aosif n1062 / 1078 / 1088, repower-gas n1001)", () => {
  assert.equal(C.specKey("Coolant Ratio"), null);
  assert.equal(C.specKey("Type of lub-oil"), null);
  assert.equal(C.specKey("Coolant"), "coolant");
  assert.equal(C.specKey("Oil system (L)"), "oil");
  assert.equal(C.specKey("Lubrication system"), "oil");
});
test("B4: 'Engine Type | 6 cylinder in line' không là kiểu động cơ (yihua-fujian n106)", () => {
  const ok = (v) => C.SPEC.engType.ok.test(v);
  assert.equal(ok("6 cylinder in line"), false);
  for (const v of ["4-stroke diesel", "Vertical, water-cooled, 4 stroke", "4stroke,line", "2-cylinder ,4-Stroke, Air-cooled"]) assert.ok(ok(v), v);
});
test("B4: 'Piston Cooling | Oil cooled' không vào trường làm mát khí nạp (aosif n1086)", () => {
  const rows = (l) => ["| Genset Model | T-560", "| Prime Power | 636KVA/509KW", "| Standby Power | 700KVA/560KW", "Engine specification", "| Model | VTA28-G5", l];
  const field = (l) => standardOf([sup("t-b4-piston", [{ n: 1, title: "Datasheet", header: [], rows: rows(l) }])]).find((d) => d.id === "engine:VTA28G5")?.fields.charge_cooling?.map((x) => x.value);
  assert.equal(field("| Piston Cooling | Oil cooled"), undefined);
  assert.deepEqual(field("| Charge Air Cooling | Air-to-Air Heat"), ["Air-to-Air Heat"]);
});

// ---------- L1-B5: "Engine type" phủ hai cột của tầng dưới ----------
test("B5: 'Turbocharged' dưới 'Engine type' (tầng dưới: No. of Cylinder | Aspirated) không là kiểu động cơ (jet-power n125)", () => {
  const s = sup("t-b5-jet", [{ n: 125, title: "Silent Water Cooled KUBOTA Diesel Generator Set | Jet Power",
    header: ["| Model | 400V / 50Hz / 1500RPM | Kubota Diesel Engine | Alternator | Open type | Soundproof type", "| Standby output | Prime Output | Model | Engine type | Displacement | Bore×Stroke | Stamford Copy | Packing (mm) | Weight | Packing (mm) | Weight", "| KVA | KW | KVA | KW | No. of Cylinder | Aspirated | (L) | (MM) | (L x W x H) | Kg | (L x W x H) | Kg"],
    rows: ["| K-22 | 22 | 17.6 | 20 | 16 | V2003-T-E2BG-CHN-1/20.4KW | 4 | Turbocharged | 1.999 | 83 x 92.4 | JET184E/18KW | 1600*750*1050 | 580 | 2000*950*1150 | 810"] }]);
  const e = recs(s).find((r) => r.kind === "engine");
  assert.ok(e, "có bản ghi động cơ");
  assert.deepEqual(specOf(e, "engType"), []);
  assert.deepEqual(specOf(e, "disp"), ["1.999"]);
});

// ---------- L1-B6: ô công suất của dòng đọc thành tiêu hao ----------
test("B6: 'Cons 100%（L/h）' = 350 là kVA PRP dưới 'KVA' phủ 'ESP | PRP' (legapower n101): bỏ", () => {
  const s = sup("t-b6-lega", [{ n: 101, title: "Open type genset-Fujian Everstrong Lega Power Equipments Co., Ltd.",
    header: ["| Genset Specification 400/230V 50HZ | Engine Soecification | Datasheet", "| Genset Model | KVA | Cons 100%（L/h） | Engine Model | Cyl | Gov | Displacement(L)", "| ESP | PRP"],
    rows: ["| LG385C | 385 | 350 | N.A | QSZ13-G6 | 6L | ECM | 13 |"] }]);
  const e = recs(s).find((r) => r.kind === "engine");
  assert.ok(e);
  assert.deepEqual(specOf(e, "fuel"), []);
});
test("B6: 'Cons 100% ( L/H )' = '180/225' là kW / kVA prime (wintpower n105): bỏ", () => {
  const s = sup("t-b6-wint", [{ n: 105, title: "China Yto Diesel Power Generator Set | WINTPOWER",
    header: ["| Genset Model | 60HZ PF=0.8 440/220V 3Phase 4Wire | Engine specification", "| Prime Power | Standby Power | Cons 100% ( L/H ) | Engine Model | Alternator Model", "| KW/KVA | KW/KVA"],
    rows: ["| WT-YTO248 | 198/248 | 180/225 | YM6H4L-18 | YM6H4L-D119EF-U2 | WT274G160"] }]);
  const e = recs(s).find((r) => r.kind === "engine");
  assert.ok(e);
  assert.deepEqual(specOf(e, "fuel"), []);
});

// ---------- L1-B7: trang nhiều mức công suất ----------
test("B7: 'Prime power (PRP) [kVA/kW] | 45,5/36,4' đọc được; các dòng 'Power [kVA/kW]' của máy khác không đọc (endress n1017)", () => {
  const s = sup("t-b7-endress", [{ n: 1017, title: "Endress Generators: Detail view", header: [], rows: ["Endress Generators: Detail view", "| Prime power (PRP) [kVA/kW] | 45,5/36,4", "| Alternator type | ECP32 2S4 C", "| Brand | Cummins", "| Model | 4BT3.9-G2", "| Fuel consumption @ 75% PRP [L/h] | 8,4", "| Power [kVA/kW] | 21,8/17,5", "| Power [kVA/kW] | 25/20", "| Power [kVA/kW] | 30,9/24,7", "| Power [kVA/kW] | 45,5/36,4"] }]);
  const r = recs(s)[0];
  assert.ok(r);
  assert.deepEqual(r.power, { prime: { kVA: 45.5, kW: 36.4 } });
});

// ---------- L1-B8: công suất của động cơ đọc thành của tổ máy ----------
test("B8: mục '| 发动机 | 参' bị tách ô: model động cơ đúng, công suất kW của động cơ không thành của tổ máy (shanhua n1024)", () => {
  const s = sup("t-b8-shanhua", [{ n: 1024, title: "Datasheet: View Details", header: [], rows: ["| 机组型号 | HL200GF", "| 电压 Voltage | 功率 Power", "| 备用功率 Standby Power | 220 | 275", "| 主用功率 Prime Power | 200 | 250", "| 发动机 | 参", "| 发动机型号 Engine Model | 6LTAA8.9-G2", "| 常用功率 Base Output Power (kW) | 240", "| 备用功率 Standby Power (kW) | 220", "| Alternator Model | UCDI274K14"] }]);
  const e = recs(s).find((r) => r.kind === "engine");
  assert.ok(e, "có bản ghi động cơ");
  assert.equal(e.model, "6LTAA8.9-G2");
  assert.equal(e.power, null);
});

// ---------- L1-B9: ô đơn vị "mm*mm" chiếm chỗ cột model đầu ----------
test("B9: '缸径*行程 | mm*mm | …' — đường kính × hành trình đúng cột model (kanpor-fuan n102)", () => {
  const s = sup("t-b9-kanpor", [{ n: 102, title: "康明斯 180-260kw-福安市康普电机有限公司", header: [], rows: ["| 机组型号 | | KPC250 | KPC275 | KPC275 | KPC330 | KPC350", "| 额定功率 | KW/KVA | 180/225 | 200/250 | 200/250 | 240/300 | 260/325", "| 备用功率 | KW/KVA | 200/250 | 220/275 | 220/275 | 264/330 | 280/350", "| 动力型号 | | 6LTAA8.9-G2 | 6LTAA8.9-G3 | NTA855-GA | NTA855-G1A | MTAA11-G3", "| 缸数 | QTY | 6 | 6 | 6 | 6 | 6", "| 缸径*行程 | mm*mm | 114×135 | 114×135 | 140×152 | 140×152 | 125×147", "| 排量 | L | 8.9 | 8.9 | 14 | 14 | 10.8"] }]);
  const by = Object.fromEntries(recs(s).filter((r) => r.kind === "engine").map((r) => [r.model, specOf(r, "bore")[0] ?? null]));
  assert.deepEqual(by, { "6LTAA8.9-G2": "114×135", "6LTAA8.9-G3": "114×135", "NTA855-GA": "140×152", "NTA855-G1A": "140×152", "MTAA11-G3": "125×147" });
});
