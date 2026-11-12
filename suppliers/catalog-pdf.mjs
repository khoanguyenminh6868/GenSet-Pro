// A product catalog (PDF) Khoa got from a supplier and uploaded: node suppliers/catalog-pdf.mjs <id> <url> <pdf> [--rows]
// <url> is where the same PDF is published (the GitHub release "datasheets-upload" of this repo, Khoa 2026-11-11:
// every line needs a source URL), <pdf> the local copy. Only what the record does not have yet is added
// (Khoa 2026-11-11): a row whose genset model, with every engine / alternator code on it, is already on a row of
// the record is left out.
// - A PDF with text is read like a datasheet (crawl-datasheets.mjs: pdftotext -table, tablesOf).
// - A scanned PDF is read with Tesseract (pdftoppm 300 dpi grey), and a line is kept only when code can check it, as
//   in ocr-specs.mjs: a genset model, two kW / kVA pairs (kW = 0.8 × kVA), a figure in the model that fits the power,
//   and an engine model the catalog already has from another supplier's text page.
// - --rows: the same checked lines from the PDF's own text (MECCA: tables that tablesOf cannot cut; Uleen: the
//   header cut into bits, so tablesOf sees no "kW" and drops the table).
// - --single: the catalog gives one rating (Uleen "Power (kW) | Power (kVA)"): a line with one kW / kVA pair is
//   kept under a header that says no prime / standby. Without it a line needs two pairs.
// - --spread: every landscape page is two pages side by side (Kaichen, APP, MECCA: 50 Hz on the left, 60 Hz on the
//   right): each half is read on its own, so a 60 Hz row never lands in the 50 Hz table. Not for slides (Uleen).
// - --ocr: read with Tesseract although the PDF has text (LEES brochure 2026: titles are text, the tables drawn as
//   outlines). The page is made black and white and the table's rules are wiped first (unGrid): with them Tesseract
//   read almost none of the figures.
// The frequency a page (half) names goes in its table title (catalog.js reads it there); a page naming both, none.
// The PDF's text is saved as sources/<id>/<n>.md (n from 5001: crawl-specs, crawl-datasheets, merge-specs and
// ocr-specs keep it) and its rows go to specTables; a new run with the same URL replaces them.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tablesOf } from "./crawl-specs.mjs";
import { pdfText } from "./crawl-datasheets.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const FIRST = 5001;
const TESSERACT = ["C:\\Program Files\\Tesseract-OCR\\tesseract.exe", path.join(process.env.LOCALAPPDATA || "", "Programs", "Tesseract-OCR", "tesseract.exe")].find((p) => fs.existsSync(p));
const TESSDATA = path.join(ROOT, "..", "..", ".genbid-tessdata-best");
const HEADER = "| Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator";
const HEADER1 = "| Genset model | Power kW | Power kVA | Engine model | Alternator";

const num = (s) => (/^\d+(\.\d+)?$/.test(s) ? Number(s) : null);
const isPair = (kw, kva) => kw != null && kva != null && kva > kw && Math.abs(kva * 0.8 - kw) <= (Number.isInteger(kw) ? 0.5 : 0.05);
// LEES "LSP10S3-E", 60 Hz "LSP13S3-6", "LSV375S3-6E": a dash and one letter, or one figure and maybe a letter, at the end.
const MODEL = /^[A-Z]+(-[A-Z]+)?-?\d+([A-Z]+\d*)?(-[A-Z]|-\d[A-Z]?)?(\([A-Z]\))?$/;
const prefixOf = (m) => m.match(/^[A-Z]+(-[A-Z]+)?-?/)[0];

// The parts of one line that start with a genset model (of the first model's prefix).
export function segments(line) {
  const all = line.replace(/[|[\]]/g, " ").trim().split(/\s+/).filter(Boolean);
  const at = all.findIndex((x, i) => i <= 2 && MODEL.test(x));
  if (at < 0) return [];
  const pre = prefixOf(all[at]), out = [];
  let cur = null;
  for (const x of all.slice(at)) {
    if (MODEL.test(x) && prefixOf(x) === pre) { cur = [x]; out.push(cur); } else if (cur) cur.push(x);
  }
  return out;
}

