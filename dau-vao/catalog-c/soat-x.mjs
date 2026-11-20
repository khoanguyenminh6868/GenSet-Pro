// node soat-x.mjs <repo> : mọi dòng của 4 bảng X (bảng bỏ sót) cạnh bản ghi fromSupplier / note, kèm kiểm tự động
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const REPO = process.argv[2];
await import(pathToFileURL(path.join(REPO, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const X = { "green-power-generators": [16, 18, 27], "lees-power": [31] };
const nums = (s) => (String(s).match(/\d+(?:\.\d+)?/g) || []).map(Number);
let recs = 0, bad = 0;
for (const [id, tis] of Object.entries(X)) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, "suppliers", "cn", id + ".json"), "utf8"));
  const notes = [], out = C.fromSupplier(s, notes);
  for (const ti of tis) {
    const t = s.specTables[ti];
    console.log(`\n== ${id} n${t.n} ti${ti} | ${t.title}`);
    t.rows.forEach((line, ri) => {
      const r = out.filter((o) => o.table === ti && o.row === ri);
      const ns = notes.filter((x) => x.table === ti && x.row === ri).map((x) => x.reason);
      console.log(`  r${ri} ${line.slice(0, 120)}`);
      for (const o of r) {
        recs++;
        const inL = new Set(nums(line)), errs = [];
        if (!line.includes(o.model)) errs.push("model không có trong dòng");
        for (const p of Object.values(o.power || {})) for (const v of [p.kW, p.kVA]) if (v != null && !inL.has(v)) errs.push(`công suất ${v} không có`);
        for (const sp of o.specs) if (!line.includes(sp.value)) errs.push(`${sp.key}=${sp.value} không nguyên văn`);
        if (o.power?.prime && o.power?.standby && o.power.prime.kVA > o.power.standby.kVA) errs.push("prime > standby");
        if (errs.length) bad++;
        console.log(`     → ${o.kind} ${o.model} | tổ máy ${o.genset} | ${JSON.stringify(o.power)} f=${o.freq} | ${o.makes.map((m) => m.name + "/" + m.via).join(",")} | ${o.specs.map((x) => x.key + "=" + x.value).join("; ")}${errs.length ? " !! " + errs.join("; ") : ""}`);
      }
      if (!r.length) console.log(`     → (không bản ghi) ${ns.join("; ")}`);
    });
  }
}
console.log(`\nbản ghi: ${recs}, ca lệch kiểm tự động: ${bad}`);
