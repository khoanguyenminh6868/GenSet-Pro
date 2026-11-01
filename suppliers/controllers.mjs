// Fills `controllers` (genset controllers: Deep Sea, SmartGen, ComAp...) of supplier records from their saved sources,
// no AI (Khoa, 2026-11-01):
//   node suppliers/controllers.mjs [id ...] [--crawl] [--max 40] [--dry]
// Every saved page of the record (rec.sources) is read line by line with web/catalog.js controllersIn, the reader the
// web and the config bot also use. Each controller keeps the line it was read from (cut around the name when the line
// is long, still word for word) and its source numbers; verify.mjs checks the line is in the saved page and names it.
// --crawl: first follows same-site product links (as crawl-specs.mjs does) and saves up to 6 pages that name a
// controller model as sources/<id>/3001.md…, added as sources of the record with the tier its own site already has.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { get, htmlToText, linksOf, closeBrowser } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
const args = process.argv.slice(2), DRY = args.includes("--dry"), CRAWL = args.includes("--crawl");
const MAX = Number(args[args.indexOf("--max") + 1]) || 40;
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--max");
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\.|^m\./, ""); } catch { return ""; } };

// A long line (a whole flattened table) is cut to about 120 characters either side of the name, at spaces.
export function lineAround(line, text) {
  if (line.length <= 300) return line;
  const i = Math.max(0, line.indexOf(text));
  let a = Math.max(0, i - 120), b = Math.min(line.length, i + text.length + 120);
  if (a > 0) { const s = line.indexOf(" ", a); if (s >= 0 && s < i) a = s + 1; }
  if (b < line.length) { const s = line.lastIndexOf(" ", b); if (s > i + text.length) b = s; }
  return line.slice(a, b).trim();
}
// One record's pages ([{ n, text }]) → controllers: one per make and model, with up to 3 source numbers; a make with no
// model only when no line of this record gives a model of that make.
export function controllersOf(pages) {
  const byKey = new Map();
  for (const p of pages) for (const [i, raw, all] of p.text.split("\n").slice(3).map((l, i, a) => [i, l, a])) {
    // A name alone on its line ("HGM6120" under "Controller Brand/Model:") is quoted with the line before it, which says
    // what it is; verify.mjs reads the page with line breaks as spaces.
    const prev = (all[i - 1] || "").trim(), line = raw.trim().length < 20 && prev && prev.length < 80 ? `${prev} ${raw.trim()}` : raw.trim();
    if (!line || line.length > 4000) continue;
    for (const c of CAT.controllersIn(line)) {
      const key = c.model ? CAT.keyOf(c.model) : `BRAND:${c.brand}`;
      const x = byKey.get(key);
      // Another page counts as a source only when it has the very line kept (verify.mjs looks for it there).
      if (x) { if (!x.src.includes(p.n) && x.src.length < 3 && x.line === lineAround(line, c.text)) x.src.push(p.n); continue; }
      byKey.set(key, { brand: c.brand, model: c.model, text: c.text, line: lineAround(line, c.text), src: [p.n] });
    }
  }
  const all = [...byKey.values()];
  return all.filter((c) => c.model || !all.some((x) => x.model && x.brand === c.brand))
    .sort((a, b) => a.brand.localeCompare(b.brand) || !a.model - !b.model || String(a.model).localeCompare(String(b.model)));
}

