// Đếm (không sửa) bảng / bản ghi có dấu hiệu MÁY KHÍ đang được đọc như máy thường (nhánh catalog-a).
// Dấu hiệu, mỗi bảng ghi những dấu hiệu nó có:
//   chu  : chữ "燃气 / 沼气 / 天然气 / natural gas / gas generator|engine|set / biogas / LPG / CNG" trong tên bảng, tiêu đề, dòng
//   url  : URL trang nguồn (sources/<id>/<n>.md) có "gas" / "ranqi" / "biogas" / "lpg"
//   ng   : ô đầu của dòng (model tổ máy) đuôi "-NG" / "NG"
//   dongco: model động cơ của bản ghi dạng động cơ khí đã biết: Cummins K19N / K38N / K50N / QSK..G / QSV, Scania OC.., "..N-G.."
// node 7-may-khi.mjs > may-khi.tsv (tóm tắt ra stderr)
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const ROOT = "../../../../wt-catalog-a";
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog, dir = path.join(ROOT, "suppliers", "cn"), src = path.join(ROOT, "suppliers", "sources");
const WORD = /燃气|沼气|天然气|natural\s*gas|\bgas\s+(gen|engine|set)|\bbiogas\b|\bLPG\b|\bCNG\b/i;
const ENG = /^(K19N|K38N|K50N|QSK\d+G|QSV\d|OC\d{2}\b|OC\s?\d{2}\s)|N-G\d/i;
// bảng có dấu hiệu cấp bảng (chu/url/ng): đếm MỌI bản ghi của bảng; chỉ "dongco": đếm bản ghi động cơ khí đó.
const out = ["ncc\tn\tbang\tdau-hieu\tban-ghi\tvi-du-model\ttieu-de-bang"], bySup = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); if (s.status === "incomplete") continue;
  const recs = C.fromSupplier(s);
  const urlOf = (n) => { try { return (fs.readFileSync(path.join(src, s.id, n + ".md"), "utf8").match(/^URL:\s*(\S+)/m) || [])[1] || ""; } catch { return ""; } };
  (s.specTables || []).forEach((t, ti) => {
    const lines = [...(t.header || []), ...(t.rows || [])];
    const own = recs.filter((o) => o.table === ti && o.n === t.n);
    const sig = [];
    if (WORD.test(`${t.title || ""} ${lines.join(" ")}`)) sig.push("chu");
    if (/gas|ranqi|biogas|lpg/i.test(urlOf(t.n))) sig.push("url");
    if (lines.some((l) => /-?NG$/.test(C.cellsOf(l)[0] || "") && /\d/.test(C.cellsOf(l)[0] || ""))) sig.push("ng");
    const gasEng = own.filter((o) => o.kind === "engine" && ENG.test(o.model));
    if (gasEng.length) sig.push("dongco");
    if (!sig.length || !own.length) return;
    const tableSig = sig.some((x) => x !== "dongco");
    const cnt = tableSig ? own.length : gasEng.length;
    const b = (bySup[s.id] = bySup[s.id] || { bang: 0, banGhi: 0, sig: {} });
    b.bang++; b.banGhi += cnt; for (const x of sig) b.sig[x] = (b.sig[x] || 0) + 1;
    out.push([s.id, t.n, ti, sig.join(","), tableSig ? own.length : gasEng.length + " (chỉ bản ghi động cơ khí)", [...new Set(own.map((o) => o.model))].slice(0, 4).join(" / "), String(t.title || "").slice(0, 80)].join("\t"));
  });
}
fs.writeFileSync("may-khi.tsv", out.join("\n") + "\n");
const rows = Object.entries(bySup).sort((a, b) => b[1].banGhi - a[1].banGhi);
let T = [0, 0];
for (const [k, v] of rows) { console.log(`| ${k} | ${v.bang} | ${v.banGhi} | ${Object.entries(v.sig).map(([a, n]) => a + " " + n).join(", ")} |`); T[0] += v.bang; T[1] += v.banGhi; }
console.log("TỔNG", rows.length, "NCC", T[0], "bảng", T[1], "bản ghi");
