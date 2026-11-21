// #1022 đo lần 2: mọi dòng còn mất có luật `layout` ở gói nhiều cỡ: bố trí xi lanh có nằm trong phần của đúng cỡ không. Chữ HSMT chỉ in ra màn hình.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
process.env.GENBID_SPEC_NORM = "1";
const D = process.argv[2], HERE = import.meta.dirname, R = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-tieu-hao/suppliers/config-bot.mjs").href);
const T1 = R(path.join(HERE, "giai-thich-2.json")), T3 = R(path.join(D, "giai-thich-3.json")), J = R(path.join(D, "doi-chieu-2.json")), docs = R("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const byNo = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo && d.config?.text).map((d) => [d.notifyNo, d]));
const cut = (s) => { const i = s.indexOf("\t"); return s.slice(0, i + 121); }, id = (x) => `${x.run}\t${x.k}`, gone = new Set(J.goneLost.map(cut)), seen = new Set(), rows = [];
for (const x of [...T3.lost, ...T1.lost.filter((y) => !gone.has(id(y)))]) if (x.ruled.includes("layout") && !seen.has(id(x))) { seen.add(id(x)); rows.push(x); }
console.log("Dòng còn mất có luật layout:", rows.length);
for (const run of [...new Set(rows.map((x) => x.run))]) {
  const [no, ri] = run.split("#"), d = byNo.get(no), kv = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), f = B.sizesOf([kv, d.bidName], d.bidName), rr = rows.filter((x) => x.run === run);
  const s = f.length > 1 ? f[+ri] : null, L = d.config.text.split("\n"), blocks = s ? B.minsForSize(d.config.text, s, f).blocks : [], j = s ? f.indexOf(s) : -1, own = s ? L.filter((_, i) => blocks.some((b) => b.size === j && i + 1 >= b.from && i + 1 < b.to)).join("\n") : d.config.text;
  const pat = /th[ẳa]ng\s*h[àa]ng|in[-\s]*line|ch[ữu]\s*V\b|h[ìi]nh\s*V\b|ki[ểe]u\s*V\b|V[-\s]*type|V-?\d{1,2}\b/gi, hit = [...own.matchAll(pat)].slice(0, 2).map((m) => own.slice(Math.max(0, m.index - 40), m.index + 22).replace(/\s+/g, " "));
  console.log(`${run} cỡ ${f.map((x) => x.cap.value).join("/")} | ${rr.length} dòng ${[...new Set(rr.map((x) => x.model))].join(", ")} | luật ${[...new Set(rr.map((x) => x.ruled.join("+")))].join(" ; ")} | layout HSMT ${rr[0].lim.cylLayout} | trong phần của cỡ: ${hit.length ? hit.map((h) => "«" + h + "»").join(" ") : "KHÔNG CÓ"}`);
}
