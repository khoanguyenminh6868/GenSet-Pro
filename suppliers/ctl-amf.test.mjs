// bdk-amf (Khoa 20/11/2026, IB2600603983 "1. Có 2. Có"): loại bộ điều khiển đọc từ datasheet hãng, ATS / mất lưới của HSMT,
// phương án khác theo datasheet hãng ghi "NCC chưa chào". Dòng lấy nguyên văn từ cn/deep-sea-electronics.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as CM from "./ctl-module.mjs";

const dse = JSON.parse(fs.readFileSync(new URL("./cn/deep-sea-electronics.json", import.meta.url), "utf8"));

test("ctlKinds: loại theo chữ datasheet hãng, không theo số model", () => {
  const k = CM.ctlKinds([dse]);
  assert.equal(k.get("DSE7310"), "start");
  assert.equal(k.get("DSE7320"), "amf");
  assert.equal(k.get("DSE7410"), "start");
  assert.equal(k.get("DSE7420"), "amf");
  assert.equal(k.get("DSE8610"), "sync");
  assert.equal(CM.kindOf(k, "DSE7320 MKII"), "amf");
  // Chỉ bảng của controller_maker.
  assert.equal(CM.ctlKinds([{ ...dse, role: "genset_oem" }]).size, 0);
  // Chữ đứng TRƯỚC model là của model khác; chữ sau model tới model kế tiếp là của nó.
  const one = (line) => CM.ctlKinds([{ role: "controller_maker", specTables: [{ n: 1, title: "", rows: [line] }] }]);
  assert.deepEqual([...one("The DSE7310 MKII is an auto start control module and the DSE7320 MKII is an auto mains (utility) failure control module")], [["DSE7310", "start"], ["DSE7320", "amf"]]);
  assert.equal(one("| • | Mains (utility) failure detection including mains (utility) decoupling | DSE8610 MKII").size, 0);
  assert.equal(one("The DSE8610 MKII is a market-leading Synchronising Auto Start Control Module").get("DSE8610"), "sync");
});

// SmartGen, ComAp, Datakom, DEIF, Woodward (bdk-loai, Khoa 20/11/2026 "2. Ok làm đi"): dòng nguyên văn từ cn/*.json, model đọc
// bằng controllersIn của catalog.js như config-bot (ctlModelsIn).
test("ctlKinds: SmartGen / ComAp / Datakom / DEIF / Woodward theo chữ của datasheet", async () => {
  const { ctlModelsIn } = await import("./config-bot.mjs");
  const read = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
  const k = CM.ctlKinds(["smartgen", "comap", "datakom", "deif", "woodward"].map(read), { modelsIn: ctlModelsIn });
  const want = { HGM6110N: "start", HGM6110NC: "start", HGM6120N: "amf", HGM6120CAN: "amf", HGM6110U: "start", HGM6120UC: "amf", HGM9510: "sync",
    INTELILITE4AMF25: "amf", INTELILITE4AMF9: "amf", INTELILITE4MRS16: "start", INTELIGENNT: "sync", INTELIGEN1000: "sync",
    DKG309: "amf", DKG116: "start", SGC420: "amf", EASYGEN1800: "amf", EASYGEN3500: "sync" };
  for (const [m, v] of Object.entries(want)) assert.equal(k.get(m), v, m);
  // Không đọc được thì để trống: DEIF AGC-4 / AGC-200, easYgen-1700 / 3100 / 3200.
  for (const m of ["AGC4", "AGC200", "EASYGEN1700", "EASYGEN3200"]) assert.equal(k.get(m), undefined, m);
  // Nhà cung cấp ghi tắt "AMF25" → tờ "InteliLite 4 AMF25".
  assert.equal(CM.kindOf(k, "AMF25"), "amf");
});

