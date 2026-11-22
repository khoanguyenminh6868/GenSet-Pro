// "Gợi ý" in the Cấu hình gợi ý tab, run on the Windows PC next to the GenBid bot:
//   node suppliers/config-bot.mjs run            answer every pending configreq/<TBMT> (one Claude agent per request)
//                                                and findreq/<TBMT> (Tìm NCC: Claude, find-prompt.md;
//                                                the suppliers it adds go into configmatch/<TBMT> in code, no agent)
//                                                and bidpricereq/<TBMT> (Gợi ý giá đấu, bidprice-bot.mjs)
//   node suppliers/config-bot.mjs merge-find --key <TBMT>          do that again from the stored findmatch
//   node suppliers/config-bot.mjs find-check --dir <dir>          check newCatalog.json of a Tìm NCC folder in code
//   node suppliers/config-bot.mjs spec --id <supplier>            Tìm Thông Số of one supplier (skill tim-thong-so-ncc);
//                                                spec-prep --id <s> --out <dir>, spec-check --dir <dir>, spec-post --dir <dir>
//   node suppliers/config-bot.mjs prep --key <TBMT> --out <dir>
//   node suppliers/config-bot.mjs save --dir <dir> --url <url>     (used by the agent for internet sources)
//   node suppliers/config-bot.mjs check --dir <dir>                verify result.json in code (prints what failed)
//   node suppliers/config-bot.mjs post --dir <dir> --key <TBMT> --requested-at <iso>
// Data is read from and written to the web (Vercel API) with the ingest token, which is never printed.
// The agent (claude -p, Opus, with WebSearch) follows config-prompt.md. check marks every quote or number the code
// cannot find word for word in the HSMT text, the catalog row or a saved web page as unverified, and turns such a
// "met" into "unclear" (Khoa, 2026-10-28: the answer must be exactly right). A value may be converted (kW ↔ kVA,
// L/h ↔ g/kWh...) only with a formula of web/conversions.js, which check recomputes; each configuration also names
// the suppliers in the system that sell it, each checked against that supplier's own table row (Khoa, 2026-10-29).
// "Xuất xứ" (configreq origin: cn, default / g7 / g20 / other / all) limits the engines to Chinese makes (or any make a
// supplier based in China offers, Khoa 2026-11-02), to makes of a G7 / G20
// country (catalog.js ENGINE_COUNTRY, Khoa 2026-11-02) or to foreign ones
// (web/catalog.js originOf); check drops a configuration whose engine is of the other origin (Khoa, 2026-10-29).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { norm } from "./verify.mjs";
import { htmlToText } from "./crawl-specs.mjs";
import { REQ_CODES, CODE_BY, OTHER as OTHER_CODE, codeOf, withCode, missingCodes, codesMd, kindOf, confirmKindOf, voltsIn, clausesOf } from "./reqcodes.mjs";
import { ratingsOf, stamfordRatings, altSheetAttrs, lsSheetAttrs, meccDerate, meccSheetAttrs } from "./ratings.mjs";
import { apiMeter, switchToPlan, taskEnv } from "./api-budget.mjs";
import * as MEMO from "./web-memo.mjs";
import * as FC from "./firecrawl.mjs";
import * as RG from "./read-guard.mjs";
import * as NG from "./named-genset.mjs";
import { skippedOf, dropSkipped, UNFILTERED_WARNING } from "./sup-skip.mjs";
import { specSkip } from "./spec-skip.mjs";
import { useBot as rowFlagsUse, blockedRows, lineKey } from "./row-flags-lib.mjs";
import * as ET from "./engine-traits.mjs";
import { variantFamily } from "./engine-variant.mjs";
import * as CM from "./ctl-module.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = fileURLToPath(import.meta.url);
const WEB = process.env.GENBID_WEB || "https://genset-pro-web.vercel.app";
const TOKEN_FILE = process.env.GENBID_INGEST_TOKEN_FILE || "C:/Projects/GenSet Pro/.genbid-ingest-token";
const CLAUDE = process.env.GENBID_CLAUDE || "claude";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const arg = (k, d = "") => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const token = () => fs.readFileSync(TOKEN_FILE, "utf8").trim();
const numbersIn = (s) => (norm(s).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
// Also reads "0,8" as 0.8 (Vietnamese decimal comma).
const numbersLoose = (s) => [...numbersIn(s), ...numbersIn(String(s ?? "").replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"))];
await import(pathToFileURL(path.join(ROOT, "..", "web", "conversions.js")).href);
const CONV = globalThis.GenbidConversions;
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
await import(pathToFileURL(path.join(ROOT, "..", "web", "bidprice.js")).href);
const BP = globalThis.GenbidBidprice;
await import(pathToFileURL(path.join(ROOT, "..", "web", "spec-norm.js")).href);
const SN = globalThis.GenbidSpecNorm;
// ---------- Lớp chuẩn hoá nối vào so số (việc noi-chuan-hoa, 14/11/2026: CHỈ ĐO, cờ mặc định tắt) ----------
// GENBID_SPEC_NORM=1: every place the code compares a source figure with an HSMT limit (candidates: displacement, cylinders,
// bore × stroke, fuel; fuelChecks; khoaRules: weight, size, noise; makerSheetChecks: compression, displacement, cylinders;
// kwmOf: the row's engine power) reads the figure through web/spec-norm.js. A figure whose normalized form misses its unit,
// is ambiguous / unreadable (number, kind, value), or lacks the condition the HSMT's limit is at (the load for fuel, the
// distance for noise, open / canopy for size and weight, the stroke for bore) is not compared: "Chưa rõ" (a candidate stays,
// with no points off). One that has them is compared in its own unit (no conversion beyond web/conversions.js: cc, cm, t
// stay unconverted, so not compared with L, mm, kg). ON by default on every machine (Khoa 2026-11-15 "commit và apply",
// 2026-11-17: set in code, the installer's user variable missed machines that had not run it again); GENBID_SPEC_NORM=0
// turns it off (every result as before the layer).
// By group, for Khoa to turn on one part at a time: GENBID_SPEC_NORM=fuel,disp,other ("1" = all). fuel: fuel consumption
// (candidates, fuelChecks); disp: displacement and bore × stroke (candidates, makerSheetChecks); other: cylinders,
// compression, weight, size, noise, engine power. specNormOn() with no group: any group on.
const NORM_GROUPS = ["fuel", "disp", "other"];
export const specNormOn = (group) => {
  const v = String(process.env.GENBID_SPEC_NORM ?? "1").trim() || "1";
  if (v === "0") return false;
  const on = v === "1" ? NORM_GROUPS : v.split(/[,\s]+/);
  return group ? on.includes(group) : on.some((g) => NORM_GROUPS.includes(g));
};
// The table a spec / fact was read from ({ title, header, rows }), for the layer's header units and decimal-comma rule.
const NORM_CTX = new WeakMap();
let NORM_ROWS = { of: null, map: new Map() };
// The rows of every supplier table, by `${supplierId}|${table index}` (normalizeRecord takes the whole table's rows).
function normRowsOf(suppliers) {
  if (NORM_ROWS.of === suppliers) return NORM_ROWS.map;
  const map = new Map();
  for (const s of suppliers || []) (s?.specTables || []).forEach((t, i) => map.set(`${s.id}|${i}`, t.rows || []));
  NORM_ROWS = { of: suppliers, map };
  return map;
}
// The context of a catalog use (a genset row of web/catalog.js).
export function useNormCtx(u, rowsMap = NORM_ROWS.map) {
  return { title: u?.title || "", header: u?.header || u?.lines?.header || [], rows: rowsMap.get(`${u?.supplierId}|${u?.table}`) || u?.lines?.rows || (u?.line ? [u.line] : []) };
}
// What makes a normalized figure not comparable, whatever the HSMT asks; and per key, the condition the HSMT's limit is at.
const NORM_GAP = new Set(["unit", "number", "ambiguous", "kind", "value"]);
// dims / weight: open or canopied counts only when the HSMT asks one build (want.enclosure, normFig; Khoa 14/11/2026: "so").
const NORM_NEED = { fuel: ["load"], fuel75: ["load"], fuel50: ["load"], noise: ["distance"], bore: ["bore", "stroke"] };
const NORM_VI = { unit: "không ghi đơn vị", number: "số viết không rõ phẩy nghìn / thập phân", ambiguous: "ghi nhiều giá trị không rõ cái nào", kind: "ô thuộc loại khác", value: "không có số",
  load: "không ghi mức tải", distance: "không ghi khoảng cách đo", enclosure: "không ghi máy trần hay có vỏ", stroke: "không ghi hành trình", bore: "không ghi đường kính" };
// The normalized figure of one spec, compared only when it has everything `want` asks: { r, ok, why[] }.
// want: { unit: "L/h" | ["dB(A)", "dB"]..., load, distance, enclosure ("enclosed" when the HSMT asks the canopied set) }.
export function normFig(s, ctx, want = {}) {
  const r = SN.normalize({ key: s.key, label: s.label, value: s.value, ...(s.unitCell ? { unitCell: s.unitCell } : {}) }, ctx || NORM_CTX.get(s) || { title: "", header: [], rows: s.line ? [s.line] : [] });
  if (!r) return { r: null, ok: false, why: ["value"] };
  // A fuel figure whose heading names no load is the 100% figure, as the catalog files it (Khoa 14/11/2026: giữ quy ước cũ).
  const at100 = want.load === 100 && r.cond?.load == null;
  const why = r.missing.filter((m) => (NORM_GAP.has(m) || (NORM_NEED[s.key] || []).includes(m)) && !(m === "load" && at100));
  const units = want.unit == null ? null : [].concat(want.unit);
  if (units && !why.includes("unit") && !units.includes(r.unit)) why.push(`đơn vị ${r.unit}`);
  if (want.load != null && !why.includes("load") && !at100 && r.cond?.load !== want.load) why.push(`mức tải ${r.cond?.load}%`);
  if (want.distance != null && !why.includes("distance") && r.cond?.distance_m !== want.distance) why.push(r.cond?.distance_m != null ? `khoảng cách ${r.cond.distance_m} m` : "distance");
  if (want.measure && r.cond?.measure && r.cond.measure !== want.measure) why.push(`đo ${r.cond.measure}`);
  if (want.enclosure && r.cond?.enclosure && r.cond.enclosure !== want.enclosure) why.push(`bản ${r.cond.enclosure}`);
  if (want.enclosure && r.missing.includes("enclosure") && !why.includes("enclosure")) why.push("enclosure");
  return { r, ok: !why.length, why };
}
export const BLOCK = Symbol("chưa so được");
// The value of one engine constant the suppliers agree on by the majority rule (Khoa 16/11/2026: 3 suppliers or more and 3
// times as many as each other value; one supplier one vote, CAT.tally), counted on the figures as read (6 and "6L" are one
// value; catalog.js's `win` counts the text as written, so "6" / "6L" / "V 12" of QSK19-G4 split and give none). `figs`:
// [supplierId, figure | BLOCK | null]. A supplier whose figures could not be compared (BLOCK) and that gives no other is
// counted against the winner (added to the next value): the winner must still win. → { win, votes, blocked } or null.
// candidates() uses it for these keys only (Khoa 18/11/2026: "làm (d) trước. (c) để đo và làm sau"; (c) = suppliers giving
// the same figures for a model count as one vote, for the displacement).
// Displacement too (Khoa 19/11/2026, (c) "số đông dung tích"), with the suppliers that copy one template table counted as
// ONE vote (dispVoters): MTU 1600 ×6 and TAD1341GE no longer win by bdadl / fukangsi / pengpai's copied figures.
const MAJ_KEYS = new Set(["cyl", "disp"]);
// A genset's outer size that is a standard ISO container (20 / 30 / 40 ft: 2438 mm wide, 6058 / 9125 / 12192 mm long, any
// height; rounded "6060*2440*2600", "12200*2438*2896" too): two suppliers writing it is no sign of a copied table.
const DIMS_CELL = /^\d{3,5}(?:\.\d+)?\*\d{3,5}(?:\.\d+)?\*\d{3,5}(?:\.\d+)?$/;
export const isContainerDims = (k) => { const [L, W] = String(k).split("*").map(Number); return W >= 2435 && W <= 2440 && ((L >= 6038 && L <= 6060) || (L >= 9125 && L <= 9201) || (L >= 12000 && L <= 12200)); };
const dimsCells = (text) => CAT.cellsOf(String(text || "")).map((c) => String(c).toLowerCase().replace(/\s+/g, "").replace(/[×x]/g, "*").replace(/mm$/, "")).filter((k) => DIMS_CELL.test(k));
// Who votes for an engine's displacement (C6, so-dong-dung-tich 19/11/2026: Chinese suppliers copy one template table, so
// a "majority" can be one copied error). Two suppliers are ONE voter when, for this engine, a row of each gives the same
// genset size cell ("2900*1100*1600", the assembler's own figure; not a container size) AND they give the same set of
// displacement figures. A supplier that is the engine's maker (role engine_maker) or gives a maker's datasheet of it
// (`sheet`, a "Datasheet: …" table) is never merged. `read(f, ctx)` → number | BLOCK | null (as candidates reads it).
// → Map supplierId → voter id (the first supplierId of its group, sorted).
export function dispVoters(e, ef, { suppliers = new Map(), read, rowsMap } = {}) {
  const vals = new Map(), dims = new Map(), add = (m, s, v) => m.set(s, new Set([...(m.get(s) || []), v]));
  const val = (f, ctx) => { const x = read(f, ctx); return x == null ? null : x === BLOCK ? `?${String(f.value ?? "").toLowerCase().replace(/\s+/g, "")}` : String(x); };
  for (const f of ef) if (f.key === "disp") { const v = val(f, undefined); if (v != null) add(vals, f.supplierId, v); }
  for (const u of e.uses || []) {
    const ctx = useNormCtx(u, rowsMap);
    for (const f of u.specs || []) if (f.key === "disp") { const v = val(f, ctx); if (v != null) add(vals, u.supplierId, v); }
    for (const k of dimsCells(u.line || (u.lines?.rows || []).join(" | "))) if (!isContainerDims(k)) add(dims, u.supplierId, k);
  }
  const dsTables = (s) => new Set((suppliers.get(s)?.specTables || []).filter((t) => /^Datasheet: /.test(t.title || "")).map((t) => t.n));
  const solo = (s) => suppliers.get(s)?.role === "engine_maker" || ef.some((f) => f.supplierId === s && (f.sheet || dsTables(s).has(f.n)));
  const sids = [...new Set([...ef.map((f) => f.supplierId), ...(e.uses || []).map((u) => u.supplierId)])].filter((s) => s != null).sort();
  const root = new Map(sids.map((s) => [s, s])), find = (s) => { while (root.get(s) !== s) s = root.get(s); return s; };
  const key = (s) => [...(vals.get(s) || [])].sort().join("/");
  const free = sids.filter((s) => vals.has(s) && dims.has(s) && !solo(s));
  for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
    const a = free[i], b = free[j];
    if (key(a) !== key(b) || ![...dims.get(a)].some((k) => dims.get(b).has(k))) continue;
    const ra = find(a), rb = find(b);
    if (ra !== rb) root.set(ra < rb ? rb : ra, ra < rb ? ra : rb);
  }
  return new Map(sids.map((s) => [s, find(s)]));
}
// row-flags-lib.mjs dùng các hàm này (nó không import ngược config-bot: vòng import + top-level await làm node thoát 13).
rowFlagsUse({ majorityOf, BLOCK, normFig, useNormCtx });
export function majorityOf(figs) {
  const by = new Map(), blocked = new Set();
  for (const [s, x] of figs) {
    if (x === BLOCK) { blocked.add(s ?? ""); continue; }
    if (x == null || !Number.isFinite(x)) continue;
    by.set(s ?? "", [...(by.get(s ?? "") || []), x]);
  }
  const t = CAT.tally(by);
  if (t.win == null) return null;
  const extra = [...blocked].filter((s) => !by.has(s)).length, won = t.votes.get(t.win).length;
  const next = Math.max(0, ...[...t.votes].filter(([v]) => v !== t.win).map(([, ss]) => ss.length)) + extra;
  if (won < 3 * next) return null;
  return { win: t.win, votes: Object.fromEntries([...t.votes].map(([v, ss]) => [v, ss.length])), blocked: extra };
}
// Dung tích chỉ khác độ làm tròn là MỘT sự thật (Khoa 19/11/2026, so-dong-dung-tich vòng 3: DP222CB 21.927 / 21.9 là một
// phiếu, không phải hai phiếu trái nhau). Tương thích: làm tròn số nhiều chữ số thập phân hơn về số chữ số của số kia ra đúng
// số kia, và lệch ≤ 1 % (4.3 ↔ 4 hay 5.9 ↔ 6, có thể là số xi lanh đọc nhầm, không gộp). Không nhận cắt cụt (37.88 ↛ 37.8).
const decsOf = (x) => { const s = String(x), i = s.indexOf("."); return i < 0 || /e/i.test(s) ? 0 : s.length - i - 1; };
// Số so ngưỡng của nhóm thắng: số CHÍNH XÁC NHẤT (nhiều chữ số thập phân nhất; Khoa 19/11: nguồn chỉ ghi số làm tròn mà HSMT đòi
// số chính xác hơn thì loại, Y490D 2.67 ↔ ≥ 2.672; nguồn có số chính xác không đạt thì loại dù số làm tròn đạt, SC8D 8.27 / 8.3
// ↔ ≥ 8.3). Nhiều số cùng độ chính xác (D1146 8.071 / 8.074, WP41D80E200 4.087 / 4.088): số nhiều phiếu hơn; bằng phiếu thì
// số trượt trước (nhỏ hơn khi so tối thiểu, lớn hơn khi so trần), như Khoa chọn loại khi nguồn không đủ căn cứ.
export function dispExact(mj, kind) {
  const d = Math.max(...mj.group.map(decsOf)), p = mj.group.filter((x) => decsOf(x) === d);
  return p.sort((a, b) => (mj.raw[b] || 0) - (mj.raw[a] || 0) || (kind === "max" ? b - a : a - b))[0];
}
export const roundCompat = (x, y) => {
  if (x === y) return true;
  const [p, c] = decsOf(x) >= decsOf(y) ? [x, y] : [y, x], d = decsOf(c);
  if (decsOf(p) === d) return false;
  const k = 10 ** d;
  return Math.abs(Math.round(p * k + 1e-9) / k - c) < 1e-9 && Math.abs(p - c) <= Math.abs(c) * 0.01;
};
// majorityOf trên nhóm giá trị tương thích làm tròn (bắc cầu; đại diện: số nhỏ nhất của nhóm); trả thêm `group` = mọi số của
// nhóm thắng, `raw` = số người bỏ phiếu (sau gộp NCC) cho từng số của nhóm.
export function majorityRound(figs) {
  const vals = [...new Set(figs.map(([, x]) => x).filter((x) => typeof x === "number" && Number.isFinite(x)))].sort((a, b) => a - b);
  const root = new Map(vals.map((v) => [v, v])), find = (v) => (root.get(v) === v ? v : find(root.get(v)));
  for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++) if (roundCompat(vals[i], vals[j])) { const a = find(vals[i]), b = find(vals[j]); if (a !== b) root.set(Math.max(a, b), Math.min(a, b)); }
  const mj = majorityOf(figs.map(([s, x]) => [s, typeof x === "number" && root.has(x) ? find(x) : x]));
  if (!mj) return null;
  const group = vals.filter((v) => find(v) === mj.win), raw = {};
  for (const v of group) raw[v] = new Set(figs.filter(([, x]) => x === v).map(([s]) => s)).size;
  return { ...mj, group, raw };
}
const normWhyVi = (why) => [...new Set(why.map((w) => NORM_VI[w] || w))].join(", ");
export const ORIGIN = { cn: "Trung Quốc", g7: "G7 (Mỹ, Anh, Đức, Pháp, Ý, Nhật, Canada)", g20: "G20 (các nước thành viên trừ Trung Quốc)", other: "Khác (không phải Trung Quốc)", all: "Tất cả",
  // Only read from the HSMT ("G7, EU"), never chosen on the web (Khoa, 2026-11-10).
  g7eu: "G7 hoặc EU (Mỹ, Anh, Đức, Pháp, Ý, Nhật, Canada và các nước Liên minh Châu Âu)", g20eu: "G20 (trừ Trung Quốc) hoặc EU" };
const GROUP_ORIGIN = new Set(["g7", "g20", "g7eu", "g20eu"]);
const GROUP_NAME = { g7: "G7", g20: "G20", g7eu: "G7 / EU", g20eu: "G20 / EU" };
const PARTS = ["engine", "alternator", "genset", "controller"];
const originOfReq = (o) => (ORIGIN[o] ? o : "cn");
// The origin group the HSMT requires of the genset / engine (Khoa, 2026-11-04: "nếu HSMT ghi rõ xuất xứ G7/G20 thì bot
// tự chọn xuất xứ đó"; 4 of 22 runs asked G7 and every configuration of the default "cn" failed): a line naming G7 or
// G20 with "xuất xứ / nguồn gốc / sản xuất / nhập khẩu / thương hiệu", not a preference ("ưu đãi") or the bidder's own
// country. The word may be in the table cell's label two lines above ("Xuất xứ" / "Các nước thuộc: nhóm G7 hoặc EU hoặc
// Việt Nam"). Not an example of the forms ("Ví dụ về nhóm nước … G20, G8, G7"), a recommendation, a score ("(20 điểm)"),
// a condition ("Đối với hàng hóa có xuất xứ G7: nhà thầu cung cấp…"), nor a line that also allows ASEAN, Korea… or
// "tương đương": EU and Việt Nam (assembled here) may stand beside it. G20 when the line says G20. { origin, quote } or null.
// EU beside it ("Nhóm các nước khối G7," with "EU" on the next line of the cell; "nhóm G7 hoặc Liên minh Châu Âu (EU)")
// opens the group to the EU members: origin "g7eu" / "g20eu" (Khoa, 2026-11-10: "mở luôn cho EU nếu yêu cầu cho phép EU").
const EU_W = /\bEU\b|[Cc]h[âa]u [ÂâAa]u|European Union/, JOINS = /([,/;]|(^|\s)(hoặc|hay|và|or|and))$/i;
// A line that is only that word: the rest of a table cell ("EU", "hoặc Liên minh Châu Âu (EU).").
const EU_ONLY = /^\(?(và |hoặc |hay |, ?|\/ ?)?(các nước )?(thuộc )?(khối |nhóm )?(EU|(liên minh )?châu âu)( ?\(EU\))?\)?[.;,]?$/i;
const ORIGIN_W = /xu[ấa]t x[ứu]|ngu[ồo]n g[ốo]c|s[ảa]n xu[ấa]t|nh[ậa]p kh[ẩa]u|th[ưư][ơo]ng hi[ệe]u|h[ãa]ng|origin|made in/i;
const NOT_RULE = /ưu đãi|ưu tiên|khuyến (nghị|khích)|ví dụ|vi du|nhà thầu (nước ngoài|trong nước)|quốc tịch|không (yêu cầu|bắt buộc|hạn chế)|\(\s*\d+\s*điểm|tương đương|asean|asian|châu á|nga\b|russia|hàn quốc|korea|ấn độ|india|trung quốc|china|đối với[^:\n]{0,80}\bG\s?-?(7|20)\b[^:\n]{0,30}:/i;
// What the G7 / G20 line is about (Khoa, 2026-11-10, IB2600603983: "Nhà sản xuất / nhãn hiệu: Nhóm các nước khối G7, EU"
// under Động cơ, Đầu phát and Bộ điều khiển, nothing of the kind for the genset): "parts" when it names only the
// engine, alternator or controller, "genset" when it names the set / the goods, or nothing tells. The line itself, then
// the two lines above (the cell's label), then the heading of its section ("II." / "Thông số kỹ thuật … động cơ").
const WHOLE_W = /tổ máy|máy phát điện|genset|generator set|hàng h[oó]a|thiết bị/i, PART_W = /động cơ|engine|đầu phát|alternator|điều khiển|controller/i;
const HEAD_NO = /^(I{1,3}|IV|VI{0,3}|IX|X|[A-D])[.)]?(\s|$)/;
function scopeOfLine(L, i) {
  const of = (s) => (PART_W.test(s) && !WHOLE_W.test(s) ? "parts" : WHOLE_W.test(s) ? (PART_W.test(s) && PART_W.exec(s).index < WHOLE_W.exec(s).index ? "parts" : "genset") : null);
  const near = of(L[i]) || of([L[i - 2], L[i - 1], L[i]].join(" "));
  if (near) return near;
  for (let j = i - 1; j >= 0 && j >= i - 80; j--) {
    if (!HEAD_NO.test(L[j]) && !/thông số kỹ thuật/i.test(L[j])) continue;
    const head = of([L[j - 1], L[j].replace(HEAD_NO, ""), L[j + 1]].join(" ").replace(/\s+/g, " "));
    if (head) return head;
  }
  return "genset";
}
// Thương hiệu G7 or xuất xứ G7 (Khoa, 2026-11-11, "làm 1, 2"): "brand" when the line and the two above it (the cell's
// label) speak only of the make — thương hiệu, nhãn hiệu, hãng, nhà sản xuất, brand, manufacturer — and nothing of
// where it is made: xuất xứ, nước sản xuất, sản xuất tại, nhập khẩu, nguồn gốc, made in, origin, lắp ráp ("do các hãng G7
// sản xuất và lắp ráp" is the place too). Anything else, or a G7 line of each kind, is "origin" (the filter as before).
// OCR and typing slips of an HSMT count too ("Xut xir", "xuât xü", "Sán xuất tại": IB2200043247, IB2500533266).
const BASIS_ORIGIN = /xu[ấâa]?t\s*x[ứuüi]|n[ưu][ớo]c\s*(s[ảáa]n\s*xu[ấâa]?t|ch[ếe]\s*t[ạa]o)|s[ảáa]n\s*xu[ấâa]?t\s*(t[ạa]i|[ởo]\b)|nh[ậa]p\s*kh[ẩa]u|ngu[ồo]n\s*g[ốo]c|made\s*in|origin|l[ắa]p\s*r[áa]p|assembl/i;
const BASIS_BRAND = /th[ưu][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u|\bh[ãa]ng\b|nh[àa]\s*s[ảa]n\s*xu[ấa]t|\bbrand|manufacturer|\bmake\b/i;
// The nearest label wins: the line itself when it names brand or origin, else with the line above, else the two above
// ("2 Nhà sản xuất/ nhãn hiệu: Nhóm các nước khối G7, EU" is not about the row before it, "1 Nước sản xuất: Nêu cụ thể").
// Never past a row of its own: a line that starts a numbered row ("1 Động cơ EU, G7 hoặc G20") has its label on it; the
// line above is used only when it is not such a row's end, and a section heading ("B Thông số động cơ") stops it.
const ROW_START = /^(\d+(\.\d+)*[.)]?|[IVX]+[.)]?|[A-D][.)/]?)\s+\S/;
export const basisOfLine = (L, i) => {
  const has = (t) => BASIS_BRAND.test(t) || BASIS_ORIGIN.test(t);
  const ctx = [L[i] || ""];
  if (!ROW_START.test(L[i] || "")) for (let j = i - 1; j >= i - 2 && j >= 0; j--) { ctx.unshift(L[j] || ""); if (ROW_START.test(L[j] || "")) break; }
  const t = ctx.map((_, k) => ctx.slice(ctx.length - 1 - k).join(" ")).find(has) || "";
  return BASIS_BRAND.test(t) && !BASIS_ORIGIN.test(t) ? "brand" : "origin";
};
export function originOfHsmt(text) {
  let best = null, whole = false, kinds = new Set();
  const L = String(text ?? "").split("\n").map((x) => x.replace(/\s+/g, " ").trim());
  L.forEach((l, i) => {
    if (l.length > 600 || !/\bG\s?-?(7|20)\b/.test(l) || !ORIGIN_W.test([L[i - 2], L[i - 1], l].join(" "))) return;
    if (NOT_RULE.test(l) || /\basia\b/i.test(l) || /ví dụ|vi du/i.test([L[i - 2], L[i - 1]].join(" "))) return;
    // Only the controller's, the alternator's or a spare part's origin ("4 Bảng điều khiển Xuất xứ Châu Âu, G7"): the
    // origin here picks the engine, so it is not one.
    const near = [L[i - 1], l].join(" ");
    if (/b[ảa]ng điều khiển|b[ộo] điều khiển|controller|đầu phát|alternator|vật tư|phụ tùng|linh kiện/i.test(near) && !/động cơ|tổ máy|máy phát điện|engine|genset|hàng hóa|thương hiệu/i.test(near)) return;
    const group = /\bG\s?-?20\b/.test(l) ? "g20" : "g7";
    // EU on the line, or on the cell's other line: the next one when this one ends with a comma / "hoặc" or the next is
    // only that word; the one before when it ends so ("Các nước EU," / "G7").
    const next = L[i + 1] || "", prev = L[i - 1] || "";
    const euNext = next.length <= 80 && EU_W.test(next) && !NOT_RULE.test(next) && (JOINS.test(l) || EU_ONLY.test(next));
    const euPrev = prev.length <= 80 && EU_W.test(prev) && JOINS.test(prev) && !NOT_RULE.test(prev);
    const origin = EU_W.test(l) || euNext || euPrev ? `${group}eu` : group;
    const quote = [euPrev && !EU_W.test(l) ? prev : "", l, euNext && !EU_W.test(l) ? next : ""].filter(Boolean).join(" ").slice(0, 300);
    const wide = (o) => (o.startsWith("g20") ? 2 : 0) + (o.endsWith("eu") ? 1 : 0);
    if (scopeOfLine(L, i) === "genset") whole = true;
    if (!best || wide(origin) > wide(best.origin)) best = { origin, quote };
  });
  if (!best) return null;
  // The basis is of EVERY G7 / G20 line of the HSMT that is a rule (not an example, a preference…), not only the one
  // chosen: "3 Xuất xứ Hãng sản xuất thuộc các nước G7" beside a "G7 hoặc Việt Nam" line (IB2400503492), an engine of a
  // G7 make with the controller's "Xuất xứ G7" (IB2400027592). A line that says neither ("1 Động cơ EU, G7 hoặc G20") is
  // "origin". Brand only when every such line is brand, and the G7 / G20 asked is of the genset (scope "genset").
  // A wider origin rule still counts ("Xuất xứ Nhập khẩu đồng bộ từ các nước G7/EU/Asean", IB2400349459: a set made in
  // China fails it): only an example, a preference or a score is left out here.
  const NOT_BASIS = /ví dụ|vi du|ưu đãi|ưu tiên|khuyến (nghị|khích)|\(\s*\d+\s*điểm/i;
  L.forEach((l, i) => {
    // An example on the line or in its own cell (the line above, unless this line starts a row of its own).
    if (l.length > 600 || !/\bG\s?-?(7|20)\b/.test(l) || NOT_BASIS.test(l) || (!ROW_START.test(l) && NOT_BASIS.test(L[i - 1] || ""))) return;
    kinds.add(basisOfLine(L, i));
  });
  return { ...best, scope: whole ? "genset" : "parts", basis: whole && kinds.size === 1 && kinds.has("brand") ? "brand" : "origin" };
}
// Thương hiệu or nơi sản xuất of EACH part (Khoa, 2026-11-16/17: "nên phân biệt rõ thương hiệu và nơi sản xuất", for the
// engine, the alternator and the controller): over the G7 / G20 lines that are a rule (as the basis pass of
// originOfHsmt: not an example, a preference, a score), the clause of the line that names the group decides:
// "Xuất xứ nhà thầu đề xuất; thương hiệu thuộc các nước G7 hoặc EU" is the brand, "Hãng sản xuất thuộc các nước G7;
// xuất xứ thuộc các nước G7 hoặc G20" the place too; a clause that says neither ("Xuất xứ: EU – G7") goes by its label
// (basisOfLine). "Thương hiệu xuất xứ G7", "xuất xứ hãng sản xuất" are the brand's country. A clause on a standard or a
// technology ("tiêu chuẩn G7", "công nghệ của các nước G7") or a reference ("tham khảo") is no rule of either.
// The part is the one the label names (the line up to the clause: "Động cơ - Thương hiệu", "Thương hiệu động cơ, đầu
// phát"); a line of another item (ATS, tủ, bơm, van, ống, vỏ) is left out; a line naming no part is of every part.
// { engine, alternator, controller }: each { basis: "brand" | "origin", quote } or null (no G7 / G20 line for it).
const PART_OF = [["engine", /động cơ|engine/i], ["alternator", /đầu phát|củ phát|alternator/i], ["controller", /(bộ|bảng|hệ thống|màn hình) điều khiển|controller|control (panel|module)/i]];
const OTHER_ITEM = /\bATS\b|tủ (chuyển|điện|hòa|điều khiển bơm)|bơm|van\b|ống|vỏ|giá đỡ|phụ tùng|vật tư|linh kiện|cáp\b/i;
const BRAND_PLACE = /th[ưu][ơo]ng\s*hi[ệe]u\s*(c[óo]\s*)?xu[ấa]t\s*x[ứu]|xu[ấa]t\s*x[ứu]\s*(c[ủu]a\s*)?(h[ãa]ng|th[ưu][ơo]ng\s*hi[ệe]u|nh[àa]\s*s[ảa]n\s*xu[ấa]t)/gi;
const NOT_PART_RULE = /ti[êe]u\s*chu[ẩa]n|c[ôo]ng\s*ngh[ệe]|tham\s*kh[ảa]o/i;
const placeOrBrand = (t) => { const c = String(t || "").replace(BRAND_PLACE, "thương hiệu"); return BASIS_ORIGIN.test(c) ? "origin" : BASIS_BRAND.test(c) ? "brand" : null; };
export function partOriginOfHsmt(text) {
  const out = { engine: null, alternator: null, controller: null };
  const NOT_BASIS = /ví dụ|vi du|ưu đãi|ưu tiên|khuyến (nghị|khích)|\(\s*\d+\s*điểm/i;
  const L = String(text ?? "").split("\n").map((x) => x.replace(/\s+/g, " ").trim());
  const G = /\bG\s?-?(7|20)\b/, says = placeOrBrand;
  L.forEach((l, i) => {
    if (l.length > 600 || !G.test(l) || (!ROW_START.test(l) && NOT_BASIS.test(L[i - 1] || ""))) return;
    if (!ORIGIN_W.test([L[i - 2], L[i - 1], l].join(" "))) return;
    // The clauses ("; " or ". " apart) that name the group.
    const parts = l.split(/;\s*|\.\s+(?=[A-ZÀ-Ỹ])/), lineBasis = basisOfLine(L, i);
    let at = 0;
    for (const cl of parts) {
      const start = l.indexOf(cl, at); at = start + cl.length;
      if (!G.test(cl) || NOT_PART_RULE.test(cl) || NOT_BASIS.test(cl)) continue;
      // The value: the clause after its last ":" before the group; the label: the line up to there ("Máy 18KVA: Động
      // cơ - Thương hiệu"), its last segment the nearest label ("Xuất xứ hãng sản xuất").
      const g = start + cl.search(G), cut = l.lastIndexOf(":", g), label = cut >= 0 ? l.slice(0, cut) : "";
      const value = l.slice(Math.max(cut + 1, start), start + cl.length), near = label.slice(label.lastIndexOf(":") + 1);
      if (OTHER_ITEM.test(label) && !PART_OF.some(([, re]) => re.test(label))) continue;
      // A line naming no part is of the genset (originOfHsmt's scope), not of each part.
      const named = PART_OF.filter(([, re]) => re.test(label) || re.test(l.slice(Math.max(cut + 1, start), g))).map(([p]) => p);
      if (!named.length) continue;
      const basis = says(value) || says(near) || lineBasis;
      for (const p of named) if (!out[p] || (basis === "origin" && out[p].basis !== "origin")) out[p] = { basis, quote: l.slice(0, 300) };
    }
  });
  return out;
}
const extraOf = (req) => String(req?.extra || "").trim().slice(0, 2000);
// The requirements read last time are used again only when the HSMT, Yêu cầu khác and the way they are read are the
// same: REQ_VERSION goes up when config-prompt.md changes how requirements are written (e.g. the grouped controller
// functions of 2026-11-03), so older lists are read again once.
export const REQ_VERSION = 5; // 4: requirement codes (reqcodes.mjs, Khoa 2026-11-06); 5: alt_excitation, alt_short_circuit (2026-11-10)
export const reqHashOf = (text, extra) => createHash("sha1").update(`${text}\n--extra--\n${extra || ""}${REQ_VERSION > 1 ? `\n--v${REQ_VERSION}--` : ""}`).digest("hex").slice(0, 16);

export async function api(q) {
  const r = await fetch(`${WEB}/api/requests?${q}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!r.ok) throw new Error(`${q}: HTTP ${r.status}`);
  return r.json();
}
export const doc = async (coll, id) => (await api(`kind=docs&coll=${coll}&id=${encodeURIComponent(id)}`))[0]?.data;
// Every document of a collection, [{ id, data }] as api("kind=docs&coll=<c>") gives them. The large ones the bots read
// again and again (supplier and bidhist, ~10 MB each) are kept on this PC; each call lists (id, updated_at) and reads
// only the new or changed documents (Supabase egress, 2026-11-06). Any problem: the whole collection, as before.
const DOC_CACHE = process.env.GENBID_DOC_CACHE || path.join(path.dirname(TOKEN_FILE), "genbid-work", "doc-cache");
export async function allDocs(coll) {
  const whole = () => api(`kind=docs&coll=${coll}`);
  const file = path.join(DOC_CACHE, `${coll}.json`);
  let stamps;
  try { stamps = await api(`kind=stamps&coll=${coll}`); } catch { return whole(); }
  // An older /api/requests answers an unknown kind with the file requests: no updated_at there.
  if (!Array.isArray(stamps) || !stamps.length || !stamps.every((s) => s && typeof s.id === "string" && s.updated_at)) return whole();
  let saved = {};
  try { saved = JSON.parse(fs.readFileSync(file, "utf8")).docs || {}; } catch {}
  const want = stamps.filter((s) => saved[s.id]?.u !== s.updated_at).map((s) => s.id);
  const fresh = new Map();
  try {
    // Mostly new (the first run): one whole read instead of many small ones.
    if (want.length > 300) for (const d of await whole()) fresh.set(d.id, d.data);
    else for (let i = 0; i < want.length; i += 100) {
      for (const d of await api(`kind=docs&coll=${coll}&ids=${want.slice(i, i + 100).map(encodeURIComponent).join(",")}`)) fresh.set(d.id, d.data);
    }
  } catch { return whole(); }
  // A document listed but not read back (removed meanwhile, or an id the list cannot carry): the whole collection.
  if (want.some((id) => !fresh.has(id))) return whole();
  const out = [], next = {};
  for (const s of stamps) {
    const data = fresh.has(s.id) ? fresh.get(s.id) : saved[s.id].d;
    out.push({ id: s.id, data });
    next[s.id] = { u: s.updated_at, d: data };
  }
  // Written whole and renamed, so a run reading it at the same time never sees half a file.
  if (want.length || stamps.length !== Object.keys(saved).length) {
    try {
      fs.mkdirSync(DOC_CACHE, { recursive: true });
      const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify({ docs: next }));
      fs.renameSync(tmp, file);
    } catch {}
  }
  return out;
}
// A network error (fetch failed) is retried: one lost post used to throw away a whole agent run (2026-10-29).
export async function post(rows) {
  let r;
  for (let i = 0; ; i++) {
    try { r = await fetch(`${WEB}/api/ingest`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ rows }) }); break; }
    catch (e) { if (i >= 3) throw e; await new Promise((ok) => setTimeout(ok, 2000 * 2 ** i)); }
  }
  const body = await r.text();
  if (!r.ok) throw new Error(`ingest HTTP ${r.status}: ${body.slice(0, 200)}`);
  return body;
}
// Engines of the origin asked for: "cn" keeps engines a source shows to be of a Chinese make (one whose make no
// source gives is left out, Khoa 2026-10-29) and, since 2026-11-02 (Khoa), an engine of a foreign make that a supplier
// based in China offers in its own table (cnSupplier: id → true for a supplier whose country is CN);
// "other" only engines a source or the model code shows to be foreign.
export const cnSuppliers = (suppliers) => new Set(suppliers.filter((s) => s?.country === "CN").map((s) => s.id));
// Xuất xứ G7 / G20: the suppliers too (Khoa, 2026-11-10, IB2600603983: the HSMT wanted the engine, alternator and
// controller of a G7 / EU maker, and every supplier suggested was an assembler in China offering a Cummins or Perkins
// engine; the engine's make was all the origin looked at). The ids of the suppliers based in a country of the group;
// null for an origin that is no group. A supplier whose country is not recorded is not one of them.
// No G7 / G20 asked ("all"; Khoa, 2026-11-10): the suppliers suggested are the ones based in China that offer a
// fitting engine, alternator and controller, whatever the make of those parts. `open` lifts that: the HSMT asks for
// parts of the genset maker's own brand (brandSyncOf), which an assembler in China seldom meets.
// `partsOnly` (originOfHsmt scope "parts"; Khoa, 2026-11-10): the HSMT wants only the engine / alternator / controller
// of a G7 / G20 make, not the whole set from there, so the suppliers are again the ones based in China, offering parts
// of those makes (byOrigin still keeps only the engines of the group's makes).
// `brand` (originOfHsmt basis "brand", Khoa 2026-11-11): the HSMT asks for a G7 / G20 BRAND of the genset, not where it
// is made, so a genset maker of a brand of the group is kept wherever its plant is (brandMakers).
export const groupSuppliers = (suppliers, origin, open = false, partsOnly = false, brand = false) => (GROUP_ORIGIN.has(origin) && !partsOnly ? new Set([...(suppliers || []).filter((s) => CAT.COUNTRY_GROUP[origin].includes(s?.country)).map((s) => s.id), ...(brand ? brandMakers(suppliers, origin) : [])])
  : (origin === "all" || GROUP_ORIGIN.has(origin)) && !open ? cnSuppliers(suppliers || []) : null);
// The genset makers outside the group that are of a brand of the group: a genset_oem whose name or brands give a family
// (web/bidprice.js familyOf) of a make whose country is in the group (catalog.js ENGINE_COUNTRY), AND that its record
// links (relatedIds, written with sources by discover) to a supplier of that same family based in the group — the
// brand's own plant (cat-tianjin → caterpillar / fg-wilson: "Công ty con 100% của Caterpillar"). A Chinese company
// carrying a foreign make in its name with no such link is an assembler (as in Đồng bộ thương hiệu) and stays out.
export function brandMakers(suppliers, origin) {
  const list = suppliers || [], by = new Map(list.map((s) => [s?.id, s])), inGroup = (s) => CAT.COUNTRY_GROUP[origin]?.includes(s?.country);
  const famOf = (s) => supplierFamily(s, true);
  return list.filter((s) => {
    if (!s || s.role !== "genset_oem" || inGroup(s)) return false;
    const f = famOf(s);
    if (!f || CAT.NO_GROUP.has(f) || !CAT.COUNTRY_GROUP[origin]?.includes(CAT.ENGINE_COUNTRY[f])) return false;
    return (s.relatedIds || []).some((id) => { const r = by.get(id); return r && inGroup(r) && famOf(r) === f; });
  }).map((s) => s.id);
}
export const partsOnlyOf = (origin, hsmtText) => GROUP_ORIGIN.has(origin) && originOfHsmt(hsmtText)?.scope === "parts";
const groupName = (origin) => GROUP_NAME[origin] || "Trung Quốc";
const COUNTRY_VI = { CN: "Trung Quốc", TR: "Thổ Nhĩ Kỳ", IN: "Ấn Độ", KR: "Hàn Quốc", ES: "Tây Ban Nha", SE: "Thụy Điển", AE: "UAE", SG: "Singapore", VN: "Việt Nam" };
const countryVi = (c) => (c ? COUNTRY_VI[c] || c : "chưa ghi nước");
// The country of a place of manufacture (catalog.js madeIn), in Vietnamese.
const MADE_VI = { US: "Mỹ", GB: "Anh", JP: "Nhật", DE: "Đức", FR: "Pháp", IT: "Ý", CA: "Canada", PL: "Ba Lan", DK: "Đan Mạch", CZ: "Séc", RO: "Romania" };
const madeVi = (c) => MADE_VI[c] || countryVi(c);
// `grp` (groupSuppliers): under G7 / G20 only the rows of those suppliers stay, and an engine none of them offers goes.
export function byOrigin(engines, origin, cn = new Set(), grp = null) {
  if (origin === "cn") return engines.filter((e) => CAT.originOf(e) === "cn" || (CAT.originOf(e) === "other" && (e.uses || []).some((u) => cn.has(u.supplierId))));
  if (origin === "other") return engines.filter((e) => CAT.originOf(e) === "other");
  // G7 / G20 (Khoa, 2026-11-02): engines whose make is from a country of the group (web/catalog.js ENGINE_COUNTRY).
  if (GROUP_ORIGIN.has(origin)) {
    const own = engines.filter((e) => CAT.groupOf(e, origin));
    return grp ? own.map((e) => ({ ...e, uses: (e.uses || []).filter((u) => grp.has(u.supplierId)) })).filter((e) => e.uses.length) : own;
  }
  // "all": every make, in the rows of the suppliers based in China.
  if (grp) return engines.map((e) => ({ ...e, uses: (e.uses || []).filter((u) => grp.has(u.supplierId)) })).filter((e) => e.uses.length);
  return engines;
}

// ---------- prep ----------
// "250 ekW" (electrical kW, Caterpillar's way) is kW too.
const CAP = /(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(kva|e?kw|mva|mw)\b/i;
// "1.600" is 1600 and "8,5" is 8.5, as Vietnamese writes them.
const numOf = (s) => Number(/^\d{1,3}([.,]\d{3})+$/.test(s) ? s.replace(/[.,]/g, "") : s.replace(",", "."));
// A tolerance ("12 ± 0,5 kVA", "+/- 5 %") is not the capacity: 3 of 4 small-genset tenders read 0.5 kVA and got no candidate.
const noTolerance = (t) => String(t || "").replace(/(?:±|\+\s*\/\s*-)\s*\d+(?:[.,]\d+)?/g, "");
// "≥ 12 ± 0,5 kVA" asks at least 11.5 kVA: the lowest value the tolerance allows. A tolerance of a fifth or more of the
// value ("8,5 ±5KVA", a percent written without %) is left out.
// The tolerance may stand after the unit ("≥ 8.5 KVA ± 0.5") and be a percent ("≥ 100 kVA ± 5%"): Khoa 21/11/2026, a tolerance the HSMT writes
// right after the figure counts in the limit.
const lowOf = (a, b, pct) => (pct ? Math.round(numOf(a) * (1 - numOf(b) / 100) * 1000) / 1000 : numOf(b) < numOf(a) * 0.2 ? Math.round((numOf(a) - numOf(b)) * 100) / 100 : numOf(a));
const TOL_AFTER = /(\d+(?:[.,]\d+)?)(\s*(?:kVA|kW)\b)?\s*(?:±|\+\s*\/\s*-)\s*(\d+(?:[.,]\d+)?)(\s*%)?/gi;
// `lowest` handles only the tolerance right after the number, not a percent; the rest is applied to the prime already chosen (primeTol), so
// that a lowered figure does not change which statements agree (12.5 ± 0.5 of the genset, 15 of its alternator).
const lowest = (t) => String(t || "").replace(/(\d+(?:[.,]\d+)?)\s*(?:±|\+\s*\/\s*-)\s*(\d+(?:[.,]\d+)?)(?![\d.,]*\s*%)/g, (_, a, b) => String(lowOf(a, b, false)));
const primeTol = (p, text) => {
  if (!p) return p;
  const unit = p.kVA != null ? "kVA" : "kW";
  for (const x of String(text).matchAll(TOL_AFTER)) {
    if (!x[2] || x[2].trim().toLowerCase() !== unit.toLowerCase() || Math.abs(numOf(x[1]) - p[unit]) > 1e-9) continue;
    // The text doubts its own "±" ("20 kVA ± 1% (văn bản ghi "+ 1%")", IB2300296794): not lowered.
    if (/^\s*\([^)\n;]{0,30}["“']\s*\+\s*\d/.test(String(text).slice(x.index + x[0].length, x.index + x[0].length + 45))) return p;
    const before = text.slice(Math.max(0, x.index - 80), x.index), clause = before.slice(Math.max(before.lastIndexOf("\n"), before.lastIndexOf(";")) + 1);
    if (/li[êe]n\s*t[ụu]c|c[ơo]\s*b[ảa]n|prime|continuous/i.test(clause) && !/đầu\s*phát|d[ựu]\s*ph[òo]ng|standby/i.test(clause)) { const out = { ...p, [unit]: lowOf(x[1], x[3], !!x[4]) }; return out; }
  }
  return p;
};
// A tolerance written right after a displacement ("≤ 1,3 lít ± 5%", "(± 0,1)"): the limit moves by it (`sign` +1 for a most, -1 for a least).
const tolAt = (cell, end) => { const t = cell.slice(end, end + 24).match(/^\s*\(?\s*(?:±|\+\s*\/\s*-|\+-)\s*(\d{1,2}(?:[.,]\d+)?)\s*(%)?/); return t ? { n: Number(t[1].replace(",", ".")), pct: !!t[2] } : null; };
const withTol = (v, t, sign) => (!t ? v : Math.round((t.pct ? v * (1 + (sign * t.n) / 100) : t.n < v * 0.2 ? v + sign * t.n : v) * 1000) / 1000);
// The genset's figure, not a transformer's or a UPS's in the same text (web/bidprice.js capPick, 2026-11-04 regression);
// a text whose every figure is another device's gives none.
export function capacity(texts) {
  for (const t of texts) {
    const s = noTolerance(t), m = BP.capPick(s, [...s.matchAll(new RegExp(CAP.source, "gi"))]);
    if (!m) continue;
    const u = m[2].toLowerCase().replace(/^e/, "");
    return { value: numOf(m[1]) * (u.startsWith("m") ? 1000 : 1), unit: u.endsWith("va") ? "kVA" : "kW" };
  }
  return null;
}
// ---------- Gói nhiều cỡ máy (Khoa, 2026-11-04) ----------
// A tender of gensets of several sizes ("2 x 250 kVA và 1 x 500 kVA") gets Gợi ý cấu hình and Gợi ý giá đấu for each
// size. The sizes come from the analysis' generatorCapacity (its prompt writes "2 x 250 kVA"), else the tender's name.
// Each clause (split at ; , ( + and "và") gives its first figure; a clause naming a transformer, UPS or stabilizer gives
// none, and a clause of figures only goes with the one before it. Standby figures count only when no prime or unlabelled
// one is given, maximum ones only when nothing else is ("Prime ≥ 650kVA; Standby ≥ 700kVA" and "2000 kVA dự phòng (công
// suất tối đa 2250 kVA)" are one set). Figures within 12% of each other are one size (163 kVA and an unlabelled 180;
// 400 and 450 kVA are two; 250 kVA and 200 kW are one), and so is a kW figure within 15% of a kVA one ("12 kW / 12 kVA",
// a single-phase set). Quantity: "2 x 250 kVA", "02 máy 250 kVA", "(01 máy)", else null. Checked against the 1,556
// tenders of bidhist (2026-11-04): about 250 of several sizes, most of them read as the analysis wrote them.
const SIZE_SPLIT = /[;(\n]|,(?!\d)|\s(?:và|and|\+)\s/i, SIZE_FIG = /(\d{1,3}(?:\.\d{3})+(?!\d)|\d+(?:[.,]\d+)?)\s*(kVA|kW|MVA|MW)\b/i;
const SIZE_OTHER = /bi[ếe]n [áa]p|\bTBA\b|\bMBA\b|\bUPS\b|[ổo]n [áa]p|t[ụu] b[ùu]/i;
const SIZE_STANDBY = /d[ựu] ph[òo]ng|standby|stanby|emergency|\bESP\b/i, SIZE_MAX = /t[ốo]i [đd]a|c[ựu]c [đd][ạa]i|\bmax/i;
const SIZE_PRIME = /li[êe]n t[ụu]c|prime|\bPRP\b|continuous|c[ơo] b[ảa]n|định mức/i;
const SIZE_QTY_X = /(?:^|[^\d.,])(\d{1,3})\s*(?:x|×|\*)\s*$/i, SIZE_QTY_N = /(?:^|[^\d.,])(\d{1,3})\s*(?:máy|tổ máy|bộ|chiếc|cái|tổ)\b(?![\s\S]*\d\s*(?:máy|tổ máy|bộ|chiếc|cái|tổ)\b)/i;
// An engine's shaft power ("động cơ diesel 91 kW", "24hp, công suất >=15.2kw") and what the analysis says another text
// wrote ("tên gói ghi 2000 kVA", "mục giới thiệu ghi 12KVA") are not a size.
const SIZE_ENGINE = /đ[ộo]ng c[ơo]|engine|\bhp\b|tr[ụu]c khu[ỷy]u/i, SIZE_ELSEWHERE = /tên gói|tiêu đề|giới thiệu/i;
export const MAX_SIZES = 4;
export function sizesOf(texts, name = "") {
  for (const raw of texts) {
    const t = noTolerance(String(raw || "").normalize("NFC")).replace(/m[áa]y ph[áa]t(?: đi[ệe]n)?(?: di[eê]s[eê]l)? d[ựu] ph[òo]ng|ngu[ồo]n(?: đi[ệe]n)? d[ựu] ph[òo]ng/gi, "máy phát")
      // "≥275/220 kVA/kW" and "10.0/11 kW (liên tục/tối đa)": the first figure with its own unit.
      .replace(/(\d[\d.,]*)\s*\/\s*(\d[\d.,]*)\s*(kVA|kW)\s*\/\s*(kVA|kW)\b/gi, "$1 $3 / $2 $4").replace(/(\d[\d.,]*)\s*\/\s*(\d[\d.,]*)\s*(kVA|kW)\b(?!\s*\/)/gi, "$1 $3 / $2 $3");
    const figs = [];
    let other = false, rank = 0, closed = true;
    for (const clause of t.split(SIZE_SPLIT)) {
      // A clause of figures only ("Dự phòng: 550 kVA; 450 kVA") goes with the one before it, unless that one closed a
      // bracket or this one starts a new item ("…dự phòng ≥ 693KVA) + 1 x 800 kVA", "; 41 x 100 kVA").
      const m = clause.match(SIZE_FIG), words = /[a-zà-ỹ]{2}/i.test(clause.replace(new RegExp(SIZE_FIG.source, "gi"), ""));
      if (words || closed || /^\W*\d{1,3}\s*[x×]/i.test(clause)) { other = SIZE_OTHER.test(clause); rank = SIZE_PRIME.test(clause) ? 0 : SIZE_STANDBY.test(clause) ? 1 : SIZE_MAX.test(clause) ? 2 : 0; }
      closed = /\)\s*$/.test(clause);
      if (!m || other || (m[2].toLowerCase() === "kw" && SIZE_ENGINE.test(clause)) || SIZE_ELSEWHERE.test(clause)) continue;
      const u = m[2].toLowerCase(), v = numOf(m[1]), kva = u === "kw" ? v / 0.8 : u === "mva" ? v * 1000 : u === "mw" ? v * 1250 : v;
      if (!(kva >= 1)) continue;
      // "Tổng 97 máy: 27 x 15 kVA": 27, not the total.
      const before = clause.slice(0, m.index), q = before.match(SIZE_QTY_X) || before.match(SIZE_QTY_N) || clause.slice(m.index + m[0].length).match(/^\D{0,6}(\d{1,3})\s*(?:máy|tổ máy|bộ|chiếc|cái)\b/i);
      const qty = q && !/tổng\W*$/i.test(before.slice(0, q.index + q[0].indexOf(q[1]))) ? Number(q[1]) : null;
      figs.push({ kva, v, cap: { value: v, unit: u === "kva" ? "kVA" : u === "kw" ? "kW" : u === "mva" ? "MVA" : "MW" }, qty, rank, quote: clause.trim() });
    }
    const best = Math.min(...figs.map((f) => f.rank));
    let use = figs.filter((f) => f.rank === best);
    use = use.filter((f) => f.cap.unit !== "kW" || !use.some((g) => g.cap.unit === "kVA" && Math.abs(g.v - f.v) <= g.v * 0.15));
    if (!use.length) continue;
    const groups = [];
    for (const f of [...use].sort((a, b) => a.kva - b.kva)) {
      const g = groups.at(-1);
      if (g && f.kva <= g[0].kva * 1.12) g.push(f); else groups.push([f]);
    }
    // A size in kVA as written (the catalog's unit); MVA / MW as kVA / kW.
    let sizes = groups.map((g) => {
      const f = g.find((x) => x.cap.unit === "kVA" || x.cap.unit === "MVA") || g[0], big = f.cap.unit.startsWith("M");
      const cap = big ? { value: f.cap.value * 1000, unit: f.cap.unit === "MVA" ? "kVA" : "kW" } : f.cap;
      return { cap, kva: Math.round(g[0].kva * 100) / 100, qty: Math.max(0, ...g.map((x) => x.qty || 0)) || null, label: `${cfgNumOf(cap.value)} ${cap.unit}`, quote: g[0].quote.slice(0, 200) };
    });
    // Another rating of the same set: "4 x 4000 kVA ... liên tục ≥ 3250kVA" (a size with no quantity up to 30% below one
    // with a quantity), "Mua sắm 01 Máy phát điện 400KVA" read as 320 and 400 kVA (two sizes within 30%, neither with a
    // quantity, one the single power the name gives).
    const near = (a, b) => Math.max(a.kva, b.kva) <= Math.min(a.kva, b.kva) * 1.3;
    if (sizes.some((s) => s.qty)) sizes = sizes.filter((s) => s.qty || !sizes.some((o) => o.qty && o.kva > s.kva && near(o, s)));
    const nameK = (String(name || "").match(/\d[\d.,]*\s*(?:kva|kw)\b/gi) || []).length === 1 ? BP.kvaOf(name) : null, named = nameK && sizes.find((s) => !s.qty && Math.abs(s.kva - nameK) <= nameK * 0.05);
    if (named) sizes = sizes.filter((s) => s === named || s.qty || !near(s, named));
    return sizes;
  }
  return [];
}
const cfgNumOf = (v) => Number(v).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
export const sizeText = (s) => `${s.qty ? `${s.qty} x ` : ""}${s.label}`;
const sameSize = (a, b) => a?.cap && b?.cap && a.cap.unit === b.cap.unit && Math.abs(a.cap.value - b.cap.value) < 1e-6;
// The sizes of a tender: from its analysis, else its name.
// read: doc (tests pass a fake).
export async function sizesFor(key, bidName, read = doc) {
  const a = (await read("analysis", key).catch(() => null))?.result;
  const name = bidName || a?.keyInfo?.bidName || "";
  return sizesOf([a?.keyInfo?.generatorCapacity, name], name);
}
// The technical part of the HSMT. 2026-11-04 regression over the 33 whole HSMT on the web: 10 had no "Chương V. Yêu
// cầu" (the technical chapter is III in older E-HSMT, "Chương IV. Yêu cầu về phạm vi cung cấp" in an HSYC, OCR writes
// "YÊU CÂU VE KỸ THUẬT"), and the first match was often the table of contents. Now: every chapter or part heading
// whose title is technical, read without diacritics (one letter for one, so places stay), each up to the next heading
// of its kind; the longest wins (a contents line is a few characters). With no such chapter, the 250,000 characters
// around the most genset figures (an HSMT of 777,000 characters with no chapters had them past the first 250,000).
const MAX_TP = 250000;
const foldSame = (s) => s.replace(/[^\x00-\x7f]/g, (c) => (c === "đ" ? "d" : c === "Đ" ? "D" : c.normalize("NFD")[0]));
// A heading has a mark after its number ("Chương III. ", "PHẦN 2 - ") or nothing: "Chương IV, Chủ đầu tư…" and "Chương V
// cho nhà thầu…" are sentences. Its title may run on in a flattened line.
// A file's own marker ("--- Chương V. Yêu cầu kỹ thuật\Bản vẽ\BV-01.pdf ---", Publish-GenBidHsmt.ps1) is not one.
const HEADING = /^(?!\s*---)[ \t>*-]*(ch(?:uo|u)ng|phan)[ \t]+([ivx]+|\d+)\b[ \t]*(?:[.:\-–—][ \t]*(.{0,120})|$)/gim;
const TECH_TITLE = /yeu\s*ca?u\s*(ve\s*)?(ky\s*thuat|pham\s*vi|ke\s*hoach)|pham\s*vi\s*cung\s*cap|thong\s*so\s*ky\s*thuat|chi\s*dan\s*ky\s*thuat|dac\s*tinh\s*ky\s*thuat|tieu\s*chuan\s*ky\s*thuat|dieu\s*khoan\s*tham\s*chieu/i;
const SPEC_HIT = /kva|xi\s?lanh|xy\s?lanh|dau\s*phat|cong\s*suat\s*(lien\s*tuc|du\s*phong)|prime|standby/gi;
// The `max` (MAX_TP) characters of text[from, to) with the most SPEC_HIT figures (f: foldSame(text)), whole lines only.
function densest(text, f, from, to, max = MAX_TP) {
  const hits = [...f.slice(from, to).matchAll(SPEC_HIT)].map((m) => from + m.index);
  let start = from, most = -1;
  for (let i = 0, j = 0; i < hits.length; i++) {
    while (hits[i] - hits[j] > max * 0.9) j++;
    if (i - j + 1 > most) { most = i - j + 1; start = hits[j]; }
  }
  // A little before the first figure (its heading), not past the chapter's end, then back to a line start.
  start = Math.max(from, Math.min(start - max * 0.05, to - max));
  // Forward to the next line start, so the window still reaches the chapter's end when it was placed there.
  if (start > from) { const nl = text.indexOf("\n", start - 1); start = nl < 0 || nl + 1 >= to ? from : nl + 1; }
  const win = (s) => { let e = Math.min(to, s + max); if (e < to) { const nl = text.lastIndexOf("\n", e - 1); if (nl > s) e = nl + 1; } return [s, e]; };
  const count = ([s, e]) => hits.filter((h) => h >= s && h < e).length;
  // Never fewer figures than the chapter's first `max` characters (what was kept before).
  const a = win(start), b = win(from), [s, e] = count(a) > count(b) ? a : b;
  return text.slice(s, e);
}
// A text cut to at most `max` characters for an agent (cut guard, điều phối 2026-11-12): the window with the most
// technical figures (densest), whole lines, never fewer figures than its first `max` characters. Returns the window,
// the lines left out (1-based ranges of `text`), the figures in them and a line for the agent; a text that fits comes
// back whole with no note.
export function fitPart(text, max) {
  text = String(text ?? "");
  if (text.length <= max) return { text, dropped: [], hits: 0, lines: lineNo(text, text.length), note: "" };
  const f = foldSame(text), kept = densest(text, f, 0, text.length, max), at = text.indexOf(kept);
  const end = (s) => (s.endsWith("\n") ? 1 : 0);
  const all = lineNo(text, text.length - end(text)), a = lineNo(text, at), b = lineNo(text, at + kept.length - end(kept));
  const dropped = [...(a > 1 ? [[1, a - 1]] : []), ...(b < all ? [[b + 1, all]] : [])];
  const hits = (f.slice(0, at).match(SPEC_HIT) || []).length + (f.slice(at + kept.length).match(SPEC_HIT) || []).length;
  return { text: kept, dropped, hits, lines: all,
    note: `(đã lược: dòng ${dropped.map(([x, y]) => (x === y ? `${x}` : `${x}–${y}`)).join(", ")} / ${all} của phần này — giữ ${kept.length.toLocaleString("vi-VN")} ký tự liền nhau có nhiều thông số nhất; phần lược có ${hits} chỗ thông số)` };
}
// The line (1-based) of character `pos` of `text`.
const lineNo = (text, pos) => { let n = 1; for (let i = text.indexOf("\n"); i >= 0 && i < pos; i = text.indexOf("\n", i + 1)) n++; return n; };
// Whether the last technicalPart kept only a window of a longer text (hsmtGaps reads it right after the call).
export let tpCut = false;
export function technicalPart(text) {
  text = String(text ?? "").normalize("NFC");
  tpCut = false;
  const f = foldSame(text), heads = [...f.matchAll(HEADING)].map((m) => {
    // "Chương IV." alone is a wrapped sentence ("…theo mẫu tại" / "Chương IV.") unless the next line is a title in capitals.
    const after = f.slice(m.index + m[0].length).match(/^\s*\n\s*([^\n]{3,80})/)?.[1] || "", caps = after.replace(/[^a-z]/gi, "");
    const titled = /[a-z]{3}/i.test(m[3] || "") || (caps.length >= 3 && caps === caps.toUpperCase());
    return { at: m.index, kind: m[1].toLowerCase().startsWith("p") ? "p" : "c", n: m[2].toLowerCase(), title: m[3] || "", titled };
  });
  let best = null;
  heads.forEach((h, i) => {
    if (!TECH_TITLE.test(h.title)) return;
    // Up to the next heading of the same kind with another number ("Chương III" ... "Chương IV").
    const next = heads.slice(i + 1).find((x) => x.kind === h.kind && x.n !== h.n && x.titled);
    const end = next ? next.at : text.length, len = end - h.at;
    if (!best || len > best.len) best = { at: h.at, end, len };
  });
  // A technical chapter longer than MAX_TP (IB2600341462, 871,549 characters: its first 250,000 held 3 figures, the
  // rest 108): the window of the chapter with the most figures, from a line start to a line end (điều phối 2026-11-12).
  if (best && best.len > MAX_TP) { tpCut = true; return densest(text, f, best.at, best.end); }
  if (best && best.len >= 1500) return text.slice(best.at, best.end);
  if (text.length <= MAX_TP) return text;
  const hits = [...f.matchAll(SPEC_HIT)].map((m) => m.index);
  tpCut = true;
  if (!hits.length) return text.slice(0, MAX_TP);
  let from = 0, most = 0;
  for (let i = 0, j = 0; i < hits.length; i++) { while (hits[j] < hits[i] - MAX_TP * 0.9) j++; if (i - j + 1 > most) { most = i - j + 1; from = hits[j]; } }
  const start = Math.max(0, Math.min(from - MAX_TP * 0.05, text.length - MAX_TP));
  return text.slice(start, start + MAX_TP);
}
// ---------- Thông số theo model (Khoa, 2026-11-02) ----------
// An engine's own figures (cylinders, displacement, bore, governor, emission...) and an alternator's (insulation, IP,
// AVR...) are the same in every genset built with that model, so a figure any supplier's row or datasheet gives for
// the model may be quoted for it (a check's factSrc). Genset figures (fuel, size, tank, noise) stay with their own row.
// From a row table each fact is the row (with its header and title); from a label table (one model per page, a
// datasheet) the line that gives it, only when that table names a single model of that part.
// A China emission level written three ways ("国二", "国Ⅱ", "China II") is one word list.
const ROMAN = { 一: "i", 二: "ii", 三: "iii", 四: "iv", 五: "v", Ⅰ: "i", Ⅱ: "ii", Ⅲ: "iii", Ⅳ: "iv", Ⅴ: "v" };
const levelOf = (v) => String(v ?? "").replace(/国\s*([一二三四五ⅠⅡⅢⅣⅤ])/g, (_, d) => ` china ${ROMAN[d]} `).replace(/[ⅠⅡⅢⅣⅤ]/g, (d) => ` ${ROMAN[d]} `).replace(/国\s*(?=(i{1,3}|iv|v)\b)/gi, " china ");
// Words every level shares ("China II" / "China III", "Stage IIIA" / "Stage V") say nothing about which one it is.
const GENERIC = new Set(["china", "stage", "tier", "euro", "epa", "emission", "standard", "level", "class"]);
const sigOf = (v) => { const n = numbersIn(v); return n.length ? { nums: n } : { words: norm(levelOf(v)).split(/[^a-z0-9一-鿿]+/).filter((w) => (w.length > 1 || w === "v" || w === "i") && !GENERIC.has(w)).map((w) => w.slice(0, 6)) }; };
// Two values of one figure disagree when they share no number (or, for words, no word): "6" / "6L" / "In-line 6" agree,
// "14" / "10.8" do not.
// Two numbers within 3% are one figure rounded two ways (37.8 / 38 L, 135 / 136 L of oil), not a disagreement.
const near = (v, w) => Math.abs(v - w) <= Math.max(Math.abs(v), Math.abs(w)) * 0.03;
// An insulation class written alone ("H", "CLASS H", "cấp H", "loại F"): the letter is the value; `sigOf` keeps no word
// of one letter, so "H" and "H" used to disagree (điều phối 2026-11-11, cfg-r4). Only a value that is that and nothing else.
const classOf = (v) => (String(v ?? "").trim().match(/^(?:(?:class|c[ấa]p|lo[ạa]i)\s*)?([BFHC])\.?$/i) || [])[1]?.toUpperCase() || null;
// A ratio "x:1" (compression): the figure x itself, no rounding allowance — 16.8:1 and 17.3:1 differ, 17:1 and 17.0:1 do
// not (the shared "1" made them agree). A bare figure against a ratio is read as that ratio's x.
const ratioOf = (v) => { const m = String(v ?? "").trim().replace(/(\d),(\d)/g, "$1.$2").match(/^(\d{1,2}(?:\.\d+)?)\s*(:\s*1)?$/); return m ? { x: Number(m[1]), ratio: !!m[2] } : null; };
const disagree = (a, b) => {
  const ca = classOf(a), cb = classOf(b);
  if (ca && cb) return ca !== cb;
  const ra = ratioOf(a), rb = ratioOf(b);
  if (ra && rb && (ra.ratio || rb.ratio)) return ra.x !== rb.x;
  const x = sigOf(a), y = sigOf(b); if (x.nums && y.nums) return !x.nums.some((v) => y.nums.some((w) => near(v, w))); if (x.words && y.words) return !x.words.some((w) => y.words.includes(w)); return false; };
// Engine figures that depend on the genset they are in, so they stay with their own row: the output (prime / standby,
// 50 / 60 Hz), the speed (1500 / 1800 rpm) and the coolant volume (the radiator is the genset's).
const ROW_ONLY = new Set(["engPower", "speed", "coolant"]);
// Except an engine output whose source names its rating ("Engine Prime Power (kW) = 441", "Prime power / Speed (KW/RPM) =
// 284/1500", a maker's "Engine Prime Power (PRP)"): that is the engine model's (2026-11-10, kiểm tra cân bằng công suất).
// Kept under keys of their own, one per rating, so a prime and a standby figure are not two sources that disagree; two
// sources of one rating more than 3% apart are (factConflicts, comboChecks).
export const RATED_KEY = { prime: "engPrime", standby: "engStandby" };
const RATED_VI = { engPrime: "Công suất động cơ (prime)", engStandby: "Công suất động cơ (standby)" };
// Which figures are the engine's (điều phối 2026-11-10, after fdk-energy "Prime power / Speed = 144kw/1500" on a set of
// 144 kWe prime turned out to be the set's kWe): a figure of the engine's maker (role engine_maker); from a genset
// maker / assembler only a label that names the engine ("Engine Prime Power (kW)", 发动机…), and only when it is above
// the set's own kWe of that rating on that row (an engine giving no more than the set it drives is not its output).
// An engine maker's figure is dropped too when it is not above the set's kWe beside it.
const ENGINE_WORD = /engine|đ[ộo]ng\s*c[ơo]|发动机|柴油机/i;
export function ratedFacts(label, value, { maker = false, setPower = null } = {}) {
  const p = ratedPower(label, value);
  if (!p) return [];
  return ["prime", "standby"].filter((r) => p[r] != null).filter((r) => {
    const kWe = setPower?.[r]?.kW;
    if (kWe != null && p[r] <= kWe) return false;
    return maker || (ENGINE_WORD.test(String(label)) && kWe != null);
  }).map((r) => ({ key: RATED_KEY[r], label: String(label), value: String(value), kW: p[r], rpm: p.rpm || null, maker: !!maker }));
}
// A maker's datasheet that names its model only in the title (maker-datasheets.mjs: "Datasheet: UCI274F - Winding
// 311") gives that model's figures too, when the title names exactly one model of the catalog of the maker's part.
const MAKER_PART = { engine_maker: "engine", alternator_maker: "alternator" };
// A controller's datasheet (role controller_maker, maker-datasheets.mjs) is a list of functions and specifications,
// often of two models at once (Deep Sea: "DSE7310 MKII Auto Start & DSE7320 MKII"). Each line is a fact (key "ctl")
// of the models of its section (Khoa, 2026-11-02): a line that begins with some of the sheet's models ("DSE7320 MKII
// Automatic Mains (Utility) Failure (AMF) Controller Key Features") opens a section of those models; one naming all of
// them, "Common ..." or "Specifications" goes back to all; a line naming some models inside it ("| Number | DSE7310
// MKII: 1", "DSE7320 MKII: 2") is of those models only, without opening a section.
// SmartGen lists a series as "HGM6110N/6120N/6110NC": each code after a slash is a model of its own.
const ctlNames = (line) => {
  const out = CAT.controllersIn(line).filter((c) => c.model).map((c) => ({ key: CAT.keyOf(c.model), model: c.model }));
  for (const m of String(line).matchAll(/\bHGM\s?(\d{4}[A-Z]{0,4})((?:\s?\/\s?\d{4}[A-Z]{0,4})+)/gi)) for (const c of [m[1], ...m[2].split("/")].map((x) => x.trim()).filter(Boolean)) out.push({ key: CAT.keyOf(`HGM${c}`), model: `HGM${c.toUpperCase()}` });
  // Deep Sea writes two models of one sheet as "DSE6010/20 MKII" (DSE6010 MKII and DSE6020 MKII).
  for (const m of String(line).matchAll(/\bDSE\s?(\d{2})(\d{2})((?:\s?\/\s?\d{2}(?!\d))+)(\s*MK\s?I{2,3})?/gi)) {
    const gen = m[4] ? ` ${m[4].trim().replace(/\s+/g, "").toUpperCase()}` : "";
    for (const c of [m[2], ...m[3].split("/").map((x) => x.trim()).filter(Boolean)]) out.push({ key: CAT.keyOf(`DSE${m[1]}${c}${gen}`), model: `DSE${m[1]}${c}${gen}` });
  }
  return out;
};
const ctlKeys = (line) => [...new Set(ctlNames(line).map((x) => x.key))];
// "HGM6100N SERIES" names the series of a SmartGen manual, i.e. every model of the sheet, not a model of its own.
const isSeries = (k) => /^HGM\d{2}00/.test(k);
export function controllerSheetFacts(s, t) {
  const all = new Set([t.title, ...t.rows].flatMap(ctlKeys)), out = [], nameOf = new Map();
  for (const x of [t.title, ...t.rows].flatMap(ctlNames)) if (!nameOf.has(x.key)) nameOf.set(x.key, x.model);
  // A code cut from its generation by a line break ("& | DSE7320" then "| MKII | Auto") is that generation's model.
  const gen = (k) => { const g = [...all].filter((x) => x !== k && new RegExp(`^${k}MK(II|III)$`).test(x)); return g.length === 1 ? g[0] : k; };
  // The sheet's own models are those of its title: a line of another model's datasheet that only mentions a controller
  // ("compatible with DSE7320") does not give that controller's facts.
  const sheet = new Set(ctlKeys(t.title).map(gen).filter((k) => !isSeries(k)));
  const keysOf = (line) => [...new Set(ctlKeys(line).map(gen).flatMap((k) => (isSeries(k) ? [...sheet] : [k])))].filter((k) => sheet.has(k));
  if (!sheet.size) return out;
  let scope = [...sheet], prev = scope, last = "";
  for (const line of t.rows) {
    const bare = line.replace(/^[|\s]+/, "");
    let names = keysOf(line);
    // "HGM6120N/6120NC/6120CAN: Based on HGM6110N/..., it adds ..." and "DSE7320 MKII: 2" are of the models before the colon.
    const head = bare.match(/^([^:]{2,60}):/);
    if (head && keysOf(head[1]).length) names = keysOf(head[1]);
    if (names.length === sheet.size || /^(common\b|specifications$)/i.test(bare)) scope = [...sheet];
    else {
      // A heading begins with the model ("DSE7320 MKII Automatic ... Key Features"), not with a value ("DSE7320 MKII: 2").
      const first = CAT.controllersIn(bare)[0];
      if (names.length && !head && first && bare.indexOf(first.text) === 0 && bare.length <= 120) { scope = prev = names; continue; }
    }
    // A line that goes on with the sentence before it (it begins in lower case, or is a short piece after a line that
    // did not end the sentence: "... it | adds mains", "AC", "| monitoring ...") is of the same models as that line.
    const goesOn = /^[a-z]/.test(bare) || (bare.length <= 15 && !/[.;:!?]$/.test(last));
    const own = names.length ? names : goesOn ? prev : scope;
    for (const k of own) out.push({ model: k, f: { key: "ctl", label: "", value: line, supplierId: s.id, n: t.n, line, text: line, sheetModel: nameOf.get(k) || k } });
    prev = own; last = bare;
  }
  return out;
}
// A model of a frame: TAL-A46 + "C", LSA 44.3 + "S2" … "VL14" (the frame and its size and winding).
const FRAME_SUFFIX = /^([A-Z]{1,2}|[A-Z]{0,2}\d{1,2})$/;
export function modelFacts(cat, suppliers = []) {
  const facts = new Map(), single = new Map(), roleOf = new Map((suppliers || []).map((s) => [s?.id, s?.role])), rowsMap = normRowsOf(suppliers);
  const add = (k, f) => { const out = facts.get(k) || []; if (!out.some((g) => g.key === f.key && g.supplierId === f.supplierId && g.line === f.line)) out.push(f); facts.set(k, out); };
  const partKeys = new Set([...(cat.engines || []), ...(cat.alternators || [])].map((e) => e.key));
  for (const s of suppliers) {
    if (s?.role === "controller_maker") {
      for (const t of s.specTables || []) for (const { model, f } of controllerSheetFacts(s, t)) add(`controller:${model}`, f);
      continue;
    }
    const own = MAKER_PART[s?.role];
    for (const t of s.specTables || []) {
      if (t.header?.length) continue;
      // Every model code of the title, known or not: a title naming two models gives neither.
      // A word with "/" that is itself a model of the catalog ("6M31G825/5") stays one code; any other splits at "/".
      const models = [...new Set(String(t.title || "").split(/[\s:–—|,()]+/).flatMap((w) => (partKeys.has(CAT.keyOf(w)) ? [w] : w.split("/"))).filter((w) => CAT.isCode(w)).map((w) => CAT.keyOf(w)))];
      if (models.length !== 1) continue;
      // A genset maker's own datasheet of a part it makes (Wintpower "WT544C - Technical Data Sheet", Khoa 2026-11-03),
      // saved by maker-datasheets.mjs ("Datasheet: …"), gives the figures of that model when the catalog knows it.
      const isPart = (k) => (cat[k === "engine" ? "engines" : "alternators"] || []).some((e) => e.key === models[0]);
      const kind = own || (/^Datasheet: /.test(t.title || "") ? ["alternator", "engine"].find(isPart) : null);
      if (!kind) continue;
      const known = new Set((kind === "engine" ? cat.engines : cat.alternators || []).map((e) => e.key));
      // A frame's datasheet (Leroy-Somer "TAL-A46", Khoa 2026-11-02) gives its figures to the models of that frame
      // its own lines name ("TAL-A46-C ... TAL-A46-H" in its ratings table), each a model of the catalog.
      let covered = known.has(models[0]) ? [models[0]]
        : [...new Set(t.rows.flatMap((l) => CAT.cellsOf(l)).filter((c) => CAT.isCode(c)).map((c) => CAT.keyOf(c)))].filter((k) => k !== models[0] && k.startsWith(models[0]) && FRAME_SUFFIX.test(k.slice(models[0].length)) && known.has(k));
      // An engine maker's page of a series ("6M31 - Baudouin PowerKit Diesel Engines": rating tables, then the series' engine
      // data with no model): the data are of the models the SAME page (same source, same title) lists under the series code.
      if (!covered.length && own === "engine" && kind === "engine") covered = [...new Set((s.specTables || []).filter((x) => x !== t && x.n === t.n && x.title === t.title).flatMap((x) => x.rows.map((l) => CAT.cellsOf(l)[0]).filter((w) => w && CAT.isCode(w)).map((w) => CAT.keyOf(w))))].filter((k) => k !== models[0] && k.startsWith(models[0]) && known.has(k));
      // The part maker's own sheet of exactly this model (not a frame's sheet given to its models, not a genset maker's
      // "Datasheet:"): `sheet`, the source makerSheetChecks follows when the sources disagree (cfg-r4, quy tắc B).
      const sheet = !!own && covered.length === 1 && covered[0] === models[0];
      for (const line of t.rows) {
        // "| Cylinders 6", "| Bore & Stroke (mm) 149x177", "| Cylinders: 4": label and figure in one cell (series pages of a maker).
        let c = CAT.cellsOf(line);
        if (c.length === 1 && own === "engine") { const m = c[0].match(/^([^\d:：]{3,60}?)\s*[:：]?\s*(\d.*)$/); if (m) c = [m[1].trim(), m[2].trim()]; }
        const key = c.length >= 2 ? CAT.specKey(c[0]) : null;
        if (key === "engPower" && kind === "engine") { for (const f of ratedFacts(c[0], c.slice(1).join(" | "), { maker: s.role === "engine_maker" })) for (const m of covered) add(`${kind}:${m}`, { ...f, supplierId: s.id, n: t.n, line, text: line }); continue; }
        if (!key || CAT.SPEC[key]?.scope !== kind || ROW_ONLY.has(key)) continue;
        const value = c.slice(1).find((v) => CAT.SPEC[key].ok.test(v));
        if (value) for (const m of covered) { const f = { key, label: c[0], value, supplierId: s.id, n: t.n, line, text: line, ...(sheet ? { sheet: true } : {}) }; NORM_CTX.set(f, { title: t.title || "", header: t.header || [], rows: t.rows || [] }); add(`${kind}:${m}`, f); }
      }
    }
  }
  const parts = [["engine", cat.engines || []], ["alternator", cat.alternators || []]];
  for (const [kind, list] of parts) for (const e of list) for (const u of e.uses) if (u.lines) {
    const k = `${kind}|${u.supplierId}|${u.table}`; single.set(k, (single.get(k) || new Set()).add(e.key));
  }
  for (const [kind, list] of parts) for (const e of list) {
    const out = facts.get(`${kind}:${e.key}`) || [];
    for (const u of e.uses) for (const s of u.specs || []) {
      const rated = kind === "engine" && s.key === "engPower" ? ratedFacts(s.label, s.value, { maker: roleOf.get(u.supplierId) === "engine_maker", setPower: u.power }) : [];
      // Fuel is a genset figure, except on the engine maker's own table: there it is the engine's (bo-doc-tieu-hao, fuelChecks).
      const makerFuel = kind === "engine" && /^fuel(75|50)?$/.test(s.key) && roleOf.get(u.supplierId) === "engine_maker";
      if (!rated.length && !makerFuel && (CAT.SPEC[s.key]?.scope !== kind || ROW_ONLY.has(s.key))) continue;
      let line, text;
      if (u.line) { line = u.line; text = [...(u.header || []), u.line, u.title || ""].join(" \n "); }
      else {
        if (single.get(`${kind}|${u.supplierId}|${u.table}`)?.size !== 1) continue;
        line = [...(u.lines?.header || []), ...(u.lines?.rows || [])].find((l) => norm(l).includes(norm(s.label)) && norm(l).includes(norm(s.value)));
        if (!line) continue;
        text = line;
      }
      // A row of the part maker's own table (role engine_maker / alternator_maker) names the model by its catalog key.
      const sheet = !rated.length && roleOf.get(u.supplierId) === `${kind}_maker`;
      for (const f of rated.length ? rated : [{ key: s.key, label: s.label, value: s.value, ...(s.unitCell ? { unitCell: s.unitCell } : {}) }]) if (!out.some((g) => g.key === f.key && g.supplierId === u.supplierId && g.line === line)) { const g = { ...f, supplierId: u.supplierId, n: u.n, line, text, ...(sheet ? { sheet: true } : {}) }; NORM_CTX.set(g, useNormCtx(u, rowsMap)); out.push(g); }
    }
    if (out.length) facts.set(`${kind}:${e.key}`, out);
  }
  return facts;
}
// The facts of a model. A controller written without its generation ("DSE7320", as most genset tables write it) also
// takes the facts of the datasheets of its generations ("DSE7320 MKII"), each marked with `version`, and its check
// then says the generation is to be confirmed. A controller written with one ("DSE7320 MKII") takes only its own.
// The same rule for ComAp (Khoa, 2026-11-02): "AMF25" or "InteliLite AMF25" written without its generation takes the
// datasheet of "InteliLite 4 AMF25" (or "InteliLite NT AMF25"), to be confirmed.
const comapCore = (k) => k.match(/^(?:INTELILITE)?((?:AMF|MRS)\d+)$/)?.[1];
const GENERATION = [
  (key, k) => !/MK(II|III|2|3)$/.test(key) && new RegExp(`^${key}MK(II|III)$`).test(k),
  (key, k) => !!comapCore(key) && k.match(/^INTELILITE(?:4|NT)((?:AMF|MRS)\d+)$/)?.[1] === comapCore(key),
  // SmartGen "HGM6110" written without its letter (2026-11-03: 13 suppliers write it so): the current "HGM6110N".
  (key, k) => /^HGM\d{4}$/.test(key) && k === `${key}N`,
  // "InteliGen" written alone: every InteliGen generation with a datasheet (NT, NTC, 500, 1000...), to be confirmed.
  (key, k) => key === "INTELIGEN" && /^INTELIGEN(NTC?|\d{1,4})$/.test(k),
  // bdk-ds-4 (Khoa/điều phối 22/11/2026): suppliers' short names of ComAp's own order codes ("IG-NT GC", "IG-NTC-BB", IG500, IG1000)
  // take the datasheet of that InteliGen, to be confirmed (IG200 is not mapped: InteliGen 200 and InteliGen4 200 are two products).
  (key, k) => ({ IGNT: "INTELIGENNT", IGNTCBB: "INTELIGENNTC", IG500: "INTELIGEN500", IG1000: "INTELIGEN1000" })[key] === k,
  // "InteliLite 4", "InteliMains", "InteliSys" written without a model: every datasheet of that family, to be confirmed.
  (key, k) => (key === "INTELILITE4" && /^INTELILITE4(AMF|MRS)\d+$/.test(k)) || (key === "INTELIMAINS" && /^INTELIMAINS(NTC?|\d{1,4})$/.test(k)) || (key === "INTELISYS" && /^INTELISYS(NTC?|GAS|\d{1,4})$/.test(k)),
];
// ---------- Datasheet một model của tổ máy, dạng dọc (2026-11-13, IB2600601812) ----------
// A genset maker's datasheet of one genset, written as label tables, one per block of the sheet ("DHY110KSE",
// "DHY110KSE Voltage", "DHY110KSE Diesel engine", "DHY110KSE Alternator": label | unit | value). Every line of every
// block is that genset's, but the code used to take only the table its row was in (the Voltage and Alternator blocks of
// the named model were "Nguồn chưa ghi"). The sheet: the header-less tables of one source of the supplier whose title
// names exactly one model, the configuration's genset; only from a source the record marks tier A (the maker's own
// page). Also the quotes the record keeps of its tier A pages that name that model (the brand line of its own page).
const titleCodes = (t) => [...new Set(String(t?.title || "").split(/[\s:–—|,/()]+/).filter((w) => CAT.isCode(w)).map((w) => CAT.keyOf(w)))];
const tierA = (x) => String(x?.tier || "").toUpperCase() === "A";
export function gensetSheetOf(s, n, model) {
  const k = CAT.keyOf(model || "");
  if (!s || !k || n == null || !tierA((s.sources || []).find((x) => Number(x.n) === Number(n)))) return null;
  const tables = (s.specTables || []).filter((t) => Number(t.n) === Number(n) && !(t.header || []).length && (t.rows || []).length && titleCodes(t).length === 1 && titleCodes(t)[0] === k);
  if (!tables.length) return null;
  const quotes = (s.sources || []).filter((x) => tierA(x) && (x.quote || []).some((q) => NG.namesModel(q, model))).flatMap((x) => (x.quote || []).map((q) => ({ n: Number(x.n), line: String(q) })));
  return { supplierId: s.id, n: Number(n), model, tables, quotes };
}
// The sheet of a configuration: from the source of its genset row (else its engine's), its genset model.
export function sheetOfConfig(c, supOf) {
  const m = c?.genset?.model;
  if (!m) return null;
  for (const src of [c.genset?.src, c.engine?.src, c.alternator?.src]) {
    if (src?.kind !== "catalog") continue;
    const sh = gensetSheetOf(supOf(src.supplierId), src.n, m);
    if (sh) return sh;
  }
  return null;
}
export const sheetText = (sh) => (sh ? [...sh.tables.flatMap((t) => [t.title, ...t.rows]), ...sh.quotes.map((q) => q.line)].join(" \n ") : "");
// Each line of the sheet as a figure: { key (web/catalog.js SPECS, or "altKva" / "altKw"), part, label, value, line, block }.
// The block names the part (catalog.js headingOf: "Diesel engine", "Alternator") or the quantity ("Voltage": its "Steady
// state regulation" is the voltage regulation).
export function sheetFacts(sh) {
  const out = [];
  for (const t of sh?.tables || []) {
    const block = String(t.title || "").split(/\s+/).filter((w) => !CAT.isCode(w) && !/^\d+\s*hz$/i.test(w)).join(" ").trim();
    const head = block ? CAT.headingOf(block) : undefined, part = head === "engine" || head === "alternator" ? head : null;
    for (const line of t.rows) {
      const cs = CAT.cellsOf(line);
      if (cs.length < 2) continue;
      const label = cs[0], value = cs[cs.length - 1], unit = cs.length > 2 ? cs.slice(1, -1).join(" ") : "";
      let key = CAT.specKey(label) || (block && head === "keep" ? CAT.specKey(`${block} ${label}`) : null);
      // A value of another shape than its kind ("Stable time | Sec | 2.0" read as a voltage) is no figure of it.
      if (key && CAT.SPEC[key] && !CAT.SPEC[key].ok.test(`${value} ${unit}`.trim())) key = null;
      // An alternator's own output in its block ("Prime power | kVA | 100"): catalog.js reads no power by label.
      if (!key && part === "alternator" && /power|output|c[ôo]ng\s*su[ấa]t/i.test(label)) key = /kva/i.test(`${unit} ${value}`) ? "altKva" : /\bkw/i.test(`${unit} ${value}`) ? "altKw" : null;
      out.push({ key, part: part || (key && CAT.SPEC[key]?.scope) || "genset", label, unit, value, line, block, supplierId: sh.supplierId, n: sh.n });
    }
  }
  return out;
}
// A controller as the agent wrote it ("6120" made by SmartGen, "Smartgen 6120") → the model web/catalog.js reads from the
// same words (HGM6120), whose datasheet then counts (2026-11-03 regression run: such controllers checked 0 functions).
// The controller models a text names, as catalog.js reads them (CM.ctlKinds).
export const ctlModelsIn = (t) => CAT.controllersIn(String(t || "")).filter((x) => x.model).map((x) => x.model);
export function ctlModelOf(p) {
  const m = String(p?.model || ""), found = (t) => CAT.controllersIn(t).filter((x) => x.model && CAT.keyOf(x.model).endsWith(CAT.keyOf(m).replace(/^\D+/, "")));
  const own = found(m), withMake = own.length ? own : found(`${p?.make || ""} ${m}`);
  return withMake.length === 1 ? withMake[0].model : m;
}
export function factsFor(facts, part, model) {
  const key = CAT.keyOf(model), own = facts.get(`${part}:${key}`) || [];
  if (part !== "controller") return own;
  const gens = [...facts.keys()].filter((k) => k.startsWith("controller:") && k !== `controller:${key}` && GENERATION.some((g) => g(key, k.slice(11))));
  return [...own, ...gens.flatMap((k) => facts.get(k).map((f) => ({ ...f, version: f.sheetModel || k.slice(11) })))];
}
// The figures of one model whose sources disagree: key → the values given. Values of one page (a datasheet giving the
// voltage regulation of two AVRs, the efficiency at each voltage) are conditions, not a disagreement.
export function factConflicts(list) {
  const out = new Map(), src = (f) => `${f.supplierId}#${f.n}`;
  for (const f of list || []) {
    if (!CAT.SPEC[f.key] && !RATED_VI[f.key]) continue;
    const same = list.filter((g) => g.key === f.key);
    // A rated engine output: its kW of that rating, 3% apart (the value may also hold the speed or the other rating).
    const off = (g) => (f.kW != null && g.kW != null ? !near(f.kW, g.kW) : disagree(f.value, g.value));
    if (same.some((g) => src(g) !== src(f) && off(g))) out.set(f.key, [...new Set(same.map((g) => (g.kW != null ? `${g.kW} kW` : g.value)))]);
  }
  return out;
}

// ---------- Ứng viên: code xếp sẵn các dòng tổ máy (Khoa, 2026-11-02) ----------
// The agent used to read every engine and alternator near the power (catalog.md ~380 KB, 5–11 minutes a run). Now the
// code ranks the genset rows first and the agent reads the best ones with every figure gathered. Engine and controller
// weigh more than the alternator (Khoa, 2026-11-02).
const squashOf = (s) => norm(s).replace(/[^a-z0-9]/g, "");
// The squashed text (`text`, = squashOf) and where its tokens (runs of [a-z0-9] in the text) start and end (`bounds`: bit 1 =
// a token starts at this index of `text`, bit 2 = one ends just before it), for `named`.
function squashTokens(s) {
  const toks = norm(s).match(/[a-z0-9]+/g) || [];
  const text = toks.join(""), bounds = new Uint8Array(text.length + 1);
  let i = 0;
  for (const k of toks) { bounds[i] |= 1; i += k.length; bounds[i] |= 2; }
  return { text, bounds };
}
// `sizing` ({ size, sizes }, sizesOf): the run of one size of a tender of several sizes: the minimums of that size's own block.
// The cylinder arrangement (Khoa, 2026-11-17, IB2600603983: "6 xy lanh, bố trí thẳng hàng" and the nine Cummins rows of
// the candidates were KTA38, 12 cylinders in V, which the agent then turned down; QSK23-G2, in line, stood 127th).
// Of the HSMT: "inline" / "v" when its lines about the cylinders name one arrangement only, else null.
export function cylLayoutOf(text) {
  const seen = new Set(), L = String(text || "").split("\n");
  for (let i = 0; i < L.length; i++) {
    if (!/(?:xi|xy)\s*-?\s*lanh|cylinders?/i.test(L[i])) continue;
    // The value of a table row often wraps onto the next line.
    const s = `${L[i]} ${/(?:xi|xy)\s*-?\s*lanh|cylinders?/i.test(L[i + 1] || "") ? "" : L[i + 1] || ""}`;
    if (/th[ẳa]ng\s*h[àa]ng|in-?\s*line/i.test(s)) seen.add("inline");
    if (/ch[ữu]\s*V\b|ki[ểe]u\s*V\b|h[ìi]nh\s*(?:ch[ữu]\s*)?V\b|\bV\s*-?\s*type|\bvee\b/i.test(s)) seen.add("v");
  }
  return seen.size === 1 ? [...seen][0] : null;
}
// Of a source's "cyl" value ("12V", "12.V", "V12", "6L", "6 L", "6 in-line", "12 cylinders V type"): "inline", "v" or
// null when it gives the count only.
export function layoutOf(value) {
  const s = String(value ?? "");
  if (/in-?\s*line|th[ẳa]ng\s*h[àa]ng|\bL\s*type\b/i.test(s)) return "inline";
  if (/\bvee\b|°\s*V\b|\bV\s*-?\s*type|^\s*\d{1,2}\s*[.\-]?\s*V\s*$|^\s*V\s*-?\s*\d{1,2}\s*$|\d\s*cylinders?\s*,?\s*V\b|\bDiesel\s*\.?\s*V/i.test(s)) return "v";
  if (/^\s*\d{1,2}\s*[.\-]?\s*L\s*$|^\s*L\s*-?\s*\d{1,2}\s*$|\bDiesel\s*L\b/i.test(s)) return "inline";
  return null;
}
// The fuel of the genset the HSMT asks (Khoa 20/11/2026, máy khí bước 2): "diesel" | "gas" | "gasoline" | null.
//  - one kind named → that kind; a HSMT that names none → "diesel" (a generator tender is diesel unless it says otherwise);
//  - two kinds or more (a maintenance package of petrol and diesel sets, a menu of choices) → null: no rule, nothing dropped.
// Only the words that name the FUEL of the set: "khí tự nhiên" alone is "hút khí tự nhiên" (a naturally aspirated engine),
// and "xăng dầu" is a petrol station; "dầu DO" / "diesel" in spare parts lists name diesel too, which only matters beside another kind.
const FUEL_GAS_H = /khí\s*thiên\s*nhiên|\bbio-?gas\b|khí\s*sinh\s*học|khí\s*hóa\s*lỏng|\bLPG\b|\bCNG\b|\bLNG\b|natural\s*gas|nhiên\s*liệu\s*(?:sử\s*dụng\s*)?(?:là\s*|:\s*|bằng\s*)(?:khí|gas)(?![a-zà-ỹ])(?!\s*(?:thải|nạp|nén|đốt|hậu|quyển|xả|hút|gió))|(?:chạy|dùng|sử\s*dụng)\s*(?:nhiên\s*liệu\s*)?(?:bằng\s*)?(?:khí|gas)(?![a-zà-ỹ])(?!\s*(?:thải|nạp|nén|đốt|hậu|quyển|xả|hút|gió))|(?<!liên\s*)động\s*cơ\s*(?:chạy\s*)?(?:bằng\s*)?(?:khí|gas)(?![a-zà-ỹ])(?!\s*(?:thải|nạp|nén|đốt|hậu|quyển|xả|hút|gió))|\bgas\s+(?:engine|generator|genset)/i;
const FUEL_GASOLINE_H = /(?:chạy|dùng|sử\s*dụng)\s*(?:nhiên\s*liệu\s*)?(?:bằng\s*)?xăng(?![a-zà-ỹ])(?!\s*dầu)|(?:động\s*cơ|máy|nhiên\s*liệu(?:\s*sử\s*dụng)?)\s*(?:là\s*|:\s*|bằng\s*)?xăng(?![a-zà-ỹ])(?!\s*dầu)|nhiên\s*liệu[^.\n]{0,40}(?:hoặc|và|\/|,)\s*xăng(?![a-zà-ỹ])(?!\s*dầu)|\bgasoline\b|\bpetrol\b/i;
const FUEL_DIESEL_H = /\bdi[ee]?zel\b|\bdiesel\b|\bdầu\s*(?:diesel|do)\b|động\s*cơ\s*(?:chạy\s*)?dầu\b|chạy\s*dầu\b/i;
export function fuelOfHsmt(text) {
  const t = String(text || "").normalize("NFC"), kinds = [];
  const g = t.match(FUEL_GAS_H), x = t.match(FUEL_GASOLINE_H), d = t.match(FUEL_DIESEL_H);
  if (g) kinds.push(["gas", g[0]]);
  if (x) kinds.push(["gasoline", x[0]]);
  if (d) kinds.push(["diesel", d[0]]);
  if (kinds.length > 1) return { fuel: null, stated: true, why: `HSMT nêu nhiều loại nhiên liệu (${kinds.map((k) => k[1]).join("; ")})` };
  if (kinds.length === 1) return { fuel: kinds[0][0], stated: true, why: kinds[0][1] };
  return { fuel: "diesel", stated: false, why: "HSMT không nêu nhiên liệu, coi là diesel" };
}
// A catalog use (`u.fuel` "gas" / "gasoline" / "dual", written only when the page says it) against the fuel the HSMT asks:
// true when it is the wrong one; a use with no fuel is never wrong (empty is not diesel).
export const fuelOff = (want, useFuel) => !!want && !!useFuel && !(want === "gas" ? useFuel === "gas" || useFuel === "dual" : want === "gasoline" ? useFuel === "gasoline" || useFuel === "dual" : false);
// The frequency the HSMT binds the set to: 50 or 60 when only that one is written, null when none or both (no constraint).
// Both include the pairs written with one "Hz" ("50 & 60hz", "50/60Hz", "50 / 60Hz", "50-60Hz", "50 hoặc 60 Hz", "50Hz-60"):
// `\b50\s?hz\b` alone read "50 & 60hz" as 60 Hz and the rows of an engine written only at 50 Hz were ruled out (2 rows with a
// frequency are enough, `ruled: freq`; Khoa 20/11/2026, IB2400073761 "Tần số: 50 & 60hz"). A pair needs a "Hz" on one side and
// no unit / second figure after the second number ("380V-50Hz-60/66 kVA" is 60 kVA, not 60 Hz).
const FREQ_PAIR = /(?<![\d.,])(?:50|60)\s*(?:hz|hertz)?\s*(?:\/|&|-|–|—|÷|,|;|~|hoặc|hay|và|or|and|đến|to)\s*(?:50|60)(?![\d])(?!\s*(?:\/\s*\d|kva|kw|kvar|va\b|a\b|v\b|%))\s*(?:hz|hertz)?/gi;
// Tần số của một dòng: ô tần số đã đọc, nếu không thì cột tốc độ của chính dòng (đúng một cột tên "Speed" / "rpm" / 转速,
// ô đúng 1500 hoặc 1800). Không đoán từ ô số không có tiêu đề; cột ghép "Power/Speed (kWm/rpm)" không đọc.
export function hzOfRow(u) {
  if (u?.freq) return u.freq;
  if (!u?.line) return null;
  const trimmed = (l) => CAT.cellsOf(l).map((c) => String(c).trim()), cells = trimmed(u.line);
  for (const h of u.header || []) {
    const heads = trimmed(h);
    if (heads.length !== cells.length) continue;
    const at = heads.flatMap((c, i) => (/^(rated\s+)?speed\b|^rpm\b|^转速/i.test(c) ? [i] : []));
    if (at.length !== 1) continue;
    const m = cells[at[0]].match(/^(1500|1800)(?:\s*(?:rpm|r\/min))?$/i);
    return m ? (m[1] === "1500" ? 50 : 60) : null;
  }
  return null;
}
export function freqOfHsmt(t) {
  let f50 = /\b50\s?hz\b/i.test(t), f60 = /\b60\s?hz\b/i.test(t);
  for (const m of String(t).matchAll(FREQ_PAIR)) if (/hz|hertz/i.test(m[0])) f50 = f60 = true;
  return f50 && !f60 ? 50 : f60 && !f50 ? 60 : null;
}
export function hintsOf(text, extra = "", sizing = null) {
  const t = `${technicalPart(text)}\n${String(extra ?? "").normalize("NFC")}`;
  const names = (list) => list.filter(([re]) => re.test(t)).map(([, n]) => n);
  const ctrl = CAT.CONTROLLERS.filter((c) => c.word.test(t)).map((c) => c.brand);
  for (const c of CAT.controllersIn(t)) if (!ctrl.includes(c.brand)) ctrl.push(c.brand);
  const sized = sizing?.sizes?.length > 1 ? minsForSize(technicalPart(text), sizing.size, sizing.sizes, extra) : null;
  // Đặc thù hãng động cơ (Khoa 18/11/2026, engine-traits.mjs): a term of one engine make in the HSMT's engine requirements
  // (E-TVCS → Kubota) → only that make (rule 1, candidates / check / rankConfigs); written with "hoặc tương đương" → that
  // make counts as named (points, no filter: Khoa câu 3); a controller term (PowerCommand, EMCP…) → that controller,
  // the engine make untouched (rule 5).
  const trait = ET.filterOf(t);
  const engineMakes = names(CAT.ENGINE_BRANDS);
  for (const m of [trait.engineMake, ...trait.unused.filter((u) => u.equivalent && u.at === "engine").map((u) => u.makeName)]) if (m && !engineMakes.includes(m)) engineMakes.push(m);
  return { engineMakes, trait, altMakes: names(CAT.ALT_BRANDS), ctrlMakes: ctrl, ctrlModels: CAT.controllersIn(t).filter((c) => c.model).map((c) => CAT.keyOf(c.model)),
    freq: freqOfHsmt(t), cylLayout: cylLayoutOf(t), fuel: fuelOfHsmt(technicalPart(text)).fuel, madeRule: partOriginOfHsmt(text), ...squashTokens(t), ...engineMins(t), ...comprOf(t), ...(sized ? { multiSize: true, ...sized.mins } : {}), ...(sized?.note ? { sizeNote: sized.note } : {}) };
}
// The engine minimums the HSMT states ("Dung tích xy lanh ≥ 11,05 L", "Tối thiểu 06 xi lanh"), one value each: a tender
// of several gensets that gives two values is left alone. candidates() ranks an engine a source shows below them lower
// (2026-11-03: the 11 best rows were 8.9-10.3 L engines for a tender asking 11.05 L).
// A webform table or an OCR page often comes as one line of thousands of characters ("… Đạt Không đạt 3 Công suất liên
// tục ≥ 12.5 ±0.5KVA Đạt Không đạt 4 Công suất tối đa ≥ 13.8 kVA …", 2026-11-04 regression: 1 in 6 HSMT has a line over
// 300 characters). Its rows are split again before a row number or a section mark followed by a word ("4 Công suất",
// "III Yêu cầu đối với đầu phát", "- Tần số"), not before a figure with its unit ("≥ 8 Lít"). OCR's "500K VA" / "2.000k W"
// is kVA / kW.
const UNIT_WORD = /^(?:l[íi]t|lit|kw|kva|kg|hz|v[òo]ng|gi[ờo]|ph[úu]t|n[ăa]m|th[áa]ng|ng[àa]y|m[ée]t|b[ộo]|c[áa]i|chi[ếe]c|m[áa]y|pha|d[âa]y|xi|xy|t[ấa]n|l[ầa]n|c[ấa]p|ampe|volt|độ)$/i;
export function unflatten(t) {
  // Vietnamese text of a PDF or a web page is often decomposed (NFD: "a" + a combining mark): every pattern here is of the
  // composed letters (2026-11-12 audit: a decomposed tender gave no or wrong minimums).
  return String(t ?? "").normalize("NFC").replace(/(\d)\s*([kK])\s+(VA|W)\b/g, "$1 $2$3").split("\n").map((l) => (l.length <= 300 ? l
    : l.replace(/\s(?=(?:[IVX]{1,4}|[A-H])\s+\p{Lu}\p{Ll})/gu, "\n").replace(/\s(?=-\s+\p{Lu})/gu, "\n")
      .replace(/(?<![≥≤<>=:±~\/×]\s*)\s(\d{1,2}(?:\.\d{1,2})*\.?)\s+(?=(\p{Lu}\p{Ll}+))/gu, (all, n, w) => (UNIT_WORD.test(w) ? all : `\n${n} `)))).join("\n");
}
// The part of the genset a section of the HSMT is about, by its heading ("II Yêu cầu đối với động cơ", "III" / "Yêu cầu
// đối với đầu phát điện", "* Đầu phát"): a heading has a mark (roman numeral, letter, number, bullet) or "Yêu cầu" /
// "Thông số" before the part, and nothing after it but a few words (a row "Động cơ: 4 thì" is not one).
const SECTION = /^\s*(?:(?:[IVX]{1,4}|[A-H]|\d{1,2}(?:\.\d{1,2})*)[.):]?\s+|[*+•-]\s*)?(?:(?:yêu cầu|thông số|đặc tính)(?: kỹ thuật)?(?: (?:đối với|về|của|cho))?\s+)?(đầu phát|alternator|động cơ|engine|tổ máy|máy phát điện|genset|bộ điều khiển|hệ thống điều khiển|tủ điều khiển|vỏ)[^:\d\n]{0,40}:?\s*$/i;
export function sectionsOf(text) {
  const out = [], L = String(text).split("\n");
  let at = 0;
  L.forEach((l, i) => {
    const h = /^\s*(?:[IVX]{1,4}|[A-H])\s*$/.test(l) && L[i + 1] ? `I ${L[i + 1]}` : l;
    const m = h.length <= 80 && /^\s*([IVX]{1,4}|[A-H]|\d|[*+•-]|yêu|thông|đặc)/i.test(h) && h.match(SECTION);
    if (m) out.push({ at, kind: /đầu phát|alternator/i.test(m[1]) ? "alt" : /động cơ|engine/i.test(m[1]) ? "engine" : "genset" });
    at += l.length + 1;
  });
  return (i) => { let k = "genset"; for (const s of out) { if (s.at > i) break; k = s.kind; } return k; };
}
// The sections of a tender that is also for a forklift, a crane...: a heading "3.2.1. Yêu cầu về kỹ thuật cụ thể cho xe nâng"
// opens the text of that equipment up to the next heading of the same kind ("3.2.2. ... cho máy phát điện"). Its lines are
// blanked (the same number of lines): its cylinders and displacement ("≥ 4/3318cm3" of a forklift) are not the genset's.
const EQ_HEAD = /^\s*(?:\d+(?:\.\d+)*\.?|[IVX]+\.|[A-H]\.)\s*(?:yêu cầu|thông số|đặc tính)[^\n]{0,60}?\b(?:cho|của|đối với)\s+(.{3,80})$/i;
const EQ_OTHER = /xe nâng|cầu trục|forklift|\bcrane\b|xe cẩu|xe tải|ô tô|thang máy|máy xúc|máy ủi|máy nén khí|máy bơm|xe chuyên dùng/i;
export function withoutOtherEquipment(t) {
  let other = false;
  return String(t ?? "").split("\n").map((l) => {
    const h = l.length <= 160 && l.match(EQ_HEAD);
    if (h) other = EQ_OTHER.test(h[1]) && !/máy phát|tổ máy|genset|generator/i.test(h[1]);
    return other ? "" : l;
  }).join("\n");
}
const AT_LEAST = /≥|>=|tối thiểu|ít nhất|không (nhỏ|thấp|bé) hơn|trở lên/i, MAXIMUM = /≤|<=|<(?!=)\s*\d|tối đa|không (lớn|vượt|quá)|(?<!không\s)(?:nhỏ hơn|dưới)\s*:?\s*\d/i;
const DISP_W = /dung t[íi]ch|displacement/i, TANK_W = /bình|bồn|thùng|két|nhớt|nước|nhiên liệu|tank|dầu|ắc quy|làm mát|\bmát\b|bôi trơn|coolant|lubric|\boil\b/i;
// The displacement of the engine, by its label (2026-11-12 audit: "Tổng dung tích làm mát ≥ 55 L" was read as the cylinders').
// A label of a displacement that names neither the cylinders nor the engine is not read.
const DISP_LABEL = /dung t[íi]ch\s*(?:t[ổo]ng\s*)?(?:c[ủu]a\s*)?(?:c[áa]c\s*)?(?:xi|xy|x)(?:[\s-]?lanh|-)|dung t[íi]ch[^\n]{0,30}?(?:xi|xy)[\s-]?lanh\b|dung t[íi]ch\s+(?:c[ủu]a\s+)?(?:[đd][ộo]ng c[ơo]|bu[ồo]ng [đd][ốo]t)|dung t[íi]ch\s*(?:piston|pit\s?t[ôo]ng)|dung t[íi]ch\s*x\s*l\s*nh|displacement|swept volume/i;
// A bare "dung tích" in the clause of a tank, however far ("Thùng thép đặt trong vỏ cách âm, dung tích ≥ 55 lít", IB2300245748).
const tankNear = (cell) => {
  const m = cell.match(DISP_LABEL) || cell.match(/(?:t[ổo]ng\s+)?dung t[íi]ch/i);
  if (!m) return false;
  // A label that names the cylinders looks within its own clause: "… khí làm mát; 1.500 vòng/phút; dung tích xy lanh >4,087 lít"
  // (IB2300163186) is no coolant's. A bare "dung tích" keeps the wider look ("Bình nhiên liệu …; dung tích ≤ 25 lít" is the tank's).
  const after = m.index + m[0].length, stop = cell.indexOf(";", after), named = /(?:xi|xy)[\s-]?lanh/i.test(m[0]);
  if (TANK_W.test(cell.slice(Math.max(0, m.index - 25, named ? cell.lastIndexOf(";", m.index) + 1 : 0), Math.min(after + 25, named && stop >= 0 ? stop : cell.length)))) return true;
  const bare = !/(?:xi|xy)[\s-]?lanh|displacement/i.test(cell.slice(m.index, m.index + m[0].length + 12));
  // Only the words of a vessel: TANK_W also has "nước", "làm mát", "dầu", which an engine clause names ("làm mát bằng nước, ≥ 3 xi lanh, dung tích ≥ 2,3 lít").
  return bare && /th[ùu]ng|b[ồo]n\b|b[ìi]nh\b|k[ée]t\b|\btank\b/i.test(cell.slice(Math.max(cell.lastIndexOf(";", m.index), cell.lastIndexOf(":", m.index), 0), m.index));
};
// "Tổng dung tích ≥ 19.6 lít" among the lines of the cylinders (bore, stroke, piston, compression ratio) is the engine's.
const DISP_BARE = /^(?:.*\s)?(?:t[ổo]ng\s+)?dung t[íi]ch\s*(?::|≥|≤|<|>|\d|$)/i, ENGINE_LINES = /(?:xi|xy)[\s-]?lanh|piston|h[àa]nh tr[ìi]nh|đ[ườu]*ng k[ií]nh|t[ỷy] s[ốo] n[ée]n|compression|\bbore\b|\bstroke\b/i;
// The label of the count of cylinders ("Số xi lanh", "Số xy-lanh", "Số lượng xi lanh", "Số cylinder", "Number of cylinders").
const CYL_LABEL = /(?:s[ốo]\s*(?:l[ưu][ợo]ng\s*)?(?:xi|xy)[\s-]*lanh|s[ốo]\s*cylind(?:er|re)s?|number\s+of\s+cylinders?)/i;
// A figure that is the engine's number of strokes ("4 kỳ", "4 thì", "4 kì", "4-stroke", "4 cycle"), not a count of cylinders
// (cyl-ky 20/11/2026): a lookahead put right after the figure.
const NOT_STROKE = String.raw`(?!\s*-?\s*(?:k[ỳìyi]|th[ìi]|stroke|cycle)(?![a-zà-ỹ]))`;
// "Động cơ diesel 4 thì, 6 xy lanh, thẳng hàng" / "Kiểu: 6 xylanh, 4 thì": the count inside a line that describes the engine.
// Not after a bore, a stroke or a displacement, not a line of choices ("6 hoặc 8 xi lanh"), nor another vehicle's engine.
function inlineCyl(line) {
  // "Động cơ CUMMINS hoặc tương đương; … 6 xylanh" (IB2500114642) is no line of choices of the count. Same length: positions stay.
  line = line.replace(/ho[ặa]c\s+t[ươ]+ng\s+đ[ươ]+ng/gi, (x) => " ".repeat(x.length));
  if (!/đ[ộo]ng c[ơo]|\bth[ìi]\b|\bk[ỳy]\b|ki[ểe]u|lo[ạa]i|engine|diesel|k[ếe]t c[ấa]u|c[ấa]u h[ìi]nh|th[ẳa]ng\s*h[àa]ng|ch[ữu]\s*V\b|b[ốo] tr[íi]/i.test(line)) return null;
  if (/ho[ặa]c|\bor\b|xu[ồo]ng|\bt[àa]u\b|ca\s*n[ôo]|xe\s+(?:n[âa]ng|t[ảa]i|c[ẩa]u)/i.test(line)) return null;
  // Not a figure glued to a letter: "5 | S6 xy lanh, kiểu b tri > 4 thắng hàng" (IB2400313681, OCR of "Số") is no 6 cylinders;
  // nor a line that gives the count with a sign before the layout ("> 4 thắng hàng"): the count is that least, read above.
  if (/(?:≥|>=|>|tối thiểu)\s*0?\d{1,2}\s*,?\s*(?:th[ẳắa]ng\s*h[àa]ng|(?:h[ìi]nh\s*)?ch[ữu]\s*V\b)/i.test(line)) return null;
  const all = [...line.matchAll(/(?<![\d×*\/-]\s?)(?<![\p{L}\d.,]|\bx\s?)0?(\d{1,2})\s*(?:xi|xy)[\s-]?lanh/giu)]
    .filter((m) => !/(?:đ[ườu]*ng k[ií]nh|h[àa]nh tr[ìi]nh|dung t[íi]ch|bore|stroke)[^\d]{0,15}$/i.test(line.slice(Math.max(0, m.index - 30), m.index)));
  return all.length && all.every((m) => m[1] === all[0][1]) ? all[0] : null;
}
// ---------- Tỉ số nén HSMT ghi trơ = số chính xác (Khoa 20/11/2026, IB2600603983: "sửa luật để kiểm tra tỉ số nén nếu hsmt
// ghi trơ") ----------
// Each line of the HSMT that gives the compression ratio: { x, kind, line }. kind "exact" = the figure alone ("14 : 01",
// "Tỷ số nén | 17.3:1", "Tỉ số nén: 16:1"), "min" (≥ > tối thiểu…), "max" (≤ < tối đa…), "band" (two figures, khoảng, ±,
// ~), "ref" (the engine of goods for reference: "tham khảo", "tương đương", "tương tự" on that line or the one around it).
// "Nêu cụ thể" / "Ghi rõ" / "Theo tiêu chuẩn nhà sản xuất" give no figure and no entry. The value is the label's own cell,
// else the next line when it is only that value (a table cell wrapped: "Tỉ số nén" / "≥ 20:1"). Figures out of 5–30
// (OCR "175:1") are not read.
// Not a "compression ratio limiter" (IB2300270603 writes "Compression ration limiter : 20:1"), a part, not the ratio.
const COMPR_LABEL = /t[ỉỷiy]\s*s[ốo]\s*n[ée]n|compression\s*ration?\b(?!\s*limiter)/i;
const COMPR_FIG = String.raw`(\d{1,2}(?:[.,]\d{1,2})?)`;
const COMPR_VAL = new RegExp(String.raw`^[\s|:.\-–(]*(?:l[àa]\s+)?(≥|>=|>|≤|<=|<|t[ốo]i\s*thi[ểe]u|t[ốo]i\s*đa|kho[ảa]ng|~|±)?\s*[:(]?\s*${COMPR_FIG}(?:\s*:\s*0?1)?(?![\d.,])`, "i");
// The value alone on the next line: with its sign, its ":1" or a decimal part (a bare "5" there is the next row's number).
const COMPR_NEXT = new RegExp(String.raw`^[\s|:.\-–(]*(?:≥|>=|>|≤|<=|<|t[ốo]i\s*thi[ểe]u|t[ốo]i\s*đa|kho[ảa]ng|~|±)\s*[:(|]?\s*\d|^[\s|:.\-–(]*\d{1,2}(?:[.,]\d{1,2})?\s*:\s*0?1(?![\d.,])|^[\s|:.\-–(]*\d{1,2}[.,]\d{1,2}(?![\d.,])`, "i");
const COMPR_MIN = /≥|>|t[ốo]i\s*thi|ho[ặa]c\s*(t[ốo]t|cao|l[ớo]n)\s*h[ơo]n|tr[ởo]\s*l[êe]n|\bmin/i, COMPR_MAX = /≤|<|t[ốo]i\s*đa|\bmax/i;
export function comprLines(t) {
  const L = withoutOtherEquipment(unflatten(t)).split("\n").map((l) => l.replace(/[ \t ]{2,}/g, " ")), out = [];
  L.forEach((line, i) => {
    const m = line.match(COMPR_LABEL);
    if (!m) return;
    let cell = line.slice(m.index + m[0].length).replace(/^\s*\((?:C|yêu cầu tối thiểu)\)\s*\)?/i, (s) => (/t[ốo]i\s*thi/i.test(s) ? " tối thiểu " : " "));
    // "Số xilanh và tỷ số nén: 6 xilanh; tỷ số nén > 17.5:1" (IB2300046231): số đầu là số xi lanh, giá trị ở nhãn kế tiếp.
    if (/^[\s:|]*\d{1,2}\s*(?:xi|xy)[\s-]?lanh/i.test(cell)) {
      const next = cell.match(COMPR_LABEL);
      if (!next) return;
      cell = cell.slice(next.index + next[0].length);
    }
    // The label alone: the value on the next line, when that line is the value and nothing else of a row.
    // A sign left on the label's line ("Tỷ số nén: ≥" / "17:1") stays with the figure.
    if (!/\d/.test(cell) && !/n[êe]u|ghi\s*r[õo]|theo/i.test(cell) && COMPR_NEXT.test(L[i + 1] || "") && !/[a-zà-ỹ]{4}/i.test(String(L[i + 1]).replace(/t[ốo]i\s*(thi[ểe]u|đa)|kho[ảa]ng|đ[ạa]t|kh[ôo]ng|b[ắa]t\s*bu[ộo]c|ho[ặa]c|t[ốo]t|h[ơo]n/gi, ""))) cell = ` ${(cell.match(/≥|>=|>|≤|<=|<|t[ốo]i\s*thi[ểe]u|t[ốo]i\s*đa/i) || [""])[0]} ${L[i + 1]}`;
    const v = cell.match(COMPR_VAL);
    // "≥ | 18.5:1" (a table cell of the sign, then the figure).
    const v2 = !v && cell.match(new RegExp(String.raw`^[\s|:]*(≥|>=|>|≤|<=|<)\s*\|?\s*${COMPR_FIG}\s*:\s*0?1(?![\d.,])`, "i"));
    const hit = v || v2;
    if (!hit) {
      // A ratio further on in the cell ("Tỷ số nén (C) | ≥16,0:1", "tỷ số nén 17:1, dung tích …").
      const r = cell.match(new RegExp(String.raw`^[^\d\n]{0,25}?(≥|>=|>|≤|<=|<|t[ốo]i\s*thi[ểe]u|t[ốo]i\s*đa)?\s*${COMPR_FIG}\s*:\s*0?1(?![\d.,])`, "i"));
      if (!r) return;
      return push(r[1], r[2], cell, i);
    }
    push(hit[1], hit[2], cell, i);
  });
  function push(sign, fig, cell, i) {
    const x = Number(String(fig).replace(",", "."));
    if (!(x >= 5 && x <= 30)) return;
    const s = String(sign || "").toLowerCase(), around = `${L[i - 1] || ""} ${L[i]} ${L[i + 1] || ""}`;
    // The words before the figure and just after it, up to the end of its cell ("17,1:1 hoặc tốt hơn"), not the next
    // figure of the line ("Tỷ số nén: 16.8; Dung tích xilanh (L): > 10.34").
    const at = cell.indexOf(fig), pre = `${s} ${cell.slice(0, Math.max(0, at))}`, post = cell.slice(at + fig.length).split(/[|;]/)[0].slice(0, 30);
    // Two ratios in the cell ("≥ 13:1 và ≤ 18:1"), or a band word.
    const two = (cell.split(/[;]/)[0].match(/\d{1,2}(?:[.,]\d{1,2})?\s*:\s*0?1(?![\d.,])/g) || []).length > 1;
    // Bản đọc ghi rõ dấu so sánh trước số bị mất (IB2300343208, IB2400564384): không phải số ghi trơ.
    const kind = /tham\s*kh[ảa]o|t[ươ]+ng\s*(đ[ươ]+ng|t[ựu])/i.test(around) ? "ref"
      : /k[ýy]\s*hi[ệe]u\s*so\s*s[áa]nh/i.test(cell.slice(at)) ? "lost"
      : two || /kho[ảa]ng|~|±|đ[ếe]n|\bt[ừu]\b/i.test(`${pre} ${post}`) ? "band"
      : COMPR_MIN.test(`${pre} ${post}`) ? "min" : COMPR_MAX.test(`${pre} ${post}`) ? "max" : "exact";
    out.push({ x, kind, line: L[i].trim() });
  }
  return out;
}
// The HSMT's compression ratio for the hints: `compr` the one figure all its lines give (null when none or two), and
// `comprExact` when every such line gives it bare (kind "exact"): the ratio is then the one asked, not a least or a most.
export function comprOf(t) {
  const list = comprLines(t), xs = [...new Set(list.map((c) => c.x))];
  const compr = xs.length === 1 ? xs[0] : null;
  return { compr, comprExact: compr != null && list.every((c) => c.kind === "exact") };
}
export function engineMins(t) {
  const { disp, dmax, cyl, cylBare } = engineLists(t), one = (list) => (new Set(list).size === 1 ? list[0] : null);
  // cylExact (Khoa, 2026-11-17: "nếu HSMT ghi rõ 6 thì nên loại 12"): every line that gives the cylinders gives the bare
  // count ("6 xy lanh, bố trí thẳng hàng"), none a least ("≥ 6", "tối thiểu 06 xi lanh", "6 trở lên") or a most: the count
  // is then the one asked, not a minimum, and candidates() leaves out an engine of another count.
  return { minDisp: one(disp), maxDisp: one(dmax), minCyl: one(cyl), cylExact: one(cyl) != null && cylBare.length === cyl.length, ...powerMins(t) };
}
// Every figure of the minimums of the engine the text gives (engineMins takes the one value of each).
export function engineLists(t) {
  // A table laid out in columns puts 40+ spaces between the label and its figure ("Số xilanh      ...      04"): one space.
  t = withoutOtherEquipment(unflatten(t));
  const disp = [], dmax = [], cyl = [], cylBare = [], lines = t.split("\n").map((l) => l.replace(/[ \t ]{2,}/g, " "));
  lines.forEach((line, i) => {
    // A table cell often puts the label on one line and the figure on the next ("Dung tích xi lanh" / "11.051 L").
    // Only a figure with its sign or unit: a number alone is often the row number of the next item ("Số xy lanh: Nêu rõ" / "7").
    // Not a line that has its own label of the count ("8 Số xilanh ≥ 4", IB2200029877: joined to the row above "7 Tỉ số nén ≤ 19"
    // it was taken for a most and left out; hints-audit 2026-11-17).
    const prev = lines[i - 1] || "", alone = !/[a-zà-ỹ]{3}/i.test(line.replace(/l[íi]t|xi|xy|lanh|mm|cc/gi, "")) && /[≥>]|l[íi]t|\bL\b|lanh/i.test(line) && !CYL_LABEL.test(line);
    // "Tổng dung tích" / "8 ≥ 0.79 lít" / "xilanh": the label goes on to the line after the figure.
    const cell = alone ? prev + " " + line + (/^\s*(?:xi|xy)[\s-]?lanh\b/i.test(lines[i + 1] || "") ? " " + lines[i + 1] : "") : line;
    // A largest displacement ("Dung tích xi lanh ≤ 15,2 L", an HSMT written around one engine): 2026-11-03, the best
    // candidates were 19.6 L engines that the agent then marked not met.
    if (MAXIMUM.test(cell)) {
      const m = (DISP_LABEL.test(cell) || (DISP_BARE.test(cell) && ENGINE_LINES.test(lines.slice(Math.max(0, i - 3), i + 4).join(" ")))) && !tankNear(cell) && cell.match(/(?:≤|<=|<(?!=)|tối đa|không (?:lớn|vượt|quá)(?: hơn)?|(?<!không\s)(?:nhỏ hơn|dưới))\s*:?\s*(\d{1,3}(?:[.,]\d{1,3})?)\s*(?:l[íi]t|L)\b(?![/a-z])/i);
      if (m) dmax.push(withTol(Number(m[1].replace(",", ".")), tolAt(cell, m.index + m[0].length), 1));
      // "tối đa" of another figure in the same cell ("dung tích > 1,950 lít; công suất tối đa ≥ 28.6 HP", IB2300046353; "tối đa ≥ 12 KW …;
      // ≥ 3 xilanh", IB2500403535): a least written with its sign next to its own label still counts.
      const near = lines.slice(Math.max(0, i - 3), i + 4).join(" ");
      // A bare "dung tích" only in a cell about the engine that names no vessel ("phun nhiên liệu trực tiếp; dung tích > 1,950 lít" is the
      // engine's; "… vỏ cách âm, có khóa; dung tích ≥ 65 lít" of a fuel tank is not).
      const isDisp = DISP_LABEL.test(cell) ? !tankNear(cell) : DISP_BARE.test(cell) && ENGINE_LINES.test(near) && /đ[ộo]ng\s*c[ơo]|(?:xi|xy)[\s-]?lanh/i.test(cell) && !/th[ùu]ng|b[ồo]n\b|b[ìi]nh\b|k[ée]t\b|\btank\b/i.test(cell);
      const least = isDisp && cell.match(/dung\s*t[íi]ch(?:\s*(?:xi|xy)[\s-]?lanh)?\s*:?\s*(?:≥|>=|>)\s*(\d{1,2}(?:[.,]\d{1,3})?)\s*(?:l[íi]t|L)\b(?![/a-z])/i);
      if (least) disp.push(withTol(Number(least[1].replace(",", ".")), tolAt(cell, least.index + least[0].length), -1));
      // A bare count is a least too when the "most" of the cell is another figure's ("công suất tối đa ≥ 28.6 HP; 1.500 vòng/ phút; 4 xilanh
      // thẳng hàng", IB2300046353; "6 xy lanh xếp thẳng; đường kính xy lanh ≤ 112", IB2400375383). Not when it is the count's ("≤ 3 xi lanh").
      const cylInline = inlineCyl(line), cylOwnMost = cylInline && /(?:≤|<=|<|tối đa|không (?:lớn|vượt|quá)(?: hơn)?|nhỏ hơn|dưới)\s*:?\s*$/i.test(line.slice(0, cylInline.index));
      const cylLeast = cell.match(/(?:≥|>=)\s*:?\s*0?(\d{1,2})\s*(?:xi|xy)[\s-]?lanh/i) || (cylOwnMost ? null : cylInline);
      if (cylLeast && Number(cylLeast[1]) >= 1 && Number(cylLeast[1]) <= 20) cyl.push(Number(cylLeast[1]));
      return;
    }
    // A bare figure is the least the HSMT accepts (Khoa, 2026-11-03), for the engine's displacement and cylinders.
    const near4 = lines.slice(Math.max(0, i - 3), i + 4).join(" "), bare = !DISP_LABEL.test(cell) && DISP_BARE.test(cell) && ENGINE_LINES.test(near4);
    const dl = (DISP_LABEL.test(cell) || bare) && !tankNear(cell) && (AT_LEAST.test(cell) || /dung t[íi]ch\s*(xi|xy)\s?lanh|displacement/i.test(cell));
    const d = dl && cell.match(/(?<![\d.,])(\d{1,2}(?:[.,]\d{1,3})?)\s*(?:l[íi]t|L)\b(?![/a-z])/i);
    // The unit in the label ("Dung tích xy lanh (L) ≥ 4.45") or in cc ("≥ 2.197 cc", "4087 cm3"): 2026-11-04 regression.
    const du = !d && dl && (cell.match(/\((?:l[íi]t|L)\)[^\d\n<≤]{0,20}?(?:≥|>=|>|tối thiểu|:)?\s*(\d{1,2}(?:[.,]\d{1,3})?)(?![\d.,]*\s*(?:mm|cc|cm|kg|%))/i)
      || cell.match(/(?<![\d.,])(\d{1,2}[.,]?\d{3}|\d{3})\s*(?:cc|cm3|cm³)(?![a-z\d])/i)
      // No unit at all ("Dung tích xilanh ≥ 2.5 Đạt Không đạt"): litres, for the cylinders' displacement.
      // Not a cell that also gives the cylinders ("Số xi lanh, dung tích ≥ 3 xi lanh").
      || (/dung t[íi]ch\s*(?:xi|xy)\s?lanh|displacement/i.test(cell) && !/s[ốo]\s*(?:xi|xy)\s?lanh|\d\s*(?:xi|xy)\s?lanh/i.test(cell)
        && cell.match(/dung t[íi]ch[^\d\n]{0,40}?(?:≥|>=|tối thiểu)\s*:?\s*(\d{1,2}(?:[.,]\d{1,3})?)(?![\d.,]|\s*(?:mm|cc|cm|kg|%|kw|kva|l\b|lít|lit|v\b|vòng|rpm|:))/i)));
    // "12,9 L (± 3%)" / "≥ 1,3 (lít) ± 5%": the HSMT accepts a figure that much below the one it gives (2026-11-12 soát ngưỡng:
    // IB2300087393's 12,9 L (± 3%) left out the 12,78 L engines). A plus-or-minus after the figure lowers the minimum by it.
    const tolOf = (m) => { const t = cell.slice(m.index + m[0].length, m.index + m[0].length + 24).match(/^[^\d±+]{0,12}(?:±|\+\s?\/\s?-|\+-)\s*(\d{1,2}(?:[.,]\d+)?)\s*%/); return t ? Number(t[1].replace(",", ".")) / 100 : 0; };
    const lowered = (v, m) => (tolOf(m) ? Math.round(v * (1 - tolOf(m)) * 1000) / 1000 : withTol(v, tolAt(cell, m.index + m[0].length), -1));
    if (d) disp.push(lowered(Number(d[1].replace(",", ".")), d));
    else if (du) disp.push(lowered(/cc|cm/i.test(du[0]) ? Number(du[1].replace(/[.,]/, "")) / 1000 : Number(du[1].replace(",", ".")), du));
    // Not a figure with a decimal part: "Số xilanh, đường kính x hành trình mm: 2.197" (IB2200029975, a table whose values
    // sit one row off) is the displacement, not 2 cylinders (hints-audit 2026-11-17).
    // hints-audit 2026-11-17 (184 gói Phân tích có số xi lanh mà code không đọc): the label "Số xy-lanh", "Số lượng xi lanh",
    // "Số cylinder", "Number of cylinder"; the figure "6L" / "4/L"; the label on the line above "≥ 3 thẳng hàng" (a table cell
    // "Số xy lanh, kiểu bố trí" | "≥ 3 thẳng hàng"); "Động cơ 4 thì, 6 xy lanh, thẳng hàng" inside a line.
    const c = cell.match(/(?:≥|>=|tối thiểu|ít nhất)\s*:?\s*0?(\d{1,2})\s*(?:xi|xy)[\s-]?lanh/i)
      // Not a row number before the sign ("Số lượng xi lanh của" / "2 ≥ 16 (*)", IB2300015080: the 16 is read below).
      // Not the number of strokes ("Số xy lanh: Động cơ Diesel 4 kỳ, 6 xy lanh", IB2600217137: the 4 of "4 kỳ" read as 4
      // cylinders, cyl-ky 20/11/2026): NOT_STROKE.
      || cell.match(new RegExp(CYL_LABEL.source + String.raw`[^\d\n]{0,30}?(?<![\d.,])0?(\d{1,2})(?![.,]?\d)(?!\s*(?:≥|>|≤|<|tối))` + NOT_STROKE + String.raw`\s*(?:(?:xi|xy)[\s-]?(?:lanh)?|\/?\s*[LV]\b|\b)`, "i"))
      || line.match(/^\s*[-+•]?\s*0?(\d{1,2})\s*(?:xi|xy)[\s-]?lanh/i)
      // The label alone on the line above, then a least and nothing but words of the layout or of the grading (no other figure).
      || (CYL_LABEL.test(prev) && !new RegExp(CYL_LABEL.source + String.raw`[^\n]*\d`, "i").test(prev) && line.match(new RegExp(String.raw`^\s*(?:\d{1,2}(?:\.\d{1,2})*\.?\s+)?(?:≥|>=|>|tối thiểu)\s*0?(\d{1,2})(?![\d.,])` + NOT_STROKE + String.raw`[^\d]*$`, "i")))
      || inlineCyl(line);
    if (c && Number(c[1]) >= 1 && Number(c[1]) <= 20) {
      cyl.push(Number(c[1]));
      // The bare count: no sign or word of a least or a most in the cell (cylExact, engineMins).
      // ">3" ("Số xilanh >3", IB2400063033) is a least too, not the exact count: AT_LEAST has no ">" (the displacement
      // rows lean on that), so only here.
      // An OCR slip of "tối thiểu" ("tối thiều 2 xi lanh") is a least too.
      // Nor the engine of goods "for reference" ("Loại động cơ: 4 thì 2 xi lanh" then "* Hàng hóa tương tự để nhà thầu tham
      // khảo", IB2400474549): a least, not the count that rules other engines out.
      // "Không ít hơn 1 xilanh", "không dưới 4 xi lanh" (IB2300305914) are a least too.
      if (!AT_LEAST.test(cell) && !MAXIMUM.test(cell) && !/t[ốo]i\s*thi[ểềeế]u/i.test(cell) && !/kh[ôo]ng\s+(?:[íi]t\s+h[ơo]n|d[ưu][ớo]i)/i.test(cell) &&!/tham\s*kh[ảa]o|t[ươ]+ng\s*t[ựu]/i.test(`${prev} ${cell} ${lines[i + 1] || ""}`) && !/(?<![-=])>\s*0?\d/.test(cell.slice(0, c.index + c[0].length))) cylBare.push(Number(c[1]));
    }
  });
  return { disp, dmax, cyl, cylBare };
}
// ---------- Ngưỡng của HSMT theo từng cỡ máy (Khoa, 2026-11-12) ----------
// A tender of several sizes has the minimums of each genset in the text of that genset (IB2600594596: "≥ 8 xy lanh,
// ≥ 14,5 L" under 400 kVA and "≥ 6 xy lanh, ≥ 9 L" under 300 kVA); read over the whole text they are two values and none
// is given. The run of one size reads the text of its own block. A block starts at a statement of the genset's power
// (prime or standby, "≥ N kVA", the label nearest to the figure; in any section: a heading we do not know would leave
// the engine's or the alternator's section on and let the text of the next size run on into this block) that belongs to a size, and
// lasts up to the statement of another size. A statement belongs to a size when its prime is within NEAR_LOW (0.5%) of it,
// or its standby is from 100% (less the rounding) to 120% of it; one that fits two sizes or none belongs to no size (and
// opens a block of no size). Never a minimum of another size is used:
//  1. the block of the size gives the figure (one value) → it;
//  2. the blocks of the size give none, and no block of another size gives it, and the text outside the blocks does →
//     that (the HSMT's common minimum, as before);
//  3. otherwise none (null: no filter), also when the blocks of the size disagree.
const CAP_PRIME_W = /prime|li[êe]n t[ụu]c|continuous|c[ơo] b[ảa]n|th[ưư][ờo]ng xuy[êe]n/gi, CAP_STANDBY_W = /standby|d[ựu] ph[òo]ng|emergency|kh[ẩa]n c[ấa]p/gi;
const CAP_NUM = String.raw`(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b`;
// 2026-11-12 (soát ngưỡng, nhóm "ngưỡng của cỡ khác"): the statements of 4 tenders were missed and their minimums went to
// every size: "> 42,0 kVA" (">" as the sign), "Công suất liên tục: 15kVA/ 12kW" and "Công suất liên tục (Min) 40 kVA"
// (the label and the figure, no sign), and a size named only in its heading ("1.3.2. Điều chuyển Máy phát điện 22kVA",
// "Máy phát điện 10,5kVA"). A heading is a short line that starts (after its number) with "máy phát" and names one size.
const CAP_SIGNED = new RegExp(String.raw`(?:≥|>=|>|tối thiểu|không (?:nhỏ|thấp) hơn)\s*:?\s*` + CAP_NUM, "gi");
const CAP_LABELED = new RegExp(String.raw`(c[ôo]ng su[ấa]t\s+(?:li[êe]n t[ụu]c|c[ơo] b[ảa]n|d[ựu] ph[òo]ng)|prime(?:\s+power)?|standby(?:\s+power)?|continuous(?:\s+power)?)([^\n\d≥≤<>=]{0,30}?)` + CAP_NUM, "gi");
// Its first word is capitalised ("Máy phát", "Tổ máy", "Điều chuyển Máy"): "6 máy phát điện 12,5KVA" is a count in a list.
const CAP_HEAD = /^\s*(?:(?:\d{1,2}(?:\.\d{1,2})*\.?|[IVX]{1,4}\.?|[a-hA-H][.)])\s*)?[-–:|*•+]?\s*((?:[^\d\n]{0,25}?\s)?(?:t[ổo]\s+)?m[áa]y\s+ph[áa]t\b)/i;
const isHead = (line) => { const m = line.match(CAP_HEAD); return !!m && /^[^\p{L}\d]*\p{Lu}/u.test(m[1]); };
const LINE_SIZE = new RegExp(String.raw`^\s*(?:(?:ph[ầa]n|m[ụu]c|h[ạa]ng\s+m[ụu]c)\s+[\dIVXA-Z]{1,4}\s*[-–:.]\s*)?(?:t[ổo]\s+)?m[áa]y(?:\s+ph[áa]t(?:\s+đi[ệe]n)?)?(?:\s+(?:diesel|x[ăa]ng|d[ầa]u))?(?:\s+\d\s*pha)?\s+(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)(?:\s*\/\s*\d[\d.,]*)?\s*(kVA|kW)\b[^:\n]{0,24}?(?:\s-\s|:)`, "i");
export function sizeBlocks(t, sizes) {
  const text = withoutOtherEquipment(unflatten(t)), L = text.split("\n"), ments = [], kwSizes = sizes.some((s) => s.cap?.unit === "kW");
  const engineBefore = (at) => ENGINE_W.test(text.slice(Math.max(0, at - 300), at).split("\n").slice(-2).join(" "));
  let off = 0;
  for (let i = 0; i < L.length; off += L[i].length + 1, i++) {
    // "12,5 ±0,5 KVA" is 12,5 kVA (IB2600477305): the tolerance is blanked, the same length (positions stay).
    const line = text.slice(off, off + L[i].length).replace(/(\d)(\s*±\s*\d{1,3}(?:[.,]\d+)?\s*)(?=(?:kVA|kW)\b)/gi, (all, d, tol) => d + " ".repeat(tol.length)), seen = new Set();
    // The figure is on this line; its label may be on the lines around it.
    for (const m of line.matchAll(CAP_SIGNED)) {
      if (m[2].toLowerCase() === "kw" && !kwSizes) continue;
      const at = off + m.index, around = text.slice(Math.max(0, at - 160), at + 160), pos = Math.min(at, 160);
      const p = nearest(around, pos, CAP_PRIME_W), sb = nearest(around, pos, CAP_STANDBY_W);
      if (engineBefore(at)) continue;
      const kind = p < sb && p <= 120 ? "prime" : sb < p && sb <= 120 ? "standby" : null;
      if (kind) { ments.push({ line: i, kind, kva: numOf(m[1]), unit: m[2].toLowerCase() }); seen.add(m.index + m[0].length); }
    }
    // The label then its figure without a sign; the label says which.
    for (const m of line.matchAll(CAP_LABELED)) {
      if (seen.has(m.index + m[0].length) || (m[4].toLowerCase() === "kw" && !kwSizes)) continue;
      if (ENGINE_W.test(m[2]) || /tối đa|max/i.test(m[2]) || engineBefore(off + m.index + m[1].length)) continue;
      ments.push({ line: i, kind: /d[ựu] ph[òo]ng|standby/i.test(m[1]) ? "standby" : "prime", kva: numOf(m[3]), unit: m[4].toLowerCase() });
    }
    // The heading of one genset: the size it names (one size, else none: "MAYPHATDIEN 30, 42kVA" names two).
    // A list of sizes ("30, 42kVA", "12 và 40 kVA") is no genset's heading.
    if (line.length <= 120 && isHead(line) &&!/\d\s*(?:,\s+|\s+và\s+|\s*[&;]\s*)\d[\d.,]*\s*(?:kVA|kW)\b/i.test(line)) {
      const figs = [...line.matchAll(new RegExp(CAP_NUM, "gi"))].filter((m) => m[2].toLowerCase() === "kva" || kwSizes);
      if (figs.length) ments.push({ line: i, kind: "head", figs: figs.map((m) => ({ kva: numOf(m[1]), unit: m[2].toLowerCase() })) });
    }
  }
  const fits = (m, s) => { const v = m.unit === "kw" ? s.kva * 0.8 : s.kva; return m.kind === "standby" ? m.kva >= v * NEAR_LOW && m.kva <= v * NEAR_HIGH + 1e-9 : m.kva >= v * NEAR_LOW && m.kva <= v / NEAR_LOW; };
  const belongs = (m) => {
    // A statement in kW is read only when a size of the tender is in kW (IB2300363623: 15 kVA and 5 kW), at 0.8 (5 kW = 6.25 kVA): in
// a tender in kVA the kW statements (the alternator's, the shaft's) opened blocks of no size inside the block of a size.
    // A heading's figures (its kVA and kW, "40 kVA / 32 kW", its prime and standby "30kVA/33kVA") all name the same size: else it
    // is of no size.
    const hit = m.kind === "head" ? [...new Set(m.figs.flatMap((f) => sizes.map((s, j) => (fits({ ...f, kind: "prime" }, s) ? j : -1)).filter((j) => j >= 0)))].map((j) => [sizes[j], j])
      : sizes.map((s, j) => [s, j]).filter(([s]) => fits(m, s));
    if (m.kind === "head" && hit.length === 1 && m.figs.some((f) => !fits({ ...f, kind: "prime" }, hit[0][0]) && !fits({ ...f, kind: "standby" }, hit[0][0]))) return -1;
    return hit.length === 1 ? hit[0][1] : -1;
  };
  const runs = [];
  for (const m of ments) {
    const size = belongs(m), r = runs.at(-1);
    if (r && r.size === size && size >= 0) r.end = m.line; else runs.push({ size, start: m.line, end: m.line });
  }
  runs.forEach((r, i) => (r.to = i + 1 < runs.length ? runs[i + 1].start : L.length));
  // A line that opens with the genset it is about ("Máy 12 kVA/1 pha: Động cơ - xi lanh: …", "Phần 1 - Máy 500 kVA: …", "Mục 2 - Máy
  // 11 kVA/11 kW: …") belongs to that size wherever it stands: tables sorted by item put the lines of one size inside the block of
  // another (IB2400114476: "≤ 1,826 lít" of 12 kVA read for 45 kVA). The size its figure is the prime of, else the standby of; one
  // size only, else -1 (the line stays with its block).
  // -2: a line about every size ("Cả 3 loại máy: Động cơ - số xilanh: ≥ 3", IB2300134577), the tender's common text wherever it stands.
  const tags = L.map((l) => {
    if (/^\s*c[ảa]\s+(?:\d+|hai|ba|b[ốo]n)\s+(?:lo[ạa]i\s+)?m[áa]y\b/i.test(l)) return -2;
    const m = l.match(LINE_SIZE);
    if (!m || (m[2].toLowerCase() === "kw" && !kwSizes)) return -1;
    const f = { kva: numOf(m[1]), unit: m[2].toLowerCase() }, hit = (kind) => sizes.flatMap((s, j) => (fits({ ...f, kind }, s) ? [j] : []));
    const p = hit("prime"), list = p.length ? p : hit("standby");
    return list.length === 1 ? list[0] : -1;
  });
  return { L, runs, tags };
}
const MIN_KEYS = ["minDisp", "maxDisp", "minCyl", "minPrime", "maxFuel", "maxFuel75", "maxFuel50"];
// What a text gives: for each key whether it names the figure at all and the one value (null when it differs).
function minsRead(t) {
  const e = engineLists(t), p = powerRead(t), has = {
    minDisp: e.disp.length > 0, maxDisp: e.dmax.length > 0, minCyl: e.cyl.length > 0, minPrime: p.prime.length > 0,
    maxFuel: p.fuel.some((x) => x.load === 100 || x.load == null), maxFuel75: p.fuel.some((x) => x.load === 75), maxFuel50: p.fuel.some((x) => x.load === 50) };
  const one = (list) => (new Set(list).size === 1 ? list[0] : null), m = { ...p.mins, minDisp: one(e.disp), maxDisp: one(e.dmax), minCyl: one(e.cyl) };
  return Object.fromEntries(MIN_KEYS.map((k) => [k, { has: has[k], v: m[k] }]));
}
// The minimums of the run of `size` among `sizes` (sizesOf) in the HSMT text `t`; `extra` (the requests added on the web)
// is outside every block. `how` says per key where the figure came from: own, common, none (and why).
export function minsForSize(t, size, sizes, extra = "") {
  const { L, runs, tags } = sizeBlocks(t, sizes), j = sizes.findIndex((s) => s === size || (s.cap?.unit === size.cap?.unit && s.cap?.value === size.cap?.value));
  const join = (pick) => L.filter((_, i) => pick(runs.findIndex((r) => i >= r.start && i < r.to), i)).join("\n");
  // A line that names its genset goes with that size (sizeBlocks `tags`), whatever block it stands in.
  const own = join((r, i) => tags[i] !== -2 && (tags[i] >= 0 ? tags[i] === j : r >= 0 && runs[r].size === j)), foreign = join((r, i) => tags[i] !== -2 && (tags[i] >= 0 ? tags[i] !== j : r >= 0 && runs[r].size !== j)), pre = join((r, i) => tags[i] === -2 || (tags[i] === -1 && r < 0)) + (extra ? `\n${extra}` : "");
  const a = minsRead(own), b = minsRead(foreign), c = minsRead(pre), mins = {}, how = {};
  // The engine minimums a tender repeats in the section of each size ("A / B / C Yêu cầu kỹ thuật đối với máy 8.5 / 10 / 12 kVA",
  // each with "Dung tích xilanh ≥ 2.3 lít", "Số xilanh ≥ 4"): a block whose statement of power the code did not take (the alternator's
  // "≥ 12 KVA" opened a block of no size, 2026-11-12: IB2300245556, IB2300245748, IB2400125924) leaves the text of that size in the block
  // before. The size's own blocks give none; when at least two of the other blocks give the one same value and they are at least
  // half of the other blocks, it is the tender's common one ("agreed"). Not for a prime or a fuel limit (a figure of each size).
  // The blocks of one size count once (a figure shown twice for one machine is one statement, not an agreement).
  // Each block without the lines that name another genset; the lines that name a size outside its blocks count for that size.
  const inRun = (r, i) => i >= r.start && i < r.to;
  const moved = sizes.map((_, k) => (k === j ? "" : L.filter((_l, i) => tags[i] === k && !runs.some((r) => r.size === k && inRun(r, i))).join("\n")));
  const others = [...runs.map((r, i) => ({ id: r.size >= 0 ? `s${r.size}` : `b${i}`, r })).filter(({ r }) => r.size !== j).map(({ id, r }) => ({ id, m: minsRead(L.filter((_l, i) => inRun(r, i) && (tags[i] === -1 || tags[i] === r.size)).join("\n")) })),
    ...moved.flatMap((txt, k) => (txt ? [{ id: `s${k}`, m: minsRead(txt) }] : []))];
  // Not for a size with lines that name it ("Máy 200 kVA - Đầu phát: …", IB2400495696): its text was found and leaves the figure out,
  // so the others' figure is theirs.
  const ownNamed = tags.includes(j);
  const agreed = (k) => {
    if (ownNamed) return null;
    const got = others.filter((o) => o.m[k].has), ids = (list) => new Set(list.map((o) => o.id)).size;
    return ids(got) >= 2 && ids(got) * 2 >= ids(others) && got.every((o) => o.m[k].v != null && o.m[k].v === got[0].m[k].v) ? got[0].m[k].v : null;
  };
  // The text outside the blocks is common to every size only when the block of every size was found; else it may hold the
  // text of a size whose block was not found (2026-11-12: with no block at all, the one minimum of a tender of two sizes,
  // stated under one of them, went to both). Then it is not used to rule a row out (the prime: below, it must be the size).
  const allFound = sizes.every((_, k) => runs.some((r) => r.size === k));
  for (const k of MIN_KEYS) {
    if (a[k].has) { mins[k] = a[k].v; how[k] = a[k].v == null ? "own: disagree" : "own"; }
    else if (["minDisp", "maxDisp", "minCyl"].includes(k) && agreed(k) != null) { mins[k] = agreed(k); how[k] = "agreed"; }
    else if (!b[k].has && c[k].has && (allFound || k === "minPrime")) { mins[k] = c[k].v; how[k] = "common"; }
    else { mins[k] = null; how[k] = b[k].has ? "of another size" : c[k].has ? "size unknown" : "none"; }
  }
  // Figures of the prime that disagree only because the alternator's is read too ("Công suất liên tục ≥ 12.5 ±0.5 kVA", "Đầu phát: công
  // suất liên tục ≥ 15 KVA", IB2300245748): the one that is this size is the genset's. One machine whose prime and standby were
  // taken for two sizes ("Tổ máy 450 kVA: Công suất dự phòng tối thiểu 450 kVA", "Công suất liên tục tối thiểu 400 kVA", IB2400377239):
  // the prime stated beside the standby that is the other size is the prime of this size.
  if (!mins.minPrime && size.cap) {
    const isSize = (p) => { const v = size.cap.unit === "kW" ? p.kW ?? (p.kVA != null ? p.kVA * 0.8 : null) : p.kVA ?? (p.kW != null ? p.kW / 0.8 : null); return v != null && Math.abs(v / size.cap.value - 1) <= 0.006; };
    const standbyOfOther = sizes.some((s, k) => k !== j && s.cap && L.some((l, i) => { if (tags[i] !== k) return false; const m = l.match(/(?:d[ựu]\s*ph[òo]ng|standby)[^\d\n]{0,40}?(\d[\d.,]*)\s*(kVA|kW)\b/i); return !!m && m[2].toLowerCase() === s.cap.unit.toLowerCase() && Math.abs(numOf(m[1]) / s.cap.value - 1) <= 0.006; }));
    const hit = how.minPrime === "own: disagree" ? powerRead(own).prime.find(isSize) : how.minPrime === "of another size" && standbyOfOther ? powerRead(foreign).prime.find(isSize) : null;
    if (hit) { mins.minPrime = { ...hit }; how.minPrime = how.minPrime === "own: disagree" ? "own: the size" : "one machine"; }
  }
  // The prime a size asks for is the size itself: a block whose text gives another (the prime of the next genset read in
  // it, 20 kVA's block giving 30) is a misreading, not a minimum.
  if (mins.minPrime && size.cap) {
    const mp = mins.minPrime, v = size.cap.unit === "kW" ? mp.kW ?? (mp.kVA != null ? mp.kVA * 0.8 : null) : mp.kVA ?? (mp.kW != null ? mp.kW / 0.8 : null);
    // The size less the tolerance the HSMT writes after it ("≥ 8.5 KVA ± 0.5" for 8.5 kVA reads 8) is still the size.
    const tolerated = v != null && [...own.matchAll(TOL_AFTER)].some((x) => Math.abs(numOf(x[1]) / size.cap.value - 1) <= 0.006 && Math.abs(lowOf(x[1], x[3], !!x[4]) - v) < 0.001);
    if (!tolerated && (v == null || Math.abs(v / size.cap.value - 1) > 0.006)) { mins.minPrime = null; how.minPrime = "not the size"; }
  }
  // A short note (≤ 300 characters) for the agent: the minimums the HSMT gives that the code could not place in this size.
  const LABEL = { minDisp: "dung tích xi lanh tối thiểu", maxDisp: "dung tích xi lanh tối đa", minCyl: "số xi lanh", minPrime: "công suất liên tục", maxFuel: "tiêu hao nhiên liệu", maxFuel75: "tiêu hao 75% tải", maxFuel50: "tiêu hao 50% tải" };
  const unsure = MIN_KEYS.filter((k) => how[k] === "size unknown" || how[k] === "own: disagree").map((k) => LABEL[k]);
  const note = unsure.length ? `Gói nhiều cỡ: code không xác định được ngưỡng ${[...new Set(unsure)].join(", ")} của HSMT thuộc máy ${size.label || `${size.cap?.value} ${size.cap?.unit}`} nên không dùng để loại dòng; tự đối chiếu với phần HSMT của máy này.`.slice(0, 300) : null;
  return { mins, how, note, blocks: runs.map((r) => ({ size: r.size, from: r.start + 1, to: r.to })) };
}
// "Công suất liên tục (Prime) ≥ 400 kVA / 320 kW" and "Tiêu hao nhiên liệu ≤ 90 Lít/giờ": a table cell of the HSMT
// often puts the words on the lines around the figure, so each figure goes to the nearest word naming prime or standby
// (fuel). The engine's own output ("Công suất liên tục của động cơ ≥ 15,5 kW") is shaft power, not the genset's: left
// out, and so is a maximum ("Công suất tối đa ≥ 17 kW" under it). Figures within 15% of each other (genset 11.5 kVA,
// alternator 12 kVA) give the lowest; farther apart (a tender of several sizes) give none. kW alone when the HSMT gives the
// genset in kVA is an engine section whose heading is lines above ("Loại động cơ ... Công suất liên tục ≥ 15,5 kW"): none.
// A kW figure well below the kVA one (12.5 kVA and 5 kW) is a second, smaller genset: none.
const PRIME_W = /prime|li[êe]n t[ụu]c|continuous|c[ơo] b[ảa]n|th[ưư][ờo]ng xuy[êe]n/gi, STANDBY_W = /standby|d[ựu] ph[òo]ng|emergency|kh[ẩa]n c[ấa]p/gi;
const ENGINE_W = /đ[ộo]ng c[ơo]|engine|t[ốo]i [đd]a|max/i, KVA_FIG = /c[ôo]ng su[ấa]t[^\n]{0,60}\n?\s*(?:≥|>=)?\s*\d[\d.,]*\s*kVA/i;
const nearest = (t, i, re) => { let best = Infinity; for (const m of t.matchAll(re)) best = Math.min(best, Math.abs(m.index - i)); return best; };
export const powerMins = (t) => powerRead(t).mins;
// The fuel limits of an HSMT in L/h (hints-audit 2026-11-17: 480 rows of the analyses the code did not read). Three forms:
//  1. a most and the figure, then the unit: "≤ 104 lít/giờ", "< 26.5 lít/h" ("<" too: a most), "≤ 105 (l/h)", "≤ 503,2 L/hr";
//  2. the unit, then a most and the figure: "Tiêu hao nhiên liệu ở L/h ≤ 135", "(lít/giờ) ≤ 320", "(L/h): ≤ 4,5"; with no sign
//     only when the fuel label is on the same line ("Tiêu thụ nhiên liệu tại 75% tải (L/h): 3.9");
//  3. a figure with no sign and its unit after the label on the same line ("Tiêu hao nhiên liệu (100% CS): 17.7 L/h", the
//     figure of the HSMT is its most), or in a list of loads under the label ("Tiêu hao nhiên liệu:" / "+ 75% tải: 47 l/h").
// Not a figure with a tolerance ("≤ 21±2 lít/giờ", "≤19,4 lít/h ±5%": the HSMT allows more), nor an approximate one
// ("khoảng 13 đến 15 L/h", "~ 42.1", "≈"), nor a least ("≥ 135 L/giờ" is a slip of the HSMT: none).
const FUEL_LABEL = /ti[êe]u\s*hao|ti[êe]u\s*th[ụu]|nhi[êe]n\s*li[ệe]u|fuel/i;
const FUEL_NUM = String.raw`(\d{1,3}(?:[.,]\d{3})+(?![.,]?\d)|\d{1,3}(?:[.,]\d+)?)`;
const FUEL_UNIT = String.raw`(?:\(\s*)?(?:l[íi]t\s*\/\s*(?:gi[ờo]|hr?\b)|l\s*\/\s*(?:hr?\b|gi[ờo])|lph\b)`;
const FUEL_MOST = String.raw`(?:≤|<=|=<|<(?![=-])|tối đa|không (?:lớn|vượt|quá)(?: hơn)?)`;
function fuelFigures(text) {
  const out = new Map(), lineOf = (i) => { const s = text.lastIndexOf("\n", i - 1) + 1, e = text.indexOf("\n", i); return { s, line: text.slice(s, e < 0 ? text.length : e) }; };
  const tolAfter = (i) => /^\s*\)?\s*(?:\(?\s*)?(?:±|\+\s?\/\s?-|\+-)/.test(text.slice(i, i + 12));
  const add = (figAt, index, s, num) => { if (!out.has(figAt)) out.set(figAt, Object.assign([s, num], { index })); };
  for (const m of text.matchAll(new RegExp(FUEL_MOST + String.raw`\s*:?\s*` + FUEL_NUM + String.raw`\s*` + FUEL_UNIT, "gi"))) {
    if (tolAfter(m.index + m[0].length)) continue;
    add(m.index + m[0].search(/\d/), m.index, m[0], m[1]);
  }
  // On one line: "≤34.5 lít/h" then a row number "15" alone on the next line is no limit (IB2600313010).
  for (const m of text.matchAll(new RegExp(FUEL_UNIT + String.raw`[ \t]*\)?[ \t]*:?[ \t]*(` + FUEL_MOST + String.raw`)?[ \t]*` + FUEL_NUM + String.raw`(?![\d.,]|[ \t]*(?:%|±|\+|kw|kva|v\b|hz|l\b|l[íi]t|lit|giờ|h\b|x\b|mm|kg|db|a\b|vòng|rpm|~|-\s*\d))`, "gi"))) {
    const at = m.index + m[0].length - m[2].length, { s, line } = lineOf(m.index);
    if (!m[1] && !FUEL_LABEL.test(line.slice(0, m.index - s))) continue;
    add(at, at, m[2], m[2]);
  }
  for (const m of text.matchAll(new RegExp(String.raw`(?<![\d.,])` + FUEL_NUM + String.raw`\s*` + FUEL_UNIT, "gi"))) {
    const { s, line } = lineOf(m.index), own = line.slice(0, m.index - s);
    // Not a worked example of the HSMT ("Ví dụ: máy A tuyên bố tiêu thụ nhiên liệu ở 75% ... là 3,7 l/h", IB2400062449).
    if (tolAfter(m.index + m[0].length) || /(?:kho[ảa]ng|~|≈|±|≥|>|=|≤|<|đ[ếe]n|t[ừu]|[-–]|\d[.,]?)\s*$/i.test(own) || /v[íi]\s*d[ụu]|example|tuy[êe]n\s*b[ốo]/i.test(line)) continue;
    const listed = /^\s*[-+*•]?\s*(?:(?:t[ạa]i|[ởo]|m[ứu]c)\s+)?@?\s*\d{2,3}\s*%\s*(?:t[ảa]i|c[ôo]ng su[ấa]t)?[^\d]{0,30}$/i.test(own)
      && FUEL_LABEL.test(text.slice(Math.max(0, s - 300), s).split("\n").slice(-3).join(" "));
    if (!FUEL_LABEL.test(own) && !listed) continue;
    add(m.index, m.index, m[0], m[1]);
  }
  return [...out.values()].sort((a, b) => a.index - b.index);
}
// The prime figures and the fuel limits the text gives, and the minimums taken from them.
export function powerRead(t) {
  // The fuel limits are read in the text as written (`ft`): `lowest` turns "≤ 21±2 lít/giờ" into 19, a most stricter than the
  // HSMT's (it allows 23); fuelFigures leaves a figure with a tolerance out (hints-audit 2026-11-17, IB2400493077).
  const ft = withoutOtherEquipment(unflatten(t)), text = lowest(ft), prime = [], fuel = [], secAt = sectionsOf(text);
  const pair = (a, ua, b, ub, at) => { const v = { [ua.toLowerCase() === "kva" ? "kVA" : "kW"]: numOf(a) }; Object.defineProperty(v, "sec", { value: secAt(at) }); if (b && ub.toLowerCase() !== ua.toLowerCase()) v[ub.toLowerCase() === "kva" ? "kVA" : "kW"] = numOf(b); return v; };
  for (const m of text.matchAll(/(?:≥|>=|tối thiểu|không (?:nhỏ|thấp) hơn)\s*:?\s*(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b(?:\s*\/\s*(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b)?/gi)) {
    const around = text.slice(Math.max(0, m.index - 160), m.index + 160), at = Math.min(m.index, 160);
    const p = nearest(around, at, PRIME_W), sb = nearest(around, at, STANDBY_W);
    if (!(p < sb && p <= 120) || ENGINE_W.test(text.slice(Math.max(0, m.index - 300), m.index).split("\n").slice(-2).join(" "))) continue;
    prime.push(pair(m[1], m[2], m[3], m[4], m.index));
  }
  // 2026-11-04 regression: "Công suất liên tục (100% tải) 125kVA / 100 kW", "Công suất liên tục (kVA/kW) 100/80" and the
  // figure on the next line ("Công suất liên tục:" / "2.250kVA/1.800kW") were missed.
  // Also "(Kw/KVA) 60/75", "200/160 (kVA/kW)", "liên tục/ dự phòng: 6/6,5 KVA" and "Continuous 110KVA" (2026-11-04).
  const PRIME_LABEL = /(?:c[ôo]ng su[ấa]t\s+(?:li[êe]n t[ụu]c|c[ơo] b[ảa]n)|prime(?:\s+power)?|continuous(?:\s+power)?)/i;
  const tidy = (l) => l.replace(/\(\s*\d{2,3}\s*%[^)]{0,12}\)/g, " ").replace(/\(\s*kVA\s*[\/\\]\s*kW\s*\)([^\d\n]{0,20})(\d+(?:[.,]\d+)*)\s*\/\s*(\d+(?:[.,]\d+)*)(?![\d.,]*\s*(?:kva|kw))/i, "$1$2 kVA / $3 kW")
    .replace(/\(\s*kW\s*[\/\\]\s*kVA\s*\)([^\d\n]{0,20})(\d+(?:[.,]\d+)*)\s*\/\s*(\d+(?:[.,]\d+)*)(?![\d.,]*\s*(?:kva|kw))/i, "$1$2 kW / $3 kVA")
    .replace(/(\d+(?:[.,]\d+)*)\s*\/\s*(\d+(?:[.,]\d+)*)\s*\(\s*kVA\s*[\/\\]\s*kW\s*\)/i, "$1 kVA / $2 kW")
    .replace(/(li[êe]n t[ụu]c)\s*\/\s*(d[ựu] ph[òo]ng)\s*:?\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*(kVA|kW)\b/i, "$1 $3 $5, $2 $4 $5")
    // A table row with the unit column before the figure: "5  Công suất liên tục   kVA   ≥ 700" (IB2600603983, 2026-11-11).
    // Not "kWm" (the engine's shaft power).
    .replace(/(c[ôo]ng su[ấa]t\s+li[êe]n t[ụu]c|prime(?:\s+power)?|continuous(?:\s+power)?)\s+\(?(kVA|kW)\)?\s+(?:≥|>=|>)?\s*(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)(?![\d.,]*\s*(?:kva|kw))/i, "$1 $3 $2");
  const L = text.split("\n");
  for (let i = 0, off = 0; i < L.length; off += L[i].length + 1, i++) {
    let line = tidy(L[i]);
    const at = line.search(PRIME_LABEL);
    if (at >= 0 && !/\d/.test(line.slice(at)) && L[i + 1] && /^\s*[≥>=:]*\s*\d[\d.,\s]*(kva|kw)/i.test(tidy(L[i + 1]))) line += " " + tidy(L[i + 1]);
    const m = line.match(/(?:c[ôo]ng su[ấa]t\s+(?:li[êe]n t[ụu]c|c[ơo] b[ảa]n)|prime(?:\s+power)?|continuous(?:\s+power)?)[^\n\d≥≤]{0,60}?(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b(?:\s*[\/(]\s*(\d{1,3}(?:[.,]\d{3})+|\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b)?/i);
    // "163kVA liên tục Prime/180kVA dự phòng Standby": the labels follow their figures; the 180 is the standby's, and a figure
    // after a label that follows its own figure is none's (2026-11-12 audit).
    const suffixed = m && /^(?:prime|continuous)(?:\s+power)?\s*\/\s*$/i.test(m[0].replace(/\d[\d.,]*\s*(?:kVA|kW)[\s\S]*$/i, "")) && /\d\s*(?:kVA|kW)\s*(?:li[êe]n t[ụu]c\s*|continuous\s*|c[ơo] b[ảa]n\s*)?$/i.test(line.slice(0, m.index));
    if (m && !suffixed && !STANDBY_W.test(line.slice(0, m.index + 20)) && !ENGINE_W.test(m[0])) prime.push(pair(m[1], m[2], m[3], m[4], off));
    STANDBY_W.lastIndex = 0;
  }
  for (const m of fuelFigures(ft)) {
    const before = ft.slice(Math.max(0, m.index - 200), m.index);
    if (!FUEL_LABEL.test(before)) continue;
    // A table row whose label wraps under its figure (IB2600603983, 2026-11-17: "+ Tiêu hao nhiên liệu ở   ≤ 156 lít/giờ"
    // then "mức 100% tải" alone on the next line, three rows of them): the load is the next line's, not the "100%" that
    // closes the row before (113 L/h of the 70% row was read as the 100% limit, and rows at 138–151 L/h were left out).
    // Only when the figure's own line has a label and no load, and the next line is nothing but the load.
    const ls = ft.lastIndexOf("\n", m.index - 1) + 1, own = ft.slice(ls, m.index), le = ft.indexOf("\n", m.index);
    // A level the HSMT itself marks optional is no limit: "Tối thiểu (bắt buộc): … ≤ 5,5 lít/giờ ở 75% tải. Nâng cao (lựa chọn): ≤ 4,5
    // lít/giờ ở 75% tải" (IB2300349583): the limit is the required 5,5.
    if (/n[âa]ng\s*cao\s*\(\s*l[ựu]a\s*ch[ọo]n\s*\)/i.test(own)) continue;
    const ne = le < 0 ? -1 : ft.indexOf("\n", le + 1), next = le < 0 ? "" : ft.slice(le + 1, ne < 0 ? ft.length : ne);
    const under = /\p{L}{2}/u.test(own) && !/\d{2,3}\s*%/.test(own) ? next.match(/^\s*(?:ở\s+)?(?:ho[ạa]t [đd][ộo]ng\s+)?(?:mức\s+)?(\d{2,3})\s*%\s*(?:tải|phụ tải|công suất|load)?\s*[.;,]?\s*$/i) : null;
    // The load right after the figure on its own line ("≤ 3,7 lít/giờ tại (75 %) tải định mức" then "≤ 5,0 lít/giờ tại
    // (100 %) tải định mức", IB2600570050 / IB2600588204, found by hints-audit.mjs 2026-11-17): 5,0 took the 75% of the
    // line before. Only when the figure's own line gives no load before it.
    const rest = ft.slice(m.index + m[0].length, le < 0 ? ft.length : le);
    // The load after the figure may be introduced by a few words (IB2300204857 "≤ 34 Lít/ giờ với mức 75% tải", IB2300230061
    // "≤ 23 lít/giờ ở chế độ hoạt động 75% tải", IB2400389666 "≤53 L/h (khi mức tải là 75%)"), or wrap to the next line
    // ("≤23 L/h (khi mức tải là" / "75%)", IB2500073242): without it a 75% limit was taken for the 100% one (hints-audit 2026-11-17).
    const lead = String.raw`^[\s(]*(?:(?:t[ạa]i|[ởo]|khi|at|@|v[ớo]i)\s+)*(?:(?:ch[ếe] [đd][ộo]\s+)?ho[ạa]t [đd][ộo]ng\s+|m[ứu]c\s+|t[ảa]i\s+(?:l[àa]\s+)?)*[\s(]*`;
    const afterOne = (s) => s.match(new RegExp(lead + String.raw`(\d{2,3})\s*%`, "i")) && s.match(new RegExp(lead + String.raw`(\d{2,3})\s*%\s*\)?\s*(?:t[ảa]i|ph[ụu] t[ảa]i|c[ôo]ng(?:\s*su[ấa]t)?|cs\b|load|[.;,)]|$)`, "i"));
    // The figure's own cell wraps after "là" and the "75%)" is alone on one of the next three lines (a neighbouring cell's
    // label may sit between them).
    const tail = /(?:l[àa]|khi|m[ứu]c|t[ạa]i|[ởo])\s*$/i.test(rest) && le >= 0 ? ft.slice(le + 1).split("\n", 3).find((l) => /^\s*\d{2,3}\s*%\s*\)?\s*$/.test(l)) : null;
    const wrapped = tail ? rest + " " + tail.trim() : rest;
    const after = /\d{2,3}\s*%/.test(own) ? null : afterOne(wrapped);
    // The load after the figure in the figure's own clause ("≤ 12 l/h tại 40 kW (100% tải); ≤ 9 l/h tại 30 kW (75% tải)",
    // IB2400062394: the 9 took the 100% of the clause before it). Only when the clause gives no load before the figure, one
    // load after it, and no other figure in L/h. A clause ends at ";" or at "," / "." before a space.
    const ownClause = own.slice(Math.max(own.lastIndexOf(";"), own.lastIndexOf(", ")) + 1), clause = rest.split(/;|[,.](?:\s|$)/)[0];
    const clauseLoads = [...clause.matchAll(/(\d{2,3})\s*%\s*\)?\s*(?:t[ảa]i|ph[ụu]\s*t[ảa]i|c[ôo]ng\s*su[ấa]t|cs\b|load|đ[ịi]nh\s*m[ứu]c)/gi)];
    // Or the clause is nothing but the load: "≤ 3,2 L/h (75%)", "43.6 lít/giờ ở 75%" (not "(sai số 10%)").
    const bareLoad = clause.match(/^\s*(?:\(\s*|(?:[ởo]|t[ạa]i|at|@)\s+)(\d{2,3})\s*%\s*\)?\s*$/i);
    const clauseLoad = clauseLoads.length === 1 ? clauseLoads[0] : clauseLoads.length ? null : bareLoad;
    const inClause = !after && clauseLoad && !/\d{2,3}\s*%/.test(ownClause) && (clause.match(/\d{2,3}\s*%/g) || []).length === 1 && !/l[íi]t\s*\/|\bl\s*\/\s*h/i.test(clause) ? clauseLoad : null;
    // The load on the line under the figure, after a few words ("Tiêu thụ nhiên liệu mức" / "14 ≤ 3,5 L/h" / "100% tải liên
    // tục", "Tiêu hao nhiên liệu" / "- ≤ 370 L/hr (Lít/giờ)" / "tại 75% công suất": hints-audit 2026-11-17). Only when the
    // figure's line gives no load, and the next line gives no other figure (it would be the next row's own load and limit).
    // A load before the figure that sits before its fuel label is the row above's ("75% tải liên tục" closing it); one after
    // the label that differs from the line under leaves the figure of no load we can use (-1).
    const nm = !after && !/\d{2,3}\s*%/.test(own) ? next.match(/^\s*[(\-–+*•]?\s*(?:(?:t[ạa]i|[ởo]|m[ứu]c|t[ảa]i|khi)\s*)*(\d{2,3})\s*%/i) : null;
    const below = nm && !/\d/.test(next.slice(nm.index + nm[0].length)) && !/[≤<]|l[íi]t\s*\//i.test(next) ? nm : null;
    const tail60 = before.slice(-60), bl = tail60.match(/(\d{2,3})\s*%(?![\s\S]*\d{2,3}\s*%)/);
    const labelAt = Math.max(-1, ...[...tail60.matchAll(new RegExp(FUEL_LABEL.source, "gi"))].map((x) => x.index));
    // A load before the figure's own line when that line has its own fuel label is the row above's too ("Thời gian chạy liên
    // tục 16h(50% CS)" then "Tiêu hao nhiên liệu « 4,83 L/h (100% CS)", IB2500266050).
    const ownLabel = FUEL_LABEL.test(own) && bl && bl.index < tail60.length - own.length;
    const fromBefore = (bl && below && bl.index < labelAt) || ownLabel ? null : bl;
    const load = after || inClause || under || (below && fromBefore && below[1] !== fromBefore[1] ? ["", "-1"] : below || fromBefore);
    const rq = clause.match(/\b(MRQ|RQ)\b/)?.[1];
    fuel.push({ v: m.v ?? numOf(m[1]), load: load ? Number(load[1]) : /đầy tải|full load/i.test(before.slice(-60)) ? 100 : null, ...(rq ? { rq } : {}) });
  }
  const one = (list) => (new Set(list).size === 1 ? list[0] : null);
  // Two figures at one load tagged MRQ and RQ: the limit is the RQ one (Khoa 2026-11-21, IB2500403535). Only when every figure
  // at that load carries one of the two tags; two figures with no RQ tag still give no limit.
  const rqOf = (at) => { const r = at.filter((x) => x.rq === "RQ"), m = at.filter((x) => x.rq === "MRQ"); return r.length && m.length && r.length + m.length === at.length ? r : at; };
  // A figure in the engine's or the alternator's section (an alternator of 11 kVA for an 8.5 kVA genset) is the genset's
  // only when no other is given; the smaller second genset (below) is still looked for among all. An alternator is rated
  // at 1–1.4 times its genset: a figure under "đầu phát" outside that is another genset of the tender (100 and 150 kVA,
  // 250 and 9.5 kVA), kept so that the sizes disagree and none is given.
  const own = prime.filter((v) => v.sec === "genset"), low = (u) => Math.min(...own.filter((v) => v[u] != null).map((v) => v[u]));
  // In the engine's section only a kW figure (shaft power) is the engine's: a kVA one is a genset's (300, 400, 450 kVA).
  const altFits = (v) => (v.sec === "engine" ? v.kVA == null : v.sec !== "alt" || ["kVA", "kW"].some((u) => v[u] != null && v[u] >= low(u) * 0.995 && v[u] <= low(u) * 1.4));
  // A statement of power in the engine's or the alternator's section is the genset's prime only when no other is given, and then
  // only if it is the size of the tender (plausible: 2026-11-12, 9 of 30 tenders that had only such statements asked a prime of
  // another size, 42 kVA for 40): marked `fromOther`.
  const list = own.length && prime.every(altFits) ? own : prime, viaOther = !own.length;
  const unit = list.some((v) => v.kVA != null) ? "kVA" : "kW", same = list.filter((v) => v[unit] != null).sort((a, b) => a[unit] - b[unit]);
  const p = primeTol(same.length && same.at(-1)[unit] <= same[0][unit] * 1.15 && (unit === "kVA" ? !prime.some((v) => v.kVA == null && v.kW < same[0].kVA * 0.68) : !KVA_FIG.test(text)) ? same[0] : null, ft), full = fuel.filter((x) => x.load === 100), any = fuel.filter((x) => x.load == null);
  // The 75 % and 50 % load limits of the HSMT (2026-11-09: 475 of 1,237 fuel lines of the analyses are at 75 %).
  return { prime, fuel, mins: { minPrime: p && viaOther ? { ...p, fromOther: true } : p, maxFuel: one(rqOf(full.length ? full : fuel.length === any.length ? any : []).map((x) => x.v)), maxFuel75: one(rqOf(fuel.filter((x) => x.load === 75)).map((x) => x.v)), maxFuel50: one(rqOf(fuel.filter((x) => x.load === 50)).map((x) => x.v)) } };
}
// The displacement (L) and the cylinders of an engine as its facts give them.
// The displacement of an engine in litres as a source gives it: a figure with its unit is taken as it is (litres, or cc /
// cm³ / ml divided by 1000: "105,56 L" of a Yuchai YC16VC was read as 0.1 L); with no unit up to 100 it is litres, over 130
// cc, in between none (it may be either).
// The unit may be in the label of the figure ("Displacement (L)" | "105.56").
const DISP_UNIT_L = /\(\s*(?:l|lít|lit)\s*\)|\b(?:litres?|liters?)\b/i, DISP_UNIT_CC = /\(\s*(?:cc|cm\s?[3³]|ml)\s*\)/i;
const dispLitres = (f) => litres(DISP_UNIT_L.test(f.label || "") && !/\d\s*(?:cc|cm|ml)/i.test(f.value) ? `${f.value} L` : DISP_UNIT_CC.test(f.label || "") ? `${f.value} cc` : f.value);
export const litres = (v) => {
  const s = String(v ?? ""), m = s.match(/\d{1,3}(?:[.,]\d{3})+(?!\d)|\d+(?:[.,]\d+)?/);
  if (!m) return null;
  // Cubic inches (a US data sheet: "912 in3", "912 cu. in.", "912 CID") were read as cc.
  if (/^\s*(in\s?[3³]|cu\.?\s*in\b|cid\b)/i.test(s.slice(m.index + m[0].length))) return Math.round(numOf(m[0]) * 0.016387064 * 1000) / 1000;
  const n = numOf(m[0]), unit = s.slice(m.index + m[0].length).match(/^\s*(cc|cm\s?[3³]|ml|l[íi]t|lit|liter|litre|ltr|L)\b/i)?.[1] || "";
  if (/^(cc|cm|ml)/i.test(unit)) return n / 1000;
  // In litres a figure written with three decimals ("9.726L", "1,116 L") is no thousand: an engine of 9726 L is none
  // (westinpower "Displacement | 9.726L" was read 9726 L, 2026-11-12). One separator: the decimal point; more: no figure.
  // Over 100 L in plain decimals stays (Yuchai YC16VC "105,56 L", Weichai 8WH32 257 L).
  if (unit && n > 100 && /[.,]/.test(m[0]) && /^\d{1,3}(?:[.,]\d{3})+$/.test(m[0])) return /^\d{1,3}[.,]\d{3}$/.test(m[0]) ? Number(m[0].replace(",", ".")) : null;
  if (unit) return n;
  return n <= 100 ? n : n > 130 ? n / 1000 : null;
};
// A model the HSMT writes (engine `isNamed`, alternator +80): its squashed code must match WHOLE tokens of the HSMT
// (named-token, 20/11/2026). The squashed text drops every boundary, so the substring test matched across words:
// "Model: 224D" held "el224d", "12VDC/24VDC" "dc24v", "220/380V" "v2203", "ACB 2500A" "b2500" (scan of the local bidhist,
// 928 tenders × 9,298 models: 185 pairs → 104 on whole tokens). Hints without `bounds` (built by hand) keep the substring test.
// A model the catalog writes CUT SHORT of the HSMT's model ("6BT5.9-G" where the HSMT names "6BT5.9-G2", "KTA50G" for
// "KTA50-G8", "4105D" in "HY4105D", 28 pairs of the scan) is NOT named either (khoa: "Khoa 20/11/2026").
export const named = (hints, model) => {
  const k = squashOf(model);
  if (k.length < 5) return false;
  const b = hints.bounds;
  if (!b) return hints.text.includes(k);
  for (let i = hints.text.indexOf(k); i >= 0; i = hints.text.indexOf(k, i + 1)) if (b[i] & 1 && b[i + k.length] & 2) return true;
  return false;
};
const CONF = { high: 30, medium: 15 };
// A supplier offering one engine with one alternator is one choice, however many gensets, pages or tables name it.
// Plain code-unit order (no locale), so the tie order of `candidates` is the same on every machine.
const cmpStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// FNV-1a, 32 bit, over the UTF-16 code units: a pure function of the string (no Math.random, no Node version or machine
// dependence). Equal scores are told apart by the hash of the row's identity, so the order is fixed but follows neither the
// walk of the catalog nor the alphabet (an alphabetical tie order favoured the suppliers named first: acepow-fuan 1.538 → 1.848 places).
const fnv1a = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
// Doosan and Hyundai are one make for the group / ceiling of `candidates` (SAME_MAKER of catalog.js keeps both names on an
// engine): the same engine is "Hyundai / Doosan" or "Doosan / Hyundai" by what the sources say, and the first name used to
// put it in either group (P126TI, P086TII). Only the group label; `e.make` is not changed. Daewoo is folded in too (Khoa 21/11/2026 "có").
const makeGroup = (m) => (m === "Hyundai" || m === "Daewoo" ? "Doosan" : m);
const choiceKey = (r) => `${r.u.supplierId}\n${r.e.key}\n${r.a?.key || squashOf(r.u.other || "")}`;
// Rows per engine (more for the engine the HSMT names) and per supplier, so other engines and suppliers get a place too.
// Alternators a supplier sells under its OWN label (Khoa 20/11/2026, #969 "B"): an explicit list of supplier + the code of
// its labelled alternators, not a rule for other suppliers. eastern-lion's "EL 164D" / "ELS 184F" are found in the catalog
// only because eastern-lion's own tables list them (web/catalog.js OWN_ALT / ALT_TABLES): `candidates` gives its rows no
// "alternator found" +40 (nor the +3 per figure type) on EVERY such row, also rows main already scored with an EL alternator
// (Khoa chốt (i) 20/11/2026; đo cloud: 22.755 lượt-cặp −40, dòng eastern-lion trong top 30: 684 → 93). The records stay
// (catalog, web). Other suppliers' rows with an EL alternator are not in the list.
export const OWN_BRAND_ALTS = [{ supplierId: "eastern-lion-fuan", code: /^ELS?\s?\d{3}[A-Z]{0,2}$/i, khoa: "Khoa 20/11/2026" }];
const PER_ENGINE = 3, PER_NAMED_ENGINE = 8, PER_SUPPLIER = 4, CN_ROWS = 12, MAKE_ROWS = 3, SYNC_ROWS = 6, SYNC_PER_SUPPLIER = 2;
// A ceiling per engine make among the rows (Khoa, 2026-11-12): Cummins and Perkins, with the most datasheet figures, took 30
// of 30 rows (IB2600592658, 2880: 30 Cummins). When the HSMT names no engine make or model, a make has at most MAKE_CAP
// of the rows; what the ceiling leaves empty is filled with the best-scored rows left, whatever their make.
export const MAKE_CAP = 10;
// Hai luật điểm của bước chọn ứng viên (Khoa duyệt 20/11/2026 "làm cả A và B"). Sau đo mẫu (A đổi top 30 theo độ phủ
// tờ hãng trong cn/, không theo chất lượng động cơ) Khoa 20/11/2026: "đo lại B xem như thế nào rồi tính tiếp, áp luôn cho
// các hãng trung quốc" → B MẶC ĐỊNH BẬT (`GENBID_CAND_B=0` tắt); A MẶC ĐỊNH TẮT, Khoa CHƯA duyệt bật (`GENBID_CAND_A=1` để đo).
const CAND_DEFAULT = { A: "0", B: "1" };
// Luật B không đụng 5 dòng đầu của xếp hạng cũ (B tắt): Khoa 20/11/2026 "Sửa luật B rồi chạy lại".
const PIN_TOP = 5;
// Luật B: một model chỉ nhường chỗ cho model khác của hãng khi đã có dòng của B_MIN_SUPPLIERS NCC KHÁC NHAU (Khoa 21/11/2026,
// đo cloud lần 2: số NCC mỗi model trong top 30 tụt 3,03 → 1,92, 1.769 cặp lượt-model còn 1 NCC).
const B_MIN_SUPPLIERS = 2;
const candRuleOn = (k) => { const v = String(process.env[`GENBID_CAND_${k}`] ?? "").trim() || CAND_DEFAULT[k]; return v !== "0"; };
// Luật A: động cơ có datasheet của CHÍNH hãng động cơ. Chặt: một fact của model (modelFacts) mang `sheet` (bảng của NCC
// `role: engine_maker` có tiêu đề ghi đúng một mã là model này, hoặc dòng bảng của chính NCC đó ghi đúng mã model; không
// tính bảng "Datasheet: …" của hãng tổ máy / NCC lắp ráp, không tính tờ của khung máy chia cho các model của khung) hoặc
// `maker` (công suất động cơ do NCC engine_maker ghi), VÀ NCC đó là hãng của động cơ: một hãng của `e.make` có trong
// tên / thương hiệu / id của NCC (weichai-power ghi thương hiệu "Baudouin", dcec "Cummins", perkins "Perkins"). NCC
// engine_maker ghi động cơ hãng khác, hay động cơ chưa rõ hãng: không tính. → id các NCC đó (rỗng: không có).
export function engineMakerSheets(e, ef, sup) {
  const makes = String(e?.make || "").split(" / ").map((m) => m.trim().toLowerCase()).filter(Boolean);
  if (!makes.length) return [];
  const ofMake = (s) => {
    if (s?.role !== "engine_maker") return false;
    const names = [supplierFamily(s, true), s.names?.en, ...(s.names?.brands || []), s.id].filter(Boolean).map((x) => String(x).toLowerCase().replace(/[-_]+/g, " "));
    return makes.some((m) => names.some((n) => n.includes(m)));
  };
  return [...new Set((ef || []).filter((f) => (f.sheet || f.maker) && ofMake(sup.get(f.supplierId))).map((f) => f.supplierId))];
}
// The make of a genset maker for Đồng bộ thương hiệu (syncCheck): a supplier that is no distributor, whose name or id is
// of a make (web/bidprice.js familyOf). A Chinese company whose name carries a foreign make ("… Cummins Power …") is an
// assembler, not that maker: null, as is an assembler whose name is no make (cgm-italia).
const CN_FAMILY = new Set(["Weichai", "Yuchai", "SDEC", "Nianfeng", "Bobig", "Jet-Power", "Wintpower", "SmartGen", "Harsen", "Mebay", "Lixise"]);
// The make a supplier's record gives (web/bidprice.js familyOf of its name / brands / id). A make of Chinese makers
// (CN_FAMILY) read from a supplier based in another country is an abbreviation that clashes, not that make: Saudi Diesel
// Equipment Co (SA) writes itself "(SDEC)", which is no Shanghai Diesel (SDEC). Such a supplier has no make (2026-11-12).
export function supplierFamily(r, withBrands = false) {
  const f = BP.familyOf(r?.names?.en, ...(withBrands ? r?.names?.brands || [] : []), r?.id);
  return f && CN_FAMILY.has(f) && r?.country && r.country !== "CN" ? null : f;
}
export function gensetMakerOf(r) {
  if (!r || r.role === "distributor") return null;
  const f = supplierFamily(r);
  return f && r.country === "CN" && !CN_FAMILY.has(f) ? null : f || null;
}
// The minimums of the HSMT that fit the genset of this run: a tender of several sizes gives the fuel of its small one
// (104 L/h beside 2500 kVA), an OCR slip a prime of 107 kVA for 8.5 kVA, "lưu lượng dầu đến bơm ≤ 450 lít/giờ" a fuel
// limit for 500 kVA (2026-11-03 scan of 390 HSMT). Such a figure would rank every candidate down: left out.
const LOAD_100 = /100\s*%|full[\s-]*load|đầy tải|满载|全负载/i;
export function plausible(hints, cap) {
  if (!cap) return hints;
  const kva = cap.unit === "kVA" ? cap.value : cap.value / 0.8, out = { ...hints }, mp = hints.minPrime;
  const mpKva = mp ? (mp.kVA ?? (mp.kW != null ? mp.kW / 0.8 : null)) : null;
  if (mpKva != null && (mpKva < kva * 0.5 || mpKva > kva * 1.6)) out.minPrime = null;
  // From the section of the engine or of the alternator: a prime of the genset only if it is the size (±1.2%).
  else if (mp?.fromOther && mpKva != null && Math.abs(mpKva / kva - 1) > 0.012) out.minPrime = null;
  if (hints.maxFuel != null && (hints.maxFuel < kva * 0.12 || hints.maxFuel > kva * 0.6)) out.maxFuel = null;
  if (hints.maxFuel75 != null && (hints.maxFuel75 < kva * 0.09 || hints.maxFuel75 > kva * 0.45)) out.maxFuel75 = null;
  if (hints.maxFuel50 != null && (hints.maxFuel50 < kva * 0.06 || hints.maxFuel50 > kva * 0.3)) out.maxFuel50 = null;
  if (hints.minDisp != null && hints.minDisp > Math.max(4, kva * 0.15)) out.minDisp = null;
  if (hints.minCyl != null && kva < 60 && hints.minCyl > 4) out.minCyl = null;
  // A largest displacement below the least one, or too small for this power, is another genset's.
  if (hints.maxDisp != null && ((out.minDisp != null && hints.maxDisp < out.minDisp) || hints.maxDisp < kva * 0.01)) out.maxDisp = null;
  return out;
}
// The candidates' power band (Khoa, 2026-11-12): a row whose rating is from 100% (less the 0.5% of rounding the checks
// allow: 0.995, as `gap` and the prime check) to 120% of the HSMT's size. It was 95% to 140%.
export const NEAR_LOW = 0.995, NEAR_HIGH = 1.2;
// A small genset (Khoa, 2026-11-12: 44 sizes had under 5 candidates): from 30 kVA down the band goes to 140%; over 30 kVA it
// stays 120%. 30 kVA is of the small ones. A size in kW is the same genset at 0.8 (30 kVA = 24 kW). One function for every place
// of the band: the candidates, Tìm NCC (fitsCap, engineRows, mergeFind) and the texts. (sizeBlocks keeps NEAR_HIGH: there 1.2
// is the standby / prime relation of one genset, not a band of candidates.)
export const SMALL_KVA = 30, NEAR_HIGH_SMALL = 1.4;
export function bandOf(cap) {
  const small = !!cap && cap.value > 0 && (cap.unit === "kW" ? cap.value <= SMALL_KVA * 0.8 + 1e-9 : cap.value <= SMALL_KVA + 1e-9);
  return { low: NEAR_LOW, high: small ? NEAR_HIGH_SMALL : NEAR_HIGH, text: small ? "100% đến 140%" : "100% đến 120%" };
}
// The alternator record a row's "other" cell names. The cell often carries the make ("Stamford S5L1D-H41", "Leroy-Somer
// TAL044"), which the catalog's key leaves out: try the cell as written, then without the make words at its start.
// A make of one or two words ("Stamford", "Leroy Somer", "Mecc Alte", "FG Wilson"; Khoa 19/11/2026 altof-fgw: "FG Wilson FGL20060"
// and "Leroy Somer TAL-A47-A" were left whole because only the first word was tried as a make). FG Wilson is read here only
// at the start of the cell (as the catalog reads it in the alternator's own cell), it is not in CAT.ALT_BRANDS.
const ALT_CELL_MAKE = [...(CAT.ALT_BRANDS || []).map(([re]) => re), /^fg[\s-]?wilson$/i];
export function altOf(alts, cell) {
  const s = String(cell || "").trim(), hit = alts.get(CAT.keyOf(s));
  if (hit) return hit;
  let rest = s;
  for (let i = 0; i < 3; i++) {
    // a two-word make first, only when the two words ARE the make ("Leroy Somer"; "Stamford HCI" is a make and a code
    // fragment, not one), then a one-word make as before; then what is left of the cell
    const m = rest.match(/^(\S+)\s+(\S.*)$/), m2 = rest.match(/^(\S+\s+\S+)\s+(\S.*)$/);
    const whole = (w) => ALT_CELL_MAKE.some((re) => { const k = re.exec(w); return !!k && k[0].length === w.length; });
    const pick = (m2 && whole(m2[1]) ? m2 : null) || (m && ALT_CELL_MAKE.some((re) => re.test(m[1])) ? m : null);
    if (!pick) break;
    rest = pick[2].trim();
    const r = alts.get(CAT.keyOf(rest));
    if (r) return r;
  }
  return null;
}
// Luật đã duyệt (tach-mu-2, Khoa 21/11/2026 chọn M): catalog tách "X" và "X^" (không nguồn nào chú thích "^"). Chỉ để LOẠI ở `candidates`:
// khoá không có số của một loại (xi lanh, dung tích, đường kính × hành trình) mượn số của khoá kia; khoá có số riêng giữ số riêng
// (8M33D1012E311 không bị "12V / 31.8" của aosif ở khoá ^ kéo lại). Điểm thông số (`eKeys`) không mượn.
const TWIN_KEYS = new Set(["cyl", "disp", "bore"]);
const caretTwin = (k) => (k.endsWith("^") ? k.slice(0, -1) : `${k}^`);
function twinFacts(e, ef, facts) {
  const twin = facts.get(`engine:${caretTwin(e.key)}`);
  if (!twin?.length) return [];
  const own = new Set([...ef, ...e.uses.flatMap((u) => u.specs || [])].map((f) => f.key));
  return twin.filter((f) => TWIN_KEYS.has(f.key) && !own.has(f.key));
}
export function candidates(cat, cap, hints0, { suppliers = [], origin = "all", cn = new Set(), facts = modelFacts(cat, suppliers), focus = null, max = 30, sync = null, keep = null, makeCap = MAKE_CAP, patches = true, blocked = null, pinTop = PIN_TOP } = {}) {
  const hints = plausible(hints0, cap), sup = new Map(suppliers.map((s) => [s.id, s])), alts = new Map((cat.alternators || []).map((a) => [a.key, a])), rowsMap = normRowsOf(suppliers);
  const band = bandOf(cap), ruleA = candRuleOn("A"), ruleB = candRuleOn("B");
  const near = (u) => !cap || Object.values(u.power || {}).some((p) => p[cap.unit] != null && p[cap.unit] >= cap.value * band.low && p[cap.unit] <= cap.value * band.high + 1e-9);
  // `dropped`: the rows a minimum of the HSMT rules out (left out of the candidates), with the reasons.
  const rows = [], dropped = [], engineByKey = new Map((cat.engines || []).map((x) => [x.key, x]));
  for (const e of cat.engines || []) {
    if (focus && !focus.has(e.key)) continue;
    const viaCn = origin === "cn" && CAT.originOf(e) === "other";
    const ef = facts.get(`engine:${e.key}`) || [], eKeys = new Set(ef.map((f) => f.key));
    // Số dùng cho luật loại: của khoá + số mượn từ khoá X ↔ X^ (twinFacts).
    const borrowed = twinFacts(e, ef, facts), rf = borrowed.length ? [...ef, ...borrowed] : ef, twinUses = engineByKey.get(caretTwin(e.key))?.uses || [];
    // Displacement voters of this engine (dispVoters), built once when a row needs them.
    let voters = null;
    const dispVoter = (s) => {
      if (!voters) {
        const read = specNormOn("disp") ? (f, ctx) => { const x = normFig(f, ctx ?? NORM_CTX.get(f), { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : BLOCK; } : (f) => dispLitres(f);
        voters = dispVoters(e, ef, { suppliers: sup, read, rowsMap });
      }
      return voters.get(s) ?? s;
    };
    for (const u of e.uses) {
      // The genset model the HSMT names (Khoa 2026-11-12, IB2600601812 "Mã hiệu DHY110K SE"): its row stays whatever its
      // power reads (Hyundai's DHY110KSE table gives the engine's 100 kW only, no kVA) and goes first.
      const gNamed = !!hints.named?.models?.length && !!(u.line || u.lines) && hints.named.models.some((m) => NG.namesModel([u.title, u.genset, u.line, ...(u.lines?.rows || [])].filter(Boolean).join("\n"), m));
      if (!(gNamed && hints.named.strict) && ((!u.line && !u.lines) || !near(u) || (hints.freq && u.freq && u.freq !== hints.freq) || (viaCn && !cn.has(u.supplierId)))) continue;
      // Dòng nghi sai (Chất lượng 1, Khoa 18/11/2026; row-flags-lib.mjs blockedRows): số vô lý chưa được "cho dùng", hoặc
      // "bỏ hẳn" trên màn Nhà cung cấp → cả dòng ra khỏi ứng viên, kể cả model HSMT nêu (dữ liệu dòng sai, không phải
      // động cơ sai). Thông số của dòng vẫn ở `facts` như trước (số đông, chấm đạt), chỉ dòng không được chọn làm cấu hình.
      if (blocked?.size && blocked.has(lineKey(u))) { dropped.push({ e, u, ruled: ["rowflag"], src: {} }); continue; }
      const a = u.other ? altOf(alts, u.other) : null, af = a ? facts.get(`alternator:${a.key}`) || [] : [];
      const s = sup.get(u.supplierId), rowCtrl = CAT.controllersIn(u.line || (u.lines?.rows || []).join(" "));
      const offers = [...rowCtrl, ...(s?.controllers || [])];
      const ctrlNamed = offers.some((c) => hints.ctrlModels.includes(CAT.keyOf(c.model || "")) || hints.ctrlMakes.includes(c.brand));
      const why = [];
      let score = 0;
      const isNamed = named(hints, e.model) || gNamed;
      if (gNamed) { score += 2000; why.push("tổ máy đúng model HSMT nêu đích danh"); }
      else if (isNamed) { score += 1000; why.push("HSMT ghi model động cơ này"); }
      // The genset make the HSMT names: a row of that maker (its record's name / brands), not of an assembler.
      if (!gNamed && hints.named?.make && NG.makerOf(sup.get(u.supplierId), hints.named.make)) { score += 300; why.push(`tổ máy hãng ${hints.named.make} HSMT nêu`); }
      // Sources that name two makes ("Cummins / Doosan"): either one is the HSMT's.
      const makeNamed = (e.make || "").split(" / ").find((m) => hints.engineMakes.includes(m));
      if (makeNamed) { score += 300; why.push(`hãng động cơ ${makeNamed} HSMT nêu`); }
      if (ctrlNamed) { score += 200; why.push("có bộ điều khiển hãng HSMT nêu"); }
      // The controller the HSMT names by its own word (rule 5, Khoa 18/11/2026: PowerCommand, AmpSentry, EMCP…): the same
      // 200 points; a row without it stays (the configuration is "không đạt" at the controller, Khoa câu 2 (a)).
      const ctlTerm = (hints.trait?.controllers || []).find((x) => [u.line, ...(u.lines?.rows || []), ...offers.map((c) => `${c.brand || ""} ${c.model || ""} ${c.line || c.text || ""}`)].some((l) => ET.termHit(x.term, l)));
      if (ctlTerm) { score += 200; why.push(`có bộ điều khiển ${ctlTerm.term} HSMT nêu`); }
      if (e.make) score += 60;
      // Xuất xứ Trung Quốc (Khoa, 2026-11-03): an engine of a Chinese make before a foreign one a supplier in China
      // offers. Those had more datasheet figures and filled 20 of the 30 rows; the make the HSMT names (300) still wins.
      if (origin === "cn" && !viaCn) { score += 250; why.push("động cơ hãng Trung Quốc"); }
      // A foreign make whose row names a Chinese plant (DCEC, SME, Perkins Wuxi…) is made in China (Khoa, 2026-11-16,
      // in place of 2026-10-29): it counts as a Chinese engine.
      else if (origin === "cn") { const m = CAT.madeAt(e, u); if (m.at === "CN") { score += 250; why.push(`động cơ hãng ngoại sản xuất tại Trung Quốc (nguồn ghi «${m.why}»)`); } }
      // Nơi sản xuất of each part the HSMT asks of the group (partOriginOfHsmt basis "origin", Khoa 2026-11-16/17): a
      // place the row names outside the group is not met — the engine's row is left out, an alternator / controller made
      // there takes 300 points off; a place in the group (or the country Khoa settled on for the make) is met; nothing
      // written: kept, "cần xác nhận nơi sản xuất" (the CO). A brand asked keeps the make filter as before.
      const made = {};
      let madeOut = false;
      if (GROUP_ORIGIN.has(origin) && hints.madeRule) {
        const inG = (c) => CAT.COUNTRY_GROUP[origin].includes(c), MR = hints.madeRule;
        const judge = (part, m) => {
          made[part] = m.at;
          if (m.at === "?") return why.push(`cần xác nhận nơi sản xuất ${PART_VI[part].toLowerCase()}`) && 0;
          why.push(`${PART_VI[part].toLowerCase()} sản xuất tại ${madeVi(m.at)}${m.why ? ` (${/^(hãng|mặc định)/.test(m.why) ? m.why : `nguồn ghi «${m.why}»`})` : ""}${inG(m.at) ? "" : `, HSMT đòi nơi sản xuất ${GROUP_NAME[origin]}`}`);
          return inG(m.at) ? 1 : -1;
        };
        if (MR.engine?.basis === "origin" && judge("engine", CAT.madeAt(e, u)) < 0) { score -= 600; madeOut = true; }
        if (MR.alternator?.basis === "origin" && a && judge("alternator", CAT.madeAt(a, u)) < 0) score -= 300;
        if (MR.controller?.basis === "origin" && offers.length) {
          const ms = offers.map((c) => CAT.madeIn("controller", [c.brand], [u.line, c.line || c.text], c.model));
          const best = ms.find((m) => m.at !== "?" && inG(m.at)) || ms.find((m) => m.at === "?") || ms[0];
          if (judge("controller", best) < 0) score -= 300;
        }
      }
      // A controller named: on the row, or in the supplier's record (then every row of that supplier). The reason says
      // which (Khoa 19/11/2026 "ok": the 50 points showed no reason; points unchanged).
      if (offers.length) {
        score += 50;
        const names = (l) => [...new Set(l.map((c) => [c.brand, c.model].filter(Boolean).join(" ")).filter(Boolean))].slice(0, 3).join(", ");
        why.push((rowCtrl.length ? `dòng ghi bộ điều khiển ${names(rowCtrl)}` : `NCC có hồ sơ bộ điều khiển ${names(s?.controllers || [])}`).trim());
      }
      // A controller with its maker's datasheet: its functions can be checked against the HSMT.
      if (offers.some((c) => c.model && factsFor(facts, "controller", c.model).length)) { score += 40; why.push("bộ điều khiển có datasheet hãng"); }
      // Luật A: động cơ có datasheet của chính hãng động cơ (engineMakerSheets), 40 điểm. MẶC ĐỊNH TẮT (candRuleOn).
      if (ruleA && engineMakerSheets(e, ef, sup).length) { score += 40; why.push("động cơ có datasheet hãng"); }
      score += 8 * Math.min(eKeys.size, 8);
      // Below a minimum of the HSMT by every source that gives the figure (an engine no source gives it for is not).
      const srcOf = {}, NORM = specNormOn(), ND = specNormOn("disp"), NC = specNormOn("other"), NF = specNormOn("fuel"), normSkip = [];
      // GENBID_SPEC_NORM=1: a figure is read through the normalization layer (normFig); one it cannot compare gives null.
      const ctxOf = (f) => NORM_CTX.get(f) || ((u.specs || []).includes(f) ? useNormCtx(u, rowsMap) : undefined);
      const nfig = (f, want) => { const x = normFig(f, ctxOf(f), want); if (!x.ok) normSkip.push({ key: f.key, label: f.label, value: f.value, why: x.why, supplierId: f.supplierId ?? u.supplierId, line: f.line ?? u.line }); return x.ok ? x.r : null; };
      // The cylinder count the suppliers agree on by the majority rule (majorityOf, lech-cot-9 18/11/2026) settles it: the row is
      // judged by it alone (longkai's "No. cylinders | V 12" for the 6-cylinder QSK19-G4 no longer keeps it for "≥ 12 xi
      // lanh"). No such value: as before. The displacement too (MAJ_KEYS, Khoa 19/11/2026), its voters merged by dispVoters:
      // Chinese suppliers copy one template table, so counting each made a copied error win (MTU 1600 ×6, TAD1341GE).
      const majOf = (all, key) => {
        const figs = all.map(([f, x]) => { const s = f.supplierId ?? u.supplierId; return [key === "disp" ? dispVoter(s) : s, x]; });
        // Dung tích: các số chỉ khác độ làm tròn là một phiếu (majorityRound), so ngưỡng bằng số chính xác nhất (dispExact).
        return key === "disp" ? majorityRound(figs) : majorityOf(figs);
      };
      const below = (key, min, read) => { const all = [...rf, ...(u.specs || [])].filter((f) => f.key === key).map((f) => [f, read(f.value, f)]), fs = all.filter(([, x]) => x != null && x !== BLOCK), v = fs.map(([, x]) => x);
        const mj = min && MAJ_KEYS.has(key) ? majOf(all, key) : null;
        // Dung tích: so chặt bằng số chính xác nhất của nhóm thắng (DP222CB {21.9, 21.927} ↔ ≥ 21.927 đạt; Y490D 2.67 ↔ ≥ 2.672 loại).
        if (mj) { const x = mj.group ? dispExact(mj, "min") : mj.win, lo = x < min; if (lo) srcOf[key] = { n: v.length, win: mj.win, votes: mj.votes, ...(mj.group ? { group: mj.group, exact: x } : {}) }; return lo ? x : null; }
        // Normalized: a source giving a figure the layer cannot compare (no unit, cc...) is "Chưa rõ": the row is not left out.
        const hit = min && v.length && !all.some(([, x]) => x === BLOCK) && v.every((x) => x < min); if (hit) srcOf[key] = { n: v.length, sources: new Set(fs.map(([f]) => `${f.supplierId ?? ""}#${f.n ?? ""}`)).size, ofRow: fs.filter(([f]) => (u.specs || []).includes(f)).length };
        return hit ? v[0] : null; };
      // No displacement given: bore × stroke × cylinders (web/conversions.js displacement), when the sources give them.
      const given = [...rf, ...(u.specs || [])], bs = given.find((f) => f.key === "bore"), z = given.find((f) => f.key === "cyl");
      const nbs = ND && bs && hints.minDisp && !given.some((f) => f.key === "disp") ? nfig(bs, { unit: "mm" }) : null, nz = ND && z && nbs ? nfig(z, {}) : null;
      const [b, st] = ND ? [nbs?.bore?.bore, nbs?.bore?.stroke] : bs ? numbersIn(bs.value) : [], n = ND ? nz?.count ?? null : z ? numbersIn(z.value)[0] : null;
      const calcL = !given.some((f) => f.key === "disp") && b > 50 && st > 50 && n ? Math.round(Math.PI / 4 * b * b * st * n / 1e4) / 100 : null;
      // Normalized: litres only as the source writes them (cc has no formula in web/conversions.js: not compared).
      // BLOCK: the layer read a figure but cannot compare it (a figure, not just an empty / text cell).
      const nread = (f, want, get) => { const x = normFig(f, ctxOf(f), want); if (x.ok) return get(x.r) ?? null; normSkip.push({ key: f.key, label: f.label, value: f.value, why: x.why, supplierId: f.supplierId ?? u.supplierId, line: f.line ?? u.line }); return x.why.includes("value") ? null : BLOCK; };
      const dispOf = ND ? (v, f) => nread(f, { unit: "L" }, (r) => r.num) : (v, f) => dispLitres(f);
      const cylOf = NC ? (v, f) => nread(f, {}, (r) => r.count) : (v) => numbersIn(v)[0] ?? null;
      const dl = (hints.minDisp ? below("disp", hints.minDisp, dispOf) : null) ?? (hints.minDisp && calcL != null && calcL < hints.minDisp ? calcL : null), cl = hints.minCyl ? below("cyl", hints.minCyl, cylOf) : null;
      // Below a minimum of the HSMT (displacement, cylinders, prime) or past its largest displacement: the row is left out,
      // unless the HSMT names its engine model (`named`): then its sources disagree with the HSMT's own choice, and it
      // stays with 600 points off and the reason, for the agent to see.
      const ruled = madeOut ? ["made"] : [];
      // Đặc thù hãng động cơ (rule 1, Khoa 18/11/2026: "chỉ gợi ý hãng đó"): an engine of another make, or of no make the
      // sources agree on, is left out (the engine model the HSMT names stays, as for every rule here).
      const traitMake = hints.trait?.engineMake;
      if (traitMake && !(e.make || "").split(" / ").includes(traitMake)) { ruled.push("trait"); why.push(`HSMT ghi ${hints.trait.engineTerms.map((x) => x.term).join(", ")} (đặc thù động cơ ${traitMake}), động cơ ${e.make ? `hãng ${e.make}` : "chưa rõ hãng"}`); }
      const byMaj = (k) => (srcOf[k]?.win != null ? ` (số đông nhà cung cấp: ${Object.entries(srcOf[k].votes).map(([v, c]) => `${v} × ${c}`).join(", ")})` : "");
      if (dl != null) { score -= 600; ruled.push("disp"); why.push(`dung tích ${dl} L < ${hints.minDisp} L HSMT yêu cầu${byMaj("disp")}`); }
      // Past the largest displacement the HSMT allows: by the value the suppliers agree on (majority, voters merged as for
      // the minimum; Khoa 19/11/2026 "có"), else by every source as before.
      const dhF = hints.maxDisp ? given.filter((f) => f.key === "disp").map((f) => [f, dispOf(f.value, f)]) : [], dh0 = dhF.map(([, x]) => x), dh = dh0.filter((x) => x != null && x !== BLOCK);
      const mjMax = dhF.length && MAJ_KEYS.has("disp") ? majOf(dhF, "disp") : null;
      // Trần so như main (× 1,005), bằng số chính xác nhất của nhóm thắng.
      const xMax = mjMax ? dispExact(mjMax, "max") : null;
      const overMax = mjMax ? xMax > hints.maxDisp * 1.005 : dh.length && !dh0.includes(BLOCK) && dh.every((x) => x > hints.maxDisp * 1.005);
      if (overMax) { score -= 600; ruled.push("maxDisp"); if (mjMax) srcOf.maxDisp = { win: mjMax.win, votes: mjMax.votes, group: mjMax.group, exact: xMax }; why.push(`dung tích ${mjMax ? xMax : dh[0]} L > ${hints.maxDisp} L HSMT cho phép${byMaj("maxDisp")}`); }
      if (cl != null) { score -= 600; ruled.push("cyl"); why.push(`${cl} xi lanh < ${hints.minCyl} HSMT yêu cầu${byMaj("cyl")}`); }
      // The HSMT gives the bare count (cylExact, Khoa 2026-11-17): another count by every source that gives one, the
      // row's own cell first ("12V", "12.V"), is left out too (a 12-cylinder engine for "6 xy lanh"). Sources that
      // disagree on the count: not judged, as for the minimums.
      else if (hints.minCyl && hints.cylExact) {
        const cnt = (v) => { const m = String(v ?? "").match(/\d{1,2}/); return m ? Number(m[0]) : null; };
        const ownC = [...(u.specs || []).filter((f) => f.key === "cyl").map((f) => cnt(f.value)), ...(u.line ? CAT.cellsOf(u.line).filter((c) => /^\s*(?:\d{1,2}\s*[.\-]\s*[VL]|[VL]\s*-?\s*\d{1,2})\s*$/i.test(c)).map(cnt) : [])].filter((x) => x != null);
        // No cell of its own: the engine's count the suppliers agree on by the majority rule, when there is one.
        const eMaj = ownC.length ? null : majOf(rf.filter((f) => f.key === "cyl").map((f) => [f, cylOf(f.value, f)]));
        const cs = ownC.length ? ownC : eMaj ? [eMaj.win] : rf.filter((f) => f.key === "cyl").map((f) => cnt(f.value)).filter((x) => x != null);
        if (cs.length && cs.every((x) => x !== hints.minCyl)) { if (eMaj) srcOf.cyl = { win: eMaj.win, votes: eMaj.votes }; score -= 600; ruled.push("cyl"); why.push(`${cs[0]} xi lanh, HSMT ghi ${hints.minCyl} xi lanh${byMaj("cyl")}`); }
      }
      // The row's prime output (catalog.js reads it from the column titles) below the prime the HSMT asks for.
      const pr = u.power?.prime, mp = hints.minPrime;
      const lowPrime = pr && mp && ((mp.kVA && pr.kVA != null && pr.kVA < mp.kVA * 0.995) || (!mp.kVA && mp.kW && pr.kW != null && pr.kW < mp.kW * 0.995));
      if (lowPrime) { score -= 600; ruled.push("prime"); why.push(`Prime ${pr.kVA ?? "?"} kVA / ${pr.kW ?? "?"} kW < ${mp.kVA ? `${mp.kVA} kVA` : `${mp.kW} kW`} HSMT yêu cầu`); }
      // Its own fuel consumption in L/h above the most the HSMT allows (Khoa, 2026-11-12): the row is left out like one under
      // a minimum (same exception: `named` stays, with 300 points off). A row with no L/h figure at that load is kept.
      let fuelOver = false, fuelNoLoad = false;
      for (const [fk, hk, at] of [["fuel", "maxFuel", ""], ["fuel75", "maxFuel75", " ở 75% tải"], ["fuel50", "maxFuel50", " ở 50% tải"]]) {
        let fl = hints[hk] && (u.specs || []).find((x) => x.key === fk && /l\s*\/\s*h|l\/hr|lít|lph/i.test(`${x.label} ${x.value}`) && !/g\s*\/\s*(k?w|hp|ps)/i.test(String(x.value)));
        let fv = fl ? fuelAt(fl, FUEL_LOAD[fk]) : null, nNoLoad = false, fromSheet = false;
        // Normalized: the first figure of the key in L/h at the HSMT's load (100 / 75 / 50%), the load written in the
        // source (a 75 / 50% cell counts, loadFrom "key"); none → not compared, the row stays with no points off.
        if (NF && hints[hk]) {
          fl = null; fv = null;
          for (const x of (u.specs || []).filter((y) => y.key === fk)) {
            const r = nfig(x, { unit: "L/h", load: FUEL_LOAD[fk] });
            if (r && r.num != null) { fl = x; fv = r.num; nNoLoad = r.cond?.load == null; break; }
          }
          // The row gives no comparable figure: the engine maker's own sheet of this engine, as fuelChecks grades it (điều phối
          // 22/11/2026, Khoa "có làm đi"), so a row is not picked to be graded not_met on the same figure. Within the limit: no points.
          if (fv == null) { const sh = sheetFuel(ef, fk); if (sh) { fl = sh.f; fv = sh.v; fromSheet = true; } }
        }
        // Not judged: a bound ("< 10": only says it is under 10) and a figure no genset of this size burns (> 0.6 L/h per kVA: a
        // kW / kVA pair or a g/kWh figure under a wrong heading, "Cons 100% (L/H) 220/275" for 242 kVA).
        const unsure = fl && (/^\s*[<≤]|<=/.test(String(fl.value)) || (cap && fv != null && fv > (cap.unit === "kVA" ? cap.value : cap.value / 0.8) * 0.6));
        // A 100% figure whose heading names no load (the catalog files "Fuel consumption (L/h)" under 100%) is not left out either (the old
        // 300 points off stay): only a load written in the label that is the HSMT's (100% / full load) counts. 75% and 50% are in the label by construction.
        const loadUnstated = fk === "fuel" && fl && (NF ? nNoLoad : !LOAD_100.test(String(fl.label)));
        if (fv != null && !unsure && fv > hints[hk]) { score -= 300; fuelOver = true; if (loadUnstated) fuelNoLoad = true; else ruled.push(fk); why.push(`tiêu hao${at} ${fv} L/h${fromSheet ? " (tờ hãng động cơ)" : ""} > ${hints[hk]} L/h HSMT cho phép`); }
      }
      // An alternator the supplier labels with its own brand (OWN_BRAND_ALTS) is found in the catalog only from that supplier's
      // own tables: "found" says nothing of it, so neither the +40 nor its figures' bonus; named by the HSMT still counts.
      const ownAlt = a && OWN_BRAND_ALTS.some((x) => x.supplierId === u.supplierId && x.code.test(String(a.model).trim()));
      if (a) { if (!ownAlt) score += 40; if ((a.make || "").split(" / ").some((m) => hints.altMakes.includes(m)) || named(hints, a.model)) { score += 80; why.push("đầu phát HSMT nêu"); } if (!ownAlt) score += 3 * Math.min(new Set(af.map((f) => f.key)).size, 6); }
      score += CONF[s?.confidence] || 0;
      // Not for the named genset model: its table may give no figure in the HSMT's unit (rowPower is then huge).
      if (cap && !gNamed) score -= Math.round(100 * Math.max(0, rowPower(u, cap) / cap.value - 1));
      const maker = sync && s?.role === "genset_oem" ? gensetMakerOf(s) : null;
      if (maker) why.push(`tổ máy của chính hãng ${maker} (HSMT đòi đồng bộ thương hiệu)`);
      // The other arrangement of cylinders than the HSMT asks (Khoa, 2026-11-17): by the row's own "cyl" cell when it
      // names one, else by the engine's sources (below). A source giving the count only says nothing.
      if (hints.cylLayout) {
        // Also a cell of the row written "12.V" / "6.L" / "V-12" (uleengen: the catalog reads no "cyl" from "12.V"); a bare
        // "12V" or "6L" cell is not read here: it may be the battery's volts or the litres.
        const cellLay = (c) => (/^\s*(?:\d{1,2}\s*[.\-]\s*V|V\s*-\s*\d{1,2}|V\d{1,2})\s*$/i.test(c) ? "v" : /^\s*(?:\d{1,2}\s*[.\-]\s*L|L\s*-\s*\d{1,2})\s*$/i.test(c) ? "inline" : null);
        const own = [...(u.specs || []).filter((f) => f.key === "cyl").map((f) => layoutOf(f.value)), ...(u.line ? CAT.cellsOf(u.line).map(cellLay) : [])].filter(Boolean);
        // Of the engine: an arrangement two suppliers at least write. One supplier's table alone is not taken for the
        // engine (aosif writes "12V" for the 6-in-line KTA19-G9A and QSK19; liangzi-yangzhou "12 L" for KTA38), only
        // for its own row. Both arrangements written by two suppliers each: not judged.
        const bySup = { v: new Set(), inline: new Set() };
        for (const f of ef) { const l = f.key === "cyl" ? layoutOf(f.value) : null; if (l) bySup[l].add(f.supplierId ?? ""); }
        const lay = own.length ? own : Object.keys(bySup).filter((k) => bySup[k].size >= 2);
        if (lay.length && lay.every((x) => x !== hints.cylLayout)) { score -= 600; ruled.push("layout"); why.push(`xi lanh ${lay[0] === "v" ? "chữ V" : "thẳng hàng"}, HSMT yêu cầu ${hints.cylLayout === "v" ? "chữ V" : "thẳng hàng"}`); }
      }
      // The row's fuel against the HSMT's (Khoa 20/11/2026): a row whose page says gas / gasoline is dropped for a diesel
      // HSMT (one that names none counts as diesel), a gasoline row for a gas HSMT and the other way round; dual (gasoline
      // + LPG / gas) suits both. A row with no fuel written stays. `u.fuel` is written by web/catalog.js (fuelOf).
      if (fuelOff(hints.fuel, u.fuel)) { score -= 600; ruled.push("fuel"); why.push(`nhiên liệu ${u.fuel === "gas" ? "khí" : u.fuel === "gasoline" ? "xăng" : "xăng / khí"} (${u.fuelWhy || "bảng nguồn"}), HSMT ${hints.fuel === "diesel" ? "diesel" : hints.fuel === "gas" ? "khí" : "xăng"}`); }
      // An engine of the other frequency (Khoa, 2026-11-17: Baudouin 6M33G660/6 and 6M33G633/6, the 1800 rpm / 60 Hz
      // versions, held two of Baudouin's three places for a 50 Hz tender; their rows in tables that name no frequency
      // passed the frequency filter above): every row of the engine that names a frequency names the other one, two
      // rows at least. An engine sold at both (KTA38-G2: 27 rows at 50 Hz, 22 at 60) is not touched.
      if (hints.freq && !u.freq) {
        // Cột tốc độ của chính dòng ("Rated speed (rpm) | 1800", weichai) là tần số của dòng đó; dòng khác cùng động cơ không đè lên.
        const own = hzOfRow(u);
        // Dòng của cả "X" và "X^" (tach-mu-2): tách không làm mã mất dòng ghi tần số.
        const known = [...e.uses, ...twinUses].map(hzOfRow).filter(Boolean);
        if (own && own !== hints.freq) { score -= 600; ruled.push("freq"); why.push(`dòng ghi tốc độ ${own === 60 ? 1800 : 1500} v/p (${own} Hz), HSMT yêu cầu ${hints.freq} Hz`); }
        else if (!own && known.length >= 2 && known.every((f) => f !== hints.freq)) { score -= 600; ruled.push("freq"); why.push(`động cơ chỉ có dòng ${known[0]} Hz, HSMT yêu cầu ${hints.freq} Hz`); }
      }
      const byTwin = (ruled.includes("cyl") && borrowed.some((f) => f.key === "cyl")) || ((ruled.includes("disp") || ruled.includes("maxDisp")) && borrowed.some((f) => f.key === "disp" || f.key === "bore")) || (ruled.includes("freq") && twinUses.some(hzOfRow));
      if (byTwin) why.push(`có dùng số của mã ${caretTwin(e.key)} (nguồn không chú thích "^")`);
      // Tỉ số nén HSMT ghi trơ là số chính xác (Khoa 21/11/2026, IB2600603983: "cần phải khớp với yêu cầu của hsmt"): cùng
      // một thước với bước chấm (comprOff). Nguồn không ghi / mâu thuẫn / không đọc được thì giữ dòng. Gói nhiều cỡ không
      // xét: comprOf đọc cả HSMT, chưa biết con số thuộc cỡ nào.
      if (hints.comprExact && hints.compr != null && !hints.multiSize) {
        // Mã có tiền tố nước ("UK 4006-23TAG2A") là mã gốc do NCC ghi kèm nơi sản xuất: dùng số của mã gốc.
        const off = comprOff([...ef, ...(facts.get(`engine:${COMPR_SAME.get(e.key)}`) || [])], hints.compr);
        if (off) { score -= 600; ruled.push("compr"); why.push(`tỉ số nén ${[...new Set(off.map((f) => String(f.value).trim()))].join(" / ")}, HSMT ghi ${hints.compr}:1`); }
      }
      // NCC tự ghi nước sản xuất ngay trước mã động cơ ("India 4006-23TAG2A", kaihua n122; Khoa 21/11/2026): nước ngoài nhóm
      // HSMT đòi thì loại. Không ghi thì không suy ra. Đọc từ ô của CHÍNH dòng, không từ khoá: khoá có thể gộp về mã gốc.
      const placed = GROUP_ORIGIN.has(origin) && !madeOut ? placeInRow(e, u) : null;
      if (placed && !CAT.COUNTRY_GROUP[origin].includes(placed)) { score -= 600; ruled.push("made"); why.push(`NCC ghi động cơ sản xuất tại ${madeVi(placed)}, HSMT đòi ${GROUP_NAME[origin]}`); }
      if (ruled.length && !isNamed) { dropped.push({ e, u, ruled, src: srcOf, ...(NORM ? { normSkip } : {}) }); continue; }
      rows.push({ e, u, a, score, why, offers, rowCtrl, named: isNamed, maker, ruled, fuelOver, fuelNoLoad, ...(Object.keys(made).length ? { made } : {}), ...(NORM ? { normSkip } : {}) });
    }
  }
  // The prime output (standby ÷ 1.1 when only that is given), in steps of 5% above the HSMT's size; a row below the
  // size, or that gives neither, last.
  const gap = (r) => {
    const p = r.u.power || {}, pr = p.prime?.[cap?.unit] ?? (p.standby?.[cap?.unit] != null ? p.standby[cap.unit] / 1.1 : null);
    return !cap ? 0 : pr == null ? 50 : pr < cap.value * 0.995 ? 99 : Math.round(20 * (pr / cap.value - 1));
  };
  // Rows of equal score keep a fixed order (thu-tu-hang, 2026-11-21): Array.sort is stable, so a tie used to stay in the
  // order the catalog was walked, and any change in the catalog's engine / row order (a merged engine key, a new supplier)
  // swapped two rows of the same score at the end of the top 30 (IB2400371783#0: stone-power NTA855G2 ↔ rise-power
  // P126TIII, both 269). Tie order: nearest the HSMT's size (gap), then a hash of the row's identity (supplier, engine key,
  // alternator): the same set of rows gives the same order whatever the order they were found in, and no supplier is
  // favoured by its name (Khoa 21/11/2026: the alphabetical order of the first measure was biased). The score is untouched.
  // Every sort of `candidates` that can meet a tie uses this order: `rows`, the Đồng bộ `order`, the make lists of MAKE_ROWS
  // (the makes by their first row, the rows in a make), the `keep` replacement and the final `out`; `pick` and Luật B walk
  // lists already in this order (filters, no re-sort).
  // Hash of the row's identity (choiceKey), once per row; the last two keys only break a hash collision.
  const hashes = new WeakMap(), hashOf = (r) => { let h = hashes.get(r); if (h === undefined) hashes.set(r, h = fnv1a(choiceKey(r))); return h; };
  const rowOrder = (x, y) => y.score - x.score || gap(x) - gap(y) || hashOf(x) - hashOf(y) || cmpStr(choiceKey(x), choiceKey(y)) || cmpStr(String(x.u.other || ""), String(y.u.other || ""));
  rows.sort(rowOrder);
  // Chọn dòng hai lần khi luật B bật (Khoa 20/11/2026, đo cloud: B đẩy cả dòng hạng 1 cũ khỏi 30 dòng): `choose(false)` là
  // xếp hạng cũ; `choose(true, 5 dòng đầu của nó)` giữ 5 dòng đó ở hạng 1–5 (vẫn tính vào trần mỗi động cơ / NCC / hãng),
  // luật B chỉ chia các chỗ từ hạng 6. Thân `choose` không thụt lề thêm để diff gọn.
  const choose = (ruleB, pinned = []) => {
  const perEngine = new Map(), perSupplier = new Map(), seen = new Set(), out = [], engSups = new Map();
  const add = (m, k) => m.set(k, (m.get(k) || 0) + 1);
  // The ceiling per make: not when the HSMT names an engine make or model; a make "A / B" counts for A, a row of no make
  // for "?". `exempt` rows (the places held for the genset makers of Đồng bộ) do not count and are never stopped;
  // `free` ignores the ceiling (the last fill).
  const capOn = makeCap > 0 && !hints.engineMakes.length && !rows.some((r) => r.named), perMake = new Map();
  const makeOf = (r) => makeGroup((r.e.make || "?").split(" / ")[0]);
  const open = (r, exempt, free) => !seen.has(choiceKey(r)) && (perEngine.get(r.e.key) || 0) < (r.named ? PER_NAMED_ENGINE : PER_ENGINE) && (perSupplier.get(r.u.supplierId) || 0) < PER_SUPPLIER
    && !(capOn && !exempt && !free && (perMake.get(makeOf(r)) || 0) >= makeCap);
  const take = (r, exempt) => { if (!exempt) add(perMake, makeOf(r)); seen.add(choiceKey(r)); add(perEngine, r.e.key); add(perSupplier, r.u.supplierId); engSups.set(r.e.key, (engSups.get(r.e.key) || new Set()).add(r.u.supplierId)); out.push(r); };
  // Luật B (`models`, Khoa 20/11/2026): chỗ của một hãng động cơ chia cho các MODEL khác nhau trước. Một dòng của model đã
  // có k dòng được chọn chờ, khi hãng đó (có hãng; dòng không rõ hãng không xét) còn dòng mở (`open`) điểm > 0 của model
  // mới có ít hơn k dòng; hết model như vậy thì tới dòng thứ hai của cùng model. Xét lại sau mỗi dòng chọn (trần mỗi NCC /
  // mỗi động cơ / mỗi hãng có thể đóng dòng của model chưa có chỗ). Không `models`: theo thứ tự danh sách như trước.
  const pick = (list, n, { exempt = false, free = false, models = false } = {}) => {
    if (!(models && ruleB)) {
      for (const r of list) { if (out.length >= n) break; if (open(r, exempt, free)) take(r, exempt); }
      return;
    }
    while (out.length < n) {
      const avail = list.filter((r) => open(r, exempt, free)), least = new Map();
      for (const r of avail) if (r.e.make && r.score > 0) { const m = makeOf(r), c = perEngine.get(r.e.key) || 0; if (!least.has(m) || c < least.get(m)) least.set(m, c); }
      // Một model chưa đủ B_MIN_SUPPLIERS NCC nhận ngay dòng của NCC MỚI (dòng thứ hai của cùng NCC vẫn chờ như trên).
      const fresh = (x) => { const s = engSups.get(x.e.key); return (s?.size || 0) < B_MIN_SUPPLIERS && !s?.has(x.u.supplierId); };
      const r = avail.find((x) => !x.e.make || fresh(x) || (perEngine.get(x.e.key) || 0) <= (least.get(makeOf(x)) ?? Infinity));
      if (!r) break;
      take(r, exempt);
    }
  };
  // The prime output (standby ÷ 1.1 when only that is given), in steps of 5% above the HSMT's size; a row below the
  // size, or that gives neither, last.
  for (const r of pinned) take(r, false);
  // Đồng bộ thương hiệu asked (Khoa, 2026-11-12, IB2600594596): the rows of genset makers (gensetMakerOf, as syncCheck
  // reads them) keep SYNC_ROWS places, SYNC_PER_SUPPLIER engines a maker, the size nearest the HSMT's first. Their rows
  // name no alternator or controller datasheet and scored below every assembler's (Rehlko D440 / P158LE 165, the 30th
  // row 248), so the 30 rows were all assemblers' whose sets syncCheck then marks not met. A row under a minimum of the
  // HSMT is no row of `rows` (only a `named` one stays, with its 600 points off); a score of 0 or below (a fuel
  // consumption over the limit takes 300) still keeps no place.
  // One row of each maker first, then a second engine of each: the first measure gave all 6 places to three makers in
  // China with two rows each (Jet-Power, Bobig, Wintpower) and none to Rehlko, FG Wilson or Cummins at 300 kVA.
  if (sync) {
    const order = (x, y) => gap(x) - gap(y) || rowOrder(x, y), bySup = new Map();
    for (const r of rows.filter((r) => r.maker && r.score > 0).sort(order)) {
      const list = bySup.get(r.u.supplierId) || [];
      if (list.length < SYNC_PER_SUPPLIER && !list.some((x) => x.e.key === r.e.key)) bySup.set(r.u.supplierId, [...list, r]);
    }
    const rounds = Array.from({ length: SYNC_PER_SUPPLIER }, (_, i) => [...bySup.values()].map((l) => l[i]).filter(Boolean).sort(order));
    pick(rounds.flat(), Math.min(max, out.length + SYNC_ROWS), { exempt: true });
  }
  const held = new Set(out);
  // No origin required (no G7 / G20 in the HSMT): Chinese makes keep CN_ROWS of the rows (Khoa, 2026-11-05: a Chinese
  // configuration that meets the HSMT better goes first, so it must be among the suggestions). Foreign engines have
  // more datasheet figures and would otherwise fill the rows. Not when the HSMT names an engine make or model.
  // Luật B cũng áp ở đây (Khoa 20/11/2026 "áp luôn cho các hãng trung quốc"): trong 12 chỗ, mỗi hãng TQ chia cho các
  // model của nó trước (SDEC SC9D340D2 từng chiếm 3 chỗ).
  if (patches && origin === "all" && !hints.engineMakes.length && !rows.some((r) => r.named)) pick(rows.filter((r) => CAT.originOf(r.e) === "cn"), Math.min(CN_ROWS, max), { models: true });
  // G7 / G20 asked, no make named (Khoa, 2026-11-11, IB2600603983): every make of the group with a fitting row keeps
  // MAKE_ROWS rows of different engines, best make first. Cummins and Perkins have the most datasheet figures and filled
  // the 30 rows; Baudouin 6M31G825/5 (750 kVA prime, offered by four suppliers) stood 361st. A row the HSMT rules out
  // (score 0 or below: a fuel consumption over the limit; a row under a minimum is not here at all) keeps no place.
  if (patches && GROUP_ORIGIN.has(origin) && !hints.engineMakes.length && !rows.some((r) => r.named)) {
    const byMake = new Map();
    for (const r of rows) {
      const m = makeGroup((r.e.make || "").split(" / ")[0]);
      if (m && r.score > 0) byMake.set(m, [...(byMake.get(m) || []), r]);
    }
    // Within a make, the size nearest the HSMT's first (gap, in steps of 5%), then the score: Baudouin's 12M26G900/5
    // (815 kVA) had more figures than 6M31G825/5 (750 kVA) for 700 kVA.
    for (const list of [...byMake.values()].sort((a, b) => rowOrder(a[0], b[0]))) {
      const engines = new Set(), sorted = [...list].sort((x, y) => gap(x) - gap(y) || rowOrder(x, y));
      // Luật B: mọi dòng của hãng, model khác nhau trước rồi tới dòng thứ hai của cùng model (hãng ít model hơn MAKE_ROWS
      // nay vẫn đủ chỗ); tắt B: mỗi động cơ một dòng như trước.
      if (ruleB) pick(sorted, Math.min(max, out.length + MAKE_ROWS), { models: true });
      else pick(sorted.filter((r) => !engines.has(r.e.key) && engines.add(r.e.key)), Math.min(max, out.length + MAKE_ROWS));
    }
  }
  // Luật B ở lượt lấp chung khi có trần mỗi hãng (`capOn`: HSMT không nêu hãng / model động cơ).
  pick(rows, max, { models: capOn });
  if (out.length < max) pick(rows, max, { free: true });
  // The rows of the configurations the last run chose (Khoa 2026-11-12: `keep`, the supplierId + engine key of each, from
  // prevResult) stay among the rows for every tender, not only for Đồng bộ: a configuration that still passes the hard
  // filters (the power band, the HSMT's minimums: its rows are in `rows`) keeps its best row, in place of the
  // lowest-scored row that is neither held nor of the last run. Neither the ceiling per make nor the limits per engine /
  // supplier stop it.
  if (keep?.size) {
    const pairOf = (r) => `${r.u.supplierId}\n${r.e.key}`, kept = (r) => keep.has(pairOf(r)), have = new Set(out.map(pairOf));
    for (const r of rows.filter(kept)) {
      if (have.has(pairOf(r))) continue;
      const gone = out.filter((x) => !held.has(x) && !kept(x)).sort((x, y) => rowOrder(y, x))[0];
      if (!gone) break;
      out.splice(out.indexOf(gone), 1, r); have.add(pairOf(r));
    }
  }
  const pin = new Map(pinned.map((r, i) => [r, i]));
  out.sort((x, y) => (pin.get(x) ?? pinTop) - (pin.get(y) ?? pinTop) || rowOrder(x, y));
  return out;
  };
  const old = choose(false);
  return { top: ruleB ? choose(true, old.slice(0, pinTop)) : old, all: rows, dropped };
}
// The rows of the configurations a result chose (candidates `keep`): supplierId + engine key of each supplier and of
// the engine's catalog source.
// NOT passed by prep any more (Khoa, 2026-11-17: "khi gợi ý lại thì không cần giữ dòng của các lượt trước"): the rule
// (PR #543, 2026-11-12) kept a shown configuration from vanishing when places were held for other rows, but it also
// hid that a configuration no longer earned its place (IB2600603983: QSK23-G2 stood 127th and stayed only by it).
// Gợi ý lại now ranks from nothing. keepFound (what Tìm NCC and the internet added) is another rule and stays.
export function keepOf(result) {
  const out = new Set();
  for (const c of result?.configs || []) {
    const k = c.engine?.model && CAT.keyOf(c.engine.model);
    if (!k) continue;
    for (const s of c.suppliers || []) if (s.supplierId) out.add(`${s.supplierId}\n${k}`);
    if (c.engine.src?.kind === "catalog" && c.engine.src.supplierId) out.add(`${c.engine.src.supplierId}\n${k}`);
  }
  return out;
}
// At most 8 configurations (Khoa 2026-11-17: 6 → 8, with Mitsubishi down to one; 2026-11-03 had cut 10 → 6 for speed).
export const MAX_CONFIGS = 8, PER_MAKE_CONFIGS = 2;
// Perkins and Volvo Penta: one configuration only, the best ranked (Khoa, 2026-11-17, IB2600603983: 4006-23TAG2A and
// 4006-23TAG3A took ranks 1 and 2, the same set one size apart; the place goes to another make). The other makes keep 2.
// A configuration kept from Tìm NCC or of the genset the HSMT names is outside the limit, as before.
// Cummins too (Khoa, 2026-11-17, same tender: QSK23-G2 and QSK19-G20 at ranks 1 and 3).
// Mitsubishi too (Khoa, 2026-11-17).
export const ONE_CONFIG_MAKES = ["perkins", "volvo penta", "cummins", "mitsubishi"];
// Baudouin: 3 configurations (Khoa 20/11/2026, IB2600603983: "Sửa lại luật để Baudouin được 3 cấu hình").
export const THREE_CONFIG_MAKES = ["baudouin"];
export const perMakeConfigs = (make) => {
  const mk = String(make || "").split("/")[0].trim().toLowerCase();
  return ONE_CONFIG_MAKES.includes(mk) ? 1 : THREE_CONFIG_MAKES.includes(mk) ? 3 : PER_MAKE_CONFIGS;
};
// A configuration whose controller (engine, alternator) is that of an earlier one may leave out the checks of that
// part: the code copies them: a check read from the model's figures (factSrc), one whose quote is also in this
// configuration's own source of that part, and a controller function no source states. Each copy is then checked
// against this configuration's sources like any other check.
export function copyModelChecks(configs, textOf = () => "") {
  for (const [i, c] of configs.entries()) {
    for (const part of ["controller", "engine", "alternator"]) {
      // A controller written two ways ("DSE7320", "Deepsea 7320") is one model (2026-11-03: the second had no checks).
      const keyOf = (p) => p?.model && CAT.keyOf(part === "controller" ? ctlModelOf(p) : p.model);
      const key = keyOf(c[part]);
      const prev = key && configs.slice(0, i).find((p) => keyOf(p[part]) === key);
      if (!prev) continue;
      const have = new Set((c.checks || []).map((x) => norm(x.item)));
      const own = textOf(c[part].src) || "";
      const fits = (x) => x.factSrc || (x.sourceQuote && own.includes(norm(x.sourceQuote))) || (part === "controller" && x.status === "unclear" && !x.parts);
      const copies = (prev.checks || []).filter((x) => x.part === part && !x.byCode && !have.has(norm(x.item)) && (x.parts ? x.parts.every(fits) : fits(x)));
      if (copies.length) c.checks = [...(c.checks || []), ...copies.map((x) => ({ ...JSON.parse(JSON.stringify(x)), copiedFrom: prev.rank }))];
    }
  }
}
const factLine = (f) => `${CAT.SPEC[f.key]?.vi || RATED_VI[f.key] || f.key}: ${f.value} — factSrc: { "supplierId": "${f.supplierId}", "n": ${f.n}, "line": ${JSON.stringify(f.line)} }`;
export function catalogMd(cat, cap, hints, opts = {}) {
  const facts = opts.facts || modelFacts(cat, opts.suppliers || []), { top, all } = candidates(cat, cap, hints, { ...opts, facts });
  const sup = new Map((opts.suppliers || []).map((s) => [s.id, s])), shown = new Set(), headers = new Map(), sheetShown = new Map();
  // A table whose models run across: each row with this model's own cell after it, so no other column is taken; the
  // row is quoted whole (check takes the figure from that column).
  const rowText = (u) => {
    // A one-model genset datasheet whose power row names no engine (catalog.js fromLine): the engine is the record's
    // product line of that source, as mergeFind says; src.line is the power row, word for word.
    if (u.fromLine) return `  line: ${u.line}\n  (động cơ ${u.model || ""} theo dòng sản phẩm của bản ghi: datasheet tổ máy${u.genset ? ` ${u.genset}` : ""} một model, chữ trang tách cột nên không dòng nào ghi cả động cơ và công suất; dòng trên là dòng bảng ghi công suất, dùng làm src.line / suppliers[].line)`;
    if (u.line) return `  line: ${u.line}`;
    const rows = u.lines?.rows || [], k = CAT.keyOf(u.model || ""), cells = rows.map(CAT.cellsOf);
    const at = cells.find((cs) => cs.length >= 3 && cs.slice(1).some((x) => CAT.keyOf(x) === k));
    const j = at ? at.findIndex((x, i) => i > 0 && CAT.keyOf(x) === k) : -1;
    if (j < 1) return `  bảng một model: ${rows.join(" ; ")}`;
    // Counted from the right: rows have one or two label cells, the model columns line up at the end.
    const off = at.length - j, cell = (cs) => (cs.length - off >= 1 ? cs[cs.length - off] : "?");
    return `  bảng nhiều model theo cột (${u.model} là cột thứ ${off} từ phải; sourceQuote là nguyên dòng, src.line là dòng "${rows[cells.indexOf(at)]}"): ${rows.map((r, i) => `${r} → ${cell(cells[i])}`).join(" ; ")}`;
  };
  const out = [`# Danh mục trong hệ thống${cap ? ` (tổ máy ${cap.value} ${cap.unit}, từ ${bandOf(cap).text})` : ""}${hints.freq ? `, ${hints.freq} Hz` : ""} — code đã xếp sẵn`, "",
    "Thứ tự ưu tiên khi xếp: model động cơ / hãng động cơ HSMT nêu, bộ điều khiển HSMT nêu, động cơ có nhiều thông số có nguồn, rồi mới tới đầu phát; công suất càng sát càng tốt.", "",
    ...(hints.sizeNote ? [hints.sizeNote, ""] : []),
    `## Ứng viên (${top.length} dòng tổ máy, tốt nhất trước)`, ""];
  top.forEach((r, i) => {
    const { e, u, a } = r, s = sup.get(u.supplierId);
    shown.add(u.supplierId);
    if (u.header?.length) headers.set(`${u.supplierId} n ${u.n}`, u.header.join(" "));
    out.push(`### ${i + 1}. ${u.genset || (r.why.some((w) => w.startsWith("tổ máy đúng model")) && u.title ? `bảng "${u.title}" (tổ máy HSMT nêu)` : "(không ghi model tổ máy)")} — động cơ ${e.model}${e.make ? ` (hãng ${e.make}, theo ${[...new Set(e.makes.map((m) => m.via))].join(", ")})` : e.makeConflict ? ` (chưa rõ hãng: nguồn ghi khác nhau ${e.makeConflict.map((x) => x.name).join(" / ")})` : " (nguồn không ghi hãng)"}, đầu phát ${a ? `${a.model}${a.make ? ` (${a.make})` : ""}` : u.other || "không ghi"}`,
      `- supplierId: ${u.supplierId}, n: ${u.n}${s ? `, quốc gia: ${s.country || "?"}, độ tin cậy: ${s.confidence}, vai trò: ${s.role}` : ""}`, rowText(u));
    if (u.specs?.length) out.push(`  thông số trong dòng: ${u.specs.map((x) => `${x.label} = ${x.value}`).join(" ; ")}`);
    // The genset's one-model datasheet (gensetSheetOf), every block, once per source.
    const gm = u.genset || (titleCodes({ title: u.title }).length === 1 ? titleCodes({ title: u.title })[0] : null), sh = gm && gensetSheetOf(s, u.n, gm);
    if (sh && sh.tables.length > 1) {
      const key = `${u.supplierId}|${u.n}`;
      if (sheetShown.has(key)) out.push(`  datasheet tổ máy ${gm}: như ứng viên ${sheetShown.get(key)} ở trên`);
      else {
        sheetShown.set(key, i + 1);
        out.push(`  datasheet tổ máy ${gm} (nguồn tier A, một model, nhãn | đơn vị | giá trị; mọi dòng của mọi khối là của tổ máy này, trích nguyên dòng làm sourceQuote cho cả động cơ / đầu phát / tổ máy):`,
          ...sh.tables.map((t) => `    [${t.title}] ${t.rows.join(" ; ")}`),
          ...(sh.quotes.length ? [`    [trang của hãng ghi model này] ${sh.quotes.map((q) => q.line).join(" ; ")}`] : []));
      }
    }
    if (r.rowCtrl.length) out.push(`  bộ điều khiển trong dòng: ${r.rowCtrl.map((c) => c.model || c.brand).join(", ")}`);
    const sc = [...new Set((s?.controllers || []).map((c) => c.model || `${c.brand} (không ghi model)`))];
    if (sc.length) out.push(`  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ${sc.join(", ")}`);
    if (r.why.length) out.push(`  lý do xếp: ${r.why.join("; ")}`);
    out.push("");
  });
  if (opts.makerMd) out.push(opts.makerMd, "");
  // Every figure of the models above, from any supplier's row or datasheet, with the factSrc to quote.
  out.push("## Thông số theo model (dùng cho mọi cấu hình có model đó; ghi factSrc như dưới)", "");
  // A figure an earlier run found on the internet (source n 2001–2999): whether its page is on the maker's own domain
  // (web-memo.mjs isOfficial, computed by code). Only shown; the figure counts as before (Khoa 2026-11-12, phương án B).
  const official = MEMO.officialOfSource(opts.suppliers || []);
  const webTag = (f) => (Number(f.n) > 2000 && Number(f.n) < 3000 && official.has(`${f.supplierId}#${f.n}`)
    ? official.get(`${f.supplierId}#${f.n}`) ? " (tìm trên internet, trang chính hãng)" : " (tìm trên internet, trang không phải của hãng)" : "");
  const models = [];
  for (const r of top) {
    if (!models.some((m) => m.kind === "engine" && m.x.key === r.e.key)) models.push({ kind: "engine", x: r.e });
    if (r.a && !models.some((m) => m.kind === "alternator" && m.x.key === r.a.key)) models.push({ kind: "alternator", x: r.a });
  }
  for (const { kind, x } of models) {
    const list = facts.get(`${kind}:${x.key}`) || [], bad = factConflicts(list);
    out.push(`### ${kind === "engine" ? "Động cơ" : "Đầu phát"} ${x.model}${x.make ? ` — hãng: ${x.make}` : ""}`);
    if (!list.length) out.push("- (chưa có thông số nào có nguồn)");
    for (const key of [...new Set(list.map((f) => f.key))]) {
      if (bad.has(key)) out.push(`- ⚠ ${CAT.SPEC[key]?.vi || RATED_VI[key] || key}: các nguồn ghi khác nhau (${bad.get(key).join(" / ")}) — không dùng làm "met"`);
      // Two sources a figure, the shortest lines first (a datasheet line before a whole row); all of them when they disagree.
      const same = list.filter((g) => g.key === key).sort((a, b) => a.line.length - b.line.length);
      for (const f of bad.has(key) ? same.slice(0, 4) : same.slice(0, 2)) out.push(`- ${factLine(f)}${webTag(f)}`);
    }
    out.push("");
  }
  // The controllers of the rows above that have their maker's datasheet (the HSMT's make first, then the most offered),
  // each line word for word: what a controller check quotes, with factSrc { supplierId, n, line }.
  // A controller the HSMT names first, then one a candidate row itself names (that genset comes with it), then one its
  // supplier offers on another page.
  const ctlCount = new Map(), bump = (m, v) => ctlCount.set(m, (ctlCount.get(m) || 0) + v);
  for (const r of top) {
    const make = (c) => (hints.ctrlMakes.includes(c.brand) ? 5 : 0);
    for (const c of r.rowCtrl) if (c.model) bump(c.model, 20 + make(c));
    for (const c of r.offers) if (c.model) bump(c.model, 1 + make(c));
  }
  for (const [m] of ctlCount) if (hints.ctrlModels.includes(CAT.keyOf(m))) bump(m, 1000);
  const hasSheet = (m) => factsFor(facts, "controller", m).length > 0, ctls = [];
  // Each of the 8 best rows brings every controller with a datasheet that it names or its supplier offers, so the
  // controllers of the configurations the agent is likely to pick are all there; the most named fill the rest.
  // The limit counts datasheets, not models: the models of one sheet (HGM6110N, HGM6120N, HGM6120CAN...) or one model
  // written with and without its generation (DSE8610, DSE8610 MKII) take one place, so they do not push others out.
  const MAX_CTL = 12, sheets = new Set(), sheetsOf = (m) => factsFor(facts, "controller", m).map((f) => `${f.supplierId}#${f.n}`);
  const take = (m) => {
    if (!m || ctls.includes(m) || !hasSheet(m)) return;
    const mine = sheetsOf(m);
    if (sheets.size >= MAX_CTL && !mine.every((k) => sheets.has(k))) return;
    ctls.push(m); mine.forEach((k) => sheets.add(k));
  };
  for (const r of top.slice(0, 8)) for (const c of [...r.rowCtrl, ...r.offers].sort((a, b) => ctlCount.get(b.model) - ctlCount.get(a.model))) take(c.model);
  for (const [m] of [...ctlCount].sort((a, b) => b[1] - a[1])) take(m);
  // Every line goes to controllers.md (a datasheet runs to 250 lines, a SmartGen manual to 700): the agent searches it
  // with grep; catalog.md shows the first 15 lines of each.
  const ctlOut = [], printed = new Map(), head = "Thông số bộ điều khiển (datasheet của hãng; ghi factSrc với supplierId, n và line là dòng nguyên văn)";
  // bdk-amf (Khoa 20/11/2026): the kind of a controller as its maker's datasheet writes it (CM.ctlKinds), in each title.
  const kinds = CM.ctlKinds(opts.suppliers || [], { modelsIn: ctlModelsIn }), kindTag = (m) => { const k = CM.kindOf(kinds, m); return k ? ` — loại theo datasheet hãng: ${CM.KIND_VI[k]}` : ""; };
  // A controller's datasheet: the first 15 lines to catalog.md (`out`, when given), every line to controllers.md.
  const sheetMd = (m, out) => {
    if (!ctlOut.length) ctlOut.push(`# ${head}`, "");
    {
      const list = factsFor(facts, "controller", m), by = new Map();
      for (const f of list) by.set(`${f.supplierId}#${f.n}`, [...(by.get(`${f.supplierId}#${f.n}`) || []), f]);
      for (const [k, fs] of by) {
        const ver = fs[0].version ? ` — datasheet của ${fs[0].version} (nhà cung cấp ghi ${m}: cần xác nhận đời)` : "";
        const title = `### ${m}${ver} — supplierId: ${fs[0].supplierId}, n: ${fs[0].n}${kindTag(fs[0].version || m)}`;
        // One model's lines are written once, even when two controllers above use them (DSE7320 and DSE7320 MKII);
        // two models of one datasheet (DSE7310 MKII, DSE7320 MKII) have lines of their own.
        const same = `${k}|${CAT.keyOf(fs[0].version || m)}`;
        if (printed.has(same)) { for (const o of [out, ctlOut].filter(Boolean)) o.push(`${title}: các dòng như ở mục ${printed.get(same)}`, ""); continue; }
        printed.set(same, m);
        out?.push(title, ...fs.slice(0, 15).map((f) => `- ${f.line}`), fs.length > 15 ? `- … (${fs.length - 15} dòng nữa trong controllers.md)` : "", "");
        ctlOut.push(title, ...fs.map((f) => `- ${f.line}`), "");
      }
    }
  };
  if (ctls.length) {
    out.push(`## ${head} — đầu mỗi datasheet; TOÀN BỘ dòng ở controllers.md, tìm chức năng bằng grep trong đó`, "");
    for (const m of ctls) sheetMd(m, out);
  }
  // Other suppliers whose rows name the same engine: what a configuration's `suppliers` are picked from.
  out.push("## Nhà cung cấp khác có dòng ghi cùng động cơ (để chọn suppliers)", "");
  for (const { kind, x } of models) {
    if (kind !== "engine") continue;
    // One row per supplier not yet listed with this engine; every supplier of the engine the HSMT names.
    const listed = new Set(top.filter((r) => r.e.key === x.key).map((r) => r.u.supplierId)), more = [];
    const most = all.some((r) => r.e.key === x.key && r.named) ? 40 : 4;
    for (const r of all) if (r.e.key === x.key && !listed.has(r.u.supplierId) && more.length < most) { listed.add(r.u.supplierId); more.push(r); }
    if (!more.length) continue;
    out.push(`### ${x.model}`);
    for (const r of more) {
      shown.add(r.u.supplierId);
      if (r.u.header?.length) headers.set(`${r.u.supplierId} n ${r.u.n}`, r.u.header.join(" "));
      out.push(`- supplierId: ${r.u.supplierId}, n: ${r.u.n}${r.u.genset ? `, tổ máy: ${r.u.genset}` : ""}${r.u.other ? `, đi kèm: ${r.u.other}` : ""}`, rowText(r.u));
    }
    out.push("");
  }
  // The engines near the power left out of the list above, so the agent knows they exist.
  const rest = [...new Map(all.filter((r) => !models.some((m) => m.kind === "engine" && m.x.key === r.e.key)).map((r) => [r.e.key, r])).values()].slice(0, 40);
  if (rest.length) {
    out.push(`## Động cơ khác trong khoảng công suất (${rest.length}, điểm thấp hơn; mỗi động cơ một dòng)`, "");
    for (const r of rest) {
      shown.add(r.u.supplierId);
      if (r.u.header?.length) headers.set(`${r.u.supplierId} n ${r.u.n}`, r.u.header.join(" "));
      out.push(`- ${r.e.model}${r.e.make ? ` (${r.e.make})` : ""} — supplierId: ${r.u.supplierId}, n: ${r.u.n}`, rowText(r.u));
    }
    out.push("");
  }
  // A table's header is written once (it was repeated on every row); a header that took in the table's rows is cut.
  out.push("## Tiêu đề bảng (header của mỗi bảng supplierId n, dùng được cho sourceQuote)", "");
  for (const [k, h] of headers) out.push(`- ${k}: ${h.length > 600 ? h.slice(0, 600) + " …" : h}`);
  // Every controller of the "Bộ điều khiển" list that has its maker's datasheet gets all its lines in controllers.md too
  // (an agent picking one past the 12 above used to find no datasheet and write `unclear`, e.g. DSE7410).
  const withSheet = new Set(ctls);
  for (const e of (cat.controllers || []).filter((e) => e.uses.some((u) => shown.has(u.supplierId)))) {
    if (e.model && !withSheet.has(e.model) && hasSheet(e.model)) { sheetMd(e.model); withSheet.add(e.model); }
  }
  // bdk-amf (Khoa 20/11/2026 "1. Có"): every other controller of the same makes as above with a datasheet of its maker
  // (controller_maker), which no supplier of the configuration may offer: listed with its kind, all its lines in controllers.md.
  // A configuration that uses one writes it as "Bộ điều khiển chọn theo tài liệu hãng, NCC chưa chào".
  const brands = new Set(ctls.flatMap((m) => CAT.controllersIn(m).filter((x) => x.model).map((x) => norm(x.brand))));
  const makerOnes = [], covered = new Set([...withSheet].flatMap((m) => [CAT.keyOf(m), ...factsFor(facts, "controller", m).map((f) => CAT.keyOf(f.version || ""))]).filter(Boolean));
  for (const k of [...facts.keys()].filter((y) => y.startsWith("controller:")).sort()) {
    if (!facts.get(k).some((f) => (opts.suppliers || []).find((s) => s.id === f.supplierId)?.role === "controller_maker")) continue;
    const sm = facts.get(k).find((f) => f.sheetModel)?.sheetModel || k.slice(11);
    const x = CAT.controllersIn(sm).find((y) => y.model && CAT.keyOf(y.model) === k.slice(11) && brands.has(norm(y.brand)));
    if (x && !withSheet.has(x.model) && !covered.has(CAT.keyOf(x.model)) && !makerOnes.some((y) => CAT.keyOf(y.model) === CAT.keyOf(x.model))) makerOnes.push(x);
  }
  if (makerOnes.length) {
    out.push("", `## Bộ điều khiển theo datasheet hãng (NCC chưa chào) — ${makerOnes.length} model, toàn bộ dòng ở controllers.md`, "");
    if (opts.hsmtText && CM.needsAmf(technicalPart(opts.hsmtText) || opts.hsmtText, { head: opts.hsmtText.slice(0, 3000) })) out.push("HSMT có bộ điều khiển phải giám sát lưới / điều khiển ATS / tự khởi động khi mất lưới: loại tự động khi mất lưới (AMF) theo datasheet hãng.", "");
    for (const x of makerOnes) {
      const f = factsFor(facts, "controller", x.model)[0];
      out.push(`- ${x.model} (${x.brand})${kindTag(x.model) || " — loại: datasheet hãng không ghi"} — supplierId: ${f.supplierId}, n: ${f.n}`);
      sheetMd(x.model); withSheet.add(x.model);
    }
    out.push("");
  }
  const low = opts.hsmtText ? lowestCtlMd([...withSheet], facts, opts.suppliers || [], opts.hsmtText, kinds) : "";
  if (low) out.push("", low);
  out.push("", controllersMd(cat.controllers || [], shown, withSheet));
  // The controller functions the HSMT names × the datasheets above (ctl-lookup.md), when prep gives the HSMT.
  const ctlLookup = opts.hsmtText ? ctlLookupMd(ctls, (m) => factsFor(facts, "controller", m), opts.hsmtText) : "";
  return { md: out.join("\n"), ctlMd: ctlOut.join("\n"), shown, top, ctlLookup };
}
// The communication functions the HSMT asks of the controller, read by code from its technical part (one name per function
// of CM.SUBS: "4G", "Ethernet", "RS485"...): lines that name one and speak of communication / remote / a port.
const COMM_LINE = /truy[ềe]n\s+th[ôo]ng|t[ừu]\s+xa|k[ếe]t\s+n[ốo]i|c[ổo]ng|giao\s+ti[ếe]p|gi[áa]m\s+s[áa]t|communicat|\bport|RS-?485|RS-?232|ethernet|\bUSB\b|\b4G\b|modbus/i;
export function hsmtCommNames(hsmtText) {
  const lines = (technicalPart(hsmtText || "") || String(hsmtText || "")).split("\n").filter((l) => COMM_LINE.test(l));
  return CM.SUBS.filter((s) => lines.some((l) => s.vi.test(l))).map((s) => s.k);
}
// "Bộ thấp nhất đủ yêu cầu theo code" (điều phối 21/11/2026, IB2600603983: the agent kept DSE7420 MKII, reading "meets every
// controller requirement" on the controller's own datasheet, while Khoa counts 4G / Internet / Ethernet of the module, Q2 / Q4,
// and the answer is DSE7320 MKII + DSE890 MKII): each controller with a datasheet, per make, scored with its best modules
// (CM.bestPair) on the communication functions the HSMT names; the kind the HSMT asks (AMF, synchronising) only; the lowest
// step (CM.ctlStep, inferred from the names) among those meeting the most is marked. The agent still checks every function.
// The kind of controller the HSMT asks for: "sync" (hòa đồng bộ, chạy song song), "amf" (CM.needsAmf) or null.
export function ctlKindNeed(hsmtText) {
  const tech = technicalPart(hsmtText || "") || String(hsmtText || "");
  return /h[òo][àa]?\s+đ[ồo]ng\s+b[ộo]|ch[ạa]y\s+song\s+song|h[òo][àa]\s+l[ưu][ớo]i/i.test(tech) ? "sync" : CM.needsAmf(tech, { head: String(hsmtText || "").slice(0, 3000) }) ? "amf" : null;
}
export function lowestCtlMd(models, facts, suppliers, hsmtText, kinds) {
  const names = hsmtCommNames(hsmtText);
  if (!names.length || !models.length) return "";
  const need = ctlKindNeed(hsmtText);
  const modFacts = CM.moduleFacts(suppliers), byMake = new Map();
  for (const m of models) {
    const list = factsFor(facts, "controller", m), x = CAT.controllersIn(m).find((y) => y.model);
    if (!list.length || !x) continue;
    const sheet = list.find((f) => f.version)?.version || m, kind = CM.kindOf(kinds, sheet) || CM.kindOf(kinds, m);
    if (need === "sync" ? kind !== "sync" : need === "amf" ? kind && kind !== "amf" : false) continue;
    const keys = new Set([CAT.keyOf(m), ...list.map((f) => CAT.keyOf(f.sheetModel || ""))].filter(Boolean));
    const bp = CM.bestPair(names, list, CM.compatModules(list, keys, modFacts, ctlKeys), modFacts);
    const make = x.brand || "?", rows = byMake.get(make) || [];
    if (!rows.some((r) => CAT.keyOf(r.model) === CAT.keyOf(sheet))) rows.push({ model: sheet, kind, step: CM.ctlStep(sheet), ...bp });
    byMake.set(make, rows);
  }
  if (!byMake.size) return "";
  const out = ["## Bộ điều khiển thấp nhất đủ yêu cầu theo code (mỗi hãng)", "",
    `Code chấm mỗi bộ điều khiển có datasheet ở trên CÙNG mô-đun truyền thông tốt nhất của nó (4G / Internet / Ethernet lấy từ mô-đun được tính, như luật mô-đun) trên các chức năng truyền thông HSMT nêu: ${names.join(", ")}${need ? `; chỉ loại ${CM.KIND_VI[need]} vì HSMT đòi` : ""}. "← thấp nhất đủ" là bộ bậc thấp nhất (bậc suy từ tên model) trong các bộ đạt nhiều nhất của hãng. Chỉ là chỉ dẫn: vẫn chấm mọi yêu cầu bộ điều khiển trên datasheet.`, ""];
  for (const [make, rows] of byMake) {
    const best = Math.max(...rows.map((r) => r.met)), step = (r) => (r.step == null ? Infinity : r.step);
    const pick = rows.filter((r) => r.met === best).sort((a, b) => step(a) - step(b))[0];
    out.push(`### ${make}`);
    for (const r of rows.sort((a, b) => step(a) - step(b) || b.met - a.met)) {
      out.push(`- ${r.model}${r.modules.length ? ` + ${r.modules.map((y) => y.model).join(" + ")}` : ""}${r.kind ? ` (${CM.KIND_VI[r.kind]})` : ""}: đạt ${r.met}/${r.total}${r.unclear.length ? `, chưa rõ: ${r.unclear.join(", ")}` : ""}${r === pick ? (r.met === r.total ? " ← thấp nhất đủ" : " ← thấp nhất trong các bộ đạt nhiều nhất của hãng (chưa bộ nào đủ)") : ""}`);
    }
    out.push("");
  }
  return out.join("\n");
}
// Bộ điều khiển (Khoa, 2026-11-01): the controllers each supplier offers, with the line of its page or genset row that
// names it; a configuration's controller and its "Bộ điều khiển" check quote one of these lines.
// Only the suppliers whose rows catalog.md shows, so the file stays small.
function controllersMd(all, ids, withSheet = new Set()) {
  const list = all.filter((e) => e.uses.some((u) => ids.has(u.supplierId)));
  const out = [`## Bộ điều khiển (${list.length}) — của các nhà cung cấp có dòng ở trên, dòng nguyên văn trên trang của họ`, ""];
  for (const e of list) {
    out.push(`### ${e.model}${e.make ? ` — hãng: ${e.make}` : ""}${withSheet.has(e.model) ? " — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)" : ""}`);
    const seen = new Set();
    for (const u of e.uses) {
      if (!ids.has(u.supplierId) || seen.has(u.supplierId) || seen.size >= 8) continue;
      seen.add(u.supplierId);
      out.push(`- supplierId: ${u.supplierId}, n: ${u.n}${u.genset ? `, tổ máy: ${u.genset}` : ""}${u.other ? `, động cơ trong dòng: ${u.other}` : ""}`, `  line: ${u.line}`);
    }
    out.push("");
  }
  return out.join("\n");
}
// The suppliers behind the catalog rows, as recorded in the supplier DB (every fact there has a source).
function suppliersMd(suppliers) {
  const out = ["# Nhà cung cấp trong hệ thống (CSDL supplier/<id>)", ""];
  for (const s of suppliers) {
    if (!s.specTables?.length) continue;
    const vn = (s.vietnam?.distributors || []).map((d) => d.name).join("; "), hq = [s.hq?.city, s.hq?.province].filter(Boolean).join(", ");
    out.push(`- ${s.id}: ${s.names?.en || s.names?.zh || s.id} — vai trò: ${s.role}, trạng thái: ${s.status}, độ tin cậy: ${s.confidence}`
      + `${s.country ? `, quốc gia: ${s.country}` : ""}${s.website ? `, website: ${s.website}` : ""}${hq ? `, trụ sở: ${hq}` : ""}${s.founded ? `, thành lập: ${s.founded}` : ""}`
      + `${vn ? `, đại lý tại Việt Nam: ${vn}` : ""}${s.certifications?.length ? `, chứng nhận: ${s.certifications.map((c) => c.name).join("; ")}` : ""}`
      + `${s.controllers?.length ? `, bộ điều khiển: ${s.controllers.map((c) => c.model || `${c.brand} (không ghi model)`).join("; ")}` : ""}`);
  }
  return out.join("\n");
}
const rowPower = (u, cap) => Math.min(...Object.values(u.power || {}).map((p) => p[cap.unit] ?? 1e9), 1e9);

// The HSMT text of a tender (its files, then the notice); `parts` alone is what the requirements are read from.
export async function hsmtTextOf(key, read = doc) {
  const [hsmt, notice] = await Promise.all([read("hsmt", key), read("notice", key)]);
  const parts = [];
  for (let i = 0; i < (hsmt?.textChunks || 0); i++) parts.push((await read("hsmttext", `${key}_${i}`))?.text || "");
  // The notice as text (2026-11-06: it was JSON.stringify'd into one line, so its webform chapter V had "\n" escapes, the
  // agent read it as JSON and no line-by-line reading of it (missingCodes) could work).
  const noticeText = notice ? [notice.info || "", ...(notice.chapters || []).map((c) => `### ${c.name || ""}\n${c.text || ""}`), notice.goods ? `### Danh mục hàng hóa (tab Thông tin chung)\n${notice.goods}` : ""].filter((s) => s.trim()).join("\n\n") : "";
  const text = parts.join("") + (noticeText ? "\n\n--- Thông báo mời thầu ---\n" + noticeText : "");
  if (!text.trim()) throw new Error("Gói này chưa có văn bản HSMT để đọc yêu cầu kỹ thuật. Cần tải hồ sơ (Lấy lại tệp) trước.");
  return { hsmt, parts, text, notice };
}
// What may be missing from the HSMT text the agent gets (read guard, part 2; điều phối 2026-11-12): a hsmttext chunk
// empty or gone, a file with no text (scan the OCR could not read), a webform chapter as long as the bot's cut
// (genbid-sync.js keeps 50,000 characters of each), no file text at all, and technical figures outside the part of the
// HSMT technicalPart gives input.md (one chapter, at most MAX_TP). Each [{ why, lines? }]; lines: where in hsmt.txt
// (1-based) figures are outside that part, for the agent to read with sed. Pure.
export const WEBFORM_CUT = 50000;
export function hsmtGaps({ hsmt = null, parts = [], notice = null, text = "" } = {}) {
  const out = [];
  const empty = parts.map((p, i) => (String(p || "").trim() ? null : i)).filter((i) => i !== null);
  if (empty.length && empty.length < parts.length) out.push({ why: `thiếu ${empty.length}/${parts.length} phần văn bản HSMT trên web (phần ${empty.map((i) => i + 1).join(", ")} rỗng)` });
  if (parts.length && empty.length === parts.length) out.push({ why: "không có chữ của tệp HSMT nào, chỉ có thông báo mời thầu" });
  const scans = (hsmt?.files || []).filter((f) => f.hasText === false);
  if (scans.length) out.push({ why: `${scans.length} tệp HSMT chưa đọc được chữ (bản scan${scans.some((f) => f.ocrTried) ? ", OCR không ra" : ""}): ${scans.map((f) => f.name).join("; ")}` });
  const atCap = (notice?.chapters || []).filter((c) => String(c.text || "").length >= WEBFORM_CUT - 10);
  if (atCap.length) out.push({ why: `chương webform ${atCap.map((c) => `"${c.name}"`).join(", ")} dài đúng mức bot cắt (${WEBFORM_CUT.toLocaleString("vi-VN")} ký tự): phần cuối có thể bị cắt` });
  const tp = technicalPart(text), cut = tpCut, at = tp.length < text.length ? text.indexOf(tp) : -1;
  if (at >= 0) {
    const f = foldSame(text), lines = [];
    let line = 1, pos = 0;
    for (const m of f.matchAll(SPEC_HIT)) {
      if (m.index >= at && m.index < at + tp.length) continue;
      for (; pos < m.index; pos++) if (text.charCodeAt(pos) === 10) line++;
      if (lines[lines.length - 1] !== line) lines.push(line);
    }
    const hits = [...f.slice(0, at).matchAll(SPEC_HIT), ...f.slice(at + tp.length).matchAll(SPEC_HIT)].length;
    if (cut) { const a = text.slice(0, at).split("\n").length; out.push({ why: `phần kỹ thuật dài hơn ${MAX_TP.toLocaleString("vi-VN")} ký tự; input.md chỉ có đoạn nhiều thông số nhất (dòng ${a}–${a + tp.split("\n").length - 1} của hsmt.txt)` }); }
    if (hits >= 10) out.push({ why: `ngoài phần kỹ thuật đưa vào input.md, văn bản HSMT còn ${hits} chỗ nói tới công suất / động cơ / đầu phát`, lines: lines.slice(0, 40) });
  }
  return out;
}
// The allowed formulas, written from web/conversions.js so the prompt and the check use the same list.
const formulasMd = () => "\n## Công thức được phép\n"
  + Object.entries(CONV.FORMULAS).map(([id, f]) => `- \`${id}\`: ${f.label} — đầu vào ${f.inputs.map((n) => `\`${n}\``).join(", ")}; cơ sở: ${f.basis}${f.standard ? `; giá trị chuẩn: ${Object.entries(f.standard).map(([n, st]) => `\`${n}\` = ${st.min}–${st.max} ${st.unit} (${st.basis})`).join("; ")}` : ""}`).join("\n") + "\n";

// `given`: the supplier DB the run already read (run reads it once; check() then uses the same records the agent saw).
// `multi` ({ size, sizes }, sizesOf): a tender of several sizes, this run for one of them.
// ---------- searches already done (web-memo.mjs) ----------
const WEB_MEMO_DIR = MEMO.WEB_MEMO;
// The models of a run: the candidate rows' engines, alternators, gensets and controllers ([{ part, model }]).
export function runModels(top = []) {
  const list = [], add = (part, model) => { if (model && !list.some((m) => m.part === part && CAT.keyOf(m.model) === CAT.keyOf(model))) list.push({ part, model }); };
  for (const r of top) {
    add("engine", r.e?.model); add("alternator", r.a?.model); add("genset", r.u?.genset);
    for (const c of r.rowCtrl || []) add("controller", c.model);
  }
  return list;
}
// What an agent declared it searched and did not find (result.searched) joins the store when the run's log shows it
// (MEMO.recordNegatives). The run's models: those of catalog.md and of the configurations it gave (an internet find).
export function recordSearched(result, { logText = "", listed = [], root = WEB_MEMO_DIR, today = new Date().toISOString().slice(0, 10), tender = "", size = "", suppliers = [], origin = "", hsmtText = "" } = {}) {
  const searched = result?.searched;
  delete result?.searched;
  if (!Array.isArray(searched) || !searched.length) return { added: [], refused: [] };
  const models = Object.fromEntries(MEMO.PARTS.map((p) => [p, new Set()]));
  for (const m of listed) models[m.part]?.add(CAT.keyOf(m.model));
  for (const c of result?.configs || []) for (const p of MEMO.PARTS) if (c[p]?.model) models[p].add(CAT.keyOf(c[p].model));
  const r = MEMO.recordNegatives(MEMO.loadNeg(root), searched, { trace: MEMO.traceOf(logText), models, today, tender, size, suppliers, origin, hsmtKeys: MEMO.modelKeysOf(hsmtText) });
  if (r.added.length) MEMO.saveNeg(r.entries, root, today);
  return r;
}

// io (tests; every default is what the bot uses): doc / allDocs read the web, supDir is the supplier DB of this checkout
// (cn/*.json) read when `local`, memoDir the web memo, today the day its entries are weighed on.
// Quyết định "cho dùng" / "bỏ hẳn" dòng nghi sai trên web (rowok/<NCC>, Chất lượng 1). Không đọc được thì như chưa ai
// quyết: dòng số vô lý vẫn bị loại (thà thiếu còn hơn sai), chỉ dòng đã "cho dùng" tạm thời cũng bị loại.
export async function rowOkOf(readAll) {
  try {
    const list = await readAll("rowok");
    if (!Array.isArray(list)) throw new Error("không phải danh sách");
    return Object.fromEntries(list.map((d) => [d.id, d.data || {}]));
  } catch (e) { console.error(`CẢNH BÁO: không đọc được rowok (${e?.message || e}): dòng "cho dùng" vẫn bị loại lượt này`); return {}; }
}
// Cờ dòng do workflow tính (rowflags/current, cùng dữ liệu NCC bot đọc từ web). Không đọc được: null → blockedRows tự tính.
export async function rowFlagsOf(read) {
  try {
    const rows = (await read("rowflags", "current"))?.rows;
    if (Array.isArray(rows)) return rows;
    throw new Error("chưa có doc");
  } catch (e) { console.error(`CẢNH BÁO: không đọc được rowflags/current (${e?.message || e}): tự tính cờ dòng`); return null; }
}
export async function prep(key, dir, reqData = {}, given = null, multi = null, io = {}) {
  const { doc: read = doc, allDocs: readAll = allDocs, supDir = path.join(ROOT, "cn"), local = !!process.env.GENBID_LOCAL_SUPPLIERS, memoDir = WEB_MEMO_DIR, today = new Date().toISOString().slice(0, 10) } = io;
  fs.mkdirSync(path.join(dir, "web"), { recursive: true });
  // GENBID_LOCAL_SUPPLIERS=1: the supplier DB of this checkout (cn/*.json) instead of the web's, to try records not yet published.
  const localSuppliers = async () => {
    const skip = await skippedOf(readAll); // NCC loại trừ / xoá mềm trên web (sup-skip.mjs); không đọc được thì chỉ cảnh báo, đây là đường thử
    if (!skip.ok) console.error(`CẢNH BÁO: ${UNFILTERED_WARNING} (GENBID_LOCAL_SUPPLIERS)`);
    return dropSkipped(fs.readdirSync(supDir).filter((f) => f.endsWith(".json")).map((f) => ({ id: f.slice(0, -5), data: JSON.parse(fs.readFileSync(path.join(supDir, f), "utf8")) })).filter((d) => d.data.status !== "incomplete"), skip.ids);
  };
  const [analysis, { hsmt, parts, text, notice }, suppliers] = await Promise.all([read("analysis", key), hsmtTextOf(key, read), local ? localSuppliers() : given ? given.map((data) => ({ data })) : readAll("supplier")]);
  fs.writeFileSync(path.join(dir, "hsmt.txt"), text, "utf8");
  const a = analysis?.result;
  const cap = multi ? multi.size.cap : capacity([reqData.bidName, a?.keyInfo?.generatorCapacity, hsmt?.capacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const all = suppliers.map((d) => d.data), hints = hintsOf(text, extraOf(reqData), multi && { size: multi.size, sizes: multi.sizes });
  // Xuất xứ: "Tất cả" (the web's default) and a request from Sync follow the HSMT: the G7 / G20 it requires, else every
  // origin (Khoa, 2026-11-04). Trung Quốc, G7, G20 or Khác chosen on the web stays.
  const fromHsmt = reqData.from === "sync" || originOfReq(reqData.origin) === "all", asked = fromHsmt ? "all" : originOfReq(reqData.origin);
  const auto = fromHsmt ? originOfHsmt(parts.join("")) : null;
  const sync = BP.brandSyncOf(text);
  // The genset make / model the HSMT names (named-genset.mjs): the analysis' lines checked against the HSMT, else the
  // HSMT's own rows. A tender of several sizes with a model each: the rows of those models are scored, not let past the
  // power band (the model of the other size would come in).
  const namedG = NG.namedGensetOf(text, { reqs: NG.specsAsReqs(a?.technicalSpecs) }) || NG.namedGensetOf(text);
  if (namedG) hints.named = { ...namedG, strict: !(multi && namedG.models.length > 1) };
  const origin = auto?.origin || asked, full = CAT.build(all), cn = cnSuppliers(all), partsOnly = partsOnlyOf(origin, parts.join("")), brand = auto?.basis === "brand" && !partsOnly, grp = groupSuppliers(all, origin, !!sync, partsOnly, brand);
  // Its sellers stay whatever the origin rule keeps (Khoa 2026-11-12: "chỉ NCC đặt tại Trung Quốc" never drops the named genset).
  if (grp && namedG) for (const id of NG.namedSuppliers(all, namedG)) grp.add(id);
  const cat = { ...full, engines: byOrigin(full.engines, origin, cn, grp) };
  // The figures of a model still come from every supplier's row or datasheet that names it (a Perkins 4006-23TAG3A is
  // the same engine in a Chinese table); only the rows offered as configurations are those of the group's suppliers.
  const facts = grp ? modelFacts({ ...full, engines: byOrigin(full.engines, origin, cn) }, all) : undefined;
  const offGroup = grp ? new Set(byOrigin(full.engines, origin, cn).flatMap((e) => (e.uses || []).map((u) => u.supplierId)).filter((id) => !grp.has(id))).size : 0;
  const blocked = blockedRows(all, await rowOkOf(readAll), local ? null : await rowFlagsOf(read));
  // Đầu phát theo datasheet hãng (dau-phat-hang B): what the HSMT asks of the alternator, from the analysis' lines here (check
  // reads it again from the agent's requirements), and the models of the makers' sheets that meet it.
  const altMakers = makerAltOn() ? makerAltsOf(all, (a?.technicalSpecs || []).map((s) => withCode({ item: s.item, requirement: s.requirement, quote: s.quote || "", ...(/đ[ầa]u\s*ph[áa]t|c[ủu]\s*ph[áa]t|alternator/i.test(s.item || "") ? { part: "alternator" } : {}) })), { cap, hsmtText: text }) : null;
  const { md, ctlMd, shown, top, ctlLookup } = catalogMd(cat, cap, hints, { suppliers: all, origin, cn, focus: reqData.focus || null, sync, hsmtText: text, blocked, makerMd: altMakers?.md || "", ...(facts ? { facts } : {}) });
  // What earlier runs searched on the internet and did not find, for the models of this run (web-memo.mjs, Khoa 2026-11-12).
  const runList = runModels(top), negMd = MEMO.negativesMd(MEMO.loadNeg(memoDir), runList, today, { origin, hsmtText: text });
  // catalog.md whole for the code and grep; parts under the Read limit for the agent (writeForRead, read-order.json).
  const catFiles = writeForRead(dir, "catalog.md", md + (negMd ? "\n\n" + negMd : "") + "\n\n" + suppliersMd(all.filter((s) => shown.has(s.id))));
  const lookFiles = ctlLookup ? writeForRead(dir, "ctl-lookup.md", ctlLookup) : [];
  fs.writeFileSync(path.join(dir, "models.json"), JSON.stringify(runList), "utf8");
  if (ctlMd) fs.writeFileSync(path.join(dir, "controllers.md"), ctlMd, "utf8");
  // Lets the agent run `check --dir .` itself, offline, instead of reading this script to check by hand.
  fs.writeFileSync(path.join(dir, "suppliers.json"), JSON.stringify(all), "utf8");
  // What of the HSMT text may be missing (hsmtGaps): a section of input.md and, after the run, the result's notes.
  const gaps = hsmtGaps({ hsmt, parts, notice, text });
  // cap: the size of this run, for check to hold an internet configuration to the power band (Khoa 18/11/2026, điều 2).
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin, ...(cap ? { cap } : {}), ...(auto && GROUP_ORIGIN.has(origin) ? { basis: brand ? "brand" : "origin" } : {}), ...(multi ? { sized: true } : {}), ...(gaps.length ? { hsmtGaps: gaps.map((g) => g.why) } : {}) }), "utf8");
  // The analysis' technical lines, for check to list the ones no requirement covers (uncoveredSpecs).
  fs.writeFileSync(path.join(dir, "specs.json"), JSON.stringify((a?.technicalSpecs || []).map(({ item, requirement }) => ({ item, requirement }))), "utf8");
  // The requirements read last time, when the HSMT and Yêu cầu khác are the same (Khoa, 2026-11-02): Gợi ý lại only
  // matches the configurations again. Each quote is checked again by check.
  // Only the HSMT files count: the notice is fetched again each time and its status changes.
  const reqHash = reqHashOf(parts.join(""), extraOf(reqData)), prevReq = reqData.prevResult;
  const reuse = prevReq?.reqHash === reqHash && prevReq.requirements?.length && prevReq.requirements.every((r) => r.level && r.part && r.code && !r.unverified);
  if (reuse)fs.writeFileSync(path.join(dir, "requirements.json"), JSON.stringify(prevReq.requirements.filter((r) => !r.byCode).map(({ code, item, requirement, quote, from, part, level, parts }) => ({ code, item, requirement, quote, ...(from ? { from } : {}), part, level, ...(parts ? { parts: parts.map((p) => ({ item: p.item })) } : {}) })), null, 1), "utf8");
  const inputFiles = writeForRead(dir, "input.md", [
    `# Gói thầu ${key}`, reqData.bidName ? `Tên gói: ${reqData.bidName}` : "", cap ? `Công suất đọc được: ${cap.value} ${cap.unit} (chỉ để lọc danh mục; yêu cầu thật lấy từ HSMT)` : "Chưa đọc được công suất từ tên gói / phân tích.",
    ...(multi?.only ? ["", `## Gói có nhiều cỡ máy: ${multi.sizes.map(sizeText).join("; ")}`, `Lượt Tìm NCC này CHỈ tìm cho máy ${sizeText(multi.size)}.`]
    : multi?.find ? ["", `## Gói có nhiều cỡ máy: ${multi.sizes.map(sizeText).join("; ")}`, `Tìm nhà cung cấp cho mọi cỡ máy này (danh mục trong catalog.md chỉ xếp cho máy ${multi.size.label}).`]
    : multi ? ["", `## Gói có nhiều cỡ máy: ${multi.sizes.map(sizeText).join("; ")}`,
      `Lượt này CHỈ gợi ý cấu hình cho máy ${sizeText(multi.size)} (code đọc từ: "${multi.size.quote}"); các cỡ khác có lượt riêng. Chỉ ghi các yêu cầu của HSMT áp dụng cho máy này hoặc chung cho mọi máy của gói; bỏ yêu cầu chỉ dành cho máy cỡ khác (công suất, tiêu hao nhiên liệu, dung tích, kích thước... của máy khác).`] : []),
    `Lệnh lưu trang web: node "${SCRIPT}" save --dir . --url "<url>"`,
    `Lệnh kiểm tra result.json: node "${SCRIPT}" check --dir .`,
    // newCatalog.json (step 4) checked the way the bot will add it (2026-11-17: a `names` list made Kubota fail verify.mjs
    // and its J112 configuration was dropped after the summary had counted it).
    `Lệnh kiểm tra newCatalog.json (khi có): node "${SCRIPT}" find-check --dir .`, "",
    reuse ? "## Yêu cầu đã đọc lần trước: requirements.json (HSMT và Yêu cầu khác không đổi) — dùng nguyên danh sách đó, bỏ qua bước 1." : "", "",
    // The requirement codes (Khoa, 2026-11-06): every requirement names one; the code fixes its item, part and level.
    "## Mã yêu cầu (bắt buộc: mỗi requirement có `code` từ bảng này; code quyết định `item`, `part`, `level`; không có mã nào hợp thì `other` với item tự đặt)", codesMd(), "",
    `## Xuất xứ động cơ: ${ORIGIN[origin]}`, auto ? `(Bot tự chọn vì HSMT ghi: "${auto.quote}")` : "",
    origin === "cn" ? `Gợi ý động cơ mà nguồn ghi rõ là hãng Trung Quốc (Weichai, Yuchai, SDEC...), ghi "make" của động cơ; động cơ nguồn không ghi hãng thì không gợi ý. Cấu hình động cơ hãng Trung Quốc đứng trước cấu hình động cơ hãng nước khác (Khoa, 2026-11-03). Động cơ hãng nước khác (${[...CAT.FOREIGN_ENGINE].join(", ")}, kể cả loại sản xuất theo giấy phép như Dongfeng Cummins, Chongqing Cummins) chỉ được gợi ý khi có nhà cung cấp đặt tại Trung Quốc (quốc gia CN trong catalog.md) chào động cơ đó trong bảng của mình; khi đó "suppliers" chỉ ghi các nhà cung cấp ở Trung Quốc đó. Khi tìm trên internet cũng vậy: hãng nước ngoài chỉ được tính khi trang của một nhà cung cấp ở Trung Quốc chào nó.`
    : GROUP_ORIGIN.has(origin) ? `Chỉ gợi ý động cơ của hãng thuộc một nước ${GROUP_NAME[origin]} (${CAT.COUNTRY_GROUP[origin].join(", ")}; hãng nước ngoài: ${Object.entries(CAT.ENGINE_COUNTRY).filter(([n, c]) => !CAT.NO_GROUP.has(n) && CAT.COUNTRY_GROUP[origin].includes(c)).map(([n, c]) => `${n} ${c}`).join(", ")}), kể cả khi tìm trên internet; ghi "make" của động cơ. Không gợi ý động cơ của hãng Trung Quốc (Weichai, Yuchai, SDEC...), kể cả loại sản xuất theo giấy phép. Không gợi ý động cơ Deutz (Khoa, 2026-11-11: không tính là G7 / G20 / EU). Động cơ nguồn không ghi hãng thì không gợi ý.\n`
      + (partsOnly ? `Nhà cung cấp (Khoa, 2026-11-10): HSMT chỉ đòi động cơ / đầu phát / bộ điều khiển của hãng ${GROUP_NAME[origin]}, KHÔNG đòi cả tổ máy xuất xứ ${GROUP_NAME[origin]}. Vì vậy gợi ý nhà cung cấp ĐẶT TẠI TRUNG QUỐC (quốc gia CN trong catalog.md) chào tổ máy lắp động cơ hãng ${GROUP_NAME[origin]} (Cummins, Perkins, MTU, Volvo Penta, Mitsubishi...), đầu phát hãng ${GROUP_NAME[origin]} (Stamford, Leroy-Somer, Mecc Alte, Marelli...) và bộ điều khiển hãng ${GROUP_NAME[origin]} (Deep Sea, ComAp...) theo đúng bộ phận nào HSMT đòi; đầu phát / bộ điều khiển hãng Trung Quốc (SmartGen, Nianfeng...) ở bộ phận HSMT đòi ${GROUP_NAME[origin]} là Không đạt.${grp ? ` Code đã bỏ dòng của ${offGroup} nhà cung cấp ngoài Trung Quốc khỏi catalog.md và sẽ bỏ họ khỏi kết quả; khi tìm trên internet (bước 4) cũng chỉ lấy nhà cung cấp / nhà máy tổ máy ở Trung Quốc, ghi \`country\` "CN".` : ""}`
      : `Nhà cung cấp (Khoa, 2026-11-10): chỉ gợi ý nhà cung cấp / hãng tổ máy ĐẶT TẠI một nước ${GROUP_NAME[origin]} (quốc gia ${CAT.COUNTRY_GROUP[origin].join(", ")} trong catalog.md). Nhà lắp ráp ở Trung Quốc hay nước khác ngoài nhóm KHÔNG được gợi ý, kể cả khi chào động cơ Cummins / Perkins / đầu phát Stamford / bộ điều khiển Deep Sea: code đã bỏ dòng của ${offGroup} nhà cung cấp như vậy khỏi catalog.md và sẽ bỏ họ (cùng cấu hình lấy từ dòng bảng của họ) khỏi kết quả. Khi tìm trên internet (bước 4) cũng chỉ lấy tổ máy của hãng đặt tại các nước này (Cummins, Caterpillar, FG Wilson, Kohler / SDMO, MTU, Mitsubishi, Denyo, Pramac, Visa${origin.endsWith("eu") ? ", Himoinsa, Volvo Penta, Scania" : ""}...), ghi đúng \`country\` của họ trong newCatalog.json; không lấy trang của nhà lắp ráp Trung Quốc. catalog.md có ít hoặc không có ứng viên nào đáp ứng thì làm bước 4.`
        + (brand ? `
HSMT đòi THƯƠNG HIỆU ${GROUP_NAME[origin]}, không nói nơi sản xuất (Khoa, 2026-11-11): code giữ thêm nhà máy tổ máy CỦA CHÍNH HÃNG ${GROUP_NAME[origin]} đặt ngoài nhóm (hồ sơ có liên kết relatedIds tới hãng, ví dụ nhà máy Caterpillar / FG Wilson ở Thiên Tân); nhà lắp ráp Trung Quốc mang tên hãng ngoại vẫn bị bỏ. Khi tìm trên internet, tổ máy chính hãng sản xuất ở nước khác cũng được tính.` : ""))
    : origin === "other" ? `Chỉ gợi ý động cơ của hãng ngoài Trung Quốc (${[...CAT.FOREIGN_ENGINE].join(", ")}), kể cả khi tìm trên internet; ghi "make" của động cơ. Không gợi ý động cơ của hãng Trung Quốc (Weichai, Yuchai, SDEC...).`
    : "Không giới hạn xuất xứ động cơ (HSMT không đòi G7 / G20). Gợi ý cả cấu hình động cơ hãng Trung Quốc (Weichai, Yuchai, SDEC...) lẫn động cơ hãng nước khác; cấu hình động cơ hãng Trung Quốc đáp ứng HSMT tốt hơn hoặc ngang cấu hình động cơ hãng nước khác thì xếp trước (Khoa, 2026-11-05). Code xếp lại theo kết quả kiểm tra."
      + (grp ? `\nNhà cung cấp (Khoa, 2026-11-10): HSMT không đòi G7 / G20 nên chỉ gợi ý nhà cung cấp ĐẶT TẠI TRUNG QUỐC (quốc gia CN trong catalog.md) có động cơ, đầu phát, bộ điều khiển phù hợp với HSMT; các bộ phận đó có thể là hãng Trung Quốc hoặc hãng nước khác (Cummins, Perkins, Stamford, Leroy-Somer, Deep Sea, ComAp, SmartGen...) do nhà cung cấp Trung Quốc chào. Code đã bỏ dòng của ${offGroup} nhà cung cấp ngoài Trung Quốc khỏi catalog.md và sẽ bỏ họ (cùng cấu hình lấy từ dòng bảng của họ) khỏi kết quả. Khi tìm trên internet (bước 4) cũng chỉ lấy nhà cung cấp / nhà máy tổ máy ở Trung Quốc, ghi \`country\` "CN" trong newCatalog.json.` : ""), "",
    // Đồng bộ thương hiệu (Khoa, 2026-11-06): read by code, checked by code from the makes of each configuration.
    ...(sync ? [`## Đồng bộ thương hiệu: HSMT đòi ít nhất ${sync.need}/${sync.parts.length} bộ phận (${sync.parts.map((p) => SYNC_VI[p]).join(", ")}) do chính hãng sản xuất tổ máy làm ra`,
      `HSMT ghi: "${sync.text}"`,
      `Code tự ghi yêu cầu "${SYNC_ITEM}" và kiểm tra nó cho từng cấu hình theo hãng của động cơ, đầu phát, bộ điều khiển và hãng tổ máy (đừng tự viết check này). Ghi "make" của từng bộ phận khi nguồn ghi. Cấu hình lắp ráp từ động cơ, đầu phát, bộ điều khiển của các hãng khác nhau (vd. động cơ Cummins + đầu phát Nianfeng/Stamford + SmartGen do một xưởng Trung Quốc lắp) là KHÔNG ĐẠT. Ưu tiên tổ máy của chính hãng làm ra cả động cơ và đầu phát / bộ điều khiển (Cummins: động cơ Cummins + đầu phát Stamford/Cummins + PowerCommand; Caterpillar/Perkins/FG Wilson/Olympian; Kohler/SDMO; MTU; Mitsubishi; Denyo...). Khi catalog.md không có cấu hình nào đạt yêu cầu này thì làm bước 4 (tìm trên internet) để tìm một tổ máy chính hãng đạt.`, ""] : []),
    // Tổ máy HSMT nêu đích danh (Khoa 2026-11-12, named-genset.mjs): the named model first, the others equivalents.
    ...(namedG ? [`## Tổ máy HSMT nêu đích danh: ${[namedG.makeRaw || namedG.make, namedG.models.join(" / ")].filter(Boolean).join(" ")}${namedG.makeRaw && namedG.make && namedG.makeRaw !== namedG.make ? ` (hãng ${namedG.make})` : ""}`,
      [namedG.quoteMake && `HSMT ghi: "${namedG.quoteMake}"`, namedG.quoteModel && namedG.quoteModel !== namedG.quoteMake && `"${namedG.quoteModel}"`].filter(Boolean).join(", "),
      `- Dòng catalog.md có lý do "tổ máy đúng model HSMT nêu đích danh" (hoặc "tổ máy hãng … HSMT nêu") là cấu hình phải gợi ý trước tiên; ghi \`genset.model\` / \`genset.make\` đúng như nguồn ghi.`,
      `- catalog.md không có model đó: làm bước 4 cho RIÊNG model này trước: tra trang của chính thương hiệu (trang hãng, hoặc đơn vị được cấp phép thương hiệu — tính là nguồn hãng, tier A/B), lưu trang, ghi \`src.tier\` của nguồn internet. Quy tắc "chỉ nhà cung cấp đặt tại Trung Quốc" KHÔNG áp cho riêng dòng model này; xuất xứ vẫn kiểm theo yêu cầu xuất xứ của HSMT (nguồn không ghi thì để chưa rõ, code chuyển thành cần chứng từ).`,
      NG.sellerAllowed() ? `- Không có trang hãng / đơn vị cấp phép: được dùng tạm trang bên bán cho riêng model này (\`src.tier\` "C"); code gắn "chưa xác minh", mọi mục tối đa chưa rõ, không đưa vào danh mục.`
        : `- Trang bên bán (đại lý, sàn) KHÔNG được dùng làm nguồn cho model này; không có trang hãng thì khai \`searched\` (\`what: "source"\`) và để code ghi "chưa có nguồn thông số".`,
      `- Cấu hình hãng / model khác vẫn gợi ý như thường (hàng tương đương; code gắn nhãn và cảnh báo khi HSMT không cho tương đương). Không trả \`configs: []\` chỉ vì không tìm được hãng / model HSMT nêu.`, ""] : []),
    // Đặc thù hãng động cơ (Khoa 18/11/2026, engine-traits.mjs): read by code, the same rules check applies.
    ...(hints.trait?.engineMake ? [`## Đặc thù hãng động cơ: HSMT ghi ${[...new Set(hints.trait.engineTerms.map((x) => x.term))].join(", ")} ở yêu cầu động cơ, là công nghệ riêng của ${hints.trait.engineMake}`,
      `HSMT ghi: "${hints.trait.engineTerms[0].line}"`,
      `- CHỈ gợi ý động cơ hãng ${hints.trait.engineMake} (ghi "make" của động cơ đúng như nguồn ghi). Cấu hình động cơ hãng khác hoặc chưa rõ hãng bị code bỏ. Được gợi ý quá 2 cấu hình của hãng ${hints.trait.engineMake} (code không áp trần mỗi hãng cho hãng này).`,
      `- catalog.md không đủ cấu hình hãng ${hints.trait.engineMake}: làm bước 4, chỉ tìm tổ máy động cơ ${hints.trait.engineMake}.`, ""] : []),
    ...(hints.trait?.controllers?.length ? [`## Bộ điều khiển HSMT nêu đích danh: ${hints.trait.controllers.map((x) => `${x.term} (${x.makeName})`).join(", ")}`,
      ...hints.trait.controllers.map((x) => `HSMT ghi: "${x.line}"`),
      `- Ưu tiên cấu hình có đúng bộ điều khiển đó (dòng catalog.md có lý do "có bộ điều khiển … HSMT nêu"). Code tự ghi yêu cầu "Bộ điều khiển … (HSMT nêu đích danh)" và tự kiểm tra cho từng cấu hình (đừng tự viết check này): bộ điều khiển khác là KHÔNG ĐẠT ở bộ điều khiển (vẫn hiện, xếp sau). Từ này KHÔNG giới hạn hãng động cơ.`, ""] : []),
    // Yêu cầu khác (Khoa, 2026-11-01): typed on the web next to Gợi ý / Tìm NCC, checked like the HSMT's requirements.
    ...(extraOf(reqData) ? ["## Yêu cầu khác (người dùng nhập trên web, bắt buộc kiểm tra như yêu cầu của HSMT)", extraOf(reqData), ""] : []),
    "## Thông số kỹ thuật theo phân tích (chỉ để định hướng, trích dẫn phải lấy từ hsmt.txt)",
    ...(a?.technicalSpecs || []).map((s) => `- ${s.item}: ${s.requirement}${s.reference ? ` (${s.reference})` : ""}`), "",
    ...(gaps.length ? ["## Văn bản HSMT có thể thiếu (code dò; kết quả sẽ mang ghi chú này)", ...gaps.map((g) => `- ${g.why}${g.lines?.length ? `. Các dòng đó trong hsmt.txt: ${g.lines.join(", ")} — đọc bằng sed -n từng đoạn quanh các dòng này; yêu cầu nào của máy phát ở đó cũng phải vào requirements.` : "."}`), ""] : []),
    "## Phần kỹ thuật của HSMT", technicalPart(text),
  ].filter((l) => l !== null).join("\n"));
  // What the agent reads, in order, each file whole (agentInput): no file over the Read limit, none read twice.
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify([...inputFiles, ...catFiles, ...lookFiles]), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "config-prompt.md"), "utf8") + formulasMd(), "utf8");
  return { cap, size: multi?.size || null, origin, makerAlts: altMakers?.list.map((m) => m.model) || [], originAuto: auto ? { from: asked, origin: auto.origin, quote: auto.quote, ...(GROUP_ORIGIN.has(auto.origin) && !partsOnly ? { basis: brand ? "brand" : "origin" } : {}) } : null, reqHash, reused: !!reuse, candidates: top.length, engines: cat.engines.length, alternators: cat.alternators.length };
}

// How to fix what check printed (2026-11-12, token-do.md: runs went 2–5 rounds through "số 11.05", "câu trích nguồn"...,
// rebuilding their script after each). Printed once by `check --dir .`, after the list; only words, check is unchanged.
const FIX = [
  [/: số [\d.]+/, "số trong `offered` không có trong `sourceQuote` (với factSrc: trong số liệu của dòng đó), cũng không phải đầu vào / kết quả của `conversions`: chỉ ghi trong offered các số có trong câu trích, hoặc thêm phép quy đổi (web/conversions.js); bên dưới có các số của từng câu trích."],
  [/số công suất không phải cột/, "check công suất Prime / Standby phải ghi số của đúng cột đó trong dòng bảng (tiêu đề cột ở mục \"Tiêu đề bảng\"); không phân biệt được cột thì để unclear."],
  [/câu trích nguồn(?!.*thiếu)/, "`sourceQuote` không có nguyên văn trong nguồn của bộ phận đó (dòng bảng + tiêu đề bảng, trang đã lưu, hoặc dòng factSrc): chép đúng từng ký tự (kể cả `|` và khoảng trắng) từ catalog.md / controllers.md / web/N.txt."],
  [/thiếu câu trích nguồn/, "met / not_met phải có `sourceQuote`; không có thì để unclear."],
  [/câu trích HSMT|Câu trích yêu cầu không có trong HSMT/, "`hsmtQuote` / `quote` phải chép nguyên văn một đoạn của hsmt.txt (thử bằng grep -F)."],
  [/factSrc không phải dòng ghi thông số/, "`factSrc` phải là { supplierId, n, line } của một dòng ở \"Thông số theo model\" (hoặc ctl-lookup.md / controllers.md với bộ điều khiển) của ĐÚNG model của cấu hình, chép nguyên dòng."],
  [/không tìm thấy nguồn/, "`src` của bộ phận phải là một dòng của catalog.md (catalog), một dòng bộ điều khiển (controller) hay trang đã lưu (internet); bộ phận nguồn không ghi thì để null, đừng để object rỗng."],
  [/model .* không có trong nguồn/, "`model` phải viết như dòng nguồn của bộ phận đó ghi."],
  [/hãng .* không ghi trong nguồn/, "`make` chỉ ghi khi nguồn ghi (catalog.md cho biết hãng lấy từ đâu); không thì để trống."],
  [/câu trích web không có trong trang đã lưu/, "`src.quote` phải chép từ đúng tệp web/N.txt đã lưu bằng lệnh save."],
];
export function fixNotes(problems = [], result = {}) {
  const kinds = FIX.filter(([re]) => problems.some((p) => re.test(p)));
  if (!kinds.length) return "";
  const out = ["", `CÁCH SỬA — ${kinds.length} loại lỗi ở trên (sửa hết một lượt rồi chạy lại check một lần):`, ...kinds.map(([, how]) => `- ${how}`)];
  // The numbers each quote of a "số …" problem has, so the fix is read here and not searched for.
  const nums = [];
  for (const p of problems) {
    const m = p.match(/^#(\d+) (.+?): .*\bsố [\d.]+/);
    if (!m) continue;
    const c = (result.configs || []).find((c) => c.rank === Number(m[1]));
    const x = (c?.checks || []).find((x) => x.item === m[2]) || (c?.checks || []).flatMap((x) => (x.parts || []).map((q) => ({ ...q, item: `${x.item}: ${q.item}` }))).find((x) => x.item === m[2]);
    if (x?.sourceQuote) nums.push(`- #${m[1]} ${m[2]}: câu trích ${JSON.stringify(String(x.sourceQuote).slice(0, 160))} có các số ${JSON.stringify([...new Set(numbersLoose(x.sourceQuote))])}; offered: ${JSON.stringify(x.offered ?? "")}`);
  }
  return [...out, ...(nums.length ? ["Số trong từng câu trích:", ...nums] : [])].join("\n");
}

// ---------- save (agent: internet sources) ----------
// A table in a PDF (a line-up: model | kWm | kWe | kVA ...) keeps each model and its figures on one line with xpdf's
// pdftotext -table; -layout (poppler has no -table) can shift a row's figures onto the line of another model, so a
// row copied from it names the wrong figures (FPT Unregulated Line-up, 2026-11-10).
// exec: execFileSync (tests pass a fake pdftotext).
export function pdfToText(file, exec = execFileSync) {
  const run = (mode) => exec("pdftotext", [mode, "-enc", "UTF-8", file, "-"], { maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
  try { return run("-table"); } catch { return run("-layout"); }
}
// A public page this PC cannot read (HTTP 401 / 403 / 429 / 5xx, network error, a JavaScript page with almost no text)
// is read again through Firecrawl when its key is there (firecrawl.mjs; Khoa 2026-11-17: "dự phòng khi bị chặn"); the
// saved file then says "Via: firecrawl". io: tests pass fetch / firecrawl fakes.
export async function save(dir, url, io = {}) {
  const { fetchImpl = fetch, fc = FC } = io;
  const webDir = path.join(dir, "web"); fs.mkdirSync(webDir, { recursive: true });
  const n = fs.readdirSync(webDir).filter((f) => /^\d+\.txt$/.test(f)).length + 1;
  let text = null, final = url, status = null, error = "";
  try {
    const r = await fetchImpl(url, { headers: { "User-Agent": UA, "Accept-Language": "en,zh-CN;q=0.8,vi;q=0.7" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
    status = r.status;
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer()), type = r.headers.get("content-type") || "";
      final = r.url || url;
      if (type.includes("pdf") || /\.pdf($|\?)/i.test(url)) {
        const tmp = path.join(webDir, `${n}.pdf`); fs.writeFileSync(tmp, buf);
        try { text = pdfToText(tmp); } finally { fs.unlinkSync(tmp); }
      } else {
        const head = buf.subarray(0, 4000).toString("latin1");
        const cs = (type.match(/charset=([\w-]+)/i) || head.match(/charset=["']?([\w-]+)/i) || [, "utf-8"])[1].toLowerCase();
        let html; try { html = new TextDecoder(cs === "gb2312" || cs === "gbk" ? "gb18030" : cs).decode(buf); } catch { html = buf.toString("utf8"); }
        text = htmlToText(html);
      }
    }
  } catch (e) { error = String(e?.cause?.code || e?.message || e); }
  let via = "";
  if (fc.hasKey() && fc.shouldRetry({ status, error, textLength: text == null ? null : text.trim().length })) {
    try { const f = await fc.scrape(url); text = f.markdown; final = f.url; via = "Via: firecrawl\n"; }
    catch (e) { if (text == null) throw new Error(`${status ? `HTTP ${status}` : error}; ${e.message}`); }
  }
  if (text == null) throw new Error(status ? `HTTP ${status}` : error || "không tải được");
  const file = path.join(webDir, `${n}.txt`);
  fs.writeFileSync(file, `URL: ${final}\nAccessed: ${new Date().toISOString().slice(0, 10)}\n${via}\n${text}\n`, "utf8");
  return `web/${n}.txt`;
}

// What an "unclear" check is about, to find the line of its sources that may answer it (check's hints): the figure
// keys of web/catalog.js SPEC an engine / alternator / genset requirement points at, and the English words of a
// controller datasheet for a function the HSMT names in Vietnamese.
const ITEM_KEYS = [
  [/điều tốc|governor/i, ["gov"]], [/cách điện|insulation/i, ["insul"]], [/\bIP\s?\d|cấp bảo vệ|protection class/i, ["ip"]],
  [/t[ỉỷ] số nén|compression/i, ["compr"]], [/khởi động|starting/i, ["start"]], [/kiểu động cơ|tăng áp|nạp khí|turbo|aspirat/i, ["asp", "engType"]],
  // Not the coolant's, oil's or tank's volume, nor the oil filter (2026-11-04 agent runs: such hints were noise).
  [/dung tích(?!\s*(?:của\s*)?(?:nước|chất làm mát|làm mát|nhớt|dầu|nhiên liệu|bình|thùng|két|bồn))|displacement/i, ["disp", "bore"]], [/đường kính|hành trình|\bbore\b|stroke/i, ["bore"]], [/^(?!.*(?:đường kính|hành trình|\bbore\b|stroke)).*(?:xi ?lanh|xy ?lanh|cylinder)/i, ["cyl"]], [/(tiêu chuẩn|mức|cấp) khí thải|emission|\b(euro|tier|stage)\b/i, ["emission"]],
  [/làm mát|cooling/i, ["cooling"]], [/^(?!.*\blọc\b).*(?:dầu bôi trơn|nhớt|lubricat)/i, ["oil"]], [/sóng hài|THD|harmonic/i, ["thd"]],
  [/(ổn định|biến thiên|điều chỉnh|dao động) điện áp|voltage regulation/i, ["vreg"]], [/AVR/i, ["vreg"]], [/kích từ|excit/i, ["excit"]],
  [/hiệu suất|efficiency/i, ["eff"]], [/ti[êe]u (hao|th[ụu])[^\n]{0,40}75\s*%|75\s*%[^\n]{0,30}ti[êe]u (hao|th[ụu])/i, ["fuel75"]], [/ti[êe]u (hao|th[ụu])[^\n]{0,40}50\s*%|50\s*%[^\n]{0,30}ti[êe]u (hao|th[ụu])/i, ["fuel50"]],
  [/tiêu hao nhiên liệu|tiêu thụ nhiên liệu|fuel consumption/i, ["fuel"]], [/độ ồn|noise/i, ["noise"]],
  [/kích thước|dimension/i, ["dims"]], [/khối lượng|trọng lượng|weight/i, ["weight"]], [/bồn dầu|bình (nhiên liệu|dầu)|fuel tank/i, ["tank"]],
  [/(ổn định|biến thiên|dao động) tần số|frequency regulation/i, ["freg"]], [/hệ số công suất|cos\s?[φϕø]/i, ["pf"]],
  [/tốc độ|vòng quay|rpm/i, ["speed"]], [/dòng điện/i, ["current"]],
];
const CTL_WORDS = [
  [/quá áp|điện áp cao/i, /over\s?-?voltage|high voltage/i], [/thấp áp|điện áp thấp|sụt áp/i, /under\s?-?voltage|low voltage/i],
  [/tần số (cao|thấp)|quá tần|thấp tần/i, /(over|under)\s?-?frequency|(high|low) frequency/i], [/quá tải|quá dòng/i, /overload|over\s?-?current|over\s?-?power/i],
  [/ngắn mạch/i, /short\s?-?circuit/i], [/áp (suất|lực) (dầu|nhớt)/i, /oil pressure/i], [/nhiệt độ (nước|làm mát|động cơ)/i, /coolant temp|engine temp|high temp/i],
  [/quá tốc|vượt tốc/i, /over\s?-?speed/i], [/thấp tốc|dưới tốc/i, /under\s?-?speed/i], [/khởi động (không|thất bại)|lỗi khởi động/i, /fail(ed|ure)? to start|start fail/i],
  [/dừng khẩn/i, /emergency stop/i], [/ắc ?quy|accu|bình điện/i, /battery (voltage|under|over|low|high)|plant supply|(low|high) battery/i], [/sạc/i, /charg(e|ing)\s*(alternator\s*)?(fail|alarm|warning|fault)|D\+\s*(fail|fault)/i],
  [/nhật ký|lịch sử|event log|sự kiện/i, /event log|events/i], [/giờ (chạy|máy|vận hành)|đếm giờ/i, /engine hours|hours run|running hours|run time|hour meter/i],
  [/hệ số công suất|\bPF\b|cos/i, /power factor|\bpf\b/i], [/công suất|\bkW\b|\bkVA\b/i, /\bkW\b|\bkVA\b|\bkvar\b/i],
  [/điện áp/i, /voltage (measurement|range|sensing)|(generator|mains|bus|phase).{0,20}voltage|\bVs?(L-?L|L-?N|ph-?ph|ph-?n)\b/i], [/dòng điện/i, /current (measurement|sensing|range)|\bCT\b|(generator|phase|load).{0,15}current/i], [/tần số|\bHz\b/i, /frequency/i],
  [/RS-?485/i, /RS-?485/i], [/RS-?232/i, /RS-?232/i], [/modbus/i, /modbus/i], [/USB/i, /USB/i], [/ethernet|TCP|mạng LAN/i, /ethernet|TCP/i],
  [/CAN|J1939|ECU/i, /J1939|CAN/i], [/GSM|SMS|GPRS/i, /GSM|SMS|GPRS/i], [/SNMP/i, /SNMP/i],
  // BMS (bdk-mo-dun PR 3, Khoa Q3 20/11/2026): a line that says BMS, or the protocols a BMS reads it by (NCC to confirm).
  [/\bBMS\b|building management|quản lý tòa nhà/i, /\bBMS\b|building management|modbus|bacnet|snmp/i],
  [/AMF|mất (điện )?lưới|ATS/i, /AMF|mains (\(utility\) )?fail|automatic mains/i], [/tự (động )?khởi động|auto start|(khởi động|start|dừng|stop) từ xa/i, /auto start|remote start/i],
  [/mật khẩu|password|PIN/i, /password|PIN\b|security/i], [/LCD|màn hình/i, /\bLCD\b|graphic display|display (size|type|resolution)/i], [/hòa đồng bộ|song song|paralle|đồng bộ/i, /synchron|load ?shar|parallel/i],
  [/(mức|thấp) nhiên liệu|nhiên liệu (thấp|mức)/i, /fuel level|low fuel/i], [/chế độ (hoạt động|vận hành|làm việc|điều khiển)|auto\s*\/\s*manual|manual\s*\/\s*auto|start\s*\/\s*stop/i, /\bmanual\b|\bauto\b mode|stop\/reset/i],
];
// The measured quantities (a controller measures them; a protection or another function that names one is about more).
const CTL_MEASURE = new Set(CTL_WORDS.filter(([re]) => ["điện áp", "dòng điện", "tần số", "công suất", "hệ số công suất"].some((w) => re.test(w))));
// Not the module's own specification (its supply voltage, current, test standards, clock battery).
const CTL_OWN = /BS EN|IEC 600|Operating Current|Continuous Voltage|Cranking|Standby Current|Humidity|Vibration|Shock|RTC|Temperature Range|Cut[- ]?out|Dimensions/i;
// The first datasheet line of a controller (its facts) that one of `words` (English regexes of CTL_WORDS) matches, in the
// order of `words`: what check's hint names for an "unclear" controller function, and ctlLookupMd lists before the run.
export const ctlLineFor = (list, words) => {
  const lines = (list || []).filter((f) => f.line.length <= 240 && !CTL_OWN.test(f.line));
  return words.map((en) => lines.find((f) => en.test(f.line))).find(Boolean) || null;
};
// ctl-lookup.md (2026-11-12, token-do.md: one run grepped controllers.md 11 times, one function after another): for each
// function of CTL_WORDS the HSMT's technical part names (its Vietnamese words on one of its lines), each controller of
// catalog.md that has its maker's datasheet → the line check's hint would name (ctlLineFor), word for word with its
// factSrc, or that no line has the function's words. A guide only: the agent still decides and check() checks the quote.
export function ctlLookupMd(models, factsOfModel, hsmtText) {
  const tech = technicalPart(hsmtText || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const named = CTL_WORDS.map(([vi, en]) => ({ vi, en, at: tech.find((l) => vi.test(l)) })).filter((w) => w.at);
  if (!named.length || !models.length) return "";
  const out = ["# Tra cứu sẵn: chức năng bộ điều khiển HSMT nêu × datasheet", "",
    "Code dò trước bằng đúng bộ từ khoá mà lệnh check dùng để gợi ý dòng (CÓ THỂ TRA ĐƯỢC). Đây chỉ là chỉ dẫn tìm: đọc dòng, tự kết luận đạt / không đạt / chưa rõ; \"không thấy dòng nào\" chỉ nghĩa là không dòng nào có các từ khoá đó — muốn chắc thì grep controllers.md bằng từ khác. Câu trích và factSrc vẫn được check kiểm như cũ.", "",
    "## Chức năng HSMT nêu (dòng HSMT đầu tiên có chữ đó)", "",
    ...named.map((w, i) => `- F${i + 1}: ${JSON.stringify(w.at.slice(0, 160))} — từ khoá datasheet: ${w.en.source}`), ""];
  for (const m of models) {
    const list = factsOfModel(m);
    if (!list.length) continue;
    // Each line once, as its factSrc (the line is the quote); the functions found on no line in one row.
    const none = [];
    out.push(`## ${m}`);
    for (const [i, w] of named.entries()) {
      const f = ctlLineFor(list, [w.en]);
      if (f) out.push(`- F${i + 1}: { "supplierId": "${f.supplierId}", "n": ${f.n}, "line": ${JSON.stringify(f.line)} }${f.version ? ` (datasheet ${f.version}: cần xác nhận đời)` : ""}`);
      else none.push(`F${i + 1}`);
    }
    if (none.length) out.push(`- không thấy dòng nào: ${none.join(", ")}`);
    out.push("");
  }
  return out.join("\n");
}
// The Read tool refuses a file of more than 25000 tokens (2026-11-12 logs: catalog.md parts of 29666, 32783, 37081
// tokens were refused and read again; input.md of ~26000 was cut at line 644 without a word). Measured ≈ 2 characters a
// token for these files, 1.5 at worst: READ_MAX characters stays under 20000 tokens.
export const READ_MAX = 30000;
// The size of a text against READ_MAX: a character counts 1, a Chinese / Japanese / Korean one 1.5 (about a token
// each: catalog.md quotes Chinese tables; 30000 of them would be ~30000 tokens, over the Read limit). read guard 2026-11-12.
const CJK = /[⺀-鿿가-힯豈-﫿＀-￯]/g;
export const readSize = (t) => { const s = String(t || ""); return s.length + 0.5 * (s.match(CJK) || []).length; };
// Text cut into parts of at most `max` (readSize): at "## " headings first, then "### ", then lines; a single line
// longer than that is cut inside, every character kept (the parts joined give the text back).
export function splitForRead(text, max = READ_MAX) {
  const parts = [];
  const head = (p) => { let n = Math.min(p.length, max), s = readSize(p.slice(0, n)); while (s > max && n > 1) { n = Math.max(1, Math.floor(n * max / s) - 1); s = readSize(p.slice(0, n)); } return n; };
  const cut = (t, levels) => {
    if (readSize(t) <= max) return [t];
    const [re, ...rest] = levels;
    const pieces = re ? t.split(re).filter((p) => p.length) : t.split(/(?<=\n)/);
    const out = [];
    let cur = "", size = 0;
    for (const p of pieces) {
      const ps = readSize(p);
      if (ps > max) { if (cur) out.push(cur); cur = ""; size = 0; if (re) out.push(...cut(p, rest)); else { const n = head(p); out.push(p.slice(0, n), ...cut(p.slice(n), [])); } continue; }
      if (size + ps > max) { out.push(cur); cur = ""; size = 0; }
      cur += p; size += ps;
    }
    if (cur) out.push(cur);
    return out;
  };
  parts.push(...cut(String(text || ""), [/(?=^## )/m, /(?=^### )/m]));
  return parts;
}
// Writes `name` whole (the code and grep use it) and, when it is longer than READ_MAX, its parts <base>-1.md ... for the
// agent to Read one after another. Returns the files the agent reads, in order.
export function writeForRead(dir, name, text) {
  const base = name.replace(/\.md$/, "");
  for (const f of fs.readdirSync(dir)) if (new RegExp(`^${base}-\\d+\\.md$`).test(f)) fs.rmSync(path.join(dir, f));
  fs.writeFileSync(path.join(dir, name), text, "utf8");
  const parts = splitForRead(text);
  if (parts.length < 2) return [name];
  return parts.map((p, i) => { const f = `${base}-${i + 1}.md`; fs.writeFileSync(path.join(dir, f), p, "utf8"); return f; });
}

// ---------- check ----------
// Returns { result, problems } with result fixed in place: unverified marks, "met" without proof → "unclear".
// A supplier's `why` on screen without the internal labels input.md gives the agent (Khoa 2026-11-11, gói IB2600603983:
// "genset_oem, độ tin cậy medium" showed under each supplier). The row itself stays in `line` (SHOW_SRC).
export const plainWhy = (s) => String(s || "")
  .replace(/[;,]?\s*(?:vai trò:?\s*)?\b(?:genset_oem|engine_maker|alternator_maker|controller_maker|distributor)\b/gi, "")
  .replace(/[;,]?\s*độ tin cậy:?\s*(?:high|medium|low|cao|trung bình|thấp)\b/gi, "")
  .replace(/\s*[;,]\s*(?=[;,]|$)/g, "").replace(/^\s*[;,]\s*/, "").replace(/\s{2,}/g, " ").trim();
// sourcesDir: where sourceRatings reads sources/<id>/<n>.md (default the repo's; the regression fixtures pass their frozen copy).
// The power of a configuration found on the internet (Đặc thù hãng động cơ, Khoa 18/11/2026, điều 2: "cấu hình tìm từ
// internet phải trong dải 100–140% công suất"): read like a tender's size (BP.kvaRated) from the genset's quote, else from
// the source quote of a power check, each only when it is in the saved page. { kVA, rating: "prime" | "standby" | null,
// quote } or null when no quote gives one.
export function webPowerOf(c, readWeb = () => null) {
  const src = c?.genset?.src;
  if (src?.kind !== "internet") return null;
  const page = norm((src.file && readWeb(src.file)) || "");
  if (!page) return null;
  const quotes = [src.quote, ...(c.checks || []).filter((x) => /c[ôo]ng\s*su[ấa]t|power/i.test(x.item || "") && x.part !== "engine").map((x) => x.sourceQuote)];
  for (const q of quotes) {
    if (!q || !page.includes(norm(q))) continue;
    const r = BP.kvaRated(q);
    if (r?.kva > 0) return { kVA: Math.round(r.kva * 100) / 100, rating: r.rating || null, quote: q };
  }
  return null;
}
// Whether that power is in the band of the run's size: a standby figure is compared as prime (÷ 1.1, BP.STANDBY_FACTOR),
// one of no rating stays when either reading is in the band.
export function webInBand(p, cap) {
  if (!p || !(cap?.value > 0)) return true;
  const b = bandOf(cap), f = BP.STANDBY_FACTOR || 1.1, unit = (k) => (cap.unit === "kW" ? k * 0.8 : k);
  const reads = p.rating === "prime" ? [p.kVA] : p.rating === "standby" ? [p.kVA / f] : [p.kVA, p.kVA / f];
  return reads.some((k) => unit(k) >= cap.value * b.low && unit(k) <= cap.value * b.high + 1e-9);
}
const TRAIT_CTL_ITEM = (term) => `Bộ điều khiển ${term} (HSMT nêu đích danh)`;
const isTraitCtlItem = (x) => !!x?.trait || /\(HSMT nêu đích danh\)\s*$/.test(String(x?.item || "").normalize("NFC"));
export function check(result, { hsmtText, suppliers, readWeb, origin, basis, sized = false, sourcesDir, cap = null }) {
  const problems = [], H = norm(hsmtText);
  const sup = new Map(suppliers.map((s) => [s.id, s]));
  const inHsmt = (q) => !!q && H.includes(norm(q));
  // Figures of a model from any supplier's row or datasheet (modelFacts); a check may quote one with factSrc.
  const built = CAT.build(suppliers), facts = modelFacts(built, suppliers), altKva = altKvaOf(suppliers, built), RT = sourceRatings(suppliers, sourcesDir);
  // A genset row as web/catalog.js reads it (its power per rating), by the src that names it.
  const rows = new Map();
  // A row catalog.js merged from several tables (`also`) answers to each of their sources.
  for (const e of built.engines || []) for (const u of e.uses) if (u.line) for (const n of [u.n, ...(u.also || []).map((x) => x.n)]) rows.set(`${u.supplierId}|${n}|${CAT.keyOf(u.line)}`, u);
  const rowOf = (src) => (src?.kind === "catalog" ? rows.get(`${src.supplierId}|${Number(src.n)}|${CAT.keyOf(src.line || "")}`) : null);
  const hints = [];
  // The line of a configuration's sources that may answer an "unclear" check: a figure of its engine / alternator
  // model (the keys its name points at), a figure of its own genset row, or a line of its controller's datasheet
  // with a word of the function. The first of them, with what to quote it by.
  const hintFor = (c, x) => {
    const what = `${x.name || x.item} ${x.requirement || ""}`;
    if (x.part === "controller") {
      // The function's own words first ("Điện áp ắc quy thấp": the battery, not any voltage; "Quá tải dòng điện": the
      // overload, not the current measurement): a measured quantity only when nothing more particular is named.
      const all = CTL_WORDS.filter(([re]) => re.test(what)), named = all.filter((w) => !CTL_MEASURE.has(w));
      // A protection or alarm that names only a quantity ("Bảo vệ dừng máy: Điện áp máy phát cao/thấp") is about its
      // over / under trip, not the measurement range (2026-11-04: hints quoted "Voltage Measurement", "Frequency Range").
      const trip = /bảo vệ|cảnh báo|dừng máy|báo động|ngắt|alarm|shutdown|protect|trip/i.test(`${x.item} ${what}`);
      const TRIP = [[/điện áp/i, /over\s?-?voltage|under\s?-?voltage|(high|low) voltage/i], [/tần số|\bHz\b/i, /(over|under)\s?-?frequency|(high|low) frequency/i], [/dòng điện|công suất|\bkW\b/i, /over\s?-?current|overload|over\s?-?power|reverse power/i]];
      const words = named.length ? named.map(([, en]) => en) : trip ? TRIP.filter(([re]) => re.test(what)).map(([, en]) => en) : all.map(([, en]) => en);
      const f = ctlLineFor(factsOf(c, "controller"), words);
      return f ? { where: `datasheet ${f.sheetModel || c.controller.model}`, line: f.line, factSrc: { supplierId: f.supplierId, n: f.n, line: f.line } } : null;
    }
    const keys = ITEM_KEYS.filter(([re]) => re.test(what)).flatMap(([, k]) => k);
    if (!keys.length) return null;
    const row = rowOf(c.genset?.src || c.engine?.src);
    // The keys in the order the name gives them ("Dung tích xi lanh": the displacement before the cylinders).
    const first = (list) => keys.map((k) => list.find((v) => v.key === k)).find(Boolean);
    const s = first((row?.specs || []).filter((s) => x.part === "genset" || CAT.SPEC[s.key]?.scope === x.part));
    if (s) return { where: `dòng bảng của cấu hình (${s.label} = ${s.value})`, line: row.line };
    // Not a figure the model's sources give differently: it stays unclear anyway (2026-11-03: 11.76 / 10.3 L).
    const own = ["engine", "alternator"].includes(x.part) ? factsOf(c, x.part) : [], bad = factConflicts(own), f = first(own.filter((g) => !bad.has(g.key)));
    if (f) return { where: `thông số theo model ${c[x.part].model} (${f.label} = ${f.value})`, line: f.line, factSrc: { supplierId: f.supplierId, n: f.n, line: f.line } };
    // Else a line of the genset's own one-model datasheet (gensetSheetOf), in the block of that part (2026-11-13).
    const g = first(sheetFacts(sheetOfConfig(c, (id) => sup.get(id))).filter((s) => s.key && (x.part === "genset" || s.part === x.part)));
    return g ? { where: `datasheet tổ máy ${c.genset.model} (khối ${g.block || "chung"}: ${g.label} = ${g.value})`, line: g.line } : null;
  };
  // The rating a power check is about: its name says power and one of prime / standby (not "quá tải ... liên tục").
  const ratingOf = (x) => {
    if (!/c[ôo]ng su[ấa]t|power/i.test(x.item) || /qu[áa] t[ảa]i|overload|h[ệe] s[ốo]/i.test(x.item)) return null;
    const t = `${x.item} ${x.requirement || ""}`, sb = /standby|d[ựu] ph[òo]ng/i.test(t), pr = /prime|li[êe]n t[ụu]c|continuous/i.test(t);
    return sb === pr ? null : sb ? "standby" : "prime";
  };
  // The make of an engine or alternator model as catalog.md shows it: given by a source that names the model (a row,
  // a column title, a page title), not always the row the configuration takes (a run spent a round fixing "Weichai").
  const sourcedMake = (part, p) => {
    const e = (part === "engine" ? built.engines : part === "alternator" ? built.alternators : [])?.find((x) => x.key === CAT.keyOf(p.model || ""));
    return !!e?.make && e.make.split(" / ").some((m) => norm(m) === norm(p.make));
  };
  const factsOf = (c, part) => (["engine", "alternator", "controller"].includes(part) && c[part]?.model ? factsFor(facts, part, part === "controller" ? ctlModelOf(c.controller) : c[part].model) : []);
  // Bộ điều khiển + mô-đun truyền thông (bdk-mo-dun PR 2, Khoa 20/11/2026; ctl-module.mjs): the modules' facts, and the modules
  // a controller (its facts) may take.
  const modFacts = CM.moduleFacts(suppliers), ctlOptRows = CM.optionRows(suppliers);
  const compatOf =(model, list) => CM.compatModules(list, new Set([CAT.keyOf(model || ""), ...list.map((f) => CAT.keyOf(f.sheetModel || ""))].filter(Boolean)), modFacts, ctlKeys);
  // Q1 (Khoa 20/11/2026: "Ok cho khuyến nghị"): the other controllers of the same make that the configuration's controller
  // line offers ("Deepsea DSE7320, DSE7420, DSE6120..."), each with a datasheet, scored with its best modules by code on the
  // HSMT's communication parts; those with no "không đạt" (code never writes one) and at least one part met, best 2 first.
  // bdk-mo-dun PR 3 (Khoa 20/11/2026 "ok"): only a pair that meets at least as many parts as the configuration's own
  // controller with its best modules, scored the same way, less one (DSE7320 + DSE890 5/7 beside DSE7420 6/7 stays;
  // DSE6120 1/4, DSE6020 + DSE890 2/7 go).
  const commNames = (reqs) => reqs.filter((r) => r.code === "ctl_comm" && r.part === "controller").flatMap((r) => (r.parts?.length ? r.parts.map((p) => p.item) : [r.item])).filter(Boolean);
  // bdk-amf (Khoa 20/11/2026, IB2600603983, "1. Có 2. Có"): (1) the other controllers of the same make come from the
  // configuration's controller line, then from the other lines its suppliers offer (the record's `controllers`), then from the
  // controller maker's own datasheets ("Bộ điều khiển chọn theo tài liệu hãng, NCC chưa chào"); (2) the HSMT asks for an ATS /
  // "khi mất điện lưới" → only an AMF controller, its kind read from the maker's datasheet (CM.ctlKinds). The code never
  // replaces the main controller (điều phối 20/11/2026, hướng B: the agent chooses and checks it).
  const ctlKinds = CM.ctlKinds(suppliers, { modelsIn: ctlModelsIn }), ctlAmf = CM.needsAmf(technicalPart(hsmtText || "") || hsmtText || "", { head: String(hsmtText || "").slice(0, 3000) });
  // The other controllers of c's make, each scored with its best modules: [{ model, make, kind, step, met, ..., offeredAs +
  // offeredBy | notOffered }], and the main controller's own pair.
  const ctlCands = (c, names) => {
    const mainList = factsOf(c, "controller"), main = CAT.keyOf(ctlModelOf(c.controller));
    const mainKeys = new Set([main, ...mainList.map((f) => CAT.keyOf(f.sheetModel || ""))]);
    const brand = CAT.controllersIn(ctlModelOf(c.controller)).find((x) => x.model)?.brand || c.controller.make;
    const seen = new Set(), out = [];
    const tryAlt = (x, how) => {
      const k = CAT.keyOf(x.model);
      if (seen.has(k) || mainKeys.has(k)) return;
      seen.add(k);
      const list = factsFor(facts, "controller", x.model);
      if (!list.length || list.some((f) => mainKeys.has(CAT.keyOf(f.sheetModel || "")))) return;
      const sheets = [...new Set(list.map((f) => f.version || f.sheetModel).filter(Boolean))], model = sheets.length === 1 ? sheets[0] : x.model;
      // One model once, whichever way it came first (DSE7320 on the line and DSE7320 MKII of the maker's datasheet).
      if (seen.has(`sheet:${CAT.keyOf(model)}`)) return;
      seen.add(`sheet:${CAT.keyOf(model)}`);
      const bp = CM.bestPair(names, list, compatOf(x.model, list), modFacts);
      out.push({ model, ...(how.notOffered ? { notOffered: true, label: CM.CTL_ALT_LABEL } : { offeredAs: x.model, ...(how.by ? { offeredBy: how.by } : {}) }), make: x.brand,
        kind: CM.kindOf(ctlKinds, model), step: CM.ctlStep(model), ...bp, parts: undefined });
    };
    const same = (y) => y.model && (!brand || norm(y.brand) === norm(brand));
    for (const x of CAT.controllersIn(c.controller.src?.line || "").filter(same)) tryAlt(x, { by: c.controller.src?.supplierId });
    for (const s of c.suppliers || []) for (const o of sup.get(s.supplierId)?.controllers || []) {
      for (const x of CAT.controllersIn(o.line || "").filter((y) => same(y) && CAT.keyOf(y.model) === CAT.keyOf(o.model || ""))) tryAlt(x, { by: s.supplierId });
    }
    if (brand) for (const k of [...facts.keys()].filter((y) => y.startsWith("controller:")).sort()) {
      if (!facts.get(k).some((f) => sup.get(f.supplierId)?.role === "controller_maker")) continue;
      const sm = facts.get(k).find((f) => f.sheetModel)?.sheetModel || k.slice(11);
      const x = CAT.controllersIn(sm).find((y) => same(y) && CAT.keyOf(y.model) === k.slice(11)) || CAT.controllersIn(sm).find(same);
      if (x) tryAlt(x, { notOffered: true });
    }
    const mainPair = mainList.length ? CM.bestPair(names, mainList, compatOf(ctlModelOf(c.controller), mainList), modFacts) : null;
    return { out, mainPair };
  };
  // Q1 + bdk-amf: "Phương án khác đạt tương đương", best 2: those meeting ≥ the main pair − 1 (and ≥ 1), AMF only when the HSMT
  // asks for it (a controller whose kind the maker's datasheet does not give stays); more parts met first, then a supplier's
  // offer, then the lower step (CM.ctlStep: DSE7320 before DSE7420; điều phối 20/11/2026, inferred, not Khoa's own words).
  const ctlAlternatives = (c, reqs) => {
    delete c.controller.alternatives; delete c.controller.altLine;
    const names = commNames(reqs);
    if (!names.length) return;
    const { out, mainPair } = ctlCands(c, names), floor = Math.max(1, (mainPair?.met || 0) - 1);
    const step = (a) => (a.step == null ? Infinity : a.step);
    // Not a higher step than the main controller when it only equals it (điều phối 20/11/2026: DSE8620 / HGM9510 / InteliGen
    // beside a DSE7320 / HGM6120 / AMF25 that does as well).
    const mainStep = CM.ctlStep(ctlModelOf(c.controller)), up = (a) => a.step != null && mainStep != null && a.step > mainStep && a.met <= (mainPair?.met || 0);
    const alts = out.filter((a) => a.met >= floor && !up(a) && (!ctlAmf || a.kind === "amf" || !a.kind))
      .sort((a, b) => b.met - a.met || (a.notOffered ? 1 : 0) - (b.notOffered ? 1 : 0) || step(a) - step(b));
    if (!alts.length) return;
    c.controller.alternatives = alts.slice(0, 2).map(({ parts, step: _s, ...a }) => a);
    c.controller.altLine = CM.altLineOf(c.controller.alternatives);
  };
  // Hai bản bộ điều khiển (Khoa 21/11/2026 "sửa theo phương án 2", every make): a configuration whose main controller comes from
  // the maker's datasheet (no supplier of it offers that one) also shown with the controller a supplier of the same engine DOES
  // offer: same make, the kind the HSMT asks, a datasheet, at least half of the communication parts with its best module
  // (fewer: not kept, điều phối's proposal). The code writes the copy; the agent has not read that datasheet, so every
  // controller check of the copy starts "chưa rõ" and only what the code can score is scored. When the configuration's genset
  // row is of another supplier (IB2600603983 08:52Z: B825E5 of agg-fuzhou, DSE7420 of voltgent), the copy takes the genset of
  // the offering supplier's own row, or none, and its genset checks start "chưa rõ" too: they were read on the other row.
  const ctlNeed = ctlKindNeed(hsmtText);
  // The copy of c with another controller: its controller checks all "chưa rõ", its other checks as they are.
  // `rowOf`: the offering supplier's engine row, when the copy leaves a genset row of another supplier.
  const twinCopy = (c, { controller, suppliers, note, gap, by, rowOf: u = null, weaker = false }) => {
    const blank = (x) => ({ item: x.item, status: "unclear", offered: "", note });
    const t = structuredClone(c);
    for (const k of ["rfq", "lossWarn", "won"]) delete t[k];
    t.controller = controller;
    t.suppliers = suppliers;
    if (u) {
      // Same engine AND alternator: a row naming another alternator is not this configuration's genset (makerAltFix would
      // put that alternator in the copy; IB2600603983 08:52Z: kaihua-genset's Volvo row with HCI544FS1).
      const ra = rowAltOf(u, built);
      if (u.genset && (!ra || !c.alternator?.model || CAT.keyOf(ra.model) === CAT.keyOf(c.alternator.model))) t.genset = { model: u.genset, src: { kind: "catalog", supplierId: u.supplierId, n: u.n, line: u.line } };
      else delete t.genset;
    }
    const open = (x) => x.part === "controller" || (!!u && x.part === "genset");
    t.checks = (t.checks || []).filter((x) => !(u && x.part === "genset" && x.byCode)).map((x) => (!open(x) ? x : { ...blank(x), ...(x.part === "genset" ? { note: `Bản bộ điều khiển NCC chào (${by.join(", ")}): chưa chấm trên dòng tổ máy của NCC này.` } : {}), requirement: x.requirement || "", hsmtQuote: x.hsmtQuote || "", part: x.part, level: x.level, ...(x.code ? { code: x.code } : {}), ...(x.parts?.length ? { parts: x.parts.map(blank) } : {}) }));
    t.gaps = [gap, ...(Array.isArray(c.gaps) ? c.gaps.filter((g) => !/điều khiển|mô-đun/i.test(String(g))) : [])];
    t.rank = (c.rank ?? 0) + 0.5;
    t.ctlTwin = { of: ctlModelOf(c.controller), by, ...(weaker ? { weaker: true } : {}) };
    return t;
  };
  // The rows of c's engine, of suppliers inside this run's origin group (the filter below that drops a supplier from a
  // configuration): a supplier based in GB neither gets a copy nor counts as offering the main controller in a China run.
  let twinGroup;
  const inTwinGroup = (id) => {
    if (!origin) return true;
    if (twinGroup === undefined) { const po = partsOnlyOf(origin, hsmtText); twinGroup = groupSuppliers(suppliers, origin, !!sync, po, basis === "brand" && !po) || null; }
    return !twinGroup || twinGroup.has(id);
  };
  const engineRows = (c) => {
    const rowBy = new Map();
    for (const u of (built.engines || []).find((e) => e.key === CAT.keyOf(c.engine?.model || ""))?.uses || []) if (u.line && sup.has(u.supplierId) && inTwinGroup(u.supplierId) && !rowBy.has(u.supplierId)) rowBy.set(u.supplierId, u);
    return rowBy;
  };
  const isMakerCtl = (c) => !!c.controller?.model && c.controller.src?.kind === "maker" && sup.get(c.controller.src.supplierId)?.role === "controller_maker" && !!c.engine?.model;
  // The suppliers with a row of this engine whose record offers the main controller itself, its generation (MKII) aside.
  const offersMain = (c, rowBy) => {
    const mk = CM.ctlKey(ctlModelOf(c.controller));
    return [...rowBy.keys()].sort().flatMap((id) => { const x = (sup.get(id).controllers || []).find((y) => y.model && CM.ctlKey(y.model) === mk); return x ? [{ id, model: x.model }] : []; });
  };
  // A main controller "from the maker's datasheet" that such a supplier does offer is not "NCC chưa chào" (IB2600603983 11:44Z:
  // interpower-international lists DSE7320, the main one is DSE7320 MKII): name it, and ask when the record gives no generation.
  const markOfferedMain = (c) => {
    const list = isMakerCtl(c) ? offersMain(c, engineRows(c)) : [];
    if (!list.length) { if (c.controller) delete c.controller.offeredMain; return; }
    const main = ctlModelOf(c.controller), gen = String(main).match(/MK\s?I{1,3}\b/i)?.[0], noGen = !!gen && list.every((x) => !/MK\s?I{1,3}\b/i.test(x.model));
    const by = list.slice(0, 3).map((x) => x.id);
    c.controller.offeredMain = { by, model: list[0].model, label: `Theo tài liệu hãng; NCC ${by.join(", ")} chào ${list[0].model}${noGen ? ` (hồ sơ không ghi đời ${gen}, cần hỏi)` : ", cần hỏi NCC có lắp cho động cơ này không"}` };
  };
  const ctlTwinOf = (c) => {
    if (!isMakerCtl(c)) return null;
    const rowBy = engineRows(c);
    if (!rowBy.size) return null;
    // A supplier that offers the main controller itself gives no weaker copy of it.
    const hasMain = new Set(offersMain(c, rowBy).map((x) => x.id));
    const own = (c.suppliers || []).map((s) => s.supplierId).filter((id) => rowBy.has(id));
    const ids = [...new Set([...own, ...[...rowBy.keys()].sort()])].filter((id) => !hasMain.has(id)), names = commNames(result.requirements || []);
    if (!ids.length) return null;
    const step = (a) => (a.step == null ? Infinity : a.step);
    const cands = ctlCands({ ...c, suppliers: ids.map((supplierId) => ({ supplierId })) }, names);
    // A supplier offering several controllers counts with one: the kind the HSMT asks, most communication parts, then the HIGHER
    // step (điều phối 21/11/2026: a line "DSE4520 DSE6120 DSE7320 DSE8610" is not an offer of its lowest one).
    const offered = cands.out.filter((a) => !a.notOffered && a.offeredBy && (!ctlNeed || a.kind === ctlNeed));
    const lists = (id, a) => (sup.get(id).controllers || []).some((x) => x.model && CAT.keyOf(x.model) === CAT.keyOf(a.offeredAs));
    const high = (a) => (a.step == null ? -Infinity : a.step);
    const bestOf = (id) => offered.filter((a) => lists(id, a)).sort((a, b) => b.met - a.met || high(b) - high(a))[0];
    const pick = offered
      .filter((a) => ids.some((id) => bestOf(id) === a) && (!names.length || a.met * 2 >= names.length))
      .sort((a, b) => b.met - a.met || step(a) - step(b))[0];
    if (!pick) return null;
    const key = CAT.keyOf(pick.offeredAs), hasIt = (id) => (sup.get(id).controllers || []).find((x) => x.model && CAT.keyOf(x.model) === key);
    const by = ids.filter(hasIt).slice(0, 3), o = hasIt(pick.offeredBy);
    const onRow = norm(o.line).replace(/\s/g, "").includes(norm(c.engine.model).replace(/\s/g, ""));
    const gsBy = c.genset?.model ? c.genset.src?.supplierId : null;
    return twinCopy(c, {
      rowOf: gsBy && !by.includes(gsBy) ? rowBy.get(by[0]) : null,
      weaker: pick.met < (cands.mainPair?.met ?? 0),
      controller: { make: c.controller.make, model: pick.offeredAs, src: { kind: "controller", supplierId: pick.offeredBy, ...(o.src?.length ? { n: o.src[0] } : {}), line: o.line } },
      suppliers: by.map((id) => (c.suppliers || []).find((s) => s.supplierId === id) ? structuredClone(c.suppliers.find((s) => s.supplierId === id)) : { supplierId: id, n: rowBy.get(id).n, line: rowBy.get(id).line, why: `Có dòng động cơ ${c.engine.model}, hồ sơ NCC chào ${pick.offeredAs}` }),
      note: `Bản bộ điều khiển NCC chào (${by.join(", ")}): chưa chấm hết trên datasheet ${pick.offeredAs}.`,
      gap: `${pick.offeredBy} chào ${pick.offeredAs}${onRow ? "" : ` trong hồ sơ, dòng đó không ghi động cơ ${c.engine.model}: cần hỏi NCC có lắp cho động cơ này không`}.`,
      by,
    });
  };
  // Chiều ngược (Khoa 21/11/2026 "có"): the agent's main controller is one a supplier offers, and the lowest of that make that
  // meets EVERY communication function of the HSMT with its best module (the table "Bộ điều khiển thấp nhất đủ yêu cầu theo
  // code") is another one → the copy with that lowest controller, from the maker's datasheet ("NCC chưa chào") unless a
  // supplier of the configuration offers it. No function list in the HSMT, no such table, no copy. The lowest one's kind
  // must read as the HSMT asks (unread: no copy); a main controller that meets all at the same or a lower step, or whose
  // step cannot be compared, stays alone.
  const ctlLowTwinOf = (c) => {
    if (!c.controller?.model || c.controller.src?.kind === "maker" || !c.engine?.model) return null;
    const names = hsmtCommNames(hsmtText || "");
    if (!names.length) return null;
    const { out, mainPair } = ctlCands(c, names), step = (a) => (a.step == null ? Infinity : a.step);
    const fits = (kind) => (ctlNeed === "sync" ? kind === "sync" : ctlNeed === "amf" ? !kind || kind === "amf" : true);
    const pick = out.filter((a) => fits(a.kind) && a.met === names.length).sort((a, b) => step(a) - step(b) || (a.notOffered ? 1 : 0) - (b.notOffered ? 1 : 0))[0];
    if (!pick || (ctlNeed && pick.kind !== ctlNeed)) return null;
    const mainModel = ctlModelOf(c.controller), mainSheet = factsOf(c, "controller").find((f) => f.version)?.version || mainModel;
    const mainStep = CM.ctlStep(mainSheet);
    if (mainPair?.met === names.length && fits(CM.kindOf(ctlKinds, mainSheet) || CM.kindOf(ctlKinds, mainModel)) && (pick.step == null || mainStep == null || pick.step >= mainStep)) return null;
    let src, model = pick.model, by = [];
    if (pick.notOffered) {
      const f = factsFor(facts, "controller", pick.model).find((x) => sup.get(x.supplierId)?.role === "controller_maker");
      if (!f) return null;
      src = { kind: "maker", supplierId: f.supplierId, n: f.n };
    } else {
      const o = (sup.get(pick.offeredBy)?.controllers || []).find((x) => x.model && CAT.keyOf(x.model) === CAT.keyOf(pick.offeredAs));
      src = o ? { kind: "controller", supplierId: pick.offeredBy, ...(o.src?.length ? { n: o.src[0] } : {}), line: o.line } : { ...c.controller.src };
      model = pick.offeredAs; by = [pick.offeredBy];
    }
    return twinCopy(c, {
      controller: { make: c.controller.make, model, src },
      suppliers: structuredClone(c.suppliers || []),
      note: `Bản bộ điều khiển thấp nhất đủ yêu cầu theo code: chưa chấm hết trên datasheet ${model}.`,
      gap: pick.notOffered ? `${model} là bộ thấp nhất đủ yêu cầu theo tài liệu hãng, NCC chưa chào; bản trên là ${mainModel} do NCC chào.` : `${pick.offeredBy} chào ${model}, bộ thấp nhất đủ yêu cầu; bản trên là ${mainModel}.`,
      by,
    });
  };
  // Đồng bộ thương hiệu (Khoa, 2026-11-06): read from the HSMT by code, one requirement of the code's own in place of
  // any the agent wrote about it; its check is written below from the makes, never by the agent.
  const sync = BP.brandSyncOf(hsmtText);
  // Tỉ số nén HSMT ghi trơ (Khoa 20/11/2026): the code's own reading of the HSMT, for makerSheetChecks / comprChecks.
  const hsmtCompr = comprOf(technicalPart(hsmtText || ""));
  result.requirements = (result.requirements || []).filter((r) => !isSyncItem(r.item));
  if (sync) {
    result.requirements.unshift({ item: SYNC_ITEM, requirement: syncText(sync), quote: sync.quote, part: "genset", level: "core", byCode: true, sync: { need: sync.need, parts: sync.parts } });
    result.brandSync = { need: sync.need, parts: sync.parts, quote: sync.quote, text: sync.text };
  } else delete result.brandSync;
  // Đặc thù hãng động cơ (Khoa 18/11/2026, engine-traits.mjs), read by code from the HSMT's technical part as hintsOf does:
  // (1) a term of one engine make in the engine requirements → only engines of that make (below, before the cut to
  // MAX_CONFIGS; rankConfigs lifts the ceiling per make for it); "… hoặc tương đương" filters nothing (câu 3: the make only
  // scores in candidates). (5) a controller term → one requirement of the code's own per term, checked per configuration
  // (câu 2 (a): a configuration without it is "không đạt" at the controller, ranked after, still shown); the engine make is
  // not filtered.
  const trait = ET.filterOf(technicalPart(hsmtText || ""));
  // The code's own, of an earlier check or copied by the agent from it (its byCode taken away), go before they are written again.
  result.requirements = (result.requirements || []).filter((r) => !isTraitCtlItem(r));
  for (const t of trait.controllers) result.requirements.push({ item: TRAIT_CTL_ITEM(t.term), requirement: `Bộ điều khiển có ${t.term} (của ${t.makeName}) như HSMT nêu`, quote: t.line, part: "controller", level: "core", byCode: true, trait: t.term });
  if (trait.engineMake) result.engineTrait = { make: trait.engineMake, terms: [...new Set(trait.engineTerms.map((x) => x.term))], quote: trait.engineTerms[0]?.line || "" };
  else delete result.engineTrait;
  // Requirement codes (Khoa, 2026-11-06, reqcodes.mjs): each requirement gets its code (the agent's, else read from its
  // item), and with it the list's item name, part and level; two requirements of one code become one (texts joined, the
  // first quote kept); every check and part written under the old item name is renamed to the code's.
  const rename = new Map(), byCode = new Map();
  result.requirements = (result.requirements || []).flatMap((r0) => {
    if (r0.byCode) return [r0];
    const r = withCode(r0);
    if (r0.item && norm(r0.item) !== norm(r.item)) rename.set(norm(r0.item), r.item);
    if (r.code === OTHER_CODE) return [r];
    const first = byCode.get(r.code);
    if (!first) { byCode.set(r.code, r); return [r]; }
    if (r.requirement && !norm(first.requirement || "").includes(norm(r.requirement))) first.requirement = `${first.requirement || ""}; ${r.requirement}`.replace(/^; /, "");
    if (!first.quote && r.quote) first.quote = r.quote;
    // Every quote of the code is kept (clarifyOf: one point the HSMT states twice with different figures).
    else if (r.quote && norm(r.quote) !== norm(first.quote) && !(first.quotes || []).some((q) => norm(q) === norm(r.quote))) first.quotes = [...(first.quotes || []), r.quote];
    if (r.parts?.length) first.parts = [...(first.parts || []), ...r.parts.filter((p) => !(first.parts || []).some((q) => norm(q.item) === norm(p.item)))];
    rename.set(norm(r0.item), first.item);
    return [];
  });
  if (rename.size) for (const c of result.configs || []) for (const x of c.checks || []) { const to = rename.get(norm(x.item)); if (to) { x.itemWas = x.item; x.item = to; } }
  // A requirement's part and level (core: decides the model; option: chosen when ordering), copied to its checks.
  const reqs = new Map((result.requirements || []).map((r) => [norm(r.item), r]));
  for (const r of result.requirements || []) { r.level = r.level === "option" ? "option" : "core"; if (!PARTS.includes(r.part)) r.part = "genset"; }
  for (const r of result.requirements || []) if (r.quote && !inHsmt(r.quote)) { r.unverified = true; problems.push(`Câu trích yêu cầu không có trong HSMT: "${r.quote.slice(0, 80)}"`); }
  // A table whose models run across ("| Engine | CP192FE | CP195FE | CP198FE", then "| Rated Frequency(Hz) | 50 | 50 | 50"):
  // every row is about the model of the configuration, in the column where src.line names it (2026-11-03: 22 checks of
  // cameo-power quoted those rows and were all turned down). Then each figure must be in that column.
  const columnOf = (src, model) => {
    if (src?.kind !== "catalog" || !model) return null;
    const cells = CAT.cellsOf(src.line || ""), k = CAT.keyOf(model);
    const j = cells.findIndex((x, i) => i > 0 && CAT.keyOf(x) === k);
    if (j < 1 || cells.length < 3 || CAT.isCode(cells[0])) return null;
    const t = (sup.get(src.supplierId)?.specTables || []).find((x) => x.n === Number(src.n) && x.rows.some((l) => norm(l) === norm(src.line)));
    // Counted from the right: rows have one or two label cells, the model columns line up at the end.
    return t ? { off: cells.length - j, t } : null;
  };
  // The text a part's facts must come from: its catalog row (and table header), or its saved web page.
  // The fromLine row (web/catalog.js) a catalog source is, when its engine is this model.
  const fromLineOf = (src, model) => src?.kind === "catalog" && model ? (built.engines || []).flatMap((e) => (e.key === CAT.keyOf(model) ? e.uses : []))
    .find((u) => u.fromLine && u.supplierId === src.supplierId && Number(u.n) === Number(src.n) && norm(u.line) === norm(src.line)) || null : null;
  const sourceText = (src, model) => {
    const col = columnOf(src, model);
    if (col) return norm([...(col.t.header || []), ...col.t.rows, col.t.title].join(" \n "));
    if (!src) return null;
    if (src.kind === "catalog") {
      const s = sup.get(src.supplierId);
      const tables = (s?.specTables || []).filter((t) => t.n === Number(src.n));
      const t = tables.find((x) => [...(x.header || []), ...x.rows].some((l) => norm(l) === norm(src.line)));
      if (!t) return null;
      // A label table of one genset ("| Genset Model | FDK-Y1100V2/H1", "| Prime Power | 800KW/1000KVA", one page per
      // model, catalog.js `lines`): every row of it is that genset's (2026-11-04: 28 checks of 3 fdk-energy configurations
      // quoted those rows and were all turned down).
      const one = new Set((built.engines || []).filter((e) => e.uses.some((u) => u.lines && u.supplierId === src.supplierId && Number(u.n) === Number(src.n))).map((e) => e.key));
      if (one.size === 1) return norm([...(t.header || []), ...t.rows, t.title].join(" \n "));
      // A power row of a one-model genset datasheet (catalog.js fromLine): its engine is the product line of that source
      // (verify.mjs read it from the page), named once; every figure is still the row's.
      const fl = fromLineOf(src, model);
      return norm([...(t.header || []), src.line, t.title, ...(fl ? [fl.model] : [])].join(" \n "));
    }
    // A controller (Khoa, 2026-11-01): one of the lines the supplier's `controllers` were read from (controllers.mjs).
    if (src.kind === "controller") {
      const c = (sup.get(src.supplierId)?.controllers || []).find((x) => norm(x.line) === norm(src.line) && (src.n == null || (x.src || []).includes(Number(src.n))));
      return c ? norm(c.line) : null;
    }
    // An alternator from its maker's own sheet (makerAltFix): that saved sheet of the maker's record.
    if (src.kind === "maker") {
      // A controller from its maker's datasheet (bdk-amf, Khoa 20/11/2026): that table of the controller maker's record.
      if (sup.get(src.supplierId)?.role === "controller_maker") {
        const t = (sup.get(src.supplierId).specTables || []).find((x) => x.n === Number(src.n));
        return t ? norm([t.title, ...(t.header || []), ...t.rows].join(" \n ")) : null;
      }
      const s = sup.get(src.supplierId), f = path.join(sourcesDir || path.join(ROOT, "sources"), String(src.supplierId), `${Number(src.n)}.md`);
      return s && (s.sources || []).some((x) => Number(x.n) === Number(src.n)) && fs.existsSync(f) ? norm(fs.readFileSync(f, "utf8")) : null;
    }
    if (src.kind === "internet") {
      const txt = src.file ? readWeb(src.file) : null;
      if (!txt) return null;
      const url = (txt.split("\n", 1)[0] || "").replace(/^URL:\s*/, "").trim().replace(/\/$/, "");
      if (src.url && url !== String(src.url).trim().replace(/\/$/, "")) problems.push(`Trang ${src.file} được lưu từ ${url}, khác link ghi trong kết quả ${src.url}`);
      return norm(txt);
    }
    return null;
  };
  // The genset make / model the HSMT names (named-genset.mjs): from the requirements the agent read (quotes found in the
  // HSMT), else from the HSMT's rows. null for a tender that names none: nothing below changes then.
  const namedHere = NG.namedGensetOf(hsmtText, { reqs: result.requirements }) || NG.namedGensetOf(hsmtText);
  const namedCtx = { supOf: (id) => sup.get(id), srcText: (src) => (src?.kind === "catalog" ? sourceText(src) : null) };
  // An engine of the other origin is not a suggestion, nor, under "cn", one whose make the source does not give
  // (Khoa, 2026-10-29). Under "cn" a foreign engine stays when a supplier based in China offers it in a row of its own
  // table that names the engine; that configuration then lists only such suppliers (Khoa, 2026-11-02). The make counts only as the source states it: the catalog row (header, title), or for an
  // internet source the quote, plus the make the agent wrote when the saved page has it.
  const limited = origin === "cn" || origin === "other" || GROUP_ORIGIN.has(origin);
  if (limited || origin === "all") {
    if (limited) result.configs = (result.configs || []).filter((c) => {
      const e = c.engine;
      if (!e) return true;
      const page = e.src?.kind === "internet" && e.src.file ? norm(readWeb(e.src.file) || "") : "";
      const own = e.src?.kind === "catalog" ? sourceText(e.src) : `${e.src?.quote || ""} ${e.make && page.includes(norm(e.make)) ? e.make : ""}`;
      const o = CAT.originIn(`${e.model || ""} ${own || ""}`, e.model);
      const cnRow = (x) => sup.get(x.supplierId)?.country === "CN" && (sup.get(x.supplierId).specTables || []).some((t) => t.n === Number(x.n) && t.rows.some((l) => norm(l) === norm(x.line))
        && [...(t.header || []), x.line, t.title].join(" ").replace(/s/g, "").toLowerCase().includes(String(e.model || "").replace(/s/g, "").toLowerCase()));
      // Or the saved page of a supplier based in China (in the supplier DB or added by this run) names the engine.
      const cnWeb = (x) => !!page && sup.get(x.supplierId)?.country === "CN" && page.replace(/\s/g, "").includes(norm(e.model || "").replace(/\s/g, ""));
      const cnOffer = (x) => cnRow(x) || cnWeb(x);
      const viaCn = origin === "cn" && o === "other" && !!e.model && (c.suppliers || []).some(cnOffer);
      if (viaCn) c.suppliers = c.suppliers.filter(cnOffer);
      const drop = GROUP_ORIGIN.has(origin) ? !CAT.groupIn(`${e.model || ""} ${own || ""}`, e.model, origin) : origin === "cn" ? o !== "cn" && !viaCn : o !== "other";
      if (drop) problems.push(`#${c.rank}: động cơ ${e.model}${e.make ? ` (${e.make})` : ""} ${GROUP_ORIGIN.has(origin) ? `nguồn không cho thấy là hãng của nước ${GROUP_NAME[origin]}` : origin === "cn" ? (o === "other" ? "không phải hãng Trung Quốc và không có nhà cung cấp ở Trung Quốc chào" : "nguồn không ghi hãng") : "không rõ là hãng ngoài Trung Quốc"}, đã bỏ`);
      return !drop;
    });
    // G7 / G20: the suppliers too (Khoa, 2026-11-10). A supplier based outside the group is not suggested, and neither
    // is a configuration taken from such a supplier's table row or left with none of its suppliers: an assembler in
    // China offering a Cummins engine is not what a tender asking for G7 is to be answered with.
    // No G7 / G20 asked: the suppliers based in China, in the same way (Khoa, 2026-11-10), unless the HSMT wants
    // parts of the genset maker's own brand.
    // G7 / G20 asked of the parts only: the suppliers based in China too (partsOnlyOf).
    const partsOnly = partsOnlyOf(origin, hsmtText), brand = basis === "brand" && !partsOnly, grp = groupSuppliers(suppliers, origin, !!sync, partsOnly, brand);
    if (partsOnly) result.originScope = "parts"; else delete result.originScope;
    // Thương hiệu / xuất xứ G7 (Khoa, 2026-11-11): only when the origin was read from the HSMT (meta.json basis); a group
    // chosen on the web keeps the filter as before.
    if (GROUP_ORIGIN.has(origin) && !partsOnly && basis) result.originBasis = basis; else delete result.originBasis;
    if (grp) {
      const G = partsOnly ? "Trung Quốc" : groupName(origin), off = (id) => !!id && sup.has(id) && !grp.has(id), where = (id) => countryVi(sup.get(id)?.country);
      result.configs = result.configs.filter((c) => {
        // The genset the HSMT names (Khoa 2026-11-12): its sellers stay wherever they are based; the origin the HSMT asks
        // of it is checked as of any configuration (genset_origin).
        if (namedHere && NG.namedHit(c, namedHere, namedCtx)) return true;
        const from = [c.genset?.src, c.engine?.src].find((s) => s?.kind === "catalog" && off(s.supplierId));
        if (from) { problems.push(`#${c.rank}: cấu hình lấy từ dòng bảng của ${from.supplierId} (đặt tại ${where(from.supplierId)}, ngoài nhóm ${G}), đã bỏ`); return false; }
        const had = (c.suppliers || []).length;
        c.suppliers = (c.suppliers || []).filter((s) => {
          if (!off(s.supplierId)) return true;
          problems.push(`#${c.rank}: nhà cung cấp ${s.supplierId} đặt tại ${where(s.supplierId)}, ngoài nhóm ${G}, đã bỏ`);
          return false;
        });
        if (had && !c.suppliers.length) { problems.push(`#${c.rank}: không còn nhà cung cấp nào đặt tại nước ${G}, đã bỏ cấu hình`); return false; }
        return true;
      });
      const note = partsOnly ? `HSMT chỉ đòi động cơ / đầu phát / bộ điều khiển hãng ${GROUP_NAME[origin]}, không đòi cả tổ máy xuất xứ ${GROUP_NAME[origin]}: gợi ý nhà cung cấp đặt tại Trung Quốc chào các bộ phận hãng ${GROUP_NAME[origin]} (Khoa, 2026-11-10).` : origin === "all" ?"HSMT không đòi xuất xứ G7 / G20: chỉ gợi ý nhà cung cấp đặt tại Trung Quốc có động cơ, đầu phát, bộ điều khiển phù hợp (Khoa, 2026-11-10)." : brand ? `HSMT đòi thương hiệu ${G} (không nói nơi sản xuất): gợi ý nhà cung cấp đặt tại nước ${G} và tổ máy chính hãng ${G} sản xuất ngoài nhóm (nhà máy của chính hãng, hồ sơ NCC có liên kết tới hãng); nhà lắp ráp ở Trung Quốc vẫn không được gợi ý. Xuất xứ thực tế của tổ máy cần nhà cung cấp xác nhận.`
        : `HSMT đòi xuất xứ ${G}: chỉ gợi ý nhà cung cấp đặt tại nước ${G}; nhà lắp ráp ở Trung Quốc hay nước khác ngoài nhóm không được gợi ý dù chào động cơ, đầu phát, bộ điều khiển hãng ${G}.`;
      // One note of the kind: a check run again with another basis replaces it.
      result.notes = (result.notes || []).filter((n) => !/^HSMT đòi (xuất xứ|thương hiệu) /.test(n));
      if (!(result.notes || []).includes(note)) result.notes = [...(result.notes || []), note];
    }
    if (limited) result.origin = origin;
  }
  // Việt Nam (Khoa, 2026-11-11): no supplier based in Việt Nam and no set made or assembled there is suggested, whatever
  // the origin asked: a configuration taken from such a supplier's row, of a genset whose make / origin says Việt Nam,
  // or left with none of its suppliers is dropped.
  {
    const vnSup = (id) => !!id && sup.get(id)?.country === "VN";
    result.configs = (result.configs || []).filter((c) => {
      const from = [c.genset?.src, c.engine?.src].find((s) => s?.kind === "catalog" && vnSup(s.supplierId));
      if (from) { problems.push(`#${c.rank}: cấu hình lấy từ dòng bảng của ${from.supplierId} (đặt tại Việt Nam), đã bỏ`); return false; }
      if (BP.VN_WORD.test([c.genset?.make, c.genset?.maker, c.genset?.origin].filter(Boolean).join(" "))) { problems.push(`#${c.rank}: tổ máy hãng / xuất xứ Việt Nam, đã bỏ`); return false; }
      const had = (c.suppliers || []).length;
      c.suppliers = (c.suppliers || []).filter((s) => {
        if (!vnSup(s.supplierId)) return true;
        problems.push(`#${c.rank}: nhà cung cấp ${s.supplierId} đặt tại Việt Nam, đã bỏ`);
        return false;
      });
      if (had && !c.suppliers.length) { problems.push(`#${c.rank}: không còn nhà cung cấp nào ngoài Việt Nam, đã bỏ cấu hình`); return false; }
      return true;
    });
  }
  // (1) Đặc thù hãng động cơ: only engines of the make of the term (Khoa 18/11/2026: "chỉ gợi ý hãng đó"). The make as
  // the catalog reads the model (keptMakes), else the make the configuration writes when its source shows it; an engine
  // of no known make goes too. The genset the HSMT names stays (named-genset.mjs), as everywhere.
  if (result.engineTrait) {
    const want = norm(result.engineTrait.make), terms = result.engineTrait.terms.join(", ");
    const recMake = (m) => (built.engines || []).find((x) => x.key === CAT.keyOf(m || ""))?.make || "";
    result.configs = (result.configs || []).filter((c) => {
      if (namedHere && NG.namedHit(c, namedHere, namedCtx)) return true;
      const e = c.engine || {}, own = e.make && (recMake(e.model) ? sourcedMake("engine", e) : (sourceText(e.src, e.model) || "").includes(norm(e.make)));
      const makes = [...recMake(e.model).split(" / "), ...(own ? [e.make] : [])].map((m) => norm(m.trim())).filter(Boolean);
      if (makes.includes(want)) return true;
      problems.push(`#${c.rank}: HSMT ghi ${terms} ở yêu cầu động cơ (đặc thù động cơ ${result.engineTrait.make}), động cơ ${e.model || "?"} ${makes.length ? `hãng ${[...new Set(makes)].join(" / ")}` : "chưa rõ hãng"}, đã bỏ`);
      return false;
    });
    const note = `HSMT ghi ${terms} ở yêu cầu động cơ, là công nghệ riêng của ${result.engineTrait.make}: chỉ gợi ý động cơ ${result.engineTrait.make} (Khoa, 18/11/2026).`;
    // Already there: stays where it is, so that checking a saved result again does not move it.
    const isTraitNote = (n) => /^HSMT ghi .* ở yêu cầu động cơ, là công nghệ riêng của /.test(n);
    result.notes = (result.notes || []).includes(note) ? result.notes.filter((n) => n === note || !isTraitNote(n)) : [...(result.notes || []).filter((n) => !isTraitNote(n)), note];
  } else result.notes = (result.notes || []).filter((n) => !/^HSMT ghi .* ở yêu cầu động cơ, là công nghệ riêng của /.test(n));
  // (2) A genset found on the internet stays in the power band of the run's size (bandOf: 100–120%, to 30 kVA 100–140%), as
  // the candidates of the catalog do (Khoa 18/11/2026; IB2600612866: Denyo 13 kVA for 8.5 kVA). Only when the saved page
  // gives its power (webPowerOf); the genset the HSMT names stays.
  if (cap?.value > 0) {
    const b = bandOf(cap);
    result.configs = (result.configs || []).filter((c) => {
      if (namedHere && NG.namedHit(c, namedHere, namedCtx)) return true;
      const p = webPowerOf(c, readWeb);
      if (webInBand(p, cap)) return true;
      problems.push(`#${c.rank}: tổ máy ${c.genset?.model || "?"} tìm trên internet ${p.kVA} kVA${p.rating ? ` ${p.rating}` : ""}, ngoài dải ${b.text} của ${cap.value} ${cap.unit}, đã bỏ`);
      return false;
    });
  }
  // The genset the HSMT names is never the one cut by the limit: it goes before the equivalents (stable order otherwise).
  if (namedHere) { const nr = (c) => { const h = NG.namedHit(c, namedHere, namedCtx); return h === "model" ? 0 : h === "make" ? 1 : 2; }; result.configs = (result.configs || []).map((c, i) => [c, nr(c), i]).sort((x, y) => x[1] - y[1] || x[2] - y[2]).map(([c]) => c); }
  // Hai bản bộ điều khiển: each copy right under its configuration, BEFORE the cut (Khoa was told a last make may be pushed
  // out). An earlier check's copies go first, and one the agent already wrote (same engine, alternator, controller) is not doubled.
  // A copy only takes a free place of the 8: it never pushes out a configuration the agent checked (điều phối 21/11/2026;
  // IB2600603983 00:43Z: two copies pushed out Baudouin 6M33G825/5 + DSE7420 MKII). Copies that meet as many communication
  // parts as the main one go first, `weaker` ones after; one with no place is named on its configuration (`offerNote`).
  // One controller under two names (DSE7320 on a supplier's line, DSE7320 MKII on the maker's sheet) is the same one.
  const twinBases = (result.configs || []).filter((c) => !c.ctlTwin);
  const ctlKeysOf = (m) => new Set([CAT.keyOf(m || ""), ...factsFor(facts, "controller", m || "").map((f) => CAT.keyOf(f.sheetModel || ""))].filter(Boolean));
  const twinPairs = twinBases.map((c) => {
    markOfferedMain(c);
    const t = ctlTwinOf(c) || ctlLowTwinOf(c);
    if (!t) return { c, t: null };
    const tk = ctlKeysOf(t.controller.model);
    const same = (o) => CAT.keyOf(o.engine?.model || "") === CAT.keyOf(t.engine.model) && CAT.keyOf(o.alternator?.model || "") === CAT.keyOf(t.alternator?.model || "") && !!o.controller?.model && [...ctlKeysOf(ctlModelOf(o.controller))].some((k) => tk.has(k));
    return { c, t: twinBases.some(same) ? null : t };
  });
  let twinRoom = Math.max(0, MAX_CONFIGS - twinBases.length);
  const twinKept = new Set();
  for (const p of [...twinPairs.filter((x) => x.t && !x.t.ctlTwin.weaker), ...twinPairs.filter((x) => x.t?.ctlTwin.weaker)]) if (twinRoom > 0) { twinRoom--; twinKept.add(p); }
  for (const p of twinPairs) {
    if (!p.c.controller) continue;
    if (p.t && !twinKept.has(p)) p.c.controller.offerNote = `Phương án khác, chưa thành cấu hình riêng vì đã đủ ${MAX_CONFIGS} cấu hình: ${p.t.controller.model} (${p.t.ctlTwin.by.length ? `NCC ${p.t.ctlTwin.by.join(", ")} chào` : "theo tài liệu hãng, NCC chưa chào"}).`;
    else delete p.c.controller.offerNote;
  }
  result.configs = twinPairs.flatMap((p) => (twinKept.has(p) ? [p.c, p.t] : [p.c]));
  result.configs = result.configs.slice(0, MAX_CONFIGS);
  for (const c of result.configs) for (const s of c.suppliers || []) if (s.why) s.why = plainWhy(s.why);
  copyModelChecks(result.configs, sourceText);
  // Kiểm tra tổ hợp (2026-11-10): what the HSMT says about site, overload, load step and load types, read once.
  const combo = hsmtCombo(hsmtText, result.requirements || []);
  comboNotes(result, combo);
  // Đầu phát theo datasheet hãng (dau-phat-hang B, Khoa 20/11/2026): before the sources of each part are read below.
  const altNeed = makerAltFix(result, { suppliers, RT, built, rowOf, hsmtText, cap, sync, problems, sourcesDir });
  for (const c of result.configs) {
    const texts = {};
    // A main controller the agent chose from its maker's datasheet, which no supplier of the configuration offers
    // (bdk-amf, Khoa 20/11/2026 "2"): labelled as such by code; its source is that datasheet table (sourceText "maker").
    if (c.controller) {
      if (c.controller.src?.kind === "maker" && sup.get(c.controller.src.supplierId)?.role === "controller_maker") { c.controller.fromMaker = true; c.controller.label = c.controller.offeredMain?.label || CM.CTL_ALT_LABEL; }
      else { delete c.controller.fromMaker; if (c.controller.label === CM.CTL_ALT_LABEL) delete c.controller.label; }
    }
    for (const part of ["engine", "alternator", "genset", "controller"]) {
      const p = c[part];
      if (!p) continue;
      texts[part] = sourceText(p.src, p.model);
      if (!texts[part]) { p.unverified = true; problems.push(`#${c.rank} ${part} ${p.model}: không tìm thấy nguồn (${p.src?.kind || "?"})`); continue; }
      // The code's copy names the controller as the catalog reads it (DSE7320), its supplier's line may write it otherwise ("Deepsea 7320").
      const twinNamed = part === "controller" && !!c.ctlTwin && p.src?.kind === "controller" && CAT.controllersIn(p.src.line || "").some((x) => x.model && CAT.keyOf(x.model) === CAT.keyOf(p.model));
      if (!twinNamed && (!p.fromMaker || part === "controller") && !texts[part].includes(norm(p.model).replace(/\s+/g, " ")) && !texts[part].replace(/\s/g, "").includes(norm(p.model).replace(/\s/g, ""))) { p.unverified = true; problems.push(`#${c.rank} ${part}: model ${p.model} không có trong nguồn`); }
      if (p.src?.kind === "internet" && p.src.quote && !texts[part].includes(norm(p.src.quote))) { p.unverified = true; problems.push(`#${c.rank} ${part}: câu trích web không có trong trang đã lưu`); }
      // A controller's make may come from its model code (DSE… is Deep Sea, HGM… SmartGen), as web/catalog.js reads it.
      const makeOfCode = part === "controller" && CAT.controllersIn(p.model).some((x) => x.model && x.brand === p.make);
      if (p.make && !makeOfCode && !p.fromMaker && !sourcedMake(part, p) && !texts[part].includes(norm(p.make).split(/[\s-]/)[0])) { problems.push(`#${c.rank} ${part}: hãng ${p.make} không ghi trong nguồn`); p.makeUnverified = true; }
    }
    // The configuration's genset sheet (gensetSheetOf): every block of it may be quoted, for any part of that genset.
    const sheet = sheetOfConfig(c, (id) => sup.get(id)), sf = sheetFacts(sheet);
    if (sheet) texts.sheet = norm(sheetText(sheet));
    // A grouped requirement (the controller's protections, measurements...: Khoa 2026-11-03) has one part per function;
    // each part is checked here like a check of its own, then the group is put back together.
    const groups = new Set();
    // A part the code changed in an earlier check of this result (commWords / commModules) is the agent's answer again.
    for (const x of c.checks || []) { CM.commRestore(x); for (const p of x.parts || []) CM.commRestore(p); }
    const isComm = (x) => x.part === "controller" && (reqs.get(norm(x.group ? x.group.item : x.item))?.code || x.code) === "ctl_comm";
    c.checks = (c.checks || []).flatMap((x) => {
      // Every function the requirement lists is a part of its check: one the agent left out is "unclear", so a group
      // checked on 7 of its 10 functions is not "met".
      const want = (reqs.get(norm(x.item))?.parts || []).filter((p) => p?.item);
      if (want.length && x.status !== "not_met") {
        const have = new Set((x.parts || []).map((p) => norm(p.item)));
        const miss = want.filter((p) => !have.has(norm(p.item)));
        if (miss.length) x.parts = [...(x.parts || []), ...miss.map((p) => ({ item: p.item, status: "unclear", offered: "", note: "Chưa kiểm chức năng này." }))];
      }
      if (!Array.isArray(x.parts) || !x.parts.length) return [x];
      groups.add(x);
      return x.parts.map((p) => ({ ...p, item: `${x.item}: ${p.item}`, part: x.part, level: x.level, hsmtQuote: "", group: x, name: p.item }));
    });
    for (const x of c.checks) {
      // "confirm" is the code's (confirmChecks below), never the agent's: one written by the agent, or by an earlier check
      // of this result, is "unclear" again until confirmChecks decides.
      if (x.status === "confirm") { x.status = "unclear"; delete x.confirm; if (x.licensed) { delete x.licensed; delete x.licensedNote; delete x.ask; } }
      const reasons = [], rq = reqs.get(norm(x.group ? x.group.item : x.item));
      x.level = (rq?.level || x.level) === "option" ? "option" : "core";
      if (!PARTS.includes(x.part)) x.part = rq?.part || "genset";
      // A check the code wrote (byCode: sync, overload rule, cosφ = kW/kVA...) rests on the code's rule: it has no
      // source quote to verify, and re-checking a saved result must not call it "chưa khớp nguồn". The flag is stripped
      // from the agent's own answer on entry (checkDir, mergeChecked), so an agent cannot use it to skip this.
      if (x.byCode) continue;
      if (x.hsmtQuote && !inHsmt(x.hsmtQuote)) reasons.push("câu trích HSMT");
      // factSrc: a figure of this configuration's engine or alternator read from another row or datasheet that names
      // the same model. Only those figures (not the genset ones of that row) may be quoted from it.
      let fact = null;
      if (x.factSrc) {
        const mine = factsOf(c, x.part).filter((f) => f.supplierId === x.factSrc.supplierId && Number(f.n) === Number(x.factSrc.n) && norm(f.line) === norm(x.factSrc.line));
        if (!mine.length) reasons.push("factSrc không phải dòng ghi thông số của model này");
        else fact = { text: norm(mine[0].text), nums: mine.flatMap((f) => numbersLoose(f.value)) };
        // A controller written without its generation ("DSE7320") read from the datasheet of the current one ("DSE7320 MKII").
        if (mine[0]?.version) {
          x.version = mine[0].version;
          x.note = withVersionNote(x.note, `Nguồn là datasheet ${mine[0].version}; nhà cung cấp ghi ${c[x.part].model}, cần xác nhận đời (MK) của bộ điều khiển.`);
          const gap = `Xác nhận đời bộ điều khiển: ${c[x.part].model} hay ${mine[0].version}.`;
          if (!(c.gaps || []).includes(gap)) c.gaps = [...(c.gaps || []), gap];
          // What another generation lacks the one offered may have ("HGM6110N without RS485", the HGM6110NC has it):
          // not a "not met" until the generation is known (2026-11-03 regression run).
          if (x.status === "not_met") { x.status = "unclear"; x.note = `${x.note} Code ghi: datasheet đời khác thiếu chức năng này nên tính là chưa rõ, không phải không đạt.`; }
        }
      }
      const src = texts[x.part] || texts.genset || texts.engine || texts.alternator;
      // Conversions: recomputed here from web/conversions.js; each input must be in the source / HSMT quote, a standard
      // constant of that formula, or the result of an earlier conversion of this check.
      const calc = [], used = [];
      for (const cv of x.conversions || []) {
        const r = CONV.compute(cv);
        if (r.error) { reasons.push(`quy đổi: ${r.error}`); cv.invalid = true; continue; }
        const f = CONV.FORMULAS[cv.formula];
        // The formula's own constants (1000, 120, √3 written as 1,732...) may appear in the offered text.
        used.push(...numbersIn(f.label.replace(/(\d),(\d+)/g, "$1.$2")), ...(f.label.includes("√3") ? [3, 1.73, 1.732] : []));
        for (const i of cv.inputs || []) {
          const v = Number(i.value);
          if (i.from === "source" && !numbersLoose(x.sourceQuote).includes(v)) reasons.push(`đầu vào ${i.name} = ${i.value} không có trong câu trích nguồn`);
          else if (i.from === "hsmt" && !numbersLoose(x.hsmtQuote).includes(v)) reasons.push(`đầu vào ${i.name} = ${i.value} không có trong câu trích HSMT`);
          else if (i.from === "calc" && !calc.some((c) => CONV.matches(v, c))) reasons.push(`đầu vào ${i.name} = ${i.value} không phải kết quả quy đổi trước`);
          else if (!["source", "hsmt", "calc", "standard"].includes(i.from)) reasons.push(`đầu vào ${i.name} không ghi lấy từ đâu`);
          const st = f.standard?.[i.name];
          used.push(...(i.from === "standard" && st ? [st.min, st.max] : [v]));
        }
        const stated = Array.isArray(cv.value) ? cv.value : cv.value != null ? [Number(cv.value)] : [];
        if (stated.some((v) => !CONV.matches(v, r.value))) reasons.push(`kết quả quy đổi ${cv.formula} ghi sai`);
        Object.assign(cv, { value: r.value, unit: f.unit, label: f.label, basis: f.basis });
        calc.push(r.value);
      }
      if (x.status === "met" || x.status === "not_met") {
        if (!x.sourceQuote) reasons.push("thiếu câu trích nguồn");
        else if (x.factSrc && !fact) { /* already a reason */ }
        else {
          const all = fact ? [fact.text] : Object.values(texts).filter(Boolean);
          if (!all.some((t) => t.includes(norm(x.sourceQuote)))) reasons.push("câu trích nguồn");
          else {
            // Every number offered is in the source quote (from a factSrc: in the model's own figures on that line), is
            // an input of a conversion, or is a recomputed result.
            // From a table whose models run across: only the label and the model's own column of the quoted row.
            const col = !fact && ["genset", "engine", "alternator"].map((p) => c[p] && columnOf(c[p].src, c[p].model)).find(Boolean);
            const qrow = col && col.t.rows.map(CAT.cellsOf).find((cs) => norm(cs.join(" | ")).includes(norm(x.sourceQuote).replace(/^\|\s*/, "")) || norm(x.sourceQuote).includes(norm(cs[0] || "-")));
            const quoted = qrow ? `${qrow[0]} ${qrow[qrow.length - col.off] ?? ""}` : x.sourceQuote;
            const nums = fact ? fact.nums.filter((v) => numbersLoose(x.sourceQuote).includes(v)) : numbersLoose(quoted);
            const ok = (v) => nums.includes(v) || used.includes(v) || calc.some((c) => CONV.matches(v, c));
            // The configuration's own model names ("8 kVA (cột CP198FE)") are not figures.
            const models = ["engine", "alternator", "genset", "controller"].map((p) => c[p]?.model).filter((m) => m && /\d/.test(m));
            const offered = models.reduce((s, m) => s.split(m).join(" "), String(x.offered ?? ""));
            for (const v of numbersIn(offered.replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"))) if (!ok(v)) { reasons.push(`số ${v}`); break; }
          }
        }
        // The power of a rating is that rating's column of the row (web/catalog.js reads it from the header): a "Prime"
        // check offering only the row's standby figures quotes numbers that are in the row, so the test above passes it.
        const rating = x.status === "met" && x.part === "genset" && ratingOf(x), row = rating && rowOf(c.genset?.src || c.engine?.src);
        const want = row?.power?.[rating];
        if (want) {
          const off = numbersLoose(x.offered), others = Object.entries(row.power).filter(([k]) => k !== rating).flatMap(([, p]) => [p.kVA, p.kW]).filter((v) => v != null && v !== want.kVA && v !== want.kW);
          if (!off.includes(want.kVA) && !off.includes(want.kW) && off.some((v) => others.includes(v))) reasons.push(`số công suất không phải cột ${rating} của dòng bảng (${[want.kVA && `${want.kVA} kVA`, want.kW && `${want.kW} kW`].filter(Boolean).join(" / ")})`);
        }
        // A figure the sources of this model give differently is not "met" (e.g. 14 L on one page, 10.8 on another).
        const list = factsOf(c, x.part), line = norm(x.factSrc?.line || c[x.part]?.src?.line || "");
        // Only the figures the check offers: quoted in sourceQuote and stated in `offered` (a number of it, or its words).
        const bad = factConflicts(list), q = norm(x.sourceQuote), off = norm(x.offered), offNums = numbersLoose(x.offered);
        const offers = (f) => { const n = numbersLoose(f.value); return n.length ? n.some((v) => offNums.includes(v)) : off.includes(norm(f.value)); };
        const hit = line ? [...new Set(list.filter((f) => norm(f.line) === line && q.includes(norm(f.value)) && offers(f) && bad.has(f.key)).map((f) => f.key))] : [];
        if (hit.length && x.status === "met") {
          x.status = "unclear"; x.conflict = true;
          x.note = [x.note, `Các nguồn ghi khác nhau: ${hit.map((k) => `${CAT.SPEC[k]?.vi || RATED_VI[k] || k} ${bad.get(k).join(" / ")}`).join("; ")}. Cần nhà cung cấp xác nhận.`].filter(Boolean).join(" ");
        }
      }
      if (!src && x.status !== "unclear") reasons.push("nguồn");
      // A "met" an earlier check lowered to "unclear" is no longer compared with its source (only met / not_met are): it
      // is still a point that did not match, reported with the reasons written then.
      const lowered = x.unverified && x.status === "unclear" ? LOWERED_NOTE.exec(x.note || "")?.[1] : null;
      if (reasons.length || lowered) {
        x.unverified = true;
        if (x.status === "met") { x.status = "unclear"; x.note = [x.note, `Code chưa tìm thấy nguyên văn (${reasons.join(", ")}) nên chưa tính là đạt.`].filter(Boolean).join(" "); }
        problems.push(`#${c.rank} ${x.item}: ${lowered || reasons.join(", ")}`);
      }
      // Truyền thông (Q5, Khoa 20/11/2026): a part that names 4G / Ethernet / BMS... is met only when its quote says it.
      if (isComm(x)) CM.commWords(x, factsOf(c, "controller"));
      // An "unclear" whose source has a line about it: the agent wrote "Nguồn không ghi" for the event log of a DSE8610
      // whose datasheet says "The event log records 250 events" (2026-11-03). The code does not judge the line; it
      // names it, the agent reads it (check prints it) and the web shows it.
      const h = x.status === "unclear" && !x.byCode && hintFor(c, x);
      if (h) { x.hint = h; hints.push(`#${c.rank} ${x.item}: ${h.where} có dòng: ${JSON.stringify(h.line)}${h.factSrc ? ` — factSrc ${JSON.stringify(h.factSrc)}` : ""}`); }
    }
    // Q4: the modules (NCC chưa chào) that make the configuration's communication parts met; Q1: the other controllers the
    // supplier's line offers, each with its best modules, as "Phương án khác đạt tương đương".
    if (c.controller?.model) {
      const ctlF = factsOf(c, "controller");
      // The copy with the offered controller (ctlTwin): the agent read no datasheet of it, so a communication part whose every
      // function is on that controller's own datasheet is met by code, quoting the line; the modules below do the rest.
      if (c.ctlTwin) for (const x of c.checks.filter((y) => isComm(y) && y.status !== "met")) {
        const e = CM.commEval(x.name || x.item, ctlF, []);
        if (!e.subs.length || !e.per.every((p) => p.by)) continue;
        const first = e.per[0], also = e.per.slice(1).map((p) => ({ sub: p.sub.k, supplierId: p.f.supplierId, n: p.f.n, line: p.line }));
        Object.assign(x, { status: "met", byCode: true, offered: e.per.map((p) => p.sub.k).join(", "), sourceQuote: first.line, factSrc: { supplierId: first.f.supplierId, n: first.f.n, line: first.f.line }, note: `Code đọc trên datasheet ${c.controller.model}.`, ...(also.length ? { alsoQuotes: also } : {}) });
        delete x.hint; delete x.unverified; delete x.wordsMissing;
      }
      CM.commModules(c, c.checks.filter(isComm), ctlF, compatOf(ctlModelOf(c.controller), ctlF), modFacts);
      ctlAlternatives(c, result.requirements || []);
      // A function the controller's manual lists as optional / configuration-dependent: "confirm" with the manual's line (bdk-manual-2).
      CM.ctlOptions(c.checks.filter((y) => y.group && y.part === "controller"), ctlF, ctlOptRows);
    } else if (c.controller) { delete c.controller.modules; delete c.controller.alternatives; delete c.controller.altLine; }
    if (groups.size) c.checks = c.checks.flatMap((x) => {
      if (!x.group) return [x];
      const g = x.group, parts = c.checks.filter((y) => y.group === g);
      if (parts[0] !== x) return [];
      g.parts = parts.map(({ group, name, item, part, level, ...p }) => ({ ...p, item: name }));
      Object.assign(g, { part: x.part, level: x.level });
      // Met only when every function is met; one not met makes the group not met.
      const st = (s) => g.parts.filter((p) => p.status === s).map((p) => p.item);
      g.status = st("not_met").length ? "not_met" : st("met").length === g.parts.length ? "met" : "unclear";
      g.offered = `Đạt ${st("met").length}/${g.parts.length}`;
      g.note = [st("not_met").length && `Không đạt: ${st("not_met").join(", ")}.`, st("unclear").length && `Chưa rõ: ${st("unclear").join(", ")}.`, st("confirm").length && `Cần NCC xác nhận: ${st("confirm").join(", ")}.`].filter(Boolean).join(" ");
      delete g.sourceQuote; delete g.factSrc;
      g.unverified = g.parts.some((p) => p.unverified) || undefined;
      if (g.hsmtQuote && !inHsmt(g.hsmtQuote)) {
        g.unverified = true; problems.push(`#${c.rank} ${g.item}: câu trích HSMT`);
        if (g.status === "met") g.status = "unclear";
      }
      return [g];
    });
    // Suppliers: only ids of the supplier DB, each with a row of its own tables that names this engine (and alternator).
    const squash = (s) => norm(s).replace(/\s/g, "");
    c.suppliers = (c.suppliers || []).filter((s) => {
      if (sup.has(s.supplierId)) return true;
      problems.push(`#${c.rank}: nhà cung cấp ${s.supplierId} không có trong hệ thống, đã bỏ`);
      return false;
    }).slice(0, 3);
    for (const s of c.suppliers) {
      const t = (sup.get(s.supplierId).specTables || []).find((x) => x.n === Number(s.n) && x.rows.some((l) => norm(l) === norm(s.line)));
      const row = t ? squash([...(t.header || []), s.line, t.title].join(" ")) : "";
      if (!t) { s.unverified = true; problems.push(`#${c.rank}: dòng bảng của ${s.supplierId} không có trong CSDL`); continue; }
      if (c.engine?.model && !row.includes(squash(c.engine.model)) && !fromLineOf({ kind: "catalog", supplierId: s.supplierId, n: s.n, line: s.line }, c.engine.model)) { s.unverified = true; problems.push(`#${c.rank}: dòng của ${s.supplierId} không ghi động cơ ${c.engine.model}`); }
      s.hasAlternator = !!c.alternator?.model && row.includes(squash(c.alternator.model));
      const ck = c.controller?.model && CAT.keyOf(c.controller.model);
      s.hasController = !!ck && (row.includes(squash(c.controller.model)) || (sup.get(s.supplierId).controllers || []).some((x) => x.model && CAT.keyOf(x.model) === ck));
    }
    c.checks = (c.checks || []).filter((x) => !isSyncItem(x.item));
    const row = rowOf(c.genset?.src || c.engine?.src), altAttrs = ratingsFor(RT.attr, c.alternator?.model);
    stdChecks(c, result.requirements || [], row);
    fuelChecks(c, result.requirements || [], row, factsOf(c, "engine"));
    powerChecks(c, result.requirements || [], row);
    pfChecks(c, result.requirements || [], row);
    currentChecks(c, result.requirements || [], row);
    freqChecks(c, result.requirements || [], row, [...altAttrs.filter((a) => a.key === "poles"), ...factsOf(c, "alternator").filter((f) => /\bpoles?\b|số cực|极数/i.test(f.label || ""))]);
    sheetChecks(c, result.requirements || [], { sheet, facts: sf, named: namedHere, hit: namedHere ? NG.namedHit(c, namedHere, namedCtx) : null, supOf: (id) => sup.get(id) });
    if (sync) {
      // The make of each part: as the configuration writes it, as the catalog reads the model, or from the model code.
      const recMake = (list, m) => (list || []).find((x) => x.key === CAT.keyOf(m || ""))?.make || "";
      const fam = {
        engine: c.engine && BP.familyOf(c.engine.make, recMake(built.engines, c.engine.model), c.engine.model),
        alternator: c.alternator && BP.familyOf(c.alternator.make, recMake(built.alternators, c.alternator.model), c.alternator.model),
        controller: c.controller && BP.familyOf(c.controller.make, c.controller.model, ...CAT.controllersIn(c.controller.model || "").map((x) => x.brand)),
      };
      // The genset maker: the make the configuration gives its genset, else a genset maker among its suppliers whose
      // name is a make (Cummins Power Generation, Weichai Power...). An assembler or a trader is not one.
      // An assembler (its name is no make) makes at most the parts whose make is not known.
      const makers = [...(c.genset?.make && BP.familyOf(c.genset.make) ? [{ name: c.genset.make, fam: BP.familyOf(c.genset.make) }] : []),
        ...(c.suppliers || []).filter((s) => !s.unverified).map((s) => sup.get(s.supplierId)).filter((r) => r && r.role !== "distributor").map((r) => ({ name: r.names?.en || r.id, fam: gensetMakerOf(r) }))];
      c.checks.unshift(syncCheck(sync, fam, makers, { engine: c.engine?.model, alternator: c.alternator?.model, controller: c.controller?.model }));
    }
    // (5) The controller term the HSMT names (Khoa 18/11/2026): met when the configuration's controller or a source of it
    // names the term (raw texts: a short acronym is matched case-sensitively); a controller of the term's make whose sources
    // do not say it is unclear (the supplier confirms: AmpSentry is a function of a PowerCommand; nothing is inferred, the
    // coordinator agreed 18/11/2026 and told Khoa); any other controller, or none, is not met (câu 2 (a)).
    c.checks = (c.checks || []).filter((x) => !isTraitCtlItem(x));
    if (trait.controllers.length) {
      const k = c.controller || {}, page = k.src?.kind === "internet" && k.src.file ? readWeb(k.src.file) || "" : "";
      const raws = [k.model, k.make, k.src?.line, k.src?.quote, page, ...factsOf(c, "controller").map((f) => f.line)].filter(Boolean);
      const brands = [k.make, ...CAT.controllersIn(k.model || "").map((x) => x.brand)].filter(Boolean).map(norm);
      const named = k.model ? `${k.make ? `${k.make} ` : ""}${k.model}` : "";
      const out = trait.controllers.map((t) => {
        const base = { item: TRAIT_CTL_ITEM(t.term), requirement: `Bộ điều khiển có ${t.term} (của ${t.makeName}) như HSMT nêu`, hsmtQuote: t.line, offered: named || "Không có bộ điều khiển có nguồn", part: "controller", level: "core", byCode: true, trait: t.term };
        if (k.model && raws.some((s) => ET.termHit(t.term, s))) return { ...base, status: "met", note: `Code ghi: bộ điều khiển ${named} là / có ${t.term}.` };
        if (k.model && brands.some((b) => b.includes(norm(t.makeName)))) return { ...base, status: "unclear", note: `Code ghi: bộ điều khiển ${named} của ${t.makeName} nhưng nguồn không ghi ${t.term}: cần nhà cung cấp xác nhận.` };
        return { ...base, status: "not_met", note: `Code ghi: HSMT nêu đích danh ${t.term} (${t.makeName}); ${named ? `bộ điều khiển ${named} không phải ${t.term}` : "cấu hình không có bộ điều khiển"}.` };
      });
      c.checks = [...out, ...c.checks];
    }
    // (6) Fuel (Khoa 20/11/2026): a configuration whose catalog rows (the c.suppliers lines) say gas / gasoline for a diesel
    // HSMT (or the other way round) is "không đạt" at the engine, ranked after, still shown; a row with no fuel written says
    // nothing. Only rows of the catalog: the code writes nothing about an engine found on the internet.
    c.checks = (c.checks || []).filter((x) => !x?.fuelRule);
    {
      const fh = fuelOfHsmt(technicalPart(hsmtText || ""));
      const bad = fh.fuel ? (c.suppliers || []).filter((s) => !s.unverified).map((s) => rows.get(`${s.supplierId}|${Number(s.n)}|${CAT.keyOf(s.line || "")}`)).filter((u) => fuelOff(fh.fuel, u?.fuel)) : [];
      if (bad.length) {
        const kind = (f) => (f === "gas" ? "khí" : f === "gasoline" ? "xăng" : "xăng / khí"), want = fh.fuel === "diesel" ? "diesel" : kind(fh.fuel);
        const u = bad[0];
        c.checks.unshift({ item: "Nhiên liệu (HSMT)", requirement: `Nhiên liệu của tổ máy: ${want} (${fh.why})`, hsmtQuote: fh.stated ? fh.why : "", offered: `Dòng bảng của ${u.supplierId} ghi ${kind(u.fuel)}`, part: "engine", level: "core", byCode: true, fuelRule: true, status: "not_met", note: `Code ghi: dòng catalog ${u.supplierId} [${u.n}] ${u.fuelWhy || ""} (mức ${u.fuelFrom || "?"}); HSMT ${fh.stated ? "nêu" : "không nêu nhiên liệu nên coi là"} ${want}.` });
      }
    }
    confirmChecks(c, result.requirements || []);
    vregChecks(c, result.requirements || [], factsOf(c, "alternator"));
    altAttrChecks(c, result.requirements || [], altAttrs, factsOf(c, "alternator"));
    makerSheetChecks(c, result.requirements || [], { engine: factsOf(c, "engine"), alternator: factsOf(c, "alternator") }, { hsmtCompr });
    comprChecks(c, result.requirements || [], factsOf(c, "engine"), { hsmtCompr });
    khoaRules(c, result.requirements || [], row, { origin });
    originChecks(c, result, origin, sup);
    madeChecks(c, result.requirements || [], row, built);
    makerCtlChecks(c, result.requirements || []);
    makerAltChecks(c, result.requirements || [], altNeed, { sourcesDir });
    if (namedHere) NG.brandLicensedChecks(c, result.requirements || [], namedHere, NG.namedHit(c, namedHere, namedCtx), (id) => sup.get(id));
    comboChecks(c, { combo, row: rowOf(c.genset?.src || c.engine?.src), engFacts: [...factsOf(c, "engine"), ...ratingsFor(RT.eng, c.engine?.model)], altFacts: factsOf(c, "alternator"), altRatings: ratingsFor(RT.alt, c.alternator?.model), altKva: c.alternator?.model ? altKva.get(CAT.keyOf(c.alternator.model)) || [] : [], reqs: result.requirements || [] });
    if (!c.suppliers.length) c.gaps = [...(c.gaps || []), "Chưa có nhà cung cấp nào trong hệ thống có dòng bảng chào đúng cấu hình này."];
  }
  clarifyOf(result, hsmtText, combo, problems, { scan: !sized });
  // Tổ máy HSMT nêu đích danh: c.named / c.equivalent, result.named, result.namedWarn and its question (after clarifyOf,
  // which rebuilds the code's questions).
  NG.markNamed(result, namedHere, { ...namedCtx, problems });
  for (const c of result.configs) orderChecks(c, result.requirements || []);
  syncMarkNote(result);
  if (!result.configs.length && !result.message) result.message = "Không có động cơ và đầu phát nào trong hệ thống hay trên internet đáp ứng đủ yêu cầu của HSMT.";
  return { result, problems, hints };
}
// check() runs again on results it already wrote (keepFound, restoreWeb), so what it writes must not pile up
// (check-luy-dang, 22/11/2026: 15 of 17 saved runs changed on a second check).
const LOWERED_NOTE = /Code chưa tìm thấy nguyên văn \((.*?)\) nên chưa tính là đạt\./;
const VERSION_NOTE = /\s*Nguồn là datasheet [^;]*; nhà cung cấp ghi [^,]*, cần xác nhận đời \(MK\) của bộ điều khiển\./g;
// One sentence about the controller's generation, where the first one stood (a saved note may hold it many times).
function withVersionNote(note, sentence) {
  let first = true;
  const out = String(note || "").replace(VERSION_NOTE, (m) => { if (!first) return ""; first = false; return `${/^\s/.test(m) ? " " : ""}${sentence}`; });
  return first ? [note, sentence].filter(Boolean).join(" ") : out;
}
// The order of a configuration's checks: those the code always puts first, then by requirement, then the rest by part
// and name. Without it a check written again (the alternator's, when one is chosen from its maker's datasheet) moves.
function orderChecks(c, reqs) {
  const at = new Map();
  reqs.forEach((r, i) => { const k = norm(r.item || ""); if (!at.has(k)) at.set(k, i); });
  // NO_CONTROLLER first of all: rankConfigs writes it at the very top after this runs.
  const first = (x) => x.fuelRule || isSyncItem(x.item) || isTraitCtlItem(x);
  const keyOf = (x) => (x.item === NO_CONTROLLER ? -2 : first(x) ? -1 : at.get(norm(x.item || "")) ?? Infinity);
  c.checks = (c.checks || []).map((x, i) => ({ x, i, k: keyOf(x) })).sort((a, b) => {
    if (a.k !== b.k) return a.k < b.k ? -1 : 1;
    if (a.k === Infinity) { const t = `${a.x.part || ""}|${a.x.item || ""}`.localeCompare(`${b.x.part || ""}|${b.x.item || ""}`, "vi"); if (t) return t; }
    return a.i - b.i;
  }).map((e) => e.x);
}
// "N điểm … đã đánh dấu ⚠" counts the marks the result holds, so that it says the same however often it is checked and
// leaves out a configuration rankConfigs dropped. One note, where it stood.
const MARK_NOTE = /^Kiểm tra bằng code: \d+ điểm chưa khớp nguồn/;
function syncMarkNote(result) {
  const marked = (list) => (list || []).filter((x) => x?.unverified).length;
  let n = marked(result.requirements);
  for (const c of result.configs || []) {
    n += marked(PARTS.map((p) => c[p])) + marked(c.suppliers) + marked(c.checks);
    for (const x of c.checks || []) n += marked(x.parts);
  }
  const text = `Kiểm tra bằng code: ${n} điểm chưa khớp nguồn, đã đánh dấu ⚠.`, notes = result.notes || [], i = notes.findIndex((x) => MARK_NOTE.test(x));
  if (i < 0) { if (n) result.notes = [...notes, text]; return; }
  result.notes = notes.flatMap((x, j) => (j === i ? (n ? [text] : []) : MARK_NOTE.test(x) ? [] : [x]));
}
// The agent's summary counts the configurations it wrote; the code may drop some after (IB2600612866, 2026-11-17: the
// summary said 6 with a Kubota J112, the list showed 5). The summary's count follows the list, and a note says which
// configuration went and why (the code's own "#<rank>: … đã bỏ" lines, else the dedupe / per-make limit of rankConfigs).
export const cfgKey = (c) => [c.genset?.model, c.engine?.model, c.alternator?.model].map((x) => CAT.keyOf(x || "")).join("|");
export const cfgName = (c) => [c.genset?.make || c.engine?.make, c.genset?.model || c.engine?.model].filter(Boolean).join(" ") || `#${c.rank}`;
export function noteDropped(given, result, problems = []) {
  const left = new Set((result.configs || []).map(cfgKey));
  const gone = given.filter((g) => !left.has(g.key));
  if (!gone.length) return;
  const n = (result.configs || []).length;
  const why = (g) => {
    const p = problems.filter((x) => g.rank != null && x.startsWith(`#${g.rank}:`) && /đã bỏ/.test(x)).map((x) => x.replace(/^#\d+:\s*/, ""));
    return p.length ? p.join("; ") : "trùng cấu hình khác hoặc vượt số cấu hình mỗi hãng động cơ";
  };
  if (result.summary) {
    const re = new RegExp(`\\b${given.length}(\\s+cấu hình)`);
    if (re.test(result.summary)) result.summary = result.summary.replace(re, `${n}$1`);
    result.summary += ` (Code đã bỏ ${gone.map((g) => g.name).join(", ")} sau khi agent viết tóm tắt này; danh sách còn ${n} cấu hình.)`;
  }
  result.notes = [...(result.notes || []), ...gone.map((g) => `Code đã bỏ cấu hình ${g.name} agent đề xuất: ${why(g)}.`)];
}
function checkDir(dir, suppliers, added = [], origin) {
  const meta = fs.existsSync(path.join(dir, "meta.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8")) : {};
  const result = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
  // result.json is the agent's own answer: `byCode` is the code's flag, never the agent's (see check()).
  stripAgentCodeFlags(result.requirements); for (const c of result.configs || []) stripAgentCodeFlags(c.checks);
  // A supplier added from the internet: its rows were numbered in newCatalog.json, renumbered when added.
  for (const a of added) if (a.nmap) for (const c of result.configs || []) for (const s of c.suppliers || []) { if (a.from && s.supplierId === a.from) s.supplierId = a.supplierId; if (s.supplierId === a.supplierId && a.nmap[s.n] != null) s.n = a.nmap[s.n]; }
  if (added.length) result.catalogAdded = added.map(({ nmap, ...a }) => a);
  const readWeb = (f) => { const p = path.join(dir, f); return p.startsWith(path.join(dir, "web")) && fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  const hsmtText = fs.readFileSync(path.join(dir, "hsmt.txt"), "utf8");
  const given = (result.configs || []).map((c) => ({ rank: c.rank, key: cfgKey(c), name: cfgName(c) }));
  const out = check(result, { hsmtText, suppliers, readWeb, origin, basis: meta.basis, sized: !!meta.sized, cap: meta.cap || null });
  rankConfigs(out.result);
  noteDropped(given, out.result, out.problems);
  // The analysis' technical lines the requirements may have missed (Khoa, 2026-11-06), for the agent to read again.
  const specs = fs.existsSync(path.join(dir, "specs.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "specs.json"), "utf8")) : [];
  out.uncovered = uncoveredSpecs(specs, out.result.requirements);
  // Requirement codes the HSMT's technical part names on a line that no requirement carries (reqcodes.mjs).
  out.missing = missingCodes(technicalPart(hsmtText), out.result.requirements);
  return out;
}
// Requirements the agent may leave out (2026-11-06 audit of 8 suggestions against their analysis: the controller's whole
// section, the set's origin, "đồng bộ thương hiệu", ISO 8528 / prototype certificates, tank and noise were missed in
// some). A line of the analysis' technicalSpecs about the set, engine, alternator or controller whose topic no
// requirement mentions. Topics by keywords; a line about delivery, warranty, documents, ATS, cables... is not one.
const SPEC_TOPICS = [
  ["bộ điều khiển", /điều\s*khiển|controller|\bAMF\b|modbus|RS-?485|nhật\s*ký|event\s*log|hiển\s*thị|bảo\s*vệ/i],
  ["đồng bộ thương hiệu / OEM", /đồng\s*bộ\s*(0?\d|hai|ba|thương|cùng|bởi|từ|chính)|cùng\s*(một\s*)?(hãng|thương\s*hiệu|nhãn\s*hiệu|nhà\s*sản\s*xuất)|\bOEM\b/i],
  ["xuất xứ / nhãn hiệu", /xuất\s*xứ|nguyên\s*chiếc|nhãn\s*hiệu|\bhãng\b|thương\s*hiệu|\bmodel\b/i],
  ["prototype", /prototype|thử\s*nghiệm\s*mẫu|type\s*test/i],
  ["tiêu chuẩn tổ máy", /ISO\s*(8528|3046)|IEC\s*60034|\bEN\s*\d|\bCE\b|class\s*G\d|cấp\s*vận\s*hành/i],
  ["bồn nhiên liệu", /(bồn|bình|thùng)\s*(dầu|nhiên\s*liệu)/i], ["độ ồn", /độ\s*ồn|dB\s*\(?A/i], ["kích thước / khối lượng", /kích\s*thước|khối\s*lượng|trọng\s*lượng/i],
  ["tiêu hao nhiên liệu", /tiêu\s*hao/i], ["công suất", /công\s*suất|\bkVA\b|\bkW\b/i], ["nhận tải / quá tải", /nhận\s*tải|quá\s*tải/i],
  ["động cơ", /động\s*cơ|xi\s*lanh|xy\s*lanh|tăng\s*áp|turbo|điều\s*tốc|phun|làm\s*mát|tỷ\s*số\s*nén|tỉ\s*số\s*nén|khởi\s*động/i],
  ["đầu phát", /đầu\s*phát|cách\s*điện|\bIP\s?\d|\bAVR\b|kích\s*từ|sóng\s*hài|THD|ổ\s*đỡ|chổi\s*than/i],
  ["khí thải", /khí\s*thải|emission|\bTier\b|\bStage\b|Euro/i], ["nhiệt độ môi trường", /nhiệt\s*độ\s*(môi\s*trường|làm\s*việc)|°C/i],
];
const SPEC_NOT = /hồ\s*sơ|thông\s*tin|phụ\s*kiện|quản\s*lý\s*chất\s*lượng|bảo\s*hành|bảo\s*trì|đào\s*tạo|vận\s*chuyển|lắp\s*đặt|bàn\s*giao|tài\s*liệu|catalogue|\bCO\b|\bCQ\b|hải\s*quan|\bATS\b|cáp|đầu\s*cốt|ống\s*(luồn|thoát|xả)|tiếp\s*địa|phụ\s*tùng|vật\s*tư|nhân\s*sự|tiến\s*độ|số\s*lượng|năm\s*sản\s*xuất|tình\s*trạng|mới\s*100|thử\s*(tải|nghiệm)|kiểm\s*(tra|định)|nghiệm\s*thu|chạy\s*thử|vỏ\s*(chống|cách|giảm)|sơn|khung|giảm\s*thanh|nạp\s*lần|ắc\s*quy|phạm\s*vi|đại\s*(diện|lý)|ủy\s*quyền|dịch\s*vụ/i;
// The coverage of the HSMT in code, apart from what the agent read (read guard, điều phối 2026-11-12): checkDir's
// `missing` (a requirement code a line of the HSMT's technical part names that no requirement carries) and `uncovered`
// (an analysis line whose topic no requirement mentions) went only to the CLI; and a requirement some configuration has
// no check of. Notes only: no status is changed (rankConfigs already counts a core requirement without a check as unclear).
// Short on the web (điều phối 2026-11-12: Khoa dislikes long warnings): a count and the first 3 names, ≤ NOTE_MAX.
export const NOTE_MAX = 300;
const few = (names) => { const n = [...new Set(names.map((x) => String(x).replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim()))]; return n.slice(0, 3).join("; ") + (n.length > 3 ? ` và ${n.length - 3} điểm khác` : ""); };
export const capNote = (s) => (s.length <= NOTE_MAX ? s : s.slice(0, NOTE_MAX - 1).replace(/\s+\S*$/, "") + "…");
// A missing code worth the web (điều phối 2026-11-12, IB2600592684: "bảo hành ≥ 1000 giờ chạy" read as "Đo lường,
// hiển thị"): of the engine, alternator or genset, on an HSMT line with a measured figure (a number and its unit). The
// rest goes to the console only.
const MEASURE = /\d\s*(?:kva|kw|kvar|v\b|vac|vdc|hz|a\b|vòng|v\/p|rpm|l\b|lít|lit\b|dm3|cm3|cc\b|db|°\s*c|độ\s*c|mm|cm\b|m3|kg|tấn|bar|kpa|mpa|%|xi\s*lanh|xy\s*lanh|cyl|g\/kwh|l\/h|lít\/giờ)/i;
// "mới 100%" (new goods) is no measurement.
export const webMissing = (missing = []) => missing.filter((m) => { const l = String(m.line || "").normalize("NFC").replace(/mới\s*100\s*%/gi, ""); return ["engine", "alternator", "genset"].includes(m.part) && MEASURE.test(l); });
export function coverNotes(result, { missing: all = [], uncovered = [] } = {}) {
  const notes = [], missing = webMissing(all);
  if (missing.length) notes.push(`HSMT có ${missing.length} điểm code dò thấy mà danh sách yêu cầu chưa có (có thể nhầm): ${few(missing.map((m) => m.item))}.`);
  if (uncovered.length) notes.push(`Phân tích HSMT có ${uncovered.length} dòng thông số chưa có yêu cầu: ${few(uncovered.map((u) => u.replace(/^- /, "").split(":")[0]))}.`);
  const reqs = (result?.requirements || []).filter((r) => r.item && !r.byCode && !r.unverified);
  const lack = [];
  for (const c of result?.configs || []) {
    const have = new Set((c.checks || []).map((x) => norm(x.item)));
    const miss = reqs.filter((r) => r.level !== "option" && !have.has(norm(r.item))).map((r) => r.item);
    if (miss.length) lack.push(`#${c.rank ?? "?"} (${miss.join(", ")})`);
  }
  if (lack.length) notes.push(`${lack.length} cấu hình chưa có điểm đối chiếu cho yêu cầu chính (tính là chưa rõ): ${lack.slice(0, 3).join("; ")}${lack.length > 3 ? "…" : ""}.`);
  return notes.map(capNote);
}
export function uncoveredSpecs(specs, reqs) {
  const have = (reqs || []).map((r) => `${r.item} ${r.requirement || ""} ${(r.parts || []).map((p) => p.item).join(" ")}`).join("\n");
  const out = [];
  for (const s of specs || []) {
    const t = `${s.item || ""}: ${s.requirement || ""}`;
    // Nor a line the analysis says the HSMT does not state ("Độ ồn: Không nêu trong tài liệu").
    if (SPEC_NOT.test(s.item || "") || /^\W*không\s*(nêu|có|ghi)/i.test(s.requirement || "")) continue;
    const topics = SPEC_TOPICS.filter(([, re]) => re.test(t));
    const miss = topics.filter(([, re]) => !re.test(have));
    if (miss.length) out.push(`- ${t.slice(0, 220)} [chưa có yêu cầu về: ${miss.map(([n]) => n).join(", ")}]`);
  }
  return out;
}
// The order of the configurations and of their suppliers, set in code (Khoa, 2026-11-02): the engine and the
// controller first, then the alternator and the genset as a whole; options (tank, size, noise...) come last. In each
// group a "not met" weighs more than a supplier that fits, which weighs more than an "unclear"; a core requirement with
// no check counts as unclear, so a configuration checked on fewer points is not ranked higher. Ties: an engine of a
// Chinese make first (Khoa, 2026-11-05), then the agent's order.
// Đồng bộ thương hiệu weighs with the engine and the controller: it decides their makes (Khoa, 2026-11-06).
const groupOf = (x) => (x.level === "option" ? 2 : x.part === "engine" || x.part === "controller" || x.item === SYNC_ITEM ? 0 : 1);
export function scoreOf(c, reqs = []) {
  const n = [[0, 0], [0, 0], [0, 0]], seen = new Set();
  for (const x of c.checks || []) {
    seen.add(norm(x.item));
    const g = groupOf(x);
    // A group of controller functions counts each function (2026-11-03 regression run: a controller meeting 4 of 30
    // ranked above one meeting 26 of 30, both being one "unclear" group).
    // "confirm" (chosen when ordering / a document to send: confirmChecks) is not an "unclear": the model is not in doubt.
    // A function the manual lists as optional (ctlOption) still counts as unclear: whether this unit has it is the open point.
    for (const p of x.parts?.length ? x.parts.map((q) => ({ ...q, unverified: q.unverified || x.unverified })) : [x]) {
      if (p.status === "not_met") n[g][0]++; else if ((p.status !== "confirm" || p.ctlOption) && (p.status !== "met" || p.unverified)) n[g][1]++;
    }
  }
  for (const r of reqs) if (!seen.has(norm(r.item)) && !confirmKindOf(r)) n[groupOf(r)][1] += r.parts?.length || 1;
  const fits = (c.suppliers || []).some((s) => !s.unverified) ? 0 : 1;
  return [n[0][0], n[1][0], fits, n[0][1], n[1][1], n[2][0], n[2][1]];
}
// Xuất xứ G7 / G20 read from the HSMT (originBasis "origin", Khoa 2026-11-11): the filter keeps only suppliers based in
// the group, but a Cummins of DCEC is still made in China, so every configuration asks for the CO (where the engine,
// alternator and genset are made); and the requirement "Xuất xứ tổ máy" (genset_origin) is met by the code when a
// supplier of the configuration is based in a country of the group (its country in the supplier DB). Outside the group
// the code writes nothing (no rule for it yet). Thương hiệu ("brand") asks for no CO: the HSMT does not ask where.
export function originChecks(c, result, origin, sup) {
  delete c.originAsk;
  if (result.originBasis !== "origin" || !GROUP_ORIGIN.has(origin)) return c;
  const G = GROUP_NAME[origin], inGroup = (s) => CAT.COUNTRY_GROUP[origin].includes(s?.country);
  c.originAsk = [{ part: "genset", item: `Xuất xứ ${G} (CO)`, requirement: `Xuất xứ ${G}`, kind: "document", status: "confirm", ask: "Gửi CO hoặc nêu nước sản xuất của động cơ, đầu phát và tổ máy" }];
  const r = (result.requirements || []).find((q) => q.code === "genset_origin");
  const s = (c.suppliers || []).map((x) => sup.get(x.supplierId)).find(inGroup);
  if (!r || !s) return c;
  const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
  if (x && (x.status === "met" || x.status === "not_met") && !x.unverified) return c;
  const check = { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: `Nhà cung cấp ${s.names?.en || s.id} đặt tại ${countryVi(s.country)}`, part: "genset", level: r.level || "core", status: "met", byCode: true,
    note: `Code ghi: nhà cung cấp tổ máy đặt tại nước thuộc nhóm ${G} (hồ sơ nhà cung cấp); nơi sản xuất động cơ, đầu phát cần CO.` };
  if (x) { delete x.unverified; delete x.hint; Object.assign(x, check); } else c.checks = [...(c.checks || []), check];
  return c;
}
// Xuất xứ động cơ / đầu phát / bộ điều khiển (engine_origin, alt_origin, ctl_origin) asked of a group as the place it is
// made (Khoa 2026-11-16/17: "phân biệt rõ thương hiệu và nơi sản xuất"): the code decides from the part's source row
// (catalog.js madeIn: the row, its column titles, the page title; for an internet part the quote): a place outside
// the group (a Chinese plant: DCEC, SME, Stamford Wuxi…) is not met; a place in the group, or the country Khoa settled on
// for the make (Deep Sea, Stamford, Leroy-Somer…), is met; nothing written is "Cần chứng từ" (CO), whatever the agent
// judged from the make. The group is the one the requirement names ("G7, EU", "G20"). A brand asked ("Thương hiệu
// thuộc các nước G7"), or a requirement that names no group, stays the agent's.
const MADE_CODES = { engine_origin: "engine", alt_origin: "alternator", ctl_origin: "controller" };
export function madeBasisOf(t) {
  const s = String(t || "").replace(/\s+/g, " "), G = /\bG\s?-?(7|20)\b/;
  for (const cl of s.split(/;\s*|\.\s+(?=[A-ZÀ-Ỹ])/)) {
    if (!G.test(cl) || NOT_PART_RULE.test(cl)) continue;
    const g = cl.search(G), cut = cl.lastIndexOf(":", g), value = cl.slice(cut + 1), label = cut >= 0 ? cl.slice(0, cut) : "";
    const b = placeOrBrand(value) || placeOrBrand(label.slice(label.lastIndexOf(":") + 1));
    if (b) return b;
  }
  return null;
}
export function madeChecks(c, reqs, row, built) {
  for (const r of reqs || []) {
    const part = MADE_CODES[r.code], p = part && c[part];
    // An alternator chosen from its maker's sheet: makerAltChecks (Khoa's answer 4).
    if (!p?.model || r.byCode || p.fromMaker) continue;
    const t = `${r.requirement || ""} ${r.quote || ""}`;
    if (!/\bG\s?-?(7|20)\b/.test(t) || (madeBasisOf(r.quote) || madeBasisOf(r.requirement)) !== "origin") continue;
    const grp = `${/\bG\s?-?20\b/.test(t) ? "g20" : "g7"}${EU_W.test(t) ? "eu" : ""}`, G = GROUP_NAME[grp];
    const list = part === "engine" ? built.engines : part === "alternator" ? built.alternators : built.controllers;
    const makes = String(p.make || (list || []).find((x) => x.key === CAT.keyOf(p.model))?.make || "").split(" / ").filter(Boolean);
    const own = p.src?.kind !== "internet" && row ? row : null;
    let m = CAT.madeIn(part, makes, own ? [[own.line, ...(own.lines?.rows || [])].join(" \n "), (own.header || []).join(" "), own.title || ""] : [p.src?.quote || ""], p.model);
    // Stamford S4–S7 a supplier offers (Khoa 21/11/2026 "có"), the PLACE asked: the make's default (UK) proves nothing, the
    // CO is asked. A place the row or the agent's own quote states still counts; a brand asked never comes here.
    const isDefault = (w) => /^(hãng|mặc định)/.test(w || "");
    const noDefault = part === "alternator" && makes.some((k) => /stamford/i.test(k)) && NO_PLANT["stamford-avk-china"].re.test(String(p.model).trim().replace(/^stamford\s+/i, ""));
    if (noDefault && isDefault(m.why)) m = { at: "?", why: "" };
    const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
    const inG = m.at !== "?" && CAT.COUNTRY_GROUP[grp].includes(m.at);
    const status = m.at === "?" ? "confirm" : inG ? "met" : "not_met";
    // A not met / met the agent verified from a source of its own stays, unless the row says otherwise.
    const rowSays = !!m.why && !/^(hãng|mặc định)/.test(m.why);
    const q = x?.sourceQuote ? CAT.madeIn(part, makes, x.sourceQuote, p.model) : null;
    if (x && !x.unverified && (x.status === "met" || x.status === "not_met") && !rowSays && q && q.at !== "?" && !(noDefault && isDefault(q.why))) continue;
    const at = m.at === "?" ? "" : `sản xuất tại ${madeVi(m.at)}${/^(hãng|mặc định)/.test(m.why || "") ? ` (${m.why})` : ""}`;
    putCheck(c, x, { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: [PART_VI[part], p.model, at].filter(Boolean).join(" "),
      ...(m.why && !/^(hãng|mặc định)/.test(m.why) ? { sourceQuote: m.why } : {}), part, level: r.level === "option" ? "option" : "core", status, byCode: true, rule: "noi-san-xuat",
      ...(status === "confirm" ? { confirm: "document" } : {}),
      note: status === "confirm" ? `Cần xác nhận nơi sản xuất ${PART_VI[part].toLowerCase()} (CO): nguồn của cấu hình không ghi${m.why ? ` rõ (${m.why})` : ""}${noDefault ? "; Stamford S4–S7 không lấy nơi mặc định của hãng (Khoa 21/11/2026)" : ""}; HSMT đòi nơi sản xuất ${G}.`
        : status === "met" ? `Code ghi: ${PART_VI[part].toLowerCase()} sản xuất tại ${madeVi(m.at)}, thuộc nhóm ${G}.` : `Code ghi: ${PART_VI[part].toLowerCase()} sản xuất tại ${madeVi(m.at)}, ngoài nhóm ${G} HSMT đòi.` });
  }
  return c;
}
// Bốn loại yêu cầu (reqcodes.mjs kind, 2026-11-10): a point the sources do not state is not in doubt the same way for
// every kind. A voltage of 400/230 V, an IP23 alternator, an MCCB, a tank (`order`) are chosen when ordering without
// changing the model; an ISO 9001 certificate, a prototype report, the set's CO (`document`) are papers the supplier
// sends. Such a check the sources leave "unclear" becomes "confirm" ("xác nhận khi đặt hàng" / "cần chứng từ"), which
// rankConfigs does not count as unclear. Not a check whose quote the code could not find (unverified), whose sources
// disagree (conflict), of a controller generation to confirm (version), or a group. A `hint` does not keep it unclear:
// the agent has read the hinted line by then (check prints it), and the hint of an order point is mostly a near miss
// (IB2600586587: "Voltage regulation NL-FL ≤±1%" hinted for "AVR tự động" on 3 configurations, none on a 4th with the
// same alternator, which then ranked above them). A requirement of those kinds with no check of the
// configuration gets one, written by the code. A met / not met stays as it is. Decided here, never by the agent.
// Which kind a requirement is confirmed as (order / document, with the conditions of reqcodes.mjs confirmKindOf), or null.
export function confirmChecks(c, reqs = []) {
  const kinds = new Map(reqs.map((r) => [norm(r.item), confirmKindOf(r)]));
  for (const x of c.checks || []) {
    if (x.status === "confirm") { x.status = "unclear"; delete x.confirm; }
    const k = kinds.get(norm(x.item));
    if (x.status !== "unclear" || !k || x.unverified || x.conflict || x.version || x.parts?.length) continue;
    x.status = "confirm"; x.confirm = k;
  }
  const have = new Set((c.checks || []).map((x) => norm(x.item)));
  for (const r of reqs) {
    const k = confirmKindOf(r);
    if (have.has(norm(r.item)) || !k || r.byCode) continue;
    c.checks = [...(c.checks || []), { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: "", part: r.part || "genset", level: r.level === "option" ? "option" : "core",
      status: "confirm", confirm: k, byCode: true, note: "Code ghi: nguồn của cấu hình không nói tới điểm này." }];
  }
  return c;
}
// Ổn định điện áp (alt_vreg, điều phối 2026-11-11, gói IB2600603983): the steady-state voltage band depends on the AVR
// chosen when ordering (SX460 ±1%, AS440 / MX341 ±1%, MX321 / DM110 ±0,5%...), not only on the alternator model. A check
// "not met" or "unclear" whose sources state a band (± x%) looser than the HSMT's (± y%, the strictest it states) becomes
// "confirm" (order): the supplier confirms the AVR that gives ± y%. A band the sources state that meets ± y% leaves the
// check as it is; no band in the sources keeps it "unclear". The band is read from the check's own source quote (not
// one the code could not find) or from a line of the alternator model's sources about voltage regulation, never from a
// transient line (dip / recovery). Decided here, never by the agent; not for the frequency band (the governor's).
const PCT_RE = /(?:±|\+\s*\/\s*-|\+\s*-)\s*(\d+(?:[.,]\d+)?)\s*%/g;
export const pctsIn = (s) => [...String(s ?? "").normalize("NFKC").matchAll(PCT_RE)].map((m) => Number(m[1].replace(",", "."))).filter((v) => Number.isFinite(v));
const VREG_LINE = /voltage\s*regulation|voltage\s*accuracy|steady\s*-?\s*state\s*voltage|[ổo]n\s*đ[ịi]nh\s*đi[ệe]n\s*[áa]p|đi[ềe]u\s*ch[ỉi]nh\s*đi[ệe]n\s*[áa]p|dao\s*đ[ộo]ng\s*đi[ệe]n\s*[áa]p|稳压|电压调整/i;
const TRANSIENT = /transient|qu[áa]\s*đ[ộo]|đ[ộo]t\s*bi[ếe]n|t[ứu]c\s*th[ờo]i|\bdip\b|recovery|s[ụu]t\s*[áa]p|瞬态/i;
const pctVi = (v) => String(v).replace(".", ",");
export function vregChecks(c, reqs = [], facts = []) {
  const r = reqs.find((q) => q.code === "alt_vreg");
  const want = r ? pctsIn(`${r.requirement || ""} ${r.quote || ""}`).filter((v) => v > 0) : [];
  const x = r && (c.checks || []).find((k) => norm(k.item) === norm(r.item));
  if (!want.length || !x || (x.status !== "not_met" && x.status !== "unclear") || x.unverified || x.parts?.length) return c;
  const y = Math.min(...want);
  const lines = [x.sourceQuote, ...facts.filter((f) => VREG_LINE.test(`${f.label || ""} ${f.line || ""}`)).map((f) => f.line)].filter((l) => l && !TRANSIENT.test(l));
  const got = [...new Set(lines.flatMap(pctsIn))].filter((v) => v > 0 && v < 10).sort((a, b) => a - b);
  if (!got.length || got.some((v) => v <= y)) return c;
  // What the sources say stays in avrSrc (no citation on screen, Khoa 2026-11-11); the note says only what to confirm.
  const avr = `phụ thuộc AVR chọn khi đặt hàng, cần AVR đạt ±${pctVi(y)}%`;
  x.was = x.status; x.status = "confirm"; x.confirm = "order"; x.avr = avr; x.avrSrc = `±${got.map(pctVi).join(" / ±")}%`;
  x.note = [String(x.note || "").replace(/\s*Code ghi: phụ thuộc AVR[^.]*\.$/, ""), `Code ghi: ${avr}.`].filter(Boolean).join(" ");
  return c;
}
// Bảng câu hỏi gửi nhà cung cấp (rfq, 2026-11-10; thứ tự và gộp: điều phối 2026-11-11). One entry per point to ask, in
// the order that decides first: (0) power prime / standby, (1) the make / model / origin the HSMT names, (2) the other
// core points of the model (each part's datasheet points in one line, the controller's functions in one line, a point
// with its own question on a line of its own), (3) site, (4) points to confirm in the order (one line), (5) documents
// (one line), (6) options (an option to confirm in the order is in line 4). Every point a line lists keeps its item and what the HSMT asks (`items`), so nothing is lost
// when lines are joined. Written by the code from the checks; the web shows and copies it (an old rfq without `items` /
// `tier` still shows as before).
const PART_VI = { engine: "Động cơ", alternator: "Đầu phát", controller: "Bộ điều khiển", genset: "Tổ máy" };
const IDENT = new Set(["genset_make", "genset_model", "engine_make", "engine_model", "alt_make", "alt_model", "ctl_make", "ctl_model", "brand_sync"]);
const ORIGINS = new Set(["genset_origin", "engine_origin", "alt_origin", "ctl_origin"]);
const POWER = new Set(["power_prime", "power_standby"]);
const ASK_SPEC = "Xác nhận thông số, gửi datasheet / catalog có ghi";
const ASK_ORIGIN = "Nêu nước sản xuất, gửi CO / CQ";
const ASK_NOISE = "Xác nhận độ ồn ở khoảng cách HSMT nêu, gửi kết quả đo / datasheet vỏ cách âm";
export const RFQ_TIERS = ["Công suất", "Hãng / model / xuất xứ", "Thông số model", "Điều kiện hiện trường", "Xác nhận khi đặt hàng", "Chứng từ", "Tùy chọn"];
export function rfqOf(c, reqs = []) {
  const byItem = new Map(reqs.map((r) => [norm(r.item), r]));
  const what = (part) => [PART_VI[part] || "Tổ máy", (part === "genset" ? c.genset?.model : c[part]?.model) || ""].filter(Boolean).join(" ");
  const ask = (x, k, code) => {
    if (x.status === "confirm") return x.confirm === "document" || k === "document" ? "Gửi chứng từ / bản cam kết đáp ứng" : "Xác nhận cấu hình đặt hàng đáp ứng";
    if (ORIGINS.has(code)) return ASK_ORIGIN;
    if (code === "noise") return ASK_NOISE;
    // Load step: a test report, not a datasheet line (comboChecks: BMEP for reference).
    if (code === "load_step") return `Gửi kết quả thử nhận tải một bước theo ISO 8528-5 (% tải nhận được, cấp G2 / G3) của tổ máy${c.combo?.bmep ? ` (BMEP tham khảo ${fmt(c.combo.bmep.value)} bar)` : ""}`;
    if (k === "site") return "Xác nhận tổ máy làm việc được ở điều kiện này; gửi đường giảm công suất của nhà sản xuất";
    if (x.conflict) return "Các nguồn ghi khác nhau: xác nhận giá trị đúng, gửi datasheet";
    if (x.version) return "Xác nhận đời (MK) bộ điều khiển chào, gửi datasheet đúng đời";
    if (x.parts?.length) return `Xác nhận có các chức năng: ${x.parts.filter((p) => p.status !== "met" && p.status !== "not_met").map((p) => p.item).join(", ")}; gửi datasheet`;
    return ASK_SPEC;
  };
  const tierOf = (q) => (POWER.has(q.code) && q.status !== "confirm" ? 0 : q.licensed || ((IDENT.has(q.code) || ORIGINS.has(q.code)) && q.status !== "confirm") ? 1
    : q.status === "confirm" ? (q.confirm === "document" || q.kind === "document" ? 5 : 4) : q.level === "option" ? 6 : q.kind === "site" ? 3 : 2);
  const pts = [], seen = new Set();
  const add = (x, r, extra = {}) => {
    const code = r?.code || x.code || "", k = x.kind || r?.kind || kindOf(r || {}), status = x.status === "confirm" ? "confirm" : "unclear";
    const q = { part: x.part || r?.part || "genset", item: x.item, requirement: x.requirement || r?.requirement || "", kind: k, status, code, level: (r?.level || x.level) === "option" ? "option" : "core",
      ask: x.ask || ask(x, k, code), ...(x.confirm ? { confirm: x.confirm } : {}), ...(x.avr || x.why || x.licensedNote ? { note: x.avr || x.why || x.licensedNote } : {}), ...(x.licensed ? { licensed: true } : {}), ...(x.parts?.length ? { fn: x.parts.filter((p) => p.status !== "met" && p.status !== "not_met").map((p) => p.item) } : {}), ...(x.conflict ? { conflict: true } : {}), ...(x.version ? { version: x.version } : {}), ...extra };
    q.tier = tierOf(q);
    pts.push(q);
  };
  for (const x of c.checks || []) {
    seen.add(norm(x.item));
    const unsure = x.status === "unclear" || (x.status === "met" && x.unverified) || (x.parts?.length && x.status !== "met" && x.status !== "not_met");
    if (x.status === "confirm" || unsure) add(x, byItem.get(norm(x.item)));
  }
  for (const r of reqs) {
    if (seen.has(norm(r.item)) || r.byCode) continue;
    const ck = confirmKindOf(r);
    add({ item: r.item, requirement: r.requirement || "", part: r.part, status: ck ? "confirm" : "unclear", confirm: ck }, r);
  }
  // Questions of the combination checks (comboChecks: site, load types, load step) and of the origin (originChecks).
  for (const q of [...(c.comboAsk || []), ...(c.originAsk || [])]) add({ ...q, status: q.status === "confirm" ? "confirm" : "unclear", confirm: q.kind === "document" ? "document" : undefined }, null, { code: "" });
  // A controller / module chosen from its maker's datasheet that no supplier of the configuration offers (controller.fromMaker,
  // controller.modules offeredBy null; bdk-mo-dun-4, Khoa 20/11/2026): ask whether the supplier can supply it (model + order
  // code) and its origin (CO), in tier 1 (make / model / origin).
  const ctl = c.controller;
  if (ctl?.model) {
    const ctlName = `${ctl.model}${ctl.make ? ` (${ctl.make})` : ""}`;
    if (ctl.fromMaker) add({ part: "controller", item: `Bộ điều khiển ${ctl.model}`, requirement: "", kind: "model", status: "unclear", code: "ctl_model", why: ctl.offeredMain?.label || CM.CTL_ALT_LABEL,
      ask: `Xác nhận NCC cấp được bộ điều khiển ${ctlName}; nêu nước sản xuất, gửi CO` }, null);
    for (const m of (ctl.modules || []).filter((x) => !x.offeredBy)) {
      const order = m.order ? `, mã đặt hàng ${m.order}` : "";
      add({ part: "controller", item: `Mô-đun ${m.model}${order}`, requirement: m.why?.length ? `cho ${m.why.join(", ")}` : "", kind: "model", status: "unclear", code: "ctl_model", why: m.label || CM.MODULE_LABEL,
        ask: `Xác nhận NCC cấp được mô-đun ${m.model}${m.make ? ` (${m.make})` : ""}${order} lắp kèm bộ điều khiển ${ctl.model}; nêu nước sản xuất, gửi CO` }, null);
    }
  }
  const order ={ engine: 0, controller: 1, alternator: 2, genset: 3 }, po = (p) => order[p] ?? 4;
  const line = (q) => `${q.item}${q.requirement ? `: ${q.requirement}` : ""}${q.note ? ` (${q.note})` : ""}`;
  const out = [];
  const one = (q) => out.push({ tier: q.tier, part: q.part, of: what(q.part), item: q.item, requirement: q.requirement, kind: q.kind, status: q.status, ask: q.ask, ...(q.note ? { note: q.note } : {}) });
  const joined = (tier, part, item, list, askText, kind, status) => out.push({ tier, part, of: part ? what(part) : "", item, requirement: list.map(line).join("; "), kind, status, ask: askText, items: list.map((q) => ({ item: q.item, requirement: q.requirement, ...(q.note ? { note: q.note } : {}) })) });
  for (let t = 0; t <= 6; t++) {
    const tq = pts.filter((q) => q.tier === t).sort((a, b) => po(a.part) - po(b.part));
    if (t === 4 || t === 5) {
      // One line: the points to confirm in the order / the documents to send, each with what the HSMT asks.
      if (tq.length === 1) one(tq[0]);
      else if (tq.length) joined(t, "", t === 4 ? "Cấu hình đặt hàng" : "Chứng từ", tq, t === 4 ? `Xác nhận cấu hình đặt hàng đáp ứng: ${tq.map((q) => `${q.item}${q.requirement ? ` (${q.requirement})` : ""}${q.note ? ` — ${q.note}` : ""}`).join("; ")}` : `Gửi chứng từ / bản cam kết đáp ứng: ${tq.map((q) => q.item).join("; ")}`, t === 4 ? "order" : "document", "confirm");
      continue;
    }
    if (t !== 2 && t !== 6) { tq.forEach(one); continue; }
    // Tier 2 / 6: per part, the datasheet points in one line, the controller's functions in one line, the rest alone.
    for (const part of [...new Set(tq.map((q) => q.part))]) {
      const pq = tq.filter((q) => q.part === part), spec = pq.filter((q) => q.ask === ASK_SPEC), fns = pq.filter((q) => q.fn && !q.conflict && !q.version);
      for (const q of pq) if (!spec.includes(q) && !fns.includes(q)) one(q);
      if (fns.length === 1) one(fns[0]);
      else if (fns.length) joined(t, part, "Chức năng bộ điều khiển", fns.map((q) => ({ ...q, requirement: q.fn.join(", ") })), `Xác nhận có các chức năng: ${fns.map((q) => `${q.item} (${q.fn.join(", ")})`).join("; ")}; gửi datasheet`, "model", "unclear");
      if (spec.length === 1) one(spec[0]);
      else if (spec.length) joined(t, part, `Thông số ${(PART_VI[part] || "tổ máy").toLowerCase()}`, spec, `${ASK_SPEC}: ${spec.map((q) => q.item).join("; ")}`, spec.every((q) => q.kind === "site") ? "site" : "model", "unclear");
    }
  }
  return out;
}
// Each point an rfq asks, a joined line counted by its items (the measure of "nothing lost").
export const rfqPoints = (rfq = []) => rfq.reduce((n, q) => n + (q.items?.length || 1), 0);

// ---------- Kiểm tra tổ hợp (2026-11-10) ----------
// What the parts give together, not each against the HSMT. Every figure comes from the configuration's genset row, its
// model's facts, or the HSMT; a formula only from web/conversions.js; a figure missing → nothing concluded. No check's
// status is changed here: power balance writes a warning, the rest notes and questions for the supplier (rfq).
const flat = (t) => String(t || "").normalize("NFC").replace(/\s+/g, " ");
const RATE_PRIME = /prime|\bPRP\b|\bCOP\b|continuous|li[êe]n\s*t[ụu]c|c[ơo]\s*b[ảa]n|常用|主用/i;
const RATE_SB = /stand\s*-?\s*by|\bESP\b|d[ựu]\s*ph[òo]ng|备用/i;
const TEMP_RE = /(nhi[ệe]t\s*đ[ộo]\s*(?:m[ôo]i\s*tr[ưu][ờo]ng|l[àa]m\s*vi[ệe]c|v[ậa]n\s*h[àa]nh)|ambient\s*temperature)([^.;]{0,60}?)(\d{2})(?:[.,]\d)?\s*(?:°|º|o|độ\s*)?\s*C\b/gi;
const ALT_RE = /(?<!c[ưu][ờo]ng\s)(đ[ộo]\s*cao(?:\s*(?:l[ắa]p\s*đ[ặa]t|so\s*v[ớo]i\s*m[ặa]t\s*n[ưu][ớo]c\s*bi[ểe]n|n[ơo]i\s*l[ắa]p\s*đ[ặa]t))?|altitude)([^.;]{0,50}?)(\d{1,2}[.,]\d{3}|\d{3,4})\s*m\b/gi;
const OVL_RE = /(qu[áa]\s*t[ảa]i|overload)[^.;]{0,60}?(?:\b10\s*%|\b110\s*%)[^.;]{0,120}/gi;
const STEP_RE = /nh[ậa]n\s*t[ảa]i\s*(?:m[ộo]t\s*b[ưu][ớo]c|b[ưu][ớo]c\s*(?:m[ộo]t|1|đ[ầa]u)|1\s*b[ưu][ớo]c|100\s*%)|single\s*-?\s*step|load\s*acceptance|8528\s*-\s*5|class\s*G\s?[23]\b|\bG2\s*\/\s*G3\b/i;
// Loads that ask more of the alternator than a share of kW (ISO 8528-1 §7, the makers' application guides).
const LOAD_TYPES = [
  { type: "fire_pump", label: "Bơm chữa cháy", re: /b[ơo]m\s*(?:n[ưu][ớo]c\s*)?ch[ữu]a\s*ch[áa]y|fire\s*-?\s*pump/i, part: "genset",
    ask: "Xác nhận tổ máy khởi động được bơm chữa cháy (kW, cách khởi động của bơm), gửi tính toán sụt áp khi khởi động" },
  { type: "dol", label: "Động cơ khởi động trực tiếp (DOL)", re: /kh[ởo]i\s*đ[ộo]ng\s*tr[ựu]c\s*ti[ếe]p|\bDOL\b|direct\s*-?\s*on\s*-?\s*line/i, part: "alternator",
    ask: "Gửi khả năng khởi động động cơ của đầu phát (kVA khởi động ở mức sụt áp cho phép)" },
  { type: "ups", label: "UPS", re: /\bUPS\b/, part: "alternator", ask: "Xác nhận tổ máy làm việc với tải UPS (tải phi tuyến): méo sóng hài, kiểu kích từ, AVR" },
  { type: "vfd", label: "Biến tần", re: /bi[ếe]n\s*t[ầa]n|\bVFD\b|variable\s*(?:frequency|speed)\s*drive/i, part: "alternator", ask: "Xác nhận tổ máy làm việc với tải biến tần (tải phi tuyến): méo sóng hài, kiểu kích từ, AVR" },
  { type: "short300", label: "Dòng ngắn mạch duy trì 300% / 10 s", code: "alt_short_circuit", re: /ng[ắa]n\s*m[ạa]ch\s*duy\s*tr[ìi]|sustained\s*short|(?:300\s*%|\b3\s*x?\s*I\s*[nN]\b)[^.;]{0,40}?\b10\s*%?\s*(?:s\b|gi[âa]y|sec)/i, part: "alternator",
    ask: "Xác nhận đầu phát duy trì dòng ngắn mạch 300% trong 10 s (thường cần kích từ PMG / AREP), gửi đường cong suy giảm ngắn mạch" },
  { type: "excitation", label: "Kích từ PMG / AREP", code: "alt_excitation", re: /\bPMG\b|\bAREP\b|nam\s*ch[âa]m\s*v[ĩi]nh\s*c[ửu]u|permanent\s*magnet/i, part: "alternator",
    ask: "Xác nhận kiểu kích từ của đầu phát chào (PMG / AREP hay tự kích), gửi datasheet" },
];
// What the HSMT says that the combination checks need: site, overload on the standby rating, load step, load types.
export function hsmtCombo(text, reqs = []) {
  const T = flat(text), out = { site: null, overloadEsp: null, loadStep: null, loadTypes: [] };
  // The quote of a match: the HSMT line that holds it (a table's columns run together once the text is flattened), else
  // the match itself when it spans lines.
  const lines = String(text || "").normalize("NFC").split("\n").map((l) => l.replace(/\s+/g, " ").trim());
  const lineOf = (re) => lines.find((l) => l.length <= 240 && re.test(l));
  const around = (i, len, b = 40, a = 40) => T.slice(Math.max(0, i - b), i + len + a).trim();
  let temp = null, alt = null;
  for (const m of T.matchAll(TEMP_RE)) {
    if (/nh[ỏo]\s*nh[ấa]t|t[ốo]i\s*thi[ểe]u|\bmin/i.test(m[2])) continue;
    const v = Number(m[3]);
    if (v > 40 && v <= 60 && (!temp || v > temp.value)) temp = { value: v, quote: m[0].trim() };
  }
  for (const m of T.matchAll(ALT_RE)) {
    const v = Number(m[3].replace(/[.,]/g, ""));
    if (v > 1000 && v < 6000 && (!alt || v > alt.value)) alt = { value: v, quote: m[0].trim() };
  }
  if (temp || alt) out.site = { temp: temp?.value ?? null, alt: alt?.value ?? null, quote: [temp?.quote, alt?.quote].filter(Boolean).join(" … ") };
  // Overload asked on the standby (ESP) rating: ISO 8528-1 gives ESP no overload (10% / 1 h in 12 h is of the prime rating).
  for (const m of T.matchAll(OVL_RE)) {
    const q = around(m.index, m[0].length, 60, 0);
    if (RATE_SB.test(q) && !RATE_PRIME.test(q)) { out.overloadEsp = { quote: q }; break; }
  }
  // A requirement of load step, or of ISO 8528 that names a class / part 5 (not a bare "ISO 8528": that is compliance).
  const step = (reqs || []).find((r) => r.code === "load_step" || (r.code === "iso8528_class" && STEP_RE.test(flat(`${r.requirement || ""} ${r.quote || ""}`))));
  const sm = !step && T.match(STEP_RE);
  if (step) out.loadStep = { quote: step.quote || step.requirement || step.item };
  else if (sm) out.loadStep = { quote: lineOf(STEP_RE) || around(sm.index, sm[0].length, 0, 0) };
  for (const l of LOAD_TYPES) { const m = T.match(l.re); if (m) out.loadTypes.push({ type: l.type, label: l.label, quote: lineOf(l.re) || around(m.index, m[0].length, 0, 0) }); }
  return out;
}
// The engine's power on the genset row ("Prime power / Speed (KW/RPM) = 284/1500", "Rated Engine Output = 571kW prp ;
// 625kW standby"), by rating; a figure whose rating the row does not name ("Engine power (kW) = 264") is not used:
// the engine's prime and standby differ by ~10%, so guessing would decide the balance.
export function enginePowerOf(row) {
  // Prime and standby may come as two figures (catalog.js: "Engine power(kw) Prime | 17", "… Standby | 19"): each rating
  // from the first figure that names it, the label and value of the first.
  let acc = null;
  for (const s of row?.specs || []) {
    if (s.key !== "engPower") continue;
    // GENBID_SPEC_NORM=1: not a figure the layer reads with no unit, several values, an unreadable number or of another kind.
    // "(prime/standby) | 110/121": two figures the layer calls ambiguous, read in the order the label gives (ratedPower; Khoa 14/11/2026: "đọc").
    // "Prime power | 284/312": two kW figures with no order in the label: the smaller is prime, the larger standby (Khoa 15/11/2026).
    if (specNormOn("other")) {
      const n = normFig(s, useNormCtx(row), {}), amb = !n.ok && n.why.every((w) => w === "ambiguous");
      if (amb && /(prime|standby)\s*\/\s*(prime|standby)/i.test(s.label) && ratedPower(s.label, s.value)) { /* read below by ratedPower */ }
      else if (amb && n.r?.unit === "kW" && /^\s*\d+(?:[.,]\d+)?\s*\/\s*\d+(?:[.,]\d+)?\s*(kw)?\s*$/i.test(s.value)) {
        const [x, y] = numbersIn(s.value), [prime, standby] = x <= y ? [x, y] : [y, x];
        if (prime !== standby) return { prime, standby, rpm: null, gross: false, net: false, label: s.label, value: s.value, line: row.line };
        continue;
      } else if (!n.ok) continue;
    }
    const p = ratedPower(s.label, s.value);
    if (!p) continue;
    if (!acc) acc = { ...p, line: row.line };
    else for (const r of ["prime", "standby"]) if (acc[r] == null && p[r] != null) acc[r] = p[r];
    if (acc.prime != null && acc.standby != null) break;
  }
  return acc;
}
// One engine power figure (label, value) by rating: { prime?, standby?, rpm, gross, net, label, value } or null when the
// source does not name the rating or the unit is not kW. Shared by the genset row and the model's facts (modelFacts).
export function ratedPower(label, value) {
  {
    const s = { label: String(label ?? ""), value: String(value ?? "") };
    const t = `${s.label} ${s.value}`;
    if (!/kw/i.test(t) || /\b(hp|ps|bhp)\b/i.test(s.label) && !/kw/i.test(s.label)) return null;
    const out = {};
    for (const m of String(s.value).matchAll(/(\d+(?:[.,]\d+)?)\s*kw[^;,\d]*/gi)) {
      const seg = m[0], r = RATE_SB.test(seg) ? "standby" : RATE_PRIME.test(seg) ? "prime" : null;
      if (r && out[r] == null) out[r] = Number(m[1].replace(",", "."));
    }
    // "Engine Power(kw) (prime/standby) | 40/44": the label gives the order of the two figures.
    const pair = String(s.label).match(/(prime|standby)\s*\/\s*(prime|standby)/i), nums = numbersIn(s.value);
    if (!Object.keys(out).length && pair && pair[1].toLowerCase() !== pair[2].toLowerCase() && /^\s*\d+(?:[.,]\d+)?\s*\/\s*\d+(?:[.,]\d+)?\s*(kw)?\s*$/i.test(s.value) && nums.length === 2) {
      out[pair[1].toLowerCase()] = nums[0]; out[pair[2].toLowerCase()] = nums[1];
    }
    if (!Object.keys(out).length) {
      const r = RATE_SB.test(s.label) && !RATE_PRIME.test(s.label) ? "standby" : RATE_PRIME.test(s.label) && !RATE_SB.test(s.label) ? "prime" : null;
      const n = numbersIn(s.value)[0];
      if (r && n) out[r] = n;
    }
    // "kW/rpm" in the label: the second figure is the speed.
    const rpm = /rpm|r\/min/i.test(s.label) ? numbersIn(s.value).find((v) => v >= 1000 && v <= 3600) : null;
    if (Object.keys(out).length) return { ...out, rpm, gross: /gross/i.test(t), net: /\bnet\b/i.test(t), label: s.label, value: s.value };
  }
  return null;
}
// One sourced figure of the model's facts: the same value in every source (within 0.5), else none.
const oneFact = (list, key, ok, skip) => {
  const fs2 = (list || []).filter((f) => f.key === key && !(skip && skip.test(f.label)));
  const vals = fs2.map((f) => ({ f, v: numbersIn(f.value).find(ok) })).filter((x) => x.v != null);
  if (!vals.length) return null;
  if (vals.some((x) => Math.abs(x.v - vals[0].v) > 0.5)) return { conflict: vals.map((x) => x.v) };
  return { value: vals[0].v, label: vals[0].f.label, line: vals[0].f.line, supplierId: vals[0].f.supplierId };
};
const fmt = (v) => Number(v).toLocaleString("vi-VN", { maximumFractionDigits: 1 });
// The engine's kWm at one rating (prime first): the genset row's rated figure, else the model's rated facts. { rating,
// min, max, rpm, gross, src } / { conflict: [...] } / null. Facts of one rating more than 3% apart are not used.
// The output of an engine depends on its speed: a model figure is used only at the row's frequency. The speed it is
// given at tells the frequency (n = 120 f / p, 4-pole 1500 ↔ 50 Hz, 1800 ↔ 60 Hz; 2-pole 3000 / 3600). A row of a 60 Hz
// table (jet-power "60Hz Cummins …") does not take a 1500 rpm figure; a figure with no speed is used only on a row whose
// frequency is not 60 Hz. A row that gives no frequency (most Chinese tables) takes it, and the text says so (unknownHz).
const hzOfRpm = (rpm) => ([1500, 3000, 1000, 750].includes(rpm) ? 50 : [1800, 3600, 1200, 900].includes(rpm) ? 60 : null);
// Điều phối 2026-11-10: nothing is concluded unless the set's row (or its table title / header: row.freq) states its
// frequency, or its own engine figure states the speed. The row's own engine figure: as ratedFacts accepts it (names the
// engine, above the row's kWe). A model figure: given at a speed of that frequency, and from the engine's maker or from
// at least two suppliers that agree within 3%.
export function kwmOf(row, engFacts = []) {
  const ep = enginePowerOf(row);
  const own = ep && ratedFacts(ep.label, ep.value, { setPower: row?.power });
  const freq = Number(row?.freq) || hzOfRpm(own?.[0]?.rpm) || null;
  if (!freq) return null;
  if (own?.length) {
    const f = own.find((x) => x.key === RATED_KEY.prime) || own[0], rating = f.key === RATED_KEY.prime ? "prime" : "standby";
    if (!f.rpm || hzOfRpm(f.rpm) === freq) return { rating, min: f.kW, max: f.kW, rpm: f.rpm, freq, gross: /gross/i.test(f.label), src: { from: "row", label: ep.label, value: ep.value, line: ep.line } };
  }
  for (const rating of ["prime", "standby"]) {
    const list = (engFacts || []).filter((f) => f.key === RATED_KEY[rating] && f.kW > 0 && f.rpm && hzOfRpm(f.rpm) === freq);
    if (!list.length) continue;
    const v = list.map((f) => f.kW), lo = Math.min(...v), hi = Math.max(...v);
    if (!near(lo, hi)) return { conflict: [...new Set(v)] };
    if (!list.some((f) => f.maker) && new Set(list.map((f) => f.supplierId)).size < 2) continue;
    return { rating, min: lo, max: hi, rpm: list.find((f) => f.rpm)?.rpm || null, freq, gross: list.some((f) => /gross/i.test(f.label)),
      src: { from: "model", lines: list.slice(0, 4).map((f) => ({ supplierId: f.supplierId, n: f.n, label: f.label, value: f.value, line: f.line })) } };
  }
  return null;
}
// The alternator's efficiency as the range of every figure on its "Efficiency" lines (not "Mechanical Efficiency": the
// engine's, ~38%, misfiled under the alternator), 80–99.9%. Sources whose ranges do not overlap → { conflict }.
export function effRange(altFacts = []) {
  const by = new Map();
  for (const f of altFacts || []) {
    if (f.key !== "eff" || /mech/i.test(f.label)) continue;
    // Every figure of the line after its label (a fact keeps only the first: "| Efficiency (%) | 90.7 | 91.1 | 91.3").
    const cells = CAT.cellsOf(f.line || ""), own = cells.length > 1 && norm(cells[0]) === norm(f.label) ? cells.slice(1).join(" | ") : f.value;
    const v = numbersIn(own).filter((x) => x >= 80 && x < 100);
    if (!v.length) continue;
    const k = `${f.supplierId}#${f.n}`, o = by.get(k) || { min: Infinity, max: -Infinity, lines: [] };
    o.min = Math.min(o.min, ...v); o.max = Math.max(o.max, ...v); o.lines.push({ supplierId: f.supplierId, n: f.n, label: f.label, value: f.value, line: f.line });
    by.set(k, o);
  }
  const s = [...by.values()];
  if (!s.length) return null;
  if (s.some((a) => s.some((b) => a.max < b.min || b.max < a.min))) return { conflict: s.map((a) => `${a.min}–${a.max}%`) };
  return { min: Math.min(...s.map((a) => a.min)), max: Math.max(...s.map((a) => a.max)), src: { lines: s.flatMap((a) => a.lines).slice(0, 4) } };
}
// The kVA lines of alternator datasheets, by model key: "| TAL-A42-C | kVA | 29 | 30 | …" (Leroy-Somer), "| FD2A-4 |
// 额定容量（KVA） | 42.5 | …", "| TAL-A42-C kVA | 28 | 31 | …", "| BTP3 S/2 | 2 | 13kVA | 15.6kVA" (Mecc Alte). Only a row
// that names a known alternator model; every figure after the kVA label (or with kVA on it). Read from the stored tables
// only. The columns (voltage, phases, frequency, temperature class) are not known, so a row is a set of ratings.
const KVA_LABEL = /^(?:rated\s*)?(?:capacity|power|output|额定容量|容量)?\s*[(（[]?\s*k\s*v\s*a\s*[)）\]]?$|^[^\d]{0,30}[(（[]\s*k\s*v\s*a\s*[)）\]]$/i;
export function altKvaOf(suppliers, built) {
  const known = new Set((built?.alternators || []).map((a) => a.key)), out = new Map();
  for (const s of suppliers || []) for (const t of s.specTables || []) for (const line of t.rows || []) {
    const cells = CAT.cellsOf(line);
    if (cells.length < 2) continue;
    let j = cells.findIndex((x) => KVA_LABEL.test(x.trim())), model = null, vals = [];
    const first = cells[0].replace(/\s+k\s*va$/i, "");
    if (j > 0) model = cells.slice(0, j).find((x) => CAT.isCode(x) && known.has(CAT.keyOf(x)));
    else if (j < 0 && /\sk\s*va$/i.test(cells[0]) && CAT.isCode(first) && known.has(CAT.keyOf(first))) { model = first; j = 0; }
    else if (j < 0 && CAT.isCode(cells[0]) && known.has(CAT.keyOf(cells[0])) && cells.slice(1).some((x) => /^\d+(?:[.,]\d+)?\s*k\s*va$/i.test(x.trim()))) {
      model = cells[0]; vals = cells.slice(1).filter((x) => /^\d+(?:[.,]\d+)?\s*k\s*va$/i.test(x.trim())).flatMap((x) => numbersIn(x));
    }
    if (!model) continue;
    // A cell "1 025" (Leroy-Somer sheets: thousands set off by a space) is one figure, not 1 and 25 (dau-phat-hang B).
    if (!vals.length) vals = numbersIn(cells.slice(j + 1).map((x) => x.replace(/(^|\s)([1-9]) (\d{3})(?=\s|$)/g, "$1$2$3")).join(" | "));
    vals = vals.filter((v) => v > 0.5 && v < 5000);
    if (!vals.length) continue;
    const k = CAT.keyOf(model);
    out.set(k, [...(out.get(k) || []), { supplierId: s.id, n: t.n, line, values: vals }]);
  }
  return out;
}
// The highest kVA of the model per source; sources more than 3% apart → { conflict }.
// ---------- Định mức có nhãn cột, đọc lại từ datasheet đã lưu (PR 5, ratings.mjs) ----------
// Every saved source (sources/<id>/<n>.md) of a supplier in the list, for a source n its record lists: the labeled
// alternator ratings by model key, and the maker's engine outputs as rated facts (engPrime / engStandby, net kWm at the
// sheet's speed; maker when the supplier is of the engine's family — the Cummins sheet of cummins-inc). Read once a run.
let RT_CACHE = null;
const keysOfModel = (m) => { const parts = String(m).split("/"), pre = (parts[0].match(/^[A-Za-z]+/) || [""])[0]; return parts.map((p, i) => CAT.keyOf(i && /^\d/.test(p) ? pre + p : p)); };
// The ratings of a catalog model by key: the model as written, else the same code with the make written before it
// dropped ("Stamford S4L1D-C41" → S4L1D-C41). Only leading words that are not model codes go; no near-name match.
export const ratingsFor = (map, model) => {
  if (!model || !map) return [];
  const hit = map.get(CAT.keyOf(model));
  if (hit) return hit;
  const w = String(model).trim().split(/\s+/), i = w.findIndex((x) => CAT.isCode(x));
  return i > 0 ? map.get(CAT.keyOf(w.slice(i).join(" "))) || [] : [];
};
export function sourceRatings(suppliers, dir = path.join(ROOT, "sources")) {
  const ids = (suppliers || []).map((s) => s?.id).join(",");
  if (RT_CACHE?.ids === ids && RT_CACHE.dir === dir) return RT_CACHE;
  const alt = new Map(), eng = new Map(), attr = new Map(), add = (m, k, x) => m.set(k, [...(m.get(k) || []), x]);
  for (const s of suppliers || []) {
    for (const src of s?.sources || []) {
      const file = path.join(dir, String(s.id), `${src.n}.md`);
      if (!fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, "utf8");
      if (!/RATINGS|TEMPERATURE RISE|^Ratings (50|60) Hz|rpm \((50|60) Hz Ratings\)/im.test(text)) continue;
      const fam = supplierFamily(s, true);
      const rs = ratingsOf(text);
      // A technical data sheet of one alternator model (cfg-r3): its attributes (insulation, poles, THD...) by that model.
      const one = [...new Set(stamfordRatings(text).map((r) => r.model))];
      if (one.length === 1 && !rs.some((r) => r.part === "alternator" && r.model !== one[0])) {
        const at = altSheetAttrs(text).map((a) => ({ ...a, model: one[0], supplierId: s.id, n: src.n, url: src.url }));
        for (const k of keysOfModel(one[0])) for (const a of at) add(attr, k, a);
      }
      // A Leroy-Somer range sheet (TAL / LSA, dau-phat-hang B 20/11/2026): its "General characteristics" are of every
      // model of the range on that sheet (the gfe-power copy of TAL 046 / 047 / 049 too). Not joined to a column.
      const lsa = lsSheetAttrs(text);
      // A sheet that states a lower short-circuit current ("AREP+ Short-circuit current = 2.7 In: 5 seconds", TAL): scLow, so
      // the maker list leaves the range out when the HSMT asks 300 % / 10 s (never read as met or not met of a check).
      if (lsa.length && !lsa.some((a) => a.key === "sc300")) {
        const L = text.split("\n"), i = L.findIndex((l) => /Short-circuit current/i.test(l)), two = i >= 0 ? `${L[i]} ${L[i + 1] || ""}` : "", m = two.match(/(\d(?:\.\d+)?)\s*In\s*:?\s*(\d+)\s*sec/i);
        if (m && (Number(m[1]) < 3 || Number(m[2]) < 10)) lsa.push({ key: "scLow", value: { pct: Math.round(Number(m[1]) * 100), s: Number(m[2]) }, lines: [L[i], /In\s*:/i.test(L[i]) ? null : L[i + 1]].filter(Boolean) });
      }
      if (lsa.length) for (const m of new Set(rs.filter((r) => r.part === "alternator" && /^(TAL|LSA)\b/i.test(r.model)).map((r) => r.model)))
        for (const k of keysOfModel(m)) for (const a of lsa) add(attr, k, { ...a, model: m, supplierId: s.id, n: src.n, url: src.url, range: true });
      // A Mecc Alte range sheet (D2): insulation and sustained short circuit, of every model of its ratings.
      const mca = meccSheetAttrs(text);
      if (mca.length) for (const m of new Set(rs.filter((r) => r.part === "alternator" && /^EC[OP]\d/.test(r.model)).map((r) => r.model)))
        for (const k of keysOfModel(m)) for (const a of mca) add(attr, k, { ...a, model: m, supplierId: s.id, n: src.n, url: src.url, range: true });
      for (const r of rs) {
        const x = { ...r, supplierId: s.id, n: src.n, url: src.url };
        if (r.part === "alternator") for (const k of keysOfModel(r.model)) add(alt, k, x);
        else if (r.rating !== "base" && r.net) for (const k of keysOfModel(r.model)) add(eng, k, {
          key: RATED_KEY[r.rating], kW: r.net, rpm: r.rpm, maker: s.role === "engine_maker" || (!!fam && new RegExp(`\\b${fam}\\b`, "i").test(text.slice(0, 3000))),
          label: `Net engine output ${r.rating === "prime" ? "Prime" : "Standby"} kWm (${r.rpm} rpm, ${r.hz} Hz)`, value: `${r.net}`, line: r.lines[r.lines.length - 1], lines: r.lines, supplierId: s.id, n: src.n });
      }
    }
  }
  RT_CACHE = { ids, dir, alt, eng, attr };
  return RT_CACHE;
}
// The columns of an alternator's ratings that fit the set (PR 5): the row's frequency (required), the duty of the rating
// (prime → "Cont.", standby → "Standby"), three-phase, and the HSMT's voltage when the sheet has that column (else every
// voltage of the sheet). Efficiency and kVA as the range over the classes left (F 105/40 and H 125/40 for Cont.). null
// when nothing is labeled for that frequency.
export function altColumns(list, { hz, rating = "prime", reqs = [] } = {}) {
  if (!hz || !list?.length) return null;
  const duty = rating === "standby" ? "Standby" : "Cont.";
  // Continuous: class F 105/40 and H 125/40 (a ratings book also lists B 80/40, which no set is rated on here).
  let sel = list.filter((x) => x.hz === hz && x.duty === duty && x.phase === 3 && (duty !== "Cont." || /^(105|125)\/|^[FH]:/.test(x.rise)));
  if (!sel.length) return null;
  const vr = (reqs || []).find((r) => r.code === "voltage"), want = vr ? voltsIn(`${vr.requirement || ""} ${vr.quote || ""}`).filter((v) => v >= 300 && v <= 500) : [];
  const atV = sel.filter((x) => want.includes(x.volt));
  if (atV.length) sel = atV;
  const vs = [...new Set(sel.map((x) => x.volt))], rises = [...new Set(sel.map((x) => x.rise))];
  const label = `${duty} ${rises.join(" / ")}, ${hz} Hz, ${vs.length === 1 ? `${vs[0]} V` : `${Math.min(...vs)}–${Math.max(...vs)} V`}`;
  const range = (k) => { const v = sel.map((x) => x[k]).filter((y) => y != null); return v.length ? { min: Math.min(...v), max: Math.max(...v) } : null; };
  const e = range("eff"), kv = range("kVA");
  const src = { lines: [...new Set(sel.flatMap((x) => x.lines))].slice(0, 12), supplierId: sel[0].supplierId, n: sel[0].n, url: sel[0].url };
  return { label, src, kVA: kv, eff: e ? { ...e, label: `datasheet ${sel[0].model}: ${label}`, src } : null };
}
// ---------- Đầu phát theo datasheet hãng (dau-phat-hang B, Khoa 20/11/2026) ----------
// "Miễn sao đạt yêu cầu của hsmt thì cứ gợi ý": an alternator need not be one a supplier's genset row names. The code reads
// what the HSMT asks of the alternator (altNeedOf), lists the models of the alternator makers' own sheets that meet it
// (makerAlts: catalog.md, "Đầu phát theo datasheet hãng"), and check puts one on a configuration (makerAltFix) only when
// (Khoa's answers 1 and 2) its row names no alternator, or names one whose maker sheet shows it below the kVA needed; an
// alternator the system has no figures for stays. Khoa's other answers: the kVA of the continuous column (class H 125 K /
// 40 °C, the HSMT's frequency, three-phase; the lowest of the HSMT's voltages), the smallest model that meets it, at most
// 130 % of it, at most 2 models a make (3); the make's default place of manufacture (4: makerOriginChecks); no penalty in
// the ranking (5: rankConfigs is unchanged); a make the HSMT names without "tương đương" is the only make (7).
// GENBID_MAKER_ALT=0 turns it off (no list, no alternator put or kept from it).
export const makerAltOn = () => process.env.GENBID_MAKER_ALT !== "0";
// The alternator makers whose own sheets (sources 1001–1999) are read. leroy-somer-fuzhou is filed with country CN, but
// its sheets are the global leroy-somer.com ones, no line about the Fuzhou plant: Leroy-Somer's default place (France,
// Khoa 16/11/2026) holds, as for any Leroy-Somer alternator whose source names no plant. mecc-alte (dau-phat-hang D,
// 21/11/2026): its range sheets ECP3 → ECO46 [1007–1016] (ratings.mjs meccRatings, H-125/40 column), no plant named on
// them: Mecc Alte's default place (manufacturing[]: Khoa 16/11/2026, Italy).
const MAKER_ALT_MAKE = { "leroy-somer-fuzhou": "Leroy-Somer", "stamford-avk-china": "Stamford", "mecc-alte": "Mecc Alte" };
const MAKER_PER_MAKE = 2, MAKER_MAX = 6, MAKER_OVER = 1.3;
const reqTxt = (r) => `${r?.requirement || ""} ${r?.quote || ""}`.normalize("NFC");
const MALT_FIG = "(\\d{1,3}(?:[.,]\\d{3})+(?!\\d)|\\d+(?:[.,]\\d+)?)";
// The prime kVA a requirement states, before any standby / maximum words: "Định mức ≥ 750 / 600 kVA/kWm; dự phòng ≥ 825",
// "Công suất định mức | kVA/kWm | ≥ 750 / 600", "Liên tục ≥ 700 kVA; tối đa ≥ 770 kVA". null when none.
export function primeKvaOf(text) {
  const t = String(text || "").normalize("NFC"), cut = t.search(/d[ựu]\s*ph[òo]ng|standby|t[ốo]i\s*đa|\bmax/i), s = cut >= 0 ? t.slice(0, cut) : t;
  const v = [...s.matchAll(new RegExp(`${MALT_FIG}\\s*(?:\\/\\s*\\d[\\d.,]*\\s*)?kVA\\b`, "gi"))].map((m) => numOf(m[1]));
  if (!v.length) { const m = s.match(new RegExp(`kVA(?:\\s*\\/\\s*kWm?e?)?\\s*\\|?\\s*(?:≥|>=|>)?\\s*${MALT_FIG}`, "i")); if (m) v.push(numOf(m[1])); }
  const ok = v.filter((x) => x >= 1 && x <= 20000);
  return ok.length ? Math.max(...ok) : null;
}
// What the HSMT asks of the alternator, from requirements with codes (the agent's at check; the analysis' lines at prep).
export function altNeedOf(reqs = [], { cap = null, hsmtText = "" } = {}) {
  const of = (code) => (reqs || []).filter((r) => r.code === code), tx = (code) => of(code).map(reqTxt).join(" \n ");
  const from = [];
  for (const r of of("alt_power")) { const v = primeKvaOf(reqTxt(r)); if (v) from.push({ kva: v, what: "đầu phát" }); }
  for (const r of of("power_prime")) { const v = primeKvaOf(reqTxt(r)); if (v) from.push({ kva: v, what: "tổ máy" }); }
  if (cap?.value > 0) from.push({ kva: cap.unit === "kW" ? cap.value / 0.8 : cap.value, what: "tổ máy" });
  const kva = from.length ? Math.max(...from.map((f) => f.kva)) : null;
  const hzs = new Set([...tx("frequency").matchAll(/\b(50|60)\s*Hz/gi)].map((m) => Number(m[1])));
  let hz = hzs.size === 1 ? [...hzs][0] : null;
  if (!hzs.size) { const t = technicalPart(hsmtText || ""), f50 = /\b50\s?hz\b/i.test(t), f60 = /\b60\s?hz\b/i.test(t); hz = f50 && !f60 ? 50 : f60 && !f50 ? 60 : null; }
  // Line voltages of a three-phase set the voltage requirements name ("220/380 – 230/400 V": 380 and 400).
  const volts = [...new Set([...voltsIn(tx("voltage")), ...numbersIn(tx("voltage"))].filter((v) => [380, 400, 415, 440, 460, 480].includes(v)))].sort((a, b) => a - b);
  const insT = tx("alt_insulation"), cl = (L) => new RegExp(`(?:c[ấa]p|class|lo[ạa]i)\\s*(?:c[áa]ch\\s*đi[ệe]n\\s*)?${L}\\b`, "i");
  const ins = cl("F").test(insT) && !cl("H").test(insT) ? "F" : "H";
  const excT = `${tx("alt_excitation")} ${tx("alt_type")}`;
  const exc = [/\bPMG\b|nam\s*ch[âa]m\s*v[ĩi]nh\s*c[ửu]u|permanent\s*magnet/i.test(excT) && "PMG", /\bAREP\b/i.test(excT) && "AREP"].filter(Boolean);
  const sc = (reqs || []).some((r) => (r.code === "alt_short_circuit" || r.code === "other") && /300\s*%|\b3\s*x?\s*I\s*[nN]\b/.test(reqTxt(r)) && /\b10\s*%?\s*(gi[âa]y|s\b|sec)/i.test(reqTxt(r)) && !/qu[áa]\s*t[ốo]c/i.test(reqTxt(r)));
  const vr = pctsIn(tx("alt_vreg")).filter((v) => v > 0), vreg = vr.length ? Math.min(...vr) : null;
  const mkT = tx("alt_make"), makes = CAT.ALT_BRANDS.filter(([re]) => re.test(mkT)).map(([, n]) => n), equivalent = /t[ưu]ơng\s*đ[ưu]ơng|equivalent/i.test(mkT);
  const orT = of("alt_origin").map(reqTxt).join(" ; ");
  const origin = /\bG\s?-?(7|20)\b/.test(orT) ? { grp: `${/\bG\s?-?20\b/.test(orT) ? "g20" : "g7"}${EU_W.test(orT) ? "eu" : ""}`, basis: of("alt_origin").map((r) => madeBasisOf(r.quote) || madeBasisOf(r.requirement)).find(Boolean) || null } : null;
  const site = hsmtCombo(hsmtText || "", reqs).site;
  // The model the HSMT names ("Model: TAL-A44-J"), compared by CAT.keyOf: a maker model it names comes first.
  const model = CAT.keyOf(tx("alt_model"));
  return { kva, from, hz, volts, ins, exc, sc, vreg, makes, equivalent, origin, site, model };
}
// The continuous-duty kVA of a model's labeled ratings at the need's column: frequency, three-phase, class H 125 K (F 105 K
// when the HSMT asks F only) at 40 °C, the HSMT's voltages when the sheet has them (else every voltage of the sheet).
// { min, max, volts, label, lines } or null.
export function contKva(list = [], need = {}) {
  const cls = need.ins === "F" ? /^(F\b|F:|105\/)/ : /^(H\b|H:|125\/)/;
  const sel = (list || []).filter((x) => x.part !== "engine" && x.hz === need.hz && x.duty === "Cont." && x.phase === 3 && cls.test(String(x.rise)) && /\b40\s*°\s*C/.test(String(x.rise)) && x.kVA > 0);
  if (!sel.length) return null;
  const atV = need.volts?.length ? sel.filter((x) => need.volts.includes(x.volt)) : [], use = atV.length ? atV : sel;
  const vs = [...new Set(use.map((x) => x.volt))].sort((a, b) => a - b), min = Math.min(...use.map((x) => x.kVA)), max = Math.max(...use.map((x) => x.kVA));
  const label = `Continuous cấp ${need.ins === "F" ? "F 105 K" : "H 125 K"} / 40 °C, ${need.hz} Hz, 3 pha, ${vs.join(" / ")} V`;
  // `top`: the sheet of the largest figure (makerAltFix derates it for the site, D2).
  const top = use.find((x) => x.kVA === max);
  return { min, max, volts: vs, label, lines: use.find((x) => x.kVA === min).lines, top: { supplierId: top.supplierId, n: top.n, model: top.model } };
}
// The models of the alternator makers' sheets that meet `need`, best first: a make the HSMT names, then the smallest kVA.
// A point the sheet states against the need (class, excitation, voltage regulation, origin outside the group) leaves the
// model out; a point the sheet does not state stays in `unknown`. `all`: no limit per make / in all (check, to verify an
// agent's pick). `engineFamily`: under a brand sync that asks the alternator, only the engine's family.
// Where a maker-sheet alternator is made: the sheet of a plant the supplier record is (leroy-somer-fuzhou: the Fuzhou
// plant, Khoa 20/11/2026 "ok") → that country; else the make's default (CAT.madeIn). `brand`: the make's own country, for
// an HSMT that asks the brand (nhãn hiệu). { at, brand, why }.
// stamford-avk-china: Khoa 20/11/2026 "1. ok" (the sheets of the Stamford plant in China, made in China as Fuzhou), now
// only for the frames outside S4–S7 (UCI / UCDI, PI, HCI). S4, S5, S6, S7 (S4L1D … S7L1D; dau-phat-hang D, Khoa 21/11/2026
// "Stamford: làm 3 cho S6 / S7", then "2. Ghi chưa rõ" for S4 / S5): no place: their sheets are Stamford's global ones and
// name no plant, the China page [1] names no range, and STAMFORD's page [6003] says the UK Stamford facility makes S4, S5,
// S6 and S7 → "chưa rõ", the origin check asks the CO.
const MAKER_PLANT = { "leroy-somer-fuzhou": { at: "CN", why: "tờ của nhà máy Phúc Châu (leroy-somer-fuzhou)" }, "stamford-avk-china": { at: "CN", why: "tờ của nhà máy Stamford ở Trung Quốc (stamford-avk-china)" } };
const NO_PLANT = { "stamford-avk-china": { re: /^S[4-7]L\d/i, why: "tờ S4–S7 là tờ toàn cầu của Stamford, không ghi nhà máy (Khoa 21/11/2026: chưa rõ, cần NCC xác nhận CO)" } };
export const makerPlantOf = (supplierId, model) => (NO_PLANT[supplierId]?.re.test(String(model || "").trim()) ? null : MAKER_PLANT[supplierId] || null);
export function makerMadeOf(supplierId, make, model) {
  const def = CAT.madeIn("alternator", [make], [""], model), plant = makerPlantOf(supplierId, model), none = !plant && NO_PLANT[supplierId]?.re.test(String(model || "").trim());
  return plant ? { at: plant.at, brand: def.at, why: plant.why } : none ? { at: "?", brand: def.at, why: NO_PLANT[supplierId].why } : { at: def.at, brand: def.at, why: `mặc định theo hãng ${make}` };
}
// A place a country requirement names ("Trung Quốc", "China"), against a country code.
const countryNamed = (t, at) => !!at && at !== "?" && (norm(t).includes(norm(madeVi(at))) || (at === "CN" && /trung\s*qu[ốo]c|\bchina\b|\bPRC\b/i.test(t)));
export function makerAlts(suppliers, RT, need, { all = false, engineFamily = null, sourcesDir } = {}) {
  if (!need?.kva || !need.hz || !RT?.alt) return [];
  const sup = new Map((suppliers || []).map((s) => [s.id, s])), groups = new Map(), seen = new Set();
  for (const list of RT.alt.values()) for (const x of list) {
    if (seen.has(x)) continue;
    seen.add(x);
    if (!MAKER_ALT_MAKE[x.supplierId] || sup.get(x.supplierId)?.role !== "alternator_maker" || !(Number(x.n) >= 1001 && Number(x.n) < 2000)) continue;
    const k = `${x.supplierId}|${x.n}|${x.model}`;
    groups.set(k, [...(groups.get(k) || []), x]);
  }
  const out = [], done = new Set();
  for (const list of groups.values()) {
    const x0 = list[0], make = MAKER_ALT_MAKE[x0.supplierId], col = contKva(list, need);
    // A site above the column (B2): the kVA after the maker's derating when its sources give it; else the column's, the
    // derating left in `unknown`.
    const dr = col && need.site ? makerDerate({ supplierId: x0.supplierId, n: x0.n, model: x0.model }, need.site, sourcesDir) : null;
    const kva = col && dr?.f ? col.min * dr.f : col?.min;
    if (!col || kva < need.kva - 0.5 || kva > need.kva * MAKER_OVER + 0.5) continue;
    const attrs = ratingsFor(RT.attr, x0.model).filter((a) => a.supplierId === x0.supplierId);
    const att = (key) => { const l = attrs.filter((a) => a.key === key); return l.length && new Set(l.map((a) => JSON.stringify(a.value))).size === 1 ? l[0] : null; };
    const unknown = [], ins = att("insulation"), ex = att("excitation"), pmg = att("pmg"), sc = att("sc300"), vr = att("vreg"), avr = att("avr");
    if (ins && INS.indexOf(ins.value) < INS.indexOf(need.ins)) continue;
    if (!ins) unknown.push("cấp cách điện");
    if (dr && !dr.f) unknown.push(`suy giảm theo ${dr.missing.join(" và ")} của hiện trường`);
    const kinds = ex ? ex.value : pmg ? ["PMG"] : [];
    if (need.exc.length && ex && !need.exc.some((k) => kinds.includes(k))) continue;
    if (need.exc.length && !kinds.some((k) => need.exc.includes(k))) unknown.push(`kích từ ${need.exc.join(" / ")}`);
    if (need.sc && !sc && att("scLow")) continue;
    if (need.sc && !sc) unknown.push("ngắn mạch 300 % / 10 s");
    if (need.vreg != null && vr && Math.min(...vr.value) > need.vreg) continue;
    if (need.vreg != null && !vr) unknown.push(`ổn định điện áp ±${pctVi(need.vreg)} %`);
    // The HSMT's group against the brand's country when it asks the brand, against the place of making otherwise.
    const made = makerMadeOf(x0.supplierId, make, x0.model), mAt = need.origin?.basis === "brand" ? made.brand : made.at;
    if (need.origin && mAt !== "?" && !CAT.COUNTRY_GROUP[need.origin.grp].includes(mAt)) continue;
    // Stamford S4–S7 (NO_PLANT): the place the HSMT asks is not known → stays, after the models that state every point.
    if (need.origin && mAt === "?") unknown.push("nơi sản xuất (cần NCC xác nhận CO)");
    const named = need.makes.includes(make);
    if (need.makes.length && !need.equivalent && !named) continue;
    if (engineFamily && BP.familyOf(make) !== engineFamily) continue;
    const id = `${make}|${CAT.keyOf(x0.model)}`;
    if (done.has(id)) continue;
    done.add(id);
    const options = [];
    if (kinds.length) { const want = kinds.filter((k) => need.exc.includes(k)); options.push({ what: "Kích từ", value: want.length && kinds.length > 1 ? `${want.join(" / ")} (tờ hãng ghi ${kinds.join(" / ")}, chọn khi đặt hàng)` : kinds.join(" / "), line: (ex || pmg).lines[0] }); }
    if (avr) options.push({ what: "AVR", value: avr.value.length > 1 ? `${avr.value.join(" / ")} (theo kiểu kích từ, chọn khi đặt hàng)` : avr.value[0], line: avr.lines[0] });
    const asked = !!need.model && need.model.includes(CAT.keyOf(x0.model));
    out.push({ make, supplierId: x0.supplierId, n: Number(x0.n), url: x0.url, model: x0.model, kva: col.min, ...(dr?.f ? { derated: Number(kva.toFixed(1)), derate: dr } : {}), label: col.label, lines: col.lines, made, named, asked,
      attrs: { insulation: ins, excitation: ex || pmg, avr, vreg: vr, sc300: sc }, unknown, options });
  }
  // The model the HSMT names first; a model whose sheet states every point asked comes before one that leaves some
  // unstated (not proven to meet them).
  out.sort((a, b) => b.asked - a.asked || b.named - a.named || a.unknown.length - b.unknown.length || a.kva - b.kva || a.model.localeCompare(b.model));
  if (all) return out;
  const per = new Map(), keep = [];
  for (const m of out) {
    if ((per.get(m.make) || 0) >= MAKER_PER_MAKE) continue;
    per.set(m.make, (per.get(m.make) || 0) + 1);
    keep.push(m);
    if (keep.length >= MAKER_MAX) break;
  }
  return keep;
}
// ---------- Suy giảm công suất đầu phát theo hiện trường (dau-phat-hang B2, Khoa 20/11/2026: "Tìm thử xem, nếu tìm không
// được thì để chưa rõ") ----------
// The maker's own derating, read from its saved source files only, for a site the HSMT gives above the sheet's column
// (40 °C / 1 000 m): Stamford's sheet ("3% for every 5°C by which the operational ambient temperature exceeds 40°C", "3%
// for every 500 metres by which the operating altitude exceeds 1000 metres"); Leroy-Somer LSA by the table of its
// "LSA Rating Table" (leroy-somer-fuzhou [6003], class H row, altitude row). The column at the site's figure or the next
// hotter / higher one; never between two columns (no interpolation). A point the source does not cover → null for it.
// { f, parts: [{ what, factor, why, src: { supplierId, n, line } }], missing: [what] }, or null when the site is within.
const DERATE_LS = { supplierId: "leroy-somer-fuzhou", n: 6003 }, DERATE_TAL = { supplierId: "leroy-somer-fuzhou", n: 6004 };
const srcLines = (dir, supplierId, n) => { try { return fs.readFileSync(path.join(dir, supplierId, `${n}.md`), "utf8").split(/\r?\n/); } catch { return null; } };
// "Ambient T °C   25   40   45 ..." → [25, 40, 45, ...] (a "1 000" cell is one figure: columns are 2+ spaces apart).
const tableRow = (line) => line.replace(/^[^\d]*?(?=\d)/, "").split(/\s{2,}|\t/).map((x) => Number(x.replace(/\(\*\)/, "").replace(/\s/g, ""))).filter((x) => Number.isFinite(x));
export function makerDerate({ supplierId, n, model }, site, dir = path.join(ROOT, "sources")) {
  const temp = site?.temp > 40 ? site.temp : null, alt = site?.alt > 1000 ? site.alt : null;
  if (!temp && !alt) return null;
  const parts = [], missing = [];
  if (supplierId === "stamford-avk-china") {
    const L = srcLines(dir, supplierId, n) || [], all = L.join("\n");
    const step = (re, tail, what, x, base, unit) => {
      const i = L.findIndex((l) => re.test(l)), m = i >= 0 && L[i].match(re);
      if (!m || !tail.test(all)) { missing.push(what); return; }
      const pct = Number(m[1]), each = Number(m[2]), k = Math.ceil((x - base) / each);
      parts.push({ what, factor: Number((1 - (pct / 100) * k).toFixed(4)), why: `${pct}% cho mỗi ${fmt(each)} ${unit} vượt ${fmt(base)} ${unit}: ${fmt(x)} ${unit} → ${k} × ${pct}%`, src: { supplierId, n, line: L[i].trim() } });
    };
    if (temp) temp > 60 ? missing.push("nhiệt độ") : step(/(\d+)%\s*for every\s*(\d+)\s*°C by which the operational ambient/i, /temperature\s+exceeds\s+40\s*°C/i, "nhiệt độ", temp, 40, "°C");
    // "metres" (older sheets) or "meters" (S6L1D / S7L1D sheets, D2).
    if (alt) step(/(\d+)%\s*for every\s*(\d+)\s*met(?:re|er)s by which the operating altitude/i, /exceeds\s+1000\s+met(?:re|er)s/i, "độ cao", alt, 1000, "m");
  } else if ((supplierId === "leroy-somer-fuzhou" && /^LSA\b/i.test(model || "")) || /^TAL\s?0\d{2,3}\b/i.test(String(model || "").trim())) {
    // LSA: "LSA Rating Table" [6003]. TAL 040 … TAL 049 (dau-phat-hang D2, 21/11/2026): "TAL Rating Table" [6004], whose
    // ratings name "TAL 040 … TAL 049" (any supplier's copy of a TAL 0xx sheet). TAL-A40 … TAL-A49 (the sheets
    // leroy-somer-fuzhou [1001–1006]) are NOT named there: no factor (taking the TAL table for them would be inferred).
    const from = /^LSA\b/i.test(model || "") ? DERATE_LS : DERATE_TAL, L = srcLines(dir, from.supplierId, from.n) || [];
    const pick = (headRe, rowRe, x, what) => {
      const h = L.findIndex((l) => headRe.test(l)), r = h >= 0 ? L.findIndex((l, j) => j > h && j <= h + 4 && rowRe.test(l)) : -1;
      const cols = h >= 0 ? tableRow(L[h]) : [], vals = r >= 0 ? tableRow(L[r]) : [];
      const j = cols.length && cols.length === vals.length ? cols.findIndex((c) => c >= x) : -1;
      if (j < 0) { missing.push(what); return; }
      parts.push({ what, factor: vals[j], why: `cột ${fmt(cols[j])}${what === "nhiệt độ" ? " °C" : " m"} (${cols[j] === x ? "đúng mức HSMT" : `mốc ngay trên ${fmt(x)}`}, không nội suy)`, src: { ...from, line: `${L[h].trim().replace(/\s{2,}/g, " ")} | ${L[r].trim().replace(/\s{2,}/g, " ")}` } });
    };
    // "Ambient T °C" ([6003]) or "Ambient  T  °C" ([6004]: the PDF's spacing).
    if (temp) pick(/^Ambient\s+T\s+°C\b/, /^Class H\b/, temp, "nhiệt độ");
    if (alt) pick(/^Altitude \(m\)/, /^Derating factor\b/, alt, "độ cao");
  } else if (supplierId === "mecc-alte") {
    // Mecc Alte (D2): the sheet's own "Derating coefficients" table (ratings.mjs meccDerate): ONE cell for the site, the row
    // of its altitude (≤ 1000, > 1000 ≤ 1500 …) × the column of its temperature (25 / 40 / 45 … 70 °C), the column at the
    // figure or the next hotter; a site within 40 °C reads the 40 °C column, within 1 000 m the ≤ 1000 row. No interpolation.
    const t = srcLines(dir, supplierId, n), D = t && meccDerate(t.join("\n"));
    const tc = D ? D.temps.findIndex((c) => c >= Math.max(40, site?.temp || 0)) : -1;
    const row = D ? D.rows.find((r) => Math.max(1000, site?.alt || 0) <= r.altTo && (r.altFrom === 0 || Math.max(1000, site?.alt || 0) > r.altFrom)) : null;
    if (!D || tc < 0 || !row) { if (temp) missing.push("nhiệt độ"); if (alt) missing.push("độ cao"); }
    else {
      const col = D.temps[tc], what = temp && alt ? "nhiệt độ và độ cao" : temp ? "nhiệt độ" : "độ cao";
      parts.push({ what, factor: row.factors[tc], why: `bảng Derating coefficients: hàng độ cao ${row.altFrom ? `> ${fmt(row.altFrom)} ` : ""}≤ ${fmt(row.altTo)} m × cột ${col} °C (${temp && col !== temp ? `mốc ngay trên ${temp} °C, ` : ""}không nội suy)`,
        src: { supplierId, n, line: `${D.head[1].trim()} | ${row.line.trim()}` } });
    }
  } else {
    if (temp) missing.push("nhiệt độ");
    if (alt) missing.push("độ cao");
  }
  const f = parts.reduce((a, x) => a * x.factor, 1);
  return { f: missing.length ? null : Number(f.toFixed(4)), parts, missing };
}
// prep: the list for catalog.md from the alternator makers' records only (their sheets; the whole DB is read by check).
export function makerAltsOf(suppliers, reqs, { cap = null, hsmtText = "", sourcesDir } = {}) {
  const makers = (suppliers || []).filter((s) => MAKER_ALT_MAKE[s.id] && s.role === "alternator_maker");
  const need = altNeedOf(reqs, { cap, hsmtText }), list = makerAlts(makers, sourceRatings(makers, sourcesDir), need, { sourcesDir });
  return { need, list, md: makerAltMd(list, need) };
}
// The need as one line of words (catalog.md, result.makerAlt).
const needText = (need) => [`${need.hz} Hz`, `≥ ${fmt(need.kva)} kVA ở cột chạy liên tục cấp ${need.ins === "F" ? "F 105 K" : "H 125 K"} / 40 °C, 3 pha${need.volts.length ? `, điện áp ${need.volts.join(" / ")} V (lấy số nhỏ nhất)` : ""}, không quá ${Math.round(MAKER_OVER * 100)} %`,
  need.exc.length && `kích từ ${need.exc.join(" / ")}`, need.sc && "ngắn mạch 300 % / 10 s", need.vreg != null && `ổn định điện áp ±${pctVi(need.vreg)} %`,
  need.makes.length && `hãng ${need.makes.join(" / ")}${need.equivalent ? " (hoặc tương đương)" : ""}`, need.origin && `xuất xứ ${GROUP_NAME[need.origin.grp] || need.origin.grp}`].filter(Boolean).join("; ");
export function makerAltMd(list, need) {
  if (!list?.length) return "";
  const out = [`## Đầu phát theo datasheet hãng (NCC chưa chào) — ${list.length} model, code đã lọc`, "",
    `Điều kiện code đã lọc (Khoa 20/11/2026: "miễn sao đạt yêu cầu của hsmt thì cứ gợi ý"): ${needText(need)}. Số kVA đọc ở đúng cột đó của datasheet hãng, không phải cột Standby.`,
    "- Chỉ dùng một model ở đây làm đầu phát của cấu hình khi dòng tổ máy của cấu hình KHÔNG ghi đầu phát, hoặc ghi một đầu phát mà datasheet hãng của nó thấp hơn mức kVA trên (code tự chấm và tự thay trong trường hợp này). Dòng ghi đầu phát mà hệ thống không có số liệu thì giữ đầu phát đó.",
    "- Ghi `alternator`: { \"model\", \"make\", \"src\" } với `src` chép nguyên dòng src bên dưới. Không viết check đầu phát cho model này: code viết từ datasheet hãng. Lời văn (summary, why, gaps) phải nói đầu phát chọn theo datasheet hãng, NCC CHƯA chào; không viết như nhà cung cấp đã chào.", ""];
  for (const m of list) {
    out.push(`### ${m.model} — hãng ${m.make}, ${fmt(m.kva)} kVA (${m.label})${m.derated ? `, ${figVi(m.derated, 1)} kVA sau suy giảm theo hiện trường HSMT (hệ số ${m.derate.f} của hãng)` : ""}${m.named ? " — hãng HSMT nêu" : ""}`,
      `- src: ${JSON.stringify({ kind: "maker", supplierId: m.supplierId, n: m.n })}`);
    const a = m.attrs, said = [a.insulation && `cách điện cấp ${a.insulation.value}`, a.vreg && `ổn định điện áp ±${a.vreg.value.map(pctVi).join(" / ±")} %`, a.sc300 && `ngắn mạch ${a.sc300.value.s > 10 ? `> 300 % / ${a.sc300.value.s}` : "300 % / 10"} s${a.sc300.value.all === false ? " (với kích từ AREP / PMG)" : ""}`].filter(Boolean);
    if (said.length) out.push(`- tờ hãng ghi: ${said.join("; ")}`);
    if (m.options.length) out.push(`- tuỳ chọn: ${m.options.map((o) => `${o.what} ${o.value}`).join("; ")}`);
    if (m.unknown.length) out.push(`- tờ hãng không ghi: ${m.unknown.join("; ")}`);
    out.push(m.made.at !== m.made.brand ? `- nơi sản xuất: ${m.made.at === "?" ? "chưa rõ, cần NCC xác nhận CO" : madeVi(m.made.at)} (${m.made.why}); thương hiệu ${m.make}: ${m.made.brand === "?" ? "chưa rõ" : madeVi(m.made.brand)}`
      : `- nơi sản xuất mặc định của hãng: ${m.made.at === "?" ? "chưa rõ" : madeVi(m.made.at)}`, "");
  }
  return out.join("\n");
}
// The alternator a configuration's genset row names (u.other through altOf), else null; { model, make, rec } (rec null:
// a cell the catalog has no record for).
const rowAltOf = (u, built) => {
  if (!u?.other) return null;
  const a = altOf(new Map((built.alternators || []).map((x) => [x.key, x])), u.other);
  return a ? { model: a.model, make: a.make || "", rec: a } : { model: String(u.other).trim(), make: "", rec: null };
};
const MAKER_GAP = /^Đầu phát .* chọn theo datasheet hãng/;
// check: the alternators of the maker list on the configurations (see above). An earlier run's own choice is undone first,
// so a check run again decides afresh. Returns the need (result.makerAlt) or null.
export function makerAltFix(result, { suppliers = [], RT, built, rowOf = () => null, hsmtText = "", cap = null, sync = null, problems = [], sourcesDir } = {}) {
  const reqs = result.requirements || [], need = altNeedOf(reqs, { cap, hsmtText }), on = makerAltOn();
  const syncAlt = !!sync?.parts?.includes("alternator");
  const recMake = (m) => (built.engines || []).find((x) => x.key === CAT.keyOf(m || ""))?.make || "";
  const list = (c) => (on ? makerAlts(suppliers, RT, need, { all: true, sourcesDir, engineFamily: syncAlt ? BP.familyOf(c.engine?.make, recMake(c.engine?.model), c.engine?.model) : null }) : []);
  // An alternator a row names is "below" when its sheet's column is under the kVA needed; with a site above 40 °C / 1 000 m
  // (D2, 21/11/2026), under it after the maker's derating of the sheet that gave the largest figure (makerDerate). No factor
  // in the sources → the column as written (not proven below, the alternator stays).
  const below = (model) => {
    const col = contKva(ratingsFor(RT.alt, model), need);
    if (!need.kva || !col) return null;
    const dr = need.site && col.top ? makerDerate(col.top, need.site, sourcesDir) : null;
    const max = dr?.f ? col.max * dr.f : col.max;
    return max < need.kva - 0.5 ? { ...col, ...(dr?.f ? { derated: Number(max.toFixed(1)), derate: dr } : {}) } : null;
  };
  let used = 0;
  for (const c of result.configs || []) {
    if (c.alternator?.fromMaker && c.alternator.byCode) c.alternator = c.alternator.was ? c.alternator.was : null;
    c.gaps = (c.gaps || []).filter((g) => !MAKER_GAP.test(g));
    const p = c.alternator, u = rowOf(c.genset?.src || c.engine?.src), rowAlt = rowAltOf(u, built), rowBad = rowAlt && below(rowAlt.model);
    const fill = (m, mine, was = null, why = "") => {
      c.alternator = { model: m.model, make: m.make, src: { kind: "maker", supplierId: m.supplierId, n: m.n, url: m.url, lines: m.lines }, fromMaker: true, ...(mine ? { byCode: true } : {}),
        kva: m.kva, rating: m.label, options: m.options, ...(was ? { was, wasWhy: why } : {}) };
      if (mine) c.checks = (c.checks || []).filter((x) => x.part !== "alternator");
      c.gaps = [...(c.gaps || []), `Đầu phát ${m.model} (${m.make}) chọn theo datasheet hãng, NCC chưa chào${was ? ` (NCC chào ${was.model}: ${why})` : ""}: cần NCC xác nhận chào được đầu phát này và lắp ghép với động cơ ${c.engine?.model || ""} (mặt bích SAE, đĩa khớp nối, khung).`];
      used++;
    };
    const why = (col) => col.derated != null
      ? `${fmt(col.max)} kVA ở cột ${col.label} × hệ số suy giảm ${col.derate.f} của hãng theo hiện trường HSMT = ${figVi(col.derated, 1)} kVA < ${fmt(need.kva)} kVA cần`
      : `${fmt(col.max)} kVA ở cột ${col.label} < ${fmt(need.kva)} kVA cần`;
    if (p?.src?.kind === "maker") {
      // The agent's pick from the list: kept when the list has it and the row allows it.
      const m = list(c).find((x) => x.supplierId === p.src.supplierId && CAT.keyOf(x.model) === CAT.keyOf(p.model || ""));
      if (m && (!rowAlt || rowBad)) { fill(m, false, rowBad ? { model: rowAlt.model, make: rowAlt.make } : null, rowBad ? why(rowBad) : ""); continue; }
      problems.push(`#${c.rank} đầu phát ${p.model} (datasheet hãng): ${!m ? "không có trong danh sách đầu phát hãng đạt HSMT" : `dòng tổ máy ghi đầu phát ${rowAlt.model} chưa bị chứng minh là không đạt`}, đã bỏ`);
      c.alternator = rowAlt ? { model: rowAlt.model, ...(rowAlt.make ? { make: rowAlt.make } : {}), src: c.genset?.src || c.engine?.src } : null;
      c.checks = (c.checks || []).filter((x) => x.part !== "alternator");
      if (rowAlt) continue;
    }
    const q = c.alternator;
    // (2) a named alternator with no maker figures, or one that meets: kept. A row that names one the agent left out: left.
    if (q?.model) {
      const bad = below(q.model);
      if (!bad) continue;
      const m = list(c)[0];
      if (m) fill(m, true, { model: q.model, ...(q.make ? { make: q.make } : {}), src: q.src }, why(bad));
      continue;
    }
    if (rowAlt) continue;
    const m = list(c)[0];
    if (m) fill(m, true);
  }
  if (!on || !need.kva || !need.hz) { delete result.makerAlt; return null; }
  result.makerAlt = { need: needText(need), used };
  return need;
}
// The alternator checks the code writes from the maker's sheet of a configuration's alternator chosen that way: its kVA at
// the continuous column (alt_power); a site above 40 °C / 1 000 m leaves it unclear (the maker's derating, not computed);
// its origin by the make's default place (Khoa's answer 4: a brand asked is met, a place asked needs the CO).
export function makerAltChecks(c, reqs = [], need = null, { sourcesDir } = {}) {
  const p = c.alternator;
  if (!p?.fromMaker || !need) return c;
  const src = (lines) => ({ supplierId: p.src.supplierId, n: p.src.n, url: p.src.url, lines });
  const r = reqs.find((q) => q.code === "alt_power" && !q.byCode), o = r && openCheck(c, r), lim = r && primeKvaOf(reqTxt(r));
  const hot = need.site && ((need.site.temp || 0) > 40 || (need.site.alt || 0) > 1000);
  // Above the column's 40 °C / 1 000 m: the maker's derating from its saved sources (makerDerate, B2); none → unclear.
  const d = hot ? makerDerate({ supplierId: p.src?.supplierId, n: p.src?.n, model: p.model }, need.site, sourcesDir) : null;
  const eff = d?.f ? p.kva * d.f : null;
  if (o && p.kva && (hot || !lim || p.kva >= lim - 0.5)) {
    // The sheet's kVA row (with the model's own line before it when the sheet writes the model on a line of its own).
    const L = p.src.lines || [], k = L.map((l) => /\bkVA\b/.test(l)).lastIndexOf(true), from = k > 0 && !/\bkVA\b/.test(L[k - 1]) && /^\|?\s*(TAL|LSA)\b/i.test(L[k - 1]) ? k - 1 : k;
    const at = hot ? `HSMT có điều kiện hiện trường (${[need.site.temp > 40 && `${need.site.temp} °C`, need.site.alt > 1000 && `${fmt(need.site.alt)} m`].filter(Boolean).join(", ")}) vượt 40 °C / 1 000 m của cột này` : "";
    const calc = eff != null ? `${fmt(p.kva)} kVA × ${d.parts.map((x) => x.factor).join(" × ")} = ${figVi(eff, 1)} kVA` : "";
    const status = !hot ? "met" : eff == null ? "unclear" : !lim || eff >= lim - 0.5 ? "met" : "not_met";
    const how = d ? d.parts.map((x) => `hệ số ${x.what} ${x.factor} (${x.why}; ${x.src.supplierId} [${x.src.n}]: "${x.src.line}")`).join("; ") : "";
    putCheck(c, o.x, { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: `${eff != null ? `${figVi(eff, 1)} kVA sau suy giảm (${fmt(p.kva)} kVA ` : `${fmt(p.kva)} kVA (`}${p.rating}; datasheet hãng ${p.make})`, sourceQuote: k >= 0 ? L.slice(from, k + 1).join(" ") : "",
      part: "alternator", level: r.level || "core", status, byCode: true, rule: "dau-phat-hang", sheetSrc: src(p.src.lines || []),
      ...(d?.parts.length ? { derate: d.parts.map((x) => ({ what: x.what, factor: x.factor, src: x.src })) } : {}),
      note: `Code đọc từ datasheet hãng (${p.src.supplierId} [${p.src.n}]), cột ${p.rating}.${!hot ? ""
        : eff != null ? ` ${at}: ${how}; ${calc} ${status === "met" ? "≥" : "<"} ${lim ? `${fmt(lim)} kVA HSMT` : "mức HSMT"}.`
        : ` ${at}: ${how ? `${how}; ` : ""}nguồn đã lưu của hãng không có hệ số suy giảm theo ${d?.missing.join(" và ") || "điều kiện này"} (đã tìm trong tờ ${p.src.supplierId} [${p.src.n}]${/^LSA\b/i.test(p.model || "") ? ` và ${DERATE_LS.supplierId} [${DERATE_LS.n}]` : ""}): chưa rõ.`}` });
  }
  const own = (q) => { const x = (c.checks || []).find((y) => norm(y.item) === norm(q.item)); return x && x.byCode && x.rule !== "dau-phat-hang" ? null : { x }; };
  const base = (q) => ({ item: q.item, requirement: q.requirement || "", hsmtQuote: q.quote || "", part: "alternator", level: q.level === "option" ? "option" : "core", byCode: true, rule: "dau-phat-hang" });
  // The make the HSMT names: the maker's make among them → met (its "tương đương" does not matter then).
  for (const q of reqs.filter((x) => x.code === "alt_make" && !x.byCode)) {
    const o = own(q);
    if (o && need.makes?.includes(p.make)) putCheck(c, o.x, { ...base(q), offered: `${p.make} (đầu phát ${p.model} chọn theo datasheet hãng, NCC chưa chào)`, status: "met", note: `Code ghi: HSMT nêu hãng ${p.make}.` });
  }
  // The model the HSMT names: the same model → met; another model of the maker → not concluded (Khoa decides whether a
  // model of the same make meeting the kVA stands for the named one).
  for (const q of reqs.filter((x) => x.code === "alt_model" && !x.byCode)) {
    const o = own(q), k = CAT.keyOf(reqTxt(q));
    if (!o || !k) continue;
    // Khoa 20/11/2026: "cho đạt khi có 'hoặc tương đương'".
    const same = k.includes(CAT.keyOf(p.model)), eq = /t[ưu]ơng\s*đ[ưu]ơng|equivalent/i.test(reqTxt(q));
    const why = `đầu phát chọn theo datasheet hãng là ${p.model} (cùng hãng ${p.make}, ${fmt(p.kva)} kVA ${p.rating || ""}, đạt mức kVA HSMT)`;
    putCheck(c, o.x, { ...base(q), offered: `${p.model} (${p.make}, chọn theo datasheet hãng, NCC chưa chào)`, status: same || eq ? "met" : "unclear",
      note: same ? "Code ghi: đúng model HSMT nêu, có trong datasheet hãng."
        : eq ? `Code ghi: HSMT nêu model "${q.requirement || q.quote}" (có "tương đương"); ${why}, thay cho model HSMT nêu vì model đó không có trong danh sách code lọc (không có trong datasheet hãng đã lưu hoặc không đạt điều kiện lọc).`
        : `Code ghi: HSMT nêu model "${q.requirement || q.quote}" (không ghi "tương đương"); ${why}, không phải model đó: cần xem HSMT có nhận model khác cùng hãng.` });
  }
  for (const q of reqs.filter((x) => x.code === "alt_origin" && !x.byCode)) {
    const t = reqTxt(q);
    // A plant's sheet (MAKER_PLANT) says where it is made; otherwise the make's default place, not proven (decision 4).
    const made = makerMadeOf(p.src?.supplierId, p.make, p.model), plant = !!makerPlantOf(p.src?.supplierId, p.model);
    const where = made.at === "?" ? `hãng ${p.make}${made.why && !/^mặc định/.test(made.why) ? `, nơi sản xuất chưa rõ (${made.why})` : ""}` : plant ?`hãng ${p.make}, sản xuất tại ${madeVi(made.at)} (${made.why})` : `hãng ${p.make}, sản xuất mặc định tại ${madeVi(made.at)}`;
    if (!/\bG\s?-?(7|20)\b/.test(t)) {
      // A country the HSMT names, not a group: met when the plant's sheet is of that country, else to be confirmed (CO).
      const o = own(q);
      if (!o || !t.trim()) continue;
      const ok = plant && countryNamed(t, made.at);
      putCheck(c, o.x, { ...base(q), offered: `Đầu phát ${p.model} (${where})`, status: ok ? "met" : "confirm", ...(ok ? {} : { confirm: "document" }),
        note: ok ? `Code ghi: ${where}; HSMT ghi xuất xứ "${q.requirement || q.quote}"; đầu phát chọn theo datasheet hãng, NCC chưa chào.`
          : `Cần xác nhận nơi sản xuất đầu phát (CO): đầu phát chọn theo datasheet hãng, NCC chưa chào; ${where}; HSMT ghi xuất xứ "${q.requirement || q.quote}".` });
      continue;
    }
    const basis = madeBasisOf(q.quote) || madeBasisOf(q.requirement), grp = `${/\bG\s?-?20\b/.test(t) ? "g20" : "g7"}${EU_W.test(t) ? "eu" : ""}`;
    // The brand asked → the make's own country; the place asked → where it is made (a plant's sheet: known).
    const at = basis === "brand" ? made.brand : made.at, inG = at !== "?" && CAT.COUNTRY_GROUP[grp].includes(at);
    // A sheet whose plant is unknown on purpose (NO_PLANT: Stamford S4–S7, Khoa 21/11/2026): the place asked → the CO.
    const noPlace = basis && basis !== "brand" && at === "?" && !makerPlantOf(p.src?.supplierId, p.model) && !!NO_PLANT[p.src?.supplierId]?.re.test(String(p.model || "").trim());
    if (!basis || (at === "?" && !noPlace)) continue;
    const x = (c.checks || []).find((y) => norm(y.item) === norm(q.item));
    if (x && x.byCode && x.rule !== "dau-phat-hang" && x.rule !== "noi-san-xuat") continue;
    const status = noPlace ? "confirm" : !inG ? "not_met" : basis === "brand" ? "met" : "confirm";
    putCheck(c, x, { item: q.item, requirement: q.requirement || "", hsmtQuote: q.quote || "", offered: `Đầu phát ${p.model} (${where})`, part: "alternator", level: q.level === "option" ? "option" : "core", status, byCode: true, rule: "dau-phat-hang",
      ...(status === "confirm" ? { confirm: "document" } : {}),
      note: status === "confirm" ? `Cần xác nhận nơi sản xuất đầu phát (CO): đầu phát chọn theo datasheet hãng, NCC chưa chào; ${where}; HSMT đòi nơi sản xuất ${GROUP_NAME[grp]}.`
        : status === "met" ? `Code ghi: thương hiệu ${p.make} (${madeVi(made.brand)}) thuộc nhóm ${GROUP_NAME[grp]}; đầu phát chọn theo datasheet hãng, NCC chưa chào.` : `Code ghi: ${basis === "brand" ? `thương hiệu ${p.make} (${madeVi(at)})` : where}, ngoài nhóm ${GROUP_NAME[grp]}.` });
  }
  return c;
}
export function altKvaRange(list = []) {
  const by = new Map();
  for (const x of list) { const k = `${x.supplierId}#${x.n}`, o = by.get(k) || { max: 0, lines: [] }; o.max = Math.max(o.max, ...x.values); o.lines.push(x); by.set(k, o); }
  const m = [...by.values()].map((o) => o.max);
  if (!m.length) return null;
  if (!near(Math.min(...m), Math.max(...m))) return { conflict: m };
  return { max: Math.max(...m), src: { lines: [...by.values()].flatMap((o) => o.lines).slice(0, 3).map(({ supplierId, n, line }) => ({ supplierId, n, line })) } };
}
// The kW of a power requirement of the HSMT at a rating ("≥ 160 kVA / 128 kW").
const hsmtKw = (reqs, rating) => {
  const r = (reqs || []).find((q) => q.code === (rating === "prime" ? "power_prime" : "power_standby"));
  const n = r ? [...flat(`${r.requirement || ""}`).matchAll(/(\d+(?:[.,]\d+)?)\s*kWe?\b/gi)].map((m) => Number(m[1].replace(",", "."))) : [];
  return n.length ? Math.max(...n) : null;
};
export function comboChecks(c, { combo, row, engFacts = [], altFacts = [], altKva = [], altRatings = [], reqs = [] }) {
  const out = {}, asks = [], warnings = [];
  // 1. Power balance (2026-11-10, PR 3): the engine's kWm at a rating × the alternator's efficiency against the set's kWe at
  // that rating (its row) and the HSMT's. Every figure is a RANGE of what the sources give: the stored datasheets lost
  // their column titles (which voltage, load, temperature class a figure is of), so the code does not pick one. Met
  // ("ok") when even the lowest product reaches the need, "low" (a warning) when even the highest does not, otherwise
  // not concluded. The engine's kWm: kwmOf (the row states its frequency; a maker's figure or two agreeing sources; never
  // an assembler's "Prime power / Speed" that is the set's own kWe). Efficiency: the alternator model's "Efficiency"
  // lines (not "Mechanical Efficiency"), 80–99.9%, sources whose ranges do not overlap are not used.
  const kw = kwmOf(row, engFacts), lab = altColumns(altRatings, { hz: Number(row?.freq) || null, rating: kw && !kw.conflict ? kw.rating : "prime", reqs }), eff = lab?.eff || effRange(altFacts);
  const miss = [!kw ? "công suất động cơ có ghi mức prime / standby ở tần số mà dòng tổ máy ghi" : kw.conflict && `công suất động cơ (các nguồn lệch > 3%: ${kw.conflict.join(" / ")} kW)`,
    !eff ? "hiệu suất đầu phát theo model" : eff.conflict && `hiệu suất đầu phát (các nguồn không trùng khoảng: ${eff.conflict.join(" / ")})`].filter(Boolean);
  if (!miss.length) {
    const lo = CONV.compute({ formula: "kwe_from_kwm", inputs: [{ name: "P_kWm", value: kw.min }, { name: "eff_pct", value: eff.min }] }).value;
    const hi = CONV.compute({ formula: "kwe_from_kwm", inputs: [{ name: "P_kWm", value: kw.max }, { name: "eff_pct", value: eff.max }] }).value;
    const set = row?.power?.[kw.rating]?.kW ?? null, req = hsmtKw(reqs, kw.rating), need = Math.max(set ?? 0, req ?? 0) || null;
    const rg = (a, b, u) => (Math.abs(a - b) < 0.05 ? `${fmt(a)}${u}` : `${fmt(a)}–${fmt(b)}${u}`);
    const head = `Động cơ ${rg(kw.min, kw.max, " kWm")} (${kw.rating}${kw.gross ? ", gross" : ""}, ${kw.freq} Hz${kw.rpm ? ` / ${kw.rpm} v/p` : ""}) × hiệu suất đầu phát ${rg(eff.min, eff.max, "%")}${eff.label ? ` (${eff.label})` : ""} = ${rg(lo, hi, " kWe")}`;
    const inputs = { engine: kw.src, eff: eff.src };
    if (!need) out.power = { status: "missing", text: `${head}; không có số kWe ${kw.rating} của tổ máy hay HSMT để so.`, inputs };
    else {
      const who = need === req ? "HSMT" : "dòng tổ máy", status = lo >= need - 0.5 ? "ok" : hi < need - 0.5 ? "low" : "unsure";
      out.power = { status, value: [lo, hi], need, rating: kw.rating, inputs, basis: CONV.FORMULAS.kwe_from_kwm.basis,
        text: `${head} ${status === "ok" ? "≥" : status === "low" ? "<" : "so với"} ${fmt(need)} kWe ${kw.rating} (${who})${status === "unsure" ? ": chưa kết luận được (khoảng số của nguồn chứa mức yêu cầu)" : ""}${kw.gross && status === "ok" ? "; công suất gross chưa trừ quạt két nước" : ""}.` };
      // A warning that asks, not one that says the set is short (điều phối 2026-11-10).
      if (status === "low") warnings.push(`Cân bằng công suất: ${out.power.text.replace(/\.$/, "")} — cần NCC xác nhận công suất động cơ (gross/net) và hiệu suất đầu phát.`);
    }
  } else out.power = { status: "missing", text: `chưa kiểm được, thiếu ${miss.join("; ")}.` };
  // kVA of the alternator: its datasheet's kVA lines (altKvaOf) give ratings of the model with the column titles lost,
  // and the stored Leroy-Somer sheets miss columns (60 Hz / higher class), so no warning: when even the highest is
  // below the set's prime kVA on a row that states 50 Hz, a question for the supplier; nothing otherwise.
  const setKva = row?.power?.prime?.kVA ?? row?.power?.rated?.kVA ?? null;
  // With the columns read from the sheet (altColumns, PR 5): the kVA of the continuous duty at the row's frequency and the
  // HSMT's voltage. Still a question, never a warning (điều phối 2026-11-10).
  const labP = altColumns(altRatings, { hz: Number(row?.freq) || null, rating: "prime", reqs });
  if (labP?.kVA && setKva) {
    out.altKva = { min: labP.kVA.min, max: labP.kVA.max, need: setKva, status: labP.kVA.max < setKva - 0.5 ? "below" : "any", labeled: labP.label, src: labP.src };
    if (out.altKva.status === "below") asks.push({ part: "alternator", item: "Công suất định mức đầu phát", requirement: `≥ ${fmt(setKva)} kVA (prime của tổ máy)`, kind: "model", status: "unclear",
      ask: `Xác nhận kVA định mức đầu phát ở cấp nhiệt chào (datasheet ghi ${labP.label}: lớn nhất ${fmt(labP.kVA.max)} kVA)` });
  }
  const ak = !labP?.kVA && altKva && altKva.length ? altKvaRange(altKva) : null;
  if (ak && !ak.conflict && setKva) {
    out.altKva = { max: ak.max, need: setKva, status: ak.max < setKva - 0.5 ? "below" : "any", src: ak.src };
    if (out.altKva.status === "below" && Number(row?.freq) === 50) asks.push({ part: "alternator", item: "Công suất định mức đầu phát", requirement: `≥ ${fmt(setKva)} kVA (prime của tổ máy)`, kind: "model", status: "unclear",
      ask: `Xác nhận kVA định mức đầu phát ở cấp nhiệt chào (datasheet đã lưu ghi lớn nhất ${fmt(ak.max)} kVA)` });
  }
  // 4. Load step / G2–G3: BMEP for reference only (Khoa's rule: no met / not met from it).
  if (combo?.loadStep) {
    const disp = (row?.specs || []).find((s) => s.key === "disp") || (() => { const f = oneFact(engFacts, "disp", (v) => v > 0.3 && v < 200); return f?.value != null ? { value: `${f.value}`, label: f.label } : null; })();
    let V = disp ? numbersIn(disp.value)[0] : null;
    if (V && /cc|ml/i.test(`${disp.value}`)) V = V / 1000;
    const spd = (kw && !kw.conflict && kw.rpm) || numbersIn((row?.specs || []).find((s) => s.key === "speed")?.value || "").find((v) => v >= 1000 && v <= 3600) || null;
    const rating = kw && !kw.conflict && kw.min === kw.max ? kw.rating : null, P = rating ? kw.min : null;
    if (rating && V && spd) {
      const cv = CONV.compute({ formula: "bmep_4s", inputs: [{ name: "P_kW", value: P }, { name: "V_L", value: V }, { name: "n_rpm", value: spd }] });
      out.bmep = { value: cv.value, rating, text: `BMEP ≈ ${fmt(cv.value)} bar ở công suất ${rating} (${fmt(P)} kWm, ${fmt(V)} L, ${spd} v/p) — chỉ để tham khảo khả năng nhận tải, không dùng để kết luận.`, basis: CONV.FORMULAS.bmep_4s.basis };
    }
    // A load step requirement of the HSMT already has its line (rfqOf asks for the test report there).
    if (!reqs.some((r) => r.code === "load_step")) asks.push({ part: "genset", item: "Nhận tải một bước / ISO 8528-5", requirement: "", quote: combo.loadStep.quote.slice(0, 160), kind: "model", status: "unclear",
      ask: `Gửi kết quả thử nhận tải một bước theo ISO 8528-5 (% tải nhận được ở cấp G2 / G3) của tổ máy${out.bmep ? ` (BMEP tham khảo ${fmt(out.bmep.value)} bar)` : ""}` });
  }
  // 3. Site above 40 °C or 1 000 m: the maker's derating curve. No figure is computed: the sources give no factor.
  if (combo?.site && !reqs.some((r) => r.code === "ambient")) {
    const what = [combo.site.temp && `nhiệt độ môi trường ${combo.site.temp} °C`, combo.site.alt && `độ cao ${fmt(combo.site.alt)} m`].filter(Boolean).join(", ");
    asks.push({ part: "genset", item: "Điều kiện hiện trường", requirement: what, kind: "site", status: "unclear", ask: "Gửi đường giảm công suất của nhà sản xuất ở điều kiện này; xác nhận công suất còn lại vẫn ≥ yêu cầu" });
  }
  // 5. Load types: a question each, unless a check of its code is met.
  const metCode = (code) => (c.checks || []).some((x) => x.status === "met" && reqs.find((r) => norm(r.item) === norm(x.item))?.code === code);
  for (const lt of combo?.loadTypes || []) {
    const l = LOAD_TYPES.find((x) => x.type === lt.type);
    if (l.code && metCode(l.code)) continue;
    // The HSMT's own line stays in quote (shown only with SHOW_SRC); the screen and the copied text show the requirement
    // as read (Khoa 2026-11-11: no citations on screen; "300% (3 IN) trong 10 % giây" was the HSMT's line, typo and all).
    asks.push({ part: l.part, item: `Loại tải: ${l.label}`, requirement: reqs.find((r) => l.code && r.code === l.code)?.requirement || "", quote: lt.quote.slice(0, 160), kind: "model", status: "unclear", ask: l.ask });
  }
  c.combo = out; c.comboAsk = asks;
  if (warnings.length) c.warnings = warnings; else delete c.warnings;
  return c;
}
// The notes of the whole result: overload on the standby rating (the HSMT to be clarified, no status changed).
export function comboNotes(result, combo) {
  const note = combo?.overloadEsp && `Cần làm rõ HSMT: HSMT đòi quá tải 10% trên công suất dự phòng (ESP) ("${combo.overloadEsp.quote.slice(0, 160)}"), nhưng theo ISO 8528-1 mức ESP không có quá tải (quá tải 10% trong 1 giờ / 12 giờ là của mức prime). Kiểm tra theo mức prime, chưa đổi kết quả kiểm.`;
  result.notes = (result.notes || []).filter((n) => !/^Cần làm rõ HSMT: HSMT đòi quá tải 10%/.test(n));
  if (note) result.notes.push(note);
  result.combo = combo;
  return result;
}
// Câu hỏi làm rõ HSMT (result.clarify, điều phối 2026-11-11): points to ask the investor about, not the supplier. Each
// {item, quoteA, quoteB?, why, by} with quotes word for word from the HSMT. From the code:
//  (1) one point stated at two places with different figures: the quotes of a requirement code joined from several
//      requirements (check, `quotes`), and for a tolerance band (voltage / frequency regulation) the other lines of the
//      HSMT about it (IB2600603983: "≤ ± 0,5% Udm" in the table, "≤ ±1,5%Udm" in section II.1.3). Compared only by the
//      figure of the code (% band, V, Hz, kVA, rpm), so "Pmax = 1,1Pdm" and "10% tải" are not taken for a conflict;
//  (2) overload 10% asked on the standby rating (comboNotes);
//  (3) a design figure (compression ratio, bore x stroke) no configuration's model meets, when the agent wrote so in
//      the notes. From the agent: `clarify` in result.json, kept only when its quotes are in the HSMT.
const CMP_FIG = {
  alt_vreg: pctsIn, freq_regulation: pctsIn,
  voltage: (t) => voltsIn(t),
  frequency: (t) => [...String(t || "").matchAll(/(\d{2})\s*Hz/gi)].map((m) => Number(m[1])),
  power_prime: (t) => [...String(t || "").matchAll(/(\d[\d.,]*)\s*kVA/gi)].map((m) => Number(m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."))),
  power_standby: (t) => [...String(t || "").matchAll(/(\d[\d.,]*)\s*kVA/gi)].map((m) => Number(m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."))),
  speed: (t) => [...String(t || "").matchAll(/(\d[\d.,]{2,})\s*(?:v[òo]ng|v\s*\/\s*p|rpm)/gi)].map((m) => Number(m[1].replace(/[.,]/g, ""))),
};
// The HSMT lines scanned for a tolerance band: the words of the point itself (not reqcodes.mjs words, whose bare "±0,x%"
// would take a frequency line for the voltage one), and not the other band's words.
const BAND = /([ổo]n\s*đ[ịi]nh|bi[ếe]n\s*thi[êe]n|dao\s*đ[ộo]ng|sai\s*s[ốo]|đ[ộo]\s*ch[íi]nh\s*x[áa]c)\s*(c[ủu]a\s*)?/;
const SCAN = {
  alt_vreg: { is: new RegExp(BAND.source + String.raw`đi[ệe]n\s*[áa]p|voltage\s*(regulation|variation|stability|accuracy)`, "i"), not: /t[ầa]n\s*s[ốo]|frequency/i },
  freq_regulation: { is: new RegExp(BAND.source + String.raw`t[ầa]n\s*s[ốo]|frequency\s*(regulation|variation|stability)`, "i"), not: /đi[ệe]n\s*[áa]p|voltage/i },
};
const DESIGN = { compression: /t[ỉỷiy]\s*s[ốo]\s*n[ée]n|compression/i, bore_stroke: /đ[ưu][ờo]ng\s*k[íi]nh|h[àa]nh\s*tr[ìi]nh|\bbore\b|\bstroke\b/i };
const figText = (v) => Number(v).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
const disjoint = (a, b) => a.length > 0 && b.length > 0 && !a.some((v) => b.some((w) => Math.abs(v - w) < 1e-9));
const rowNoOff = (q) => String(q || "").replace(/^\s*\d{1,3}[.)]?\s+/, "");
// `scan`: false for one size of a tender of several sizes, whose HSMT has a section per size (each its own bands).
export function clarifyOf(result, hsmtText, combo, problems = [], { scan = true } = {}) {
  const H = norm(hsmtText), inH = (q) => !!q && H.includes(norm(q));
  const out = [], key = (x) => `${norm(x.quoteA)}|${norm(x.quoteB || "")}`;
  const push = (x) => { if (!out.some((y) => key(y) === key(x) || (x.quoteB && key(y) === `${norm(x.quoteB)}|${norm(x.quoteA)}`))) out.push(x); };
  const lines = String(hsmtText || "").split(/\r?\n/);
  for (const r of result.requirements || []) {
    const fig = CMP_FIG[r.code];
    if (!fig || !r.quote || !inH(r.quote)) continue;
    const a = fig(rowNoOff(r.quote));
    if (!a.length) continue;
    // Other quotes of the same code (requirements joined by code), then the HSMT's other lines about a tolerance band.
    const others = (r.quotes || []).filter(inH).map((q) => ({ q, v: fig(rowNoOff(q)) }));
    if (scan && SCAN[r.code]) {
      const { is, not } = SCAN[r.code];
      lines.forEach((l, i) => {
        if (!is.test(l) || not.test(l) || TRANSIENT.test(l)) return;
        let q = l.trim(), v = fig(q);
        if (!v.length && lines[i + 1]) { q = `${q} ${lines[i + 1].trim()}`; v = fig(q); }
        if (v.length && inH(q)) others.push({ q, v });
      });
    }
    const b = others.find((o) => disjoint(a, o.v));
    if (!b) continue;
    const unit = fig === pctsIn ? "%" : "";
    push({ item: r.item, code: r.code, quoteA: r.quote, quoteB: b.q, why: `HSMT ghi hai mức khác nhau cho cùng một yêu cầu (${[...new Set(a)].map((v) => `${fig === pctsIn ? "±" : ""}${figText(v)}${unit}`).join(", ")} và ${[...new Set(b.v)].map((v) => `${fig === pctsIn ? "±" : ""}${figText(v)}${unit}`).join(", ")}).`, by: "code" });
  }
  if (combo?.overloadEsp?.quote && inH(combo.overloadEsp.quote)) push({ item: "Quá tải trên công suất dự phòng", code: "overload", quoteA: combo.overloadEsp.quote, why: "HSMT đòi quá tải 10% trên công suất dự phòng (ESP); theo ISO 8528-1 mức dự phòng không có quá tải, quá tải 10% trong 1 giờ / 12 giờ là của công suất liên tục (prime).", by: "code" });
  for (const r of result.requirements || []) {
    const re = DESIGN[r.code];
    if (!re || !r.quote || !inH(r.quote) || !(result.configs || []).length) continue;
    const figs = numbersLoose(rowNoOff(r.requirement || r.quote)).filter((v) => v > 1);
    const met = (result.configs || []).some((c) => (c.checks || []).some((x) => norm(x.item) === norm(r.item) && x.status === "met"));
    const said = (result.notes || []).some((n) => re.test(n) && figs.some((v) => numbersLoose(n).includes(v)));
    if (!met && said && figs.length) push({ item: r.item, code: r.code, quoteA: r.quote, why: `${r.item} là giá trị thiết kế của từng model động cơ; không động cơ nào trong các cấu hình gợi ý ghi đúng ${r.requirement || figText(figs[0])}. Đề nghị cho phép dải giá trị hoặc giá trị tương đương.`, by: "code" });
  }
  // The agent's: each quote word for word in the HSMT, else dropped (like any quote of the result).
  for (const x of result.clarify || []) {
    if (!x || x.by === "code") continue;
    if (!x.item || !inH(x.quoteA) || (x.quoteB && !inH(x.quoteB))) { problems.push(`Câu hỏi làm rõ HSMT "${String(x.item || "").slice(0, 60)}": câu trích không có trong HSMT, đã bỏ`); continue; }
    // Trùng mục của code (IB2600603983 "Ổn định điện áp"): cùng tên mục VÀ chung ít nhất một câu trích thì giữ mục của code.
    const qs = [x.quoteA, x.quoteB].filter(Boolean).map(norm);
    if (out.some((y) => y.by === "code" && norm(y.item) === norm(x.item) && [y.quoteA, y.quoteB].some((q) => q && qs.includes(norm(q))))) continue;
    push({ item: String(x.item), quoteA: x.quoteA, ...(x.quoteB ? { quoteB: x.quoteB } : {}), why: String(x.why || ""), by: "agent" });
  }
  if (out.length) result.clarify = out; else delete result.clarify;
  return result;
}
// A configuration with no controller, when the HSMT asks for one, is "not met" on the controller (Khoa, 2026-11-02):
// its controller checks would all be "unclear", which ranked it above configurations that offer one but miss a point
// elsewhere. The check is written by the code and shown like the others.
export const NO_CONTROLLER = "Bộ điều khiển của cấu hình";
// Đồng bộ thương hiệu (Khoa, 2026-11-06, IB2600594596: HSMT "đồng bộ 02 trong 03 bộ phận chính (động cơ, đầu phát, bộ
// điều khiển) bởi nhà sản xuất máy phát điện", the suggestion gave Cummins + Nianfeng + SmartGen sets of a Chinese
// assembler). web/bidprice.js brandSyncOf reads it; the check is the code's: how many of the parts named are of the
// genset maker's family (web/bidprice.js familyOf). Met: the genset maker is known and makes enough of them. Not met:
// even counting every part whose make is unknown as the maker's, no maker reaches the count (three makes for "2 of 3"),
// or the genset maker is known and cannot reach it. Otherwise unclear (two parts of one make, but whose set it is is not
// known, or a make not stated). Ranked with the engine and the controller.
export const SYNC_ITEM = "Đồng bộ thương hiệu";
const SYNC_VI = { engine: "động cơ", alternator: "đầu phát", controller: "bộ điều khiển" };
const isSyncItem = (s) => norm(s || "") === norm(SYNC_ITEM) || (/đồng\s*bộ|cùng\s*(một\s*)?(hãng|thương\s*hiệu|nhãn\s*hiệu|nhà\s*sản\s*xuất)/i.test(s || "") && !/h[oò][àa]\s*đồng\s*bộ|kiểm\s*định|phiếu/i.test(s || ""));
const syncText = (s) => `Ít nhất ${s.need}/${s.parts.length} bộ phận (${s.parts.map((p) => SYNC_VI[p]).join(", ")}) do chính hãng sản xuất tổ máy làm ra`;
export function syncCheck(sync, fam, makers = [], models = {}) {
  const parts = sync.parts, need = sync.need, known = parts.filter((p) => fam[p]), unknown = parts.length - known.length;
  const offered = parts.map((p) => `${SYNC_VI[p]} ${models[p] ? `${models[p]} ` : ""}(${fam[p] ? `hãng ${fam[p]}` : "chưa rõ hãng"})`).join(", ");
  const count = (f) => parts.filter((p) => fam[p] === f).length;
  const best = Math.max(0, ...known.map((p) => count(fam[p])));
  const top = known.map((p) => fam[p]).find((f) => count(f) === best);
  const out = { item: SYNC_ITEM, requirement: syncText(sync), hsmtQuote: sync.quote, offered, part: "genset", level: "core", byCode: true };
  // makers: [{ name, fam }] the genset may be of (fam null: an assembler, whose own parts can only be the unknown ones).
  const byMaker = makers.map((m) => ({ ...m, n: m.fam ? count(m.fam) : 0 })).sort((a, b) => b.n - a.n)[0];
  if (byMaker && byMaker.fam && byMaker.n >= need) return { ...out, status: "met", note: `Code ghi: tổ máy ${byMaker.fam}, ${byMaker.n}/${parts.length} bộ phận cùng hãng ${byMaker.fam}.` };
  if (best + unknown < need) return { ...out, status: "not_met", note: `Code ghi: ${known.length === parts.length ? "các bộ phận thuộc" : "các bộ phận đã rõ hãng thuộc"} ${new Set(known.map((p) => fam[p])).size} hãng khác nhau, không hãng nào làm ra đủ ${need}/${parts.length} bộ phận.` };
  // A set only of assemblers (no supplier is a make): one may make its alternator, not its engine nor its controller
  // (they buy SmartGen / Deep Sea…), so an engine of another make leaves it at most 1 part (2026-11-06: a Doosan set of
  // a Fujian assembler with no alternator or controller named ranked first as "unclear").
  const ownMax = parts.includes("alternator") && !fam.alternator ? 1 : 0;
  if (byMaker && !makers.some((m) => m.fam) && fam.engine && ownMax < need) {
    const who = [...new Set(makers.map((m) => m.name))].slice(0, 3).join(" / ");
    return { ...out, status: "not_met", note: `Code ghi: tổ máy do xưởng lắp ráp ${who} làm; động cơ ${fam.engine} không phải của xưởng và xưởng lắp ráp không tự làm bộ điều khiển, nên tối đa ${ownMax}/${parts.length} bộ phận là của hãng tổ máy.` };
  }
  if (byMaker && byMaker.n + unknown < need) {
    const who = [...new Set(makers.map((m) => m.fam || m.name))].slice(0, 3).join(" / ");
    return { ...out, status: "not_met", note: `Code ghi: tổ máy do ${who} làm, chỉ ${byMaker.n}/${parts.length} bộ phận là của hãng tổ máy${best >= need ? `; cần tổ máy do chính ${top} sản xuất` : ""}.` };
  }
  return { ...out, status: "unclear", note: best >= need ? `Code ghi: ${best} bộ phận cùng hãng ${top}; cần tổ máy do chính ${top} sản xuất (nhà cung cấp trong cấu hình không phải ${top}).` : `Code ghi: chưa rõ hãng của ${parts.filter((p) => !fam[p]).map((p) => SYNC_VI[p]).join(", ")}.` };
}
function noController(c, reqs) {
  const has = !!c.controller?.model && !c.controller.unverified, mine = (x) => x.byCode && (x.item === NO_CONTROLLER || x.item === "Bảng điều khiển của cấu hình");
  // A controller added later (Tìm NCC's check) takes the code's check away again.
  if (has) { if ((c.checks || []).some(mine)) c.checks = c.checks.filter((x) => !mine(x)); return; }
  if (!reqs.some((r) => r.part === "controller" && r.level !== "option") || (c.checks || []).some(mine)) return;
  c.checks = [{ item: NO_CONTROLLER, requirement: "Có bộ điều khiển đáp ứng các yêu cầu bộ điều khiển của HSMT", offered: "Không có bộ điều khiển nào có nguồn trong cấu hình này",
    part: "controller", level: "core", status: "not_met", byCode: true, note: "Code ghi: cấu hình không có bộ điều khiển nên tính là không đạt ở bộ điều khiển." }, ...(c.checks || [])];
}
// The requirements a genset table's header or row answers for every set in it: frequency ("50HZ"), phases ("3Phase 4Wire"),
// power factor ("PF=0.8") and voltage ("400/230V", only when the HSMT's figures are the header's). The agent left them
// "unclear" in most runs (2026-11-06 audit: Số pha 1 met / 25 unclear, Hệ số công suất 8 / 25, Tần số 22 / 16) though
// the header states them; the code reads them and marks the check byCode with the header line as its source.
const STD_ITEMS = [
  ["freq", /t[ầa]n\s*s[ốo]|frequency|\bHz\b/i, (t) => { const m = t.match(/\b(50|60)\s*Hz/i); return m && { want: `${m[1]} Hz`, re: new RegExp(`\\b${m[1]}\\s*-?\\s*Hz`, "i") }; }],
  ["phase", /s[ốo]\s*pha|\bpha\b|phase/i, (t) => (/\b3\s*pha|ba\s*pha|3\s*-?\s*ph(ase)?\b|three\s*-?\s*phase|3P\b/i.test(t) ? { want: "3 pha", re: /\b3\s*-?\s*ph(ase)?\b|three\s*-?\s*phase|3P4W|3P\b|三相/i }
    : /(^|[^\d])1\s*pha|m[ộo]t\s*pha|single\s*-?\s*phase/i.test(t) ? { want: "1 pha", re: /(^|[^\d])1\s*-?\s*ph(ase)?\b|single\s*-?\s*phase|单相/i } : null)],
  ["pf", /h[ệe]\s*s[ốo]\s*c[ôo]ng\s*su[ấa]t|cos\s*φ|cos\s*phi|cos\s*ϕ|power\s*factor|\bPF\b/i, (t) => (/0[.,]8\b/.test(t) ? { want: "cosφ 0,8", re: /\bPF\s*=?\s*0[.,]8\b|cos\s*[φϕ]?\s*=?\s*0[.,]8\b|0[.,]8\s*PF|power\s*factor\s*:?\s*0[.,]8|功率因数\s*0[.,]8/i } : null)],
  // The HSMT's figures in any order on one line that names volts ("230/400V" asked, "400/230V" in the header).
  ["voltage", /đi[ệe]n\s*[áa]p|voltage/i, (t) => { const u = [...new Set((t.match(/(?<!\d)(400|380|415|230|220|240)(?!\d)/g) || []))]; return u.length ? { want: `${u.join("/")} V`, all: [...u.map((x) => new RegExp(`(?<!\\d)${x}(?!\\d)`)), /\d\s*V\b/i] } : null; }],
];
const STD_SKIP = /qu[áa]\s*t[ảa]i|bi[ếe]n\s*thi[êe]n|sai\s*s[ốo]|[ổo]n\s*[đd][ịi]nh|đi[ềe]u\s*ch[ỉi]nh|kh[ởo]i\s*[đd][ộo]ng|[ắa]c\s*quy|\bDC\b|k[íi]ch\s*t[ừu]|đ[ộo]ng\s*c[ơo]|engine|đ[ộo]\s*m[éeè]o|THD/i;
const STD_CODE = { freq: "frequency", phase: "phases", pf: "power_factor", voltage: "voltage" };
// Fuel consumption in L/h at 100 / 75 / 50 % load (2026-11-09): when the HSMT gives a limit in L/h and the configuration's
// own genset row gives the figure at that load in L/h (catalog.js fuel / fuel75 / fuel50), the code compares them; a
// g/kWh figure or a limit in another unit is left to the agent (conversions).
const FUEL_CODE = { fuel_consumption: "fuel", fuel_consumption_75: "fuel75", fuel_consumption_50: "fuel50" }, FUEL_LOAD = { fuel: 100, fuel75: 75, fuel50: 50 };
// The figure of a fuel spec at a load: a label naming two loads ("Fuel L/h @75% / @100%") with two figures gives the one in
// the load's position; otherwise the first figure.
export function fuelAt(x, load) {
  const pcts = [...String(x.label || "").matchAll(/(\d{2,3})\s*%/g)].map((m) => Number(m[1])), nums = numbersIn(x.value);
  if (pcts.length >= 2 && nums.length >= pcts.length) { const i = pcts.indexOf(load); return i >= 0 ? nums[i] : null; }
  // "342.9 / 457.1 L/h (@75% / @100%)": the loads are named in the cell, after its figures.
  const inCell = String(x.value || "").match(/^([^(（]*)[(（]([^)）]*%[^)）]*)[)）]\s*$/);
  if (inCell) {
    const ls = [...inCell[2].matchAll(/(\d{2,3})\s*%/g)].map((m) => Number(m[1])), ns = numbersIn(inCell[1]);
    if (ls.length >= 2 && ns.length === ls.length) { const i = ls.indexOf(load); return i >= 0 ? ns[i] : null; }
  }
  return nums[0] ?? null;
}
const LH_UNIT = /l\s*\/\s*h|l\/hr|lph|l[íi]t\s*\/\s*(gi[ờo]|h)|litres?\s*\/\s*h(our)?/i;
// The figure in L/h at a load on the engine maker's own sheet of this engine (`sheet` facts): one value, else none.
function sheetFuel(engFacts, key) {
  if (!specNormOn("fuel")) return null;
  const hits = (engFacts || []).filter((f) => f.sheet && f.key === key).map((f) => ({ f, n: normFig(f, NORM_CTX.get(f), { unit: "L/h", load: FUEL_LOAD[key] }) })).filter((x) => x.n.ok && x.n.r.num != null && x.n.r.cond?.load === FUEL_LOAD[key]);
  return hits.length && new Set(hits.map((x) => x.n.r.num)).size === 1 ? { f: hits[0].f, v: hits[0].n.r.num } : null;
}
// The fuel tolerance the fact's own table writes ("Fuel consumption tolerance +/- 5%"), as written; null when it writes none.
function fuelTolOf(f) {
  for (const l of NORM_CTX.get(f)?.rows || []) {
    const m = String(l).match(/(?:fuel|consumption)[^|]*?toleran\w*[^\d|]*?(?:\+\s*\/\s*-|±)\s*(\d+(?:[.,]\d+)?)\s*%/i);
    if (m) return m[1];
  }
  return null;
}
export function fuelChecks(c, reqs, row, engFacts = []) {
  if (!row && !engFacts.length) return;
  for (const r of reqs) {
    const key = FUEL_CODE[r.code];
    if (!key) continue;
    const m = `${r.requirement || ""} ${r.quote || ""}`.match(/(?:≤|<=|<|t[ốo]i\s*đa|kh[ôo]ng\s*(?:l[ớo]n|v[ưư][ợo]t|qu[áa])(?:\s*h[ơo]n)?)\s*:?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:l[íi]t|l|L)\s*\/\s*(?:gi[ờo]|h)(?![a-z])/i);
    if (!m) continue;
    const max = Number(m[1].replace(",", "."));
    let s = (row?.specs || []).find((x) => x.key === key && LH_UNIT.test(`${x.label} ${x.value} ${x.unitCell || ""}`));
    let v = s ? fuelAt(s, FUEL_LOAD[key]) : null, skip = null;
    // GENBID_SPEC_NORM=1: the first figure of the key in L/h at the HSMT's load (normFig); a figure the old reading would
    // have compared but the layer cannot → "Chưa rõ" with why.
    if (specNormOn("fuel")) {
      const old = s, ctx = useNormCtx(row);
      s = null; v = null;
      for (const y of (row?.specs || []).filter((q) => q.key === key)) { const n = normFig(y, ctx, { unit: "L/h", load: FUEL_LOAD[key] }); if (n.ok && n.r.num != null) { s = y; v = n.r.num; break; } if (y === old) skip = n.why; }
      // The configuration's row gives no comparable figure: the engine maker's own sheet of this engine, when it gives one.
      const sh = v == null ? sheetFuel(engFacts, key) : null;
      if (sh) {
        const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
        if (x && (x.status === "met" || x.status === "not_met") && !x.unverified) continue;
        const check = { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: `${sh.v} L/h (${sh.f.label})`, sourceQuote: sh.f.line, factSrc: { supplierId: sh.f.supplierId, n: sh.f.n, line: sh.f.line }, part: "genset", level: r.level || "core", status: sh.v <= max + 1e-9 ? "met" : "not_met", byCode: true, rule: "to-hang-tieu-hao",
          // Khoa 21/11/2026: a figure of the engine maker stays met at the limit; the check says it is the engine's, and its tolerance when the sheet writes one.
          note: `Số của động cơ theo tờ hãng${fuelTolOf(sh.f) ? `, dung sai ±${fuelTolOf(sh.f)} %` : ""}. Code so ${sh.v} L/h trên tờ hãng động cơ ${c.engine?.model || ""} (${sh.f.supplierId} [${sh.f.n}], ${sh.f.label}) với mức HSMT ≤ ${max} L/h; dòng tổ máy không ghi số so được.` };
        if (x) { delete x.unverified; delete x.hint; Object.assign(x, check); } else c.checks = [...(c.checks || []), check];
        continue;
      }
      if (v == null && old && skip) {
        const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
        if (x && (x.status === "met" || x.status === "not_met") && !x.unverified) continue;
        const check = { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: `${old.value} (${old.label})`, sourceQuote: row.line, part: "genset", level: r.level || "core", status: "unclear", byCode: true, rule: "chuan-hoa",
          note: `Code chưa so: số tiêu hao của dòng tổ máy ${normWhyVi(skip)} (lớp chuẩn hoá).` };
        if (x) { delete x.unverified; delete x.hint; Object.assign(x, check); } else c.checks = [...(c.checks || []), check];
        continue;
      }
    }
    if (v == null) continue;
    const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
    if (x && (x.status === "met" || x.status === "not_met") && !x.unverified) continue;
    const check = { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: `${s.value}${s.unitCell ? ` ${s.unitCell}` : ""} (${s.label})`, sourceQuote: row.line, part: "genset", level: r.level || "core", status: v <= max + 1e-9 ? "met" : "not_met", byCode: true,
      note: `Code so ${v} L/h của dòng tổ máy với mức HSMT ≤ ${max} L/h.` };
    if (x) { delete x.unverified; delete x.hint; Object.assign(x, check); } else c.checks = [...(c.checks || []), check];
  }
}
export function stdChecks(c, reqs, row) {
  if (!row) return;
  const lines = [...(row.header || []), row.line || "", row.title || ""].filter(Boolean);
  for (const r of reqs) {
    if (r.part === "controller" || r.part === "engine" || STD_SKIP.test(`${r.item} ${r.requirement || ""}`)) continue;
    const items = r.code && r.code !== OTHER_CODE ? STD_ITEMS.filter(([k]) => STD_CODE[k] === r.code) : STD_ITEMS.filter(([, re]) => re.test(r.item || ""));
    if (!items.length) continue;
    const t = `${r.item} ${r.requirement || ""} ${r.quote || ""}`;
    const wants = items.map(([, , f]) => f(t));
    if (wants.some((w) => !w)) continue;
    const hit = wants.map((w) => lines.find((l) => (w.all ? w.all.every((re) => re.test(l)) : w.re.test(l))));
    if (hit.some((l) => !l)) continue;
    const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
    if (x && (x.status === "met" || x.status === "not_met") && !x.unverified) continue;
    const check = { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: wants.map((w) => w.want).join(", "), sourceQuote: [...new Set(hit)].join(" | "), part: r.part || "genset", level: r.level || "core", status: "met", byCode: true,
      note: "Code đọc từ tiêu đề bảng / dòng tổ máy của cấu hình." };
    if (x) { delete x.unverified; delete x.hint; Object.assign(x, check); } else c.checks = [...(c.checks || []), check];
  }
}
// ---------- Điểm tính được từ dòng nguồn của cấu hình (cfg-r3, điều phối 2026-11-11) ----------
// The code, not the agent, decides these from the configuration's own genset row (rowOf: the catalog row with the power
// web/catalog.js reads per labeled column) and the HSMT's requirement. Each conclusion is "met" only: a figure that falls
// short, a row the code cannot read, or a check already met / not met (by the agent, verified) is left as it is. Every
// figure comes from the row line word for word, every computation from web/conversions.js, and the formula with its inputs
// is written in `offered`.
const figVi = (v, d = 2) => Number(v).toLocaleString("vi-VN", { maximumFractionDigits: d });
// The check a code-written result replaces: none, or one left "unclear" (not a conflict of the model's sources).
const openCheck = (c, r) => {
  const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
  return !x ? { x: null } : x.status === "unclear" && !x.conflict && !x.version && !x.parts?.length ? { x } : null;
};
// A main controller chosen from its maker's datasheet (controller.fromMaker, bdk-amf, Khoa 20/11/2026 "2"): no supplier of the
// configuration offers it, so its origin is a paper the supplier sends (CO), whatever the agent wrote.
export function makerCtlChecks(c, reqs = []) {
  if (!c.controller?.fromMaker) return c;
  for (const r of reqs) {
    if (r.code !== "ctl_origin" || r.byCode) continue;
    const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
    putCheck(c, x, { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: `Bộ điều khiển ${c.controller.model}`, part: "controller",
      level: r.level === "option" ? "option" : "core", status: "confirm", confirm: "document", byCode: true, rule: "bdk-hang",
      note: `${CM.CTL_ALT_LABEL}: cần NCC xác nhận xuất xứ (CO) của bộ điều khiển.` });
    if (x) { delete x.sourceQuote; delete x.factSrc; }
  }
  return c;
}
const putCheck = (c, x, check) => {
  if (x) { delete x.unverified; delete x.hint; x.was = x.was || x.status; Object.assign(x, check); } else c.checks = [...(c.checks || []), check];
};
const ROW_RATING = { prime: /prime|\bPRP\b|continuous|li[êe]n\s*t[ụu]c|主用|常用/i, standby: /standby|\bESP\b|d[ựu]\s*ph[òo]ng|备用/i };
// The row's power of a rating as two figures of its own line, under a column the header names for that rating; null when
// the header does not name it, a figure is not in the line, or a "a/b" cell is written against the header's unit order
// ("KVA/KW" over 350/438: IB2600574589, the agent read it as a contradiction of the source, and so does the code).
export function ratedRowPower(row, rating) {
  const p = row?.power?.[rating], head = [...(row?.header || []), row?.title || ""].join(" ");
  if (!p?.kVA || !p?.kW || !ROW_RATING[rating]?.test(head)) return null;
  const nums = numbersIn(row.line || "");
  if (!nums.includes(p.kVA) || !nums.includes(p.kW)) return null;
  const kvaFirst = /kva\s*\/\s*kw(?!h)/i.test(head), kwFirst = /kw[e]?\s*\/\s*kva/i.test(head);
  for (const m of String(row.line).matchAll(/(\d+(?:\.\d+)?)\s*(?:k[vV][aA]|kw|KW|KVA)?\s*\/\s*(\d+(?:\.\d+)?)/g)) {
    const a = Number(m[1]), b = Number(m[2]);
    if (![a, b].includes(p.kVA) || ![a, b].includes(p.kW)) continue;
    if ((kvaFirst && !kwFirst && a < b) || (kwFirst && !kvaFirst && a > b)) return null;
  }
  return p;
}
// The one figure of a unit a requirement asks (e.g. "≥ 400 kVA / 320 kW"), null when it gives none or several, or a ceiling.
const oneFig = (t, re) => { const v = [...new Set([...String(t || "").matchAll(re)].map((m) => Number(m[1].replace(/\.(?=\d{3}\b)/g, "").replace(",", "."))))]; return v.length === 1 ? v[0] : null; };
const KVA_RE = /(\d[\d.,]*)\s*kVA\b/gi, KW_RE = /(\d[\d.,]*)\s*kWe?\b(?!\s*h)/gi;
const CEIL = /≤|<=|<|t[ốo]i\s*đa|kh[ôo]ng\s*(l[ớo]n|v[ưượ]t|qu[áa])/i;
// (d) Công suất prime / standby: the row's labeled column against the HSMT's minimum (a figure without ≥ is the minimum:
// Khoa 2026-11-01). An alternator's kVA is not this (alt_power stays a question to the supplier: #507).
export function powerChecks(c, reqs, row) {
  if (!row) return c;
  for (const r of reqs) {
    const rating = r.code === "power_prime" ? "prime" : r.code === "power_standby" ? "standby" : null;
    if (!rating || r.part !== "genset" || r.byCode) continue;
    const t = r.requirement || "", o = openCheck(c, r), p = o && ratedRowPower(row, rating);
    if (!p || CEIL.test(t)) continue;
    const kva = oneFig(t, KVA_RE), kw = oneFig(t, KW_RE);
    if (kva == null && kw == null) continue;
    if ((kva != null && p.kVA < kva) || (kw != null && p.kW < kw)) continue;
    putCheck(c, o.x, { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: `${figVi(p.kVA)} kVA / ${figVi(p.kW)} kW (cột ${rating === "prime" ? "Prime" : "Standby"} của dòng tổ máy)`, sourceQuote: row.line, part: "genset", level: r.level || "core", status: "met", byCode: true,
      note: `Code đọc cột ${rating === "prime" ? "Prime" : "Standby"} theo tiêu đề bảng (${figVi(p.kVA)} kVA / ${figVi(p.kW)} kW) và so với mức HSMT${kva != null ? ` ${figVi(kva)} kVA` : ""}${kw != null ? ` ${figVi(kw)} kW` : ""}.` });
  }
  return c;
}
// (a) Hệ số công suất: cosφ = P / S of one rating of the row (both figures in the line, the header naming the rating).
export function pfChecks(c, reqs, row) {
  if (!row) return c;
  const r = reqs.find((q) => q.code === "power_factor" && q.part === "genset" && !q.byCode), o = r && openCheck(c, r);
  if (!o) return c;
  const t = `${r.requirement || ""} ${r.quote || ""}`, m = t.match(/(≥|>=|tối\s*thiểu|min)?\s*(0[.,]\d{1,2})\b/i);
  if (!m || CEIL.test(r.requirement || "")) return c;
  const want = Number(m[2].replace(",", ".")), atLeast = !!m[1];
  for (const rating of ["prime", "standby"]) {
    const p = ratedRowPower(row, rating);
    if (!p) continue;
    const conv = { formula: "pf_from_kw_kva", inputs: [{ name: "P_kW", value: p.kW, from: "source" }, { name: "S_kVA", value: p.kVA, from: "source" }] }, v = CONV.compute(conv).value;
    if (!Number.isFinite(v) || !(atLeast ? v >= want - 0.005 : Math.abs(v - want) <= 0.005)) continue;
    const f = CONV.FORMULAS.pf_from_kw_kva;
    putCheck(c, o.x, { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: `cosφ = ${figVi(p.kW)} kW / ${figVi(p.kVA)} kVA = ${figVi(v, 3)} (${rating === "prime" ? "Prime" : "Standby"})`, sourceQuote: row.line, part: "genset", level: r.level || "core", status: "met", byCode: true,
      conversions: [{ ...conv, value: v, unit: f.unit, label: f.label, basis: f.basis }], note: `Code tính ${f.label} từ cột ${rating === "prime" ? "Prime" : "Standby"} của dòng tổ máy.${Math.abs(v - want) > 1e-9 ? ` ${figVi(v, 3)} khác ${figVi(want)} trong mức làm tròn số kVA của bảng (±0,005).` : ""}` });
    break;
  }
  return c;
}
// (b) Dòng điện định mức: I = S × 1000 / (√3 × U), S the row's prime kVA (standby when the requirement says so), U the
// line voltage the requirement or the HSMT's voltage requirement gives (one value, 300–500 V).
export function currentChecks(c, reqs, row) {
  if (!row) return c;
  const r = reqs.find((q) => q.code === "current" && q.part === "genset" && !q.byCode), o = r && openCheck(c, r);
  if (!o) return c;
  const t = r.requirement || "";
  if (CEIL.test(t)) return c;
  const amps = oneFig(t, /(\d[\d.,]*)\s*A\b/g);
  const vOf = (s) => [...new Set(voltsIn(s).filter((v) => v >= 300 && v <= 500))];
  let us = vOf(t);
  if (!us.length) { const vr = reqs.find((q) => q.code === "voltage"); us = vr ? vOf(`${vr.requirement || ""} ${vr.quote || ""}`) : []; }
  if (amps == null || us.length !== 1) return c;
  const rating = /standby|d[ựu]\s*ph[òo]ng/i.test(t) ? "standby" : "prime", p = ratedRowPower(row, rating);
  if (!p) return c;
  const conv = { formula: "current_3ph", inputs: [{ name: "S_kVA", value: p.kVA, from: "source" }, { name: "U_V", value: us[0], from: "hsmt" }] }, v = CONV.compute(conv).value;
  if (!Number.isFinite(v) || v < amps) return c;
  const f = CONV.FORMULAS.current_3ph;
  putCheck(c, o.x, { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: `I = ${figVi(p.kVA)} kVA × 1000 / (√3 × ${us[0]} V) = ${figVi(v, 1)} A`, sourceQuote: row.line, part: "genset", level: r.level || "core", status: "met", byCode: true,
    conversions: [{ ...conv, value: v, unit: f.unit, label: f.label, basis: f.basis }], note: `Code tính ${f.label} từ kVA ${rating === "prime" ? "Prime" : "Standby"} của dòng tổ máy và điện áp ${us[0]} V của HSMT, so với ${figVi(amps)} A.` });
  return c;
}
// (c) Tần số: the row / header / title writes 50 (60) Hz (stdChecks), or 1500 (1800) rpm and the alternator model's sheet
// (or its facts) gives 4 poles: n = 120 f / p (conversions rpm_from_poles). Not from a model name.
export function freqChecks(c, reqs, row, poles = []) {
  if (!row) return c;
  const r = reqs.find((q) => q.code === "frequency" && q.part === "genset" && !q.byCode), o = r && openCheck(c, r);
  if (!o) return c;
  const hz = Number((`${r.requirement || ""} ${r.quote || ""}`.match(/\b(50|60)\s*Hz/i) || [])[1]);
  const lines = [...(row.header || []), row.line || "", row.title || ""], all = lines.join(" ");
  if (!hz || /\b(50|60)\s*-?\s*Hz/i.test(all)) return c; // a row that writes its frequency is stdChecks'
  const rpm = hz === 50 ? 1500 : 1800, rl = lines.find((l) => new RegExp(`\\b${rpm}\\s*(rpm|r\\/min|rev\\/min|v\\/p|vòng)`, "i").test(l));
  const four = poles.filter((p) => Number(p.value) === 4), other = poles.filter((p) => Number(p.value) !== 4);
  if (!rl || !four.length || other.length) return c;
  const conv = { formula: "rpm_from_poles", inputs: [{ name: "f_Hz", value: hz, from: "hsmt" }, { name: "poles", value: 4, from: "source" }] }, v = CONV.compute(conv).value;
  if (Math.abs(v - rpm) > 0.5) return c;
  const f = CONV.FORMULAS.rpm_from_poles;
  putCheck(c, o.x, { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: `${hz} Hz: n = 120 × ${hz} / 4 cực = ${rpm} v/p`, sourceQuote: [rl, four[0].lines?.[0] || four[0].line].filter(Boolean).join(" | "), part: "genset", level: r.level || "core", status: "met", byCode: true,
    conversions: [{ ...conv, value: v, unit: f.unit, label: f.label, basis: f.basis }], note: `Code: dòng tổ máy ghi ${rpm} v/p, tờ hãng đầu phát ghi 4 cực; ${f.label}.` });
  return c;
}
// ---------- Thuộc tính đầu phát theo model (cfg-r3) ----------
// From the maker's technical data sheet of the configuration's own alternator model (RT.attr, by ratingsFor: the model as
// written, or its code with a make in front dropped; never a near name). Two sheets of the model that differ, or another
// source of the model giving the attribute differently (modelFacts), leave the check as it is. The sheet's line is the
// source quote. A point a sheet offers in two builds (1 / 2 bearings) or with one excitation system (the 300% short
// circuit of the S range: curves drawn for PMG) is "confirm" (order), with the build to choose.
const INS = "BFHC"; // IEC 60085 thermal classes in order: B 130 °C, F 155 °C, H 180 °C, C > 180 °C
const one = (attrs, key) => { const l = attrs.filter((a) => a.key === key); return l.length && new Set(l.map((a) => JSON.stringify(a.value))).size === 1 ? l[0] : null; };
const quoteOf = (a) => a.lines.join(" ");
export function altAttrChecks(c, reqs, attrs = [], facts = []) {
  if (!attrs.length) return c;
  const model = c.alternator?.model || "";
  const sheet = (a) => `tờ thông số ${a.model} của hãng (${a.supplierId} [${a.n}])`;
  const met = (r, o, a, offered, extra = "") => putCheck(c, o.x, { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered, sourceQuote: quoteOf(a), part: "alternator", level: r.level || "core", status: "met", byCode: true,
    sheetSrc: { supplierId: a.supplierId, n: a.n, url: a.url, lines: a.lines }, note: `Code đọc từ ${sheet(a)}.${extra}` });
  const confirm = (r, o, a, offered, why) => putCheck(c, o.x, { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered, sourceQuote: quoteOf(a), part: "alternator", level: r.level || "core", status: "confirm", confirm: "order", byCode: true,
    sheetSrc: { supplierId: a.supplierId, n: a.n, url: a.url, lines: a.lines }, note: `Code đọc từ ${sheet(a)}: ${why}` });
  const factsSay = (re) => facts.filter((f) => re.test(`${f.label || ""} ${f.key || ""}`));
  for (const r of reqs) {
    if (r.part !== "alternator" || r.byCode) continue;
    const o = openCheck(c, r);
    if (!o) continue;
    const t = `${r.item} ${r.requirement || ""}`, req = r.requirement || "";
    if (r.code === "alt_insulation") {
      const a = one(attrs, "insulation"), ls = [...req.matchAll(/(?:class|c[ấa]p|lo[ạa]i|c[áa]ch\s*đi[ệe]n)\s*([BFHC])\b/gi)].map((m) => m[1].toUpperCase());
      if (!a || !ls.length) continue;
      if (factsSay(/insul|cách điện|绝缘/i).some((f) => !new RegExp(`\\b${a.value}\\b`, "i").test(String(f.value).replace(/class/i, "")))) continue;
      const min = /t[ốo]i\s*thi[ểe]u|≥|tr[ởo]\s*l[êe]n|\bmin/i.test(req), ok = min ? INS.indexOf(a.value) >= Math.min(...ls.map((l) => INS.indexOf(l))) : ls.includes(a.value);
      if (ok) met(r, o, a, `Cấp ${a.value}`);
    } else if (r.code === "alt_thd") {
      const a = one(attrs, "thd"), m = req.match(/(?:≤|<=|<|t[ốo]i\s*đa|kh[ôo]ng\s*qu[áa])\s*(\d+(?:[.,]\d+)?)\s*%/i);
      if (!a || !m) continue;
      if (factsSay(/harmonic|thd|谐波/i).some((f) => !numbersIn(f.value).includes(a.value))) continue;
      if (a.value <= Number(m[1].replace(",", "."))) met(r, o, a, `< ${figVi(a.value, 1)}% (tải tuyến tính cân bằng)`);
    } else if (r.code === "alt_poles") {
      const a = one(attrs, "poles"), m = req.match(/\b(\d)\s*c[ựu]c\b/i);
      // Only a requirement that asks the pole count alone ("4 cực"; not "4 cực, 3 pha, 6 dây", not "từ trường quay").
      const rest = req.replace(/\b\d\s*c[ựu]c\b|s[ốo]\s*c[ựu]c|[:;,.()\s]/gi, "");
      if (a && m && !rest && a.value === Number(m[1])) met(r, o, a, `${a.value} cực`);
    } else if (r.code === "alt_bearing") {
      const a = one(attrs, "bearings"), n = /m[ộo]t\s*[ổo]|\b1\s*[ổo]|single\s*bearing/i.test(req) ? 1 : /hai\s*[ổo]|\b2\s*[ổo]|two\s*bearing|double\s*bearing/i.test(req) ? 2 : null;
      const rest = req.replace(/m[ộo]t|hai|\b[12]\b|[ổo]\s*(đ[ỡo]|bi)|single|two|double|bearings?|[:;,.()\s]/gi, "");
      if (a && n && !rest && a.value.includes(n)) confirm(r, o, a, `Có bản ${n} ổ đỡ (tờ hãng có cả 1 và 2 ổ đỡ)`, `model có cả bản 1 và 2 ổ đỡ, chọn bản ${n} ổ đỡ khi đặt hàng.`);
    } else if ((r.code === "other" || r.code === "alt_short_circuit") && /300\s*%/.test(t) && /\b10\s*(gi[âa]y|s\b|sec)/i.test(t) && !/qu[áa]\s*t[ốo]c/i.test(t)) {
      const a = one(attrs, "sc300");
      // A Leroy-Somer range sheet ("Short-circuit current | 300% (3 IN) : 10s", lsSheetAttrs): met when every excitation
      // column states it; "-" under SHUNT (LSA 40–47.3) → with AREP / PMG, chosen when ordering.
      if (a?.range) {
        // Mecc Alte (D2): "> 300% for up to 20 seconds" on every model of the range.
        if (a.value.all) met(r, o, a, a.value.s > 10 ? `> 300% trong ${a.value.s} giây (tờ hãng)` : "300% (3 IN) trong 10 giây (tờ hãng)");
        else confirm(r, o, a, "300% (3 IN) trong 10 giây với kích từ AREP / PMG (tờ hãng)", "tờ hãng ghi ngắn mạch 300% (3 IN) trong 10 giây cho kích từ AREP / PMG, không cho SHUNT; chọn kích từ AREP / PMG khi đặt hàng.");
      } else if (a) confirm(r, o, a, "300% trong 10 giây (tờ hãng)", "tờ hãng ghi đạt ngắn mạch duy trì 300% trong 10 giây, đường cong ngắn mạch vẽ cho kích từ riêng (PMG); chọn hệ kích từ PMG khi đặt hàng.");
    } else if (r.code === "alt_excitation") {
      // A Leroy-Somer range sheet's excitation systems (SHUNT / AREP / PMG): the one the HSMT asks among them → met when it
      // is the only one, else chosen when ordering.
      // Read from the requirement only: the item name ("Kích từ đầu phát (PMG / AREP)") is the code's label, not the ask.
      const a = one(attrs, "excitation"), want = [/\bPMG\b|nam\s*ch[âa]m\s*v[ĩi]nh\s*c[ửu]u|permanent\s*magnet/i.test(req) && "PMG", /\bAREP\b/i.test(req) && "AREP"].filter(Boolean);
      const has = a && want.filter((k) => a.value.includes(k));
      if (!has?.length || (want.length > 1 && !/ho[ặa]c|\bor\b|\//i.test(req) && has.length < want.length)) continue;
      if (a.value.length === 1) met(r, o, a, `Kích từ ${a.value[0]}`);
      else confirm(r, o, a, `Kích từ ${has.join(" / ")} (tờ hãng có ${a.value.join(" / ")})`, `tờ hãng có các kiểu kích từ ${a.value.join(" / ")}; chọn ${has.join(" / ")} khi đặt hàng.`);
    } else if (r.code === "alt_vreg" && one(attrs, "vreg")?.range) {
      // A Leroy-Somer range sheet's voltage regulation, one figure per excitation column ("± 0.5% | ± 0.25%"): all within
      // the HSMT's ± y% → met; only some → the AVR / excitation that gives it, chosen when ordering.
      const a = one(attrs, "vreg"), want = pctsIn(req).filter((v) => v > 0);
      if (!want.length) continue;
      const y = Math.min(...want);
      if (a.value.every((v) => v <= y)) met(r, o, a, `±${a.value.map(pctVi).join(" / ±")}%`);
      else if (a.value.some((v) => v <= y)) confirm(r, o, a, `±${a.value.filter((v) => v <= y).map(pctVi).join(" / ±")}% (tờ hãng ghi ±${a.value.map(pctVi).join(" / ±")}%)`, `ổn định điện áp ±${pctVi(y)}% chỉ với AVR / kích từ cho ±${pctVi(Math.min(...a.value))}%; chọn khi đặt hàng.`);
    } else if (r.code === "other" && /qu[áa]\s*t[ốo]c\b|overspeed/i.test(t)) {
      const a = one(attrs, "overspeed"), want = oneFig(req, /(\d[\d.,]{2,})\s*(?:v\/p|vòng|rpm|rev)?/gi);
      // Only the same figure: the HSMT's "≤ 2250" reads as the sheet's "MAXIMUM OVERSPEED 2250" in either sense.
      if (a && want === a.value) met(r, o, a, `Quá tốc độ tối đa ${figVi(a.value, 0)} v/p`);
    } else if (r.code === "alt_type") {
      // Each term of the requirement must be written on the sheet: self excited ("SELF EXCITED"), PMG, brushless
      // ("brushless"); "A hoặc B" is met by either. A term the code does not know (AREP, "từ trường quay", "xoay chiều") stops it.
      const T = [["brushless", /kh[ôo]ng\s*ch[ổo]i\s*than|\(?brushless\)?/gi], ["self_excited", /t[ựu]\s*k[íi]ch\s*t[ừu]|self[\s-]*excit\w*/gi], ["pmg", /\bPMG\b/gi]];
      let rest = req, alts = [];
      for (const part of req.split(/,|;|\bv[àa]\b/)) { const has = T.filter(([, re]) => new RegExp(re.source, "i").test(part)).map(([k]) => k); if (has.length) alts.push({ has, or: /ho[ặa]c|\bor\b/i.test(part) }); }
      for (const [, re] of T) rest = rest.replace(re, "");
      rest = rest.replace(/ho[ặa]c|\bor\b|\bv[àa]\b|[:;,.()/\s]/gi, "");
      if (rest || !alts.length) continue;
      const as = alts.map((g) => g.has.map((k) => one(attrs, k)).filter(Boolean)), ok = alts.every((g, i) => (g.or ? as[i].length > 0 : as[i].length === g.has.length));
      if (ok) { const a = as.flat()[0]; putCheck(c, o.x, { item: r.item, requirement: r.requirement, hsmtQuote: r.quote || "", offered: [...new Set(as.flat().map((x) => x.lines[0].replace(/^\|\s*|\s*\|\s*$/g, "").replace(/\s*\|\s*/g, ": ")))].join("; "), sourceQuote: [...new Set(as.flat().map(quoteOf))].join(" | "), part: "alternator", level: r.level || "core", status: "met", byCode: true,
        sheetSrc: { supplierId: a.supplierId, n: a.n, url: a.url, lines: a.lines }, note: `Code đọc từ ${sheet(a)}.` }); }
    }
  }
  return c;
}
// ---------- Datasheet một model của tổ máy (2026-11-13, IB2600601812) ----------
// From the configuration's own genset sheet (gensetSheetOf: tier A, one model, its genset), the code decides three points
// whose comparison is plain, each "met" only (a figure that falls short, or a check already met / not met, is left as it
// is, as the row checks above):
// - alt_vreg: every voltage regulation of the sheet (not a transient one) within the HSMT's ±y%;
// - alt_power: the alternator block's own output of the rating the HSMT asks (prime unless it says standby / tối đa) at
//   or above the HSMT's kVA;
// - genset_make: the configuration is the genset the HSMT names (named-genset.mjs namedHit), its sheet's supplier is a
//   genset maker of that make (NG.makerOf: name / brands of the record), and a line the record keeps of its own tier A
//   page names the make (the page that names the model). Nothing is read from the model name.
export function sheetChecks(c, reqs = [], { sheet = null, facts = [], named = null, hit = null, supOf = () => null } = {}) {
  if (!sheet) return c;
  const where = `datasheet tổ máy ${sheet.model} của hãng (${sheet.supplierId} [${sheet.n}])`;
  const put = (r, o, f, offered, part, extra = "") => putCheck(c, o.x, { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered, sourceQuote: f.line, part, level: r.level === "option" ? "option" : "core", status: "met", byCode: true, rule: "sheet",
    sheetSrc: { supplierId: sheet.supplierId, n: f.n ?? sheet.n, line: f.line }, note: `Code đọc từ ${f.n != null && f.n !== sheet.n ? `trang của hãng (${sheet.supplierId} [${f.n}])` : where}${f.block ? `, khối "${f.block}"` : ""}.${extra}` });
  for (const r of reqs) {
    if (r.byCode || r.unverified) continue;
    const req = `${r.requirement || ""} ${r.quote || ""}`;
    if (r.code === "alt_vreg") {
      const o = openCheck(c, r), want = pctsIn(req).filter((v) => v > 0);
      if (!o || !want.length || !(ceilOf(req) || /±/.test(req))) continue;
      const y = Math.min(...want), fs = facts.filter((f) => f.key === "vreg" && !TRANSIENT.test(`${f.label} ${f.line}`));
      const got = fs.map((f) => pctsIn(`${f.value} ${f.unit}`));
      if (!fs.length || got.some((g) => !g.length) || got.flat().some((v) => v > y)) continue;
      put(r, o, fs[0], `${fs[0].value} ${fs[0].unit}`.trim() + ` (${fs[0].label})`, "alternator");
    } else if (r.code === "alt_power") {
      const o = openCheck(c, r), m = req.match(/(\d+(?:[.,]\d+)?)\s*kVA/i);
      if (!o || !m || ceilOf(r.requirement || "")) continue;
      const lim = Number(m[1].replace(",", ".")), sb = /d[ựu]\s*ph[òo]ng|standby|t[ốo]i\s*đa/i.test(r.requirement || "");
      const fs = facts.filter((f) => f.key === "altKva" && (sb ? /standby|d[ựu]\s*ph[òo]ng/i.test(f.label) : /prime|continuous|li[êe]n\s*t[ụu]c/i.test(f.label)));
      const v = fs.map((f) => numbersIn(f.value)[0]).filter((x) => x != null);
      if (!v.length || v.length !== fs.length || new Set(v).size !== 1 || v[0] < lim) continue;
      put(r, o, fs[0], `${figVi(v[0])} kVA (${fs[0].label}, khối đầu phát)`, "alternator");
    } else if (r.code === "genset_make") {
      const o = openCheck(c, r), maker = supOf(sheet.supplierId);
      if (!o || !hit || !named?.make || !NG.makerOf(maker, named.make)) continue;
      const q = sheet.quotes.find((x) => NG.makesIn(x.line).some((y) => y.make === named.make));
      if (!q) continue;
      put(r, o, q, `${named.make} (tổ máy ${sheet.model}; nhà cung cấp ${maker.names?.en || maker.id} mang thương hiệu ${named.make})`, "genset",
        ` Hồ sơ nhà cung cấp là thương hiệu ${named.make}; trang đó ghi model ${sheet.model}.`);
    }
  }
  return c;
}
// ---------- Quy tắc B (cfg-r4, Khoa duyệt 11/11 "ok làm đi"): nguồn ghi khác nhau → theo tờ thông số chính hãng ----------
// A figure of the engine / alternator model that its sources give differently stays "unclear" (Khoa 04/11: never the
// majority), unless exactly one of the values comes from the part maker's own sheet of exactly that model (modelFacts
// `sheet`: a table of an engine_maker / alternator_maker supplier naming the model by its exact code; not a genset
// maker's or assembler's page, not a frame's sheet, never a name close to it). Then that value is compared with the
// HSMT: met / not met, with a note naming the sheet and the assemblers whose pages say otherwise (ids, no quote: #527).
// Two maker sheets that disagree, or no maker sheet, leave it "unclear". Only a check "unclear" (or none yet) changes;
// one met / not met stays. Only the codes whose comparison is plain (SHEET_CMP); others stay as they are.
const SHEET_KEY = { compression: "compr", displacement: "disp", cylinders: "cyl", governor: "gov", aspiration: "asp", alt_insulation: "insul", alt_efficiency: "eff" };
const SHEET_CLASS = (v) => (String(v).replace(/class/i, " ").match(/\b([BFHC])\b/i) || [])[1]?.toUpperCase() || null;
const figsOf = (t) => numbersIn(String(t || "").replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"));
const limOf = (req, drop = null) => { const v = [...new Set(figsOf(drop ? String(req).replace(drop, " ") : req))]; return v.length === 1 ? v[0] : null; };
const bound = (v, lim, req, bigger = true) => (v == null || lim == null ? null : ceilOf(req) ? v <= lim : floorOf(req) || bigger ? v >= lim : null);
// Each: (the maker's value, the HSMT requirement) → true met, false not met, null not compared.
const SHEET_CMP = {
  // A design value (not "the more the better"): compared under ≤ / ≥; a ratio the HSMT gives bare (comprExactOf) is the
  // exact one (Khoa 20/11/2026): the same figure, or one only rounded otherwise (roundCompat), met, another not met.
  compression: (v, req, exact = null) => {
    if (exact != null) { const x = comprFig(v); return x == null ? null : sameCompr(x, exact); }
    return ceilOf(req) || floorOf(req) ? bound(figsOf(v)[0], limOf(req, /:\s*1\b/g), req, false) : null;
  },
  displacement: (v, req) => { const n = figsOf(v)[0], cc = /cc|ml|cm3|cm³/i.test(v); return bound(n == null ? null : cc ? n / 1000 : n, limOf(req), req); },
  // The count only: a requirement that also asks the arrangement (thẳng hàng, chữ V) is not compared.
  cylinders: (v, req) => (/th[ẳa]ng\s*h[àa]ng|ch[ữu]\s*V|in-?\s*line|\bV\s?-?\d|\bL\s?\d/i.test(req) ? null : bound(figsOf(v)[0], limOf(req), req)),
  governor: (v, req) => { const el = /đi[ệe]n\s*t[ửu]|electr/i, me = /c[ơo]\s*kh[íi]|mechan/i, ve = /electr|\bECU\b|电子|电喷/i, vm = /mechan|机械/i;
    const want = el.test(req) && !me.test(req) ? "e" : me.test(req) && !el.test(req) ? "m" : null, got = ve.test(v) && !vm.test(v) ? "e" : vm.test(v) && !ve.test(v) ? "m" : null;
    return want && got ? want === got : null; },
  aspiration: (v, req) => { const want = /t[ăa]ng\s*[áa]p|turbo/i.test(req) && !/h[úu]t\s*kh[íi]\s*t[ựu]\s*nhi[êe]n|natural/i.test(req);
    const got = /turbo|增压|charged/i.test(v) ? true : /natural|自然|\bNA\b/i.test(v) ? false : null; return want && got != null ? got : null; },
  alt_insulation: (v, req) => { const ls = [...req.matchAll(/(?:class|c[ấa]p|lo[ạa]i|c[áa]ch\s*đi[ệe]n)\s*([BFHC])\b/gi)].map((m) => m[1].toUpperCase()), got = SHEET_CLASS(v);
    if (!ls.length || !got) return null; return /t[ốo]i\s*thi[ểe]u|≥|tr[ởo]\s*l[êe]n|\bmin/i.test(req) ? INS.indexOf(got) >= Math.min(...ls.map((l) => INS.indexOf(l))) : ls.includes(got); },
  alt_efficiency: (v, req) => (/%/.test(req) ? bound(figsOf(v)[0], limOf(req), req) : null),
};
const PART_OF_CODE = (code) => (code.startsWith("alt_") ? "alternator" : "engine");
export function makerSheetChecks(c, reqs, facts = {}, { hsmtCompr = null } = {}) {
  for (const r of reqs) {
    const exact = r.code === "compression" ? comprExactOf(r, hsmtCompr) : null;
    const key = SHEET_KEY[r.code], part = key && PART_OF_CODE(r.code);
    if (!key || r.byCode || (r.part && r.part !== part) || !c[part]?.model) continue;
    const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
    if (x && (x.status !== "unclear" || x.version || x.parts?.length)) continue;
    const list = (facts[part] || []).filter((f) => f.key === key);
    // Two values differ as factConflicts reads them (`disagree`: a class letter, a ratio x:1 by x); an insulation value
    // with more words than the class ("CLASS H, 125 °C rise") by its letter.
    const differ = (a, b) => (r.code === "alt_insulation" ? SHEET_CLASS(a) !== SHEET_CLASS(b) : norm(a) !== norm(b) && disagree(a, b));
    const sheets = list.filter((f) => f.sheet);
    if (!sheets.length || sheets.some((f) => sheets.some((g) => differ(f.value, g.value)))) continue;
    const others = list.filter((f) => !f.sheet && sheets.some((g) => differ(f.value, g.value)));
    if (!others.length) continue;
    // GENBID_SPEC_NORM=1: compression, displacement (litres as written; cc not converted) and the cylinder count from the
    // normalized figure of each sheet; one the layer cannot compare leaves the check as it is.
    const NK = { compression: [(n) => n.num, {}], displacement: [(n) => n.num, { unit: "L" }], cylinders: [(n) => n.count, {}] }[r.code];
    let vals = sheets.map((f) => f.value);
    if (NK && specNormOn(r.code === "displacement" ? "disp" : "other")) {
      const ns = sheets.map((f) => normFig(f, NORM_CTX.get(f), NK[1]));
      if (ns.some((n) => !n.ok || NK[0](n.r) == null)) continue;
      vals = ns.map((n) => String(NK[0](n.r)));
    }
    const v = vals.map((val) => SHEET_CMP[r.code](val, r.requirement || "", exact));
    if (v.some((b) => b == null) || new Set(v).size !== 1) continue;
    // A supplier of this very configuration (its rows' src, or among its suppliers) is one that writes otherwise: what it
    // delivers may be that other build (acepow-fuan offers WP10D320E200 both "Mechanically" and "Electronic"), so the
    // maker's sheet does not decide (điều phối 2026-11-11). Kept "unclear", with why.
    const own = new Set([...["engine", "alternator", "genset"].map((p) => c[p]?.src?.kind === "catalog" ? c[p].src.supplierId : null), ...(c.suppliers || []).map((s) => s.supplierId)].filter(Boolean));
    const mine = [...new Set(others.map((g) => g.supplierId).filter((id) => own.has(id)))];
    if (mine.length) {
      const why = `Code ghi: tờ thông số hãng (${sheets[0].supplierId} [${sheets[0].n}]) ghi khác nguồn của chính nhà cung cấp ${mine.join(", ")} trong cấu hình; nhà cung cấp có thể giao bản khác nên chưa theo tờ hãng, cần xác nhận.`;
      if (x) { x.makerBlocked = mine; if (!String(x.note || "").includes(why)) x.note = [x.note, why].filter(Boolean).join(" "); }
      continue;
    }
    const f = sheets[0], ids = [...new Set(others.map((g) => g.supplierId))];
    putCheck(c, x, { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: f.value, sourceQuote: f.line, factSrc: { supplierId: f.supplierId, n: f.n, line: f.line },
      part, level: r.level === "option" ? "option" : "core", status: v[0] ? "met" : "not_met", byCode: true, rule: "to-hang", makerOver: ids,
      note: `Code ghi: các nguồn ghi khác nhau; theo tờ thông số hãng (${f.supplierId} [${f.n}]); trang nhà lắp ráp ${ids.join(", ")} ghi khác.${exact != null ? ` ${COMPR_EXACT_NOTE(exact)}` : ""}` });
    if (x) delete x.conflict;
  }
  return c;
}
// ---------- Tỉ số nén ghi trơ = số chính xác, ở bước chấm (Khoa 20/11/2026) ----------
// The figure x of a compression value ("16.0:1", "16,5 : 1", "17", "14 : 01"), else null (two figures, words).
export function comprFig(v) {
  // The "1" of each ":1" dropped, the value must hold one figure only ("18.2–18.3:1", "16.5 / 17" are not one ratio).
  const s = String(v ?? "").replace(/(\d),(\d)/g, "$1.$2").replace(/(\d)\s*:\s*0?1(?![\d.])/g, "$1 ");
  const n = [...new Set((s.match(/\d+(?:\.\d+)?/g) || []).map(Number))];
  return n.length === 1 && n[0] >= 5 && n[0] <= 30 ? n[0] : null;
}
// The same figure, or one only rounded otherwise (14 / 14.0; 14 / 14.1 by roundCompat: the longer one rounds to the other
// and is within 1%). 13.6, 13.9 or 14.5 against 14 differ.
export const sameCompr = (a, b) => a === b || roundCompat(a, b);
const COMPR_EXACT_NOTE = (x) => `HSMT ghi tỉ số nén ${figVi(x)}:1 không kèm ≥ / ≤ / khoảng nên là số chính xác (Khoa 20/11/2026).`;
// The exact ratio a compression requirement asks: its requirement and quote give one figure bare (no ≥ / ≤ / tối thiểu /
// tối đa / khoảng / ± / "hoặc tốt hơn" / "nêu cụ thể") AND the code's own reading of the HSMT (comprOf: every line that
// gives it gives it bare, one figure) gives that same figure. Else null: the rule of a bare design figure stays (unclear).
export function comprExactOf(r, hsmtCompr) {
  if (!r || r.code !== "compression" || !hsmtCompr?.comprExact || hsmtCompr.compr == null) return null;
  const t = `${r.requirement || ""} ${rowNoOff(r.quote || "")}`;
  if (/[≥≤<>±~]|t[ốo]i\s*(thi[ểe]u|đa)|kho[ảa]ng|ho[ặa]c|tr[ởo]\s*l[êe]n|n[êe]u|ghi\s*r[õo]|tham\s*kh[ảa]o|t[ươ]+ng\s*(đ[ươ]+ng|t[ựu])|\bmin|\bmax/i.test(t)) return null;
  const xs = [r.requirement, rowNoOff(r.quote || "").replace(COMPR_LABEL, " ")].map((s) => comprFig(String(s || "").replace(/^[^\d]*/, ""))).filter((x) => x != null);
  return xs.length && xs.every((x) => sameCompr(x, hsmtCompr.compr)) ? hsmtCompr.compr : null;
}
// A configuration whose engine's every source gives a ratio other than the exact one → not met. Only a check "unclear"
// (or none) of a configuration with a catalog engine changes (a check met / not met by the agent or byCode stays). The
// sources: the engine model's facts (every supplier row and maker sheet naming it). Left as it is (unclear) when no
// source gives the ratio, when one gives a value the code cannot read, when the sources disagree among themselves
// (values not all one figure up to rounding: never the majority; exactly one maker sheet is makerSheetChecks'), or when
// the value is the HSMT's (up to rounding).
// The compression facts of an engine when they prove it is not the exact ratio, else null. One rule for the choice of
// candidates and for the check.
// Danh sách tường minh, không phải luật: tờ Koten KB700D5 (sources/koten-power/1028.md) ghi cùng một động cơ là
// "Baudouin 6M33G825/5" và "6M33G8D3/5", tỉ số nén 15.0:1; kaihua ghi "6M33G8D3/5 (6M33G825/5)".
export const COMPR_SAME = new Map([["6M33G8D3/5", "6M33G825/5"], ["6M33G8D3/5(6M33G825/5)", "6M33G825/5"]]);
// Nước NCC ghi ngay trước mã động cơ. Chỉ hai tiền tố có thật trong suppliers/cn (kaihua n122, soát mọi mã 21/11/2026).
// "(UK/EP)", "(USA/EU)", đuôi "EU" không đọc: không chắc là nơi sản xuất (EU có thể là tiêu chuẩn khí thải). SME = nhà máy
// Mitsubishi ở Thượng Hải (CN_PLANT của catalog).
const PLACE_MARKS = [[/^india\s+(?=\S)/i, "IN"], [/^uk\s+(?=\S)/i, "GB"], [/\s*\(\s*india\s*\)$/i, "IN"], [/\s*\(\s*uk\s*\)$/i, "GB"], [/\s+SME$/, "CN"]];
export const placeInModel = (cell) => { const s = String(cell || "").trim(); return PLACE_MARKS.find(([re]) => re.test(s))?.[1] || null; };
const placeCode = (cell) => PLACE_MARKS.reduce((s, [re]) => s.replace(re, ""), String(cell || "").trim());
// Nơi ghi trong ô động cơ của một dòng: ô "<nước> <mã>" / "<mã>(nước)" mà mã đúng là động cơ của bản ghi (khoá riêng hay đã gộp).
export function placeInRow(e, u) {
  const code = CAT.keyOf(placeCode(e?.model));
  // Bảng nhãn không có `line`: đọc dòng nhãn động cơ ("| Engine Model | S16R2-PTAW-C SME", superwatt).
  const lines = u?.line ? [u.line] : (u?.lines?.rows || []).filter((l) => /engine\s*model/i.test(l));
  for (const c of lines.flatMap((l) => CAT.cellsOf(l))) {
    const at = placeInModel(c);
    if (at && CAT.keyOf(placeCode(c)) === code && (at !== "CN" || /mitsubishi/i.test(e?.make || ""))) return at;
  }
  return null;
}
export function comprOff(facts, exact) {
  const list = (facts || []).filter((f) => f.key === "compr");
  if (!list.length) return null;
  const xs = list.map((f) => comprFig(f.value));
  if (xs.some((v) => v == null)) return null;
  const vals = [...new Set(xs)];
  if (vals.some((a) => vals.some((b) => !sameCompr(a, b)))) return null;
  return vals.some((v) => sameCompr(v, exact)) ? null : list;
}
export function comprChecks(c, reqs, facts = [], { hsmtCompr = null } = {}) {
  for (const r of reqs) {
    const exact = comprExactOf(r, hsmtCompr);
    if (exact == null || r.byCode || (r.part && r.part !== "engine") || !c.engine?.model) continue;
    const x = (c.checks || []).find((y) => norm(y.item) === norm(r.item));
    if (x && (x.status !== "unclear" || x.byCode || x.version || x.parts?.length)) continue;
    const list = comprOff(facts, exact);
    if (!list) continue;
    const f = list[0], shown = [...new Set(list.map((g) => String(g.value).trim()))].join(" / ");
    putCheck(c, x, { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: shown, sourceQuote: f.line, factSrc: { supplierId: f.supplierId, n: f.n, line: f.line },
      part: "engine", level: r.level === "option" ? "option" : "core", status: "not_met", byCode: true, rule: "ti-so-nen",
      note: `Code ghi: ${COMPR_EXACT_NOTE(exact)} Mọi nguồn của động cơ ${c.engine.model} ghi ${shown} (${[...new Set(list.map((g) => g.supplierId))].join(", ")}).` });
    if (x) delete x.conflict;
  }
  return c;
}
// ---------- Quy tắc Khoa duyệt 2026-11-11 ("ok, em làm 4 ý trên đi", qua điều phối) ----------
// (3) Kê khai: an HSMT requirement that only asks the bidder to state a point ("nêu cụ thể", "ghi rõ"...) with no threshold
//     (no sign, no figure) is answered by the supplier's papers: "cần chứng từ" (confirm, document). Not for the iso8528
//     class, the load step, the make / brand sync, nor an origin in a package filtered to G7 / G20 (rule 4).
// (1) Kích thước / khối lượng / độ ồn / nhiệt độ môi trường: when the configuration's own genset row gives no figure of
//     it, "xác nhận khi đặt hàng" (confirm, order): the canopy and the radiator are the assembler's choice. When the row
//     gives one: met when it meets the HSMT's limit, not met when it exceeds it, else (two builds on the row, another
//     distance, a ± band) unchanged. An HSMT figure with no ≤ / ≥ (copied from one model) is confirmed, with a note.
// (2) Quá tải 10%: met only when the row's header names its Prime (PRP) column and the HSMT asks no more than 10% for
//     1 hour in 12 (ISO 8528-1 defines the prime rating with that overload); anything else "xác nhận khi đặt hàng".
//     Not an overload the HSMT asks of the standby rating (clarifyOf asks the investor about it).
// A check met / not met (verified), a conflict of sources, or a configuration with no row of its own is left as it is.
const DECL = /n[êe]u\s*(r[õo]|c[ụu]\s*th[ểe])|ghi\s*r[õo]|k[êe]\s*khai|(nh[àa]\s*th[ầa]u|NCC)\s*(t[ựu]\s*)?(ghi|n[êe]u|đi[ềe]n)/i;
const DECL_SKIP = new Set(["iso8528_class", "load_step", "genset_make", "brand_sync", "power_prime", "power_standby"]);
const declOf = (r) => {
  const q = rowNoOff(r.quote || "").replace(/\((kg|mm|m|dB\s*\(?A\)?|°C|kW|kVA|L|lít)\)/gi, ""), t = `${r.requirement || ""} ${q}`;
  return DECL.test(t) && !/[≥≤<>±]|\d/.test(t.replace(DECL, "").replace(/\b(LxWxH|DxRxC|L\s*x\s*W\s*x\s*H|D\s*x\s*R\s*x\s*C)\b/gi, ""));
};
const SITE_CODES = { dimensions: "dims", weight: "weight", noise: "noise", ambient: null };
const RULE_NOTE = {
  order: "Code ghi: nguồn của cấu hình không ghi số này; kích thước, khối lượng, độ ồn, nhiệt độ làm việc phụ thuộc vỏ cách âm / két nước do nhà lắp ráp chọn khi đặt hàng (Khoa 11/11).",
  decl: "Code ghi: HSMT chỉ yêu cầu kê khai, không nêu ngưỡng; nhà cung cấp kê khai kèm chứng từ (Khoa 11/11).",
  prp: "Căn cứ ISO 8528-1: định mức Prime (PRP) cho phép quá tải 10% trong 1 giờ mỗi 12 giờ vận hành.",
  startCool: "Code ghi: nguồn của cấu hình không ghi điểm này; ắc quy, bộ sạc, két nước và quạt do nhà lắp ráp chọn theo đơn hàng (Khoa 11/11).",
  startCoolWhy: "ắc quy, bộ sạc, két nước, quạt chọn theo đơn hàng",
};
// (A, cfg-r4, Khoa 11/11) Khởi động / làm mát: the starting system (12 / 24 V DC starter, battery, charger) and the cooling
// (radiator, fan, water cooled) are chosen by the assembler for the order: a check "unclear" whose sources do not state
// it is "xác nhận khi đặt hàng". The row's figure key (web/catalog.js SPECS) and the words that state it on the row.
const START_COOL = {
  starting: ["start", /start|kh[ởo]i\s*đ[ộo]ng|đ[ềe]\s*(đi[ệe]n|\d)|ắc\s*quy|battery|charger|b[ộo]\s*s[ạa]c|启动|起动|蓄电池|\b(12|24)\s*V\s*(DC|D\.C)|\bDC\s*(12|24)\s*V/i],
  cooling: ["cooling", /cool|radiator|l[àa]m\s*m[áa]t|k[ée]t\s*n[ưư][ớo]c|qu[ạa]t|\bfan\b|冷却|水冷|风冷|水箱|散热/i],
};
// What an agent writes when its source says nothing: "Nguồn không ghi", "Chưa rõ", "Không có nguồn ghi", "" …
const NOT_STATED = /^$|^(ngu[ồo]n\s*)?(kh[ôo]ng|ch[ưu]a)\s*(c[óo]\s*(ngu[ồo]n\s*)?)?ghi[.\s]*$|^(ch[ưu]a|kh[ôo]ng)\s*r[õo][.\s]*$/i;
const AMBIENT_ROW = /ambient|nhi[ệe]t\s*đ[ộo]\s*m[ôo]i|°C|℃|环境/i;
const PRP_HEAD = /prime|\bPRP\b|主用|常用/i;
const ceilOf = (t) => /≤|<=|<|t[ốo]i\s*đa|kh[ôo]ng\s*(l[ớo]n|v[ưượ]t|qu[áa])|max/i.test(t);
const floorOf = (t) => /≥|>=|>|t[ốo]i\s*thi[ểe]u|kh[ôo]ng\s*(nh[ỏo]|th[ấa]p)|min|đ[ếe]n\s*\d/i.test(t);
const mmOf = (t) => { const n = numbersIn(String(t).replace(/(\d)\.(\d{3})\b/g, "$1$2")); return n.length >= 3 ? n.slice(0, 3).map((v) => (v < 20 ? v * 1000 : v)) : null; };
export function khoaRules(c, reqs, row, { origin } = {}) {
  // A confirm keeps what the check already offered and quoted (điều phối 2026-11-11: "3550 kg" of the agent was wiped).
  const set = (r, x, status, extra) => putCheck(c, x, { item: r.item, requirement: r.requirement || "", hsmtQuote: r.quote || "", offered: x?.offered || "", ...(x?.sourceQuote ? { sourceQuote: x.sourceQuote } : {}), part: r.part || "genset", level: r.level === "option" ? "option" : "core", status, byCode: true, ...extra });
  for (const r of reqs) {
    if (r.byCode) continue;
    const o = openCheck(c, r);
    if (!o) continue;
    const code = r.code || OTHER_CODE, req = r.requirement || "", t = `${req} ${r.quote || ""}`;
    // (3) kê khai
    if (!DECL_SKIP.has(code) && !(ORIGINS.has(code) && GROUP_ORIGIN.has(origin)) && declOf(r)) {
      set(r, o.x, "confirm", { confirm: "document", rule: "ke-khai", why: "HSMT yêu cầu kê khai", note: RULE_NOTE.decl });
      continue;
    }
    if (!row) continue;
    const head = [...(row.header || []), row.title || ""].join(" "), all = `${head} ${row.line || ""}`;
    // (A, cfg-r4) khởi động / làm mát
    if (code in START_COOL) {
      const [key, words] = START_COOL[code];
      // The source states it: the row (a figure of its own, or a word of it on the row, its header or the table title),
      // or the check already offers something (a quote, a figure, or words other than "the source does not say").
      const rowSays = (row.specs || []).some((s) => s.key === key) || words.test(all);
      const agentSays = !!o.x?.sourceQuote || /\d/.test(String(o.x?.offered || "")) || !NOT_STATED.test(String(o.x?.offered || "").trim());
      // A cooling requirement with the site temperature ("két nước 50 °C"): that part is the ambient rule's. Another
      // requirement asks it: there it is decided. None does: the row giving a temperature keeps this one as it is
      // (the ambient rule does not compare it), none given is confirmed with the radiator, as the ambient rule would.
      const temp = code === "cooling" && /°\s*C|℃|nhi[ệe]t\s*đ[ộo]|ambient/i.test(t);
      const ownTemp = temp && !reqs.some((q) => q !== r && q.code === "ambient");
      if (rowSays || agentSays || (ownTemp && AMBIENT_ROW.test(all))) continue;
      set(r, o.x, "confirm", { confirm: "order", rule: "khoi-dong-lam-mat", why: RULE_NOTE.startCoolWhy,
        note: `${RULE_NOTE.startCool}${temp ? (ownTemp ? " Nhiệt độ môi trường HSMT nêu cũng không có trên dòng tổ máy: xác nhận cùng két nước khi đặt hàng." : " Phần nhiệt độ môi trường xét ở mục nhiệt độ môi trường.") : ""}` });
      continue;
    }
    // (2) quá tải
    if (code === "overload") {
      if (/standby|d[ựu]\s*ph[òo]ng|\bESP\b/i.test(t)) continue;
      const pct = /\b110\s*%/.test(t) ? 10 : Number((t.match(/\b(\d{1,2})\s*%/) || [])[1]) || null;
      const dur = Number((t.match(/(\d{1,2})\s*(gi[ờo]|h\b|hour)/i) || [])[1]) || null;
      const per = Number((t.match(/m[ỗo]i\s*(?:chu\s*k[ỳy]\s*)?(\d{1,2})\s*(gi[ờo]|h\b)|(?:every|per|in)\s*(\d{1,2})\s*(h|hours?)\b/i) || []).slice(1).find((v) => /^\d+$/.test(v || ""))) || null;
      // Continuous (COP) allows no overload (ISO 8528-1): only a column the header names Prime / PRP (điều phối 2026-11-11).
      const prime = ratedRowPower(row, "prime"), prpHead = [...(row.header || []), row.title || ""].find((l) => PRP_HEAD.test(l)), cop = !!prime && !prpHead;
      const ok = prime && prpHead && pct != null && pct <= 10 && dur != null && dur <= 1 && per != null && per >= 12;
      if (ok) set(r, o.x, "met", { offered: `Định mức Prime ${figVi(prime.kVA)} kVA / ${figVi(prime.kW)} kW: quá tải 10% trong 1 giờ mỗi 12 giờ theo định nghĩa PRP`, sourceQuote: [prpHead, row.line].filter(Boolean).join(" | "), rule: "qua-tai", note: `Code ghi: dòng tổ máy ghi rõ cột Prime; HSMT đòi ${pct}% trong ${dur} giờ mỗi ${per} giờ. ${RULE_NOTE.prp}` });
      else set(r, o.x, "confirm", { confirm: "order", rule: "qua-tai", why: "quá tải theo định mức Prime", note: `Code ghi: ${cop ? "tiêu đề cột chỉ ghi Continuous / liên tục, không ghi Prime / PRP (định mức Continuous không cho quá tải theo ISO 8528-1)" : prime ? "HSMT đòi mức quá tải khác 10% trong 1 giờ / 12 giờ (hoặc code chưa đọc được)" : "dòng tổ máy không ghi rõ cột Prime"}; nhà cung cấp xác nhận khả năng quá tải khi đặt hàng. ${RULE_NOTE.prp}` });
      continue;
    }
    // (1) kích thước / khối lượng / độ ồn / nhiệt độ môi trường
    if (!(code in SITE_CODES)) continue;
    const key = SITE_CODES[code], specs = key ? (row.specs || []).filter((s) => s.key === key) : [];
    const has = specs.length > 0 || (code === "ambient" && /ambient|nhi[ệe]t\s*đ[ộo]\s*m[ôo]i|°C|℃|环境/i.test(all));
    const fixed = (code === "dimensions" || code === "weight") && !ceilOf(t) && !floorOf(t) && /\d/.test(req);
    const fixNote = fixed ? ` HSMT ghi ${code === "weight" ? "khối lượng" : "kích thước"} là số cố định (không có ≤ / ≥), có thể chép từ một model cụ thể.` : "";
    // The check already offers a figure (found in another source of the configuration): under a limit it stays "unclear".
    const agentFig = /\d/.test(String(o.x?.offered || ""));
    if (!fixed && !has && agentFig) continue;
    if (!has || fixed) {
      set(r, o.x, "confirm", { confirm: "order", rule: "vo-may", why: fixed ? "HSMT ghi số cố định" : "phụ thuộc vỏ / két nước chọn khi đặt hàng", note: `${has ? `Code ghi: dòng tổ máy có số (${specs.map((s) => `${s.label} ${s.value}`).join("; ")}) nhưng HSMT ghi số cố định nên không so được.` : fixed && agentFig ? "Code ghi:" : RULE_NOTE.order}${fixNote}` });
      continue;
    }
    // The row gives a figure: compare when it is one build (no open / canopy pair) and the HSMT gives a ceiling.
    if (specs.length !== 1 || /open|soundproof|silent|canopy|开架|静音|防音/i.test(head) || !ceilOf(t) || /±/.test(t)) continue;
    // The HSMT asks the canopied set ("có vỏ giảm âm") and the row does not say which build its figure is: unchanged.
    if (code !== "noise" && /v[ỏo]\s*(gi[ảa]m|c[áa]ch)\s*[âa]m|canopy|silent|soundproof|c[áa]ch\s*[âa]m/i.test(t) && !/silent|canopy|soundproof|enclos|静音|防音/i.test(`${all} ${specs[0].label}`)) continue;
    const s = specs[0];
    let ok = null, off = "";
    if (code === "weight") {
      const lim = oneFig(req, /(\d[\d.,]*)\s*kg\b/gi), v = numbersIn(s.value)[0];
      if (lim != null && v != null && /kg/i.test(`${s.label} ${s.value}`)) { ok = v <= lim; off = `${figVi(v)} kg (${s.label})`; }
    } else if (code === "dimensions") {
      const lim = mmOf(req), v = mmOf(s.value);
      if (lim && v && /mm/i.test(`${s.label} ${s.value} ${req}`)) { ok = v.every((x, i) => x <= lim[i]) ? true : v.some((x, i) => x > lim[i]) ? false : null; off = `${s.value} mm (${s.label})`; }
    } else if (code === "noise") {
      const lim = oneFig(req, /(\d{2,3}(?:[.,]\d)?)\s*dB/gi), dist = (req.match(/(\d{1,2})\s*m\b/) || [])[1], v = numbersIn(s.value)[0];
      if (lim != null && v != null && dist && new RegExp(`\\b${dist}\\s*m\\b`, "i").test(`${s.label} ${s.value}`)) { ok = v <= lim; off = `${figVi(v)} dB(A) (${s.label})`; }
    }
    // GENBID_SPEC_NORM=1: the same comparison on the normalized figure (normFig): kg / mm / dB(A) as the source writes
    // them, the size open or canopied as the source says (the canopied one when the HSMT asks it), the noise at the HSMT's
    // distance. Not comparable where the old reading compared → "Chưa rõ" with why.
    if (specNormOn("other")) {
      const old = ok, canopy = /v[ỏo]\s*(gi[ảa]m|c[áa]ch)\s*[âa]m|canopy|silent|soundproof|c[áa]ch\s*[âa]m/i.test(t) ? "enclosed" : null;
      let n = null;
      ok = null;
      if (code === "weight") {
        const lim = oneFig(req, /(\d[\d.,]*)\s*kg\b/gi);
        n = normFig(s, useNormCtx(row), { unit: "kg", enclosure: canopy });
        if (lim != null && n.ok && n.r.num != null) { ok = n.r.num <= lim; off = `${figVi(n.r.num)} kg (${s.label})`; }
      } else if (code === "dimensions") {
        const lim = mmOf(req);
        n = normFig(s, useNormCtx(row), { unit: "mm", enclosure: canopy });
        const d = n.ok && n.r.dims, v = d ? (d.asWritten || [d.L, d.W, d.H]) : null;
        if (lim && v && v.every((x) => x != null)) { ok = v.every((x, i) => x <= lim[i]) ? true : v.some((x, i) => x > lim[i]) ? false : null; off = `${s.value} mm (${s.label})`; }
      } else if (code === "noise") {
        const lim = oneFig(req, /(\d{2,3}(?:[.,]\d)?)\s*dB/gi), dist = Number((req.match(/(\d{1,2})\s*m\b/) || [])[1]) || null;
        n = normFig(s, useNormCtx(row), { unit: ["dB(A)", "dB"], distance: dist, measure: "LpA" });
        if (lim != null && dist && n.ok && n.r.num != null) { ok = n.r.num <= lim; off = `${figVi(n.r.num)} dB(A) (${s.label})`; }
      }
      if (ok == null && old != null) {
        set(r, o.x, "unclear", { offered: `${s.value} (${s.label})`, sourceQuote: row.line, rule: "chuan-hoa", note: `Code chưa so: số của dòng tổ máy ${n && !n.ok ? normWhyVi(n.why) : "không ra một số đủ đơn vị / điều kiện"} (lớp chuẩn hoá).` });
        continue;
      }
    }
    if (ok == null) continue;
    set(r, o.x, ok ? "met" : "not_met", { offered: off, sourceQuote: row.line, rule: "vo-may", note: `Code so số của dòng tổ máy với mức HSMT.` });
  }
  return c;
}
// Won goods behind each configuration (web/bidprice.js wonEvidence): lots of supply tenders whose won generator set
// names this engine model, this genset model, or this engine make at about this power. docs: { <TBMT>: bidhist }.
// Written on the configuration as counts (c.won), for rankConfigs' tie-break; the web reads the lots themselves live.
export function attachWon(result, docs, { kva = null, investorName = "", self = "" } = {}) {
  for (const c of result?.configs || []) {
    const e = BP.wonEvidence(docs, c, { kva, investorName, self });
    if (e.score) c.won = { model: e.model, genset: e.genset, make: e.make, sameInvestor: e.sameInvestor, score: e.score }; else delete c.won;
  }
  return result;
}
// Chỉ tiêu từng làm công ty bị loại kỹ thuật (Khoa duyệt 2026-11-12, cfg-bcdg): đọc từ các Báo cáo đánh giá E-HSDT, chỉ
// lý do về THÔNG SỐ linh kiện (lỗi soạn hồ sơ không thuộc đây). Cấu hình hạng 1–LOSS_RANKS mà HSMT có yêu cầu mã đó và
// check của mã đó chưa "đạt" (chưa rõ, không đạt, cần xác nhận / chứng từ, hoặc chưa có check) → `c.lossWarn`, một dòng
// mỗi chỉ tiêu, để web hiện riêng, không lẫn trong đống "chưa rõ". Không đổi status, không đổi điểm hay thứ hạng.
// `when(text)`: HSMT text of the requirement (item + requirement + quote + parts) that makes it this point.
// `sub`: the point is one function inside a grouped check (ngắn mạch in ctl_protection): only a part (or a check with no
// parts) that names it counts; the group's own status says nothing about it.
const SC_RE = /ng[ắa]n\s*m[ạa]ch|short\s*-?\s*circuit/i;
export const LOSS_RANKS = 3;
export const LOSS_CHECKS = [
  { code: "ctl_protection", item: "Bộ điều khiển: bảo vệ ngắn mạch", tender: "IB2500261097", why: "bộ điều khiển SmartGen HGM6120 không có cảnh báo, bảo vệ ngắn mạch", when: (t) => SC_RE.test(t), sub: SC_RE },
  { code: "alt_efficiency", item: "Hiệu suất đầu phát", tender: "IB2500438703", why: "đầu phát Stamford UCDI274K hiệu suất 92,8% < 93% ở 380/220 V" },
  { code: "fuel_consumption_50", item: "Tiêu hao nhiên liệu 50% tải", tender: "IB2600483082", why: "tiêu hao nhiên liệu Prime ở 50% tải không đáp ứng" },
  // Not "lưu lượng / nhiệt độ khí thải" (exhaust) that an old result coded emission.
  { code: "emission", item: "Tiêu chuẩn khí thải", tender: "IB2600365013", why: "không đáp ứng khí thải ≥ Euro 4 / Stage IV / Tier 4", when: (t) => /euro|tier|stage|qcvn|tcvn|\bEPA\b|emission|ti[êe]u\s*chu[ẩa]n/i.test(t) && !/l[ưư]u\s*l[ưư][ợo]ng|nhi[ệe]t\s*đ[ộo]\s*kh[íi]/i.test(t) },
  { code: "alt_standard", item: "Tiêu chuẩn đầu phát", tender: "IB2400104800", why: "đầu phát theo VDE 0530, HSMT đòi VDE 0875" },
  { code: "alt_power", item: "Công suất đầu phát", tender: "IB2500211376", why: "đầu phát Marelli MJB160 SA4 tối đa 16,2 kVA < 20 kVA Prime" },
  { code: "ctl_display_lang", item: "Bộ điều khiển hiển thị tiếng Việt", tender: "IB2500371475", why: "bộ điều khiển không thể hiện cài đặt tiếng Việt", when: (t) => /ti[ếe]ng\s*vi[ệe]t|vietnam/i.test(t) },
];
const LOSS_LABEL = { not_met: "Không đạt", unclear: "Chưa rõ", missing: "Chưa kiểm", order: "Cần xác nhận khi đặt hàng", document: "Cần chứng từ khi nộp" };
const reqTextOf = (r) => [r.item, r.requirement, r.quote, ...(r.parts || []).map((p) => `${p.item || ""} ${p.requirement || ""}`)].filter(Boolean).join(" ");
export function lossWarnOf(c, reqs = []) {
  const out = [];
  for (const L of LOSS_CHECKS) {
    const want = (reqs || []).filter((r) => !r.byCode && codeOf(r) === L.code && (!L.when || L.when(reqTextOf(r))));
    if (!want.length) continue;
    // A check by its own code, else by the item of the requirement (as confirmChecks): a check rarely carries its code,
    // and codeOf of an item alone can differ ("Ngôn ngữ, màn hình bộ điều khiển" reads ctl_measure).
    const items = new Set(want.map((r) => norm(r.item)));
    const xs = (c.checks || []).filter((x) => (x.code ? x.code === L.code : items.has(norm(x.item)) || codeOf(x) === L.code));
    let pts = xs;
    if (L.sub) pts = xs.flatMap((x) => (x.parts?.length ? x.parts.filter((p) => L.sub.test(`${p.item || ""} ${p.requirement || ""}`)) : L.sub.test(`${x.item || ""} ${x.requirement || ""}`) ? [x] : []));
    let status;
    if (!pts.length) status = (c.checks || []).some((x) => x.byCode && x.item === NO_CONTROLLER && x.status === "not_met") && L.code.startsWith("ctl_") ? "not_met" : "missing";
    else if (pts.some((p) => p.status === "not_met")) status = "not_met";
    else if (pts.every((p) => p.status === "met" && !p.unverified)) continue;
    else if (pts.some((p) => p.status !== "confirm")) status = "unclear";
    else status = pts.some((p) => p.confirm === "document") ? "document" : "order";
    out.push({ code: L.code, item: L.item, status, label: LOSS_LABEL[status], tender: L.tender, why: L.why });
  }
  return out;
}
export { variantFamily };
// Biến thể cùng động cơ (Khoa 18/11/2026, IB2600612866: D1105 / D1105-BG / D1105-E2BG / -CHN / -CHN-1): "nếu giống nhau
// về mặt thông số thì chọn 1 trong nhiều, nếu khác thì chỉ chọn cái có thông số phù hợp". A family is variantFamily with
// scope "version" (Khoa, câu 4 (b): only version suffixes BG / E2BG / CHN…, never rating suffixes G3 / G4, TAG2A / TAG3A).
// "Thông số" is what the checks of the engine say against the HSMT (the figures the sources give of two variants differ
// by which suppliers list them, not by the engine): in a family, a variant with an engine check not met goes when another
// one has none; two variants whose engine checks read the same (item and status) and with the same alternator are one
// configuration: the better ranked stays and takes the other's suppliers. Two variants failing different points both
// stay. A configuration kept from Tìm NCC or of the genset the HSMT names never goes. `list` is sorted best first.
function variantRule(list) {
  const famOf = (c) => (c.engine?.model ? variantFamily(c.engine.model) : "");
  const engChecks = (c) => (c.checks || []).filter((x) => x.part === "engine");
  const bad = (c) => engChecks(c).some((x) => x.status === "not_met");
  const sig = (c) => engChecks(c).map((x) => `${norm(x.item)}=${x.status}`).sort().join("|");
  const keep = (c) => c.keptFind || c.named;
  const ek = (c) => CAT.keyOf(c.engine?.model || ""), ak = (c) => CAT.keyOf(c.alternator?.model || "");
  const goneFor = new Map();
  for (const { c } of list) {
    const f = famOf(c);
    if (!f || keep(c)) continue;
    const others = list.map((x) => x.c).filter((o) => o !== c && famOf(o) === f && ek(o) !== ek(c) && !goneFor.has(o));
    if (!others.length) continue;
    if (bad(c) && others.some((o) => !bad(o))) { goneFor.set(c, null); continue; }
    const first = others.find((o) => list.findIndex((x) => x.c === o) < list.findIndex((x) => x.c === c) && ak(o) === ak(c) && sig(o) === sig(c));
    if (first) goneFor.set(c, first);
  }
  for (const [c, to] of goneFor) {
    if (!to) continue;
    const ids = new Set((to.suppliers || []).map((s) => s.supplierId));
    for (const s of c.suppliers || []) if (!ids.has(s.supplierId) && (to.suppliers || []).length < 3) { to.suppliers = [...(to.suppliers || []), s]; ids.add(s.supplierId); }
  }
  return list.filter(({ c }) => !goneFor.has(c));
}
export function rankConfigs(result) {
  const out = rankConfigsOf(result);
  // A configuration dropped here takes its marks with it.
  if ((result.notes || []).some((n) => MARK_NOTE.test(n))) syncMarkNote(result);
  return out;
}
function rankConfigsOf(result) {
  const reqs = result.requirements || [];
  for (const c of result.configs || []) noController(c, reqs);
  const cmp = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
  let list = (result.configs || []).map((c, i) => ({ c, i, s: scoreOf(c, reqs) }));
  // Same score: an engine of a Chinese make first (Khoa, 2026-11-05). Under G7 / G20 / Khác there is none.
  const cnOf = (c) => (c.engine?.model && CAT.originIn(`${c.engine.model} ${c.engine.make || ""}`, c.engine.model) === "cn" ? 0 : 1);
  // Still equal: the configuration with more won lots behind it first (attachWon, 2026-11-10). Only a tie-break: the
  // requirement checks and Khoa's order above decide first, and most configurations have no won lot at all.
  const wonOf = (c) => c.won?.score || 0;
  // The genset the HSMT names first (named-genset.mjs: its model, then its make), then the equivalents; nothing changes
  // for a tender that names none (no result.named).
  const nr = (c) => (result.named ? NG.namedRank(c) : 0);
  // Same score: a controller without a module the code added before one with it (bdk-mo-dun PR 2, Khoa 20/11/2026).
  const modOf = (c) => (c.controller?.modules?.length ? 1 : 0);
  list.sort((x, y) => nr(x.c) - nr(y.c) || cmp(x.s, y.s) || modOf(x.c) - modOf(y.c) || cnOf(x.c) - cnOf(y.c) || wonOf(y.c) - wonOf(x.c) || (x.c.rank ?? x.i) - (y.c.rank ?? y.i) || x.i - y.i);
  list = variantRule(list);
  // One configuration per engine + alternator + controller (2026-11-06 audit: a run gave five rows of one 6BTAA5.9-G12,
  // one supplier each): a later row of the same models (or with no controller of its own) hands its suppliers to the
  // first and goes; and at most 3 rows per engine, so several engines are shown.
  const traitMk = String(result.engineTrait?.make || "").trim().toLowerCase();
  const seen = new Map(), perEngine = new Map(), perMake = new Map(), ctlKey = (c) => (c.controller?.model ? CAT.keyOf(ctlModelOf(c.controller) || c.controller.model) : "");
  // The same engine with the alternator a supplier offers and with one of the maker's sheets (fromMaker, dau-phat-hang B;
  // Khoa 20/11/2026: "vì sao không thể giữ lại cả 2 cấu hình nếu phù hợp?"): one place of the per-make ceiling, the later
  // one shown right under the earlier. Nothing is added: the configurations were already cut to MAX_CONFIGS in check.
  const kept = [], pairOf = new Map();
  const offered = (c) => !!c.alternator?.model && !c.alternator.fromMaker;
  list = list.filter(({ c }) => {
    const ek = CAT.keyOf(c.engine?.model || ""), k = `${ek}|${CAT.keyOf(c.alternator?.model || "")}`;
    if (!ek) return true;
    const first = (seen.get(k) || []).find((f) => !ctlKey(c) || !ctlKey(f) || ctlKey(f) === ctlKey(c));
    if (first) {
      const ids = new Set((first.suppliers || []).map((s) => s.supplierId));
      for (const s of c.suppliers || []) if (!ids.has(s.supplierId) && (first.suppliers || []).length < 3) { first.suppliers = [...(first.suppliers || []), s]; ids.add(s.supplierId); }
      if (!first.controller?.model && c.controller?.model) first.controller = c.controller;
      return false;
    }
    // At most 2 per engine make (Khoa, 2026-11-11), so another make gets the place of a third (perMakeConfigs: 1 for
    // ONE_CONFIG_MAKES, 3 for Baudouin).
    const mk = String(c.engine?.make || "").split("/")[0].trim().toLowerCase();
    // A configuration kept from Tìm NCC (keepFound) is outside that limit: Khoa wants it back, whatever else the run found.
    // So is the make of an engine term the HSMT gives (Đặc thù hãng động cơ, Khoa 18/11/2026: "chỉ gợi ý hãng đó và bỏ
    // trần 2 cấu hình cho hãng đó"; check has already left only that make).
    // Hai bản bộ điều khiển (Khoa 21/11/2026): the copy with the controller a supplier offers and the configuration it was made
    // from are one place too, whichever ranks first.
    const twinOf = (a, b) => !!a.ctlTwin && CAT.keyOf(a.ctlTwin.of || "") === ctlKey(b);
    const ctlMate = kept.find((o) => !pairOf.has(o) && ![...pairOf.values()].includes(o) && `${CAT.keyOf(o.engine?.model || "")}|${CAT.keyOf(o.alternator?.model || "")}` === k && (twinOf(c, o) || twinOf(o, c)));
    const mate = ctlMate || ((c.alternator?.fromMaker || offered(c)) && kept.find((o) => !pairOf.has(o) && ![...pairOf.values()].includes(o) && CAT.keyOf(o.engine?.model || "") === ek && (c.alternator?.fromMaker ? offered(o) : !!o.alternator?.fromMaker)));
    if (!mate && mk && mk !== traitMk && !c.keptFind && !c.named && (perMake.get(mk) || 0) >= perMakeConfigs(mk)) return false;
    seen.set(k, [...(seen.get(k) || []), c]);
    perEngine.set(ek, (perEngine.get(ek) || 0) + 1);
    if (perEngine.get(ek) > 3) return false;
    if (mate) pairOf.set(c, mate);
    else if (mk && !c.keptFind) perMake.set(mk, (perMake.get(mk) || 0) + 1);
    kept.push(c);
    return true;
  });
  // The second of a pair right under the first.
  for (const [c, mate] of pairOf) {
    const from = list.findIndex((x) => x.c === c), item = list.splice(from, 1)[0];
    // Of the two controller versions, the one the agent checked (the lowest that meets the HSMT) stays above its copy.
    list.splice(list.findIndex((x) => x.c === mate) + (mate.ctlTwin ? 0 : 1), 0, item);
  }
  result.configs = list.map(({ c }, i) => {
    // Suppliers: one offering both the engine (its checked row names it) and the controller first, then one whose
    // row names the engine, then the genset row's own supplier, one whose row names the alternator, then the agent's
    // order (confidence, role).
    const sup = (c.suppliers || []).map((s, j) => ({ s, k: [!s.unverified && s.hasController ? 0 : 1, s.unverified ? 1 : 0, c.genset?.src?.supplierId === s.supplierId ? 0 : 1, s.hasAlternator ? 0 : 1, j] }));
    sup.sort((x, y) => cmp(x.k, y.k));
    const out = { ...c, rank: i + 1, suppliers: sup.map((x) => x.s) };
    out.rfq = rfqOf(out, reqs);
    const warn = out.rank <= LOSS_RANKS ? lossWarnOf(out, reqs) : [];
    if (warn.length) out.lossWarn = warn; else delete out.lossWarn;
    return out;
  });
  return result;
}

// ---------- add internet finds to the catalog ----------
// newCatalog.json (agent, only after an internet search): supplier records in the schema.json shape whose sources
// point at pages saved with `save` (web/<k>.txt). For a supplier already in the system only its new sources,
// productLines and specTables are added. Sources are renumbered after the record's own (from 2001) and the saved
// page becomes sources/<id>/<n>.md, the way fetch-source.mjs writes it (Khoa, 2026-10-29).
// A page of a seller (tier C and not on its make's own domain, Khoa 2026-11-12: a reseller, a marketplace) is no source of the
// catalog: it is left out here with its reason, and what rests on it alone (tables, lines, controllers, strengths) with it.
// `keepSeller` lets the caller keep them (nothing passes it today).
export const sellerPage = (s) => s.tier === "C" && !s.official;
// `names` as schema.json has it ({ en, zh, brands }). An agent wrote a list (["KUBOTA Corporation"], 2026-11-17) or a
// plain string: a name in Chinese characters is zh, the first other one en.
export function namesOf(n) {
  if (n && typeof n === "object" && !Array.isArray(n)) return n;
  const list = (Array.isArray(n) ? n : [n]).map((x) => String(x ?? "").trim()).filter(Boolean);
  const zh = list.find((x) => /[一-鿿]/.test(x)), en = list.find((x) => !/[一-鿿]/.test(x));
  return { ...(en ? { en } : {}), ...(zh ? { zh } : {}) };
}
// The supplier already in the system that an entry with a new id is (Khoa 2026-11-18: Gợi ý cấu hình IB2600612866 added
// "kubota" next to "kubota-japan", same generator.kubota.com): the one record of the same country whose website has the
// same host (www. aside), `website` or one of `otherWebsites`. Same host in another country is another company (perkins
// GB / perkins-wuxi CN). Names are not matched: a company with two sites is one record with otherWebsites (kaihua-genset).
const hostOf = (u) => { try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; } };
export function sameSupplier(e, existing) {
  const h = hostOf(String(e?.website || "").trim());
  if (!h || !e?.country) return null;
  const hits = [...existing.values()].filter((s) => s?.id && s.country === e.country && [s.website, ...(s.otherWebsites || [])].some((w) => w && hostOf(w) === h));
  return hits.length === 1 ? hits[0] : null;
}
export function catalogRecords(entries, { existing, readWeb, today, keepSeller = false }) {
  const out = [];
  for (const e of Array.isArray(entries) ? entries : []) {
    const asked = String(e?.id || "");
    if (!/^[a-z0-9-]+$/.test(asked)) { out.push({ id: asked, error: "id không hợp lệ" }); continue; }
    // `from`: the id the agent wrote, when the entry went into the record it duplicates (result.json still names it).
    const same = existing.has(asked) ? null : sameSupplier(e, existing), id = same ? same.id : asked, from = same ? { from: asked } : {};
    const old = existing.get(id) || null, files = {}, nmap = new Map(), sources = [], skippedSources = [], gone = new Set();
    const self = old || { id, role: e.role, website: e.website || null, names: namesOf(e.names), sources: [] };
    const pool = [...existing.values(), ...(old ? [] : [self])];
    // 2001–2999: pages of internet finds; 3001–3999 belong to controllers.mjs --crawl.
    let next = Math.max(2000, ...(old?.sources || []).map((s) => s.n).filter((n) => n < 3000)) + 1, error = "";
    for (const s of e.sources || []) {
      const txt = /^web\/\d+\.txt$/.test(s.file || "") ? readWeb(s.file) : null;
      if (!txt) { error = `nguồn ${s.n}: không có trang đã lưu ${s.file}`; break; }
      const [, url = "", accessed = ""] = txt.match(/^URL:\s*(\S+)\s*\nAccessed:\s*(\S+)/) || [];
      const official = MEMO.isOfficial(url, self, pool);
      if (!keepSeller && sellerPage({ tier: s.tier, official })) { gone.add(Number(s.n)); skippedSources.push({ url, why: "trang bên bán / không chính hãng (tier C), không đưa vào danh mục" }); continue; }
      const n = next++, file = `sources/${id}/${n}.md`;
      nmap.set(Number(s.n), n); files[file] = txt;
      sources.push({ n, url, accessedAt: accessed, tier: s.tier, quote: s.quote, file });
    }
    // `official` (Khoa 2026-11-12): the page is on the domain of this record's make (web-memo.mjs), computed by code,
    // never the agent's; written for the record, not yet used to weigh the source.
    if (!error) for (const s of sources) s.official = MEMO.isOfficial(s.url, self, pool);
    if (error) { out.push({ id, ...from, error }); continue; }
    if (skippedSources.length && !sources.length) { out.push({ id, ...from, error: `không đưa vào danh mục: mọi nguồn là trang bên bán / không chính hãng (tier C): ${skippedSources.map((x) => x.url).join(", ")}`, skippedSources }); continue; }
    // What rests only on a page left out goes with it; a reference to a page that was never saved stays -1 for verify.mjs.
    const onlyGone = (src) => { const l = Array.isArray(src) ? src : src == null ? [] : [src]; return l.length > 0 && l.every((n) => gone.has(Number(n))); };
    const re = (src) => (Array.isArray(src) ? src.filter((n) => !gone.has(Number(n))).map((n) => nmap.get(Number(n)) ?? -1) : src);
    const keepRef = (x) => !onlyGone(x?.src);
    let droppedParts = 0;
    const fil = (list, pred) => (list || []).filter((x) => (pred(x) ? true : (droppedParts++, false)));
    const lines = fil(e.productLines, (p) => keepRef(p) && !onlyGone(p.power?.src)).map((p) => ({ ...p, src: re(p.src), ...(p.power ? { power: { ...p.power, src: re(p.power.src) } } : {}) }));
    const tables = fil(e.specTables, (t) => !gone.has(Number(t.n))).map((t) => ({ ...t, n: nmap.get(Number(t.n)) ?? -1 }));
    const ctrls = fil(e.controllers, keepRef).map((c) => ({ brand: c.brand, model: c.model || null, text: c.text, line: c.line, src: re(c.src) }));
    const rec = old
      ? { ...old, sources: [...old.sources, ...sources], productLines: [...(old.productLines || []), ...lines], specTables: [...(old.specTables || []), ...tables], ...(ctrls.length ? { controllers: [...(old.controllers || []), ...ctrls] } : {}), checkedAt: today }
      : { country: e.country, role: e.role, status: "partial", names: namesOf(e.names), website: e.website || null, hq: e.hq || { province: null, city: null },
        founded: null, relatedIds: [], strengths: fil(e.strengths, keepRef).map((x) => ({ ...x, src: re(x.src) })), productLines: lines,
        certifications: fil(e.certifications, keepRef).map((x) => ({ ...x, src: re(x.src) })), exportMarkets: [], missing: e.missing || [],
        sources, confidence: e.confidence, checkedAt: today, checkedBy: "config-bot", specTables: tables, ...(ctrls.length ? { controllers: ctrls } : {}), id };
    out.push({ id, ...from, rec, files, nmap, isNew: !old, tables: tables.length, ...(skippedSources.length ? { skippedSources, droppedParts } : {}) });
  }
  return out;
}

const gitRun = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
// Writes the records into a fresh worktree of the repo (origin/main), checks them with that tree's verify.mjs, posts
// the ones that pass to the web as supplier/<id> and opens a pull request with them (records, saved pages).
// opts (Tìm NCC): its own branch and PR title, so a Gemini round and a Claude round never share a branch.
// The repo is private on the Free plan, so GitHub auto-merge is off. A detached process waits for CI on the PR and
// squash-merges it when every check passes; a failed check leaves the PR open. The run does not wait for it.
function mergeWhenGreen(pr, cwd) {
  const gh = process.env.GENBID_GH || "gh";
  const code = `const { spawnSync } = require("node:child_process"), [gh, pr] = process.argv.slice(1);
setTimeout(() => {
  const opt = { stdio: "ignore", windowsHide: true };
  if (spawnSync(gh, ["pr", "checks", pr, "--watch", "--fail-fast", "--interval", "20"], opt).status === 0)
    spawnSync(gh, ["pr", "merge", pr, "--squash", "--delete-branch"], opt);
}, 30000);`;
  try { spawn(process.execPath, ["-e", code, gh, pr], { cwd: os.tmpdir(), detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch {}
}

// opts.io (tests; every default is what the bot uses): git(cwd, ...args), post(rows) to the web, gh(args, cwd) → its
// output, merge(pr, cwd) the CI watcher, repo the checkout the worktree is made from.
export async function addToCatalog(dir, key, suppliers, opts = {}) {
  const file = path.join(dir, "newCatalog.json");
  if (!fs.existsSync(file)) return { added: [], records: [] };
  const { git = gitRun, post: send = post, gh = (args, cwd) => execFileSync(process.env.GENBID_GH || "gh", args, { cwd, encoding: "utf8" }), merge = mergeWhenGreen } = opts.io || {};
  const repo = opts.io?.repo || process.env.GENBID_REPO_DIR || path.join(ROOT, ".."), branch = opts.branch || `catalog/${key.toLowerCase()}`;
  const wt = path.join(os.tmpdir(), "genbid-catalog", branch.replace(/[^\w-]+/g, "-"));
  const title = opts.title || `Danh mục: bổ sung từ Gợi ý cấu hình ${key}`;
  const body = opts.body || `Tìm trên internet khi Gợi ý cấu hình gói ${key} không có nhà cung cấp phù hợp trong hệ thống. Bản ghi đã qua verify.mjs và đã đăng lên web.`;
  fs.rmSync(wt, { recursive: true, force: true });
  git(repo, "fetch", "-q", "origin", "main");
  git(repo, "worktree", "add", "-f", "-B", branch, wt, "origin/main");
  const added = [], records = [];
  try {
    const { checkRecord } = await import(pathToFileURL(path.join(wt, "suppliers", "verify.mjs")).href + `?${Date.now()}`);
    // The repo copy of a record comes with its saved pages, which verify.mjs reads.
    const existing = new Map(suppliers.map((s) => [s.id, s])), cnDir = path.join(wt, "suppliers", "cn");
    for (const f of fs.readdirSync(cnDir).filter((f) => f.endsWith(".json"))) existing.set(f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8")));
    const readWeb = (f) => { const p = path.join(dir, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
    for (const x of catalogRecords(JSON.parse(fs.readFileSync(file, "utf8")), { existing, readWeb, today: new Date().toISOString().slice(0, 10), keepSeller: !!opts.keepSeller })) {
      if (x.error) { added.push({ supplierId: x.id, error: x.error, ...(x.skippedSources ? { skippedSources: x.skippedSources } : {}) }); continue; }
      for (const [f, txt] of Object.entries(x.files)) { fs.mkdirSync(path.dirname(path.join(wt, "suppliers", f)), { recursive: true }); fs.writeFileSync(path.join(wt, "suppliers", f), txt, "utf8"); }
      const recFile = path.join(wt, "suppliers", "cn", `${x.id}.json`);
      const { errors } = checkRecord(x.rec, recFile);
      if (errors.length) {
        for (const f of Object.keys(x.files)) fs.rmSync(path.join(wt, "suppliers", f), { force: true });
        added.push({ supplierId: x.id, error: `verify.mjs: ${errors.slice(0, 4).join("; ")}${errors.length > 4 ? ` (+${errors.length - 4})` : ""}` });
        continue;
      }
      fs.writeFileSync(recFile, JSON.stringify(x.rec, null, 2) + "\n", "utf8");
      records.push(x.rec);
      added.push({ supplierId: x.id, ...(x.from ? { from: x.from } : {}), name: x.rec.names?.en || x.rec.names?.zh || x.id, isNew: x.isNew, tables: x.tables, nmap: Object.fromEntries(x.nmap), ...(x.skippedSources ? { skippedSources: x.skippedSources, droppedParts: x.droppedParts } : {}) });
    }
    // GENBID_CATALOG_DRY=1: check only, nothing is posted or pushed.
    if (records.length && !process.env.GENBID_CATALOG_DRY) {
      await send(records.map((r) => ({ coll: "supplier", id: r.id, data: r })));
      try {
        git(wt, "add", "-A", "suppliers");
        git(wt, "-c", `user.name=${process.env.GENBID_GIT_NAME || "GenBid Bot"}`, "-c", `user.email=${process.env.GENBID_GIT_EMAIL || "genbid-bot@users.noreply.github.com"}`,
          "commit", "-q", "-m", `${title} (${records.map((r) => r.id).join(", ")})`);
        git(wt, "push", "-q", "-f", "-u", "origin", branch);
        const pr = gh(["pr", "create", "--head", branch, "--base", "main", "--title", title, "--body", body], wt).trim();
        for (const a of added) if (!a.error) a.pr = pr.split("\n").pop();
        merge(pr.split("\n").pop(), wt);
      } catch (e) { for (const a of added) if (!a.error) a.prError = `Đã đăng lên web nhưng chưa mở được PR vào repo: ${String(e.stderr || e.message).trim().slice(0, 200)}`; }
    }
  } finally {
    try { git(repo, "worktree", "remove", "-f", wt); } catch { fs.rmSync(wt, { recursive: true, force: true }); }
    try { git(repo, "branch", "-D", branch); } catch {}
  }
  return { added, records };
}

// ---------- run ----------
const AGENT_INPUT = "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md, hsmt.txt, catalog.md, chỉ ghi result.json (và newCatalog.json khi prompt.md yêu cầu). Chạy không người trông, không ai trả lời câu hỏi.";
// The agent's first message (2026-11-12, token-do.md): the instructions themselves, not "read prompt.md" — 4 of 6 runs
// opened with `ls; cat prompt.md`, whose 30 KB went past the shell's output limit, came back as a 2 KB preview and was
// read a second time — then the files to read, each under the Read limit, in order (read-order.json, prep).
// scripts: false for a run without Bash (Gợi ý giá đấu): no scripts/ folder, no line about it; the hsmt.txt line only
// where there is one.
export function agentInput(dir, task = "", { scripts = true } = {}) {
  const p = (f) => path.join(dir, f);
  if (!fs.existsSync(p("prompt.md")) || !fs.existsSync(p("read-order.json"))) return AGENT_INPUT;
  const order = JSON.parse(fs.readFileSync(p("read-order.json"), "utf8"));
  if (scripts) fs.mkdirSync(p("scripts"), { recursive: true });
  const split = order.map((f) => f.match(/^(.+)-\d+\.md$/)?.[1]).filter((b, i, a) => b && a.indexOf(b) === i);
  return [fs.readFileSync(p("prompt.md"), "utf8").trim(), "", "---", "",
    `Các hướng dẫn ở trên chính là prompt.md của thư mục này (không cần mở lại). Chạy không người trông, không ai trả lời câu hỏi; ${task || "chỉ ghi result.json (và newCatalog.json khi hướng dẫn yêu cầu)"}.`,
    `Đọc bằng Read, theo thứ tự, mỗi tệp một lần, trọn tệp (không cần offset / limit — code đã cắt mỗi tệp dưới giới hạn của Read): ${order.join(", ")}.`
      + (split.length ? ` Các tệp ${split.map((b) => `${b}-N.md`).join(" / ")} là ${split.map((b) => `${b}.md`).join(" / ")} cắt theo mục, chữ y hệt; ${split.map((b) => `${b}.md`).join(", ")} vẫn để nguyên để grep, không Read lại chúng.` : ""),
    "Các tệp trong danh sách trên KHÔNG được đọc bằng Bash (cat, head, tail, sed, cut, head -c / tail -c, | cut -c…): đầu ra shell bị cắt và cut bỏ chữ cuối dòng. Code kiểm trong log của lượt này mọi dòng của các tệp đó đã qua Read; thiếu dòng nào thì kết quả bị ghi là chưa đọc hết.",
    ...(fs.existsSync(p("hsmt.txt")) ? ["hsmt.txt và controllers.md: chỉ grep / sed theo dòng, không đọc trọn."] : []),
    ...(scripts ? ["Script tự viết (dựng result.json, newCatalog.json...) để trong thư mục scripts/ của thư mục này, chạy bằng node (máy không có python); đừng dùng thư mục tạm ngoài thư mục này: lượt khác (cỡ máy khác chạy song song, lượt cũ) có thể đang dùng tên đó."] : []),
  ].join("\n");
}
// A tender of several sizes (sizesOf, Khoa 2026-11-04): one agent per size, at most MAX_SIZES, all at once; their
// internet finds join the catalog one size after another (each its own branch), then each is checked like a tender
// of one size. configmatch/<key> then holds result.sizes = [{ cap, kva, qty, label, quote, result | error }], each
// result as for one size; origin, originAuto and extra are the run's.
async function answer(req, suppliers) {
  const key = req.key, base = path.join(os.tmpdir(), "genbid-config", key);
  fs.rmSync(base, { recursive: true, force: true });
  let posted = null;
  // configreq keeps the request's own fields and gets doneAt (+ error); configmatch carries the verified result.
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = { notifyNo: req.notifyNo || key, bidName: req.bidName, origin: req.origin, extra: req.extra, requestedAt: req.requestedAt, by: req.by, from: req.from, auto: req.auto, basis: req.basis, doneAt: at, error: error || "" };
    return post([...(result ? [{ coll: "configmatch", id: key, data: { at, result } }] : []), { coll: "configreq", id: key, data: JSON.parse(JSON.stringify(reqData)) }]);
  };
  try {
    // A request Sync sent on the name alone (2026-11-06 audit: IB2600599817 buys fuel for generators and still got a
    // configuration and a price run): when neither the name nor the analysis gives a generator power, no agent runs.
    if (req.auto && req.from === "sync") {
      const a = (await doc("analysis", key).catch(() => null))?.result;
      const texts = [req.bidName, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).map((x) => `${x.item || ""} ${x.requirement || ""}`)];
      if (!texts.some((t) => BP.kvaOf(t))) {
        await done({ result: { summary: "", requirements: [], configs: [], message: "Tự động bỏ qua: tên gói và Phân tích HSMT không nêu công suất máy phát nào (có thể gói không mua máy phát). Bấm Gợi ý để chạy tay.", notes: [] }, error: "" });
        console.log(`${key}: bỏ qua Gợi ý cấu hình tự động (không thấy công suất máy phát)`);
        return;
      }
    }
    const prev = (await doc("configmatch", key).catch(() => null))?.result;
    const found = await sizesFor(key, req.bidName), sizes = found.length > 1 ? found.slice(0, MAX_SIZES) : [null];
    const runs = await Promise.all(sizes.map(async (size, i) => {
      const dir = size ? path.join(base, String(i + 1)) : base, tag = size ? `${key}-${i + 1}` : key;
      // Gợi ý lại reuses the requirements read last time for the same size (prep, requirements.json).
      const prevResult = size ? prev?.sizes?.find((x) => sameSize(x, size))?.result : prev?.sizes ? null : prev;
      const info = await prep(key, dir, { ...req, prevResult }, suppliers, size && { size, sizes: found });
      const r = await runClaude(dir, agentInput(dir), "config");
      fs.writeFileSync(path.join(os.tmpdir(), `genbid-config-${tag}.log`), `${r.stdout || ""}
${r.stderr || ""}`, "utf8");
      return { dir, info, r, size, i, prevResult };
    }));
    let all = suppliers, hist = null, investor = null;
    const outs = [];
    for (const { dir, info, r, size, i, prevResult } of runs) {
      try {
        if (!fs.existsSync(path.join(dir, "result.json"))) throw new Error(`Agent không trả kết quả${r.error ? `: ${r.error.message}` : r.status ? ` (mã ${r.status})` : ""}.`);
        // A run stopped half-way (timeout, killed, an error end) may have left a result.json half written: it is not
        // taken as a full answer. The last result of this size stays, with a note; none → the half result, with the note.
        const stopped = RG.stoppedNote(RG.readTrace(r.stdout || "").end, r.error?.message || "");
        if (stopped && prevResult?.configs) {
          const kept = JSON.parse(JSON.stringify(prevResult));
          kept.notes = [...(kept.notes || []).filter((n) => !/^Lượt Gợi ý lại lúc .* bị dừng giữa chừng/.test(n)), `Lượt Gợi ý lại lúc ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC bị dừng giữa chừng (${stopped}); đang hiển thị kết quả lần trước — bấm Gợi ý lại.`];
          console.log(`${key}${size ? ` máy ${size.label}` : ""}: lượt agent bị dừng giữa chừng (${stopped}) — giữ kết quả lần trước`);
          outs.push({ size, result: kept, problems: [] });
          continue;
        }
        // Internet finds that pass verify.mjs join the catalog first, so the configuration's suppliers can point at them.
        const opts = size ? { branch: `catalog/${key.toLowerCase()}-${i + 1}`, title: `Danh mục: bổ sung từ Gợi ý cấu hình ${key} (máy ${size.label})` } : {};
        const { added, records } = await addToCatalog(dir, key, all, opts).catch((e) => ({ added: [{ error: `Chưa bổ sung được vào danh mục: ${e.message}` }], records: [] }));
        all = [...all.filter((s) => !records.some((x) => x.id === s.id)), ...records];
        const { result, problems, missing, uncovered } = checkDir(dir, all, added, info.origin);
        // Read guard (điều phối 2026-11-12): what the agent really read, from its log, and what of the HSMT no check
        // covers — notes on the result, never trusted from the agent.
        try {
          const label = size ? `máy ${size.label}` : "";
          const g = RG.guardRun(dir, r.stdout || "", { label });
          const cov = coverNotes(result, { missing, uncovered });
          const quiet = missing.filter((m) => !webMissing([m]).length);
          if (quiet.length) console.log(`${key}${size ? ` máy ${size.label}` : ""}: mã yêu cầu code dò thấy, không lên web: ${quiet.map((m) => `${m.code} "${m.line.slice(0, 80)}"`).join("; ")}`);
          // What of the HSMT text may be missing before the agent read it (prep, hsmtGaps).
          const hm = fs.existsSync(path.join(dir, "meta.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8")).hsmtGaps || [] : [];
          for (const why of hm) cov.unshift(capNote(`Văn bản HSMT có thể thiếu: ${why}.`));
          result.notes = [...(result.notes || []), ...g.notes, ...cov];
          if (g.notes.length) console.log(`${key}${size ? ` máy ${size.label}` : ""}: CHỐT ĐỌC — ${g.notes.join(" | ")}`);
          if (cov.length) console.log(`${key}${size ? ` máy ${size.label}` : ""}: độ phủ yêu cầu — ${cov.length} ghi chú`);
          if (g.notes.length) result.readIncomplete = true;
        } catch (e) { console.log(`${key}: chưa kiểm được việc đọc đầu vào (${e.message})`); }
        // Searches the agent says found nothing, kept when this run's log shows them (web-memo.mjs, Khoa 2026-11-12).
        try {
          const listed = fs.existsSync(path.join(dir, "models.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "models.json"), "utf8")) : [];
          const nm = fs.existsSync(path.join(dir, "meta.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8")) : {};
          const neg = recordSearched(result, { logText: r.stdout || "", listed, tender: key, size: size?.label || "", suppliers: all, origin: nm.origin || "", hsmtText: fs.existsSync(path.join(dir, "hsmt.txt")) ? fs.readFileSync(path.join(dir, "hsmt.txt"), "utf8") : "" });
          if (neg.added.length || neg.refused.length) console.log(`${key}${size ? ` máy ${size.label}` : ""}: ghi ${neg.added.length} kết quả tra không thấy${neg.refused.length ? `; không ghi: ${neg.refused.join("; ")}` : ""}`);
        } catch (e) { console.log(`${key}: chưa ghi được kết quả tra không thấy (${e.message})`); }
        // What Tìm NCC added to the last result of this size comes back (Khoa, 2026-11-12), with no agent.
        try {
          const meta = fs.existsSync(path.join(dir, "meta.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8")) : {};
          const kept = keepFound(result, prevResult, { suppliers: all, origin: info.origin, hsmtText: fs.readFileSync(path.join(dir, "hsmt.txt"), "utf8"), basis: meta.basis, sized: !!meta.sized, cap: meta.cap || null, readWeb: savedReader(),
            reqHash: (result.requirements || []).some((x) => x.unverified) ? "" : info.reqHash });
          if (kept.configs || kept.suppliers || kept.web) console.log(`${key}${size ? ` máy ${size.label}` : ""}: giữ lại từ Tìm NCC ${kept.configs} cấu hình, ${kept.suppliers} nhà cung cấp; từ internet ${kept.web || 0} cấu hình`);
        } catch (e) { console.log(`${key}: chưa giữ lại được kết quả Tìm NCC trước (${e.message})`); }
        // The internet pages of the configurations chosen, for the next run to check a kept one against (savePages).
        try {
          const sp = savePages(result, dir, { key, size, suppliers: all });
          if (sp.saved || sp.catalog || sp.skipped.length) console.log(`${key}${size ? ` máy ${size.label}` : ""}: lưu trang internet ${sp.saved} tệp, ${sp.catalog} trang đã có trong danh mục${sp.skipped.length ? `; chưa lưu: ${sp.skipped.join("; ")}` : ""}`);
        } catch (e) { console.log(`${key}: chưa lưu được trang internet (${e.message})`); }
        // Won goods as a tie-break between configurations the checks rank alike. No history, no tie-break.
        try {
          hist ||= Object.fromEntries((await allDocs("bidhist")).map((d) => [d.id, d.data]));
          investor ??= req.basis?.investorName || (await doc("analysis", key).catch(() => null))?.result?.keyInfo?.investor || "";
          const kva = info.cap ? (info.cap.unit === "kW" ? info.cap.value / 0.8 : info.cap.value) : null;
          attachWon(result, hist, { kva, investorName: investor, self: key });
          if ((result.configs || []).some((c) => c.won)) rankConfigs(result);
        } catch (e) { console.log(`${key}: chưa đọc được hàng trúng thầu (${e.message})`); }
        if (info.originAuto) result.originAuto = info.originAuto;
        if (extraOf(req)) result.extra = extraOf(req);
        // Read again next time only when the HSMT or Yêu cầu khác changed (prep, requirements.json).
        if (!(result.requirements || []).some((x) => x.unverified)) result.reqHash = info.reqHash;
        outs.push({ size, result, problems });
      } catch (e) {
        if (!size) throw e;
        outs.push({ size, error: e.message || String(e) });
      }
    }
    let result;
    if (sizes[0]) {
      const one = outs.find((o) => o.result)?.result || {};
      result = { origin: one.origin, ...(one.originAuto ? { originAuto: one.originAuto } : {}), ...(extraOf(req) ? { extra: extraOf(req) } : {}),
        sizes: outs.map((o) => ({ cap: o.size.cap, kva: o.size.kva, qty: o.size.qty, label: o.size.label, quote: o.size.quote, ...(o.result ? { result: o.result } : { error: o.error }) })),
        ...(found.length > MAX_SIZES ? { skipped: found.slice(MAX_SIZES).map(sizeText) } : {}) };
      if (!outs.some((o) => o.result)) throw new Error(outs.map((o) => `Máy ${o.size.label}: ${o.error}`).join(" "));
    } else result = outs[0].result;
    await done({ result, error: "" });
    posted = result;
    console.log(`${key}: ${outs.map((o) => `${o.size ? `máy ${o.size.label}: ` : ""}${o.result ? `${o.result.configs.length} cấu hình${o.problems.length ? `, ${o.problems.length} điểm chưa khớp nguồn` : ""}` : `lỗi ${o.error}`}`).join("; ")}`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: lỗi ${e.message}`);
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
  // Giá chạy lại sau Gợi ý lại (điều phối 2026-11-11): a tender that already has a price run gets it again on the new
  // configuration, with the basis of last time; otherwise a Sync request gets its first one (autoBidprice).
  const again = posted ? await rebidAfterConfig(key, posted).catch((e) => { console.log(`${key}: chưa gửi lại được Gợi ý giá đấu (${e.message})`); return null; }) : null;
  if (!again && req.auto) await autoBidprice(req).catch((e) => console.log(`${key}: chưa gửi được Gợi ý giá đấu (${e.message})`));
}
// The price request to send again after a new configmatch, or null: only for a tender that had one (bidpricereq, or a
// bidprice whose request is gone), with the same basis (power, package price...) as last time; none when that basis has
// no power (as autoBidprice) or the new result has no configuration. Pure: the caller posts it. The price run never
// asks for a configuration (bidprice-bot.mjs posts bidprice / bidpricereq only), so this cannot loop.
export function rebidOf({ prior = null, price = null, result = null, key = "", now = new Date().toISOString() } = {}) {
  if (!prior && !price) return null;
  const configs = result?.sizes ? result.sizes.flatMap((z) => z.result?.configs || []) : result?.configs || [];
  if (!configs.length) return null;
  const basis = prior?.basis || price?.result?.basis || null;
  if (!basis?.kva) return null;
  return JSON.parse(JSON.stringify({ notifyNo: prior?.notifyNo || key, bidName: prior?.bidName || "", basis, requestedAt: now, by: prior?.by, from: prior?.from || "web", auto: true, after: "configmatch" }));
}
async function rebidAfterConfig(key, result) {
  const [prior, price] = await Promise.all([doc("bidpricereq", key).catch(() => null), doc("bidprice", key).catch(() => null)]);
  const data = rebidOf({ prior, price, result, key });
  if (!data) return null;
  await post([{ coll: "bidpricereq", id: key, data }]);
  console.log(`${key}: đã gửi lại Gợi ý giá đấu theo cấu hình mới (${Math.round(data.basis.kva)} kVA, giá gói ${data.basis.price || "không rõ"})`);
  return data;
}
// A new "Máy phát điện" tender from Sync (configreq auto, genbid-sync.js; Khoa, 2026-11-03): Gợi ý giá đấu follows Gợi ý
// cấu hình, so it reads that configuration. The basis as the web's bidBasis: package price etc. from the feed (req.basis),
// power from the name, else the analysis; runAll reads the queue again and starts it.
async function autoBidprice(req) {
  const a = (await doc("analysis", req.key).catch(() => null))?.result;
  const texts = [[req.bidName, "tên gói"], [a?.keyInfo?.generatorCapacity, "phân tích"],
    ...(a?.technicalSpecs || []).filter((x) => /công suất|capacity|power|kva|kw/i.test(`${x.item || ""} ${x.requirement || ""}`)).map((x) => [x.requirement, "phân tích"])];
  const hit = texts.find(([t]) => BP.kvaOf(t)), b = req.basis || {};
  const capText = hit ? `${String(hit[0]).normalize("NFC").match(/(\d+(?:[.,]\d+)?)\s*(kva|kw)\b/i)[0]} (${hit[1]})` : "";
  const basis = { kva: hit ? BP.kvaOf(hit[0]) : null, price: Number(b.price) || null, capText, bidForm: b.bidForm || "", investorName: b.investorName || a?.keyInfo?.investor || "" };
  // No power: the agent would compare 80 lots of every size for nothing (2026-11-06 audit).
  if (!basis.kva) { console.log(`${req.key}: không gửi Gợi ý giá đấu tự động (không thấy công suất máy phát)`); return; }
  await post([{ coll: "bidpricereq", id: req.key, data: { notifyNo: req.notifyNo || req.key, bidName: req.bidName || "", basis, requestedAt: new Date().toISOString(), from: "sync", auto: true } }]);
  console.log(`${req.key}: đã gửi Gợi ý giá đấu tự động (${basis.kva ? Math.round(basis.kva) + " kVA" : "công suất không rõ"}, giá gói ${basis.price || "không rõ"})`);
}

// The log is the agent's whole stream, each line with the seconds since the start, to see where a run's minutes go
// (every tool call and its result); nothing else reads stdout.
const CLAUDE_TIMEOUT = 40 * 60e3;
// task: "config" for Gợi ý cấu hình, which Cấu hình hệ thống may put on the monthly plan (taskEnv); "" for Tìm NCC and
// Tìm Thông Số (the API key while the budget allows).
function runClaude(dir, input, task = "") {
  const env = taskEnv(task), api = !!env.ANTHROPIC_API_KEY;
  // The spend book follows the run message by message (a run killed at CLAUDE_TIMEOUT is counted too).
  const meter = apiMeter("config", api);
  return runClaudeOnce(dir, input, env, (d) => meter.data(d)).then((r) => {
    meter.finish();
    return api && switchToPlan(r.stdout + r.stderr, "config") ? runClaude(dir, input, task) : r;
  });
}
function runClaudeOnce(dir, input, env = process.env, onData = () => {}) {
  const t0 = Date.now(), args = ["-p", "--permission-mode", "auto", "--output-format", "stream-json", "--verbose", "--model", process.env.GENBID_CONFIG_MODEL || "opus",
    "--strict-mcp-config", "--disable-slash-commands", "--tools", "Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch"];
  return new Promise((ok) => {
    let out = "", err = "", buf = "", done = false, late = false;
    const stamp = (l) => `[${Math.round((Date.now() - t0) / 1000)}s] ${l}\n`;
    const p = spawn(CLAUDE, args, { cwd: dir, windowsHide: true, env });
    const timer = setTimeout(() => { late = true; p.kill(); }, CLAUDE_TIMEOUT);
    const end = (status, error) => { if (done) return; done = true; clearTimeout(timer); if (buf) out += stamp(buf); ok({ stdout: out, stderr: err, status, error }); };
    p.stdout.setEncoding("utf8").on("data", (d) => { onData(d); buf += d; for (let i; (i = buf.indexOf("\n")) >= 0; buf = buf.slice(i + 1)) out += stamp(buf.slice(0, i)); });
    p.stderr.setEncoding("utf8").on("data", (d) => { err += d; });
    p.on("error", (e) => end(null, e));
    p.on("close", (code) => end(code, late ? new Error(`quá ${CLAUDE_TIMEOUT / 60e3} phút`) : null));
    p.stdin.on("error", () => {});
    p.stdin.end(input);
  });
}

// ---------- Tìm NCC (findreq/<TBMT> → findmatch/<TBMT>) ----------
// "Tìm NCC" next to "Gợi ý" (Khoa, 2026-10-31): search the internet for more suppliers that fit the tender's technical
// requirements and add them to the catalog, following find-prompt.md in a folder made by prep. Claude (Opus) only
// (Khoa, 2026-11-03: Gemini took ~23 minutes a run and seldom found a row that fit). GENBID_FIND_ENGINES=gemini,claude
// puts Gemini (Antigravity CLI) back first.
const FIND_ENGINES = (process.env.GENBID_FIND_ENGINES || "claude").split(",").map((s) => s.trim()).filter((s) => s === "gemini" || s === "claude");
const AGY = process.env.GENBID_AGY || path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe");
const GEMINI_MODEL = process.env.GENBID_GEMINI_MODEL || "gemini-3.8-flash-medium";
const ENGINE = { gemini: "Gemini (Antigravity)", claude: "Claude" };
const FIND_INPUT = "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md và catalog.md, tìm trên internet, chỉ ghi newCatalog.json và find.json (cùng các trang lưu bằng lệnh save). Chạy không người trông, không ai trả lời câu hỏi.";
// Asynchronous, so the other requests of the run go on while it works (run answers them all at once).
function runGemini(dir, input) {
  if (!fs.existsSync(AGY)) return Promise.resolve({ error: "chưa cài Antigravity CLI (agy)" });
  return new Promise((ok) => {
    let stdout = "", stderr = "", done = false;
    const p = spawn(AGY, ["--model", GEMINI_MODEL, "--output-format", "json", "--disable-slash-commands", "--dangerously-skip-permissions", "--print-timeout", "2400s"], { cwd: dir, windowsHide: true });
    const timer = setTimeout(() => p.kill(), 42 * 60e3);
    const end = (status, e) => {
      if (done) return; done = true; clearTimeout(timer);
      let j = null; try { j = JSON.parse(stdout); } catch {}
      ok({ stdout, stderr, error: j?.status === "SUCCESS" ? "" : (j?.response || stderr || e?.message || `mã thoát ${status}`).trim().slice(0, 300) });
    };
    p.stdout.setEncoding("utf8").on("data", (d) => { stdout += d; });
    p.stderr.setEncoding("utf8").on("data", (d) => { stderr += d; });
    p.on("error", (e) => end(null, e));
    p.on("close", (code) => end(code));
    p.stdin.on("error", () => {});
    p.stdin.end(input);
  });
}
// A tender of several sizes: one search for all of them (cap: the list of sizes), merged into each size's suggestion.
// Tìm nhà cung cấp of one suggested configuration that has none (Khoa, 2026-11-06): req.target names it (size label,
// rank, engine, alternator, controller, genset); the search is for suppliers of that configuration at that size only.
// The suppliers found join it in code (mergeFind: same engine, and the same alternator when both name one).
export const targetText = (t) => [t.engine?.model && `động cơ ${t.engine.model}${t.engine.make ? ` (${t.engine.make})` : ""}`, t.alternator?.model && `đầu phát ${t.alternator.model}${t.alternator.make ? ` (${t.alternator.make})` : ""}`, t.controller?.model && `bộ điều khiển ${t.controller.model}${t.controller.make ? ` (${t.controller.make})` : ""}`, t.genset?.model && `tổ máy tham chiếu ${t.genset.model}`].filter(Boolean).join(", ");
// io: as prep's.
export async function findPrep(key, dir, req, suppliers, io = {}) {
  const found = await sizesFor(key, req.bidName, io.doc), sizes = found.slice(0, MAX_SIZES), t = req.target?.engine?.model ? req.target : null;
  const one = t && sizes.length > 1 ? sizes.find((x) => x.label === t.size) || null : null;
  const info = await prep(key, dir, req, suppliers, one ? { size: one, sizes, find: true, only: true } : sizes.length > 1 ? { size: sizes[0], sizes, find: true } : null, io);
  if (sizes.length > 1 && !one) info.cap = sizes.map((x) => x.cap);
  // Tìm NCC must see every supplier in the system (not only those of the candidate rows), so as not to suggest them again.
  const cat = fs.readFileSync(path.join(dir, "catalog.md"), "utf8"), cut = cat.indexOf("\n\n# Nhà cung cấp trong hệ thống");
  fs.writeFileSync(path.join(dir, "catalog.md"), (cut >= 0 ? cat.slice(0, cut) : cat) + "\n\n" + suppliersMd(JSON.parse(fs.readFileSync(path.join(dir, "suppliers.json"), "utf8"))), "utf8");
  // The parts prep cut for Gợi ý no longer match catalog.md / input.md rewritten here (read guard 2026-11-12): gone, so
  // the agent cannot read a stale one. find-prompt.md reads input.md and the first lines of catalog.md.
  for (const f of fs.readdirSync(dir)) if (/^(catalog|input|ctl-lookup)-\d+\.md$|^read-order\.json$/.test(f)) fs.rmSync(path.join(dir, f));
  const watch = fs.existsSync(path.join(ROOT, "discover-watchlist.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "discover-watchlist.json"), "utf8")) : [];
  const head = [
    `# Tìm NCC cho gói ${key}`, "",
    `Lệnh kiểm tra newCatalog.json: node "${SCRIPT}" find-check --dir .`,
    `Lệnh kiểm tra đã có: node "${path.join(ROOT, "discover.mjs")}" check "<tên công ty hoặc website>"`,
    "", ...(t ? [`## Tìm nhà cung cấp cho MỘT cấu hình đã gợi ý: #${t.rank || "?"}${t.size ? ` máy ${t.size}` : ""}`,
      `Cấu hình này chưa có nhà cung cấp nào trong hệ thống: ${targetText(t)}.`,
      `Chỉ tìm nhà cung cấp (hãng tổ máy, nhà máy lắp ráp, đại lý) chào tổ máy dùng ĐÚNG động cơ ${t.engine.model} ở công suất của gói${t.alternator?.model ? `, tốt nhất cùng đầu phát ${t.alternator.model}` : ""}${t.controller?.model ? ` và bộ điều khiển ${t.controller.model}` : ""}. Không tìm cấu hình khác.`,
      `Code gắn nhà cung cấp vào cấu hình này khi một dòng specTables của nó ghi cả model động cơ ${t.engine.model} và công suất (đầu phát khác ${t.alternator?.model || "—"} thì thành cấu hình mới). Trong find.json ghi rõ mỗi nhà cung cấp chào đúng những bộ phận nào của cấu hình.`, ""] : []),
    "## Công ty Khoa hay làm việc (tìm riêng theo tên trước)", ...watch.map((w) => `- ${w.name}${w.note ? ` (${w.note})` : ""}`), "", "",
  ].join("\n");
  const input = path.join(dir, "input.md");
  fs.writeFileSync(input, head + fs.readFileSync(input, "utf8"), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "find-prompt.md"), "utf8"), "utf8");
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin: info.origin, cap: info.cap }), "utf8");
  return info;
}
// The power band of Tìm NCC (Khoa, 2026-11-12): the same as the candidates of catalog.md, NEAR_LOW (100% less the 0.5% of
// rounding) to NEAR_HIGH (120%; 140% up to 30 kVA, bandOf) of the tender's power; it was 95% to 140% (fitsCap) and 100% to
// 140% (rows).
const inBand = (x, cap) => { const b = bandOf(cap); return x >= cap.value * b.low && x <= cap.value * b.high + 1e-9; };
// A product line of the record that covers the tender's power, in the tender's unit (the band above: a line whose range
// reaches into it).
const capStr = (c) => (Array.isArray(c) ? c : c ? [c] : []).map((x) => `${x.value} ${x.unit}`).join(", ");
// cap may be a list (a tender of several sizes): a line that covers any of them.
export function fitsCap(rec, cap) {
  if (Array.isArray(cap)) return cap.some((c) => fitsCap(rec, c));
  if (!cap) return (rec.productLines || []).some((p) => p.power);
  return (rec.productLines || []).some((p) => p.power?.unit === cap.unit && p.power.min <= cap.value * bandOf(cap).high + 1e-9 && p.power.max >= cap.value * NEAR_LOW);
}
// The engine rows of a record at the tender's power (the band above, as mergeFind takes them): a product line alone
// fits the power but goes into no configuration (IB2600594596, 2026-11-06: Rehlko's tables named no engine).
export function engineRows(rec, cap) {
  const caps = (Array.isArray(cap) ? cap : [cap]).filter(Boolean);
  return CAT.build([rec]).engines.flatMap((e) => e.uses.filter((u) => !caps.length || caps.some((c) => inBand(rowPower(u, c), c))).map((u) => `${e.model}${u.genset ? ` (${u.genset})` : ""}`));
}
// newCatalog.json checked offline, the way addToCatalog will: records built with catalogRecords, then verify.mjs on a
// copy in <dir>/_check with the saved pages. For a supplier already in the system only its new parts are checked
// (its own pages are not here) and only its new product lines count for the power.
export async function findCheck(dir, suppliers, cap) {
  const file = path.join(dir, "newCatalog.json"), out = [];
  if (!fs.existsSync(file)) return [{ id: "", errors: ["chưa có newCatalog.json"] }];
  let entries; try { entries = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return [{ id: "", errors: [`newCatalog.json không phải JSON: ${e.message}`] }]; }
  const chk = path.join(dir, "_check");
  fs.rmSync(chk, { recursive: true, force: true }); fs.mkdirSync(path.join(chk, "cn"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "verify.mjs"), path.join(chk, "verify.mjs"));
  const { checkRecord } = await import(pathToFileURL(path.join(chk, "verify.mjs")).href + `?${Date.now()}`);
  const readWeb = (f) => { const p = path.join(dir, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  const existing = new Map(suppliers.map((s) => [s.id, s]));
  for (const x of catalogRecords(entries, { existing, readWeb, today: new Date().toISOString().slice(0, 10) })) {
    if (x.error) { out.push({ id: x.id, from: x.from, errors: [x.error] }); continue; }
    for (const [f, txt] of Object.entries(x.files)) { fs.mkdirSync(path.dirname(path.join(chk, f)), { recursive: true }); fs.writeFileSync(path.join(chk, f), txt, "utf8"); }
    const own = new Set(x.nmap.values()), isOwn = (src) => Array.isArray(src) && src.length && src.every((n) => own.has(n));
    // status partial: "verified" asks for things of the whole record (website, a power line), checked again by addToCatalog.
    const rec = x.isNew ? x.rec : { ...x.rec, status: "partial", sources: x.rec.sources.filter((s) => own.has(s.n)), productLines: (x.rec.productLines || []).filter((p) => isOwn(p.src)),
      specTables: (x.rec.specTables || []).filter((t) => own.has(t.n)), controllers: (x.rec.controllers || []).filter((c) => isOwn(c.src)), strengths: [], certifications: [], contacts: [], vietnam: undefined, founded: null };
    out.push({ id: x.id, from: x.from, isNew: x.isNew, errors: checkRecord(rec, path.join(chk, "cn", `${x.id}.json`)).errors, fits: fitsCap(rec, cap), rows: engineRows(rec, cap), rec });
  }
  return out;
}
// Suppliers Tìm NCC added go into the suggested configurations in code, with no agent and no tokens (Khoa,
// 2026-11-01), from its table rows (web/catalog.js) for an engine of the origin asked for whose smallest rating is 100%
// to 120% of the tender's power (Khoa, 2026-11-02, band of 2026-11-12): a row with the engine (and, when both name one, the alternator) of
// a configuration already suggested adds the supplier under it; a supplier that joins none becomes a new configuration,
// marked fromFind, from its row closest to the power, with that supplier alone. The new one's only check is the power
// read from that row, left "unclear", since nothing else of the HSMT was compared with it. Every model and line is the
// row word for word.
const powerText = (p) => Object.entries(p || {}).map(([k, v]) => `${{ prime: "Prime", standby: "Standby", rated: "Định mức" }[k] || k} ${[v.kVA && `${v.kVA} kVA`, v.kW && `${v.kW} kW`].filter(Boolean).join(" / ")}`).join(", ");
export function mergeFind(result, records, { cap, origin, max = 5 } = {}) {
  const ids = new Set(records.map((r) => r.id)), keyOf = CAT.keyOf;
  // The row's smallest rating (prime when it gives both) is in the band: from 100% (less the rounding) to 120% of the tender's power.
  const near = (u) => !cap || inBand(rowPower(u, cap), cap);
  const lineOf = (u, model) => u.line || (u.lines?.rows || []).find((l) => keyOf(l).includes(keyOf(model))) || null;
  const configs = result.configs || (result.configs = []), out = { joined: [], created: [] };
  const o = originOfReq(origin), cn = cnSuppliers(records), rows = new Map();
  // G7 / G20: a supplier found outside the group joins no configuration (it stays in the supplier DB).
  for (const e of byOrigin(CAT.build(records).engines, o, cn, groupSuppliers(records, o, (result.requirements || []).some((r) => r.sync), result.originScope === "parts", result.originBasis === "brand"))) {
    // Under "cn" a foreign engine comes only with the suppliers based in China that offer it.
    const viaCn = o === "cn" && CAT.originOf(e) === "other";
    for (const u of e.uses) {
      if (!ids.has(u.supplierId) || !near(u) || !lineOf(u, e.model) || (viaCn && !cn.has(u.supplierId))) continue;
      rows.set(u.supplierId, [...(rows.get(u.supplierId) || []), { e, u, d: cap ? Math.abs(rowPower(u, cap) - cap.value) : 0 }]);
    }
  }
  // The same configuration: the same engine, and the same alternator when both name one.
  const same = (c, { e, u }) => c.engine?.model && keyOf(c.engine.model) === e.key && (!c.alternator?.model || !u.other || keyOf(c.alternator.model) === keyOf(u.other));
  const mineOf = (r) => (rows.get(r.id) || []).sort((a, b) => a.d - b.d);
  // The controllers the supplier's pages name (controllers.mjs) are said too, as recorded.
  const entry = (r, { e, u }) => {
    const ctrls = [...new Set((r.controllers || []).filter((c) => c.model).map((c) => c.model))];
    return { supplierId: u.supplierId, n: u.n, line: lineOf(u, e.model), fromFind: true, why: `Nhà cung cấp mới tìm được (Tìm NCC): ${u.fromLine ? `datasheet tổ máy ${u.genset || ""} ghi động cơ ${e.model} (theo dòng sản phẩm của bản ghi; chữ trang tách cột nên không dòng nào ghi cả động cơ và công suất), dòng bảng ghi công suất` : `dòng bảng ghi động cơ ${e.model}`}${u.power ? ` (${powerText(u.power)})` : ""}.${ctrls.length ? ` Bộ điều khiển trên trang của nhà cung cấp: ${ctrls.join(", ")}.` : ""}` };
  };
  // Adds the supplier under every configuration it has a row for; true when there is one. A second run adds nothing twice.
  const join = (r) => {
    let found = false;
    for (const c of configs) {
      const x = mineOf(r).find((m) => same(c, m));
      if (!x) continue;
      found = true;
      c.suppliers = c.suppliers || [];
      if (!c.suppliers.some((s) => s.supplierId === r.id)) { c.suppliers.push(entry(r, x)); out.joined.push({ rank: c.rank, supplierId: r.id }); }
    }
    return found;
  };
  const listed = (r) => configs.some((c) => c.suppliers?.some((s) => s.supplierId === r.id));
  for (const r of records) join(r);
  for (const r of records) {
    const mine = mineOf(r);
    // A configuration made just before for another supplier found may already be this one's.
    if (!mine.length || listed(r) || join(r) || out.created.length >= max) continue;
    const { e, u } = mine[0], line = lineOf(u, e.model), src = { kind: "catalog", supplierId: u.supplierId, n: u.n, line };
    const c = {
      rank: Math.max(0, ...configs.map((x) => x.rank || 0)) + 1, fromFind: true,
      engine: { model: e.model, ...(e.make ? { make: e.make } : {}), src },
      ...(u.other ? { alternator: { model: u.other, src } } : {}),
      ...(u.genset ? { genset: { model: u.genset, src } } : {}),
      ...((ctl) => (ctl ? { controller: { model: ctl.model, make: ctl.brand, src } } : {}))(CAT.controllersIn(line).find((x) => x.model)),
      checks: [{ item: "Công suất", part: "genset", requirement: cap ? `khoảng ${cap.value} ${cap.unit}` : "", offered: powerText(u.power) || "—", sourceQuote: line, status: "unclear",
        note: "Bổ sung tự động từ Tìm NCC, không dùng AI: công suất nhỏ nhất ghi trong dòng bảng từ " + bandOf(cap).text + " công suất của gói. Các yêu cầu khác của HSMT chưa được đối chiếu (bấm Gợi ý lại nếu cần)." }],
      suppliers: [entry(r, mine[0])],
      gaps: ["Cấu hình bổ sung từ Tìm NCC: chưa đối chiếu từng yêu cầu kỹ thuật của HSMT.", ...(result.extra ? [`Chưa đối chiếu Yêu cầu khác: ${result.extra}`] : [])],
    };
    configs.push(c);
    out.created.push({ rank: c.rank, engine: e.model, supplierId: u.supplierId });
  }
  // The other suppliers found with a row for a configuration made here are added under it too.
  for (const r of records) join(r);
  return out;
}
// Reads configmatch/<key> and posts it back with the new suppliers merged in. No configmatch yet: nothing to merge into.
async function mergeFindIntoConfig(key, records, { cap, origin, suppliers = records }) {
  const prev = await doc("configmatch", key);
  if (!prev?.result) return null;
  const whole = JSON.parse(JSON.stringify(prev.result));
  // A tender of several sizes: each size's suggestion with its own power (Gợi ý nhiều cỡ máy).
  const parts = whole.sizes ? whole.sizes.filter((x) => x.result).map((x) => ({ result: x.result, cap: x.cap, label: x.label, size: x })) : [{ result: whole, cap: Array.isArray(cap) ? null : cap }];
  const outs = [];
  for (const part of parts) {
    const result = part.result, out = mergeFind(result, records, { cap: part.cap, origin: result.origin || whole.origin || origin });
    // The same object: out.checked is set below, after the push (it was lost in a copy, 2026-11-06).
    out.label = part.label; outs.push(out);
    if (!out.joined.length && !out.created.length) continue;
    const at = new Date().toISOString().slice(0, 16).replace("T", " ");
    result.notes = [...(result.notes || []), `Tìm NCC lúc ${at} UTC: ${mergeText(out)}, bằng code từ dòng bảng của nhà cung cấp.`];
    // The new configurations are checked against the stored requirements by a small agent (Khoa, 2026-11-02).
    if (out.created.length) {
      const all = [...suppliers.filter((s) => !records.some((r) => r.id === s.id)), ...records];
      out.checked = await checkNewConfigs(key, result, out.created.map((c) => c.rank), all, part.cap, part.size && whole.sizes.length > 1 ? { size: part.size, sizes: whole.sizes } : null).catch((e) => ({ error: e.message }));
      result.notes.push(out.checked.error ? `Chưa đối chiếu được cấu hình mới với HSMT: ${out.checked.error}` : `Đã đối chiếu ${out.checked.checked} cấu hình mới với ${result.requirements.length} yêu cầu của HSMT${out.checked.problems ? `, ${out.checked.problems} điểm chưa khớp nguồn` : ""}.`);
      // Read guard of the check run (catalog parts read whole, a run stopped half-way).
      for (const n of out.checked.readNotes || []) result.notes.push(`Đối chiếu cấu hình Tìm NCC: ${n}`);
    }
    rankConfigs(result);
  }
  if (outs.some((o) => o.joined.length || o.created.length)) await post([{ coll: "configmatch", id: key, data: { ...prev, at: new Date().toISOString(), result: whole } }]);
  if (!whole.sizes) return outs[0];
  // One summary for the sizes: mergeText reads joined / created / checked; each line says its size.
  return { joined: outs.flatMap((o) => o.joined.map((j) => ({ ...j, label: o.label }))), created: outs.flatMap((o) => o.created.map((c) => ({ ...c, label: o.label }))), checked: outs.reduce((a, o) => ({ checked: a.checked + (o.checked?.checked || 0) }), { checked: 0 }) };
}
// Tìm NCC: the configurations made in code for the suppliers found have only their power read. A small agent
// (check-prompt.md) checks each against the requirements stored with the suggestion, reading only those
// configurations and the figures of their models; check() verifies its answer as for Gợi ý.
async function checkNewConfigs(key, result, ranks, suppliers, cap, sizing = null) {
  const mine = (result.configs || []).filter((c) => ranks.includes(c.rank) && c.engine?.model);
  if (!mine.length) return { checked: 0 };
  if (!result.requirements?.length) throw new Error("gợi ý trước không có danh sách yêu cầu");
  const dir = path.join(os.tmpdir(), "genbid-findcheck", key);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(path.join(dir, "web"), { recursive: true });
  try {
    const { text } = await hsmtTextOf(key);
    fs.writeFileSync(path.join(dir, "hsmt.txt"), text, "utf8");
    const cat = CAT.build(suppliers), focus = new Set(mine.map((c) => CAT.keyOf(c.engine.model)));
    const { md, ctlMd, shown } = catalogMd(cat, cap, hintsOf(text, result.extra || "", sizing), { suppliers, origin: "all", focus });
    // Parts under the Read limit and the order to read them, as for Gợi ý (read guard 2026-11-12: this catalog.md was
    // written whole, 100–150 thousand characters, over the limit).
    const catFiles = writeForRead(dir, "catalog.md", md + "\n\n" + suppliersMd(suppliers.filter((s) => shown.has(s.id))));
    fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(catFiles), "utf8");
    if (ctlMd) fs.writeFileSync(path.join(dir, "controllers.md"), ctlMd, "utf8");
    fs.writeFileSync(path.join(dir, "suppliers.json"), JSON.stringify(suppliers), "utf8");
    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin: result.origin || "all", ...(result.originBasis ? { basis: result.originBasis } : {}) }), "utf8");
    fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify({ requirements: result.requirements, configs: mine.map(({ checks, ...c }) => ({ ...c, checks: [] })) }, null, 1), "utf8");
    fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "check-prompt.md"), "utf8").replace("<check>", `node "${SCRIPT}" check --dir .`) + formulasMd(), "utf8");
    const r = await runClaude(dir, agentInput(dir, "điền checks cho các cấu hình trong result.json, chỉ sửa result.json"), "config");
    fs.writeFileSync(path.join(os.tmpdir(), `genbid-findcheck-${key}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
    const g = RG.guardRun(dir, r.stdout || "");
    if (g.notes.length) console.log(`${key}: CHỐT ĐỌC (đối chiếu Tìm NCC) — ${g.notes.join(" | ")}`);
    // A run stopped half-way: its checks are not taken (the configurations stay "chưa đối chiếu").
    if (RG.stoppedNote(g.end, r.error?.message || "")) return { checked: 0, problems: 0, readNotes: g.notes };
    const got = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
    return { ...mergeChecked(result, got, { hsmtText: text, suppliers, origin: result.origin }), readNotes: g.notes };
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
// `byCode` marks a requirement / check the CODE wrote (its source is the code's rule, not a quote), so check() does
// not ask it for a quote. Only the code sets it: whatever the agent wrote (result.json) loses it before check().
export function stripAgentCodeFlags(list) {
  for (const x of list || []) { delete x.byCode; for (const p of x.parts || []) delete p.byCode; }
  return list;
}
// The agent's checks (and controller) for the configurations of `got`, verified by check() and put back by rank.
// Only checks and the controller are taken: the engine, alternator, genset and suppliers stay as the code made them.
export function mergeChecked(result, got, { hsmtText, suppliers, origin }) {
  const byRank = new Map((result.configs || []).map((c) => [c.rank, c]));
  const sub = { requirements: JSON.parse(JSON.stringify(result.requirements || [])), configs: [] };
  for (const g of got.configs || []) {
    const c = byRank.get(g.rank);
    if (!c || !Array.isArray(g.checks) || !g.checks.length) continue;
    sub.configs.push({ ...JSON.parse(JSON.stringify(c)), checks: stripAgentCodeFlags(g.checks),...(g.controller?.model ? { controller: g.controller } : {}) });
  }
  if (!sub.configs.length) return { checked: 0, problems: 0 };
  const { result: done, problems } = check(sub, { hsmtText, suppliers, readWeb: () => null, origin: origin || "all", basis: result.originBasis });
  let checked = 0;
  for (const c of done.configs) {
    const old = byRank.get(c.rank);
    if (!old) continue;
    Object.assign(old, { checks: c.checks, findChecked: true, gaps: (old.gaps || []).filter((g) => !/chưa đối chiếu từng yêu cầu/.test(g)) });
    if (c.controller) old.controller = c.controller;
    checked++;
  }
  return { checked, problems: problems.length };
}
// Gợi ý lại must not lose what Tìm NCC added (Khoa, 2026-11-12: IB2600594596 lost a configuration and a supplier found
// that way). After the run's result is checked, what the last result of the same size got from Tìm NCC (fromFind) is
// put back in code, with no agent: (1) a supplier found, under a configuration the new result has too (the same engine,
// and the same alternator when both name one, as mergeFind), joins it; (2) a configuration found that the new result
// has no equal of is kept whole, its suppliers and checks, then checked again by check() like every configuration of the
// run, so it meets the same rules (origin, G7 / G20 group, Việt Nam, sources); (3) nothing comes back for a supplier no
// longer in `suppliers` (a supplier excluded on the web is not in it), out of the origin group, or whose table row is
// gone, nor for a configuration left with no supplier or whose engine / genset table row is gone. A configuration kept is
// marked keptFind and is outside the 2-per-make limit of rankConfigs. When the requirements differ from the last run's,
// the kept configuration says its checks are of the last reading of the HSMT; none is made "met" for it. A second run
// adds nothing twice. Returns { configs, suppliers, dropped } and changes `result` only when something comes back.
export function keepFound(result, prevResult, { suppliers = [], origin, hsmtText = "", readWeb = () => null, basis, sized = false, cap = null, reqHash = "" } = {}) {
  const out = { configs: 0, suppliers: 0, dropped: [] };
  const oldCfgs = (prevResult?.configs || []).filter((c) => c && c.engine?.model);
  if (!oldCfgs.some((c) => c.fromFind || isWebCfg(c) || (c.suppliers || []).some((s) => s.fromFind))) return out;
  const configs = result.configs || (result.configs = []), sup = new Map(suppliers.map((s) => [s.id, s])), keyOf = CAT.keyOf;
  const o = originOfReq(result.origin || origin), cn = cnSuppliers(suppliers);
  const grp = groupSuppliers(suppliers, o, (result.requirements || []).some((r) => r.sync), result.originScope === "parts", result.originBasis === "brand");
  const squash = (x) => norm(x).replace(/\s/g, "");
  const sameCfg = (a, b) => a.engine?.model && b.engine?.model && keyOf(a.engine.model) === keyOf(b.engine.model) && (!a.alternator?.model || !b.alternator?.model || keyOf(a.alternator.model) === keyOf(b.alternator.model));
  // The same HSMT reading: the same reqHash when both have one (the agent words the requirements anew each run, so the
  // texts are not compared), else the same requirement codes.
  const reqKey = (r) => r.code || norm(r.item || "");
  const mine = new Set((result.requirements || []).map(reqKey)), was = new Set((prevResult.requirements || []).map(reqKey));
  const sameReq = prevResult.reqHash && reqHash ? prevResult.reqHash === reqHash : mine.size === was.size && [...mine].every((k) => was.has(k));
  // A supplier entry the new run can still stand behind: in the system, in the origin group, not in Việt Nam, its table
  // row still there. (A row that does not name the engine is mergeFind's too, from the product line; check() flags it.)
  // Its flags are written again the way check() writes them.
  const entryFor = (c, s) => {
    const r = sup.get(s.supplierId);
    if (!r || (grp && !grp.has(r.id)) || r.country === "VN") return null;
    if (o === "cn" && CAT.originIn(`${c.engine.model} ${c.engine.make || ""}`, c.engine.model) === "other" && !cn.has(r.id)) return null;
    const t = (r.specTables || []).find((x) => x.n === Number(s.n) && x.rows.some((l) => norm(l) === norm(s.line)));
    if (!t) return null;
    const row = squash([...(t.header || []), s.line, t.title].join(" "));
    const e = { ...JSON.parse(JSON.stringify(s)), fromFind: true };
    delete e.unverified;
    e.hasAlternator = !!c.alternator?.model && row.includes(squash(c.alternator.model));
    const ck = c.controller?.model && keyOf(c.controller.model);
    e.hasController = !!ck && (row.includes(squash(c.controller.model)) || (r.controllers || []).some((x) => x.model && keyOf(x.model) === ck));
    return e;
  };
  // (1) suppliers found, under a configuration the new result has too.
  const sups = [];
  for (const old of oldCfgs) for (const s of old.suppliers || []) {
    if (!s.fromFind) continue;
    for (const c of configs) {
      if (!sameCfg(c, old) || (c.suppliers || []).some((x) => x.supplierId === s.supplierId)) continue;
      const e = entryFor(c, s);
      if (!e) { out.dropped.push(`${s.supplierId}: dòng bảng hoặc nhóm xuất xứ không còn`); continue; }
      (c.suppliers = c.suppliers || []).push(e); sups.push(`${s.supplierId} vào ${c.engine.model}`);
    }
  }
  out.suppliers = sups.length;
  // (2) configurations found that the new result has no equal of: checked again as a sub-result with the run's own requirements.
  const keep = [];
  for (const old of oldCfgs.filter((x) => x.fromFind && !configs.some((c) => sameCfg(c, x)))) {
    const c = JSON.parse(JSON.stringify(old));
    c.rank = Math.max(0, ...configs.map((x) => x.rank || 0), ...keep.map((x) => x.rank)) + 1;
    c.fromFind = true; c.keptFind = true;
    // The table rows its engine and genset were taken from must still be there (a page of an internet find is not kept).
    const rowThere = (x) => !x || (x.kind === "catalog" && (sup.get(x.supplierId)?.specTables || []).some((t) => t.n === Number(x.n) && t.rows.some((l) => norm(l) === norm(x.line))));
    if (!rowThere(c.engine.src) || !rowThere(c.genset?.src) || !c.engine.src) { out.dropped.push(`cấu hình ${c.engine.model}: dòng bảng nguồn không còn`); continue; }
    c.suppliers = (c.suppliers || []).map((s) => entryFor(c, s) || (out.dropped.push(`${s.supplierId}: không giữ cho cấu hình ${c.engine.model}`), null)).filter(Boolean);
    if (!c.suppliers.length) { out.dropped.push(`cấu hình ${c.engine.model}: không còn nhà cung cấp`); continue; }
    if (!keep.some((x) => sameCfg(x, c))) keep.push(c);
  }
  // (4) configurations the agent took from internet pages (Khoa, 2026-11-12, IB2600594596: Rehlko D440, 1st at 05:05Z,
  // gone at 13:00Z as the agent searched anew): one that stood 1st–3rd when found (webRank) and the new result has no
  // equal of is kept, at most WEB_KEEP a size, its pages read from where they were saved (savePages: the supplier DB's
  // source of the same URL, else genbid-work/config-web); a page saved nowhere leaves its checks unclear, as before.
  // It need not have a supplier (the agent's find may name none). Kept again on every later run that does not choose it.
  const webKeep = [];
  for (const old of oldCfgs.filter((x) => isWebCfg(x) && !x.fromFind && (x.webRank ?? x.rank) <= 3 && !configs.some((c) => sameCfg(c, x))).sort((a, b) => (a.webRank ?? a.rank) - (b.webRank ?? b.rank))) {
    if (webKeep.length >= WEB_KEEP || [...keep, ...webKeep].some((x) => sameCfg(x, old))) continue;
    const c = JSON.parse(JSON.stringify(old));
    c.webRank = old.webRank ?? old.rank;
    c.rank = Math.max(0, ...configs.map((x) => x.rank || 0), ...keep.map((x) => x.rank), ...webKeep.map((x) => x.rank)) + 1;
    c.keptWeb = true;
    for (const part of PARTS) if (c[part]?.src?.kind === "internet") c[part].src = savedSrc(c[part].src, suppliers);
    // Only when the engine's page can be read again (Khoa / điều phối 2026-11-12): a configuration of a run before pages
    // were saved would come back all "unclear" and could rank above ones with a "not met". The alternator's or the
    // controller's page missing leaves those checks unclear, as ever.
    if (c.engine.src?.kind === "internet" && !readWeb(c.engine.src.file)) { out.dropped.push(`cấu hình ${c.engine.model}: trang nguồn của động cơ không còn bản lưu`); continue; }
    c.suppliers = (c.suppliers || []).map((s) => entryFor(c, s) || (out.dropped.push(`${s.supplierId}: không giữ cho cấu hình ${c.engine.model}`), null)).filter(Boolean).map((s) => { if (!old.suppliers?.find((x) => x.supplierId === s.supplierId)?.fromFind) delete s.fromFind; return s; });
    // None left (its row was read again since): the supplier whose saved page it was, with a table row of this engine
    // (a fromLine row too), as mergeFind would join it.
    if (!c.suppliers.length) {
      for (const id of new Set(PARTS.map((p) => c[p]?.src?.saved?.supplierId).filter(Boolean))) {
        const rec = sup.get(id), u = rec && CAT.build([rec]).engines.find((e) => e.key === keyOf(c.engine.model))?.uses.find((x) => x.line);
        const e = u && entryFor(c, { supplierId: id, n: u.n, line: u.line });
        if (e) { delete e.fromFind; c.suppliers.push(e); }
      }
    }
    webKeep.push(c);
  }
  const names = [], webNames = [];
  if (keep.length || webKeep.length) {
    const all = [...keep, ...webKeep], web = new Set(webKeep.map((x) => x.rank));
    const sub = { requirements: JSON.parse(JSON.stringify(result.requirements || [])), configs: all };
    const { result: done } = check(sub, { hsmtText, suppliers, readWeb, origin, basis, sized, cap });
    for (const k of all) if (!done.configs.some((c) => c.rank === k.rank)) out.dropped.push(`cấu hình ${k.engine.model}: bị bỏ khi kiểm lại theo luật của lượt này`);
    for (const c of done.configs) {
      if (web.has(c.rank)) {
        c.keptWeb = true; c.webRank = webKeep.find((x) => x.rank === c.rank).webRank;
        if (!sameReq) c.gaps = [...(c.gaps || []), "Các điểm đối chiếu của cấu hình này là của lần đọc HSMT trước (yêu cầu lượt này khác): bấm Gợi ý lại hoặc Tìm NCC để đối chiếu."];
        configs.push(c); webNames.push(`${c.engine.model}`);
        continue;
      }
      if (!c.suppliers?.length) { out.dropped.push(`cấu hình ${c.engine?.model}: không còn nhà cung cấp`); continue; }
      c.fromFind = true; c.keptFind = true;
      if (!sameReq) c.gaps = [...(c.gaps || []), "Các điểm đối chiếu của cấu hình này là của lần đọc HSMT trước (yêu cầu lượt này khác): bấm Tìm NCC lại để đối chiếu."];
      configs.push(c); names.push(`${c.engine.model}`);
    }
    out.configs = names.length;
    out.web = webNames.length;
  }
  if (out.configs || out.suppliers) {
    result.notes = [...(result.notes || []), `Giữ lại từ Tìm NCC lần trước (không chạy lại agent): ${[out.configs && `${out.configs} cấu hình (${names.join(", ")})`, out.suppliers && `${out.suppliers} nhà cung cấp (${sups.join(", ")})`].filter(Boolean).join("; ")}.${out.configs && !sameReq ? " Yêu cầu lượt này khác lượt trước nên điểm đối chiếu của cấu hình giữ lại là của lần đọc trước." : ""}`];
  }
  if (out.web) {
    result.notes = [...(result.notes || []), `Giữ lại cấu hình tìm trên internet ở lượt trước (không chạy lại agent, đối chiếu lại với trang đã lưu): ${webNames.join(", ")}.${!sameReq ? " Yêu cầu lượt này khác lượt trước nên điểm đối chiếu của cấu hình giữ lại là của lần đọc trước." : ""}`];
  }
  if (out.configs || out.suppliers || out.web) rankConfigs(result);
  return out;
}
// ---------- pages of internet finds kept for the next run (Khoa 2026-11-12, "làm thêm phần lưu trang") ----------
// A configuration the agent took from an internet page names it as src { kind: "internet", url, file: "web/N.txt" } of
// the run's folder, which the next run deletes. savePages keeps each page of the configurations chosen: a page whose URL
// is a source of a supplier record (addToCatalog put it there, suppliers/sources/<id>/<n>.md) is that source; any other
// is copied to genbid-work/config-web/<key>/<size>/<sha1 of URL>.txt (outside git; at most WEB_PAGES a size and
// WEB_MAX_BYTES a page). src.saved records where (a few bytes in configmatch, never the page itself: egress).
export const WEB_KEEP = 2, WEB_PAGES = 12, WEB_MAX_BYTES = 2 * 1024 * 1024;
const CONFIG_WEB = process.env.GENBID_CONFIG_WEB || path.join(path.dirname(TOKEN_FILE), "genbid-work", "config-web");
const isWebCfg = (c) => PARTS.some((p) => c?.[p]?.src?.kind === "internet");
const urlKey = (u) => String(u || "").trim().replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
const pageUrl = (txt) => ((txt || "").split("\n", 1)[0] || "").replace(/^URL:\s*/, "").trim();
// The supplier record's source of this URL with its page saved in the repo. One URL may be saved twice, read apart
// differently (Rehlko d440-0525.pdf: n 2003 and 2008): the one holding `quote` first.
export function catalogPageOf(suppliers, url, sourcesDir = path.join(ROOT, "sources"), quote = "") {
  const k = urlKey(url), found = [];
  if (!k) return null;
  for (const s of suppliers || []) for (const x of s?.sources || []) {
    const f = path.join(sourcesDir, String(s.id), `${x.n}.md`);
    if (urlKey(x.url) === k && fs.existsSync(f)) found.push({ supplierId: s.id, n: x.n, f });
  }
  const q = quote ? norm(quote) : "", hit = (q && found.find((x) => norm(fs.readFileSync(x.f, "utf8")).includes(q))) || found[0];
  return hit ? { supplierId: hit.supplierId, n: hit.n } : null;
}
// A kept configuration's src: the file name check() reads through savedReader.
export function savedSrc(src, suppliers, sourcesDir) {
  const out = { ...src }, at = src.saved && typeof src.saved === "object" ? src.saved : !src.saved ? catalogPageOf(suppliers, src.url, sourcesDir, src.quote) : null;
  if (at) { out.saved = at; out.file = `catalog:${at.supplierId}/${at.n}`; }
  else if (typeof src.saved === "string") out.file = `saved:${src.saved}`;
  return out;
}
// readWeb for kept configurations: "saved:<key>/<size>/<hash>.txt" under config-web, "catalog:<id>/<n>" a supplier
// source; nothing outside those folders.
export function savedReader({ root = CONFIG_WEB, sourcesDir = path.join(ROOT, "sources") } = {}) {
  const inside = (base, rel) => { const p = path.resolve(base, rel); return p.startsWith(path.resolve(base) + path.sep) ? p : null; };
  return (f) => {
    const m = /^(saved|catalog):(.+)$/.exec(String(f || ""));
    if (!m) return null;
    const p = m[1] === "saved" ? inside(root, m[2]) : (/^[\w.-]+\/\d+$/.test(m[2]) ? inside(sourcesDir, `${m[2]}.md`) : null);
    return p && fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  };
}
// keepFound of an older result into a copy of the current one, size by size (restore-web): { result, lines }.
export function restoreWeb(current, older, { suppliers = [], hsmtText = "", root, sourcesDir, origin = "all" } = {}) {
  const result = JSON.parse(JSON.stringify(current || {})), lines = [], readWeb = savedReader({ ...(root ? { root } : {}), ...(sourcesDir ? { sourcesDir } : {}) });
  const pairs = result.sizes ? result.sizes.map((s) => [s, s.result, older?.sizes?.find((x) => sameSize(x, s))?.result]) : [[null, result, older?.sizes ? null : older]];
  for (const [s, cur, prev] of pairs) {
    if (!cur || !prev) continue;
    const before = (cur.configs || []).length;
    const k = keepFound(cur, prev, { suppliers, origin: cur.originAuto?.origin || result.originAuto?.origin || cur.origin || result.origin || origin, hsmtText, readWeb, basis: cur.originBasis, sized: !!result.sizes, reqHash: cur.reqHash || "" });
    const label = s ? `máy ${s.label}: ` : "";
    if (!k.web && !k.configs && !k.suppliers) { lines.push(`${label}không có gì để khôi phục${k.dropped.length ? ` (${k.dropped.join("; ")})` : ""}`); continue; }
    for (const c of (cur.configs || []).filter((c) => c.keptWeb || c.keptFind)) {
      const st = {}; for (const x of c.checks || []) st[x.status] = (st[x.status] || 0) + 1;
      const unread = PARTS.filter((p) => c[p]?.unverified).map((p) => `${p} ${c[p].model}`);
      lines.push(`${label}#${c.rank} ${c.engine?.model}${c.genset?.model ? ` / ${c.genset.model}` : ""} (${c.keptWeb ? "internet" : "Tìm NCC"}; nguồn: ${PARTS.filter((p) => c[p]?.src?.file).map((p) => `${p} ${c[p].src.file}`).join(", ")}) — ${JSON.stringify(st)}; NCC: ${(c.suppliers || []).map((x) => x.supplierId).join(", ") || "không"}${unread.length ? `; chưa đối chiếu được nguồn: ${unread.join(", ")}` : ""}`);
    }
    lines.push(`${label}${before} → ${(cur.configs || []).length} cấu hình${k.dropped.length ? `; bỏ: ${k.dropped.join("; ")}` : ""}`);
  }
  return { result, lines };
}
export const sizeTag = (size) => (size ? `${size.kva ?? size.cap?.value}${size.kva != null ? "kVA" : size.cap?.unit || ""}`.replace(/[^\w.-]/g, "") : "all");
// Keeps the pages of the configurations in `result` (src.saved), webRank on each configuration the agent took from the
// internet, and removes the pages of that size no configuration points at any more. Returns { catalog, saved, skipped }.
export function savePages(result, dir, { key, size = null, suppliers = [], root = CONFIG_WEB, sourcesDir = path.join(ROOT, "sources") } = {}) {
  const out = { catalog: 0, saved: 0, skipped: [] }, rel = `${String(key).replace(/[^\w-]/g, "")}/${sizeTag(size)}`, folder = path.join(root, rel), used = new Set();
  for (const c of result.configs || []) {
    if (isWebCfg(c) && c.webRank == null) c.webRank = c.rank;
    for (const part of PARTS) {
      const src = c[part]?.src;
      if (src?.kind !== "internet") continue;
      if (typeof src.saved === "string") { used.add(path.basename(src.saved)); continue; }
      if (src.saved) continue;
      const txt = src.file && /^web\/\d+\.txt$/.test(src.file) && fs.existsSync(path.join(dir, src.file)) ? fs.readFileSync(path.join(dir, src.file), "utf8") : null;
      // The supplier DB's copy only when it holds the quote (the run's own page may be read apart otherwise).
      const url = src.url || pageUrl(txt), cat = catalogPageOf(suppliers, url, sourcesDir, src.quote);
      const holds = cat && (!src.quote || norm(fs.readFileSync(path.join(sourcesDir, String(cat.supplierId), `${cat.n}.md`), "utf8")).includes(norm(src.quote)));
      if (cat && (holds || !txt)) { src.saved = cat; out.catalog++; continue; }
      if (!txt) { out.skipped.push(`${part} ${c[part].model}: không có trang`); continue; }
      if (Buffer.byteLength(txt) > WEB_MAX_BYTES) { out.skipped.push(`${part} ${c[part].model}: trang quá lớn`); continue; }
      const name = `${createHash("sha1").update(urlKey(url) || txt).digest("hex").slice(0, 12)}.txt`;
      if (!used.has(name) && used.size >= WEB_PAGES) { out.skipped.push(`${part} ${c[part].model}: quá ${WEB_PAGES} trang`); continue; }
      fs.mkdirSync(folder, { recursive: true });
      if (!used.has(name)) { fs.writeFileSync(path.join(folder, name), txt, "utf8"); out.saved++; }
      used.add(name); src.saved = `${rel}/${name}`;
    }
  }
  if (fs.existsSync(folder)) for (const f of fs.readdirSync(folder)) if (!used.has(f)) fs.rmSync(path.join(folder, f), { force: true });
  return out;
}
const mergeText = (m) => (!m ? "chưa có cấu hình gợi ý để bổ sung (bấm Gợi ý)" : !m.joined.length && !m.created.length ? "không có dòng bảng nào đúng công suất và xuất xứ để bổ sung vào cấu hình" : [m.joined.length && `bổ sung ${m.joined.map((j) => `${j.supplierId} vào cấu hình #${j.rank}${j.label ? ` máy ${j.label}` : ""}`).join(", ")}`, m.created.length && `thêm ${m.created.length} cấu hình mới${m.checked?.checked ? ` (đã đối chiếu HSMT ${m.checked.checked} cấu hình)` : " (chưa đối chiếu đủ HSMT)"}, mỗi cấu hình chỉ có nhà cung cấp vừa tìm được (${m.created.map((c) => c.supplierId).join(", ")})`].filter(Boolean).join("; "));

async function find(req, suppliers) {
  const key = req.key, tried = [];
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = { notifyNo: req.notifyNo || key, bidName: req.bidName, origin: req.origin, extra: req.extra, ...(req.target ? { target: req.target } : {}), requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" };
    return post([...(result ? [{ coll: "findmatch", id: key, data: { at, result } }] : []), { coll: "findreq", id: key, data: JSON.parse(JSON.stringify(reqData)) }]);
  };
  try {
    for (const engine of FIND_ENGINES) {
      const dir = path.join(os.tmpdir(), "genbid-find", `${key}-${engine}`);
      fs.rmSync(dir, { recursive: true, force: true });
      try {
        const { cap, origin } = await findPrep(key, dir, req, suppliers);
        const r = await (engine === "gemini" ? runGemini(dir, FIND_INPUT) : runClaude(dir, FIND_INPUT));
        fs.writeFileSync(path.join(os.tmpdir(), `genbid-find-${key}-${engine}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
        if (r.error && !fs.existsSync(path.join(dir, "newCatalog.json"))) { tried.push({ engine: ENGINE[engine], error: r.error }); continue; }
        const checked = await findCheck(dir, suppliers, cap), fit = checked.filter((c) => !c.errors.length && c.fits);
        const info = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, "find.json"), "utf8")); } catch { return {}; } })();
        const dropped = checked.filter((c) => !fit.includes(c)).map((c) => ({ supplierId: c.id, error: c.errors.length ? `verify.mjs: ${c.errors.slice(0, 3).join("; ")}` : `không có dòng sản phẩm đúng công suất ${capStr(cap)}` }));
        if (!fit.length) { tried.push({ engine: ENGINE[engine], error: info.summary || "không tìm được nhà cung cấp nào qua được kiểm tra", dropped }); continue; }
        // Only the suppliers that passed and fit go to the catalog.
        const ids = new Set(fit.map((c) => c.from || c.id));
        fs.writeFileSync(path.join(dir, "newCatalog.json"), JSON.stringify(JSON.parse(fs.readFileSync(path.join(dir, "newCatalog.json"), "utf8")).filter((e) => ids.has(e?.id)), null, 1), "utf8");
        const { added, records } = await addToCatalog(dir, key, suppliers, { branch: `ncc/${key.toLowerCase()}-${engine}`, title: `Nhà cung cấp: Tìm NCC gói ${key} (${ENGINE[engine]})`,
          body: `Nút Tìm NCC ở tab Cấu hình gợi ý gói ${key}: ${ENGINE[engine]} tìm trên internet nhà cung cấp phù hợp yêu cầu kỹ thuật${cap ? ` (${capStr(cap)})` : ""}. Bản ghi đã qua verify.mjs và đã đăng lên web.` });
        if (!added.some((a) => !a.error)) { tried.push({ engine: ENGINE[engine], error: "bản ghi không qua được verify.mjs của repo", dropped: added }); continue; }
        const merged = await mergeFindIntoConfig(key, records, { cap, origin, suppliers }).catch((e) => ({ error: e.message }));
        const configMerge = merged?.error ? `chưa bổ sung được vào cấu hình gợi ý: ${merged.error}` : mergeText(merged);
        await done({ result: { engine: ENGINE[engine], cap, ...(req.target ? { target: req.target } : {}), ...(extraOf(req) ? { extra: extraOf(req) } : {}), summary: info.summary || "", added: [...added, ...dropped], skipped: info.skipped || [], notes: info.notes || [], tried, configMerge } });
        console.log(`${key}: Tìm NCC (${ENGINE[engine]}) bổ sung ${added.filter((a) => !a.error).length} nhà cung cấp; cấu hình: ${configMerge}`);
        return;
      } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    }
    await done({ result: { engine: "", ...(req.target ? { target: req.target } : {}), ...(extraOf(req) ? { extra: extraOf(req) } : {}), summary: "Không tìm được nhà cung cấp mới nào phù hợp yêu cầu kỹ thuật và qua được kiểm tra nguồn.", added: [], skipped: [], notes: [], tried } });
    console.log(`${key}: Tìm NCC không tìm được ai`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: Tìm NCC lỗi ${e.message}`);
  }
}

// ---------- Tìm Thông Số (specreq/<id> → specmatch/<id>) ----------
// The Tìm Thông Số button of a supplier's page, for the superadmin only (Khoa, 2026-11-06): Claude looks on the
// supplier's own site for the engine, alternator and controller of its gensets, following the skill
// bot/claude/skills/tim-thong-so-ncc/SKILL.md (copied as prompt.md), and writes the new parts of the record as Tìm NCC
// does (newCatalog.json: sources, specTables, productLines, controllers). The same checks (findCheck, verify.mjs) and
// the same way into the catalog (addToCatalog: posted to the web, a PR into the repo).
const SPEC_SKILL = path.join(ROOT, "..", "bot", "claude", "skills", "tim-thong-so-ncc", "SKILL.md");
const SPEC_INPUT = "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md, tìm trên trang của nhà cung cấp, chỉ ghi newCatalog.json và spec.json (cùng các trang lưu bằng lệnh save). Chạy không người trông, không ai trả lời câu hỏi.";
// What the catalog reads from a record: engines, alternators and controllers, each with its gensets and power.
export function partsOf(rec) {
  const b = CAT.build([rec]), pw = (e) => (e.kva ? `${e.kva[0] === e.kva[1] ? e.kva[0] : e.kva.join("–")} kVA` : e.kw ? `${e.kw[0] === e.kw[1] ? e.kw[0] : e.kw.join("–")} kW` : "");
  const gs = (e) => [...new Set(e.uses.map((u) => u.genset).filter(Boolean))];
  return {
    engines: b.engines.map((e) => ({ model: e.model, make: e.make || "", gensets: gs(e), power: pw(e) })),
    alternators: b.alternators.map((e) => ({ model: e.model, make: e.make || "", gensets: gs(e), power: pw(e) })),
    controllers: b.controllers.filter((c) => !c.brandOnly).map((c) => ({ model: c.model, make: c.make || "" })),
  };
}
const partsText = (p) => (!p ? "" : [p.engines.length && `động cơ: ${p.engines.map((e) => `${e.model}${e.power ? ` (${e.power})` : ""}`).join(", ")}`,
  p.alternators.length && `đầu phát: ${p.alternators.map((e) => e.model).join(", ")}`, p.controllers.length && `bộ điều khiển: ${p.controllers.map((e) => e.model).join(", ")}`].filter(Boolean).join("; ") || "không đọc được động cơ, đầu phát, bộ điều khiển nào");
// Why Tìm Thông Số is not run for a supplier ("" when it is): no website in its record (spec-skip.mjs; also used by gaps.mjs --queue).
export { specSkip };
export async function specPrep(id, dir, suppliers) {
  const s = suppliers.find((x) => x.id === id);
  if (!s) throw new Error(`không có nhà cung cấp ${id}`);
  const skip = specSkip(s);
  if (skip) throw new Error(skip);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(path.join(dir, "web"), { recursive: true });
  fs.writeFileSync(path.join(dir, "supplier.json"), JSON.stringify(s, null, 1), "utf8");
  fs.writeFileSync(path.join(dir, "suppliers.json"), JSON.stringify(suppliers), "utf8");
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ mode: "spec", id }), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(SPEC_SKILL, "utf8").replace(/^---[\s\S]*?\n---\s*\n/, ""), "utf8");
  // Long lists are cut (a big maker has hundreds of tables): enough for the agent to see what is there.
  const cut = (list, n = 80) => (list.length > n ? [...list.slice(0, n), `- … và ${list.length - n} mục nữa (xem supplier.json)`] : list);
  const p = partsOf(s), line = (x) => `- ${x.model}${x.make ? ` (${x.make})` : ""}${x.power ? `, ${x.power}` : ""}${x.gensets?.length ? `, tổ máy ${x.gensets.slice(0, 12).join(", ")}${x.gensets.length > 12 ? "…" : ""}` : ""}`;
  fs.writeFileSync(path.join(dir, "input.md"), [
    `# Tìm thông số nhà cung cấp ${id}`, "",
    `Lệnh lưu trang web: node "${SCRIPT}" save --dir . --url "<url>"`,
    `Lệnh kiểm tra newCatalog.json: node "${SCRIPT}" spec-check --dir .`, "",
    "## Nhà cung cấp",
    `- id: ${id} (ghi đúng id này trong newCatalog.json)`, `- Tên: ${[s.names?.en, s.names?.zh, s.names?.vi].filter(Boolean).join(" / ")}`,
    `- Vai trò: ${s.role || ""}; quốc gia: ${s.country || ""}`, `- Website: ${s.website || "(không có)"}`,
    ...(s.productLines || []).filter((l) => l.power).map((l) => `- Dòng sản phẩm: ${l.kind} ${l.series || ""} ${l.power.min}–${l.power.max} ${l.power.unit} (${l.power.rating})`), "",
    "## Nguồn đã có", ...cut((s.sources || []).map((x) => `- [${x.n}] ${x.url} (tier ${x.tier || "?"})`)), "",
    "## Bảng thông số đã có (đừng thêm lại)", ...((s.specTables || []).length ? cut(s.specTables.map((t) => `- [${t.n}] ${t.title || "(không tiêu đề)"}: ${t.rows.length} dòng; dòng đầu: ${String(t.rows[0] || "").slice(0, 160)}`)) : ["(chưa có)"]), "",
    "## Danh mục đọc được từ hồ sơ hiện tại",
    "### Động cơ", ...(p.engines.length ? cut(p.engines.map(line)) : ["(chưa có)"]),
    "### Đầu phát", ...(p.alternators.length ? cut(p.alternators.map(line)) : ["(chưa có)"]),
    "### Bộ điều khiển", ...(p.controllers.length ? p.controllers.map(line) : ["(chưa có)"]), "",
  ].join("\n"), "utf8");
}
// findCheck for the supplier's new parts, with what the catalog reads from them.
async function specChecked(dir, suppliers) {
  const { id } = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
  const res = await findCheck(dir, suppliers, null);
  return res.map((c) => ({ ...c, errors: [...c.errors, ...(c.id && c.id !== id ? [`id khác nhà cung cấp cần tìm (${id})`] : [])], parts: c.rec ? partsOf(c.rec) : null }));
}
// io: addToCatalog's (tests).
export async function specPost(dir, suppliers, req = {}, io = undefined) {
  const { id } = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
  const info = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf8")); } catch { return {}; } })();
  const checked = await specChecked(dir, suppliers);
  const ok = checked.filter((c) => c.id === id && !c.errors.length && c.rec && (c.rec.specTables?.length || c.rec.controllers?.length || c.rec.productLines?.length));
  const base = { summary: info.summary || "", skipped: info.skipped || [], notes: info.notes || [] };
  if (!ok.length) {
    const why = checked.filter((c) => c.id).length ? checked.map((c) => (c.errors.length ? `${c.id || "?"}: ${c.errors.slice(0, 3).join("; ")}` : `${c.id}: không có gì mới`)).join(" · ") : "không bổ sung được gì mới";
    return { ...base, added: [], error: why };
  }
  fs.writeFileSync(path.join(dir, "newCatalog.json"), JSON.stringify(JSON.parse(fs.readFileSync(path.join(dir, "newCatalog.json"), "utf8")).filter((e) => e?.id === id), null, 1), "utf8");
  const { added } = await addToCatalog(dir, id, suppliers, { branch: `specs/${id}`, title: `Nhà cung cấp: Tìm thông số ${id}`,
    body: `Nút Tìm Thông Số ở màn Nhà cung cấp${req.by ? ` (${req.by})` : ""}: Claude tìm trên trang của nhà cung cấp động cơ, đầu phát, bộ điều khiển của các tổ máy (skill tim-thong-so-ncc). Bản ghi đã qua verify.mjs và đã đăng lên web.`, io });
  const good = added.find((a) => !a.error);
  return { ...base, added, ...(good ? { found: ok[0].parts } : { error: added.map((a) => a.error).filter(Boolean).join("; ") || "bản ghi không qua được verify.mjs của repo" }) };
}
async function specJob(req, suppliers) {
  const id = req.key, dir = path.join(os.tmpdir(), "genbid-spec", id);
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    return post([...(result ? [{ coll: "specmatch", id, data: { at, result } }] : []), { coll: "specreq", id, data: { spec: true, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || result?.error || "" } }]);
  };
  try {
    await specPrep(id, dir, suppliers);
    const r = await runClaude(dir, SPEC_INPUT);
    fs.writeFileSync(path.join(os.tmpdir(), `genbid-spec-${id}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
    if (r.error && !fs.existsSync(path.join(dir, "newCatalog.json"))) throw new Error(`Claude: ${r.error.message || r.error}`);
    const result = await specPost(dir, suppliers, req);
    await done({ result });
    console.log(`${id}: Tìm thông số ${result.error ? `không bổ sung được (${result.error})` : partsText(result.found)}`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${id}: Tìm thông số lỗi ${e.message}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// ---------- run: every pending request at once ----------
// Khoa, 2026-11-03: Gợi ý cấu hình, Tìm NCC and Gợi ý giá đấu of different tenders run at the same time, with no limit.
// The queue is read again every POLL_MS, so a request sent mid-run starts then instead of after the run. Gợi ý and
// Tìm NCC of one tender take turns (both write configmatch/<key>); so do two Gợi ý giá đấu of one tender. A Gợi ý giá
// đấu runs in a child process (bidprice-bot.mjs imports this script; an import of it from here never settles, #249).
// After RUN_MAX_MS no new request starts and the run ends when the started ones are done (the bot stops a run after
// 3 hours); the bot starts the next run for what is left.
const POLL_MS = 20e3, RUN_MAX_MS = 150 * 60e3;
function bidpriceChild(key) {
  return new Promise((ok) => {
    const p = spawn(process.execPath, [path.join(ROOT, "bidprice-bot.mjs"), "run", "--key", key], { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    const timer = setTimeout(() => p.kill(), 3 * 60 * 60e3);
    const pass = (d) => process.stdout.write(d);
    p.stdout.on("data", pass); p.stderr.on("data", pass);
    p.on("error", (e) => { clearTimeout(timer); console.log(`${key}: Gợi ý giá đấu không chạy được (${e.message})`); ok(); });
    p.on("close", () => { clearTimeout(timer); ok(); });
  });
}
async function runAll(lock) {
  const t0 = Date.now(), started = new Set(), busy = new Set(), counts = { config: 0, find: 0, bidprice: 0, spec: 0 };
  let running = 0, wake = () => {};
  const t = () => `[${Math.round((Date.now() - t0) / 1000)}s]`;
  for (let first = true; ; first = false) {
    let lists;
    try { lists = await Promise.all([api("kind=config"), api("kind=find"), api("kind=bidprice"), api("kind=spec").catch(() => [])]); }
    catch (e) { if (first) throw e; console.log(`${t()} không đọc được hàng chờ (${e.message}), thử lại sau`); lists = [[], [], [], []]; }
    const [pending, finds, prices, specs] = lists;
    // Only Gợi ý giá đấu requests the web wrote (basis): an older API answers an unknown kind with the file requests.
    const jobs = [...pending.map((r) => ["config", r]), ...finds.map((r) => ["find", r]), ...prices.filter((r) => r.basis).map((r) => ["bidprice", r]), ...(Array.isArray(specs) ? specs : []).filter((r) => r.spec).map((r) => ["spec", r])]
      .map(([kind, req]) => ({ kind, req, sig: `${kind}:${req.key}|${req.requestedAt}`, lane: `${kind === "bidprice" ? "bp" : kind === "spec" ? "spec" : "cfg"}:${req.key}` }))
      .filter((j) => !started.has(j.sig));
    const late = Date.now() - t0 > RUN_MAX_MS;
    let suppliers = null;
    for (const j of late ? [] : jobs) {
      if (busy.has(j.lane)) continue;
      // The supplier DB as it is now: a Tìm NCC that just finished may have added to it.
      if (j.kind !== "bidprice" && !suppliers) suppliers = (await allDocs("supplier")).map((d) => d.data);
      started.add(j.sig); busy.add(j.lane); running++; counts[j.kind]++;
      console.log(`${t()} bắt đầu ${{ config: "Gợi ý cấu hình", find: "Tìm NCC", bidprice: "Gợi ý giá đấu", spec: "Tìm thông số" }[j.kind]} ${j.req.key}`);
      const work = j.kind === "config" ? answer(j.req, suppliers) : j.kind === "find" ? find(j.req, suppliers) : j.kind === "spec" ? specJob(j.req, suppliers) : bidpriceChild(j.req.key);
      work.catch((e) => console.log(`${j.req.key}: lỗi ${e.message}`)).finally(() => { busy.delete(j.lane); running--; wake(); });
    }
    if (!running && (late || !jobs.length)) break;
    try { const now = new Date(); fs.utimesSync(lock, now, now); } catch {}
    // Next look at the queue after POLL_MS, or as soon as a request is done (its tender's turn may be next).
    await new Promise((ok) => { const timer = setTimeout(ok, POLL_MS); wake = () => { clearTimeout(timer); ok(); }; });
  }
  return `${counts.config} yêu cầu gợi ý cấu hình, ${counts.find} yêu cầu Tìm NCC, ${counts.bidprice} yêu cầu gợi ý giá đấu, ${counts.spec} yêu cầu tìm thông số (${Math.round((Date.now() - t0) / 60e3)} phút)`;
}

const cmd = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT) {
  if (cmd === "save") console.log(await save(arg("dir", "."), arg("url")));
  else if (cmd === "prep") {
    // --size N: the N-th size (from 1) of a tender of several, as run does it.
    const sizes = arg("size") ? await sizesFor(arg("key"), arg("bid-name")) : [], size = sizes[Number(arg("size")) - 1];
    if (arg("size") && !size) { console.error(`Gói không có cỡ máy thứ ${arg("size")} (đọc được: ${sizes.map(sizeText).join("; ") || "không"})`); process.exit(2); }
    console.log(JSON.stringify(await prep(arg("key"), arg("out"), { bidName: arg("bid-name"), origin: arg("origin") }, null, size ? { size, sizes } : null)));
  }
  else if (cmd === "check") {
    // Offline in a folder made by prep (suppliers.json, meta.json); elsewhere the supplier DB is read from the web.
    const dir = arg("dir", "."), local = (f) => (fs.existsSync(path.join(dir, f)) ? JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) : null);
    const { problems, result, hints, uncovered, missing } = checkDir(dir, local("suppliers.json") || (await allDocs("supplier")).map((d) => d.data), [], local("meta.json")?.origin);
    fs.writeFileSync(path.join(dir, "result.checked.json"), JSON.stringify(result, null, 1));
    console.log(problems.length ? problems.join("\n") : "Không có điểm nào chưa khớp nguồn.");
    const fix = fixNotes(problems, result);
    if (fix) console.log(fix);
    const others = (result.requirements || []).filter((r) => r.code === OTHER_CODE);
    if (others.length) console.log(`\nYÊU CẦU MÃ other (${others.length}; xem lại bảng Mã yêu cầu trong input.md, mã nào hợp thì đổi code): ${others.map((r) => r.item).join("; ")}`);
    if (missing?.length) console.log(`\nMÃ YÊU CẦU CHƯA CÓ — ${missing.length} mã mà HSMT có dòng nói tới nhưng requirements chưa có (code dò chữ, có thể nhầm: đọc dòng đó trong hsmt.txt; là yêu cầu của tổ máy / động cơ / đầu phát / bộ điều khiển thì thêm requirement với code đó và check cho mọi cấu hình, không phải thì bỏ qua):\n${missing.map((m) => `- ${m.code} (${m.item}, ${m.part}): ${JSON.stringify(m.line.slice(0, 160))}`).join("\n")}`);
    // "unclear" checks whose sources have a line about them (config-prompt.md: read each, set met / not_met if it says).
    if (hints.length) console.log(`\nCÓ THỂ TRA ĐƯỢC — ${hints.length} mục chưa rõ mà nguồn có dòng liên quan (đọc dòng đó: nêu đạt / không đạt thì sửa, không nói thì để chưa rõ):\n${hints.join("\n")}`);
    // Đồng bộ thương hiệu, written by the code: the agent needs it to decide on step 4 (config-prompt.md).
    if (uncovered?.length) console.log(`\nCÓ THỂ SÓT YÊU CẦU — ${uncovered.length} dòng thông số của phân tích chưa có yêu cầu nào nói tới (đọc HSMT: là yêu cầu về tổ máy / động cơ / đầu phát / bộ điều khiển thì thêm vào requirements và checks, không phải thì bỏ qua):\n${uncovered.join("\n")}`);
    if (result.brandSync) {
      const st = { met: "đạt", not_met: "KHÔNG ĐẠT", unclear: "chưa rõ" }, lines = (result.configs || []).map((c) => { const x = c.checks.find((x) => x.item === SYNC_ITEM); return `#${c.rank} ${st[x?.status] || "?"}: ${x?.offered || ""}. ${x?.note || ""}`; });
      console.log(`\nĐỒNG BỘ THƯƠNG HIỆU (code kiểm):\n${lines.join("\n")}${lines.some((l) => / đạt:/.test(l)) ? "" : "\nKhông cấu hình nào đạt: làm bước 4 (tìm tổ máy chính hãng trên internet)."}`);
    }
  } else if (cmd === "spec-prep") {
    const id = arg("id"), out = arg("out") || path.join(os.tmpdir(), "genbid-spec", id);
    await specPrep(id, out, (await allDocs("supplier")).map((d) => d.data));
    console.log(`Đã chuẩn bị ${out}`);
  } else if (cmd === "spec-check") {
    const dir = arg("dir", "."), res = await specChecked(dir, JSON.parse(fs.readFileSync(path.join(dir, "suppliers.json"), "utf8")));
    for (const c of res) console.log(`${c.id || "?"}: ${c.errors.length ? `KHÔNG QUA — ${c.errors.join("; ")}` : `qua verify.mjs; phần mới cho ra ${partsText(c.parts)}`}`);
    if (!res.length) console.log("newCatalog.json rỗng.");
  } else if (cmd === "spec-post") {
    const dir = arg("dir", "."), { id } = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
    const result = await specPost(dir, (await allDocs("supplier")).map((d) => d.data), { by: "Claude Code (chạy tay)" });
    await post([{ coll: "specmatch", id, data: { at: new Date().toISOString(), result } }]);
    console.log(result.error ? `Không bổ sung được: ${result.error}` : `Đã bổ sung: ${partsText(result.found)}`);
  } else if (cmd === "spec") {
    await specJob({ key: arg("id"), requestedAt: new Date().toISOString(), by: "Claude Code (chạy tay)", from: "cli" }, (await allDocs("supplier")).map((d) => d.data));
  } else if (cmd === "find-check") {
    // Offline in a folder made for Tìm NCC (suppliers.json, meta.json).
    const dir = arg("dir", "."), meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
    const res = await findCheck(dir, JSON.parse(fs.readFileSync(path.join(dir, "suppliers.json"), "utf8")), meta.cap);
    for (const c of res) console.log(`${c.from ? `${c.from} → ${c.id} (cùng website và quốc gia với nhà cung cấp đã có, sẽ gộp vào đó)` : c.id || "?"}: ${c.errors.length ? `KHÔNG QUA — ${c.errors.join("; ")}` : "qua verify.mjs"}${c.errors.length ? "" : c.fits ? ", phù hợp công suất" : `, CHƯA có dòng sản phẩm phù hợp công suất ${capStr(meta.cap)}`}${c.errors.length ? "" : c.rows?.length ? `; dòng động cơ đúng công suất: ${[...new Set(c.rows)].join(", ")}` : `; CHƯA có dòng bảng nào cho ra động cơ đúng công suất (specTables cần dòng ghi cả model động cơ và công suất, hoặc productLines tổ máy một model có engineModels một động cơ và power min = max, với một dòng specTables cùng nguồn có số công suất đó), nên không vào được cấu hình gợi ý`}`);
    if (!res.length) console.log("newCatalog.json rỗng.");
  } else if (cmd === "post") {
    const dir = arg("dir", "."), { result } = checkDir(dir, (await allDocs("supplier")).map((d) => d.data));
    console.log(await post([{ coll: "configmatch", id: arg("key"), data: { at: new Date().toISOString(), result } }, { coll: "configreq", id: arg("key"), data: { notifyNo: arg("key"), requestedAt: arg("requested-at"), doneAt: new Date().toISOString(), error: "" } }]));
  } else if (cmd === "merge-find") {
    // The suppliers of the stored findmatch/<key>, read again from the web, merged into configmatch/<key>.
    const key = arg("key"), f = await doc("findmatch", key), ids = new Set((f?.result?.added || []).filter((a) => !a.error).map((a) => a.supplierId));
    const suppliers = (await allDocs("supplier")).map((d) => d.data), records = suppliers.filter((s) => ids.has(s.id));
    const m = await mergeFindIntoConfig(key, records, { cap: f?.result?.cap, origin: (await doc("findreq", key))?.origin, suppliers });
    if (f?.result) await post([{ coll: "findmatch", id: key, data: { ...f, result: { ...f.result, configMerge: mergeText(m) } } }]);
    console.log(`${key}: ${mergeText(m)}${m ? ` ${JSON.stringify(m)}` : ""}`);
  } else if (cmd === "restore-web") {
    // Read-only: what keepFound would put back into configmatch/<key> from an older result (--from, a configmatch.json
    // of doc-cache, a configmatch document or a result). Prints it and, with --out, writes the whole result there;
    // nothing is posted (whoever reviews it posts it).
    const key = arg("key"), read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
    const resultOf = (j) => j?.docs?.[key]?.d?.result || j?.[key]?.d?.result || j?.result || j;
    const old = resultOf(read(arg("from"))), cur = arg("current") ? resultOf(read(arg("current"))) : (await doc("configmatch", key))?.result;
    const suppliers = arg("suppliers") ? Object.values(read(arg("suppliers")).docs || {}).map((x) => x.d).filter(Boolean) : (await api("kind=docs&coll=supplier")).map((d) => d.data);
    const hsmtText = arg("hsmt") ? fs.readFileSync(arg("hsmt"), "utf8") : (await hsmtTextOf(key)).text;
    const origin = arg("origin") || (await doc("configreq", key).catch(() => null))?.origin || "all";
    const { result, lines } = restoreWeb(cur, old, { suppliers: suppliers.filter((s) => s && s.status !== "incomplete"), hsmtText, origin: ORIGIN[origin] ? origin : "all" });
    console.log(lines.join("\n") || "Không có gì để khôi phục.");
    if (arg("out")) { fs.writeFileSync(arg("out"), JSON.stringify(result, null, 1), "utf8"); console.log(`Đã ghi ${arg("out")} (chưa gửi lên web).`); }
  } else if (cmd === "run") {
    const lock = path.join(os.tmpdir(), "genbid-config.lock");
    // A lock left by a run that died (killed, node exit 13) used to hold every request for an hour (2026-11-03): it counts
    // only while the process that wrote it is alive, and for at most 4 hours (the bot stops a run after 3).
    const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
    if (fs.existsSync(lock) && Date.now() - fs.statSync(lock).mtimeMs < 4 * 60 * 60e3 && alive(Number(fs.readFileSync(lock, "utf8")) || -1)) { console.log("SUMMARY: đang có lượt khác chạy"); process.exit(4); }
    fs.writeFileSync(lock, String(process.pid));
    try { console.log(`SUMMARY: ${await runAll(lock)}`); }
    finally { fs.rmSync(lock, { force: true }); }
  } else { console.error("usage: config-bot.mjs run | prep --key K --out D | save --dir D --url U | check --dir D | post --dir D --key K --requested-at T"); process.exit(2); }
}