// Same-site pages that name a controller model, saved as sources/<id>/3001.md… (kept from an earlier crawl when this one
// finds none, so a site that is down never wipes them).
const LINKY = /(product|generator|genset|diesel|series|kva|kw|detail|silent|open|container|power|产品|机组)/i;
async function crawl(rec) {
  const host = hostOf(rec.website || "");
  if (!host) return [];
  const own = (rec.sources || []).filter((s) => hostOf(s.url) === host);
  const queue = [...new Set([rec.website, ...own.filter((s) => s.n >= 101 && s.n < 1000).map((s) => s.url)])], seen = new Set(), pages = [];
  let fetched = 0;
  while (queue.length && fetched < MAX && pages.length < 6) {
    const u = queue.shift().replace(/\/$/, "");
    if (seen.has(u)) continue; seen.add(u);
    let page; try { page = await get(u); fetched++; } catch { continue; }
    const text = htmlToText(page.html);
    const hits = text.split("\n").flatMap((l) => CAT.controllersIn(l)).filter((c) => c.model);
    if (hits.length && !own.some((s) => s.url.replace(/\/$/, "") === page.url.replace(/\/$/, "")))
      pages.push({ url: page.url, body: `URL: ${page.url}\nAccessed: ${new Date().toISOString().slice(0, 10)}\n\n${text}\n` });
    for (const l of linksOf(page.html, page.url, host)) if (!seen.has(l.replace(/\/$/, "")) && LINKY.test(l)) queue.push(l.replace(/#0kva$/, ""));
  }
  return pages;
}

async function one(file) {
  const rec = JSON.parse(fs.readFileSync(file, "utf8"));
  const dir = path.join(ROOT, "sources", rec.id);
  let added = 0;
  if (CRAWL && rec.website) {
    const found = await crawl(rec);
    if (found.length && !DRY) {
      const tier = (rec.sources || []).find((s) => hostOf(s.url) === hostOf(rec.website))?.tier || "C";
      rec.sources = (rec.sources || []).filter((s) => !(s.n >= 3001 && s.n < 4000));
      for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (/^3\d{3}\.md$/.test(f)) fs.rmSync(path.join(dir, f));
      fs.mkdirSync(dir, { recursive: true });
      found.forEach((p, i) => {
        const n = 3001 + i, rel = `sources/${rec.id}/${n}.md`;
        fs.writeFileSync(path.join(ROOT, rel), p.body, "utf8");
        rec.sources.push({ n, url: p.url, accessedAt: new Date().toISOString().slice(0, 10), tier, quote: [], file: rel });
      });
      added = found.length;
    }
  }
  const pages = (rec.sources || []).map((s) => ({ n: s.n, file: path.join(ROOT, s.file || "") })).filter((p) => p.file && fs.existsSync(p.file))
    .map((p) => ({ n: p.n, text: fs.readFileSync(p.file, "utf8") }));
  rec.controllers = controllersOf(pages);
  // A crawled page is a source only through the controllers read from it; its quote is the first such line.
  // One with no controller left (a later run read it differently) is dropped with its file.
  for (const s of rec.sources.filter((s) => s.n >= 3001 && s.n < 4000)) {
    const c = rec.controllers.find((x) => x.src.includes(s.n));
    s.quote = c ? [c.line] : [];
    if (!c && !DRY) fs.rmSync(path.join(ROOT, s.file), { force: true });
  }
  rec.sources = rec.sources.filter((s) => !(s.n >= 3001 && s.n < 4000) || s.quote.length).sort((a, b) => a.n - b.n);
  const kept = new Set(rec.sources.map((s) => s.file));
  if (!DRY) for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (/^3\d{3}\.md$/.test(f) && !kept.has(`sources/${rec.id}/${f}`)) fs.rmSync(path.join(dir, f));
  if (!rec.controllers.length) delete rec.controllers;
  if (!DRY) fs.writeFileSync(file, JSON.stringify(rec, null, 2) + "\n", "utf8");
  return `${rec.id}: ${(rec.controllers || []).map((c) => c.model || `${c.brand} (không ghi model)`).join(", ") || "—"}${added ? ` (+${added} trang mới)` : ""}`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json") && (!ids.length || ids.includes(f.slice(0, -5)))).map((f) => path.join(ROOT, "cn", f));
  let next = 0;
  const work = async () => { while (next < files.length) { const f = files[next++]; try { console.log(await one(f)); } catch (e) { console.log(`${path.basename(f, ".json")}: lỗi ${e.message}`); } } };
  await Promise.all(Array.from({ length: CRAWL ? 6 : 1 }, work));
  await closeBrowser();
}
