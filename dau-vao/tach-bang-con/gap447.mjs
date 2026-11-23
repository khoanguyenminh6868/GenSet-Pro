// Phần chênh 447 bảng / 66 NCC (luật thử không lưu) ↔ 217 bảng / 41 NCC (luật hiện tại).
// Luật thử không còn nên KHÔNG dựng lại được đúng số 447: ở đây quét mọi khối "|" bằng luật LỎNG (mọi dòng không phải dòng máy,
// nằm sau dòng máy, có ô trùng tiêu đề) và xếp từng khối theo lý do luật hiện tại tách hay không tách.
//   node gap447.mjs <gốc repo> <thư mục ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, outDir] = process.argv.slice(2);
process.argv.length = 2;
const { subTables, isMachineRow, tablesOf } = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const cells = (l) => l.split("|").map((x) => x.trim()).filter(Boolean);
const norm = (c) => c.toLowerCase().replace(/\s+/g, "");
const isNum = (c) => /\d/.test(c) && c.replace(/[\d.,~\-–/()%\s]|kva|kw|v|hz|rpm|l\/h|mm|kg|db|a\b/gi, "").length <= 3;
const isData = (l) => { const c = cells(l); return c.filter(isNum).length >= Math.max(2, c.length * 0.4); };
const isRow = (l) => cells(l).length > 1 && (isData(l) || isMachineRow(l));
const SRC = path.join(root, "suppliers", "sources");
const blocksOf = (text) => {
  const L = text.split(/\r?\n/), out = [];
  for (let i = 0; i < L.length;) {
    if (!L[i].startsWith("|") || L[i].split("|").length < 4) { i++; continue; }
    let j = i; while (j < L.length && L[j].startsWith("|") && L[j].split("|").length >= 3) j++;
    out.push(L.slice(i, j)); i = j;
  }
  return out;
};
// Dòng lặp tiêu đề theo luật lỏng: lý do nó không đạt luật hiện tại (rỗng = đạt).
const repeats = (b) => {
  const seen = new Set(); let head = true, most = 0; const hits = [];
  for (const l of b) {
    if (isRow(l)) { head = false; continue; }
    const c = cells(l).map(norm);
    if (head) { for (const x of c) seen.add(x); most = Math.max(most, c.length); continue; }
    const same = c.filter((x) => seen.has(x)).length;
    if (!same) continue;
    const why = c.length < 3 ? "dưới 3 ô" : same < c.length * 0.6 ? "trùng dưới 60 % ô" : c.length < most * 0.6 ? "hẹp dưới 60 % tiêu đề" : "";
    hits.push({ l, why });
  }
  return hits;
};
fs.mkdirSync(outDir, { recursive: true });
const cls = new Map(), detail = [];
const add = (c, id, rows, ex) => { const e = cls.get(c) || { blocks: 0, ncc: new Set(), rows: 0 }; e.blocks++; e.ncc.add(id); e.rows += rows; cls.set(c, e); detail.push(`${c}\t${ex}`); };
let files = 0;
for (const id of fs.readdirSync(SRC)) {
  const dir = path.join(SRC, id); if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    // Cùng tập tệp với measure.mjs: trang crawl-specs (101–999).
    if (!/^\d+\.md$/.test(f) || +f.replace(".md", "") < 101 || +f.replace(".md", "") > 999) continue; files++;
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    for (const b of blocksOf(text)) {
      const h = repeats(b); if (!h.length) continue;
      const rows = b.filter(isRow).length, parts = subTables(b), ex = `${id} n${f.replace(".md", "")}\t${rows} dòng\t${h[0].l.slice(0, 90)}`;
      if (parts.length > 1) add("1. luật hiện tại TÁCH", id, rows, ex);
      else if (!parts.length) add("2. khối không phải bảng công suất", id, rows, ex);
      else if (h.every((x) => x.why)) add(`3. không tách: ${[...new Set(h.map((x) => x.why))].sort().join(" + ")}`, id, rows, ex);
      else if (rows < 2) add("4. có dòng lặp đạt luật nhưng dưới 2 dòng máy", id, rows, ex);
      else add("5. DÒNG LẶP ĐẠT LUẬT MÀ KHÔNG TÁCH (chốt giữ nguyên khối hoặc lặp ở cuối)", id, rows, ex);
    }
  }
}
const lines = [`tệp nguồn: ${files}`, ...[...cls].sort().map(([c, e]) => `${c}\t${e.blocks} khối\t${e.ncc.size} NCC\t${e.rows} dòng máy`)];
const all = [...cls.values()];
lines.push(`luật lỏng, tổng: ${all.reduce((s, e) => s + e.blocks, 0)} khối, ${new Set(all.flatMap((e) => [...e.ncc])).size} NCC`);
fs.writeFileSync(path.join(outDir, "gap.txt"), lines.join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "gap-detail.tsv"), detail.sort().join("\n") + "\n", "utf8");
console.log(lines.join("\n"));