test("needsAmf: chỉ khi HSMT gắn ATS / mất lưới với bộ điều khiển máy phát, hoặc nêu thẳng AMF (Khoa 20/11/2026 'ATS: 1')", () => {
  assert.equal(CM.needsAmf("6   Chức năng điều khiển    + Kết hợp với tủ ATS."), true);
  assert.equal(CM.needsAmf("- Bộ ATS phải được đấu nối đồng bộ với phần động lực và bộ điều khiển của máy"), true);
  assert.equal(CM.needsAmf("b) Bộ điều khiển:\n- Màn hình LCD\n- Có tính năng kết nối với ATS (Khởi động, tắt máy từ xa)"), true);
  assert.equal(CM.needsAmf("- Chức năng AMF"), true);
  // Tủ ATS riêng, không gắn với bộ điều khiển; danh mục bộ phận; bộ điều khiển của chính tủ ATS; sau một mục mới.
  assert.equal(CM.needsAmf("Tủ chuyển đổi nguồn tự động 1000A"), false);
  assert.equal(CM.needsAmf("- Khi mất điện lưới hoặc khi điện lưới quá thấp"), false);
  assert.equal(CM.needsAmf("- Động cơ, đầu phát, bộ điều khiển, tủ chuyển đổi nguồn tự động ATS: sản xuất từ năm 2023"), false);
  assert.equal(CM.needsAmf("2.2 Bộ điều khiển ATS 1 bộ"), false);
  assert.equal(CM.needsAmf("b) Bộ điều khiển: màn hình LCD\n6. Tủ chuyển đổi nguồn tự động (ATS):"), false);
  // Gói sửa chữa / bảo trì (tên gói ở đầu HSMT); gói mua máy thay máy cũ thì vẫn xét.
  const ctl = "Chức năng điều khiển + Kết hợp với tủ ATS.";
  assert.equal(CM.needsAmf(ctl, { head: "Tên gói thầu: Gói thầu số 06: Sửa chữa máy phát điện cho Văn phòng" }), false);
  assert.equal(CM.needsAmf(ctl, { head: "Gói thầu: Dịch vụ bảo trì máy phát điện" }), false);
  assert.equal(CM.needsAmf(ctl, { head: "Tên gói thầu: Mua sắm và lắp đặt máy phát điện thay thế" }), true);
  assert.equal(CM.needsAmf(ctl, { head: "Tên gói thầu số 03: Thay thế, lắp đặt máy phát điện" }), true);
  assert.equal(CM.needsAmf("Thermostats ats amf controller"), false);
  // Bảng dàn thành một dòng dài: đọc từng câu; việc lắp đặt, danh mục hàng, năm sản xuất, dòng hàng "BỘ ATS 100 A" không tính.
  const pad = "x ".repeat(110);
  assert.equal(CM.needsAmf(`${pad}Bộ điều khiển: màn hình LCD. Lắp đặt máy phát điện, tủ ATS (cáp chờ sẵn). ${pad}`), false);
  assert.equal(CM.needsAmf(`${pad}Bộ điều khiển: màn hình LCD. Kết hợp được với tủ ATS. ${pad}`), true);
  assert.equal(CM.needsAmf("Động cơ, đầu phát, bộ điều khiển và tủ ATS."), false);
  assert.equal(CM.needsAmf("Bộ điều khiển LCD\nATS) sản xuất từ năm 2024 trở về sau"), false);
  assert.equal(CM.needsAmf("Bộ điều khiển LCD\nBỘ ATS 100 A"), false);
});

// Điều phối 21/11/2026 (IB2600603983, agent giữ DSE7420 MKII): "đủ yêu cầu" tính theo CẶP bộ điều khiển + mô-đun tốt nhất.
test("lowestCtlMd: bộ thấp nhất đủ yêu cầu theo cặp với mô-đun, loại AMF khi HSMT đòi", async () => {
  const CB = await import("./config-bot.mjs"), CAT = globalThis.GenbidCatalog;
  const facts = CB.modelFacts(CAT.build([dse]), [dse]), kinds = CM.ctlKinds([dse]);
  const hsmt = "b) Bộ điều khiển: kết hợp với tủ ATS\n- Truyền thông: RS232, RS485, Ethernet, điều khiển từ xa qua Internet/4G";
  assert.deepEqual(CB.hsmtCommNames(hsmt), ["4G", "Internet", "Ethernet", "RS485", "RS232"]);
  const md = CB.lowestCtlMd(["DSE7310 MKII", "DSE7320 MKII", "DSE7420 MKII"], facts, [dse], hsmt, kinds);
  assert.match(md, /- DSE7320 MKII \+ DSE890 MKII \(tự động khi mất lưới \(AMF\)\): đạt 5\/5 ← thấp nhất đủ/);
  assert.match(md, /- DSE7420 MKII \+ DSE890 MKII \(tự động khi mất lưới \(AMF\)\): đạt 5\/5\n/);
  assert.ok(!/DSE7310/.test(md), "chỉ tự khởi động: HSMT đòi AMF");
  assert.match(CB.lowestCtlMd(["DSE7320 MKII"], facts, [dse], "Bộ điều khiển kết hợp với tủ ATS, truyền thông 5G", kinds), /chưa bộ nào đủ/);
  assert.equal(CB.lowestCtlMd(["DSE7320 MKII"], facts, [dse], "Bộ điều khiển kết hợp với tủ ATS", kinds), "");
});

