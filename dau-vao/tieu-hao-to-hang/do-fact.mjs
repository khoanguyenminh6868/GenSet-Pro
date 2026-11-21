// Mọi fact tiêu hao của động cơ: có `sheet` không, vì sao sheetFuel không nhận. Chỉ đọc. node do-fact.mjs <worktree>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2];
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href), CAT = globalThis.GenbidCatalog, CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete"), full = CAT.build(sups), facts = B.modelFacts(full, sups);
const roles = new Map(sups.map((s) => [s.id, s.role])), add = (m, k) => m.set(k, (m.get(k) || 0) + 1), bySup = new Map(), bySheet = new Map(), engines = new Set(), sheetEng = new Set(), lh = new Map(), ex = new Map();
const LH = /l\s*\/\s*h|l\/hr|lph|l[íi]t\s*\/\s*(gi[ờo]|h)|litres?\s*\/\s*h/i, G = /g\s*\/\s*(k?w|hp|ps)|gr\s*\/\s*kwh/i;
for (const [k, list] of facts) { if (!k.startsWith("engine:")) continue; for (const f of list) { if (!/^fuel(75|50)?$/.test(f.key)) continue; engines.add(k); add(bySup, `${f.supplierId} (${roles.get(f.supplierId) || "?"})`); add(bySheet, f.sheet ? "sheet" : "không sheet"); if (f.sheet) { sheetEng.add(k); const t = `${f.label} ${f.value} ${f.unitCell || ""}`, u = LH.test(t) ? "L/h" : G.test(t) ? "g/kWh" : "không rõ"; add(lh, `${f.supplierId} ${u}`); if (!ex.has(`${f.supplierId} ${u}`)) ex.set(`${f.supplierId} ${u}`, `${k.slice(7)} | ${f.label} | ${f.value} | ${f.unitCell || ""}`); } } }
console.log("Động cơ có fact tiêu hao:", engines.size, "| có fact tờ hãng:", sheetEng.size);
console.log("Theo NCC:", JSON.stringify([...bySup].sort((a, b) => b[1] - a[1])), JSON.stringify([...bySheet]));
console.log("Fact tờ hãng theo NCC + đơn vị:"); for (const [k, n] of [...lh].sort((a, b) => b[1] - a[1])) console.log(" ", n, k, "| vd:", String(ex.get(k)).slice(0, 110));
