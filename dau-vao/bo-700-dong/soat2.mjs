// 21 bảng đúng 60 dòng mà lệnh đo chưa tính: đọc lại tệp nguồn bằng code đã bỏ trần, xem còn dòng nào chưa lưu.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const wt = process.argv[2], SUP = path.join(wt, "suppliers");
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const { sheetOf } = await import(pathToFileURL(path.join(SUP, "crawl-datasheets.mjs")).href);
const { tablesOf } = await import(pathToFileURL(path.join(SUP, "crawl-specs.mjs")).href);
const LIST = "aosif/1004 aosif/1034 aosif/1052 aosif/1057 aosif/1085 aosif/1088 aosif/1089 aosif/1108 aosif/1109 aosif/1128 chuangyuan-zhongshan/102 eastern-lion-fuan/110 eastern-lion-fuan/120 haifeng-taizhou/2001 kaihua-genset/120 rise-power/128 shanhua/1017 shanhua/1022 shanhua/1024 shanhua/1038 shanhua/1046".split(" ");
let lost = 0;
for (const x of LIST) {
  const [id, ns] = x.split("/"), n = +ns;
  const rec = JSON.parse(fs.readFileSync(path.join(SUP, "cn", `${id}.json`), "utf8"));
  const t = rec.specTables.find((a) => a.n === n && a.rows.length === 60);
  const raw = fs.readFileSync(path.join(SUP, "sources", id, `${n}.md`), "utf8").replace(/\r/g, "");
  const body = raw.replace(/^URL:.*\nAccessed:.*\n(From:.*\n)?\n?/, "");
  const stored = new Set((rec.specTables || []).filter((a) => a.n === n).flatMap((a) => [...(a.header || []), ...(a.rows || [])]));
  const sheet = sheetOf(body), tabs = tablesOf(raw), sp = tabs.filter((a) => a.sheet).flatMap((a) => a.rows);
  const same = tabs.some((a) => a.rows.length === 60 && a.rows.every((l, i) => l === t.rows[i]));
  const miss = [...new Set([...sheet, ...sp])].filter((l) => !stored.has(l));
  lost += miss.length;
  console.log(`${x}: sheetOf ${sheet.length}, tờ thông số ${sp.length}, bảng thường trùng khớp 60 dòng: ${same ? "có" : "không"}, chưa lưu ${miss.length}`);
}
console.log("Tổng dòng chưa lưu:", lost);
