// "Gợi ý" in the Cấu hình gợi ý tab, run on the Windows PC next to the GenBid bot:
//   node suppliers/config-bot.mjs run            answer every pending configreq/<TBMT> (one Claude agent per request)
//   node suppliers/config-bot.mjs prep --key <TBMT> --out <dir>
//   node suppliers/config-bot.mjs save --dir <dir> --url <url>     (used by the agent for internet sources)
//   node suppliers/config-bot.mjs check --dir <dir>                verify result.json in code (prints what failed)
//   node suppliers/config-bot.mjs post --dir <dir> --key <TBMT> --requested-at <iso>
// Data is read from and written to the web (Vercel API) with the ingest token, which is never printed.
// The agent (claude -p, Opus, with WebSearch) follows config-prompt.md. check marks every quote or number the code
// cannot find word for word in the HSMT text, the catalog row or a saved web page as unverified, and turns such a
// "met" into "unclear" (Khoa, 2026-10-28: the answer must be exactly right).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { norm } from "./verify.mjs";
import { htmlToText } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = fileURLToPath(import.meta.url);
const WEB = process.env.GENBID_WEB || "https://genset-pro-web.vercel.app";
const TOKEN_FILE = process.env.GENBID_INGEST_TOKEN_FILE || "C:/Projects/GenSet Pro/.genbid-ingest-token";
const CLAUDE = process.env.GENBID_CLAUDE || "claude";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const arg = (k, d = "") => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const token = () => fs.readFileSync(TOKEN_FILE, "utf8").trim();
const numbersIn = (s) => (norm(s).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);

