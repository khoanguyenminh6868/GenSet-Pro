// node in-ctx.mjs ctx.json <regex nguồn> [regex loại dòng]
import fs from "node:fs";
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const re = new RegExp(process.argv[3]), skip = process.argv[4] ? new RegExp(process.argv[4]) : null;
const seen = new Set();
for (const r of rows) {
  if (!re.test(r.nguon) || (skip && skip.test(r.line))) continue;
  const k = r.nguon + r.line; if (seen.has(k)) continue; seen.add(k);
  console.log(`== ${r.nguon} d${r.srcLine} gắn:${r.model} nêu:${r.nameds}\n` + (r.ctx || []).map((x, i) => `   ${i === 2 ? ">" : " "} ${x.slice(0, 170)}`).join("\n"));
}
