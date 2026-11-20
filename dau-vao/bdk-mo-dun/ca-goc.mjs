// Ca gốc IB2600603983: các check bộ điều khiển trong configmatch đã lưu (doc-cache\configmatch.json, bản chụp 18/11).
// Chạy: node ca-goc.mjs [KEY]
import fs from "node:fs";
const key = process.argv[2] || "IB2600603983";
const all = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/configmatch.json", "utf8")).docs;
const doc = all[key];
const r = doc.d || doc.data || doc;
const res = r.result || r;
console.log("khoá:", Object.keys(r).join(","), "| result:", Object.keys(res).join(","));
for (const q of (res.requirements || []).filter((q) => q.part === "controller")) console.log("REQ", q.code, "|", q.item, "|", (q.quote || "").slice(0, 300), q.parts ? "| parts: " + q.parts.map((p) => p.item).join("; ") : "");
for (const cf of res.configs || []) {
  console.log(`\n-- ${cf.engine?.model} | BĐK ${cf.controller?.model} (${cf.controller?.src?.kind} ${cf.controller?.src?.supplierId || ""})`);
  for (const ch of (cf.checks || []).filter((c) => c.part === "controller")) console.log(`   ${ch.status} | ${ch.item} | ${(ch.offered || "").slice(0, 120)} | ${(ch.note || "").slice(0, 200)}${ch.parts ? " | parts: " + ch.parts.map((p) => `${p.item}=${p.status}`).join(", ") : ""}`);
}
