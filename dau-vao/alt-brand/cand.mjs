// Bước xếp ứng viên của Gợi ý (candidates) cho MỌI dòng có đầu phát mang cờ: chạy trong một gốc repo, ghi JSON.
//   node cand.mjs <gốc repo> <danh sách dòng .json | "make"> <ra .json>
// "make": tự lập danh sách dòng từ cờ makeAsk của gốc này (chạy ở nhánh mới trước), ghi ra <ra>.rows.json.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, listArg, outF] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const B = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const cat = C.build(S);
let list;
if (listArg === "make") {
  list = [];
  for (const a of cat.alternators) for (const u of a.uses) if (u.makeAsk) list.push({ supplierId: u.supplierId, n: u.n, table: u.table, row: u.row, alt: u.model, ask: u.makeAsk });
  fs.writeFileSync(`${outF}.rows.json`, JSON.stringify(list, null, 1));
} else list = JSON.parse(fs.readFileSync(listArg, "utf8"));
const hints = B.hintsOf(["Chương V. Yêu cầu kỹ thuật", "Đầu phát: hãng Stamford hoặc Leroy-Somer"].join("\n"));
const facts = B.modelFacts ? B.modelFacts(cat, S) : undefined;
const alts = new Map(cat.alternators.map((a) => [a.key, a]));
const out = [];
for (const x of list) {
  // bản ghi động cơ của dòng
  const us = cat.engines.flatMap((e) => e.uses.filter((u) => u.supplierId === x.supplierId && u.n === x.n && u.table === x.table && u.row === x.row).map((u) => ({ e, u })));
  if (!us.length) { out.push({ ...x, engine: null, note: "dòng không có bản ghi động cơ (không làm ứng viên)" }); continue; }
  for (const { e, u } of us) {
    const p = u.power?.prime || u.power?.standby || u.power?.rated || {}, unit = p.kVA ? "kVA" : "kW", value = p[unit];
    const a = B.altOf(alts, u.other);
    const base = { ...x, engine: e.model, genset: u.genset ?? null, other: u.other ?? null, cap: value ? `${value} ${unit}` : null, altKey: a?.key ?? null, altMake: a?.make ?? null };
    if (!value) { out.push({ ...base, note: "dòng không có công suất" }); continue; }
    const r = B.candidates(cat, { value, unit }, hints, { suppliers: S, focus: new Set([e.key]), max: 100000, makeCap: 0, ...(facts ? { facts } : {}) });
    const all = r.all || r.top || [], hit = all.find((c) => c.u === u) || (r.dropped || []).find((c) => c.u === u);
    out.push({ ...base, found: !!hit, score: hit?.score ?? null, ruled: hit?.ruled ?? null, altAsk: hit?.altAsk ?? null, why: (hit?.why || []).filter((w) => /đầu phát/.test(w)) });
  }
}
fs.writeFileSync(outF, JSON.stringify(out, null, 1));
console.log(`dòng: ${list.length}; kết quả: ${out.length}; tìm thấy trong ứng viên: ${out.filter((o) => o.found).length}`);
