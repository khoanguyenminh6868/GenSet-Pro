// Số dòng datasheet modelFacts gắn cho MỌI model BĐK (bdk-ds-3). node dem-facts.mjs <suppliers>
// node dem-facts.mjs <thư mục suppliers của worktree>   (in JSON { model: số dòng })
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const ROOT = path.resolve(process.argv[2]);
const bot = await import(pathToFileURL(path.join(ROOT, "config-bot.mjs")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
const recs = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
const built = CAT.build(recs);
const facts = bot.modelFacts(built, recs);
const out = {};
const want = /./;
for (const c of built.controllers) {
  if (!want.test(c.make || "")) continue;
  const f = facts.get(`controller:${c.key}`) || [];
  out[`${c.make} | ${c.model} | key=${c.key}`] = f.length;
}
// mọi khoá controller: có của 4 hãng không nằm trong danh mục?
const extra = {};
for (const [k, v] of facts) if (k.startsWith("controller:") && !built.controllers.some((c) => `controller:${c.key}` === k) && v.some((x) => true)) extra[k] = v.length;
console.log(JSON.stringify({ danhMuc: out, ngoaiDanhMuc: extra }, null, 1));
