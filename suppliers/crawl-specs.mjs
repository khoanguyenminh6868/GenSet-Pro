// Finds the spec tables of each supplier's gensets: node suppliers/crawl-specs.mjs [id ...] [--max 40]
// From the website in cn/<id>.json it follows same-site product/series links (two levels), saves every page that
// has a power table as sources/<id>/<n>.md (n from 101), and writes specs/<id>.json = [{ n, url, title, header, rows }]
// with the table lines exactly as saved. merge-specs.mjs then adds them to the record; verify.mjs checks each line.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const MAX = Number(args[args.indexOf("--max") + 1]) || 40;
// Links naming a power (address or visible text) are read first, then pages that look like one model or series.
const STRONG = /(\d\s?k\s?va|\d\s?kw)/i;
const MODELISH = /(\d+\s?k?va|\d+\s?kw|-pd\d|\/pd\d|product[-_/]?(detail|show)|\/products?\/[^/]+\.html|series|_p\d|\/p\d+|detail)/i;
const only = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--max");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const LINK = /(product|generator|genset|gen-set|diesel|series|cummins|perkins|weichai|yuchai|sdec|shangchai|deutz|volvo|mtu|mitsubishi|doosan|baudouin|kubota|yanmar|isuzu|ricardo|fawde|lovol|kva|kw|silent|open|container|gas|marine|alternator|power|chanpin|产品|机组|pd\d|pl\d)/i;
const SKIP = /(\/(ar|ru|es|fr|pt|de|it|ne|hi|th|vi|id|tr|ja|ko|pl|nl|fa|ur|bn|ms|uk|he|ro|cs|hu|el|sv|fi|da|no|tl|my|km|lo|si|kk|uz|az|am|sw|ha|yo|ig)(\/|$)|(^|[/_.?=-])(news|blog|article|contact|about|faq|video|case|project|service|login|cart|tags?|privacy|sitemap)s?([/_.?=-]|$)|\.(jpg|jpeg|png|gif|webp|pdf|zip|doc|xls)(\?|$))/i;
const POWER = /\b(k\s?va|kw|kwe|prime|standby|备用|常用|功率)\b/i;

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", deg: "°", times: "×", plusmn: "±", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", ndash: "–", mdash: "—", reg: "®", trade: "™", copy: "©", emsp: " ", ensp: " " };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : entities[e.toLowerCase()] ?? m);
// Same conversion as fetch-source.mjs, so a saved page reads the same either way.
export function htmlToText(html) {
  return decode(html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6]|table|section|article|dd|dt)>/gi, "\n")
    .replace(/<t[dh][^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " "))
    .split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim()).filter(Boolean).join("\n");
}
// --render: open each page in Chromium (playwright-core of the bot kit), for sites that build their tables with JavaScript.
const RENDER = args.includes("--render");
let browser = null;
async function getRendered(url) {
  if (!browser) {
    const { chromium } = await import("file:///C:/Projects/GenSet%20Pro/genbid-hsmt/node_modules/playwright-core/index.mjs");
    browser = await chromium.launch({ headless: true });
  }
  const page = await browser.newPage({ userAgent: UA });
  try {
    const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!r || !r.ok()) throw new Error("HTTP " + (r && r.status()));
    await page.waitForTimeout(2500);
    return { html: await page.content(), url: page.url() };
  } finally { await page.close().catch(() => {}); }
}
async function get(url) {
  if (RENDER) return getRendered(url);
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en,zh-CN;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
  if (!r.ok || !/html/i.test(r.headers.get("content-type") || "html")) throw new Error("HTTP " + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  const head = buf.subarray(0, 4000).toString("latin1");
  const cs = ((r.headers.get("content-type") || "").match(/charset=([\w-]+)/i) || head.match(/charset=["']?([\w-]+)/i) || [, "utf-8"])[1].toLowerCase();
  let html; try { html = new TextDecoder(cs === "gb2312" || cs === "gbk" ? "gb18030" : cs).decode(buf); } catch { html = buf.toString("utf8"); }
  return { html, url: r.url || url };
}
// Same-site links whose address or visible text names a product (CMS addresses like ?pageId=... say nothing).
export const linksOf = (html, base, host) => [...new Set([...html.matchAll(/<a\b[^>]*?href=["']([^"'#]+)["'][^>]*>([\s\S]{0,400}?)<\/a>/gi)].map((m) => {
  try { const u = new URL(m[1].replace(/&amp;/g, "&"), base).href; const label = m[2].replace(/<[^>]+>/g, " "); return LINK.test(u) || (LINK.test(label) && !SKIP.test(label)) ? (STRONG.test(label) && !STRONG.test(u) ? u + "#0kva" : u) : null; } catch { return null; }
}).filter((u) => u && /^https?:/.test(u) && new URL(u).hostname.replace(/^www\.|^m\./, "") === host && !SKIP.test(u)))];
const isNumCell = (c) => /\d/.test(c) && c.replace(/[\d.,~\-–/()%\s]|kva|kw|v|hz|rpm|l\/h|mm|kg|db|a\b/gi, "").length <= 3;
// Table blocks: 2+ consecutive lines of 3+ cells; header = the leading lines that are mostly not numbers.
export function tablesOf(text) {
  const lines = text.split(/\r?\n/), out = [];
  for (let i = 0; i < lines.length;) {
    if (!lines[i].startsWith("|") || lines[i].split("|").length < 4) { i++; continue; }
    let j = i; while (j < lines.length && lines[j].startsWith("|") && lines[j].split("|").length >= 3) j++;
    const block = lines.slice(i, j); i = j;
    const isData = (l) => { const c = l.split("|").map((x) => x.trim()).filter(Boolean); return c.filter(isNumCell).length >= Math.max(2, c.length * 0.4); };
    const k = block.findIndex(isData);
    if (k < 0) continue;
    const header = block.slice(0, k), rows = block.slice(k).filter(isData);
    if (rows.length < 2 && !POWER.test(block.join(" "))) continue;
    if (!POWER.test(header.join(" ") + rows.join(" "))) continue;
    out.push({ header, rows });
  }
  // Tables built from divs come out one cell per line between "|" lines: the leading text cells are the header, and
  // the cells after it are cut into rows of that many cells.
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== "|") continue;
    const cells = []; let j = i;
    while (j + 1 < lines.length && lines[j] === "|" && lines[j + 1] !== "|") { cells.push(lines[j + 1]); j += 2; }
    if (cells.length >= 12) {
      const first = cells.findIndex(isNumCell), k = first - 1;
      if (k >= 3 && POWER.test(cells.slice(0, k).join(" "))) {
        const rows = [];
        for (let r = k; r + k <= cells.length; r += k) rows.push("| " + cells.slice(r, r + k).join(" | "));
        if (rows.length >= 1) out.push({ header: ["| " + cells.slice(0, k).join(" | ")], rows });
      }
    }
    i = Math.max(i, j - 1);
  }
  // A product page of one model: its spec sheet as "label | value" rows or "Label: value" lines (at least 4, two of
  // them about power). Kept as a table without header, one line per spec, exactly as on the page.
  if (!out.length) {
    const LABEL = /^(\|\s*)?(model|genset model|prime|standby|rated|continuous|output|power|engine|engine model|engine brand|alternator|alternator model|generator|voltage|frequency|speed|rpm|phase|current|fuel|consumption|cylinder|displacement|bore|governor|cooling|controller|dimension|size|weight|noise|tank|emission|starting|insulation|protection|机组型号|常用功率|备用功率|额定功率|柴油机|发动机|发电机|电压|频率|转速|油耗|尺寸|重量|噪音)[^|:：]{0,40}(\||:|：)/i;
    const spec = lines.filter((l) => LABEL.test(l) && /\d/.test(l) && l.length < 200);
    if (spec.length >= 4 && spec.filter((l) => POWER.test(l)).length >= 2) out.push({ header: [], rows: [...new Set(spec)].slice(0, 60), sheet: true });
  }
  return out;
}

async function crawl(id) {
  const rec = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8"));
  if (!rec.website) return { id, pages: 0, rows: 0 };
  const host = new URL(rec.website).hostname.replace(/^www\.|^m\./, "");
  const seen = new Set(), queue = [...rec.sources.filter((s) => s.n < 101).map((s) => s.url).filter((u) => { try { return new URL(u).hostname.replace(/^www\.|^m\./, "") === host; } catch { return false; } }), rec.website];
  const found = []; let fetched = 0, n = 101;
  const dir = path.join(ROOT, "sources", id);
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (/^\d{3}\.md$/.test(f)) fs.rmSync(path.join(dir, f));
  while (queue.length && fetched < MAX) {
    const u = queue.shift().replace(/\/$/, "");
    if (seen.has(u)) continue; seen.add(u);
    let page; try { page = await get(u); fetched++; } catch (e) { if (process.env.DEBUG) console.log("  x", u, e.message); continue; }
    if (process.env.DEBUG) console.log("  +", u);
    const text = htmlToText(page.html);
    const tables = tablesOf(text);
    if (tables.length && tables.reduce((a, t) => a + t.rows.length, 0) >= 2) {
      const title = (page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].replace(/\s+/g, " ").trim().slice(0, 200);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${n}.md`), `URL: ${page.url}\nAccessed: ${new Date().toISOString().slice(0, 10)}\n\n${text}\n`, "utf8");
      for (const t of tables) { delete t.sheet; found.push({ n, url: page.url, title: decode(title), ...t }); }
      n++;
    }
    for (const l of linksOf(page.html, page.url, host)) if (!seen.has(l.replace(/\/$/, ""))) (STRONG.test(l) ? queue.unshift(l) : MODELISH.test(l) ? queue.splice(Math.min(queue.length, 20), 0, l) : queue.push(l));
  }
  fs.mkdirSync(path.join(ROOT, "specs"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "specs", `${id}.json`), JSON.stringify(found, null, 1) + "\n", "utf8");
  return { id, fetched, pages: new Set(found.map((f) => f.n)).size, rows: found.reduce((a, t) => a + t.rows.length, 0) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ids = only.length ? only : fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  let next = 0;
  const work = async () => { while (next < ids.length) { const id = ids[next++]; try { const r = await crawl(id); console.log(`${r.id}: ${r.fetched ?? 0} trang đọc, ${r.pages} trang có bảng, ${r.rows} dòng`); } catch (e) { console.log(`${id}: lỗi ${e.message}`); } } };
  await Promise.all(Array.from({ length: RENDER ? 4 : 6 }, work));
  if (browser) await browser.close();
}
