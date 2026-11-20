import fs from "node:fs";
import path from "node:path";
const s = process.argv[2];
const J = (f) => JSON.parse(fs.readFileSync(path.join(s, f), "utf8"));
const cm = J("docs/configmatch.json"), rq = J("docs/configreq.json"), r = cm.result;
console.log("configreq:", JSON.stringify(rq));
console.log("at:", cm.at, "| khoá result:", Object.keys(r).join(","));
console.log("summary:", r.summary);
for (const k of ["cap", "origin", "originNote", "engineTrait", "brandSync", "note", "notes", "dropped"]) if (r[k] != null) console.log(k + ":", JSON.stringify(r[k]).slice(0, 1500));
console.log("\n== YÊU CẦU ==");
for (const q of r.requirements || []) console.log(`- [${q.code || ""}|${q.part || ""}] ${q.item}: ${String(q.required || q.text || "").slice(0, 260)}`);
console.log("\n== CẤU HÌNH ==");
const st = { met: "Đ", not_met: "KĐ", unclear: "?" };
for (const c of r.configs || []) {
  const cnt = {};
  for (const x of c.checks || []) cnt[x.status] = (cnt[x.status] || 0) + 1;
  console.log(`\n#${c.rank} ĐC ${c.engine?.make || ""} ${c.engine?.model || ""} | ĐP ${c.alternator?.make || ""} ${c.alternator?.model || ""} | BĐK ${c.controller?.make || ""} ${c.controller?.model || ""} | tổ máy ${c.genset?.make || ""} ${c.genset?.model || ""} | NCC ${(c.suppliers || []).map((x) => x.supplierId || x.id).join(",")} | ${JSON.stringify(cnt)}`);
  console.log("   khoá:", Object.keys(c).join(","));
  for (const x of c.checks || []) if (x.status !== "met") console.log(`   ${st[x.status]} ${x.item}: ${String(x.offered || "").slice(0, 90)} | ${String(x.note || "").slice(0, 200)}`);
}
