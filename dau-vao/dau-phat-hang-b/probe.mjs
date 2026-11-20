// Soát dữ liệu cho PR B: định mức + thuộc tính của một model đầu phát hãng, hãng / nơi SX mặc định, cap, xuất xứ HSMT.
// node probe.mjs <gốc repo> <model> [TBMT]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, model, key] = process.argv.slice(2), root = path.resolve(rootArg);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const RT = await import(pathToFileURL(path.join(root, "suppliers", "ratings.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const R = CB.sourceRatings(sups, path.join(root, "suppliers", "sources"));
const list = CB.ratingsFor(R.alt, model);
console.log("alt ratings:", list.length);
for (const x of list.filter((x) => x.hz === 50 && x.phase === 3)) console.log(" ", x.supplierId, x.n, x.duty, JSON.stringify(x.rise), x.volt, x.kVA);
console.log("attr:", JSON.stringify(CB.ratingsFor(R.attr, model).map((a) => [a.key, a.value, a.supplierId, a.n])));
const ls = fs.readFileSync(path.join(root, "suppliers", "sources", "leroy-somer-fuzhou", "1012.md"), "utf8");
console.log("lsSheetAttrs 1012:", JSON.stringify(RT.lsSheetAttrs(ls).map((a) => [a.key, a.value])));
for (const m of ["Leroy-Somer", "Stamford", "Mecc Alte"]) console.log("madeIn", m, JSON.stringify(CAT.madeIn("alternator", [m], [""], "X")));
const makers = sups.filter((s) => s.role === "alternator_maker");
console.log("alternator_maker:", makers.length, makers.map((s) => `${s.id}:${s.country}:${CB.supplierFamily(s, true)}`).join(" "));
if (key) {
  const t = fs.readFileSync(path.join(import.meta.dirname, "hsmt", `${key}.txt`), "utf8");
  console.log("partOrigin", JSON.stringify(CB.partOriginOfHsmt(t)));
  console.log("hints.freq", CB.hintsOf(t).freq);
}
