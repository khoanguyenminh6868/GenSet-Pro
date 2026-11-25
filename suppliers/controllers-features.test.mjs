// Chức năng bộ điều khiển theo từng model (controllers-features.mjs, PR G phần 1 của chuẩn hoá datasheet bước 4).
// Dòng thật của datasheet / manual hãng trong suppliers/cn (Deep Sea, SmartGen, ComAp, DEIF, Woodward, Datakom).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { featuresOfLine, controllerFeatures, ctlFeatureFields, checkCtlFeatureValues, skipOf, otherSheet, sharedManual, sheetCtx, rowFeatures, foreignSheet, BOOL_FEATURES, REVIEW_FILE } from "./controllers-features.mjs";
import { standardOf } from "./spec-standard.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8"));
const MAKERS = ["comap", "datakom", "deep-sea-electronics", "deif", "sices", "smartgen", "woodward"].map(read);
const got = (line, model, opts) => featuresOfLine(line, model, opts).values.map((v) => `${v.fid}=${v.value}`).sort();

test("dòng thật → đúng trường, mọi hãng", () => {
  // Deep Sea DSE7320 MKII: một câu cho ba trường.
  assert.deepEqual(got("| • | Integrated RS232 and RS485 ports providing Modbus RTU support", "DSE7320MKII"), ["modbus_rtu=true", "rs232=true", "rs485=true"]);
  assert.deepEqual(got("| • | Advanced PLC functionality including multi-purpose PIDs", "DSE7310MKII"), ["plc=true"]);
  // SmartGen: mã IP mặt trước (dòng "Protection Level" + gasket).
  assert.deepEqual(got("| Protection Level | IP55 Gasket", "HGM6110U"), ["front_ip=IP55"]);
  // ComAp: số tổ máy hoà; bảo vệ theo mã ANSI.
  assert.deepEqual(got("| Parallel operation up to 32 gen-sets | True RMS (TRMS) is used with Voltage, Current", "INTELIGENNT"), ["max_sets=32"]);
  assert.deepEqual(got("| Reverse power | 32R", "INTELILITE4AMF25"), ["prot_reverse_power=true"]);
  // DEIF AGC-4 và Woodward easYgen-3100XT: chia tải + số tổ máy trong cùng câu.
  assert.deepEqual(got("| Load sharing, with bus tie breakers (CANshare) (up to 127 generators) | ●", "AGC4"), ["load_sharing=true", "max_sets=127"]);
  assert.deepEqual(got("|  | Proportional load sharing (isochronous or droop) of up to 32 generators, regardless of KW rating.", "EASYGEN3100"), ["load_sharing=true", "max_sets=32"]);
  // Datakom DKG-309 (manual).
  assert.deepEqual(got("6.1. Remote start operation", "DKG309"), ["remote_start=true"]);
  assert.deepEqual(got("EMERGENCY STOP: Set if a signal is detected at the emergency stop input.", "DKG309"), ["emergency_stop=true"]);
  // Deep Sea: "Event log (50)" là số sự kiện.
  assert.deepEqual(got("| • | Configurable event log (50) | -40°C to +85°C", "DSE6010MKII"), ["event_log=50"]);
});

test("cụm chữ có ≠ có chức năng: tuỳ chọn, phủ định, mục lục, tên công ty, sản phẩm khác", () => {
  assert.equal(skipOf("Extendable options including 4G/GPS, Ethernet and RS485/RS232"), "tuy-chon");
  assert.equal(skipOf("4.3 AUTO START/STOP OPERATION ........................ 8"), "muc-luc");
  assert.equal(skipOf("| DSE890 MKII | DSEWebNet® Gateway - 4G (GSM/Ethernet) | 0890-04"), "san-pham-khac");
  assert.equal(skipOf("*Second RS485 port is not available"), "phu-dinh");
  assert.equal(skipOf("| 6.1.2 | SIM Holder (Only Link LTE)"), "chi-bien-the");
  assert.deepEqual(got("Extendable options including 4G/GPS, Ethernet and RS485/RS232", "DSE7320MKII"), []);
  // Tên công ty "Deep Sea Electronics PLC" không phải PLC.
  assert.deepEqual(got("DEEP SEA ELECTRONICS PLC", "DSE7320MKII"), []);
  assert.deepEqual(got("Deep Sea Electronics PLC", "DSE7320MKII"), []);
  // "3G" của phép thử rung không phải mạng di động.
  assert.deepEqual(got("| Vibration | 3G in X, Y and Z axes for 8 to 500 Hz. To IEC 60068-2-6", "DSE7320MKII"), []);
});

