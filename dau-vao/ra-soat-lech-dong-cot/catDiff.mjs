// node catDiff.mjs <worktree code> <cn cũ> <cn mới>: số dòng danh mục (engine use có dòng, khoá như do-gop.mjs: NCC | động cơ |
// đầu phát | dòng) theo NCC ở hai bộ dữ liệu suppliers/cn, cùng mã. In mọi NCC có số dòng khác, và tổng.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OLD, NEW] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const load = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
function rows(dir) {
  const cat = CAT.build(load(dir)), by = new Map();
  for (const e of cat.engines) for (const u of e.uses) {
    if (!u.line && !u.lines) continue;
    const k = `${e.key}|${CAT.keyOf(u.line || (u.lines?.rows || []).join(" "))}`;
    (by.get(u.supplierId) || by.set(u.supplierId, new Set()).get(u.supplierId)).add(k);
  }
  return by;
}
const A = rows(OLD), B = rows(NEW);
let ta = 0, tb = 0;
for (const s of A.values()) ta += s.size;
for (const s of B.values()) tb += s.size;
console.log(`dòng (động cơ | dòng) cũ ${ta}, mới ${tb}, chênh ${tb - ta}`);
for (const id of [...new Set([...A.keys(), ...B.keys()])].sort()) {
  const a = A.get(id) || new Set(), b = B.get(id) || new Set();
  if (a.size === b.size && [...a].every((k) => b.has(k))) continue;
  const gone = [...a].filter((k) => !b.has(k)).length, added = [...b].filter((k) => !a.has(k)).length;
  console.log(`${id}: ${a.size} → ${b.size} (mất ${gone}, thêm ${added})`);
}
// Dòng của NCC đã xoá có còn ở NCC nhận gộp không (cùng động cơ | dòng).
for (const [from, to] of [["starlight-power", "xingguang-jiangsu"], ["yingtai-group", "yingtai-jiangsu"], ["kubota", "kubota-japan"]]) {
  const a = A.get(from) || new Set(), bo = A.get(to) || new Set(), bn = B.get(to) || new Set();
  const kept = [...a].filter((k) => bn.has(k)).length, dupBefore = [...a].filter((k) => bo.has(k)).length;
  console.log(`${from} → ${to}: ${a.size} dòng cũ; ${kept} có ở ${to} mới; ${dupBefore} đã trùng với ${to} từ trước`);
}