// A checked row from one segment, or null: an engine model the catalog knows (second, or after the figures), two
// kW / kVA pairs as the first four figures (either order), the model's figure about that power.
// loose (--rows, the PDF's own text, no OCR misreads): an engine model the catalog does not know yet is taken too, as
// the first code (letters and digits, not "3.L") after the model.
const ENGINE_CODE = /^(?=.*[A-Z])(?=.*\d)[A-Z0-9][A-Z0-9.\-/]{3,}$/;
// OCR reads the Z of SDEC's 4Z / 4ZT engines as 7 or 2 ("472.3-G11", "422.7-G11" for 4Z2.3-G11, 4Z2.7-G11): that
// one letter is put back only when the result is an engine the catalog already has (APP catalog, 2026-11-11).
export function zFix(t, engines) {
  return t.map((x, i) => (i >= 1 && !engines.has(C.keyOf(x)) && /^\d[72]/.test(x) && engines.has(C.keyOf(x[0] + "Z" + x.slice(2))) ? x[0] + "Z" + x.slice(2) : x));
}
export function keptRow(t, engines, alternators, single = false, loose = false) {
  if (!loose) t = zFix(t, engines);
  let eAt = t.findIndex((x, i) => i >= 1 && i <= 8 && engines.has(C.keyOf(x)));
  if (eAt < 0 && loose) eAt = t.findIndex((x, i) => i >= 1 && i <= 8 && ENGINE_CODE.test(x) && !/^\d+(\.\d+)?[A-Z]?$/.test(x));
  if (eAt < 0) return null;
  if (!engines.has(C.keyOf(t[eAt]))) engines = new Map([...engines, [C.keyOf(t[eAt]), t[eAt]]]);
  // "120/150 | 132/165" (Uleen UD120GF: kW prime / standby, then kVA) is four figures.
  const figs = t.slice(1).filter((x, i) => i + 1 !== eAt).flatMap((x) => (/^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(x) ? x.split("/") : [x]));
  const pairOf = (a, b) => (isPair(a, b) ? { kW: a, kVA: b } : isPair(b, a) ? { kW: b, kVA: a } : null);
  const four = figs.slice(0, 4).map(num);
  let found = four.length === 4 ? [pairOf(four[0], four[1]), pairOf(four[2], four[3])] : [null];
  // Slashed figures are kW kW kVA kVA.
  if (found.some((p) => !p) && four.length === 4) found = [pairOf(four[0], four[2]), pairOf(four[1], four[3])];
  // KCC-25GF: 27 / 30 kVA; APP-16GF: 15 / 17 kVA. An OCR misread of the model ("KCC-60GF" for 80) is dropped.
  let named = Number(t[0].match(/\d+/)[0]);
  // Or it is one of the kW figures (Uleen UD120GF: 120 kW prime).
  const fits = (lo, hi) => (named >= lo * 0.85 - 1 && named <= hi * 1.15 + 1) || [four[0], four[1], four[2], four[3]].some((v) => v != null && v < lo && Math.abs(v - named) <= 0.5);
  if (found.some((p) => !p)) {
    const one = single ? pairOf(four[0], four[1]) : null;
    if (!one || !fits(one.kVA, one.kVA)) return null;
    const altTok = t.slice(eAt + 1).find((x) => alternators.has(C.keyOf(x)) && !engines.has(C.keyOf(x)));
    const tidy = (s) => String(s).replace(/\s+/g, "");
    return `| ${t[0]} | ${one.kW} | ${one.kVA} | ${tidy(engines.get(C.keyOf(t[eAt])))} | ${altTok ? tidy(alternators.get(C.keyOf(altTok))) : ""}`.replace(/ \| $/, " |");
  }
  const [prime, standby] = found[0].kVA <= found[1].kVA ? found : [found[1], found[0]];
  if (prime.kVA === standby.kVA) return null;
  // OCR reads LEES "S3" at the end of a model as "83", "53", "S83" or "S53" ("LSP1483", "LSP1650S83", "LSSC375S53"
  // for LSP14S3, LSP1650S3, LSSC375S3): put back when the model then fits the power, and for a bare "83" / "53" only
  // when it did not fit before (an "S" before it is never a figure).
  // The 60 Hz end ("LSP1753-6") stays.
  if (!loose && /\dS?[58]3(-\d[A-Z]?)?$/.test(t[0]) && (/S[58]3(-\d[A-Z]?)?$/.test(t[0]) || !fits(prime.kVA, standby.kVA))) {
    const was = named, m = t[0].replace(/S?[58]3(-\d[A-Z]?)?$/, "S3$1");
    named = Number(m.match(/\d+/)[0]);
    if (fits(prime.kVA, standby.kVA)) t = [m, ...t.slice(1)]; else named = was;
  }
  if (!fits(prime.kVA, standby.kVA)) return null;
  // An alternator code that is also an engine model (QSK19-G4 is in the alternator list from a mixed-up table) is not one.
  const altTok = t.slice(eAt + 1).find((x) => alternators.has(C.keyOf(x)) && !engines.has(C.keyOf(x)));
  const tidy = (s) => String(s).replace(/\s+/g, "");
  const alt = altTok ? tidy(alternators.get(C.keyOf(altTok))) : "";
  return `| ${t[0]} | ${prime.kW} | ${prime.kVA} | ${standby.kW} | ${standby.kVA} | ${tidy(engines.get(C.keyOf(t[eAt])))} | ${alt}`.replace(/ \| $/, " |");
}

