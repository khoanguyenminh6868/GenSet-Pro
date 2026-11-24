// node --test suppliers/kw-hp-sua.test.mjs — kw-hp-sua (Khoa 24/11/2026 "làm như em đề xuất"): (1) 5 ô "(kW/Hp)" của ettes-power không ghi
// đơn vị cho MỘT số / cặp 507/580 → `unitspec` (danh sách tường minh), `missing: unit`, KHÔNG là kW; (2) bộ ba kw/hp/rpm của ricardo-weifang
// (nhãn nêu bộ ba, HP/kW trong 1,30–1,37) đọc kW, HP, v/p. Mỗi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/conversions.js";
import "../web/catalog.js";
import "../web/spec-norm.js";
import { enginePowerOf, ratedFacts, normFig } from "./config-bot.mjs";
import { standardOf } from "./spec-standard.mjs";

const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const ettes = real("ettes-power"), ricardo = real("ricardo-weifang");
const recs = (s) => C.fromSupplier(s).filter((r) => r.kind === "engine");
const E = recs(ettes), R = recs(ricardo);
const pick = (list, n, genset) => list.find((r) => r.n === n && r.genset === genset);
const CELLS = [[143, "ET-3750", "3311"], [143, "ET-3250", "2590"], [143, "ET-3438", "2590"], [143, "ET-4000", "3311"], [145, "EC-450M6", "507/580"]];
const norm = (r) => SN.normalizeRecord(r, r.lines?.rows || (r.line ? [r.line] : [])).find((x) => x.key === "engPower");

test("5 ô: cờ unitMissing, đọc không đơn vị (missing unit), không là kW", () => {
  for (const [n, g, v] of CELLS) {
    const r = pick(E, n, g), sp = r.specs.find((x) => x.key === "engPower");
    assert.equal(sp.value, v);
    assert.ok(sp.unitMissing, `${g} thiếu cờ`);
    const x = norm(r);
    assert.equal(x.unit, null, g);
    assert.ok(x.missing.includes("unit"), g);
    assert.notEqual(x.unit, "kW");
    if (v === "507/580") { assert.equal(x.num, undefined); assert.deepEqual(x.options, [507, 580]); } else assert.equal(x.num, Number(v));
  }
});

test("44 ô một số còn lại của ettes-power: vẫn kW, không cờ (không có luật chung)", () => {
  const rest = E.filter((r) => r.specs.some((s) => s.key === "engPower" && /kW\/Hp/i.test(s.label) && /^\d+$/.test(s.value) && !s.unitMissing));
  assert.ok(rest.length > 40);
  for (const r of rest) assert.equal(norm(r).unit, "kW");
  // dòng kế bên ET-3000 cùng bảng 143 không đổi
  assert.equal(E.filter((r) => r.specs.some((s) => s.unitMissing)).length, 5);
});

test("số của 5 ô không vào công suất động cơ: enginePowerOf, ratedFacts, normFig, bản chuẩn power_kwm", () => {
  for (const [n, g] of CELLS) {
    const r = pick(E, n, g), sp = r.specs.find((x) => x.key === "engPower");
    assert.equal(enginePowerOf(r), null, g);
    assert.deepEqual(ratedFacts(sp.label, sp.value, { maker: true }), [], g);
    const f = normFig(sp, { title: r.title, header: [], rows: [r.line] });
    assert.equal(f.ok, false);
    assert.ok(f.why.includes("unit"));
  }
  const docs = standardOf([ettes]);
  const items = [];
  for (const d of docs) if (d.part === "engine" && ["20V4000G63", "20V4000G63L", "K19DM", "K19-DM"].includes(d.key)) for (const it of d.fields.power_kwm || []) items.push({ key: d.key, ...it });
  // Số không đơn vị không nằm dưới khoá kwm (spec-standard-sua): cột `figure`, vẫn hiện kèm missing "unit".
  const fig = (it) => [].concat(it.value.figure ?? []);
  assert.deepEqual(items.filter((it) => [3311, 2590, 507].some((v) => [].concat(it.value.kwm ?? []).includes(v))), []);
  const flagged = items.filter((it) => [3311, 2590, 507].some((v) => fig(it).includes(v)));
  // 3311 (hai dòng) và 2590 (hai dòng) gộp theo giá trị; cặp 507/580 là `options`.
  for (const v of [3311, 2590, 507]) assert.ok(flagged.some((it) => fig(it).includes(v)), `thiếu ${v} trong bản chuẩn`);
  assert.ok(flagged.every((it) => it.unit == null && it.missing.includes("unit")));
});

test("ricardo: 10 dòng kw/hp/rpm đọc kW, HP, v/p; n103 nhãn kw/rpm giữ nguyên", () => {
  const rows = R.map((r) => ({ r, sp: r.specs.find((s) => s.key === "engPower") })).filter((x) => x.sp && /kw\/hp\/rpm/i.test(x.sp.label));
  assert.equal(rows.length, 10);
  for (const { r, sp } of rows) {
    const [a, b, c] = sp.value.split("/").map(Number), x = norm(r);
    assert.equal(x.num, a); assert.equal(x.unit, "kW"); assert.equal(x.cond.hp, b); assert.equal(x.cond.rpm, c);
    assert.ok(!x.missing.includes("ambiguous") && !x.missing.includes("speed"));
    // nhãn "Rated" không nêu prime / standby: Gợi ý (enginePowerOf) vẫn không dùng số này như trước
    assert.equal(enginePowerOf(r), null);
  }
  const r103 = R.find((r) => r.n === 103), x = norm(r103);
  assert.ok(x.missing.includes("ambiguous"));
});

test("ricardo: tỉ số ngoài 1,30–1,37 thì giữ ambiguous", () => {
  const x = SN.normalize({ key: "engPower", label: "Rated Power/Speed(kw/hp/rpm)", value: "40/45/1500" }, {});
  assert.ok(x.missing.includes("ambiguous"));
  assert.equal(x.num, undefined);
});
