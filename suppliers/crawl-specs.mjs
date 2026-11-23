// Finds the spec tables of each supplier's gensets: node suppliers/crawl-specs.mjs [id ...] [--max 40]
// From the website in cn/<id>.json it follows same-site product/series links (two levels), saves every page that
// has a power table as sources/<id>/<n>.md (n from 101), and writes specs/<id>.json = [{ n, url, title, header, rows }]
// with the table lines exactly as saved. merge-specs.mjs then adds them to the record; verify.mjs checks each line.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const MAX = Number(args[args.indexOf("--max") + 1]) || 40;
// Links naming a power (address or visible text) are read first, then pages that look like one model or series.
const STRONG = /(\d\s?k\s?va|\d\s?kw)/i;
const MODELISH = /(\d+\s?k?va|\d+\s?kw|-pd\d|\/pd\d|product[-_/]?(detail|show)|\/products?\/[^/]+\.html|series|_p\d|\/p\d+|detail)/i;
const only = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--max");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const LINK = /(product|engine|generator|genset|gen-set|diesel|series|cummins|perkins|weichai|yuchai|sdec|shangchai|deutz|volvo|mtu|mitsubishi|doosan|baudouin|kubota|yanmar|isuzu|ricardo|fawde|lovol|kva|kw|silent|open|container|gas|marine|alternator|power|chanpin|产品|机组|发动机|柴油机|发电机|pd\d|pl\d)/i;
// Globalso sites (Google Translate) link ~100 language copies of each page; they used up the crawl budget
// (hichaipower.com 2026-11-13: 150 pages read, 2 with tables).
const SKIP = /(\/(ar|ru|es|fr|pt|de|it|ne|hi|th|vi|id|tr|ja|ko|pl|nl|fa|ur|bn|ms|uk|he|ro|cs|hu|el|sv|fi|da|no|tl|my|km|lo|si|kk|uz|az|am|sw|ha|yo|ig|zh-c[nt]|zh-tw|ga|eu|ca|eo|sq|hy|be|bs|bg|ceb|ny|co|hr|et|fy|gl|ka|gu|ht|haw|iw|hmn|is|jw|kn|ku|ky|la|lv|lt|lb|mk|mg|ml|mt|mi|mr|mn|pa|ps|sr|st|sk|sl|so|sm|gd|sn|sd|su|tg|ta|te|xh|yi|zu|rw|tt|or|tk|ug|af|cy)(\/|$)|(^|[/_.?=-])(news|blog|article|contact|about|faq|video|case|project|service|login|cart|tags?|privacy|sitemap)s?([/_.?=-]|$)|\.(jpg|jpeg|png|gif|webp|pdf|zip|doc|xls)(\?|$))/i;
// The Chinese words stand outside the \b…\b: a word boundary needs a letter or digit next to it, so "额定功率" or
// "| 备用 | 常用" never matched and a table titled only in Chinese was dropped (huayuan-weifang n113, 23/11/2026).
const POWER = /\b(k\s?va|kw|kwe|prime|standby|备用|常用|功率)\b/i;
// Only the full Chinese terms for a rated output, and only in the header (POWER_ZH below): "功率" alone is also in
// 功率因数 (power factor, jiangchai-xuzhou's label tables), "备用" / "常用" in 备用电源 (the use of the set,
// zhengdian-zhengzhou), and "额定功率" is a row label of nenjo's alternator sheets.
const POWER_ZH = /额定功率|备用功率|常用功率|主用功率/;
// Every website of a record: `website` first, then `otherWebsites` (a company with two sites, 2026-11-18).
export const websitesOf = (rec) => [...new Set([rec?.website, ...(rec?.otherWebsites || [])].map((u) => String(u || "").trim()).filter(Boolean))];

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", deg: "°", times: "×", plusmn: "±", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", ndash: "–", mdash: "—", reg: "®", trade: "™", copy: "©", emsp: " ", ensp: " ", le: "≤", ge: "≥", asymp: "≈", sup2: "²", sup3: "³", micro: "µ", divide: "÷", hellip: "…", bull: "•" };
// "&amp;le;" (an entity written twice, as some site editors save it) reads as "≤".
const decode = (s) => s.replace(/&amp;(?=(#x[0-9a-f]+|#\d+|[a-z]+\d?);)/gi, "&").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d?);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : entities[e.toLowerCase()] ?? m);
// In a table, rows and cells come from the tags only: a newline in the HTML source is a space there, and a cell stays
// on one line though editors often wrap its text in <p> / <div> / <br> ("Rate Power(kva)<br>(prime/standby)").
// Either one otherwise puts every cell on a line of its own and the table is not seen. Outside tables source
// newlines still break lines: some sites show their spec lists with CSS white-space: pre-line.
const cellLine = (html) => html.replace(/<table\b[\s\S]*?<\/table>/gi, (t) => t.replace(/\s+/g, " ")).replace(/<(t[dh])\b[^>]*>([\s\S]*?)(?=<\/?t[dhr]\b|<\/table)/gi, (m, tag, inner) =>
  `<${tag}>` + inner.replace(/<br\s*\/?>|<\/?(p|div|li|ul|ol|h[1-6]|section|article|dd|dt|dl)\b[^>]*>/gi, " "));
// fetch-source.mjs uses this too, so a saved page reads the same either way.
// Cloudflare hides e-mail addresses as hex XOR-ed with the first byte ("[email protected]" on the page).
const cfEmail = (hex) => { const k = parseInt(hex.slice(0, 2), 16); let s = ""; for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k); return s; };
export function htmlToText(html) {
  html = html.replace(/<(span|a)\b[^>]*data-cfemail="([0-9a-f]+)"[^>]*>[\s\S]*?<\/\1>/gi, (_, t, x) => cfEmail(x));
  return decode(cellLine(html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " "))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6]|table|section|article|dd|dt)>/gi, "\n")
    .replace(/<t[dh][^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " "))
    .split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim()).filter(Boolean).join("\n");
}
// --render: open each page in Chromium, for sites that build their tables with JavaScript: playwright-core from
// PLAYWRIGHT_CORE (a path to its index.mjs), else the bot kit's on the Windows PC, else the installed package.
const RENDER = args.includes("--render");
let browser = null;
export const closeBrowser = async () => { if (browser) await browser.close(); browser = null; };
export async function getRendered(url) {
  if (!browser) {
    const kit = "file:///C:/Projects/GenSet%20Pro/genbid-hsmt/node_modules/playwright-core/index.mjs";
    const where = process.env.PLAYWRIGHT_CORE ? pathToFileURL(process.env.PLAYWRIGHT_CORE).href : process.platform === "win32" ? kit : "playwright-core";
    const { chromium } = await import(where);
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
export async function get(url) {
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
// The address may be unquoted (<a href=/products/>). lang: a language part of the address the site itself sent us to
// (a site that answers every visit from Vietnam with /vi/), followed like an English one.
export const linksOf = (html, base, host, lang = null) => [...new Set([...html.matchAll(/<a\b[^>]*?href\s*=\s*(?:"([^"#]+)[^"]*"|'([^'#]+)[^']*'|([^\s>"'#]+)[^\s>]*)[^>]*>([\s\S]{0,400}?)<\/a>/gi)].map((m) => {
  m = [m[0], m[1] || m[2] || m[3], m[4]];
  try { const u = new URL(m[1].replace(/&amp;/g, "&"), base).href; const label = m[2].replace(/<[^>]+>/g, " "); return LINK.test(u) || (LINK.test(label) && !SKIP.test(label)) ? (STRONG.test(label) && !STRONG.test(u) ? u + "#0kva" : u) : null; } catch { return null; }
}).filter((u) => u && /^https?:/.test(u) && new URL(u).hostname.replace(/^www\.|^m\./, "") === host && !SKIP.test(lang ? u.replace(`/${lang}/`, "/") : u)))];
const isNumCell = (c) => /\d/.test(c) && c.replace(/[\d.,~\-–/()%\s]|kva|kw|v|hz|rpm|l\/h|mm|kg|db|a\b/gi, "").length <= 3;
// A machine row: its first cell with text is a model code (letters and digits) and at least two cells are plain numbers
// ("| BF-V770-T2 | 770 | 700 | VOLVO | TWD1645GE | …"). A title line has no two plain numbers ("| Model | 50Hz | 60Hz").
export const isMachineRow = (l) => {
  const c = String(l).split("|").map((x) => x.trim()).filter(Boolean);
  return c.length >= 3 && /[a-z]/i.test(c[0]) && /\d/.test(c[0]) && c.filter((x) => /^\d+(\.\d+)?$/.test(x)).length >= 2;
};
// Where the header of a table ends: the index of the first machine row after the first line, else the number of lines.
// Used on the leading lines of a block (tablesOf) and on a saved table's `header` (the test over cn/).
export const headerEnd = (lines) => { const i = lines.findIndex((l, j) => j >= 1 && isMachineRow(l)); return i < 0 ? lines.length : i; };
const cellsIn = (l) => l.split("|").map((x) => x.trim()).filter(Boolean);
const widthOf = (l) => l.split("|").length, nonBlank = (l) => l.replace(/[|\s]/g, "");
const isData = (l) => { const c = cellsIn(l); return c.filter(isNumCell).length >= Math.max(2, c.length * 0.4); };
const plainNum = (x) => /^\d+(\.\d+)?$/.test(x);
// One table from the lines of one table: header = the leading lines that are mostly not numbers.
function tableOf(block) {
  const k = block.findIndex(isData);
  if (k < 0) return null;
  // A line as wide as the first data line stays even with few numbers: in a table with the models across
  // ("| Engine Model | YC4D60-D21 | YC4D80-D34") it is the engine or alternator of each model.
  const w = widthOf(block[k]);
  // A machine row above the first "data" line is a row, not a header line (baifa-power n101, 23/11/2026: a wide row
  // of mostly text cells, "| BF-C1540Q-T2 | 1540 | 1400 | QSK50-G3 | | S6L1D-H4 | TIER 2/ CHINA STAGE3 | UK/ CCEC", has
  // too few number cells for isData, so 31 rows were saved as header lines and never read). The header ends at the
  // first such line after the title line; every line from there to the first "data" line is kept as a row, in the
  // order of the page (no line is added or dropped by this).
  const h0 = headerEnd(block.slice(0, k));
  const header = block.slice(0, h0).filter(nonBlank), rows = [...block.slice(h0, k).filter(nonBlank), ...block.slice(k).filter((l) => isData(l) || (w >= 4 && widthOf(l) === w))];
  if (rows.length < 2 && !POWER.test(block.join(" "))) return null;
  if (!POWER.test(header.join(" ") + rows.join(" ")) && !(rows.length >= 2 && POWER_ZH.test(header.join(" ")))) return null;
  return { header, rows };
}
// Rows cut off from their titles (crawl-dropped, 23/11/2026: 1,661 machine rows of 27 suppliers were in no table). A
// line of fewer than two cells ends a block, and the rows after it, with no titles of their own and no word for an
// output, were dropped. Such a line is
// - a SECTION line, one cell of words ("| Perkins Series（60HZ）", "| Three phase", "| StageⅢ": awt-aiweite,
//   lees-power, mecca-power), or
// - a blank "|" line, or a piece of a row the page cut in two ("| 750", longkai-power).
// The rows after it are now a table OF THEIR OWN, with the titles of the block before plus the section lines as its
// header. Never joined to the rows before: the section line says what they are (60 Hz, single phase). Pieces of a cut
// row are not put together again. Every block that was a table before is the same table, line for line: this only adds.
const rowLike = (l) => cellsIn(l).length > 1 && (isData(l) || isMachineRow(l));
const wordCell = (c) => /[a-z]{3}|[一-鿿]{2}/i.test(c);
const codeRow = (l) => { const c = cellsIn(l)[0] || ""; return rowLike(l) && /[a-z]/i.test(c) && /\d/.test(c) && !/^\d[\d.,]*\s*(hz|rpm|v|kva|kw)\b/i.test(c); };
// Table blocks: 2+ consecutive lines of 3+ cells; header = the leading lines that are mostly not numbers.
export function tablesOf(text) {
  const lines = text.split(/\r?\n/), out = [];
  // titles = the title lines of the last block of this run of "|" lines that had any; tw = the width of the rows under
  // them; sect = the section lines since the last block.
  let titles = null, tw = 0, sect = [], last = [];
  const cut = [];
  for (let i = 0; i < lines.length;) {
    const l = lines[i];
    if (!l.startsWith("|")) { titles = null; sect = []; last = []; i++; continue; }
    if (widthOf(l) < 4) {
      // A one-cell line that is not words ("| 726", "| 25.18") is a piece of a cut row, and then so are the word
      // lines around it ("| Electric", "| JET634C", jet-power n136): none of them is a section line.
      if (widthOf(l) >= 3) { titles = null; sect = []; last = []; } else { const c = cellsIn(l); if (c.length) sect.push(wordCell(c[0]) ? l : null); }
      i++; continue;
    }
    let j = i; while (j < lines.length && lines[j].startsWith("|") && widthOf(lines[j]) >= 3) j++;
    let block = lines.slice(i, j); i = j;
    if (sect.includes(null)) sect = [];
    const t = tableOf(block);
    // The last pieces of a cut row at the head of a block that is no table ("| 630 | DP222LP | OP…" and then full
    // rows, longkai-power n123): at most two lines, narrower than the rows and with a bare number. Left out, so the
    // full rows after them are read like any block that starts with a row.
    if (!t && titles && tw) { const h = block.findIndex((x) => widthOf(x) === tw && codeRow(x)); if (h > 0 && h <= 2 && block.slice(0, h).every((x) => widthOf(x) < tw && cellsIn(x).some(plainNum))) block = block.slice(h); }
    const r0 = block.findIndex(rowLike), own = block.slice(0, r0 < 0 ? block.length : r0).filter(nonBlank);
    if (t) out.push(t);
    // A block that is no table by itself, starts with the row of a model (codeRow: "Length (mm) | 2240 | 2700" under
    // the "label | value" lines of a one-model page is not one, tecgen-fujian) and stands under the titles of the
    // block before it in the same run: a table of its own with those titles and the section lines in between as its
    // header (the comment above). Kept apart and put last, so that what the rest of this function does with the
    // tables found so far (the one-model sheet below, only when there is none) is what it did before.
    else if (titles && r0 >= 0 && !own.length && codeRow(block[r0]) && (!tw || widthOf(block[r0]) === tw)) { const u = tableOf([...titles, ...(sect.length ? sect : last), ...block]); if (u) cut.push(u); }
    // A one-cell line among the titles of a block ("| | MTU2000系例") names the rows of that block like a section line:
    // not one of the titles handed on. `last` = the section the rows before stand under: rows cut off by a blank line
    // or a piece of a row, with no new section line, are still under it (60 Hz rows stay 60 Hz).
    if (own.length) { titles = own.filter((x) => cellsIn(x).length > 1); last = own.filter((x) => cellsIn(x).length === 1 && wordCell(cellsIn(x)[0])); tw = r0 < 0 ? 0 : widthOf(block[r0]); }
    else { if (sect.length) last = sect; if (titles && !tw && r0 >= 0) tw = widthOf(block[r0]); }
    sect = [];
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
  return [...out, ...cut];
}

async function crawl(id) {
  const rec = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8"));
  if (!rec.website) return { id, pages: 0, rows: 0 };
  // Pages are kept in memory and written only at the end, and only when this crawl found at least as many table
  // lines as the last one (a site that is down or blocks the crawler never wipes what was found before).
  // A company with a second website (otherWebsites: hichaipower.com of kaihua-genset) has each site crawled in turn,
  // each with its own page budget.
  const seen = new Set(), found = [], pages = []; let fetched = 0, n = 101;
  for (const site of websitesOf(rec)) {
  const host = new URL(site).hostname.replace(/^www\.|^m\./, "");
  const queue = [...rec.sources.filter((s) => s.n < 101).map((s) => s.url).filter((u) => { try { return new URL(u).hostname.replace(/^www\.|^m\./, "") === host; } catch { return false; } }), site];
  let lang = null, read = 0;
  while (queue.length && read < MAX) {
    const u = queue.shift().replace(/\/$/, "");
    if (seen.has(u)) continue; seen.add(u);
    let page; try { page = await get(u); fetched++; read++; } catch (e) { if (process.env.DEBUG) console.log("  x", u, e.message); continue; }
    if (process.env.DEBUG) console.log("  +", u);
    // The home page answered in another language (/vi/ for a visit from Vietnam): that language is followed too.
    if (u === site.replace(/\/$/, "")) lang = (new URL(page.url).pathname.match(/^\/([a-z]{2})(\/|$)/) || [])[1] || null;
    const text = htmlToText(page.html);
    const tables = tablesOf(text);
    if (tables.length && tables.reduce((a, t) => a + t.rows.length, 0) >= 2 && n <= 999) {
      const title = (page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].replace(/\s+/g, " ").trim().slice(0, 200);
      pages.push({ n, body: `URL: ${page.url}\nAccessed: ${new Date().toISOString().slice(0, 10)}\n\n${text}\n` });
      for (const t of tables) { delete t.sheet; found.push({ n, url: page.url, title: decode(title), ...t }); }
      n++;
    }
    for (const l of linksOf(page.html, page.url, host, lang)) if (!seen.has(l.replace(/\/$/, ""))) (STRONG.test(l) ? queue.unshift(l) : MODELISH.test(l) ? queue.splice(Math.min(queue.length, 20), 0, l) : queue.push(l));
  }
  }
  const rows = found.reduce((a, t) => a + t.rows.length, 0);
  const specFile = path.join(ROOT, "specs", `${id}.json`);
  const oldRows = fs.existsSync(specFile) ? JSON.parse(fs.readFileSync(specFile, "utf8")).reduce((a, t) => a + t.rows.length, 0) : 0;
  if (rows < oldRows || (!rows && !oldRows && fs.existsSync(specFile))) return { id, fetched, pages: pages.length, rows, kept: oldRows };
  const dir = path.join(ROOT, "sources", id);
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (/^\d{3}\.md$/.test(f)) fs.rmSync(path.join(dir, f));
  if (pages.length) fs.mkdirSync(dir, { recursive: true });
  for (const p of pages) fs.writeFileSync(path.join(dir, `${p.n}.md`), p.body, "utf8");
  fs.mkdirSync(path.join(ROOT, "specs"), { recursive: true });
  fs.writeFileSync(specFile, JSON.stringify(found, null, 1) + "\n", "utf8");
  return { id, fetched, pages: pages.length, rows };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ids = only.length ? only : fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  // A site can hold a page (or Chromium) for hours (2026-11-09: the render pass of crawl/g7-2026-11 ran past 2 h): each
  // supplier gets CRAWL_SUPPLIER_MIN minutes (default 20), then the worker moves on and the supplier keeps its old
  // tables. Each supplier writes its specs/<id>.json as soon as it is done, so a run stopped from outside (the workflow's
  // `timeout`) still leaves the suppliers done before it for merge-specs.mjs.
  const PER_MS = (Number(process.env.CRAWL_SUPPLIER_MIN) || 20) * 60e3;
  const limit = (p, ms, what) => { let t; return Promise.race([p, new Promise((_, no) => { t = setTimeout(() => no(new Error(what)), ms); })]).finally(() => clearTimeout(t)); };
  let next = 0;
  const work = async () => { while (next < ids.length) { const id = ids[next++]; try { const r = await limit(crawl(id), PER_MS, `quá ${PER_MS / 60e3} phút, bỏ qua (giữ bảng cũ)`); console.log(`${r.id}: ${r.fetched ?? 0} trang đọc, ${r.pages} trang có bảng, ${r.rows} dòng${r.kept != null ? ` (ít hơn lần trước, giữ ${r.kept} dòng cũ)` : ""}`); } catch (e) { console.log(`${id}: lỗi ${e.message}`); } } };
  await Promise.all(Array.from({ length: RENDER ? 4 : 6 }, work));
  // Closing Chromium has hung before: a minute at most, then the process ends anyway (a crawl still running after its
  // time limit would otherwise keep it alive).
  if (browser) await limit(browser.close(), 60e3, "close").catch(() => {});
  process.exit(0);
}
