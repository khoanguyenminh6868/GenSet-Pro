// So đầu ra giữa hai cây mã: build() (engines / alternators / controllers, gồm `fuel`) và candidates trên bộ fixture suppliers/fixtures/runs.
//   node 4-so-hai-ban.mjs <cây mã> > tệp.json     rồi so hai tệp (md5 từng phần). In JSON {phần: md5}.
import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib"; import crypto from "node:crypto"; import { pathToFileURL } from "node:url";
const WT = process.argv[2];
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const md5 = (x) => crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const out = {};
const parts = (cat) => ({ engines: md5(cat.engines), alternators: md5(cat.alternators), controllers: md5(cat.controllers) });
// 1) build() của toàn bộ suppliers/cn
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups);
out["build(cn)"] = parts(full);
out["build(cn).fuelUses"] = md5(full.engines.flatMap((e) => e.uses.map((u) => [e.key, u.supplierId, u.n, u.line, u.fuel, u.fuelFrom, u.fuelWhy])));
out["build(cn).nFuel"] = full.engines.flatMap((e) => e.uses).filter((u) => u.fuel).length;
// 2) fixture: build() trên NCC đóng băng + candidates
const R = path.join(WT, "suppliers", "fixtures", "runs");
const CAPS = { IB2600586587: [160], IB2600601812: [100], IB2600592684: [30, 500], IB2600603983: [700], IB2600594596: [300] };
for (const t of fs.readdirSync(R).filter((d) => /^IB\d+$/.test(d)).sort()) {
  const f = fs.readdirSync(path.join(R, t)).find((x) => /^config.*\.input\.json\.gz$/.test(x));
  const b = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(R, t, f))));
  const cat = CAT.build(b.suppliers);
  out[`fixture ${t} build`] = parts(cat);
  for (const kva of CAPS[t] || []) {
    const cap = { value: kva, unit: "kVA" }, hints = B.hintsOf(b.hsmtText, "", null);
    const cn = B.cnSuppliers(b.suppliers), origin = b.meta.origin || "all";
    const facts = B.modelFacts(cat, b.suppliers);
    const r = B.candidates(cat, cap, hints, { suppliers: b.suppliers, origin, cn, facts });
    const key = (x) => `${x.u.supplierId}|${x.e.key}|${CAT.keyOf(x.u.line || "")}`;
    out[`fixture ${t} candidates ${kva}kVA`] = md5({ top: r.top.map((x) => [key(x), x.score]), all: r.all.map((x) => [key(x), x.score]), dropped: r.dropped.length });
    out[`fixture ${t} candidates ${kva}kVA n`] = `top ${r.top.length}, all ${r.all.length}, dropped ${r.dropped.length}`;
  }
}
console.log(JSON.stringify(out, null, 1));
