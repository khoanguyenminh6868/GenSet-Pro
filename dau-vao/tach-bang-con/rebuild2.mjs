// Thay ĐÚNG những bảng mà tablesOf mới đọc khác (cũ → các bảng con mới) trong specs/<id>.json và cn/<id>.json. Bảng khác giữ
// nguyên từng byte; không đụng sources; không cào. Lọc bảng mới như merge-specs (FOREIGN, OTHER, trùng rows).
//   node rebuild2.mjs <gốc cũ> <gốc mới> <id,id,...> [--write]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [oldRoot, newRoot, idArg, flag] = process.argv.slice(2);
const write = flag === "--write";
const load = (r) => import(pathToFileURL(path.join(r, "suppliers", "crawl-specs.mjs")).href);
const O = await load(oldRoot), N = await load(newRoot);
const sup = path.join(newRoot, "suppliers");
const FOREIGN = /[Ѐ-ӿ֐-ۿऀ-෿฀-๿ᄀ-ᇿ぀-ヿ가-힯]/;
const OTHER = /(motor|transformer|pump|compressor|excavator|light(ing)? tower|weld|tractor|truck|vehicle|forklift|load bank|energy storage|bess|solar|inverter|cable|switchgear|fog cannon|agv|mower|washer|\bups\b|uninterrupt|propulsion|wheel loader|agricultur|construction machinery|灯塔|泵|叉车|挖掘|装载|拖拉机|收割)/i;
const GEN = /(generat|genset|gen-set|alternator|power station|发电)/i;
const sig = (t) => JSON.stringify([t.header, t.rows]);
const fmts = (x) => [JSON.stringify(x, null, 1), JSON.stringify(x, null, 1) + "\n", JSON.stringify(x), JSON.stringify(x) + "\n", JSON.stringify(x, null, 2) + "\n"];
let bad = 0;
for (const id of idArg.split(",")) {
  const cnFile = path.join(sup, "cn", `${id}.json`), spFile = path.join(sup, "specs", `${id}.json`);
  const cnText = fs.readFileSync(cnFile, "utf8"), rec = JSON.parse(cnText);
  if (JSON.stringify(rec, null, 2) + "\n" !== cnText) { console.log(`${id}: !! cn/ khác định dạng, bỏ`); bad++; continue; }
  const spText = fs.existsSync(spFile) ? fs.readFileSync(spFile, "utf8") : null, specs = spText ? JSON.parse(spText) : null;
  const spFmt = specs ? fmts(specs).findIndex((x) => x === spText) : -1;
  if (specs && spFmt < 0) { console.log(`${id}: !! specs/ định dạng lạ, bỏ`); bad++; continue; }
  const dir = path.join(sup, "sources", id);
  let replaced = 0, added = 0, missing = 0, skipped = 0;
  for (const f of fs.readdirSync(dir).sort((a, b) => parseInt(a) - parseInt(b))) {
    const m = /^(\d+)\.md$/.exec(f);
    if (!m || +m[1] < 101 || +m[1] > 999) continue;
    const n = +m[1], text = fs.readFileSync(path.join(dir, f), "utf8");
    const a = O.tablesOf(text), b = N.tablesOf(text), sa = new Set(a.map(sig)), sb = new Set(b.map(sig));
    const gone = a.filter((t) => !sb.has(sig(t))), fresh = b.filter((t) => !sa.has(sig(t)));
    if (!gone.length && !fresh.length) continue;
    const apply = (list, label) => {
      const idx = list.map((t, i) => (t.n === n && gone.some((g) => sig(g) === sig(t)) ? i : -1)).filter((i) => i >= 0);
      if (label === "cn") missing += gone.filter((g) => !list.some((t) => t.n === n && sig(t) === sig(g))).length;
      const anchor = idx.length ? idx[0] : list.map((t) => t.n).lastIndexOf(n);
      if (anchor < 0) return false;
      const proto = list[anchor];
      const seen = new Set(list.filter((t, i) => !idx.includes(i)).map((t) => t.rows.join("\n")));
      const ins = [];
      for (const t of fresh) {
        const txt = [proto.title, ...t.header, ...t.rows].join(" "), key = t.rows.join("\n");
        if (FOREIGN.test(txt) || (OTHER.test(proto.title || "") && !GEN.test(proto.title || "")) || seen.has(key)) { if (label === "cn") skipped++; continue; }
        seen.add(key);
        ins.push({ ...proto, header: t.header, rows: t.rows });
      }
      for (const i of [...idx].reverse()) list.splice(i, 1);
      list.splice(idx.length ? idx[0] : anchor + 1, 0, ...ins);
      if (label === "cn") { replaced += idx.length; added += ins.length; }
      return true;
    };
    if (!apply(rec.specTables, "cn")) console.log(`  ${id} n${n}: trang không có bảng trong cn/, bỏ qua`);
    if (specs) apply(specs, "specs");
  }
  console.log(`${id}: thay ${replaced} bảng bằng ${added} bảng; bảng cũ không có trong cn/ ${missing}; bảng mới bị lọc / trùng ${skipped}`);
  if (write) {
    fs.writeFileSync(cnFile, JSON.stringify(rec, null, 2) + "\n", "utf8");
    if (specs) fs.writeFileSync(spFile, fmts(specs)[spFmt], "utf8");
  }
}
console.log(write ? "ĐÃ GHI" : "chạy thử", bad ? `, lỗi ${bad}` : "");
