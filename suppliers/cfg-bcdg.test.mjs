// Chỉ tiêu từng làm công ty bị loại (BCĐG, Khoa 2026-11-12): lossWarnOf / rankConfigs → c.lossWarn.
import test from "node:test";
import assert from "node:assert/strict";
import { lossWarnOf, rankConfigs, LOSS_CHECKS, NO_CONTROLLER } from "./config-bot.mjs";
import { codeOf } from "./reqcodes.mjs";

const prot = (parts) => ({ item: "Bảo vệ, dừng máy", part: "controller", level: "core", requirement: "Dừng máy khi", parts: parts.map((item) => ({ item })) });
const fuel50 = { item: "Tiêu hao nhiên liệu 50% tải", part: "genset", level: "core", requirement: "≤ 30 L/h ở 50% tải", quote: "≤ 30 L/h" };
const chk = (r, status, extra = {}) => ({ item: r.item, part: r.part, requirement: r.requirement, status, ...extra });
const of = (warn, code) => warn.find((w) => w.code === code);

test("bảng cố định có 7 chỉ tiêu, mỗi dòng có gói BCĐG", () => {
  assert.equal(LOSS_CHECKS.length, 7);
  for (const L of LOSS_CHECKS) assert.match(L.tender, /^IB\d{10}$/);
});

test("HSMT không có yêu cầu → không cảnh báo", () => {
  assert.deepEqual(lossWarnOf({ checks: [] }, []), []);
});

test("tiêu hao 50%: chưa rõ / đạt / không đạt / chưa kiểm", () => {
  assert.equal(of(lossWarnOf({ checks: [chk(fuel50, "unclear")] }, [fuel50]), "fuel_consumption_50").label, "Chưa rõ");
  assert.equal(lossWarnOf({ checks: [chk(fuel50, "met")] }, [fuel50]).length, 0);
  assert.equal(of(lossWarnOf({ checks: [chk(fuel50, "met", { unverified: true })] }, [fuel50]), "fuel_consumption_50").status, "unclear");
  assert.equal(of(lossWarnOf({ checks: [chk(fuel50, "not_met")] }, [fuel50]), "fuel_consumption_50").label, "Không đạt");
  const w = of(lossWarnOf({ checks: [] }, [fuel50]), "fuel_consumption_50");
  assert.equal(w.label, "Chưa kiểm"); assert.equal(w.tender, "IB2600483082");
});

test("ngắn mạch: chỉ phần riêng 'Ngắn mạch' đạt mới coi là đạt, không lấy ctl_protection chung", () => {
  const r = prot(["Quá dòng", "Ngắn mạch"]);
  const groupMet = { ...chk(r, "met"), parts: [{ item: "Quá dòng", status: "met" }, { item: "Ngắn mạch", status: "unclear" }] };
  assert.equal(of(lossWarnOf({ checks: [groupMet] }, [r]), "ctl_protection").status, "unclear");
  const ok = { ...chk(r, "unclear"), parts: [{ item: "Quá dòng", status: "unclear" }, { item: "Ngắn mạch", status: "met" }] };
  assert.equal(of(lossWarnOf({ checks: [ok] }, [r]), "ctl_protection"), undefined);
  const noPart = { ...chk(r, "met"), parts: [{ item: "Quá dòng", status: "met" }] };
  assert.equal(of(lossWarnOf({ checks: [noPart] }, [r]), "ctl_protection").label, "Chưa kiểm");
  // HSMT lists protections without short circuit → not this point.
  assert.equal(of(lossWarnOf({ checks: [] }, [prot(["Quá dòng"])]), "ctl_protection"), undefined);
  // No controller in the configuration → not met.
  const noCtl = { checks: [{ item: NO_CONTROLLER, byCode: true, status: "not_met", part: "controller" }] };
  assert.equal(of(lossWarnOf(noCtl, [r]), "ctl_protection").status, "not_met");
});

test("confirm: nhãn riêng cần chứng từ / xác nhận khi đặt hàng", () => {
  const r = { item: "Tiêu chuẩn đầu phát", part: "alternator", level: "core", requirement: "IEC 60034, VDE 0875" };
  const w = of(lossWarnOf({ checks: [chk(r, "confirm", { confirm: "document" })] }, [r]), "alt_standard");
  assert.equal(w.label, "Cần chứng từ khi nộp");
  const t = { code: "ctl_display_lang", item: "Ngôn ngữ, màn hình bộ điều khiển", part: "controller", level: "option", requirement: "LCD tiếng Việt" };
  assert.equal(of(lossWarnOf({ checks: [chk(t, "confirm", { confirm: "order" })] }, [t]), "ctl_display_lang").label, "Cần xác nhận khi đặt hàng");
});

test("ngôn ngữ BĐK chỉ khi HSMT nói tiếng Việt; khí thải không nhận lưu lượng khí thải", () => {
  const lcd = { code: "ctl_display_lang", item: "Ngôn ngữ, màn hình bộ điều khiển", part: "controller", level: "option", requirement: "LCD 3,1 inch" };
  assert.equal(lossWarnOf({ checks: [] }, [lcd]).length, 0);
  const flow = { item: "Lưu lượng khí thải tại công suất dự phòng", part: "engine", level: "core", requirement: "≤ 828 L/s", code: "emission" };
  assert.equal(of(lossWarnOf({ checks: [] }, [flow]), "emission"), undefined);
  const euro = { item: "Tiêu chuẩn khí thải", part: "engine", level: "core", requirement: "≥ Euro 4" };
  assert.equal(of(lossWarnOf({ checks: [] }, [euro]), "emission").label, "Chưa kiểm");
});

test("codeOf: 'Lưu lượng / nhiệt độ khí thải' là exhaust, 'Tiêu chuẩn khí thải' vẫn là emission", () => {
  assert.equal(codeOf({ item: "Lưu lượng khí thải tại công suất dự phòng", part: "engine" }), "exhaust");
  assert.equal(codeOf({ item: "Nhiệt độ khí thải", part: "engine" }), "exhaust");
  assert.equal(codeOf({ item: "Tiêu chuẩn khí thải", part: "engine" }), "emission");
  assert.equal(codeOf({ item: "Khí thải", part: "engine" }), "emission");
});

test("rankConfigs: chỉ hạng 1–3 có lossWarn, không đổi thứ hạng hay status", () => {
  const cfg = (m) => ({ engine: { model: m, make: m }, alternator: { model: `A${m}` }, checks: [chk(fuel50, "unclear")] });
  const result = { requirements: [fuel50], configs: ["E1", "E2", "E3", "E4"].map(cfg) };
  const out = rankConfigs(result);
  assert.deepEqual(out.configs.map((c) => c.engine.model), ["E1", "E2", "E3", "E4"]);
  assert.deepEqual(out.configs.map((c) => !!c.lossWarn), [true, true, true, false]);
  assert.ok(out.configs.every((c) => c.checks[0].status === "unclear"));
  // A config that becomes met loses its warning on the next ranking.
  out.configs[0].checks[0].status = "met";
  assert.equal(rankConfigs(out).configs.find((c) => c.engine.model === "E1").lossWarn, undefined);
});
