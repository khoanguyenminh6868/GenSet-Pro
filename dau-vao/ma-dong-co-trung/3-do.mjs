// node 3-do.mjs [shard số-shard bước]  → do[-<shard>of<n>-s<bước>].json + .txt (CHỈ ĐỌC, không mạng). Bước 5 = mẫu 1/5 số gói (theo thứ tự trong bidhist).
// Bước ứng viên (candidates, mã main) trên mọi gói mua máy phát có Chương V trong doc-cache/bidhist.json, NCC doc-cache/supplier.json
// (cùng lọc như nghiem-thu/noi-chuan-hoa-1/do-ung-vien.mjs). Với mỗi lớp của lop-web.json: số lượt top 30 có ≥ 2 khoá KHÁC NHAU
// của cùng một nhóm trùng (khoá thừa + khoá đích), và số chỗ khoá thừa chiếm trong lượt đó.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const W = "C:/Projects/GenSet Pro/genbid-work";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/config-bot.mjs").href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = Object.values(J(`${W}/doc-cache/supplier.json`).docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const hist = Object.values(J(`${W}/doc-cache/bidhist.json`).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const lop = J(path.join(HERE, "lop-web.json")).filter((o) => o.kind === "engines");
// Union-find per class: alias key ↔ target key(s). aliases: keys that are the "extra" spelling.
const classes = [...new Set(lop.map((o) => o.lop))];
const groups = {};
for (const c of classes) {
  const par = new Map(), f = (x) => { while (par.has(x) && par.get(x) !== x) x = par.get(x); return x; };
  const uni = (a, b) => { const ra = f(a), rb = f(b); if (!par.has(ra)) par.set(ra, ra); if (!par.has(rb)) par.set(rb, rb); if (ra !== rb) par.set(ra, rb); };
  const alias = new Set();
  for (const o of lop.filter((o) => o.lop === c)) {
    for (const k of o.key.split(" = ")) uni(k, o.target);
    if (o.sep !== "kytu") alias.add(o.key); else o.key.split(" = ").slice(1).forEach((k) => alias.add(k));
  }
  groups[c] = { root: (k) => (par.has(k) ? f(k) : null), alias };
}
console.error(`gói: ${hist.length}, NCC: ${sups.length}`);
const full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
function catFor(origin, sync, partsOnly, brand) {
  const k = [origin, !!sync, partsOnly, brand].join("|");
  if (!cache.has(k)) {
    const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
    const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
    const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
    cache.set(k, { cat, facts });
  }
  return cache.get(k);
}
const res = Object.fromEntries(classes.map((c) => [c, { runs: 0, slots: 0, samples: [] }]));
const all = { runs: 0, anyRuns: 0, aliasInTop: 0 }, T0 = Date.now();
console.error(`dựng catalog xong ${((Date.now() - T0) / 1000).toFixed(0)}s`);
const [SH = 0, NS = 1, STEP = 1] = process.argv.slice(2).map(Number), TAG = NS > 1 || STEP > 1 ? `-${SH}of${NS}-s${STEP}` : "";
for (const [di, d] of hist.entries()) {
  if (di % STEP !== 0 || (di / STEP) % NS !== SH) continue;
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  for (const rn of runs) {
    if (!rn.cap) continue;
    let top;
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      top = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts }).top;
    } catch (e) { continue; }
    all.runs++;
    let any = false;
    for (const c of classes) {
      const g = groups[c], by = new Map();
      for (const r of top) { const rt = g.root(r.e.key); if (rt) by.set(rt, [...(by.get(rt) || []), r]); }
      let slots = 0, hit = [];
      for (const [, rs] of by) {
        const keys = new Set(rs.map((r) => r.e.key));
        if (keys.size < 2) continue;
        const extra = rs.filter((r) => g.alias.has(r.e.key)).length;
        slots += extra; hit.push(rs.map((r) => `#${top.indexOf(r) + 1} ${r.e.model} (${r.u.supplierId} n${r.u.n})`).join(" + "));
      }
      if (slots) { res[c].runs++; res[c].slots += slots; any = true; if (res[c].samples.length < 6) res[c].samples.push(`${key} ${rn.cap.value} ${rn.cap.unit}: ${hit.join(" || ")}`); }
    }
    if (any) all.anyRuns++;
    if (all.runs % 25 === 0) { console.error(`${all.runs} lượt, ${((Date.now() - T0) / 1000).toFixed(0)}s, ${key}`); fs.writeFileSync(path.join(HERE, `do${TAG}.json`), JSON.stringify({ partial: true, all, res }, null, 1)); }
    all.aliasInTop += top.filter((r) => classes.some((c) => groups[c].alias.has(r.e.key))).length;
  }
}
fs.writeFileSync(path.join(HERE, `do${TAG}.json`), JSON.stringify({ all, res }, null, 1));
const lines = [`lượt chạy: ${all.runs}; lượt có ≥1 động cơ chiếm ≥2 chỗ vì khoá trùng (mọi lớp): ${all.anyRuns}; số chỗ top 30 do khoá thừa (mọi lớp, kể cả khi khoá đích không có mặt): ${all.aliasInTop}`];
for (const [c, v] of Object.entries(res)) { lines.push(`\n## ${c}: ${v.runs} lượt, ${v.slots} chỗ thừa`); for (const s of v.samples) lines.push(`  ${s}`); }
fs.writeFileSync(path.join(HERE, `do${TAG}.txt`), lines.join("\n") + "\n");
console.log(lines.join("\n"));
