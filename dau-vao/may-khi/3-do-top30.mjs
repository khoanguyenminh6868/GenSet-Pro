// Đo: dòng máy khí / xăng (dong-khi.json, từ 2-phan-loai.mjs) nằm trong `all` và `top` của gop-goc.json.gz (main 875e3d6a, 1.093 lượt).
//   node 3-do-top30.mjs <gốc repo origin/main> <gop-goc.json.gz> <thư mục ra>
// Khoá lượt: supplierId|engineKey|altKey|keyOf(dòng). Ghép bỏ altKey: supplierId|engineKey|keyOf(dòng).
import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib"; import vm from "node:vm"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const [ROOT, GZ, OUT] = process.argv.slice(2);
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const units = JSON.parse(fs.readFileSync(path.join(here, "dong-khi.json"), "utf8"));
const map = new Map(); // `${sup}|${ekey}|${tail}` -> {cls, id, n, model}
for (const u of units) { const [sup, ek, ...rest] = u.kl.split("|"); const k = `${sup}|${ek}|${rest.join("|")}`; if (!map.has(k)) map.set(k, []); map.get(k).push(u); }
const gop = JSON.parse(zlib.gunzipSync(fs.readFileSync(GZ)).toString("utf8"));
const norm = (rk) => { const p = rk.split("|"); return `${p[0]}|${p[1]}|${p.slice(3).join("|")}`; };
const lookup = (rk) => map.get(norm(rk));
const runs = Object.keys(gop), CLS = ["khi", "xang", "xang_khi", "khong_ro", "diesel_nham"];
const stat = Object.fromEntries(CLS.map((c) => [c, { all: 0, allRuns: new Set(), top: 0, topRuns: new Set(), topBids: new Set(), allBids: new Set(), rows: new Set(), topRows: new Set() }]));
const topHits = [], allHits = {};
let nTop = 0, nAll = 0;
for (const run of runs) {
  const r = gop[run]; if (r.error) continue; const bid = run.split("#")[0];
  nTop += r.top.length; nAll += r.all.length;
  r.all.forEach(([rk, sc], i) => { const us = lookup(rk); if (!us) return; for (const c of new Set(us.map((u) => u.cls))) { const s = stat[c]; s.all++; s.allRuns.add(run); s.allBids.add(bid); s.rows.add(norm(rk)); } });
  r.top.forEach((rk, i) => { const us = lookup(rk); if (!us) return; const cls = [...new Set(us.map((u) => u.cls))]; for (const c of cls) { const s = stat[c]; s.top++; s.topRuns.add(run); s.topBids.add(bid); s.topRows.add(norm(rk)); }
    const u = us[0]; topHits.push({ run, bid, rank: i + 1, score: r.topScore[i], top: r.top.length, cls: cls.join("+"), id: u.id, n: u.n, ti: u.ti, model: u.model, ekey: u.ekey, key: rk.slice(0, 160) }); });
}
// thứ hạng trong `all`: vị trí theo điểm giảm dần (all đã theo thứ tự của candidates)
const out = { tong: { luot: runs.length, loi: runs.filter((r) => gop[r].error).length, dongTop: nTop, dongAll: nAll } };
for (const c of CLS) { const s = stat[c]; out[c] = { all: s.all, allLuot: s.allRuns.size, allGoi: s.allBids.size, allDongRieng: s.rows.size, top: s.top, topLuot: s.topRuns.size, topGoi: s.topBids.size, topDongRieng: s.topRows.size }; }
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "do-top30.json"), JSON.stringify(out, null, 1));
const tsv = ["luot\tgoi\thang\tdiem\tsodong-top\tlop\tncc\tn\tmodel-dongco\tkhoa"];
for (const h of topHits.sort((a, b) => a.cls.localeCompare(b.cls) || a.bid.localeCompare(b.bid) || a.rank - b.rank)) tsv.push([h.run, h.bid, h.rank, h.score, h.top, h.cls, h.id, h.n, h.model, h.key].join("\t"));
fs.writeFileSync(path.join(OUT, "top30-khi-xang.tsv"), tsv.join("\n") + "\n");
// danh sách `all` nhưng không `top`, gọn: theo lớp / ncc / số lượt
const agg = {};
for (const run of runs) { const r = gop[run]; if (r.error) continue; const inTop = new Set(r.top);
  r.all.forEach(([rk, sc]) => { const us = lookup(rk); if (!us) return; const c = us[0].cls; if (c === "diesel_nham") return; const k = `${c}\t${us[0].id}\t${us[0].n}\t${us[0].model}`; const a = (agg[k] = agg[k] || { luot: new Set(), top: new Set(), best: -1e9, bestRank: 1e9 }); a.luot.add(run); if (inTop.has(rk)) a.top.add(run); a.best = Math.max(a.best, sc); }); }
const al = ["lop\tncc\tn\tmodel-dongco\tluot-trong-all\tluot-trong-top\tdiem-cao-nhat"];
for (const [k, a] of Object.entries(agg).sort((x, y) => y[1].top.size - x[1].top.size || y[1].luot.size - x[1].luot.size)) al.push([k, a.luot.size, a.top.size, a.best].join("\t"));
fs.writeFileSync(path.join(OUT, "all-theo-dong-khi-xang.tsv"), al.join("\n") + "\n");
console.log(JSON.stringify(out, null, 1)); console.log("lần lọt top (khí+xăng+không rõ):", topHits.filter((h) => !h.cls.includes("diesel_nham") || h.cls !== "diesel_nham").length);
