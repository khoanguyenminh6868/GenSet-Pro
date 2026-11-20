// PR 2 (huatai n111 7C + yingtai n101 / n2003 6C): (1) fromSupplier cũ ↔ mới MỌI NCC, NCC khác phải 0 đổi; (2) mỗi bản ghi mới
// của yingtai: từng số ↔ ô nguồn + giá trị thắng / phiếu của khoá ở build() cũ; (3) build() cũ ↔ mới: khoá động cơ đổi
// `win` của cyl / disp / bore / compr; (4) huatai: 17 dòng tên → kW, dòng điện ↔ kW × 1,804 (400 V, cos φ 0,8).
// node soat-hy.mjs <catalog cũ.js> <catalog mới.js> <cn> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [OLD, NEW, CN, OUT] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const A = load(OLD), B = load(NEW);
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8")));
const sig = (o) => JSON.stringify([o.kind, o.model, o.genset, o.power, o.freq, (o.specs || []).map((x) => x.key + "=" + x.value), (o.makes || []).map((m) => m.name + "/" + m.via), o.other]);
const key = (o) => `${o.table}|${o.row}|${o.kind}|${o.freq ?? ""}|${o.model}`;
const out = [];
const other = [];
const mine = { "huatai-yangzhou": [], "yingtai-jiangsu": [] };
for (const s of sups) {
  if (!s || s.status === "incomplete" || s.role === "controller_maker") continue;
  const a = A.fromSupplier(s), b = B.fromSupplier(s);
  const ma = new Map(a.map((o) => [key(o), o])), mb = new Map(b.map((o) => [key(o), o]));
  const d = [];
  for (const [k, o] of ma) if (!mb.has(k)) d.push(["MẤT", o]); else if (sig(o) !== sig(mb.get(k))) d.push(["ĐỔI", mb.get(k), o]);
  for (const [k, o] of mb) if (!ma.has(k)) d.push(["MỚI", o]);
  if (!d.length) continue;
  if (!mine[s.id]) { other.push(`${s.id}: ${d.length}`); continue; }
  mine[s.id] = d;
}
console.log("NCC khác có đổi:", other.length ? other.join(", ") : "0");
for (const [id, d] of Object.entries(mine)) {
  const c = {}; for (const [w, o] of d) { const k = `${w} n${o.n}/b${o.table} ${o.kind}`; c[k] = (c[k] || 0) + 1; }
  console.log(id, JSON.stringify(c));
}
// (2)
const ba = A.build(sups), bb = B.build(sups);
const ea = new Map(ba.engines.map((e) => [e.key, e])), eb = new Map(bb.engines.map((e) => [e.key, e]));
const norm = (v) => String(v).toLowerCase().replace(/\s+/g, "");
out.push(["phan", "model", "khoa", "truong", "yingtai", "thang-cu", "phieu-cu", "so-NCC-khac", "thang-moi", "danh-gia"].join("\t"));
const yt = mine["yingtai-jiangsu"].filter(([w, o]) => w === "MỚI" && o.kind === "engine" && o.table !== 0).map(([, o]) => o);
let agree = 0, differ = 0, alone = 0, newKey = 0;
for (const o of yt) {
  const k = B.keyOf(o.model), e0 = ea.get(k), e1 = eb.get(k);
  if (!e0) newKey++;
  for (const sp of o.specs.filter((x) => ["cyl", "disp", "bore", "compr"].includes(x.key))) {
    const g0 = e0?.specs?.find((x) => x.key === sp.key), g1 = e1?.specs?.find((x) => x.key === sp.key);
    const others = g0 ? new Set(g0.values.flatMap((v) => v.suppliers)) : new Set();
    others.delete("yingtai-jiangsu");
    const winV = (g) => (g?.win ? g.values.find((v) => norm(v.value) === g.win)?.value ?? g.win : "");
    const w0 = winV(g0), w1 = winV(g1);
    const same = g0 && g0.values.some((v) => norm(v.value) === norm(sp.value) && v.suppliers.some((x) => x !== "yingtai-jiangsu"));
    const verdict = !g0 || !others.size ? "chỉ yingtai ghi" : same ? "trùng chữ với NCC khác" : "KHÁC mọi NCC khác";
    if (verdict === "trùng chữ với NCC khác") agree++; else if (verdict === "chỉ yingtai ghi") alone++; else differ++;
    out.push(["so", o.model, k, sp.key, sp.value, w0, g0 ? JSON.stringify(g0.votes || {}) : "", others.size, w1, verdict + (w0 !== w1 ? " | THẮNG ĐỔI" : "")].join("\t"));
  }
}
console.log(`yingtai: ${yt.length} bản ghi, khoá mới ${newKey}; số so: trùng NCC khác ${agree}, KHÁC ${differ}, chỉ yingtai ${alone}`);
// (3)
let wch = 0;
for (const [k, e1] of eb) {
  const e0 = ea.get(k); if (!e0) continue;
  for (const sk of ["cyl", "disp", "bore", "compr"]) {
    const g0 = e0.specs?.find((x) => x.key === sk), g1 = e1.specs?.find((x) => x.key === sk);
    if ((g0?.win ?? null) !== (g1?.win ?? null)) { wch++; out.push(["thang-doi", e1.model, k, sk, "", g0?.win ?? "", JSON.stringify(g0?.votes || {}), "", g1?.win ?? "", JSON.stringify(g1?.votes || {})].join("\t")); }
  }
}
console.log(`khoá động cơ: ${ea.size} → ${eb.size}; giá trị thắng đổi: ${wch}`);
// (4)
for (const [w, o, old] of mine["huatai-yangzhou"]) {
  const kW = o.power?.rated?.kW, cur = +((o.specs || []).find((x) => x.key === "current")?.value), ep = (o.specs || []).find((x) => x.key === "engPower")?.value;
  out.push(["huatai", o.model, o.genset, `kW tên ${kW}`, `dòng điện ${cur} ↔ ${kW ? (kW * 1000 / (Math.sqrt(3) * 400 * 0.8)).toFixed(1) : ""}`, `lệch ${kW ? ((cur / (kW * 1000 / (Math.sqrt(3) * 400 * 0.8)) - 1) * 100).toFixed(2) + "%" : ""}`, `engPower ${ep} (×${kW ? (ep / kW).toFixed(2) : ""})`, w, `cũ ${JSON.stringify(old?.power)}`, String(o.line)].join("\t"));
}
fs.writeFileSync(OUT, out.join("\n") + "\n");
