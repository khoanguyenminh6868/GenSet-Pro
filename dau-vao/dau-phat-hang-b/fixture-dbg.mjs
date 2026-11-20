// In chi tiết đầu phát của một fixture hồi quy sau check (nhánh). node fixture-dbg.mjs <gốc repo> <IB.../config-1>
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
const [rootArg, name] = process.argv.slice(2), root = path.resolve(rootArg);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const RG = await import(pathToFileURL(path.join(root, "suppliers", "fixtures", "runs", "regress.mjs")).href);
const b = RG.readBundle(path.join(root, "suppliers", "fixtures", "runs", `${name}.input.json.gz`)), dir = fs.mkdtempSync(path.join(os.tmpdir(), "dbg-"));
for (const [f, text] of Object.entries(b.sources || {})) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); }
console.log("sources:", Object.keys(b.sources || {}).join(" "));
console.log("trước:", (b.result.configs || []).map((c) => `#${c.rank} ${c.engine?.model} | ${c.alternator?.model} | ${c.controller?.model}`).join("\n  "));
const out = CB.check(JSON.parse(JSON.stringify(b.result)), { hsmtText: b.hsmtText, suppliers: b.suppliers, readWeb: () => null, origin: b.meta.origin, basis: b.meta.basis, sized: !!b.meta.sized, sourcesDir: dir });
console.log("makerAlt:", JSON.stringify(out.result.makerAlt));
for (const c of out.result.configs) console.log(`#${c.rank} ${c.engine?.model} | ${c.alternator?.model}${c.alternator?.fromMaker ? ` [hãng ${c.alternator.byCode ? "code" : "agent"}] was=${c.alternator.was?.model || "-"} ${c.alternator.wasWhy || ""}` : ""}`);
console.log("problems:", out.problems.filter((p) => /đầu phát|datasheet/.test(p)).join("\n"));
CB.rankConfigs(out.result);
for (const c of out.result.configs) console.log(`R#${c.rank} ${c.engine?.model} | ${c.alternator?.model} | ${c.controller?.model} ${JSON.stringify(CB.scoreOf(c, out.result.requirements))}`);
fs.rmSync(dir, { recursive: true, force: true });
