// Chức năng bộ điều khiển theo từng model (controllers-features.mjs, PR G phần 1 của chuẩn hoá datasheet bước 4).
// Dòng thật của datasheet / manual hãng trong suppliers/cn (Deep Sea, SmartGen, ComAp, DEIF, Woodward, Datakom).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { featuresOfLine, controllerFeatures, ctlFeatureFields, checkCtlFeatureValues, skipOf, otherSheet, sharedManual, BOOL_FEATURES, REVIEW_FILE } from "./controllers-features.mjs";
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
