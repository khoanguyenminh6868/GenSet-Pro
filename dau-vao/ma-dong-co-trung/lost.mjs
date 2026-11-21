// node lost.mjs <thư mục code> <thư mục cn> <tên> → lost-<tên>.txt (CHỈ ĐỌC)
// Với mỗi dòng trong mục "Dòng hạng 1–5 ở gốc bị ra khỏi top 30" của cloud/tom-tat.md: chạy lại candidates của lượt đó (giống do-gop.mjs,
// bidhist cục bộ genbid-work/doc-cache/bidhist.json) và in số phận của dòng: hạng top / hạng thô / bị loại (ruled + src) / không có.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [WT, CN, NAME] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const md = fs.readFileSync(path.join(HERE, "cloud", "tom-tat.md"), "utf8").split("\n");
const s0 = md.findIndex((l) => l.startsWith("### Dòng hạng 1–5"));
const want = [];
for (const l of md.slice(s0 + 1)) {
  if (l.startsWith("### ")) break;
  const m = l.match(/^\| (IB\d+)#(\d+) \| (\d+) \| ([^|]+)\|([^|]*)\|([^|]*)\|(.*?) \| [\d.]+ \|/);
  if (m) want.push({ key: m[1], ri: +m[2], rank: +m[3], sid: m[4], eng: m[5], line: m[7] });
}
const docs = J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {});
const full = CAT.build(sups), cn = B.cnSuppliers(sups);
const lk = (u) => CAT.keyOf(u.line || (u.lines?.rows || []).join(" "));
const out = [];
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
for (const w of want) {
  const d = byKey.get(w.key);
  if (!d?.config?.text) { out.push(`${w.key}#${w.ri} ${w.sid} ${w.eng}: KHÔNG có trong bidhist cục bộ`); continue; }
  const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  const rn = runs[w.ri];
  const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
  const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
  const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
  const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
  const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
  const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
  const hit = (r) => r.u.supplierId === w.sid && lk(r.u) === w.line;
  const ti = R.top.findIndex(hit), ai = R.all.findIndex(hit), dr = R.dropped.filter(hit);
  const fate = ti >= 0 ? `top #${ti + 1} điểm ${R.top[ti].score}` : ai >= 0 ? `ngoài top, hạng thô ${ai + 1} điểm ${R.all[ai].score}` : dr.length ? `LOẠI ${dr.map((x) => `${x.e.model}: ${x.ruled.join(",")} ${JSON.stringify(x.src || x.why || "").slice(0, 300)}`).join(" || ")}` : "không có dòng";
  const r = ti >= 0 ? R.top[ti] : ai >= 0 ? R.all[ai] : null;
  out.push(`${w.key}#${w.ri} gốc hạng ${w.rank} | ${w.sid} ${w.eng} | cap ${JSON.stringify(rn.cap)} | ${fate}${r ? ` | vì: ${r.why.join("; ").slice(0, 300)}` : ""}`);
}
fs.writeFileSync(path.join(HERE, `lost-${NAME}.txt`), out.join("\n") + "\n");
console.log(`${want.length} dòng → lost-${NAME}.txt`);
