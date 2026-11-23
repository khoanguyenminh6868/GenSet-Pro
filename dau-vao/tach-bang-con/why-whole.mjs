// Vì sao một khối có tiêu đề lặp vẫn không tách: cắt khối tại mỗi dòng lặp, xem phần nào không thành bảng / dòng nào không còn ở phần nào.
//   node why-whole.mjs <gốc repo> <id> <n> <dòng đầu khối (1-based)> <regex dòng tiêu đề lặp>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, id, n, at, re] = process.argv.slice(2);
process.argv.length = 2;
const { subTables } = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const L = fs.readFileSync(path.join(root, "suppliers", "sources", id, `${n}.md`), "utf8").split(/\r?\n/);
let j = at - 1; while (j < L.length && L[j].startsWith("|") && L[j].split("|").length >= 3) j++;
const b = L.slice(at - 1, j), R = new RegExp(re), whole = subTables(b);
console.log(`khối ${b.length} dòng; subTables = ${whole.length} bảng; rows ${whole[0]?.rows.length}, header ${whole[0]?.header.length}`);
const cuts = b.map((l, i) => (R.test(l) ? i : -1)).filter((i) => i > 1);
const starts = [0, ...cuts.map((i) => (b[i - 1].split("|").length < b[i].split("|").length && !/\d{3,}\s*\|/.test(b[i - 1]) ? i - 1 : i))];
const parts = starts.map((s, x) => b.slice(s, starts[x + 1] ?? b.length)), got = parts.map((p) => subTables(p));
parts.forEach((p, x) => console.log(`  phần ${x}: ${p.length} dòng, đầu "${p[0].slice(0, 46)}" → ${got[x].length} bảng, ${got[x][0]?.rows.length ?? 0} dòng`));
const kept = new Set(got.flat().flatMap((t) => [...t.rows, ...t.header]));
const miss = (whole[0]?.rows || []).filter((r) => !kept.has(r));
console.log(`dòng của bảng cả khối không còn ở phần nào: ${miss.length}`);
for (const r of miss.slice(0, 6)) console.log("   ", r.slice(0, 110));
const rec = JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${id}.json`), "utf8"));
const inBlock = new Set(b), rs = C.fromSupplier(rec, []).filter((r) => r.kind === "engine" && inBlock.has(r.line));
const tally = (f) => { const m = {}; for (const r of rs) { const v = String(f(r)); m[v] = (m[v] || 0) + 1; } return JSON.stringify(m); };
console.log(`bản ghi động cơ từ khối: ${rs.length}; freq ${tally((r) => r.freq)}; rpm ${tally((r) => r.rpm)}; hãng ${tally((r) => (r.makes || []).map((m) => m.name).join("+"))}`);
