// node 1-quet.mjs [nguồn: web|repo] > quet-<nguồn>.txt  (CHỈ ĐỌC)
// Mọi khoá động cơ / đầu phát của GenbidCatalog.build mà một phần của tên (tách theo dấu cách, ngoặc, "/", ",", "+", "&")
// là một khoá KHÁC đã có trong danh mục cùng loại. In: lớp, khoá, khoá đích, số dòng, NCC, tên nguyên văn, dòng nguồn.
// web = genbid-work/doc-cache/supplier.json (bản web 18/11, bộ gợi ý dùng); repo = GenSet-Pro/suppliers/cn/*.json (main).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const SRC = process.argv[2] || "web";
const WT = "C:/Projects/GenSet Pro/GenSet-Pro";
await import(pathToFileURL(`${WT}/suppliers/config-bot.mjs`).href);
const CAT = globalThis.GenbidCatalog;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = SRC === "repo"
  ? fs.readdirSync(`${WT}/suppliers/cn`).filter((f) => f.endsWith(".json")).map((f) => J(`${WT}/suppliers/cn/${f}`)).filter((d) => d.status !== "incomplete")
  : Object.values(J("C:/Projects/GenSet Pro/genbid-work/doc-cache/supplier.json").docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const cat = CAT.build(sups);
const out = [];
for (const kind of ["engines", "alternators"]) {
  const list = cat[kind], byKey = new Map(list.map((e) => [e.key, e]));
  for (const e of list) {
    const hits = new Map();
    for (const name of e.names) {
      // Tokens: split on space and separators; every contiguous run of tokens whose key is another entry's key.
      const toks = String(name).split(/[\s()（）/／,+&]+/).filter(Boolean);
      for (let i = 0; i < toks.length; i++) for (let j = i + 1; j <= toks.length; j++) {
        if (i === 0 && j === toks.length) continue;
        const k = CAT.keyOf(toks.slice(i, j).join(" "));
        if (k !== e.key && byKey.has(k) && k.length >= 4) hits.set(k, { name, rest: [...toks.slice(0, i), ...toks.slice(j)].join(" ") });
      }
    }
    // Keep only the longest target (a run inside another run is the same finding).
    const ks = [...hits.keys()].filter((k) => ![...hits.keys()].some((x) => x !== k && x.includes(k)));
    for (const k of ks) {
      const t = byKey.get(k), h = hits.get(k);
      const sep = /\(/.test(h.name) ? "ngoac" : /\//.test(h.name) ? "gach" : /[,+&]/.test(h.name) ? "phay" : "cach";
      out.push({ kind, sep, key: e.key, names: e.names, target: k, targetNames: t.names, rest: h.rest, rows: e.uses.length, sups: e.suppliers, tRows: t.uses.length, tSups: t.suppliers.length,
        make: e.make, tMake: t.make, uses: e.uses.map((u) => `${u.supplierId} n${u.n} b${u.table} r${u.row ?? ""} | ${String(u.line || (u.lines?.rows || []).join(" ; ")).slice(0, 220)}`) });
    }
  }
}
// Also: two entries whose keys differ only by a known non-code character left in keyOf ("(", ")", "/", "+", ",", "&", "'").
for (const kind of ["engines", "alternators"]) {
  const list = cat[kind], by = new Map();
  for (const e of list) { const k = e.key.replace(/[()（）/／,+&'’"]/g, ""); by.set(k, [...(by.get(k) || []), e]); }
  for (const [k, es] of by) if (es.length > 1) out.push({ kind, sep: "kytu", key: es.map((e) => e.key).join(" = "), names: es.flatMap((e) => e.names), target: k, rows: es.reduce((a, e) => a + e.uses.length, 0), sups: [...new Set(es.flatMap((e) => e.suppliers))], uses: es.flatMap((e) => e.uses.map((u) => `${e.key}: ${u.supplierId} n${u.n} | ${String(u.line || "").slice(0, 200)}`)) });
}
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), `quet-${SRC}.json`), JSON.stringify(out, null, 1));
console.log(`nguồn ${SRC}: ${sups.length} NCC, ${cat.engines.length} khoá động cơ, ${cat.alternators.length} khoá đầu phát; ${out.length} khoá nghi trùng`);
for (const o of out) {
  console.log(`\n[${o.kind} ${o.sep}] ${o.key} (${o.rows} dòng, NCC ${o.sups.join(",")}, hãng ${o.make || "∅"}) → ${o.target} (${o.tRows ?? "-"} dòng, ${o.tSups ?? "-"} NCC, hãng ${o.tMake || "∅"}) | phần còn lại "${o.rest ?? ""}"`);
  console.log(`   tên: ${JSON.stringify(o.names)}`);
  for (const u of o.uses.slice(0, 4)) console.log(`   ${u}`);
  if (o.uses.length > 4) console.log(`   … +${o.uses.length - 4}`);
}
