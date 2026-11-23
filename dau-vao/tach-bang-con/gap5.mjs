// 21 khối có dòng lặp đạt luật mà không tách: tiêu đề lặp có KHÁC tiêu đề đầu không (khác = có thể đọc sai), và dòng nào làm chốt giữ khối.
//   node gap5.mjs <gốc repo> <gap-detail.tsv>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, detail] = process.argv.slice(2);
process.argv.length = 2;
const { subTables, isMachineRow } = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const cells = (l) => l.split("|").map((x) => x.trim()).filter(Boolean);
const isNum = (c) => /\d/.test(c) && c.replace(/[\d.,~\-–/()%\s]|kva|kw|v|hz|rpm|l\/h|mm|kg|db|a\b/gi, "").length <= 3;
const isData = (l) => { const c = cells(l); return c.filter(isNum).length >= Math.max(2, c.length * 0.4); };
const isRow = (l) => cells(l).length > 1 && (isData(l) || isMachineRow(l));
const pages = [...new Set(fs.readFileSync(detail, "utf8").split("\n").filter((l) => l.startsWith("5.")).map((l) => l.split("\t")[1]))];
for (const p of pages) {
  const [id, nn] = p.split(" "), L = fs.readFileSync(path.join(root, "suppliers", "sources", id, nn.slice(1) + ".md"), "utf8").split(/\r?\n/);
  for (let i = 0; i < L.length;) {
    if (!L[i].startsWith("|") || L[i].split("|").length < 4) { i++; continue; }
    let j = i; while (j < L.length && L[j].startsWith("|") && L[j].split("|").length >= 3) j++;
    const b = L.slice(i, j), at = i + 1; i = j;
    const r0 = b.findIndex(isRow); if (r0 < 0) continue;
    const head = new Set(b.slice(0, r0)), later = b.slice(r0).filter((l) => !isRow(l) && cells(l).length >= 3);
    if (!later.length || subTables(b).length !== 1) continue;
    // Dòng cùng số ô với dòng máy mà không có ô nào trùng tiêu đề là dòng máy chữ ("28KVA/ 22KW"), không phải tiêu đề lặp.
    const headCells = new Set([...head].flatMap(cells).map((c) => c.toLowerCase().replace(/\s+/g, "")));
    const titled = (l) => { const c = cells(l).map((x) => x.toLowerCase().replace(/\s+/g, "")); return c.filter((x) => headCells.has(x)).length >= c.length * 0.5; };
    const diff = [...new Set(later.filter((l) => !head.has(l) && titled(l)))];
    const rowsAfter = b.slice(r0).filter(isRow).length, widths = [...new Set(b.slice(r0).filter(isRow).map((l) => l.split("|").length))];
    const tb = subTables(b)[0], lost = b.slice(r0).filter((l) => isRow(l) && !tb.rows.includes(l)).length;
    console.log(`${id} ${nn} L${at}: ${rowsAfter} dòng, ${later.length} dòng chữ sau dòng đầu, khác tiêu đề đầu ${diff.length}, số ô ${widths.join("/")}, dòng ngoài bảng ${lost}${diff.length ? " | " + diff.slice(0, 2).map((x) => x.slice(0, 70)).join(" ¦ ") : ""}`);
  }
}
