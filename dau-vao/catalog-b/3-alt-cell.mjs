// node 3-alt-cell.mjs <worktree>: (1) mọi ô đầu phát trong mọi bảng (label "Alternator…|…" hoặc cột) có "/" hoặc hãng + mã
// có dấu cách; (2) mọi bản ghi đầu phát CAT.build có model chứa "/" hoặc dấu cách. Chỉ đọc. Dùng để đếm dạng việc 3.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
console.log("## (1) ô nhãn đầu phát có '/' hoặc dấu cách trong mã (bảng nhãn | giá trị)");
const LBL = /^(alternator|generator|alternador|发电机|电球)[^|]{0,30}$/i;
const seen = new Map();
for (const s of sups) for (const t of s.specTables || []) for (const r of [...(t.header || []), ...(t.rows || [])]) {
  const c = CAT.cellsOf(r);
  if (c.length < 2 || !LBL.test(c[0]) || /power|kva|kw|volt|freq|efficien|class|insul|excit|regul|protect|phase|pf|factor|speed|rpm|bearing|connect|pole|wire|cool|temp|current|功率|电压|频率|效率|绝缘|励磁|防护|相|转速/i.test(c[0])) continue;
  const v = c.slice(1).join(" | ");
  if (!/\/|\s\S*\d/.test(v)) continue;
  const k = `${s.id}\t${c[0]}\t${v}`;
  if (!seen.has(k)) seen.set(k, []);
  seen.get(k).push(t.n);
}
for (const [k, ns] of [...seen].sort()) console.log(`${k}\tn ${[...new Set(ns)].join(",")}`);
console.log("\n## (2) bản ghi đầu phát có '/' hoặc dấu cách trong model");
const cat = CAT.build(sups);
for (const e of cat.alternators) {
  if (!/[/\s]/.test(e.model) && ![...e.names].some((n) => /[/\s]/.test(n))) continue;
  for (const u of e.uses) console.log(`${e.key}\t${[...e.names].join(" ‖ ")}\tmakes=${e.makes.map((m) => m.name).join(",")}\t${u.supplierId}\tn${u.n}\tb${u.table}\tr${u.row}\t${String(u.line || "").slice(0, 160)}`);
}
