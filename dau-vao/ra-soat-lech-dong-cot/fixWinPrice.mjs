// node fixWinPrice.mjs [--write]: áp histWinningPrice (sync-pure.js, PR #897) lên winningPrice đã lưu của mọi gói bidhist.
// Chỉ đổi winningPrice của gói bị luật chạm, mọi trường khác giữ nguyên. Không --write: chỉ in.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const P = require("C:/Projects/GenSet Pro/GenSet-Pro/bot/genbid-hsmt/sync-pure.js");
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/config-bot.mjs").href);
const write = process.argv.includes("--write"), rows = [];
const docs = await B.allDocs("bidhist");
for (const { id, data: d } of docs) {
  const v = P.histWinningPrice(d.winningPrice, d.lots);
  if (v === (d.winningPrice ?? null)) continue;
  console.log(id, d.winningPrice, "→", v);
  rows.push({ coll: "bidhist", id, data: { ...d, winningPrice: v } });
}
console.log(`${docs.length} gói, ${rows.length} gói sẽ ghi${write ? "" : " (chưa ghi, thêm --write)"}`);
if (write && rows.length) { await B.post(rows); console.log("đã ghi", rows.length); }
