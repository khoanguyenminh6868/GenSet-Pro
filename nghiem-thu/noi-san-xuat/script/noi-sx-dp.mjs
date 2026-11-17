// node noi-sx-dp.mjs <worktree> : đầu phát / bộ điều khiển hãng ngoại — nguồn có ghi nơi sản xuất không
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2];
await import(pathToFileURL(path.join(WT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const recs = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const by = new Map(recs.map((s) => [s.id, s]));
const cat = C.build(recs);
const PLANT = {
  alternator: [
    ["CN", /stamford\s*\(?\s*(china|wuxi)|无锡\s*斯坦福|斯坦福\s*\(?\s*(中国|无锡)|cummins\s*generator\s*technologies\s*(china|wuxi)|leroy[\s-]?somer\s*\(?\s*(china|fuzhou)|福州\s*利莱森玛|利莱森玛\s*\(?\s*福州|marathon\s*\(?\s*(china|wuxi)|无锡\s*马拉松|mecc\s*alte\s*\(?\s*china|engga|恩加/i],
    ["G", /stamford\s*\(?\s*(uk|england|u\.k)|英国\s*斯坦福|进口\s*斯坦福|imported\s*stamford|leroy[\s-]?somer\s*\(?\s*france|法国\s*利莱森玛|mecc\s*alte\s*\(?\s*italy|意大利\s*(马克|麦格)|marathon\s*\(?\s*usa/i],
  ],
  controller: [
    ["CN", /deep\s?sea\s*\(?\s*china|smartgen|众智/i],
    ["G", /deep\s?sea\s*\(?\s*(uk|england)|英国\s*深海|comap\s*\(?\s*czech|捷克|deif\s*\(?\s*denmark|丹麦/i],
  ],
};
for (const [kind, list] of [["alternator", cat.alternators], ["controller", cat.controllers]]) {
  const stat = new Map(), ex = new Map();
  for (const e of list) {
    const mk = (e.make || (e.makes || [])[0]?.name || "").split(" / ")[0];
    if (!mk || /smartgen|harsen|mebay|lixise/i.test(mk)) continue;
    for (const u of e.uses) {
      const s = by.get(u.supplierId), maker = s && /maker/.test(s.role || "") && s.role !== "genset_oem";
      const from = maker ? `NHÀ SX ${s.country}` : s?.country === "CN" ? "NCC TQ" : "NCC ngoài TQ";
      const txt = [u.line, ...(u.lines?.rows || []), (u.header || u.lines?.header || []).join(" "), u.title, u.text].filter(Boolean).join(" \n ");
      const hits = [...new Set(PLANT[kind].filter(([, re]) => re.test(txt)).map(([p]) => p))].sort().join("+") || "không ghi";
      const k = `${mk} | ${from} | ${hits}`;
      stat.set(k, (stat.get(k) || 0) + 1);
      if (hits !== "không ghi" && (ex.get(k) || []).length < 2) ex.set(k, [...(ex.get(k) || []), `${e.model} ${u.supplierId}: ${String(u.title || "").slice(0, 50)} | ${String(u.line || u.text || "").slice(0, 90)}`]);
    }
  }
  console.log(`=== ${kind}`);
  for (const [k, n] of [...stat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) { console.log(String(n).padStart(6), k); for (const x of ex.get(k) || []) console.log("         " + x); }
}
