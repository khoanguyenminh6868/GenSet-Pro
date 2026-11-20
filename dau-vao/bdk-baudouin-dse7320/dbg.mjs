// node dbg.mjs <repo>: check IB2600603983 with and without the controller swap; groups of controller checks that differ.
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]), here = import.meta.dirname;
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const data = JSON.parse(fs.readFileSync(path.join(here, "configmatch.json"), "utf8"));
const text = fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/dau-phat-hang-b/hsmt/IB2600603983.txt", "utf8");
const run = (swap) => {
  process.env.GENBID_CTL_SWAP = swap ? "1" : "0";
  const result = JSON.parse(JSON.stringify(data.result));
  for (const c of result.configs) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
  const opts = { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources") };
  const o = CB.check(result, opts);
  const snap = JSON.stringify(o.result.configs.map((c) => [c.controller, c.checks]));
  const o2 = CB.check(o.result, opts);
  return { o, again: JSON.stringify(o2.result.configs.map((c) => [c.controller, c.checks])) === snap, o2 };
};
const off = run(false), on = run(true);
console.log("problems off", off.o.problems, "on", on.o.problems, "lặp lại on:", on.again);
for (const c of on.o.result.configs) {
  const b = off.o.result.configs.find((x) => x.engine?.model === c.engine?.model && x.alternator?.model === c.alternator?.model);
  console.log(`\n${c.engine.model}: ${b?.controller?.model} → ${c.controller?.model}`);
  for (const x of c.checks.filter((x) => x.part === "controller")) {
    const y = b?.checks.find((z) => z.item === x.item);
    const ps = (x.parts || []).map((p) => { const q = (y?.parts || []).find((r) => r.item === p.item); return q && q.status !== p.status ? `  · ${p.item}: ${q.status} → ${p.status} ${(p.note || "").slice(0, 160)}` : null; }).filter(Boolean);
    if (y?.status !== x.status || ps.length) console.log(` ${x.item}: ${y?.status} → ${x.status}${x.parts ? "" : ` ${(x.note || "").slice(0, 200)}`}\n${ps.join("\n")}`);
  }
}
if (!on.again) for (const [i, c] of on.o2.result.configs.entries()) { const a = JSON.stringify([c.controller, c.checks]), b0 = JSON.stringify([on.o.result.configs[i]?.controller, on.o.result.configs[i]?.checks]); if (a !== b0) { let k = 0; while (a[k] === b0[k]) k++; console.log("KHÁC ở", c.engine.model, b0.slice(Math.max(0, k - 150), k + 150), "\n →", a.slice(Math.max(0, k - 150), k + 150)); } }
