// Hình dạng khối "|" của một tệp nguồn: dòng không phải dòng máy in nguyên (cắt 90 ký tự), dãy dòng máy gộp thành "R×k (số ô)".
//   node shape.mjs <gốc repo> <id> <n> [<n> ...]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, id, ...ns] = process.argv.slice(2);
const { isMachineRow } = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const isNumCell = (c) => /\d/.test(c) && c.replace(/[\d.,~\-–/()%\s]|kva|kw|v|hz|rpm|l\/h|mm|kg|db|a\b/gi, "").length <= 3;
const cells = (l) => l.split("|").map((x) => x.trim()).filter(Boolean);
const isData = (l) => { const c = cells(l); return c.filter(isNumCell).length >= Math.max(2, c.length * 0.4); };
const w = (l) => l.split("|").length;
for (const n of ns) {
  const lines = fs.readFileSync(path.join(root, "suppliers", "sources", id, `${n}.md`), "utf8").split(/\r?\n/);
  console.log(`=== ${id} n${n}`);
  let run = 0, rw = new Set();
  const flush = () => { if (run) console.log(`   R×${run} (ô ${[...rw].join("/")})`); run = 0; rw = new Set(); };
  lines.forEach((l, i) => {
    if (!l.startsWith("|")) { flush(); return; }
    if (cells(l).length > 1 && (isData(l) || isMachineRow(l))) { run++; rw.add(w(l)); return; }
    flush();
    console.log(`L${i + 1} [${w(l)}] ${l.slice(0, 90)}`);
  });
  flush();
}
