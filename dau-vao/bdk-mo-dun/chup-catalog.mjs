// Chụp những gì code đọc từ hồ sơ NCC (cn/*.json) của MỘT repo: GenbidCatalog.build() (controllers, engines, alternators)
// và modelFacts (khoá controller:* / engine:* / alternator:*, số fact mỗi khoá). Chạy riêng cho repo gốc và repo nhánh
// (mỗi lần một tiến trình: catalog.js gắn vào globalThis), rồi so hai tệp bằng so-catalog.mjs.
// node chup-catalog.mjs <repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [repo, out] = process.argv.slice(2);
const bot = await import(pathToFileURL(path.join(repo, "suppliers/config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(repo, "suppliers/cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const built = CAT.build(sups);
const facts = bot.modelFacts(built, sups);
const use = (u) => `${u.supplierId}|${u.n}|${u.line || ""}`;
const snap = {
  controllers: Object.fromEntries((built.controllers || []).map((c) => [`${c.brand}|${c.model}`, c.uses.map(use).sort()])),
  engines: Object.fromEntries((built.engines || []).map((e) => [e.key, e.uses.length])),
  alternators: Object.fromEntries((built.alternators || []).map((e) => [e.key, e.uses.length])),
  facts: Object.fromEntries([...facts].map(([k, v]) => [k, v.map((f) => `${f.supplierId}|${f.n}|${f.line}`).sort()])),
};
fs.writeFileSync(out, JSON.stringify(snap), "utf8");
console.log(out, "controllers", Object.keys(snap.controllers).length, "facts", Object.keys(snap.facts).length);
