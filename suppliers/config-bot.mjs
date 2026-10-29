// "Gợi ý" in the Cấu hình gợi ý tab, run on the Windows PC next to the GenBid bot:
//   node suppliers/config-bot.mjs run            answer every pending configreq/<TBMT> (one Claude agent per request)
//   node suppliers/config-bot.mjs prep --key <TBMT> --out <dir>
//   node suppliers/config-bot.mjs save --dir <dir> --url <url>     (used by the agent for internet sources)
//   node suppliers/config-bot.mjs check --dir <dir>                verify result.json in code (prints what failed)
//   node suppliers/config-bot.mjs post --dir <dir> --key <TBMT> --requested-at <iso>
// Data is read from and written to the web (Vercel API) with the ingest token, which is never printed.
// The agent (claude -p, Opus, with WebSearch) follows config-prompt.md. check marks every quote or number the code
// cannot find word for word in the HSMT text, the catalog row or a saved web page as unverified, and turns such a
// "met" into "unclear" (Khoa, 2026-10-28: the answer must be exactly right). A value may be converted (kW ↔ kVA,
// L/h ↔ g/kWh...) only with a formula of web/conversions.js, which check recomputes; each configuration also names
// the suppliers in the system that sell it, each checked against that supplier's own table row (Khoa, 2026-10-29).
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
// Also reads "0,8" as 0.8 (Vietnamese decimal comma).
const numbersLoose = (s) => [...numbersIn(s), ...numbersIn(String(s ?? "").replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"))];
await import(pathToFileURL(path.join(ROOT, "..", "web", "conversions.js")).href);
const CONV = globalThis.GenbidConversions;

async function api(q) {
  const r = await fetch(`${WEB}/api/requests?${q}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!r.ok) throw new Error(`${q}: HTTP ${r.status}`);
  return r.json();
}
const doc = async (coll, id) => (await api(`kind=docs&coll=${coll}&id=${encodeURIComponent(id)}`))[0]?.data;
// A network error (fetch failed) is retried: one lost post used to throw away a whole agent run (2026-10-29).
async function post(rows) {
  let r;
  for (let i = 0; ; i++) {
    try { r = await fetch(`${WEB}/api/ingest`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ rows }) }); break; }
    catch (e) { if (i >= 3) throw e; await new Promise((ok) => setTimeout(ok, 2000 * 2 ** i)); }
  }
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
      for (const u of uses.slice(0, 8)) {
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
// The suppliers behind the catalog rows, as recorded in the supplier DB (every fact there has a source).
function suppliersMd(suppliers) {
  const out = ["# Nhà cung cấp trong hệ thống (CSDL supplier/<id>)", ""];
  for (const s of suppliers) {
    if (!s.specTables?.length) continue;
    const vn = (s.vietnam?.distributors || []).map((d) => d.name).join("; "), hq = [s.hq?.city, s.hq?.province].filter(Boolean).join(", ");
    out.push(`- ${s.id}: ${s.names?.en || s.names?.zh || s.id} — vai trò: ${s.role}, trạng thái: ${s.status}, độ tin cậy: ${s.confidence}`
      + `${s.website ? `, website: ${s.website}` : ""}${hq ? `, trụ sở: ${hq}` : ""}${s.founded ? `, thành lập: ${s.founded}` : ""}`
      + `${vn ? `, đại lý tại Việt Nam: ${vn}` : ""}${s.certifications?.length ? `, chứng nhận: ${s.certifications.map((c) => c.name).join("; ")}` : ""}`);
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
  fs.writeFileSync(path.join(dir, "catalog.md"), catalogMd(cat, cap, brands) + "\n\n" + suppliersMd(suppliers.map((d) => d.data)), "utf8");
  fs.writeFileSync(path.join(dir, "input.md"), [
    `# Gói thầu ${key}`, reqData.bidName ? `Tên gói: ${reqData.bidName}` : "", cap ? `Công suất đọc được: ${cap.value} ${cap.unit} (chỉ để lọc danh mục; yêu cầu thật lấy từ HSMT)` : "Chưa đọc được công suất từ tên gói / phân tích.",
    `Lệnh lưu trang web: node "${SCRIPT}" save --dir . --url "<url>"`, "",
    "## Thông số kỹ thuật theo phân tích (chỉ để định hướng, trích dẫn phải lấy từ hsmt.txt)",
    ...(a?.technicalSpecs || []).map((s) => `- ${s.item}: ${s.requirement}${s.reference ? ` (${s.reference})` : ""}`), "",
    "## Phần kỹ thuật của HSMT", technicalPart(text),
  ].filter((l) => l !== null).join("\n"), "utf8");
  // The allowed formulas, written from web/conversions.js so the prompt and the check use the same list.
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "config-prompt.md"), "utf8") + "\n## Công thức được phép\n"
    + Object.entries(CONV.FORMULAS).map(([id, f]) => `- \`${id}\`: ${f.label} — đầu vào ${f.inputs.map((n) => `\`${n}\``).join(", ")}; cơ sở: ${f.basis}${f.standard ? `; giá trị chuẩn: ${Object.entries(f.standard).map(([n, st]) => `\`${n}\` = ${st.min}–${st.max} ${st.unit} (${st.basis})`).join("; ")}` : ""}`).join("\n") + "\n", "utf8");
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
  result.configs = (result.configs || []).slice(0, 10);
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
      // Conversions: recomputed here from web/conversions.js; each input must be in the source / HSMT quote, a standard
      // constant of that formula, or the result of an earlier conversion of this check.
      const calc = [], used = [];
      for (const cv of x.conversions || []) {
        const r = CONV.compute(cv);
        if (r.error) { reasons.push(`quy đổi: ${r.error}`); cv.invalid = true; continue; }
        const f = CONV.FORMULAS[cv.formula];
        // The formula's own constants (1000, 120, √3 written as 1,732...) may appear in the offered text.
        used.push(...numbersIn(f.label.replace(/(\d),(\d+)/g, "$1.$2")), ...(f.label.includes("√3") ? [3, 1.73, 1.732] : []));
        for (const i of cv.inputs || []) {
          const v = Number(i.value);
          if (i.from === "source" && !numbersLoose(x.sourceQuote).includes(v)) reasons.push(`đầu vào ${i.name} = ${i.value} không có trong câu trích nguồn`);
          else if (i.from === "hsmt" && !numbersLoose(x.hsmtQuote).includes(v)) reasons.push(`đầu vào ${i.name} = ${i.value} không có trong câu trích HSMT`);
          else if (i.from === "calc" && !calc.some((c) => CONV.matches(v, c))) reasons.push(`đầu vào ${i.name} = ${i.value} không phải kết quả quy đổi trước`);
          else if (!["source", "hsmt", "calc", "standard"].includes(i.from)) reasons.push(`đầu vào ${i.name} không ghi lấy từ đâu`);
          const st = f.standard?.[i.name];
          used.push(...(i.from === "standard" && st ? [st.min, st.max] : [v]));
        }
        const stated = Array.isArray(cv.value) ? cv.value : cv.value != null ? [Number(cv.value)] : [];
        if (stated.some((v) => !CONV.matches(v, r.value))) reasons.push(`kết quả quy đổi ${cv.formula} ghi sai`);
        Object.assign(cv, { value: r.value, unit: f.unit, label: f.label, basis: f.basis });
        calc.push(r.value);
      }
      if (x.status === "met" || x.status === "not_met") {
        if (!x.sourceQuote) reasons.push("thiếu câu trích nguồn");
        else {
          const all = Object.values(texts).filter(Boolean);
          if (!all.some((t) => t.includes(norm(x.sourceQuote)))) reasons.push("câu trích nguồn");
          else {
            // Every number offered is in the source quote, is an input of a conversion, or is a recomputed result.
            const nums = numbersLoose(x.sourceQuote);
            const ok = (v) => nums.includes(v) || used.includes(v) || calc.some((c) => CONV.matches(v, c));
            for (const v of numbersIn(String(x.offered ?? "").replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"))) if (!ok(v)) { reasons.push(`số ${v}`); break; }
          }
        }
      }
      if (!src && x.status !== "unclear") reasons.push("nguồn");
      if (reasons.length) {
        x.unverified = true;
        if (x.status === "met") { x.status = "unclear"; x.note = [x.note, `Code chưa tìm thấy nguyên văn (${reasons.join(", ")}) nên chưa tính là đạt.`].filter(Boolean).join(" "); }
        problems.push(`#${c.rank} ${x.item}: ${reasons.join(", ")}`);
      }
    }
    // Suppliers: only ids of the supplier DB, each with a row of its own tables that names this engine (and alternator).
    const squash = (s) => norm(s).replace(/\s/g, "");
    c.suppliers = (c.suppliers || []).filter((s) => {
      if (sup.has(s.supplierId)) return true;
      problems.push(`#${c.rank}: nhà cung cấp ${s.supplierId} không có trong hệ thống, đã bỏ`);
      return false;
    }).slice(0, 3);
    for (const s of c.suppliers) {
      const t = (sup.get(s.supplierId).specTables || []).find((x) => x.n === Number(s.n) && x.rows.some((l) => norm(l) === norm(s.line)));
      const row = t ? squash([...(t.header || []), s.line, t.title].join(" ")) : "";
      if (!t) { s.unverified = true; problems.push(`#${c.rank}: dòng bảng của ${s.supplierId} không có trong CSDL`); continue; }
      if (c.engine?.model && !row.includes(squash(c.engine.model))) { s.unverified = true; problems.push(`#${c.rank}: dòng của ${s.supplierId} không ghi động cơ ${c.engine.model}`); }
      s.hasAlternator = !!c.alternator?.model && row.includes(squash(c.alternator.model));
    }
    if (!c.suppliers.length) c.gaps = [...(c.gaps || []), "Chưa có nhà cung cấp nào trong hệ thống có dòng bảng chào đúng cấu hình này."];
  }
  if (problems.length) result.notes = [...(result.notes || []), `Kiểm tra bằng code: ${problems.length} điểm chưa khớp nguồn, đã đánh dấu ⚠.`];
  if (!result.configs.length && !result.message) result.message = "Không có động cơ và đầu phát nào trong hệ thống hay trên internet đáp ứng đủ yêu cầu của HSMT.";
  return { result, problems };
}
function checkDir(dir, suppliers, added = []) {
  const result = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
  // A supplier added from the internet: its rows were numbered in newCatalog.json, renumbered when added.
  for (const a of added) if (a.nmap) for (const c of result.configs || []) for (const s of c.suppliers || []) if (s.supplierId === a.supplierId && a.nmap[s.n] != null) s.n = a.nmap[s.n];
  if (added.length) result.catalogAdded = added.map(({ nmap, ...a }) => a);
  const readWeb = (f) => { const p = path.join(dir, f); return p.startsWith(path.join(dir, "web")) && fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  return check(result, { hsmtText: fs.readFileSync(path.join(dir, "hsmt.txt"), "utf8"), suppliers, readWeb });
}

// ---------- add internet finds to the catalog ----------
// newCatalog.json (agent, only after an internet search): supplier records in the schema.json shape whose sources
// point at pages saved with `save` (web/<k>.txt). For a supplier already in the system only its new sources,
// productLines and specTables are added. Sources are renumbered after the record's own (from 2001) and the saved
// page becomes sources/<id>/<n>.md, the way fetch-source.mjs writes it (Khoa, 2026-10-29).
export function catalogRecords(entries, { existing, readWeb, today }) {
  const out = [];
  for (const e of Array.isArray(entries) ? entries : []) {
    const id = String(e?.id || "");
    if (!/^[a-z0-9-]+$/.test(id)) { out.push({ id, error: "id không hợp lệ" }); continue; }
    const old = existing.get(id) || null, files = {}, nmap = new Map(), sources = [];
    let next = Math.max(2000, ...(old?.sources || []).map((s) => s.n)) + 1, error = "";
    for (const s of e.sources || []) {
      const txt = /^web\/\d+\.txt$/.test(s.file || "") ? readWeb(s.file) : null;
      if (!txt) { error = `nguồn ${s.n}: không có trang đã lưu ${s.file}`; break; }
      const [, url = "", accessed = ""] = txt.match(/^URL:\s*(\S+)\s*\nAccessed:\s*(\S+)/) || [];
      const n = next++, file = `sources/${id}/${n}.md`;
      nmap.set(Number(s.n), n); files[file] = txt;
      sources.push({ n, url, accessedAt: accessed, tier: s.tier, quote: s.quote, file });
    }
    if (error) { out.push({ id, error }); continue; }
    const re = (src) => (Array.isArray(src) ? src.map((n) => nmap.get(Number(n)) ?? -1) : src);
    const lines = (e.productLines || []).map((p) => ({ ...p, src: re(p.src), ...(p.power ? { power: { ...p.power, src: re(p.power.src) } } : {}) }));
    const tables = (e.specTables || []).map((t) => ({ ...t, n: nmap.get(Number(t.n)) ?? -1 }));
    const rec = old
      ? { ...old, sources: [...old.sources, ...sources], productLines: [...(old.productLines || []), ...lines], specTables: [...(old.specTables || []), ...tables], checkedAt: today }
      : { country: e.country, role: e.role, status: "partial", names: e.names || {}, website: e.website || null, hq: e.hq || { province: null, city: null },
        founded: null, relatedIds: [], strengths: (e.strengths || []).map((x) => ({ ...x, src: re(x.src) })), productLines: lines,
        certifications: (e.certifications || []).map((x) => ({ ...x, src: re(x.src) })), exportMarkets: [], missing: e.missing || [],
        sources, confidence: e.confidence, checkedAt: today, checkedBy: "config-bot", specTables: tables, id };
    out.push({ id, rec, files, nmap, isNew: !old, tables: tables.length });
  }
  return out;
}

const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
// Writes the records into a fresh worktree of the repo (origin/main), checks them with that tree's verify.mjs, posts
// the ones that pass to the web as supplier/<id> and opens a pull request with them (records, saved pages).
export async function addToCatalog(dir, key, suppliers) {
  const file = path.join(dir, "newCatalog.json");
  if (!fs.existsSync(file)) return { added: [], records: [] };
  const repo = process.env.GENBID_REPO_DIR || path.join(ROOT, ".."), wt = path.join(os.tmpdir(), "genbid-catalog", key), branch = `catalog/${key.toLowerCase()}`;
  fs.rmSync(wt, { recursive: true, force: true });
  git(repo, "fetch", "-q", "origin", "main");
  git(repo, "worktree", "add", "-f", "-B", branch, wt, "origin/main");
  const added = [], records = [];
  try {
    const { checkRecord } = await import(pathToFileURL(path.join(wt, "suppliers", "verify.mjs")).href + `?${Date.now()}`);
    // The repo copy of a record comes with its saved pages, which verify.mjs reads.
    const existing = new Map(suppliers.map((s) => [s.id, s])), cnDir = path.join(wt, "suppliers", "cn");
    for (const f of fs.readdirSync(cnDir).filter((f) => f.endsWith(".json"))) existing.set(f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8")));
    const readWeb = (f) => { const p = path.join(dir, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
    for (const x of catalogRecords(JSON.parse(fs.readFileSync(file, "utf8")), { existing, readWeb, today: new Date().toISOString().slice(0, 10) })) {
      if (x.error) { added.push({ supplierId: x.id, error: x.error }); continue; }
      for (const [f, txt] of Object.entries(x.files)) { fs.mkdirSync(path.dirname(path.join(wt, "suppliers", f)), { recursive: true }); fs.writeFileSync(path.join(wt, "suppliers", f), txt, "utf8"); }
      const recFile = path.join(wt, "suppliers", "cn", `${x.id}.json`);
      const { errors } = checkRecord(x.rec, recFile);
      if (errors.length) {
        for (const f of Object.keys(x.files)) fs.rmSync(path.join(wt, "suppliers", f), { force: true });
        added.push({ supplierId: x.id, error: `verify.mjs: ${errors.slice(0, 4).join("; ")}${errors.length > 4 ? ` (+${errors.length - 4})` : ""}` });
        continue;
      }
      fs.writeFileSync(recFile, JSON.stringify(x.rec, null, 1) + "\n", "utf8");
      records.push(x.rec);
      added.push({ supplierId: x.id, name: x.rec.names?.en || x.rec.names?.zh || x.id, isNew: x.isNew, tables: x.tables, nmap: Object.fromEntries(x.nmap) });
    }
    // GENBID_CATALOG_DRY=1: check only, nothing is posted or pushed.
    if (records.length && !process.env.GENBID_CATALOG_DRY) {
      await post(records.map((r) => ({ coll: "supplier", id: r.id, data: r })));
      try {
        git(wt, "add", "-A", "suppliers");
        git(wt, "-c", `user.name=${process.env.GENBID_GIT_NAME || "GenBid Bot"}`, "-c", `user.email=${process.env.GENBID_GIT_EMAIL || "genbid-bot@users.noreply.github.com"}`,
          "commit", "-q", "-m", `Danh mục: bổ sung từ Gợi ý cấu hình ${key} (${records.map((r) => r.id).join(", ")})`);
        git(wt, "push", "-q", "-f", "-u", "origin", branch);
        const pr = execFileSync(process.env.GENBID_GH || "gh", ["pr", "create", "--head", branch, "--base", "main", "--title", `Danh mục: bổ sung từ Gợi ý cấu hình ${key}`,
          "--body", `Tìm trên internet khi Gợi ý cấu hình gói ${key} không có nhà cung cấp phù hợp trong hệ thống. Bản ghi đã qua verify.mjs và đã đăng lên web.`], { cwd: wt, encoding: "utf8" }).trim();
        for (const a of added) if (!a.error) a.pr = pr.split("\n").pop();
      } catch (e) { for (const a of added) if (!a.error) a.prError = `Đã đăng lên web nhưng chưa mở được PR vào repo: ${String(e.stderr || e.message).trim().slice(0, 200)}`; }
    }
  } finally {
    try { git(repo, "worktree", "remove", "-f", wt); } catch { fs.rmSync(wt, { recursive: true, force: true }); }
    try { git(repo, "branch", "-D", branch); } catch {}
  }
  return { added, records };
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
        input: "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md, hsmt.txt, catalog.md, chỉ ghi result.json (và newCatalog.json khi prompt.md yêu cầu). Chạy không người trông, không ai trả lời câu hỏi." });
    fs.writeFileSync(path.join(os.tmpdir(), `genbid-config-${key}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
    if (!fs.existsSync(path.join(dir, "result.json"))) throw new Error(`Agent không trả kết quả${r.error ? `: ${r.error.message}` : r.status ? ` (mã ${r.status})` : ""}.`);
    // Internet finds that pass verify.mjs join the catalog first, so the configuration's suppliers can point at them.
    const { added, records } = await addToCatalog(dir, key, suppliers).catch((e) => ({ added: [{ error: `Chưa bổ sung được vào danh mục: ${e.message}` }], records: [] }));
    const all = [...suppliers.filter((s) => !records.some((r) => r.id === s.id)), ...records];
    const { result, problems } = checkDir(dir, all, added);
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
