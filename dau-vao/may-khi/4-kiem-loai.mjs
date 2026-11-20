// Kiểm TOÀN BỘ khoá bị loại / vào top giữa gop-goc và gop-nhanh (top30-cloud-2). Chạy: node 4-kiem-loai.mjs  (từ thư mục này)
// Cần worktree wt-khi-fuel ở khi-fuel-2 (c70ce420) để dựng catalog có `fuel` của dòng; bidhist local để đọc nhiên liệu HSMT.
import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib"; import { pathToFileURL } from "node:url";
const WT = "C:/Projects/GenSet Pro/wt-khi-fuel", OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/may-khi";
const BH = "C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json";
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const G = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(OUT, "top30-cloud-2", f))));
const goc = G("gop-goc.json.gz"), nhanh = G("gop-nhanh.json.gz");
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), alts = new Map((full.alternators || []).map((a) => [a.key, a]));
// rowKey -> các giá trị fuel của dòng (một khoá có thể ứng nhiều use)
const rowInfo = new Map();
for (const e of full.engines) for (const u of e.uses) {
  if (!u.line && !u.lines) continue;
  const a = u.other ? B.altOf(alts, u.other) : null;
  const k = `${u.supplierId}|${e.key}|${a?.key || ""}|${CAT.keyOf(u.line || (u.lines?.rows || []).join(" "))}`;
  const v = rowInfo.get(k) || []; v.push({ fuel: u.fuel || "", from: u.fuelFrom || "", why: u.fuelWhy || "", n: u.n, title: u.title || "" }); rowInfo.set(k, v);
}
const docs = Object.values(J(BH).docs).map((x) => x.d).filter(Boolean);
const byNo = new Map(docs.map((d) => [d.notifyNo, d]));
const hsmtFuel = new Map();
const fuelOf = (no) => { if (!hsmtFuel.has(no)) { const d = byNo.get(no); hsmtFuel.set(no, d ? B.fuelOfHsmt(B.technicalPart(d.config?.text || "")) : { fuel: null, stated: false, why: "(không có chữ HSMT)" }); } return hsmtFuel.get(no); };
const tsv = []; const hdr = ["luot", "rowKey", "ncc", "rowFuel", "fuelFrom", "fuelWhy", "hsmtFuel", "hsmtStated", "hsmtWhy", "fuelOff", "verdict"];
tsv.push(hdr.join("\t"));
const cell = new Map(), perNcc = new Map(), bugs = [], seenKeys = new Set(), unknownRow = [];
let removed = 0, removedKeys = new Set();
for (const [luot, g] of Object.entries(goc)) {
  const n = nhanh[luot]; if (!n) continue;
  const no = luot.split("#")[0], hf = fuelOf(no);
  const A = new Set(g.all.map((x) => x[0])), Bn = new Set(n.all.map((x) => x[0]));
  for (const k of A) {
    if (Bn.has(k)) continue;
    removed++; removedKeys.add(k);
    const info = rowInfo.get(k) || [];
    const fs_ = [...new Set(info.map((x) => x.fuel))], first = info[0] || { fuel: "", from: "", why: "" };
    const rowFuel = info.length ? fs_.join("+") : "(?)";
    const off = info.length && info.every((x) => B.fuelOff(hf.fuel, x.fuel));
    const hs = hf.fuel || (hf.stated ? "mixed" : "diesel(mặc định)");
    const verdict = !info.length ? "BUG?: không tìm thấy dòng trong catalog" : !off ? "BUG?: loại nhưng fuelOff=false" : "đúng: dòng khí/xăng, HSMT khác";
    if (verdict.startsWith("BUG")) bugs.push([luot, k, rowFuel, hs]);
    const ncc = k.split("|")[0];
    tsv.push([luot, k.slice(0, 90), ncc, rowFuel, first.from, first.why.slice(0, 160), hs, hf.stated ? "nêu" : "mặc định", (hf.why || "").slice(0, 100), off ? "1" : "0", verdict].join("\t"));
    const c = `${rowFuel} @ ${hs}`; cell.set(c, (cell.get(c) || 0) + 1);
    const p = perNcc.get(ncc) || { keys: new Set(), n: 0, from: new Map(), fuels: new Map() }; p.keys.add(k); p.n++;
    p.from.set(first.from, (p.from.get(first.from) || 0) + 1); p.fuels.set(rowFuel, (p.fuels.get(rowFuel) || 0) + 1); perNcc.set(ncc, p);
  }
}
fs.writeFileSync(path.join(OUT, "4-loai-tung-khoa.tsv"), tsv.join("\n") + "\n");
// vào top
const ent = [["luot", "rowKey", "ncc", "rowFuel", "fuelFrom", "hsmtFuel", "verdict"].join("\t")], entCell = new Map(); let entN = 0; const entKeys = new Set();
for (const [luot, g] of Object.entries(goc)) {
  const n = nhanh[luot]; if (!n) continue;
  const no = luot.split("#")[0], hf = fuelOf(no), hs = hf.fuel || (hf.stated ? "mixed" : "diesel(mặc định)");
  const gt = new Set(g.top);
  for (const k of n.top) {
    if (gt.has(k)) continue;
    entN++; entKeys.add(k);
    const info = rowInfo.get(k) || [], rf = info.length ? [...new Set(info.map((x) => x.fuel))].join("+") : "(?)";
    const bad = info.length && info.every((x) => B.fuelOff(hf.fuel, x.fuel));
    const v = !info.length ? "KHÔNG TÌM THẤY" : bad ? "BUG: dòng sai nhiên liệu vào top" : rf === "" ? "không ghi fuel (HSMT diesel mặc định / nêu)" : "khớp";
    ent.push([luot, k.slice(0, 90), k.split("|")[0], rf || "(trống)", info[0]?.from || "", hs, v].join("\t"));
    const c = `${rf || "(trống)"} @ ${hs}`; entCell.set(c, (entCell.get(c) || 0) + 1);
  }
}
fs.writeFileSync(path.join(OUT, "4-vao-top.tsv"), ent.join("\n") + "\n");
const L = [];
L.push(`khoá loại (cặp khoá×lượt): ${removed}; khoá khác nhau: ${removedKeys.size}; BUG?: ${bugs.length}`);
L.push("== theo ô (rowFuel @ HSMT) =="); for (const [c, n] of [...cell].sort((a, b) => b[1] - a[1])) L.push(`${n}\t${c}`);
L.push("== theo NCC (khoá / lượt, fuelFrom, rowFuel) =="); for (const [k, p] of [...perNcc].sort((a, b) => b[1].n - a[1].n)) L.push(`${k}\t${p.keys.size}/${p.n}\tfrom=${JSON.stringify([...p.from])}\tfuel=${JSON.stringify([...p.fuels])}`);
L.push(`== vào top: ${entN} (khoá khác nhau ${entKeys.size}) ==`); for (const [c, n] of [...entCell].sort((a, b) => b[1] - a[1])) L.push(`${n}\t${c}`);
if (bugs.length) { L.push("== BUG? =="); for (const b of bugs.slice(0, 30)) L.push(b.join("\t")); }
fs.writeFileSync(path.join(OUT, "4-tong.txt"), L.join("\n") + "\n");
console.log(L.join("\n"));
