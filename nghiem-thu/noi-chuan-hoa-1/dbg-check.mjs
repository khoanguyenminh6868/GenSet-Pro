// Dò: các check so số code ghi (cờ tắt) trên web-go-code, và normFig của số nguồn của chúng.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-noi-chuan-hoa/suppliers/config-bot.mjs").href);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = Object.values(J(`${SNAP}/supplier.json`).docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const cms = J(`${SNAP}/web/configmatch.json`), texts = J(`${SNAP}/web/hsmt.json`);
let n = 0;
for (const d of cms) {
  const r = d.data.result, list = r.sizes ? r.sizes.map((s) => s.result) : [r];
  for (const res of list) {
    if (!res?.configs?.length) continue;
    for (const c of res.configs) for (const k of c.checks || []) if (k.byCode && (k.rule === "vo-may" || /tiêu hao|L\/h/.test(k.note || "")) && (k.status === "met" || k.status === "not_met")) {
      n++; console.log(d.id, c.rank, k.item, k.status, "|", k.offered, "|", k.was);
    }
    // the reqs of these codes
    for (const q of res.requirements || []) if (["weight", "dimensions", "noise", "fuel_consumption", "fuel_consumption_75", "fuel_consumption_50"].includes(q.code)) console.log("  REQ", d.id, q.code, "|", q.requirement);
  }
}
console.log("code so số đã ghi:", n);
