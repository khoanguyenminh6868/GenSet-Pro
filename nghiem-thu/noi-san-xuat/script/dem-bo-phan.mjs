// node dem-bo-phan.mjs <worktree> : đếm gói theo phạm vi (originOfHsmt) × căn cứ từng bộ phận (partOriginOfHsmt).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const B = await import(pathToFileURL(path.join(process.argv[2], "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const hist = Object.values(JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa/bidhist.json", "utf8")).docs).map((x) => x.d)
  .filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const c = {};
for (const d of hist) {
  const o = B.originOfHsmt(d.config.text);
  if (!o) continue;
  const p = B.partOriginOfHsmt(d.config.text);
  const k = `${o.scope === "parts" ? "chỉ bộ phận" : "cả tổ máy"} | ${["engine", "alternator", "controller"].map((x) => `${x[0]}:${p[x]?.basis || "-"}`).join(" ")}`;
  c[k] = (c[k] || 0) + 1;
}
for (const [k, n] of Object.entries(c).sort()) console.log(String(n).padStart(4), k);
