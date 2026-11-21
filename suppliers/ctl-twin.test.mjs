// Hai bản bộ điều khiển (Khoa 21/11/2026 "sửa theo phương án 2"): cùng động cơ, giữ bản tài liệu hãng và bản NCC chào, một chỗ của
// trần mỗi hãng. Dòng lấy nguyên văn từ cn/ (agg-fuzhou, voltgent, deep-sea-electronics).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as CB from "./config-bot.mjs";

const rec = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const suppliers = ["agg-fuzhou", "voltgent", "deep-sea-electronics"].map(rec);
const LINE = "| B825E5 | 825/660 | 750/600 | 6M31G825/5";
const hsmtText = "Bộ điều khiển máy phát có chức năng tự động khởi động khi mất điện lưới (AMF). Truyền thông: RS485, Ethernet.";
const base = () => ({
  requirements: [{ item: "Truyền thông", requirement: "RS485, Ethernet", part: "controller", level: "core", code: "ctl_comm", parts: [{ item: "RS485" }, { item: "Ethernet" }] }],
  configs: [{
    rank: 1,
    engine: { make: "Baudouin", model: "6M31G825/5", src: { kind: "catalog", supplierId: "agg-fuzhou", n: 107, line: LINE } },
    controller: { make: "Deep Sea", model: "DSE7320 MKII", src: { kind: "maker", supplierId: "deep-sea-electronics", n: 1001 } },
    suppliers: [{ supplierId: "agg-fuzhou", n: 107, line: LINE }],
    checks: [{ item: "Truyền thông", status: "unclear", part: "controller", parts: [{ item: "RS485", status: "unclear" }, { item: "Ethernet", status: "unclear" }] }],
  }],
});
const run = (result) => { const o = CB.check(result, { hsmtText, suppliers, readWeb: () => null, sized: false }); CB.rankConfigs(o.result); return o.result; };

test("bộ theo tài liệu hãng + NCC cùng động cơ chào bộ khác: hai cấu hình liền nhau", () => {
  const r = run(base());
  assert.deepEqual(r.configs.map((c) => c.controller.model), ["DSE7320 MKII", "DSE7420"]);
  assert.equal(r.configs[0].controller.label, "Bộ điều khiển chọn theo tài liệu hãng, NCC chưa chào");
  const t = r.configs[1];
  assert.equal(t.ctlTwin.of, "DSE7320 MKII");
  assert.deepEqual(t.suppliers.map((s) => s.supplierId), ["voltgent"]);
  assert.equal(t.controller.fromMaker, undefined);
  assert.match(t.gaps[0], /voltgent chào DSE7420.*cần hỏi NCC/);
});

test("chạy lại check không nhân thêm bản", () => {
  const r = run(run(base()));
  assert.equal(r.configs.filter((c) => c.ctlTwin).length, 1);
  assert.equal(r.configs.length, 2);
});

test("agent đã viết bản NCC chào: không sinh thêm", () => {
  const b = base(), v = rec("voltgent").controllers.find((x) => x.model === "DSE7420");
  b.configs.push({ ...structuredClone(b.configs[0]), rank: 2, controller: { make: "Deep Sea", model: "DSE7420", src: { kind: "controller", supplierId: "voltgent", n: v.src?.[0], line: v.line } } });
  const r = run(b);
  assert.equal(r.configs.filter((c) => c.ctlTwin).length, 0);
});

// Chiều ngược (Khoa 21/11/2026 "có"): bộ chính do NCC chào, bộ thấp nhất đủ theo tài liệu hãng là bộ khác.
const offered = () => {
  const b = base(), v = rec("voltgent").controllers.find((x) => x.model === "DSE7420");
  b.configs[0].controller = { make: "Deep Sea", model: "DSE7420", src: { kind: "controller", supplierId: "voltgent", n: v.src?.[0], line: v.line } };
  return b;
};

test("chiều ngược: bộ NCC chào cao hơn bộ thấp nhất đủ → thêm bản tài liệu hãng ngay dưới", () => {
  const r = run(offered());
  assert.deepEqual(r.configs.map((c) => c.controller.model), ["DSE7420", "DSE7320 MKII"]);
  const t = r.configs[1];
  assert.equal(t.ctlTwin.of, "DSE7420");
  assert.equal(t.controller.fromMaker, true);
  assert.match(t.controller.label, /NCC chưa chào/);
  assert.match(t.gaps[0], /DSE7320 MKII là bộ thấp nhất đủ.*DSE7420/);
  for (const x of t.checks.filter((y) => y.part === "controller" && !y.byCode && !y.parts?.length)) assert.notEqual(x.status, "met");
});

