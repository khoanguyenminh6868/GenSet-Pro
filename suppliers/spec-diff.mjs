// Kiểm chéo TOÀN BỘ bản ghi danh mục giữa hai bản mã đọc (việc chat-luong-2, 18/11/2026; gốc là cmpSpec.cjs, swap.cjs,
// verSpec.cjs của đợt rà soát lệch dòng / cột, PR #894). Mỗi bên là một thư mục gốc repo (web/catalog.js, web/spec-norm.js,
// web/conversions.js, suppliers/cn) hoặc `git:<ref>` (rút bằng git archive). Không lấy mẫu: so MỌI trường của MỌI bản ghi.
//   node suppliers/spec-diff.mjs <cũ> <mới> [--out đầy-đủ.txt] [--md tóm-tắt.md] [--swap-list tệp.txt] [--gate]
//     --out        bản đầy đủ y như cmpSpec.txt (theo bảng: tiêu đề, dòng, từng thay đổi) để soát bằng mắt
//     --md         bảng tóm tắt Markdown (CI đăng vào PR): số bản ghi theo NCC, mỗi dạng thay đổi vài ví dụ, đảo vai, tự kiểm số
//     --swap-list  danh sách ca đảo vai động cơ ↔ đầu phát của bên mới (như swap.cjs)
//     --gate       thoát 1 khi số ca đảo vai tăng (thay đổi khác là chủ ý, không chặn)
//     --label-old / --label-new   tên hai bên trong tiêu đề bảng tóm tắt
// Ba phép kiểm:
// - diff: khoá bản ghi = NCC | n | bảng | dòng | loại + số thứ tự trùng; so model, genset, công suất, tần số, other, hãng, specs.
// - swaps: mã mà ≥ 3 NCC KHÁC đọc ở vai kia (động cơ ↔ đầu phát) và không NCC khác nào đọc ở vai này.
// - verify: mỗi thông số đổi / thêm tự kiểm bằng quan hệ số với công suất của chính dòng (dòng điện, khối lượng, ...).
// - norm: khi spec-norm.js hay conversions.js khác nhau, so kết quả normalizeRecord của mọi thông số.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { summary as unreadSummary } from "./unread-tables.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ---- nạp một bên ----
// Mỗi tệp web chạy trong một `window` giả riêng, nên hai bản catalog.js / spec-norm.js sống cạnh nhau trong một tiến trình.
function evalWeb(file, win) {
  if (!fs.existsSync(file)) return;
  // `module` để undefined: catalog.js khi đó gắn vào `window` (root) thay vì module.exports.
  new Function("window", "module", fs.readFileSync(file, "utf8"))(win, undefined);
}
export function loadSide(dir) {
  const win = {};
  for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) evalWeb(path.join(dir, "web", f), win);
  const cn = path.join(dir, "suppliers", "cn");
  const S = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8")));
  const text = (f) => (fs.existsSync(path.join(dir, "web", f)) ? fs.readFileSync(path.join(dir, "web", f), "utf8") : "");
  return { C: win.GenbidCatalog, SN: win.GenbidSpecNorm, S, normText: text("spec-norm.js") + text("conversions.js") };
}
// `git:<ref>` → thư mục tạm chỉ có các tệp cần (git archive | tar).
export function checkoutRef(ref, cwd = ROOT) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spec-diff-"));
  const files = ["web/catalog.js", "web/spec-norm.js", "web/conversions.js", "suppliers/cn"].filter((f) => {
    try { execFileSync("git", ["cat-file", "-e", `${ref}:${f}`], { cwd, stdio: "ignore" }); return true; } catch { return false; }
  });
  const tar = execFileSync("git", ["archive", "--format=tar", ref, ...files], { cwd, maxBuffer: 1 << 30 });
  execFileSync("tar", ["-x", "-C", dir], { input: tar, maxBuffer: 1 << 30 });
  return dir;
}