test("dòng nêu nhiều model: chữ sau tên model nào là của model đó", () => {
  const line = "| DSE7310 MKII Auto Start & DSE7320 MKII | Auto";
  assert.deepEqual(got(line, "DSE7310MKII"), ["auto_start_stop=true"]);
  assert.deepEqual(got(line, "DSE7320MKII"), []);
  // Tờ chung GC315 / GC315Plus / GC315Link: dòng không nêu model thì không gán cho model nào.
  assert.equal(sharedManual("Datasheet: Mecc Alte GC315 (GC315Plus, GC315Link)"), true);
  assert.deepEqual(got("Integrated RS485 port", "GC315", { mustName: true }), []);
  // Tờ của sản phẩm khác chỉ liệt kê bộ điều khiển tương thích.
  assert.equal(otherSheet("Datasheet: The DSEG0123 also allows the DSEG8600, DSEG8900, DSE8610 MKII, DSE8610, DSE7510 and DSE5510 controllers to be added"), true);
  assert.equal(otherSheet("Datasheet: | DSE7310 MKII Auto Start & DSE7320 MKII | Auto"), false);
});

// Soát độc lập của điều phối (25/11/2026): tờ viết chung cho nhiều biến thể.
const FEAT = controllerFeatures(MAKERS).byModel;
const has = (model, fid) => (FEAT.get(model) || []).some((x) => x.fid === fid);
test("A1 HGM6100N: 'HGM6110NC/6120NC has RS485 port, HGM6110N/6120N without', CAN chỉ bản CAN", () => {
  for (const m of ["HGM6110N", "HGM6120N", "HGM6110NC", "HGM6120NC"]) for (const f of ["can", "ecu_support"]) assert.equal(has(m, f), false, `${m} ${f}`);
  for (const m of ["HGM6110N", "HGM6120N"]) assert.equal(has(m, "rs485"), false, m);
  // Nguồn không nói bản CAN có RS485: không ghi.
  for (const m of ["HGM6110CAN", "HGM6120CAN"]) { assert.equal(has(m, "rs485"), false, m); assert.equal(has(m, "can"), true, m); }
  for (const m of ["HGM6110NC", "HGM6120NC"]) assert.equal(has(m, "rs485"), true, m);
});
test("A2 HGM6100U: RS485 chỉ bản UC", () => {
  for (const m of ["HGM6110U", "HGM6120U"]) assert.equal(has(m, "rs485"), false, m);
  for (const m of ["HGM6110UC", "HGM6120UC"]) assert.equal(has(m, "rs485"), true, m);
});
test("A3 HGM7200: '| CAN (J1939) | ● | ●' 2 / 4 ô không định vị được cột; '(controller with CAN Bus port only)' → chỉ bản CAN", () => {
  for (const m of ["HGM7210", "HGM7220"]) for (const f of ["can", "ecu_support"]) assert.equal(has(m, f), false, `${m} ${f}`);
  // PR G phần 2 (Khoa 25/11/2026): smartgen 1008 "port (controller with CAN Bus port only);" → bản có đuôi CAN nhận lại.
  for (const m of ["HGM7210CAN", "HGM7220CAN"]) for (const f of ["can", "ecu_support"]) assert.equal(has(m, f), true, `${m} ${f}`);
  const t = { title: "X", rows: ["| Items | HGM7220 | HGM7210 | HGM7220CAN | HGM7210CAN", "| CAN (J1939) | ● | ●", "port (controller with CAN Bus port only);"] };
  assert.deepEqual([...sheetCtx(t, ["HGM7220", "HGM7210", "HGM7220CAN", "HGM7210CAN"]).restrict.get("can")].sort(), ["HGM7210CAN", "HGM7220CAN"]);
  // Tờ chỉ có bản CAN (hoặc không bản nào mang đuôi): câu đó không giới hạn gì.
  assert.equal(sheetCtx({ title: "X", rows: ["(controller with CAN Bus port only)"] }, ["HGM6110CAN", "HGM6120CAN"]).restrict.has("can"), false);
  // Hàng đủ 4 ô ● vẫn cho mọi model.
  for (const m of ["HGM7210", "HGM7220CAN"]) assert.equal(has(m, "rs485"), true, m);
});
test("A4 HGM93XX MPU(CAN): khoá HGM9310 / 9320 gộp bản MPU và CAN → không ghi CAN / J1939", () => {
  for (const m of ["HGM9310", "HGM9320"]) for (const f of ["can", "ecu_support"]) assert.equal(has(m, f), false, `${m} ${f}`);
});
test("A5 easYgen-1000: bảng theo cột 1400 / 1600 / 1700 / 1800, dòng dính địa chỉ không là nguồn", () => {
  for (const f of ["prot_reverse_power", "prot_earth_fault", "data_logging", "rs485"]) assert.equal(has("EASYGEN1400", f), false, f);
  for (const m of ["EASYGEN1600", "EASYGEN1700", "EASYGEN1800"]) assert.equal(has(m, "rs485"), true, m);
  // PR G phần 2: cột "easYgen-1800 Unique Features" ("✓ SD card slot for life long data" + "log") là của 1800 MỘT mình.
  const dl = (FEAT.get("EASYGEN1800") || []).find((x) => x.fid === "data_logging" && x.src.rowEnd != null);
  assert.ok(dl, "EASYGEN1800 data_logging từ cột Unique Features");
  assert.equal(dl.raw, "✓ SD card slot for life long data log");
  for (const m of ["EASYGEN1600", "EASYGEN1700"]) assert.equal(has(m, "data_logging"), false, m);
  // Dòng bảng bảo vệ mất dấu ✓ trong specTables: vẫn không ai nhận (chờ Khoa).
  for (const m of ["EASYGEN1700", "EASYGEN1800"]) for (const f of ["prot_reverse_power", "prot_earth_fault"]) assert.equal(has(m, f), false, `${m} ${f}`);
  assert.deepEqual(got("| China | Reverse Power", "EASYGEN1400"), []);
  assert.deepEqual(got("| Tel.: +86 512 8818 5515 | Earth fault (measured)", "EASYGEN1400"), []);
});
test("B bảng so sánh dàn phẳng: '| ETHERNET | ●' dưới tiêu đề vỡ không gán cho HGM9510", () => {
  assert.equal(has("HGM9510", "ethernet"), false);
  const t = { title: "X", rows: ["| Items | HGM7220 | HGM7210 | HGM7220CAN | HGM7210CAN", "| RS485 | ● | ● | ● | ●", "| AMF | ● | ●", "| USB | — | ● | ● | ●"] };
  const ctx = sheetCtx(t, ["HGM7220", "HGM7210", "HGM7220CAN", "HGM7210CAN"]);
  assert.equal(ctx.presence(1, "HGM7210"), true);
  assert.equal(ctx.presence(2, "HGM7220"), false);
  assert.equal(ctx.presence(3, "HGM7220"), false);
  assert.equal(ctx.presence(3, "HGM7210"), true);
  assert.deepEqual([...ctx.restrict.get("usb")].sort(), ["HGM7210", "HGM7210CAN", "HGM7220CAN"]);
  assert.equal(ctx.presence(1, "HGM7210") && sheetCtx({ title: "", rows: ["| Item | HGM", "| ETHERNET | ●"] }, ["HGM9510"]).presence(1, "HGM9510"), false);
});
test("C 'Scheduled Run PCT' là ngưỡng % tải, không phải hẹn giờ chạy", () => {
  assert.deepEqual(got("| 12 | Scheduled Run PCT | (0-100)% | 80", "HGM9510"), []);
  assert.equal(has("HGM9510", "scheduler"), false);
  assert.deepEqual(got("Scheduled run with weekly exerciser", "X"), ["scheduler=true"]);
});
test("D tham số tắt, tiêu đề trang, số tổ máy có điều kiện", () => {
  assert.deepEqual(got("0: The J1939 port is inoperative.", "DKG309"), []);
  assert.deepEqual(got("168 = exerciser off", "DKG309"), []);
  assert.deepEqual(got("InteliLite 4 AMF 20 Datasheet | 2", "INTELILITE4AMF20"), []);
  assert.deepEqual(got("AGC 150 PMS lite: For simple load sharing and power management over CANshare, for up to 256 generators and/or BTBs.", "AGC150").filter((x) => x.startsWith("max_sets")), []);
  assert.equal(has("AGC4", "max_sets"), false);
});

