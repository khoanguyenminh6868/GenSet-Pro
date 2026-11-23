// Thêm bảng MỚI của tablesOf (newtabs.json) vào specs/<id>.json và cn/<id>.json, kiểu CHỈ-THÊM: bảng đang có giữ nguyên,
// bảng mới chèn ngay sau bảng cuối cùng cùng n. Lọc như merge-specs (FOREIGN, OTHER, trùng rows). Không đụng sources.
//   node rebuild.mjs <gốc repo> <newtabs.json> [--write]
import fs from "node:fs";
import path from "node:path";
const [root, file, flag] = process.argv.slice(2);
const write = flag === "--write";
const sup = path.join(root, "suppliers");
const FOREIGN = /[Ѐ-ӿ֐-ۿऀ-෿฀-๿ᄀ-ᇿ぀-ヿ가-힯]/;
const OTHER = /(motor|transformer|pump|compressor|excavator|light(ing)? tower|weld|tractor|truck|vehicle|forklift|load bank|energy storage|bess|solar|inverter|cable|switchgear|fog cannon|agv|mower|washer|\bups\b|uninterrupt|propulsion|wheel loader|agricultur|construction machinery|灯塔|泵|叉车|挖掘|装载|拖拉机|收割)/i;
const GEN = /(generat|genset|gen-set|alternator|power station|发电)/i;
const all = JSON.parse(fs.readFileSync(file, "utf8"));
const ids = [...new Set(all.map((t) => t.id))];
let added = 0, rows = 0;
for (const id of ids) {
  const cnFile = path.join(sup, "cn", `${id}.json`), spFile = path.join(sup, "specs", `${id}.json`);
  if (!fs.existsSync(cnFile)) { console.log(`${id}: KHÔNG có hồ sơ cn/ → bỏ ${all.filter((t) => t.id === id).length} bảng`); continue; }
  const cnText = fs.readFileSync(cnFile, "utf8"), rec = JSON.parse(cnText);
  const spText = fs.existsSync(spFile) ? fs.readFileSync(spFile, "utf8") : null, specs = spText ? JSON.parse(spText) : null;
  if (JSON.stringify(rec, null, 2) + "\n" !== cnText) console.log(`${id}: !! cn/ không đúng định dạng JSON thụt 2`);
  const spFmt = spText == null ? null : [JSON.stringify(specs, null, 1), JSON.stringify(specs, null, 1) + "\n", JSON.stringify(specs), JSON.stringify(specs) + "\n", JSON.stringify(specs, null, 2) + "\n"].findIndex((x) => x === spText);
  if (spText != null && spFmt < 0) console.log(`${id}: !! specs/ định dạng lạ`);
  const seen = new Set((rec.specTables || []).map((t) => t.rows.join("\n")));
  let a = 0, r = 0;
  for (const t of all.filter((x) => x.id === id)) {
    const tag = `${id} n${t.n} L${t.at} (${t.rows.length} dòng)`;
    const sameN = (rec.specTables || []).filter((x) => x.n === t.n);
    if (!sameN.length) { console.log(`  BỎ ${tag}: trang n${t.n} không có bảng nào trong hồ sơ (trang chưa gộp / đã bị loại)`); continue; }
    const title = sameN[0].title;
    if (sameN.some((x) => x.title !== title)) console.log(`  !! ${tag}: các bảng cùng n có tên khác nhau`);
    const text = [title, ...t.header, ...t.rows].join(" ");
    if (FOREIGN.test(text)) { console.log(`  BỎ ${tag}: chữ ngôn ngữ khác (FOREIGN)`); continue; }
    if (OTHER.test(title) && !GEN.test(title)) { console.log(`  BỎ ${tag}: sản phẩm khác (OTHER): ${title}`); continue; }
    const key = t.rows.join("\n");
    if (seen.has(key)) { console.log(`  BỎ ${tag}: trùng nguyên dòng với bảng đã có`); continue; }
    seen.add(key);
    const tab = { n: t.n, title, header: t.header, rows: t.rows };
    const at = rec.specTables.map((x) => x.n).lastIndexOf(t.n);
    rec.specTables.splice(at + 1, 0, tab);
    if (specs) { const s = specs.map((x) => x.n).lastIndexOf(t.n); if (s < 0) console.log(`  !! ${tag}: specs/ không có n${t.n}`); else specs.splice(s + 1, 0, { ...specs[s], header: t.header, rows: t.rows }); }
    a++; r += t.rows.length;
  }
  console.log(`${id}: thêm ${a} bảng, ${r} dòng${specs ? "" : " (không có specs/)"}`);
  added += a; rows += r;
  if (write && a) {
    fs.writeFileSync(cnFile, JSON.stringify(rec, null, 2) + "\n", "utf8");
    if (specs && spFmt >= 0) fs.writeFileSync(spFile, [JSON.stringify(specs, null, 1), JSON.stringify(specs, null, 1) + "\n", JSON.stringify(specs), JSON.stringify(specs) + "\n", JSON.stringify(specs, null, 2) + "\n"][spFmt], "utf8");
  }
}
console.log(`TỔNG: thêm ${added} bảng, ${rows} dòng${write ? " (ĐÃ GHI)" : " (chạy thử)"}`);
