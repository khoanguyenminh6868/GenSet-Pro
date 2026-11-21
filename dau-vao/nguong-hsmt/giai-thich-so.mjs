// node giai-thich-so.mjs <thư mục đo> (CHỈ ĐỌC): giải thích TOÀN BỘ lượt đổi của đo cloud #1036.
// Vào: gop-goc.json.gz, gop-nhanh.json.gz (cloud), gt-goc.json, gt-nhanh.json (giai-thich-dump), hl-goc.json, hl-nhanh.json (hieu-luc).
// Ra: gt-luot.tsv (mỗi lượt một dòng), gt-top5.tsv (mọi dòng hạng 1–5 gốc ra khỏi top 30), gt-khong-giai-thich.tsv; tóm tắt in màn hình.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const S = process.argv[2];
const Z = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(S, f))).toString("utf8"));
const J = (f) => JSON.parse(fs.readFileSync(path.join(S, f), "utf8"));
const ca = Z("gop-goc.json.gz"), cb = Z("gop-nhanh.json.gz"), ga = J("gt-goc.json"), gb = J("gt-nhanh.json"), ha = J("hl-goc.json"), hb = J("hl-nhanh.json");
const FIELD = { disp: ["minDisp"], maxDisp: ["maxDisp"], cyl: ["minCyl", "cylExact"], prime: ["minPrime"], fuel: ["maxFuel"], fuel75: ["maxFuel75"], fuel50: ["maxFuel50"] };
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const dk = (k) => { const p = k.split("|"); return `${p[0]}|${p[1]}|${p.slice(3).join("|")}`; };
const keys = Object.keys(ga).sort();
let lech = 0;
const count = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const T = { ra: 0, vao: 0, raTag: {}, vaoTag: {}, raKhong: 0, vaoKhong: 0 };
const rows = ["lượt\tđổi tập\tngưỡng đổi (thô)\tngưỡng đổi (hiệu lực)\tra all\tvào all\tra top\tvào top\tra all theo lý do\tvào all theo lý do\tkhông giải thích"], top5 = ["lượt\thạng gốc\tdòng\tsố phận\tlý do\tngưỡng"], no = ["lượt\thướng\tdòng\tnhãn gốc\tnhãn nhánh"];
const nhom = { doiTap: 0, khongDoi: 0, khongDoiVi: {} };
for (const id of keys) {
  const A = ca[id], B = cb[id], a = ga[id], b = gb[id];
  const sa = new Set(A.all.map((x) => x[0])), sb = new Set(B.all.map((x) => x[0]));
  if (!same(A.all.map((x) => x[0]).sort(), a.all.map((x) => x[0]).sort()) || !same(B.all.map((x) => x[0]).sort(), b.all.map((x) => x[0]).sort()) || !same(A.top, a.top) || !same(B.top, b.top)) { lech++; console.log("KHÔNG tái lập:", id); }
  const f0 = Object.keys(ha[id].raw).filter((k) => !same(ha[id].raw[k], hb[id].raw[k])), f1 = Object.keys(ha[id].eff).filter((k) => !same(ha[id].eff[k], hb[id].eff[k]));
  const ra = [...sa].filter((k) => !sb.has(k)), vao = [...sb].filter((k) => !sa.has(k));
  const tb = new Set(B.top), ta = new Set(A.top), raTop = A.top.filter((k) => !tb.has(k)), vaoTop = B.top.filter((k) => !ta.has(k));
  const by = {}, byV = {}; let nk = 0;
  for (const k of ra) {
    const tags = (b.drop[dk(k)] || []).filter((t) => !(a.drop[dk(k)] || []).includes(t));
    const ok = tags.filter((t) => FIELD[t]?.some((f) => f1.includes(f)));
    if (!ok.length) { nk++; T.raKhong++; no.push(`${id}\tra\t${k.slice(0, 120)}\t${(a.drop[dk(k)] || []).join(",")}\t${(b.drop[dk(k)] || []).join(",") || "(không trong dropped)"}`); }
    else for (const t of ok) { count(by, t); count(T.raTag, t); }
    T.ra++;
  }
  for (const k of vao) {
    const tags = (a.drop[dk(k)] || []).filter((t) => !(b.drop[dk(k)] || []).includes(t));
    const ok = tags.filter((t) => FIELD[t]?.some((f) => f1.includes(f)));
    if (!ok.length) { nk++; T.vaoKhong++; no.push(`${id}\tvào\t${k.slice(0, 120)}\t${(a.drop[dk(k)] || []).join(",") || "(không trong dropped)"}\t${(b.drop[dk(k)] || []).join(",")}`); }
    else for (const t of ok) { count(byV, t); count(T.vaoTag, t); }
    T.vao++;
  }
  const doi = ra.length + vao.length + raTop.length + vaoTop.length > 0;
  if (doi) nhom.doiTap++;
  else { nhom.khongDoi++; const v = !f1.length ? "ngưỡng thô đổi nhưng plausible bỏ, ngưỡng hiệu lực không đổi" : "ngưỡng hiệu lực đổi nhưng không dòng nào đổi trạng thái"; count(nhom.khongDoiVi, v); }
  A.top.slice(0, 5).forEach((k, i) => {
    if (tb.has(k)) return;
    const d = b.drop[dk(k)], inAll = sb.has(k);
    const fate = inAll ? "còn trong all, bị đẩy khỏi top" : d ? "bị loại" : "không còn dòng";
    top5.push(`${id}\t${i + 1}\t${k.slice(0, 140)}\t${fate}\t${(d || []).join(",")}\t${f1.map((f) => `${f}: ${JSON.stringify(ha[id].eff[f])} → ${JSON.stringify(hb[id].eff[f])}`).join("; ")}`);
  });
  rows.push([id, doi ? "có" : "không", f0.map((f) => `${f}: ${JSON.stringify(ha[id].raw[f])} → ${JSON.stringify(hb[id].raw[f])}`).join("; "), f1.map((f) => `${f}: ${JSON.stringify(ha[id].eff[f])} → ${JSON.stringify(hb[id].eff[f])}`).join("; "), ra.length, vao.length, raTop.length, vaoTop.length, JSON.stringify(by), JSON.stringify(byV), nk].join("\t"));
}
fs.writeFileSync(path.join(S, "gt-luot.tsv"), rows.join("\n") + "\n");
fs.writeFileSync(path.join(S, "gt-top5.tsv"), top5.join("\n") + "\n");
fs.writeFileSync(path.join(S, "gt-khong-giai-thich.tsv"), no.join("\n") + "\n");
console.log(JSON.stringify({ luot: keys.length, khongTaiLap: lech, ...nhom, ra: T.ra, vao: T.vao, raTheoNhan: T.raTag, vaoTheoNhan: T.vaoTag, raKhongGiaiThich: T.raKhong, vaoKhongGiaiThich: T.vaoKhong, top5Ra: top5.length - 1 }, null, 1));
