// Cổng kiểm chất lượng theo DÒNG (việc "Chất lượng 1", Khoa chốt 18/11/2026): luật gắn cờ. Dòng lệnh và đưa cờ lên web ở
// row-flags.mjs; config-bot.mjs dùng `blockedRows` để loại dòng khỏi candidates (chặng 2, B(iii)).
// Mỗi bản ghi `fromSupplier` (một động cơ / đầu phát đọc từ một dòng bảng) bị gắn cờ khi có ít nhất một dấu hiệu; mỗi
// dấu hiệu có MỨC (`LEVEL`, Khoa quyết 18/11/2026 sau khi xem số chặng 1):
//   absurd    "drop": số vô lý so với công suất của chính dòng (checkSpec của spec-diff.mjs + các nới ở absurdOf) — loại
//             khỏi Gợi ý cấu hình, Khoa bấm "cho dùng" khi cần
//   cylMaj    "show": số xi lanh của dòng khác giá trị thắng số đông các NCC cho cùng động cơ (majorityOf của config-bot.mjs:
//             ≥ 3 NCC, gấp ≥ 3 lần; một NCC một phiếu) — chỉ hiện cờ, KHÔNG loại (gần hết là nguồn tự ghi sai; candidates
//             đã xét số xi lanh theo số đông). CHỈ số xi lanh: NCC TQ chép chung bảng mẫu nên "số đông" dung tích không độc lập
// Khoa 18/11/2026 bỏ hai dấu hiệu của thiết kế đầu: "bảng đọc được ít dòng" (soát hết 807 dòng: ~98% đọc đúng — dòng trùng
// giữa bảng, tờ một tổ máy; bảng bỏ dòng đã có ở unread-tables.mjs) và "đảo vai động cơ ↔ đầu phát" (1/1 nhầm: P158LE).
// Cờ KHÔNG sửa dữ liệu (nguồn tự nghi sai mà đọc đúng ô: Khoa giữ nguyên theo nguồn).
// Khoá dòng (`rowKey`) bền qua lần đọc lại: NCC | vai | model | băm chữ của dòng (không dùng số nguồn n / số bảng, vì
// cào lại đánh số lại). Chữ dòng đổi (nguồn cập nhật) thì khoá đổi, quyết định cũ của Khoa không áp nữa (đúng ý: dòng mới).
import { createHash } from "node:crypto";
import { checkSpec } from "./spec-diff.mjs";
// Hàm của config-bot.mjs: config-bot import tệp này nên tệp này KHÔNG import ngược (vòng import với top-level await của
// config-bot làm node thoát 13); config-bot gọi useBot khi nạp. catalog.js (globalThis.GenbidCatalog) cũng do config-bot nạp.
let majorityOf, BLOCK, normFig, useNormCtx;
export const useBot = (m) => ({ majorityOf, BLOCK, normFig, useNormCtx } = m);
const C = new Proxy({}, { get: (_, k) => globalThis.GenbidCatalog[k] });

export const REASONS = {
  absurd: "số vô lý so với công suất của dòng",
  cylMaj: "số xi lanh lệch số đông NCC khác",
};
// "drop": dòng bị loại khỏi Gợi ý cấu hình (trừ khi Khoa cho dùng); "show": chỉ hiện cờ.
export const LEVEL = { absurd: "drop", cylMaj: "show" };
// Dòng bị loại khi có ít nhất một lý do mức "drop".
export const dropped = (f) => f.reasons.some((r) => LEVEL[r.code] === "drop");

const roleKey = (m) => String(m || "").toUpperCase().replace(/[\s._/-]+/g, "");
const rowText = (o) => (o.line != null ? String(o.line) : [o.genset || "", ...(o.lines?.rows || [])].join("\n"));
export const rowKey = (o) => [o.supplierId, o.kind, roleKey(o.model), createHash("sha1").update(rowText(o).replace(/\s+/g, " ").trim()).digest("hex").slice(0, 12)].join("|");

