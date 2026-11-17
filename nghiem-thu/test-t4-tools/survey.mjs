import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const S = "C:/Projects/GenSet Pro/wt-test-t4/suppliers/";
const CB = await import(pathToFileURL(S + "config-bot.mjs").href);
const NG = await import(pathToFileURL(S + "named-genset.mjs").href);
const snap = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4snap");
const cm = JSON.parse(fs.readFileSync(path.join(snap, "configmatch.json"), "utf8")).docs;
for (const f of fs.readdirSync(path.join(snap, "hsmt")).filter((f) => /^IB\d+\.txt$/.test(f))) {
  const key = f.slice(0, -4), text = fs.readFileSync(path.join(snap, "hsmt", f), "utf8"), parts = fs.readFileSync(path.join(snap, "hsmt", key + ".parts.txt"), "utf8");
  const res = cm[key]?.d?.result;
  console.log(key, "originHsmt", JSON.stringify(CB.originOfHsmt(parts)), "| named", JSON.stringify(NG.namedGensetOf(text))?.slice(0, 150), "| sync", JSON.stringify(globalThis.GenbidBidprice.brandSyncOf(text))?.slice(0, 80), "| res.origin", res?.origin, JSON.stringify(res?.originAuto));
}
