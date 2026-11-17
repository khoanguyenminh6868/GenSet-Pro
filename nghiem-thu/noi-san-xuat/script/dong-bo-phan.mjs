// node dong-bo-phan.mjs <worktree> : các dòng G7 / G20 của gói chỉ đòi bộ phận (originOfHsmt scope "parts"),
// với basisOfLine và (nếu nhánh có) partOriginOfHsmt.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2];
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const hist = Object.values(JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa/bidhist.json", "utf8")).docs).map((x) => x.d)
  .filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const all = process.argv.includes("--all");
for (const d of hist) {
  const o = B.originOfHsmt(d.config.text);
  if (!o || (!all && o.scope !== "parts")) continue;
  const L = d.config.text.split("\n").map((x) => x.replace(/\s+/g, " ").trim());
  console.log(`== ${d.notifyNo} ${o.origin} ${o.scope}`);
  if (B.partOriginOfHsmt) console.log("   parts:", JSON.stringify(B.partOriginOfHsmt(d.config.text)));
  L.forEach((l, i) => { if (/\bG\s?-?(7|20)\b/.test(l)) console.log(`   [${B.basisOfLine(L, i)}] ${l.slice(0, 220)}`); });
}
