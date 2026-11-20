// Vì sao không dòng ứng viên nào nhận +40 "bộ điều khiển có datasheet hãng" từ các model của #978 (DEIF, Woodward, Datakom,
// SICES): liệt kê mọi bộ điều khiển các NCC chào (hồ sơ `controllers` + dòng bảng, như `candidates` đọc) của 4 hãng, khoá
// của nó, và factsFor có dòng nào không. node cong40.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2] || "."), CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const built = C.build(sups), facts = CB.modelFacts(built, sups);
const BR = /deif|woodward|datakom|sices/i;
const keys = [...facts.keys()].filter((k) => k.startsWith("controller:")).map((k) => [k, facts.get(k).length, facts.get(k)[0].supplierId]).filter(([, , s]) => ["deif", "woodward", "datakom", "sices"].includes(s));
console.log("# Khoá fact bộ điều khiển của 4 hãng:", keys.map(([k, n]) => `${k.slice(11)}(${n})`).join(", "));
const seen = new Map();
for (const c of built.controllers || []) {
  if (!BR.test(c.brand || "")) continue;
  for (const u of c.uses || []) {
    const k = `${c.brand}|${c.model || "(không model)"}`;
    const x = seen.get(k) || { brand: c.brand, model: c.model || null, key: c.model ? C.keyOf(c.model) : null, uses: 0, sups: new Set(), facts: c.model ? CB.factsFor(facts, "controller", c.model).length : 0 };
    x.uses++; x.sups.add(u.supplierId); seen.set(k, x);
  }
}
console.log("# Bộ điều khiển 4 hãng NCC chào (built.controllers):");
for (const x of [...seen.values()].sort((a, b) => b.uses - a.uses)) console.log(`${x.brand} | ${x.model} | khoá ${x.key} | ${x.uses} lần, ${x.sups.size} NCC | factsFor ${x.facts}`);
// Mỗi model có datasheet: có NCC nào ghi nó (đúng khoá, hoặc khoá gần: bỏ dấu / hậu tố)?
console.log("# Model có datasheet mà không NCC nào chào đúng khoá:");
const offered = new Set([...seen.values()].map((x) => x.key).filter(Boolean));
for (const [k, n] of keys) if (!offered.has(k.slice(11))) console.log(`${k.slice(11)} (${n} dòng): khoá NCC gần nhất ${[...offered].filter((o) => o.replace(/\D/g, "") && k.includes(o.replace(/\D/g, ""))).join(", ") || "-"}`);
