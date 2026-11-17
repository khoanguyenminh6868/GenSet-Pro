import fs from "node:fs";
import { pathToFileURL } from "node:url";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-soat-nguong/suppliers/_instr.mjs").href);
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const text = (k) => { if (fs.existsSync(`${KR}/hc/${k}.json`)) return J(`${KR}/hc/${k}.json`).text; if (fs.existsSync(`${KR}/hsmt-${k}.json`)) return J(`${KR}/hsmt-${k}.json`).text; return fs.readFileSync(`${W}/specs/${k}/text.txt`, "utf8"); };
const [key, ...ls] = process.argv.slice(2);
const L = B.withoutOtherEquipment(B.unflatten(B.technicalPart(text(key)))).split("\n");
for (const spec of ls) { const [c, b = 6, a = 2] = spec.split(",").map(Number); console.log(`--- ${key} L${c}`);
  for (let i = Math.max(1, c - b); i <= Math.min(L.length, c + a); i++) console.log(`${i}: ${L[i - 1].replace(/\s+/g, " ").slice(0, 170)}`); }
