// bdk-amf (Khoa 20/11/2026, IB2600603983 "1. Có 2. Có"): loại bộ điều khiển đọc từ datasheet hãng, ATS / mất lưới của HSMT,
// phương án khác theo datasheet hãng ghi "NCC chưa chào". Dòng lấy nguyên văn từ cn/deep-sea-electronics.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as CM from "./ctl-module.mjs";

const dse = JSON.parse(fs.readFileSync(new URL("./cn/deep-sea-electronics.json", import.meta.url), "utf8"));

test("ctlKinds: loại theo chữ datasheet hãng, không theo số model", () => {
  const k = CM.ctlKinds([dse]);
  assert.equal(k.get("7310"), "start");
  assert.equal(k.get("7320"), "amf");
  assert.equal(k.get("7410"), "start");
  assert.equal(k.get("7420"), "amf");
  assert.equal(k.get("8610"), "sync");
  assert.equal(CM.kindOf(k, "DSE7320 MKII"), "amf");
  // Chỉ bảng của controller_maker.
  assert.equal(CM.ctlKinds([{ ...dse, role: "genset_oem" }]).size, 0);
  // Chữ đứng TRƯỚC model là của model khác; chữ sau model tới model kế tiếp là của nó.
  const one = (line) => CM.ctlKinds([{ role: "controller_maker", specTables: [{ n: 1, title: "", rows: [line] }] }]);
  assert.deepEqual([...one("The DSE7310 MKII is an auto start control module and the DSE7320 MKII is an auto mains (utility) failure control module")], [["7310", "start"], ["7320", "amf"]]);
  assert.equal(one("| • | Mains (utility) failure detection including mains (utility) decoupling | DSE8610 MKII").size, 0);
  assert.equal(one("The DSE8610 MKII is a market-leading Synchronising Auto Start Control Module").get("8610"), "sync");
});

test("needsAmf: ATS / chuyển nguồn tự động / mất điện lưới; viết tắt chỉ chữ hoa", () => {
  assert.equal(CM.needsAmf("Chức năng điều khiển + Kết hợp với tủ ATS."), true);
  assert.equal(CM.needsAmf("Khi mất điện lưới hoặc khi điện lưới quá thấp"), true);
  assert.equal(CM.needsAmf("Tủ chuyển đổi nguồn tự động 1000A"), true);
  assert.equal(CM.needsAmf("Thermostats ats amf"), false);
  assert.equal(CM.needsAmf("Bộ điều khiển kỹ thuật số, màn hình LCD"), false);
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
  assert.equal(CM.ctlStep("InteliLite 4"), null);
});
