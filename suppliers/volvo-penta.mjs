// Volvo Penta's power generation engines (Khoa, 2026-11-11): node suppliers/volvo-penta.mjs
// then merge-specs.mjs volvo-penta and verify.mjs, as for the other datasheets.
//
// Where the figures are:
//  - www.volvopenta.com/api/getproducts (JSON) lists the engine families of the range page (13; the page shows 12 at a
//    time). Each family page carries its "Technical data" table as JSON in the HTML (built with JavaScript, so a plain
//    crawl sees no <table>): models × prime / standby power at 50 and 60 Hz ("271 kWm / 315 kVA / 252 kWe").
//  - Its "Product bulletin" links (pubs.volvopenta.com/ProdDocs/Home/Disclaimer?publication=<id>) give the PDF at
//    pubs.volvopenta.com/publications/<id>, no sign-in: power by rating and speed, bore, stroke, displacement,
//    compression ratio, weights, fuel consumption g/kWh at 25–100 % load.
//
// What is saved:
//  - Each family page as source n (101+), its table word for word (header = the models, rows = the page's rows).
//  - Each bulletin as source n (1001+): the PDF text (pdftotext -layout), then one table per model, its lines written
//    by this script from the lines above in the form config-bot.mjs modelFacts reads ("| label | value |", title naming
//    one model). Every figure of such a line is a figure of the PDF line it comes from (checked here), and a power
//    figure is written only when its kWm, kWe and kVA are those of the family page for that model, rating and frequency
//    (a misread column gives other numbers). A fuel table is read only when each load row holds exactly one figure per
//    column (several bulletins print it shifted by a row: those are left out).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ID = "volvo-penta";
const SITE = "https://www.volvopenta.com";
const RANGE = `${SITE}/industrial/power-generation-engines/power-generation-engine-range/`;
const LIST = `${SITE}/api/getproducts/?page=1&pageSize=100&language=en&rangePageId=a9967fae-9a45-4efc-b948-cb89e398abc1&category=&filters=`;
const PUB = (id) => `https://pubs.volvopenta.com/publications/${id}`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const CODE = /^[A-Z]{1,4}\d{3,4}[A-Z]{0,3}(?:-[A-Z])?$/;

// ---------- Family page ----------
// The JSON object given to React's createElement(Specifications, {...}): { downloadFilename, head: [models], body:
// [{ name: "50 Hz power", rows: [{ label, values }] }] }.
export function specTableOf(html) {
  const i = html.indexOf("createElement(Specifications,");
  if (i < 0) return null;
  const s = html.indexOf("{", i);
  let depth = 0, str = false, esc = false;
  for (let j = s; j < html.length; j++) {
    const c = html[j];
    if (str) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') str = false; continue; }
    if (c === '"') str = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return JSON.parse(html.slice(s, j + 1));
  }
  return null;
}
// The page's table as lines, cell for cell.
export function pageLines(spec) {
  const header = [`| | ${spec.head.join(" | ")}`];
  const rows = [];
  for (const sec of spec.body || []) {
    rows.push(`| ${sec.name}`);
    for (const r of sec.rows || []) rows.push(`| ${r.label} | ${r.values.join(" | ")}`);
  }
  return { header, rows };
}
// { MODEL: { 50: { prime: { kWm, kVA, kWe, cell }, standby }, 60: … } } from the page's power rows.
export function pagePower(spec) {
  const out = {};
  for (const sec of spec.body || []) {
    const hz = Number((sec.name.match(/^(50|60)\s*Hz\s*power$/i) || [])[1]);
    if (!hz) continue;
    for (const r of sec.rows || []) {
      const rating = /^prime power$/i.test(r.label) ? "prime" : /^standby power$/i.test(r.label) ? "standby" : null;
      if (!rating) continue;
      r.values.forEach((cell, k) => {
        const m = cell.match(/^(\d+)\s*kWm\s*\/\s*(\d+)\s*kVA\s*\/\s*(\d+)\s*kWe$/);
        if (!m) return;
        const model = spec.head[k];
        ((out[model] ||= {})[hz] ||= {})[rating] = { kWm: +m[1], kVA: +m[2], kWe: +m[3], cell };
      });
    }
  }
  return out;
}

