// Đo kho đầu phát: mỗi model đầu phát trong catalog (cn/, như config-bot local: bỏ incomplete) có những gì đọc ĐƯỢC.
// node kho.mjs <gốc repo> [out.json]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(process.argv[2] || ".");
const out = process.argv[3] || "kho.json";
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const byId = new Map(sups.map((s) => [s.id, s]));
const built = CAT.build(sups);
const RT = CB.sourceRatings(sups, path.join(root, "suppliers", "sources"));
const altKva = CB.altKvaOf(sups, built);
const facts = CB.modelFacts(built, sups);

const MAKERS = new Set(sups.filter((s) => s.role === "alternator_maker").map((s) => s.id));
const rows = [];
for (const a of built.alternators) {
  const supIds = a.suppliers || [];
  const makerSup = supIds.filter((id) => MAKERS.has(id));
  const rat = CB.ratingsFor(RT.alt, a.model);
  const lab50 = CB.altColumns(rat, { hz: 50, rating: "prime" });
  const lab60 = CB.altColumns(rat, { hz: 60, rating: "prime" });
  const attrs = CB.ratingsFor(RT.attr, a.model);
  const kv = altKva.get(CAT.keyOf(a.model)) || [];
  const specKeys = new Set((a.specs || []).map((s) => s.key));
  const fl = CB.factsFor(facts, "alternator", a.model) || [];
  const flab = fl.map((f) => `${f.label || ""} ${f.value || ""}`).join(" \n ");
  rows.push({
    model: a.model, make: a.make || "", makeConflict: !!a.makeConflict, suppliers: supIds.length, makerSup,
    kvaRange: a.kva, // kVA của dòng tổ máy dùng model (catalog)
    ratedLabeled50: lab50 ? { label: lab50.label, kVA: lab50.kVA } : null,
    ratedLabeled60: lab60 ? { label: lab60.label, kVA: lab60.kVA } : null,
    ratedRows: rat.length,
    kvaUnlabeled: kv.length ? [...new Set(kv.flatMap((x) => x.values))].slice(0, 20) : null,
    attrs: [...new Set(attrs.map((x) => x.key))],
    specs: [...specKeys].filter((k) => ["insul", "excit", "vreg", "ip", "eff", "poles", "bearing", "pitch", "thd", "phase"].includes(k)),
    factCount: fl.length,
    factHas: {
      excit: /excit|AREP|PMG|shunt|励磁|永磁/i.test(flab),
      avr: /\bAVR\b|regulator|调压器|D350|D550|R250|R450|SX460|AS440|MX341|MX321|DSR|DM110/i.test(flab),
      sc: /short[\s-]*circuit|300\s*%|3\s*In\b|短路/i.test(flab),
      vreg: /voltage\s*regul|稳态电压|电压调整/i.test(flab),
    },
  });
}
// Theo hãng
const by = new Map();
for (const r of rows) {
  const k = r.make || (r.makeConflict ? "(mâu thuẫn hãng)" : "(không hãng)");
  const o = by.get(k) || { models: 0, makerSheet: 0, labeled50: 0, labeled60: 0, unlabeledKva: 0, insul: 0, excit: 0, avr: 0, sc: 0, vreg: 0, ip: 0, anyKva: 0 };
  o.models++;
  if (r.makerSup.length) o.makerSheet++;
  if (r.ratedLabeled50) o.labeled50++;
  if (r.ratedLabeled60) o.labeled60++;
  if (r.kvaUnlabeled) o.unlabeledKva++;
  if (r.ratedLabeled50 || r.kvaUnlabeled) o.anyKva++;
  if (r.specs.includes("insul") || r.attrs.includes("insulation")) o.insul++;
  if (r.specs.includes("excit") || r.attrs.some((k) => /pmg|self_excited/.test(k)) || r.factHas.excit) o.excit++;
  if (r.factHas.avr) o.avr++;
  if (r.attrs.includes("sc300") || r.factHas.sc) o.sc++;
  if (r.specs.includes("vreg") || r.factHas.vreg) o.vreg++;
  if (r.specs.includes("ip")) o.ip++;
  by.set(k, o);
}
const table = [...by.entries()].sort((a, b) => b[1].models - a[1].models);
fs.writeFileSync(out, JSON.stringify({ root, at: new Date().toISOString(), alternators: rows.length, makers: [...MAKERS], byMake: Object.fromEntries(table), rows }, null, 1));
console.log(`đầu phát: ${rows.length}; NCC alternator_maker: ${MAKERS.size}`);
console.log("hãng | model | có dòng của NCC alternator_maker | kVA có nhãn 50Hz | 60Hz | kVA không nhãn | kVA bất kỳ | cách điện | kích từ | AVR | ngắn mạch | ổn định U | IP");
for (const [k, o] of table.slice(0, 40)) console.log([k, o.models, o.makerSheet, o.labeled50, o.labeled60, o.unlabeledKva, o.anyKva, o.insul, o.excit, o.avr, o.sc, o.vreg, o.ip].join(" | "));
