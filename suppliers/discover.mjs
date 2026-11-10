// Finds and adds new suppliers (genset makers, engine makers, alternator makers) with an agent in the loop:
// node suppliers/discover.mjs <command> ...   (the agent follows discover-prompt.md)
// The agent only picks pages and copies quotes; this script saves the pages, checks every quote and number against
// them, builds the record, crawls its spec tables and runs verify.mjs, the same way a hand-made record goes in.
//   seeds [--genbid]          brands seen in the catalog with no maker record (+ tender mentions from GenBid analyses)
//   check <url|name> ...      is it already in the system or in the log? is the site a B2B platform or a dealer?
//   save <id> <url> [--render] saves a page as sources/<id>/<n>.md (next free n, 1-99)
//   grep <id> <regex> [--n N] lines of the saved pages that match, word for word, to copy quotes from
//   new <id>                  writes drafts/<id>.json to fill in, with the saved pages listed
//   finish <id> [--no-crawl]  checks the draft, builds cn/<id>.json, crawls spec tables, runs verify on it
//   skip <url|name> --reason "..."   records a candidate that was looked at and left out
//   status                    records added or changed on this branch, and the log
//   pr                        verify.mjs on everything, then commit, push and open a pull request for Khoa
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkRecord, loadAll, norm } from "./verify.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(ROOT, "..");
const LOG = path.join(ROOT, "discover-log.json");
// Companies Khoa works with: checked first on every run (seeds), each by a search on its own name.
const WATCH = path.join(ROOT, "discover-watchlist.json");
const ROLES = new Set(["genset_oem", "engine_maker", "alternator_maker", "controller_maker", "distributor"]);
const KINDS = new Set(["genset", "engine", "alternator"]);
const FUELS = new Set(["diesel", "gas", "dual", "hfo", "gasoline", "other"]);
const RATINGS = new Set(["prime", "standby", "continuous", "unspecified"]);
const UNITS = new Set(["kVA", "kW", "hp", "PS"]);
// B2B platforms: a supplier's own words, tier C only, never its website. Dealer sites carrying a maker's name too.
const B2B = ["made-in-china.com", "alibaba.com", "1688.com", "aliexpress.com", "globalsources.com", "dhgate.com", "tradeindia.com", "indiamart.com",
  "ec21.com", "ecplaza.net", "tradekey.com", "hisupplier.com", "diytrade.com", "go4worldbusiness.com", "china.cn", "b2b168.com", "hc360.com", "1688.cn", "made-in-china.cn"];
const DEALER = ["sdec-engine.com", "dcec-engine.com", "ccec-engine.com"];
// Never a source on their own (README, PLAN-nha-cung-cap.md).
const BANNED = ["wikipedia.org", "baike.baidu.com", "zhihu.com", "quora.com", "reddit.com", "medium.com", "facebook.com", "youtube.com", "linkedin.com", "qcc.com", "tianyancha.com", "aiqicha.baidu.com"];
// English words need word boundaries so names like "Landtop" do not match; \b does not work on CJK or Vietnamese.
const PUFFERY = /\b(?:leading|no\.?\s?1|number one|best|top(?:\s?\d+)?|world[- ]class|famous)\b|hàng đầu|uy tín|chất lượng cao|số 1|tốt nhất|nổi tiếng|lớn nhất|领先|第一|最大|知名/i;

