// Danh sách "Đầu phát theo datasheet hãng" mà prep sẽ đưa vào catalog.md cho một gói (chỉ đọc; Phân tích từ doc-cache,
// chữ HSMT từ hsmt/<TBMT>.txt, NCC = suppliers/cn của gốc repo). node list.mjs <gốc repo> <TBMT>...
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, ...keys] = process.argv.slice(2), root = path.resolve(rootArg);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const RC = await import(pathToFileURL(path.join(root, "suppliers", "reqcodes.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const A = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/analysis.json", "utf8")), all = A[Object.keys(A)[0]];
for (const key of keys) {
  const a = all[key]?.d?.result, text = fs.readFileSync(path.join(import.meta.dirname, "hsmt", `${key}.txt`), "utf8");
  const cap = CB.capacity([a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const reqs = (a?.technicalSpecs || []).map((s) => RC.withCode({ item: s.item, requirement: s.requirement, quote: s.quote || "", ...(/đ[ầa]u\s*ph[áa]t|c[ủu]\s*ph[áa]t|alternator/i.test(s.item || "") ? { part: "alternator" } : {}) }));
  const r = CB.makerAltsOf(sups, reqs, { cap, hsmtText: text, sourcesDir: path.join(root, "suppliers", "sources") });
  console.log(`# ${key} cap ${JSON.stringify(cap)}`);
  console.log("codes:", reqs.filter((q) => q.part === "alternator" || /^(power_prime|voltage|frequency)$/.test(q.code)).map((q) => `${q.code}<${q.item}>`).join(" | "));
  console.log("need:", JSON.stringify(r.need));
  console.log(r.md || "(không có model nào)");
}
