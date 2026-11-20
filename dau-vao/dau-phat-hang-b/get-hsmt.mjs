// Tải chữ HSMT (chỉ đọc web) của các gói về hsmt-<TBMT>.txt. node get-hsmt.mjs <gốc repo> <TBMT>...
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, ...keys] = process.argv.slice(2);
const CB = await import(pathToFileURL(path.join(path.resolve(rootArg), "suppliers", "config-bot.mjs")).href);
for (const key of keys) {
  const f = path.join(import.meta.dirname, "hsmt", `${key}.txt`);
  if (fs.existsSync(f)) continue;
  fs.mkdirSync(path.dirname(f), { recursive: true });
  try { const { text } = await CB.hsmtTextOf(key); fs.writeFileSync(f, text || "", "utf8"); console.log(key, (text || "").length); }
  catch (e) { console.log(key, "lỗi", e.message); }
}
