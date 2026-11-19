// node 4-unread-cmp.mjs <worktree gốc> <worktree nhánh>: mục "chưa đọc được" (CAT.unread) có ở một bên mà không ở bên kia.
// Mỗi bên chạy trong tiến trình con riêng (catalog.js gắn vào globalThis).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const [A, B, side] = process.argv.slice(2);
if (side === "--one") {
  await import(pathToFileURL(path.join(A, "suppliers", "config-bot.mjs")).href);
  const CAT = globalThis.GenbidCatalog;
  const dir = path.join(A, "suppliers", "cn");
  const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const out = [];
  for (const u of CAT.unread(sups)) out.push(JSON.stringify([u.supplierId, u.n, u.table, u.row ?? null, u.reason, String(u.detail ?? "").slice(0, 160)]));
  process.stdout.write(out.join("\n"));
} else {
  const me = fileURLToPath(import.meta.url);
  const run = (wt) => new Set(execFileSync(process.execPath, [me, wt, "", "--one"], { maxBuffer: 1 << 28 }).toString().split("\n").filter(Boolean));
  const a = run(A), b = run(B);
  for (const x of a) if (!b.has(x)) console.log("CHỈ GỐC\t" + JSON.parse(x).join("\t"));
  for (const x of b) if (!a.has(x)) console.log("CHỈ NHÁNH\t" + JSON.parse(x).join("\t"));
}