// Mọi bản ghi fromSupplier (trừ NCC incomplete), kèm bảng gốc.
export function recordsOf(S) {
  const out = [];
  for (const s of S) if (s.status !== "incomplete") for (const o of C.fromSupplier(s)) out.push(o);
  return out;
}

// Số xi lanh của một thông số qua lớp chuẩn hoá, như candidates (cylOf dưới cờ GENBID_SPEC_NORM): số / BLOCK / null.
function cylFig(f, u, rowsMap) {
  const x = normFig(f, useNormCtx(u, rowsMap), {});
  if (x.ok) return x.r.count ?? null;
  return x.why.includes("value") ? null : BLOCK;
}

// checkSpec (spec-diff.mjs) viết cho số ĐỔI / THÊM giữa hai bản mã đọc. Áp cho MỌI số thì nó trả false ở nhiều ca số
// đúng (soát toàn bộ 18/11/2026, xem nghiệm thu chat-luong-1-1): nên checkSpec là lượt đầu, cái nó cho qua thì qua; cái
// nó chặn thì xét lại bằng các nới dưới đây, chỉ ca không nới nào giải thích được mới là "vô lý".
//   không xét (null): ô không có số; kiểu điều tốc (chữ); dòng không có công suất mà phép kiểm cần công suất; dung tích /
//     khối lượng mà lớp chuẩn hoá không đọc ra số mang L / kg (cc, phẩy mơ hồ, không đơn vị).
//   dòng điện: mọi điện áp 3 pha thường gặp (208–480 V, trung thế 3,3–13,8 kV), 1 pha 220–240 V; công suất kVA, kW / 0,8
//     hay kW / 1, và mức kia (prime ↔ standby, ×/÷ 1,1) khi dòng chỉ ghi một mức.
//   công suất động cơ: dòng chỉ ghi kVA thì kW = kVA × 0,8; tổ máy dưới 50 kW cho tới 3,5 lần (động cơ nhỏ thường dư).
//   dung tích: 0,05–300 L (động cơ xăng một xi lanh 0,2 L; Yuchai YC16VC 105,56 L; Weichai 8WH32 257 L là thật); có công
//     suất thì 0,01–0,3 L mỗi kW prime.
//   điện áp / tốc độ: thêm mức thật checkSpec thiếu; ô ghi nhiều mức ("220,230,240", "50 Hz / 1500 rpm") đạt khi có một mức chuẩn.
// → true (hợp lý) / false (vô lý) / null (không xét).
const POWERED = new Set(["current", "weight", "engPower"]);
const VOLTS = new Set([110, 115, 120, 127, 133, 208, 220, 230, 240, 380, 400, 415, 440, 450, 460, 480, 600, 690, 2400, 3300, 4160, 6000, 6300, 6600, 10000, 10500, 11000, 13800]);
const RPM = new Set([750, 900, 1000, 1200, 1450, 1500, 1800, 3000, 3600]);
const nums = (v) => (String(v).match(/\d+(?:\.\d+)?/g) || []).map(Number);
// "1,963kg" / "43,100" → một số; danh sách "220,230,240" để nguyên (không phải phẩy nghìn).
const oneNum = (v) => (/^\D*\d{1,3}(,\d{3})+(?!\d)\D*$/.test(String(v)) ? String(v).replace(/,/g, "") : String(v));
function powersOf(P) {
  const kva = [], kw = [];
  for (const r of ["prime", "standby", "rated"]) {
    if (P[r]?.kVA) kva.push(P[r].kVA);
    if (P[r]?.kW) kw.push(P[r].kW);
  }
  return { kva, kw };
}
export function absurdOf(s, o, ctx) {
  const key = String(s.key).replace(/\d+$/, "");
  if (key === "gov" || !/\d/.test(String(s.value))) return null;
  const P = o.power || {}, { kva, kw } = powersOf(P);
  if (POWERED.has(key) && !kva.length && !kw.length) return null;
  if (key === "disp" || key === "weight") {
    const x = normFig(s, ctx, {});
    if (!x.ok || x.r.num == null || x.r.unit !== (key === "disp" ? "L" : "kg")) return null;
    if (key === "weight") return checkSpec(s.key, { ...s, value: String(x.r.num) }, o);
    const L = x.r.num, pk = P.prime?.kW ?? (P.prime?.kVA ? P.prime.kVA * 0.8 : null);
    if (L < 0.05 || L > 300) return false;
    return pk ? L / pk >= 0.01 && L / pk <= 0.3 : true;
  }
  const v = oneNum(s.value), first = nums(v)[0];
  if (checkSpec(s.key, { ...s, value: v }, o) !== false) return checkSpec(s.key, { ...s, value: v }, o);
  if (key === "voltage") return nums(v).some((x) => VOLTS.has(x));
  if (key === "speed") return nums(v).some((x) => RPM.has(x));
  if (key === "current") {
    const base = [...kva, ...kw.map((k) => k / 0.8), ...kw];
    const all = base.length && kva.length + kw.length <= 2 ? [...base, ...base.map((b) => b * 1.1), ...base.map((b) => b / 1.1)] : base;
    const per = [...[208, 220, 230, 240, 380, 400, 415, 440, 460, 480, 600, 690, 3300, 6300, 6600, 10500, 11000, 13800].map((V) => 1000 / (Math.sqrt(3) * V)), ...[220, 230, 240].map((V) => 1000 / V)];
    return all.some((b) => per.some((f) => Math.abs(first / (b * f) - 1) <= 0.04));
  }
  if (key === "engPower") {
    const gk = kw.length ? kw : kva.map((k) => k * 0.8), top = Math.max(...gk) < 50 ? 3.5 : 1.8;
    return gk.some((k) => first >= k * 0.9 && first <= k * top);
  }
  return false;
}

