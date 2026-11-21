// node nguong-lech.mjs <thư mục code> (CHỈ ĐỌC): gói nhiều cỡ có dòng mất: ngưỡng minDisp / maxDisp / minCyl của lượt nằm ở dòng HSMT của mục nào.
// "lệch" = mọi dòng nêu số đó đều ghi mục có công suất khác cỡ của lượt (ngưỡng của máy khác). Ghi nguong-lech.tsv (chỉ số thông báo, luật, số dòng; không ghi chữ HSMT).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [WT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const lost = new Map();
for (const c of fs.readFileSync(path.join(HERE, "mat-dong.tsv"), "utf8").trim().split("\n").slice(1).map((x) => x.split("\t"))) {
  if (!lost.has(c[0])) lost.set(c[0], []);
  lost.get(c[0]).push(c[5].split(","));
}
const tag = (l) => { const m = l.match(/(\d+(?:[.,]\d+)?)(?:\s*\/\s*\d+(?:[.,]\d+)?)?\s*kva/i); return m ? +m[1].replace(",", ".") : null; };
const forms = (x, cyl) => {
  if (cyl) return [new RegExp(`(^|[^\\d.,])0?${x}\\s*(x[iy]|\\b)`, "i")];
  const s = String(x), c = s.replace(".", ","), cc = String(Math.round(x * 1000));
  return [s, c, cc].map((t) => new RegExp(`(^|[^\\d.,])${t.replace(".", "\\.")}($|[^\\d])`));
};
const out = [], sum = { dung: 0, lech: 0, chua: 0 };
for (const [run, list] of lost) {
  const [no, ri] = run.split("#"), d = byKey.get(no);
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  if (found.length < 2) continue;
  const size = found[+ri], own = size.cap.value, h = B.hintsOf(d.config.text, "", { size, sizes: found });
  const lines = d.config.text.split("\n").filter((l) => /x[iy].?lanh|dung tích/i.test(l));
  const verdict = {};
  for (const [rule, val, cyl] of [["disp", h.minDisp, false], ["maxDisp", h.maxDisp, false], ["cyl", h.minCyl, true]]) {
    if (val == null || !list.some((r) => r.includes(rule))) continue;
    const hit = lines.filter((l) => forms(val, cyl).some((re) => re.test(l)) && (!cyl || /x[iy].?lanh/i.test(l)));
    const tags = hit.map(tag);
    const ownHit = tags.some((t) => t != null && Math.abs(t - own) / own <= 0.25), other = tags.some((t) => t != null && Math.abs(t - own) / own > 0.25), free = tags.some((t) => t == null);
    verdict[rule] = ownHit || free ? "dung" : other ? "lech" : "chua";
  }
  const only = (v) => list.filter((r) => { const on = r.filter((x) => verdict[x]); return on.length > 0 && on.every((x) => verdict[x] === v); }).length;
  const lech = list.filter((r) => { const on = r.filter((x) => verdict[x]); return on.length > 0 && on.every((x) => verdict[x] === "lech") && on.length === r.length; }).length;
  sum.dung += only("dung"); sum.lech += lech; sum.chua += list.length - only("dung") - lech;
  out.push([run, own, found.map((s) => s.cap.value).join("/"), list.length, lech, Object.entries(verdict).map(([k, v]) => `${k}=${k === "cyl" ? h.minCyl : k === "disp" ? h.minDisp : h.maxDisp}:${v}`).join(" ")].join("\t"));
}
fs.writeFileSync(path.join(HERE, "nguong-lech.tsv"), "lượt\tcỡ\tcác cỡ\tdòng mất\tdòng chỉ do ngưỡng lệch\tngưỡng:kết luận\n" + out.join("\n") + "\n");
console.log(out.filter((l) => /lech|chua/.test(l)).join("\n"));
console.log(JSON.stringify(sum), `${out.length} lượt nhiều cỡ`);
const dz = JSON.parse(fs.readFileSync(path.join(HERE, "diem-nhanh.json"), "utf8"));
console.log("mẫu khoá diem:", Object.keys(dz).filter((k) => k.startsWith("sanq-power|") && k.includes("SQY1375")).slice(0, 2).join(" ## ").slice(0, 220));