const args = process.argv.slice(3);
const opt = (k) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : undefined; };
const pos = args.filter((a, i) => !a.startsWith("--") && !["--n", "--reason"].includes(args[i - 1]));
const host = (u) => { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; } };
const onList = (h, list) => list.some((d) => h === d || h.endsWith("." + d));
const readLog = () => (fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : []);
const writeLog = (log) => fs.writeFileSync(LOG, JSON.stringify(log, null, 1) + "\n", "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const node = (script, ...a) => spawnSync(process.execPath, [path.join(ROOT, script), ...a], { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
// "3 000" and "3.750" (space or dot thousands, as European sources write them) also read as 3000 and 3750.
const numbersIn = (s) => {
  const t = norm(s).replace(/(\d),(\d{3})/g, "$1$2");
  return [...(t.match(/\d+(?:\.\d+)?/g) || []), ...(t.match(/\b\d{1,3}(?:[ .]\d{3})+\b/g) || []).map((g) => g.replace(/[ .]/g, ""))].map(Number);
};
const die = (m) => { console.error(m); process.exit(2); };
const idOk = (id) => /^[a-z0-9-]+$/.test(id || "") || die(`id phải là a-z 0-9 - (ví dụ "weichai-power"), không phải "${id}"`);

// ---------- matching against the system ----------
const STOP = new Set(["co", "ltd", "limited", "company", "corp", "corporation", "inc", "group", "holding", "holdings", "technology", "technologies", "tech", "science",
  "industrial", "industry", "industries", "machinery", "machine", "equipment", "electric", "electrical", "electromechanical", "power", "powers", "energy", "generator",
  "generators", "generating", "generation", "gen", "genset", "gensets", "set", "sets", "diesel", "engine", "engines", "motor", "china", "chinese", "international",
  "import", "export", "imp", "exp", "trading", "trade", "manufacturing", "manufacturer", "mfg", "the", "and", "of", "new", "province", "city",
  // places, shared by many unrelated companies
  "anhui", "beijing", "chongqing", "fujian", "fuzhou", "fuan", "gansu", "guangdong", "guangzhou", "guangxi", "nanning", "guizhou", "hainan", "hebei", "henan", "hubei",
  "wuhan", "hunan", "jiangsu", "jiangxi", "jilin", "liaoning", "shaanxi", "shandong", "shanxi", "sichuan", "chengdu", "tianjin", "yunnan", "zhejiang", "shanghai",
  "shenzhen", "weifang", "yangzhou", "wuxi", "changzhou", "taizhou", "xiamen", "quanzhou", "linyi", "jinan", "qingdao", "hangzhou", "ningbo", "suzhou", "nanjing",
  "dongguan", "foshan", "xian", "jiangyin", "jining", "zibo", "taian"]);
const ZH_STOP = /(有限责任公司|股份有限公司|有限公司|集团|股份|科技|机电|电机|电器|电气|设备|动力|发电机组|发电机|发电设备|柴油机|发动机|机械|制造|实业|工业|能源|公司|中国|省|市)/g;
const words = (s) => norm(s).replace(/[^a-z0-9一-鿿]+/g, " ").split(" ").filter((w) => w && !STOP.has(w) && !/^[一-鿿]/.test(w));
const zhCore = (s) => (String(s || "").match(/[一-鿿]+/g) || []).join("").replace(ZH_STOP, "");
function index() {
  return loadAll().filter((x) => x.rec).map(({ rec }) => ({
    id: rec.id, role: rec.role, website: rec.website, host: host(rec.website || ""), label: host(rec.website || "").split(".")[0],
    words: new Set([rec.names?.en, ...(rec.names?.brands || []), rec.id.replace(/-/g, " ")].flatMap(words)),
    zh: [rec.names?.zh, ...(rec.names?.brands || [])].map(zhCore).filter((z) => z.length >= 2),
  }));
}
function matches(q, idx) {
  if (/^https?:\/\//.test(q)) { const h = host(q); return idx.filter((r) => r.host && (r.host === h || h.endsWith("." + r.host) || r.host.endsWith("." + h))).map((r) => ({ ...r, how: "cùng website" })); }
  const w = words(q), z = zhCore(q), compact = norm(q).replace(/[^a-z0-9]/g, "");
  return idx.flatMap((r) => {
    const shared = w.filter((x) => x.length >= 3 && r.words.has(x));
    if (shared.length) return [{ ...r, how: `trùng chữ "${shared.join(" ")}"` }];
    // "Power HF" ↔ powerhf.com, "Kaichen" ↔ kaichenpower.com: the name written into the site's domain.
    const inHost = [compact, ...w].filter((x) => x.length >= 4 && r.label && r.label.includes(x));
    if (inHost.length) return [{ ...r, how: `tên nằm trong tên miền ${r.host}` }];
    if (z.length >= 2 && r.zh.some((x) => x.includes(z) || z.includes(x))) return [{ ...r, how: "trùng tên tiếng Trung" }];
    return [];
  });
}

// ---------- draft check ----------
const sourceFile = (id, n) => path.join(ROOT, "sources", id, `${n}.md`);
const head = (file) => { const [u = "", a = ""] = fs.readFileSync(file, "utf8").split("\n", 2); return { url: u.replace(/^URL:\s*/, "").trim(), accessed: a.replace(/^Accessed:\s*/, "").trim() }; };
// The saved line closest to a quote that was not found, so the agent can copy the real wording.
function closest(text, q) {
  const toks = (s) => new Set(norm(s).match(/[a-z]+|\d+(?:\.\d+)?|[一-鿿]/g) || []);
  const want = toks(q);
  return text.split("\n").slice(3).map((l) => { const t = toks(l); let k = 0; for (const x of want) if (t.has(x)) k++; return { l, k }; })
    .filter((x) => x.k).sort((a, b) => b.k - a.k).slice(0, 2).map((x) => x.l.slice(0, 200));
}
export function checkDraft(d, id) {
  const errors = [], err = (m) => errors.push(m);
  if (d.id !== id) err(`"id" phải là "${id}" (trùng tên file)`);
  if (!ROLES.has(d.role)) err(`"role" phải là một trong ${[...ROLES].join(", ")}`);
  if (d.country && !/^[A-Z]{2}$/.test(d.country)) err(`"country" là mã 2 chữ in hoa (CN, DE...)`);
  if (!d.en && !d.zh) err(`cần "en" hoặc "zh" (tên công ty như nguồn ghi)`);
  if (!["verified", "partial", "incomplete", undefined].includes(d.status)) err(`"status" là verified | partial | incomplete`);
  if (!["high", "medium", "low", undefined].includes(d.conf)) err(`"conf" là high | medium | low`);
  if (d.web) {
    const h = host(d.web);
    if (!h) err(`"web" không phải URL`);
    else if (onList(h, B2B)) err(`"web": ${h} là sàn B2B, không phải website của hãng; để null nếu hãng không có website riêng`);
    else if (onList(h, DEALER)) err(`"web": ${h} là website của đại lý, không phải chính hãng`);
  }
  const src = d.src && typeof d.src === "object" ? d.src : (err(`"src" phải là { "1": ["A", "câu trích", ...] }`), {});
  const tiers = [], quotes = new Map();
  for (const [n, v] of Object.entries(src)) {
    const where = `src ${n}`;
    if (!/^\d+$/.test(n) || Number(n) < 1 || Number(n) > 99) { err(`${where}: số nguồn là 1–99 (số của file sources/${id}/<n>.md)`); continue; }
    const f = sourceFile(id, n);
    if (!fs.existsSync(f)) { err(`${where}: chưa lưu trang, chạy: node suppliers/discover.mjs save ${id} <url>`); continue; }
    const [tier, ...qs] = Array.isArray(v) ? v : [];
    if (!["A", "B", "C"].includes(tier)) err(`${where}: phần tử đầu là hạng nguồn "A" | "B" | "C"`);
    const h = host(head(f).url);
    if (onList(h, BANNED)) err(`${where}: ${h} không được dùng làm nguồn`);
    if ((onList(h, B2B) || onList(h, DEALER)) && tier !== "C") err(`${where}: ${h} là ${onList(h, B2B) ? "sàn B2B" : "đại lý"}, hạng phải là "C"`);
    tiers.push(tier);
    if (!qs.length) err(`${where}: cần ít nhất một câu trích sau hạng nguồn`);
    const text = fs.readFileSync(f, "utf8"), nt = norm(text);
    for (const q of qs) {
      if (typeof q !== "string" || q.length < 8) { err(`${where}: câu trích quá ngắn (tối thiểu 8 ký tự): ${JSON.stringify(q)}`); continue; }
      if (!nt.includes(norm(q))) err(`${where}: không có nguyên văn trong ${path.relative(REPO, f)}: "${q.slice(0, 100)}"` + closest(text, q).map((l) => `\n        dòng gần nhất: ${l}`).join(""));
    }
    quotes.set(Number(n), qs.join(" | "));
  }
  if (tiers.length && tiers.every((t) => t === "C") && d.conf !== "low") err(`chỉ có nguồn hạng C thì "conf" phải là "low"`);
  if (d.conf === "high" && !tiers.includes("A")) err(`"conf": "high" cần ít nhất một nguồn hạng A`);
  const refs = (list, where) => { if (!list.length) err(`${where}: thiếu số nguồn`); for (const n of list) if (!quotes.has(Number(n))) err(`${where}: nguồn ${n} không có trong "src"`); };
  if (d.founded != null) {
    if (!Number.isInteger(d.founded)) err(`"founded" là năm (số), hoặc null`);
    const fs_ = [].concat(d.fsrc ?? []);
    refs(fs_, "founded (fsrc)");
    if (!fs_.some((n) => numbersIn(quotes.get(Number(n)) || "").includes(d.founded))) err(`"founded": năm ${d.founded} không có trong câu trích của nguồn fsrc`);
  }
  for (const [i, s] of (d.str || []).entries()) {
    const [text, ...n] = Array.isArray(s) ? s : [];
    if (!text) { err(`str[${i}]: dạng ["thế mạnh", 1]`); continue; }
    refs(n, `str[${i}]`);
    if (PUFFERY.test(text) && !/^theo hãng/i.test(text)) err(`str[${i}]: lời quảng cáo phải bắt đầu bằng "Theo hãng": "${text.slice(0, 80)}"`);
  }
  for (const [i, c] of (d.cert || []).entries()) { const [name, ...n] = Array.isArray(c) ? c : []; if (!name) err(`cert[${i}]: dạng ["ISO9001", 1]`); else refs(n, `cert[${i}] ${name}`); }
  for (const [i, l] of (d.lines || []).entries()) {
    const where = `lines[${i}] ${l.s || ""}`;
    if (!l.s) err(`${where}: thiếu "s" (tên dòng máy như nguồn ghi)`);
    if (l.k && !KINDS.has(l.k)) err(`${where}: "k" là genset | engine | alternator`);
    if (l.k !== "alternator" && l.fuel && !FUELS.has(l.fuel)) err(`${where}: "fuel" là ${[...FUELS].join(" | ")}`);
    if (l.p) {
      const [min, max, unit, rating = "unspecified", n] = l.p;
      if (!(min > 0) || !(max >= min)) err(`${where}: "p" là [min, max, "kVA", "standby", số nguồn], min > 0, max ≥ min`);
      if (!UNITS.has(unit)) err(`${where}: đơn vị ${unit} (kVA | kW | hp | PS, như nguồn ghi)`);
      if (!RATINGS.has(rating)) err(`${where}: rating là prime | standby | continuous | unspecified`);
      const pn = n ?? (l.src || [])[0];
      if (pn == null) err(`${where}: "p" cần số nguồn ở phần tử thứ 5`);
      else {
        refs([pn], `${where} p`);
        const nums = numbersIn(quotes.get(Number(pn)) || "");
        for (const v of [min, max]) if (v > 0 && !nums.includes(v)) err(`${where}: số ${v} không có trong câu trích của nguồn ${pn} (không quy đổi, không làm tròn)`);
      }
    }
    if (l.src) refs(l.src, where);
    else if (!l.p) err(`${where}: cần "src" (số nguồn ghi dòng máy này)`);
    // Engine / alternator makes and models must be written in the quotes of the line's sources.
    const lq = norm([...(l.src || []), l.p?.[4]].filter((n) => n != null).map((n) => quotes.get(Number(n)) || "").join(" | "));
    for (const [key, list] of [["eng", l.eng], ["alt", l.alt], ["models", l.models]]) for (const m of list || [])
      if (!lq.includes(norm(m))) err(`${where}: "${key}" có "${m}" nhưng câu trích của nguồn dòng này không ghi; chép đúng chữ nguồn ghi hoặc bỏ`);
  }
  if ((d.status || "verified") === "verified") {
    if (!d.web) err(`"status": "verified" cần "web"; không có thì để "partial"`);
    if (!(d.lines || []).some((l) => l.p)) err(`"status": "verified" cần ít nhất một dòng máy có "p" (dải công suất có nguồn); không có thì để "partial"`);
  }
  return errors;
}

// ---------- commands ----------
async function seeds() {
  if (fs.existsSync(WATCH)) {
    const idx = index(), log = readLog();
    console.log("Công ty Khoa hay làm việc (discover-watchlist.json) — CHƯA CÓ thì tìm riêng theo tên trước mọi việc khác:");
    for (const x of JSON.parse(fs.readFileSync(WATCH, "utf8"))) {
      const m = matches(x.name, idx), seen = log.filter((l) => l.name && words(l.name).join(" ") === words(x.name).join(" "));
      console.log(`  ${m.length ? "đã có" : "CHƯA CÓ"}  ${x.name}${m.length ? ` (${m.map((r) => r.id).join(", ")})` : ""}${seen.length ? ` — nhật ký: ${seen.at(-1).reason || "đã thêm"}` : ""}${x.note ? ` — ${x.note}` : ""}`);
    }
    console.log("");
  }
  await import(pathToFileURL(path.join(REPO, "web", "catalog.js")).href);
  const recs = loadAll().filter((x) => x.rec).map((x) => x.rec);
  const cat = globalThis.GenbidCatalog.build(recs), idx = index();
  for (const [kind, list, role] of [["Động cơ", cat.engines, "engine_maker"], ["Đầu phát", cat.alternators, "alternator_maker"]]) {
    const rows = new Map();
    for (const e of list) for (const m of String(e.make || "").split(/\s*\/\s*/).filter(Boolean)) rows.set(m, (rows.get(m) || 0) + e.uses.length);
    const out = [...rows].sort((a, b) => b[1] - a[1]).map(([m, n]) => {
      const has = matches(m, idx).filter((r) => r.role === role);
      return `  ${has.length ? "đã có" : "CHƯA CÓ"}  ${m} — ${n} dòng bảng${has.length ? ` (${has.map((r) => r.id).join(", ")})` : ""}`;
    });
    console.log(`${kind} (hãng ghi trong bảng thông số của các tổ máy; CHƯA CÓ = chưa có bản ghi ${role}):\n${out.join("\n")}`);
  }
  if (args.includes("--genbid")) {
    // Every analysis (~25 MB) through config-bot's allDocs: kept on this PC (genbid-work\doc-cache), each run reads only
    // the analyses that changed (Supabase egress, 2026-11-10).
    let analyses;
    try { analyses = await (await import("./config-bot.mjs")).allDocs("analysis"); } catch (e) { die(`GenBid: ${e.message}`); }
    const BRANDY = /(hãng|thương hiệu|xuất xứ|nguồn gốc|động cơ|đầu phát|nhà sản xuất|nhà cung cấp|engine|alternator|brand|origin|g7|tương đương)/i;
    const lines = [];
    for (const { id, data } of analyses) for (const x of [...(data?.result?.technicalSpecs || []), ...(data?.result?.restrictiveClauses || [])]) {
      const t = [x.item, x.requirement, x.clause, x.text, x.reason].filter(Boolean).join(": ");
      if (BRANDY.test(t)) lines.push(`- [${id}] ${t.replace(/\s+/g, " ").slice(0, 400)}`);
    }
    // Tender data stays out of the repo.
    const out = path.join(os.tmpdir(), "genbid-discover", "genbid-mentions.md");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, `# Yêu cầu về hãng / xuất xứ trong các gói đã phân tích (${today()})\n\n${lines.join("\n")}\n`, "utf8");
    console.log(`\nGenBid: ${lines.length} dòng nhắc tới hãng / xuất xứ, ghi ở ${out} (không đưa vào repo)`);
  }
}

function check() {
  if (!pos.length) die("usage: check <url|tên> ...");
  const idx = index(), log = readLog();
  for (const q of pos) {
    const notes = [];
    if (/^https?:\/\//.test(q)) {
      const h = host(q);
      if (onList(h, B2B)) notes.push("sàn B2B: không phải website của hãng; chỉ dùng làm nguồn hạng C, tìm website riêng của hãng");
      if (onList(h, DEALER)) notes.push("website của đại lý mang tên hãng: không tính là nguồn chính hãng");
      if (onList(h, BANNED)) notes.push("không được dùng làm nguồn");
    }
    const m = matches(q, idx);
    const seen = log.filter((x) => (/^https?:\/\//.test(q) ? host(x.url || "") === host(q) : x.name && words(x.name).join(" ") === words(q).join(" ")));
    console.log(`${q}\n  ${m.length ? m.map((r) => `ĐÃ CÓ / CÓ THỂ TRÙNG: ${r.id} (${r.role}, ${r.website || "không website"}) — ${r.how}`).join("\n  ") : "chưa có trong hệ thống"}`);
    for (const s of seen) console.log(`  trong nhật ký ${s.at}: ${s.result === "added" ? `đã thêm thành ${s.id}` : `đã bỏ qua — ${s.reason}`}`);
    for (const n of notes) console.log(`  lưu ý: ${n}`);
  }
}

async function save() {
  const [id, url] = pos;
  idOk(id);
  if (!/^https?:\/\//.test(url || "")) die("usage: save <id> <url> [--render]");
  if (onList(host(url), BANNED)) die(`${host(url)} không được dùng làm nguồn`);
  const dir = path.join(ROOT, "sources", id);
  const used = fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => Number(f.replace(/\.md$/, ""))).filter((n) => n >= 1 && n <= 99) : [];
  const n = Number(opt("n")) || Math.max(0, ...used) + 1;
  if (n > 99) die("đã có 99 nguồn đánh số tay; dùng crawl cho trang thông số");
  for (const f of used) if (head(sourceFile(id, f)).url === url) die(`trang này đã lưu: sources/${id}/${f}.md`);
  let file;
  if (args.includes("--firecrawl")) {
    // For sites that block this PC (cummins.com answers 403 even to Chromium); allowed by Khoa 2026-10-29.
    // The key is read from the file and never printed.
    const keyFile = process.env.GENBID_FIRECRAWL_KEY_FILE || "C:/Projects/GenSet Pro/genbid-hsmt/.firecrawl-key";
    const r = await fetch("https://api.firecrawl.dev/v2/scrape", { method: "POST", signal: AbortSignal.timeout(120000),
      headers: { Authorization: `Bearer ${fs.readFileSync(keyFile, "utf8").trim()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.data?.markdown) die(`firecrawl không lưu được ${url}: HTTP ${r.status} ${String(j.error || "").slice(0, 160)}`);
    fs.mkdirSync(dir, { recursive: true });
    file = sourceFile(id, n);
    fs.writeFileSync(file, `URL: ${j.data.metadata?.sourceURL || url}\nAccessed: ${today()}\nVia: firecrawl\n\n${j.data.markdown}\n`, "utf8");
  } else if (args.includes("--render")) {
    const { getRendered, htmlToText, closeBrowser } = await import(pathToFileURL(path.join(ROOT, "crawl-specs.mjs")).href);
    try {
      const { html, url: final } = await getRendered(url);
      fs.mkdirSync(dir, { recursive: true });
      file = sourceFile(id, n);
      fs.writeFileSync(file, `URL: ${final || url}\nAccessed: ${today()}\nVia: chromium\n\n${htmlToText(html)}\n`, "utf8");
    } finally { await closeBrowser(); }
  } else {
    const r = node("fetch-source.mjs", id, String(n), url);
    if (r.status) {
      const out = (r.stderr || r.stdout).trim(), why = (out.match(/code: '(\w+)'|HTTP \d+/) || [out.split("\n").pop()]);
      die(`không lưu được ${url}: ${why[1] || why[0]}${/ENOTFOUND/.test(out) ? " (tên miền không tồn tại — đừng đoán địa chỉ, lấy URL từ kết quả tìm kiếm)" : " — thử thêm --render, hoặc bỏ trang này"}`);
    }
    file = sourceFile(id, n);
  }
  const text = fs.readFileSync(file, "utf8"), size = text.length;
  const blocked = /(captcha|verify you are human|access denied|安全验证|滑动验证|请登录|cloudflare)/i.test(text.slice(0, 3000));
  console.log(`đã lưu sources/${id}/${n}.md (${size} ký tự) — nguồn số ${n}`);
  if (blocked) console.log("lưu ý: trang đòi đăng nhập / CAPTCHA; không dùng trang này, xoá file và ghi skip nếu không có trang khác");
  else if (size < 600) console.log(args.includes("--render") ? "lưu ý: trang gần như trống hoặc không mở được; xoá file này, thử trang khác của hãng" : "lưu ý: trang gần như trống (dựng bằng JavaScript?); xoá file này rồi lưu lại với --render");
}

function grep() {
  const [id, re] = pos;
  idOk(id);
  if (!re) die("usage: grep <id> <regex> [--n N]");
  const dir = path.join(ROOT, "sources", id), rx = new RegExp(re, "i");
  if (!fs.existsSync(dir)) die(`chưa có trang nào trong sources/${id}/`);
  let shown = 0;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort((a, b) => parseInt(a) - parseInt(b))) {
    if (opt("n") && f !== `${opt("n")}.md`) continue;
    for (const l of fs.readFileSync(path.join(dir, f), "utf8").split("\n").slice(3)) if (rx.test(l) && shown++ < 60) console.log(`${f.replace(".md", "")}: ${l}`);
  }
  console.log(shown ? (shown > 60 ? `(+${shown - 60} dòng nữa, thu hẹp regex)` : "") : "không có dòng nào khớp");
}

function create() {
  const [id] = pos;
  idOk(id);
  const file = path.join(ROOT, "drafts", `${id}.json`);
  if (fs.existsSync(file)) die(`đã có drafts/${id}.json, sửa file đó`);
  if (fs.existsSync(path.join(ROOT, "cn", `${id}.json`))) die(`đã có cn/${id}.json — bản ghi này có trong hệ thống, không tạo lại`);
  const dir = path.join(ROOT, "sources", id);
  const saved = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^\d+\.md$/.test(f) && parseInt(f) <= 99).sort((a, b) => parseInt(a) - parseInt(b)) : [];
  const src = Object.fromEntries(saved.map((f) => [parseInt(f), ["A", `<chép nguyên văn từ ${head(path.join(dir, f)).url}>`]]));
  const draft = { id, country: "CN", role: "genset_oem", status: "verified", conf: "medium", en: null, zh: null, brands: [], web: null, prov: null, city: null,
    founded: null, fsrc: [], src, str: [], cert: [], lines: [{ k: "genset", s: "<tên dòng máy>", fuel: "diesel", eng: [], models: [], alt: [], p: [0, 0, "kVA", "unspecified", 1], src: [1] }],
    miss: [], by: "discover-bot (Antigravity)" };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(draft, null, 2) + "\n", "utf8");
  console.log(`đã tạo drafts/${id}.json với ${saved.length} nguồn; điền theo discover-prompt.md rồi chạy: node suppliers/discover.mjs finish ${id}`);
}

function finish() {
  const [id] = pos;
  idOk(id);
  const file = path.join(ROOT, "drafts", `${id}.json`);
  if (!fs.existsSync(file)) die(`chưa có drafts/${id}.json, chạy: node suppliers/discover.mjs new ${id}`);
  let d;
  try { d = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { die(`drafts/${id}.json không phải JSON hợp lệ: ${e.message}`); }
  const errs = checkDraft(d, id);
  if (errs.length) { console.log(`✗ drafts/${id}.json: ${errs.length} lỗi — sửa rồi chạy lại finish\n` + errs.map((e) => `  - ${e}`).join("\n")); process.exit(1); }
  const b = node("build.mjs", file);
  if (b.status) die(`build.mjs: ${b.stderr || b.stdout}`);
  if (!args.includes("--no-crawl") && d.web) {
    const step = (...a) => { const r = node(...a); console.log((r.stdout || r.stderr).trim().split("\n").filter(Boolean).map((l) => `  ${l}`).join("\n")); };
    console.log("Cào bảng thông số trên website…");
    step("crawl-specs.mjs", id);
    const spec = path.join(ROOT, "specs", `${id}.json`);
    if (!fs.existsSync(spec) || !JSON.parse(fs.readFileSync(spec, "utf8")).length) { console.log("Không có bảng, thử lại bằng Chromium…"); step("crawl-specs.mjs", id, "--render"); }
    if (fs.existsSync(spec) && JSON.parse(fs.readFileSync(spec, "utf8")).length) { console.log("Đọc datasheet…"); step("crawl-datasheets.mjs", id); }
    step("merge-specs.mjs", id);
  }
  const out = path.join(ROOT, "cn", `${id}.json`), rec = JSON.parse(fs.readFileSync(out, "utf8"));
  const { errors, warnings } = checkRecord(rec, out);
  const rows = (rec.specTables || []).reduce((a, t) => a + t.rows.length, 0);
  console.log(`${errors.length ? "✗" : "✓"} cn/${id}.json: ${rec.role}, ${rec.status}, ${rec.productLines.length} dòng máy, ${(rec.specTables || []).length} bảng / ${rows} dòng thông số`);
  for (const e of errors) console.log(`    lỗi: ${e}`);
  for (const w of warnings) console.log(`    lưu ý: ${w}`);
  if (errors.length) process.exit(1);
  const log = readLog().filter((x) => x.id !== id);
  log.push({ at: today(), result: "added", id, name: d.en || d.zh, url: d.web || null, tables: (rec.specTables || []).length, rows });
  writeLog(log);
}

function skip() {
  const [q] = pos, reason = opt("reason");
  if (!q || !reason) die('usage: skip <url|tên> --reason "lý do"');
  const log = readLog();
  log.push({ at: today(), result: "skip", ...(/^https?:\/\//.test(q) ? { url: q } : { name: q }), reason });
  writeLog(log);
  console.log(`đã ghi bỏ qua: ${q}`);
}

function changed() {
  try { git("fetch", "-q", "origin", "main"); } catch {}
  const list = (filter) => git("diff", "--name-only", `--diff-filter=${filter}`, "origin/main", "--", "suppliers/cn").split("\n").filter(Boolean).map((f) => path.basename(f, ".json"));
  const untracked = git("ls-files", "--others", "--exclude-standard", "--", "suppliers/cn").split("\n").filter(Boolean).map((f) => path.basename(f, ".json"));
  return { added: [...new Set([...list("A"), ...untracked])], modified: list("M") };
}

function status() {
  const { added, modified } = changed(), log = readLog();
  console.log(`Bản ghi mới so với main: ${added.length ? added.join(", ") : "không có"}\nBản ghi sửa: ${modified.length ? modified.join(", ") : "không có"}`);
  const drafts = fs.existsSync(path.join(ROOT, "drafts")) ? fs.readdirSync(path.join(ROOT, "drafts")).map((f) => f.slice(0, -5)).filter((id) => !fs.existsSync(path.join(ROOT, "cn", `${id}.json`))) : [];
  if (drafts.length) console.log(`Bản nháp chưa finish: ${drafts.join(", ")}`);
  console.log(`Nhật ký: ${log.filter((x) => x.result === "added").length} đã thêm, ${log.filter((x) => x.result === "skip").length} bỏ qua; 10 dòng cuối:`);
  for (const x of log.slice(-10)) console.log(`  ${x.at} ${x.result === "added" ? `+ ${x.id}` : `- ${x.name || x.url}: ${x.reason}`}`);
}

function pr() {
  const v = node("verify.mjs");
  if (v.status) die(`verify.mjs còn lỗi, chưa mở PR:\n${v.stdout.split("\n").filter((l) => /✗|lỗi:/.test(l)).slice(0, 40).join("\n")}`);
  const { added, modified } = changed();
  if (!added.length && !modified.length) die("không có bản ghi mới hay sửa để mở PR");
  let branch = git("rev-parse", "--abbrev-ref", "HEAD");
  if (branch === "main" || branch === "HEAD") { branch = `discover/${today()}-${Date.now().toString(36).slice(-4)}`; git("switch", "-c", branch); }
  git("add", "--", "suppliers/cn", "suppliers/sources", "suppliers/drafts", "suppliers/discover-log.json", ...["suppliers/specs", "suppliers/datasheets"].filter((p) => fs.existsSync(path.join(REPO, p))));
  const summary = [added.length && `thêm ${added.join(", ")}`, modified.length && `sửa ${modified.join(", ")}`].filter(Boolean).join("; ");
  git("-c", `user.name=${process.env.GENBID_GIT_NAME || "GenBid Discover Bot"}`, "-c", `user.email=${process.env.GENBID_GIT_EMAIL || "genbid-bot@users.noreply.github.com"}`,
    "commit", "-q", "-m", `Nhà cung cấp: ${summary} (discover-bot)`);
  git("push", "-q", "-u", "origin", branch);
  const skips = readLog().filter((x) => x.result === "skip").slice(-20).map((x) => `- ${x.name || x.url}: ${x.reason}`);
  const body = `Bot tìm nhà cung cấp (discover.mjs, agent theo discover-prompt.md).\n\n- Bản ghi mới: ${added.join(", ") || "không có"}\n- Bản ghi sửa: ${modified.join(", ") || "không có"}\n\n`
    + `Mọi bản ghi đã qua \`verify.mjs\` (câu trích có nguyên văn trong trang đã lưu, số công suất có trong câu trích). Duyệt từng bản ghi trước khi gộp; gộp vào main thì workflow Supplier publish đăng lên web.\n\n`
    + (skips.length ? `Đã xem và bỏ qua:\n${skips.join("\n")}\n` : "");
  const r = spawnSync(process.env.GENBID_GH || "gh", ["pr", "create", "--head", branch, "--base", "main", "--title", `Nhà cung cấp: ${summary}`.slice(0, 200), "--body", body], { cwd: REPO, encoding: "utf8" });
  console.log(r.status ? `Đã push nhánh ${branch} nhưng chưa mở được PR: ${(r.stderr || "").trim()}` : `PR: ${r.stdout.trim().split("\n").pop()}`);
}

const cmds = { seeds, check, save, grep, new: create, finish, skip, status, pr };
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const c = cmds[process.argv[2]];
  if (!c) die("usage: discover.mjs seeds [--genbid] | check <url|tên>... | save <id> <url> [--render] | grep <id> <regex> | new <id> | finish <id> [--no-crawl] | skip <url|tên> --reason R | status | pr");
  await c();
}