// ---- bản ghi ----
// Mọi bản ghi fromSupplier của mọi NCC (trừ incomplete), khoá như cmpSpec.cjs; bản ghi trùng khoá đánh #0, #1...
export function records({ C, S }) {
  const m = new Map();
  for (const s of S) {
    if (s.status === "incomplete") continue;
    const seen = new Map();
    for (const o of C.fromSupplier(s)) {
      let k = [o.supplierId, o.n, o.table, o.row ?? "L", o.kind].join("|");
      const c = seen.get(k) || 0;
      seen.set(k, c + 1);
      m.set(k + "#" + c, o);
    }
  }
  return m;
}
// Bản ghi tổ máy của bảng không ghi mã động cơ (`gensetsOf`, danh sách GENSET_TABLES; việc C PR 1), khoá như records().
// So riêng: không vào đếm bản ghi / đảo vai / tự kiểm của fromSupplier. Bên chưa có gensetsOf → rỗng (mọi bản ghi là "THÊM").
export function gensetRecords({ C, S }) {
  const m = new Map();
  if (!C.gensetsOf) return m;
  for (const s of S) {
    if (s.status === "incomplete") continue;
    for (const o of C.gensetsOf(s)) m.set([o.supplierId, o.n, o.table, o.row, o.kind].join("|") + "#0", o);
  }
  return m;
}

const pw = (p) => (p ? ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k[0].toUpperCase()} ${p[k].kVA ?? "·"}/${p[k].kW ?? "·"}`).join(" ") : "∅");
const specMap = (o) => Object.fromEntries((o.specs || []).map((s, i, l) => [s.key + (l.slice(0, i).filter((t) => t.key === s.key).length || ""), s]));
const parts = (x) => ({ model: x.model, genset: x.genset ?? "", power: pw(x.power), freq: x.freq, other: x.other, makes: (x.makes || []).map((m) => m.name).join(","), specs: Object.fromEntries(Object.entries(specMap(x)).map(([k, s]) => [k, `${s.value}`])) });
const FIELDS = ["model", "genset", "power", "freq", "other", "makes"];
const tableKey = (o) => `${o.supplierId} n${o.n} bảng ${o.table}`;

// ---- 1. so mọi trường ----
// changes: mỗi thay đổi một mục { kind, o, txt } (kind = "model", "weight thêm", "THÊM bản ghi"...); tabs như cmpSpec.
export function diff(a, b) {
  const tabs = new Map(), kinds = {}, changes = [];
  let n = 0, onlyA = 0, onlyB = 0;
  const push = (o, txt) => {
    const tk = tableKey(o);
    if (!tabs.has(tk)) tabs.set(tk, { header: o.header || o.lines?.header || [], rows: [] });
    tabs.get(tk).rows.push({ row: o.row, line: String(o.line || "(bảng nhãn)").slice(0, 190), txt });
  };
  for (const [k, o] of a) {
    const p = b.get(k);
    if (!p) { onlyA++; push(o, `MẤT bản ghi ${o.kind} ${o.model}`); changes.push({ kind: "MẤT bản ghi", o, txt: `${o.kind} ${o.model}` }); continue; }
    const x = parts(o), y = parts(p), d = [];
    for (const f of FIELDS) if (x[f] !== y[f]) {
      d.push(`${f}: ${x[f]} → ${y[f]}`);
      kinds[f] = (kinds[f] || 0) + 1;
      changes.push({ kind: f, o, txt: `${x[f]} → ${y[f]}` });
    }
    for (const s of new Set([...Object.keys(x.specs), ...Object.keys(y.specs)])) if (x.specs[s] !== y.specs[s]) {
      d.push(`${s}: ${x.specs[s] ?? "∅"} → ${y.specs[s] ?? "∅"}`);
      const kk = `${s.replace(/\d+$/, "")} ${x.specs[s] == null ? "thêm" : y.specs[s] == null ? "bỏ" : "đổi"}`;
      kinds[kk] = (kinds[kk] || 0) + 1;
      changes.push({ kind: kk, o, txt: `${x.specs[s] ?? "∅"} → ${y.specs[s] ?? "∅"}` });
    }
    if (d.length) { n++; push(o, d.join("; ")); }
  }
  for (const [k, o] of b) if (!a.has(k)) { onlyB++; push(o, `THÊM bản ghi ${o.kind} ${o.model}`); changes.push({ kind: "THÊM bản ghi", o, txt: `${o.kind} ${o.model}` }); }
  // Theo NCC: bản ghi đổi / mất / thêm.
  const bySup = new Map();
  const sup = (id) => { if (!bySup.has(id)) bySup.set(id, { changed: 0, onlyA: 0, onlyB: 0, rows: 0 }); return bySup.get(id); };
  for (const [tk, t] of tabs) {
    const s = sup(tk.split(" ")[0]);
    s.rows += t.rows.length;
    for (const r of t.rows) r.txt.startsWith("MẤT bản ghi") ? s.onlyA++ : r.txt.startsWith("THÊM bản ghi") ? s.onlyB++ : s.changed++;
  }
  return { nA: a.size, nB: b.size, changed: n, onlyA, onlyB, kinds, tabs, changes, bySup };
}
// Bản đầy đủ, y từng ký tự như tệp ra của cmpSpec.cjs.
export function fullText(d) {
  const out = [`bản ghi cũ ${d.nA}, mới ${d.nB} | khác ${d.changed} | chỉ cũ ${d.onlyA}, chỉ mới ${d.onlyB} | bảng có đổi ${d.tabs.size}`, JSON.stringify(d.kinds)];
  for (const [tk, t] of [...d.tabs].sort()) {
    out.push(`\n[${tk}] ×${t.rows.length}`);
    for (const h of t.header.slice(0, 3)) out.push("  H: " + String(h).slice(0, 330));
    for (const r of [...t.rows].sort((x, y) => (x.row ?? 0) - (y.row ?? 0))) out.push(`  ${String(r.row).padStart(3)} ${r.line}\n        ⇒ ${r.txt}`);
  }
  return out.join("\n");
}

// ---- 2. đảo vai động cơ ↔ đầu phát ----
const roleKey = (m) => String(m || "").toUpperCase().replace(/[\s._/-]+/g, "");
// recs: mọi bản ghi của một bên. Trả { n, cnt (theo "NCC vai←vai kia"), list (mọi ca), text (y như swap.cjs) }.
export function swaps(recs, only) {
  recs = [...recs];
  const by = new Map();
  for (const o of recs) {
    const k = roleKey(o.model);
    if (!by.has(k)) by.set(k, { engine: new Set(), alternator: new Set() });
    by.get(k)[o.kind]?.add(o.supplierId);
  }
  const cnt = {}, shown = new Set(), list = [], lines = [];
  for (const o of recs) {
    const v = by.get(roleKey(o.model)), other = o.kind === "engine" ? "alternator" : "engine";
    const oth = [...v[other]].filter((x) => x !== o.supplierId).length, same = [...v[o.kind]].filter((x) => x !== o.supplierId).length;
    if (oth < 3 || same > 0) continue;
    list.push({ o, other, oth });
    const ck = `${o.supplierId} ${o.kind}←${other}`;
    cnt[ck] = (cnt[ck] || 0) + 1;
    if (only ? o.supplierId === only : !shown.has(o.supplierId + o.kind) && shown.size < 40) {
      if (!only) shown.add(o.supplierId + o.kind);
      lines.push(`[${o.supplierId} n${o.n} b${o.table} dòng ${o.row ?? "L"}] đọc ${o.kind}=${o.model} (other=${o.other}) | ${other} ở ${oth} NCC khác`);
      for (const h of (o.header || o.lines?.header || []).slice(0, 2)) lines.push("    H: " + String(h).slice(0, 260));
      lines.push("    R: " + String(o.line || (o.lines?.rows || []).filter((r) => r.includes(o.model)).slice(0, 3).join("  ¦  ")).slice(0, 300));
    }
  }
  lines.push("\n" + Object.entries(cnt).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${v}  ${k}`).join("\n"));
  lines.push("tổng: " + list.length);
  return { n: list.length, cnt, list, text: lines.join("\n") };
}

