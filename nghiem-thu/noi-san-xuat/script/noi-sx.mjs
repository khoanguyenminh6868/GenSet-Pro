// node noi-sx.mjs <worktree> : dòng động cơ hãng nước ngoài, nguồn có ghi nhà máy / nước sản xuất không
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2];
await import(pathToFileURL(path.join(WT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const recs = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const country = new Map(recs.map((s) => [s.id, s.country]));
const cat = C.build(recs);
// Dấu hiệu nhà máy trong chữ của dòng / tiêu đề cột / tên bảng.
const PLANT = [
  ["Cummins", "CN", /\bDCEC\b|东风康明斯|dong\s?feng\s*cummins|\bCCEC\b|重庆康明斯|chong\s?qing\s*cummins|\bXCEC\b|西安康明斯|xi'?an\s*cummins|广西康明斯|\bGCIC\b/i],
  ["Cummins", "IN", /cummins\s*india|印度康明斯/i],
  ["Cummins", "G", /进口康明斯|imported\s*cummins|美国康明斯|cummins\s*\(?\s*(usa|u\.s\.a|america|uk)\)?/i],
  ["Perkins", "CN", /无锡珀金斯|perkins\s*wuxi|wuxi\s*perkins|perkins\s*\(?\s*china/i],
  ["Perkins", "G", /英国珀金斯|进口珀金斯|imported\s*perkins|perkins\s*\(?\s*(uk|england|u\.k)\)?|uk\s*perkins/i],
  ["Mitsubishi", "CN", /上海菱重|\bSME\b|三菱重工.*上海|shanghai\s*mhi/i],
  ["Mitsubishi", "G", /日本三菱|进口三菱|imported\s*mitsubishi|mitsubishi\s*\(?\s*japan/i],
  ["MTU", "CN", /玉柴\s*MTU|MTU\s*yuchai|yuchai\s*MTU|MTU-?YC/i],
  ["MTU", "G", /德国\s*MTU|进口\s*MTU|MTU\s*\(?\s*germany/i],
  ["Baudouin", "CN", /潍柴\s*博杜安|weichai\s*baudouin|weichai-?baudouin|baudouin\s*\(?\s*china/i],
  ["Baudouin", "G", /法国\s*博杜安|baudouin\s*\(?\s*france/i],
  ["Doosan", "CN", /斗山.*(烟台|中国)|doosan\s*\(?\s*china|yantai/i],
  ["Doosan", "G", /韩国\s*斗山|doosan\s*\(?\s*korea|imported\s*doosan/i],
  ["Volvo Penta", "G", /volvo\s*penta\s*\(?\s*sweden|瑞典沃尔沃/i],
];
const stat = new Map(); const ex = new Map();
for (const e of cat.engines) {
  const mk = (e.make || "").split(" / ")[0];
  if (!C.FOREIGN_ENGINE.has(mk)) continue;
  for (const u of e.uses) {
    const from = country.get(u.supplierId) === "CN" ? "NCC TQ" : "NCC ngoài TQ";
    const txt = [u.line, ...(u.lines?.rows || []), (u.header || u.lines?.header || []).join(" "), u.title].filter(Boolean).join(" \n ");
    const hits = PLANT.filter(([m, , re]) => m === mk && re.test(txt)).map(([, p]) => p);
    const tag = hits.length ? [...new Set(hits)].sort().join("+") : "không ghi";
    const k = `${mk} | ${from} | ${tag}`;
    stat.set(k, (stat.get(k) || 0) + 1);
    if (hits.length && (ex.get(k) || []).length < 2) ex.set(k, [...(ex.get(k) || []), `${e.model} ${u.supplierId}: ${String(u.title).slice(0, 60)} | ${String(u.line || "").slice(0, 80)}`]);
  }
}
for (const [k, n] of [...stat.entries()].sort()) { console.log(String(n).padStart(6), k); for (const x of ex.get(k) || []) console.log("         " + x); }
