// "Gợi ý" in the Cấu hình gợi ý tab, run on the Windows PC next to the GenBid bot:
//   node suppliers/config-bot.mjs run            answer every pending configreq/<TBMT> (one Claude agent per request)
//                                                and findreq/<TBMT> (Tìm NCC: Gemini first, then Claude, find-prompt.md;
//                                                the suppliers it adds go into configmatch/<TBMT> in code, no agent)
//   node suppliers/config-bot.mjs merge-find --key <TBMT>          do that again from the stored findmatch
//   node suppliers/config-bot.mjs find-check --dir <dir>          check newCatalog.json of a Tìm NCC folder in code
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
// "Xuất xứ" (configreq origin: cn, default / g7 / g20 / other / all) limits the engines to Chinese makes (or any make a
// supplier based in China offers, Khoa 2026-11-02), to makes of a G7 / G20
// country (catalog.js ENGINE_COUNTRY, Khoa 2026-11-02) or to foreign ones
// (web/catalog.js originOf); check drops a configuration whose engine is of the other origin (Khoa, 2026-10-29).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync, execFileSync } from "node:child_process";
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
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
export const ORIGIN = { cn: "Trung Quốc", g7: "G7 (Mỹ, Anh, Đức, Pháp, Ý, Nhật, Canada)", g20: "G20 (các nước thành viên trừ Trung Quốc)", other: "Khác (không phải Trung Quốc)", all: "Tất cả" };
const GROUP_ORIGIN = new Set(["g7", "g20"]);
const originOfReq = (o) => (ORIGIN[o] ? o : "cn");
const extraOf = (req) => String(req?.extra || "").trim().slice(0, 2000);

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
// Engines of the origin asked for: "cn" keeps engines a source shows to be of a Chinese make (one whose make no
// source gives is left out, Khoa 2026-10-29) and, since 2026-11-02 (Khoa), an engine of a foreign make that a supplier
// based in China offers in its own table (cnSupplier: id → true for a supplier whose country is CN);
// "other" only engines a source or the model code shows to be foreign.
export const cnSuppliers = (suppliers) => new Set(suppliers.filter((s) => s?.country === "CN").map((s) => s.id));
export function byOrigin(engines, origin, cn = new Set()) {
  if (origin === "cn") return engines.filter((e) => CAT.originOf(e) === "cn" || (CAT.originOf(e) === "other" && (e.uses || []).some((u) => cn.has(u.supplierId))));
  if (origin === "other") return engines.filter((e) => CAT.originOf(e) === "other");
  // G7 / G20 (Khoa, 2026-11-02): engines whose make is from a country of the group (web/catalog.js ENGINE_COUNTRY).
  if (GROUP_ORIGIN.has(origin)) return engines.filter((e) => CAT.groupOf(e, origin));
  return engines;
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
  // A table's header is written once, at the end (it was repeated on every row, 400 KB of 480); a header that took in
  // the table's rows (some run to 10 000 characters) is cut, its column titles come first.
  const headers = new Map(), shown = new Set();
  for (const [title, list] of [["Động cơ", pick(cat.engines)], ["Đầu phát", pick(cat.alternators)]]) {
    out.push(`## ${title} (${list.length})`, "");
    for (const e of list) {
      out.push(`### ${e.model}${e.make ? ` — hãng: ${e.make} (theo ${[...new Set(e.makes.map((m) => m.via))].join(", ")})` : " — nguồn không ghi hãng"}`);
      // A supplier's row that is word for word in two of its tables (the same page saved twice) is listed once.
      const seen = new Set(), uses = (cap ? e.uses.slice().sort((a, b) => Math.abs(rowPower(a, cap) - cap.value) - Math.abs(rowPower(b, cap) - cap.value)) : e.uses)
        .filter((u) => { const k = `${u.supplierId}\n${u.line || (u.lines?.rows || []).join("\n")}`; return !seen.has(k) && seen.add(k); });
      for (const u of uses.slice(0, 8)) {
        shown.add(u.supplierId);
        out.push(`- supplierId: ${u.supplierId}, n: ${u.n}${u.genset ? `, tổ máy: ${u.genset}` : ""}${u.other ? `, đi kèm: ${u.other}` : ""}`);
        if (u.header?.length) headers.set(`${u.supplierId} n ${u.n}`, u.header.join(" "));
        out.push(u.line ? `  line: ${u.line}` : `  bảng một model: ${(u.lines?.rows || []).join(" ; ")}`);
        // Figures read from that row by column title (web/catalog.js), each in the row word for word.
        if (u.specs?.length) out.push(`  thông số: ${u.specs.map((x) => `${x.label} = ${x.value}`).join(" ; ")}`);
      }
      out.push("");
    }
  }
  out.push("## Tiêu đề bảng (header của mỗi bảng supplierId n, dùng được cho sourceQuote)", "");
  for (const [k, h] of headers) out.push(`- ${k}: ${h.length > 600 ? h.slice(0, 600) + " …" : h}`);
  out.push("", controllersMd(cat.controllers || [], shown));
  return out.join("\n");
}
// Bộ điều khiển (Khoa, 2026-11-01): the controllers each supplier offers, with the line of its page or genset row that
// names it; a configuration's controller and its "Bộ điều khiển" check quote one of these lines.
// Only the suppliers whose rows catalog.md shows, so the file stays small.
function controllersMd(all, ids) {
  const list = all.filter((e) => e.uses.some((u) => ids.has(u.supplierId)));
  const out = [`## Bộ điều khiển (${list.length}) — của các nhà cung cấp có dòng ở trên, dòng nguyên văn trên trang của họ`, ""];
  for (const e of list) {
    out.push(`### ${e.model}${e.make ? ` — hãng: ${e.make}` : ""}`);
    const seen = new Set();
    for (const u of e.uses) {
      if (!ids.has(u.supplierId) || seen.has(u.supplierId) || seen.size >= 8) continue;
      seen.add(u.supplierId);
      out.push(`- supplierId: ${u.supplierId}, n: ${u.n}${u.genset ? `, tổ máy: ${u.genset}` : ""}${u.other ? `, động cơ trong dòng: ${u.other}` : ""}`, `  line: ${u.line}`);
    }
    out.push("");
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
      + `${s.country ? `, quốc gia: ${s.country}` : ""}${s.website ? `, website: ${s.website}` : ""}${hq ? `, trụ sở: ${hq}` : ""}${s.founded ? `, thành lập: ${s.founded}` : ""}`
      + `${vn ? `, đại lý tại Việt Nam: ${vn}` : ""}${s.certifications?.length ? `, chứng nhận: ${s.certifications.map((c) => c.name).join("; ")}` : ""}`
      + `${s.controllers?.length ? `, bộ điều khiển: ${s.controllers.map((c) => c.model || `${c.brand} (không ghi model)`).join("; ")}` : ""}`);
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
  const origin = originOfReq(reqData.origin), full = CAT.build(suppliers.map((d) => d.data));
  const cat = { ...full, engines: byOrigin(full.engines, origin, cnSuppliers(suppliers.map((d) => d.data))) };
  fs.writeFileSync(path.join(dir, "catalog.md"), catalogMd(cat, cap, brands) + "\n\n" + suppliersMd(suppliers.map((d) => d.data)), "utf8");
  // Lets the agent run `check --dir .` itself, offline, instead of reading this script to check by hand.
  fs.writeFileSync(path.join(dir, "suppliers.json"), JSON.stringify(suppliers.map((d) => d.data)), "utf8");
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin }), "utf8");
  fs.writeFileSync(path.join(dir, "input.md"), [
    `# Gói thầu ${key}`, reqData.bidName ? `Tên gói: ${reqData.bidName}` : "", cap ? `Công suất đọc được: ${cap.value} ${cap.unit} (chỉ để lọc danh mục; yêu cầu thật lấy từ HSMT)` : "Chưa đọc được công suất từ tên gói / phân tích.",
    `Lệnh lưu trang web: node "${SCRIPT}" save --dir . --url "<url>"`,
    `Lệnh kiểm tra result.json: node "${SCRIPT}" check --dir .`, "",
    `## Xuất xứ động cơ: ${ORIGIN[origin]}`,
    origin === "cn" ? `Gợi ý động cơ mà nguồn ghi rõ là hãng Trung Quốc (Weichai, Yuchai, SDEC...), ghi "make" của động cơ; động cơ nguồn không ghi hãng thì không gợi ý. Động cơ hãng nước khác (${[...CAT.FOREIGN_ENGINE].join(", ")}, kể cả loại sản xuất theo giấy phép như Dongfeng Cummins, Chongqing Cummins) chỉ được gợi ý khi có nhà cung cấp đặt tại Trung Quốc (quốc gia CN trong catalog.md) chào động cơ đó trong bảng của mình; khi đó "suppliers" chỉ ghi các nhà cung cấp ở Trung Quốc đó. Khi tìm trên internet cũng vậy: hãng nước ngoài chỉ được tính khi trang của một nhà cung cấp ở Trung Quốc chào nó.`
    : GROUP_ORIGIN.has(origin) ? `Chỉ gợi ý động cơ của hãng thuộc một nước ${origin.toUpperCase()} (${CAT.COUNTRY_GROUP[origin].join(", ")}; hãng nước ngoài: ${Object.entries(CAT.ENGINE_COUNTRY).filter(([, c]) => CAT.COUNTRY_GROUP[origin].includes(c)).map(([n, c]) => `${n} ${c}`).join(", ")}), kể cả khi tìm trên internet; ghi "make" của động cơ. Không gợi ý động cơ của hãng Trung Quốc (Weichai, Yuchai, SDEC...), kể cả loại sản xuất theo giấy phép. Động cơ nguồn không ghi hãng thì không gợi ý.`
    : origin === "other" ? `Chỉ gợi ý động cơ của hãng ngoài Trung Quốc (${[...CAT.FOREIGN_ENGINE].join(", ")}), kể cả khi tìm trên internet; ghi "make" của động cơ. Không gợi ý động cơ của hãng Trung Quốc (Weichai, Yuchai, SDEC...).`
    : "Không giới hạn xuất xứ động cơ.", "",
    // Yêu cầu khác (Khoa, 2026-11-01): typed on the web next to Gợi ý / Tìm NCC, checked like the HSMT's requirements.
    ...(extraOf(reqData) ? ["## Yêu cầu khác (người dùng nhập trên web, bắt buộc kiểm tra như yêu cầu của HSMT)", extraOf(reqData), ""] : []),
    "## Thông số kỹ thuật theo phân tích (chỉ để định hướng, trích dẫn phải lấy từ hsmt.txt)",
    ...(a?.technicalSpecs || []).map((s) => `- ${s.item}: ${s.requirement}${s.reference ? ` (${s.reference})` : ""}`), "",
    "## Phần kỹ thuật của HSMT", technicalPart(text),
  ].filter((l) => l !== null).join("\n"), "utf8");
  // The allowed formulas, written from web/conversions.js so the prompt and the check use the same list.
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "config-prompt.md"), "utf8") + "\n## Công thức được phép\n"
    + Object.entries(CONV.FORMULAS).map(([id, f]) => `- \`${id}\`: ${f.label} — đầu vào ${f.inputs.map((n) => `\`${n}\``).join(", ")}; cơ sở: ${f.basis}${f.standard ? `; giá trị chuẩn: ${Object.entries(f.standard).map(([n, st]) => `\`${n}\` = ${st.min}–${st.max} ${st.unit} (${st.basis})`).join("; ")}` : ""}`).join("\n") + "\n", "utf8");
  return { cap, origin, engines: cat.engines.length, alternators: cat.alternators.length };
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
export function check(result, { hsmtText, suppliers, readWeb, origin }) {
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
    // A controller (Khoa, 2026-11-01): one of the lines the supplier's `controllers` were read from (controllers.mjs).
    if (src.kind === "controller") {
      const c = (sup.get(src.supplierId)?.controllers || []).find((x) => norm(x.line) === norm(src.line) && (src.n == null || (x.src || []).includes(Number(src.n))));
      return c ? norm(c.line) : null;
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
  // An engine of the other origin is not a suggestion, nor, under "cn", one whose make the source does not give
  // (Khoa, 2026-10-29). Under "cn" a foreign engine stays when a supplier based in China offers it in a row of its own
  // table that names the engine; that configuration then lists only such suppliers (Khoa, 2026-11-02). The make counts only as the source states it: the catalog row (header, title), or for an
  // internet source the quote, plus the make the agent wrote when the saved page has it.
  if (origin === "cn" || origin === "other" || GROUP_ORIGIN.has(origin)) {
    result.configs = (result.configs || []).filter((c) => {
      const e = c.engine;
      if (!e) return true;
      const page = e.src?.kind === "internet" && e.src.file ? norm(readWeb(e.src.file) || "") : "";
      const own = e.src?.kind === "catalog" ? sourceText(e.src) : `${e.src?.quote || ""} ${e.make && page.includes(norm(e.make)) ? e.make : ""}`;
      const o = CAT.originIn(`${e.model || ""} ${own || ""}`, e.model);
      const cnRow = (x) => sup.get(x.supplierId)?.country === "CN" && (sup.get(x.supplierId).specTables || []).some((t) => t.n === Number(x.n) && t.rows.some((l) => norm(l) === norm(x.line))
        && [...(t.header || []), x.line, t.title].join(" ").replace(/s/g, "").toLowerCase().includes(String(e.model || "").replace(/s/g, "").toLowerCase()));
      const viaCn = origin === "cn" && o === "other" && !!e.model && (c.suppliers || []).some(cnRow);
      if (viaCn) c.suppliers = c.suppliers.filter(cnRow);
      const drop = GROUP_ORIGIN.has(origin) ? !CAT.groupIn(`${e.model || ""} ${own || ""}`, e.model, origin) : origin === "cn" ? o !== "cn" && !viaCn : o !== "other";
      if (drop) problems.push(`#${c.rank}: động cơ ${e.model}${e.make ? ` (${e.make})` : ""} ${GROUP_ORIGIN.has(origin) ? `nguồn không cho thấy là hãng của nước ${origin.toUpperCase()}` : origin === "cn" ? (o === "other" ? "không phải hãng Trung Quốc và không có nhà cung cấp ở Trung Quốc chào" : "nguồn không ghi hãng") : "không rõ là hãng ngoài Trung Quốc"}, đã bỏ`);
      return !drop;
    });
    result.origin = origin;
  }
  result.configs = (result.configs || []).slice(0, 10);
  for (const c of result.configs) {
    const texts = {};
    for (const part of ["engine", "alternator", "genset", "controller"]) {
      const p = c[part];
      if (!p) continue;
      texts[part] = sourceText(p.src);
      if (!texts[part]) { p.unverified = true; problems.push(`#${c.rank} ${part} ${p.model}: không tìm thấy nguồn (${p.src?.kind || "?"})`); continue; }
      if (!texts[part].includes(norm(p.model).replace(/\s+/g, " ")) && !texts[part].replace(/\s/g, "").includes(norm(p.model).replace(/\s/g, ""))) { p.unverified = true; problems.push(`#${c.rank} ${part}: model ${p.model} không có trong nguồn`); }
      if (p.src?.kind === "internet" && p.src.quote && !texts[part].includes(norm(p.src.quote))) { p.unverified = true; problems.push(`#${c.rank} ${part}: câu trích web không có trong trang đã lưu`); }
      // A controller's make may come from its model code (DSE… is Deep Sea, HGM… SmartGen), as web/catalog.js reads it.
      const makeOfCode = part === "controller" && CAT.controllersIn(p.model).some((x) => x.model && x.brand === p.make);
      if (p.make && !makeOfCode && !texts[part].includes(norm(p.make).split(/[\s-]/)[0])) { problems.push(`#${c.rank} ${part}: hãng ${p.make} không ghi trong nguồn`); p.makeUnverified = true; }
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
      const ck = c.controller?.model && CAT.keyOf(c.controller.model);
      s.hasController = !!ck && (row.includes(squash(c.controller.model)) || (sup.get(s.supplierId).controllers || []).some((x) => x.model && CAT.keyOf(x.model) === ck));
    }
    if (!c.suppliers.length) c.gaps = [...(c.gaps || []), "Chưa có nhà cung cấp nào trong hệ thống có dòng bảng chào đúng cấu hình này."];
  }
  if (problems.length) result.notes = [...(result.notes || []), `Kiểm tra bằng code: ${problems.length} điểm chưa khớp nguồn, đã đánh dấu ⚠.`];
  if (!result.configs.length && !result.message) result.message = "Không có động cơ và đầu phát nào trong hệ thống hay trên internet đáp ứng đủ yêu cầu của HSMT.";
  return { result, problems };
}
function checkDir(dir, suppliers, added = [], origin) {
  const result = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
  // A supplier added from the internet: its rows were numbered in newCatalog.json, renumbered when added.
  for (const a of added) if (a.nmap) for (const c of result.configs || []) for (const s of c.suppliers || []) if (s.supplierId === a.supplierId && a.nmap[s.n] != null) s.n = a.nmap[s.n];
  if (added.length) result.catalogAdded = added.map(({ nmap, ...a }) => a);
  const readWeb = (f) => { const p = path.join(dir, f); return p.startsWith(path.join(dir, "web")) && fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  return check(result, { hsmtText: fs.readFileSync(path.join(dir, "hsmt.txt"), "utf8"), suppliers, readWeb, origin });
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
    // 2001–2999: pages of internet finds; 3001–3999 belong to controllers.mjs --crawl.
    let next = Math.max(2000, ...(old?.sources || []).map((s) => s.n).filter((n) => n < 3000)) + 1, error = "";
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
    const ctrls = (e.controllers || []).map((c) => ({ brand: c.brand, model: c.model || null, text: c.text, line: c.line, src: re(c.src) }));
    const rec = old
      ? { ...old, sources: [...old.sources, ...sources], productLines: [...(old.productLines || []), ...lines], specTables: [...(old.specTables || []), ...tables], ...(ctrls.length ? { controllers: [...(old.controllers || []), ...ctrls] } : {}), checkedAt: today }
      : { country: e.country, role: e.role, status: "partial", names: e.names || {}, website: e.website || null, hq: e.hq || { province: null, city: null },
        founded: null, relatedIds: [], strengths: (e.strengths || []).map((x) => ({ ...x, src: re(x.src) })), productLines: lines,
        certifications: (e.certifications || []).map((x) => ({ ...x, src: re(x.src) })), exportMarkets: [], missing: e.missing || [],
        sources, confidence: e.confidence, checkedAt: today, checkedBy: "config-bot", specTables: tables, ...(ctrls.length ? { controllers: ctrls } : {}), id };
    out.push({ id, rec, files, nmap, isNew: !old, tables: tables.length });
  }
  return out;
}

const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
// Writes the records into a fresh worktree of the repo (origin/main), checks them with that tree's verify.mjs, posts
// the ones that pass to the web as supplier/<id> and opens a pull request with them (records, saved pages).
// opts (Tìm NCC): its own branch and PR title, so a Gemini round and a Claude round never share a branch.
// The repo is private on the Free plan, so GitHub auto-merge is off. A detached process waits for CI on the PR and
// squash-merges it when every check passes; a failed check leaves the PR open. The run does not wait for it.
function mergeWhenGreen(pr, cwd) {
  const gh = process.env.GENBID_GH || "gh";
  const code = `const { spawnSync } = require("node:child_process"), [gh, pr] = process.argv.slice(1);
setTimeout(() => {
  const opt = { stdio: "ignore", windowsHide: true };
  if (spawnSync(gh, ["pr", "checks", pr, "--watch", "--fail-fast", "--interval", "20"], opt).status === 0)
    spawnSync(gh, ["pr", "merge", pr, "--squash", "--delete-branch"], opt);
}, 30000);`;
  try { spawn(process.execPath, ["-e", code, gh, pr], { cwd: os.tmpdir(), detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch {}
}

export async function addToCatalog(dir, key, suppliers, opts = {}) {
  const file = path.join(dir, "newCatalog.json");
  if (!fs.existsSync(file)) return { added: [], records: [] };
  const repo = process.env.GENBID_REPO_DIR || path.join(ROOT, ".."), branch = opts.branch || `catalog/${key.toLowerCase()}`;
  const wt = path.join(os.tmpdir(), "genbid-catalog", branch.replace(/[^\w-]+/g, "-"));
  const title = opts.title || `Danh mục: bổ sung từ Gợi ý cấu hình ${key}`;
  const body = opts.body || `Tìm trên internet khi Gợi ý cấu hình gói ${key} không có nhà cung cấp phù hợp trong hệ thống. Bản ghi đã qua verify.mjs và đã đăng lên web.`;
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
      fs.writeFileSync(recFile, JSON.stringify(x.rec, null, 2) + "\n", "utf8");
      records.push(x.rec);
      added.push({ supplierId: x.id, name: x.rec.names?.en || x.rec.names?.zh || x.id, isNew: x.isNew, tables: x.tables, nmap: Object.fromEntries(x.nmap) });
    }
    // GENBID_CATALOG_DRY=1: check only, nothing is posted or pushed.
    if (records.length && !process.env.GENBID_CATALOG_DRY) {
      await post(records.map((r) => ({ coll: "supplier", id: r.id, data: r })));
      try {
        git(wt, "add", "-A", "suppliers");
        git(wt, "-c", `user.name=${process.env.GENBID_GIT_NAME || "GenBid Bot"}`, "-c", `user.email=${process.env.GENBID_GIT_EMAIL || "genbid-bot@users.noreply.github.com"}`,
          "commit", "-q", "-m", `${title} (${records.map((r) => r.id).join(", ")})`);
        git(wt, "push", "-q", "-f", "-u", "origin", branch);
        const pr = execFileSync(process.env.GENBID_GH || "gh", ["pr", "create", "--head", branch, "--base", "main", "--title", title, "--body", body], { cwd: wt, encoding: "utf8" }).trim();
        for (const a of added) if (!a.error) a.pr = pr.split("\n").pop();
        mergeWhenGreen(pr.split("\n").pop(), wt);
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
    const reqData = { notifyNo: req.notifyNo || key, bidName: req.bidName, origin: req.origin, extra: req.extra, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" };
    return post([...(result ? [{ coll: "configmatch", id: key, data: { at, result } }] : []), { coll: "configreq", id: key, data: JSON.parse(JSON.stringify(reqData)) }]);
  };
  try {
    await prep(key, dir, req);
    // Same minimal setup as the bot's agent (GenBid-Bot.ps1), plus web search for step 3 of config-prompt.md.
    const r = runClaude(dir, "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md, hsmt.txt, catalog.md, chỉ ghi result.json (và newCatalog.json khi prompt.md yêu cầu). Chạy không người trông, không ai trả lời câu hỏi.");
    fs.writeFileSync(path.join(os.tmpdir(), `genbid-config-${key}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
    if (!fs.existsSync(path.join(dir, "result.json"))) throw new Error(`Agent không trả kết quả${r.error ? `: ${r.error.message}` : r.status ? ` (mã ${r.status})` : ""}.`);
    // Internet finds that pass verify.mjs join the catalog first, so the configuration's suppliers can point at them.
    const { added, records } = await addToCatalog(dir, key, suppliers).catch((e) => ({ added: [{ error: `Chưa bổ sung được vào danh mục: ${e.message}` }], records: [] }));
    const all = [...suppliers.filter((s) => !records.some((r) => r.id === s.id)), ...records];
    const { result, problems } = checkDir(dir, all, added, originOfReq(req.origin));
    if (extraOf(req)) result.extra = extraOf(req);
    await done({ result, error: "" });
    console.log(`${key}: ${result.configs.length} cấu hình${problems.length ? `, ${problems.length} điểm chưa khớp nguồn` : ""}`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: lỗi ${e.message}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

function runClaude(dir, input) {
  return spawnSync(CLAUDE, ["-p", "--permission-mode", "auto", "--output-format", "text", "--model", process.env.GENBID_CONFIG_MODEL || "opus",
    "--strict-mcp-config", "--disable-slash-commands", "--tools", "Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch"],
    { cwd: dir, encoding: "utf8", timeout: 40 * 60e3, maxBuffer: 64 << 20, windowsHide: true, input });
}

// ---------- Tìm NCC (findreq/<TBMT> → findmatch/<TBMT>) ----------
// "Tìm NCC" next to "Gợi ý" (Khoa, 2026-10-31): search the internet for more suppliers that fit the tender's technical
// requirements and add them to the catalog. Gemini (Antigravity CLI, Khoa's Google AI Pro account, no Claude tokens)
// goes first, auto-approving its own tool calls (Khoa allowed it); Claude (Opus) runs only when Gemini fails or finds
// no supplier that passes verify.mjs and covers the tender's power. Both follow find-prompt.md, in a folder made by prep.
const AGY = process.env.GENBID_AGY || path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe");
const GEMINI_MODEL = process.env.GENBID_GEMINI_MODEL || "gemini-3.8-flash-medium";
const ENGINE = { gemini: "Gemini (Antigravity)", claude: "Claude" };
const FIND_INPUT = "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md và catalog.md, tìm trên internet, chỉ ghi newCatalog.json và find.json (cùng các trang lưu bằng lệnh save). Chạy không người trông, không ai trả lời câu hỏi.";
function runGemini(dir, input) {
  if (!fs.existsSync(AGY)) return { error: "chưa cài Antigravity CLI (agy)" };
  const r = spawnSync(AGY, ["--model", GEMINI_MODEL, "--output-format", "json", "--disable-slash-commands", "--dangerously-skip-permissions", "--print-timeout", "2400s"],
    { cwd: dir, encoding: "utf8", timeout: 42 * 60e3, maxBuffer: 64 << 20, windowsHide: true, input });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  return { stdout: r.stdout, stderr: r.stderr, error: j?.status === "SUCCESS" ? "" : (j?.response || r.stderr || r.error?.message || `mã thoát ${r.status}`).trim().slice(0, 300) };
}
async function findPrep(key, dir, req) {
  const info = await prep(key, dir, req);
  const watch = fs.existsSync(path.join(ROOT, "discover-watchlist.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "discover-watchlist.json"), "utf8")) : [];
  const head = [
    `# Tìm NCC cho gói ${key}`, "",
    `Lệnh kiểm tra newCatalog.json: node "${SCRIPT}" find-check --dir .`,
    `Lệnh kiểm tra đã có: node "${path.join(ROOT, "discover.mjs")}" check "<tên công ty hoặc website>"`,
    "", "## Công ty Khoa hay làm việc (tìm riêng theo tên trước)", ...watch.map((w) => `- ${w.name}${w.note ? ` (${w.note})` : ""}`), "", "",
  ].join("\n");
  const input = path.join(dir, "input.md");
  fs.writeFileSync(input, head + fs.readFileSync(input, "utf8"), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "find-prompt.md"), "utf8"), "utf8");
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin: info.origin, cap: info.cap }), "utf8");
  return info;
}
// A product line of the record that covers the tender's power, in the tender's unit (95% to 140%, as catalog.md).
export function fitsCap(rec, cap) {
  if (!cap) return (rec.productLines || []).some((p) => p.power);
  return (rec.productLines || []).some((p) => p.power?.unit === cap.unit && p.power.min <= cap.value * 1.4 && p.power.max >= cap.value * 0.95);
}
// newCatalog.json checked offline, the way addToCatalog will: records built with catalogRecords, then verify.mjs on a
// copy in <dir>/_check with the saved pages. For a supplier already in the system only its new parts are checked
// (its own pages are not here) and only its new product lines count for the power.
export async function findCheck(dir, suppliers, cap) {
  const file = path.join(dir, "newCatalog.json"), out = [];
  if (!fs.existsSync(file)) return [{ id: "", errors: ["chưa có newCatalog.json"] }];
  let entries; try { entries = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return [{ id: "", errors: [`newCatalog.json không phải JSON: ${e.message}`] }]; }
  const chk = path.join(dir, "_check");
  fs.rmSync(chk, { recursive: true, force: true }); fs.mkdirSync(path.join(chk, "cn"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "verify.mjs"), path.join(chk, "verify.mjs"));
  const { checkRecord } = await import(pathToFileURL(path.join(chk, "verify.mjs")).href + `?${Date.now()}`);
  const readWeb = (f) => { const p = path.join(dir, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  const existing = new Map(suppliers.map((s) => [s.id, s]));
  for (const x of catalogRecords(entries, { existing, readWeb, today: new Date().toISOString().slice(0, 10) })) {
    if (x.error) { out.push({ id: x.id, errors: [x.error] }); continue; }
    for (const [f, txt] of Object.entries(x.files)) { fs.mkdirSync(path.dirname(path.join(chk, f)), { recursive: true }); fs.writeFileSync(path.join(chk, f), txt, "utf8"); }
    const own = new Set(x.nmap.values()), isOwn = (src) => Array.isArray(src) && src.length && src.every((n) => own.has(n));
    const rec = x.isNew ? x.rec : { ...x.rec, sources: x.rec.sources.filter((s) => own.has(s.n)), productLines: (x.rec.productLines || []).filter((p) => isOwn(p.src)),
      specTables: (x.rec.specTables || []).filter((t) => own.has(t.n)), controllers: (x.rec.controllers || []).filter((c) => isOwn(c.src)), strengths: [], certifications: [], contacts: [], vietnam: undefined, founded: null };
    out.push({ id: x.id, isNew: x.isNew, errors: checkRecord(rec, path.join(chk, "cn", `${x.id}.json`)).errors, fits: fitsCap(rec, cap) });
  }
  return out;
}
// Suppliers Tìm NCC added go into the suggested configurations in code, with no agent and no tokens (Khoa,
// 2026-11-01). From their own table rows (web/catalog.js), for engines of the origin asked for and rows whose smallest
// rating is 100% to 140% of the tender's power: a row naming the engine of a configuration already suggested adds the supplier to it;
// another engine becomes a new configuration, marked fromFind, whose only check is the power read from that row and
// left "unclear", since nothing else of the HSMT was compared with it. Every model and line is the row word for word.
const powerText = (p) => Object.entries(p || {}).map(([k, v]) => `${{ prime: "Prime", standby: "Standby", rated: "Định mức" }[k] || k} ${[v.kVA && `${v.kVA} kVA`, v.kW && `${v.kW} kW`].filter(Boolean).join(" / ")}`).join(", ");
export function mergeFind(result, records, { cap, origin, max = 5 } = {}) {
  const ids = new Set(records.map((r) => r.id)), keyOf = CAT.keyOf;
  // The row's smallest rating (prime when it gives both) is at least the tender's power, and not past 140% of it.
  const near = (u) => !cap || (rowPower(u, cap) >= cap.value && rowPower(u, cap) <= cap.value * 1.4);
  const lineOf = (u, model) => u.line || (u.lines?.rows || []).find((l) => keyOf(l).includes(keyOf(model))) || null;
  const configs = result.configs || (result.configs = []), out = { joined: [], created: [] };
  const o = originOfReq(origin), cn = cnSuppliers(records);
  for (const e of byOrigin(CAT.build(records).engines, o, cn)) {
    // Under "cn" a foreign engine comes only with the suppliers based in China that offer it.
    const viaCn = o === "cn" && CAT.originOf(e) === "other";
    const uses = e.uses.filter((u) => ids.has(u.supplierId) && near(u) && lineOf(u, e.model) && (!viaCn || cn.has(u.supplierId)))
      .sort((a, b) => (cap ? Math.abs(rowPower(a, cap) - cap.value) - Math.abs(rowPower(b, cap) - cap.value) : 0));
    if (!uses.length) continue;
    // The controllers the supplier's pages name (controllers.mjs) are said too, as recorded.
    const ctrlOf = (id) => [...new Set((records.find((r) => r.id === id)?.controllers || []).filter((c) => c.model).map((c) => c.model))];
    const entry = (u) => ({ supplierId: u.supplierId, n: u.n, line: lineOf(u, e.model), fromFind: true, why: `Bổ sung từ Tìm NCC: dòng bảng của nhà cung cấp ghi động cơ ${e.model}${u.power ? ` (${powerText(u.power)})` : ""}.${ctrlOf(u.supplierId).length ? ` Bộ điều khiển trên trang của nhà cung cấp: ${ctrlOf(u.supplierId).join(", ")}.` : ""}` });
    const old = configs.find((c) => c.engine?.model && keyOf(c.engine.model) === e.key);
    if (old) {
      old.suppliers = old.suppliers || [];
      for (const u of uses) if (!old.suppliers.some((s) => s.supplierId === u.supplierId)) { old.suppliers.push(entry(u)); out.joined.push({ rank: old.rank, supplierId: u.supplierId }); }
      continue;
    }
    if (out.created.length >= max) continue;
    const u = uses[0], line = lineOf(u, e.model), src = { kind: "catalog", supplierId: u.supplierId, n: u.n, line };
    const sups = []; for (const x of uses) if (!sups.some((s) => s.supplierId === x.supplierId)) sups.push(entry(x));
    const c = {
      rank: Math.max(0, ...configs.map((x) => x.rank || 0)) + 1, fromFind: true,
      engine: { model: e.model, ...(e.make ? { make: e.make } : {}), src },
      ...(u.other ? { alternator: { model: u.other, src } } : {}),
      ...(u.genset ? { genset: { model: u.genset, src } } : {}),
      ...((ctl) => (ctl ? { controller: { model: ctl.model, make: ctl.brand, src } } : {}))(CAT.controllersIn(line).find((x) => x.model)),
      checks: [{ item: "Công suất", part: "genset", requirement: cap ? `khoảng ${cap.value} ${cap.unit}` : "", offered: powerText(u.power) || "—", sourceQuote: line, status: "unclear",
        note: "Bổ sung tự động từ Tìm NCC, không dùng AI: công suất nhỏ nhất ghi trong dòng bảng từ 100% đến 140% công suất của gói. Các yêu cầu khác của HSMT chưa được đối chiếu (bấm Gợi ý lại nếu cần)." }],
      suppliers: sups.slice(0, 3),
      gaps: ["Cấu hình bổ sung từ Tìm NCC: chưa đối chiếu từng yêu cầu kỹ thuật của HSMT.", ...(result.extra ? [`Chưa đối chiếu Yêu cầu khác: ${result.extra}`] : [])],
    };
    configs.push(c);
    out.created.push({ rank: c.rank, engine: e.model, supplierId: u.supplierId });
  }
  return out;
}
// Reads configmatch/<key> and posts it back with the new suppliers merged in. No configmatch yet: nothing to merge into.
async function mergeFindIntoConfig(key, records, { cap, origin }) {
  const prev = await doc("configmatch", key);
  if (!prev?.result) return null;
  const result = JSON.parse(JSON.stringify(prev.result)), out = mergeFind(result, records, { cap, origin: result.origin || origin });
  if (!out.joined.length && !out.created.length) return out;
  result.notes = [...(result.notes || []), `Tìm NCC lúc ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC: ${out.joined.length ? `gắn ${out.joined.length} nhà cung cấp vào cấu hình có sẵn` : ""}${out.joined.length && out.created.length ? ", " : ""}${out.created.length ? `thêm ${out.created.length} cấu hình mới (chưa đối chiếu đủ HSMT)` : ""}, bằng code từ dòng bảng của nhà cung cấp.`];
  await post([{ coll: "configmatch", id: key, data: { ...prev, at: new Date().toISOString(), result } }]);
  return out;
}
const mergeText = (m) => (!m ? "chưa có cấu hình gợi ý để bổ sung (bấm Gợi ý)" : !m.joined.length && !m.created.length ? "không có dòng bảng nào đúng công suất và xuất xứ để bổ sung vào cấu hình" : [m.joined.length && `gắn ${m.joined.length} nhà cung cấp vào cấu hình có sẵn`, m.created.length && `thêm ${m.created.length} cấu hình mới`].filter(Boolean).join(", "));

async function find(req, suppliers) {
  const key = req.key, tried = [];
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = { notifyNo: req.notifyNo || key, bidName: req.bidName, origin: req.origin, extra: req.extra, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" };
    return post([...(result ? [{ coll: "findmatch", id: key, data: { at, result } }] : []), { coll: "findreq", id: key, data: JSON.parse(JSON.stringify(reqData)) }]);
  };
  try {
    for (const engine of ["gemini", "claude"]) {
      const dir = path.join(os.tmpdir(), "genbid-find", `${key}-${engine}`);
      fs.rmSync(dir, { recursive: true, force: true });
      try {
        const { cap } = await findPrep(key, dir, req);
        const r = engine === "gemini" ? runGemini(dir, FIND_INPUT) : runClaude(dir, FIND_INPUT);
        fs.writeFileSync(path.join(os.tmpdir(), `genbid-find-${key}-${engine}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
        if (r.error && !fs.existsSync(path.join(dir, "newCatalog.json"))) { tried.push({ engine: ENGINE[engine], error: r.error }); continue; }
        const checked = await findCheck(dir, suppliers, cap), fit = checked.filter((c) => !c.errors.length && c.fits);
        const info = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, "find.json"), "utf8")); } catch { return {}; } })();
        const dropped = checked.filter((c) => !fit.includes(c)).map((c) => ({ supplierId: c.id, error: c.errors.length ? `verify.mjs: ${c.errors.slice(0, 3).join("; ")}` : `không có dòng sản phẩm đúng công suất ${cap ? `${cap.value} ${cap.unit}` : ""}` }));
        if (!fit.length) { tried.push({ engine: ENGINE[engine], error: info.summary || "không tìm được nhà cung cấp nào qua được kiểm tra", dropped }); continue; }
        // Only the suppliers that passed and fit go to the catalog.
        const ids = new Set(fit.map((c) => c.id));
        fs.writeFileSync(path.join(dir, "newCatalog.json"), JSON.stringify(JSON.parse(fs.readFileSync(path.join(dir, "newCatalog.json"), "utf8")).filter((e) => ids.has(e?.id)), null, 1), "utf8");
        const { added, records } = await addToCatalog(dir, key, suppliers, { branch: `ncc/${key.toLowerCase()}-${engine}`, title: `Nhà cung cấp: Tìm NCC gói ${key} (${ENGINE[engine]})`,
          body: `Nút Tìm NCC ở tab Cấu hình gợi ý gói ${key}: ${ENGINE[engine]} tìm trên internet nhà cung cấp phù hợp yêu cầu kỹ thuật${cap ? ` (${cap.value} ${cap.unit})` : ""}. Bản ghi đã qua verify.mjs và đã đăng lên web.` });
        if (!added.some((a) => !a.error)) { tried.push({ engine: ENGINE[engine], error: "bản ghi không qua được verify.mjs của repo", dropped: added }); continue; }
        const merged = await mergeFindIntoConfig(key, records, { cap, origin: req.origin }).catch((e) => ({ error: e.message }));
        const configMerge = merged?.error ? `chưa bổ sung được vào cấu hình gợi ý: ${merged.error}` : mergeText(merged);
        await done({ result: { engine: ENGINE[engine], cap, ...(extraOf(req) ? { extra: extraOf(req) } : {}), summary: info.summary || "", added: [...added, ...dropped], skipped: info.skipped || [], notes: info.notes || [], tried, configMerge } });
        console.log(`${key}: Tìm NCC (${ENGINE[engine]}) bổ sung ${added.filter((a) => !a.error).length} nhà cung cấp; cấu hình: ${configMerge}`);
        return;
      } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    }
    await done({ result: { engine: "", ...(extraOf(req) ? { extra: extraOf(req) } : {}), summary: "Không tìm được nhà cung cấp mới nào phù hợp yêu cầu kỹ thuật và qua được kiểm tra nguồn.", added: [], skipped: [], notes: [], tried } });
    console.log(`${key}: Tìm NCC không tìm được ai`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: Tìm NCC lỗi ${e.message}`);
  }
}

const cmd = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT) {
  if (cmd === "save") console.log(await save(arg("dir", "."), arg("url")));
  else if (cmd === "prep") console.log(JSON.stringify(await prep(arg("key"), arg("out"), { bidName: arg("bid-name"), origin: arg("origin") })));
  else if (cmd === "check") {
    // Offline in a folder made by prep (suppliers.json, meta.json); elsewhere the supplier DB is read from the web.
    const dir = arg("dir", "."), local = (f) => (fs.existsSync(path.join(dir, f)) ? JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) : null);
    const { problems, result } = checkDir(dir, local("suppliers.json") || (await api("kind=docs&coll=supplier")).map((d) => d.data), [], local("meta.json")?.origin);
    fs.writeFileSync(path.join(dir, "result.checked.json"), JSON.stringify(result, null, 1));
    console.log(problems.length ? problems.join("\n") : "Không có điểm nào chưa khớp nguồn.");
  } else if (cmd === "find-check") {
    // Offline in a folder made for Tìm NCC (suppliers.json, meta.json).
    const dir = arg("dir", "."), meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
    const res = await findCheck(dir, JSON.parse(fs.readFileSync(path.join(dir, "suppliers.json"), "utf8")), meta.cap);
    for (const c of res) console.log(`${c.id || "?"}: ${c.errors.length ? `KHÔNG QUA — ${c.errors.join("; ")}` : "qua verify.mjs"}${c.errors.length ? "" : c.fits ? ", phù hợp công suất" : `, CHƯA có dòng sản phẩm phù hợp công suất${meta.cap ? ` ${meta.cap.value} ${meta.cap.unit}` : ""}`}`);
    if (!res.length) console.log("newCatalog.json rỗng.");
  } else if (cmd === "post") {
    const dir = arg("dir", "."), { result } = checkDir(dir, (await api("kind=docs&coll=supplier")).map((d) => d.data));
    console.log(await post([{ coll: "configmatch", id: arg("key"), data: { at: new Date().toISOString(), result } }, { coll: "configreq", id: arg("key"), data: { notifyNo: arg("key"), requestedAt: arg("requested-at"), doneAt: new Date().toISOString(), error: "" } }]));
  } else if (cmd === "merge-find") {
    // The suppliers of the stored findmatch/<key>, read again from the web, merged into configmatch/<key>.
    const key = arg("key"), f = await doc("findmatch", key), ids = new Set((f?.result?.added || []).filter((a) => !a.error).map((a) => a.supplierId));
    const records = (await api("kind=docs&coll=supplier")).map((d) => d.data).filter((s) => ids.has(s.id));
    const m = await mergeFindIntoConfig(key, records, { cap: f?.result?.cap, origin: (await doc("findreq", key))?.origin });
    if (f?.result) await post([{ coll: "findmatch", id: key, data: { ...f, result: { ...f.result, configMerge: mergeText(m) } } }]);
    console.log(`${key}: ${mergeText(m)}${m ? ` ${JSON.stringify(m)}` : ""}`);
  } else if (cmd === "run") {
    const lock = path.join(os.tmpdir(), "genbid-config.lock");
    if (fs.existsSync(lock) && Date.now() - fs.statSync(lock).mtimeMs < 60 * 60e3) { console.log("SUMMARY: đang có lượt khác chạy"); process.exit(4); }
    fs.writeFileSync(lock, String(process.pid));
    try {
      const [pending, finds] = await Promise.all([api("kind=config"), api("kind=find")]);
      if (pending.length || finds.length) {
        const suppliers = (await api("kind=docs&coll=supplier")).map((d) => d.data);
        for (const req of pending) await answer(req, suppliers);
        for (const req of finds) await find(req, suppliers);
      }
      console.log(`SUMMARY: ${pending.length} yêu cầu gợi ý cấu hình, ${finds.length} yêu cầu Tìm NCC`);
    } finally { fs.rmSync(lock, { force: true }); }
  } else { console.error("usage: config-bot.mjs run | prep --key K --out D | save --dir D --url U | check --dir D | post --dir D --key K --requested-at T"); process.exit(2); }
}
