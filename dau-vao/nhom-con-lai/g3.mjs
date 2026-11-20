// Nhóm 3: 29 bảng A (đầu phát rời) / E (động cơ rời) của catalog-c (chỉ số bảng ti theo dem-g.mjs). node g3.mjs all.json
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const L = [];
const set = (cls, sid, tis) => tis.forEach((ti) => L.push({ cls, sid, ti }));
set("A", "eastern-lion-fuan", [58]); set("A", "gordon-power", [17]); set("A", "jet-power", [16]); set("A", "keliang-fuan", [4, 6]);
set("A", "landtop-fuzhou", [2, 3]); set("A", "lanzhou-electric", [0]); set("A", "longkai-power", [3]); set("A", "nenjo-generator", [0, 6]);
set("A", "shengfeng-fuan", [2, 4, 7]); set("A", "xinhengxin-fujian", [7, 9, 17]); set("A", "yihua-fujian", [4]); set("A", "yingtai-jiangsu", [27, 28]);
set("E", "kangjin-power", [0, 1]); set("E", "penlucky", [7, 8, 9]); set("E", "rise-power", [34]); set("E", "yingtai-jiangsu", [1, 34]); set("E", "zhengdian-zhengzhou", [2]);
const out = [];
for (const x of L) {
  const t = T[x.sid + "|" + x.ti];
  if (!t) { out.push({ ...x, missing: true }); continue; }
  const codes = t.rows.map((r) => r.split("|").map((c) => c.trim()).filter(Boolean)[0]);
  const reasons = {}; for (const n of t.notes) reasons[n.reason] = (reasons[n.reason] || 0) + 1;
  out.push({ ...x, n: t.n, status: t.status, role: t.role, title: t.title, nrows: t.nrows, recs: t.recs.length, header: t.header, ex: t.rows.slice(0, 2), firstCodes: [...new Set(codes)].length, reasons });
}
fs.writeFileSync("g3.json", JSON.stringify(out, null, 1));
for (const o of out) console.log(o.cls, o.sid, "n" + o.n, "b" + o.ti, o.role, o.nrows, "rec", o.recs, "|", (o.title || "").slice(0, 60), "|", (o.header || []).join(" // ").slice(0, 150), "\n   ", (o.ex || []).join(" // ").slice(0, 200), JSON.stringify(o.reasons));
console.log("bảng", out.length, "dòng", out.reduce((a, o) => a + (o.nrows || 0), 0));