// Khoa 21/11/2026 "Có": mục truyền thông không nêu chức năng cụ thể.
test("mục giám sát / kiểm soát từ xa: đạt khi có RS485 / Modbus / Ethernet / 4G, cùng thước cho mọi bộ", () => {
  const n = "Cổng kết nối với hệ thống kiểm soát từ xa";
  for (const y of [n, "Chức năng giám sát và điều khiển từ xa", "Có chức năng điều khiển từ xa"]) assert.equal(CM.isRemoteGeneric(y), true, y);
  for (const y of ["Điều khiển từ xa qua cổng Internet/4G", "Điều khiển bật/tắt từ xa qua tiếp điểm dry contact", "Đang ở chế độ điều khiển từ xa", "Màn hình điều khiển từ xa HMI", "Hỗ trợ giám sát và điều khiển từ xa qua ứng dụng", "RS485", "Điều khiển từ xa: Tay bấm điều khiển tích hợp", "Bảng điều khiển từ xa", "Nhân công điều khiển từ xa", "Chức năng điều khiển từ xa qua cổng"]) assert.equal(CM.isRemoteGeneric(y), false, y);
  const f = (line) => ({ supplierId: "dse", n: 1, line });
  // Bộ có RS485: đạt, câu trích là dòng datasheet, kể cả khi agent ghi chưa rõ.
  const a = { item: n, status: "unclear" };
  CM.commWords(a, [f("USB port"), f("RS485 serial port")]);
  assert.equal(a.status, "met"); assert.equal(a.sourceQuote, "RS485 serial port"); assert.equal(a.factSrc.n, 1);
  // Không cổng nào: agent ghi đạt cũng về chưa rõ; trả lại được câu trả lời của agent.
  const b = { item: n, status: "met", offered: "Có", sourceQuote: "USB port" };
  CM.commWords(b, [f("USB port")]);
  assert.equal(b.status, "unclear");
  CM.commRestore(b);
  assert.equal(b.status, "met"); assert.equal(b.sourceQuote, "USB port");
  // RS485 trong dòng tuỳ chọn không tính; Ethernet / 4G của mô-đun tính, RS485 của mô-đun thì không.
  assert.equal(CM.pairScore([n], [f("Extendable options including RS485")], []).met, 0);
  const m = { m: CM.COMM_MODULES[0], facts: [f("| DSE890 MKII | Gateway - 4G (GSM/Ethernet) | 0890-04")] };
  assert.equal(CM.pairScore([n], [f("USB port")], [m]).met, 1);
  const rs = { m: CM.COMM_MODULES[0], facts: [f("| DSE890 MKII | RS485 only")] };
  assert.equal(CM.pairScore([n], [f("USB port")], [rs]).met, 0);
});

test("altLineOf ghi NCC chưa chào / NCC nào chào và loại", () => {
  const line = CM.altLineOf([
    { model: "DSE7320 MKII", notOffered: true, kind: "amf", modules: [{ model: "DSE890 MKII" }], met: 6, total: 7, unclear: ["X"] },
    { model: "DSE7420 MKII", offeredBy: "voltgent", kind: "amf", modules: [], met: 5, total: 7, unclear: [] },
  ]);
  assert.match(line, /DSE7320 MKII \+ DSE890 MKII \(Bộ điều khiển chọn theo tài liệu hãng, NCC chưa chào; tự động khi mất lưới \(AMF\) theo datasheet hãng; truyền thông/);
  assert.match(line, /DSE7420 MKII \(NCC voltgent chào; tự động khi mất lưới \(AMF\) theo datasheet hãng; truyền thông: code dò datasheet đạt 5\/7\)/);
});

test("ctlStep: series hai số đầu", () => {
  assert.ok(CM.ctlStep("DSE7320 MKII") < CM.ctlStep("DSE7420"));
  assert.ok(CM.ctlStep("DSE7420 MKII") < CM.ctlStep("DSE8610"));
  assert.equal(CM.ctlStep("DSE7310"), CM.ctlStep("DSE7320"));
  assert.ok(CM.ctlStep("InteliLite 4") < CM.ctlStep("InteliGen 1000"));
  assert.ok(CM.ctlStep("HGM6120N") < CM.ctlStep("HGM9510"));
  assert.equal(CM.ctlStep("Foo 12"), null);
});
