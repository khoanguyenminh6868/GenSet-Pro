// node --test suppliers/dau-phat-dinh-muc.test.mjs — định mức tờ đầu phát dạng A / B (buoc-3-dau-phat-dinh-muc, 25/11/2026):
// Kwise, Shangyan, Linz, Firstall đọc từ tệp nguồn THẬT; bảng bố cục không chắc (Faraday, Shangyan n111–113 / n117,
// Firstall n1007, Kwise n1009) không ra số nào.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { kwiseRatings, shangyanRatings, linzRatings, firstallRatings, sheetRatings, ratingsOf } from "./ratings.mjs";
import { sourceRatings, ratingsFor } from "./config-bot.mjs";

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), "sources");
const read = (id, n) => fs.readFileSync(path.join(SRC, id, `${n}.md`), "utf8");
const one = (rs, q) => {
  const hit = rs.filter((r) => Object.entries(q).every(([k, v]) => r[k] === v));
  assert.equal(hit.length, 1, JSON.stringify(q));
  return hit[0];
};

test("Kwise n1001: cột 3 pha theo tần số × chế độ × điện áp sao; nhóm 1 pha không đọc", () => {
  const rs = kwiseRatings(read("kwise-generator", 1001));
  const a = rs.filter((r) => r.model === "KAL164A1");
  assert.equal(a.length, 16); // 2 tần số × 2 chế độ × 4 điện áp
  const c = one(a, { hz: 50, volt: 380, duty: "Cont." });
  assert.deepEqual([c.kVA, c.kW, c.rise, c.phase, c.conn, c.pf], [8.1, 6.5, "125/40°C", 3, "Y", 0.8]);
  const s = one(a, { hz: 50, volt: 440, duty: "Standby" });
  assert.deepEqual([s.kVA, s.kW, s.rise], [8.5, 6.8, "163/27°C"]);
  assert.equal(one(a, { hz: 60, volt: 480, duty: "Standby" }).kVA, 10.7);
  assert.ok(!rs.some((r) => r.volt < 380 || r.phase !== 3));
  assert.ok(a.filter((r) => r.hz === 50).every((r) => r.lines.includes("| KAL164A1 | kVA | 8.1 | 8.1 | 8.1 | 7.7 | 9.1 | 9.1 | 9.1 | 8.5 | 5.5 | 6.5")));
  assert.equal(kwiseRatings(read("kwise-generator", 1009)).length, 0);
});

test("Shangyan n109: tần số × chế độ (Common / Backup) × điện áp; không ghi pha, PF", () => {
  const rs = shangyanRatings(read("shangyan-jiangsu", 109)), a = rs.filter((r) => r.model === "GR270C");
  assert.equal(a.length, 18);
  const c = one(a, { hz: 50, volt: 380, duty: "Cont." });
  assert.deepEqual([c.kVA, c.kW, c.eff, c.rise, c.phase, c.pf], [100, 80, 89.8, "125/40°C", null, null]);
  const s = one(a, { hz: 60, volt: 480, rise: "163/27°C" });
  assert.deepEqual([s.duty, s.kVA, s.kW], ["Standby", 137.5, 110]);
  // n105: không có dòng độ tăng nhiệt → chế độ / độ tăng nhiệt trống; "Pated power (KW)" (lỗi gõ của tờ) vẫn là dòng kW.
  const b = one(shangyanRatings(read("shangyan-jiangsu", 105)), { model: "GR160-2D", hz: 60, volt: 416 });
  assert.deepEqual([b.kVA, b.kW, b.duty, b.rise, b.conn], [14.7, 11.8, null, null, "series"]);
  // n111 / n112 ("105℃" không chữ chế độ, cột 600 V), n113 (số điện áp lẫn vào dòng kVA), n117 (9 cột lẻ): không đọc.
  for (const n of [111, 112, 113, 117]) assert.equal(shangyanRatings(read("shangyan-jiangsu", n)).length, 0, `n${n}`);
});

test("Linz n1001: cấp H / F không ghi chế độ, Standby không ghi cấp; cột Double Delta không đọc", () => {
  const rs = linzRatings(read("linz-electric", 1001));
  assert.equal(rs.length, 32); // 8 cột sao × 4 dòng định mức
  const h = one(rs, { hz: 50, volt: 380, cls: "H" });
  assert.deepEqual([h.model, h.kVA, h.kW, h.duty, h.rise, h.phase, h.pf], ["PRO18L F/4", 50, 40, null, "125/40°C", 3, 0.8]);
  const s = one(rs, { hz: 60, volt: 480, rise: "163/27°C" });
  assert.deepEqual([s.duty, s.cls, s.kVA, s.kW], ["Standby", null, 66, 52.8]);
  assert.ok(!rs.some((r) => [115, 138, 230, 277].includes(r.volt)));
  // Tờ một tần số (n1005, 50 Hz rồi 60 Hz): cột "115/230" (1 pha nối lại) không đọc.
  const t = linzRatings(read("linz-electric", 1005));
  assert.equal(one(t, { hz: 60, volt: 415, cls: "H" }).kVA, 21);
  assert.ok(!t.some((r) => r.volt === 115 || r.volt === 138));
});

test("Firstall n1001: cấp H 125 °C, không ghi chế độ; n1007 (dòng cắt) không đọc", () => {
  const rs = firstallRatings(read("firstall-power", 1001));
  assert.equal(rs.length, 8);
  const r = one(rs, { hz: 60, volt: 480 });
  assert.deepEqual([r.model, r.kVA, r.kW, r.cls, r.rise, r.duty, r.phase, r.pf], ["QYI454G", 2750, 2200, "H", "125°C", null, null, null]);
  assert.equal(firstallRatings(read("firstall-power", 1007)).length, 0);
});

test("Bảng không chắc cột (Faraday n101: 6 điện áp tăng dần, không biết chỗ chia 50 / 60 Hz) không ra số", () => {
  assert.equal(sheetRatings(read("faraday-wuxi", 101)).length, 0);
});

test("Tờ đã đọc từ trước không có bản ghi của bộ đọc mới", () => {
  for (const [id, n] of [["stamford-avk-china", 1002], ["leroy-somer-fuzhou", 1001], ["mecc-alte", 1007]]) {
    const t = read(id, n);
    assert.equal(sheetRatings(t).length, 0, `${id} ${n}`);
    assert.ok(ratingsOf(t).length > 0);
  }
});

test("sourceRatings: model Kwise / Linz vào bảng định mức đầu phát", () => {
  const RT = sourceRatings([{ id: "kwise-generator", role: "alternator_maker", names: { en: "Kwise" }, sources: [{ n: 1001, url: "u" }] },
    { id: "linz-electric", role: "alternator_maker", names: { en: "Linz" }, sources: [{ n: 1001, url: "v" }] }], SRC);
  const k = [...RT.alt.values()].flat();
  assert.ok(k.some((x) => x.model === "KAL164A1" && x.supplierId === "kwise-generator" && x.n === 1001));
  assert.ok(k.some((x) => x.model === "PRO18L F/4" && x.supplierId === "linz-electric"));
  // "/4" là số cực, không phải model thứ hai: tra theo đúng tên, không có khoá rác "PRO4".
  assert.equal(ratingsFor(RT.alt, "PRO18L F/4").length, 32);
  assert.equal(ratingsFor(RT.alt, "PRO4").length, 0);
  assert.equal(ratingsFor(RT.alt, "KAL164A1").length, 16);
});