test("chiều ngược: chạy lại check không nhân thêm bản", () => {
  const r = run(run(offered()));
  assert.equal(r.configs.filter((c) => c.ctlTwin).length, 1);
  assert.equal(r.configs.length, 2);
});

test("chiều ngược: bộ chính đã là bộ thấp nhất (tên NCC của cùng datasheet) thì không sinh", () => {
  const b = base(), o = rec("aosif").controllers.find((x) => x.model === "DSE7320");
  b.configs[0].controller = { make: "Deep Sea", model: "DSE7320", src: { kind: "controller", supplierId: "aosif", n: o.src?.[0], line: o.line } };
  const list = ["agg-fuzhou", "voltgent", "deep-sea-electronics", "aosif"].map(rec);
  const x = CB.check(b, { hsmtText, suppliers: list, readWeb: () => null, sized: false });
  CB.rankConfigs(x.result);
  assert.equal(x.result.configs.filter((c) => c.ctlTwin).length, 0);
});

test("chiều ngược: NCC của cấu hình chào bộ thấp nhất, dòng ghi 'Deepsea 7320': bản sinh không bị báo sai nguồn", () => {
  const b = offered(), list = [...suppliers, rec("aosif")];
  b.configs[0].suppliers.push({ supplierId: "aosif", n: 1067, line: "| Control module | Deepsea 7320" });
  const x = CB.check(b, { hsmtText, suppliers: list, readWeb: () => null, sized: false });
  CB.rankConfigs(x.result);
  const t = x.result.configs.find((c) => c.ctlTwin);
  assert.equal(t.controller.model, "DSE7320");
  assert.equal(t.controller.fromMaker, undefined);
  assert.equal(t.controller.unverified, undefined);
  assert.deepEqual(x.problems.filter((p) => /model DSE7320/.test(p)), []);
});

test("chiều ngược: HSMT không nêu chức năng truyền thông (không có bảng) thì không sinh", () => {
  const b = offered();
  const x = CB.check(b, { hsmtText: "Tổ máy phát điện 750 kVA.", suppliers, readWeb: () => null, sized: false });
  assert.equal(x.result.configs.filter((c) => c.ctlTwin).length, 0);
});

// IB2600603983, configmatch 2026-11-21T08:52:00Z, cấu hình #4: agent ghi dòng tổ máy B825E5 của agg-fuzhou.
test("dòng tổ máy của NCC khác: vẫn sinh bản, bản sao lấy dòng tổ máy của NCC chào", () => {
  const b = base();
  b.configs[0].genset = { model: "B825E5", src: { kind: "catalog", supplierId: "agg-fuzhou", n: 107, line: LINE } };
  b.configs[0].checks.push({ item: "Công suất liên tục", status: "met", part: "genset", offered: "750 kVA", sourceQuote: LINE });
  const r = run(b);
  assert.deepEqual(r.configs.map((c) => c.controller.model), ["DSE7320 MKII", "DSE7420"]);
  assert.equal(r.configs[0].genset.model, "B825E5");
  const t = r.configs[1];
  assert.deepEqual(t.suppliers.map((s) => s.supplierId), ["voltgent"]);
  assert.equal(t.genset.model, "VB825-5");
  assert.equal(t.genset.src.supplierId, "voltgent");
  assert.notEqual(t.checks.find((x) => x.item === "Công suất liên tục").status, "met");
  assert.equal(run(r).configs.filter((c) => c.ctlTwin).length, 1);
});

// Khoa 21/11/2026 "Đổi lại luật bộ NCC chào như cũ, nếu không sẽ mất DSE7420": nhóm chức năng code chưa chấm được không chặn bản sinh.
const PROT = { item: "Bảo vệ, dừng máy", requirement: "Vượt tốc", part: "controller", level: "core", code: "ctl_protection", parts: [{ item: "Vượt tốc" }] };
const withProt = (b) => { b.requirements.push(structuredClone(PROT)); b.configs[0].checks.push({ item: PROT.item, status: "met", part: "controller", parts: [{ item: "Vượt tốc", status: "met" }] }); return b; };

