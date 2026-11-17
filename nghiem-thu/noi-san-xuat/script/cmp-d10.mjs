import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const pw = (p) => { const x = p?.prime || p?.standby || p?.rated; return x ? `${x.kVA ?? "?"}kVA${p.prime ? " P" : p.standby ? " S" : ""}` : "-"; };
const tag = (r) => `${r.model} [${r.make}|${r.origin}] ${r.sup} ${pw(r.power)} s=${r.score} (${(r.why || []).join("; ").slice(0, 90)})`;
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k], ka = new Set(a.top.map((r) => r.k)), kb = new Set(b.top.map((r) => r.k));
  const out = a.top.filter((r) => !kb.has(r.k)), inn = b.top.filter((r) => !ka.has(r.k));
  console.log(`\n=== ${k} | ${a.cap.value} ${a.cap.unit} | origin ${a.origin} | hãng HSMT nêu: ${a.engineMakes.join(",") || "—"} | ${a.bidName.slice(0, 70)}`);
  console.log(`  RA (${out.length}):`); for (const r of out) console.log("   - " + tag(r));
  console.log(`  VÀO (${inn.length}):`); for (const r of inn) console.log("   + " + tag(r));
  // engines whose make/origin changed in this package
  const chg = b.top.filter((r) => { const o = a.top.find((x) => x.k === r.k); return o && (o.make !== r.make || o.origin !== r.origin || o.score !== r.score); });
  if (chg.length) console.log("  GIỮ NHƯNG ĐỔI:", chg.slice(0, 6).map((r) => { const o = a.top.find((x) => x.k === r.k); return `${r.model} ${o.make}/${o.origin}/${o.score}→${r.make}/${r.origin}/${r.score}`; }).join(" · "));
}
