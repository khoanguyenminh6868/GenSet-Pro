// node soat-doi.mjs <worktree> <tsv> (CHỈ ĐỌC, chỉ in màn hình): mỗi lượt đổi dung tích / xi lanh / công suất: đoạn chữ HSMT quanh nhãn ở các dòng thuộc cỡ của lượt.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, TSV] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const ROOT = "C:/Projects/GenSet Pro/genbid-work";
const docs = JSON.parse(fs.readFileSync(`${ROOT}/doc-cache/bidhist.json`, "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const an = new Map();
for (const [k, x] of Object.entries(JSON.parse(fs.readFileSync(`${ROOT}/doc-cache/analysis.json`, "utf8")).docs)) { const r = x.d?.result; if (!r) continue; an.set(k, r); const no = r.keyInfo?.notifyNo || x.d?.notifyNo; if (no && !an.has(no)) an.set(no, r); }
const RE = { maxDisp: /dung\s*t[íi]ch/gi, minDisp: /dung\s*t[íi]ch/gi,minCyl: /(?:x[iy][\s-]?lanh)/gi, minPrime: /li[êe]n\s*t[ụu]c|prime|d[ựu]\s*ph[òo]ng/gi };
for (const l of fs.readFileSync(TSV, "utf8").trim().split(/\r?\n/).slice(1)) {
  const [k, diff] = l.split("\t"), [no, ri] = k.slice(2).split("#"), j = +ri;
  let text, found;
  if (k[0] === "H") { const d = byKey.get(no); text = d.config.text; found = B.sizesOf([(d.config.kvas || []).map((x) => `${x.v} ${x.u}`).join(", "), d.bidName], d.bidName); }
  else { text = fs.readFileSync(`${ROOT}/specs/${no}/text.txt`, "utf8"); const a = an.get(no), n = a?.keyInfo?.bidName || ""; found = B.sizesOf([a?.keyInfo?.generatorCapacity, n], n); }
  const tp = B.technicalPart(text);
  let lines;
  if (found.length > 1) { const { L, runs, tags } = B.sizeBlocks(tp, found); lines = L.filter((_, i) => tags[i] === j || (tags[i] < 0 && runs.some((b) => b.size === j && i >= b.start && i < b.to))); }
  else lines = tp.split("\n");
  console.log(`\n${k} [${found.map((s) => s.cap.value).join("/")}] ${diff.replace(/min/g, "")}`);
  for (const f of Object.keys(RE)) {
    if (!diff.includes(f)) continue;
    const seen = new Set();
    for (const x of lines) for (const m of x.matchAll(RE[f])) {
      const s = x.slice(Math.max(0, m.index - 30), m.index + 52).replace(/\s+/g, " ").trim();
      if (/\d/.test(s) && !/th[ùu]ng|b[ồo]n\b|b[ìi]nh/i.test(s)) seen.add(s);
    }
    console.log(`  ${f}: ${[...seen].slice(0, 3).join(" ¦ ")}`);
  }
}
