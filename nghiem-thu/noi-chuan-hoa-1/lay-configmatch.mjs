// Chụp (CHỈ ĐỌC, GET /api/requests) mọi configmatch trên web + chữ HSMT của gói đó vào genbid-test/noi-chuan-hoa/web/.
// Không ghi gì lên web, không đụng doc-cache của bot.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const OUT = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa/web";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-noi-chuan-hoa/suppliers/config-bot.mjs").href);
fs.mkdirSync(OUT, { recursive: true });
const list = await B.api("kind=docs&coll=configmatch");
fs.writeFileSync(`${OUT}/configmatch.json`, JSON.stringify(list));
console.error("configmatch:", list.length);
const texts = {};
for (const d of list) {
  try { const t = await B.hsmtTextOf(d.id); texts[d.id] = { text: t.text }; }
  catch (e) { texts[d.id] = { error: String(e?.message || e) }; }
  console.error(d.id, texts[d.id].error || texts[d.id].text.length);
}
fs.writeFileSync(`${OUT}/hsmt.json`, JSON.stringify(texts));
