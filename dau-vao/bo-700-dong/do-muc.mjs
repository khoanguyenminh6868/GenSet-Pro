// (1) ctlKinds: code + dữ liệu gốc so với code + dữ liệu mới. (2) Dòng MỚI gắn cho model X mà chữ dòng chỉ nêu model BĐK khác.
// node do-muc.mjs <worktree> <ref> <thư mục tạm> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [wt, ref, tmp, out] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
const git = (...a) => execFileSync("git", ["-C", wt, ...a], { encoding: "utf8", maxBuffer: 1 << 30 });
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const { modelFacts, ctlModelsIn } = await import(pathToFileURL(path.join(SUP, "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(SUP, "ctl-module.mjs")).href);
const importsOfOld = git("show", `${ref}:suppliers/ctl-module.mjs`).match(/^import .*$/gm) || [];
console.log("import của ctl-module gốc:", importsOfOld.length);
fs.mkdirSync(path.join(tmp, "suppliers"), { recursive: true });
fs.mkdirSync(path.join(tmp, "web"), { recursive: true });
const copy = (p) => { const f = path.join(tmp, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, git("show", `${ref}:${p}`), "utf8"); };
copy("suppliers/ctl-module.mjs");
for (const l of importsOfOld) { const m = l.match(/from "\.\/(.+)"/); if (m) copy(`suppliers/${m[1]}`); const w = l.match(/from "\.\.\/web\/(.+)"/); if (w) copy(`web/${w[1]}`); }
const OLD = await import(pathToFileURL(path.join(tmp, "suppliers", "ctl-module.mjs")).href);

const changed = new Set(git("diff", "--name-only", ref, "--", "suppliers/cn/").trim().split("\n").filter(Boolean).map((f) => path.basename(f)));
const files = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json"));
const after = files.map((f) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8")));
const before = files.map((f, i) => (changed.has(f) ? JSON.parse(git("show", `${ref}:suppliers/cn/${f}`)) : after[i]));
const ka = OLD.ctlKinds(before, { modelsIn: ctlModelsIn }), kb = CM.ctlKinds(after, { modelsIn: ctlModelsIn });
const kd = [...new Set([...ka.keys(), ...kb.keys()])].filter((k) => ka.get(k) !== kb.get(k));
console.log(`ctlKinds code gốc + dữ liệu gốc: ${ka.size}; code mới + dữ liệu mới: ${kb.size}; khác: ${kd.length}`, kd.map((k) => `${k}:${ka.get(k)}->${kb.get(k)}`).join(" "));

const fa = modelFacts(C.build(structuredClone(before)), before), fb = modelFacts(C.build(structuredClone(after)), after);
const id = (f) => `${f.key}|${f.supplierId}|${f.n}|${f.line}`, squash = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, "");
const rows = ["model\tnguon\tdong"], per = {};
let addedTotal = 0;
for (const [k, b] of fb) {
  if (!k.startsWith("controller:")) continue;
  const key = k.slice(11), old = new Set((fa.get(k) || []).map(id));
  for (const f of b) {
    if (old.has(id(f))) continue;
    addedTotal++;
    const named = [...new Set(ctlModelsIn(f.line || "").map(squash))];
    if (!named.length || named.includes(key)) continue;
    per[key] = (per[key] || 0) + 1;
    rows.push(`${key}\t${f.supplierId}#${f.n}\t${String(f.line).replace(/\t/g, " ").slice(0, 180)}`);
  }
}
fs.writeFileSync(out, rows.join("\n") + "\n", "utf8");
console.log(`dòng mới gắn BĐK: ${addedTotal}; dòng chỉ nêu model khác: ${rows.length - 1}`);
console.log(Object.entries(per).sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k, v]) => `${k}=${v}`).join(" "));
for (const r of rows.slice(1, 9)) console.log(r.slice(0, 170));
