// Read-only: HSMT text (as prep writes hsmt.txt) + analysis specs of a few tenders, into t4snap/hsmt/.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const wt = "C:/Projects/GenSet Pro/wt-test-t4/suppliers/config-bot.mjs";
const CB = await import(pathToFileURL(wt).href);
const out = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4snap/hsmt");
fs.mkdirSync(out, { recursive: true });
for (const key of process.argv.slice(2)) {
  try {
    const { text, parts } = await CB.hsmtTextOf(key);
    fs.writeFileSync(path.join(out, `${key}.txt`), text, "utf8");
    fs.writeFileSync(path.join(out, `${key}.parts.txt`), parts.join(""), "utf8");
    const a = await CB.doc("analysis", key);
    fs.writeFileSync(path.join(out, `${key}.analysis.json`), JSON.stringify(a?.result || null), "utf8");
    console.log(key, text.length, parts.join("").length);
  } catch (e) { console.log(key, "ERR", e.message); }
}
