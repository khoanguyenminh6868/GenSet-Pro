// Đo top 30 "Gợi ý cấu hình" cho mọi gói thầu máy phát trong bidhist (bản đo "gộp" gốc chạy trên máy Khoa, chép sang để chạy được trên cloud).
//   node suppliers/do-gop.mjs <thư mục code> <thư mục cn dữ liệu> <out.json> [--bidhist <tệp>] [--save-bidhist <tệp>] [--fresh]
// Không --bidhist: đọc bidhist qua API của bot (cùng điểm cuối với config-bot.mjs allDocs mà gaps.mjs dùng); --save-bidhist lưu bản vừa tải để gốc và
// nhánh dùng CHUNG một bản. Tệp bidhist là chữ HSMT: KHÔNG commit (repo công khai), lưu ngoài repo.
// Phần tính giữ nguyên bản gốc để so được với kết quả trên máy; chỉ phần nạp dữ liệu đổi. Metadata (commit code, số gói, thời điểm
// tải bidhist) ghi ở stderr và <out>.meta.json, không chèn vào <out.json>.
// Chạy tiếp (25/11/2026: container cloud khởi động lại làm mất trắng 5 lượt chạy): kết quả từng lượt ghi nối vào <out>.part.jsonl (dòng đầu = dấu
// nhận dạng lần đo: commit code + `git diff HEAD` nếu cây làm việc bẩn, băm nội dung cn, băm bidhist; mỗi dòng sau = một lượt; ghi theo lô 10 lượt / 15 s,
// fsync). Chạy lại CÙNG lệnh: dấu nhận dạng khớp thì bỏ qua lượt đã có, không khớp thì bỏ tệp phần, chạy từ đầu và in lý do; --fresh ép chạy từ đầu.
// Dòng cuối ghi dở bị bỏ (từ dòng hỏng đầu tiên trở đi tính lại). <out.json> và <out>.meta.json giống từng byte cách chạy một mạch (trừ `giay`);
// thông tin chạy tiếp ghi ở <out>.resume.json (không đổi meta). Xong thì xoá tệp phần. Nên dùng --bidhist (bidhist tải từ web lần sau có thể đã đổi: khác băm thì chạy lại từ đầu).
// Token: không đọc, in hay ghi ở đây (xem chú thích ở readBidhist và suppliers/CLAUDE.md, mục "Đo top 30 trên cloud").
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import crypto from "node:crypto";
const BOOL_FLAGS = new Set(["fresh"]);
const flag = (n) => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; };
const pos = []; for (let i = 2; i < process.argv.length; i++) { if (process.argv[i].startsWith("--")) { if (!BOOL_FLAGS.has(process.argv[i].slice(2))) i++; } else pos.push(process.argv[i]); }
const [WT, CN, OUT] = pos;
if (!WT || !CN || !OUT) { console.error("dùng: node suppliers/do-gop.mjs <thư mục code> <thư mục cn> <out.json> [--bidhist <tệp>] [--save-bidhist <tệp>] [--fresh]"); process.exit(2); }
const BIDHIST = flag("bidhist"), SAVE = flag("save-bidhist"), FRESH = process.argv.includes("--fresh");
const sha = (x) => crypto.createHash("sha256").update(x).digest("hex");
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const lib = path.join(WT, "suppliers", "row-flags-lib.mjs");
const RF = fs.existsSync(lib) ? await import(pathToFileURL(lib).href) : null;
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
let commit = "?";
let dirty = "";
try { commit = execFileSync("git", ["-C", WT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch {}
try { const df = execFileSync("git", ["-C", WT, "diff", "HEAD"], { encoding: "buffer", maxBuffer: 1 << 28 }); if (df.length) dirty = sha(df); } catch {}
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
let bidHash;
if (BIDHIST) { const raw = fs.readFileSync(BIDHIST); bidHash = sha(raw); const bj = JSON.parse(raw.toString("utf8")); docs = bj.docs; fetchedAt = bj.fetchedAt || fs.statSync(BIDHIST).mtime.toISOString(); }
else {
  fetchedAt = new Date().toISOString();
  docs = await readBidhist();
  if (SAVE) fs.writeFileSync(SAVE, JSON.stringify({ fetchedAt, docs }));
  bidHash = sha(JSON.stringify(docs));
}
// Băm cn = tên + nội dung từng tệp .json (đúng tập tệp đọc bên dưới), không chỉ kích thước / mtime.
const cnHasher = crypto.createHash("sha256");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => { const s = fs.readFileSync(path.join(CN, f), "utf8"); cnHasher.update(f + "\0" + s + "\0"); return JSON.parse(s); }).filter((d) => d.status !== "incomplete");
const cnHash = cnHasher.digest("hex");
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
// ---- lưu tiến độ / chạy tiếp (xem đầu tệp) ----
const PART = `${OUT}.part.jsonl`, FP = { v: 1, commit, dirty, cn: cnHash, bidhist: bidHash };
const done = new Map(); let resumes = 0, partReason = "", resumed = false;
function loadPart() {
  if (FRESH) return "--fresh";
  if (!fs.existsSync(PART)) return "";
  const lines = fs.readFileSync(PART, "utf8").split("\n");
  let head = null; try { head = JSON.parse(lines[0]); } catch {}
  if (!head?.fp) return "tệp phần cũ không có dòng nhận dạng hợp lệ";
  const diff = Object.keys(FP).filter((k) => head.fp[k] !== FP[k]);
  if (diff.length) return `khác ${diff.map((k) => ({ commit: "commit code", dirty: "thay đổi chưa commit của code", cn: "thư mục cn", bidhist: "bidhist", v: "phiên bản định dạng" })[k]).join(", ")}`;
  let valid = lines[0] + "\n";
  for (const l of lines.slice(1)) {
    if (!l) continue;
    let r; try { r = JSON.parse(l); } catch { break; }   // dòng cuối ghi dở: bỏ từ đây trở đi
    if (r?.resume) resumes++;
    else if (typeof r?.id === "string" && "v" in r) done.set(r.id, r.v);
    else break;
    valid += l + "\n";
  }
  fs.writeFileSync(PART, valid);
  resumed = true;
  return "";
}
partReason = loadPart();
if (!resumed) {
  if (partReason && fs.existsSync(PART)) console.error(`bỏ tệp phần ${PART}: ${partReason}; chạy từ đầu`);
  fs.writeFileSync(PART, JSON.stringify({ fp: FP, goi: hist.length }) + "\n");
} else {
  resumes++;
  fs.appendFileSync(PART, JSON.stringify({ resume: { at: new Date().toISOString(), daCo: done.size } }) + "\n");
  console.error(`chạy tiếp từ ${PART}: ${done.size} lượt đã có (lần chạy tiếp thứ ${resumes})`);
}
const partFd = fs.openSync(PART, "a");
let pending = [], lastFlush = Date.now(), skipped = 0, computed = 0, rssMax = 0, computedG = 0, lastTick = Date.now();
const flush = () => { if (!pending.length) return; fs.writeSync(partFd, pending.join("")); fs.fsyncSync(partFd); pending = []; lastFlush = Date.now(); };
const mb = (b) => Math.round(b / 1048576) + " MB";
const rssNow = () => { const r = process.memoryUsage.rss(); if (r > rssMax) rssMax = r; return r; };
for (let gi = 0; gi < hist.length; gi++) {
  const d = hist[gi];
  const comp0 = computed;
  if (Date.now() - lastTick >= 30000) {
    lastTick = Date.now();
    const el = (lastTick - t0) / 1000, eta = computedG ? Math.round((el / computedG) * (hist.length - gi) / 60) : null;
    console.error(`tiến độ: gói ${gi}/${hist.length} (${Math.round(100 * gi / hist.length)}%), lượt ${Object.keys(out).length} (tính ${computed}, lấy lại ${skipped}), ${Math.round(el / 60)} phút${eta === null ? "" : `, còn ~${eta} phút`}, RSS ${mb(rssNow())}`);
  }
  rssNow();
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  // The HSMT text tells what each bare figure of `kvas` is (standby, maximum, engine): sizesOf context.
  const found = B.sizesOf([kvaText, d.bidName], d.bidName, text);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    const id = `${gi}:${key}#${ri}`;
    if (done.has(id)) { out[`${key}#${ri}`] = done.get(id); skipped++; return; }
    let val;
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, ...(blocked ? { blocked } : {}) });
      val = {
        top: R.top.map(rowKey), topScore: R.top.map((r) => r.score), all: R.all.map((r) => [rowKey(r), r.score]),
        dropped: R.dropped.length, rowflag: R.dropped.filter((x) => x.ruled.includes("rowflag")).map((x) => `${x.u.supplierId}|${x.e.key}|${CAT.keyOf(x.u.line || (x.u.lines?.rows || []).join(" "))}`),
      };
    } catch (e) { val = { error: String(e.message || e) }; }
    out[`${key}#${ri}`] = val; computed++;
    pending.push(JSON.stringify({ id, v: val }) + "\n");
    if (pending.length >= 10 || Date.now() - lastFlush >= 15000) flush();
  });
  if (computed > comp0) computedG++;
}
flush(); fs.closeSync(partFd);
fs.writeFileSync(OUT, JSON.stringify(out));
const secs = Math.round((Date.now() - t0) / 1000), errs = Object.values(out).filter((v) => v.error).length;
fs.writeFileSync(`${OUT}.meta.json`, JSON.stringify({ commit, bidhistFetchedAt: fetchedAt, goi: hist.length, ncc: sups.length, luot: Object.keys(out).length, luotLoi: errs, giay: secs }, null, 1));
const peakKB = process.resourceUsage().maxRSS;   // KB trên Linux: đỉnh thật của tiến trình
rssNow();
fs.writeFileSync(`${OUT}.resume.json`, JSON.stringify({ chayTiep: resumes, luotLayLai: skipped, luotTinh: computed, lyDoBoPhanCu: partReason, giayLanNay: secs, rssDinhQuanSatMB: Math.round(rssMax / 1048576), rssDinhMB: Math.round(peakKB / 1024) }, null, 1));
fs.rmSync(PART, { force: true });
console.error("xong", Object.keys(out).length, `${secs} s (tính ${computed}, lấy lại từ phần cũ ${skipped}); RAM đỉnh: ${mb(Math.max(rssMax, peakKB * 1024))} (quan sát RSS ${mb(rssMax)}, maxRSS ${mb(peakKB * 1024)})`);
