// node ds-prime.mjs <worktree> <ng-main.json> <ng-truoc.json> <ng-cuoi.json> <out.md> (CHỈ ĐỌC): mọi lượt đổi minPrime giữa "trước" và "cuối", tách nhóm có dung sai / không, kèm câu HSMT ngắn.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, GOC, TRUOC, CUOI, OUT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const ROOT = "C:/Projects/GenSet Pro/genbid-work";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const g = J(GOC), a = J(TRUOC), z = J(CUOI);
const docs = J(`${ROOT}/doc-cache/bidhist.json`).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const an = new Map();
for (const [k, x] of Object.entries(J(`${ROOT}/doc-cache/analysis.json`).docs)) { const r = x.d?.result; if (!r) continue; an.set(k, r); const no = r.keyInfo?.notifyNo || x.d?.notifyNo; if (no && !an.has(no)) an.set(no, r); }
const mp = (o, k) => JSON.parse(o[k] || "{}").minPrime ?? null;
const f = (v) => (v == null ? "không có" : [v.kVA != null ? `${v.kVA} kVA` : "", v.kW != null ? `${v.kW} kW` : ""].filter(Boolean).join(" / "));
const LABEL = /c[ôo]ng su[ấa]t\s*(?:l[àa]m vi[ệe]c\s*)?(?:li[êe]n t[ụu]c|c[ơo] b[ảa]n)|prime|continuous|Li[êe]n t[ụu]c/i;
const rows = { tol: [], other: [] };
for (const k of Object.keys(a).sort()) {
  const x = mp(a, k), y = mp(z, k);
  if (JSON.stringify(x) === JSON.stringify(y)) continue;
  const [no, ri] = k.slice(2).split("#"), j = +ri;
  let text, found;
  if (k[0] === "H") { const d = byKey.get(no); text = d.config.text; found = B.sizesOf([(d.config.kvas || []).map((v) => `${v.v} ${v.u}`).join(", "), d.bidName], d.bidName); }
  else { text = fs.readFileSync(`${ROOT}/specs/${no}/text.txt`, "utf8"); const r = an.get(no), n = r?.keyInfo?.bidName || ""; found = B.sizesOf([r?.keyInfo?.generatorCapacity, n], n); }
  const tp = B.technicalPart(text);
  let lines = tp.split("\n");
  if (found.length > 1) { const { L, runs, tags } = B.sizeBlocks(tp, found); const own = L.filter((_, i) => tags[i] === j || (tags[i] < 0 && runs.some((b) => b.size === j && i >= b.start && i < b.to))); lines = own.length ? own : L; }
  const clauses = lines.flatMap((l) => l.split(";")).map((c) => c.replace(/\s+/g, " ").trim()).filter((c) => LABEL.test(c));
  const tol = clauses.find((c) => { const m = c.search(LABEL); return /\d\s*(?:k?VA|kW)?\s*(?:±|\+\s*\/\s*-)\s*\d/i.test(c.slice(m)) && !/đầu phát/i.test(c.slice(0, m)); });
  const v = y?.kVA ?? y?.kW, plain = clauses.find((c) => v != null && new RegExp(`(?<![\\d.,])${String(v).replace(".", "[.,]")}\\s*(?:k?VA|kW)`, "i").test(c));
  const q = (s) => { if (!s) return "(không tách được câu)"; const m = Math.max(0, s.search(LABEL)); return s.slice(m, m + 62).replace(/\|/g, "/"); };
  (tol ? rows.tol : rows.other).push(`| ${k[0] === "S" ? "HSMT" : "lịch sử"} | ${k.slice(2)} | ${q(tol || plain)} | ${f(mp(g, k))} | ${f(x)} | ${f(y)} |`);
}
const head = "| Nguồn | Lượt | Câu HSMT | main | `2b199862` | Mới |\n|---|---|---|---|---|---|\n";
fs.writeFileSync(OUT, `### A. Có dung sai ghi sau số (${rows.tol.length} lượt)\n\n${head}${rows.tol.join("\n")}\n\n### B. Không do dung sai (${rows.other.length} lượt)\n\n${head}${rows.other.join("\n")}\n`);
console.log(`dung sai ${rows.tol.length}, khác ${rows.other.length}`);
