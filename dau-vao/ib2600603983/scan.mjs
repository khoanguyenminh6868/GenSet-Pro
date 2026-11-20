import fs from "node:fs";
import path from "node:path";
const s = process.argv[2];
const sup = JSON.parse(fs.readFileSync(path.join(s, "prep/suppliers.json"), "utf8"));
console.log("số NCC:", sup.length);
const pats = {
  "6M31G825": /6M31G825/i, "6M31 (mọi mã)": /6M31G/i, "LSA 49.3 M8": /LSA ?49\.3[ -]?M8/i, "LSA 49.3 (mọi mã)": /LSA ?49\.3/i,
  D350: /\bD350\b/i, AREP: /\bAREP\b/i, "DSE890": /DSE ?890|\b890 ?MK/i, "DSE7320": /(DSE|deep ?sea) ?7320/i, "DSE7420": /(DSE|deep ?sea) ?7420/i,
};
const hit = Object.fromEntries(Object.keys(pats).map((k) => [k, []]));
for (const x of sup) {
  for (const t of x.specTables || []) {
    const rows = [t.title || "", ...(t.header || []).map(String), ...(t.rows || []).map(String)];
    for (const r of rows) for (const [k, re] of Object.entries(pats)) if (re.test(r)) hit[k].push({ id: x.id, n: t.n, title: (t.title || "").slice(0, 70), row: r.slice(0, 260) });
  }
  const rest = JSON.stringify({ ...x, specTables: undefined });
  for (const [k, re] of Object.entries(pats)) if (re.test(rest)) hit[k].push({ id: x.id, n: "(ngoài bảng)", row: (rest.match(new RegExp(`.{0,80}${re.source}.{0,80}`, "i")) || [""])[0] });
}
for (const [k, v] of Object.entries(hit)) {
  const ids = [...new Set(v.map((h) => h.id))];
  console.log(`\n=== ${k}: ${v.length} dòng, ${ids.length} NCC (${ids.slice(0, 25).join(", ")}${ids.length > 25 ? "…" : ""})`);
  const show = /6M31G825|M8$|D350|DSE890/.test(k) ? v : v.slice(0, 0);
  for (const h of show.slice(0, 40)) console.log(`  ${h.id} n${h.n} [${h.title || ""}] ${h.row}`);
}
console.log("\n=== hồ sơ hãng ===");
for (const x of sup) if (/baudouin|leroy|nidec|deep-sea|moteurs/i.test(x.id)) console.log(x.id, "| role:", x.role, "| status:", x.status, "| country:", x.country, "| website:", x.website, "| bảng:", (x.specTables || []).length, "| n:", (x.specTables || []).map((t) => t.n).join(","));
