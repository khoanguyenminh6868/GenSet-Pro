import fs from "node:fs";
const o = JSON.parse(fs.readFileSync("out.json", "utf8"));
const [a, b] = process.argv.slice(2).map(Number);
const cut = (s, n = 230) => { s = s.replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n) + "…" : s; };
o.slice(a, b).forEach((r, i) => {
  const sz = r.multi ? ` [${r.nSizes} cỡ: ${r.sizes.map((s) => s.value + s.unit).join("/")}${r.i != null ? ", lượt " + r.i : ""}]` : "";
  console.log(`#${a + i} ${r.key} ${r.cap.value}${r.cap.unit}${sz}${r.cm ? " [CM]" : ""} | min=${r.minDisp ?? "-"} max=${r.maxDisp ?? "-"} (đo#576 min=${r.measured.minDisp ?? "-"} max=${r.measured.maxDisp ?? "-"}; cả-văn-bản min=${r.wholeMin ?? "-"} max=${r.wholeMax ?? "-"})`);
  const want = new Set([r.rawMin, r.rawMax, r.wholeMin, r.wholeMax].filter((x) => x != null));
  const cs = r.cells.filter((c) => want.has(c.v));
  for (const c of (cs.length ? cs : r.cells).slice(0, 4)) console.log(`   ${c.k}=${c.v}: ${cut(c.cell)}`);
});
