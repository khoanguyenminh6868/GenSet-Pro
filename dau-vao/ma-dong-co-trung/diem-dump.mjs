// node diem-dump.mjs <thư mục code> <thư mục cn> <tên> → diem-<tên>.json (CHỈ ĐỌC): với mỗi dòng (NCC|khoá chữ dòng): khoá động cơ + số loại thông số của động cơ
// (`eKeys.size`, candidates cộng 8 × min(số loại, 8)). Với tên "nhanh": thêm vì sao từng dòng "ngoài top" của lost-nhanh.txt không vào top 30, và in các lượt HSMT ghi số xi lanh trơ ≤ 3.
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
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), allFacts = B.modelFacts(full, sups);
const lk = (u) => CAT.keyOf(u.line || (u.lines?.rows || []).join(" "));
const map = {};
for (const e of full.engines) {
  const n = new Set((allFacts.get(`engine:${e.key}`) || []).map((f) => f.key)).size;
  for (const u of e.uses) if (u.line || u.lines) map[`${u.supplierId}|${lk(u)}`] = [e.key, n];
}
fs.writeFileSync(path.join(HERE, `diem-${NAME}.json`), JSON.stringify(map));
console.log(`${Object.keys(map).length} dòng → diem-${NAME}.json`);
if (NAME !== "nhanh") process.exit(0);

const docs = J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const blocked = RF.blockedRows(sups, {}), cn = B.cnSuppliers(sups);
const setup = (d, ri) => {
  const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  const rn = runs[ri], hints = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
  const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly, grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
  const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
  const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
  return { cat, cap: rn.cap, hints, origin, sync, facts };
};
const out = [];
for (const l of fs.readFileSync(path.join(HERE, "lost-nhanh.txt"), "utf8").split("\n").filter((x) => x.includes("ngoài top"))) {
  const m = l.match(/^(IB\d+)#(\d+) gốc hạng (\d+) \| (\S+) (\S+)/);
  const s = setup(byKey.get(m[1]), +m[2]);
  const R = B.candidates(s.cat, s.cap, s.hints, { suppliers: sups, origin: s.origin, cn, sync: s.sync, facts: s.facts, blocked });
  const r = R.all.find((x) => x.u.supplierId === m[4] && CAT.keyOf(x.e.model) === m[5]) || R.all.find((x) => x.u.supplierId === m[4] && x.e.key === m[5]);
  if (!r) { out.push(`${m[1]}#${m[2]} ${m[4]} ${m[5]}: không thấy dòng`); continue; }
  const same = R.top.filter((x) => x.e.key === r.e.key), sup = R.top.filter((x) => x.u.supplierId === r.u.supplierId), mk = (x) => (x.e.make || "?").split(" / ")[0], make = R.top.filter((x) => mk(x) === mk(r));
  const dup = same.some((x) => x.u.supplierId === r.u.supplierId && (x.a?.key || "") === (r.a?.key || ""));
  out.push(`${m[1]}#${m[2]} gốc hạng ${m[3]} | ${m[4]} ${r.e.model} điểm ${r.score} | top có: cùng động cơ ${same.length} (${same.map((x) => `${x.u.supplierId}:${x.score}`).join(",")}), cùng NCC ${sup.length}, cùng hãng ${make.length}; trùng NCC+động cơ+đầu phát: ${dup}; điểm thấp nhất top ${R.top.at(-1)?.score}`);
}
fs.writeFileSync(path.join(HERE, "ngoai-top.txt"), out.join("\n") + "\n");
console.log(out.join("\n"));

// Lượt có dòng bị loại vì HSMT ghi số xi lanh trơ ≤ 3: in dòng HSMT nêu xi lanh để soát code đọc đúng không (chỉ in ra màn hình, không ghi tệp).
const lostRuns = new Map();
for (const c of fs.readFileSync(path.join(HERE, "mat-dong.tsv"), "utf8").trim().split("\n").slice(1).map((x) => x.split("\t"))) if (c[5].split(",").includes("cyl")) lostRuns.set(c[0], (lostRuns.get(c[0]) || 0) + 1);
console.log("\n=== HSMT ghi số xi lanh trơ ≤ 3");
for (const [run, n] of lostRuns) {
  const [no, ri] = run.split("#"), d = byKey.get(no), s = setup(d, +ri);
  if (!s.hints.cylExact || s.hints.minCyl > 3) continue;
  console.log(`${run} =${s.hints.minCyl} (${n} dòng): ${d.config.text.split("\n").filter((x) => /xi.?lanh|xy.?lanh/i.test(x)).slice(0, 3).map((x) => x.trim().slice(0, 90)).join(" // ")}`);
}