test("cặp đã soát loại (controllers-features-loai.json) không cho giá trị", () => {
  const rej = JSON.parse(fs.readFileSync(REVIEW_FILE, "utf8")).rejects;
  assert.ok(Object.values(rej).flat().length > 600);
  const one = rej.can.find((x) => /ELECTRICITY CAN KILL/i.test(x.line));
  assert.ok(one, "dòng 'CAN' động từ phải nằm trong danh sách loại");
  assert.deepEqual(featuresOfLine(one.line, "HGM9510").values.filter((v) => v.fid === "can"), []);
  for (const [fid, list] of Object.entries(rej)) for (const x of list) assert.ok(x.line && x.why, `${fid}: thiếu line / why`);
});

test("không bao giờ ghi false; chỉ trường còn trống, giá trị cũ giữ nguyên", () => {
  const items = [{ fid: "usb", value: true, raw: "x", src: { supplierId: "a", n: 1, table: 0, row: 0 } }, { fid: "usb", value: true, raw: "y", src: { supplierId: "a", n: 1, table: 0, row: 1 } },
    { fid: "brand", value: true, raw: "z", src: { supplierId: "a", n: 1, table: 0, row: 2 } }];
  const old = { brand: [{ value: "Deep Sea", suppliers: 0 }], model: [{ value: "X", suppliers: 0 }] };
  const out = ctlFeatureFields(old, items);
  assert.deepEqual(out.brand, old.brand);
  assert.deepEqual(out.usb, [{ value: true, raw: "x", src: { supplierId: "a", n: 1, table: 0, row: 0 }, origin: "ctl-sheet", suppliers: 1 }]);
  assert.deepEqual(Object.keys(out), ["brand", "model", "usb"]);
  const boolIds = new Set(BOOL_FEATURES.map((f) => f.id));
  for (const l of controllerFeatures(MAKERS).byModel.values()) for (const it of l) if (boolIds.has(it.fid)) assert.equal(it.value, true);
});

