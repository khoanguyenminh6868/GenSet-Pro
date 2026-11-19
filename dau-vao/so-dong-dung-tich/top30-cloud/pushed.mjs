// node pushed.mjs: dòng rời top 30 mà VẪN ở all của nhánh (bị đẩy). Với mỗi dòng: có dòng vào top cùng động cơ / cùng NCC
// không, điểm so với dòng vào, và nhánh có giữ được số dòng của NCC / động cơ đó trong top không (trần PER_SUPPLIER / PER_ENGINE).
import fs from "node:fs";
import path from "node:path";
const WT = "C:/Projects/GenSet Pro/wt-so-dong-c";
await import("file:///C:/Projects/GenSet%20Pro/wt-so-dong-c/suppliers/config-bot.mjs");
const CAT = globalThis.GenbidCatalog, dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), engs = new Map(cat.engines.map((e) => [e.key, e]));
const makeOf = (k) => (engs.get(k.split("|")[1])?.make || "?").split(" / ")[0], cnOf = (k) => { const e = engs.get(k.split("|")[1]); return e ? CAT.originOf(e) === "cn" : false; };
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const g = J("./gop-goc.json"), n = J("./gop-nhanh.json"), ids = J("./runs-doi.json").ids;
const sup = (k) => k.split("|")[0], eng = (k) => k.split("|")[1];
const cnt = {}, L = [];
for (const k of ids) {
  const ta = g[k].top, tb = n[k].top, sb = new Set(tb), sa = new Set(ta);
  const sc = new Map(n[k].all.map(([q, s]) => [q, s])), scA = new Map(g[k].all.map(([q, s]) => [q, s]));
  const ins = tb.filter((q) => !sa.has(q));
  for (const q of ta) {
    if (sb.has(q) || !sc.has(q)) continue;
    const s = sc.get(q), minB = Math.min(...n[k].topScore);
    const sameEngIn = ins.filter((x) => eng(x) === eng(q)), sameSupIn = ins.filter((x) => sup(x) === sup(q));
    let why;
    if (s < minB) why = "điểm thấp hơn mọi dòng top mới";
    else if (sameEngIn.some((x) => sc.get(x) === s)) why = "thay bằng dòng cùng động cơ, cùng điểm (thứ tự hoà điểm)";
    else if (sameSupIn.some((x) => sc.get(x) === s)) why = "thay bằng dòng cùng NCC, cùng điểm (thứ tự hoà điểm)";
    else if (s === minB) why = "bằng điểm thấp nhất top mới (thứ tự hoà điểm)";
    else {
      const nSupB = tb.filter((x) => sup(x) === sup(q)).length, nEngB = tb.filter((x) => eng(x) === eng(q)).length, nMakeB = tb.filter((x) => makeOf(x) === makeOf(q)).length;
      const nCnIn = ins.filter(cnOf).length;
      why = nEngB >= 3 ? "trần 3 dòng / động cơ đã đầy" : nSupB >= 4 ? "trần 4 dòng / NCC đã đầy" : nMakeB >= 10 ? `trần 10 dòng / hãng (${makeOf(q)}) đã đầy` : `CHƯA RÕ: NCC ${nSupB}, động cơ ${nEngB}, hãng ${makeOf(q)} ${nMakeB}`;
      why += ` (điểm ${s} > thấp nhất ${minB}; dòng TQ vào top ${nCnIn})`;
    }
    const key = why.replace(/\d+/g, "#");
    cnt[key] = (cnt[key] || 0) + 1;
    L.push(`${k}\t${q.slice(0, 60)}\tđiểm ${s} (main ${scA.get(q)})\t${why}`);
  }
}
console.log(JSON.stringify(cnt, null, 1));
fs.writeFileSync(new URL("./pushed.txt", import.meta.url), L.join("\n"));