// ---------- Product bulletin ----------
const nums = (s) => (s.match(/\d+(?:\.\d+)?/g) || []).map(Number);

// Power table lines: "TAD1341GE-B 203 189 236 271 252 315 …" under a "50 Hz / 1500 rpm  60 Hz / 1800 rpm" line.
// Each group of three is kWm kWe kVA; 9 figures a frequency are continuous, prime, standby, 6 are prime, standby.
export function powerOf(text, page) {
  const lines = text.split("\n"), found = [];
  let freqs = null;
  for (const l of lines) {
    const hz = [...l.matchAll(/(50|60)\s*Hz\s*\/\s*(1500|1800)\s*rpm/g)].map((m) => ({ hz: +m[1], rpm: +m[2] }));
    if (hz.length) { freqs = hz; continue; }
    const m = l.match(/^\s*([A-Z]{2,4}\d{3,4}[A-Z]{0,3}(?:-[A-Z])?)((?:\s+\d{2,4})+)\s*$/);
    if (!m || !freqs) continue;
    const v = nums(m[2]), per = v.length / freqs.length;
    if (!Number.isInteger(per) || (per !== 9 && per !== 6)) continue;
    freqs.forEach((f, k) => {
      const g = v.slice(k * per, (k + 1) * per), at = per === 9 ? 3 : 0;
      for (const [rating, o] of [["prime", at], ["standby", at + 3]]) {
        const [kWm, kWe, kVA] = g.slice(o, o + 3), web = page[m[1]]?.[f.hz]?.[rating];
        // Only the figures the family page gives for that model, rating and frequency.
        // (kWe and kVA are rounded on their own: 267 kWe in the bulletin, 266 on the page, TAD1341GE-B 60 Hz prime.)
        if (web && web.kWm === kWm && Math.abs(web.kWe - kWe) <= 1 && Math.abs(web.kVA - kVA) <= 1) found.push({ model: m[1], rating, ...f, kWm, line: l.trim() });
      }
    });
  }
  // One line per model, rating and frequency (the bulletins print the prime/standby figures twice).
  const seen = new Set();
  return found.filter((p) => { const k = `${p.model}|${p.rating}|${p.hz}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

// "Bore, mm (in.)........131 (5.16)" lines: one value each, shared by the bulletin's models.
const LEADER = /^\s*([A-Z][^.]*?(?:\.[^.\s][^.]*?)*)\s*\.{3,}\s*([\d.,]+(?::1)?)\s*(\([\d.,]+\))?(?:\s{2,}.*)?$/;
export function sharedOf(text) {
  const got = {};
  for (const l of text.split("\n")) {
    const m = l.match(LEADER);
    if (!m) continue;
    const label = m[1].replace(/\s*\*\)/g, "").replace(/\s*\((in\.|in³|lb)\)\s*/g, " ").replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
    if (!got[label]) got[label] = { value: m[2].replace(/,$/, ""), line: l.trim() };
  }
  const rows = [];
  const bore = Object.entries(got).find(([k]) => /^bore, mm$/i.test(k)), stroke = Object.entries(got).find(([k]) => /^stroke, mm$/i.test(k));
  if (bore && stroke) rows.push({ row: `| Bore × Stroke, mm | ${bore[1].value} × ${stroke[1].value}`, from: [bore[1].line, stroke[1].line] });
  for (const [k, v] of Object.entries(got)) {
    if (/^(bore|stroke), mm$/i.test(k)) continue;
    if (/^displacement, l$/i.test(k) || /^compression ratio$/i.test(k) || /weight.*kg$/i.test(k)) rows.push({ row: `| ${k} | ${v.value}`, from: [v.line] });
  }
  return rows;
}

// Fuel consumption tables: "Prime Power, g/kWh (lb/hph)" then the rows 25%, 50%, 75%, 100%, each with one figure per
// column; the columns are the models of the "Performance" line (or the bulletin's one model) × the speeds of the rpm line.
// The words a layout line begins with, up to the right column (3+ spaces then a word that is not a figure / code).
const lead = (l, ok) => { const w = l.trim().split(/\s+/), out = []; for (const x of w) { if (!ok(x)) break; out.push(x); } return out; };
const RIGHT_ONLY = (l) => !l.trim() || /^\s{40,}/.test(l);
export function fuelOf(text, models) {
  const lines = text.split("\n"), out = [];
  let perf = null;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*Performance\s/.test(lines[i])) {
      const codes = lines[i].trim().split(/\s+/).filter((w) => CODE.test(w));
      const rpms = nums((lines[i].match(/(?:\b1[58]00\s*rpm\s*)+/) || [""])[0]);
      perf = { models: codes.length ? codes : null, rpms: rpms.length ? rpms : null };
      continue;
    }
    const head = lines[i].match(/^\s*(?:Max\s+)?(Prime|Standby)\s+Power,\s*g\/kWh\s*\(lb\/hph\)(.*)$/);
    if (!head) continue;
    // A figure on the title line: the table is printed shifted by a row.
    if (/^\s*\d/.test(head[2])) continue;
    let cols = perf?.models || (models.length === 1 ? models : null), rpms = perf?.rpms || null;
    const rows = [];
    let want = 0;
    for (let j = i + 1; j < Math.min(lines.length, i + 30) && want < 4; j++) {
      const l = lines[j];
      if (RIGHT_ONLY(l) || /^\s*\(/.test(l)) continue;
      const codes = lead(l, (x) => CODE.test(x));
      if (codes.length) { cols = codes; continue; }
      if (/^\s*1[58]00\s*rpm/.test(l)) { const r = nums(lead(l, (x) => /^(1[58]00|rpm)$/.test(x)).join(" ")); rpms = cols ? r.slice(0, r.length / cols.length) : r; continue; }
      const load = [25, 50, 75, 100][want], m = l.match(new RegExp(`^\\s*${load}\\s?%\\s*(.*)$`));
      if (!m) break;
      const v = nums(lead(m[1], (x) => /^\d{3}$|^\(\d\.\d+\)$/.test(x)).filter((x) => !x.startsWith("(")).join(" "));
      rows.push({ load, v, line: l.trim() });
      want++;
    }
    if (!cols || !rpms?.length || rows.length !== 4) continue;
    const k = cols.length * rpms.length;
    if (rows.some((r) => r.v.length !== k || r.v.some((x) => x < 150 || x > 400))) continue;
    const rating = head[1].toLowerCase();
    cols.forEach((model, mi) => rpms.forEach((rpm, ri) => {
      for (const r of rows) out.push({ model, row: `| Fuel consumption, ${rating} power, ${r.load}% load, ${rpm} rpm | ${r.v[mi * rpms.length + ri]} g/kWh`, from: [r.line] });
    }));
  }
  return out;
}

// The tables of one bulletin: one per model with a figure of its own.
export function bulletinTables(text, page) {
  const power = powerOf(text, page), models = [...new Set(power.map((p) => p.model))];
  const fuel = fuelOf(text, models), shared = sharedOf(text);
  const all = [...new Set([...models, ...fuel.map((f) => f.model)])];
  const tables = all.map((model) => {
    const own = [
      ...power.filter((p) => p.model === model).map((p) => ({ row: `| Net engine ${p.rating} power kWm, ${p.hz} Hz / ${p.rpm} rpm | ${p.kWm} kWm / ${p.rpm} rpm`, from: [p.line] })),
      ...fuel.filter((f) => f.model === model),
    ];
    return { model, rows: [...own, ...shared] };
  }).filter((t) => t.rows.length > shared.length);
  // Every figure of a written line is a figure of the line(s) it was read from.
  for (const t of tables) for (const r of t.rows) {
    const have = new Set(r.from.flatMap((l) => nums(l)));
    const label = r.row.split("|")[1], value = r.row.split("|").slice(2).join("|");
    for (const x of nums(value)) if (!have.has(x) && !nums(label).includes(x)) throw new Error(`${t.model}: ${x} không có trong dòng nguồn (${r.row})`);
  }
  return tables;
}

// ---------- Run ----------
async function get(url, bin = false) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return bin ? Buffer.from(await r.arrayBuffer()) : r.text();
}
function layoutText(buf) {
  const tmp = path.join(os.tmpdir(), `vp-${process.pid}-${Math.random().toString(36).slice(2)}.pdf`);
  fs.writeFileSync(tmp, buf);
  try { return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 64 << 20, timeout: 60000 }).toString("utf8").replace(/\r\n?/g, "\n").replace(/\f/g, "\n").replace(/[ \t]+$/gm, ""); }
  finally { fs.rmSync(tmp, { force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const today = new Date().toISOString().slice(0, 10);
  const dir = path.join(ROOT, "sources", ID);
  fs.mkdirSync(dir, { recursive: true });
  // This script owns the volvo-penta pages 101–999 and 1001–1999: written again from scratch on each run.
  for (const f of fs.readdirSync(dir)) { const n = parseInt(f, 10); if (/^\d+\.md$/.test(f) && n >= 101 && n < 2000) fs.rmSync(path.join(dir, f)); }
  const list = JSON.parse(await get(LIST));
  const urls = [...new Set((JSON.stringify(list).match(/\/industrial\/power-generation-engines\/power-generation-engine-range\/[a-z0-9-]+\//g) || []).map((u) => SITE + u))];
  console.log(`${list.totalCount} dòng máy trên ${RANGE}`);
  const out = [], page = {}, pubs = new Map();
  let n = 101;
  for (const url of urls) {
    const html = await get(url), spec = specTableOf(html);
    // The download list is JSON too: {"data-tracking-url":"…Disclaimer?publication=<id>&lang=en-US",…,"text":"Product bulletin TAD1341GE (PDF, 568.4KB)"}.
    for (const m of html.matchAll(/publication=(\d+)[^"]*"(?:,"[^"]*":"[^"]*")*?,"text":"([^"]*)"/g)) if (!pubs.has(m[1])) pubs.set(m[1], { page: url, name: m[2].trim() });
    if (!spec) { console.log("x", url, "không có bảng Technical data"); continue; }
    const { header, rows } = pageLines(spec);
    Object.assign(page, pagePower(spec));
    const title = spec.downloadFilename || url;
    fs.writeFileSync(path.join(dir, `${n}.md`), `URL: ${url}\nAccessed: ${today}\n\n# ${title}\n\n${[...header, ...rows].join("\n")}\n`, "utf8");
    out.push({ n, url, title, from: url, header, rows });
    console.log("+", n, title, spec.head.length, "model");
    n++;
  }
  n = 1001;
  for (const [id, p] of [...pubs].sort((a, b) => a[0].localeCompare(b[0]))) {
    const url = PUB(id);
    let text;
    try {
      // pubs.volvopenta.com does not send its intermediate certificate: Node's fetch refuses it ("unable to verify the
      // first certificate"), curl (Windows schannel) fetches it and checks the chain.
      const buf = execFileSync("curl", ["-sSfL", "--max-time", "60", "-A", UA, url], { maxBuffer: 64 << 20 });
      if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("not a PDF");
      text = layoutText(buf);
    } catch (e) { console.log("x", url, e.message); continue; }
    const tables = bulletinTables(text, page);
    if (!tables.length) { console.log("x", url, p.name, "không đọc được model nào"); continue; }
    const derived = tables.map((t) => `### ${t.model}\n\n${t.rows.map((r) => r.row).join("\n")}`).join("\n\n");
    fs.writeFileSync(path.join(dir, `${n}.md`),
      `URL: ${url}\nAccessed: ${today}\n\n# ${p.name}\n\nTrang: ${p.page}\n\n${text.trim()}\n\n` +
      `## Theo từng model\n\nCác dòng dưới đây do suppliers/volvo-penta.mjs viết lại từ các dòng của bản tin ở trên (mỗi số là số của dòng gốc; công suất chỉ ghi khi kWm, kWe, kVA trùng bảng Technical data của trang).\n\n${derived}\n`, "utf8");
    for (const t of tables) out.push({ n, url, title: `Datasheet: ${t.model} — Volvo Penta product bulletin`, from: p.page, header: [], rows: t.rows.map((r) => r.row) });
    console.log("+", n, p.name, "→", tables.map((t) => `${t.model} (${t.rows.length})`).join(", "));
    n++;
  }
  fs.mkdirSync(path.join(ROOT, "datasheets"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "datasheets", `${ID}.json`), JSON.stringify(out, null, 1) + "\n", "utf8");
  console.log(`${out.length} bảng → datasheets/${ID}.json; tiếp: node suppliers/merge-specs.mjs ${ID} && node suppliers/verify.mjs`);
}
