// So goc.json ↔ nhanh.json (check-all.mjs): MỌI cấu hình đổi đầu phát, đổi trạng thái check, đổi hạng / điểm, cấu hình
// thêm / mất. node so-ab.mjs goc.json nhanh.json > so-ab.txt
import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const st = (l) => new Map(l.map((s) => { const [part, item, rest] = s.split("|"); return [`${part}|${item}`, rest]; }));
let nCfg = 0, nAlt = 0, nChk = 0, nRank = 0;
for (const key of Object.keys(B)) {
  const a = A[key], b = B[key], out = [];
  if (!a) { console.log(`## ${key}: không có ở gốc`); continue; }
  const id = (c) => c.engine || "-";
  const left = [...a.configs];
  for (const cb of b.configs) {
    nCfg++;
    // the same configuration: same engine, and the same alternator or the alternator it replaced
    const i = left.findIndex((ca) => id(ca) === id(cb) && (ca.alt === cb.alt || ca.alt === cb.was || (!ca.alt && cb.fromMaker && !cb.was)));
    if (i < 0) { out.push(`  + cấu hình mới ở nhánh: #${cb.rank} ${id(cb)} | ${cb.alt}`); continue; }
    const ca = left.splice(i, 1)[0], lines = [];
    if (ca.alt !== cb.alt) { nAlt++; lines.push(`    đầu phát: ${ca.alt || "(không)"} → ${cb.alt || "(không)"}${cb.fromMaker ? ` [datasheet hãng${cb.byCode ? ", code đặt" : ""}]` : ""}${cb.wasWhy ? ` — ${cb.wasWhy}` : ""}${cb.options.length ? ` — ${cb.options.join("; ")}` : ""}`); }
    if (ca.rank !== cb.rank || JSON.stringify(ca.score) !== JSON.stringify(cb.score)) { nRank++; lines.push(`    hạng ${ca.rank} → ${cb.rank}; điểm ${JSON.stringify(ca.score)} → ${JSON.stringify(cb.score)}`); }
    const sa = st(ca.checks), sb = st(cb.checks);
    for (const k of new Set([...sa.keys(), ...sb.keys()])) {
      const x = sa.get(k), y = sb.get(k);
      const s1 = x ? x.split(" (")[0] : "(không có)", s2 = y ? y.split(" (")[0] : "(không có)";
      if (s1 !== s2) { nChk++; lines.push(`    check ${k}: ${s1} → ${s2}${y && y.includes(" (") ? ` — ${y.slice(y.indexOf(" (") + 1)}` : ""}`); }
    }
    if (lines.length) out.push(`  #${ca.rank}→#${cb.rank} ${id(cb)} | ${cb.alt || "-"}`, ...lines);
  }
  for (const ca of left) out.push(`  - cấu hình mất ở nhánh: #${ca.rank} ${id(ca)} | ${ca.alt}`);
  console.log(`## ${key} (${a.configs.length} → ${b.configs.length} cấu hình)${b.makerAlt ? ` — makerAlt: ${JSON.stringify(b.makerAlt)}` : ""}`);
  console.log(out.length ? out.join("\n") : "  giống hệt");
}
console.log(`\nTổng: ${nCfg} cấu hình ở nhánh; đổi đầu phát ${nAlt}; đổi hạng / điểm ${nRank}; check đổi trạng thái ${nChk}.`);
