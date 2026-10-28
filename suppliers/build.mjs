// Builds cn/<id>.json from a short spec: node suppliers/build.mjs <specs.mjs>
// The spec file exports an array of records written briefly; each source's URL and read date come from the first
// lines of its saved file (sources/<id>/<n>.md), so they are never typed by hand. Then run verify.mjs.
//   { id, role, en, zh, brands, web, prov, city, founded, fsrc, conf, status,
//     src: { 1: [tier, "quote", ...], 2: [...] },
//     str: [["text", n, ...]], cert: [["ISO9001", n]],
//     lines: [{ k: "genset", s: "series", fuel, eng: [], models: [], alt: [], p: [min, max, "kVA", "standby", n], types: [], std: [], emis: [], src: [n] }],
//     miss: ["..."] }
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const specs = (await import(pathToFileURL(path.resolve(process.argv[2])).href)).default;
const today = new Date().toISOString().slice(0, 10);
for (const r of specs) {
  const sources = Object.entries(r.src).map(([n, [tier, ...quote]]) => {
    const file = `sources/${r.id}/${n}.md`;
    const head = fs.readFileSync(path.join(ROOT, file), "utf8").split("\n", 3);
    return { n: Number(n), url: head[0].replace(/^URL:\s*/, "").trim(), accessedAt: (head[1] || "").replace(/^Accessed:\s*/, "").trim() || today, tier, quote, file };
  });
  const allSrc = sources.map((s) => s.n);
  const rec = {
    id: r.id, country: r.country || "CN", role: r.role, status: r.status || "verified",
    names: { en: r.en || null, zh: r.zh || null, brands: r.brands || [] },
    website: r.web || null, hq: { province: r.prov || null, city: r.city || null },
    founded: r.founded ?? null, ...(r.founded ? { foundedSrc: [].concat(r.fsrc || allSrc[0]) } : {}),
    relatedIds: r.related || [],
    strengths: (r.str || []).map(([text, ...src]) => ({ text, src })),
    productLines: (r.lines || []).map((l) => ({
      kind: l.k || "genset", series: l.s, fuel: l.k === "alternator" ? null : l.fuel || "diesel",
      engineMakes: l.eng || [], engineModels: l.models || [], alternatorMakes: l.alt || [],
      power: l.p ? { min: l.p[0], max: l.p[1], unit: l.p[2], rating: l.p[3] || "unspecified", src: [l.p[4] ?? (l.src || allSrc)[0]] } : null,
      frequency: l.freq || [], voltage: l.volt || [], types: l.types || [], emission: l.emis || [], standards: l.std || [],
      src: l.src || [l.p?.[4] ?? allSrc[0]],
    })),
    certifications: (r.cert || []).map(([name, ...src]) => ({ name, src })),
    exportMarkets: r.markets || [],
    missing: r.miss || [],
    sources,
    confidence: r.conf || "medium",
    checkedAt: today,
    checkedBy: "claude-code",
  };
  fs.writeFileSync(path.join(ROOT, "cn", `${r.id}.json`), JSON.stringify(rec, null, 2) + "\n", "utf8");
  console.log("wrote", r.id);
}
