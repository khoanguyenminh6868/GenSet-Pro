// So modelFacts (mọi khoá), factsFor (mọi model BĐK) và ctlKinds giữa <ref> và cây làm việc, trên MỌI hồ sơ.
// node do-facts.mjs <worktree> <ref> <out.json>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [wt, ref, out] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
const git = (...a) => execFileSync("git", ["-C", wt, ...a], { encoding: "utf8", maxBuffer: 1 << 30 });
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const { modelFacts, factsFor } = await import(pathToFileURL(path.join(SUP, "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(SUP, "ctl-module.mjs")).href);

const changed = new Set(git("diff", "--name-only", ref, "--", "suppliers/cn/").trim().split("\n").filter(Boolean).map((f) => path.basename(f)));
const files = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json"));
const after = files.map((f) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8")));
const before = files.map((f, i) => (changed.has(f) ? JSON.parse(git("show", `${ref}:suppliers/cn/${f}`)) : after[i]));

const id = (f) => `${f.key}|${f.supplierId}|${f.n}|${f.line}`;
const ser = (v) => (v instanceof Map ? Object.fromEntries([...v].map(([k, x]) => [k, ser(x)])) : v instanceof Set ? [...v].sort() : v);
const run = (list) => { const l = structuredClone(list), cat = C.build(l); return { cat, facts: modelFacts(cat, l), kinds: ser(CM.ctlKinds(l)) }; };
const A = run(before), B = run(after);

const res = { catalog: {}, factKeys: { before: A.facts.size, after: B.facts.size, added: [], lost: [] }, partChanged: {}, controller: [], factsFor: [], kinds: [] };
for (const k of ["engines", "alternators", "controllers", "gensets"]) if (A.cat[k]?.length != null) res.catalog[k] = [A.cat[k].length, B.cat[k].length];
for (const k of A.facts.keys()) if (!B.facts.has(k)) res.factKeys.lost.push(k);
for (const k of B.facts.keys()) if (!A.facts.has(k)) res.factKeys.added.push(k);
for (const k of new Set([...A.facts.keys(), ...B.facts.keys()])) {
  const a = A.facts.get(k) || [], b = B.facts.get(k) || [], sa = new Set(a.map(id)), sb = new Set(b.map(id));
  const gone = a.filter((f) => !sb.has(id(f))), plus = b.filter((f) => !sa.has(id(f)));
  if (!gone.length && !plus.length) continue;
  const part = k.split(":")[0];
  (res.partChanged[part] ||= { keys: 0, added: 0, lost: 0 }).keys++;
  res.partChanged[part].added += plus.length; res.partChanged[part].lost += gone.length;
  const by = {};
  for (const f of plus) { const s = `${f.supplierId}#${f.n}`; by[s] = (by[s] || 0) + 1; }
  if (part === "controller") res.controller.push({ key: k, before: a.length, after: b.length, lost: gone.length, addedBySource: by });
  else res.controller.push({ key: k, before: a.length, after: b.length, lost: gone.length, addedBySource: by, nonController: true });
}
const models = [...new Set([...A.facts.keys(), ...B.facts.keys()].filter((k) => k.startsWith("controller:")).map((k) => k.slice(11)))].sort();
for (const m of models) {
  const a = factsFor(A.facts, "controller", m).length, b = factsFor(B.facts, "controller", m).length;
  if (a !== b) res.factsFor.push({ model: m, before: a, after: b });
}
for (const k of new Set([...Object.keys(A.kinds), ...Object.keys(B.kinds)])) {
  const x = JSON.stringify(A.kinds[k] ?? null), y = JSON.stringify(B.kinds[k] ?? null);
  if (x !== y) res.kinds.push({ model: k, before: A.kinds[k] ?? null, after: B.kinds[k] ?? null });
}
fs.writeFileSync(out, JSON.stringify(res, null, 1), "utf8");
console.log(JSON.stringify({ catalog: res.catalog, keys: [res.factKeys.before, res.factKeys.after], keysAdded: res.factKeys.added.length, keysLost: res.factKeys.lost, partChanged: res.partChanged, factsForChanged: res.factsFor.length, kinds: res.kinds }, null, 1));
for (const c of res.controller.filter((x) => !x.nonController).sort((x, y) => (y.after - y.before) - (x.after - x.before)).slice(0, 40)) console.log(c.key, c.before, "->", c.after, c.lost ? `MẤT ${c.lost}` : "", JSON.stringify(c.addedBySource));
for (const c of res.controller.filter((x) => x.nonController).slice(0, 15)) console.log("KHÁC", c.key, c.before, "->", c.after, c.lost ? `MẤT ${c.lost}` : "", JSON.stringify(c.addedBySource));
