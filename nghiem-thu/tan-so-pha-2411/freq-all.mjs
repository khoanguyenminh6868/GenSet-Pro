// So luật tần số cũ ↔ mới trên MỌI dòng động cơ của mọi hồ sơ cn/, ở cả gói 50 Hz và 60 Hz.
// node freq-all.mjs <worktree> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [root, out] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(root, "suppliers/config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers/cn");
const list = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const built = C.build(list), sup = new Map(list.map((s) => [s.id, s])), byKey = new Map(built.engines.map((e) => [e.key, e]));
const twinKey = (k) => (k.endsWith("^") ? k.slice(0, -1) : `${k}^`);

const oldOut = (e, u, want, twin) => {
  if (u.freq) return false;
  const own = B.hzOfRow(u);
  const name = own ? null : B.hzOfName(u);
  const known = [...e.uses, ...twin].map(B.hzOfRow).filter(Boolean);
  if (own) return own !== want;
  if (name) return name !== want;
  return known.length >= 2 && known.every((f) => f !== want);
};
const rows = [["gói Hz", "cũ", "mới", "nhánh", "NCC", "n", "khoá động cơ", "why", "dòng"].join("\t")];
const tally = {}, byNcc = {};
let total = 0;
for (const e of built.engines) {
  const twin = byKey.get(twinKey(e.key))?.uses || [];
  for (const u of e.uses) {
    if (!u.line) continue;
    for (const want of [50, 60]) {
      total++;
      const was = oldOut(e, u, want, twin) ? "loại" : "giữ";
      const v = B.freqVerdict(e, u, want, { twinUses: twin, sup });
      const now = v?.out ? "loại" : v?.ask ? "cần xác nhận" : "giữ";
      const k = `${want}|${was}→${now}|${v?.kind || "-"}`;
      tally[k] = (tally[k] || 0) + 1;
      if (was === now) continue;
      const nk = `${want}|${was}→${now}|${u.supplierId}`;
      byNcc[nk] = (byNcc[nk] || 0) + 1;
      rows.push([want, was, now, v?.kind || "-", u.supplierId, u.n, e.key, v?.why || "", u.line.replace(/\s+/g, " ").slice(0, 170)].join("\t"));
    }
  }
}
fs.writeFileSync(out, rows.join("\n") + "\n");
console.log("lượt dòng × gói:", total, "| dòng đổi:", rows.length - 1);
for (const k of Object.keys(tally).sort()) console.log(k, tally[k]);
const sorted = Object.entries(byNcc).sort((a, b) => b[1] - a[1]);
console.log("NCC đổi:", sorted.length); for (const [k, v] of sorted.slice(0, 25)) console.log(" ", k, v);
const probe = (re) => rows.slice(1).filter((l) => re.test(l.split("\t")[6]));
for (const [n, re] of [["TAD1350GE", /^TAD1350GE$/], ["2806C/A-E18TTAG6", /2806[CA].*E18TTAG6/], ["1206JE70TTAG4", /^1206JE70TTAG4$/]]) {
  const h = probe(re); console.log(`--- ${n}: ${h.length} dòng đổi`); for (const l of h.slice(0, 8)) console.log("  ", l.split("\t").slice(0, 7).join(" | "));
}
for (const key of ["4M06G25/6", "8M33G770/6", "12M55G2500/6", "4M10G66/6", "12M33G1000/6", "16M33G1400/6", "16M55G3300/6"]) {
  const e = byKey.get(key); if (!e) { console.log(key, "không có"); continue; }
  const twin = byKey.get(twinKey(key))?.uses || [];
  const c = { out: 0, keep: 0, wrote50: 0 };
  for (const u of e.uses) { if (!u.line) continue; if (u.freq === 50 || B.hzOfRow(u) === 50) c.wrote50++; const v = B.freqVerdict(e, u, 50, { twinUses: twin, sup }); if (v?.out) c.out++; else c.keep++; }
  console.log(key, JSON.stringify(c));
}
