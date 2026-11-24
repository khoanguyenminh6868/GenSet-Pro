// Buoc 4 kiem ke, phan 2: nhan pho bien nhat ma specKey KHONG nhan (bang cn: dong nhan|gia tri, o tieu de cot, cap nhan|gia tri).
// Doc labels.json. Chay: node nhan-khong-nhan.mjs [--src] → nhan-khong-nhan-bang.tsv (+ -nguon.tsv)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/web/catalog.js").href);
const CAT = globalThis.GenbidCatalog;
const labels = JSON.parse(fs.readFileSync(path.join(OUT, "labels.json"), "utf8"));
const q = (s) => String(s).replace(/[\t\r\n]+/g, " ");
const squash = (n) => n.replace(/[(（\[【][^)）\]】]*[)）\]】]/g, " ").replace(/[*:：]+/g, " ").replace(/\s+/g, " ").trim();

function build(isSrc) {
  const G = new Map();
  for (const e of labels) {
    const [kind] = e.kind.split(":");
    if (kind.startsWith("src") !== isSrc) continue;
    if (e.sk) continue; // da duoc nhan
    if (CAT.isCode(e.raw)) continue;
    const n2 = squash(e.n);
    if (!n2 || n2.length < 2 || n2.length > 48 || n2.split(" ").length > 6) continue;
    if (CAT.specKey(e.raw) || CAT.specKey(n2)) continue; // nhan sau khi bo ngoac thanh duoc nhan => la cung nhan
    let g = G.get(n2);
    if (!g) { g = { n2, lines: 0, models: 0, nccs: new Set(), kinds: {}, ex: [], raw: new Map() }; G.set(n2, g); }
    g.lines += e.lines; g.models += e.models; for (const c of e.nccs) g.nccs.add(c);
    g.kinds[kind] = (g.kinds[kind] || 0) + e.lines;
    g.raw.set(e.raw, (g.raw.get(e.raw) || 0) + e.lines);
    for (const x of e.ex) if (g.ex.length < 3 && !g.ex.some((y) => y.ncc === x.ncc)) g.ex.push(x);
  }
  return [...G.values()].sort((a, b) => b.lines - a.lines);
}

for (const [name, isSrc] of [["bang", false], ["nguon", true]]) {
  const arr = build(isSrc);
  const t = ["hang\tnhan\tdang_viet_phu_bien\tdong\tncc\tmodel_o\tcol/row/pair\tvi_du_1\tvi_du_2\tvi_du_3"];
  arr.slice(0, 1200).forEach((g, i) => {
    const top = [...g.raw.entries()].sort((a, b) => b[1] - a[1])[0][0];
    t.push([i + 1, g.n2, q(top), g.lines, g.nccs.size, g.models, Object.entries(g.kinds).map(([k, v]) => `${k}${v}`).join(" "), ...g.ex.map((x) => q(`${x.ncc} #${x.src}: ${x.line}`.slice(0, 170))), "", ""].slice(0, 10).join("\t"));
  });
  fs.writeFileSync(path.join(OUT, `nhan-khong-nhan-${name}.tsv`), t.join("\n"));
  console.error(name, arr.length, "nhan khac nhau chua nhan");
}
