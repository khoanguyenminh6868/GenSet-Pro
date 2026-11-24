// node --test suppliers/ctl-dong-dung-model.test.mjs — ctl-dong-dung-model (điều phối 24/11/2026, báo cáo dong-khac-model.md, phương án A):
// một dòng datasheet BĐK nêu mã BĐK mà không mã nào thuộc sheet thì KHÔNG rơi vào phạm vi model đứng trước. Chạy
// controllerSheetFacts trên bảng THẬT của cn/ (smartgen 1001 / 1005 / 1012, datakom 1002), không dựng modelFacts.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const C = await import("./config-bot.mjs");
const table = (id, n) => {
  const s = JSON.parse(fs.readFileSync(path.join(here, "cn", `${id}.json`), "utf8"));
  return { s, t: s.specTables.find((t) => t.n === n && /ata/.test(t.title || "")) };
};
const facts = (id, n) => { const { s, t } = table(id, n); return C.controllerSheetFacts(s, t); };
const has = (list, model, re) => list.some((x) => x.model === model && re.test(x.f.line));

test("DKG307 không nhận dòng 'chỉ cho DKG-317'", () => {
  const f = facts("datakom", 1002);
  assert.ok(f.some((x) => x.model === "DKG307"));
  assert.ok(!f.some((x) => /applicable only to (the )?DKG-317/i.test(x.f.line)), "DKG-317 ngoài sheet");
  assert.ok(f.length > 1500, "dòng thường của tờ vẫn ở DKG307");
});

test("HGM6110N / HGM6120N: dòng 'HGM6120:' chỉ của 6120*, dòng 'HGM6110:' chỉ của 6110*", () => {
  const f = facts("smartgen", 1001);
  for (const m of ["HGM6110N", "HGM6110NC", "HGM6110CAN"]) {
    assert.ok(!has(f, m, /HGM6120: When mains is abnormal/), `${m} nhận AMF của HGM6120`);
    assert.ok(!has(f, m, /fit for HGM6120 series/), m);
  }
  for (const m of ["HGM6120N", "HGM6120NC", "HGM6120CAN"]) {
    assert.ok(has(f, m, /HGM6120: When mains is abnormal/), `${m} phải có dòng AMF của chính nó`);
    assert.ok(!has(f, m, /HGM6110: When .remote start. input is active/), `${m} nhận dòng khởi động từ xa của HGM6110`);
  }
  for (const m of ["HGM6110N", "HGM6110NC", "HGM6110CAN"]) assert.ok(has(f, m, /HGM6110: When .remote start. input is active/), m);
});

test("họ 'HGM6100N SERIES' vẫn của mọi model của sheet", () => {
  const f = facts("smartgen", 1001);
  for (const m of ["HGM6110N", "HGM6120N", "HGM6110CAN", "HGM6120CAN"]) assert.ok(has(f, m, /HGM6100N series genset controller/i), m);
});

test("HGM9510N / HGM9530N không nhận '(Only available for HGM9520N)'", () => {
  const f = facts("smartgen", 1005);
  assert.ok(f.some((x) => x.model === "HGM9510N") && f.some((x) => x.model === "HGM9530N"));
  assert.ok(!f.some((x) => /Only available for HGM9520N/i.test(x.f.line)));
});

test("HGM9310 / HGM9320: dòng 'HGM9320MPU(CAN): …' không thuộc HGM9310, 'HGM9310MPU(CAN): …' không thuộc HGM9320", () => {
  const f = facts("smartgen", 1012);
  assert.ok(!has(f, "HGM9310", /HGM9320MPU\(CAN\): When Mains is abnormal/));
  assert.ok(!has(f, "HGM9310", /HGM9320MPU\(CAN\) typical application diagram/));
  assert.ok(!has(f, "HGM9320", /HGM9310MPU\(CAN\) typical application diagram/));
  assert.ok(has(f, "HGM9320", /HGM9320MPU\(CAN\): When Mains is abnormal/));
});

