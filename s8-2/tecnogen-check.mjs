// node tecnogen-check.mjs <code dir> <cn dir> <out.tsv>: mọi disp "cm3" của tecnogen n2001–n2010 so với ô 8 của chính dòng.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
process.env.GENBID_SPEC_NORM = "1";
const [WT, CN, OUT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(path.join(CN, "tecnogen.json"), "utf8"));
const recs = C.fromSupplier(s).filter((r) => r.n >= 2001 && r.n <= 2010 && r.kind === "engine");
let bad = 0, n = 0;
const lines = ["n\tdòng\ttổ máy\tđộng cơ\tô cm3 nguyên văn\tspec value\tsau chuẩn hoá (L)\tkhớp"];
for (const r of recs) {
  const cells = C.cellsOf(r.line || ""), cell = String(cells[8] ?? "").trim();
  const sp = (r.specs || []).filter((q) => q.key === "disp");
  if (sp.length > 1) { bad++; lines.push(`${r.n}\t${r.row}\t${r.genset}\t${r.model}\t${cell}\tHAI disp\t\tLỆCH`); continue; }
  const v = sp[0]?.value ?? "";
  const t = s.specTables[r.table];
  const x = sp[0] ? B.normFig(sp[0], { title: t.title, header: t.header, rows: t.rows }, { unit: "L" }) : null;
  const num = x?.ok ? x.r.num : null;
  const exp = /^\d+$/.test(cell) ? Number(cell) / 1000 : null;
  const ok = sp[0] ? v === cell && sp[0].label === "cm3" && num === exp : !/^\d/.test(cell);
  if (!ok) bad++;
  if (sp[0]) n++;
  lines.push(`${r.n}\t${r.row}\t${r.genset}\t${r.model}\t${cell}\t${v}\t${num ?? ""}\t${ok ? "khớp" : "LỆCH"}`);
}
fs.writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`bản ghi động cơ ${recs.length}, có disp cm3 ${n}, lệch ${bad}`);
