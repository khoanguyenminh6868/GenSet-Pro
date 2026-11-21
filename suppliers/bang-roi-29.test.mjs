// node --test suppliers/bang-roi-29.test.mjs — bảng đầu phát / động cơ rời (LOOSE_TABLES, bang-roi-29, chủ dự án
// 21/11/2026 "đọc cả 29"; dau-vao-bang-roi/29-bang.md lớp A / E). Danh sách tường minh: NCC + n + dòng tiêu đề đầu nguyên
// văn. Dòng lấy nguyên văn từ suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const cn = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const only = (s, n) => ({ ...s, specTables: s.specTables.filter((t) => t.n === n) });
const recs = (id, n, notes) => C.fromSupplier(only(cn(id), n), notes);

// Số bản ghi theo bảng (sau mergeRepeats: nenjo n111 / shengfeng n111 chép nguyên dòng của n101 / n106).
const COUNTS = [
  ["eastern-lion-fuan", 154, 42], ["gordon-power", 117, 26], ["jet-power", 119, 98], ["keliang-fuan", 108, 10], ["keliang-fuan", 124, 10],
  ["landtop-fuzhou", 114, 8], ["landtop-fuzhou", 115, 10], ["lanzhou-electric", 102, 3], ["longkai-power", 113, 55],
  ["shengfeng-fuan", 104, 11], ["xinhengxin-fujian", 108, 42], ["xinhengxin-fujian", 110, 8], ["xinhengxin-fujian", 118, 10],
  ["yihua-fujian", 105, 13], ["yingtai-jiangsu", 115, 17], ["yingtai-jiangsu", 116, 30], ["kangjin-power", 101, 4], ["kangjin-power", 102, 6],
  ["penlucky", 116, 3], ["penlucky", 119, 8], ["penlucky", 120, 4], ["rise-power", 131, 20], ["zhengdian-zhengzhou", 103, 41],
];

test("mỗi bảng trong danh sách cho đúng số bản ghi", () => {
  for (const [id, n, k] of COUNTS) assert.equal(recs(id, n).filter((o) => o.n === n).length, k, `${id} n${n}`);
});

test("jet-power n119: kVA đứng trước kW, mỗi dòng 50 Hz + 60 Hz, khoá chung (mã riêng của NCC)", () => {
  const r = recs("jet-power", 119).filter((o) => o.model === "JET164A");
  assert.deepEqual(r.map((o) => [o.freq, o.power]), [[50, { rated: { kW: 6.5, kVA: 8.1 } }], [60, { rated: { kW: 7.7, kVA: 9.6 } }]]);
  assert.ok(r.every((o) => o.kind === "alternator" && !o.keyScope && !o.fromLine));
});

test("STC / ST là tên dòng chung: khoá theo NCC, không gộp với bản ghi NCC khác", () => {
  const sup = ["gordon-power", "shengfeng-fuan", "xinhengxin-fujian", "sunny-weifang"].map(cn);
  const b = C.build(sup);
  const stc10 = b.alternators.filter((e) => e.model.toUpperCase().replace(/[^A-Z0-9]/g, "") === "STC10");
  // sunny-weifang (bảng tổ máy, có sẵn) giữ khoá chung "STC10"; ba NCC mới mỗi NCC một khoá riêng.
  assert.ok(stc10.some((e) => e.key === C.keyOf("STC-10") && e.suppliers.length === 1 && e.suppliers[0] === "sunny-weifang"));
  for (const id of ["gordon-power", "shengfeng-fuan", "xinhengxin-fujian"]) assert.ok(stc10.some((e) => e.key === `${id}|${C.keyOf("STC-10")}` && e.suppliers.join() === id), id);
});

test("hai model trùng khoá (STC-7.5 / STC-75) với số khác nhau: bỏ cả hai, ghi note", () => {
  const notes = [];
  const r = recs("gordon-power", 117, notes);
  assert.ok(!r.some((o) => /^STC-7\.?5$/.test(o.model)));
  assert.equal(notes.filter((x) => /trùng khoá/.test(x.reason)).length, 2);
  assert.ok(r.some((o) => o.model === "ST-7.5"), "ST-7.5 (khoá khác) vẫn đọc");
});

test("yingtai n116: kW / kVA không khớp một máy thì bỏ dòng (YTW22 31.25 kVA / 22 kW)", () => {
  const notes = [];
  const r = recs("yingtai-jiangsu", 116, notes);
  assert.ok(!r.some((o) => o.model === "YTW22"));
  assert.ok(notes.some((x) => x.reason === "công suất đầu phát không đọc được" && x.detail === "22 kW / 31.25 kVA"));
  assert.deepEqual(r.find((o) => o.model === "YTW200").power, { rated: { kW: 200, kVA: 250 } });
  assert.equal(r.find((o) => o.model === "YTW200").freq, 50);
});

