// node one.mjs <lượt>: top main / nhánh của một lượt kèm NCC, động cơ, hãng, TQ, điểm (soát tay một lượt).
import fs from "node:fs";
import path from "node:path";
const [K] = process.argv.slice(2);
const WT = "C:/Projects/GenSet Pro/wt-so-dong-c";
await import("file:///C:/Projects/GenSet%20Pro/wt-so-dong-c/suppliers/config-bot.mjs");
const CAT = globalThis.GenbidCatalog, dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), engs = new Map(cat.engines.map((e) => [e.key, e]));
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const g = J("./gop-goc.json")[K], n = J("./gop-nhanh.json")[K], r = J("./do-r-nhanh.json")[K];
const desc = (q, s) => { const [sp, ek] = q.split("|"), e = engs.get(ek); return `${String(s).padStart(4)} ${CAT.originOf(e || {}) === "cn" ? "TQ" : "  "} ${(e?.make || "?").padEnd(18)} ${ek.padEnd(16)} ${sp}`; };
console.log("hints", JSON.stringify(r?.hints));
const tb = new Set(n.top), ta = new Set(g.top), sc = new Map(n.all.map(([q, s]) => [q, s])), scA = new Map(g.all.map(([q, s]) => [q, s]));
console.log("--- top main (− = rời)"); g.top.forEach((q) => console.log((tb.has(q) ? "  " : "− ") + desc(q, scA.get(q))));
console.log("--- top nhánh (+ = vào)"); n.top.forEach((q) => console.log((ta.has(q) ? "  " : "+ ") + desc(q, sc.get(q))));
