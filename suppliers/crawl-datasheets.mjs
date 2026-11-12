// Reads the datasheets linked from the product pages: node suppliers/crawl-datasheets.mjs [id ...] [--max 40] [--render]
// For each page with a spec table (specs/<id>.json) it follows the links that are a datasheet: a PDF, or a link
// named "Datasheet", "Detail data", "Technical data"... on the same site. Each datasheet is saved as
// sources/<id>/<n>.md (n from 1001, so crawl-specs.mjs never removes it) and its spec lines go to
// datasheets/<id>.json = [{ n, url, title, from, header, rows }], exactly as saved. merge-specs.mjs adds them to the
// record and verify.mjs checks each line against the saved file, as for the product pages.
// A PDF is read with pdftotext -table (xpdf's; poppler's pdftotext has no -table, and its -layout shifts values to
// the next label on some datasheets, so it is not used). Columns (two or more spaces apart) are written as
// "| a | b", the way a web page's table cells are, so "Engine Model      KTA19-G3" is saved as "| Engine Model | KTA19-G3".
// A PDF without text (a scan) or that -table cannot read is skipped: no OCR, no guessing.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { get, htmlToText, tablesOf, closeBrowser } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const args = process.argv.slice(2);
const MAX = Number(args[args.indexOf("--max") + 1]) || 40;
const only = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--max");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const FIRST = 1001;
const scans = [];

// A link to a datasheet: its text says so, or it is a PDF that is not about the company (certificates, licences).
const DS_TEXT = /data\s*-?\s*sheet|spec(ification)?s?\s*sheet|technical\s*(data|spec|sheet|parameter)|detail(ed)?\s*(data|spec|parameter)|tech\s*data|参数表|技术参数|技术规格|数据表/i;
const NOT_DS = /certif|licen[cs]e|patent|iso\s*\d|ce\s*cert|company\s*profile|catalog(ue)?\s*of\s*company|warranty|manual|instruction|wiring|drawing|install|maintenance|privacy|terms/i;
export const datasheetLinks = (html, base, host) => {
  const out = new Map();
  for (const m of html.matchAll(/<a\b[^>]*?href=["']([^"'#]+)["'][^>]*>([\s\S]{0,400}?)<\/a>/gi)) {
    let u; try { u = new URL(m[1].replace(/&amp;/g, "&"), base); } catch { continue; }
    if (!/^https?:$/.test(u.protocol)) continue;
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), all = text + " " + decodeURIComponent(u.pathname);
    const pdf = /\.pdf$/i.test(u.pathname);
    const sameSite = u.hostname.replace(/^www\.|^m\./, "") === host;
    if (NOT_DS.test(all)) continue;
    if (pdf || (sameSite && DS_TEXT.test(text))) out.set(u.href, text);
  }
  return [...out].map(([url, text]) => ({ url, text }));
};

// PDF text (pdftotext -table, which keeps a label and its value on one line even when the PDF draws them a little
// apart) with its columns marked. Datasheets often set two "label  value" columns side by side, so a line is cut
// into pairs: a label, the value right after it, and any further cells with a figure; a cell with no figure after a
// value starts the next pair. "Displacement  3.9L  Coolant capacity" → "| Displacement | 3.9L" and "Coolant capacity".
export function pdfText(table) {
  const out = [];
  for (const l of table.split(/\r?\n/)) {
    const parts = l.trim().split(/\s{2,}/).filter(Boolean);
    if (!parts.length) continue;
    const groups = [];
    for (const p of parts) {
      const g = groups[groups.length - 1];
      if (g && (g.length === 1 || /\d/.test(p) || (g.length >= 2 && p === g[g.length - 1]))) g.push(p); else groups.push([p]); // the same text again is the next model's column ("Aspiration  Turbocharged  Turbocharged")
    }
    for (const g of groups) out.push(g.length >= 2 ? "| " + g.join(" | ") : g[0]);
  }
  return out.join("\n");
}

