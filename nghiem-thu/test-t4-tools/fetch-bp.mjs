// Read-only: bidprice/<key> and bidpricereq/<key> documents into t4snap/bp/.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const CB = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-test-t4/suppliers/config-bot.mjs").href);
const out = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4snap/bp");
fs.mkdirSync(out, { recursive: true });
const keys = process.argv.slice(2).length ? process.argv.slice(2) : (await CB.api("kind=docs&coll=bidprice")).map((d) => d.id);
for (const key of keys) {
  const [bp, req] = await Promise.all([CB.doc("bidprice", key).catch(() => null), CB.doc("bidpricereq", key).catch(() => null)]);
  fs.writeFileSync(path.join(out, `${key}.json`), JSON.stringify({ bidprice: bp, req }), "utf8");
  const r = bp?.result;
  console.log(key, JSON.stringify(bp || {}).length, "sizes", r?.sizes?.length || 0, "samples", r?.samples?.length, "keys", Object.keys(r || {}).join(","));
}
