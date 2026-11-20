// PR 1: (a) 98 bản ghi n156 ↔ bảng trang sống 20/11; (b) build() cũ ↔ mới: khoá động cơ / đầu phát thêm / mất / đổi,
// md5 bộ điều khiển, khoá đầu phát EL dùng chung NCC khác không.
// node kiem-build.mjs <catalog cũ.js> <catalog mới.js> <cn> <n156-trang-song.md>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
const [OLD, NEW, CN, LIVE] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const A = load(OLD), B = load(NEW);
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8")));
// (a)
const el = sups.find((s) => s.id === "eastern-lion-fuan");
const recs = B.fromSupplier(el).filter((o) => o.n === 156);
const live = fs.readFileSync(LIVE, "utf8").split("\n").filter((l) => /^\|\s*EL/i.test(l)).map((l) => l.split("|").map((c) => c.trim()).filter((c, i) => i > 0));
let ok = 0, bad = [];
for (const c of live) {
  for (const [freq, iw, ia] of [[50, 1, 2], [60, 3, 4]]) {
    const r = recs.find((o) => o.model === c[0] && o.freq === freq);
    if (r && r.power?.rated?.kW === +c[iw] && r.power?.rated?.kVA === +c[ia] && !r.power.prime && !r.power.standby) ok++;
    else bad.push(`${c[0]} ${freq} Hz trang ${c[iw]}/${c[ia]} bản ghi ${JSON.stringify(r?.power)}`);
  }
}
console.log(`(a) n156: dòng trang sống ${live.length}, bản ghi ${recs.length}, khớp ${ok}, lệch ${bad.length}`, bad.slice(0, 5));
// (b)
const ba = A.build(sups), bb = B.build(sups);
const md5 = (x) => crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
for (const kind of ["engines", "alternators", "controllers"]) {
  const ka = new Map(ba[kind].map((e) => [e.key, e])), kb = new Map(bb[kind].map((e) => [e.key, e]));
  const add = [...kb.keys()].filter((k) => !ka.has(k)), del = [...ka.keys()].filter((k) => !kb.has(k));
  const chg = [...kb.keys()].filter((k) => ka.has(k) && md5(ka.get(k)) !== md5(kb.get(k)));
  console.log(`(b) ${kind}: ${ka.size} → ${kb.size} | thêm ${add.length} ${add.slice(0, 60).join(" ")} | mất ${del.length} ${del.join(" ")} | đổi ${chg.length}`);
  if (kind !== "controllers") {
    // khoá đổi: chỉ eastern-lion trong uses?
    const foreign = chg.filter((k) => kb.get(k).uses.some((u) => u.supplierId !== "eastern-lion-fuan"));
    console.log(`    khoá đổi có NCC khác dùng: ${foreign.length} ${foreign.slice(0, 20).join(" ")}`);
    for (const k of foreign.slice(0, 8)) {
      const a = ka.get(k), b = kb.get(k), keys = Object.keys(b).filter((x) => md5(a[x]) !== md5(b[x]));
      console.log(`      ${k}: trường đổi ${keys.join(",")}; NCC ${[...new Set(b.uses.map((u) => u.supplierId))].join(",")}`);
    }
  } else console.log(`    md5 ${md5(ba[kind])} → ${md5(bb[kind])}`);
}
// khoá đầu phát EL: NCC nào dùng
const elKeys = bb.alternators.filter((a) => /^ELS?\d{3}/.test(a.key));
console.log(`    khoá đầu phát EL / ELS: ${elKeys.length}; khoá có NCC khác ngoài eastern-lion: ${elKeys.filter((a) => a.uses.some((u) => u.supplierId !== "eastern-lion-fuan")).length}`);
const only156 = elKeys.filter((a) => a.uses.every((u) => u.n === 156)).map((a) => a.key);
console.log(`    khoá EL chỉ có ở n156 (không dòng tổ máy nào dùng): ${only156.length} ${only156.join(" ")}`);
