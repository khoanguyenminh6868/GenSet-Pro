// Cổng kiểm chất lượng theo DÒNG (việc "Chất lượng 1", Khoa chốt 18/11/2026). Chặng 1: CHỈ PHÁT HIỆN, chạy trên toàn bộ
// suppliers/cn và báo cáo; chưa nối vào Gợi ý cấu hình (candidates), chưa có màn hình, chưa lưu quyết định nào.
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
//   node suppliers/row-flags.mjs                     tóm tắt: theo lý do, theo NCC, NCC quá nửa bảng nghi
//   node suppliers/row-flags.mjs --list <lý do> [--id <NCC>]   liệt kê từng dòng bị gắn cờ (để soát hết, không lấy mẫu)
//   node suppliers/row-flags.mjs --json <tệp>        ghi toàn bộ danh sách
//   node suppliers/row-flags.mjs --post [--dry] [--out <tệp>]   đưa cờ lên web (rowflags/current), xem post() bên dưới
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkSpec } from "./spec-diff.mjs";
import { majorityOf, BLOCK, normFig, useNormCtx } from "./config-bot.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const C = globalThis.GenbidCatalog; // nạp bởi config-bot.mjs

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

// Chặng 2: cờ lên web là MỘT doc rowflags/current (cờ số xi lanh dựa số đông mọi NCC: một NCC đổi có thể đổi cờ NCC
// khác; một doc thì không phải dọn doc của NCC hết cờ). `text` = chữ nguyên văn của dòng (bảng nhãn: tên tổ máy + các
// dòng), chỉ màn "dòng nghi sai" hiện nó (ngoại lệ SHOW_SRC, điều phối 18/11/2026); link nguồn web lấy từ sources của NCC.
export const webRows = (all) => all.map(([key, f]) => ({ key, supplierId: f.o.supplierId, n: f.o.n, table: f.o.table, row: f.o.row ?? null, kind: f.o.kind, model: f.o.model, text: rowText(f.o), drop: dropped(f), reasons: f.reasons }))
  .sort((a, b) => a.supplierId.localeCompare(b.supplierId) || a.n - b.n || a.table - b.table || (a.row ?? -1) - (b.row ?? -1) || a.key.localeCompare(b.key));
export const webDoc = (all) => ({ at: new Date().toISOString(), commit: process.env.GITHUB_SHA || "", rows: webRows(all) });
// node suppliers/row-flags.mjs --post [--dry] [--out <tệp>]: workflow supplier-publish.yml (SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY) ghi rowflags/current CHỈ khi danh sách dòng khác bản trên web (đổi updated_at làm mọi trang
// đang mở tải lại doc). --dry: không ghi; --out: ghi doc ra tệp để xem / thử màn hình.
export async function post(doc, dry, out) {
  if (out) fs.writeFileSync(out, JSON.stringify(doc, null, 1) + "\n", "utf8");
  console.log(`rowflags/current: ${doc.rows.length} dòng (${doc.rows.filter((r) => r.drop).length} bị loại), ${JSON.stringify(doc).length} byte${out ? `, đã ghi ${out}` : ""}`);
  const SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (dry) return;
  if (!SB || !KEY) { console.log("Chưa đặt SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY: không ghi."); return; }
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
  const r0 = await fetch(`${SB}/rest/v1/docs?coll=eq.rowflags&id=eq.current&select=data`, { headers: H });
  if (!r0.ok) { console.error(`Đọc rowflags/current: HTTP ${r0.status}: ${(await r0.text()).slice(0, 300)}`); process.exit(1); }
  const cur = (await r0.json())[0]?.data;
  if (cur && JSON.stringify(cur.rows) === JSON.stringify(doc.rows)) { console.log("Không đổi so với bản trên web: không ghi."); return; }
  const r = await fetch(`${SB}/rest/v1/docs`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify([{ coll: "rowflags", id: "current", data: doc, updated_at: doc.at }]) });
  if (!r.ok) { console.error(`HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`); process.exit(1); }
  console.log("đã ghi rowflags/current");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const dir = path.join(ROOT, "cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const { recs, flags, bySup } = flagRows(S);
  const argv = process.argv.slice(2), opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
  const all = [...flags.entries()];
  if (argv.includes("--post")) await post(webDoc(all), argv.includes("--dry"), opt("--out"));
  else if (opt("--json")) {
    fs.writeFileSync(opt("--json"), JSON.stringify(all.map(([k, f]) => ({ key: k, supplierId: f.o.supplierId, n: f.o.n, table: f.o.table, row: f.o.row ?? null, kind: f.o.kind, model: f.o.model, line: f.o.line ?? null, drop: dropped(f), reasons: f.reasons })), null, 1) + "\n", "utf8");
    console.log(`đã ghi ${opt("--json")}: ${all.length} dòng`);
  } else if (opt("--list")) {
    const code = opt("--list"), id = opt("--id");
    for (const [, { o, reasons }] of all) for (const r of reasons) if (r.code === code && (!id || o.supplierId === id))
      console.log(`${o.supplierId} n${o.n} b${o.table} dòng ${o.row ?? "L"} ${o.kind} ${o.model} | ${r.detail} | P ${JSON.stringify(o.power)} | ${String(o.line ?? "(bảng nhãn)").slice(0, 220)}`);
  } else {
    const keys = new Set(recs.map(rowKey));
    console.log(`bản ghi ${recs.length} (khoá khác nhau ${keys.size}), bị gắn cờ ${flags.size}, trong đó bị loại (mức drop) ${all.filter(([, f]) => dropped(f)).length}`);
    const cnt = {};
    for (const [, { reasons }] of all) for (const c of new Set(reasons.map((r) => r.code))) cnt[c] = (cnt[c] || 0) + 1;
    for (const [c, n] of Object.entries(cnt)) console.log(`${String(n).padStart(6)}  ${c} (${LEVEL[c]})  ${REASONS[c]}`);
    console.log("\nTheo NCC (dòng bị cờ / bản ghi; bị loại; bảng nghi / bảng):");
    for (const [id, s] of [...bySup].filter(([, s]) => s.rows).sort((a, b) => b[1].rows - a[1].rows))
      console.log(`  ${id}: ${s.rows}/${s.recs}; loại ${s.drop}; ${s.flagged.size}/${s.tables.size} bảng; ${JSON.stringify(s.by)}`);
    console.log("\nNCC quá nửa số bảng bị nghi:");
    for (const x of overHalf(bySup)) console.log(`  ${x.id}: ${x.flagged}/${x.tables}`);
  }
}
