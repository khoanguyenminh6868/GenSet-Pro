import fs from "node:fs";
const o = JSON.parse(fs.readFileSync("out.json", "utf8"));
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const text = (k) => { if (fs.existsSync(`${KR}/hc/${k}.json`)) return J(`${KR}/hc/${k}.json`).text; if (fs.existsSync(`${KR}/hsmt-${k}.json`)) return J(`${KR}/hsmt-${k}.json`).text; return fs.readFileSync(`${W}/specs/${k}/text.txt`, "utf8"); };
const seen = new Set();
for (const r of o) { if (seen.has(r.key)) continue; seen.add(r.key);
  const L = text(r.key).normalize("NFC").split("\n");
  L.forEach((l, i) => { if (/dung t[íi]ch|displacement/i.test(l) && /(xi|xy|x)[\s-]?lanh|piston|displacement|động cơ/i.test(l + (L[i-1]||"")) && /±|\+\s?-|\+\/-|sai số|dung sai|tolerance|\d\s*%/i.test(l + " " + (L[i + 1] || ""))) console.log(r.key, "L" + i, l.replace(/\s+/g, " ").slice(0, 200), "|", (L[i + 1] || "").replace(/\s+/g, " ").slice(0, 60)); });
}
