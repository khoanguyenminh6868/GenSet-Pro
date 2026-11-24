// Đo top 30 "Gợi ý cấu hình" cho mọi gói thầu máy phát trong bidhist (bản đo "gộp" gốc chạy trên máy Khoa, chép sang để chạy được trên cloud).
//   node suppliers/do-gop.mjs <thư mục code> <thư mục cn dữ liệu> <out.json> [--bidhist <tệp>] [--save-bidhist <tệp>]
// Không --bidhist: đọc bidhist qua API của bot (cùng điểm cuối với config-bot.mjs allDocs mà gaps.mjs dùng); --save-bidhist lưu bản vừa tải để gốc và
// nhánh dùng CHUNG một bản. Tệp bidhist là chữ HSMT: KHÔNG commit (repo công khai), lưu ngoài repo.
// Phần tính giữ nguyên bản gốc để so được với kết quả trên máy; chỉ phần nạp dữ liệu đổi. Metadata (commit code, số gói, thời điểm
// tải bidhist) ghi ở stderr và <out>.meta.json, không chèn vào <out.json>.
// Token: không đọc, in hay ghi ở đây (xem chú thích ở readBidhist và suppliers/CLAUDE.md, mục "Đo top 30 trên cloud").
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const flag = (n) => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; };
const pos = []; for (let i = 2; i < process.argv.length; i++) { if (process.argv[i].startsWith("--")) i++; else pos.push(process.argv[i]); }
const [WT, CN, OUT] = pos;
if (!WT || !CN || !OUT) { console.error("dùng: node suppliers/do-gop.mjs <thư mục code> <thư mục cn> <out.json> [--bidhist <tệp>] [--save-bidhist <tệp>]"); process.exit(2); }
const BIDHIST = flag("bidhist"), SAVE = flag("save-bidhist");
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const lib = path.join(WT, "suppliers", "row-flags-lib.mjs");
const RF = fs.existsSync(lib) ? await import(pathToFileURL(lib).href) : null;
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
let commit = "?";
try { commit = execFileSync("git", ["-C", WT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch {}
// Đọc bidhist qua /api/requests như config-bot.allDocs, nhưng KHÔNG gửi header Authorization: proxy của môi trường cloud tự gắn
// token cho host này (node phải chạy với NODE_USE_ENV_PROXY=1 để fetch đi qua proxy; thiếu thì web trả 401) (allDocs của bot gửi token đọc từ tệp, tệp không có ở cloud; giá trị giả bị web trả 401). Chỉ ĐỌC.
const WEB = process.env.GENBID_WEB || "https://genset-pro-web.vercel.app";
async function get(q) {
  for (let i = 0; ; i++) {
    try { const r = await fetch(`${WEB}/api/requests?${q}`); if (!r.ok) throw new Error(`${q.slice(0, 60)}: HTTP ${r.status}`); return await r.json(); }
    catch (e) { if (i >= 3) throw e; await new Promise((ok) => setTimeout(ok, 2000 * 2 ** i)); }
  }
}
async function readBidhist() {
  const stamps = await get("kind=stamps&coll=bidhist"), out = {};
  if (!Array.isArray(stamps) || !stamps.length) throw new Error("bidhist: không đọc được danh sách");
  const ids = stamps.map((s) => s.id);
  for (let i = 0; i < ids.length; i += 100) for (const d of await get(`kind=docs&coll=bidhist&ids=${ids.slice(i, i + 100).map(encodeURIComponent).join(",")}`)) out[d.id] = { d: d.data };
  if (ids.some((id) => !out[id])) throw new Error("bidhist: thiếu doc sau khi đọc theo id");
  return out;
}
let docs, fetchedAt;
if (BIDHIST) { docs = J(BIDHIST).docs; fetchedAt = J(BIDHIST).fetchedAt || fs.statSync(BIDHIST).mtime.toISOString(); }
else {
  fetchedAt = new Date().toISOString();
  docs = await readBidhist();
  if (SAVE) fs.writeFileSync(SAVE, JSON.stringify({ fetchedAt, docs }));
}
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const t0 = Date.now();
const blocked = RF ? RF.blockedRows(sups, {}) : null;
console.error(`blocked: ${blocked ? blocked.size : "không có"} (${Date.now() - t0} ms)`);
const hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
console.error(`code: ${commit}\nbidhist tải lúc: ${fetchedAt} (${Object.keys(docs).length} doc)\ngói: ${hist.length}, NCC: ${sups.length}`);
const full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
function catFor(origin, sync, partsOnly, brand) {
  const k = [origin, !!sync, partsOnly, brand].join("|");
  if (!cache.has(k)) {
    const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
    const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
    const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
    cache.set(k, { cat, facts });
  }
  return cache.get(k);
}
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const out = {};
let i = 0;
for (const d of hist) {
  if (++i % 100 === 0) console.error(i);
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  // The HSMT text tells what each bare figure of `kvas` is (standby, maximum, engine): sizesOf context.
  const found = B.sizesOf([kvaText, d.bidName], d.bidName, text);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, ...(blocked ? { blocked } : {}) });
      out[`${key}#${ri}`] = {
        top: R.top.map(rowKey), topScore: R.top.map((r) => r.score), all: R.all.map((r) => [rowKey(r), r.score]),
        dropped: R.dropped.length, rowflag: R.dropped.filter((x) => x.ruled.includes("rowflag")).map((x) => `${x.u.supplierId}|${x.e.key}|${CAT.keyOf(x.u.line || (x.u.lines?.rows || []).join(" "))}`),
      };
    } catch (e) { out[`${key}#${ri}`] = { error: String(e.message || e) }; }
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
const secs = Math.round((Date.now() - t0) / 1000), errs = Object.values(out).filter((v) => v.error).length;
fs.writeFileSync(`${OUT}.meta.json`, JSON.stringify({ commit, bidhistFetchedAt: fetchedAt, goi: hist.length, ncc: sups.length, luot: Object.keys(out).length, luotLoi: errs, giay: secs }, null, 1));
console.error("xong", Object.keys(out).length, `${secs} s`);
