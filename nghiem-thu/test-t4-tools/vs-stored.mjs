// Re-check on the full DB vs the stored result (what the web shows): per config line differences.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const S = "C:/Projects/GenSet Pro/wt-test-t4/suppliers/";
const CB = await import(pathToFileURL(S + "config-bot.mjs").href);
const { summarize } = await import(pathToFileURL(path.join(process.env.LOCALAPPDATA, "Temp/claude/t4/summary.mjs")).href);
const snap = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4snap");
const all = Object.values(JSON.parse(fs.readFileSync(path.join(snap, "supplier.json"), "utf8")).docs).map((x) => x.d).filter((s) => s && s.status !== "incomplete");
const cmAll = JSON.parse(fs.readFileSync(path.join(snap, "configmatch.json"), "utf8")).docs;
for (const a of process.argv.slice(2)) {
  const [key, size] = a.split(":");
  const cm = cmAll[key].d.result, stored = size ? cm.sizes[Number(size) - 1].result : cm;
  const hsmtText = fs.readFileSync(path.join(snap, "hsmt", `${key}.txt`), "utf8");
  const origin = stored.origin || cm.origin || "all";
  const res = JSON.parse(JSON.stringify(stored));
  const out = CB.check(res, { hsmtText, suppliers: all, readWeb: () => null, origin, basis: origin === "g7eu" ? "origin" : undefined, sized: !!size });
  CB.rankConfigs(out.result);
  const now = summarize(out), then = summarize({ result: stored });
  console.log(`== ${a} problems now ${out.problems.length}; configs then ${then.configs.length} now ${now.configs.length}`);
  for (const p of out.problems) console.log("   P", p.slice(0, 200));
  const ln = (c) => `#${c.rank} ${c.engine} | ${c.alternator} | ${c.controller} | ${c.suppliers.join(" ")} | ${JSON.stringify(c.checks)} u${c.unverifiedChecks} | ${c.lossWarn.join(" ")}`;
  const T = then.configs.map(ln), N = now.configs.map(ln);
  for (const l of T) if (!N.includes(l)) console.log("  then", l);
  for (const l of N) if (!T.includes(l)) console.log("  now ", l);
}
