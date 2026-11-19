// node solo-scan.mjs <worktree>: mọi cặp NCC mà C6 SẼ gộp (cùng ô kích thước không phải container + cùng tập dung tích) nếu
// không có luật "hãng động cơ / datasheet hãng không gộp" — tức là các chỗ luật đó thật sự có tác dụng.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups);
const read = (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; };
const real = new Map(sups.map((s) => [s.id, s]));
const plain = new Map(sups.map((s) => [s.id, { ...s, role: undefined, specTables: (s.specTables || []).map((t) => ({ ...t, title: String(t.title || "").replace(/^Datasheet: /, "") })) }]));
for (const e of cat.engines) {
  const ef = facts.get(`engine:${e.key}`) || [];
  if (!e.uses.some((u) => u.line || u.lines)) continue;
  const a = B.dispVoters(e, ef, { suppliers: real, read });
  const b = B.dispVoters(e, ef.map((f) => { const g = { ...f }; delete g.sheet; return g; }), { suppliers: plain, read });
  for (const [s, r] of b) if (r !== s || [...b.values()].filter((x) => x === r).length > 1) {
    const mates = [...b].filter(([, x]) => x === r).map(([t]) => t);
    const split = mates.some((t) => a.get(t) !== a.get(s));
    if (split && s === r) console.log(e.model, "| gộp nếu bỏ luật:", mates.join(", "), "| thật:", mates.map((t) => `${t}→${a.get(t)}`).join(", "));
  }
}
