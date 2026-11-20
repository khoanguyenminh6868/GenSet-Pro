// node gs-sup.mjs <repo> : số tổ máy (build().gensets) theo NCC, mức công suất gặp
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const REPO = process.argv[2];
await import(pathToFileURL(path.join(REPO, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog, DIR = path.join(REPO, "suppliers", "cn");
const sups = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
const g = C.build(sups).gensets, by = {};
for (const e of g) {
  const s = (by[e.suppliers[0]] ||= { n: 0, lv: new Set(), make: new Set(), freq: new Set() });
  s.n++; for (const u of e.uses) for (const k of Object.keys(u.power || {})) s.lv.add(k);
  s.make.add(e.make || "-"); for (const f of e.freq) s.freq.add(f);
}
for (const [k, v] of Object.entries(by)) console.log(k, v.n, [...v.lv].join(","), [...v.make].join(","), [...v.freq].join(","));
