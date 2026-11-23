// Soát: bảng đúng 60 / 250 / 700 dòng mà lệnh đo chưa tính; ngôn ngữ từng đoạn của các tài liệu bị cắt; DSE 1016.
import fs from "node:fs";
import path from "node:path";
const [wt, tsvFile] = process.argv.slice(2);
const SUP = path.join(wt, "suppliers");
const hit = new Set(fs.readFileSync(tsvFile, "utf8").trim().split("\n").slice(1).map((l) => { const c = l.split("\t"); return `${c[1]}|${c[2]}`; }));
const exact = [];
for (const f of fs.readdirSync(path.join(SUP, "cn")).filter((x) => x.endsWith(".json"))) {
  const r = JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8"));
  for (const t of r.specTables || []) if ([60, 250, 699, 700].includes((t.rows || []).length) && !hit.has(`${r.id}|${t.n}`)) exact.push(`${r.id}/${t.n} ${t.rows.length} dòng: ${String(t.title).slice(0, 50)}`);
}
console.log("BẢNG ĐÚNG SỐ TRẦN MÀ CHƯA TÍNH:", exact.length); exact.forEach((x) => console.log(" ", x));

const WORDS = { en: /\b(the|and|with|when|this|is)\b/gi, it: /\b(della|delle|il|per|con|che|sono)\b/gi, es: /\b(el|los|las|para|con|del|una)\b/gi, fr: /\b(le|les|des|pour|avec|une|est)\b/gi, de: /\b(der|die|das|und|mit|für|ist)\b/gi, ru: /[Ѐ-ӿ]{3,}/g, zh: /[一-鿿]/g };
const langOf = (s) => Object.entries(WORDS).map(([k, re]) => [k, (s.match(re) || []).length]).sort((a, b) => b[1] - a[1])[0][0];
for (const [id, n] of fs.readFileSync(tsvFile, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t")).filter((c) => c[0] === "700").map((c) => [c[1], c[2]])) {
  const lines = fs.readFileSync(path.join(SUP, "sources", id, `${n}.md`), "utf8").split(/\r?\n/).filter((l) => l.trim());
  const seq = [];
  for (let i = 0; i < lines.length; i += 250) seq.push(langOf(lines.slice(i, i + 250).join(" ")));
  const runs = []; for (const x of seq) { if (runs.at(-1)?.[0] === x) runs.at(-1)[1]++; else runs.push([x, 1]); }
  console.log(`${id}/${n} ${lines.length} dòng, đoạn 250: ${runs.map(([a, b]) => `${a}×${b}`).join(" ")}`);
}
const s = path.join(SUP, "sources", "deep-sea-electronics", "1016.md"), body = fs.readFileSync(s, "utf8").split(/\r?\n/);
console.log("DSE 1016:", body.length, "dòng,", fs.statSync(s).size, "byte; đầu:", body.slice(0, 6).join(" / ").slice(0, 300));
const sices = fs.readFileSync(path.join(SUP, "sources", "sices", "1003.md"), "utf8").split(/\r?\n/).filter((l) => l.trim());
for (const i of [800, 2500, 4500, 6500, 8500]) console.log(`SICES dòng ${i}:`, sices.slice(i, i + 3).join(" // ").slice(0, 220));
