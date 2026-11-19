// Phân tích hits.json của do-to-may.mjs: tách theo bảng đã cho bản ghi / chưa, vai NCC, loại bảng.
import fs from "node:fs";
const { hits, recs, status } = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const G = new Set(fs.readFileSync(process.argv[3], "utf8").split("\n").slice(1).filter(Boolean).map((l) => l.split("\t")).filter((c) => c[3] === "G").map((c) => `${c[0]}|${c[2]}`));
const byT = new Map();
for (const h of hits) { const k = `${h.sup}|${h.ti}`; if (!byT.has(k)) byT.set(k, []); byT.get(k).push(h); }
const ALT_T = /alternator|brushless|brush|synchronous generator|交流同步发电机|无刷|有刷|励磁|发电机-|STC系列|TFW|ST\/STC/i;
const ENG_T = /diesel engine|marine .*engine|engine \||柴油机$|发动机/i;
const kindOf = (k, v) => {
  const h = v[0], role = status[h.sup]?.role || "";
  if (role === "alternator_maker") return "A:hãng đầu phát";
  if (role === "engine_maker") return "E:hãng động cơ";
  if (h.engineTable) return "E:bảng động cơ";
  if (ALT_T.test(h.title) && !/genset|generating set|发电机组|机组/i.test(h.title)) return "A:tiêu đề trang đầu phát";
  return "T";
};
const sum = {};
const add = (cat, v) => { sum[cat] ||= { tables: 0, rows: 0, sups: new Set(), power: 0 }; const s = sum[cat]; s.tables++; s.rows += v.length; v.forEach((h) => s.sups.add(h.sup)); s.power += v.filter((h) => h.power && Object.keys(h.power).length).length; };
const used = (k) => { const [sup, ti] = k.split("|"); return (recs[sup]?.tables || []).includes(Number(ti)); };
const rowsOut = [];
for (const [k, v] of byT) {
  const cat = `${used(k) ? "U(bảng đã cho bản ghi)" : "N(bảng chưa cho bản ghi)"} ${G.has(k) ? "R1-G" : "khác"} ${kindOf(k, v)}`;
  add(cat, v);
  rowsOut.push([k, cat, v.length, v[0].title.slice(0, 60), v[0].header.slice(0, 100)].join("\t"));
}
for (const [c, s] of Object.entries(sum).sort()) console.log(c.padEnd(60), "bảng", s.tables, "dòng", s.rows, "NCC", s.sups.size, "dòng có công suất", s.power);
fs.writeFileSync("bang-phan-loai.tsv", rowsOut.sort().join("\n"));