// S: mọi hồ sơ NCC. → { recs, flags: Map rowKey → { o, reasons: [{ code, detail }] }, bySup }
export function flagRows(S) {
  const recs = recordsOf(S);
  const rowsMap = new Map();
  for (const s of S) (s.specTables || []).forEach((t, i) => rowsMap.set(`${s.id}|${i}`, t.rows || []));
  const flags = new Map();
  const add = (o, code, detail) => {
    const k = rowKey(o);
    if (!flags.has(k)) flags.set(k, { o, reasons: [] });
    const f = flags.get(k);
    if (!f.reasons.some((r) => r.code === code && r.detail === detail)) f.reasons.push({ code, detail });
  };

  // 1. số vô lý
  for (const o of recs) for (const s of o.specs || []) {
    if (absurdOf(s, o, useNormCtx(o, rowsMap)) === false) add(o, "absurd", `${s.key} "${s.value}" (nhãn "${s.label}")`);
  }
  // 2. số xi lanh lệch số đông
  const byEng = new Map();
  for (const o of recs) if (o.kind === "engine") {
    const k = C.keyOf(o.model);
    if (!byEng.has(k)) byEng.set(k, []);
    for (const s of o.specs || []) if (s.key === "cyl") byEng.get(k).push({ o, s, x: cylFig(s, o, rowsMap) });
  }
  for (const [, list] of byEng) {
    const mj = majorityOf(list.map(({ o, x }) => [o.supplierId, x]));
    if (!mj) continue;
    for (const { o, s, x } of list) if (x != null && x !== BLOCK && x !== mj.win)
      add(o, "cylMaj", `"${s.value}" = ${x}, số đông ${Object.entries(mj.votes).map(([v, c]) => `${v} × ${c}`).join(", ")}`);
  }
  // Theo NCC: bảng có bản ghi, bảng có ≥ 1 dòng bị cờ; drop = dòng bị loại (mức "drop").
  const bySup = new Map();
  const sup = (id) => { if (!bySup.has(id)) bySup.set(id, { tables: new Set(), flagged: new Set(), recs: 0, rows: 0, drop: 0, by: {} }); return bySup.get(id); };
  for (const o of recs) { const s = sup(o.supplierId); s.tables.add(o.table); s.recs++; }
  for (const f of flags.values()) {
    const s = sup(f.o.supplierId);
    s.flagged.add(f.o.table); s.rows++;
    if (dropped(f)) s.drop++;
    for (const r of new Set(f.reasons.map((r) => r.code))) s.by[r] = (s.by[r] || 0) + 1;
  }
  return { recs, flags, bySup };
}

