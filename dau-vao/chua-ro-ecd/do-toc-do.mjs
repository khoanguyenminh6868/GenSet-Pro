// Bằng chứng cho luật tốc độ: tờ động cơ nào ghi nhiều tốc độ, và mọi dòng NCC của 6M31G660/6. Chỉ đọc. node do-toc-do.mjs <worktree>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2], CN = path.join(WT, "suppliers", "cn"), B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href), C = globalThis.GenbidCatalog;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((s) => s.status !== "incomplete"), cat = C.build(sups), sh = B.engineSheetsOf(cat, sups);
const by = new Map(); for (const [k, e] of sh) { const v = [...new Set(e.speeds.map((x) => x.v))].sort().join("/") || "không"; by.set(v, [...(by.get(v) || []), k]); }
console.log("tờ một model:", sh.size); for (const [v, l] of [...by].sort((a, b) => b[1].length - a[1].length)) console.log(` tốc độ ${v}: ${l.length}${l.length <= 8 ? ` (${l.join(", ")})` : ""}`);
const k = C.keyOf("6M31G660/6"), e = cat.engines.find((x) => x.key === k);
console.log("6M31G660/6: tờ hãng", JSON.stringify([...new Set((sh.get(k)?.speeds || []).map((x) => x.v))]));
for (const u of e?.uses || []) { const row = { header: u.header || [], line: u.line || "", title: u.title || "" }; if (u.line) console.log(" ", u.supplierId, JSON.stringify(B.rowRunOf(row)), "|", u.line.slice(0, 80)); }
