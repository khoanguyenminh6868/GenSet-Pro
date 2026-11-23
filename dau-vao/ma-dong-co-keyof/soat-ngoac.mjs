// node soat-ngoac.mjs <worktree> <out.tsv> <out-dong.tsv>: MỌI khoá động cơ có ngoặc so với khoá bỏ ngoặc, kèm MỌI dòng của khoá ngoặc.
// Chỉ đọc. Một số của khoá ngoặc "lệch" khi không nằm trong 1 % của số nào của khoá gốc (engPower: ngoài [min × 0,97; max × 1,03]).
// Khoá gốc không ghi loại số đó thì "không so được", không tính là khớp. Nhóm: so_tro (số trơ trong ngoặc, Khoa 20/11 không gộp),
// khong_co_goc, mau_thuan, gop_duoc. Không kết luận thay người về nghĩa của nhãn trong ngoặc.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [root0, out, outRows] = process.argv.slice(2), root = path.resolve(root0);
await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const cat = CAT.build(S);
const byKey = new Map(cat.engines.map((e) => [e.key, e]));
const BR = /[(\[【]([^)\]】]*)[)\]】]/;
const strip = (k) => k.replace(new RegExp(BR.source, "g"), "");
const raw = (e, key) => [...new Set((e?.specs || []).filter((s) => s.key === key).flatMap((s) => (s.values || []).map((v) => String(v.value).trim())))].sort();
const nums = (l) => [...new Set(l.flatMap((v) => (v.replace(/(\d),(\d{3})\b/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number)))];
const KEYS = ["cyl", "disp", "bore", "compr", "engPower"];
function cmp(e, b) {
  const lech = [], none = [], same = [];
  for (const key of KEYS) {
    const x = nums(raw(e, key)), y = nums(raw(b, key));
    if (!x.length) continue;
    if (!y.length) { none.push(key); continue; }
    same.push(`${key}=${raw(e, key).join("/")}`);
    const off = key === "engPower" ? x.filter((v) => v < Math.min(...y) * 0.97 || v > Math.max(...y) * 1.03) : x.filter((v) => !y.some((w) => Math.abs(v - w) <= 0.01 * Math.max(v, w)));
    if (off.length) lech.push(`${key}: ${raw(e, key).join("/")} ↔ ${raw(b, key).join("/")}`);
  }
  return { lech, none, same };
}
// Công suất tổ máy (kW) theo mức của mọi dòng; "trong dải" = trong [min × 0,95; max × 1,05] của khoá gốc CÙNG mức.
const powers = (x, r) => (x?.uses || []).map((u) => u.power?.[r]?.kW).filter((v) => v > 0);
const span = (l) => (l.length ? `${Math.min(...l)}–${Math.max(...l)}` : "");
function powerCmp(e, b) {
  const out = [], off = [];
  let compared = 0;
  for (const r of ["prime", "standby", "rated"]) {
    const x = powers(e, r), y = powers(b, r);
    if (x.length) out.push(`${r} ${span(x)} ↔ ${span(y) || "không ghi"}`);
    if (!x.length || !y.length) continue;
    compared++;
    if (x.some((v) => v < Math.min(...y) * 0.95 || v > Math.max(...y) * 1.05)) off.push(r);
  }
  return { text: out.join("; "), off, compared };
}
const head = ["loai", "khoa_ngoac", "khoa_goc", "dong_ngoac", "dong_goc", "ncc_ngoac", "so_ncc_goc", "hang_ngoac", "hang_goc", "lech", "khong_so_duoc", "da_so", "cyl_ngoac", "cong_suat", "cs_lech", "cs_so_duoc"];
const rows = [head.join("\t")], detail = [["khoa_ngoac", "ncc", "n", "tan_so", "dong"].join("\t")], tally = {};
for (const e of cat.engines) {
  if (!BR.test(e.key)) continue;
  const inner = e.key.match(BR)[1], k0 = strip(e.key), b = k0 && k0 !== e.key ? byKey.get(k0) : null;
  const { lech, none, same } = b ? cmp(e, b) : { lech: [], none: [], same: [] };
  if (b && e.make && b.make && e.make !== b.make) lech.push(`hang: ${e.make} ↔ ${b.make}`);
  const loai = /^\d+$/.test(inner) ? "so_tro" : !b ? "khong_co_goc" : lech.length ? "mau_thuan" : "gop_duoc";
  tally[loai] = (tally[loai] || 0) + 1;
  const sup = (x) => [...new Set((x?.uses || []).map((u) => u.supplierId))];
  const pw = b ? powerCmp(e, b) : { text: "", off: [], compared: 0 };
  rows.push([loai, e.key, b ? k0 : "", e.uses.length, b?.uses.length ?? "", sup(e).join(","), sup(b).length, e.make || "", b?.make || "", lech.join("; "), none.join(","), same.join("; "), raw(e, "cyl").join("/"), pw.text, pw.off.join(","), pw.compared].join("\t"));
  for (const u of e.uses) detail.push([e.key, u.supplierId, u.n, u.freq ?? "", String(u.line || "(bảng nhãn)").replace(/\t/g, " ")].join("\t"));
}
fs.writeFileSync(out, rows.join("\n") + "\n", "utf8");
fs.writeFileSync(outRows, detail.join("\n") + "\n", "utf8");
console.log("khoá động cơ", cat.engines.length, JSON.stringify(tally), "dòng của khoá ngoặc", detail.length - 1);
