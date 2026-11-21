// node soat-vao.mjs <worktree nhánh> <thư mục đo> (CHỈ ĐỌC, chỉ in màn hình): (1) mọi ngưỡng bị BỎ hoặc NỚI ở nhánh: how + chữ HSMT của cỡ đó;
// (2) mọi ngưỡng tăng / mới mà dòng nguồn của cỡ có "±": số dòng bị loại nằm trong dung sai.
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
const RE = { minDisp: /dung\s*t[íi]ch/i, maxDisp: /dung\s*t[íi]ch/i, minCyl: /x[iy].?lanh/i, cylExact: /x[iy].?lanh/i, minPrime: /li[êe]n\s*t[ụu]c|prime|định mức/i, maxFuel: /ti[êe]u\s*(hao|th[ụu])/i, maxFuel75: /ti[êe]u\s*(hao|th[ụu])/i, maxFuel50: /ti[êe]u\s*(hao|th[ụu])/i };
const val = (k, v) => (k === "minPrime" ? v?.kVA ?? (v?.kW != null ? v.kW / 0.8 : null) : v);
const loose = (k, a, b) => { if (a == null) return false; if (b == null) return true; const x = val(k, a), y = val(k, b); return k.startsWith("max") ? y > x : y < x; };
const own = (id) => {
  const [no, ri] = id.split("#"), d = byKey.get(no), found = B.sizesOf([(d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), d.bidName], d.bidName), t = B.technicalPart(d.config.text);
  if (found.length < 2) return { lines: t.split("\n"), how: {} };
  const { L, runs, tags } = B.sizeBlocks(t, found), j = +ri;
  return { lines: L.filter((_, i) => tags[i] === j || (tags[i] < 0 && runs.some((b) => b.size === j && i >= b.start && i < b.to))), how: B.minsForSize(t, found[j], found).how };
};
console.log("=== (1) ngưỡng bị bỏ / nới");
for (const id of Object.keys(ha).sort()) for (const k of Object.keys(ha[id].eff)) {
  if (k === "cylExact" || !loose(k, ha[id].eff[k], hb[id].eff[k])) continue;
  const o = own(id), hits = o.lines.filter((l) => RE[k].test(l) && /\d/.test(l)).map((l) => { const m = l.search(RE[k]); return l.slice(Math.max(0, m - 12), m + 70).trim(); });
  console.log(`${id} ${k} ${JSON.stringify(ha[id].eff[k])} → ${JSON.stringify(hb[id].eff[k])} how=${o.how[k] ?? "-"} | ${[...new Set(hits)].slice(0, 2).join(" ¦ ") || "(cỡ này không có dòng nêu)"}`);
}
console.log("\n=== (2) ngưỡng mới / chặt hơn có ± ở dòng nguồn");
for (const id of Object.keys(hb).sort()) for (const k of ["minDisp", "maxDisp", "minPrime"]) {
  if (hb[id].eff[k] == null || JSON.stringify(ha[id].eff[k]) === JSON.stringify(hb[id].eff[k])) continue;
  const hits = own(id).lines.filter((l) => RE[k].test(l) && /±/.test(l)).map((l) => { const m = l.search(/±/); return l.slice(Math.max(0, m - 50), m + 16).trim(); });
  if (hits.length) console.log(`${id} ${k} = ${JSON.stringify(hb[id].eff[k])} | ${[...new Set(hits)].slice(0, 2).join(" ¦ ")}`);
}