test("dòng nêu mã tiền tố đúng gắn đúng model, không mở phạm vi mới (bảng dựng tay)", () => {
  const t = { n: 1, title: "Datasheet: HGM6110N/6120N", rows: ["Common", "A common line", "HGM6120: When mains is abnormal, delay", "a tail of that sentence", "HGM6110 without.", "line of 6110N scope?", "HGM9999N is another controller"] };
  const f = C.controllerSheetFacts({ id: "x" }, t), of = (m) => f.filter((x) => x.model === m).map((x) => x.f.line);
  assert.ok(of("HGM6120N").includes("HGM6120: When mains is abnormal, delay"));
  assert.ok(of("HGM6120N").includes("a tail of that sentence"), "dòng nối tiếp theo dòng của 6120");
  assert.ok(!of("HGM6110N").includes("HGM6120: When mains is abnormal, delay"));
  assert.ok(of("HGM6110N").includes("HGM6110 without.") && !of("HGM6120N").includes("HGM6110 without."));
  assert.ok(!f.some((x) => /HGM9999N/.test(x.f.line)), "mã lạ không vào model nào");
});

// Khoa chốt 24/11/2026 — bảng THẬT của cn/.
test("DSE7570: giữ đúng hai dòng RS232 của chính nó, các dòng nêu mã DSE ngoài tờ khác vẫn bỏ", () => {
  const f = facts("deep-sea-electronics", 1027);
  assert.ok(has(f, "DSE7570", /^\| RS232 \| DSE8610 MKII Com Port$/));
  assert.ok(has(f, "DSE7570", /^\| RS232 \| DSE8610 MKII Communications$/));
  assert.ok(!has(f, "DSE7570", /^\| DSE810 \| DSE5510 \/ DSE7510 Com Port$/));
  assert.ok(!has(f, "DSE7570", /^\| DSE810 \(RJ45\) \| DSE5510 \/ DSE7510 Communications$/));
  assert.ok(!has(f, "DSE7570", /^\| DSE8610 MKII \| Synchronising & Load Sharing$/));
});

test("ngoại lệ RS232 hẹp: tờ khác, dòng RS232 nêu mã lạ vẫn bị bỏ (bảng dựng tay)", () => {
  const rs = "| RS232 | DSE8610 MKII Com Port";
  const own = C.controllerSheetFacts({ id: "x" }, { n: 1, title: "Datasheet DSE7570", rows: ["Common", rs] });
  assert.ok(own.some((x) => x.model === "DSE7570" && x.f.line === rs));
  const other = C.controllerSheetFacts({ id: "x" }, { n: 1, title: "Datasheet DSE7320 MKII", rows: ["Common", rs] });
  assert.ok(!other.some((x) => x.f.line === rs));
});

test("HGM6100CAN: dòng nêu mã này chỉ của HGM6110CAN / HGM6120CAN; họ N / series vẫn của cả tờ", () => {
  const f = facts("smartgen", 1001);
  const canOnly = [/for HGM6100CAN, press start key/, /Custom Theme.*HGM6100CAN\.$/, /only suits for HGM6100CAN/];
  for (const re of canOnly) {
    for (const m of ["HGM6110CAN", "HGM6120CAN"]) assert.ok(has(f, m, re), `${m} ${re}`);
    for (const m of ["HGM6110N", "HGM6120N", "HGM6110NC", "HGM6120NC"]) assert.ok(!has(f, m, re), `${m} không được nhận ${re}`);
  }
  for (const m of ["HGM6110CAN", "HGM6120CAN"]) assert.ok(has(f, m, /Only HGM6100N has these/), `${m} giữ nguyên dòng "Only HGM6100N has these"`);
  for (const m of ["HGM6110N", "HGM6120N", "HGM6110NC", "HGM6120NC", "HGM6110CAN", "HGM6120CAN"]) assert.ok(has(f, m, /HGM6100N series genset controller/i), `${m} mất họ`);
});
