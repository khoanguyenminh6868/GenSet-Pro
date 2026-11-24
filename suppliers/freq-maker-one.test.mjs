// node --test suppliers/freq-maker-one.test.mjs — danh sách tường minh Perkins chỉ có MỘT tần số ở tờ hãng (Khoa 24/11/2026):
// dòng NCC ghi tần số kia thì GIỮ, "cần xác nhận"; model có tờ hai tần số không bị coi là trái tờ hãng.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { freqVerdict, makerOneHz } from "./config-bot.mjs";

const ncc = (freq) => ({ supplierId: "x", n: 1, freq, line: "| X |" });
const eng = (key, u) => ({ key, uses: [u] });

test("model chỉ có tờ 1500 v/p: NCC ghi 60 Hz, gói 60 Hz → giữ, cần xác nhận (không loại)", () => {
  const u = ncc(60), v = freqVerdict(eng("1106A70TAG4", u), u, 60);
  assert.deepEqual(v, { ask: true, kind: "makerOne", why: "NCC ghi 60 Hz, tờ hãng Perkins [perkins 1007] chỉ ghi 50 Hz" });
});
test("model chỉ có tờ 1800 v/p: NCC ghi 50 Hz, gói 50 Hz → cần xác nhận", () => {
  const u = ncc(50), v = freqVerdict(eng("2206DE13TAG2", u), u, 50);
  assert.equal(v.kind, "makerOne");
  assert.ok(v.why.includes("chỉ ghi 60 Hz"));
});
test("model có tờ hai tần số, hoặc NCC ghi đúng tần số tờ hãng: không hỏi", () => {
  const u = ncc(50);
  assert.equal(freqVerdict(eng("2206CE13TAG2", u), u, 50), null);
  assert.equal(freqVerdict(eng("1206AE70TTAG1", ncc(50)), ncc(50), 50), null);
  const v = ncc(50);
  assert.equal(freqVerdict(eng("1106A70TAG4", v), v, 50), null, "NCC ghi 50 = tờ hãng 50");
});
test("danh sách khớp tờ nguồn: số nguồn có trong hồ sơ perkins và dòng 1500 / 1800 v/p đúng", () => {
  const cn = JSON.parse(fs.readFileSync(new URL("./cn/perkins.json", import.meta.url), "utf8"));
  for (const key of ["1104D44TG2", "1106A70TAG4", "1506AE88TAG1", "403A11G1", "403A15G1", "404A22G1", "2206DE13TAG2", "2206DE13TAG3", "2506CE15TAG3", "2506DE15TAG1"]) {
    const one = makerOneHz({ key });
    assert.ok(one, key);
    const rpm = one.hz === 50 ? "1500" : "1800", other = one.hz === 50 ? "1800" : "1500";
    const tables = cn.specTables.filter((t) => t.n === one.n);
    assert.ok(tables.length, `${key}: nguồn ${one.n}`);
    const rows = tables.flatMap((t) => t.rows).filter((r) => r.split("|")[1].replace(/[^A-Za-z0-9]/g, "").toUpperCase() === key);
    const cells = (r) => r.split("|").map((c) => c.trim());
    assert.ok(rows.some((r) => cells(r).includes(rpm)), `${key}: có dòng ${rpm} v/p`);
    assert.ok(!rows.some((r) => cells(r).includes(other)), `${key}: không có dòng ${other} v/p`);
  }
});