// ---- 3. tự kiểm số với công suất của chính dòng ----
const num = (v) => { const m = String(v).replace(/(\d),(\d{3})\b/g, "$1$2").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
// true: hợp lý với công suất / dải chuẩn của dòng; false: không; null: mã này không có phép kiểm.
export function checkSpec(key, s, o) {
  const v = num(s.value), P = o.power || {};
  const kvas = ["prime", "standby", "rated"].map((r) => P[r]?.kVA).filter(Boolean), kws = ["prime", "standby", "rated"].map((r) => P[r]?.kW).filter(Boolean);
  const near = (x, y, t) => Math.abs(x / y - 1) <= t;
  switch (key.replace(/\d+$/, "")) {
    case "current": return v != null && (kvas.some((k) => [1.443, 1.519, 1.39, 1.312, 1.203].some((f) => near(v, k * f, 0.04))) || kws.some((k) => [1.8, 1.9, 1.804].some((f) => near(v, k * f, 0.04))) || kvas.some((k) => near(v, k * 4.35, 0.05)) || kws.some((k) => near(v, k * 4.35, 0.05) || near(v, k * 4.55, 0.05)));
    case "weight": return v != null && (kvas.length ? kvas : kws.map((k) => k / 0.8)).some((k) => v / k >= 2.5 && v / k <= 150);
    case "engPower": return v != null && kws.some((k) => v >= k * 0.9 && v <= k * 1.8);
    case "cyl": return v != null && Number.isInteger(v) && v >= 1 && v <= 20;
    case "disp": return v != null && v >= 0.4 && v <= 100;
    case "voltage": return [110, 115, 120, 127, 208, 220, 230, 240, 380, 400, 415, 440, 480, 690, 6300, 10500].includes(v);
    case "dims": return (String(s.value).match(/\d+(?:\.\d+)?/g) || []).length >= 3;
    case "gov": return /mechanical|electr|ecu|机械|电子|电调/i.test(s.value);
    case "speed": return [1000, 1500, 1800, 3000, 3600].includes(v);
    default: return null;
  }
}
// Như verSpec.cjs: stat theo dạng, fails = giá trị không tự xác nhận được (cần soát tay), text y như đầu ra của script gốc.
export function verify(a, b) {
  const stat = {}, shown = new Set(), fails = [], lines = [];
  for (const [k, o] of a) {
    const p = b.get(k); if (!p) continue;
    const x = specMap(o), y = specMap(p);
    for (const key of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if ((x[key]?.value ?? null) === (y[key]?.value ?? null)) continue;
      const base = key.replace(/\d+$/, ""), kind = !x[key] ? "thêm" : !y[key] ? "bỏ" : "đổi";
      const ok = y[key] ? checkSpec(key, y[key], p) : null, wasOk = x[key] ? checkSpec(key, x[key], o) : null;
      const tag = `${base} ${kind}: mới ${ok === true ? "tự xác nhận" : ok === false ? "KHÔNG xác nhận" : "không kiểm được"}${kind === "đổi" ? `, cũ ${wasOk === true ? "cũng hợp lệ" : wasOk === false ? "sai" : "?"}` : ""}`;
      stat[tag] = (stat[tag] || 0) + 1;
      const tk = `${o.supplierId} n${o.n} bảng ${o.table} ${base}`;
      if (ok !== true || (kind === "đổi" && wasOk === true)) {
        fails.push({ o, p, key: base, tag, from: x[key]?.value ?? "∅", to: y[key]?.value ?? "∅" });
        lines.push(`(!) [${tk}] dòng ${o.row}: ${x[key]?.value ?? "∅"} → ${y[key]?.value ?? "∅"} (nhãn "${String(y[key]?.label || x[key]?.label).slice(0, 40)}") | ${JSON.stringify(p.power)} | ${String(o.line).slice(0, 150)}`);
      } else if (!shown.has(tk)) {
        shown.add(tk);
        lines.push(`    [${tk}] dòng ${o.row}: ${x[key]?.value ?? "∅"} → ${y[key].value} (nhãn "${String(y[key].label).slice(0, 40)}") | ${String(o.line).slice(0, 150)}`);
      }
    }
  }
  lines.push("\n" + Object.entries(stat).sort().map(([k, v]) => `${v}  ${k}`).join("\n"));
  lines.push(`\ncần soát tay: ${fails.length}`);
  return { stat, fails, text: lines.join("\n") };
}

// ---- 4. lớp chuẩn hoá ----
// Kết quả normalizeRecord của mỗi thông số (bỏ `raw`: chữ nguồn đổi đã nằm ở diff). Chỉ bản ghi có ở cả hai bên.
const normOf = (SN, sup, o) => {
  try { return SN.normalizeRecord(o, sup.get(o.supplierId)?.specTables?.[o.table]?.rows).map(({ raw, ...r }) => ({ raw, r: JSON.stringify(r) })); }
  catch (e) { return [{ raw: null, r: "LỖI " + e.message }]; }
};
export function normDiff(sa, sb, a, b) {
  const kinds = {}, changes = [];
  if (!sa.SN || !sb.SN) return { kinds, changes, skipped: true };
  const supA = new Map(sa.S.map((s) => [s.id, s])), supB = new Map(sb.S.map((s) => [s.id, s]));
  for (const [k, o] of a) {
    const p = b.get(k); if (!p) continue;
    let x = normOf(sa.SN, supA, o), y = normOf(sb.SN, supB, p);
    // One spec added in the middle of a record must not pair every later spec with another key: when the keys differ, the
    // results both sides have are left out and the rest pair by key, in order.
    const keyIn = (e) => (e.r.startsWith("LỖI") ? "?" : JSON.parse(e.r).key);
    if (x.map(keyIn).join() !== y.map(keyIn).join()) {
      const inX = new Set(x.map((e) => e.r)), inY = new Set(y.map((e) => e.r)), xr = x.filter((e) => !inY.has(e.r)), yr = y.filter((e) => !inX.has(e.r)), px = [], py = [];
      for (const k of new Set([...xr, ...yr].map(keyIn))) {
        const a = xr.filter((e) => keyIn(e) === k), b = yr.filter((e) => keyIn(e) === k);
        for (let i = 0; i < Math.max(a.length, b.length); i++) { px.push(a[i]); py.push(b[i]); }
      }
      x = px; y = py;
    }
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      if (x[i]?.r === y[i]?.r) continue;
      const X = x[i] && JSON.parse(x[i].r.startsWith("LỖI") ? "{}" : x[i].r), Y = y[i] && JSON.parse(y[i].r.startsWith("LỖI") ? "{}" : y[i].r);
      const key = Y?.key || X?.key || "?";
      const has = (r) => r && sa.SN.hasValue(r);
      const kind = `${key} ${!X ? "thêm" : !Y ? "bỏ" : has(X) && !has(Y) ? "mất số" : !has(X) && has(Y) ? "có số" : JSON.stringify(X.missing) !== JSON.stringify(Y.missing) ? "đổi missing" : "đổi số / đơn vị"}`;
      kinds[kind] = (kinds[kind] || 0) + 1;
      const brief = (r) => (r ? [r.num ?? r.count ?? (r.range && r.range.join("–")) ?? (r.dims && r.dims.join("×")) ?? (r.bore && `${r.bore.bore}×${r.bore.stroke}`) ?? r.enum ?? "", r.unit || "", r.missing?.length ? `missing ${r.missing.join(",")}` : ""].filter((t) => t !== "").join(" ") : "∅");
      changes.push({ kind, o, txt: `"${(y[i] || x[i]).raw?.value ?? ""}": ${brief(X)} → ${brief(Y)}` });
    }
  }
  return { kinds, changes, skipped: false };
}

