// node odd-keys.mjs <worktree>: khoá động cơ của CAT.build có ký tự ngoài A-Z 0-9 . - / ( ) (★, *, ®, ^ …), theo từng ký tự,
// kèm khoá "sạch" tương ứng (bỏ ký tự lạ) có tồn tại riêng không (tức là dòng bị tách khỏi model thật). Chỉ đếm.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), keys = new Set(cat.engines.map((e) => e.key));
const BAD = /[^A-Z0-9.\-/()]/gu;
const odd = cat.engines.filter((e) => BAD.test(e.key) && !(BAD.lastIndex = 0));
const byChar = new Map();
const lines = [];
for (const e of odd) {
  const chars = [...new Set(e.key.match(BAD))];
  for (const c of chars) byChar.set(c, (byChar.get(c) || 0) + 1);
  const clean = e.key.replace(BAD, ""), rows = e.uses.filter((u) => u.line || u.lines).length;
  lines.push(`${e.key}\tký tự ${chars.map((c) => `«${c}» U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`).join(" ")}\tdòng ${rows}\tNCC ${[...new Set(e.uses.map((u) => u.supplierId))].join(",")}\tkhoá sạch ${clean}${keys.has(clean) ? " CÓ (tách khỏi model thật)" : " không có"}`);
}
console.log(`Tổng khoá động cơ: ${keys.size}; có ký tự lạ: ${odd.length}; có khoá sạch tồn tại riêng: ${lines.filter((l) => l.includes(" CÓ ")).length}`);
console.log("Theo ký tự:", [...byChar].sort((a, b) => b[1] - a[1]).map(([c, n]) => `«${c}» U+${c.codePointAt(0).toString(16).toUpperCase()} ×${n}`).join(", "));
console.log(lines.sort().join("\n"));
