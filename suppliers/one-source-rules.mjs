// Luật dùng chung của giá trị một nguồn internet (one-source.json): điều kiện / giá trị của một bản ghi (`sigOf`) và "tài
// liệu hãng trong repo đã ghi trường này chưa" (`makerHits`). Bộ kiểm (one-source-check.mjs, lỗi 6 / 7) và bản chuẩn
// (spec-standard.mjs, luật thắng mục 3 của thiết kế) dùng CÙNG một luật, nên nằm ở đây.
// Chỉ import verify.mjs (không import config-bot, không import one-source-check.mjs): spec-standard nạp tệp này tĩnh mà
// không tạo vòng import (one-source-check nạp config-bot; config-bot nạp verify).
import { numbersIn } from "./verify.mjs";

// Ô của trường bảng là điều kiện (điện áp, tần số, mức, cấp, tốc độ…), không phải giá trị.
export const COND_COLS = new Set(["voltage", "connection", "phases", "hz", "duty", "ambient_c", "insulation_rise", "rating", "rpm", "kind"]);
const RATED = { prime: "engPrime", standby: "engStandby" };
// Thuộc tính tờ đầu phát (ratings.mjs altSheetAttrs / lsSheetAttrs) → trường chuẩn.
const ATTR_FIELD = { insulation: "insulation", poles: "poles", overspeed: "overspeed", thd: "thd_linear_load" };

export const stable = (v) => JSON.stringify(v, (_, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x));
export const isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);
export const short = (s, n = 80) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const dutyOf = (s) => (s == null ? null : /stand/i.test(String(s)) ? "standby" : "continuous");
const riseOf = (s) => (s == null ? null : numbersIn(s).find((x) => x >= 60 && x <= 200) ?? null);
const same = (a, b) => a == null || b == null || a === b;

// Điều kiện và giá trị của một bản ghi, để so trùng / mâu thuẫn.
export function sigOf(rec, f) {
  const pick = (want) => Object.fromEntries(Object.entries(rec.value || {}).filter(([k]) => COND_COLS.has(k) === want));
  const table = f?.type === "table" && isObj(rec.value);
  return { cond: stable({ cond: rec.cond ?? null, cells: table ? pick(true) : null }), value: stable({ value: table ? pick(false) : rec.value, unit: rec.unit ?? null }) };
}

// Tài liệu hãng trong repo đã ghi trường này cho model này chưa (lỗi 6). `auto`: false = không kiểm tự động được (trường chưa
// có code đọc, bộ điều khiển): bộ kiểm ghi lưu ý và đòi makerChecked không rỗng. `hits`: dòng tờ hãng ghi trường đó.
// ctx: { facts (modelFacts), altRatings / altAttrs / engRatings (sourceRatings alt / attr / eng), suppliers: Map(id → { role }) }.
export function makerHits(rec, f, ctx) {
  const role = (id) => ctx.suppliers?.get(id)?.role;
  const hit = (x) => `${x.supplierId} nguồn ${x.n}: "${short(x.line ?? (x.lines || [])[0])}"`;
  const hits = [];
  if (rec.part === "controller") {
    const n = (ctx.facts?.get(`controller:${rec.key}`) || []).length;
    return { auto: false, hits, why: n ? `bộ điều khiển: ${n} dòng tờ hãng trong repo cho model này, chưa có code nối dòng với trường` : "bộ điều khiển: chưa có code nối dòng tờ hãng với trường" };
  }
  const facts = ctx.facts?.get(`${rec.part}:${rec.key}`) || [];
  if (rec.part === "engine" && f.id === "power_kwm") {
    const v = isObj(rec.value) ? rec.value : {}, keys = v.rating ? [RATED[v.rating]].filter(Boolean) : ["engPrime", "engStandby"];
    for (const x of facts) if ((keys.includes(x.key) && x.maker) || (x.key === "engPower" && x.sheet)) if (same(v.rpm ?? null, x.rpm ?? null)) hits.push(hit(x));
    for (const x of ctx.engRatings?.get(rec.key) || []) if (x.maker && keys.includes(x.key) && same(v.rpm ?? null, x.rpm ?? null)) hits.push(hit(x));
  } else if (f.key) for (const x of facts) if (x.sheet && x.key === f.key) hits.push(hit(x));
  if (rec.part === "alternator") {
    if (f.id === "ratings" && isObj(rec.value)) {
      const v = rec.value;
      for (const x of ctx.altRatings?.get(rec.key) || []) {
        if (role(x.supplierId) !== "alternator_maker") continue;
        if (same(v.voltage, x.volt) && same(v.hz, x.hz) && same(v.phases, x.phase) && same(dutyOf(v.duty), dutyOf(x.duty)) && same(riseOf(v.insulation_rise), riseOf(x.rise))) hits.push(hit(x));
      }
    }
    for (const a of ctx.altAttrs?.get(rec.key) || []) if (ATTR_FIELD[a.key] === f.id && role(a.supplierId) === "alternator_maker") hits.push(hit(a));
  }
  const auto = !!f.key || (rec.part === "alternator" && f.id === "ratings");
  return { auto, hits: [...new Set(hits)], why: auto ? null : "trường chưa có code đọc (không có key trong spec-fields.json)" };
}