// ---- tóm tắt Markdown ----
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\s+/g, " ");
const where = (o) => `${o.supplierId} n${o.n} b${o.table} dòng ${o.row ?? "L"}`;
// Ví dụ mỗi dạng: ưu tiên NCC khác nhau.
function examples(changes, per = 3) {
  const by = new Map();
  for (const c of changes) {
    if (!by.has(c.kind)) by.set(c.kind, { n: 0, sups: new Set(), ex: [] });
    const g = by.get(c.kind);
    g.n++; g.sups.add(c.o.supplierId);
    if (g.ex.length < per && !g.ex.some((e) => e.o.supplierId === c.o.supplierId)) g.ex.push(c);
  }
  for (const c of changes) { const g = by.get(c.kind); if (g.ex.length < per && !g.ex.includes(c)) g.ex.push(c); }
  return [...by].sort((x, y) => y[1].n - x[1].n);
}
function exampleBlock(groups, maxKinds) {
  const out = [];
  for (const [kind, g] of groups.slice(0, maxKinds)) {
    out.push(`**${esc(kind)}**: ${g.n} lượt, ${g.sups.size} NCC`, "```");
    for (const c of g.ex) out.push(`${where(c.o)} ${c.o.model}: ${c.txt}`.slice(0, 220), `    ${String(c.o.line || "(bảng nhãn)").slice(0, 200)}`);
    out.push("```");
  }
  if (groups.length > maxKinds) out.push(`… còn ${groups.length - maxKinds} dạng nữa (xem bản đầy đủ).`);
  return out;
}
// "Chưa đọc được" (chat-luong-3): lý do: cũ → mới. Bên chưa có `unread()` (catalog.js trước chat-luong-3) ghi "—".
export function unreadLine(un) {
  if (!un || (!un.a && !un.b)) return null;
  const keys = [...new Set([...Object.keys(un.a || {}), ...Object.keys(un.b || {})])].sort((x, y) => (un.b?.[y]?.items || 0) - (un.b?.[x]?.items || 0));
  const n = (s, k) => (s ? (s[k]?.items || 0).toLocaleString("vi-VN") : "—");
  return `- Chưa đọc được (\`node suppliers/unread-tables.mjs\`, để thiếu thay vì đoán): ${keys.map((k) => `${k}: ${n(un.a, k)} → ${n(un.b, k)}`).join("; ") || "không có"}`;
}
export function gensetLine(gd) {
  return gd && (gd.nA || gd.nB) ? `- Tổ máy bảng không ghi mã động cơ (\`gensetsOf\`, chưa nối Gợi ý): ${gd.nA.toLocaleString("vi-VN")} → ${gd.nB.toLocaleString("vi-VN")}; ${gd.changed} đổi, ${gd.onlyA} mất, ${gd.onlyB} thêm (bản đầy đủ: phần "tổ máy" của artifact)` : "";
}
export function markdown({ d, swA, swB, ver, norm, un, gd, labels = ["cũ", "mới"], maxSup = 40, maxKinds = 30 }) {
  const out = ["<!-- spec-diff -->", `## Kiểm chéo danh mục (spec-diff): ${labels[0]} ↔ ${labels[1]}`, ""];
  const swapUp = swB.n > swA.n;
  const ul = unreadLine(un);
  out.push(`- Bản ghi: ${d.nA.toLocaleString("vi-VN")} → ${d.nB.toLocaleString("vi-VN")}; **${d.changed}** đổi, ${d.onlyA} mất, ${d.onlyB} thêm, ở ${d.tabs.size} bảng của ${d.bySup.size} NCC`);
  if (gensetLine(gd)) out.push(gensetLine(gd));
  out.push(`- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): ${swA.n} → **${swB.n}**${swapUp ? " ❌ TĂNG (chặn)" : " ✅"}`);
  out.push(`- Tự kiểm số với công suất của dòng: ${ver.fails.length} giá trị đổi / thêm không tự xác nhận được (soát tay)`);
  if (!norm.skipped) out.push(`- Lớp chuẩn hoá (spec-norm): ${norm.changes.length} thông số đổi kết quả`);
  if (ul) out.push(ul);
  out.push("- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.", "");
  if (!d.changes.length && !norm.changes.length && swA.n === swB.n) { out.push("Không có bản ghi nào đổi."); return out.join("\n"); }
  if (d.bySup.size) {
    out.push("### Theo NCC", "", "| NCC | dòng đổi | đổi | mất | thêm |", "|---|--:|--:|--:|--:|");
    const sups = [...d.bySup].sort((x, y) => y[1].rows - x[1].rows);
    for (const [id, s] of sups.slice(0, maxSup)) out.push(`| ${id} | ${s.rows} | ${s.changed} | ${s.onlyA} | ${s.onlyB} |`);
    if (sups.length > maxSup) out.push(`| … ${sups.length - maxSup} NCC nữa | ${sups.slice(maxSup).reduce((t, [, s]) => t + s.rows, 0)} | | | |`);
    out.push("");
  }
  if (d.changes.length) out.push("### Dạng thay đổi (vài ví dụ mỗi dạng)", "", ...exampleBlock(examples(d.changes), maxKinds), "");
  if (swB.n || swA.n) {
    out.push("### Đảo vai", "", "| NCC vai ← vai kia | cũ | mới |", "|---|--:|--:|");
    for (const k of [...new Set([...Object.keys(swA.cnt), ...Object.keys(swB.cnt)])].sort((x, y) => (swB.cnt[y] || 0) - (swB.cnt[x] || 0) || (swA.cnt[y] || 0) - (swA.cnt[x] || 0)).slice(0, 30)) out.push(`| ${k} | ${swA.cnt[k] || 0} | ${swB.cnt[k] || 0} |`);
    out.push("");
    const before = new Set(swA.list.map((x) => `${where(x.o)} ${x.o.kind} ${x.o.model}`));
    const added = swB.list.filter((x) => !before.has(`${where(x.o)} ${x.o.kind} ${x.o.model}`));
    if (added.length) { out.push("Ca đảo vai MỚI:", "```"); for (const x of added.slice(0, 20)) out.push(`${where(x.o)} đọc ${x.o.kind}=${x.o.model} | ${x.other} ở ${x.oth} NCC khác`, `    ${String(x.o.line || "(bảng nhãn)").slice(0, 200)}`); out.push("```", ""); }
  }
  if (ver.fails.length) {
    out.push("### Không tự xác nhận được", "", "| dạng | số |", "|---|--:|");
    for (const [k, v] of Object.entries(ver.stat).filter(([k]) => /KHÔNG|không kiểm|cũng hợp lệ/.test(k)).sort((x, y) => y[1] - x[1])) out.push(`| ${esc(k)} | ${v} |`);
    out.push("", "```");
    for (const f of ver.fails.slice(0, 12)) out.push(`${where(f.o)} ${f.key}: ${f.from} → ${f.to} | ${JSON.stringify(f.p.power)}`.slice(0, 220));
    if (ver.fails.length > 12) out.push(`… còn ${ver.fails.length - 12}`);
    out.push("```", "");
  }
  if (norm.changes.length) out.push("### Lớp chuẩn hoá: dạng thay đổi", "", ...exampleBlock(examples(norm.changes), maxKinds), "");
  // Bình luận GitHub tối đa 65.536 ký tự.
  let s = out.join("\n");
  if (s.length > 60000) s = s.slice(0, 60000) + "\n```\n… (cắt bớt, xem artifact)";
  return s;
}

