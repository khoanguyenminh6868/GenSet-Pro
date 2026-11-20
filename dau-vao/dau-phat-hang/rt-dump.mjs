// Đầu vào ratings mà config-bot `check` dùng (sourceRatings: alt / eng / attr → ratingsFor theo model), cho MỌI model đầu
// phát và động cơ của catalog và MỌI cấu hình trong configmatch đã lưu. node rt-dump.mjs <gốc repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]), out = process.argv[3];
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8")));
const RT = CB.sourceRatings(sups, path.join(root, "suppliers", "sources"));
const strip = (l) => l.map(({ lines, line, ...x }) => x);
const built = CAT.build(sups.filter((s) => s.status !== "incomplete"));
const res = { alt: {}, eng: {}, attr: {}, configs: {}, mapSize: { alt: RT.alt.size, eng: RT.eng.size, attr: RT.attr.size } };
for (const a of built.alternators) { const r = CB.ratingsFor(RT.alt, a.model); if (r.length) res.alt[a.model] = strip(r); const t = CB.ratingsFor(RT.attr, a.model); if (t.length) res.attr[a.model] = strip(t); }
for (const e of built.engines) { const r = CB.ratingsFor(RT.eng, e.model); if (r.length) res.eng[e.model] = strip(r); }
const cm = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/configmatch.json", "utf8"));
for (const [k, v] of Object.entries(cm[Object.keys(cm)[0]])) for (const c of (v?.d?.result || v?.d)?.configs || []) {
  const m = c.alternator?.model;
  if (m) res.configs[`${k}#${c.rank}|${m}`] = { alt: strip(CB.ratingsFor(RT.alt, m)), attr: strip(CB.ratingsFor(RT.attr, m)) };
}
fs.writeFileSync(out, JSON.stringify(res));
console.log(`alt ${Object.keys(res.alt).length} model, eng ${Object.keys(res.eng).length}, attr ${Object.keys(res.attr).length}, cấu hình có đầu phát ${Object.keys(res.configs).length}`, res.mapSize);