// Is this row already in the record: a row there has its first cell and every code of it (engine, alternator)?
const CODE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9.\-/()]{3,}$/;
export function known(row, have) {
  const cells = C.cellsOf(row).map((c) => c.trim()).filter(Boolean);
  if (!cells.length) return true;
  const codes = [cells[0], ...cells.slice(1).filter((c) => CODE.test(c))].map(C.keyOf);
  return have.some((h) => codes.every((k) => h.has(k)));
}

// --engines: an engine maker's power selector (Perkins "Generating set power selector"): one engine model a line, then
// its net engine output (COP?, prime, standby kWm) and the typical generator set output (COP?, prime, standby as
// kWe / kVA). Emission words, "-" and the DCP / switchable marks are skipped; the figures are taken from the end of
// the line (a "Tier 4" before them is not one), and kept only when each kWe / kVA pair is pf 0.8 (±1, rounded) and
// the engine gives more than the set (kWm ≥ kWe).
const ENGINE_MODEL = /^\d{3,4}[A-Z]{0,3}(-[A-Z0-9]+)?$/;
export function engineRow(line) {
  const all = line.trim().split(/\s+/);
  const at = all.findIndex((x, i) => i <= 1 && ENGINE_MODEL.test(x) && /[A-Z]/.test(x));
  if (at < 0) return null;
  const figs = all.slice(at + 1).filter((x) => /^\d+(\.\d+)?$/.test(x)).map(Number);
  const pf = (kwe, kva) => kva > kwe && Math.abs(kwe / 0.8 - kva) <= 1.5;
  const ok = (f, cop) => {
    const e = f.slice(0, cop ? 3 : 2), g = f.slice(cop ? 3 : 2);
    for (let i = 0; i < g.length; i += 2) if (!pf(g[i], g[i + 1]) || e[i / 2] < g[i]) return false;
    return e.every((v, i) => i === 0 || v > e[i - 1]);
  };
  for (const [k, cop] of [[9, true], [6, false]]) {
    const f = figs.slice(-k);
    if (f.length === k && ok(f, cop)) return { cop, row: `| ${all[at]} | ${f.join(" | ")}` };
  }
  return null;
}

// A grey PGM (P5, 8 bit, from pdftoppm -gray) in black and white, without the long lines of a table: a run of dark
// pixels across or down longer than `long` (300 dpi: a figure is ~30 px high, a dash in a cell ~80 px wide).
export function unGrid(buf, long = 160) {
  const head = buf.toString("latin1", 0, 64).match(/^P5\s+(\d+)\s+(\d+)\s+(\d+)\s/);
  if (!head) throw new Error("not a P5 PGM");
  const w = Number(head[1]), h = Number(head[2]), at = head[0].length;
  const px = Uint8Array.from(buf.subarray(at, at + w * h), (v) => (v < 140 ? 1 : 0));
  const out = new Uint8Array(w * h).fill(255);
  for (let i = 0; i < w * h; i++) if (px[i]) out[i] = 0;
  const wipe = (len, step, count, base) => {
    for (let k = 0; k < count; k++) {
      let run = 0;
      for (let j = 0; j <= len; j++) {
        const i = base(k) + j * step;
        if (j < len && px[i]) { run++; continue; }
        if (run > long) for (let b = j - run; b < j; b++) out[base(k) + b * step] = 255;
        run = 0;
      }
    }
  };
  wipe(w, 1, h, (y) => y * w);
  wipe(h, w, w, (x) => x);
  return Buffer.concat([Buffer.from(`P5\n${w} ${h}\n255\n`, "latin1"), Buffer.from(out)]);
}