test("bản chuẩn của các hãng BĐK: giá trị kèm dòng datasheet của chính model, kiểm chéo 0 lỗi", () => {
  const docs = standardOf(MAKERS);
  const d = docs.find((x) => x.id === "controller:DSE7320MKII");
  assert.equal(d.fields.rs485[0].value, true);
  assert.equal(d.fields.rs485[0].origin, "ctl-sheet");
  assert.equal(d.fields.rs485[0].src.supplierId, "deep-sea-electronics");
  assert.ok(/RS485/.test(d.fields.rs485[0].raw));
  // Tờ không ghi thì để trống (không false).
  for (const x of docs) if (x.part === "controller") for (const items of Object.values(x.fields)) for (const it of items) assert.notEqual(it.value, false);
  const chk = checkCtlFeatureValues(docs, MAKERS);
  assert.ok(chk.checked > 500);
  assert.deepEqual(chk.bad, []);
  // Một giá trị sửa tay sai dòng thì kiểm chéo bắt được.
  const bad = structuredClone(docs.filter((x) => x.id === "controller:DSE7320MKII"));
  bad[0].fields.rs485[0].raw = "| • | Advanced PLC functionality including multi-purpose PIDs";
  assert.equal(checkCtlFeatureValues(bad, MAKERS).bad.length, 1);
});

