// node soat-cuoi.mjs <worktree nhánh> <thư mục đo> (CHỈ ĐỌC, in màn hình)
// (A) các ngưỡng bị bỏ cần đọc lại: mọi dòng nêu trường đó kèm khối cỡ. (B) mọi ngưỡng đổi của nhánh: số có nằm trong dòng của đúng cỡ không.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, S] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const J = (f) => JSON.parse(fs.readFileSync(path.join(S, f), "utf8"));
const ha = J("hl-goc.json"), hb = J("hl-nhanh.json");
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const RE = { cyl: /x[iy]\s*-?\s*lanh/i, disp: /dung\s*t[íi]ch/i, fuel: /ti[êe]u\s*(hao|th[ụu])/i, prime: /li[êe]n\s*t[ụu]c|prime|định mức|c[ôo]ng su[ấa]t/i };
const FIELD = { minDisp: "disp", maxDisp: "disp", minCyl: "cyl", minPrime: "prime", maxFuel: "fuel", maxFuel75: "fuel", maxFuel50: "fuel" };
const info = (id) => {
  const [no, ri] = id.split("#"), d = byKey.get(no), found = B.sizesOf([(d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), d.bidName], d.bidName), t = B.technicalPart(d.config.text), j = +ri;
  if (found.length < 2) { const L = t.split("\n"); return { found, L, tag: L.map(() => 0), own: L }; }
  const { L, runs, tags } = B.sizeBlocks(t, found);
  const tag = L.map((_, i) => (tags[i] >= 0 ? tags[i] : runs.find((b) => i >= b.start && i < b.to)?.size ?? -1));
  return { found, L, tag, own: L.filter((_, i) => tag[i] === j) };
};
const A = [["IB2300046353#1", "cyl"], ["IB2500385135#0", "cyl"], ["IB2500385135#0", "disp"], ["IB2200020538#0", "fuel"], ["IB2300349583#0", "fuel"], ["IB2300165131#0", "fuel"], ["IB2300163844#0", "cyl"], ["IB2300162912#0", "disp"], ["IB2400291063#1", "cyl"], ["IB2400487460#1", "disp"], ["IB2500533266#1", "cyl"], ["IB2600477305#1", "cyl"]];
console.log("=== (A)");
for (const [id, f] of A) {
  const x = info(id), j = +id.split("#")[1];
  console.log(`\n--- ${id} ${f} cỡ: ${x.found.map((s) => s.label).join(", ") || "một cỡ"} | nhánh: ${JSON.stringify(Object.fromEntries(Object.entries(hb[id].raw).filter(([, v]) => v != null)))}`);
  x.L.forEach((l, i) => { if (!RE[f].test(l) || !/\d/.test(l)) return; const m = l.search(RE[f]); console.log(`  [khối ${x.tag[i]}${x.tag[i] === j ? " *" : ""}] ${l.slice(0, 45).trim()} … ${l.slice(Math.max(0, m - 25), m + 130).trim()}`); });
}
const forms = (v) => { const s = String(v), c = s.replace(".", ","); return [s, c, Number(v).toFixed(1), Number(v).toFixed(1).replace(".", ","), Number(v).toFixed(2), Number(v).toFixed(2).replace(".", ",")]; };
const has = (l, v) => forms(v).some((x) => new RegExp(`(?<![\\d.,])${x.replace(".", "\\.")}(?![\\d])`).test(l));
console.log("\n=== (B) ngưỡng đổi mà số không thấy nguyên văn trong dòng của đúng cỡ");
let ok = 0, n = 0;
for (const id of Object.keys(hb).sort()) {
  const x = info(id);
  for (const k of Object.keys(FIELD)) {
    const a = ha[id].eff[k], b = hb[id].eff[k];
    if (b == null || JSON.stringify(a) === JSON.stringify(b)) continue;
    n++;
    const vals = k === "minPrime" ? [b.kVA, b.kW].filter((v) => v != null) : [b];
    const lines = x.own.filter((l) => RE[FIELD[k]].test(l));
    if (vals.some((v) => lines.some((l) => has(l, v)))) { ok++; continue; }
    const tol = lines.filter((l) => /±/.test(l) && RE[FIELD[k]].test(l)).map((l) => { const m = l.search(/±/); return l.slice(Math.max(0, m - 45), m + 12).trim(); });
    console.log(`${id} ${k} ${JSON.stringify(a)} → ${JSON.stringify(b)} | ${tol.slice(0, 2).join(" ¦ ") || "(không có ±) " + (lines[0] || "").slice(0, 110)}`);
  }
}
console.log(`\nthấy nguyên văn ${ok} / ${n}`);