const freqOf = (text) => { const f = new Set([...text.matchAll(/\b(50|60)\s*HZ\b/gi)].map((m) => m[1])); return f.size === 1 ? `${[...f][0]}Hz` : ""; };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), single = args.includes("--single"), spread = args.includes("--spread"), forceOcr = args.includes("--ocr"), byEngines = args.includes("--engines");
  const byRows = args.includes("--rows") || byEngines;
  const [id, url, pdf] = args.filter((a) => !a.startsWith("--"));
  if (!id || !/^https?:\/\//.test(url || "") || !pdf || !fs.existsSync(pdf)) { console.error("node suppliers/catalog-pdf.mjs <id> <url> <pdf> [--rows] [--single] [--spread]"); process.exit(2); }
  const recFile = path.join(ROOT, "cn", `${id}.json`);
  const rec = JSON.parse(fs.readFileSync(recFile, "utf8"));
  // A new run of the same catalog replaces what the last one added.
  const old = (rec.sources || []).filter((s) => s.n >= FIRST && s.url === url).map((s) => s.n);
  rec.sources = (rec.sources || []).filter((s) => !old.includes(s.n));
  rec.specTables = (rec.specTables || []).filter((t) => !old.includes(t.n));
  for (const n of old) fs.rmSync(path.join(ROOT, "sources", id, `${n}.md`), { force: true });
  const have = rec.specTables.flatMap((t) => t.rows).map((r) => new Set(C.cellsOf(r).map((c) => C.keyOf(c.trim()))));
  const n = Math.max(FIRST - 1, ...rec.sources.map((s) => s.n).filter((x) => x >= FIRST)) + 1;
  const today = new Date().toISOString().slice(0, 10), name = path.basename(pdf), base = `Catalog ${name.replace(/\.pdf$/i, "")}`;
  const run = (cmd, a) => execFileSync(cmd, a, { maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
  const raw = run("pdftotext", ["-enc", "UTF-8", pdf, "-"]);
  // Page sizes in points: "Page    3 size: 1190.55 x 841.89 pts".
  const sizes = [...run("pdfinfo", ["-f", "1", "-l", "9999", pdf]).matchAll(/Page\s+(\d+)\s+size:\s+([\d.]+)\s+x\s+([\d.]+)/g)].map((m) => ({ w: Number(m[2]), h: Number(m[3]) }));
  const tables = [];
  let body, via;
  if (!byRows && !forceOcr && raw.replace(/\s/g, "").length > sizes.length * 100) {
    via = "pdftotext -table";
    body = pdfText(run("pdftotext", ["-table", "-enc", "UTF-8", pdf, "-"]));
    for (const t of tablesOf(body)) {
      const rows = [...new Set(t.rows)].filter((r) => !known(r, have));
      if (rows.length) tables.push({ title: base, header: t.header, rows });
    }
  } else {
    const others = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f !== `${id}.json`).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
    const cat = C.build(others);
    const engines = new Map(cat.engines.map((e) => [e.key, e.model])), alternators = new Map(cat.alternators.map((a) => [a.key, a.model]));
    if (!byRows && !TESSERACT) { console.error("Không có Tesseract."); process.exit(2); }
    via = byRows ? "pdftotext -table" : "OCR (Tesseract 5, eng, 300 dpi)";
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-pdf-"));
    // [{ label, text }] per page, or per half of a landscape page.
    const parts = [];
    for (const [i, { w, h }] of sizes.entries()) {
      const p = String(i + 1), halves = spread && w > h * 1.2 ? [["trái", 0], ["phải", 1]] : [["", null]];
      for (const [side, k] of halves) {
        let text;
        if (byRows) {
          // xpdf's pdftotext crops with margins (points): the right half drops the left one, and the other way round.
          const crop = k == null ? [] : [k ? "-marginl" : "-marginr", String(Math.floor(w / 2))];
          text = run("pdftotext", ["-table", "-enc", "UTF-8", "-f", p, "-l", p, ...crop, pdf, "-"]);
        } else {
          const W = Math.round(w / 72 * 300), H = Math.round(h / 72 * 300);
          const crop = k == null ? [] : ["-x", String(k * Math.floor(W / 2)), "-y", "0", "-W", String(Math.ceil(W / 2)), "-H", String(H)];
          const png = path.join(tmp, `p${p}${side ? "-" + k : ""}`);
          let img = png + ".png";
          if (forceOcr) {
            execFileSync("pdftoppm", ["-r", "300", "-gray", "-singlefile", "-f", p, "-l", p, ...crop, pdf, png], { stdio: "ignore" });
            img = png + ".pgm";
            fs.writeFileSync(img, unGrid(fs.readFileSync(img)));
          } else execFileSync("pdftoppm", ["-r", "300", "-gray", "-png", "-singlefile", "-f", p, "-l", p, ...crop, pdf, png]);
          text = run(TESSERACT, [img, "stdout", "-l", "eng", "--oem", "1", "--psm", "6", "--tessdata-dir", TESSDATA]);
        }
        parts.push({ label: `trang ${p}${side ? " " + side : ""}`, text });
      }
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    const seen = new Set();
    for (const { label, text } of byEngines ? parts : []) {
      const f = freqOf(text), esp = /\bESP\b/.test(text) && !/standby/i.test(text);
      const section = (text.match(/Highly\s+regulated|Less\s+regulated|ESE|Fuel\s+optimised/i) || [""])[0].replace(/\s+/g, " ");
      const title = `${base} — ${label}${section ? ` — ${section}` : ""}${f ? ` (${f})` : ""}`, sb = esp ? "ESP" : "Standby";
      const got = text.split(/\r?\n/).map(engineRow).filter((r) => r && !known(r.row, have));
      for (const cop of [true, false]) {
        const rows = [...new Set(got.filter((r) => r.cop === cop).map((r) => r.row))];
        const header = cop ? `| Engine model | COP kWm | Prime kWm | ${sb} kWm | COP kWe | COP kVA | Prime kWe | Prime kVA | ${sb} kWe | ${sb} kVA`
          : `| Engine model | Prime kWm | ${sb} kWm | Prime kWe | Prime kVA | ${sb} kWe | ${sb} kVA`;
        if (rows.length) tables.push({ title, header: [header], rows });
      }
    }
    for (const { label, text } of byEngines ? [] : parts) {
      const rows = [];
      for (const l of text.split(/\r?\n/)) for (const seg of segments(l)) {
        const r = keptRow(seg, engines, alternators, single, byRows);
        if (r && !seen.has(r) && !known(r, have)) { seen.add(r); rows.push(r); }
      }
      const f = freqOf(text), title = `${base} — ${label}${f ? ` (${f})` : ""}`;
      // Lines of one rating and of two go to separate tables: their columns differ.
      const two = rows.filter((r) => r.split("|").length >= 8), one = rows.filter((r) => r.split("|").length < 8);
      if (two.length) tables.push({ title, header: [HEADER], rows: two });
      if (one.length) tables.push({ title, header: [HEADER1], rows: one });
    }
    body = [...tables.flatMap((t) => ["", t.title, ...t.header, ...t.rows]), "", `--- Toàn bộ chữ ${byRows ? "của PDF" : "OCR (chưa kiểm)"} ---`, ...parts.map((x) => `## ${x.label}\n${x.text}`)].join("\n");
    via += "; chỉ giữ dòng kiểm được bằng code (catalog-pdf.mjs)";
  }
  const total = tables.reduce((a, t) => a + t.rows.length, 0);
  if (total) {
    fs.mkdirSync(path.join(ROOT, "sources", id), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "sources", id, `${n}.md`), [`URL: ${url}`, `Accessed: ${today}`, `Via: catalog PDF nhà cung cấp gửi, Khoa tải lên (${name}); ${via}`, "", base, body].join("\n"), "utf8");
    rec.sources.push({ n, url, accessedAt: today, tier: "A", quote: [tables[0].rows[0]], file: `sources/${id}/${n}.md` });
    for (const t of tables) rec.specTables.push({ n, title: t.title, header: t.header, rows: t.rows });
  }
  if (!rec.specTables.length) delete rec.specTables;
  fs.writeFileSync(recFile, JSON.stringify(rec, null, 2) + "\n", "utf8");
  console.log(`${id}: ${via.split(";")[0]}, ${tables.length} bảng, ${total} dòng mới`);
}
