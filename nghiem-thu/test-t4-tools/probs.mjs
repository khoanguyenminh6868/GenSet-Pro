// Print the problems and selected checks of a fixture run (manual review).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
const S = "C:/Projects/GenSet Pro/wt-test-t4/suppliers/";
const CB = await import(pathToFileURL(S + "config-bot.mjs").href);
const { readBundle } = await import(pathToFileURL(S + "fixtures/runs/regress.mjs").href);
const [file, itemRe] = process.argv.slice(2);
const b = readBundle(file), dir = fs.mkdtempSync(path.join(os.tmpdir(), "t4p-"));
for (const [f, t] of Object.entries(b.sources)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), t); }
const out = CB.check(b.result, { hsmtText: b.hsmtText, suppliers: b.suppliers, readWeb: () => null, origin: b.meta.origin, basis: b.meta.basis, sized: !!b.meta.sized, sourcesDir: dir });
CB.rankConfigs(out.result);
for (const p of out.problems) console.log("P", p);
if (itemRe) for (const c of out.result.configs) for (const x of c.checks.filter((x) => new RegExp(itemRe, "i").test(x.item))) console.log(`#${c.rank}`, JSON.stringify(x).slice(0, 700));
console.log("clarify", JSON.stringify(out.result.clarify)?.slice(0, 800));