// NCC quá nửa số bảng (có bản ghi) bị nghi → sửa mã đọc, không phải lỗi dữ liệu lẻ.
export const overHalf = (bySup) => [...bySup].filter(([, s]) => s.flagged.size * 2 > s.tables.size).map(([id, s]) => ({ id, flagged: s.flagged.size, tables: s.tables.size }));

// Chặng 2, B(iii): dòng bị loại khỏi candidates (config-bot.mjs), CẢ DÒNG bảng (NCC + chữ dòng; động cơ lẫn đầu phát của
// dòng đó). Thông số đọc theo dòng nên một số vô lý gắn cờ cả bản ghi động cơ lẫn đầu phát của dòng: quyết định trên web áp
// cho cả DÒNG (khoá dòng = NCC | băm chữ dòng, hai phần đầu và cuối của rowKey; web `rowOkOf` cùng cách). Bị loại khi: dòng
// có cờ mức "drop" mà người duyệt chưa "cho dùng", hoặc người duyệt "bỏ hẳn" dòng (có cờ hay không). rowKey đổi khi chữ
// dòng đổi: quyết định cũ thôi áp. rowok: { [supplierId]: { [rowKey]: { d } } } (docs rowok/<NCC>). → Set khoá dòng.
const lineOfKey = (k) => { const p = String(k).split("|"); return `${p[0]}|${p[p.length - 1]}`; };
export const lineKey = (o) => lineOfKey(rowKey(o));
// webRows: rows của doc rowflags/current (workflow supplier-publish.yml tính trên đúng dữ liệu NCC trên web) thay cho tự
// tính: flagRows đọc lại mọi bảng (~20–40 s mỗi lượt Gợi ý); không có thì tự tính trên S.
export function blockedRows(S, rowok = {}, webRows = null) {
  const decided = new Map(); // khoá dòng → "ok" | "drop" ("drop" thắng khi hai bản ghi của dòng có hai quyết định)
  for (const [sid, m] of Object.entries(rowok || {})) for (const [k, v] of Object.entries(m || {})) {
    if (!k.startsWith(sid + "|") || !["ok", "drop"].includes(v?.d)) continue; // khoá của NCC khác: không áp
    const l = lineOfKey(k);
    if (decided.get(l) !== "drop") decided.set(l, v.d);
  }
  const out = new Set([...decided].filter(([, d]) => d === "drop").map(([l]) => l));
  const drops = Array.isArray(webRows) ? webRows.filter((r) => r?.drop && r.key).map((r) => r.key) : [...flagRows(S).flags].filter(([, f]) => dropped(f)).map(([k]) => k);
  for (const k of drops) if (decided.get(lineOfKey(k)) !== "ok") out.add(lineOfKey(k));
  return out;
}

// Chặng 2: cờ lên web là MỘT doc rowflags/current (cờ số xi lanh dựa số đông mọi NCC: một NCC đổi có thể đổi cờ NCC
// khác; một doc thì không phải dọn doc của NCC hết cờ). `text` = chữ nguyên văn của dòng (bảng nhãn: tên tổ máy + các
// dòng), chỉ màn "dòng nghi sai" hiện nó (ngoại lệ SHOW_SRC, điều phối 18/11/2026); link nguồn web lấy từ sources của NCC.
export const webRows = (all) => all.map(([key, f]) => ({ key, supplierId: f.o.supplierId, n: f.o.n, table: f.o.table, row: f.o.row ?? null, kind: f.o.kind, model: f.o.model, text: rowText(f.o), drop: dropped(f), reasons: f.reasons }))
  .sort((a, b) => a.supplierId.localeCompare(b.supplierId) || a.n - b.n || a.table - b.table || (a.row ?? -1) - (b.row ?? -1) || a.key.localeCompare(b.key));