test("nenjo: prime / standby theo tiêu đề; dòng số trong model khác kW 50 Hz bị bỏ; ô '－' không thành số", () => {
  const notes = [];
  const r = recs("nenjo-generator", 101, notes);
  assert.deepEqual(r.filter((o) => o.model === "HJI-6.5").map((o) => [o.freq, o.power]), [[50, { prime: { kW: 6.5 }, standby: { kW: 7.1 } }], [60, { prime: { kW: 8.2 } }]]);
  assert.ok(!r.some((o) => o.model === "HJI-1420" || o.model === "HJI-1520"));
  assert.equal(notes.filter((x) => x.reason === "số trong model khác công suất 50 Hz của dòng").length, 2);
});

test("lanzhou: mã OCR sai và mã ghi hai lần với số khác bị bỏ", () => {
  const r = recs("lanzhou-electric", 102);
  assert.deepEqual(r.map((o) => o.model), ["TZH-180S4-TH", "TZH-200AA4-TH", "TZH-225L4-TH"]);
  assert.deepEqual(r[0].power, { rated: { kW: 12, kVA: 15 } });
});

test("longkai n113: chỉ phần 50 Hz, cột 400V; phần 208/416… V (không ghi tần số) không đọc", () => {
  const r = recs("longkai-power", 113);
  assert.ok(r.every((o) => o.row >= 1 && o.row <= 55 && o.freq === 50));
  assert.deepEqual(r.find((o) => o.model === "LK184E/S").power, { rated: { kW: 16 } });
});

test("bảng động cơ: penlucky đọc công suất / xi lanh / dung tích; rise chỉ công suất; zhengdian công suất + tốc độ", () => {
  const p = recs("penlucky", 119).find((o) => o.model === "6BT5.9-GM83");
  assert.equal(p.kind, "engine");
  assert.equal(p.power, null);
  assert.deepEqual(p.specs.map((x) => [x.key, x.value]), [["engPower", "83@1500"], ["cyl", "6"], ["disp", "5.9"]]);
  assert.deepEqual(p.makes, [{ name: "Cummins", via: "tên trang" }]);
  const r = recs("rise-power", 131).find((o) => o.n === 131 && o.model === "SC27G755D2");
  assert.deepEqual(r.specs.map((x) => [x.key, x.value]), [["engPower", "555"]]);
  const z = recs("zhengdian-zhengzhou", 103).filter((o) => o.model === "ZS195");
  assert.equal(z.length, 2);
  assert.deepEqual(z[0].specs.map((x) => [x.key, x.value]), [["engPower", "8.8"], ["speed", "2000"]]);
});

test("tiêu đề đổi thì bảng không đọc, có note; NCC khác cùng bảng không áp danh sách", () => {
  const s = only(cn("jet-power"), 119);
  const t = s.specTables[0];
  const changed = { ...s, specTables: [{ ...t, header: ["| MODEL | 50Hz | 60Hz", ...t.header.slice(1)] }] };
  const notes = [];
  assert.ok(!C.fromSupplier(changed, notes).some((o) => o.n === 119 && /^JET\d/.test(o.model) && o.power?.rated));
  assert.ok(notes.some((x) => /đổi tiêu đề/.test(x.reason)));
  const other = { ...s, id: "ncc-khac" };
  assert.ok(!C.fromSupplier(other).some((o) => o.keyScope || (o.own && o.n === 119)));
});

test("xingguang n108: ô động cơ hai mã 'ZS1110或295D' → không bản ghi động cơ, STC-12 là đầu phát (OR_ENGINE_CELLS)", () => {
  const notes = [];
  const r = C.fromSupplier(only(cn("xingguang-jiangsu"), 108), notes);
  for (const m of ["STC-12", "STC-15"]) {
    assert.ok(!r.some((o) => o.kind === "engine" && o.model === m), m);
    const a = r.find((o) => o.kind === "alternator" && o.model === m);
    assert.ok(a, m);
    assert.ok(/或/.test(a.line));
  }
  assert.deepEqual(r.find((o) => o.model === "STC-12").power, { rated: { kW: 12, kVA: 15 } });
  assert.deepEqual(notes.filter((x) => x.reason === "một ô ghi hai mã").map((x) => x.detail), ["ZS1110或295D", "ZS1115或2100D"]);
  // n110 ghi "或" ở ô ĐẦU PHÁT ("TZHW或TFW"): động cơ đọc như cũ.
  const r110 = C.fromSupplier(only(cn("xingguang-jiangsu"), 110));
  assert.ok(r110.some((o) => o.kind === "engine" && o.model === "Z12V190B"));
  // NCC khác cùng dòng: không áp danh sách.
  const other = { ...only(cn("xingguang-jiangsu"), 108), id: "ncc-khac" };
  assert.ok(C.fromSupplier(other).some((o) => o.kind === "engine" && o.model === "STC-12"));
});
