// Trong các khối KHÔNG tách (nhóm 3, 5 của gap447): dòng chữ sau dòng máy có ghi điều kiện KHÁC tiêu đề đầu không
// (Hz, RPM, pha, điện áp, đơn vị, Tier / Stage). Có = có thể đang đọc sai, cần người xem; không = tách hay không cũng đọc như nhau.
//   node gap6.mjs <gốc repo> <gap-detail.tsv> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, detail, outFile] = process.argv.slice(2);
process.argv.length = 2;
const { subTables, isMachineRow } = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const cells = (l) => l.split("|").map((x) => x.trim()).filter(Boolean);
const isNum = (c) => /\d/.test(c) && c.replace(/[\d.,~\-–/()%\s]|kva|kw|v|hz|rpm|l\/h|mm|kg|db|a\b/gi, "").length <= 3;
const isData = (l) => { const c = cells(l); return c.filter(isNum).length >= Math.max(2, c.length * 0.4); };
const isRow = (l) => cells(l).length > 1 && (isData(l) || isMachineRow(l));
const COND = /\b\d{2}\s*hz\b|\b\d{4}\s*(rpm|r\/min)\b|\b[13]\s*-?\s*(phase|ph)\b|single phase|three phase|\b\d{3}\s*\/?\s*\d{0,3}\s*v\b|\bkva\b|\bkw\b|l\/h|g\/kw|tier\s*\d\w*|stage\s*[ivx\d]+\w*|单相|三相|\d{2}赫兹/gi;
const conds = (l) => (String(l).match(COND) || []).map((x) => x.toLowerCase().replace(/\s+/g, ""));
const rowsD = fs.readFileSync(detail, "utf8").split("\n").filter((l) => /^(3|5)\./.test(l));
const pages = [...new Set(rowsD.map((l) => l.split("\t")[1]))], out = [];
let blocks = 0, flagged = 0; const ncc = new Set();
for (const p of pages) {
  const [id, nn] = p.split(" "), L = fs.readFileSync(path.join(root, "suppliers", "sources", id, nn.slice(1) + ".md"), "utf8").split(/\r?\n/);
  for (let i = 0; i < L.length;) {
    if (!L[i].startsWith("|") || L[i].split("|").length < 4) { i++; continue; }
    let j = i; while (j < L.length && L[j].startsWith("|") && L[j].split("|").length >= 3) j++;
    const b = L.slice(i, j), at = i + 1; i = j;
    const r0 = b.findIndex(isRow); if (r0 < 0 || subTables(b).length !== 1) continue;
    const later = b.slice(r0).filter((l) => !isRow(l) && cells(l).length >= 1); if (!later.length) continue;
    blocks++;
    const head = new Set(b.slice(0, r0).flatMap(conds));
    // Chỉ xét dòng không có mã máy ở ô đầu: dòng máy chữ ("CD28V2/H1 CONTACT | 28KVA/ 22KW") tự mang số của nó.
    const fresh = later.filter((l) => !/[a-z]/i.test(cells(l)[0] || "") || !/\d/.test(cells(l)[0] || "")).flatMap((l) => conds(l).filter((c) => !head.has(c)).map((c) => [c, l]));
    if (!fresh.length) continue;
    flagged++; ncc.add(id);
    out.push(`${id} ${nn} L${at}\t${b.filter(isRow).length} dòng\t${[...new Set(fresh.map((x) => x[0]))].join(",")}\t${fresh[0][1].slice(0, 100)}`);
  }
}
fs.writeFileSync(outFile, out.join("\n") + "\n", "utf8");
console.log(`khối không tách có dòng chữ sau dòng máy: ${blocks}; có điều kiện khác tiêu đề đầu: ${flagged} khối, ${ncc.size} NCC`);
