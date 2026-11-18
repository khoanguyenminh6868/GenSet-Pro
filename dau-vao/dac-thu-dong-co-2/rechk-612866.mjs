// node rechk-612866.mjs <worktree code> <out.txt>: chạy lại check + rankConfigs trên configmatch/IB2600612866 đã lưu
// (CHỈ ĐỌC web: doc + hsmtTextOf, không post). byCode của kết quả lưu được gỡ trước (như checkDir gỡ của agent), cap
// 8,5 kVA như lượt thật, trang internet đọc bằng savedReader (thư mục lượt đã bị dọn nên trang "web/N.txt" không còn).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OUT] = process.argv.slice(2), KEY = "IB2600612866";
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const saved = await B.doc("configmatch", KEY);
const { text } = await B.hsmtTextOf(KEY);
const lines = [`configmatch/${KEY} lưu lúc ${saved?.at}; chữ HSMT ${text.length} ký tự; code ${WT}`];
const res = JSON.parse(JSON.stringify(saved.result.sizes ? saved.result.sizes[0].result : saved.result));
const show = (r, title) => {
  lines.push(`\n## ${title}: ${(r.configs || []).length} cấu hình${r.engineTrait ? `; engineTrait ${JSON.stringify(r.engineTrait)}` : ""}`);
  for (const c of r.configs || []) lines.push(`#${c.rank} động cơ ${c.engine?.model || "-"} [${c.engine?.make || "?"}] (${c.engine?.src?.kind || "-"}) | tổ máy ${c.genset?.model || "-"} [${c.genset?.make || ""}] (${c.genset?.src?.kind || "-"}${c.genset?.src?.quote ? `: «${String(c.genset.src.quote).slice(0, 80)}»` : ""}) | NCC ${(c.suppliers || []).map((s) => s.supplierId).join(", ")}`);
};
show(res, "Kết quả đã lưu");
B.stripAgentCodeFlags(res.requirements);
for (const c of res.configs || []) B.stripAgentCodeFlags(c.checks);
const out = B.check(res, { hsmtText: text, suppliers: sups, readWeb: B.savedReader(), origin: res.origin || "all", basis: res.originBasis, cap: { value: 8.5, unit: "kVA" } });
B.rankConfigs(out.result);
show(out.result, "Sau check + rankConfigs");
lines.push("\n## problems", ...out.problems.filter((p) => /đã bỏ|HSMT ghi|ngoài dải/.test(p)));
lines.push("\n## notes", ...(out.result.notes || []));
fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(lines.join("\n"));