// ---------- PR G phần 2: trường chữ / bảng theo nhãn ô (dòng thật của tờ hãng) ----------
const rf = (rows, i, model, opts) => rowFeatures(rows, i, model, opts).map((v) => `${v.fid}=${typeof v.value === "string" ? v.value : JSON.stringify(v.value)}`).sort();
test("nhãn | giá trị: nguồn DC, nhiệt độ, kích thước, đo lường (dòng thật)", () => {
  assert.deepEqual(rf(["| Working Voltage | DC8.0V to DC35.0V, continuous"], 0, "HGM6110N"), ["dc_supply=DC8.0V to DC35.0V, continuous"]);
  assert.deepEqual(rf(["| Continuous Voltage | Rating | 8 V to 35 V DC continuous"], 0, "DSE7320MKII"), ["dc_supply=8 V to 35 V DC continuous"]);
  // Dấu âm và "º" giữ như nguồn; phần °F / inch quy đổi bỏ.
  assert.deepEqual(rf(["| Working Temperature | (-25~+70)ºC"], 0, "HGM6110N"), ["operating_temp=(-25~+70)ºC"]);
  assert.deepEqual(rf(["| Operating Temperature | -30 °C to +70 °C / -22 °F to +158 °F"], 0, "DSE7320MKII"), ["operating_temp=-30 °C to +70 °C"]);
  assert.deepEqual(rf(["| Overall (W x H x D) | 245 mm x 184 mm x 51 mm / 9.6” x 7.2” x 2.0”"], 0, "DSE7320MKII"), ["dimensions=245 mm x 184 mm x 51 mm"]);
  assert.deepEqual(rf(["| Measurement range | 10-346 V AC / 10-600 V AC"], 0, "INTELILITE4AMF25"), ["measure_voltage=10-346 V AC / 10-600 V AC"]);
  assert.deepEqual(rf(["| 3P4W | AC15V - AC360V (ph-N)"], 0, "HGM6110N"), ["measure_voltage=3P4W: AC15V - AC360V (ph-N)"]);
  assert.deepEqual(rf(["| C.T. Secondary Current | 5A (rated)"], 0, "HGM6110N"), ["measure_current=5A (rated)"]);
  assert.deepEqual(rf(["| Frequency Range | 3.5 Hz to 75 Hz"], 0, "DSE7320MKII"), ["measure_frequency=3.5 Hz to 75 Hz"]);
  // Đề mục ngay trên cho biết đại lượng của "| Accuracy | ±1 %"; giá trị tự nêu đại lượng thì đọc thẳng.
  assert.deepEqual(rf(["Voltage Measurement", "| Voltage Range | 15 V to 415 V Phase to Neutral", "| Accuracy | ±1 %"], 2, "DSE7320MKII"), ["accuracy=Voltage Measurement: ±1 %"]);
  assert.deepEqual(rf(["| Accuracy | 1 % of 277 V"], 0, "INTELIGENNT"), ["accuracy=1 % of 277 V"]);
});
test("nhãn | giá trị: KHÔNG đọc giá trị có điều kiện, cụt, của cảm biến tốc độ, của đầu ra", () => {
  // ComAp AMF25: "-40˚C to +70˚C" + dòng sau "for Low Temp. version" = của bản LT.
  assert.deepEqual(rf(["| Operating temperature | -40˚C to +70˚C | 6-36 V DC open contact", "for Low Temp. version"], 0, "INTELILITE4AMF25"), []);
  assert.deepEqual(rf(["| Frequency range | 30-520 Hz with SW key"], 0, "INTELILITE4AMF25"), []);
  // Cảm biến tốc độ (SmartGen HGM9420N), dải pick-up 10 kHz.
  assert.deepEqual(rf(["| Speed Sensor Voltage | Voltage Range: 1.0V - 24V (RMS)"], 0, "HGM9420N"), []);
  assert.deepEqual(rf(["Frequency Range: 5Hz - 10000Hz"], 0, "HGM9420N"), []);
  // DEIF AGC 150: độ chính xác của đầu ra điều tốc, không phải đo.
  assert.deepEqual(rf(["Speed governor output", "| PWM voltage range | 1 to 10.5 V", "| Voltage accuracy | ±1% of setting value"], 2, "AGC150"), []);
  // Ô của cột khác trong giá trị ("| Voltage Accuracy | Humidity: max. 93%"), giá trị cụt ("from 2 to"), đơn vị rơi xuống dòng sau.
  assert.deepEqual(rf(["| Voltage Accuracy | Humidity: max. 93%, noncondensing"], 0, "EASYGEN1400"), []);
  assert.deepEqual(rf(["| Current accuracy | • ±1 % of nominal from 2 to | 100% current"], 0, "AGC150"), []);
  assert.deepEqual(rf(["Voltage Measurement", "| Accuracy | ±1% Full Scale Phase to Neutral ±0.2", "Hz"], 1, "DSE3110"), []);
  // Giá trị nêu model khác: chỉ model đó (GC315 Link) nhận, model khác của tờ không.
  assert.deepEqual(rf(["| Operating temperature | -25°C to +60°C -25°C to +50°C for GC315 Link"], 0, "GC315LINK"), []);
});
test("màn hình, ngôn ngữ, số ngõ vào / ra (dòng thật)", () => {
  assert.deepEqual(rf(["| Type | Build-in monochromatic 3.2\""], 0, "INTELILITE4AMF25"), ["display=Build-in monochromatic 3.2\""]);
  assert.deepEqual(rf(["|  | 480x272 LCD with backlight, multilingual interface (including English, Chinese or other languages)"], 0, "HGM9510"),
    ["display=480x272 LCD with backlight", "languages=multilingual interface (including English, Chinese or other languages)"]);
  assert.deepEqual(rf(["Chinese, English, Spanish, Turkish and Russian interface can be selected."], 0, "HGM410"), ["languages=Chinese, English, Spanish, Turkish and Russian"]);
  // Danh sách bị cắt ("| Selectable Chinese, English | and") và tham số chọn ngôn ngữ ("0: English language") không đọc.
  assert.deepEqual(rf(["| Selectable Chinese, English | and"], 0, "HGM9510"), []);
  assert.deepEqual(rf(["0: English language selected."], 0, "DKG309"), []);
  // Số ngõ: cột của chính model dưới tiêu đề model; "| Number | 8" ngay dưới đề mục.
  const t = { title: "X", rows: ["| Items | HGM7220 | HGM7210 | HGM7220CAN | HGM7210CAN", "| Digital Input Port | 7 | 7 | 7 | 7", "| Relay Output port | 8 | 8"] };
  const ctx = sheetCtx(t, ["HGM7220", "HGM7210", "HGM7220CAN", "HGM7210CAN"]);
  assert.deepEqual(rf(t.rows, 1, "HGM7210CAN", { ctx }), ['io={"kind":"digital_in","count":7}']);
  assert.deepEqual(rf(t.rows, 2, "HGM7210CAN", { ctx }), []);
  assert.deepEqual(rf(["Digital Inputs", "| Number | 8"], 1, "DSE7320MKII"), ['io={"kind":"digital_in","count":8}']);
  // Đề mục cách hơn một dòng (ComAp hai cột dàn phẳng): không biết "Number" của mục nào.
  assert.deepEqual(rf(["Binary outputs", "| Operating humidity | 95 % non-condensing", "| Number | 6"], 2, "INTELINANOAMF5"), []);
});
test("bảo vệ (bảng ANSI) và cảnh báo (nhãn warning): không tự phân loại", () => {
  const ansi = ["Support of functions and protections as defined by ANSI (American National Standards Institute):", "| Master unit | 1", "| Reverse power | 32R",
    "| Voltage unbalance / Negative sequence | voltage | 47", "| voltage | 47", "| AC circuit breaker | 52", "| Load shedding | 32P"];
  assert.deepEqual(rf(ansi, 2, "INTELIGEN4"), ["protections=Reverse power (ANSI 32R)"]);
  assert.deepEqual(rf(ansi, 3, "INTELIGEN4"), ["protections=Voltage unbalance / Negative sequence voltage (ANSI 47)"]);
  // Thiết bị không phải bảo vệ (1 master, 52 máy cắt), chức năng (sa thải tải), tên cụt: không ghi.
  for (const i of [1, 4, 5, 6]) assert.deepEqual(rf(ansi, i, "INTELIGEN4"), [], ansi[i]);
  // Bảng không nói là mã ANSI (SmartGen tham số "| 6 | Warning | (0-60)°C | 40"): không đọc.
  assert.deepEqual(rf(["PROTECTION", "| 6 | Warning | (0-60)°C | 40"], 1, "HGM4020T"), []);
  // Datakom: (warning) → cảnh báo; (alarm) / (load_dump) dừng máy theo định nghĩa của manual → bảo vệ; không nhãn → không ghi.
  assert.deepEqual(rf(["LOW BATTERY VOLTAGE (warning): Set if the battery voltage goes below the programmed limit."], 0, "DKG309"), ["alarms=LOW BATTERY VOLTAGE"]);
  assert.deepEqual(rf(["START FAIL (alarm): Set if the engine is not running after programmed number of start attempts."], 0, "DKG309"), ["protections=START FAIL"]);
  assert.deepEqual(rf(["LOW OIL PRESSURE: Set if a signal is detected at the Low Oil Pressure Switch input or the oil"], 0, "DKG309"), []);
});
test("tờ của sản phẩm khác dưới tiêu đề BĐK (Part Number), HGM93XX, AGC-4 max_sets", () => {
  const dse = read("deep-sea-electronics");
  const bad = dse.specTables.filter(foreignSheet).map((t) => t.n);
  assert.deepEqual(bad, [1020, 1034, 1035, 1036, 1037, 1038, 1039]);
  assert.equal(foreignSheet(dse.specTables.find((t) => t.n === 1026)), false);
  for (const [m, l] of FEAT) for (const x of l) if (x.src.supplierId === "deep-sea-electronics") assert.ok(!bad.includes(x.src.n), `${m} ${x.fid} từ ${x.src.n}`);
  // DSE8680 / DSE8660 MKII không nhận "8 V to 35 V" của mô-đun DSE2133 / DSE2548.
  assert.deepEqual((FEAT.get("DSE8680") || []).filter((x) => x.fid === "dc_supply").map((x) => x.src.n), [1026]);
  for (const f of ["can", "ecu_support"]) for (const m of ["HGM9310", "HGM9320"]) assert.equal(has(m, f), false);
  assert.equal(has("AGC4", "max_sets"), false);
});

