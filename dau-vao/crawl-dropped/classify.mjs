// Phân loại MỌI dòng máy (isMachineRow) của tệp nguồn crawl (sources/<id>/<n>.md, n 101–999 đang dùng trong hồ sơ) mà không
// nằm trong bảng nào của hồ sơ, theo NGUYÊN NHÂN:
//   W  trong khối có bảng; đứng SAU dòng "đủ số" đầu tiên; tablesOf bỏ vì không đủ số và khác số ô
//   K  khối không có dòng "đủ số" nào (k < 0): cả khối không thành bảng
//   P  khối bị bỏ vì không có chữ công suất (POWER) / ít dòng
//   S  khối quá hẹp ở dòng đầu (dòng mở khối < 4 phần) nên không bắt đầu khối ở đó — nằm ngoài mọi khối
//   T  tablesOf CÓ trả dòng này trong một bảng, nhưng hồ sơ không có: bảng bị merge-specs loại (FOREIGN / OTHER), bị xoá tay,
//      hoặc specs/ lệch nguồn
//   node classify.mjs <gốc repo> <tệp ra .json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, outFile] = process.argv.slice(2);
const { isMachineRow, tablesOf } = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const sup = path.join(root, "suppliers");
const POWER = /\b(k\s?va|kw|kwe|prime|standby|备用|常用|功率)\b/i;
const FOREIGN = /[Ѐ-ӿ֐-ۿऀ-෿฀-๿ᄀ-ᇿ぀-ヿ가-힯]/;
const OTHER = /(motor|transformer|pump|compressor|excavator|light(ing)? tower|weld|tractor|truck|vehicle|forklift|load bank|energy storage|bess|solar|inverter|cable|switchgear|fog cannon|agv|mower|washer|\bups\b|uninterrupt|propulsion|wheel loader|agricultur|construction machinery|灯塔|泵|叉车|挖掘|装载|拖拉机|收割)/i;
const GEN = /(generat|genset|gen-set|alternator|power station|发电)/i;
const isNumCell = (c) => /\d/.test(c) && c.replace(/[\d.,~\-–/()%\s]|kva|kw|v|hz|rpm|l\/h|mm|kg|db|a\b/gi, "").length <= 3;
const isData = (l) => { const c = l.split("|").map((x) => x.trim()).filter(Boolean); return c.filter(isNumCell).length >= Math.max(2, c.length * 0.4); };
const out = [];
for (const f of fs.readdirSync(path.join(sup, "cn")).filter((f) => f.endsWith(".json")).sort()) {
  const rec = JSON.parse(fs.readFileSync(path.join(sup, "cn", f), "utf8"));
  const tabs = (rec.specTables || []).filter((t) => t.n >= 101 && t.n <= 999);
  if (!tabs.length) continue;
  const have = new Set(tabs.flatMap((t) => [...(t.header || []), ...(t.rows || [])]));
  const specFile = path.join(sup, "specs", f);
  const specs = fs.existsSync(specFile) ? JSON.parse(fs.readFileSync(specFile, "utf8")) : [];
  const seen = new Set();
  for (const n of [...new Set(tabs.map((t) => t.n))].sort((a, b) => a - b)) {
    const file = path.join(sup, "sources", rec.id, `${n}.md`);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8"), lines = text.split(/\r?\n/);
    const tOf = tablesOf(text), inT = new Set(tOf.flatMap((t) => [...t.header, ...t.rows]));
    const title = (specs.find((t) => t.n === n) || {}).title || "";
    for (let i = 0; i < lines.length;) {
      // khối như tablesOf: bắt đầu ở dòng "|" có ≥ 4 phần, kéo tới hết dòng "|" có ≥ 3 phần
      const starts = lines[i].startsWith("|") && lines[i].split("|").length >= 4;
      let j = i;
      if (starts) while (j < lines.length && lines[j].startsWith("|") && lines[j].split("|").length >= 3) j++; else j = i + 1;
      const block = starts ? lines.slice(i, j) : [lines[i]];
      const k = starts ? block.findIndex(isData) : -1;
      block.forEach((l, bi) => {
        if (!l.startsWith("|") || have.has(l) || !isMachineRow(l) || seen.has(l)) return;
        seen.add(l);
        let cat, why = "";
        if (inT.has(l)) {
          cat = "T";
          const inSpecs = specs.some((t) => [...t.header, ...t.rows].includes(l));
          const st = specs.filter((t) => [...t.header, ...t.rows].includes(l));
          const foreign = st.some((t) => FOREIGN.test([t.title, ...t.header, ...t.rows].join(" ")));
          const other = st.some((t) => OTHER.test(t.title) && !GEN.test(t.title));
          why = !inSpecs ? "không có trong specs/ (specs lệch nguồn, hoặc bảng xoá tay ở cả hai)" : foreign ? "merge-specs loại: chữ ngôn ngữ khác (FOREIGN)" : other ? "merge-specs loại: sản phẩm khác (OTHER)" : "có trong specs/, không có trong cn/ (bảng xoá tay ở cn/ hoặc chưa gộp)";
        } else if (!starts) { cat = "S"; why = "ngoài mọi khối"; }
        else if (k < 0) { cat = "K"; why = "khối không có dòng đủ số"; }
        else {
          const w = block[k].split("|").length;
          const rows = block.slice(k).filter((x) => isData(x) || (w >= 4 && x.split("|").length === w));
          if (rows.length < 2 && !POWER.test(block.join(" "))) { cat = "P"; why = "khối < 2 dòng và không có chữ công suất"; }
          else if (!POWER.test(block.slice(0, k).join(" ") + rows.join(" "))) { cat = "P"; why = "khối không có chữ công suất"; }
          else { cat = "W"; why = `khác số ô: dòng ${l.split("|").length - 1} ô, dòng chuẩn ${w - 1} ô`; }
        }
        out.push({ sid: rec.id, n, line: i + bi + 1, cat, why, title, blockStart: i + 1, blockLen: block.length, text: l });
      });
      i = j;
    }
  }
}
fs.writeFileSync(outFile, JSON.stringify(out, null, 1), "utf8");
const tally = (key) => { const m = new Map(); for (const x of out) m.set(key(x), (m.get(key(x)) || 0) + 1); return [...m].sort((a, b) => b[1] - a[1]); };
console.log(`tổng dòng máy ngoài bảng: ${out.length}, ${new Set(out.map((x) => x.sid)).size} NCC`);
console.log("theo nguyên nhân:", tally((x) => x.cat).map(([k, v]) => `${k} ${v}`).join(", "));
console.log("chi tiết:"); for (const [k, v] of tally((x) => `${x.cat} | ${x.why.replace(/dòng \d+ ô, dòng chuẩn \d+ ô/, "…")}`)) console.log(`  ${String(v).padStart(5)}  ${k}`);
console.log("\ntheo NCC (W / K / P / S / T):");
for (const [sid, v] of tally((x) => x.sid)) { const c = (q) => out.filter((x) => x.sid === sid && x.cat === q).length; console.log(`  ${sid.padEnd(26)} ${String(v).padStart(4)} = W ${c("W")}, K ${c("K")}, P ${c("P")}, S ${c("S")}, T ${c("T")}`); }