async function api(q) {
  const r = await fetch(`${WEB}/api/requests?${q}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!r.ok) throw new Error(`${q}: HTTP ${r.status}`);
  return r.json();
}
const doc = async (coll, id) => (await api(`kind=docs&coll=${coll}&id=${encodeURIComponent(id)}`))[0]?.data;
async function post(rows) {
  const r = await fetch(`${WEB}/api/ingest`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
  const body = await r.text();
  if (!r.ok) throw new Error(`ingest HTTP ${r.status}: ${body.slice(0, 200)}`);
  return body;
}
async function loadCatalog(suppliers) {
  await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
  return globalThis.GenbidCatalog.build(suppliers);
}

// ---------- prep ----------
const CAP = /(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(kva|kw|mva|mw)\b/i;
function capacity(texts) {
  for (const t of texts) {
    const m = String(t || "").match(CAP);
    if (!m) continue;
    let v = m[1]; v = /^\d{1,3}([.,]\d{3})+$/.test(v) ? v.replace(/[.,]/g, "") : v.replace(",", ".");
    const u = m[2].toLowerCase();
    return { value: Number(v) * (u.startsWith("m") ? 1000 : 1), unit: u.endsWith("va") ? "kVA" : "kW" };
  }
  return null;
}
// The technical part of the HSMT: chapter V (Yêu cầu kỹ thuật) when it can be found, else the whole text.
function technicalPart(text) {
  const start = text.search(/ch(ươ|uo)ng\s+V\b[^I\n]{0,80}(y[êe]u c[ầa]u|ph[ạa]m vi)/i);
  if (start < 0) return text.slice(0, 250000);
  const rest = text.slice(start + 10), end = rest.search(/\n\s*ch(ươ|uo)ng\s+(VI|VII)\b/i);
  return text.slice(start, end > 0 ? start + 10 + end : start + 250000).slice(0, 250000);
}
function catalogMd(cat, cap, brands) {
  const pick = (list) => {
    if (!cap) return list.slice(0, 80);
    const near = list.filter((e) => e.uses.some((u) => Object.values(u.power || {}).some((p) => p[cap.unit] != null && p[cap.unit] >= cap.value * 0.95 && p[cap.unit] <= cap.value * 1.4)));
    return near.sort((a, b) => (brands.some((x) => (b.make || "").includes(x)) - brands.some((x) => (a.make || "").includes(x))) || b.suppliers.length - a.suppliers.length).slice(0, 80);
  };
  const out = [`# Danh mục trong hệ thống${cap ? ` (lọc theo tổ máy ${cap.value} ${cap.unit}, từ 95% đến 140%)` : ""}`, ""];
  for (const [title, list] of [["Động cơ", pick(cat.engines)], ["Đầu phát", pick(cat.alternators)]]) {
    out.push(`## ${title} (${list.length})`, "");
    for (const e of list) {
      out.push(`### ${e.model}${e.make ? ` — hãng: ${e.make} (theo ${[...new Set(e.makes.map((m) => m.via))].join(", ")})` : " — nguồn không ghi hãng"}`);
      const uses = cap ? e.uses.slice().sort((a, b) => Math.abs(rowPower(a, cap) - cap.value) - Math.abs(rowPower(b, cap) - cap.value)) : e.uses;
      for (const u of uses.slice(0, 5)) {
        out.push(`- supplierId: ${u.supplierId}, n: ${u.n}${u.genset ? `, tổ máy: ${u.genset}` : ""}${u.other ? `, đi kèm: ${u.other}` : ""}`);
        if (u.header?.length) out.push(`  header: ${u.header.join(" ")}`);
        out.push(u.line ? `  line: ${u.line}` : `  bảng một model: ${(u.lines?.rows || []).join(" ; ")}`);
        // Figures read from that row by column title (web/catalog.js), each in the row word for word.
        if (u.specs?.length) out.push(`  thông số: ${u.specs.map((x) => `${x.label} = ${x.value}`).join(" ; ")}`);
      }
      out.push("");
    }
  }
  return out.join("\n");
}
const rowPower = (u, cap) => Math.min(...Object.values(u.power || {}).map((p) => p[cap.unit] ?? 1e9), 1e9);

async function prep(key, dir, reqData = {}) {
  fs.mkdirSync(path.join(dir, "web"), { recursive: true });
  const [analysis, hsmt, notice, suppliers] = await Promise.all([doc("analysis", key), doc("hsmt", key), doc("notice", key), api("kind=docs&coll=supplier")]);
  const parts = [];
  for (let i = 0; i < (hsmt?.textChunks || 0); i++) parts.push((await doc("hsmttext", `${key}_${i}`))?.text || "");
  const noticeText = notice ? JSON.stringify(notice) : "";
  const text = parts.join("") + (noticeText ? "\n\n--- Thông báo mời thầu ---\n" + noticeText : "");
  if (!text.trim()) throw new Error("Gói này chưa có văn bản HSMT để đọc yêu cầu kỹ thuật. Cần tải hồ sơ (Lấy lại tệp) trước.");
  fs.writeFileSync(path.join(dir, "hsmt.txt"), text, "utf8");
  const a = analysis?.result;
  const cap = capacity([reqData.bidName, a?.keyInfo?.generatorCapacity, hsmt?.capacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const brands = [...new Set((technicalPart(text).match(/cummins|perkins|mitsubishi|doosan|volvo|mtu|baudouin|weichai|yuchai|deutz|stamford|leroy|mecc alte|marathon/gi) || []).map((b) => b.toLowerCase()))];
  const cat = await loadCatalog(suppliers.map((d) => d.data));
  fs.writeFileSync(path.join(dir, "catalog.md"), catalogMd(cat, cap, brands), "utf8");
  fs.writeFileSync(path.join(dir, "input.md"), [
    `# Gói thầu ${key}`, reqData.bidName ? `Tên gói: ${reqData.bidName}` : "", cap ? `Công suất đọc được: ${cap.value} ${cap.unit} (chỉ để lọc danh mục; yêu cầu thật lấy từ HSMT)` : "Chưa đọc được công suất từ tên gói / phân tích.",
    `Lệnh lưu trang web: node "${SCRIPT}" save --dir . --url "<url>"`, "",
    "## Thông số kỹ thuật theo phân tích (chỉ để định hướng, trích dẫn phải lấy từ hsmt.txt)",
    ...(a?.technicalSpecs || []).map((s) => `- ${s.item}: ${s.requirement}${s.reference ? ` (${s.reference})` : ""}`), "",
    "## Phần kỹ thuật của HSMT", technicalPart(text),
  ].filter((l) => l !== null).join("\n"), "utf8");
  fs.copyFileSync(path.join(ROOT, "config-prompt.md"), path.join(dir, "prompt.md"));
  return { cap, engines: cat.engines.length, alternators: cat.alternators.length };
}

// ---------- save (agent: internet sources) ----------
async function save(dir, url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en,zh-CN;q=0.8,vi;q=0.7" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer()), type = r.headers.get("content-type") || "";
  const webDir = path.join(dir, "web"); fs.mkdirSync(webDir, { recursive: true });
  const n = fs.readdirSync(webDir).filter((f) => /^\d+\.txt$/.test(f)).length + 1;
  let text;
  if (type.includes("pdf") || /\.pdf($|\?)/i.test(url)) {
    const tmp = path.join(webDir, `${n}.pdf`); fs.writeFileSync(tmp, buf);
    text = execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 64 << 20 }).toString("utf8"); fs.unlinkSync(tmp);
  } else {
    const head = buf.subarray(0, 4000).toString("latin1");
    const cs = (type.match(/charset=([\w-]+)/i) || head.match(/charset=["']?([\w-]+)/i) || [, "utf-8"])[1].toLowerCase();
    let html; try { html = new TextDecoder(cs === "gb2312" || cs === "gbk" ? "gb18030" : cs).decode(buf); } catch { html = buf.toString("utf8"); }
    text = htmlToText(html);
  }
  const file = path.join(webDir, `${n}.txt`);
  fs.writeFileSync(file, `URL: ${r.url || url}\nAccessed: ${new Date().toISOString().slice(0, 10)}\n\n${text}\n`, "utf8");
  return `web/${n}.txt`;
}

// ---------- check ----------
// Returns { result, problems } with result fixed in place: unverified marks, "met" without proof → "unclear".
export function check(result, { hsmtText, suppliers, readWeb }) {
  const problems = [], H = norm(hsmtText);
  const sup = new Map(suppliers.map((s) => [s.id, s]));
  const inHsmt = (q) => !!q && H.includes(norm(q));
  for (const r of result.requirements || []) if (r.quote && !inHsmt(r.quote)) { r.unverified = true; problems.push(`Câu trích yêu cầu không có trong HSMT: "${r.quote.slice(0, 80)}"`); }
  // The text a part's facts must come from: its catalog row (and table header), or its saved web page.
  const sourceText = (src) => {
    if (!src) return null;
    if (src.kind === "catalog") {
      const s = sup.get(src.supplierId);
      const tables = (s?.specTables || []).filter((t) => t.n === Number(src.n));
      const t = tables.find((x) => [...(x.header || []), ...x.rows].some((l) => norm(l) === norm(src.line)));
      return t ? norm([...(t.header || []), src.line, t.title].join(" \n ")) : null;
    }
    if (src.kind === "internet") {
      const txt = src.file ? readWeb(src.file) : null;
      if (!txt) return null;
      const url = (txt.split("\n", 1)[0] || "").replace(/^URL:\s*/, "").trim().replace(/\/$/, "");
      if (src.url && url !== String(src.url).trim().replace(/\/$/, "")) problems.push(`Trang ${src.file} được lưu từ ${url}, khác link ghi trong kết quả ${src.url}`);
      return norm(txt);
    }
    return null;
  };
  result.configs = (result.configs || []).slice(0, 3);
  for (const c of result.configs) {
    const texts = {};
    for (const part of ["engine", "alternator", "genset"]) {
      const p = c[part];
      if (!p) continue;
      texts[part] = sourceText(p.src);
      if (!texts[part]) { p.unverified = true; problems.push(`#${c.rank} ${part} ${p.model}: không tìm thấy nguồn (${p.src?.kind || "?"})`); continue; }
      if (!texts[part].includes(norm(p.model).replace(/\s+/g, " ")) && !texts[part].replace(/\s/g, "").includes(norm(p.model).replace(/\s/g, ""))) { p.unverified = true; problems.push(`#${c.rank} ${part}: model ${p.model} không có trong nguồn`); }
      if (p.src?.kind === "internet" && p.src.quote && !texts[part].includes(norm(p.src.quote))) { p.unverified = true; problems.push(`#${c.rank} ${part}: câu trích web không có trong trang đã lưu`); }
      if (p.make && !texts[part].includes(norm(p.make).split(/[\s-]/)[0])) { problems.push(`#${c.rank} ${part}: hãng ${p.make} không ghi trong nguồn`); p.makeUnverified = true; }
    }
    for (const x of c.checks || []) {
      const reasons = [];
      if (x.hsmtQuote && !inHsmt(x.hsmtQuote)) reasons.push("câu trích HSMT");
      const src = texts[x.part] || texts.genset || texts.engine || texts.alternator;
      if (x.status === "met" || x.status === "not_met") {
        if (!x.sourceQuote) reasons.push("thiếu câu trích nguồn");
        else {
          const all = Object.values(texts).filter(Boolean);
          if (!all.some((t) => t.includes(norm(x.sourceQuote)))) reasons.push("câu trích nguồn");
          else { const nums = numbersIn(x.sourceQuote); for (const v of numbersIn(x.offered)) if (!nums.includes(v)) { reasons.push(`số ${v}`); break; } }
        }
      }
      if (!src && x.status !== "unclear") reasons.push("nguồn");
      if (reasons.length) {
        x.unverified = true;
        if (x.status === "met") { x.status = "unclear"; x.note = [x.note, `Code chưa tìm thấy nguyên văn (${reasons.join(", ")}) nên chưa tính là đạt.`].filter(Boolean).join(" "); }
        problems.push(`#${c.rank} ${x.item}: ${reasons.join(", ")}`);
      }
    }
  }
  if (problems.length) result.notes = [...(result.notes || []), `Kiểm tra bằng code: ${problems.length} điểm chưa khớp nguồn, đã đánh dấu ⚠.`];
  if (!result.configs.length && !result.message) result.message = "Không có động cơ và đầu phát nào trong hệ thống hay trên internet đáp ứng đủ yêu cầu của HSMT.";
  return { result, problems };
}
function checkDir(dir, suppliers) {
  const result = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
  const readWeb = (f) => { const p = path.join(dir, f); return p.startsWith(path.join(dir, "web")) && fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  return check(result, { hsmtText: fs.readFileSync(path.join(dir, "hsmt.txt"), "utf8"), suppliers, readWeb });
}

// ---------- run ----------
async function answer(req, suppliers) {
  const key = req.key, dir = path.join(os.tmpdir(), "genbid-config", key);
  fs.rmSync(dir, { recursive: true, force: true });
  // configreq keeps the request's own fields and gets doneAt (+ error); configmatch carries the verified result.
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = { notifyNo: req.notifyNo || key, bidName: req.bidName, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" };
    return post([...(result ? [{ coll: "configmatch", id: key, data: { at, result } }] : []), { coll: "configreq", id: key, data: JSON.parse(JSON.stringify(reqData)) }]);
  };
  try {
    await prep(key, dir, req);
    // Same minimal setup as the bot's agent (GenBid-Bot.ps1), plus web search for step 3 of config-prompt.md.
    const r = spawnSync(CLAUDE, ["-p", "--permission-mode", "auto", "--output-format", "text", "--model", process.env.GENBID_CONFIG_MODEL || "opus",
      "--strict-mcp-config", "--disable-slash-commands", "--tools", "Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch"],
      { cwd: dir, encoding: "utf8", timeout: 40 * 60e3, maxBuffer: 64 << 20, windowsHide: true,
        input: "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md, hsmt.txt, catalog.md, chỉ ghi result.json. Chạy không người trông, không ai trả lời câu hỏi." });
    fs.writeFileSync(path.join(os.tmpdir(), `genbid-config-${key}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
    if (!fs.existsSync(path.join(dir, "result.json"))) throw new Error(`Agent không trả kết quả${r.error ? `: ${r.error.message}` : r.status ? ` (mã ${r.status})` : ""}.`);
    const { result, problems } = checkDir(dir, suppliers);
    await done({ result, error: "" });
    console.log(`${key}: ${result.configs.length} cấu hình${problems.length ? `, ${problems.length} điểm chưa khớp nguồn` : ""}`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: lỗi ${e.message}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

const cmd = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT) {
  if (cmd === "save") console.log(await save(arg("dir", "."), arg("url")));
  else if (cmd === "prep") console.log(JSON.stringify(await prep(arg("key"), arg("out"), { bidName: arg("bid-name") })));
  else if (cmd === "check") {
    const { problems, result } = checkDir(arg("dir", "."), (await api("kind=docs&coll=supplier")).map((d) => d.data));
    fs.writeFileSync(path.join(arg("dir", "."), "result.checked.json"), JSON.stringify(result, null, 1));
    console.log(problems.length ? problems.join("\n") : "Không có điểm nào chưa khớp nguồn.");
  } else if (cmd === "post") {
    const dir = arg("dir", "."), { result } = checkDir(dir, (await api("kind=docs&coll=supplier")).map((d) => d.data));
    console.log(await post([{ coll: "configmatch", id: arg("key"), data: { at: new Date().toISOString(), result } }, { coll: "configreq", id: arg("key"), data: { notifyNo: arg("key"), requestedAt: arg("requested-at"), doneAt: new Date().toISOString(), error: "" } }]));
  } else if (cmd === "run") {
    const lock = path.join(os.tmpdir(), "genbid-config.lock");
    if (fs.existsSync(lock) && Date.now() - fs.statSync(lock).mtimeMs < 60 * 60e3) { console.log("SUMMARY: đang có lượt khác chạy"); process.exit(4); }
    fs.writeFileSync(lock, String(process.pid));
    try {
      const pending = await api("kind=config");
      if (pending.length) { const suppliers = (await api("kind=docs&coll=supplier")).map((d) => d.data); for (const req of pending) await answer(req, suppliers); }
      console.log(`SUMMARY: ${pending.length} yêu cầu gợi ý cấu hình`);
    } finally { fs.rmSync(lock, { force: true }); }
  } else { console.error("usage: config-bot.mjs run | prep --key K --out D | save --dir D --url U | check --dir D | post --dir D --key K --requested-at T"); process.exit(2); }
}