// ---------- Soát độc lập của điều phối cho PR G phần 2 (25/11/2026) ----------
const vals = (model, fid) => (FEAT.get(model) || []).filter((x) => x.fid === fid);
test("A dấu sao chú thích 'Extension module … required': không là có sẵn (ComAp Earth fault**)", () => {
  for (const m of ["INTELILITE4AMF25", "INTELILITE4AMF9", "INTELILITE4MRS16", "INTELIMAINSNTC"]) assert.ok(!vals(m, "protections").some((x) => /Earth fault/.test(x.value)), m);
  // Hàng không dấu sao của cùng bảng vẫn có.
  assert.ok(vals("INTELILITE4AMF25", "protections").some((x) => x.value === "Reverse power (ANSI 32R)"));
  const t = { title: "X", rows: ["| Earth fault** | 50G", "| Reverse power | 32R", "| *Dual operation | **Extension module | EM-BIO8-EFCP", "| required | *** extension module | IGL-RA15"] };
  const ctx = sheetCtx(t, ["INTELILITE4AMF25"]);
  assert.equal(ctx.starOpt(0), true);
  assert.equal(ctx.starOpt(1), false);
  // "*MINT" là chế độ, không phải tuỳ chọn.
  assert.deepEqual([...sheetCtx({ title: "X", rows: ["| *MINT | ** extension module IGL-RA15"] }, ["X"]).optStars], [2]);
});
test("B 'U: 1 % from value' là độ chính xác ngõ vào analog, không phải đo AC", () => {
  for (const m of ["INTELIGEN4", "INTELILITE4AMF25", "INTELILITE4MRS16"]) assert.ok(!vals(m, "accuracy").some((x) => /^U:/.test(x.value)), m);
  assert.deepEqual(rf(["| Accuracy | U: 1 % from value ±100 mV"], 0, "INTELIGEN4"), []);
  // Giá trị tự nêu đại lượng AC vẫn có.
  assert.deepEqual(rf(["| Accuracy | 1 % of 277 V"], 0, "INTELIGENNT"), ["accuracy=1 % of 277 V"]);
});
test("C giá trị nhiều dòng: đọc đủ (rowEnd), không lấy riêng dòng đầu", () => {
  for (const m of ["DSE7310MKII", "DSE7320MKII", "DSE7410MKII", "DSE7420MKII"]) {
    const l = vals(m, "measure_current");
    assert.deepEqual(l.map((x) => x.value), ["0 A to 1 A / 0 A to 5 A"], m);
    assert.equal(l[0].src.rowEnd, l[0].src.row + 1);
  }
  // Dòng đầu một mình không cho giá trị.
  assert.deepEqual(rf(["| Current Range | 0 A to 1 A", "0 A to 5 A"], 0, "DSE7320MKII"), []);
  // "15 V to 415 V Phase" + "to | Neutral": cụt, bỏ (I).
  for (const m of ["DSE8610MKII", "DSE8660MKII", "DSE8680"]) assert.deepEqual(vals(m, "measure_voltage"), [], m);
  // DEIF: danh định + dải làm việc ở dòng sau, ghi cả hai (F); danh định một mình không đọc.
  assert.deepEqual(vals("AGC150", "dc_supply").map((x) => x.value), ["Nominal voltage: 12 V DC or 24 V DC / Operating range: 6.5 to 36 V DC"]);
  assert.deepEqual(rf(["| Power supply range | Nominal voltage: 12 V DC or 24 V DC"], 0, "AGC150"), []);
});
test("E Datakom ECU FAIL chỉ của bản CANBUS; D 14 languages của bản có màn hình màu", () => {
  for (const m of ["DKG307", "DKG309"]) {
    for (const f of ["alarms", "protections"]) assert.ok(!vals(m, f).some((x) => x.value === "ECU FAIL"), `${m} ${f}`);
    assert.ok(vals(m, "alarms").some((x) => x.value === "LOW BATTERY VOLTAGE"), m);
  }
  assert.deepEqual(vals("EASYGEN3100", "languages"), []);
});
test("K bảng ANSI có cột ứng dụng / biến thể (dấu ● mất) → không gán; bảng một cột vẫn đọc", () => {
  // Bảng "Protections overview" có cột Genset / Mains / BTB (AGC 150), "AGC 212/222/…" (AGC 200), "All" (AGC-4): không gán. Còn bảng
  // "Engine protections" của mục bộ điều khiển máy phát (không cột ứng dụng) thì đọc.
  for (const m of ["AGC150", "AGC200", "AGC4"]) assert.ok(vals(m, "protections").every((x) => x.value === "Overspeed (ANSI 12)"), m);
  assert.ok(!vals("AGC150", "protections").some((x) => /Reverse power|Directional/.test(x.value)));
  assert.ok(vals("SGC420", "protections").some((x) => x.value === "Reverse power (ANSI 32R)"));
  const rows = ["| 1.5 | Protections overview", "| Protections | Alarms", "| ANSI | Operate", "| Genset* | Mains", "BTB", "| Reverse power | 3 | 32R | <200 ms"];
  assert.deepEqual(rf(rows, 5, "AGC150"), []);
  // J: tên bảo vệ bị ngắt trước danh từ.
  assert.deepEqual(rf(["Functions and protections as defined by ANSI", "| Voltage controlled | 51C"], 1, "INTELIGEN1000"), []);
});
test("L 'Alternator Frequency 50/60Hz' là tần số định mức, không phải dải đo; H dải con không đọc", () => {
  for (const m of ["EASYGEN1400", "EASYGEN1800", "HGM6110N", "HGM9510", "HGM7210CAN"]) assert.ok(!vals(m, "measure_frequency").some((x) => /50\s*Hz\s*\/|50\/60/.test(x.value)), m);
  assert.deepEqual(rf(["| AC Alternator Frequency | 50Hz/60Hz"], 0, "HGM6110N"), []);
  // Dải thật vẫn đọc.
  assert.deepEqual(rf(["| Frequency Range | 3.5 Hz to 75 Hz"], 0, "DSE7320MKII"), ["measure_frequency=3.5 Hz to 75 Hz"]);
  assert.deepEqual(rf(["| 40-70 Hz (accuracy 0.1 Hz) | Speed governor", "output", "| Frequency range | 45-55 Hz (accuracy <0.01 Hz)"], 2, "INTELIGENNTC"), []);
});
test("M HGM7210CAN / 7220CAN: can / ecu_support chỉ từ câu '(controller with CAN Bus port only)'", () => {
  for (const m of ["HGM7210CAN", "HGM7220CAN"]) for (const f of ["can", "ecu_support"]) {
    const l = vals(m, f);
    assert.equal(l.length, 1, `${m} ${f}`);
    assert.ok(/controller with CAN Bus port only/.test(l[0].raw) && l[0].src.rowEnd > l[0].src.row, `${m} ${f}`);
  }
});
