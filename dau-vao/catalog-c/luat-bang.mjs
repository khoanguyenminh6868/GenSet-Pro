// Thử luật chọn bảng "tổ máy không mã động cơ" trên MỌI bảng có dòng gi>=0, ei<0, ai<0 (hits.json của do-to-may.mjs),
// so với nhãn soát tay 82 bảng R1-G (dem-g.mjs). node luat-bang.mjs hits.json
import fs from "node:fs";
const { hits, recs } = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const src = fs.readFileSync(new URL("./dem-g.mjs", import.meta.url), "utf8");
const L = {}; const set = (cls, sup, tis) => tis.forEach((ti) => (L[`${sup}|${ti}`] = cls));
for (const m of src.matchAll(/set\("([TXOAE])", "([^"]+)", \[([\d, ]+)\]/g)) set(m[1], m[2], m[3].split(",").map(Number));
const GEN = /gen-?set|generating\s*set|generator\s*set|机组|elettrogen|diesel generator|gas generator|natural gas generator|biogas generator|gasoline generator|rental generator/i;
const ALT = /alternator|synchronous\s*generator|同步发电机|无刷|有刷|励磁|brushless|brush\b/i;
const ENG = /diesel engine|marine .*engine|发动机型号|engine type|柴油机/i;
const byT = new Map(); for (const h of hits) { const k = `${h.sup}|${h.ti}`; if (!byT.has(k)) byT.set(k, []); byT.get(k).push(h); }
const used = (k) => { const [s, ti] = k.split("|"); return (recs[s]?.tables || []).includes(Number(ti)); };
const res = { chon: { T: 0, X: 0, O: 0, A: 0, E: 0, "ngoài R1-G": 0 }, bo: { T: 0, X: 0, O: 0, A: 0, E: 0, "ngoài R1-G": 0 } }, rows = { chon: 0, chonNgoai: 0 }, ngoai = [];
for (const [k, v] of byT) {
  if (used(k)) continue;
  const h = v[0], text = `${h.title} ${h.header}`;
  const pick = h.role !== "alternator_maker" && h.role !== "engine_maker" && !h.engineTable && GEN.test(text) && !ALT.test(h.title) && !ENG.test(h.title + " " + h.header.split("/")[0]);
  const cls = L[k] || "ngoài R1-G";
  res[pick ? "chon" : "bo"][cls]++;
  if (pick) { rows.chon += v.length; if (!L[k]) { rows.chonNgoai += v.length; ngoai.push(`${k}\t${v.length}\t${h.title.slice(0, 70)}\t${h.header.slice(0, 90)}`); } }
}
console.log(JSON.stringify(res), JSON.stringify(rows));
fs.writeFileSync("luat-bang-ngoai-r1g.tsv", ngoai.sort().join("\n"));
for (const [k, c] of Object.entries(L)) { const v = byT.get(k); const h = v[0]; const text = `${h.title} ${h.header}`; const pick = h.role !== "alternator_maker" && h.role !== "engine_maker" && !h.engineTable && GEN.test(text) && !ALT.test(h.title) && !ENG.test(h.title + " " + h.header.split("/")[0]); if ((c === "T") !== pick) console.log("lệch nhãn:", k, c, pick ? "chọn" : "bỏ", h.title.slice(0, 60)); }