test("nhóm bảo vệ code chưa chấm được: vẫn sinh bản NCC chào, phần đó chưa rõ", () => {
  const r = run(withProt(base()));
  assert.deepEqual(r.configs.map((c) => c.controller.model), ["DSE7320 MKII", "DSE7420"]);
  assert.equal(r.configs[1].checks.find((x) => x.item === PROT.item).parts[0].status, "unclear");
});

// IB2600603983, configmatch 2026-11-21T11:44:18Z, cấu hình #7 / #8: interpower-international chào "DSE4520 DSE6120 DSE7320 DSE8610".
const LK = "| LG600BD | 660 | 825 | 600 | 750 | 6M33G825/5 | LK634B | LSA49.3 M65 | OP3800*1600*2200 | AT5680*2100*2500 |";
const six = () => ({
  requirements: base().requirements,
  configs: [{
    rank: 1,
    engine: { make: "Baudouin", model: "6M33G825/5", src: { kind: "catalog", supplierId: "longkai-power", n: 108, line: LK } },
    controller: { make: "Deep Sea", model: "DSE7320 MKII", src: { kind: "maker", supplierId: "deep-sea-electronics", n: 1001 } },
    suppliers: [{ supplierId: "longkai-power", n: 108, line: LK }],
    checks: [{ item: "Truyền thông", status: "unclear", part: "controller", parts: [{ item: "RS485", status: "unclear" }, { item: "Ethernet", status: "unclear" }] }],
  }],
});
const runSix = (b) => { const o = CB.check(b, { hsmtText, suppliers: [...suppliers, rec("longkai-power"), rec("interpower-international")], readWeb: () => null, sized: false }); CB.rankConfigs(o.result); return o.result; };

test("11:44Z: NCC chào chính bộ chính không sinh DSE4520, cấu hình gốc ghi NCC đó và hỏi đời", () => {
  for (const b of [six(), withProt(six())]) {
    const r = runSix(b), c = r.configs[0];
    assert.ok(!r.configs.some((x) => x.controller.model === "DSE4520"));
    assert.ok(c.controller.offeredMain.by.includes("interpower-international"));
    assert.equal(c.controller.fromMaker, true);
    assert.match(c.controller.label, /interpower-international.*DSE7320 \(hồ sơ không ghi đời MKII, cần hỏi\)/);
    assert.equal(runSix(r).configs[0].controller.label, c.controller.label);
  }
});

test("11:44Z, lượt nhóm Trung Quốc: NCC đặt tại GB không sinh bản, không được ghi là bên chào", () => {
  const o = CB.check(six(), { hsmtText, suppliers: [...suppliers, rec("longkai-power"), rec("interpower-international")], readWeb: () => null, sized: false, origin: "all" });
  CB.rankConfigs(o.result);
  const by = o.result.configs.flatMap((c) => [...(c.ctlTwin?.by || []), ...(c.controller.offeredMain?.by || [])]);
  assert.ok(!by.includes("interpower-international"));
  assert.ok(!o.result.configs.some((c) => c.controller.model === "DSE4520"));
});

test("đã đủ 8 cấu hình agent: bản sinh không đẩy cấu hình nào, ghi vào cấu hình gốc", () => {
  const b = base();
  for (let i = 2; i <= 8; i++) b.configs.push({ ...structuredClone(b.configs[0]), rank: i, engine: { ...b.configs[0].engine, make: "Khác", model: `6M31G825/5` }, alternator: { make: "X", model: `ALT${i}` } });
  const o = CB.check(b, { hsmtText, suppliers, readWeb: () => null, sized: false });
  assert.equal(o.result.configs.length, 8);
  assert.equal(o.result.configs.filter((c) => c.ctlTwin).length, 0);
  assert.match(o.result.configs[0].controller.offerNote, /đã đủ 8 cấu hình: DSE7420 \(NCC voltgent chào\)/);
});

test("cặp hai bản là một chỗ của trần mỗi hãng", () => {
  const b = base();
  b.configs[0].engine.make = "Volvo Penta"; // trần 1 cấu hình mỗi hãng
  assert.equal(run(b).configs.length, 2);
});
