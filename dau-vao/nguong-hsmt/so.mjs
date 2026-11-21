// node so.mjs <gốc.json> <nhánh.json> <out.tsv> (CHỈ ĐỌC): mọi lượt đổi ngưỡng, theo nguồn (S = specs, H = bidhist) và trường.
import fs from "node:fs";
const [A, Z, OUT] = process.argv.slice(2);
const a = JSON.parse(fs.readFileSync(A, "utf8")), z = JSON.parse(fs.readFileSync(Z, "utf8"));
const rows = [], byField = {}, bySrc = { S: 0, H: 0 }, nSrc = { S: 0, H: 0 };
for (const k of Object.keys(a)) {
  nSrc[k[0]]++;
  if (a[k] === z[k]) continue;
  bySrc[k[0]]++;
  const x = JSON.parse(a[k]), y = JSON.parse(z[k] ?? "{}"), diff = [];
  for (const f of Object.keys(x)) if (JSON.stringify(x[f]) !== JSON.stringify(y[f])) { diff.push(`${f}: ${JSON.stringify(x[f])} → ${JSON.stringify(y[f])}`); byField[f] = (byField[f] || 0) + 1; }
  rows.push(`${k}\t${diff.join("; ")}`);
}
fs.writeFileSync(OUT, "lượt\tđổi\n" + rows.join("\n") + "\n");
console.log(`lượt specs ${nSrc.S}: đổi ${bySrc.S}; lượt bidhist ${nSrc.H}: đổi ${bySrc.H}; khoá chỉ có một bên: ${Object.keys(z).filter((k) => !(k in a)).length}`);
console.log("theo trường:", JSON.stringify(byField));