// ---- chạy cả bộ ----
export function run(sa, sb) {
  const a = records(sa), b = records(sb);
  const d = diff(a, b);
  const swA = swaps(a.values()), swB = swaps(b.values());
  const ver = verify(a, b);
  const norm = sa.normText === sb.normText ? { kinds: {}, changes: [], skipped: true } : normDiff(sa, sb, a, b);
  const un = { a: sa.C.unread ? unreadSummary(sa.C.unread(sa.S)) : null, b: sb.C.unread ? unreadSummary(sb.C.unread(sb.S)) : null };
  const gd = diff(gensetRecords(sa), gensetRecords(sb));
  return { a, b, d, swA, swB, ver, norm, un, gd };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const argv = process.argv.slice(2), opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv.splice(i, 2)[1] : null; };
  const out = opt("--out"), md = opt("--md"), swapList = opt("--swap-list"), gate = argv.includes("--gate");
  const labels = [opt("--label-old"), opt("--label-new")];
  const [A, B] = argv.filter((x) => !x.startsWith("--"));
  if (!A || !B) { console.error("node suppliers/spec-diff.mjs <cũ: thư mục | git:ref> <mới> [--out f] [--md f] [--swap-list f] [--gate]"); process.exit(2); }
  const dirOf = (x) => (x.startsWith("git:") ? checkoutRef(x.slice(4)) : x);
  const r = run(loadSide(dirOf(A)), loadSide(dirOf(B)));
  const head = fullText(r.d).split("\n").slice(0, 2);
  console.log(head.join("\n"));
  console.log(`đảo vai: ${r.swA.n} → ${r.swB.n} | tự kiểm: cần soát tay ${r.ver.fails.length}${r.norm.skipped ? "" : ` | chuẩn hoá: ${r.norm.changes.length} thông số đổi`}`);
  if (unreadLine(r.un)) console.log(unreadLine(r.un).slice(2));
  if (gensetLine(r.gd)) console.log(gensetLine(r.gd).slice(2));
  if (out) fs.writeFileSync(out, fullText(r.d) + "\n\n==== tự kiểm số (verSpec) ====\n" + r.ver.text + (r.norm.skipped ? "" : "\n\n==== chuẩn hoá ====\n" + r.norm.changes.map((c) => `${c.kind} | ${where(c.o)} ${c.o.model}: ${c.txt}`).join("\n")) + (r.gd.nA || r.gd.nB ? "\n\n==== tổ máy (gensetsOf) ====\n" + fullText(r.gd) : ""), "utf8");
  if (swapList) fs.writeFileSync(swapList, r.swB.text, "utf8");
  if (md) fs.writeFileSync(md, markdown({ ...r, labels: [labels[0] || A, labels[1] || B] }), "utf8");
  if (gate && r.swB.n > r.swA.n) { console.error(`đảo vai tăng: ${r.swA.n} → ${r.swB.n}`); process.exit(1); }
}
