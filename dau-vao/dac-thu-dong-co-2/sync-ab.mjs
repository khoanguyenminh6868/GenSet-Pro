// node sync-ab.mjs <worktree> <bp-main.js> <specsDir> <analysis.json> > out.txt
// brandSyncOf of main ↔ the draft of the worktree on every HSMT (text.txt, else the analysis rows item | quote).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [wt, bpMain, specs, analysis] = process.argv.slice(2);
await import(pathToFileURL(path.join(wt, "web", "conversions.js")).href);
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
await import(pathToFileURL(bpMain).href + "?main");
const A = globalThis.GenbidBidprice.brandSyncOf;
await import(pathToFileURL(path.join(wt, "web", "bidprice.js")).href + "?draft");
const B = globalThis.GenbidBidprice.brandSyncOf;
if (A === B) throw new Error("same function");
const texts = new Map();
for (const k of fs.readdirSync(specs)) { const f = path.join(specs, k, "text.txt"); if (fs.existsSync(f)) texts.set(k, [fs.readFileSync(f, "utf8"), "text"]); }
const j = JSON.parse(fs.readFileSync(analysis, "utf8"));
for (const [id, d] of Object.entries(j.docs)) {
  if (texts.has(id)) continue;
  const ts = (d.d?.result || d.d || {}).technicalSpecs || [];
  if (ts.length) texts.set(id, [ts.map((r) => [r.item, r.quote || r.requirement].filter(Boolean).join(" | ")).join("\n"), "analysis"]);
}
const show = (s) => (s ? `${s.need}/${s.parts.length} [${s.parts.join(", ")}]` : "không");
const cls = {};
const out = [];
for (const [k, [t, from]] of [...texts].sort()) {
  const a = A(t), b = B(t), b1 = B(t, { minParts: 1 });
  const same = JSON.stringify(a && [a.need, a.parts, a.quote]) === JSON.stringify(b && [b.need, b.parts, b.quote]);
  const c = !a && !b ? (b1 ? "1 bộ phận (chỉ khi Khoa chọn đòi)" : "không đồng bộ cả hai") : same ? "giống" : !b ? "main có, nháp KHÔNG" : !a ? "main không, nháp CÓ" : "đổi bộ phận";
  cls[c] = (cls[c] || 0) + 1;
  if (c !== "giống" && c !== "không đồng bộ cả hai") out.push(`${k} [${from}] ${c}: main ${show(a)} → nháp ${show(b)}${b1 && !b ? `; nếu đòi 1 bộ phận: ${show(b1)}` : ""}\n  câu: ${(a || b || b1).text.slice(0, 300)}`);
}
console.log(`gói có chữ: ${texts.size}`);
for (const [c, n] of Object.entries(cls)) console.log(`  ${c}: ${n}`);
console.log("\n" + out.join("\n"));