// Spec lines of a datasheet: "| label | value ..." or "Label: value" lines whose label is a known spec, a model or a
// power. Kept only when the sheet names an engine or alternator model (else the catalog cannot use it).
const KEEP = /model|engine|alternator|generator|prime|stand\s*-?by|continuous|rated|output|power|frequency|speed|brand|make|manufacturer|发动机|发电机|型号|功率|品牌|厂家/i;
export function sheetOf(text) {
  const rows = [];
  // "| Engine | Alternator" and the two lines under it (makes, then models: GFE sheets) are kept as they are.
  let stack = 0;
  for (const l of text.split("\n")) {
    if (l.length > 220) continue;
    const s = C.cellsOf(l);
    if (s.length === 2 && /^engine$/i.test(s[0]) && /^alternator$/i.test(s[1])) { rows.push(l); stack = 2; continue; }
    if (stack && s.length >= 2) { stack--; if (!rows.includes(l)) rows.push(l); continue; }
    // Section headings stay: they tell which part a bare "Model" line is about (catalog.js headingOf).
    if (["engine", "alternator", null].includes(C.headingOf(l))) { rows.push(l); continue; }
    const c = C.cellsOf(l);
    if (c.length < 2 || c.length > 8) continue;
    const label = c[0];
    if (label.length > 60 || !/[a-z一-鿿]{2}/i.test(label) || /^[\d.,\s]+$/.test(label)) continue;
    if (!c.slice(1).some((v) => /[\da-z一-鿿]/i.test(v))) continue;
    if (!C.specKey(label) && !KEEP.test(label)) continue;
    if (!rows.includes(l)) rows.push(l);
  }
  // Headings with nothing under them are dropped; the sheet must name an engine or alternator model.
  const kept = rows.filter((l, i) => C.headingOf(l) === undefined || (rows[i + 1] && C.headingOf(rows[i + 1]) === undefined));
  const names = kept.some((l) => /(engine|alternator|generator)\s*(model|type)|发动机型号|发电机型号|^(\|\s*)?(diesel\s*)?engine\s*[|:：]/i.test(l))
    || kept.some((l, i) => ["engine", "alternator"].includes(C.headingOf(l)) && kept.slice(i + 1, i + 30).some((x) => /^\|\s*(model|型号)\s*[|:：]/i.test(x)));
  return names && kept.filter((l) => C.headingOf(l) === undefined).length >= 4 ? kept.slice(0, 250) : [];
}

