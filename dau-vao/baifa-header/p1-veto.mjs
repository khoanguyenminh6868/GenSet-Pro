// Điểm 1: luật "prime = 0,8 × standby cùng đơn vị là kW / kVA đặt nhầm tiêu đề" (catalog.js titledPowers, `veto`).
// Chạy trên BẢN CHÉP của web/catalog.js có gắn đếm (tệp repo không đổi): mỗi lần luật kích hoạt ghi lại tiêu đề, tiêu đề con,
// ô, và đơn vị của prime / standby lấy từ đâu (tiêu đề con tự ghi "KVA" hay tiêu đề chung phía trên).
// Rồi chạy lại với điều kiện đề xuất (không veto khi CẢ HAI tiêu đề con tự ghi đơn vị) và so mọi bản ghi.
//   node p1-veto.mjs <gốc repo> <tệp ra .json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, outFile] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
let src = fs.readFileSync(path.join(root, "web", "catalog.js"), "utf8");
const rep = (a, b) => { if (src.split(a).length !== 2) throw new Error("không khớp đúng một chỗ: " + a.slice(0, 60)); src = src.replace(a, () => b); };
rep("const got = {}, clash = new Set(), bare = new Set(), at = {}, inh = new Set();", "const got = {}, clash = new Set(), bare = new Set(), at = {}, inh = new Set(), usrc = {};");
rep("          put(rate, unit, val(c), inherits, key);\n        }", "          if (unit && usrc[rate] == null) usrc[rate] = unitOfCell(c) ? \"cell\" : (k > 1 ? (sUnit ? \"sub\" : \"title\") : (tUnit ? \"title\" : \"sub\"));\n          put(rate, unit, val(c), inherits, key);\n        }");
rep("Math.abs(p - 0.8 * s) <= 0.011 * s) return { veto: true };", "Math.abs(p - 0.8 * s) <= 0.011 * s) { globalThis.__veto.push({ sid: globalThis.__sid, PT: PT.slice(), sub: sub.slice(), cells: cells.slice(), p, s, u, usrc: { ...usrc } }); if (!(globalThis.__fix && usrc.prime === \"sub\" && usrc.standby === \"sub\")) return { veto: true }; }");
const copy = path.join(here, "catalog-veto.mjs");
fs.writeFileSync(copy, src, "utf8");
globalThis.__veto = []; globalThis.__fix = false;
const mod = await import(pathToFileURL(copy).href);
const C = globalThis.GenbidCatalog || mod.default;
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const runAll = (fix) => { globalThis.__fix = fix; globalThis.__veto = []; const m = new Map(); for (const s of S) { globalThis.__sid = s.id; m.set(s.id, C.fromSupplier(s, [])); } return { recs: m, veto: globalThis.__veto }; };
const A = runAll(false), B = runAll(true);
// Lần kích hoạt khác nhau: NCC + tiêu đề + tiêu đề con + ô của dòng (một dòng được thử nhiều cách đọc).
const uniq = new Map();
for (const v of A.veto) { const k = [v.sid, v.PT.join("¦"), v.sub.join("¦"), v.cells.join("¦")].join(" ║ "); if (!uniq.has(k)) uniq.set(k, v); }
const ev = [...uniq.values()];
const both = ev.filter((v) => v.usrc.prime === "sub" && v.usrc.standby === "sub");
// Bản ghi đổi khi áp điều kiện đề xuất.
const changes = [];
for (const s of S) {
  const a = A.recs.get(s.id), b = B.recs.get(s.id);
  if (a.length !== b.length) { changes.push({ sid: s.id, note: `số bản ghi ${a.length} → ${b.length}` }); continue; }
  a.forEach((x, i) => { if (JSON.stringify(x) !== JSON.stringify(b[i])) changes.push({ sid: s.id, n: x.n, table: x.table, row: x.row, kind: x.kind, model: x.model, genset: x.genset, line: x.line, before: x.power, after: b[i].power, onlyPower: JSON.stringify({ ...x, power: 0 }) === JSON.stringify({ ...b[i], power: 0 }) }); });
}
// Bản ghi hiện mang công suất do veto (rated kVA/kW bằng đúng hai ô) của các dòng kích hoạt.
fs.writeFileSync(outFile, JSON.stringify({ events: ev, both, changes }, null, 1), "utf8");
const cnt = (l) => { const m = new Map(); for (const x of l) m.set(x.sid, (m.get(x.sid) || 0) + 1); return [...m].sort((a, b) => b[1] - a[1]); };
console.log(`luật kích hoạt: ${ev.length} dòng (khác nhau) ở ${cnt(ev).length} NCC`);
console.log(cnt(ev).map(([k, v]) => `${k} ${v}`).join(", "));
const srcKinds = new Map(); for (const v of ev) { const k = `prime:${v.usrc.prime} standby:${v.usrc.standby}`; srcKinds.set(k, (srcKinds.get(k) || 0) + 1); }
console.log("đơn vị lấy từ:", [...srcKinds].map(([k, v]) => `${k} = ${v}`).join("; "));
console.log(`\ncả hai tiêu đề con tự ghi đơn vị: ${both.length} dòng ở ${cnt(both).length} NCC`);
console.log(cnt(both).map(([k, v]) => `${k} ${v}`).join(", "));
for (const v of both) console.log(`  ${v.sid} | tiêu đề: ${v.PT.join(" ¦ ")} | con: ${v.sub.join(" ¦ ")} | ${v.u} standby ${v.s} prime ${v.p} | ${v.cells.join(" | ").slice(0, 150)}`);
console.log(`\nđiều kiện đề xuất: ${changes.length} bản ghi đổi ở ${cnt(changes).length} NCC; chỉ đổi công suất: ${changes.filter((c) => c.onlyPower).length}`);
console.log(cnt(changes).map(([k, v]) => `${k} ${v}`).join(", "));
for (const c of changes) console.log(`  ${c.sid} n${c.n} b${c.table} r${c.row} ${c.kind} ${c.model} | ${JSON.stringify(c.before)} → ${JSON.stringify(c.after)}${c.onlyPower ? "" : " (!) đổi cả trường khác"} | ${String(c.line).slice(0, 110)}`);
