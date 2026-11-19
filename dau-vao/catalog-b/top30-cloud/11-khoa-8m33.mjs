// node 11-khoa-8m33.mjs <worktree> <model...>
// catalog-b: facts (cyl / disp / bore) và tần số các dòng (e.uses) của một model ở MỘT worktree, theo từng NCC, để giải thích
// vì sao dòng của NCC khác vào / rời `all` khi khoá gộp (luật cyl / disp dùng số đông facts; luật freq dùng mọi dòng e.uses).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, ...MS] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), facts = B.modelFacts(full, sups);
for (const m of MS) {
  const keys = full.engines.filter((e) => CAT.keyOf(e.model).replace(/[\^*×]+$/, "") === CAT.keyOf(m)).map((e) => e.key);
  for (const k of keys) {
    const e = full.engines.find((x) => x.key === k);
    console.log(`\n== khoá ${k} (model "${e.model}", hãng ${e.make || "-"}), ${e.uses.length} dòng`);
    const by = new Map();
    for (const u of e.uses) { const s = by.get(u.supplierId) || { n: 0, f: new Set() }; s.n++; s.f.add(u.freq || "-"); by.set(u.supplierId, s); }
    for (const [sid, s] of by) console.log(`   dòng ${sid}: ${s.n}, tần số ${[...s.f].join("/")}`);
    for (const f of facts.get(`engine:${k}`) || []) if (["cyl", "disp", "bore"].includes(f.key)) console.log(`   fact ${f.key}\t${f.value}\t${f.supplierId}\t${String(f.label || "").slice(0, 30)}`);
  }
}