async function download(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en,zh-CN;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const type = r.headers.get("content-type") || "";
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 20 << 20) throw new Error("too large");
  if (type.includes("pdf") || buf.subarray(0, 5).toString("latin1") === "%PDF-") {
    const tmp = path.join(os.tmpdir(), `ds-${process.pid}-${Math.random().toString(36).slice(2)}.pdf`);
    fs.writeFileSync(tmp, buf);
    try { return { url: r.url || url, pdf: true, text: pdfText(execFileSync("pdftotext", ["-table", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 64 << 20, timeout: 60000 }).toString("utf8")) }; }
    finally { fs.rmSync(tmp, { force: true }); }
  }
  if (!/html/i.test(type)) throw new Error("not a page: " + type);
  const head = buf.subarray(0, 4000).toString("latin1");
  const cs = (type.match(/charset=([\w-]+)/i) || head.match(/charset=["']?([\w-]+)/i) || [, "utf-8"])[1].toLowerCase();
  let html; try { html = new TextDecoder(cs === "gb2312" || cs === "gbk" ? "gb18030" : cs).decode(buf); } catch { html = buf.toString("utf8"); }
  return { url: r.url || url, pdf: false, html, text: htmlToText(html) };
}

async function crawl(id) {
  const specFile = path.join(ROOT, "specs", `${id}.json`), recFile = path.join(ROOT, "cn", `${id}.json`);
  if (!fs.existsSync(specFile) || !fs.existsSync(recFile)) return { id, pages: 0, sheets: 0, rows: 0 };
  const rec = JSON.parse(fs.readFileSync(recFile, "utf8"));
  if (!rec.website) return { id, pages: 0, sheets: 0, rows: 0 };
  const host = new URL(rec.website).hostname.replace(/^www\.|^m\./, "");
  const pages = [...new Set(JSON.parse(fs.readFileSync(specFile, "utf8")).map((t) => t.url))];
  const seen = new Set(), found = [], saved = [];
  let n = FIRST, read = 0, tried = 0;
  for (const page of pages) {
    if (tried >= MAX) break;
    let html; try { ({ html } = await get(page)); read++; } catch { continue; }
    for (const link of datasheetLinks(html, page, host)) {
      if (seen.has(link.url) || tried >= MAX || n > 9999) continue;
      seen.add(link.url); tried++;
      let d; try { d = await download(link.url); } catch (e) { if (process.env.DEBUG) console.log("  x", link.url, e.message); continue; }
      // A PDF with (almost) no text is a scan: listed in datasheets/_scans.json for OCR (ocr-specs.mjs), not read here.
      if (d.pdf && d.text.replace(/\s+/g, "").length < 200) { scans.push({ id, url: d.url, from: page, text: link.text }); continue; }
      // Tables of several models (rows), then the sheet of one model (label lines).
      const tables = tablesOf(d.text).filter((t) => !t.sheet && t.rows.length >= 2);
      const sheet = sheetOf(d.text);
      if (!tables.length && !sheet.length) continue;
      const title = d.pdf ? `Datasheet: ${link.text || decodeURIComponent(new URL(d.url).pathname.split("/").pop())}` : htmlToText((d.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, link.text])[1]).replace(/\s+/g, " ").trim().slice(0, 200);
      saved.push({ n, body: `URL: ${d.url}\nAccessed: ${new Date().toISOString().slice(0, 10)}\nFrom: ${page}\n\n${d.text}\n` });
      for (const t of tables) found.push({ n, url: d.url, title, from: page, header: t.header, rows: t.rows });
      if (sheet.length) found.push({ n, url: d.url, title, from: page, header: [], rows: sheet });
      if (process.env.DEBUG) console.log("  +", n, d.url, tables.length, sheet.length);
      n++;
    }
  }
  const rows = found.reduce((a, t) => a + t.rows.length, 0);
  const outFile = path.join(ROOT, "datasheets", `${id}.json`);
  const oldRows = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")).reduce((a, t) => a + t.rows.length, 0) : 0;
  // A site that is down or blocks the crawl never wipes the datasheets found before.
  if (rows < oldRows || !rows) return { id, read, tried, sheets: saved.length, rows, kept: oldRows || null };
  const dir = path.join(ROOT, "sources", id);
  // Only the datasheets (1001–1999): internet finds (2001+), controller pages (3001+) and OCR (4001+) stay (2026-11-04).
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (/^1\d{3}\.md$/.test(f)) fs.rmSync(path.join(dir, f));
  fs.mkdirSync(dir, { recursive: true });
  for (const p of saved) fs.writeFileSync(path.join(dir, `${p.n}.md`), p.body, "utf8");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(found, null, 1) + "\n", "utf8");
  return { id, read, tried, sheets: saved.length, rows };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let v = ""; try { v = execFileSync("pdftotext", ["-v"], { stdio: ["ignore", "pipe", "pipe"] }).toString(); } catch (e) { v = `${e.stdout || ""}${e.stderr || ""}`; } // xpdf 4.06 prints the version on stdout and exits 99
  if (!/xpdf|Glyph & Cog/i.test(v)) { console.error("Cần pdftotext của xpdf (có -table), ví dụ bản cài trong Git for Windows."); process.exit(2); }
  const ids = only.length ? only : fs.readdirSync(path.join(ROOT, "specs")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  let next = 0;
  const work = async () => { while (next < ids.length) { const id = ids[next++]; try { const r = await crawl(id); if (r.read != null) console.log(`${r.id}: ${r.read} trang đọc, ${r.tried} link datasheet, ${r.sheets} datasheet có thông số, ${r.rows} dòng${r.kept ? ` (ít hơn lần trước, giữ ${r.kept} dòng cũ)` : ""}`); } catch (e) { console.log(`${id}: lỗi ${e.message}`); } } };
  await Promise.all(Array.from({ length: 6 }, work));
  await closeBrowser();
  const scanFile = path.join(ROOT, "datasheets", "_scans.json");
  const old = fs.existsSync(scanFile) ? JSON.parse(fs.readFileSync(scanFile, "utf8")).filter((s) => !ids.includes(s.id)) : [];
  fs.writeFileSync(scanFile, JSON.stringify([...old, ...scans].sort((a, b) => a.id.localeCompare(b.id)), null, 1) + "\n", "utf8");
  console.log(`${scans.length} PDF scan (không có chữ) ghi ở datasheets/_scans.json`);
}
